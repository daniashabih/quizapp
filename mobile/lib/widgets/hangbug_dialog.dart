import 'dart:ui';
import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_text_styles.dart';

enum HangbugDialogType {
  success,
  error,
  warning,
  info,
  delete,
  prompt,
}

enum HangbugActionVariant {
  primary,
  danger,
  warning,
  info,
  secondary,
  ghostDanger,
}

class HangbugDialogAction<T> {
  final String label;
  final T value;
  final HangbugActionVariant variant;
  final Future<void> Function()? onPressed;
  final String? loadingText;

  const HangbugDialogAction({
    required this.label,
    required this.value,
    this.variant = HangbugActionVariant.primary,
    this.onPressed,
    this.loadingText,
  });
}

/// Centralized Hangbug Global Dialog System for Flutter Mobile.
/// Matches the Web Global Dialog System across Light & Dark themes with
/// rounded corners, blurred backdrop, smooth animations, semantic icons,
/// async loading states, inline error retention, and input validation.
class HangbugDialog {
  HangbugDialog._();

  static Future<bool> success(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'OK',
    String? itemName,
    bool showCancel = false,
    String cancelText = 'Cancel',
    String loadingText = 'Processing...',
    Future<void> Function()? onConfirm,
  }) async {
    final result = await _showStandardDialog(
      context,
      type: HangbugDialogType.success,
      title: title,
      message: message,
      itemName: itemName,
      confirmText: confirmText,
      cancelText: cancelText,
      loadingText: loadingText,
      showCancel: showCancel,
      confirmVariant: HangbugActionVariant.primary,
      onConfirm: onConfirm,
    );
    return result == true;
  }

  static Future<bool> error(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'OK',
    bool showCancel = false,
    String cancelText = 'Cancel',
    String loadingText = 'Retrying...',
    Future<void> Function()? onConfirm,
  }) async {
    final result = await _showStandardDialog(
      context,
      type: HangbugDialogType.error,
      title: title,
      message: message,
      confirmText: confirmText,
      cancelText: cancelText,
      loadingText: loadingText,
      showCancel: showCancel,
      confirmVariant: HangbugActionVariant.danger,
      onConfirm: onConfirm,
    );
    return result == true;
  }

  static Future<bool> warning(
    BuildContext context, {
    required String title,
    required String message,
    String? itemName,
    String confirmText = 'Continue',
    String cancelText = 'Cancel',
    String loadingText = 'Processing...',
    bool showCancel = true,
    HangbugActionVariant confirmVariant = HangbugActionVariant.warning,
    Future<void> Function()? onConfirm,
  }) async {
    final result = await _showStandardDialog(
      context,
      type: HangbugDialogType.warning,
      title: title,
      message: message,
      itemName: itemName,
      confirmText: confirmText,
      cancelText: cancelText,
      loadingText: loadingText,
      showCancel: showCancel,
      confirmVariant: confirmVariant,
      onConfirm: onConfirm,
    );
    return result == true;
  }

  static Future<bool> info(
    BuildContext context, {
    required String title,
    required String message,
    String? itemName,
    String confirmText = 'OK',
    String cancelText = 'Cancel',
    String loadingText = 'Processing...',
    bool showCancel = false,
    Future<void> Function()? onConfirm,
  }) async {
    final result = await _showStandardDialog(
      context,
      type: HangbugDialogType.info,
      title: title,
      message: message,
      itemName: itemName,
      confirmText: confirmText,
      cancelText: cancelText,
      loadingText: loadingText,
      showCancel: showCancel,
      confirmVariant: HangbugActionVariant.info,
      onConfirm: onConfirm,
    );
    return result == true;
  }

  static Future<bool> confirmDelete(
    BuildContext context, {
    required String title,
    required String message,
    String? itemName,
    String confirmText = 'Delete',
    String cancelText = 'Cancel',
    String loadingText = 'Deleting...',
    bool permanent = true,
    String? permanentNotice,
    String? confirmPhrase,
    String? confirmPhraseLabel,
    Future<void> Function()? onConfirm,
  }) async {
    final resolvedNotice = permanentNotice ??
        (permanent
            ? 'This action is permanent and cannot be undone.'
            : 'This item will be removed from cache and can be restored later.');

    final result = await _showStandardDialog(
      context,
      type: HangbugDialogType.delete,
      title: title,
      message: message,
      itemName: itemName,
      permanent: permanent,
      permanentNotice: resolvedNotice,
      confirmPhrase: confirmPhrase,
      confirmPhraseLabel: confirmPhraseLabel,
      confirmText: confirmText,
      cancelText: cancelText,
      loadingText: loadingText,
      showCancel: true,
      confirmVariant: HangbugActionVariant.danger,
      onConfirm: onConfirm,
    );
    return result == true;
  }

  static Future<String?> prompt(
    BuildContext context, {
    required String title,
    String? message,
    required String label,
    String? hint,
    String initialValue = '',
    String confirmText = 'Submit',
    String cancelText = 'Cancel',
    String loadingText = 'Submitting...',
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
    String? Function(String value)? validator,
    Future<void> Function(String value)? onSubmit,
  }) async {
    return _showAnimatedDialog<String>(
      context: context,
      barrierDismissible: true,
      builder: (_) => _HangbugPromptDialogCard(
        title: title,
        message: message,
        label: label,
        hint: hint,
        initialValue: initialValue,
        confirmText: confirmText,
        cancelText: cancelText,
        loadingText: loadingText,
        keyboardType: keyboardType,
        maxLines: maxLines,
        validator: validator,
        onSubmit: onSubmit,
      ),
    );
  }

  static Future<T?> choice<T>(
    BuildContext context, {
    required HangbugDialogType type,
    required String title,
    required String message,
    String? itemName,
    required List<HangbugDialogAction<T>> actions,
    bool barrierDismissible = true,
  }) {
    return _showAnimatedDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      builder: (_) => _HangbugChoiceDialogCard<T>(
        type: type,
        title: title,
        message: message,
        itemName: itemName,
        actions: actions,
      ),
    );
  }

  static Future<bool?> _showStandardDialog(
    BuildContext context, {
    required HangbugDialogType type,
    required String title,
    required String message,
    String? itemName,
    bool permanent = false,
    String? permanentNotice,
    String? confirmPhrase,
    String? confirmPhraseLabel,
    required String confirmText,
    required String cancelText,
    required String loadingText,
    required bool showCancel,
    required HangbugActionVariant confirmVariant,
    Future<void> Function()? onConfirm,
  }) {
    return _showAnimatedDialog<bool>(
      context: context,
      barrierDismissible: true,
      builder: (_) => _HangbugStandardDialogCard(
        type: type,
        title: title,
        message: message,
        itemName: itemName,
        permanent: permanent,
        permanentNotice: permanentNotice,
        confirmPhrase: confirmPhrase,
        confirmPhraseLabel: confirmPhraseLabel,
        confirmText: confirmText,
        cancelText: cancelText,
        loadingText: loadingText,
        showCancel: showCancel,
        confirmVariant: confirmVariant,
        onConfirm: onConfirm,
      ),
    );
  }

  static Future<T?> _showAnimatedDialog<T>({
    required BuildContext context,
    required bool barrierDismissible,
    required WidgetBuilder builder,
  }) {
    return showGeneralDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      barrierColor: Colors.transparent,
      transitionDuration: const Duration(milliseconds: 220),
      pageBuilder: (dialogContext, animation, secondaryAnimation) {
        return builder(dialogContext);
      },
      transitionBuilder: (dialogContext, animation, secondaryAnimation, child) {
        final isDark = Theme.of(dialogContext).brightness == Brightness.dark;
        final curved = CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutCubic,
          reverseCurve: Curves.easeInCubic,
        );

        return Stack(
          children: [
            Positioned.fill(
              child: FadeTransition(
                opacity: curved,
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
                  child: Container(
                    color: isDark
                        ? const Color(0xFF040907).withValues(alpha: 0.7)
                        : const Color(0xFF0A120F).withValues(alpha: 0.45),
                  ),
                ),
              ),
            ),
            FadeTransition(
              opacity: curved,
              child: ScaleTransition(
                scale: Tween<double>(begin: 0.94, end: 1.0).animate(curved),
                child: child,
              ),
            ),
          ],
        );
      },
    );
  }
}

