import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

/// Inherited scope exposing [ThemeTransitionViewportState] to descendants so
/// any theme toggle control can trigger a circular reveal from its own center.
class _ThemeTransitionScope extends InheritedWidget {
  final ThemeTransitionViewportState state;

  const _ThemeTransitionScope({
    required this.state,
    required super.child,
  });

  @override
  bool updateShouldNotify(_ThemeTransitionScope oldWidget) =>
      oldWidget.state != state;
}

/// Root viewport wrapper that renders a GPU-friendly circular reveal transition
/// (with snapshot clipping on supported devices and a radial fallback wave
/// during smooth MaterialApp theme interpolation) when switching Light/Dark mode.
class ThemeTransitionViewport extends StatefulWidget {
  final Widget? child;
  final ValueNotifier<bool>? snapshotActiveNotifier;

  const ThemeTransitionViewport({
    super.key,
    required this.child,
    this.snapshotActiveNotifier,
  });

  static ThemeTransitionViewportState? maybeOf(BuildContext context) {
    return context
        .getInheritedWidgetOfExactType<_ThemeTransitionScope>()
        ?.state;
  }

  @override
  State<ThemeTransitionViewport> createState() =>
      ThemeTransitionViewportState();
}

class ThemeTransitionViewportState extends State<ThemeTransitionViewport>
    with SingleTickerProviderStateMixin {
  static const Duration revealDuration = Duration(milliseconds: 600);

  final GlobalKey _boundaryKey = GlobalKey();
  late final AnimationController _controller;
  late final CurvedAnimation _curvedAnimation;

  ui.Image? _capturedImage;
  Offset _origin = Offset.zero;
  double _maxRadius = 0;
  bool _isTransitioning = false;
  bool _fallbackWaveActive = false;
  bool _targetIsDark = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: revealDuration,
    );
    _curvedAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOutCubic,
    );
  }

  @override
  void dispose() {
    _capturedImage?.dispose();
    _capturedImage = null;
    _curvedAnimation.dispose();
    _controller.dispose();
    super.dispose();
  }

  Offset _resolveOrigin(BuildContext originContext, Size hostSize) {
    final hostBox =
        _boundaryKey.currentContext?.findRenderObject() as RenderBox?;
    final targetBox = originContext.findRenderObject() as RenderBox?;
    if (hostBox != null &&
        hostBox.hasSize &&
        targetBox != null &&
        targetBox.hasSize) {
      final globalCenter =
          targetBox.localToGlobal(targetBox.size.center(Offset.zero));
      return hostBox.globalToLocal(globalCenter);
    }
    return Offset(hostSize.width / 2, hostSize.height / 2);
  }

  Size _resolveHostSize() {
    final hostBox =
        _boundaryKey.currentContext?.findRenderObject() as RenderBox?;
    if (hostBox != null && hostBox.hasSize) {
      return hostBox.size;
    }
    return MediaQuery.sizeOf(context);
  }

  bool get _isTestBinding {
    final bindingName = WidgetsBinding.instance.runtimeType.toString();
    return bindingName.contains('TestWidgetsFlutterBinding');
  }

  /// Triggers a single non-overlapping circular reveal theme transition
  /// originating from [originContext]'s visual center.
  Future<void> switchTheme({
    required BuildContext originContext,
    required bool targetIsDark,
    required Future<void> Function() applyTheme,
  }) async {
    if (_isTransitioning) return;

    final disableAnimations =
        MediaQuery.maybeDisableAnimationsOf(originContext) ??
            MediaQuery.maybeDisableAnimationsOf(context) ??
            false;

    if (disableAnimations) {
      await applyTheme();
      return;
    }

    _isTransitioning = true;

    final hostSize = _resolveHostSize();
    final origin = _resolveOrigin(originContext, hostSize);
    final dx = math.max(origin.dx, hostSize.width - origin.dx);
    final dy = math.max(origin.dy, hostSize.height - origin.dy);
    final maxRadius = math.sqrt(dx * dx + dy * dy);

    ui.Image? snapshot;
    if (!_isTestBinding) {
      try {
        final boundary = _boundaryKey.currentContext?.findRenderObject()
            as RenderRepaintBoundary?;
        if (boundary != null && boundary.attached && !boundary.debugNeedsPaint) {
          final pixelRatio =
              MediaQuery.devicePixelRatioOf(context).clamp(1.0, 3.0);
          snapshot = await boundary.toImage(pixelRatio: pixelRatio);
        }
      } catch (_) {
        snapshot = null;
      }
    }

    if (!mounted) {
      snapshot?.dispose();
      _isTransitioning = false;
      return;
    }

    if (snapshot != null) {
      widget.snapshotActiveNotifier?.value = true;
      setState(() {
        _capturedImage?.dispose();
        _capturedImage = snapshot;
        _origin = origin;
        _maxRadius = maxRadius;
        _fallbackWaveActive = false;
        _targetIsDark = targetIsDark;
      });

      Future<void>? applyFuture;
      try {
        // Trigger synchronous Riverpod theme state update without stalling frame 0 on disk I/O
        applyFuture = applyTheme();
        if (mounted) {
          await _controller.forward(from: 0.0);
        }
        await applyFuture;
      } finally {
        widget.snapshotActiveNotifier?.value = false;
        final imageToDispose = _capturedImage;
        if (mounted) {
          setState(() {
            _capturedImage = null;
          });
          _controller.value = 0.0;
          if (imageToDispose != null) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              imageToDispose.dispose();
            });
          }
        } else {
          imageToDispose?.dispose();
          _capturedImage = null;
        }
        _isTransitioning = false;
      }
      return;
    }

    // Graceful fallback when offscreen snapshot capture is unavailable:
    // MaterialApp interpolates colors smoothly while a soft radial wave expands.
    setState(() {
      _capturedImage = null;
      _origin = origin;
      _maxRadius = maxRadius;
      _fallbackWaveActive = true;
      _targetIsDark = targetIsDark;
    });

    Future<void>? applyFuture;
    try {
      applyFuture = applyTheme();
      if (mounted) {
        await _controller.forward(from: 0.0);
      }
      await applyFuture;
    } finally {
      if (mounted) {
        setState(() {
          _fallbackWaveActive = false;
        });
        _controller.value = 0.0;
      }
      _isTransitioning = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return _ThemeTransitionScope(
      state: this,
      child: Stack(
        fit: StackFit.expand,
        children: [
          RepaintBoundary(
            key: _boundaryKey,
            child: widget.child ?? const SizedBox.shrink(),
          ),
          if (_capturedImage != null)
            Positioned.fill(
              child: IgnorePointer(
                child: AnimatedBuilder(
                  animation: _curvedAnimation,
                  builder: (context, _) {
                    final radius = _maxRadius * _curvedAnimation.value;
                    return ClipPath(
                      clipper: _InvertedCircleRevealClipper(
                        center: _origin,
                        radius: radius,
                      ),
                      child: RawImage(
                        image: _capturedImage,
                        fit: BoxFit.fill,
                        filterQuality: FilterQuality.low,
                        isAntiAlias: false,
                      ),
                    );
                  },
                ),
              ),
            )
          else if (_fallbackWaveActive)
            Positioned.fill(
              child: IgnorePointer(
                child: AnimatedBuilder(
                  animation: _curvedAnimation,
                  builder: (context, _) {
                    return CustomPaint(
                      painter: _FallbackRadialWavePainter(
                        center: _origin,
                        radius: _maxRadius * _curvedAnimation.value,
                        progress: _curvedAnimation.value,
                        targetIsDark: _targetIsDark,
                      ),
                    );
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _InvertedCircleRevealClipper extends CustomClipper<Path> {
  final Offset center;
  final double radius;

  const _InvertedCircleRevealClipper({
    required this.center,
    required this.radius,
  });

  @override
  Path getClip(Size size) {
    final path = Path()
      ..fillType = PathFillType.evenOdd
      ..addRect(Offset.zero & size);
    if (radius > 0) {
      path.addOval(Rect.fromCircle(center: center, radius: radius));
    }
    return path;
  }

  @override
  bool shouldReclip(_InvertedCircleRevealClipper oldClipper) {
    return oldClipper.center != center || oldClipper.radius != radius;
  }
}

class _FallbackRadialWavePainter extends CustomPainter {
  final Offset center;
  final double radius;
  final double progress;
  final bool targetIsDark;

  const _FallbackRadialWavePainter({
    required this.center,
    required this.radius,
    required this.progress,
    required this.targetIsDark,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (radius <= 0 || progress >= 1.0) return;

    final fade = (1.0 - progress).clamp(0.0, 1.0);
    final baseColor =
        targetIsDark ? const Color(0xFF34D399) : const Color(0xFFD19A45);

    final paint = Paint()
      ..shader = ui.Gradient.radial(
        center,
        radius,
        [
          Colors.transparent,
          baseColor.withValues(alpha: 0.14 * fade),
          baseColor.withValues(alpha: 0.22 * fade),
        ],
        const [0.0, 0.72, 1.0],
      );

    canvas.drawCircle(center, radius, paint);
  }

  @override
  bool shouldRepaint(_FallbackRadialWavePainter oldDelegate) {
    return oldDelegate.center != center ||
        oldDelegate.radius != radius ||
        oldDelegate.progress != progress ||
        oldDelegate.targetIsDark != targetIsDark;
  }
}
