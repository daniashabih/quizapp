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

  @override
  void dispose() {
    _pollTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _syncPolling(List<KnowledgeBookModel> books) {
    final hasActive = books.any((b) => b.isProcessing);
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
                    Text(
                      'Upload Reference Book',
                      style: AppTextStyles.displaySmall.copyWith(fontSize: 18),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'PDF (including scanned OCR), DOCX, or TXT up to 50 MB',
                      style: AppTextStyles.bodySmall.copyWith(color: ctx.textSecondaryColor),
                    ),
                    const SizedBox(height: 16),
                    OutlinedButton.icon(
                      onPressed: uploading
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
                      icon: const Icon(Icons.upload_file_rounded),
                      label: Text(
                        pickedName ?? 'Select PDF, DOCX, or TXT File',
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: technologies.contains(selectedTech) ? selectedTech : null,
                      decoration: const InputDecoration(
                        labelText: 'Technology / Category *',
                        border: OutlineInputBorder(),
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
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ctx.isDarkMode ? AppColors.primaryLight : AppColors.primary,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(46),
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
                                await ref.read(aiVerificationServiceProvider).uploadBook(
                                      filePath: pickedPath!,
                                      fileName: pickedName!,
                                      technology: selectedTech,
                                    );
                                if (ctx.mounted) Navigator.of(ctx).pop();
                                ref.invalidate(adminKnowledgeBaseProvider);
                                AppNotificationService.success(
                                  id: 'kb-upload-ok',
                                  title: 'Book Uploaded',
                                  message: 'Background extraction and vector indexing started.',
                                );
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
          _syncPolling(data.books);
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
                      'Configure OPENAI_API_KEY or GEMINI_API_KEY on the server to generate vector embeddings and run book verification.',
                      style: AppTextStyles.bodySmall.copyWith(color: context.warningColor),
                    ),
                  ),

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

                if (data.books.isEmpty)
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
                  ...data.books.map((book) => _buildBookCard(context, book)),
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

  Widget _buildBookCard(BuildContext context, KnowledgeBookModel book) {
    final statusColor = book.processingStatus == 'Completed'
        ? context.successColor
        : book.processingStatus == 'Failed'
            ? context.errorColor
            : context.warningColor;

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
            ].join(' · '),
            style: AppTextStyles.bodySmall.copyWith(color: context.textSecondaryColor),
          ),
          if (book.isProcessing) ...[
            const SizedBox(height: 8),
            LinearProgressIndicator(value: (book.processingProgress / 100).clamp(0.05, 1.0)),
          ],
          if (book.processingStatus == 'Failed' && book.processingError.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              book.processingError,
              style: AppTextStyles.bodySmall.copyWith(color: context.errorColor),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              Text(
                'Pages: ${book.totalPages} · Chunks: ${book.indexedChunks}/${book.totalChunks}${book.ocrUsed ? ' · OCR' : ''}',
                style: AppTextStyles.bodySmall.copyWith(
                  fontSize: 11,
                  color: context.textSecondaryColor,
                ),
              ),
              const Spacer(),
              if (book.processingStatus == 'Failed')
                TextButton.icon(
                  onPressed: () async {
                    await ref.read(aiVerificationServiceProvider).retryBookProcessing(book.id);
                    ref.invalidate(adminKnowledgeBaseProvider);
                  },
                  icon: const Icon(Icons.refresh_rounded, size: 16),
                  label: const Text('Retry'),
                ),
              IconButton(
                icon: Icon(Icons.delete_outline_rounded, color: context.errorColor, size: 20),
                onPressed: () async {
                  final ok = await showDialog<bool>(
                    context: context,
                    builder: (dCtx) => AlertDialog(
                      title: const Text('Delete Book?'),
                      content: Text('Delete "${book.title}" and all indexed chunks?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(dCtx).pop(false),
                          child: const Text('Cancel'),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: context.errorColor),
                          onPressed: () => Navigator.of(dCtx).pop(true),
                          child: const Text('Delete'),
                        ),
                      ],
                    ),
                  );
                  if (ok == true) {
                    await ref.read(aiVerificationServiceProvider).deleteBook(book.id);
                    ref.invalidate(adminKnowledgeBaseProvider);
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
