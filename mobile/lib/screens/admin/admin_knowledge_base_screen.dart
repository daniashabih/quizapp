import 'dart:async';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../models/ai_verification_model.dart';
import '../../providers/ai_verification_provider.dart';
import '../../services/notification_service.dart';
import '../../widgets/error_state_widget.dart';
import '../../widgets/hangbug_dialog.dart';
import '../../widgets/loading_state_widget.dart';

class AdminKnowledgeBaseScreen extends ConsumerStatefulWidget {
  const AdminKnowledgeBaseScreen({super.key});

  @override
  ConsumerState<AdminKnowledgeBaseScreen> createState() =>
      _AdminKnowledgeBaseScreenState();
}

class _AdminKnowledgeBaseScreenState
    extends ConsumerState<AdminKnowledgeBaseScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _pollTimer;
  bool _syncingIndex = false;
  final Set<String> _steppingBookIds = {};
  final Set<String> _autoAttemptedBookIds = {};
  final Map<String, KnowledgeBookModel> _liveBookOverrides = {};

  Future<void> _handleSyncVectorIndex() async {
    if (_syncingIndex) return;
    setState(() => _syncingIndex = true);
    try {
      final res = await ref.read(aiVerificationServiceProvider).setupVectorIndex();
      final msg = res['message']?.toString() ??
          'Vector Search index "${res['indexName'] ?? 'book_chunks_vector_index'}" synced.';
      if (res['success'] == true) {
        AppNotificationService.success(
          id: 'kb-vector-sync-ok',
          title: 'Vector Index Synced',
          message: msg,
        );
      } else if (mounted) {
        await HangbugDialog.info(
          context,
          title: 'Atlas Vector Index Notice',
          message: msg,
          confirmText: 'OK',
        );
      }
    } catch (e) {
      AppNotificationService.error(
        id: 'kb-vector-sync-err',
        title: 'Sync Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    } finally {
      if (mounted) setState(() => _syncingIndex = false);
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _driveBookProcessing(
    String bookId, {
    bool forceReextract = false,
    bool showToasts = true,
  }) async {
    if (bookId.isEmpty || _steppingBookIds.contains(bookId)) return;
    _steppingBookIds.add(bookId);

    int consecutiveErrors = 0;
    int stepCount = 0;
    const maxSteps = 45;

    try {
      while (mounted && stepCount < maxSteps) {
        stepCount++;
        try {
          final res = await ref.read(aiVerificationServiceProvider).processBookStep(
                bookId,
                forceReextract: stepCount == 1 && forceReextract,
              );
          consecutiveErrors = 0;

          final rawBook = res['book'];
          if (rawBook is Map<String, dynamic> && mounted) {
            final updatedBook = KnowledgeBookModel.fromJson(rawBook);
            setState(() {
              _liveBookOverrides[bookId] = updatedBook;
            });
          }

          if (res['failed'] == true) {
            if (showToasts && mounted) {
              AppNotificationService.error(
                id: 'kb-step-fail-$bookId',
                title: 'Book Processing Failed',
                message: res['message']?.toString() ?? 'Document processing failed.',
              );
            }
            break;
          }

          if (res['done'] == true || res['needsMoreSteps'] != true) {
            final finalBook = _liveBookOverrides[bookId];
            if (showToasts && mounted && finalBook?.processingStatus == 'Completed') {
              AppNotificationService.success(
                id: 'kb-step-done-$bookId',
                title: 'Book Ready',
                message:
                    '"${finalBook!.title}" indexed (${finalBook.totalPages} pages, ${finalBook.indexedChunks} chunks).',
              );
            }
            break;
          }

          final delayMs = res['locked'] == true ? 2000 : 350;
          await Future.delayed(Duration(milliseconds: delayMs));
        } catch (e) {
          consecutiveErrors++;
          if (consecutiveErrors >= 3) {
            if (showToasts && mounted) {
              AppNotificationService.error(
                id: 'kb-step-err-$bookId',
                title: 'Processing Interrupted',
                message:
                    '${e.toString().replaceFirst('Exception: ', '')} Tap Resume to continue.',
              );
            }
            break;
          }
          await Future.delayed(Duration(milliseconds: 1500 * consecutiveErrors));
        }
      }
    } finally {
      _steppingBookIds.remove(bookId);
      if (mounted) {
        setState(() {
          _liveBookOverrides.remove(bookId);
        });
        ref.invalidate(adminKnowledgeBaseProvider);
      }
    }
  }

  void _syncPolling(List<KnowledgeBookModel> books) {
    final activeBooks = books.where((b) => b.isProcessing).toList();
    for (final book in activeBooks) {
      if (!_steppingBookIds.contains(book.id) && !_autoAttemptedBookIds.contains(book.id)) {
        _autoAttemptedBookIds.add(book.id);
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            _driveBookProcessing(book.id, showToasts: true);
          }
        });
      }
    }

    final hasActive = activeBooks.isNotEmpty;
    if (hasActive && _pollTimer == null) {
      _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
        if (mounted) ref.invalidate(adminKnowledgeBaseProvider);
      });
    } else if (!hasActive && _pollTimer != null) {
      _pollTimer?.cancel();
      _pollTimer = null;
    }
  }

  String _formatSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(2)} MB';
  }

  Future<void> _showUploadSheet(List<String> technologies) async {
    String selectedTech = technologies.isNotEmpty ? technologies.first : 'HTML';
    String? pickedPath;
    String? pickedName;
    bool uploading = false;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Container(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
              ),
              decoration: BoxDecoration(
                color: ctx.cardBgColor,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: ctx.borderColor,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Upload Reference Book',
                                style: AppTextStyles.displaySmall.copyWith(fontSize: 18),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                'PDF (standard or scanned OCR), DOCX, or TXT up to 50 MB',
                                style: AppTextStyles.bodySmall.copyWith(color: ctx.textSecondaryColor),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: uploading ? null : () => Navigator.of(ctx).pop(),
                          icon: const Icon(Icons.close_rounded),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: uploading
                          ? null
                          : () async {
                              final picked = await FilePicker.platform.pickFiles(
                                type: FileType.custom,
                                allowedExtensions: ['pdf', 'docx', 'txt'],
                              );
                              if (picked != null && picked.files.single.path != null) {
                                final f = picked.files.single;
                                setSheetState(() {
                                  pickedPath = f.path;
                                  pickedName = f.name;
                                });
                              }
                            },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                        decoration: BoxDecoration(
                          color: pickedName != null
                              ? ctx.successColor.withValues(alpha: 0.08)
                              : ctx.mutedBgColor.withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: pickedName != null ? ctx.successColor : ctx.borderColor,
                            width: 1.4,
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              pickedName != null
                                  ? Icons.description_rounded
                                  : Icons.cloud_upload_outlined,
                              size: 28,
                              color: pickedName != null ? ctx.successColor : ctx.brandAccentColor,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              pickedName ?? 'Tap to choose PDF, DOCX, or TXT file',
                              textAlign: TextAlign.center,
                              style: AppTextStyles.labelBold.copyWith(fontSize: 13),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 3),
                            Text(
                              pickedName != null
                                  ? 'Ready to upload · Tap to change'
                                  : 'Scanned PDFs automatically trigger OCR',
                              style: AppTextStyles.bodySmall.copyWith(
                                fontSize: 11,
                                color: pickedName != null
                                    ? ctx.successColor
                                    : ctx.textSecondaryColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    DropdownButtonFormField<String>(
                      initialValue: technologies.contains(selectedTech) ? selectedTech : null,
                      decoration: InputDecoration(
                        labelText: 'Technology / Category *',
                        filled: true,
                        fillColor: ctx.mutedBgColor.withValues(alpha: 0.6),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      items: technologies
                          .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                          .toList(),
                      onChanged: uploading
                          ? null
                          : (val) {
                              if (val != null) setSheetState(() => selectedTech = val);
                            },
                    ),
                    if (uploading) ...[
                      const SizedBox(height: 14),
                      const LinearProgressIndicator(),
                      const SizedBox(height: 6),
                      Text(
                        'Uploading securely...',
                        textAlign: TextAlign.center,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: ctx.brandAccentColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                    const SizedBox(height: 18),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ctx.isDarkMode ? AppColors.primaryLight : AppColors.primary,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      onPressed: uploading
                          ? null
                          : () async {
                              if (pickedPath == null || pickedName == null) {
                                AppNotificationService.error(
                                  id: 'kb-no-file',
                                  title: 'File Required',
                                  message: 'Please select a PDF, DOCX, or TXT file first.',
                                );
                                return;
                              }
                              setSheetState(() => uploading = true);
                              try {
                                final uploadedBook = await ref
                                    .read(aiVerificationServiceProvider)
                                    .uploadBook(
                                      filePath: pickedPath!,
                                      fileName: pickedName!,
                                      technology: selectedTech,
                                    );
                                if (ctx.mounted) Navigator.of(ctx).pop();
                                ref.invalidate(adminKnowledgeBaseProvider);
                                AppNotificationService.success(
                                  id: 'kb-upload-ok',
                                  title: 'Book Uploaded',
                                  message: 'Starting text extraction and indexing...',
                                );
                                if (uploadedBook.id.isNotEmpty) {
                                  _autoAttemptedBookIds.add(uploadedBook.id);
                                  unawaited(_driveBookProcessing(uploadedBook.id, showToasts: true));
                                }
                              } catch (e) {
                                setSheetState(() => uploading = false);
                                AppNotificationService.error(
                                  id: 'kb-upload-err',
                                  title: 'Upload Failed',
                                  message: e.toString().replaceFirst('Exception: ', ''),
                                );
                              }
                            },
                      icon: uploading
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.cloud_upload_rounded),
                      label: Text(uploading ? 'Uploading...' : 'Upload & Index Book'),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final kbAsync = ref.watch(adminKnowledgeBaseProvider);
    final selectedTech = ref.watch(adminKnowledgeBaseFilterTechProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Knowledge Base'),
        actions: [
          IconButton(
            tooltip: 'Sync Vector Index',
            icon: _syncingIndex
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.storage_rounded),
            onPressed: _syncingIndex ? null : _handleSyncVectorIndex,
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.invalidate(adminKnowledgeBaseProvider),
          ),
        ],
      ),
      floatingActionButton: kbAsync.maybeWhen(
        data: (data) => FloatingActionButton.extended(
          onPressed: () => _showUploadSheet(data.technologies),
          backgroundColor: context.isDarkMode ? AppColors.primaryLight : AppColors.primary,
          foregroundColor: Colors.white,
          icon: const Icon(Icons.upload_file_rounded),
          label: const Text('Upload Book'),
        ),
        orElse: () => null,
      ),
      body: kbAsync.when(
        loading: () => const LoadingStateWidget(message: 'Loading AI Knowledge Base...'),
        error: (err, _) => ErrorStateWidget(
          message: err.toString(),
          onRetry: () => ref.invalidate(adminKnowledgeBaseProvider),
        ),
        data: (data) {
          final mergedBooks = data.books
              .map((b) => _liveBookOverrides[b.id] ?? b)
              .toList();
          _syncPolling(mergedBooks);
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(adminKnowledgeBaseProvider),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
              children: [
                if (!data.aiProviderConfigured)
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: context.warningColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: context.warningColor.withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      'Configure an AI provider key on the server to generate new vector embeddings and run book verification. Existing books remain intact.',
                      style: AppTextStyles.bodySmall.copyWith(color: context.warningColor),
                    ),
                  )
                else ...[
                  Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                    decoration: BoxDecoration(
                      color: context.mutedBgColor,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: context.borderColor),
                    ),
                    child: Text(
                      data.activeEmbeddingModel.isNotEmpty
                          ? 'Provider: ${data.activeProvider.toUpperCase()} · ${data.activeEmbeddingModel} (${data.activeEmbeddingDimensions}d)'
                          : 'Provider: ${data.activeProvider.toUpperCase()} · Text fallback mode (no embedding API key)',
                      style: AppTextStyles.mono.copyWith(
                        fontSize: 11,
                        color: context.textSecondaryColor,
                      ),
                    ),
                  ),
                  if (!data.embeddingConfigured)
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(11),
                      decoration: BoxDecoration(
                        color: Colors.lightBlue.withValues(alpha: 0.10),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.lightBlue.withValues(alpha: 0.35)),
                      ),
                      child: Text(
                        'Groq handles chat verification only. New books are extracted, chunked, and searchable in Text Fallback mode. Add OPENAI_API_KEY or GEMINI_API_KEY on the server to enable 1536d Atlas Vector Search embeddings.',
                        style: AppTextStyles.bodySmall.copyWith(
                          fontSize: 11.5,
                          color: context.textSecondaryColor,
                        ),
                      ),
                    ),
                ],

                // Summary KPI Row
                Row(
                  children: [
                    _miniStat(context, 'Books', '${data.totalBooks}'),
                    const SizedBox(width: 8),
                    _miniStat(context, 'Active', '${data.activeBooks}'),
                    const SizedBox(width: 8),
                    _miniStat(context, 'Pages', '${data.totalPages}'),
                    const SizedBox(width: 8),
                    _miniStat(context, 'Chunks', '${data.totalIndexedChunks}'),
                  ],
                ),
                const SizedBox(height: 12),

                // Search & Technology Filter
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search books by title or author...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    isDense: true,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onSubmitted: (v) {
                    ref.read(adminKnowledgeBaseSearchProvider.notifier).state = v;
                  },
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 36,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: ChoiceChip(
                          label: const Text('All'),
                          selected: selectedTech == 'all',
                          onSelected: (_) => ref
                              .read(adminKnowledgeBaseFilterTechProvider.notifier)
                              .state = 'all',
                        ),
                      ),
                      ...data.technologies.map(
                        (tech) => Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ChoiceChip(
                            label: Text(tech),
                            selected: selectedTech == tech,
                            onSelected: (_) => ref
                                .read(adminKnowledgeBaseFilterTechProvider.notifier)
                                .state = tech,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                if (mergedBooks.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(24),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: context.cardBgColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: context.borderColor),
                    ),
                    child: Text(
                      'No reference books uploaded yet. Tap "Upload Book" to add PDF, DOCX, or TXT books.',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.bodyMedium.copyWith(color: context.textSecondaryColor),
                    ),
                  )
                else
                  ...mergedBooks.map((book) => _buildBookCard(context, book, data)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _miniStat(BuildContext context, String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: context.cardBgColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: context.borderColor),
        ),
        child: Column(
          children: [
            Text(value, style: AppTextStyles.displaySmall.copyWith(fontSize: 16)),
            Text(
              label,
              style: AppTextStyles.bodySmall.copyWith(fontSize: 10, color: context.textSecondaryColor),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookCard(
    BuildContext context,
    KnowledgeBookModel book,
    KnowledgeBaseListResponse kbData,
  ) {
    final statusColor = book.processingStatus == 'Completed'
        ? context.successColor
        : book.processingStatus == 'Failed'
            ? context.errorColor
            : context.warningColor;
    final canUpgradeVectors = kbData.embeddingConfigured &&
        book.processingStatus == 'Completed' &&
        (book.embeddingMode == 'text_fallback' ||
            (book.embeddingDimensions > 0 &&
                book.embeddingDimensions != kbData.activeEmbeddingDimensions));

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  book.technology,
                  style: AppTextStyles.labelBold.copyWith(fontSize: 10.5, color: Colors.white),
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  book.processingStatus,
                  style: AppTextStyles.labelBold.copyWith(fontSize: 10.5, color: statusColor),
                ),
              ),
              const Spacer(),
              Switch(
                value: book.isEnabled,
                onChanged: (val) async {
                  try {
                    await ref.read(aiVerificationServiceProvider).toggleBookEnabled(book.id, val);
                    ref.invalidate(adminKnowledgeBaseProvider);
                  } catch (e) {
                    AppNotificationService.error(
                      id: 'kb-toggle-err',
                      title: 'Error',
                      message: e.toString(),
                    );
                  }
                },
              ),
            ],
          ),
          Text(book.title, style: AppTextStyles.labelBold.copyWith(fontSize: 14.5)),
          const SizedBox(height: 2),
          Text(
            [
              if (book.author.isNotEmpty) 'by ${book.author}',
              if (book.edition.isNotEmpty) book.edition,
              '${book.fileType.toUpperCase()} (${_formatSize(book.fileSize)})',
              if (book.embeddingMode == 'text_fallback' && book.processingStatus == 'Completed')
                'Text Fallback',
            ].join(' · '),
            style: AppTextStyles.bodySmall.copyWith(color: context.textSecondaryColor),
          ),
          if (book.isProcessing) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${book.processingStatus}...',
                  style: AppTextStyles.bodySmall.copyWith(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: context.textSecondaryColor,
                  ),
                ),
                Text(
                  '${book.processingProgress}%',
                  style: AppTextStyles.mono.copyWith(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: context.brandAccentColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            LinearProgressIndicator(value: (book.processingProgress / 100).clamp(0.05, 1.0)),
          ],
          if (book.processingStatus == 'Failed' && book.processingError.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: context.errorColor.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: context.errorColor.withValues(alpha: 0.3)),
              ),
              child: Text(
                book.processingError,
                style: AppTextStyles.bodySmall.copyWith(color: context.errorColor),
              ),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Pages: ${book.totalPages} · Chunks: ${book.indexedChunks}/${book.totalChunks}${book.ocrUsed ? ' · OCR' : ''}',
                  style: AppTextStyles.bodySmall.copyWith(
                    fontSize: 11,
                    color: context.textSecondaryColor,
                  ),
                ),
              ),
              if (book.isProcessing && (book.canResume || book.isStalled))
                TextButton.icon(
                  onPressed: () {
                    _autoAttemptedBookIds.add(book.id);
                    unawaited(_driveBookProcessing(book.id, showToasts: true));
                  },
                  icon: const Icon(Icons.play_arrow_rounded, size: 16),
                  label: const Text('Resume'),
                ),
              if (book.processingStatus == 'Failed')
                TextButton.icon(
                  onPressed: () async {
                    try {
                      await ref.read(aiVerificationServiceProvider).retryBookProcessing(book.id);
                      ref.invalidate(adminKnowledgeBaseProvider);
                      _autoAttemptedBookIds.add(book.id);
                      unawaited(_driveBookProcessing(book.id, showToasts: true));
                    } catch (e) {
                      AppNotificationService.error(
                        id: 'kb-retry-err',
                        title: 'Retry Failed',
                        message: e.toString().replaceFirst('Exception: ', ''),
                      );
                    }
                  },
                  icon: const Icon(Icons.refresh_rounded, size: 16),
                  label: const Text('Retry'),
                ),
              if (canUpgradeVectors)
                TextButton.icon(
                  onPressed: () async {
                    try {
                      await ref
                          .read(aiVerificationServiceProvider)
                          .retryBookProcessing(book.id, mode: 'reindex');
                      ref.invalidate(adminKnowledgeBaseProvider);
                      _autoAttemptedBookIds.add(book.id);
                      unawaited(
                        _driveBookProcessing(
                          book.id,
                          forceReextract: true,
                          showToasts: true,
                        ),
                      );
                    } catch (e) {
                      AppNotificationService.error(
                        id: 'kb-reindex-err',
                        title: 'Re-index Failed',
                        message: e.toString().replaceFirst('Exception: ', ''),
                      );
                    }
                  },
                  icon: const Icon(Icons.auto_awesome_rounded, size: 15),
                  label: const Text('Vectorize'),
                ),
              IconButton(
                icon: Icon(Icons.delete_outline_rounded, color: context.errorColor, size: 20),
                onPressed: () async {
                  await HangbugDialog.confirmDelete(
                    context,
                    title: 'Delete Knowledge Book?',
                    message: 'Delete this book and all of its indexed vector chunks from the knowledge base?',
                    itemName: book.title,
                    confirmText: 'Delete Book',
                    loadingText: 'Deleting...',
                    permanent: true,
                    onConfirm: () async {
                      await ref.read(aiVerificationServiceProvider).deleteBook(book.id);
                      ref.invalidate(adminKnowledgeBaseProvider);
                      AppNotificationService.success(
                        title: 'Book deleted',
                        message: '"${book.title}" has been removed.',
                      );
                    },
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
