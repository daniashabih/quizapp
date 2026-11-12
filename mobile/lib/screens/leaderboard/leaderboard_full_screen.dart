import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../models/dashboard_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_state_widget.dart';
import '../../widgets/loading_state_widget.dart';

class LeaderboardFullScreen extends ConsumerStatefulWidget {
  const LeaderboardFullScreen({super.key});

  @override
  ConsumerState<LeaderboardFullScreen> createState() => _LeaderboardFullScreenState();
}

class _LeaderboardFullScreenState extends ConsumerState<LeaderboardFullScreen> {
  String _timeframe = 'all-time';
  String _selectedCategory = 'All';
  final _searchController = TextEditingController();
  String _searchQuery = '';
  int _displayedCount = 10;
  final int _pageSize = 10;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _resetPagination() {
    setState(() {
      _displayedCount = 10;
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = context.isDarkMode;

    // Requirement 3: If not authenticated, redirect to login
    if (!authState.isAuthenticated && authState.isInitialized) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/login?redirect=/leaderboard/full');
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final filter = LeaderboardFilter(
      timeframe: _timeframe,
      category: _selectedCategory,
    );
    final leaderboardAsync = ref.watch(leaderboardProvider(filter));

    return Scaffold(
      backgroundColor: context.scaffoldBgColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          tooltip: 'Return to Top 5 Leaderboard',
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/leaderboard');
            }
          },
        ),
        title: Text(
          'All Standings',
          style: AppTextStyles.displaySmall.copyWith(fontSize: 18),
        ),
        actions: [
          // Show Less Button in AppBar
          TextButton.icon(
            icon: const Icon(Icons.expand_less_rounded, size: 18),
            label: const Text(
              'Show Less',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
            style: TextButton.styleFrom(
              foregroundColor: context.brandAccentColor,
            ),
            onPressed: () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go('/leaderboard');
              }
            },
          ),
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
            onPressed: () => ref.refresh(leaderboardProvider(filter)),
            tooltip: 'Refresh Rankings',
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          // Filter Controls Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: context.cardBgColor,
              border: Border(bottom: BorderSide(color: context.borderColor)),
            ),
            child: Column(
              children: [
                // Search Field
                AppTextField(
                  hint: 'Search user or tech track...',
                  controller: _searchController,
                  prefixIcon: Icon(
                    Icons.search_rounded,
                    size: 18,
                    color: context.textSecondaryColor,
                  ),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                            _resetPagination();
                          },
                        )
                      : null,
                  onChanged: (val) {
                    setState(() => _searchQuery = val.trim());
                    _resetPagination();
                  },
                ),
                const SizedBox(height: 8),

                // Timeframe & Category Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildTimeframeChip('all-time', 'All-Time'),
                      const SizedBox(width: 8),
                      _buildTimeframeChip('monthly', 'This Month'),
                      const SizedBox(width: 8),
                      _buildTimeframeChip('weekly', 'This Week'),
                      const SizedBox(width: 12),
                      Container(
                        height: 20,
                        width: 1,
                        color: context.borderColor,
                      ),
                      const SizedBox(width: 12),
                      _buildCategoryChip('All', 'All Tech'),
                      const SizedBox(width: 8),
                      _buildCategoryChip('Dart', 'Dart'),
                      const SizedBox(width: 8),
                      _buildCategoryChip('React', 'React'),
                      const SizedBox(width: 8),
                      _buildCategoryChip('JavaScript', 'JavaScript'),
                      const SizedBox(width: 8),
                      _buildCategoryChip('Node.js', 'Node.js'),
                      const SizedBox(width: 8),
                      _buildCategoryChip('SQL Server', 'SQL Server'),
                      const SizedBox(width: 8),
                      _buildCategoryChip('Python', 'Python'),
                      const SizedBox(width: 8),
                      _buildCategoryChip('PHP', 'PHP'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Main Rankings List
          Expanded(
            child: leaderboardAsync.when(
              loading: () =>
                  const LoadingStateWidget(message: 'Loading full leaderboard...'),
              error: (err, _) => ErrorStateWidget(
                message: err.toString(),
                onRetry: () => ref.refresh(leaderboardProvider(filter)),
              ),
              data: (allUsers) {
                // Apply search filter locally
                final filtered = allUsers.where((u) {
                  if (_searchQuery.isEmpty) return true;
                  final q = _searchQuery.toLowerCase();
                  return u.name.toLowerCase().contains(q) ||
                      u.category.toLowerCase().contains(q);
                }).toList();

                if (filtered.isEmpty) {
                  return RefreshIndicator(
                    color: context.brandAccentColor,
                    onRefresh: () async =>
                        ref.refresh(leaderboardProvider(filter).future),
                    child: ListView(
                      children: const [
                        SizedBox(height: 80),
                        EmptyStateWidget(
                          title: 'No Matching Rankings',
                          subtitle:
                              'No participants matched your search criteria. Try a different technology or clear search.',
                          icon: Icons.search_off_rounded,
                        ),
                      ],
                    ),
                  );
                }

                // Apply pagination / lazy loading
                final currentItems = filtered.take(_displayedCount).toList();
                final hasMore = filtered.length > _displayedCount;

                return RefreshIndicator(
                  color: context.brandAccentColor,
                  onRefresh: () async =>
                      ref.refresh(leaderboardProvider(filter).future),
                  child: ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 12.0,
                    ),
                    itemCount: currentItems.length + 1, // +1 for pagination / footer
                    itemBuilder: (context, index) {
                      if (index < currentItems.length) {
                        final entry = currentItems[index];
                        return _buildUserCard(context, entry, isDark);
                      }

                      // Pagination / Load More Footer
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16.0),
                        child: Column(
                          children: [
                            if (hasMore) ...[
                              Text(
                                'Showing ${currentItems.length} of ${filtered.length} ranked developers',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: context.textSecondaryColor,
                                  fontSize: 11,
                                ),
                              ),
                              const SizedBox(height: 10),
                              OutlinedButton.icon(
                                icon: const Icon(Icons.arrow_downward_rounded, size: 16),
                                label: Text(
                                  'Load More (+${_pageSize.clamp(0, filtered.length - _displayedCount)})',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: context.brandAccentColor,
                                  side: BorderSide(color: context.borderColor),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 20,
                                    vertical: 10,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed: () {
                                  setState(() {
                                    _displayedCount += _pageSize;
                                  });
                                },
                              ),
                            ] else ...[
                              Text(
                                'End of leaderboard (${filtered.length} total ranked)',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: context.textSecondaryColor,
                                  fontSize: 11,
                                ),
                              ),
                            ],

                            const SizedBox(height: 14),

                            // Return to Top 5 Button
                            TextButton.icon(
                              icon: const Icon(Icons.arrow_back_rounded, size: 16),
                              label: const Text('Show Less (Back to Top 5)'),
                              style: TextButton.styleFrom(
                                foregroundColor: context.textSecondaryColor,
                              ),
                              onPressed: () {
                                if (context.canPop()) {
                                  context.pop();
                                } else {
                                  context.go('/leaderboard');
                                }
                              },
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeframeChip(String value, String label) {
    final isSelected = _timeframe == value;
    final isDark = context.isDarkMode;

    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() => _timeframe = value);
          _resetPagination();
        }
      },
      selectedColor: isDark ? AppColors.primaryLight : AppColors.primary,
      backgroundColor: context.mutedBgColor,
      labelStyle: TextStyle(
        fontSize: 11,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
        color: isSelected ? Colors.white : context.textPrimaryColor,
      ),
      side: BorderSide(
        color: isSelected ? Colors.transparent : context.borderColor,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    );
  }

  Widget _buildCategoryChip(String value, String label) {
    final isSelected = _selectedCategory == value;
    final isDark = context.isDarkMode;

    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() => _selectedCategory = value);
          _resetPagination();
        }
      },
      selectedColor: isDark ? const Color(0xFF047857) : AppColors.secondary,
      backgroundColor: context.mutedBgColor,
      labelStyle: TextStyle(
        fontSize: 11,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
        color: isSelected ? Colors.white : context.textPrimaryColor,
      ),
      side: BorderSide(
        color: isSelected ? Colors.transparent : context.borderColor,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    );
  }

