import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/config/app_config.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../models/quiz_result_model.dart';
import '../../widgets/app_button.dart';
import '../../widgets/banner_ad_widget.dart';

class ResultScreen extends StatelessWidget {
  final QuizResultModel result;

  const ResultScreen({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    final isPassed = result.isPassed;
    final isCertified = result.isCertified;
    final incorrectCount = result.total - result.score;
    final statusColor = isPassed ? context.successColor : context.errorColor;
    final isDark = context.isDark;
    final pctFraction = (result.percentage.clamp(0, 100)) / 100.0;
    final earnedStars = isCertified
        ? 5
        : isPassed
        ? 4
        : (result.percentage >= 40 ? 2 : 1);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, dResult) {
        if (!didPop) {
          context.go('/home');
        }
      },
      child: Scaffold(
        backgroundColor: context.scaffoldBgColor,
        bottomNavigationBar: const SafeArea(
          child: BannerAdWidget(),
        ),
        appBar: AppBar(
          title: const Text('Quiz Completed'),
          leading: IconButton(
            icon: const Icon(Icons.close_rounded),
            onPressed: () => context.go('/home'),
          ),
          actions: [
            Container(
              width: 36,
              height: 36,
              margin: const EdgeInsets.only(right: 14),
              decoration: BoxDecoration(
                color: context.cardBgColor,
                shape: BoxShape.circle,
                border: Border.all(color: context.borderColor),
              ),
              child: IconButton(
                padding: EdgeInsets.zero,
                icon: const Icon(Icons.share_outlined, size: 18),
                tooltip: 'Share Result',
                onPressed: () => _shareScore(),
              ),
            ),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // 1. Reference Hero Score Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: context.cardBgColor,
                  borderRadius: BorderRadius.circular(26),
                  border: Border.all(
                    color: context.borderColor.withValues(alpha: 0.75),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(
                        alpha: isDark ? 0.28 : 0.06,
                      ),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Hero Icon / Badge
                    Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: statusColor.withValues(alpha: 0.14),
                        border: Border.all(
                          color: statusColor.withValues(alpha: 0.55),
                          width: 2.5,
                        ),
                      ),
                      child: Icon(
                        isPassed
                            ? Icons.emoji_events_rounded
                            : Icons.replay_rounded,
                        size: 46,
                        color: statusColor,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Star Rating Row (Reference Mockup 2)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        5,
                        (index) => Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 2),
                          child: Icon(
                            Icons.star_rounded,
                            size: 20,
                            color: index < earnedStars
                                ? AppColors.accent
                                : context.borderColor,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Title and Feedback
                    Text(
                      isCertified
                          ? 'Outstanding! Certified! 🏆'
                          : isPassed
                          ? 'Great Job! You Passed! 🎉'
                          : 'Keep Practicing! 💪',
                      style: AppTextStyles.displaySmall.copyWith(
                        fontWeight: FontWeight.w800,
                        fontSize: 22,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      isCertified
                          ? 'You scored ${result.percentage.toStringAsFixed(0)}% in ${result.category}. You qualify for a verified certificate!'
                          : isPassed
                          ? 'You passed ${result.category} Session ${result.session} with a solid score.'
                          : 'You need at least 70% to pass this quiz. Review your materials and try again!',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: context.textSecondaryColor,
                        fontSize: 13,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),

                    // Large Score Display
                    Text(
                      'YOUR SCORE',
                      style: AppTextStyles.mono.copyWith(
                        fontSize: 11,
                        letterSpacing: 1.8,
                        color: context.textSecondaryColor,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          result.percentage.toStringAsFixed(0),
                          style: AppTextStyles.displayLarge.copyWith(
                            fontSize: 56,
                            fontWeight: FontWeight.w900,
                            color: isPassed
                                ? context.brandAccentColor
                                : context.errorColor,
                          ),
                        ),
                        Text(
                          '%',
                          style: AppTextStyles.displaySmall.copyWith(
                            fontSize: 28,
                            color: isPassed
                                ? context.brandAccentColor
                                : context.errorColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Reference Mockup 1 & 2 Thick Pill Progress Bar
                    Container(
                      height: 18,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.primary.withValues(alpha: 0.45)
                            : AppColors.primary.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Stack(
                        children: [
                          FractionallySizedBox(
                            widthFactor: pctFraction.clamp(0.1, 1.0),
                            child: Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: isPassed
                                      ? [
                                          AppColors.accent,
                                          const Color(0xFFE0B15E),
                                        ]
                                      : [
                                          context.errorColor,
                                          context.warningColor,
                                        ],
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                          Positioned.fill(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                              ),
                              child: Align(
                                alignment: Alignment.centerRight,
                                child: Text(
                                  '${result.score}/${result.total} Points',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: isDark
                                        ? Colors.white
                                        : AppColors.primary,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 2. Reference Mockup 2 "Achievements" Style 3-Column Breakdown Cards
              Row(
                children: [
                  Expanded(
                    child: _buildStatCol(
                      context,
                      'Correct',
                      '${result.score}',
                      context.successColor,
                      Icons.verified_user_rounded,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildStatCol(
                      context,
                      'Incorrect',
                      '$incorrectCount',
                      context.errorColor,
                      Icons.cancel_rounded,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildStatCol(
                      context,
                      'Total',
                      '${result.total}',
                      context.brandAccentColor,
                      Icons.shield_rounded,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 22),

              // 3. Certification Callout Banner
              if (isCertified)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(
                      color: AppColors.accent.withValues(alpha: 0.45),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.accent.withValues(alpha: 0.22),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.verified_rounded,
                          color: AppColors.accent,
                          size: 28,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Certificate Unlocked!',
                              style: AppTextStyles.displaySmall.copyWith(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'View and share your official ${AppConfig.appName} verified certificate.',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: context.textSecondaryColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 26),

              // 4. Action Buttons
              if (isCertified) ...[
                AppButton(
                  text: 'View Certificates',
                  icon: Icons.workspace_premium_rounded,
                  onPressed: () => context.go('/certificates'),
                ),
                const SizedBox(height: 12),
              ],

              AppButton(
                text: 'Try Another Quiz',
                type: isCertified
                    ? AppButtonType.secondary
                    : AppButtonType.primary,
                icon: Icons.explore_rounded,
                onPressed: () => context.go('/explore'),
              ),
              const SizedBox(height: 12),

              AppButton(
                text: 'Back to Dashboard',
                type: AppButtonType.outline,
                icon: Icons.home_rounded,
                onPressed: () => context.go('/home'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCol(
    BuildContext context,
    String label,
    String value,
    Color color,
    IconData icon,
  ) {
    final isDark = context.isDark;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
      decoration: BoxDecoration(
        color: isDark ? context.cardBgColor : color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: color.withValues(alpha: isDark ? 0.35 : 0.22),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(13),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: AppTextStyles.displaySmall.copyWith(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTextStyles.bodySmall.copyWith(
              color: context.textSecondaryColor,
              fontWeight: FontWeight.w700,
              fontSize: 11.5,
            ),
          ),
        ],
      ),
    );
  }

  void _shareScore() {
    Share.share(
      '🎯 I just scored ${result.percentage.toStringAsFixed(0)}% (${result.score}/${result.total}) '
      'on the ${result.category} quiz on ${AppConfig.appName}!\n\n'
      'Test your web development and programming skills at: https://www.hangbug.com',
      subject: 'My ${AppConfig.appName} Quiz Result for ${result.category}',
    );
  }
}
