import 'dart:math';
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class FlutterTicTacToe extends StatefulWidget {
  final Function(int score, Map<String, dynamic> metadata) onGameOver;
  final Function(int score) onScoreUpdate;
  final bool isPaused;

  const FlutterTicTacToe({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    this.isPaused = false,
  });

  @override
  State<FlutterTicTacToe> createState() => _FlutterTicTacToeState();
}

class _FlutterTicTacToeState extends State<FlutterTicTacToe> {
  List<String?> _board = List.filled(9, null);
  bool _isXNext = true;
  String _mode = 'ai'; // 'ai' or 'pvp'
  String _difficulty = 'unbeatable'; // 'easy', 'medium', 'unbeatable'
  String? _winner;
  List<int>? _winningLine;
  int _score = 0;
  int _winStreak = 0;
  int _xWins = 0;
  int _oWins = 0;
  int _ties = 0;

  static const List<List<int>> _winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  Map<String, dynamic>? _checkWinner(List<String?> board) {
    for (final combo in _winningCombos) {
      final a = combo[0], b = combo[1], c = combo[2];
      if (board[a] != null && board[a] == board[b] && board[a] == board[c]) {
        return {'winner': board[a], 'line': combo};
      }
    }
    if (board.every((cell) => cell != null)) {
      return {'winner': 'Tie', 'line': null};
    }
    return null;
  }

  int _minimax(List<String?> board, int depth, bool isMaximizing) {
    final outcome = _checkWinner(board);
    if (outcome != null) {
      if (outcome['winner'] == 'O') return 10 - depth;
      if (outcome['winner'] == 'X') return depth - 10;
      if (outcome['winner'] == 'Tie') return 0;
    }

    if (isMaximizing) {
      int best = -1000;
      for (int i = 0; i < 9; i++) {
        if (board[i] == null) {
          board[i] = 'O';
          final val = _minimax(board, depth + 1, false);
          board[i] = null;
          best = max(best, val);
        }
      }
      return best;
    } else {
      int best = 1000;
      for (int i = 0; i < 9; i++) {
        if (board[i] == null) {
          board[i] = 'X';
          final val = _minimax(board, depth + 1, true);
          board[i] = null;
          best = min(best, val);
        }
      }
      return best;
    }
  }