  Widget _buildUserCard(
    BuildContext context,
    LeaderboardEntryModel entry,
    bool isDark,
  ) {
    final rank = entry.rank;
    final isGold = rank == 1;
    final isSilver = rank == 2;
    final isBronze = rank == 3;

    Color? badgeColor;
    Color? borderColor;

    if (isGold) {
      badgeColor = const Color(0xFFF59E0B);
      borderColor = const Color(0xFFF59E0B);
    } else if (isSilver) {
      badgeColor = const Color(0xFF94A3B8);
      borderColor = isDark ? const Color(0xFF64748B) : const Color(0xFFCBD5E1);
    } else if (isBronze) {
      badgeColor = const Color(0xFFB45309);
      borderColor = const Color(0xFFD97706).withValues(alpha: 0.6);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: borderColor ?? context.borderColor.withValues(alpha: 0.75),
          width: (isGold || isSilver || isBronze) ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: (isGold || isSilver || isBronze)
                ? badgeColor!.withValues(alpha: isDark ? 0.2 : 0.08)
                : Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Rank Badge
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: badgeColor != null
                  ? badgeColor.withValues(alpha: 0.18)
                  : context.mutedBgColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: badgeColor ?? context.borderColor,
                width: badgeColor != null ? 1.5 : 1.0,
              ),
            ),
            child: Center(
              child: isGold
                  ? const Icon(Icons.emoji_events_rounded, color: Color(0xFFF59E0B), size: 18)
                  : isSilver
                      ? const Icon(Icons.military_tech_rounded, color: Color(0xFF94A3B8), size: 18)
                      : isBronze
                          ? const Icon(Icons.stars_rounded, color: Color(0xFFB45309), size: 18)
                          : Text(
                              '#$rank',
                              style: TextStyle(
                                color: context.textSecondaryColor,
                                fontWeight: FontWeight.w800,
                                fontSize: 12,
                              ),
                            ),
            ),
          ),
          const SizedBox(width: 12),

          // Avatar
          CircleAvatar(
            radius: 18,
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
                      fontWeight: FontWeight.w800,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 10),

          // User info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        entry.name,
                        style: AppTextStyles.bodyMedium.copyWith(
                          fontWeight: FontWeight.w800,
                          fontSize: 13.5,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (isGold || isSilver || isBronze) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: badgeColor!.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          isGold ? 'GOLD' : isSilver ? 'SILVER' : 'BRONZE',
                          style: TextStyle(
                            color: badgeColor,
                            fontWeight: FontWeight.w800,
                            fontSize: 9,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  '${entry.category} · ${entry.quizzes} quiz${entry.quizzes == 1 ? '' : 'zes'} · ${entry.score.toStringAsFixed(0)}% avg',
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
          const SizedBox(width: 8),

          // Reference Mockup 2 Pill XP Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: isDark ? AppColors.primaryLight : AppColors.primary,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.stars_rounded,
                  size: 13,
                  color: AppColors.accent,
                ),
                const SizedBox(width: 4),
                Text(
                  '${entry.xp}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
