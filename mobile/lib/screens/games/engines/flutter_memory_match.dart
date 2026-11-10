import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class FlutterMemoryMatch extends StatefulWidget {
  final void Function(int score, Map<String, dynamic> metadata) onGameOver;
  final void Function(int score) onScoreUpdate;
  final bool isPaused;

  const FlutterMemoryMatch({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    required this.isPaused,
  });

  @override
  State<FlutterMemoryMatch> createState() => _FlutterMemoryMatchState();
}

class _FlutterMemoryMatchState extends State<FlutterMemoryMatch> {
  static const List<String> _symbols = [
    '⚛️', '🐍', '🚀', '⚡', '💻', '🔥', '🎨', '⚙️'
  ];

  late List<Map<String, dynamic>> _cards;
  final List<int> _flippedIndices = [];
  final Set<int> _matchedIndices = {};

  int _moves = 0;
  int _score = 0;
  int _streak = 0;
  int _seconds = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _initCards();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _initCards() {
    _timer?.cancel();
    _seconds = 0;
    _moves = 0;
    _score = 0;
    _streak = 0;
    _flippedIndices.clear();
    _matchedIndices.clear();

    final List<Map<String, dynamic>> deck = [];
    for (int i = 0; i < _symbols.length; i++) {
      deck.add({'symbol': _symbols[i], 'pairId': i});
      deck.add({'symbol': _symbols[i], 'pairId': i});
    }
    deck.shuffle();

    setState(() {
      _cards = deck;
    });
  }

  void _onCardTap(int index) {
    if (widget.isPaused ||
        _flippedIndices.contains(index) ||
        _matchedIndices.contains(index) ||
        _flippedIndices.length >= 2) {
      return;
    }

    if (_timer == null || !_timer!.isActive) {
      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (!widget.isPaused && mounted) {
          setState(() {
            _seconds++;
          });
        }
      });
    }

    setState(() {
      _flippedIndices.add(index);
    });

    if (_flippedIndices.length == 2) {
      setState(() {
        _moves++;
      });
      final idx1 = _flippedIndices[0];
      final idx2 = _flippedIndices[1];

      if (_cards[idx1]['symbol'] == _cards[idx2]['symbol']) {
        // Match!
        setState(() {
          _matchedIndices.add(idx1);
          _matchedIndices.add(idx2);
          _streak++;
          _score += 100 + (_streak * 30);
          _flippedIndices.clear();
        });
        widget.onScoreUpdate(_score);

        // Win check
        if (_matchedIndices.length == _cards.length) {
          _timer?.cancel();
          final timeBonus = (_seconds < 60) ? (60 - _seconds) * 4 : 0;
          _score += timeBonus;
          widget.onScoreUpdate(_score);
          widget.onGameOver(_score, {
            'moves': _moves,
            'seconds': _seconds,
            'stars': _moves < 14 ? 3 : (_moves < 20 ? 2 : 1)
          });
        }
      } else {
        // Mismatch
        _streak = 0;
        Future.delayed(const Duration(milliseconds: 750), () {
          if (mounted) {
            setState(() {
              _flippedIndices.clear();
            });
          }
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
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
              mainAxisSize: MainAxisSize.min,
              children: [
                // Stats
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '$_moves Moves',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: context.textPrimaryColor),
                    ),
                    Text(
                      '${_seconds ~/ 60}:${(_seconds % 60).toString().padLeft(2, '0')}',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        color: context.textPrimaryColor,
                      ),
                    ),
                    Row(
                      children: [
                        Text(
                          'SCORE: $_score',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            color: AppColors.gameScore,
                            fontFamily: 'monospace',
                          ),
                        ),
                        const SizedBox(width: 4),
                        IconButton(
                          onPressed: _initCards,
                          icon: const Icon(Icons.refresh_rounded, size: 18),
                          visualDensity: VisualDensity.compact,
                          tooltip: 'Reset Board',
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Responsive 4x4 Grid
                ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 310, maxHeight: 310),
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: context.gameCodeBgColor,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: context.gameCodeBorderColor),
                      ),
                      child: GridView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 4,
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                        ),
                        itemCount: 16,
                        itemBuilder: (context, index) {
                          final isFlipped = _flippedIndices.contains(index) || _matchedIndices.contains(index);
                          final isMatched = _matchedIndices.contains(index);

                          Color cardBg = context.cardBgColor;
                          Color cardBorder = context.borderColor;

                          if (isMatched) {
                            cardBg = context.successBgColor;
                            cardBorder = context.successColor;
                          } else if (isFlipped) {
                            cardBg = context.gameBadgeBgColor;
                            cardBorder = AppColors.gamePrimaryButton;
                          }

                          return InkWell(
                            onTap: () => _onCardTap(index),
                            borderRadius: BorderRadius.circular(12),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 250),
                              decoration: BoxDecoration(
                                color: cardBg,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: cardBorder, width: isFlipped || isMatched ? 1.5 : 1),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: context.isDarkMode ? 0.2 : 0.04),
                                    blurRadius: 4,
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  isFlipped ? _cards[index]['symbol'] : '⚡',
                                  style: TextStyle(
                                    fontSize: isFlipped ? 22 : 14,
                                    fontWeight: FontWeight.bold,
                                    color: isFlipped
                                        ? (isMatched ? context.successColor : context.gameBadgeTextColor)
                                        : context.textMutedColor.withValues(alpha: 0.5),
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 12),
                Text(
                  'Tap cards to find matching pairs in minimal moves!',
                  style: TextStyle(fontSize: 11, color: context.textSecondaryColor),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
