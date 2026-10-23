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

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            tooltip: 'Settings',
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          children: [
            // User Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: context.cardBgColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: context.borderColor),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(
                      alpha: context.isDarkMode ? 0.25 : 0.04,
                    ),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Avatar
                  Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.primary, AppColors.accent],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      user?.name.isNotEmpty == true
                          ? user!.name[0].toUpperCase()
                          : 'U',
                      style: AppTextStyles.displaySmall.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 32,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Name
                  Text(
                    user?.name ?? 'User',
                    style: AppTextStyles.displaySmall.copyWith(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: context.textPrimaryColor,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Email
                  Text(
                    user?.email ?? '',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: context.textSecondaryColor,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Role Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: isAdmin
                          ? context.brandAccentColor.withValues(alpha: 0.14)
                          : AppColors.accent.withValues(alpha: 0.16),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isAdmin
                            ? context.brandAccentColor
                            : AppColors.accent,
                        width: 1,
                      ),
                    ),
                    child: Text(
                      isAdmin ? 'ADMINISTRATOR' : 'CERTIFIED LEARNER',
                      style: AppTextStyles.mono.copyWith(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isAdmin
                            ? context.brandAccentColor
                            : (context.isDarkMode
                                ? AppColors.accentLight
                                : AppColors.primaryDark),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Performance Overview
            dashboardAsync.when(
              data: (data) => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: context.mutedBgColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: context.borderColor),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildMiniStat(
                      context,
                      'Quizzes',
                      '${data.totalQuizzesTaken}',
                    ),
                    Container(width: 1, height: 32, color: context.borderColor),
                    _buildMiniStat(
                      context,
                      'Certificates',
                      '${data.certificatesCount}',
                    ),
                    Container(width: 1, height: 32, color: context.borderColor),
                    _buildMiniStat(
                      context,
                      'Avg Score',
                      '${data.averageScore.toStringAsFixed(0)}%',
                    ),
                  ],
                ),
              ),
              loading: () => const SizedBox.shrink(),
              error: (err, stack) => const SizedBox.shrink(),
            ),

            const SizedBox(height: 24),

            // Menu Items
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

            const SizedBox(height: 24),

            // Sign Out Button
            ListTile(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(
                  color: context.errorColor.withValues(alpha: 0.35),
                ),
              ),
              tileColor: context.errorColor.withValues(alpha: 0.08),
              leading: Icon(Icons.logout_rounded, color: context.errorColor),
              title: Text(
                'Sign Out',
                style: AppTextStyles.labelBold.copyWith(
                  color: context.errorColor,
                ),
              ),
              onTap: () => _confirmSignOut(context, ref),
            ),

            const SizedBox(height: 20),
            Image.asset(
              context.brandCompactLogoAsset,
              height: 24,
              fit: BoxFit.contain,
            ),
            const SizedBox(height: 8),
            Text(
              '${AppConfig.appName} v${AppConfig.appVersion} (Build ${AppConfig.appBuildNumber}) • Production',
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

  Widget _buildMiniStat(BuildContext context, String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: AppTextStyles.displaySmall.copyWith(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: context.brandAccentColor,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: AppTextStyles.bodySmall.copyWith(
            fontSize: 11,
            color: context.textSecondaryColor,
          ),
        ),
      ],
    );
  }

  Widget _buildMenuSection({
    required BuildContext context,
    required String title,
    required List<_MenuItem> items,
  }) {
    final defaultIconColor = context.brandAccentColor;

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
              fontWeight: FontWeight.w600,
              color: context.textSecondaryColor,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: context.cardBgColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: context.borderColor),
          ),
          child: Column(
            children: items.asMap().entries.map((entry) {
              final idx = entry.key;
              final item = entry.value;
              final effectiveIconColor = item.iconColor ?? defaultIconColor;
              return Column(
                children: [
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: effectiveIconColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
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
                      ),
                    ),
                    subtitle: Text(
                      item.subtitle,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: context.textSecondaryColor,
                      ),
                    ),
                    trailing: Icon(
                      Icons.chevron_right_rounded,
                      color: context.textMutedColor,
                    ),
                    onTap: item.onTap,
                  ),
                  if (idx < items.length - 1)
                    const Divider(height: 1, indent: 60),
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
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
