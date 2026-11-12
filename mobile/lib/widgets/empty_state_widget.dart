import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_text_styles.dart';
import 'app_button.dart';

class EmptyStateWidget extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final String? buttonText;
  final VoidCallback? onButtonPressed;

  const EmptyStateWidget({
    super.key,
    required this.title,
    String? subtitle,
    String? description,
    this.icon = Icons.inbox_outlined,
    String? buttonText,
    String? actionText,
    VoidCallback? onButtonPressed,
    VoidCallback? onAction,
  })  : subtitle = subtitle ?? description ?? '',
        buttonText = buttonText ?? actionText,
        onButtonPressed = onButtonPressed ?? onAction;

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 28.0),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 380),
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 28.0),
          decoration: BoxDecoration(
            color: context.cardBgColor,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: context.borderColor),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.22 : 0.04),
                blurRadius: 18,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  color: context.mutedBgColor,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: context.borderColor),
                ),
                child: Icon(
                  icon,
                  size: 34,
                  color: context.brandAccentColor,
                ),
              ),
              const SizedBox(height: 18),
              Text(
                title,
                textAlign: TextAlign.center,
                style: AppTextStyles.displaySmall.copyWith(fontSize: 18),
              ),
              if (subtitle.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  subtitle,
                  textAlign: TextAlign.center,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: context.textSecondaryColor,
                    fontSize: 13,
                    height: 1.45,
                  ),
                ),
              ],
              if (buttonText != null && onButtonPressed != null) ...[
                const SizedBox(height: 22),
                SizedBox(
                  width: 210,
                  child: AppButton(
                    text: buttonText!,
                    onPressed: onButtonPressed,
                    variant: AppButtonVariant.primary,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
