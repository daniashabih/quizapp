import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

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
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: context.gameBadgeBgColor,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: context.gameBadgeBorderColor),
                    ),
                    child: Text(
                      '$_wpm WPM',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        fontFamily: 'monospace',
                        color: context.gameBadgeTextColor,
                      ),
                    ),
                  ),
                  Text(
                    'Accuracy: $_accuracy%',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppColors.gameBestScore,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: context.gameCodeBgColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: context.gameCodeBorderColor),
                ),
                padding: const EdgeInsets.all(14),
                child: RichText(
                  text: TextSpan(
                    children: List.generate(_passage.length, (i) {
                      final char = _passage[i];
                      Color col = context.textMutedColor;

                      if (i < typedText.length) {
                        col = typedText[i] == char ? AppColors.success : AppColors.error;
                      }

                      return TextSpan(
                        text: char,
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 13,
                          height: 1.4,
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
                style: TextStyle(
                  color: context.textPrimaryColor,
                  fontFamily: 'monospace',
                  fontSize: 13,
                ),
                decoration: InputDecoration(
                  hintText: 'Start typing here...',
                  hintStyle: TextStyle(color: context.textMutedColor),
                  filled: true,
                  fillColor: context.cardBgColor,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: context.borderColor),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: context.borderColor),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.gamePrimaryButton, width: 2),
                  ),
                ),
              ),
              if (_isFinished) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.green.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    'Passage Finished! Final: $_wpm WPM with $_accuracy% accuracy.',
                    style: const TextStyle(
                      color: Color(0xFF15803D),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
