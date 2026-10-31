import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';

class FlutterSnake extends StatefulWidget {
  final Function(int score, Map<String, dynamic> metadata) onGameOver;
  final Function(int score) onScoreUpdate;
  final bool isPaused;

  const FlutterSnake({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    this.isPaused = false,
  });

  @override
  State<FlutterSnake> createState() => _FlutterSnakeState();
}

class _FlutterSnakeState extends State<FlutterSnake> {
  static const int _gridSize = 20;
  static const int _baseSpeedMs = 150;

  List<Point<int>> _snake = [
    const Point(10, 10),
    const Point(9, 10),
    const Point(8, 10),
  ];
  Point<int> _direction = const Point(1, 0);
  Point<int> _food = const Point(15, 10);
  Point<int>? _goldenFood;
  Timer? _gameTimer;
  Timer? _goldenTimer;
  int _score = 0;
  int _applesCount = 0;
  bool _gameOver = false;

  @override
  void initState() {
    super.initState();
    _startGame();
  }

  @override
  void dispose() {
    _gameTimer?.cancel();
    _goldenTimer?.cancel();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant FlutterSnake oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPaused != oldWidget.isPaused) {
      if (widget.isPaused) {
        _gameTimer?.cancel();
      } else if (!_gameOver) {
        _resumeTicker();
      }
    }
  }

  void _startGame() {
    _gameTimer?.cancel();
    _goldenTimer?.cancel();
    setState(() {
      _snake = [
        const Point(10, 10),
        const Point(9, 10),
        const Point(8, 10),
      ];
      _direction = const Point(1, 0);
      _food = const Point(15, 10);
      _goldenFood = null;
      _score = 0;
      _applesCount = 0;
      _gameOver = false;
    });
    widget.onScoreUpdate(0);
    _resumeTicker();
  }

  void _resumeTicker() {
    _gameTimer?.cancel();
    final speed = max(70, _baseSpeedMs - (_score ~/ 20) * 4);
    _gameTimer = Timer.periodic(Duration(milliseconds: speed), (_) => _tick());
  }

  Point<int> _generateFood() {
    final rand = Random();
    Point<int> pos;
    do {
      pos = Point(rand.nextInt(_gridSize), rand.nextInt(_gridSize));
    } while (_snake.contains(pos));
    return pos;
  }

  void _changeDirection(Point<int> newDir) {
    if (newDir.x != -_direction.x && newDir.y != -_direction.y) {
      setState(() {
        _direction = newDir;
      });
    }
  }

  void _tick() {
    if (widget.isPaused || _gameOver) return;

    final head = _snake.first;
    final newHead = Point(head.x + _direction.x, head.y + _direction.y);

    // Wall collision
    if (newHead.x < 0 || newHead.x >= _gridSize || newHead.y < 0 || newHead.y >= _gridSize) {
      _endGame();
      return;
    }

    // Self collision
    if (_snake.contains(newHead)) {
      _endGame();
      return;
    }

    setState(() {
      _snake.insert(0, newHead);

      // Check standard food
      if (newHead == _food) {
        _score += 10;
        _applesCount++;
        _food = _generateFood();

        // Spawn golden apple every 4 apples
        if (_applesCount % 4 == 0 && _goldenFood == null) {
          _goldenFood = _generateFood();
          _goldenTimer?.cancel();
          _goldenTimer = Timer(const Duration(seconds: 7), () {
            if (mounted) {
              setState(() {
                _goldenFood = null;
              });
            }
          });
        }
        _resumeTicker();
      } else if (_goldenFood != null && newHead == _goldenFood) {
        _score += 50;
        _goldenFood = null;
        _goldenTimer?.cancel();
      } else {
        _snake.removeLast();
      }
    });

    widget.onScoreUpdate(_score);
  }

  void _endGame() {
    _gameTimer?.cancel();
    _goldenTimer?.cancel();
    setState(() {
      _gameOver = true;
    });
    widget.onGameOver(_score, {'length': _snake.length});
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Stats bar
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.circle, size: 10, color: Colors.red),
                const SizedBox(width: 4),
                Text('$_applesCount apples', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                if (_goldenFood != null) ...[
                  const SizedBox(width: 8),
                  const Text('⭐ Golden!', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber)),
                ],
              ],
            ),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    'SCORE: $_score',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.green),
                  ),
                ),
                const SizedBox(width: 6),
                IconButton(
                  onPressed: _startGame,
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  tooltip: 'Restart',
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Custom Canvas Grid
        GestureDetector(
          onHorizontalDragEnd: (details) {
            final vx = details.primaryVelocity ?? 0;
            if (vx > 100) _changeDirection(const Point(1, 0));
            if (vx < -100) _changeDirection(const Point(-1, 0));
          },
          onVerticalDragEnd: (details) {
            final vy = details.primaryVelocity ?? 0;
            if (vy > 100) _changeDirection(const Point(0, 1));
            if (vy < -100) _changeDirection(const Point(0, -1));
          },
          child: Container(
            width: 280,
            height: 280,
            decoration: BoxDecoration(
              color: const Color(0xFF090D16),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white12),
            ),
            child: CustomPaint(
              painter: _SnakePainter(
                snake: _snake,
                food: _food,
                goldenFood: _goldenFood,
                gridSize: _gridSize,
              ),
            ),
          ),
        ),

        const SizedBox(height: 12),
        // Onscreen D-Pad for Mobile
        Column(
          children: [
            InkWell(
              onTap: () => _changeDirection(const Point(0, -1)),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: 48,
                height: 40,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.keyboard_arrow_up_rounded),
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                InkWell(
                  onTap: () => _changeDirection(const Point(-1, 0)),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 48,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.keyboard_arrow_left_rounded),
                  ),
                ),
                const SizedBox(width: 8),
                InkWell(
                  onTap: () => _changeDirection(const Point(0, 1)),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 48,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.keyboard_arrow_down_rounded),
                  ),
                ),
                const SizedBox(width: 8),
                InkWell(
                  onTap: () => _changeDirection(const Point(1, 0)),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 48,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.keyboard_arrow_right_rounded),
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}

