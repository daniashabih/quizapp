import 'dart:async';
import 'package:flutter/material.dart';

class FlutterMemoryMatch extends StatefulWidget {
  final Function(int score, Map<String, dynamic> metadata) onGameOver;
  final Function(int score) onScoreUpdate;
  final bool isPaused;

  const FlutterMemoryMatch({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    this.isPaused = false,
  });

  @override
  State<FlutterMemoryMatch> createState() => _FlutterMemoryMatchState();
}

class _FlutterMemoryMatchState extends State<FlutterMemoryMatch> {
  static const List<String> _symbols = ['🚀', '🎮', '⚡', '💎', '🐞', '🧠', '🎯', '🏆'];

  late List<Map<String, dynamic>> _cards;
  final List<int> _flippedIndices = [];
  final Set<int> _matchedIndices = {};
  int _moves = 0;
  int _streak = 0;
  int _score = 0;
  int _seconds = 0;
  Timer? _timer;
  bool _started = false;

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
    final deck = <Map<String, dynamic>>[];
    for (int i = 0; i < _symbols.length; i++) {
      deck.add({'id': i * 2, 'symbol': _symbols[i]});
      deck.add({'id': i * 2 + 1, 'symbol': _symbols[i]});
    }
    deck.shuffle();

    setState(() {
      _cards = deck;
      _flippedIndices.clear();
      _matchedIndices.clear();
      _moves = 0;
      _streak = 0;
      _score = 0;
      _seconds = 0;
      _started = false;
    });
    widget.onScoreUpdate(0);
  }

  void _onCardTap(int index) {
    if (widget.isPaused ||
        _matchedIndices.contains(index) ||
        _flippedIndices.contains(index) ||
        _flippedIndices.length == 2) {
      return;
    }

    if (!_started) {
      _started = true;
      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Stats
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('$_moves Moves', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            Text(
              '${_seconds ~/ 60}:${(_seconds % 60).toString().padLeft(2, '0')}',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
            ),
            Row(
              children: [
                Text('SCORE: $_score', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.purpleAccent)),
                const SizedBox(width: 4),
                IconButton(
                  onPressed: _initCards,
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 10),

        // 4x4 Grid
        Container(
          width: 280,
          height: 280,
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
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
              final isFlipped = _flippedIndices.contains(index) || _matchedIndices.contains(index);
              final isMatched = _matchedIndices.contains(index);

              return InkWell(
                onTap: () => _onCardTap(index),
                borderRadius: BorderRadius.circular(12),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  decoration: BoxDecoration(
                    color: isMatched
                        ? Colors.purple.withValues(alpha: 0.25)
                        : (isFlipped
                            ? Colors.purple
                            : (isDark ? const Color(0xFF0F172A) : Colors.white)),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isMatched
                          ? Colors.purpleAccent
                          : (isDark ? Colors.white12 : Colors.black12),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      isFlipped ? _cards[index]['symbol'] : '?',
                      style: TextStyle(
                        fontSize: isFlipped ? 20 : 14,
                        fontWeight: FontWeight.bold,
                        color: isFlipped ? Colors.white : Colors.grey,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        const SizedBox(height: 12),
        const Text(
          'Tap cards to find matching pairs in minimal moves!',
          style: TextStyle(fontSize: 11, color: Colors.grey),
        ),
      ],
    );
  }
}
