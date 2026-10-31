import 'package:flutter/material.dart';

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
                    challenge['language'],
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  visualDensity: VisualDensity.compact,
                ),
                Text(
                  'Bug ${_challengeIdx + 1} of ${_challenges.length}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              challenge['title'],
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 4),
            const Text(
              'Tap the line where the error or defect occurs:',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(12),
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
                      bg = Colors.red.withValues(alpha: 0.3);
                    } else if (isSelected) {
                      bg = Colors.blue.withValues(alpha: 0.3);
                    }

                    return InkWell(
                      onTap: _isSubmitted ? null : () => setState(() => _selectedLine = lineNum),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 6),
                        decoration: BoxDecoration(
                          color: bg,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 24,
                              child: Text(
                                '$lineNum',
                                style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontFamily: 'monospace',
                                  fontSize: 11,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Text(
                                lineText,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontFamily: 'monospace',
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            if (isTargetBug)
                              const Text(
                                'BUG',
                                style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 12),
            if (_isSubmitted)
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isMatch ? Colors.green.withValues(alpha: 0.1) : Colors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isMatch ? 'Correct Bug Spotted! (+250 pts)' : 'Wrong Line!',
                      style: TextStyle(
                        color: isMatch ? Colors.green : Colors.red,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      challenge['explanation'],
                      style: const TextStyle(fontSize: 12),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 12),
            if (!_isSubmitted)
              FilledButton(
                onPressed: _selectedLine != null ? _submitLine : null,
                child: const Text('Submit Line'),
              )
            else
              FilledButton(
                onPressed: _nextChallenge,
                child: const Text('Next Challenge'),
              ),
          ],
        ),
      ),
    );
  }
}
