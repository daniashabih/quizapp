import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/app_config.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/app_button.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _pushNotifications = true;
  bool _quizReminders = true;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final currentThemeMode = ref.watch(themeModeProvider);
    final isDark = context.isDarkMode;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Appearance & Theme Section
            _buildSectionHeader('Appearance & Theme'),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: context.cardBgColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: context.borderColor),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Interface Theme',
                        style: AppTextStyles.labelBold.copyWith(
                          fontSize: 13,
                          color: context.textPrimaryColor,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: context.mutedBgColor,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: context.borderColor),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isDark
                                  ? Icons.dark_mode_rounded
                                  : Icons.light_mode_rounded,
                              size: 13,
                              color: context.brandAccentColor,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              isDark ? 'Dark Active' : 'Light Active',
                              style: AppTextStyles.mono.copyWith(
                                fontSize: 10,
                                color: context.brandAccentColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Choose how Hangbug looks on your device. Changes apply immediately and persist across restarts.',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: context.textSecondaryColor,
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildThemeOptionTile(
                    mode: ThemeMode.light,
                    selectedMode: currentThemeMode,
                    icon: Icons.light_mode_rounded,
                    title: 'Light Mode',
                    subtitle: 'Clean warm-ivory backgrounds with dark text',
                  ),
                  const SizedBox(height: 10),
                  _buildThemeOptionTile(
                    mode: ThemeMode.dark,
                    selectedMode: currentThemeMode,
                    icon: Icons.dark_mode_rounded,
                    title: 'Dark Mode',
                    subtitle: 'Comfortable forest-slate surfaces for low light',
                  ),
                  const SizedBox(height: 10),
                  _buildThemeOptionTile(
                    mode: ThemeMode.system,
                    selectedMode: currentThemeMode,
                    icon: Icons.brightness_auto_rounded,
                    title: 'System Default',
                    subtitle: 'Automatically match your Android device theme',
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Account Information Section
            _buildSectionHeader('Account Details'),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: context.cardBgColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: context.borderColor),
              ),
              child: Column(
                children: [
                  _buildDetailRow('Name', user?.name ?? 'Learner'),
                  const Divider(height: 20),
                  _buildDetailRow('Email', user?.email ?? 'N/A'),
                  const Divider(height: 20),
                  _buildDetailRow(
                    'Account Type',
                    user?.isAdmin == true ? 'Administrator' : 'Learner',
                  ),
                  if (user?.isAdmin == true) ...[
                    const Divider(height: 20),
                    _buildDetailRow('API Server', AppConfig.apiBaseUrl),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Preferences Section
            _buildSectionHeader('Preferences'),
            Container(
              decoration: BoxDecoration(
                color: context.cardBgColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: context.borderColor),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    title: Text('Learning Reminders', style: AppTextStyles.labelBold),
                    subtitle: Text(
                      'Get daily notifications to test your tech skills',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: context.textSecondaryColor,
                      ),
                    ),
                    value: _quizReminders,
                    activeTrackColor: context.brandAccentColor,
                    onChanged: (val) => setState(() => _quizReminders = val),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: Text('System Announcements', style: AppTextStyles.labelBold),
                    subtitle: Text(
                      'News on new quiz categories and certifications',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: context.textSecondaryColor,
                      ),
                    ),
                    value: _pushNotifications,
                    activeTrackColor: context.brandAccentColor,
                    onChanged: (val) => setState(() => _pushNotifications = val),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Legal & Compliance Section
            _buildSectionHeader('Compliance & Policies'),
            Container(
              decoration: BoxDecoration(
                color: context.cardBgColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: context.borderColor),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: Icon(
                      Icons.privacy_tip_outlined,
                      color: context.brandAccentColor,
                    ),
                    title: Text('Privacy Policy', style: AppTextStyles.labelBold),
                    subtitle: Text(
                      'Data safety and collection practices',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: context.textSecondaryColor,
                      ),
                    ),
                    trailing: Icon(
                      Icons.chevron_right_rounded,
                      color: context.textMutedColor,
                    ),
                    onTap: () => context.push('/legal/privacy'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: Icon(
                      Icons.description_outlined,
                      color: context.brandAccentColor,
                    ),
                    title: Text('Terms of Service', style: AppTextStyles.labelBold),
                    subtitle: Text(
                      'Platform guidelines and certificate validity',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: context.textSecondaryColor,
                      ),
                    ),
                    trailing: Icon(
                      Icons.chevron_right_rounded,
                      color: context.textMutedColor,
                    ),
                    onTap: () => context.push('/legal/terms'),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Danger Zone - Account Deletion (Google Play Store Mandatory Policy)
            _buildSectionHeader('Danger Zone', color: context.errorColor),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: context.errorColor.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: context.errorColor.withValues(alpha: 0.35),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.warning_amber_rounded,
                        color: context.errorColor,
                        size: 22,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Delete Account & Data',
                        style: AppTextStyles.labelBold.copyWith(
                          color: context.errorColor,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Permanently delete your ${AppConfig.appName} account, along with all your quiz attempt histories, scores, earned certificates, and credentials. This action is irreversible and cannot be undone.',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: context.textSecondaryColor,
                    ),
                  ),
                  const SizedBox(height: 16),
                  AppButton(
                    text: 'Delete My Account',
                    type: AppButtonType.outline,
                    icon: Icons.delete_forever_rounded,
                    onPressed: () => _confirmAccountDeletion(),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 36),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeOptionTile({
    required ThemeMode mode,
    required ThemeMode selectedMode,
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    final isSelected = mode == selectedMode;
    final isDark = context.isDarkMode;
    final activeColor = context.brandAccentColor;

    return Semantics(
      button: true,
      selected: isSelected,
      label: '$title theme option',
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          ref.read(themeModeProvider.notifier).setThemeMode(mode);
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: isSelected
                ? (isDark
                    ? AppColors.darkPrimaryAccent.withValues(alpha: 0.12)
                    : AppColors.accentLight.withValues(alpha: 0.55))
                : context.mutedBgColor.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? activeColor : context.borderColor,
              width: isSelected ? 1.8 : 1.0,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: isSelected
                      ? (isDark ? AppColors.primaryLight : AppColors.primary)
                      : context.cardBgColor,
                  borderRadius: BorderRadius.circular(11),
                  border: Border.all(
                    color: isSelected ? activeColor : context.borderColor,
                  ),
                ),
                child: Icon(
                  icon,
                  size: 20,
                  color: isSelected
                      ? Colors.white
                      : context.textSecondaryColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTextStyles.labelBold.copyWith(
                        fontSize: 14,
                        color: context.textPrimaryColor,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: AppTextStyles.bodySmall.copyWith(
                        fontSize: 12,
                        color: context.textSecondaryColor,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                isSelected
                    ? Icons.check_circle_rounded
                    : Icons.radio_button_unchecked_rounded,
                color: isSelected ? activeColor : context.textMutedColor,
                size: 22,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: AppTextStyles.mono.copyWith(
          fontSize: 11,
          letterSpacing: 1.2,
          fontWeight: FontWeight.w600,
          color: color ?? context.textSecondaryColor,
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTextStyles.bodyMedium.copyWith(
            color: context.textSecondaryColor,
          ),
        ),
        Flexible(
          child: Text(
            value,
            style: AppTextStyles.labelBold.copyWith(
              color: context.textPrimaryColor,
            ),
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }

  void _confirmAccountDeletion() {
    final confirmationController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (dialogCtx, setDialogState) {
          final isConfirmed =
              confirmationController.text.trim().toUpperCase() == 'DELETE';

          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Row(
              children: [
                Icon(Icons.delete_forever_rounded, color: context.errorColor),
                const SizedBox(width: 8),
                const Text('Delete Account?'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Are you absolutely sure? All your data, quiz scores, and verified certificates will be permanently removed from ${AppConfig.appName} servers.\n\n'
                  'To confirm, type DELETE below:',
                  style: AppTextStyles.bodyMedium,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: confirmationController,
                  autofocus: true,
                  decoration: InputDecoration(
                    hintText: 'Type DELETE',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                  ),
                  onChanged: (val) {
                    setDialogState(() {});
                  },
                ),
              ],
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
                onPressed: isConfirmed
                    ? () async {
                        Navigator.of(ctx).pop();
                        final success = await ref
                            .read(authProvider.notifier)
                            .deleteAccount();
                        if (!mounted) return;
                        if (success) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Your account and associated data have been permanently deleted.',
                              ),
                              backgroundColor: AppColors.primary,
                            ),
                          );
                          context.go('/login');
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                ref.read(authProvider).error ??
                                    'Failed to delete account. Please try again.',
                              ),
                              backgroundColor: context.errorColor,
                            ),
                          );
                        }
                      }
                    : null,
                child: const Text('Permanently Delete'),
              ),
            ],
          );
        },
      ),
    );
  }
}
