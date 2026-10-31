import 'package:flutter/material.dart';

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
                  'Predictor ${_challengeIdx + 1} of ${_challenges.length}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              challenge['title'],
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(12),
              child: Text(
                challenge['code'],
                style: const TextStyle(
                  color: Colors.lightGreenAccent,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  height: 1.4,
                ),
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'Select Expected Terminal Output:',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: (challenge['options'] as List<String>).map((opt) {
                final isSelected = _selectedOption == opt;
                final isTargetSolution = _isSubmitted && opt == challenge['solution'];
                final isWrongSelected = _isSubmitted && isSelected && !isMatch;

                Color? chipBg;
                if (isTargetSolution) {
                  chipBg = Colors.green.withValues(alpha: 0.2);
                } else if (isWrongSelected) {
                  chipBg = Colors.red.withValues(alpha: 0.2);
                }

                return ChoiceChip(
                  label: Text(opt, style: const TextStyle(fontFamily: 'monospace')),
                  selected: isSelected,
                  backgroundColor: chipBg,
                  onSelected: _isSubmitted ? null : (selected) {
                    setState(() => _selectedOption = selected ? opt : null);
                  },
                );
              }).toList(),
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
                      isMatch ? 'Correct Output! (+200 pts)' : 'Incorrect Prediction!',
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
                onPressed: _selectedOption != null ? _submitAnswer : null,
                child: const Text('Verify Prediction'),
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
