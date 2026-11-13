import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class FlutterOutputPredictor extends StatefulWidget {
  final void Function(int score, Map<String, dynamic> metadata) onGameOver;
  final void Function(int score) onScoreUpdate;
  final bool isPaused;
  final String? technology;
  final String? gameSlug;

  const FlutterOutputPredictor({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    required this.isPaused,
    this.technology,
    this.gameSlug,
  });

  @override
  State<FlutterOutputPredictor> createState() => _FlutterOutputPredictorState();
}

class _FlutterOutputPredictorState extends State<FlutterOutputPredictor> {
  int _challengeIdx = 0;
  String? _selectedOption;
  bool _isSubmitted = false;
  int _score = 0;

  static const List<Map<String, dynamic>> _defaultChallenges = [
    {
      'title': 'Type Coercion Arithmetic',
      'language': 'JavaScript',
      'code': 'const result = "5" - 2 + "3";\nconsole.log(result);',
      'options': ['"33"', '6', '"523"', 'NaN'],
      'solution': '"33"',
      'explanation': '"5" - 2 converts "5" into numeric 5, giving 3. Then 3 + "3" concatenates, yielding "33".',
    },
    {
      'title': 'List Mutation Reference',
      'language': 'Python',
      'code': 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(len(a))',
      'options': ['3', '4', 'TypeError', 'None'],
      'solution': '4',
      'explanation': 'b = a assigns list reference. Calling b.append mutates the shared underlying object, so len(a) is 4.',
    },
  ];

  static const List<Map<String, dynamic>> _csharpChallenges = [
    {
      'title': 'C# Entry Point Signature',
      'language': 'C#',
      'code': 'class Program\n{\n    ___ void Main(string[] args)\n    {\n        Console.WriteLine("Hangbug C#");\n    }\n}',
      'options': ['static', 'public virtual', 'async override', 'sealed'],
      'solution': 'static',
      'explanation': 'In C#, the application entry point method Main must be marked static so the CLR can execute it without creating an object instance.',
    },
    {
      'title': 'Polymorphism with Virtual and Override',
      'language': 'C#',
      'code': 'class Base {\n    public virtual void Speak() => Console.Write("Base ");\n}\nclass Derived : Base {\n    public override void Speak() => Console.Write("Derived ");\n}\nBase obj = new Derived();\nobj.Speak();',
      'options': ['Derived ', 'Base ', 'Base Derived ', 'Compilation Error'],
      'solution': 'Derived ',
      'explanation': 'Virtual dispatch resolves the method based on the actual runtime object type Derived, printing "Derived ".',
    },
    {
      'title': 'LINQ Deferred Execution with SelectMany',
      'language': 'C#',
      'code': 'var matrix = new int[][] {\n    new int[] { 1, 2 },\n    new int[] { 3, 4, 5 }\n};\nvar flat = matrix.SelectMany(row => row).Where(n => n % 2 != 0);\nConsole.WriteLine(flat.Count());',
      'options': ['3', '2', '5', '1'],
      'solution': '3',
      'explanation': 'SelectMany flattens the arrays into [1, 2, 3, 4, 5]. The odd numbers (1, 3, 5) give a count of 3.',
    },
    {
      'title': 'Finally Block Execution Guarantee',
      'language': 'C#',
      'code': 'int Compute() {\n    try {\n        return 10;\n    }\n    finally {\n        Console.Write("Cleanup ");\n    }\n}\nint result = Compute();\nConsole.Write(result);',
      'options': ['Cleanup 10', '10 Cleanup', '10', 'Cleanup'],
      'solution': 'Cleanup 10',
      'explanation': 'The finally block executes before control returns from Compute(), so "Cleanup " is written first, followed by "10".',
    },
    {
      'title': 'Record Value Equality',
      'language': 'C#',
      'code': 'record User(string Name, int Age);\nvar u1 = new User("Alex", 30);\nvar u2 = u1 with { Age = 30 };\nConsole.WriteLine(u1 == u2);',
      'options': ['True', 'False', 'Compilation Error', 'Null'],
      'solution': 'True',
      'explanation': 'Records synthesize value-based equality. All properties of u1 and u2 match, returning True.',
    },
  ];

  List<Map<String, dynamic>> get _challenges {
    final isCSharp = widget.technology == 'csharp' ||
        (widget.gameSlug != null && widget.gameSlug!.contains('csharp'));
    return isCSharp ? _csharpChallenges : _defaultChallenges;
  }

