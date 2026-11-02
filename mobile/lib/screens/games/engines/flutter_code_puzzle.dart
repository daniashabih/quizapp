import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../providers/game_provider.dart';

class FlutterCodePuzzle extends ConsumerStatefulWidget {
  final void Function(int score, Map<String, dynamic> metadata) onGameOver;
  final void Function(int score) onScoreUpdate;
  final bool isPaused;
  final bool isMuted;

  const FlutterCodePuzzle({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    required this.isPaused,
    this.isMuted = false,
  });

  @override
  ConsumerState<FlutterCodePuzzle> createState() => _FlutterCodePuzzleState();
}

class _FlutterCodePuzzleState extends ConsumerState<FlutterCodePuzzle> {
  List<Map<String, dynamic>> _puzzles = [];
  bool _isLoading = true;
  int _puzzleIdx = 0;
  List<String> _blocks = [];
  List<String> _initialScrambledBlocks = [];
  bool? _isCorrect;
  bool _isRevealed = false;
  int _score = 0;
  int _streak = 0;
  int _pointsAwarded = 0;
  bool _showHint = false;
  bool _isValidating = false;
  String _feedbackExplanation = '';
  List<dynamic>? _revealedSolution;
  final Set<String> _solvedPuzzleIds = {};

  @override
  void initState() {
    super.initState();
    _initGame();
  }

  Future<void> _initGame() async {
    setState(() => _isLoading = true);
    final repo = ref.read(gameRepositoryProvider);

    List<Map<String, dynamic>> loaded = [];
    try {
      loaded = await repo.getChallenges('code-puzzle');
    } catch (_) {}

    if (loaded.isEmpty) {
      loaded = [
        {
          'id': 'cp_1',
          'title': 'Filter & Map Evens Squared',
          'language': 'javascript',
          'difficulty': 'Beginner',
          'description': 'Arrange blocks to filter even numbers and calculate their squares.',
          'blocks': [
            'return squared;',
            'const numbers = [1, 2, 3, 4, 5, 6];',
            'const squared = evens.map(n => n * n);',
            'const evens = numbers.filter(n => n % 2 === 0);',
          ],
          'hints': 'Variables must be initialized before they can be referenced in .filter() and .map() pipeline.',
          'explanation': 'Variables must be initialized before they can be referenced in .filter() and .map() pipeline.',
        },
        {
          'id': 'cp_2',
          'title': 'Python Fibonacci Generator',
          'language': 'python',
          'difficulty': 'Intermediate',
          'description': 'Order statements to produce a Fibonacci list of length n.',
          'blocks': [
            'return fib',
            'def get_fib(n):',
            '    for _ in range(2, n):',
            '        fib.append(fib[-1] + fib[-2])',
            '    fib = [0, 1]',
          ],
          'hints': 'The function header defines scope, seed list is created, iterative loop appends sum, then list is returned.',
          'explanation': 'The function header defines scope, seed list is created, iterative loop appends sum, then list is returned.',
        },
        {
          'id': 'cp_3',
          'title': 'SQL Top Department Salaries',
          'language': 'sql',
          'difficulty': 'Advanced',
          'description': 'Arrange clauses to aggregate average department salaries above 50k.',
          'blocks': [
            'LIMIT 5;',
            'SELECT department, AVG(salary) AS avg_sal',
            'HAVING AVG(salary) > 50000',
            'FROM employees',
            'ORDER BY avg_sal DESC',
            'GROUP BY department',
          ],
          'hints': 'SQL grammar requires SELECT, FROM, GROUP BY, HAVING, ORDER BY, and finally LIMIT.',
          'explanation': 'SQL grammar requires SELECT, FROM, GROUP BY, HAVING, ORDER BY, and finally LIMIT.',
        },
        {
          'id': 'cp_4',
          'title': 'HTML Semantic Card Structure',
          'language': 'html',
          'difficulty': 'Beginner',
          'description': 'Arrange HTML elements into a semantic card layout.',
          'blocks': [
            '  </div>',
            '  <img src="avatar.jpg" alt="Profile" />',
            '<article class="user-card">',
            '  <div class="user-info">',
            '    <h3>Alex Rivera</h3>',
            '</article>',
          ],
          'hints': 'HTML tags must open and close symmetrically, nesting the heading within the info wrapper.',
          'explanation': 'HTML tags must open and close symmetrically, nesting the heading within the info wrapper.',
        },
      ];
    }

    if (!mounted) return;
    _puzzles = loaded;

    // Check for saved active progress
    try {
      Map<String, dynamic>? progress = await repo.getProgress('code-puzzle');
      if (progress == null) {
        final prefs = await SharedPreferences.getInstance();
        final local = prefs.getString('hangbug_game_progress_code-puzzle');
        if (local != null) {
          progress = jsonDecode(local) as Map<String, dynamic>;
        }
      }

      if (progress != null && progress['puzzleIndex'] != null) {
        final savedIdx = (progress['puzzleIndex'] as num).toInt();
        if (savedIdx < _puzzles.length) {
          _puzzleIdx = savedIdx;
          _score = (progress['score'] as num?)?.toInt() ?? 0;
          _streak = (progress['streak'] as num?)?.toInt() ?? 0;
          final completed = progress['completedPuzzles'] as List?;
          if (completed != null) {
            _solvedPuzzleIds.addAll(completed.map((e) => e.toString()));
          }
          widget.onScoreUpdate(_score);

          if (progress['currentBlocks'] is List && (progress['currentBlocks'] as List).isNotEmpty) {
            final savedBlocks = List<String>.from(progress['currentBlocks']);
            setState(() {
              _blocks = savedBlocks;
              _initialScrambledBlocks = List<String>.from(savedBlocks);
              _isLoading = false;
            });
            return;
          }
        }
      }
    } catch (_) {}

    _loadCurrentPuzzle();
  }