class _DialogPalette {
  final Color accent;
  final Color iconBg;
  final Color iconBorder;
  final Color iconColor;
  final IconData icon;

  const _DialogPalette({
    required this.accent,
    required this.iconBg,
    required this.iconBorder,
    required this.iconColor,
    required this.icon,
  });

  static _DialogPalette resolve(HangbugDialogType type, bool isDark) {
    switch (type) {
      case HangbugDialogType.success:
        final color = isDark ? const Color(0xFF34D399) : const Color(0xFF15803D);
        return _DialogPalette(
          accent: color,
          iconBg: color.withValues(alpha: isDark ? 0.14 : 0.11),
          iconBorder: color.withValues(alpha: isDark ? 0.28 : 0.24),
          iconColor: color,
          icon: Icons.check_circle_outline_rounded,
        );
      case HangbugDialogType.error:
        final color = isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626);
        return _DialogPalette(
          accent: color,
          iconBg: color.withValues(alpha: isDark ? 0.14 : 0.10),
          iconBorder: color.withValues(alpha: isDark ? 0.28 : 0.22),
          iconColor: color,
          icon: Icons.error_outline_rounded,
        );
      case HangbugDialogType.delete:
        final color = isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626);
        return _DialogPalette(
          accent: color,
          iconBg: color.withValues(alpha: isDark ? 0.14 : 0.10),
          iconBorder: color.withValues(alpha: isDark ? 0.28 : 0.22),
          iconColor: color,
          icon: Icons.delete_outline_rounded,
        );
      case HangbugDialogType.warning:
        final color = isDark ? const Color(0xFFFBBF24) : const Color(0xFFD97706);
        return _DialogPalette(
          accent: color,
          iconBg: color.withValues(alpha: isDark ? 0.14 : 0.12),
          iconBorder: color.withValues(alpha: isDark ? 0.28 : 0.26),
          iconColor: isDark ? color : const Color(0xFFB45309),
          icon: Icons.warning_amber_rounded,
        );
      case HangbugDialogType.info:
        final color = isDark ? const Color(0xFF60A5FA) : const Color(0xFF2563EB);
        return _DialogPalette(
          accent: color,
          iconBg: color.withValues(alpha: isDark ? 0.14 : 0.10),
          iconBorder: color.withValues(alpha: isDark ? 0.28 : 0.22),
          iconColor: color,
          icon: Icons.info_outline_rounded,
        );
      case HangbugDialogType.prompt:
        final color = isDark ? AppColors.darkPrimaryAccent : AppColors.primary;
        return _DialogPalette(
          accent: color,
          iconBg: color.withValues(alpha: isDark ? 0.14 : 0.09),
          iconBorder: color.withValues(alpha: isDark ? 0.28 : 0.18),
          iconColor: color,
          icon: Icons.edit_outlined,
        );
    }
  }
}

