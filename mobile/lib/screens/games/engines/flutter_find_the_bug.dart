import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class FlutterFindTheBug extends StatefulWidget {
  final void Function(int score, Map<String, dynamic> metadata) onGameOver;
  final void Function(int score) onScoreUpdate;
  final bool isPaused;

  const FlutterFindTheBug({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    required this.isPaused,
  });

  @override
  State<FlutterFindTheBug> createState() => _FlutterFindTheBugState();
}

class _FlutterFindTheBugState extends State<FlutterFindTheBug> {
  int _challengeIdx = 0;
  int? _selectedLine;
  bool _isSubmitted = false;
  int _score = 0;

  static const List<Map<String, dynamic>> _challenges = [
    {
      'title': 'Off-By-One Array Traversal',
      'language': 'JavaScript',
      'lines': [
        'function sumArray(numbers) {',
        '    let total = 0;',
        '    for (let i = 0; i <= numbers.length; i++) {',
        '        total += numbers[i];',
        '    }',
        '    return total;',
        '}',
      ],
      'bugLine': 3,
      'explanation': 'Line 3 has i <= numbers.length. In 0-indexed arrays this accesses undefined at the end, yielding NaN.',
    },
    {
      'title': 'Mutable Default Argument',
      'language': 'Python',
      'lines': [
        'def register_user(username, roles=[]):',
        '    roles.append("member")',
        '    return {"user": username, "roles": roles}',
        '',
        'u1 = register_user("alice")',
        'u2 = register_user("bob")',
      ],
      'bugLine': 1,
      'explanation': 'Line 1 uses roles=[] as a default arg. In Python, defaults evaluate once at definition and are shared across calls.',
    },
  ];

  void _submitLine() {
    if (_selectedLine == null || _isSubmitted || widget.isPaused) return;

    final challenge = _challenges[_challengeIdx];
    final isMatch = _selectedLine == challenge['bugLine'];

    setState(() {
      _isSubmitted = true;
      if (isMatch) {
        _score += 250;
        widget.onScoreUpdate(_score);
      }
    });
  }

  void _nextChallenge() {
    if (_challengeIdx + 1 < _challenges.length) {
      setState(() {
        _challengeIdx++;
        _selectedLine = null;
        _isSubmitted = false;
      });
    } else {
      widget.onGameOver(_score, {'bugsFound': _challenges.length});
    }
  }

  @override
  Widget build(BuildContext context) {
    final challenge = _challenges[_challengeIdx];
    final isMatch = _selectedLine == challenge['bugLine'];

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
                      'Bug ${_challengeIdx + 1} of ${_challenges.length}',
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
                const SizedBox(height: 4),
                Text(
                  'Tap the line where the error or defect occurs:',
                  style: TextStyle(fontSize: 12, color: context.textSecondaryColor),
                ),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: context.gameCodeBgColor,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: context.gameCodeBorderColor),
                  ),
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: List.generate(
                      (challenge['lines'] as List<String>).length,
                      (idx) {
                        final lineNum = idx + 1;
                        final lineText = (challenge['lines'] as List<String>)[idx];
                        final isSelected = _selectedLine == lineNum;
                        final isTargetBug = _isSubmitted && lineNum == challenge['bugLine'];

                        Color bg = Colors.transparent;
                        if (isTargetBug) {
                          bg = Colors.red.withValues(alpha: 0.2);
                        } else if (isSelected) {
                          bg = Colors.indigo.withValues(alpha: 0.2);
                        }

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: InkWell(
                            onTap: _isSubmitted ? null : () => setState(() => _selectedLine = lineNum),
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                              decoration: BoxDecoration(
                                color: bg,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isTargetBug
                                      ? Colors.red.withValues(alpha: 0.65)
                                      : (isSelected
                                          ? Colors.indigo.withValues(alpha: 0.65)
                                          : Colors.transparent),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  SizedBox(
                                    width: 24,
                                    child: Text(
                                      '$lineNum',
                                      style: TextStyle(
                                        color: context.textMutedColor,
                                        fontFamily: 'monospace',
                                        fontSize: 11.5,
                                        height: 1.4,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  Expanded(
                                    child: Text(
                                      lineText.isEmpty ? ' ' : lineText,
                                      softWrap: true,
                                      style: TextStyle(
                                        color: context.textPrimaryColor,
                                        fontFamily: 'monospace',
                                        fontSize: 12.5,
                                        height: 1.4,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                  if (isTargetBug) ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.red.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(color: Colors.red.withValues(alpha: 0.5)),
                                      ),
                                      child: const Text(
                                        'BUG',
                                        style: TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
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
                          isMatch ? 'Correct Bug Spotted! (+250 pts)' : 'Wrong Line!',
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
                    onPressed: _selectedLine != null ? _submitLine : null,
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(double.infinity, 46),
                      backgroundColor: AppColors.gamePrimaryButton,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Submit Line', style: TextStyle(fontWeight: FontWeight.w900)),
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
