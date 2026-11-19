import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_text_styles.dart';
import '../models/ai_verification_model.dart';
import '../providers/ai_verification_provider.dart';

class AiVerificationPanel extends ConsumerStatefulWidget {
  final String questionId;
  final String questionText;
  final List<String> options;
  final String correctAnswer;
  final String technology;
  final String? userSelectedAnswer;

  const AiVerificationPanel({
    super.key,
    required this.questionId,
    required this.questionText,
    required this.options,
    required this.correctAnswer,
    required this.technology,
    this.userSelectedAnswer,
  });

  @override
  ConsumerState<AiVerificationPanel> createState() => _AiVerificationPanelState();
}

class _AiVerificationPanelState extends ConsumerState<AiVerificationPanel> {
  bool _showExcerpt = false;

  @override
  void didUpdateWidget(covariant AiVerificationPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.questionId != widget.questionId) {
      _showExcerpt = false;
    }
  }

  void _triggerVerification() {
    ref.read(quizAiVerificationProvider.notifier).verify(
          questionId: widget.questionId,
          questionText: widget.questionText,
          options: widget.options,
          correctAnswer: widget.correctAnswer,
          technology: widget.technology,
          userSelectedAnswer: widget.userSelectedAnswer,
        );
  }

  Color _statusColor(BuildContext context, String status) {
    switch (status) {
      case 'verified':
        return context.successColor;
      case 'incorrect':
        return context.errorColor;
      case 'ambiguous':
        return context.warningColor;
      default:
        return context.textSecondaryColor;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'verified':
        return Icons.verified_rounded;
      case 'incorrect':
        return Icons.warning_amber_rounded;
      case 'ambiguous':
        return Icons.help_outline_rounded;
      default:
        return Icons.menu_book_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final cacheMap = ref.watch(quizAiVerificationProvider);
    final key = widget.questionId.isNotEmpty ? widget.questionId : widget.questionText;
    final asyncResult = cacheMap[key];
    final isDark = context.isDarkMode;
    final primaryBg = isDark ? AppColors.primaryLight : AppColors.primary;

    return Container(
      key: ValueKey('ai_verify_panel_$key'),
      margin: const EdgeInsets.only(top: 4, bottom: 14),
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: context.borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.18 : 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            decoration: BoxDecoration(
              color: context.mutedBgColor.withValues(alpha: 0.7),
              borderRadius: BorderRadius.vertical(
                top: const Radius.circular(17),
                bottom: asyncResult == null ? const Radius.circular(17) : Radius.zero,
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: primaryBg,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: const Icon(
                    Icons.auto_stories_rounded,
                    size: 16,
                    color: AppColors.accent,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AI Book-Based Verification',
                        style: AppTextStyles.labelBold.copyWith(fontSize: 12.5),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        'Grounded in ${widget.technology} reference books',
                        style: AppTextStyles.bodySmall.copyWith(
                          fontSize: 10.5,
                          color: context.textSecondaryColor,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                if (asyncResult == null || asyncResult.hasError)
                  ElevatedButton.icon(
                    onPressed: _triggerVerification,
                    icon: const Icon(Icons.auto_awesome_rounded, size: 14),
                    label: const Text('Verify with AI'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryBg,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      minimumSize: const Size(0, 34),
                      textStyle: AppTextStyles.labelBold.copyWith(fontSize: 11.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  )
                else if (asyncResult.isLoading)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2.2),
                  )
                else if (asyncResult.hasValue)
                  _buildStatusPill(context, asyncResult.value!),
              ],
            ),
          ),

          // Body: Loading / Error / Result
          if (asyncResult != null)
            asyncResult.when(
              loading: () => Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: context.brandAccentColor,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Searching uploaded reference books and verifying answer...',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: context.textSecondaryColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              error: (err, _) => Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.error_outline_rounded, size: 18, color: context.errorColor),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        err.toString().replaceFirst('Exception: ', ''),
                        style: AppTextStyles.bodySmall.copyWith(color: context.errorColor),
                      ),
                    ),
                  ],
                ),
              ),
              data: (result) => _buildResultBody(context, result),
            ),
        ],
      ),
    );
  }

  Widget _buildStatusPill(BuildContext context, AiVerificationResult result) {
    final color = _statusColor(context, result.verificationStatus);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_statusIcon(result.verificationStatus), size: 13, color: color),
          const SizedBox(width: 4),
          Text(
            result.statusLabel,
            style: AppTextStyles.labelBold.copyWith(fontSize: 10.5, color: color),
          ),
        ],
      ),
    );
  }

  Widget _buildResultBody(BuildContext context, AiVerificationResult result) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (result.verifiedCorrectAnswer.isNotEmpty)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(11),
              decoration: BoxDecoration(
                color: context.mutedBgColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: context.borderColor),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    result.verificationStatus == 'incorrect'
                        ? 'BOOK-VERIFIED CORRECT ANSWER'
                        : 'VERIFIED ANSWER',
                    style: AppTextStyles.labelBold.copyWith(
                      fontSize: 10,
                      color: context.textSecondaryColor,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    result.verifiedCorrectAnswer,
                    style: AppTextStyles.bodyMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: context.successColor,
                    ),
                  ),
                  if (result.verificationStatus == 'incorrect' &&
                      result.originalCorrectAnswer.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      'Stored Quiz Answer: ${result.originalCorrectAnswer}',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: context.errorColor,
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                  ],
                ],
              ),
            ),

          // 3-4 line explanation
          Text(
            result.explanation,
            style: AppTextStyles.bodyMedium.copyWith(
              fontSize: 13,
              height: 1.48,
              color: context.textPrimaryColor,
            ),
          ),

          if ((result.verificationStatus == 'incorrect' ||
                  result.verificationStatus == 'ambiguous') &&
              result.issueDescription.isNotEmpty) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: context.warningColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: context.warningColor.withValues(alpha: 0.35)),
              ),
              child: Text(
                'Flagged for Admin Review: ${result.issueDescription}',
                style: AppTextStyles.bodySmall.copyWith(
                  color: context.warningColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],

          // Source book metadata & expandable excerpt
          if (result.sourceBook.isNotEmpty) ...[
            const SizedBox(height: 12),
            Divider(height: 1, color: context.borderColor),
            const SizedBox(height: 10),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.menu_book_rounded, size: 15, color: context.brandAccentColor),
                const SizedBox(width: 6),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        result.sourceBook,
                        style: AppTextStyles.labelBold.copyWith(fontSize: 12),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        [
                          if (result.sourceAuthor.isNotEmpty) result.sourceAuthor,
                          if (result.sourceChapter.isNotEmpty) result.sourceChapter,
                          if (result.sourcePage.isNotEmpty) 'Page ${result.sourcePage}',
                        ].join(' · '),
                        style: AppTextStyles.bodySmall.copyWith(
                          fontSize: 11,
                          color: context.textSecondaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (result.supportingExcerpt.isNotEmpty) ...[
              const SizedBox(height: 8),
              InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () => setState(() => _showExcerpt = !_showExcerpt),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.format_quote_rounded,
                        size: 15,
                        color: context.brandAccentColor,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        'View Book Reference',
                        style: AppTextStyles.labelBold.copyWith(
                          fontSize: 12,
                          color: context.brandAccentColor,
                        ),
                      ),
                      const SizedBox(width: 3),
                      Icon(
                        _showExcerpt
                            ? Icons.keyboard_arrow_up_rounded
                            : Icons.keyboard_arrow_down_rounded,
                        size: 16,
                        color: context.brandAccentColor,
                      ),
                    ],
                  ),
                ),
              ),
              if (_showExcerpt)
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(top: 6),
                  padding: const EdgeInsets.all(11),
                  decoration: BoxDecoration(
                    color: context.mutedBgColor,
                    borderRadius: BorderRadius.circular(10),
                    border: const Border(
                      left: BorderSide(color: AppColors.accent, width: 3.5),
                    ),
                  ),
                  child: Text(
                    '“${result.supportingExcerpt}”',
                    style: AppTextStyles.bodySmall.copyWith(
                      fontStyle: FontStyle.italic,
                      height: 1.45,
                      color: context.textPrimaryColor,
                    ),
                  ),
                ),
            ],
          ],
        ],
      ),
    );
  }
}
