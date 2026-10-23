import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors
  static const Color primary = Color(0xFF193D35);
  static const Color primaryHover = Color(0xFF122C26);
  static const Color primaryDark = Color(0xFF122C26);
  static const Color primaryLight = Color(0xFF25544A);
  static const Color secondary = Color(0xFF42665B);
  static const Color darkPrimaryAccent = Color(0xFF34D399);

  // Accents
  static const Color accent = Color(0xFFD19A45);
  static const Color accentHover = Color(0xFFBC8838);
  static const Color accentLight = Color(0xFFF3E5C5);
  static const Color accentBorder = Color(0xFFE2D0A6);

  // Background & Surfaces (Light)
  static const Color background = Color(0xFFFCFAF4);
  static const Color backgroundAlt = Color(0xFFF4EFE6);
  static const Color card = Colors.white;
  static const Color surface = Colors.white;
  static const Color mutedBg = Color(0xFFF4EFE6);
  static const Color border = Color(0xFFE8E5DD);

  // Background & Surfaces (Dark)
  static const Color darkBackground = Color(0xFF0F1513);
  static const Color darkBackgroundAlt = Color(0xFF141D19);
  static const Color darkCard = Color(0xFF18221E);
  static const Color darkSurface = Color(0xFF18221E);
  static const Color darkMutedBg = Color(0xFF222E29);
  static const Color darkBorder = Color(0xFF2A3832);

  // Typography (Light)
  static const Color textPrimary = Color(0xFF252C28);
  static const Color textSecondary = Color(0xFF7A807B);
  static const Color textMuted = Color(0xFF9E9E9E);
  static const Color textLight = Color(0xFFFCFAF4);

  // Typography (Dark)
  static const Color darkTextPrimary = Color(0xFFF3F6F4);
  static const Color darkTextSecondary = Color(0xFFB8CEC5);
  static const Color darkTextMuted = Color(0xFF8FA69C);

  // Functional Status Colors (Light)
  static const Color success = Color(0xFF15803D);
  static const Color successBg = Color(0xFFE8F5E9);
  static const Color error = Color(0xFFC96155);
  static const Color errorBg = Color(0xFFFCEEED);
  static const Color warning = Color(0xFFD9822B);
  static const Color warningBg = Color(0xFFFEF5E7);
  static const Color info = Color(0xFF3B82F6);

  // Functional Status Colors (Dark)
  static const Color darkSuccess = Color(0xFF34D399);
  static const Color darkSuccessBg = Color(0xFF112A22);
  static const Color darkError = Color(0xFFF87171);
  static const Color darkErrorBg = Color(0xFF2D1618);
  static const Color darkWarning = Color(0xFFFBBF24);
  static const Color darkWarningBg = Color(0xFF2C2212);
}

extension AppThemeContext on BuildContext {
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;

  Color get scaffoldBgColor =>
      isDarkMode ? AppColors.darkBackground : AppColors.background;

  Color get cardBgColor => isDarkMode ? AppColors.darkCard : AppColors.card;

  Color get surfaceBgColor =>
      isDarkMode ? AppColors.darkSurface : AppColors.surface;

  Color get mutedBgColor =>
      isDarkMode ? AppColors.darkMutedBg : AppColors.mutedBg;

  Color get borderColor => isDarkMode ? AppColors.darkBorder : AppColors.border;

  Color get textPrimaryColor =>
      isDarkMode ? AppColors.darkTextPrimary : AppColors.textPrimary;

  Color get textSecondaryColor =>
      isDarkMode ? AppColors.darkTextSecondary : AppColors.textSecondary;

  Color get textMutedColor =>
      isDarkMode ? AppColors.darkTextMuted : AppColors.textMuted;

  Color get brandAccentColor =>
      isDarkMode ? AppColors.darkPrimaryAccent : AppColors.primary;

  Color get successColor =>
      isDarkMode ? AppColors.darkSuccess : AppColors.success;

  Color get successBgColor =>
      isDarkMode ? AppColors.darkSuccessBg : AppColors.successBg;

  Color get errorColor => isDarkMode ? AppColors.darkError : AppColors.error;

  Color get errorBgColor =>
      isDarkMode ? AppColors.darkErrorBg : AppColors.errorBg;

  Color get warningColor =>
      isDarkMode ? AppColors.darkWarning : AppColors.warning;

  Color get warningBgColor =>
      isDarkMode ? AppColors.darkWarningBg : AppColors.warningBg;

  String get brandCompactLogoAsset => isDarkMode
      ? 'assets/images/branding/hangbug-logo-compact-dark.png'
      : 'assets/images/branding/hangbug-logo-compact.png';
}
