import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_text_styles.dart';

enum AppButtonType { primary, secondary, outline, danger }
typedef AppButtonVariant = AppButtonType;

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final dynamic icon; // Can be IconData or Widget
  final AppButtonType type;
  final double? width;
  final double height;

  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.icon,
    AppButtonType? type,
    AppButtonType? variant,
    this.width,
    this.height = 50.0,
  }) : type = type ?? variant ?? AppButtonType.primary;

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    Color bgColor;
    Color fgColor;
    BorderSide borderSide = BorderSide.none;

    switch (type) {
      case AppButtonType.primary:
        bgColor = isDark ? AppColors.primaryLight : AppColors.primary;
        fgColor = AppColors.textLight;
        if (isDark) {
          borderSide = BorderSide(
            color: AppColors.darkPrimaryAccent.withValues(alpha: 0.35),
            width: 1,
          );
        }
        break;
      case AppButtonType.secondary:
        bgColor = context.mutedBgColor;
        fgColor = context.textPrimaryColor;
        borderSide = BorderSide(color: context.borderColor, width: 1);
        break;
      case AppButtonType.outline:
        bgColor = Colors.transparent;
        fgColor = context.brandAccentColor;
        borderSide = BorderSide(color: context.brandAccentColor, width: 1.5);
        break;
      case AppButtonType.danger:
        bgColor = context.errorColor;
        fgColor = Colors.white;
        break;
    }

    final isInteractive = !isLoading && onPressed != null;

    Widget? iconWidget;
    if (icon != null) {
      if (icon is IconData) {
        iconWidget = Icon(icon as IconData, size: 18, color: fgColor);
      } else if (icon is Widget) {
        iconWidget = icon as Widget;
      }
    }

    return SizedBox(
      width: width ?? double.infinity,
      height: height,
      child: Material(
        color: isInteractive ? bgColor : bgColor.withValues(alpha: 0.6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: borderSide,
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: isInteractive ? onPressed : null,
          child: Center(
            child: isLoading
                ? SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      color: fgColor,
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (iconWidget != null) ...[
                        iconWidget,
                        const SizedBox(width: 8),
                      ],
                      Text(
                        text,
                        style: AppTextStyles.labelBold.copyWith(
                          color: fgColor,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
