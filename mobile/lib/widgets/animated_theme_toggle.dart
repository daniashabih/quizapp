import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/constants/app_colors.dart';
import '../providers/theme_provider.dart';
import 'theme_transition_overlay.dart';

/// Animated Sun & Moon icon that smoothly rotates, scales, and cross-fades
/// when transitioning between Light Mode and Dark Mode (450ms).
class AnimatedThemeIcon extends StatefulWidget {
  final bool isDark;
  final double size;
  final Color? lightColor;
  final Color? darkColor;

  const AnimatedThemeIcon({
    super.key,
    required this.isDark,
    this.size = 20,
    this.lightColor,
    this.darkColor,
  });

  @override
  State<AnimatedThemeIcon> createState() => _AnimatedThemeIconState();
}

class _AnimatedThemeIconState extends State<AnimatedThemeIcon>
    with SingleTickerProviderStateMixin {
  static const Duration _duration = Duration(milliseconds: 450);

  late final AnimationController _controller;
  late final CurvedAnimation _curved;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: _duration,
      value: widget.isDark ? 1.0 : 0.0,
    );
    _curved = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOutCubic,
    );
  }

  @override
  void didUpdateWidget(AnimatedThemeIcon oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isDark == widget.isDark) return;

    final disableAnimations =
        MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final target = widget.isDark ? 1.0 : 0.0;
    if (disableAnimations) {
      _controller.value = target;
    } else if (widget.isDark) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
  }

  @override
  void dispose() {
    _curved.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final resolvedLightColor = widget.lightColor ?? AppColors.primary;
    final resolvedDarkColor = widget.darkColor ?? AppColors.darkPrimaryAccent;

    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _curved,
        builder: (context, _) {
          final t = _curved.value; // 0.0 = Light (Sun), 1.0 = Dark (Moon)

          // Sun: visible at t=0; rotates clockwise (+90deg) and shrinks away to t=1.
          final sunOpacity = (1.0 - t * 1.25).clamp(0.0, 1.0);
          final sunScale = 1.0 - (0.65 * t);
          final sunAngle = (math.pi / 2) * t;

          // Moon: visible at t=1; enters from -90deg and scales up smoothly.
          final moonOpacity = ((t - 0.15) / 0.85).clamp(0.0, 1.0);
          final moonScale = 0.35 + (0.65 * t);
          final moonAngle = -(math.pi / 2) * (1.0 - t);

          return Stack(
            alignment: Alignment.center,
            children: [
              Opacity(
                opacity: sunOpacity,
                child: Transform.rotate(
                  angle: sunAngle,
                  child: Transform.scale(
                    scale: sunScale,
                    child: Icon(
                      Icons.light_mode_rounded,
                      size: widget.size,
                      color: resolvedLightColor,
                    ),
                  ),
                ),
              ),
              Opacity(
                opacity: moonOpacity,
                child: Transform.rotate(
                  angle: moonAngle,
                  child: Transform.scale(
                    scale: moonScale,
                    child: Icon(
                      Icons.dark_mode_rounded,
                      size: widget.size,
                      color: resolvedDarkColor,
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

/// AppBar / header theme toggle button that animates its Sun/Moon icon and
/// triggers a circular reveal transition across the entire app viewport.
class AnimatedThemeToggleButton extends ConsumerWidget {
  final double iconSize;
  final Color? lightIconColor;
  final Color? darkIconColor;

  const AnimatedThemeToggleButton({
    super.key,
    this.iconSize = 20,
    this.lightIconColor,
    this.darkIconColor,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = context.isDarkMode;

    return Builder(
      builder: (buttonContext) {
        return IconButton(
          tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
          icon: AnimatedThemeIcon(
            isDark: isDark,
            size: iconSize,
            lightColor: lightIconColor ?? context.textSecondaryColor,
            darkColor: darkIconColor ?? AppColors.darkPrimaryAccent,
          ),
          onPressed: () {
            final brightness = MediaQuery.platformBrightnessOf(buttonContext);
            final viewport = ThemeTransitionViewport.maybeOf(buttonContext);
            Future<void> apply() =>
                ref.read(themeModeProvider.notifier).toggleTheme(brightness);

            if (viewport != null) {
              viewport.switchTheme(
                originContext: buttonContext,
                targetIsDark: !isDark,
                applyTheme: apply,
              );
            } else {
              apply();
            }
          },
        );
      },
    );
  }
}
