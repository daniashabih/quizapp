import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../providers/game_provider.dart';

class FlutterCompleteTheCode extends ConsumerStatefulWidget {
  final void Function(int score, Map<String, dynamic> metadata) onGameOver;
  final void Function(int score) onScoreUpdate;
  final bool isPaused;
  final bool isMuted;
  final String technology;
  final String difficulty;

  const FlutterCompleteTheCode({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    required this.isPaused,
    this.isMuted = false,
    this.technology = 'csharp',
    this.difficulty = 'All Levels',
  });

  @override
  ConsumerState<FlutterCompleteTheCode> createState() => _FlutterCompleteTheCodeState();
}

class _FlutterCompleteTheCodeState extends ConsumerState<FlutterCompleteTheCode> {
  final TextEditingController _textInputCtrl = TextEditingController();
  final FocusNode _inputFocusNode = FocusNode();

  List<Map<String, dynamic>> _challenges = [];
  int _currentIdx = 0;
  String _selectedDifficulty = 'All Levels';
  bool _isInputModeType = false; // false = choice buttons, true = text input
  String? _selectedOption;
  bool _isSubmitted = false;
  bool _isValidating = false;
  bool _isLoading = true;
  bool _showHint = false;
  bool _showResultScreen = false;

  Map<String, dynamic>? _feedback;
  int _score = 0;
  int _streak = 0;
  int _maxStreak = 0;
  int _correctCount = 0;
  int _incorrectCount = 0;
  int _earnedStreakBonus = 0;

