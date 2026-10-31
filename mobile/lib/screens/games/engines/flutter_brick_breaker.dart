import 'dart:async';
import 'package:flutter/material.dart';

class FlutterBrickBreaker extends StatefulWidget {
  final Function(int score, Map<String, dynamic> metadata) onGameOver;
  final Function(int score) onScoreUpdate;
  final bool isPaused;

  const FlutterBrickBreaker({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    this.isPaused = false,
  });

  @override
  State<FlutterBrickBreaker> createState() => _FlutterBrickBreakerState();
}

class _FlutterBrickBreakerState extends State<FlutterBrickBreaker> {
  static const int _rows = 4;
  static const int _cols = 6;
  static const double _paddleWidth = 60.0;
  static const double _paddleHeight = 10.0;
  static const double _ballRadius = 5.0;

  double _paddleX = 110.0;
  double _ballX = 140.0;
  double _ballY = 240.0;
  double _ballDx = 2.4;
  double _ballDy = -2.6;

  late List<List<bool>> _bricks;
  int _score = 0;
  int _lives = 3;
  bool _started = false;
  bool _gameOver = false;
  Timer? _ticker;

  static const List<Color> _rowColors = [
    Color(0xFFEF4444), // Red
    Color(0xFFF97316), // Orange
    Color(0xFFEAB308), // Yellow
    Color(0xFF10B981), // Green
  ];

  static const List<int> _rowScores = [40, 30, 20, 10];

