import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../providers/ai_verification_provider.dart';
import '../../services/notification_service.dart';
import '../../widgets/error_state_widget.dart';
import '../../widgets/loading_state_widget.dart';

class AdminAiControlsScreen extends ConsumerStatefulWidget {
  const AdminAiControlsScreen({super.key});

  @override
  ConsumerState<AdminAiControlsScreen> createState() =>
      _AdminAiControlsScreenState();
}

class _AdminAiControlsScreenState
    extends ConsumerState<AdminAiControlsScreen> {
  String _testMode = 'verification';
  final TextEditingController _promptController = TextEditingController(
    text: 'Explain the HTML <section> tag in 3 concise lines.',
  );
  final TextEditingController _ragQuestionController = TextEditingController(
    text:
        'Which HTML tag defines an independent, self-contained section in a document?',
  );
  final TextEditingController _ragOptionsController = TextEditingController(
    text: '<section>, <div>, <span>, <font>',
  );
  final TextEditingController _ragAnswerController = TextEditingController(
    text: '<section>',
  );
  final TextEditingController _ragTechController = TextEditingController(
    text: 'HTML',
  );

  bool _runningTest = false;
  Map<String, dynamic>? _testResult;
  String? _testError;
  bool _clearingCache = false;

  @override
  void dispose() {
    _promptController.dispose();
    _ragQuestionController.dispose();
    _ragOptionsController.dispose();
    _ragAnswerController.dispose();
    _ragTechController.dispose();
    super.dispose();
  }

  Future<void> _clearCache() async {
    if (_clearingCache) return;
    setState(() => _clearingCache = true);
    try {
      final msg =
          await ref.read(aiVerificationServiceProvider).clearAiCache();
      ref.invalidate(adminAiStatusProvider);
      AppNotificationService.success(
        id: 'ai-cache-clear-ok',
        title: 'Cache Cleared',
        message: msg,
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'ai-cache-clear-err',
        title: 'Error',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    } finally {
      if (mounted) setState(() => _clearingCache = false);
    }
  }

  Future<void> _runLiveTest(bool isConfigured) async {
    if (_runningTest) return;
    if (!isConfigured && _testMode != 'verification') {
      setState(() {
        _testError = 'No active AI provider is configured on the server.';
      });
      return;
    }

    setState(() {
      _runningTest = true;
      _testResult = null;
      _testError = null;
    });

    try {
      final Map<String, dynamic> payload;
      if (_testMode == 'verification') {
        final opts = _ragOptionsController.text
            .split(',')
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty)
            .toList();
        payload = {
          'mode': 'verification',
          'questionText': _ragQuestionController.text.trim(),
          'options': opts,
          'correctAnswer': _ragAnswerController.text.trim(),
          'technology': _ragTechController.text.trim().isEmpty
              ? 'HTML'
              : _ragTechController.text.trim(),
          'bypassCache': true,
        };
      } else if (_testMode == 'models') {
        payload = {'mode': 'models'};
      } else {
        payload = {
          'mode': _testMode,
          'prompt': _promptController.text.trim(),
        };
      }

      final res = await ref
          .read(aiVerificationServiceProvider)
          .testAiModel(payload);
      if (mounted) {
        setState(() => _testResult = res);
        ref.invalidate(adminAiStatusProvider);
      }
    } catch (e) {
      if (mounted) {
        setState(
          () => _testError = e.toString().replaceFirst('Exception: ', ''),
        );
      }
    } finally {
      if (mounted) setState(() => _runningTest = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusAsync = ref.watch(adminAiStatusProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Models & Usage'),
        actions: [
          IconButton(
            tooltip: 'Refresh AI Status',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.invalidate(adminAiStatusProvider),
          ),
        ],
      ),
      body: statusAsync.when(
        loading: () =>
            const LoadingStateWidget(message: 'Loading AI metrics...'),
        error: (err, _) => ErrorStateWidget(
          message: err.toString(),
          onRetry: () => ref.invalidate(adminAiStatusProvider),
        ),
        data: (status) => RefreshIndicator(
          onRefresh: () async => ref.invalidate(adminAiStatusProvider),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 36),
            children: [
              // Security & Readiness Banner (never exposes secret token)
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: status.configured
                      ? context.successBgColor
                      : context.warningBgColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: (status.configured
                            ? context.successColor
                            : context.warningColor)
                        .withValues(alpha: 0.45),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      status.configured
                          ? Icons.verified_user_rounded
                          : Icons.info_outline_rounded,
                      color: status.configured
                          ? context.successColor
                          : context.warningColor,
                      size: 20,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            status.configured
                                ? 'Active Provider: ${(status.chatProvider.isNotEmpty ? status.chatProvider : status.provider).toUpperCase()}${status.embeddingProvider.isNotEmpty && status.embeddingProvider != status.chatProvider ? ' (Chat) · ${status.embeddingProvider.toUpperCase()} (Embeddings)' : ''} (Secured on Server)'
                                : 'No Active AI Provider Configured',
                            style: AppTextStyles.labelBold.copyWith(
                              color: status.configured
                                  ? context.successColor
                                  : context.warningColor,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            status.configured
                                ? 'API credentials stay strictly in server environment variables and are never transmitted to mobile clients.'
                                : 'Uploaded books, vector chunks, and saved verification reports remain intact. Configure a server AI provider when ready.',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: context.textSecondaryColor,
                            ),
                          ),
                          if (status.modelValid != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              status.modelValid == true
                                  ? 'Model validated (${status.availableChatModelsCount} chat models available).'
                                  : 'Model validation warning: ${status.modelValidationError}',
                              style: AppTextStyles.bodySmall.copyWith(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: status.modelValid == true
                                    ? context.successColor
                                    : context.errorColor,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              if (status.dimensionMismatchCount > 0) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: context.warningBgColor,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: context.warningColor.withValues(alpha: 0.45),
                    ),
                  ),
                  child: Text(
                    'Dimension mismatch: ${status.dimensionMismatchCount} book(s) were indexed with a different vector dimension than ${status.embeddingDimensions}d.',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: context.warningColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 14),

              // Usage KPIs
              Row(
                children: [
                  _kpiTile(context, 'Requests', '${status.totalRequests}'),
                  const SizedBox(width: 8),
                  _kpiTile(
                    context,
                    'Cache Hit',
                    '${status.cacheHitRatePercent.toStringAsFixed(0)}%',
                  ),
                  const SizedBox(width: 8),
                  _kpiTile(context, 'Tokens', '${status.totalTokens}'),
                  const SizedBox(width: 8),
                  _kpiTile(context, 'Errors', '${status.errors}'),
                ],
              ),

              const SizedBox(height: 12),

              // Active Configuration Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: context.cardBgColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: context.borderColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AI & Vector Search Configuration',
                      style: AppTextStyles.labelBold.copyWith(fontSize: 13.5),
                    ),
                    const SizedBox(height: 10),
                    _infoRow(
                      context,
                      'Chat Model',
                      status.chatModel.isEmpty
                          ? 'Not Configured'
                          : status.chatModel,
                    ),
                    _infoRow(
                      context,
                      'Embedding Model',
                      status.embeddingModel.isEmpty
                          ? 'Text Fallback (Existing Books)'
                          : '${status.embeddingModel} (${status.embeddingDimensions}d)',
                    ),
                    _infoRow(
                      context,
                      'Atlas Vector Index',
                      status.vectorIndexName,
                    ),
                    _infoRow(
                      context,
                      'Indexed Chunks',
                      '${status.totalIndexedChunks} chunks · ${status.cachedVerificationsCount} saved reports',
                    ),
                    _infoRow(
                      context,
                      'Resilience',
                      'Timeout ${status.timeoutMs}ms · Retries ${status.maxRetries}x',
                    ),
                    _infoRow(
                      context,
                      'Memory Cache',
                      '${status.memoryEmbeddingCacheEntries} embeddings · ${status.memoryChatCacheEntries} chats',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Clear Cache Button
              OutlinedButton.icon(
                onPressed: _clearingCache ? null : _clearCache,
                icon: _clearingCache
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.cleaning_services_rounded, size: 16),
                label: const Text('Clear In-Memory Cache'),
              ),

              const SizedBox(height: 16),

              // Interactive Diagnostic Tester
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: context.cardBgColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: context.borderColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'AI & Book RAG Diagnostic Tester',
                      style: AppTextStyles.labelBold.copyWith(fontSize: 14),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Verify configured AI endpoints or run a book-grounded RAG check (never alters saved quiz answers).',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: context.textSecondaryColor,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        for (final mode in const [
                          ('chat', 'Chat Model'),
                          ('models', 'Models'),
                          ('embedding', 'Embedding'),
                          ('verification', 'Book RAG'),
                        ])
                          ChoiceChip(
                            label: Text(mode.$2),
                            selected: _testMode == mode.$1,
                            onSelected: (_) => setState(() {
                              _testMode = mode.$1;
                              _testResult = null;
                              _testError = null;
                            }),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (_testMode == 'verification') ...[
                      TextField(
                        controller: _ragTechController,
                        decoration: InputDecoration(
                          labelText: 'Technology',
                          isDense: true,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _ragQuestionController,
                        decoration: InputDecoration(
                          labelText: 'Question Text',
                          isDense: true,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _ragOptionsController,
                        decoration: InputDecoration(
                          labelText: 'Options (comma-separated)',
                          isDense: true,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _ragAnswerController,
                        decoration: InputDecoration(
                          labelText: 'Stored Correct Answer',
                          isDense: true,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ] else if (_testMode == 'models')
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: context.mutedBgColor,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: context.borderColor),
                        ),
                        child: Text(
                          'Retrieves live models from Groq /models endpoint and validates GROQ_MODEL.',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: context.textSecondaryColor,
                          ),
                        ),
                      )
                    else
                      TextField(
                        controller: _promptController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          labelText: 'Test Prompt / Input Text',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: (_runningTest ||
                              (!status.configured && _testMode != 'verification'))
                          ? null
                          : () => _runLiveTest(status.configured),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: context.isDarkMode
                            ? AppColors.primaryLight
                            : AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: _runningTest
                          ? const SizedBox(
                              width: 15,
                              height: 15,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.play_arrow_rounded),
                      label: Text(
                        _runningTest ? 'Running Test...' : 'Run Diagnostic Test',
                      ),
                    ),
                    if (_testError != null) ...[
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: context.errorBgColor,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          _testError!,
                          style: AppTextStyles.bodySmall
                              .copyWith(color: context.errorColor),
                        ),
                      ),
                    ],
                    if (_testResult != null) ...[
                      const SizedBox(height: 12),
                      _buildTestResultCard(context, _testResult!),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _kpiTile(BuildContext context, String label, String value) {
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
            Text(
              value,
              style: AppTextStyles.displaySmall.copyWith(fontSize: 15),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: AppTextStyles.bodySmall.copyWith(
                fontSize: 10,
                color: context.textSecondaryColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 118,
            child: Text(
              label,
              style: AppTextStyles.bodySmall.copyWith(
                color: context.textSecondaryColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.mono.copyWith(fontSize: 11.5),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTestResultCard(
    BuildContext context,
    Map<String, dynamic> raw,
  ) {
    if (_testMode == 'verification' && raw['verification'] is Map) {
      final v = raw['verification'] as Map<String, dynamic>;
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: context.mutedBgColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: context.borderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Status: ${v['verification_status']} (${raw['searchMode'] ?? 'rag'}) · ${raw['latencyMs'] ?? 0}ms',
              style: AppTextStyles.labelBold.copyWith(color: context.successColor),
            ),
            if ((v['verified_correct_answer'] ?? '').toString().isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                'Verified Answer: ${v['verified_correct_answer']}',
                style: AppTextStyles.labelBold.copyWith(fontSize: 12),
              ),
            ],
            const SizedBox(height: 6),
            Text(
              v['explanation']?.toString() ?? '',
              style: AppTextStyles.bodySmall.copyWith(height: 1.45),
            ),
            if ((v['source_book'] ?? '').toString().isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                'Source: ${v['source_book']} · ${v['source_chapter']} · Page ${v['source_page']}',
                style: AppTextStyles.bodySmall.copyWith(
                  fontSize: 11,
                  color: context.textSecondaryColor,
                ),
              ),
            ],
          ],
        ),
      );
    }

    final r = (raw['result'] as Map<String, dynamic>?) ?? raw;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: context.mutedBgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${r['provider'] ?? ''} · ${r['model'] ?? ''} · ${r['latencyMs'] ?? 0}ms',
            style: AppTextStyles.labelBold.copyWith(
              fontSize: 11.5,
              color: context.successColor,
            ),
          ),
          const SizedBox(height: 6),
          if (r['mode'] == 'embedding')
            Text(
              'Dimensions: ${r['dimensions']} (expected ${r['expectedDimensions']}) · Norm: ${r['vectorNorm']}\nSample: ${r['sampleValues']}',
              style: AppTextStyles.mono.copyWith(fontSize: 11.5),
            )
          else if (r['mode'] == 'models')
            Text(
              'Resolved: ${r['resolvedModel'] ?? r['configuredModel'] ?? ''}${r['validated'] == true ? ' (Validated)' : ''}\nChat models (${r['chatModelsCount'] ?? 0}): ${((r['chatModels'] as List?) ?? []).join(', ')}',
              style: AppTextStyles.mono.copyWith(fontSize: 11.5),
            )
          else
            Text(
              r['responseText']?.toString() ?? '',
              style: AppTextStyles.bodySmall.copyWith(height: 1.45),
            ),
        ],
      ),
    );
  }
}
