import 'package:flutter/material.dart';

class FlutterCodePuzzle extends StatefulWidget {
  final void Function(int score, Map<String, dynamic> metadata) onGameOver;
  final void Function(int score) onScoreUpdate;
  final bool isPaused;

  const FlutterCodePuzzle({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    required this.isPaused,
  });

  @override
  State<FlutterCodePuzzle> createState() => _FlutterCodePuzzleState();
}

class _FlutterCodePuzzleState extends State<FlutterCodePuzzle> {
  int _puzzleIdx = 0;
  List<String> _blocks = [];
  bool? _isCorrect;
  int _score = 0;

  static const List<Map<String, dynamic>> _puzzles = [
    {
      'title': 'Filter & Map Evens Squared',
      'language': 'JavaScript',
      'blocks': [
        'return squared;',
        'const numbers = [1, 2, 3, 4, 5, 6];',
        'const squared = evens.map(n => n * n);',
        'const evens = numbers.filter(n => n % 2 === 0);',
      ],
      'solution': [
        'const numbers = [1, 2, 3, 4, 5, 6];',
        'const evens = numbers.filter(n => n % 2 === 0);',
        'const squared = evens.map(n => n * n);',
        'return squared;',
      ],
      'explanation': 'Initialize numbers array, filter evens, map squares, and return.',
    },
    {
      'title': 'Python Fibonacci Generator',
      'language': 'Python',
      'blocks': [
        'return fib',
        'def get_fib(n):',
        '    for _ in range(2, n):',
        '        fib.append(fib[-1] + fib[-2])',
        '    fib = [0, 1]',
      ],
      'solution': [
        'def get_fib(n):',
        '    fib = [0, 1]',
        '    for _ in range(2, n):',
        '        fib.append(fib[-1] + fib[-2])',
        '    return fib',
      ],
      'explanation': 'Define function, initialize seed list, loop iteratively, return list.',
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadPuzzle();
  }

  void _loadPuzzle() {
    final raw = List<String>.from(_puzzles[_puzzleIdx]['blocks']);
    raw.shuffle();
    setState(() {
      _blocks = raw;
      _isCorrect = null;
    });
  }

  void _moveBlock(int from, int to) {
    if (widget.isPaused || _isCorrect == true) return;
    if (to < 0 || to >= _blocks.length) return;
    setState(() {
      final item = _blocks.removeAt(from);
      _blocks.insert(to, item);
      _isCorrect = null;
    });
  }

  void _checkAnswer() {
    if (widget.isPaused) return;
    final solution = _puzzles[_puzzleIdx]['solution'] as List<String>;
    bool matches = true;
    for (int i = 0; i < solution.length; i++) {
      if (_blocks[i] != solution[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      setState(() {
        _isCorrect = true;
        _score += 250;
      });
      widget.onScoreUpdate(_score);

      Future.delayed(const Duration(milliseconds: 1500), () {
        if (!mounted) return;
        if (_puzzleIdx + 1 < _puzzles.length) {
          setState(() {
            _puzzleIdx++;
            _loadPuzzle();
          });
        } else {
          widget.onGameOver(_score, {'puzzlesSolved': _puzzles.length});
        }
      });
    } else {
      setState(() {
        _isCorrect = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final puzzle = _puzzles[_puzzleIdx];

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
                Chip(
                  label: Text(
                    puzzle['language'],
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  visualDensity: VisualDensity.compact,
                ),
                Text(
                  'Puzzle ${_puzzleIdx + 1} of ${_puzzles.length}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              puzzle['title'],
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 12),
            ...List.generate(_blocks.length, (idx) {
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: _isCorrect == true
                      ? Colors.green.withValues(alpha: 0.15)
                      : _isCorrect == false
                          ? Colors.red.withValues(alpha: 0.15)
                          : Theme.of(context).colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _isCorrect == true
                        ? Colors.green
                        : _isCorrect == false
                            ? Colors.red
                            : Colors.grey.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  children: [
                    Text(
                      '${idx + 1}.',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _blocks[idx],
                        style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.arrow_upward, size: 16),
                      onPressed: idx > 0 ? () => _moveBlock(idx, idx - 1) : null,
                      visualDensity: VisualDensity.compact,
                    ),
                    IconButton(
                      icon: const Icon(Icons.arrow_downward, size: 16),
                      onPressed: idx < _blocks.length - 1 ? () => _moveBlock(idx, idx + 1) : null,
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 12),
            if (_isCorrect == true)
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Correct! ${puzzle['explanation']}',
                  style: const TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            if (_isCorrect == false)
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Incorrect order. Recheck logic and try again!',
                  style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _checkAnswer,
              icon: const Icon(Icons.check_circle_outline, size: 16),
              label: const Text('Check Code Sequence'),
            ),
          ],
        ),
      ),
    );
  }
}
