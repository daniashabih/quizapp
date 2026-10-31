import 'package:flutter/material.dart';

class FlutterSpeedTyping extends StatefulWidget {
  final void Function(int score, Map<String, dynamic> metadata) onGameOver;
  final void Function(int score) onScoreUpdate;
  final bool isPaused;

  const FlutterSpeedTyping({
    super.key,
    required this.onGameOver,
    required this.onScoreUpdate,
    required this.isPaused,
  });

  @override
  State<FlutterSpeedTyping> createState() => _FlutterSpeedTypingState();
}

class _FlutterSpeedTypingState extends State<FlutterSpeedTyping> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  static const String _passage =
      'Clean code is simple, direct, and readable prose. Naming conventions and small functions make architectures easy to maintain.';

  DateTime? _startTime;
  int _wpm = 0;
  int _accuracy = 100;
  bool _isFinished = false;

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onTextChanged(String val) {
    if (_isFinished || widget.isPaused) return;

    _startTime ??= DateTime.now();

    // Accuracy
    int correctChars = 0;
    for (int i = 0; i < val.length && i < _passage.length; i++) {
      if (val[i] == _passage[i]) correctChars++;
    }
    final acc = val.isNotEmpty ? ((correctChars / val.length) * 100).round() : 100;

    // WPM
    final elapsedMins = DateTime.now().difference(_startTime!).inMilliseconds / 60000.0;
    final wordsTyped = val.trim().split(RegExp(r'\s+')).where((s) => s.isNotEmpty).length;
    final currentWpm = elapsedMins > 0 ? (wordsTyped / elapsedMins).round() : 0;

    setState(() {
      _accuracy = acc;
      _wpm = currentWpm;
    });

    if (val.length >= _passage.length) {
      setState(() {
        _isFinished = true;
      });
      final finalScore = (currentWpm * 10 * (acc / 100)).round();
      widget.onScoreUpdate(finalScore);
      widget.onGameOver(finalScore, {
        'wpm': currentWpm,
        'accuracy': acc,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final typedText = _controller.text;

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
                    '$_wpm WPM',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.green),
                  ),
                  visualDensity: VisualDensity.compact,
                ),
                Text(
                  'Accuracy: $_accuracy%',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(12),
              child: RichText(
                text: TextSpan(
                  children: List.generate(_passage.length, (i) {
                    final char = _passage[i];
                    Color col = Colors.grey.shade600;

                    if (i < typedText.length) {
                      col = typedText[i] == char ? Colors.greenAccent : Colors.redAccent;
                    }

                    return TextSpan(
                      text: char,
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 13,
                        color: col,
                        fontWeight: i < typedText.length && typedText[i] != char ? FontWeight.bold : FontWeight.normal,
                      ),
                    );
                  }),
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _controller,
              focusNode: _focusNode,
              enabled: !_isFinished && !widget.isPaused,
              onChanged: _onTextChanged,
              decoration: InputDecoration(
                hintText: 'Start typing here...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            if (_isFinished) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Passage Finished! Final: $_wpm WPM with $_accuracy% accuracy.',
                  style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
