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
import '../../widgets/banner_ad_widget.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(userDashboardProvider);
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isDark = context.isDarkMode;

    final xpPoints = dashboardAsync.maybeWhen(
      data: (d) => d.stats.xp,
      orElse: () => 0,
    );

    return Scaffold(
      backgroundColor: context.scaffoldBgColor,
      appBar: AppBar(
        titleSpacing: 16,
        title: Image.asset(
          context.brandCompactLogoAsset,
          height: 30,
          fit: BoxFit.contain,
        ),
        actions: [
          // Reference Top-Right Points + Avatar Pill
          GestureDetector(
            onTap: () => context.go('/profile'),
            child: Container(
              height: 36,
              padding: const EdgeInsets.only(left: 10, right: 3),
              decoration: BoxDecoration(
                color: isDark ? AppColors.primaryLight : AppColors.primary,
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(
                      alpha: isDark ? 0.35 : 0.18,
                    ),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 18,
                    height: 18,
                    decoration: const BoxDecoration(
                      color: AppColors.accent,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.stars_rounded,
                      size: 13,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '$xpPoints XP',
                    style: AppTextStyles.labelBold.copyWith(
                      color: Colors.white,
                      fontSize: 11.5,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: context.cardBgColor,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.85),
                        width: 1.5,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        user?.initials ?? 'U',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: isDark ? AppColors.accent : AppColors.primary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
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
              icon: const Icon(Icons.refresh_rounded, size: 18),
              onPressed: () => ref.refresh(userDashboardProvider),
              tooltip: 'Refresh Dashboard',
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: dashboardAsync.when(
              loading: () => const LoadingStateWidget(
                message: 'Loading live dashboard...',
              ),
              error: (err, _) => ErrorStateWidget(
                message: err.toString(),
                onRetry: () => ref.refresh(userDashboardProvider),
              ),
              data: (dashboard) {
                final stats = dashboard.stats;
                final recentAttempts = dashboard.recentAttempts;
                final techProgress = dashboard.technologyProgress;
                final progressFraction =
                    (stats.averageScore.clamp(0, 100)) / 100.0;

                return RefreshIndicator(
                  color: context.brandAccentColor,
                  onRefresh: () async {
                    return ref.refresh(userDashboardProvider.future);
                  },
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 12.0,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // 1. Reference Hero Card (Inner Visual Banner + Progress & Circular Play Action)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: context.cardBgColor,
                            borderRadius: BorderRadius.circular(26),
                            border: Border.all(
                              color: context.borderColor.withValues(alpha: 0.7),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(
                                  alpha: isDark ? 0.3 : 0.06,
                                ),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Inner Rounded Hero Showcase Container
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(18),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      AppColors.primary,
                                      AppColors.secondary,
                                    ],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Stack(
                                  children: [
                                    Positioned(
                                      right: -18,
                                      top: -18,
                                      child: Container(
                                        width: 96,
                                        height: 96,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: Colors.white.withValues(
                                            alpha: 0.06,
                                          ),
                                        ),
                                      ),
                                    ),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    'Welcome back,',
                                                    style: AppTextStyles
                                                        .bodySmall
                                                        .copyWith(
                                                          color: Colors.white
                                                              .withValues(
                                                                alpha: 0.82,
                                                              ),
                                                        ),
                                                  ),
                                                  const SizedBox(height: 2),
                                                  Text(
                                                    user?.name ?? 'Candidate',
                                                    style: AppTextStyles
                                                        .displaySmall
                                                        .copyWith(
                                                          color: Colors.white,
                                                          fontSize: 21,
                                                          fontWeight:
                                                              FontWeight.w800,
                                                        ),
                                                    maxLines: 1,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                  ),
                                                ],
                                              ),
                                            ),
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 11,
                                                    vertical: 5,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: AppColors.accent,
                                                borderRadius:
                                                    BorderRadius.circular(20),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: Colors.black
                                                        .withValues(alpha: 0.2),
                                                    blurRadius: 8,
                                                    offset: const Offset(0, 3),
                                                  ),
                                                ],
                                              ),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  const Icon(
                                                    Icons
                                                        .local_fire_department_rounded,
                                                    size: 14,
                                                    color: Colors.white,
                                                  ),
                                                  const SizedBox(width: 4),
                                                  Text(
                                                    '${stats.streak}d Streak',
                                                    style: AppTextStyles
                                                        .labelBold
                                                        .copyWith(
                                                          color: Colors.white,
                                                          fontSize: 11,
                                                        ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 18),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 8,
                                          ),
                                          decoration: BoxDecoration(
                                            color: Colors.black.withValues(
                                              alpha: 0.18,
                                            ),
                                            borderRadius: BorderRadius.circular(
                                              14,
                                            ),
                                            border: Border.all(
                                              color: Colors.white.withValues(
                                                alpha: 0.12,
                                              ),
                                            ),
                                          ),
                                          child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Flexible(
                                                child: Text(
                                                  'Level ${stats.level} Developer · ${stats.xp} XP',
                                                  style: AppTextStyles.bodySmall
                                                      .copyWith(
                                                        color: Colors.white
                                                            .withValues(
                                                              alpha: 0.94,
                                                            ),
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Text(
                                                'Global Rank #${stats.rank}',
                                                style: AppTextStyles.bodySmall
                                                    .copyWith(
                                                      color:
                                                          AppColors.accentLight,
                                                      fontWeight:
                                                          FontWeight.w700,
                                                    ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 14),

                              // Bottom Hero Bar (Reference Mockup 1 Title + Thick Progress Pill + Circular Play Button)
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                  vertical: 2,
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Ready for your next challenge?',
                                            style: AppTextStyles.bodyMedium
                                                .copyWith(
                                                  fontWeight: FontWeight.w800,
                                                  fontSize: 14.5,
                                                ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            'Choose a technology track to test your mastery.',
                                            style: AppTextStyles.bodySmall
                                                .copyWith(
                                                  color: context
                                                      .textSecondaryColor,
                                                  fontSize: 11.5,
                                                ),
                                          ),
                                          const SizedBox(height: 10),
                                          // Thick Pill Progress Bar inspired by Reference Mockup 1 & 2
                                          Container(
                                            height: 18,
                                            width: double.infinity,
                                            decoration: BoxDecoration(
                                              color: isDark
                                                  ? AppColors.primary
                                                        .withValues(alpha: 0.45)
                                                  : AppColors.primary
                                                        .withValues(alpha: 0.14),
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                            child: Stack(
                                              children: [
                                                FractionallySizedBox(
                                                  widthFactor: progressFraction
                                                      .clamp(0.12, 1.0),
                                                  child: Container(
                                                    decoration: BoxDecoration(
                                                      gradient:
                                                          const LinearGradient(
                                                            colors: [
                                                              AppColors.accent,
                                                              Color(0xFFE0B15E),
                                                            ],
                                                          ),
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                            12,
                                                          ),
                                                    ),
                                                  ),
                                                ),
                                                Positioned.fill(
                                                  child: Padding(
                                                    padding:
                                                        const EdgeInsets.symmetric(
                                                          horizontal: 10,
                                                        ),
                                                    child: Align(
                                                      alignment:
                                                          Alignment.centerRight,
                                                      child: Text(
                                                        '${stats.averageScore}% Avg',
                                                        style: TextStyle(
                                                          fontSize: 10,
                                                          fontWeight:
                                                              FontWeight.w800,
                                                          color: isDark
                                                              ? Colors.white
                                                              : AppColors
                                                                    .primary,
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
                                    const SizedBox(width: 14),
                                    // Circular Play / Start Button (Reference Mockup 1 & 2)
                                    Semantics(
                                      button: true,
                                      label: 'Start',
                                      child: InkWell(
                                        onTap: () => context.go('/explore'),
                                        borderRadius: BorderRadius.circular(28),
                                        child: Container(
                                          width: 52,
                                          height: 52,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            gradient: const LinearGradient(
                                              colors: [
                                                AppColors.primary,
                                                AppColors.primaryLight,
                                              ],
                                              begin: Alignment.topLeft,
                                              end: Alignment.bottomRight,
                                            ),
                                            boxShadow: [
                                              BoxShadow(
                                                color: AppColors.primary
                                                    .withValues(alpha: 0.3),
                                                blurRadius: 12,
                                                offset: const Offset(0, 5),
                                              ),
                                            ],
                                          ),
                                          child: const Icon(
                                            Icons.play_arrow_rounded,
                                            color: Colors.white,
                                            size: 28,
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

                        const SizedBox(height: 22),

                        // 2. Statistics Grid (Reference Mockup 2 Achievements Card Style)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Your Performance',
                              style: AppTextStyles.displaySmall.copyWith(
                                fontSize: 16.5,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: context.mutedBgColor,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Text(
                                'Live Overview',
                                style: AppTextStyles.bodySmall.copyWith(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w700,
                                  color: context.textSecondaryColor,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          childAspectRatio: 1.55,
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

                        const SizedBox(height: 24),

                        // 3. Technology Track Progress (Reference Mockup 2 Levels Style)
                        if (techProgress.isNotEmpty) ...[
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Technology Progress',
                                style: AppTextStyles.displaySmall.copyWith(
                                  fontSize: 16.5,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              GestureDetector(
                                onTap: () => context.go('/explore'),
                                child: Text(
                                  'See All',
                                  style: AppTextStyles.labelBold.copyWith(
                                    fontSize: 12,
                                    color: context.brandAccentColor,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: techProgress.length,
                            separatorBuilder: (context, index) =>
                                const SizedBox(height: 10),
                            itemBuilder: (context, index) {
                              final tech = techProgress[index];
                              final isHighMastery = tech.bestScore >= 80;
                              return Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: context.cardBgColor,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: context.borderColor.withValues(
                                      alpha: 0.7,
                                    ),
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(
                                        alpha: isDark ? 0.22 : 0.04,
                                      ),
                                      blurRadius: 12,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        color: context.brandAccentColor
                                            .withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                      child: Center(
                                        child: Text(
                                          tech.category.isNotEmpty
                                              ? tech.category[0]
                                              : 'T',
                                          style: AppTextStyles.displaySmall
                                              .copyWith(
                                                color: context.brandAccentColor,
                                                fontSize: 17,
                                                fontWeight: FontWeight.w800,
                                              ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            tech.category,
                                            style: AppTextStyles.bodyMedium
                                                .copyWith(
                                                  fontWeight: FontWeight.w700,
                                                  fontSize: 13.5,
                                                ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            '${tech.attempts} attempt(s) · Pass rate: ${tech.passRate}%',
                                            style: AppTextStyles.bodySmall
                                                .copyWith(
                                                  fontSize: 11,
                                                  color: context
                                                      .textSecondaryColor,
                                                ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    // Reference Mockup 2 Pill Points/Score Badge
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 11,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: isHighMastery
                                            ? context.successBgColor
                                            : (isDark
                                                  ? AppColors.primaryLight
                                                  : AppColors.primary),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            Icons.stars_rounded,
                                            size: 13,
                                            color: isHighMastery
                                                ? context.successColor
                                                : AppColors.accent,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            'Best: ${tech.bestScore}%',
                                            style: AppTextStyles.labelBold
                                                .copyWith(
                                                  color: isHighMastery
                                                      ? context.successColor
                                                      : Colors.white,
                                                  fontSize: 11,
                                                ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 24),
                        ],

                        // 4. Leaderboard (Top 5)
                        _buildLeaderboardSection(context, ref, isDark),
                        const SizedBox(height: 24),

                        // 5. Recent Attempts
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Recent Sessions',
                              style: AppTextStyles.displaySmall.copyWith(
                                fontSize: 16.5,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            if (recentAttempts.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: context.mutedBgColor,
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: Text(
                                  '${recentAttempts.length} Total',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: context.textSecondaryColor,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        if (recentAttempts.isEmpty)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: context.cardBgColor,
                              borderRadius: BorderRadius.circular(22),
                              border: Border.all(
                                color: context.borderColor.withValues(
                                  alpha: 0.7,
                                ),
                              ),
                            ),
                            child: Column(
                              children: [
                                Container(
                                  width: 52,
                                  height: 52,
                                  decoration: BoxDecoration(
                                    color: context.mutedBgColor,
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Icon(
                                    Icons.quiz_outlined,
                                    size: 26,
                                    color: context.textSecondaryColor,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  'No quiz attempts yet',
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Take your first session to start building your profile.',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    fontSize: 11.5,
                                    color: context.textSecondaryColor,
                                  ),
                                  textAlign: TextAlign.center,
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
                                const SizedBox(height: 10),
                            itemBuilder: (context, index) {
                              final attempt = recentAttempts[index];
                              final isPassed = attempt.isPassed;

                              return Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: context.cardBgColor,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: context.borderColor.withValues(
                                      alpha: 0.7,
                                    ),
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(
                                        alpha: isDark ? 0.2 : 0.04,
                                      ),
                                      blurRadius: 12,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 42,
                                      height: 42,
                                      decoration: BoxDecoration(
                                        color: isPassed
                                            ? context.successBgColor
                                            : context.errorBgColor,
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                      child: Icon(
                                        isPassed
                                            ? Icons.check_circle_rounded
                                            : Icons.cancel_rounded,
                                        color: isPassed
                                            ? context.successColor
                                            : context.errorColor,
                                        size: 22,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            '${attempt.category} (Session ${attempt.session})',
                                            style: AppTextStyles.bodyMedium
                                                .copyWith(
                                                  fontWeight: FontWeight.w700,
                                                  fontSize: 13.5,
                                                ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            'Score: ${attempt.score}/${attempt.total} · ${DateFormatter.timeAgo(attempt.createdAt)}',
                                            style: AppTextStyles.bodySmall
                                                .copyWith(
                                                  fontSize: 11,
                                                  color: context
                                                      .textSecondaryColor,
                                                ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 11,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: isPassed
                                            ? context.successBgColor
                                            : context.errorBgColor,
                                        borderRadius: BorderRadius.circular(18),
                                      ),
                                      child: Text(
                                        '${attempt.percentage.round()}%',
                                        style: AppTextStyles.labelBold.copyWith(
                                          color: isPassed
                                              ? context.successColor
                                              : context.errorColor,
                                          fontSize: 12.5,
                                          fontWeight: FontWeight.w800,
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
                    ),
                  ),
                );
              },
            ),
          ),
          const BannerAdWidget(),
        ],
      ),
    );
  }

  Widget _buildLeaderboardSection(
    BuildContext context,
    WidgetRef ref,
    bool isDark,
  ) {
    final top5Async = ref.watch(top5LeaderboardProvider);
    final auth = ref.watch(authProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.emoji_events_rounded,
                  size: 20,
                  color: Color(0xFFD97706),
                ),
                const SizedBox(width: 8),
                Text(
                  'Leaderboard',
                  style: AppTextStyles.displaySmall.copyWith(
                    fontSize: 16.5,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFD97706).withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: const Color(0xFFD97706).withValues(alpha: 0.35),
                ),
              ),
              child: const Text(
                'Top 5 Standings',
                style: TextStyle(
                  color: Color(0xFFD97706),
                  fontSize: 10.5,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        top5Async.when(
          loading: () => Container(
            height: 100,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: context.cardBgColor,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: context.borderColor),
            ),
            child: const CircularProgressIndicator(strokeWidth: 2),
          ),
          error: (err, _) => Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: context.cardBgColor,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: context.borderColor),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.error_outline_rounded,
                  color: Colors.red,
                  size: 20,
                ),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Could not load leaderboard.',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
                TextButton(
                  onPressed: () => ref.refresh(top5LeaderboardProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
          data: (users) {
            if (users.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: context.cardBgColor,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: context.borderColor),
                ),
                child: const Center(
                  child: Text(
                    'No quiz completions yet. Take a quiz to rank #1!',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
              );
            }

            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: context.cardBgColor,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: context.borderColor.withValues(alpha: 0.7),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.24 : 0.05),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                children: [
                  ...users.take(5).map((entry) {
                    final rank = entry.rank;
                    final isGold = rank == 1;
                    final isSilver = rank == 2;
                    final isBronze = rank == 3;

                    final Color rankColor = isGold
                        ? const Color(0xFFF59E0B)
                        : isSilver
                        ? const Color(0xFF94A3B8)
                        : isBronze
                        ? const Color(0xFFB45309)
                        : context.textSecondaryColor;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: (isGold || isSilver || isBronze)
                            ? rankColor.withValues(alpha: isDark ? 0.12 : 0.08)
                            : context.mutedBgColor.withValues(alpha: 0.7),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: (isGold || isSilver || isBronze)
                              ? rankColor.withValues(alpha: 0.38)
                              : Colors.transparent,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 30,
                            height: 30,
                            decoration: BoxDecoration(
                              color: rankColor.withValues(alpha: 0.18),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: isGold
                                  ? const Icon(
                                      Icons.emoji_events_rounded,
                                      size: 16,
                                      color: Color(0xFFF59E0B),
                                    )
                                  : isSilver
                                  ? const Icon(
                                      Icons.military_tech_rounded,
                                      size: 16,
                                      color: Color(0xFF94A3B8),
                                    )
                                  : isBronze
                                  ? const Icon(
                                      Icons.stars_rounded,
                                      size: 16,
                                      color: Color(0xFFB45309),
                                    )
                                  : Text(
                                      '#$rank',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        color: rankColor,
                                      ),
                                    ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          CircleAvatar(
                            radius: 15,
                            backgroundColor: context.mutedBgColor,
                            backgroundImage:
                                entry.avatar.isNotEmpty &&
                                    entry.avatar.startsWith('http')
                                ? NetworkImage(entry.avatar)
                                : null,
                            child:
                                entry.avatar.isEmpty ||
                                    !entry.avatar.startsWith('http')
                                ? Text(
                                    entry.initials,
                                    style: TextStyle(
                                      color: context.brandAccentColor,
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  )
                                : null,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  entry.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12.5,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  entry.category,
                                  style: TextStyle(
                                    fontSize: 10.5,
                                    color: context.textSecondaryColor,
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
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? AppColors.primaryLight
                                  : AppColors.primary,
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.stars_rounded,
                                  size: 12,
                                  color: AppColors.accent,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${entry.xp} XP',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 11,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                      label: const Text(
                        'See More Standings',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark
                            ? AppColors.primaryLight
                            : AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(22),
                        ),
                      ),
                      onPressed: () {
                        if (auth.isAuthenticated) {
                          context.push('/leaderboard/full');
                        } else {
                          context.push('/login?redirect=/leaderboard/full');
                        }
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required BuildContext context,
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    final isDark = context.isDark;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: context.borderColor.withValues(alpha: 0.7),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.22 : 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(11),
                ),
                child: Icon(icon, size: 18, color: color),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  style: AppTextStyles.bodySmall.copyWith(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: context.textSecondaryColor,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          Text(
            value,
            style: AppTextStyles.displaySmall.copyWith(
              color: context.textPrimaryColor,
              fontWeight: FontWeight.w800,
              fontSize: 20,
            ),
          ),
        ],
      ),
    );
  }
}
