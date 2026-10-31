import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';

class FlutterFlappyBug extends StatefulWidget {
  final Function(int score, Map<String, dynamic> metadata) onGameOver;
  final Function(int score) onScoreUpdate;
  final bool isPaused;

  const FlutterFlappyBug({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    this.isPaused = false,
  });

  @override
  State<FlutterFlappyBug> createState() => _FlutterFlappyBugState();
}

class _FlutterFlappyBugState extends State<FlutterFlappyBug> {
  static const double _pipeWidth = 38.0;
  static const double _pipeGap = 95.0;
  static const double _gravity = 0.32;
  static const double _jump = -5.4;

  double _bugY = 130.0;
  double _bugVy = 0.0;
  int _score = 0;
  bool _started = false;
  bool _gameOver = false;
  Timer? _ticker;

  final List<_PipePair> _pipes = [
    _PipePair(x: 290, topHeight: 75),
    _PipePair(x: 460, topHeight: 110),
  ];

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  void _resetGame() {
    _ticker?.cancel();
    setState(() {
      _bugY = 130.0;
      _bugVy = 0.0;
      _score = 0;
      _started = false;
      _gameOver = false;
      _pipes[0] = _PipePair(x: 290, topHeight: 75);
      _pipes[1] = _PipePair(x: 460, topHeight: 110);
    });
    widget.onScoreUpdate(0);
  }

  void _flap() {
    if (_gameOver) return;
    if (!_started) {
      _started = true;
      _ticker = Timer.periodic(const Duration(milliseconds: 16), (_) => _tick());
    }
    setState(() {
      _bugVy = _jump;
    });
  }

  void _tick() {
    if (widget.isPaused || _gameOver || !_started) return;

    final h = 280.0;
    _bugVy += _gravity;
    _bugY += _bugVy;

    // Pipe movement & collision
    for (var p in _pipes) {
      p.x -= 2.0;

      // Score update
      if (!p.passed && p.x + _pipeWidth < 50) {
        p.passed = true;
        _score++;
        widget.onScoreUpdate(_score);
      }

      // Recycle pipe
      if (p.x < -_pipeWidth) {
        final rightmost = max(_pipes[0].x, _pipes[1].x);
        p.x = rightmost + 160;
        p.topHeight = 35.0 + Random().nextInt(110);
        p.passed = false;
      }

      // Pipe collision
      const bugX = 50.0;
      const bugRadius = 11.0;
      if (bugX + bugRadius > p.x && bugX - bugRadius < p.x + _pipeWidth) {
        if (_bugY - bugRadius < p.topHeight || _bugY + bugRadius > p.topHeight + _pipeGap) {
          _endGame();
          return;
        }
      }
    }

    // Floor or ceiling collision
    if (_bugY + 11 >= h - 16 || _bugY - 11 <= 0) {
      _endGame();
      return;
    }

    setState(() {});
  }

  void _endGame() {
    _ticker?.cancel();
    setState(() {
      _gameOver = true;
    });
    widget.onGameOver(_score, {'pipes': _score});
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Flap to Fly', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.lightBlue)),
            Row(
              children: [
                Text(
                  'SCORE: $_score',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.green),
                ),
                const SizedBox(width: 4),
                IconButton(
                  onPressed: _resetGame,
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Flappy Canvas Viewport
        GestureDetector(
          onTap: _flap,
          child: Container(
            width: 280,
            height: 280,
            decoration: BoxDecoration(
              color: const Color(0xFF0284C7),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white12),
            ),
            child: Stack(
              children: [
                CustomPaint(
                  size: const Size(280, 280),
                  painter: _FlappyPainter(
                    bugY: _bugY,
                    pipes: _pipes,
                    pipeWidth: _pipeWidth,
                    pipeGap: _pipeGap,
                  ),
                ),
                if (!_started && !_gameOver)
                  const Center(
                    child: Text(
                      'Tap Screen to Flap 🐞',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 12),
        const Text(
          'Tap repeatedly to flap wings and avoid obstacles!',
          style: TextStyle(fontSize: 11, color: Colors.grey),
        ),
      ],
    );
  }
}

class _PipePair {
  double x;
  double topHeight;
  bool passed;

  _PipePair({required this.x, required this.topHeight, bool? passed}) : passed = passed ?? false;
}

class _FlappyPainter extends CustomPainter {
  final double bugY;
  final List<_PipePair> pipes;
  final double pipeWidth;
  final double pipeGap;

  _FlappyPainter({
    required this.bugY,
    required this.pipes,
    required this.pipeWidth,
    required this.pipeGap,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Ground
    final groundPaint = Paint()..color = const Color(0xFF15803D);
    canvas.drawRect(Rect.fromLTWH(0, size.height - 16, size.width, 16), groundPaint);

    // Pipes
    final pipePaint = Paint()..color = const Color(0xFF22C55E);
    for (final p in pipes) {
      // Top pipe
      canvas.drawRRect(
        RRect.fromRectAndRadius(Rect.fromLTWH(p.x, 0, pipeWidth, p.topHeight), const Radius.circular(4)),
        pipePaint,
      );
      // Bottom pipe
      final botY = p.topHeight + pipeGap;
      canvas.drawRRect(
        RRect.fromRectAndRadius(Rect.fromLTWH(p.x, botY, pipeWidth, size.height - 16 - botY), const Radius.circular(4)),
        pipePaint,
      );
    }

    // Bug mascot
    const bugX = 50.0;
    final bugPaint = Paint()..color = const Color(0xFF10B981);
    canvas.drawCircle(Offset(bugX, bugY), 11, bugPaint);

    // Eye
    final eyePaint = Paint()..color = Colors.white;
    canvas.drawCircle(Offset(bugX + 5, bugY - 3), 3.5, eyePaint);
    final pupilPaint = Paint()..color = Colors.black;
    canvas.drawCircle(Offset(bugX + 6.5, bugY - 3), 1.5, pupilPaint);
  }

  @override
  bool shouldRepaint(covariant _FlappyPainter oldDelegate) => true;
}