  void _loadCurrentPuzzle() {
    if (_puzzles.isEmpty) return;
    final puzzle = _puzzles[_puzzleIdx];

    List<String> rawBlocks = [];
    if (puzzle['blocks'] is List) {
      rawBlocks = List<String>.from(puzzle['blocks']);
    } else if (puzzle['content'] != null) {
      try {
        final parsed = puzzle['content'] is String ? jsonDecode(puzzle['content']) : puzzle['content'];
        rawBlocks = List<String>.from(parsed['blocks'] ?? parsed['shuffledBlocks'] ?? []);
      } catch (_) {}
    }

    if (rawBlocks.isEmpty) {
      rawBlocks = ['statement 1', 'statement 2', 'statement 3'];
    }

    final shuffled = List<String>.from(rawBlocks)..shuffle();

    setState(() {
      _blocks = shuffled;
      _initialScrambledBlocks = List<String>.from(shuffled);
      _isCorrect = null;
      _isRevealed = false;
      _showHint = false;
      _feedbackExplanation = '';
      _revealedSolution = null;
      _isLoading = false;
    });
  }

  void _playFeedback() {
    if (!widget.isMuted) {
      HapticFeedback.selectionClick();
    }
  }

  void _moveBlock(int from, int to) {
    if (widget.isPaused || _isCorrect == true || _isValidating) return;
    if (to < 0 || to >= _blocks.length) return;

    setState(() {
      final item = _blocks.removeAt(from);
      _blocks.insert(to, item);
      _isCorrect = null;
      _isRevealed = false;
    });

    _playFeedback();
    _saveProgress();
  }

  void _handleReset() {
    if (widget.isPaused || _isCorrect == true || _isValidating) return;
    setState(() {
      _blocks = List<String>.from(_initialScrambledBlocks);
      _isCorrect = null;
      _isRevealed = false;
    });
    _playFeedback();
    _saveProgress();
  }

  Future<void> _saveProgress() async {
    final payload = {
      'puzzleIndex': _puzzleIdx,
      'score': _score,
      'streak': _streak,
      'completedPuzzles': _solvedPuzzleIds.toList(),
      'currentBlocks': _blocks,
    };

    try {
      ref.read(gameRepositoryProvider).saveProgress('code-puzzle', payload);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('hangbug_game_progress_code-puzzle', jsonEncode(payload));
    } catch (_) {}
  }

