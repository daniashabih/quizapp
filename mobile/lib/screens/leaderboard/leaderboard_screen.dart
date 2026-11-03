import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../models/dashboard_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/app_button.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_state_widget.dart';
import '../../widgets/loading_state_widget.dart';

class LeaderboardScreen extends ConsumerWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final top5Async = ref.watch(top5LeaderboardProvider);
    final authState = ref.watch(authProvider);
    final isAuth = authState.isAuthenticated;
    final isDark = context.isDarkMode;

    return Scaffold(
      backgroundColor: context.scaffoldBgColor,
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.emoji_events_rounded,
              color: Color(0xFFD97706),
              size: 22,
            ),
            const SizedBox(width: 8),
            Text(
              'Leaderboard',
              style: AppTextStyles.displaySmall.copyWith(fontSize: 18),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            icon: Icon(
              isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
              size: 20,
              color: context.textSecondaryColor,
            ),
            onPressed: () {
              ref
                  .read(themeModeProvider.notifier)
                  .toggleTheme(MediaQuery.platformBrightnessOf(context));
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, size: 20),
            onPressed: () => ref.refresh(top5LeaderboardProvider),
            tooltip: 'Refresh Rankings',
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: top5Async.when(
        loading: () =>
            const LoadingStateWidget(message: 'Loading live top 5 rankings...'),
        error: (err, _) => ErrorStateWidget(
          message: err.toString(),
          onRetry: () => ref.refresh(top5LeaderboardProvider),
        ),
        data: (users) {
          if (users.isEmpty) {
            return RefreshIndicator(
              color: context.brandAccentColor,
              onRefresh: () async => ref.refresh(top5LeaderboardProvider.future),
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 80),
                  EmptyStateWidget(
                    title: 'No Rankings Yet',
                    subtitle:
                        'Be the first developer to complete a quiz and claim the #1 spot on the leaderboard!',
                    icon: Icons.emoji_events_outlined,
                  ),
                ],
              ),
            );
          }

          final top3 = users.take(3).toList();
          final ranks4And5 = users.length > 3 ? users.sublist(3) : <LeaderboardEntryModel>[];

          return RefreshIndicator(
            color: context.brandAccentColor,
            onRefresh: () async => ref.refresh(top5LeaderboardProvider.future),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Banner Header
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: isDark
                            ? [const Color(0xFF161B22), const Color(0xFF1E2633)]
                            : [AppColors.primary, AppColors.secondary],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(
                            alpha: isDark ? 0.35 : 0.15,
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
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFD97706),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.military_tech_rounded,
                                    size: 14,
                                    color: Colors.white,
                                  ),
                                  SizedBox(width: 4),
                                  Text(
                                    'Top 5 Standings',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              'Live from MongoDB',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.8),
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Top 5 Performers',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Live scores and XP ranked from completed quizzes and verified accuracy.',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.85),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Top 3 Visual Highlights Section (Gold, Silver, Bronze)
                  Text(
                    'Podium Highlights',
                    style: AppTextStyles.displaySmall.copyWith(fontSize: 16),
                  ),
                  const SizedBox(height: 10),

                  ...top3.map((entry) => _buildPodiumHighlightCard(context, entry, isDark)),

                  // Ranks 4 and 5 Section
                  if (ranks4And5.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Text(
                      'Rankings 4 & 5',
                      style: AppTextStyles.displaySmall.copyWith(fontSize: 15),
                    ),
                    const SizedBox(height: 8),
                    ...ranks4And5.map((entry) => _buildRankRowCard(context, entry, isDark)),
                  ],

                  const SizedBox(height: 24),

                  // See More Button Card
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: context.cardBgColor,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: context.borderColor),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(
                            alpha: isDark ? 0.2 : 0.05,
                          ),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: isDark
                                    ? AppColors.primaryLight.withValues(alpha: 0.2)
                                    : AppColors.accentLight,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.workspace_premium_rounded,
                                color: isDark
                                    ? AppColors.accentLight
                                    : AppColors.primary,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Explore Full Leaderboard',
                                    style: AppTextStyles.bodyMedium.copyWith(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    isAuth
                                        ? 'View all ranked developers, filters & pagination.'
                                        : 'Sign in to access all ranked developers worldwide.',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: context.textSecondaryColor,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        AppButton(
                          text: 'See More Rankings',
                          icon: Icons.arrow_forward_rounded,
                          onPressed: () {
                            if (!isAuth) {
                              // Requirement 3: Redirect unauthenticated visitor to login
                              // Preserving intended destination /leaderboard/full
                              context.push('/login?redirect=/leaderboard/full');
                            } else {
                              // Requirement 3: Open full leaderboard directly for logged-in user
                              context.push('/leaderboard/full');
                            }
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // Visual Highlight for Top 3 (Gold, Silver, Bronze)
  Widget _buildPodiumHighlightCard(
    BuildContext context,
    LeaderboardEntryModel entry,
    bool isDark,
  ) {
    final rank = entry.rank;
    final isGold = rank == 1;
    final isSilver = rank == 2;

    Color badgeColor;
    Color borderColor;
    String rankTitle;
    IconData medalIcon;

    if (isGold) {
      badgeColor = const Color(0xFFF59E0B);
      borderColor = isDark ? const Color(0xFFD97706) : const Color(0xFFF59E0B);
      rankTitle = 'Gold Champion';
      medalIcon = Icons.emoji_events_rounded;
    } else if (isSilver) {
      badgeColor = const Color(0xFF94A3B8);
      borderColor = isDark ? const Color(0xFF64748B) : const Color(0xFFCBD5E1);
      rankTitle = 'Silver Runner-Up';
      medalIcon = Icons.military_tech_rounded;
    } else {
      badgeColor = const Color(0xFFB45309);
      borderColor = isDark ? const Color(0xFF92400E) : const Color(0xFFD97706).withValues(alpha: 0.5);
      rankTitle = 'Bronze Podium';
      medalIcon = Icons.stars_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: isGold ? 1.8 : 1.2),
        boxShadow: [
          BoxShadow(
            color: badgeColor.withValues(alpha: isDark ? 0.25 : 0.12),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Rank Badge
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: badgeColor.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: badgeColor, width: 1.5),
            ),
            child: Center(
              child: Icon(
                medalIcon,
                color: badgeColor,
                size: 24,
              ),
            ),
          ),
          const SizedBox(width: 12),

          // User Info & Rank Label
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      '#$rank $rankTitle',
                      style: TextStyle(
                        color: badgeColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: context.mutedBgColor,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        entry.category,
                        style: TextStyle(
                          color: context.textSecondaryColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  entry.name,
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '${entry.quizzes} quiz${entry.quizzes == 1 ? '' : 'zes'} · ${entry.score.toStringAsFixed(0)}% avg · ${entry.streak} streak',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: context.textSecondaryColor,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),

          // Total Points / XP Pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: isDark
                  ? const Color(0xFF065F46).withValues(alpha: 0.3)
                  : const Color(0xFFE3EFEA),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: isDark
                    ? const Color(0xFF10B981).withValues(alpha: 0.3)
                    : const Color(0xFF285A4D).withValues(alpha: 0.2),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.bolt_rounded,
                  size: 14,
                  color: Color(0xFF10B981),
                ),
                const SizedBox(width: 2),
                Text(
                  '${entry.xp}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: Color(0xFF10B981),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Row Card for Ranks 4 and 5
  Widget _buildRankRowCard(
    BuildContext context,
    LeaderboardEntryModel entry,
    bool isDark,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.borderColor),
      ),
      child: Row(
        children: [
          // Rank Number
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: context.mutedBgColor,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: context.borderColor),
            ),
            child: Center(
              child: Text(
                '#${entry.rank}',
                style: TextStyle(
                  color: context.textSecondaryColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Avatar / Initials
          CircleAvatar(
            radius: 17,
            backgroundColor: context.mutedBgColor,
            backgroundImage: entry.avatar.isNotEmpty && entry.avatar.startsWith('http')
                ? NetworkImage(entry.avatar)
                : null,
            child: entry.avatar.isEmpty || !entry.avatar.startsWith('http')
                ? Text(
                    entry.initials,
                    style: TextStyle(
                      color: context.brandAccentColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 10),

          // Name and Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.name,
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${entry.category} · ${entry.quizzes} quiz${entry.quizzes == 1 ? '' : 'zes'}',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: context.textSecondaryColor,
                    fontSize: 11,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),

          // Points
          Text(
            '${entry.xp} XP',
            style: AppTextStyles.bodySmall.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 12,
              color: isDark ? const Color(0xFF6EE7B7) : AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}
