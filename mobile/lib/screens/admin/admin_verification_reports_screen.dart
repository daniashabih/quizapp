import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../models/ai_verification_model.dart';
import '../../providers/ai_verification_provider.dart';
import '../../services/notification_service.dart';
import '../../widgets/error_state_widget.dart';
import '../../widgets/loading_state_widget.dart';

class AdminVerificationReportsScreen extends ConsumerStatefulWidget {
  const AdminVerificationReportsScreen({super.key});

  @override
  ConsumerState<AdminVerificationReportsScreen> createState() =>
      _AdminVerificationReportsScreenState();
}

class _AdminVerificationReportsScreenState
    extends ConsumerState<AdminVerificationReportsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _showApproveSheet(VerificationReportModel report) async {
    String selectedAnswer = report.verifiedCorrectAnswer.isNotEmpty
        ? report.verifiedCorrectAnswer
        : report.originalCorrectAnswer;
    final notesCtrl = TextEditingController();
    bool submitting = false;

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
                      'Review & Approve Correction',
                      style: AppTextStyles.displaySmall.copyWith(fontSize: 18),
                    ),
                    const SizedBox(height: 8),
                    Text(report.questionText, style: AppTextStyles.labelBold),
                    if (report.supportingExcerpt.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: ctx.mutedBgColor,
                          borderRadius: BorderRadius.circular(10),
                          border: const Border(
                            left: BorderSide(color: AppColors.accent, width: 3),
                          ),
                        ),
                        child: Text(
                          '${report.sourceBook} (Page ${report.sourcePage}): “${report.supportingExcerpt}”',
                          style: AppTextStyles.bodySmall.copyWith(fontStyle: FontStyle.italic),
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    Text(
                      'Select Approved Answer:',
                      style: AppTextStyles.labelBold.copyWith(fontSize: 12),
                    ),
                    const SizedBox(height: 6),
                    ...report.options.map((opt) {
                      final isSelected = selectedAnswer == opt;
                      return InkWell(
                        borderRadius: BorderRadius.circular(10),
                        onTap: () => setSheetState(() => selectedAnswer = opt),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? ctx.successColor.withValues(alpha: 0.1)
                                : ctx.mutedBgColor.withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? ctx.successColor : ctx.borderColor,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isSelected
                                    ? Icons.radio_button_checked_rounded
                                    : Icons.radio_button_off_rounded,
                                size: 18,
                                color: isSelected ? ctx.successColor : ctx.textSecondaryColor,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  opt,
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                    const SizedBox(height: 8),
                    TextField(
                      controller: notesCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Admin Audit Notes (optional)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ctx.isDarkMode ? AppColors.primaryLight : AppColors.primary,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(44),
                      ),
                      onPressed: submitting
                          ? null
                          : () async {
                              setSheetState(() => submitting = true);
                              try {
                                await ref.read(aiVerificationServiceProvider).approveReportCorrection(
                                      reportId: report.id,
                                      correctedAnswer: selectedAnswer,
                                      correctedExplanation: report.explanation,
                                      notes: notesCtrl.text.trim(),
                                    );
                                if (ctx.mounted) Navigator.of(ctx).pop();
                                ref.invalidate(adminVerificationReportsProvider);
                                ref.invalidate(adminCorrectionHistoryProvider);
                                AppNotificationService.success(
                                  id: 'vr-approved',
                                  title: 'Correction Approved',
                                  message: 'Question updated and change recorded in history.',
                                );
                              } catch (e) {
                                setSheetState(() => submitting = false);
                                AppNotificationService.error(
                                  id: 'vr-approve-err',
                                  title: 'Approval Failed',
                                  message: e.toString().replaceFirst('Exception: ', ''),
                                );
                              }
                            },
                      icon: submitting
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.check_circle_outline_rounded),
                      label: const Text('Approve & Update Question'),
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
    final reportsAsync = ref.watch(adminVerificationReportsProvider);
    final historyAsync = ref.watch(adminCorrectionHistoryProvider);
    final statusFilter = ref.watch(adminVerificationStatusFilterProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Verification Reports'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              ref.invalidate(adminVerificationReportsProvider);
              ref.invalidate(adminCorrectionHistoryProvider);
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Reports'),
            Tab(text: 'Correction History'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Reports
          reportsAsync.when(
            loading: () => const LoadingStateWidget(message: 'Loading verification reports...'),
            error: (err, _) => ErrorStateWidget(
              message: err.toString(),
              onRetry: () => ref.invalidate(adminVerificationReportsProvider),
            ),
            data: (data) => RefreshIndicator(
              onRefresh: () async => ref.invalidate(adminVerificationReportsProvider),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Summary KPI Strip
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                    childAspectRatio: 2.3,
                    children: [
                      _kpiBox(context, 'Total Verified', '${data.totalVerified}', context.brandAccentColor),
                      _kpiBox(context, 'Confirmed Correct', '${data.confirmedCorrect}', context.successColor),
                      _kpiBox(context, 'Incorrect Detected', '${data.incorrectDetected}', context.errorColor),
                      _kpiBox(context, 'Ambiguous / Insuff.', '${data.ambiguousCount} / ${data.insufficientEvidenceCount}', context.warningColor),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Status Filter Chips
                  SizedBox(
                    height: 36,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        for (final entry in const [
                          ('all', 'All'),
                          ('incorrect', 'Incorrect'),
                          ('ambiguous', 'Ambiguous'),
                          ('verified', 'Verified'),
                          ('insufficient_evidence', 'Insufficient'),
                        ])
                          Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: ChoiceChip(
                              label: Text(entry.$2),
                              selected: statusFilter == entry.$1,
                              onSelected: (_) => ref
                                  .read(adminVerificationStatusFilterProvider.notifier)
                                  .state = entry.$1,
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  if (data.reports.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(24),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: context.cardBgColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: context.borderColor),
                      ),
                      child: Text(
                        'No verification reports found for this filter.',
                        style: AppTextStyles.bodyMedium.copyWith(color: context.textSecondaryColor),
                      ),
                    )
                  else
                    ...data.reports.map((report) => _buildReportCard(context, report)),
                ],
              ),
            ),
          ),

          // Tab 2: Correction History
          historyAsync.when(
            loading: () => const LoadingStateWidget(message: 'Loading correction history...'),
            error: (err, _) => ErrorStateWidget(
              message: err.toString(),
              onRetry: () => ref.invalidate(adminCorrectionHistoryProvider),
            ),
            data: (history) => history.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text(
                        'No approved corrections recorded yet.',
                        style: AppTextStyles.bodyMedium.copyWith(color: context.textSecondaryColor),
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: history.length,
                    itemBuilder: (ctx, i) {
                      final item = history[i];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: ctx.cardBgColor,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: ctx.borderColor),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${item.technology} · Approved by ${item.approvedBy}',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: ctx.textSecondaryColor,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(item.questionText, style: AppTextStyles.labelBold),
                            const SizedBox(height: 8),
                            Text(
                              'Old: ${item.previousCorrectAnswer}',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: ctx.errorColor,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                            Text(
                              'New: ${item.newCorrectAnswer}',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: ctx.successColor,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            if (item.sourceBook.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                'Ref: ${item.sourceBook}${item.sourcePage.isNotEmpty ? ' (Page ${item.sourcePage})' : ''}',
                                style: AppTextStyles.bodySmall.copyWith(color: ctx.textSecondaryColor),
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _kpiBox(BuildContext context, String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: AppTextStyles.bodySmall.copyWith(fontSize: 10.5, color: context.textSecondaryColor)),
          Text(value, style: AppTextStyles.displaySmall.copyWith(fontSize: 18, color: color)),
        ],
      ),
    );
  }

  Widget _buildReportCard(BuildContext context, VerificationReportModel report) {
    final canApprove = (report.verificationStatus == 'incorrect' ||
            report.verificationStatus == 'ambiguous') &&
        report.reviewStatus != 'approved';
    final statusColor = report.verificationStatus == 'verified'
        ? context.successColor
        : report.verificationStatus == 'incorrect'
            ? context.errorColor
            : report.verificationStatus == 'ambiguous'
                ? context.warningColor
                : context.textSecondaryColor;

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
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  report.technology,
                  style: AppTextStyles.labelBold.copyWith(fontSize: 10.5, color: Colors.white),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  report.statusLabel,
                  style: AppTextStyles.labelBold.copyWith(fontSize: 10.5, color: statusColor),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: context.mutedBgColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${report.reviewStatus.toUpperCase()} · ${(report.confidence * 100).round()}%',
                  style: AppTextStyles.mono.copyWith(
                    fontSize: 10,
                    color: context.textSecondaryColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(report.questionText, style: AppTextStyles.labelBold),
          const SizedBox(height: 6),
          Text(
            'Stored: ${report.originalCorrectAnswer}',
            style: AppTextStyles.bodySmall.copyWith(color: context.textSecondaryColor),
          ),
          if (report.verifiedCorrectAnswer.isNotEmpty)
            Text(
              'Book-Verified: ${report.verifiedCorrectAnswer}',
              style: AppTextStyles.bodySmall.copyWith(
                color: context.successColor,
                fontWeight: FontWeight.w700,
              ),
            ),
          const SizedBox(height: 6),
          Text(report.explanation, style: AppTextStyles.bodySmall),
          if (report.issueDescription.isNotEmpty && report.verificationStatus != 'verified') ...[
            const SizedBox(height: 6),
            Text(
              'Reason: ${report.issueDescription}',
              style: AppTextStyles.bodySmall.copyWith(
                fontSize: 11.5,
                color: context.warningColor,
              ),
            ),
          ],
          if (report.sourceBook.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              'Source: ${report.sourceBook}${report.sourceChapter.isNotEmpty ? ' · ${report.sourceChapter}' : ''}${report.sourcePage.isNotEmpty ? ' · Page ${report.sourcePage}' : ''}',
              style: AppTextStyles.bodySmall.copyWith(
                fontSize: 11,
                color: context.brandAccentColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          if (canApprove) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: context.isDarkMode ? AppColors.primaryLight : AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () => _showApproveSheet(report),
                    icon: const Icon(Icons.check_rounded, size: 16),
                    label: const Text('Review & Approve'),
                  ),
                ),
                if (report.reviewStatus == 'pending') ...[
                  const SizedBox(width: 8),
                  OutlinedButton(
                    onPressed: () async {
                      try {
                        await ref.read(aiVerificationServiceProvider).dismissReport(
                              report.id,
                              notes: 'Dismissed by administrator.',
                            );
                        ref.invalidate(adminVerificationReportsProvider);
                        AppNotificationService.info(
                          id: 'vr-dismissed',
                          title: 'Report Dismissed',
                          message: 'Suggested correction rejected without changing quiz answer.',
                        );
                      } catch (e) {
                        AppNotificationService.error(
                          id: 'vr-dismiss-err',
                          title: 'Error',
                          message: e.toString().replaceFirst('Exception: ', ''),
                        );
                      }
                    },
                    child: const Text('Dismiss'),
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }
}