  // Offline fallback challenge set covering beginner, intermediate, advanced C#
  static const List<Map<String, dynamic>> _fallbackChallenges = [
    {
      'id': 'csharp_ctc_001',
      'title': 'String Variable Declaration',
      'difficulty': 'Beginner',
      'topic': 'Variables and data types',
      'codeBefore': 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        ',
      'blank': 'string',
      'codeAfter': ' name = "Hangbug";\n        Console.WriteLine(name);\n    }\n}',
      'solution': 'string',
      'options': ['string', 'int', 'bool', 'double'],
      'hints': 'Textual data in C# uses the string keyword.',
      'explanation': 'In C#, `string` represents a sequence of characters and is an alias for the System.String class.',
      'points': 100,
    },
    {
      'id': 'csharp_ctc_008',
      'title': 'Standard Console Class',
      'difficulty': 'Beginner',
      'topic': 'Console input/output',
      'codeBefore': 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        ',
      'blank': 'Console',
      'codeAfter': '.WriteLine("Hello Hangbug!");\n    }\n}',
      'solution': 'Console',
      'options': ['Console', 'System', 'Terminal', 'Print'],
      'hints': 'The standard I/O class located in the System namespace.',
      'explanation': '`Console.WriteLine()` outputs the specified data followed by a line terminator.',
      'points': 100,
    },
    {
      'id': 'csharp_ctc_015',
      'title': 'Greater Than or Equal Comparison',
      'difficulty': 'Beginner',
      'topic': 'Operators',
      'codeBefore': 'int age = 20;\n\nif (age ',
      'blank': '>=',
      'codeAfter': ' 18)\n{\n    Console.WriteLine("Adult");\n}',
      'solution': '>=',
      'options': ['>=', '<=', '==', '!='],
      'hints': 'Relational operator for greater than or equal to.',
      'explanation': 'The `>=` operator returns true if the left operand is greater than or equal to the right operand.',
      'points': 100,
    },
    {
      'id': 'csharp_ctc_029',
      'title': 'For Loop Upper Bound',
      'difficulty': 'Beginner',
      'topic': 'Basic loops',
      'codeBefore': 'for (int i = 0; i ',
      'blank': '<',
      'codeAfter': ' 5; i++)\n{\n    Console.WriteLine(i);\n}',
      'solution': '<',
      'options': ['<', '>', '==', '!='],
      'hints': 'Less than relational operator.',
      'explanation': 'The condition `i < 5` runs iterations for i = 0, 1, 2, 3, 4, executing the body 5 times.',
      'points': 100,
    },
    {
      'id': 'csharp_ctc_036',
      'title': 'Single-Dimensional Array Declaration',
      'difficulty': 'Intermediate',
      'topic': 'Arrays',
      'codeBefore': 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        ',
      'blank': 'int[]',
      'codeAfter': ' numbers = new int[5];\n        numbers[0] = 10;\n        Console.WriteLine(numbers[0]);\n    }\n}',
      'solution': 'int[]',
      'options': ['int[]', 'int()', 'Array<int>', 'int{}'],
      'hints': 'In C#, array brackets follow the element type.',
      'explanation': 'In C#, `type[]` declares a single-dimensional array of elements of the specified type.',
      'points': 150,
    },
    {
      'id': 'csharp_ctc_042',
      'title': 'Substring Extraction',
      'difficulty': 'Intermediate',
      'topic': 'Strings',
      'codeBefore': 'string title = "Hangbug";\nstring prefix = title.',
      'blank': 'Substring',
      'codeAfter': '(0, 4);\nConsole.WriteLine(prefix);',
      'solution': 'Substring',
      'options': ['Substring', 'Slice', 'Substr', 'Extract'],
      'hints': 'Standard C# string method starting with an uppercase S.',
      'explanation': '`Substring(startIndex, length)` retrieves a sub-sequence of characters from this string instance.',
      'points': 150,
    },
    {
      'id': 'csharp_ctc_048',
      'title': 'Method Void Return Type',
      'difficulty': 'Intermediate',
      'topic': 'Methods and parameters',
      'codeBefore': 'class Logger\n{\n    public ',
      'blank': 'void',
      'codeAfter': ' Log(string msg)\n    {\n        Console.WriteLine(msg);\n    }\n}',
      'solution': 'void',
      'options': ['void', 'null', 'empty', 'unit'],
      'hints': 'Standard keyword signifying no return value.',
      'explanation': '`void` specifies that a method does not return a value when called.',
      'points': 150,
    },
    {
      'id': 'csharp_ctc_066',
      'title': 'Try-Catch Block Structure',
      'difficulty': 'Intermediate',
      'topic': 'Exception handling',
      'codeBefore': '',
      'blank': 'try',
      'codeAfter': '\n{\n    int result = 10 / int.Parse("0");\n}\ncatch (DivideByZeroException ex)\n{\n    Console.WriteLine(ex.Message);\n}',
      'solution': 'try',
      'options': ['try', 'attempt', 'do', 'guard'],
      'hints': 'Keyword introducing protected code blocks.',
      'explanation': 'A `try` block guards code that might throw an exception so catching blocks can handle errors.',
      'points': 150,
    },
    {
      'id': 'csharp_ctc_076',
      'title': 'Virtual Base Method Declaration',
      'difficulty': 'Advanced',
      'topic': 'Polymorphism',
      'codeBefore': 'class Shape\n{\n    public ',
      'blank': 'virtual',
      'codeAfter': ' double GetArea() => 0.0;\n}',
      'solution': 'virtual',
      'options': ['virtual', 'override', 'abstract', 'dynamic'],
      'hints': 'Keyword that enables runtime polymorphism on base methods.',
      'explanation': 'The `virtual` keyword is used to modify a method declaration and allow it to be overridden in a derived class.',
      'points': 200,
    },
    {
      'id': 'csharp_ctc_091',
      'title': 'LINQ Where Filtering Extension',
      'difficulty': 'Advanced',
      'topic': 'LINQ',
      'codeBefore': 'using System.Linq;\n\nint[] numbers = { 1, 2, 3, 4, 5, 6 };\nvar evens = numbers.',
      'blank': 'Where',
      'codeAfter': '(n => n % 2 == 0);\nConsole.WriteLine(evens.Count());',
      'solution': 'Where',
      'options': ['Where', 'Filter', 'FindAll', 'Select'],
      'hints': 'Standard LINQ method equivalent to SQL WHERE.',
      'explanation': '`Where()` filters a sequence of values based on a predicate function.',
      'points': 200,
    },
    {
      'id': 'csharp_ctc_097',
      'title': 'Generic List Declaration',
      'difficulty': 'Advanced',
      'topic': 'Collections',
      'codeBefore': 'using System.Collections.Generic;\n\n',
      'blank': 'List<string>',
      'codeAfter': ' items = new List<string>();\nitems.Add("Hangbug");\nConsole.WriteLine(items.Count);',
      'solution': 'List<string>',
      'options': ['List<string>', 'ArrayList', 'Array<string>', 'Vector<string>'],
      'hints': 'Generic collection type from System.Collections.Generic.',
      'explanation': '`List<T>` provides a strongly typed list of objects that can be accessed by index and dynamically resized.',
      'points': 200,
    },
    {
      'id': 'csharp_ctc_102',
      'title': 'Func Generic Delegate Type',
      'difficulty': 'Advanced',
      'topic': 'Delegates and events',
      'codeBefore': 'using System;\n\n',
      'blank': 'Func<int, bool>',
      'codeAfter': ' isPositive = n => n > 0;\nConsole.WriteLine(isPositive(5));',
      'solution': 'Func<int, bool>',
      'options': ['Func<int, bool>', 'Action<int, bool>', 'Predicate<int, bool>', 'Delegate<int, bool>'],
      'hints': 'Encapsulates a method with one parameter that returns a value.',
      'explanation': '`Func<T, TResult>` encapsulates a method that takes a parameter of type T and returns a value of type TResult.',
      'points': 200,
    },
  ];