  @override
  void initState() {
    super.initState();
    _resetGame();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant FlutterBrickBreaker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPaused != oldWidget.isPaused) {
      if (widget.isPaused) {
        _ticker?.cancel();
      } else if (_started && !_gameOver) {
        _startTicker();
      }
    }
  }

  void _resetGame() {
    _ticker?.cancel();
    setState(() {
      _paddleX = 110.0;
      _ballX = 140.0;
      _ballY = 240.0;
      _ballDx = 2.4;
      _ballDy = -2.6;
      _bricks = List.generate(_rows, (_) => List.filled(_cols, true));
      _score = 0;
      _lives = 3;
      _started = false;
      _gameOver = false;
    });
    widget.onScoreUpdate(0);
  }

  void _startTicker() {
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(milliseconds: 16), (_) => _tick());
  }

  void _onTapLaunch() {
    if (!_started && !_gameOver) {
      setState(() {
        _started = true;
      });
      _startTicker();
    }
  }

  void _onDragUpdate(DragUpdateDetails details) {
    setState(() {
      _paddleX = (_paddleX + details.delta.dx).clamp(0.0, 280.0 - _paddleWidth);
      if (!_started) {
        _ballX = _paddleX + _paddleWidth / 2;
      }
    });
  }

  void _tick() {
    if (widget.isPaused || _gameOver || !_started) return;

    final w = 280.0;
    final h = 280.0;
    final paddleY = h - 20;

    // Brick layout
    final brickPadding = 4.0;
    final brickOffsetTop = 24.0;
    final brickOffsetLeft = 10.0;
    final brickWidth = (w - (brickOffsetLeft * 2) - ((_cols - 1) * brickPadding)) / _cols;
    final brickHeight = 12.0;

    int remaining = 0;

    // Check collisions with bricks
    for (int r = 0; r < _rows; r++) {
      for (int c = 0; c < _cols; c++) {
        if (_bricks[r][c]) {
          remaining++;
          final bX = c * (brickWidth + brickPadding) + brickOffsetLeft;
          final bY = r * (brickHeight + brickPadding) + brickOffsetTop;

          if (_ballX + _ballRadius > bX &&
              _ballX - _ballRadius < bX + brickWidth &&
              _ballY + _ballRadius > bY &&
              _ballY - _ballRadius < bY + brickHeight) {
            _bricks[r][c] = false;
            _ballDy = -_ballDy;
            _score += _rowScores[r];
            widget.onScoreUpdate(_score);
          }
        }
      }
    }

    // Win check
    if (remaining == 0) {
      _ticker?.cancel();
      _score += 500;
      setState(() {
        _gameOver = true;
      });
      widget.onScoreUpdate(_score);
      widget.onGameOver(_score, {'won': true, 'lives': _lives});
      return;
    }

    // Wall bounce
    if (_ballX + _ballDx > w - _ballRadius || _ballX + _ballDx < _ballRadius) {
      _ballDx = -_ballDx;
    }
    if (_ballY + _ballDy < _ballRadius) {
      _ballDy = -_ballDy;
    } else if (_ballY + _ballDy > paddleY - _ballRadius && _ballY < paddleY + _paddleHeight) {
      if (_ballX > _paddleX - 4 && _ballX < _paddleX + _paddleWidth + 4) {
        final hit = (_ballX - (_paddleX + _paddleWidth / 2)) / (_paddleWidth / 2);
        _ballDx = hit * 3.2;
        _ballDy = -_ballDy.abs();
      }
    } else if (_ballY + _ballDy > h) {
      // Ball lost
      _lives--;
      if (_lives <= 0) {
        _ticker?.cancel();
        setState(() {
          _gameOver = true;
        });
        widget.onGameOver(_score, {'won': false});
        return;
      } else {
        _started = false;
        _ticker?.cancel();
        _paddleX = (w - _paddleWidth) / 2;
        _ballX = w / 2;
        _ballY = paddleY - _ballRadius - 2;
        _ballDy = -2.6;
        _ballDx = 2.4;
      }
    }

    setState(() {
      _ballX += _ballDx;
      _ballY += _ballDy;
    });
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
            Row(
              children: List.generate(
                3,
                (i) => Icon(
                  Icons.favorite_rounded,
                  size: 16,
                  color: i < _lives ? Colors.red : Colors.grey,
                ),
              ),
            ),
            Row(
              children: [
                Text(
                  'SCORE: $_score',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.blueAccent),
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

        // Game Canvas
        GestureDetector(
          onTap: _onTapLaunch,
          onHorizontalDragUpdate: _onDragUpdate,
          child: Container(
            width: 280,
            height: 280,
            decoration: BoxDecoration(
              color: const Color(0xFF090D16),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white12),
            ),
            child: Stack(
              children: [
                CustomPaint(
                  size: const Size(280, 280),
                  painter: _BrickPainter(
                    paddleX: _paddleX,
                    paddleWidth: _paddleWidth,
                    paddleHeight: _paddleHeight,
                    ballX: _ballX,
                    ballY: _ballY,
                    ballRadius: _ballRadius,
                    bricks: _bricks,
                    rowColors: _rowColors,
                    rows: _rows,
                    cols: _cols,
                  ),
                ),
                if (!_started && !_gameOver)
                  const Center(
                    child: Text(
                      'Tap Screen to Launch 🚀',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.cyanAccent,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 12),
        const Text(
          'Drag finger left or right to move the paddle.',
          style: TextStyle(fontSize: 11, color: Colors.grey),
        ),
      ],
    );
  }
}

class _BrickPainter extends CustomPainter {
  final double paddleX;
  final double paddleWidth;
  final double paddleHeight;
  final double ballX;
  final double ballY;
  final double ballRadius;
  final List<List<bool>> bricks;
  final List<Color> rowColors;
  final int rows;
  final int cols;

  _BrickPainter({
    required this.paddleX,
    required this.paddleWidth,
    required this.paddleHeight,
    required this.ballX,
    required this.ballY,
    required this.ballRadius,
    required this.bricks,
    required this.rowColors,
    required this.rows,
    required this.cols,
  });

  @override
  void paint(Canvas canvas, Size size) {
    const brickPadding = 4.0;
    const brickOffsetTop = 24.0;
    const brickOffsetLeft = 10.0;
    final brickWidth = (size.width - (brickOffsetLeft * 2) - ((cols - 1) * brickPadding)) / cols;
    const brickHeight = 12.0;

    // Draw Bricks
    for (int r = 0; r < rows; r++) {
      final paint = Paint()..color = rowColors[r];
      for (int c = 0; c < cols; c++) {
        if (bricks[r][c]) {
          final bX = c * (brickWidth + brickPadding) + brickOffsetLeft;
          final bY = r * (brickHeight + brickPadding) + brickOffsetTop;
          canvas.drawRRect(
            RRect.fromRectAndRadius(Rect.fromLTWH(bX, bY, brickWidth, brickHeight), const Radius.circular(3)),
            paint,
          );
        }
      }
    }

    // Draw Paddle
    final paddleY = size.height - 20;
    final paddlePaint = Paint()..color = Colors.cyan;
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(paddleX, paddleY, paddleWidth, paddleHeight), const Radius.circular(5)),
      paddlePaint,
    );

    // Draw Ball
    final ballPaint = Paint()..color = Colors.white;
    canvas.drawCircle(Offset(ballX, ballY), ballRadius, ballPaint);
  }

  @override
  bool shouldRepaint(covariant _BrickPainter oldDelegate) => true;
}
