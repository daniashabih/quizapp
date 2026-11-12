import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/app_config.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/theme_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  String _themeModeLabel(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'Light Mode';
      case ThemeMode.dark:
        return 'Dark Mode';
      case ThemeMode.system:
        return 'System Default';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final dashboardAsync = ref.watch(userDashboardProvider);
    final themeMode = ref.watch(themeModeProvider);
    final isAdmin = user?.isAdmin ?? false;
    final isDark = context.isDarkMode;

    return Scaffold(
      backgroundColor: context.scaffoldBgColor,
      appBar: AppBar(
        titleSpacing: 16,
        title: const Text('My Profile'),
        actions: [
          Container(
            width: 36,
            height: 36,
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: context.cardBgColor,
              shape: BoxShape.circle,
              border: Border.all(color: context.borderColor),
            ),
            child: IconButton(
              padding: EdgeInsets.zero,
              icon: const Icon(Icons.settings_outlined, size: 18),
              tooltip: 'Settings',
              onPressed: () => context.push('/settings'),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Profile Header Banner Card
            Container(
              width: double.infinity,
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.secondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(26),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(
                      alpha: isDark ? 0.38 : 0.22,
                    ),
                    blurRadius: 18,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  Positioned(
                    right: -20,
                    top: -20,
                    child: Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.06),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // Circular Avatar with Gold Ring
                        Container(
                          width: 64,
                          height: 64,
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withValues(alpha: 0.2),
                            border: Border.all(
                              color: AppColors.accent,
                              width: 2.2,
                            ),
                          ),
                          child: Container(
                            decoration: BoxDecoration(
                              color: context.cardBgColor,
                              shape: BoxShape.circle,
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              user?.name.isNotEmpty == true
                                  ? user!.name[0].toUpperCase()
                                  : 'U',
                              style: AppTextStyles.displaySmall.copyWith(
                                color: isDark
                                    ? AppColors.accent
                                    : AppColors.primary,
                                fontWeight: FontWeight.w900,
                                fontSize: 25,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),

                        // Name, Email & Role
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Expanded(
                                    child: Text(
                                      user?.name ?? 'User',
                                      style: AppTextStyles.displaySmall.copyWith(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w800,
                                        color: Colors.white,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (dashboardAsync.asData?.value != null) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 3,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.accent.withValues(
                                          alpha: 0.22,
                                        ),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(
                                          color: AppColors.accent.withValues(
                                            alpha: 0.55,
                                          ),
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(
                                            Icons.stars_rounded,
                                            size: 12,
                                            color: AppColors.accentLight,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            'Lv. ${dashboardAsync.asData!.value.stats.level}',
                                            style: AppTextStyles.mono.copyWith(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w800,
                                              color: AppColors.accentLight,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                user?.email ?? '',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: Colors.white.withValues(alpha: 0.82),
                                  fontSize: 12,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 3.5,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.22),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: AppColors.accent.withValues(
                                      alpha: 0.55,
                                    ),
                                  ),
                                ),
                                child: Text(
                                  isAdmin
                                      ? 'ADMINISTRATOR'
                                      : 'CERTIFIED LEARNER',
                                  style: AppTextStyles.mono.copyWith(
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.6,
                                    color: AppColors.accentLight,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // 2. Full-Width Segmented Quick Navigation Bar
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: context.cardBgColor,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: context.borderColor.withValues(alpha: 0.75),
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
                  Expanded(
                    child: _buildQuickTabChip(
                      context: context,
                      label: 'About Me',
                      isSelected: true,
                      onTap: () {},
                    ),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: _buildQuickTabChip(
                      context: context,
                      label: 'Achievements',
                      isSelected: false,
                      onTap: () => context.push('/certificates'),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: _buildQuickTabChip(
                      context: context,
                      label: 'My Games',
                      isSelected: false,
                      onTap: () => context.go('/games'),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: _buildQuickTabChip(
                      context: context,
                      label: 'Settings',
                      isSelected: false,
                      onTap: () => context.push('/settings'),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 3. Reference Mockup 3 Achievement / Performance Card with Mini Badge Tiles
            dashboardAsync.when(
              data: (data) {
                final pct = (data.averageScore.clamp(0, 100)) / 100.0;
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: context.cardBgColor,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: context.borderColor.withValues(alpha: 0.75),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(
                          alpha: isDark ? 0.24 : 0.05,
                        ),
                        blurRadius: 16,
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
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Performance & Milestones',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                'Level ${data.stats.level} · Global Rank #${data.stats.rank}',
                                style: AppTextStyles.bodySmall.copyWith(
                                  fontSize: 11,
                                  color: context.textSecondaryColor,
                                ),
                              ),
                            ],
                          ),
                          // Mini Progress Bar Pill (Reference Mockup 3 Top-Right)
                          Container(
                            width: 58,
                            height: 10,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.16),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: pct.clamp(0.18, 1.0),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: AppColors.accent,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: _buildMiniStat(
                              context,
                              'Quizzes',
                              '${data.totalQuizzesTaken}',
                              Icons.assignment_turned_in_rounded,
                              AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildMiniStat(
                              context,
                              'Certificates',
                              '${data.certificatesCount}',
                              Icons.workspace_premium_rounded,
                              AppColors.accent,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildMiniStat(
                              context,
                              'Avg Score',
                              '${data.averageScore.toStringAsFixed(0)}%',
                              Icons.verified_rounded,
                              AppColors.secondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (err, stack) => const SizedBox.shrink(),
            ),

            const SizedBox(height: 22),

            // 4. Menu Items
            _buildMenuSection(
              context: context,
              title: 'Learning & Credentials',
              items: [
                _MenuItem(
                  icon: Icons.workspace_premium_rounded,
                  title: 'My Certificates',
                  subtitle: 'View, verify, and share your credentials',
                  onTap: () => context.push('/certificates'),
                ),
                _MenuItem(
                  icon: Icons.explore_rounded,
                  title: 'Explore Tech Categories',
                  subtitle: 'Frontend, Backend, DevOps, and more',
                  onTap: () => context.go('/explore'),
                ),
              ],
            ),

            if (isAdmin) ...[
              const SizedBox(height: 16),
              _buildMenuSection(
                context: context,
                title: 'Administration',
                items: [
                  _MenuItem(
                    icon: Icons.admin_panel_settings_rounded,
                    title: 'Admin Control Center',
                    subtitle:
                        'Manage questions, categories, users, and AI generation',
                    iconColor: context.brandAccentColor,
                    onTap: () => context.push('/admin'),
                  ),
                ],
              ),
            ],

            const SizedBox(height: 16),
            _buildMenuSection(
              context: context,
              title: 'Account & Support',
              items: [
                _MenuItem(
                  icon: Icons.settings_rounded,
                  title: 'Settings & Theme',
                  subtitle:
                      'Theme (${_themeModeLabel(themeMode)}), notifications, account security',
                  onTap: () => context.push('/settings'),
                ),
                _MenuItem(
                  icon: Icons.privacy_tip_outlined,
                  title: 'Privacy Policy',
                  subtitle: 'Google Play verified data safety disclosure',
                  onTap: () => context.push('/legal/privacy'),
                ),
                _MenuItem(
                  icon: Icons.description_outlined,
                  title: 'Terms of Service',
                  subtitle: 'Terms of use and certification guidelines',
                  onTap: () => context.push('/legal/terms'),
                ),
              ],
            ),

            const SizedBox(height: 22),

            // Sign Out Button
            Container(
              decoration: BoxDecoration(
                color: context.errorColor.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: context.errorColor.withValues(alpha: 0.32),
                ),
              ),
              child: ListTile(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(22),
                ),
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: context.errorColor.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.logout_rounded,
                    color: context.errorColor,
                    size: 20,
                  ),
                ),
                title: Text(
                  'Sign Out',
                  style: AppTextStyles.labelBold.copyWith(
                    color: context.errorColor,
                  ),
                ),
                trailing: Icon(
                  Icons.chevron_right_rounded,
                  color: context.errorColor,
                ),
                onTap: () => _confirmSignOut(context, ref),
              ),
            ),

            const SizedBox(height: 22),
            Center(
              child: Image.asset(
                context.brandCompactLogoAsset,
                height: 24,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${AppConfig.appName} v${AppConfig.appVersion} (Build ${AppConfig.appBuildNumber}) • Production',
              textAlign: TextAlign.center,
              style: AppTextStyles.bodySmall.copyWith(
                color: context.textMutedColor,
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickTabChip({
    required BuildContext context,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final isDark = context.isDark;
    return Material(
      color: isSelected
          ? (isDark ? AppColors.primaryLight : AppColors.primary)
          : Colors.transparent,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 9),
          alignment: Alignment.center,
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              label,
              maxLines: 1,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? Colors.white : context.textSecondaryColor,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMiniStat(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color tint,
  ) {
    final isDark = context.isDark;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: isDark ? context.mutedBgColor : tint.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: tint.withValues(alpha: isDark ? 0.3 : 0.18),
        ),
      ),
      child: Column(
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: tint.withValues(alpha: 0.16),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              size: 16,
              color: isDark && tint == AppColors.primary
                  ? AppColors.accentLight
                  : tint,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTextStyles.displaySmall.copyWith(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: context.textPrimaryColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTextStyles.bodySmall.copyWith(
              fontSize: 10.5,
              fontWeight: FontWeight.w600,
              color: context.textSecondaryColor,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildMenuSection({
    required BuildContext context,
    required String title,
    required List<_MenuItem> items,
  }) {
    final defaultIconColor = context.brandAccentColor;
    final isDark = context.isDark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            title.toUpperCase(),
            style: AppTextStyles.mono.copyWith(
              fontSize: 11,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w700,
              color: context.textSecondaryColor,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: context.cardBgColor,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: context.borderColor.withValues(alpha: 0.75),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.22 : 0.04),
                blurRadius: 14,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            children: items.asMap().entries.map((entry) {
              final idx = entry.key;
              final item = entry.value;
              final effectiveIconColor = item.iconColor ?? defaultIconColor;
              return Column(
                children: [
                  ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 4,
                    ),
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: effectiveIconColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(13),
                      ),
                      child: Icon(
                        item.icon,
                        color: effectiveIconColor,
                        size: 20,
                      ),
                    ),
                    title: Text(
                      item.title,
                      style: AppTextStyles.labelBold.copyWith(
                        color: context.textPrimaryColor,
                        fontSize: 13.5,
                      ),
                    ),
                    subtitle: Text(
                      item.subtitle,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: context.textSecondaryColor,
                        fontSize: 11.5,
                      ),
                    ),
                    trailing: Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: context.mutedBgColor,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.chevron_right_rounded,
                        size: 18,
                        color: context.textMutedColor,
                      ),
                    ),
                    onTap: item.onTap,
                  ),
                  if (idx < items.length - 1)
                    const Divider(height: 1, indent: 64),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  void _confirmSignOut(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Sign Out'),
        content: Text(
          'Are you sure you want to sign out of ${AppConfig.appName}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: context.errorColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
            onPressed: () async {
              Navigator.of(ctx).pop();
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final Color? iconColor;

  const _MenuItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.iconColor,
  });
}