  void _submitAnswer() {
    if (_selectedOption == null || _isSubmitted || widget.isPaused) return;

    final challenge = _challenges[_challengeIdx];
    final isMatch = _selectedOption == challenge['solution'];

    setState(() {
      _isSubmitted = true;
      if (isMatch) {
        _score += 200;
        widget.onScoreUpdate(_score);
      }
    });
  }

  void _nextChallenge() {
    if (_challengeIdx + 1 < _challenges.length) {
      setState(() {
        _challengeIdx++;
        _selectedOption = null;
        _isSubmitted = false;
      });
    } else {
      widget.onGameOver(_score, {'predictionsCompleted': _challenges.length});
    }
  }

  @override
  Widget build(BuildContext context) {
    final challenge = _challenges[_challengeIdx];
    final isMatch = _selectedOption == challenge['solution'];

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
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: context.gameBadgeBgColor,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: context.gameBadgeBorderColor),
                      ),
                      child: Text(
                        challenge['language'].toString().toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                          color: context.gameBadgeTextColor,
                        ),
                      ),
                    ),
                    Text(
                      'Predictor ${_challengeIdx + 1} of ${_challenges.length}',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: context.textSecondaryColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  challenge['title'],
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: context.textPrimaryColor,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: context.gameCodeBgColor,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: context.gameCodeBorderColor),
                  ),
                  padding: const EdgeInsets.all(14),
                  child: Text(
                    challenge['code'],
                    style: TextStyle(
                      color: context.textPrimaryColor,
                      fontFamily: 'monospace',
                      fontSize: 13,
                      height: 1.45,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  'Select Expected Terminal Output:',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: context.textPrimaryColor),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: (challenge['options'] as List<String>).map((opt) {
                    final isSelected = _selectedOption == opt;
                    final isTargetSolution = _isSubmitted && opt == challenge['solution'];
                    final isWrongSelected = _isSubmitted && isSelected && !isMatch;

                    Color chipBg = context.cardBgColor;
                    Color borderColor = context.borderColor;
                    Color textColor = context.textPrimaryColor;

                    if (isTargetSolution) {
                      chipBg = Colors.green.withValues(alpha: 0.15);
                      borderColor = Colors.green.withValues(alpha: 0.65);
                      textColor = context.successColor;
                    } else if (isWrongSelected) {
                      chipBg = Colors.red.withValues(alpha: 0.15);
                      borderColor = Colors.red.withValues(alpha: 0.65);
                      textColor = context.errorColor;
                    } else if (isSelected) {
                      chipBg = context.gameBadgeBgColor;
                      borderColor = AppColors.gamePrimaryButton;
                      textColor = context.gameBadgeTextColor;
                    }

                    return ChoiceChip(
                      label: Text(
                        opt,
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                          color: textColor,
                        ),
                      ),
                      selected: isSelected,
                      backgroundColor: chipBg,
                      selectedColor: chipBg,
                      side: BorderSide(color: borderColor),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      onSelected: _isSubmitted
                          ? null
                          : (selected) {
                              setState(() => _selectedOption = selected ? opt : null);
                            },
                    );
                  }).toList(),
                ),
                if (_isSubmitted) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isMatch ? Colors.green.withValues(alpha: 0.12) : Colors.red.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: (isMatch ? Colors.green : Colors.red).withValues(alpha: 0.4)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isMatch ? 'Correct Output! (+200 pts)' : 'Incorrect Prediction!',
                          style: TextStyle(
                            color: isMatch ? context.successColor : context.errorColor,
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          challenge['explanation'],
                          style: TextStyle(fontSize: 12, color: context.textSecondaryColor),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 14),
                if (!_isSubmitted)
                  FilledButton(
                    onPressed: _selectedOption != null ? _submitAnswer : null,
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(double.infinity, 46),
                      backgroundColor: AppColors.gamePrimaryButton,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Verify Prediction', style: TextStyle(fontWeight: FontWeight.w900)),
                  )
                else
                  FilledButton(
                    onPressed: _nextChallenge,
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(double.infinity, 46),
                      backgroundColor: AppColors.gamePrimaryButton,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Next Challenge', style: TextStyle(fontWeight: FontWeight.w900)),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