  Future<void> _checkAnswer() async {
    if (widget.isPaused || _isCorrect == true || _isValidating) return;

    final puzzle = _puzzles[_puzzleIdx];
    final puzzleId = (puzzle['id'] ?? 'cp_${_puzzleIdx + 1}').toString();

    // Prevent duplicate scoring for already solved puzzle
    if (_solvedPuzzleIds.contains(puzzleId)) return;

    setState(() => _isValidating = true);

    try {
      final repo = ref.read(gameRepositoryProvider);
      final res = await repo.verifyChallenge('code-puzzle', puzzleId, _blocks);

      if (res['isCorrect'] == true) {
        if (!widget.isMuted) {
          HapticFeedback.mediumImpact();
        }

        final diff = (puzzle['difficulty'] ?? 'Beginner').toString();
        final basePoints = (res['points'] as num?)?.toInt() ?? (diff == 'Advanced' ? 300 : diff == 'Intermediate' ? 200 : 100);
        final streakBonus = _streak * 20;
        final totalEarned = basePoints + streakBonus;

        final newScore = _score + totalEarned;
        final newStreak = _streak + 1;
        _solvedPuzzleIds.add(puzzleId);

        setState(() {
          _isCorrect = true;
          _score = newScore;
          _streak = newStreak;
          _pointsAwarded = totalEarned;
          _feedbackExplanation = res['explanation']?.toString() ?? puzzle['explanation']?.toString() ?? 'Logical sequence verified!';
        });

        widget.onScoreUpdate(newScore);

        // Advance to next puzzle or finish
        final nextIdx = _puzzleIdx + 1;
        final progressPayload = {
          'puzzleIndex': nextIdx,
          'score': newScore,
          'streak': newStreak,
          'completedPuzzles': _solvedPuzzleIds.toList(),
          'currentBlocks': null,
        };
        repo.saveProgress('code-puzzle', progressPayload);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('hangbug_game_progress_code-puzzle', jsonEncode(progressPayload));

        Future.delayed(const Duration(milliseconds: 1800), () {
          if (!mounted) return;
          if (nextIdx < _puzzles.length) {
            setState(() {
              _puzzleIdx = nextIdx;
              _loadCurrentPuzzle();
            });
          } else {
            // Completed all puzzles
            repo.clearProgress('code-puzzle');
            prefs.remove('hangbug_game_progress_code-puzzle');
            widget.onGameOver(newScore, {'puzzlesSolved': _puzzles.length});
          }
        });
      } else {
        if (!widget.isMuted) {
          HapticFeedback.heavyImpact();
        }
        setState(() {
          _isCorrect = false;
          _streak = 0;
          if (res['solution'] != null) {
            _revealedSolution = res['solution'] is List ? res['solution'] : null;
          }
        });
      }
    } catch (_) {
      setState(() {
        _isCorrect = false;
        _streak = 0;
      });
    } finally {
      if (mounted) {
        setState(() => _isValidating = false);
      }
    }
  }

