import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class FlutterOutputPredictor extends StatefulWidget {
  final void Function(int score, Map<String, dynamic> metadata) onGameOver;
  final void Function(int score) onScoreUpdate;
  final bool isPaused;

  const FlutterOutputPredictor({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    required this.isPaused,
  });

  @override
  State<FlutterOutputPredictor> createState() => _FlutterOutputPredictorState();
}

class _FlutterOutputPredictorState extends State<FlutterOutputPredictor> {
  int _challengeIdx = 0;
  String? _selectedOption;
  bool _isSubmitted = false;
  int _score = 0;

  static const List<Map<String, dynamic>> _challenges = [
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

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 720),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: context.cardBgColor,
            borderRadius: BorderRadius.circular(24),
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
                      color: context.textMutedColor,
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
                    height: 1.4,
                    fontWeight: FontWeight.w500,
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
                    borderColor = Colors.green.withValues(alpha: 0.6);
                    textColor = const Color(0xFF15803D);
                  } else if (isWrongSelected) {
                    chipBg = Colors.red.withValues(alpha: 0.15);
                    borderColor = Colors.red.withValues(alpha: 0.6);
                    textColor = const Color(0xFFC96155);
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
                    onSelected: _isSubmitted ? null : (selected) {
                      setState(() => _selectedOption = selected ? opt : null);
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 12),
              if (_isSubmitted)
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
                          color: isMatch ? const Color(0xFF15803D) : const Color(0xFFC96155),
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
              const SizedBox(height: 14),
              if (!_isSubmitted)
                FilledButton(
                  onPressed: _selectedOption != null ? _submitAnswer : null,
                  style: FilledButton.styleFrom(
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
    );
  }
}