  @override
  void initState() {
    super.initState();
    _selectedDifficulty = widget.difficulty;
    _loadChallenges();
  }

  @override
  void dispose() {
    _textInputCtrl.dispose();
    _inputFocusNode.dispose();
    super.dispose();
  }

  Future<void> _loadChallenges() async {
    setState(() => _isLoading = true);

    try {
      final repo = ref.read(gameRepositoryProvider);
      final apiChallenges = await repo.getChallenges(
        'complete-the-code',
        technology: 'csharp',
        difficulty: _selectedDifficulty != 'All Levels' ? _selectedDifficulty : null,
      );

      if (mounted) {
        if (apiChallenges.isNotEmpty) {
          setState(() {
            _challenges = apiChallenges;
            _currentIdx = 0;
            _resetQuestionState();
          });
        } else {
          // Filter fallback challenges by difficulty
          final filtered = _fallbackChallenges.where((c) {
            if (_selectedDifficulty != 'All Levels') {
              return (c['difficulty'] as String).toLowerCase() == _selectedDifficulty.toLowerCase();
            }
            return true;
          }).toList();

          setState(() {
            _challenges = filtered.isNotEmpty ? filtered : _fallbackChallenges;
            _currentIdx = 0;
            _resetQuestionState();
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _challenges = _fallbackChallenges;
          _currentIdx = 0;
          _resetQuestionState();
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _resetQuestionState() {
    _textInputCtrl.clear();
    _selectedOption = null;
    _isSubmitted = false;
    _isValidating = false;
    _feedback = null;
    _showHint = false;
  }

  void _selectOption(String opt) {
    if (_isSubmitted || widget.isPaused || _isValidating) return;
    setState(() {
      _selectedOption = opt;
      _textInputCtrl.text = opt;
    });
  }

  Future<void> _submitAnswer() async {
    final submission = (_isInputModeType ? _textInputCtrl.text : (_selectedOption ?? _textInputCtrl.text)).trim();
    if (submission.isEmpty || _isSubmitted || widget.isPaused || _isValidating) return;

    final challenge = _challenges[_currentIdx];
    final challengeId = challenge['id']?.toString() ?? '';
    final solution = (challenge['solution'] ?? challenge['blank'] ?? '').toString();

    setState(() => _isValidating = true);

    bool isMatch = false;
    String explanation = (challenge['explanation'] ?? '').toString();

    try {
      final repo = ref.read(gameRepositoryProvider);
      final verifyRes = await repo.verifyChallenge('complete-the-code', challengeId, submission);
      if (verifyRes['isCorrect'] is bool) {
        isMatch = verifyRes['isCorrect'] as bool;
        if (verifyRes['explanation'] != null) explanation = verifyRes['explanation'].toString();
      } else {
        isMatch = submission.toLowerCase().replaceAll(RegExp(r'\s+'), ' ') == solution.toLowerCase().replaceAll(RegExp(r'\s+'), ' ');
      }
    } catch (_) {
      isMatch = submission.toLowerCase().replaceAll(RegExp(r'\s+'), ' ') == solution.toLowerCase().replaceAll(RegExp(r'\s+'), ' ');
    }

    final questionPoints = (challenge['points'] is num) ? (challenge['points'] as num).toInt() : 100;
    int addedPoints = 0;
    int streakBonus = 0;

    if (isMatch) {
      final newStreak = _streak + 1;
      _streak = newStreak;
      if (newStreak > _maxStreak) _maxStreak = newStreak;
      _correctCount++;

      if (newStreak >= 3) {
        streakBonus = (newStreak * 15).clamp(0, 100);
        _earnedStreakBonus += streakBonus;
      }

      addedPoints = questionPoints + streakBonus;
      _score += addedPoints;
      widget.onScoreUpdate(_score);
    } else {
      _streak = 0;
      _incorrectCount++;
    }

    if (mounted) {
      setState(() {
        _isSubmitted = true;
        _isValidating = false;
        _feedback = {
          'isCorrect': isMatch,
          'solution': solution,
          'explanation': explanation,
          'addedPoints': addedPoints,
          'streakBonus': streakBonus,
        };
      });

      // Save progress
      ref.read(gameRepositoryProvider).saveProgress('complete-the-code', {
        'currentIdx': _currentIdx + 1,
        'score': _score,
        'correctCount': _correctCount,
        'incorrectCount': _incorrectCount,
        'difficulty': _selectedDifficulty,
      });
    }
  }

  void _nextChallenge() {
    if (_currentIdx + 1 < _challenges.length) {
      setState(() {
        _currentIdx++;
        _resetQuestionState();
      });
    } else {
      _finishGame();
    }
  }

  void _finishGame() {
    ref.read(gameRepositoryProvider).clearProgress('complete-the-code');
    setState(() => _showResultScreen = true);

    final total = _challenges.length;
    final accuracy = total > 0 ? ((_correctCount / total) * 100).round() : 100;

    widget.onGameOver(_score, {
      'totalQuestions': total,
      'correctAnswers': _correctCount,
      'incorrectAnswers': _incorrectCount,
      'accuracy': accuracy,
      'maxStreak': _maxStreak,
      'streakBonus': _earnedStreakBonus,
      'technology': 'csharp',
    });
  }

  void _restartGame() {
    ref.read(gameRepositoryProvider).clearProgress('complete-the-code');
    setState(() {
      _currentIdx = 0;
      _score = 0;
      _streak = 0;
      _maxStreak = 0;
      _correctCount = 0;
      _incorrectCount = 0;
      _earnedStreakBonus = 0;
      _showResultScreen = false;
      _resetQuestionState();
    });
    widget.onScoreUpdate(0);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(
                width: 36,
                height: 36,
                child: CircularProgressIndicator(strokeWidth: 3, color: AppColors.primary),
              ),
              const SizedBox(height: 16),
              Text(
                'Loading C# Challenges...',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white70 : Colors.black87,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_showResultScreen) {
      return _buildResultsScreen(context, isDark);
    }

    final challenge = _challenges[_currentIdx];
    final before = (challenge['codeBefore'] ?? '').toString();
    final after = (challenge['codeAfter'] ?? '').toString();
    final solution = (challenge['solution'] ?? challenge['blank'] ?? '').toString();
    final options = (challenge['options'] is List) ? (challenge['options'] as List).map((e) => e.toString()).toList() : <String>[];
    final currentToken = (_isInputModeType ? _textInputCtrl.text : (_selectedOption ?? _textInputCtrl.text)).trim();
    final total = _challenges.length;
    final progressPct = ((_currentIdx + 1) / total).clamp(0.0, 1.0);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 8.0),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Top Header Card: Title, Difficulty & Score
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: context.cardBgColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: context.borderColor),
                ),
                child: Row(
                  children: [
                    // C# Icon Badge
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: const Color(0xFF9B4993).withValues(alpha: 0.16),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Center(
                        child: Text(
                          'C#',
                          style: TextStyle(
                            color: Color(0xFF9B4993),
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'C# Complete the Code',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: context.brandAccentColor,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                decoration: BoxDecoration(
                                  color: Colors.purple.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  (challenge['difficulty'] ?? _selectedDifficulty).toString(),
                                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.purple),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            (challenge['title'] ?? 'Challenge ${_currentIdx + 1}').toString(),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    // Score & Streak
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '$_score pts',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.primary),
                        ),
                        if (_streak >= 2)
                          Text(
                            '$_streak Streak! 🔥',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.amber),
                          ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 10),

              // Progress Bar & Difficulty Selector
              Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: progressPct,
                        minHeight: 6,
                        backgroundColor: context.borderColor,
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    '${_currentIdx + 1} / $total',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDark ? Colors.white60 : Colors.black54),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Code Editor Display
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF121915),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFF28362E)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Code window bar
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: const BoxDecoration(
                        color: Color(0xFF0B100D),
                        borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.circle, size: 9, color: Color(0xFFEF4444)),
                          const SizedBox(width: 5),
                          const Icon(Icons.circle, size: 9, color: Color(0xFFF59E0B)),
                          const SizedBox(width: 5),
                          const Icon(Icons.circle, size: 9, color: Color(0xFF10B981)),
                          const SizedBox(width: 10),
                          const Text(
                            'Program.cs',
                            style: TextStyle(color: Color(0xFF849B8F), fontSize: 11, fontFamily: 'monospace'),
                          ),
                          const Spacer(),
                          // Input Mode Toggle Button
                          InkWell(
                            onTap: () {
                              setState(() => _isInputModeType = !_isInputModeType);
                              if (_isInputModeType) {
                                Future.delayed(const Duration(milliseconds: 100), () {
                                  _inputFocusNode.requestFocus();
                                });
                              }
                            },
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1D2821),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFF2F4237)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(_isInputModeType ? Icons.list_rounded : Icons.keyboard_rounded, size: 12, color: Colors.white70),
                                  const SizedBox(width: 4),
                                  Text(
                                    _isInputModeType ? 'Choices' : 'Type In',
                                    style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Incomplete Code Content
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Text.rich(
                          TextSpan(
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 13,
                              color: Color(0xFFD6DEEB),
                              height: 1.5,
                            ),
                            children: [
                              TextSpan(text: before),
                              WidgetSpan(
                                alignment: PlaceholderAlignment.middle,
                                child: InkWell(
                                  onTap: () {
                                    if (!_isSubmitted && !_isInputModeType) {
                                      setState(() => _isInputModeType = true);
                                      _inputFocusNode.requestFocus();
                                    }
                                  },
                                  borderRadius: BorderRadius.circular(6),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    margin: const EdgeInsets.symmetric(horizontal: 2),
                                    decoration: BoxDecoration(
                                      color: _isSubmitted
                                          ? (_feedback?['isCorrect'] == true
                                              ? const Color(0xFF10B981).withValues(alpha: 0.25)
                                              : const Color(0xFFEF4444).withValues(alpha: 0.25))
                                          : (currentToken.isNotEmpty
                                              ? const Color(0xFF9B4993).withValues(alpha: 0.3)
                                              : const Color(0xFF9B4993).withValues(alpha: 0.15)),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                        color: _isSubmitted
                                            ? (_feedback?['isCorrect'] == true
                                                ? const Color(0xFF10B981)
                                                : const Color(0xFFEF4444))
                                            : (currentToken.isNotEmpty ? const Color(0xFF9B4993) : const Color(0xFF9B4993).withValues(alpha: 0.6)),
                                        width: 1.5,
                                      ),
                                    ),
                                    child: Text(
                                      currentToken.isNotEmpty ? currentToken : ' _____ ',
                                      style: TextStyle(
                                        fontFamily: 'monospace',
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                        color: _isSubmitted
                                            ? (_feedback?['isCorrect'] == true ? const Color(0xFF34D399) : const Color(0xFFF87171))
                                            : (currentToken.isNotEmpty ? const Color(0xFFE9D5FF) : const Color(0xFFC084FC)),
                                        decoration: (_isSubmitted && _feedback?['isCorrect'] == false)
                                            ? TextDecoration.lineThrough
                                            : null,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              if (_isSubmitted && _feedback?['isCorrect'] == false)
                                WidgetSpan(
                                  alignment: PlaceholderAlignment.middle,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    margin: const EdgeInsets.only(left: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF10B981).withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: const Color(0xFF10B981)),
                                    ),
                                    child: Text(
                                      solution,
                                      style: const TextStyle(
                                        fontFamily: 'monospace',
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                        color: Color(0xFF34D399),
                                      ),
                                    ),
                                  ),
                                ),
                              TextSpan(text: after),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Multiple Choice Option Buttons OR Text Field
              if (!_isInputModeType && options.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Select the Missing Code:',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white60 : Colors.black54,
                      ),
                    ),
                    const SizedBox(height: 8),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 3.2,
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                      ),
                      itemCount: options.length,
                      itemBuilder: (ctx, i) {
                        final opt = options[i];
                        final isSelected = _selectedOption == opt;
                        final isOptCorrect = _isSubmitted && opt == solution;
                        final isOptWrong = _isSubmitted && isSelected && _feedback?['isCorrect'] == false;

                        return InkWell(
                          onTap: () => _selectOption(opt),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: isOptCorrect
                                  ? const Color(0xFF10B981).withValues(alpha: 0.2)
                                  : (isOptWrong
                                      ? const Color(0xFFEF4444).withValues(alpha: 0.2)
                                      : (isSelected ? const Color(0xFF9B4993).withValues(alpha: 0.2) : context.cardBgColor)),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isOptCorrect
                                    ? const Color(0xFF10B981)
                                    : (isOptWrong
                                        ? const Color(0xFFEF4444)
                                        : (isSelected ? const Color(0xFF9B4993) : context.borderColor)),
                                width: isSelected ? 1.5 : 1,
                              ),
                            ),
                            alignment: Alignment.centerLeft,
                            child: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    opt,
                                    style: TextStyle(
                                      fontFamily: 'monospace',
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                      color: isOptCorrect
                                          ? const Color(0xFF10B981)
                                          : (isOptWrong ? const Color(0xFFEF4444) : (isSelected ? const Color(0xFF9B4993) : null)),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (isOptCorrect)
                                  const Icon(Icons.check_circle_rounded, size: 16, color: Color(0xFF10B981))
                                else if (isOptWrong)
                                  const Icon(Icons.cancel_rounded, size: 16, color: Color(0xFFEF4444)),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                )
              else if (_isInputModeType)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Type Missing C# Code:',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white60 : Colors.black54,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _textInputCtrl,
                      focusNode: _inputFocusNode,
                      enabled: !_isSubmitted && !_isValidating,
                      onChanged: (_) => setState(() {}),
                      style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'e.g. string, Console, >=, <',
                        filled: true,
                        fillColor: context.cardBgColor,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF9B4993), width: 1.5)),
                      ),
                    ),
                  ],
                ),

              const SizedBox(height: 14),

              // Feedback Banner
              if (_isSubmitted && _feedback != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: _feedback!['isCorrect'] == true
                        ? const Color(0xFF10B981).withValues(alpha: 0.12)
                        : const Color(0xFFEF4444).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: _feedback!['isCorrect'] == true
                          ? const Color(0xFF10B981).withValues(alpha: 0.3)
                          : const Color(0xFFEF4444).withValues(alpha: 0.3),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            _feedback!['isCorrect'] == true ? Icons.check_circle_rounded : Icons.error_rounded,
                            size: 18,
                            color: _feedback!['isCorrect'] == true ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _feedback!['isCorrect'] == true
                                ? 'Correct! +${_feedback!['addedPoints']} pts'
                                : 'Incorrect — Answer: $solution',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: _feedback!['isCorrect'] == true ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                            ),
                          ),
                        ],
                      ),
                      if (_feedback!['explanation'].toString().isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(
                          _feedback!['explanation'].toString(),
                          style: TextStyle(
                            fontSize: 11,
                            height: 1.4,
                            color: isDark ? Colors.white70 : Colors.black87,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

              // Action Buttons: Hint & Submit / Next
              Row(
                children: [
                  if (challenge['hints'] != null && challenge['hints'].toString().isNotEmpty)
                    TextButton.icon(
                      onPressed: () => setState(() => _showHint = !_showHint),
                      icon: const Icon(Icons.lightbulb_outline_rounded, size: 16, color: Colors.amber),
                      label: Text(
                        _showHint ? 'Hide Hint' : 'Hint',
                        style: const TextStyle(fontSize: 11, color: Colors.amber, fontWeight: FontWeight.bold),
                      ),
                    ),
                  const Spacer(),
                  if (!_isSubmitted)
                    FilledButton(
                      onPressed: currentToken.isNotEmpty && !_isValidating ? _submitAnswer : null,
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF9B4993),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: _isValidating
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Submit Answer', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    )
                  else
                    FilledButton.icon(
                      onPressed: _nextChallenge,
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                      label: Text(
                        _currentIdx + 1 < _challenges.length ? 'Next Challenge' : 'View Results',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                ],
              ),

              if (_showHint && challenge['hints'] != null)
                Container(
                  margin: const EdgeInsets.only(top: 10),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.amber.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    '💡 Hint: ${challenge['hints']}',
                    style: const TextStyle(fontSize: 11, color: Colors.amber),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultsScreen(BuildContext context, bool isDark) {
    final total = _challenges.length;
    final pct = total > 0 ? ((_correctCount / total) * 100).round() : 100;

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: context.cardBgColor,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: context.borderColor),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF9B4993), Color(0xFF6366F1)]),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.emoji_events_rounded, size: 36, color: Colors.white),
              ),
              const SizedBox(height: 14),
              const Text(
                'Challenge Completed!',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 4),
              Text(
                'C# Complete the Code ($pct% Accuracy)',
                style: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : Colors.black54),
              ),
              const SizedBox(height: 18),
              // Stats
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _statTile('Score', '$_score pts', AppColors.primary),
                  _statTile('Correct', '$_correctCount / $total', const Color(0xFF10B981)),
                  _statTile('Streak', '$_maxStreak 🔥', Colors.amber),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _restartGame,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Play Again'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF9B4993),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('All C# Games'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statTile(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