  void _handleRevealSolution() {
    if (_revealedSolution != null && _revealedSolution is List) {
      setState(() {
        _blocks = _revealedSolution!.map((e) => e.toString()).toList();
        _isRevealed = true;
      });
    } else {
      final puzzle = _puzzles[_puzzleIdx];
      if (puzzle['solution'] != null) {
        try {
          final parsed = puzzle['solution'] is String ? jsonDecode(puzzle['solution']) : puzzle['solution'];
          if (parsed is List) {
            setState(() {
              _blocks = parsed.map((e) => e.toString()).toList();
              _isRevealed = true;
            });
          }
        } catch (_) {}
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 12),
            Text('Loading Code Puzzle challenge...', style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      );
    }

    if (_puzzles.isEmpty) {
      return const Center(child: Text('No puzzle challenges available.'));
    }

    final puzzle = _puzzles[_puzzleIdx];
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: Theme.of(context).dividerColor.withValues(alpha: 0.15),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.05),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top Header Row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.indigo.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: Colors.indigo.withValues(alpha: 0.3)),
                                ),
                                child: Text(
                                  (puzzle['language'] ?? 'code').toString().toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'monospace',
                                    color: Colors.indigoAccent,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Puzzle ${_puzzleIdx + 1} of ${_puzzles.length}',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.grey[500],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            puzzle['title'] ?? 'Code Challenge',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            puzzle['description'] ?? 'Arrange statements into correct logical sequence.',
                            style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                    Row(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text('DIFFICULTY', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
                            Text(
                              puzzle['difficulty'] ?? 'Beginner',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber),
                            ),
                          ],
                        ),
                        Container(
                          height: 24,
                          width: 1,
                          margin: const EdgeInsets.symmetric(horizontal: 10),
                          color: Theme.of(context).dividerColor.withValues(alpha: 0.2),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text('STREAK', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
                            Text(
                              '$_streak🔥',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF10B981)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Instruction & Hint Banner
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.indigo.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.indigo.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Use the arrows to rearrange statements in the correct logical sequence.',
                          style: TextStyle(fontSize: 11, color: Colors.indigoAccent),
                        ),
                      ),
                      TextButton.icon(
                        style: TextButton.styleFrom(
                          visualDensity: VisualDensity.compact,
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                        ),
                        onPressed: () => setState(() => _showHint = !_showHint),
                        icon: Icon(_showHint ? Icons.visibility_off : Icons.help_outline, size: 14, color: Colors.indigoAccent),
                        label: Text(
                          _showHint ? 'Hide Hint' : 'Hint',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.indigoAccent),
                        ),
                      ),
                    ],
                  ),
                ),

                if (_showHint) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.amber.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      '💡 Hint: ${puzzle['hints'] ?? puzzle['explanation'] ?? 'Variables must be defined before use.'}',
                      style: const TextStyle(fontSize: 11, color: Colors.amber),
                    ),
                  ),
                ],

                const SizedBox(height: 14),

                // Reorderable Code Blocks
                ...List.generate(_blocks.length, (idx) {
                  final line = _blocks[idx];
                  final isItemCorrect = _isCorrect == true;
                  final isItemIncorrect = _isCorrect == false;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isItemCorrect
                          ? Colors.green.withValues(alpha: 0.15)
                          : isItemIncorrect
                              ? Colors.red.withValues(alpha: 0.15)
                              : Theme.of(context).colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isItemCorrect
                            ? Colors.green.withValues(alpha: 0.6)
                            : isItemIncorrect
                                ? Colors.red.withValues(alpha: 0.6)
                                : Theme.of(context).dividerColor.withValues(alpha: 0.2),
                      ),
                    ),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 22,
                          child: Text(
                            '${idx + 1}.',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[500],
                            ),
                          ),
                        ),
                        Expanded(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Text(
                              line,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.arrow_upward_rounded, size: 16),
                              tooltip: 'Move Up',
                              onPressed: (idx == 0 || widget.isPaused || _isCorrect == true || _isValidating)
                                  ? null
                                  : () => _moveBlock(idx, idx - 1),
                              visualDensity: VisualDensity.compact,
                            ),
                            IconButton(
                              icon: const Icon(Icons.arrow_downward_rounded, size: 16),
                              tooltip: 'Move Down',
                              onPressed: (idx == _blocks.length - 1 || widget.isPaused || _isCorrect == true || _isValidating)
                                  ? null
                                  : () => _moveBlock(idx, idx + 1),
                              visualDensity: VisualDensity.compact,
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                }),

                // Feedback Banner
                if (_isCorrect == true) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.green.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_rounded, color: Colors.green, size: 22),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Correct Arrangement! +$_pointsAwarded pts${_streak > 1 ? " ($_streak x Streak!)" : ""}',
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Colors.green),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _feedbackExplanation,
                                style: const TextStyle(fontSize: 11, color: Colors.greenAccent),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                if (_isCorrect == false) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.red.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.cancel_rounded, color: Colors.red, size: 22),
                        const SizedBox(width: 10),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Not quite right yet.',
                                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Colors.red),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Check the logical execution flow and try again.',
                                style: TextStyle(fontSize: 11, color: Colors.redAccent),
                              ),
                            ],
                          ),
                        ),
                        if (_revealedSolution != null)
                          TextButton(
                            onPressed: _handleRevealSolution,
                            style: TextButton.styleFrom(
                              backgroundColor: Colors.red.withValues(alpha: 0.2),
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: const Text('Reveal Solution', style: TextStyle(color: Colors.red, fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                  ),
                ],

                if (_isRevealed) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.amber.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.lightbulb_outline_rounded, color: Colors.amber, size: 20),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Solution Revealed. Study the order above, then tap Reset to practice.',
                            style: TextStyle(fontSize: 11, color: Colors.amber, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 16),

                // Bottom Actions Bar: Reset & Check Answer
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    OutlinedButton.icon(
                      onPressed: (widget.isPaused || _isCorrect == true || _isValidating)
                          ? null
                          : _handleReset,
                      icon: const Icon(Icons.replay_rounded, size: 16),
                      label: const Text('Reset'),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                    FilledButton.icon(
                      onPressed: (widget.isPaused || _isCorrect == true || _isValidating)
                          ? null
                          : _checkAnswer,
                      icon: _isValidating
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.auto_awesome_rounded, size: 16),
                      label: Text(_isValidating ? 'Checking...' : 'Check Answer'),
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
                        elevation: 3,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
