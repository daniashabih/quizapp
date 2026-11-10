import 'dart:ui';
import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_text_styles.dart';
import '../services/notification_service.dart';

/// Root viewport overlay that renders Hangbug SaaS floating notifications
/// above all routes, dialogs, and bottom sheets without blocking user input.
class HangbugNotificationViewport extends StatelessWidget {
  final Widget? child;

  const HangbugNotificationViewport({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ?child,
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          child: SafeArea(
            bottom: false,
            child: ValueListenableBuilder<List<HangbugNotificationItem>>(
              valueListenable: AppNotificationService.instance.itemsNotifier,
              builder: (context, items, _) {
                if (items.isEmpty) return const SizedBox.shrink();

                return Align(
                  alignment: Alignment.topCenter,
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 420),
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(14, 8, 14, 0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: items
                            .map(
                              (item) => Padding(
                                key: ValueKey(item.id),
                                padding: const EdgeInsets.only(bottom: 8),
                                child: HangbugToastCard(
                                  item: item,
                                  onDismiss: () =>
                                      AppNotificationService.dismiss(item.id),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}

class HangbugToastCard extends StatefulWidget {
  final HangbugNotificationItem item;
  final VoidCallback onDismiss;

  const HangbugToastCard({
    super.key,
    required this.item,
    required this.onDismiss,
  });

  @override
  State<HangbugToastCard> createState() => _HangbugToastCardState();
}

class _HangbugToastCardState extends State<HangbugToastCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeAnimation;
  late final Animation<Offset> _slideAnimation;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
      reverseDuration: const Duration(milliseconds: 220),
    );

    final curved = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(curved);
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, -0.22),
      end: Offset.zero,
    ).animate(curved);
    _scaleAnimation = Tween<double>(begin: 0.96, end: 1.0).animate(curved);

    _controller.forward();
  }

  @override
  void didUpdateWidget(covariant HangbugToastCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.item.isExiting && !oldWidget.item.isExiting) {
      _controller.reverse();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  _ToastVisualPalette _resolvePalette(bool isDark) {
    switch (widget.item.type) {
      case HangbugNotificationType.success:
        return _ToastVisualPalette(
          accentColor: isDark ? AppColors.darkPrimaryAccent : AppColors.primary,
          iconBgColor: isDark
              ? AppColors.darkPrimaryAccent.withValues(alpha: 0.14)
              : AppColors.primary.withValues(alpha: 0.09),
          iconBorderColor: isDark
              ? AppColors.darkPrimaryAccent.withValues(alpha: 0.28)
              : AppColors.primary.withValues(alpha: 0.16),
          iconColor: isDark ? AppColors.darkPrimaryAccent : AppColors.primary,
          icon: Icons.check_circle_outline_rounded,
        );
      case HangbugNotificationType.error:
        return _ToastVisualPalette(
          accentColor:
              isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626),
          iconBgColor: isDark
              ? const Color(0xFFF87171).withValues(alpha: 0.14)
              : const Color(0xFFDC2626).withValues(alpha: 0.09),
          iconBorderColor: isDark
              ? const Color(0xFFF87171).withValues(alpha: 0.26)
              : const Color(0xFFDC2626).withValues(alpha: 0.18),
          iconColor: isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626),
          icon: Icons.error_outline_rounded,
        );
      case HangbugNotificationType.warning:
        return _ToastVisualPalette(
          accentColor: isDark ? const Color(0xFFFBBF24) : AppColors.accent,
          iconBgColor: isDark
              ? const Color(0xFFFBBF24).withValues(alpha: 0.14)
              : AppColors.accent.withValues(alpha: 0.16),
          iconBorderColor: isDark
              ? const Color(0xFFFBBF24).withValues(alpha: 0.28)
              : AppColors.accent.withValues(alpha: 0.3),
          iconColor:
              isDark ? const Color(0xFFFBBF24) : const Color(0xFFB45309),
          icon: Icons.warning_amber_rounded,
        );
      case HangbugNotificationType.loading:
        return _ToastVisualPalette(
          accentColor: isDark ? AppColors.darkPrimaryAccent : AppColors.primary,
          iconBgColor: isDark
              ? AppColors.darkPrimaryAccent.withValues(alpha: 0.12)
              : AppColors.accentLight.withValues(alpha: 0.65),
          iconBorderColor: isDark
              ? AppColors.darkPrimaryAccent.withValues(alpha: 0.24)
              : AppColors.accent.withValues(alpha: 0.3),
          iconColor: isDark ? AppColors.darkPrimaryAccent : AppColors.primary,
          icon: Icons.sync_rounded,
        );
      case HangbugNotificationType.info:
        return _ToastVisualPalette(
          accentColor: isDark ? const Color(0xFF6EE7B7) : AppColors.secondary,
          iconBgColor: isDark
              ? const Color(0xFF6EE7B7).withValues(alpha: 0.13)
              : AppColors.secondary.withValues(alpha: 0.1),
          iconBorderColor: isDark
              ? const Color(0xFF6EE7B7).withValues(alpha: 0.24)
              : AppColors.secondary.withValues(alpha: 0.18),
          iconColor: isDark ? const Color(0xFF6EE7B7) : AppColors.primary,
          icon: Icons.info_outline_rounded,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final palette = _resolvePalette(isDark);

    final surfaceColor = isDark
        ? const Color(0xFF161F1C).withValues(alpha: 0.94)
        : Colors.white.withValues(alpha: 0.95);
    final borderColor = isDark
        ? AppColors.darkPrimaryAccent.withValues(alpha: 0.16)
        : AppColors.primary.withValues(alpha: 0.12);
    final titleColor =
        isDark ? const Color(0xFFF3F6F4) : const Color(0xFF0A0E0C);
    final messageColor =
        isDark ? const Color(0xFFA7BEB4) : const Color(0xFF3D4D46);

    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: ScaleTransition(
          scale: _scaleAnimation,
          child: Dismissible(
            key: ValueKey('dismiss-${widget.item.id}'),
            direction: DismissDirection.horizontal,
            onDismissed: (_) => widget.onDismiss(),
            child: Material(
              color: Colors.transparent,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: isDark
                          ? Colors.black.withValues(alpha: 0.58)
                          : AppColors.primary.withValues(alpha: 0.13),
                      blurRadius: 28,
                      spreadRadius: -4,
                      offset: const Offset(0, 12),
                    ),
                    BoxShadow(
                      color: isDark
                          ? Colors.black.withValues(alpha: 0.35)
                          : AppColors.primary.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                    child: Container(
                      decoration: BoxDecoration(
                        color: surfaceColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: borderColor, width: 1),
                      ),
                      child: IntrinsicHeight(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Subtle vertical accent indicator bar
                            Container(
                              width: 3.5,
                              margin: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: palette.accentColor,
                                borderRadius: const BorderRadius.only(
                                  topRight: Radius.circular(4),
                                  bottomRight: Radius.circular(4),
                                ),
                              ),
                            ),
                            Expanded(
                              child: Padding(
                                padding:
                                    const EdgeInsets.fromLTRB(12, 12, 10, 12),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Custom Tonal Icon Badge
                                    Container(
                                      width: 34,
                                      height: 34,
                                      decoration: BoxDecoration(
                                        color: palette.iconBgColor,
                                        borderRadius: BorderRadius.circular(11),
                                        border: Border.all(
                                          color: palette.iconBorderColor,
                                          width: 1,
                                        ),
                                      ),
                                      alignment: Alignment.center,
                                      child: widget.item.type ==
                                              HangbugNotificationType.loading
                                          ? SizedBox(
                                              width: 16,
                                              height: 16,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2.2,
                                                valueColor:
                                                    AlwaysStoppedAnimation<
                                                        Color>(
                                                  palette.iconColor,
                                                ),
                                              ),
                                            )
                                          : Icon(
                                              palette.icon,
                                              size: 18,
                                              color: palette.iconColor,
                                            ),
                                    ),
                                    const SizedBox(width: 12),

                                    // Title & Description
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.only(top: 1),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            if (widget.item.title
                                                .isNotEmpty) ...[
                                              Text(
                                                widget.item.title,
                                                style: AppTextStyles.labelBold
                                                    .copyWith(
                                                  fontSize: 13.5,
                                                  fontWeight: FontWeight.w700,
                                                  letterSpacing: -0.15,
                                                  color: titleColor,
                                                  height: 1.25,
                                                ),
                                              ),
                                            ],
                                            if (widget.item.message
                                                .isNotEmpty) ...[
                                              if (widget.item.title.isNotEmpty)
                                                const SizedBox(height: 3),
                                              Text(
                                                widget.item.message,
                                                style: AppTextStyles.bodySmall
                                                    .copyWith(
                                                  fontSize: 12.5,
                                                  fontWeight: FontWeight.w500,
                                                  color: messageColor,
                                                  height: 1.38,
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 6),

                                    // Sleek Close Button
                                    Semantics(
                                      button: true,
                                      label: 'Dismiss notification',
                                      child: InkWell(
                                        borderRadius: BorderRadius.circular(8),
                                        onTap: widget.onDismiss,
                                        child: Padding(
                                          padding: const EdgeInsets.all(4.0),
                                          child: Icon(
                                            Icons.close_rounded,
                                            size: 15,
                                            color: isDark
                                                ? const Color(0xFF8FA69C)
                                                : const Color(0xFF6B7B74),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ToastVisualPalette {
  final Color accentColor;
  final Color iconBgColor;
  final Color iconBorderColor;
  final Color iconColor;
  final IconData icon;

  const _ToastVisualPalette({
    required this.accentColor,
    required this.iconBgColor,
    required this.iconBorderColor,
    required this.iconColor,
    required this.icon,
  });
}
