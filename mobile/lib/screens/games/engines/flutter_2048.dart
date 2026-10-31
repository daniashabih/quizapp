import 'dart:math';
import 'package:flutter/material.dart';

class Flutter2048 extends StatefulWidget {
  final Function(int score, Map<String, dynamic> metadata) onGameOver;
  final Function(int score) onScoreUpdate;
  final bool isPaused;

  const Flutter2048({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    this.isPaused = false,
  });

  @override
  State<Flutter2048> createState() => _Flutter2048State();
}

class _Flutter2048State extends State<Flutter2048> {
  static const int _gridSize = 4;
  late List<List<int>> _board;
  List<List<int>>? _previousBoard;
  int _score = 0;
  int _previousScore = 0;
  bool _gameOver = false;
  bool _won = false;

  @override
  void initState() {
    super.initState();
    _initGame();
  }

  void _initGame() {
    _board = List.generate(_gridSize, (_) => List.filled(_gridSize, 0));
    _score = 0;
    _previousBoard = null;
    _gameOver = false;
    _won = false;
    _spawnTile();
    _spawnTile();
    widget.onScoreUpdate(0);
  }

  void _spawnTile() {
    final emptyCells = <Point<int>>[];
    for (int r = 0; r < _gridSize; r++) {
      for (int c = 0; c < _gridSize; c++) {
        if (_board[r][c] == 0) emptyCells.add(Point(r, c));
      }
    }
    if (emptyCells.isEmpty) return;
    final random = Random();
    final target = emptyCells[random.nextInt(emptyCells.length)];
    _board[target.x][target.y] = random.nextDouble() < 0.9 ? 2 : 4;
  }

  bool _canMove() {
    for (int r = 0; r < _gridSize; r++) {
      for (int c = 0; c < _gridSize; c++) {
        if (_board[r][c] == 0) return true;
        if (r + 1 < _gridSize && _board[r + 1][c] == _board[r][c]) return true;
        if (c + 1 < _gridSize && _board[r][c + 1] == _board[r][c]) return true;
      }
    }
    return false;
  }

  List<int> _slideRow(List<int> row, int Function(int gained) onGain) {
    final nonZeros = row.where((v) => v != 0).toList();
    final result = <int>[];
    for (int i = 0; i < nonZeros.length; i++) {
      if (i < nonZeros.length - 1 && nonZeros[i] == nonZeros[i + 1]) {
        final merged = nonZeros[i] * 2;
        result.add(merged);
        onGain(merged);
        i++;
      } else {
        result.add(nonZeros[i]);
      }
    }
    while (result.length < _gridSize) {
      result.add(0);
    }
    return result;
  }

  void _move(String direction) {
    if (widget.isPaused || _gameOver) return;

    final oldBoard = _board.map((r) => List<int>.from(r)).toList();
    final oldScore = _score;
    int gained = 0;
    bool moved = false;

    List<List<int>> transformed = [];
    if (direction == 'left') {
      transformed = _board;
    } else if (direction == 'right') {
      transformed = _board.map((r) => r.reversed.toList()).toList();
    } else if (direction == 'up') {
      transformed = List.generate(_gridSize, (c) => List.generate(_gridSize, (r) => _board[r][c]));
    } else if (direction == 'down') {
      transformed = List.generate(_gridSize, (c) => List.generate(_gridSize, (r) => _board[r][c]).reversed.toList());
    }

    final processed = <List<int>>[];
    for (int r = 0; r < _gridSize; r++) {
      processed.add(_slideRow(transformed[r], (pts) => gained += pts));
    }

    List<List<int>> finalBoard = [];
    if (direction == 'left') {
      finalBoard = processed;
    } else if (direction == 'right') {
      finalBoard = processed.map((r) => r.reversed.toList()).toList();
    } else if (direction == 'up') {
      finalBoard = List.generate(_gridSize, (c) => List.generate(_gridSize, (r) => processed[r][c]));
    } else if (direction == 'down') {
      finalBoard = List.generate(_gridSize, (c) => List.generate(_gridSize, (r) => processed[r][c]).reversed.toList());
    }

    for (int r = 0; r < _gridSize; r++) {
      for (int c = 0; c < _gridSize; c++) {
        if (finalBoard[r][c] != _board[r][c]) {
          moved = true;
          break;
        }
      }
      if (moved) break;
    }

    if (moved) {
      setState(() {
        _previousBoard = oldBoard;
        _previousScore = oldScore;
        _board = finalBoard;
        _score += gained;
        _spawnTile();

        if (!_won) {
          for (final row in _board) {
            if (row.contains(2048)) {
              _won = true;
              break;
            }
          }
        }

        if (!_canMove()) {
          _gameOver = true;
          widget.onGameOver(_score, {'won': _won});
        }
      });
      widget.onScoreUpdate(_score);
    }
  }

