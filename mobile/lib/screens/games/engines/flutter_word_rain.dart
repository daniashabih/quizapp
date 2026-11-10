import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

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

  void _handleRestart() {
    setState(() {
      _activeWords.clear();
      _score = 0;
      _lives = 3;
      _isGameOver = false;
      _inputController.clear();
    });
    _startLoop();
  }

  @override
  Widget build(BuildContext context) {
    final isKeyboardOpen = MediaQuery.viewInsetsOf(context).bottom > 80;
    final canvasHeight = isKeyboardOpen ? 165.0 : 220.0;

    return SingleChildScrollView(
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: context.cardBgColor,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: context.borderColor),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: context.isDarkMode ? 0.3 : 0.05),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: List.generate(3, (idx) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 3),
                          child: Icon(
                            idx < _lives ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                            color: const Color(0xFFC96155),
                            size: 20,
                          ),
                        );
                      }),
                    ),
                    Text(
                      'Score: $_score',
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                        fontFamily: 'monospace',
                        color: AppColors.gameScore,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Sky Canvas Container
                LayoutBuilder(
                  builder: (context, constraints) {
                    final maxWordX = max(140.0, constraints.maxWidth - 95.0);
                    return Container(
                      height: canvasHeight,
                      clipBehavior: Clip.hardEdge,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0F172A), Color(0xFF1E1B4B)],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: context.borderColor),
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
                              left: (item.x * maxWordX).clamp(8.0, maxWordX),
                              top: item.y * (canvasHeight - 36),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: item.y > 0.65 ? const Color(0xFF991B1B) : const Color(0xFF6366F1),
                                  borderRadius: BorderRadius.circular(8),
                                  boxShadow: [
                                    BoxShadow(
                                      color: (item.y > 0.65 ? Colors.red : Colors.indigo).withValues(alpha: 0.4),
                                      blurRadius: 6,
                                    ),
                                  ],
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
                              color: Colors.black.withValues(alpha: 0.75),
                              alignment: Alignment.center,
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Text(
                                    'GAME OVER',
                                    style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w900, fontSize: 22),
                                  ),
                                  const SizedBox(height: 8),
                                  FilledButton.icon(
                                    onPressed: _handleRestart,
                                    icon: const Icon(Icons.replay_rounded, size: 16),
                                    label: const Text('Play Again'),
                                    style: FilledButton.styleFrom(
                                      minimumSize: const Size(0, 40),
                                      backgroundColor: AppColors.gamePrimaryButton,
                                      foregroundColor: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _inputController,
                  enabled: !_isGameOver && !widget.isPaused,
                  onChanged: _onTextChanged,
                  style: TextStyle(
                    color: context.textPrimaryColor,
                    fontFamily: 'monospace',
                    fontSize: 13,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Type falling keyword...',
                    hintStyle: TextStyle(color: context.textMutedColor),
                    filled: true,
                    fillColor: context.cardBgColor,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: context.borderColor),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: context.borderColor),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.gamePrimaryButton, width: 2),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
