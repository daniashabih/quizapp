import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';

class FlutterWordRain extends StatefulWidget {
  final void Function(int score, Map<String, dynamic> metadata) onGameOver;
  final void Function(int score) onScoreUpdate;
  final bool isPaused;

  const FlutterWordRain({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    required this.isPaused,
  });

  @override
  State<FlutterWordRain> createState() => _FlutterWordRainState();
}

class _FallingWordItem {
  final String id;
  final String text;
  double y; // 0.0 to 1.0 (top to bottom)
  final double x; // 0.1 to 0.85
  final double speed;

  _FallingWordItem({
    required this.id,
    required this.text,
    required this.y,
    required this.x,
    required this.speed,
  });
}

class _FlutterWordRainState extends State<FlutterWordRain> {
  final TextEditingController _inputController = TextEditingController();
  final List<_FallingWordItem> _activeWords = [];
  Timer? _gameTimer;

  int _score = 0;
  int _lives = 3;
  bool _isGameOver = false;

  static const List<String> _wordPool = [
    'async', 'await', 'const', 'let', 'class',
    'function', 'promise', 'closure', 'stream', 'import',
    'export', 'return', 'boolean', 'string', 'number',
    'database', 'router', 'schema', 'module', 'syntax',
  ];

  @override
  void initState() {
    super.initState();
    _startLoop();
  }

  @override
  void dispose() {
    _gameTimer?.cancel();
    _inputController.dispose();
    super.dispose();
  }

  void _startLoop() {
    _gameTimer?.cancel();
    int tick = 0;
    _gameTimer = Timer.periodic(const Duration(milliseconds: 60), (timer) {
      if (widget.isPaused || _isGameOver) return;
      tick++;

      setState(() {
        // Spawn every ~2.5s (40 ticks)
        if (tick % 40 == 0 && _activeWords.length < 5) {
          final word = _wordPool[Random().nextInt(_wordPool.length)];
          _activeWords.add(
            _FallingWordItem(
              id: '${DateTime.now().millisecondsSinceEpoch}',
              text: word,
              y: 0.0,
              x: 0.1 + (Random().nextDouble() * 0.65),
              speed: 0.012 + (Random().nextDouble() * 0.008),
            ),
          );
        }

        // Update positions
        final List<_FallingWordItem> toRemove = [];
        for (var item in _activeWords) {
          item.y += item.speed;
          if (item.y >= 0.90) {
            toRemove.add(item);
            _lives--;
          }
        }

        for (var item in toRemove) {
          _activeWords.remove(item);
        }

        if (_lives <= 0) {
          _isGameOver = true;
          _gameTimer?.cancel();
          widget.onGameOver(_score, {'livesRemaining': 0});
        }
      });
    });
  }

  void _onTextChanged(String val) {
    if (_isGameOver || widget.isPaused) return;

    final query = val.trim().toLowerCase();
    final matchIdx = _activeWords.indexWhere((w) => w.text == query);

    if (matchIdx != -1) {
      setState(() {
        _activeWords.removeAt(matchIdx);
        _score += 100;
        _inputController.clear();
      });
      widget.onScoreUpdate(_score);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: List.generate(3, (idx) {
                    return Icon(
                      idx < _lives ? Icons.favorite : Icons.favorite_border,
                      color: Colors.red,
                      size: 20,
                    );
                  }),
                ),
                Text(
                  'Score: $_score',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                ),
              ],
            ),
            const SizedBox(height: 10),
            // Sky Canvas Container
            Container(
              height: 240,
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Stack(
                children: [
                  // Danger Line at bottom
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 24,
                    child: Container(
                      color: Colors.red.withValues(alpha: 0.2),
                      alignment: Alignment.center,
                      child: const Text(
                        'DANGER ZONE',
                        style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  // Falling words
                  ..._activeWords.map((item) {
                    return Positioned(
                      left: item.x * 240, // rough scale
                      top: item.y * 200,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: item.y > 0.65 ? Colors.redAccent : Colors.purpleAccent.shade400,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          item.text,
                          style: const TextStyle(
                            color: Colors.white,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    );
                  }),
                  if (_isGameOver)
                    Container(
                      color: Colors.black54,
                      alignment: Alignment.center,
                      child: const Text(
                        'GAME OVER',
                        style: TextStyle(color: Colors.red, fontWeight: FontWeight.w900, fontSize: 24),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _inputController,
              enabled: !_isGameOver && !widget.isPaused,
              onChanged: _onTextChanged,
              decoration: InputDecoration(
                hintText: 'Type falling keyword and enter...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