  void _undo() {
    if (_previousBoard != null && !_gameOver) {
      setState(() {
        _board = _previousBoard!;
        _score = _previousScore;
        _previousBoard = null;
      });
      widget.onScoreUpdate(_score);
    }
  }

  Color _getTileColor(int val, bool isDark) {
    switch (val) {
      case 2:
        return const Color(0xFFEEE4DA);
      case 4:
        return const Color(0xFFEDE0C8);
      case 8:
        return const Color(0xFFF2B179);
      case 16:
        return const Color(0xFFF59563);
      case 32:
        return const Color(0xFFF67C5F);
      case 64:
        return const Color(0xFFF65E3B);
      case 128:
        return const Color(0xFFEDCF72);
      case 256:
        return const Color(0xFFEDCC61);
      case 512:
        return const Color(0xFFEDC850);
      case 1024:
        return const Color(0xFFEDC53F);
      case 2048:
        return const Color(0xFFEDC22E);
      default:
        return isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Top Toolbar
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                OutlinedButton.icon(
                  onPressed: _previousBoard != null && !_gameOver ? _undo : null,
                  icon: const Icon(Icons.undo_rounded, size: 14),
                  label: const Text('Undo', style: TextStyle(fontSize: 11)),
                  style: OutlinedButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton.icon(
                  onPressed: _initGame,
                  icon: const Icon(Icons.refresh_rounded, size: 14),
                  label: const Text('Reset', style: TextStyle(fontSize: 11)),
                  style: FilledButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'SCORE: $_score',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.amber),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Gestures Swipe Container
        GestureDetector(
          onHorizontalDragEnd: (details) {
            final vx = details.primaryVelocity ?? 0;
            if (vx > 100) _move('right');
            if (vx < -100) _move('left');
          },
          onVerticalDragEnd: (details) {
            final vy = details.primaryVelocity ?? 0;
            if (vy > 100) _move('down');
            if (vy < -100) _move('up');
          },
          child: Container(
            width: 290,
            height: 290,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F172A) : const Color(0xFFBBADA0),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: isDark ? Colors.white12 : Colors.black12),
            ),
            child: GridView.builder(
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                crossAxisSpacing: 6,
                mainAxisSpacing: 6,
              ),
              itemCount: 16,
              itemBuilder: (context, index) {
                final r = index ~/ 4;
                final c = index % 4;
                final val = _board[r][c];
                final hasValue = val > 0;
                final color = _getTileColor(val, isDark);
                final textColor = (val == 2 || val == 4) ? const Color(0xFF776E65) : Colors.white;

                return Container(
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: hasValue
                        ? Text(
                            '$val',
                            style: TextStyle(
                              fontSize: val > 512 ? 16 : 20,
                              fontWeight: FontWeight.w900,
                              color: textColor,
                            ),
                          )
                        : null,
                  ),
                );
              },
            ),
          ),
        ),

        const SizedBox(height: 14),
        Text(
          'Swipe left, right, up, or down to merge numbers!',
          style: TextStyle(fontSize: 11, color: isDark ? Colors.grey : Colors.black54),
        ),
      ],
    );
  }
}