class _DialogSurfaceShell extends StatelessWidget {
  final HangbugDialogType type;
  final String title;
  final String? message;
  final String? itemName;
  final Widget? bodyExtra;
  final String? errorText;
  final bool isLoading;
  final VoidCallback? onClose;
  final Widget footer;

  const _DialogSurfaceShell({
    required this.type,
    required this.title,
    this.message,
    this.itemName,
    this.bodyExtra,
    this.errorText,
    required this.isLoading,
    this.onClose,
    required this.footer,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final palette = _DialogPalette.resolve(type, isDark);

    final surfaceColor = isDark ? AppColors.darkCard : AppColors.card;
    final footerBgColor =
        isDark ? const Color(0xFF121A17) : const Color(0xFFFAF8F2);
    final borderColor = isDark
        ? AppColors.darkPrimaryAccent.withValues(alpha: 0.16)
        : AppColors.primary.withValues(alpha: 0.13);
    final dividerColor = isDark
        ? AppColors.darkPrimaryAccent.withValues(alpha: 0.1)
        : AppColors.primary.withValues(alpha: 0.08);
    final titleColor =
        isDark ? AppColors.darkTextPrimary : const Color(0xFF0A0E0C);
    final messageColor =
        isDark ? AppColors.darkTextSecondary : const Color(0xFF3D4D46);

    return PopScope(
      canPop: !isLoading,
      child: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(
            18,
            24,
            18,
            MediaQuery.viewInsetsOf(context).bottom + 24,
          ),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Material(
              color: Colors.transparent,
              child: Container(
                decoration: BoxDecoration(
                  color: surfaceColor,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: borderColor, width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: isDark
                          ? Colors.black.withValues(alpha: 0.65)
                          : const Color(0xFF0F231E).withValues(alpha: 0.2),
                      blurRadius: 42,
                      spreadRadius: -8,
                      offset: const Offset(0, 18),
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Subtle semantic top accent bar
                    Container(height: 3.5, color: palette.accent),

                    // Main Content
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: palette.iconBg,
                                  borderRadius: BorderRadius.circular(13),
                                  border: Border.all(
                                    color: palette.iconBorder,
                                    width: 1,
                                  ),
                                ),
                                alignment: Alignment.center,
                                child: Icon(
                                  palette.icon,
                                  size: 22,
                                  color: palette.iconColor,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.only(top: 1),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        title,
                                        style: AppTextStyles.displaySmall
                                            .copyWith(
                                          fontSize: 16.5,
                                          fontWeight: FontWeight.w700,
                                          color: titleColor,
                                          height: 1.28,
                                        ),
                                      ),
                                      if (message != null &&
                                          message!.trim().isNotEmpty) ...[
                                        const SizedBox(height: 6),
                                        Text(
                                          message!,
                                          style:
                                              AppTextStyles.bodySmall.copyWith(
                                            fontSize: 13.5,
                                            color: messageColor,
                                            height: 1.48,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              ),
                              if (onClose != null) ...[
                                const SizedBox(width: 4),
                                InkWell(
                                  borderRadius: BorderRadius.circular(10),
                                  onTap: isLoading ? null : onClose,
                                  child: Padding(
                                    padding: const EdgeInsets.all(5),
                                    child: Icon(
                                      Icons.close_rounded,
                                      size: 18,
                                      color: isDark
                                          ? AppColors.darkTextMuted
                                          : const Color(0xFF6B7B74),
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),

                          if (itemName != null &&
                              itemName!.trim().isNotEmpty) ...[
                            const SizedBox(height: 14),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 13,
                                vertical: 10,
                              ),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? AppColors.darkBackgroundAlt
                                    : AppColors.backgroundAlt,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isDark
                                      ? AppColors.darkBorder
                                      : AppColors.border,
                                ),
                              ),
                              child: Text(
                                itemName!,
                                style: AppTextStyles.labelBold.copyWith(
                                  fontSize: 13,
                                  color: titleColor,
                                ),
                              ),
                            ),
                          ],

                          ?bodyExtra,

                          if (errorText != null &&
                              errorText!.trim().isNotEmpty) ...[
                            const SizedBox(height: 14),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 10,
                              ),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? const Color(0xFFEF4444)
                                        .withValues(alpha: 0.14)
                                    : const Color(0xFFFEF2F2),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isDark
                                      ? const Color(0xFFF87171)
                                          .withValues(alpha: 0.32)
                                      : const Color(0xFFFECACA),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(
                                    Icons.error_outline_rounded,
                                    size: 16,
                                    color: isDark
                                        ? const Color(0xFFFCA5A5)
                                        : const Color(0xFFB91C1C),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      errorText!,
                                      style: AppTextStyles.bodySmall.copyWith(
                                        fontSize: 12.5,
                                        fontWeight: FontWeight.w500,
                                        color: isDark
                                            ? const Color(0xFFFCA5A5)
                                            : const Color(0xFFB91C1C),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                    // Footer Action Bar
                    Container(
                      padding: const EdgeInsets.fromLTRB(20, 13, 20, 16),
                      decoration: BoxDecoration(
                        color: footerBgColor,
                        border: Border(
                          top: BorderSide(color: dividerColor, width: 1),
                        ),
                      ),
                      child: footer,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

Color _resolveActionForeground(HangbugActionVariant variant, bool isDark) {
  switch (variant) {
    case HangbugActionVariant.primary:
      return isDark ? const Color(0xFF062118) : Colors.white;
    case HangbugActionVariant.warning:
      return isDark ? const Color(0xFF1A1202) : Colors.white;
    case HangbugActionVariant.danger:
    case HangbugActionVariant.info:
      return Colors.white;
    case HangbugActionVariant.secondary:
      return isDark ? const Color(0xFFD5E3DD) : const Color(0xFF2B3934);
    case HangbugActionVariant.ghostDanger:
      return isDark ? const Color(0xFFFCA5A5) : const Color(0xFFDC2626);
  }
}

ButtonStyle _resolveActionStyle(
  HangbugActionVariant variant,
  bool isDark,
) {
  final shape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(12));
  const minSize = Size(0, 42);
  const padding = EdgeInsets.symmetric(horizontal: 18, vertical: 10);

  switch (variant) {
    case HangbugActionVariant.danger:
      return ElevatedButton.styleFrom(
        backgroundColor:
            isDark ? const Color(0xFFEF4444) : const Color(0xFFDC2626),
        foregroundColor: Colors.white,
        minimumSize: minSize,
        padding: padding,
        elevation: 0,
        shape: shape,
      );
    case HangbugActionVariant.warning:
      return ElevatedButton.styleFrom(
        backgroundColor:
            isDark ? const Color(0xFFF59E0B) : const Color(0xFFD97706),
        foregroundColor: isDark ? const Color(0xFF1A1202) : Colors.white,
        minimumSize: minSize,
        padding: padding,
        elevation: 0,
        shape: shape,
      );
    case HangbugActionVariant.info:
      return ElevatedButton.styleFrom(
        backgroundColor:
            isDark ? const Color(0xFF3B82F6) : const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        minimumSize: minSize,
        padding: padding,
        elevation: 0,
        shape: shape,
      );
    case HangbugActionVariant.secondary:
      return OutlinedButton.styleFrom(
        backgroundColor: isDark ? AppColors.darkMutedBg : Colors.white,
        foregroundColor:
            isDark ? const Color(0xFFD5E3DD) : const Color(0xFF2B3934),
        minimumSize: minSize,
        padding: padding,
        side: BorderSide(
          color: isDark ? const Color(0xFF2E3E37) : const Color(0xFFDCD8CE),
        ),
        shape: shape,
      );
    case HangbugActionVariant.ghostDanger:
      return OutlinedButton.styleFrom(
        backgroundColor: isDark
            ? const Color(0xFFEF4444).withValues(alpha: 0.1)
            : const Color(0xFFFEF2F2),
        foregroundColor:
            isDark ? const Color(0xFFFCA5A5) : const Color(0xFFDC2626),
        minimumSize: minSize,
        padding: padding,
        side: BorderSide(
          color: isDark
              ? const Color(0xFFF87171).withValues(alpha: 0.28)
              : const Color(0xFFFECACA),
        ),
        shape: shape,
      );
    case HangbugActionVariant.primary:
      return ElevatedButton.styleFrom(
        backgroundColor: isDark ? const Color(0xFF10B981) : AppColors.primary,
        foregroundColor: isDark ? const Color(0xFF062118) : Colors.white,
        minimumSize: minSize,
        padding: padding,
        elevation: 0,
        shape: shape,
      );
  }
}

class _HangbugStandardDialogCard extends StatefulWidget {
  final HangbugDialogType type;
  final String title;
  final String message;
  final String? itemName;
  final bool permanent;
  final String? permanentNotice;
  final String? confirmPhrase;
  final String? confirmPhraseLabel;
  final String confirmText;
  final String cancelText;
  final String loadingText;
  final bool showCancel;
  final HangbugActionVariant confirmVariant;
  final Future<void> Function()? onConfirm;

  const _HangbugStandardDialogCard({
    required this.type,
    required this.title,
    required this.message,
    this.itemName,
    required this.permanent,
    this.permanentNotice,
    this.confirmPhrase,
    this.confirmPhraseLabel,
    required this.confirmText,
    required this.cancelText,
    required this.loadingText,
    required this.showCancel,
    required this.confirmVariant,
    this.onConfirm,
  });

  @override
  State<_HangbugStandardDialogCard> createState() =>
      _HangbugStandardDialogCardState();
}

class _HangbugStandardDialogCardState
    extends State<_HangbugStandardDialogCard> {
  final TextEditingController _phraseController = TextEditingController();
  bool _isLoading = false;
  String? _errorText;

  @override
  void dispose() {
    _phraseController.dispose();
    super.dispose();
  }

  bool get _phraseMatched {
    final phrase = widget.confirmPhrase;
    if (phrase == null || phrase.trim().isEmpty) return true;
    return _phraseController.text.trim().toUpperCase() ==
        phrase.trim().toUpperCase();
  }

  Future<void> _handleConfirm() async {
    if (_isLoading || !_phraseMatched) return;

    if (widget.onConfirm == null) {
      Navigator.of(context).pop(true);
      return;
    }

    setState(() {
      _isLoading = true;
      _errorText = null;
    });

    try {
      await widget.onConfirm!();
      if (mounted) {
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorText = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Widget? extra;
    if ((widget.permanentNotice != null &&
            widget.permanentNotice!.trim().isNotEmpty) ||
        (widget.confirmPhrase != null &&
            widget.confirmPhrase!.trim().isNotEmpty)) {
      extra = Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (widget.permanentNotice != null &&
              widget.permanentNotice!.trim().isNotEmpty) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: widget.permanent
                    ? (isDark
                        ? const Color(0xFFF87171).withValues(alpha: 0.1)
                        : const Color(0xFFDC2626).withValues(alpha: 0.07))
                    : (isDark
                        ? const Color(0xFF60A5FA).withValues(alpha: 0.1)
                        : const Color(0xFF2563EB).withValues(alpha: 0.07)),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: widget.permanent
                      ? (isDark
                          ? const Color(0xFFF87171).withValues(alpha: 0.25)
                          : const Color(0xFFDC2626).withValues(alpha: 0.18))
                      : (isDark
                          ? const Color(0xFF60A5FA).withValues(alpha: 0.24)
                          : const Color(0xFF2563EB).withValues(alpha: 0.18)),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    widget.permanent
                        ? Icons.gpp_maybe_outlined
                        : Icons.info_outline_rounded,
                    size: 16,
                    color: widget.permanent
                        ? (isDark
                            ? const Color(0xFFFCA5A5)
                            : const Color(0xFF991B1B))
                        : (isDark
                            ? const Color(0xFF93C5FD)
                            : const Color(0xFF1E40AF)),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      widget.permanentNotice!,
                      style: AppTextStyles.bodySmall.copyWith(
                        fontSize: 12.2,
                        fontWeight: FontWeight.w500,
                        color: widget.permanent
                            ? (isDark
                                ? const Color(0xFFFCA5A5)
                                : const Color(0xFF991B1B))
                            : (isDark
                                ? const Color(0xFF93C5FD)
                                : const Color(0xFF1E40AF)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (widget.confirmPhrase != null &&
              widget.confirmPhrase!.trim().isNotEmpty) ...[
            const SizedBox(height: 14),
            Text(
              widget.confirmPhraseLabel ??
                  'Type ${widget.confirmPhrase} to confirm',
              style: AppTextStyles.labelBold.copyWith(
                fontSize: 12.5,
                color: isDark
                    ? AppColors.darkTextSecondary
                    : const Color(0xFF2B3934),
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _phraseController,
              enabled: !_isLoading,
              autofocus: true,
              decoration: InputDecoration(
                hintText: 'Type ${widget.confirmPhrase}',
                isDense: true,
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (_) => setState(() => _errorText = null),
            ),
          ],
        ],
      );
    }

    return _DialogSurfaceShell(
      type: widget.type,
      title: widget.title,
      message: widget.message,
      itemName: widget.itemName,
      bodyExtra: extra,
      errorText: _errorText,
      isLoading: _isLoading,
      onClose: () => Navigator.of(context).pop(false),
      footer: Wrap(
        alignment: WrapAlignment.end,
        spacing: 10,
        runSpacing: 8,
        children: [
          if (widget.showCancel)
            OutlinedButton(
              style: _resolveActionStyle(HangbugActionVariant.secondary, isDark),
              onPressed: _isLoading
                  ? null
                  : () => Navigator.of(context).pop(false),
              child: Text(widget.cancelText),
            ),
          ElevatedButton(
            style: _resolveActionStyle(widget.confirmVariant, isDark),
            onPressed: (_isLoading || !_phraseMatched) ? null : _handleConfirm,
            child: _isLoading
                ? Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        width: 15,
                        height: 15,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _resolveActionForeground(
                                widget.confirmVariant, isDark),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(widget.loadingText),
                    ],
                  )
                : Text(widget.confirmText),
          ),
        ],
      ),
    );
  }
}

class _HangbugPromptDialogCard extends StatefulWidget {
  final String title;
  final String? message;
  final String label;
  final String? hint;
  final String initialValue;
  final String confirmText;
  final String cancelText;
  final String loadingText;
  final TextInputType keyboardType;
  final int maxLines;
  final String? Function(String value)? validator;
  final Future<void> Function(String value)? onSubmit;

  const _HangbugPromptDialogCard({
    required this.title,
    this.message,
    required this.label,
    this.hint,
    required this.initialValue,
    required this.confirmText,
    required this.cancelText,
    required this.loadingText,
    required this.keyboardType,
    required this.maxLines,
    this.validator,
    this.onSubmit,
  });

  @override
  State<_HangbugPromptDialogCard> createState() =>
      _HangbugPromptDialogCardState();
}

class _HangbugPromptDialogCardState extends State<_HangbugPromptDialogCard> {
  late final TextEditingController _controller;
  bool _isLoading = false;
  String? _validationError;
  String? _submitError;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValue);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (_isLoading) return;

    final raw = _controller.text;
    final valErr = widget.validator != null
        ? widget.validator!(raw)
        : (raw.trim().isEmpty ? '${widget.label} is required.' : null);

    if (valErr != null) {
      setState(() => _validationError = valErr);
      return;
    }

    if (widget.onSubmit == null) {
      Navigator.of(context).pop(raw.trim());
      return;
    }

    setState(() {
      _isLoading = true;
      _validationError = null;
      _submitError = null;
    });

    try {
      await widget.onSubmit!(raw.trim());
      if (mounted) {
        Navigator.of(context).pop(raw.trim());
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _submitError = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return _DialogSurfaceShell(
      type: HangbugDialogType.prompt,
      title: widget.title,
      message: widget.message,
      errorText: _submitError,
      isLoading: _isLoading,
      onClose: () => Navigator.of(context).pop(null),
      bodyExtra: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 16),
          Text(
            widget.label,
            style: AppTextStyles.labelBold.copyWith(
              fontSize: 12.5,
              color: isDark
                  ? AppColors.darkTextSecondary
                  : const Color(0xFF2B3934),
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _controller,
            enabled: !_isLoading,
            autofocus: true,
            keyboardType: widget.keyboardType,
            maxLines: widget.maxLines,
            textInputAction: widget.maxLines == 1
                ? TextInputAction.done
                : TextInputAction.newline,
            onSubmitted: widget.maxLines == 1 ? (_) => _handleSubmit() : null,
            onChanged: (_) {
              if (_validationError != null || _submitError != null) {
                setState(() {
                  _validationError = null;
                  _submitError = null;
                });
              }
            },
            decoration: InputDecoration(
              hintText: widget.hint,
              errorText: _validationError,
              isDense: true,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
      footer: Wrap(
        alignment: WrapAlignment.end,
        spacing: 10,
        runSpacing: 8,
        children: [
          OutlinedButton(
            style: _resolveActionStyle(HangbugActionVariant.secondary, isDark),
            onPressed: _isLoading
                ? null
                : () => Navigator.of(context).pop(null),
            child: Text(widget.cancelText),
          ),
          ElevatedButton(
            style: _resolveActionStyle(HangbugActionVariant.primary, isDark),
            onPressed: _isLoading ? null : _handleSubmit,
            child: _isLoading
                ? Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        width: 15,
                        height: 15,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _resolveActionForeground(
                                HangbugActionVariant.primary, isDark),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(widget.loadingText),
                    ],
                  )
                : Text(widget.confirmText),
          ),
        ],
      ),
    );
  }
}

class _HangbugChoiceDialogCard<T> extends StatefulWidget {
  final HangbugDialogType type;
  final String title;
  final String message;
  final String? itemName;
  final List<HangbugDialogAction<T>> actions;

  const _HangbugChoiceDialogCard({
    required this.type,
    required this.title,
    required this.message,
    this.itemName,
    required this.actions,
  });

  @override
  State<_HangbugChoiceDialogCard<T>> createState() =>
      _HangbugChoiceDialogCardState<T>();
}

class _HangbugChoiceDialogCardState<T>
    extends State<_HangbugChoiceDialogCard<T>> {
  int? _loadingIndex;
  String? _errorText;

  Future<void> _handleAction(int index, HangbugDialogAction<T> action) async {
    if (_loadingIndex != null) return;

    if (action.onPressed == null) {
      Navigator.of(context).pop(action.value);
      return;
    }

    setState(() {
      _loadingIndex = index;
      _errorText = null;
    });

    try {
      await action.onPressed!();
      if (mounted) {
        Navigator.of(context).pop(action.value);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loadingIndex = null;
          _errorText = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isBusy = _loadingIndex != null;

    return _DialogSurfaceShell(
      type: widget.type,
      title: widget.title,
      message: widget.message,
      itemName: widget.itemName,
      errorText: _errorText,
      isLoading: isBusy,
      onClose: () => Navigator.of(context).pop(null),
      footer: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          for (int i = 0; i < widget.actions.length; i++) ...[
            if (i > 0) const SizedBox(height: 8),
            _buildButton(i, widget.actions[i], isDark, isBusy),
          ],
        ],
      ),
    );
  }

  Widget _buildButton(
    int index,
    HangbugDialogAction<T> action,
    bool isDark,
    bool isBusy,
  ) {
    final isThisLoading = _loadingIndex == index;
    final style = _resolveActionStyle(action.variant, isDark);
    final child = isThisLoading
        ? Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 15,
                height: 15,
                child: CircularProgressIndicator(
                  strokeWidth: 2.2,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    _resolveActionForeground(action.variant, isDark),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(action.loadingText ?? 'Processing...'),
            ],
          )
        : Text(action.label);

    if (action.variant == HangbugActionVariant.secondary ||
        action.variant == HangbugActionVariant.ghostDanger) {
      return OutlinedButton(
        style: style,
        onPressed: isBusy ? null : () => _handleAction(index, action),
        child: child,
      );
    }

    return ElevatedButton(
      style: style,
      onPressed: isBusy ? null : () => _handleAction(index, action),
      child: child,
    );
  }
}
