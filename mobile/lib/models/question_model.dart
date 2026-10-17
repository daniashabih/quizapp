import 'dart:convert';

class QuestionModel {
  final String id;
  final String category;
  final int session;
  final String questionText;
  final List<String> options;
  final String correctAnswer;
  final String difficulty;
  final String? explanation;

  const QuestionModel({
    required this.id,
    required this.category,
    this.session = 1,
    required this.questionText,
    required this.options,
    required this.correctAnswer,
    this.difficulty = 'beginner',
    this.explanation,
  });

  String get question => questionText;

  /// Returns the 0-based index of the correct option in [options],
  /// matching by text, letter (A-D), or index. Returns -1 if not found.
  int get correctOptionIndex {
    final trimmedCorrect = correctAnswer.trim().toLowerCase();
    
    // 1. Exact or case-insensitive match on option text
    for (int i = 0; i < options.length; i++) {
      if (options[i].trim().toLowerCase() == trimmedCorrect) {
        return i;
      }
    }

    // 2. Letter match: 'A', 'B', 'C', 'D' (or lowercase)
    if (correctAnswer.trim().length == 1) {
      final code = correctAnswer.trim().toUpperCase().codeUnitAt(0);
      final idx = code - 65; // 'A' -> 0, 'B' -> 1, etc.
      if (idx >= 0 && idx < options.length) {
        return idx;
      }
    }

    // 3. Digit match: '0', '1', '2', '3'
    final digit = int.tryParse(correctAnswer.trim());
    if (digit != null && digit >= 0 && digit < options.length) {
      return digit;
    }

    // 4. Normalized match (collapse whitespace and normalize & vs and)
    final normCorrect = trimmedCorrect
        .replaceAll(RegExp(r'\band\b'), '&')
        .replaceAll(RegExp(r'\s+'), ' ');
    for (int i = 0; i < options.length; i++) {
      final normOpt = options[i]
          .trim()
          .toLowerCase()
          .replaceAll(RegExp(r'\band\b'), '&')
          .replaceAll(RegExp(r'\s+'), ' ');
      if (normOpt == normCorrect) {
        return i;
      }
    }

    return -1;
  }

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    // Parse options list whether it is JSON array, string, or comma-separated
    List<String> parsedOptions = [];
    final rawOptions = json['options'];
    if (rawOptions is List) {
      parsedOptions = rawOptions.map((o) => o.toString().trim()).toList();
    } else if (rawOptions is String) {
      try {
        final decoded = jsonDecode(rawOptions);
        if (decoded is List) {
          parsedOptions = decoded.map((o) => o.toString().trim()).toList();
        }
      } catch (_) {
        parsedOptions = rawOptions
            .split(',')
            .map((s) => s.trim())
            .where((s) => s.isNotEmpty)
            .toList();
      }
    }

    final rawSession = json['session'];
    final sessionNum = rawSession is int
        ? rawSession
        : (int.tryParse(rawSession?.toString() ?? '1') ?? 1);

    return QuestionModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      session: sessionNum,
      questionText: json['question_text']?.toString() ??
          json['questionText']?.toString() ??
          '',
      options: parsedOptions,
      correctAnswer: json['correct_answer']?.toString() ??
          json['correctAnswer']?.toString() ??
          '',
      difficulty: json['difficulty']?.toString() ?? 'beginner',
      explanation: json['explanation']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category': category,
      'session': session,
      'question_text': questionText,
      'options': options,
      'correct_answer': correctAnswer,
      'difficulty': difficulty,
      'explanation': explanation,
    };
  }
}

/// Evaluation status of an answered question
enum QuestionAnswerStatus {
  unanswered,
  correct,
  incorrect,
}

/// Immutable evaluation state capturing immediate feedback,
/// strict answer locking, and explanation.
class QuestionEvaluationState {
  final int selectedOptionIndex;
  final bool isCorrect;
  final bool isLocked;
  final int correctOptionIndex;
  final String? explanation;

  const QuestionEvaluationState({
    required this.selectedOptionIndex,
    required this.isCorrect,
    this.isLocked = true,
    required this.correctOptionIndex,
    this.explanation,
  });

  Map<String, dynamic> toJson() => {
        'selectedOptionIndex': selectedOptionIndex,
        'isCorrect': isCorrect,
        'isLocked': isLocked,
        'correctOptionIndex': correctOptionIndex,
        if (explanation != null) 'explanation': explanation,
      };

  factory QuestionEvaluationState.fromJson(Map<String, dynamic> json) {
    return QuestionEvaluationState(
      selectedOptionIndex: json['selectedOptionIndex'] as int? ?? 0,
      isCorrect: json['isCorrect'] as bool? ?? false,
      isLocked: json['isLocked'] as bool? ?? true,
      correctOptionIndex: json['correctOptionIndex'] as int? ?? -1,
      explanation: json['explanation'] as String?,
    );
  }
}