  int? _getAiMove() {
    final available = <int>[];
    for (int i = 0; i < 9; i++) {
      if (_board[i] == null) available.add(i);
    }
    if (available.isEmpty) return null;

    final rand = Random();
    if (_difficulty == 'easy' || (_difficulty == 'medium' && rand.nextDouble() > 0.6)) {
      return available[rand.nextInt(available.length)];
    }

    int bestVal = -1000;
    int bestMove = available.first;

    for (final move in available) {
      _board[move] = 'O';
      final moveVal = _minimax(_board, 0, false);
      _board[move] = null;
      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = move;
      }
    }
    return bestMove;
  }

  void _handleCellTap(int index) {
    if (widget.isPaused || _board[index] != null || _winner != null) return;
    if (_mode == 'ai' && !_isXNext) return;

    setState(() {
      _board[index] = _isXNext ? 'X' : 'O';
    });

    final outcome = _checkWinner(_board);
    if (outcome != null) {
      _finishRound(outcome['winner'] as String, outcome['line'] as List<int>?);
      return;
    }

    setState(() {
      _isXNext = !_isXNext;
    });

    if (_mode == 'ai' && !_isXNext) {
      Future.delayed(const Duration(milliseconds: 320), () {
        if (!mounted || _winner != null || widget.isPaused) return;
        final aiMove = _getAiMove();
        if (aiMove != null) {
          setState(() {
            _board[aiMove] = 'O';
          });
          final aiOutcome = _checkWinner(_board);
          if (aiOutcome != null) {
            _finishRound(aiOutcome['winner'] as String, aiOutcome['line'] as List<int>?);
          } else {
            setState(() {
              _isXNext = true;
            });
          }
        }
      });
    }
  }

  void _finishRound(String won, List<int>? line) {
    setState(() {
      _winner = won;
      _winningLine = line;
    });

    if (won == 'X') {
      _winStreak++;
      final mult = _difficulty == 'unbeatable' ? 150 : (_difficulty == 'medium' ? 100 : 50);
      _score += mult + (_winStreak * 25);
      _xWins++;
      widget.onScoreUpdate(_score);
      widget.onGameOver(_score, {'result': 'win', 'streak': _winStreak});
    } else if (won == 'O') {
      _winStreak = 0;
      _oWins++;
      widget.onGameOver(_score, {'result': 'loss'});
    } else {
      _score += 20;
      _ties++;
      widget.onScoreUpdate(_score);
      widget.onGameOver(_score, {'result': 'tie'});
    }
  }

  void _resetRound() {
    setState(() {
      _board = List.filled(9, null);
      _isXNext = true;
      _winner = null;
      _winningLine = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Mode & Difficulty Bar
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'ai', label: Text('vs AI', style: TextStyle(fontSize: 11))),
                ButtonSegment(value: 'pvp', label: Text('2 Players', style: TextStyle(fontSize: 11))),
              ],
              selected: {_mode},
              onSelectionChanged: (val) {
                setState(() {
                  _mode = val.first;
                  _resetRound();
                });
              },
              style: const ButtonStyle(visualDensity: VisualDensity.compact),
            ),
            if (_mode == 'ai')
              DropdownButton<String>(
                value: _difficulty,
                underline: const SizedBox.shrink(),
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : AppColors.primary,
                ),
                items: const [
                  DropdownMenuItem(value: 'easy', child: Text('Easy AI')),
                  DropdownMenuItem(value: 'medium', child: Text('Medium AI')),
                  DropdownMenuItem(value: 'unbeatable', child: Text('Unbeatable AI')),
                ],
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _difficulty = val;
                      _resetRound();
                    });
                  }
                },
              ),
          ],
        ),
        const SizedBox(height: 12),

        // Turn & Streak Status
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _winner != null
                  ? (_winner == 'Tie' ? "It's a Draw!" : '$_winner Wins! 🎉')
                  : 'Turn: ${_isXNext ? 'Player X' : (_mode == 'ai' ? 'AI Bot (O)' : 'Player O')}',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: _isXNext ? Colors.cyan : Colors.pinkAccent,
              ),
            ),
            if (_winStreak > 0)
              Text(
                '🔥 $_winStreak Streak!',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.amber),
              ),
          ],
        ),
        const SizedBox(height: 14),

        // 3x3 Grid
        Container(
          width: 280,
          height: 280,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: isDark ? Colors.white12 : Colors.black12),
          ),
          child: GridView.builder(
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemCount: 9,
            itemBuilder: (context, index) {
              final cell = _board[index];
              final isWin = _winningLine?.contains(index) == true;

              return InkWell(
                onTap: () => _handleCellTap(index),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  decoration: BoxDecoration(
                    color: isWin
                        ? Colors.amber
                        : (isDark ? const Color(0xFF0F172A) : Colors.white),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isWin
                          ? Colors.amberAccent
                          : (cell == 'X'
                              ? Colors.cyan.withValues(alpha: 0.5)
                              : (cell == 'O'
                                  ? Colors.pinkAccent.withValues(alpha: 0.5)
                                  : Colors.transparent)),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      cell ?? '',
                      style: TextStyle(
                        fontSize: 38,
                        fontWeight: FontWeight.w900,
                        color: isWin
                            ? Colors.black
                            : (cell == 'X' ? Colors.cyan : Colors.pinkAccent),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        const SizedBox(height: 16),
        // Scorecard
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildScoreItem('Player X', '$_xWins', Colors.cyan),
            _buildScoreItem('Ties', '$_ties', Colors.grey),
            _buildScoreItem(_mode == 'ai' ? 'AI Bot' : 'Player O', '$_oWins', Colors.pinkAccent),
          ],
        ),
      ],
    );
  }

  Widget _buildScoreItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color)),
      ],
    );
  }
}