class _SnakePainter extends CustomPainter {
  final List<Point<int>> snake;
  final Point<int> food;
  final Point<int>? goldenFood;
  final int gridSize;

  _SnakePainter({
    required this.snake,
    required this.food,
    this.goldenFood,
    required this.gridSize,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final cellW = size.width / gridSize;
    final cellH = size.height / gridSize;

    // Draw grid lines
    final gridPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.05)
      ..style = PaintingStyle.stroke;
    for (int i = 0; i <= gridSize; i++) {
      canvas.drawLine(Offset(i * cellW, 0), Offset(i * cellW, size.height), gridPaint);
      canvas.drawLine(Offset(0, i * cellH), Offset(size.width, i * cellH), gridPaint);
    }

    // Draw regular food
    final foodPaint = Paint()..color = Colors.red;
    canvas.drawCircle(
      Offset((food.x + 0.5) * cellW, (food.y + 0.5) * cellH),
      cellW * 0.42,
      foodPaint,
    );

    // Draw golden food
    if (goldenFood != null) {
      final goldenPaint = Paint()
        ..color = Colors.amber
        ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 4);
      canvas.drawCircle(
        Offset((goldenFood!.x + 0.5) * cellW, (goldenFood!.y + 0.5) * cellH),
        cellW * 0.48,
        goldenPaint,
      );
    }

    // Draw Snake
    for (int i = 0; i < snake.length; i++) {
      final seg = snake[i];
      final isHead = i == 0;
      final paint = Paint()
        ..color = isHead ? const Color(0xFF10B981) : (i.isEven ? const Color(0xFF10B981) : const Color(0xFF059669));

      final rect = RRect.fromRectAndRadius(
        Rect.fromLTWH(seg.x * cellW + 1, seg.y * cellH + 1, cellW - 2, cellH - 2),
        Radius.circular(isHead ? 5 : 3),
      );
      canvas.drawRRect(rect, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _SnakePainter oldDelegate) => true;
}
