import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/utils/date_formatter.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/error_state_widget.dart';
import '../../widgets/loading_state_widget.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(userDashboardProvider);
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isDark = context.isDarkMode;

    return Scaffold(
      backgroundColor: context.scaffoldBgColor,
      appBar: AppBar(
        title: Image.asset(
          context.brandCompactLogoAsset,
          height: 30,
          fit: BoxFit.contain,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, size: 20),
            onPressed: () => ref.refresh(userDashboardProvider),
            tooltip: 'Refresh Dashboard',
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: dashboardAsync.when(
        loading: () =>
            const LoadingStateWidget(message: 'Loading live dashboard...'),
        error: (err, _) => ErrorStateWidget(
          message: err.toString(),
          onRetry: () => ref.refresh(userDashboardProvider),
        ),
        data: (dashboard) {
          final stats = dashboard.stats;
          final recentAttempts = dashboard.recentAttempts;
          final techProgress = dashboard.technologyProgress;

          return RefreshIndicator(
            color: context.brandAccentColor,
            onRefresh: () async {
              return ref.refresh(userDashboardProvider.future);
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding:
                  const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Welcome Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.primary, AppColors.secondary],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(
                            alpha: isDark ? 0.35 : 0.18,
                          ),
                          blurRadius: 14,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Welcome back,',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: Colors.white.withValues(alpha: 0.8),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    user?.name ?? 'Candidate',
                                    style: AppTextStyles.displaySmall.copyWith(
                                      color: Colors.white,
                                      fontSize: 20,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.accent,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.local_fire_department_rounded,
                                    size: 14,
                                    color: Colors.white,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${stats.streak}d Streak',
                                    style: AppTextStyles.labelBold.copyWith(
                                      color: Colors.white,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Level ${stats.level} Developer · ${stats.xp} XP',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: Colors.white.withValues(alpha: 0.9),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              'Global Rank #${stats.rank}',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.accentLight,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  // 2. Statistics Grid (Real Live Data from MongoDB Atlas)
                  Text(
                    'Your Performance',
                    style: AppTextStyles.displaySmall.copyWith(fontSize: 16),
                  ),
                  const SizedBox(height: 10),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                    childAspectRatio: 1.7,
                    children: [
                      _buildStatCard(
                        context: context,
                        icon: Icons.assignment_outlined,
                        label: 'Quizzes Taken',
                        value: '${stats.totalQuizzes}',
                        color: context.brandAccentColor,
                      ),
                      _buildStatCard(
                        context: context,
                        icon: Icons.percent_rounded,
                        label: 'Average Score',
                        value: '${stats.averageScore}%',
                        color: isDark
                            ? const Color(0xFF6EE7B7)
                            : AppColors.secondary,
                      ),
                      _buildStatCard(
                        context: context,
                        icon: Icons.workspace_premium_outlined,
                        label: 'Certificates',
                        value: '${stats.certificates}',
                        color: AppColors.accent,
                      ),
                      _buildStatCard(
                        context: context,
                        icon: Icons.check_circle_outline_rounded,
                        label: 'Passed Quizzes',
                        value: '${stats.passedQuizzes}',
                        color: context.successColor,
                      ),
                    ],
                  ),

                  const SizedBox(height: 22),

                  // 3. Quick Action Banner
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.accent.withValues(alpha: 0.15)
                          : AppColors.accentLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDark
                            ? AppColors.accent.withValues(alpha: 0.38)
                            : AppColors.accentBorder,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.rocket_launch_rounded,
                          color: isDark
                              ? AppColors.accentLight
                              : AppColors.primary,
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Ready for your next challenge?',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: isDark
                                      ? AppColors.accentLight
                                      : AppColors.primary,
                                  fontSize: 13,
                                ),
                              ),
                              Text(
                                'Choose a technology track to test your mastery.',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: context.textSecondaryColor,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () => context.go('/explore'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDark
                                ? AppColors.primaryLight
                                : AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 8,
                            ),
                            minimumSize: const Size(0, 36),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: const Text(
                            'Start',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 4. Technology Track Progress
                  if (techProgress.isNotEmpty) ...[
                    Text(
                      'Technology Progress',
                      style: AppTextStyles.displaySmall.copyWith(fontSize: 16),
                    ),
                    const SizedBox(height: 10),
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: techProgress.length,
                      separatorBuilder: (context, index) =>
                          const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final tech = techProgress[index];
                        return Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: context.cardBgColor,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: context.borderColor),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: context.mutedBgColor,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: context.borderColor,
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    tech.category.isNotEmpty
                                        ? tech.category[0]
                                        : 'T',
                                    style: AppTextStyles.displaySmall.copyWith(
                                      color: context.brandAccentColor,
                                      fontSize: 16,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      tech.category,
                                      style: AppTextStyles.bodyMedium.copyWith(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 13,
                                      ),
                                    ),
                                    Text(
                                      '${tech.attempts} attempt(s) · Pass rate: ${tech.passRate}%',
                                      style: AppTextStyles.bodySmall.copyWith(
                                        fontSize: 11,
                                        color: context.textSecondaryColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: tech.bestScore >= 80
                                      ? context.successBgColor
                                      : context.mutedBgColor,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  'Best: ${tech.bestScore}%',
                                  style: AppTextStyles.labelBold.copyWith(
                                    color: tech.bestScore >= 80
                                        ? context.successColor
                                        : context.textPrimaryColor,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 24),
                  ],

                  // 5. Recent Attempts
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Recent Assessments',
                        style: AppTextStyles.displaySmall.copyWith(fontSize: 16),
                      ),
                      if (recentAttempts.isNotEmpty)
                        Text(
                          '${recentAttempts.length} Total',
                          style: AppTextStyles.bodySmall.copyWith(
                            fontSize: 11,
                            color: context.textSecondaryColor,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  if (recentAttempts.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: context.cardBgColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: context.borderColor),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            Icons.quiz_outlined,
                            size: 32,
                            color: context.textSecondaryColor,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'No quiz attempts yet',
                            style: AppTextStyles.bodyMedium.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Take your first assessment to start building your profile.',
                            style: AppTextStyles.bodySmall.copyWith(
                              fontSize: 11,
                              color: context.textSecondaryColor,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: recentAttempts.length > 5
                          ? 5
                          : recentAttempts.length,
                      separatorBuilder: (context, index) =>
                          const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final attempt = recentAttempts[index];
                        final isPassed = attempt.isPassed;

                        return Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: context.cardBgColor,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: context.borderColor),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isPassed
                                    ? Icons.check_circle_rounded
                                    : Icons.cancel_rounded,
                                color: isPassed
                                    ? context.successColor
                                    : context.errorColor,
                                size: 24,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${attempt.category} (Session ${attempt.session})',
                                      style: AppTextStyles.bodyMedium.copyWith(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 13,
                                      ),
                                    ),
                                    Text(
                                      'Score: ${attempt.score}/${attempt.total} · ${DateFormatter.timeAgo(attempt.createdAt)}',
                                      style: AppTextStyles.bodySmall.copyWith(
                                        fontSize: 11,
                                        color: context.textSecondaryColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                '${attempt.percentage.round()}%',
                                style: AppTextStyles.displaySmall.copyWith(
                                  color: isPassed
                                      ? context.successColor
                                      : context.errorColor,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatCard({
    required BuildContext context,
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: color),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  style: AppTextStyles.bodySmall.copyWith(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: context.textSecondaryColor,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTextStyles.displaySmall.copyWith(
              color: context.textPrimaryColor,
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
          ),
        ],
      ),
    );
  }
}
