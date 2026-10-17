import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/question_model.dart';
import '../models/quiz_result_model.dart';
import 'auth_provider.dart';
import 'core_providers.dart';

class QuizState {
  final String? attemptId;
  final String category;
  final int session;
  final List<QuestionModel> questions;
  final int currentIndex;
  final Map<String, int> selectedAnswers;
  final Map<String, QuestionEvaluationState> evaluatedAnswers;
  final Set<String> flaggedQuestions;
  final bool isLoading;
  final bool isSubmitting;
  final bool isSubmitted;
  final QuizResultModel? lastResult;
  final int timeTakenSeconds;
  final String? error;
  final String? lastSelectedQuestionId;
  final int? lastSelectedOptionIndex;

  const QuizState({
    this.attemptId,
    this.category = '',
    this.session = 1,
    this.questions = const [],
    this.currentIndex = 0,
    this.selectedAnswers = const {},
    this.evaluatedAnswers = const {},
    this.flaggedQuestions = const {},
    this.isLoading = false,
    this.isSubmitting = false,
    this.isSubmitted = false,
    this.lastResult,
    this.timeTakenSeconds = 0,
    this.error,
    this.lastSelectedQuestionId,
    this.lastSelectedOptionIndex,
  });

  QuestionModel? get currentQuestion {
    if (questions.isEmpty || currentIndex >= questions.length) return null;
    return questions[currentIndex];
  }

  int get totalQuestions => questions.length;
  int get answeredCount => selectedAnswers.length;
  bool get isLastQuestion => questions.isNotEmpty && currentIndex == questions.length - 1;
  bool get isCurrentFlagged =>
      currentQuestion != null && flaggedQuestions.contains(currentQuestion!.id);

  bool get isCurrentQuestionAnswered =>
      currentQuestion != null && selectedAnswers.containsKey(currentQuestion!.id);

  QuestionEvaluationState? get currentEvaluation =>
      currentQuestion != null ? evaluatedAnswers[currentQuestion!.id] : null;

  bool get isCurrentQuestionLocked =>
      isCurrentQuestionAnswered || (currentEvaluation?.isLocked ?? false);

  QuizState copyWith({
    String? attemptId,
    String? category,
    int? session,
    List<QuestionModel>? questions,
    int? currentIndex,
    Map<String, int>? selectedAnswers,
    Map<String, QuestionEvaluationState>? evaluatedAnswers,
    Set<String>? flaggedQuestions,
    bool? isLoading,
    bool? isSubmitting,
    bool? isSubmitted,
    QuizResultModel? lastResult,
    int? timeTakenSeconds,
    String? error,
    bool clearError = false,
    String? lastSelectedQuestionId,
    int? lastSelectedOptionIndex,
  }) {
    return QuizState(
      attemptId: attemptId ?? this.attemptId,
      category: category ?? this.category,
      session: session ?? this.session,
      questions: questions ?? this.questions,
      currentIndex: currentIndex ?? this.currentIndex,
      selectedAnswers: selectedAnswers ?? this.selectedAnswers,
      evaluatedAnswers: evaluatedAnswers ?? this.evaluatedAnswers,
      flaggedQuestions: flaggedQuestions ?? this.flaggedQuestions,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isSubmitted: isSubmitted ?? this.isSubmitted,
      lastResult: lastResult ?? this.lastResult,
      timeTakenSeconds: timeTakenSeconds ?? this.timeTakenSeconds,
      error: clearError ? null : (error ?? this.error),
      lastSelectedQuestionId: lastSelectedQuestionId ?? this.lastSelectedQuestionId,
      lastSelectedOptionIndex: lastSelectedOptionIndex ?? this.lastSelectedOptionIndex,
    );
  }
}

class QuizNotifier extends StateNotifier<QuizState> {
  final Ref _ref;
  DateTime? _quizStartTime;
  Timer? _autoSaveDebounceTimer;

  QuizNotifier(this._ref) : super(const QuizState());

  String _getStorageKey(String category, int session) {
    final user = _ref.read(authProvider).user;
    final userId = user?.id ?? 'guest';
    return 'hb_quiz_progress_${userId}_${category.trim().toLowerCase()}_$session';
  }

  /// Start new quiz session or resume an active in-progress attempt
  Future<void> startQuiz({
    required String category,
    required int session,
    bool forceNew = false,
  }) async {
    state = QuizState(
      category: category,
      session: session,
      isLoading: true,
    );

    try {
      final repository = _ref.read(quizRepositoryProvider);
      final storageKey = _getStorageKey(category, session);

      // 1. Check local persistence first for instant resume
      if (!forceNew) {
        final prefs = await SharedPreferences.getInstance();
        final localDataStr = prefs.getString(storageKey);
        if (localDataStr != null && localDataStr.isNotEmpty) {
          try {
            final Map<String, dynamic> localData = jsonDecode(localDataStr);
            final rawQuestions = localData['questions'] as List? ?? [];
            if (rawQuestions.isNotEmpty) {
              final restoredQuestions = rawQuestions
                  .map((q) => QuestionModel.fromJson(q as Map<String, dynamic>))
                  .toList();

              final Map<String, int> restoredSelected = {};
              final rawSelected = localData['selectedAnswers'] as Map? ?? {};
              rawSelected.forEach((k, v) {
                final idx = int.tryParse(v.toString());
                if (idx != null) restoredSelected[k.toString()] = idx;
              });

              final Map<String, QuestionEvaluationState> restoredEvaluated = {};
              final rawEvaluated = localData['evaluatedAnswers'] as Map? ?? {};
              rawEvaluated.forEach((k, v) {
                if (v is Map) {
                  restoredEvaluated[k.toString()] = QuestionEvaluationState.fromJson(
                    Map<String, dynamic>.from(v),
                  );
                }
              });

              // Also ensure every selected question has an evaluation state with locked answers
              for (final q in restoredQuestions) {
                if (restoredSelected.containsKey(q.id) && !restoredEvaluated.containsKey(q.id)) {
                  final chosenIdx = restoredSelected[q.id]!;
                  final correctIdx = q.correctOptionIndex;
                  restoredEvaluated[q.id] = QuestionEvaluationState(
                    selectedOptionIndex: chosenIdx,
                    isCorrect: chosenIdx == correctIdx,
                    isLocked: true,
                    correctOptionIndex: correctIdx,
                    explanation: q.explanation,
                  );
                }
              }

              final rawFlagged = localData['flaggedQuestions'] as List? ?? [];
              final restoredFlagged = rawFlagged.map((f) => f.toString()).toSet();
              final restoredIndex = int.tryParse(localData['currentIndex']?.toString() ?? '0') ?? 0;
              final restoredAttemptId = localData['attemptId']?.toString();
              final restoredTime = int.tryParse(localData['timeTakenSeconds']?.toString() ?? '0') ?? 0;

              _quizStartTime = DateTime.now().subtract(Duration(seconds: restoredTime));

              state = state.copyWith(
                attemptId: restoredAttemptId,
                questions: restoredQuestions,
                currentIndex: restoredIndex.clamp(0, restoredQuestions.length - 1),
                selectedAnswers: restoredSelected,
                evaluatedAnswers: restoredEvaluated,
                flaggedQuestions: restoredFlagged,
                timeTakenSeconds: restoredTime,
                isLoading: false,
              );
              return;
            }
          } catch (_) {
            // If local data parsing fails, fall back to server fetch
          }
        }
      }

      // 2. If no local attempt, check backend for active in-progress attempt if authenticated
      if (!forceNew) {
        final backendAttemptRes = await repository.startOrResumeAttempt(
          category: category,
          session: session,
          checkOnly: true,
        );

        if (backendAttemptRes != null &&
            backendAttemptRes['hasActiveAttempt'] == true &&
            backendAttemptRes['attempt'] != null) {
          final attempt = backendAttemptRes['attempt'] as Map<String, dynamic>;
          final rawSnapshot = attempt['questionsSnapshot'] as List? ?? [];
          if (rawSnapshot.isNotEmpty) {
            final questions = rawSnapshot
                .map((q) => QuestionModel.fromJson(q as Map<String, dynamic>))
                .toList();

            final rawAnswers = attempt['answers'] as Map? ?? {};
            final Map<String, int> restoredSelected = {};
            final Map<String, QuestionEvaluationState> restoredEvaluated = {};

            rawAnswers.forEach((k, v) {
              final idx = int.tryParse(v.toString());
              if (idx != null) {
                restoredSelected[k.toString()] = idx;
              }
            });

            for (final q in questions) {
              if (restoredSelected.containsKey(q.id)) {
                final chosenIdx = restoredSelected[q.id]!;
                final correctIdx = q.correctOptionIndex;
                restoredEvaluated[q.id] = QuestionEvaluationState(
                  selectedOptionIndex: chosenIdx,
                  isCorrect: chosenIdx == correctIdx,
                  isLocked: true,
                  correctOptionIndex: correctIdx,
                  explanation: q.explanation,
                );
              }
            }

            final rawFlagged = attempt['flaggedQuestions'] as List? ?? [];
            final flagged = rawFlagged.map((f) => f.toString()).toSet();
            final currIdx = int.tryParse(attempt['currentQuestionIndex']?.toString() ?? '0') ?? 0;

            _quizStartTime = DateTime.now();
            state = state.copyWith(
              attemptId: attempt['id']?.toString(),
              questions: questions,
              currentIndex: currIdx.clamp(0, questions.length - 1),
              selectedAnswers: restoredSelected,
              evaluatedAnswers: restoredEvaluated,
              flaggedQuestions: flagged,
              isLoading: false,
            );
            _saveToLocal();
            return;
          }
        }
      }

      // 3. Start fresh quiz from question bank
      final fetchedQuestions = await repository.getQuestions(
        category: category,
        session: session > 0 ? session : null,
      );

      // Randomize questions for fairness
      final questions = [...fetchedQuestions]..shuffle();

      String? newAttemptId;
      try {
        final startRes = await repository.startOrResumeAttempt(
          category: category,
          session: session,
          questionsSnapshot: questions.map((q) => q.toJson()).toList(),
          totalQuestions: questions.length,
          forceNew: forceNew,
        );
        if (startRes != null && startRes['attempt'] != null) {
          newAttemptId = startRes['attempt']['id']?.toString();
        }
      } catch (_) {
        // Continue offline if server cannot be reached
      }

      _quizStartTime = DateTime.now();
      state = state.copyWith(
        attemptId: newAttemptId,
        questions: questions,
        currentIndex: 0,
        selectedAnswers: const {},
        evaluatedAnswers: const {},
        flaggedQuestions: const {},
        isLoading: false,
      );

      // Save initial fresh snapshot to local storage
      _saveToLocal();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Select answer option for question:
  /// Synchronously evaluates answer, locks options, triggers animation, and persists progress.
  void selectAnswer(String questionId, int optionIndex) {
    // STRICT SYNCHRONOUS LOCK:
    // If the question is already answered or evaluated, immediately block selection!
    if (state.selectedAnswers.containsKey(questionId) ||
        state.evaluatedAnswers.containsKey(questionId)) {
      return;
    }

    final questionIndex = state.questions.indexWhere((q) => q.id == questionId);
    if (questionIndex == -1) return;
    final question = state.questions[questionIndex];

    if (optionIndex < 0 || optionIndex >= question.options.length) {
      return;
    }

    final correctIdx = question.correctOptionIndex;
    final isCorrect = (optionIndex == correctIdx);

    // Synchronously lock and update state
    final updatedSelected = Map<String, int>.from(state.selectedAnswers);
    updatedSelected[questionId] = optionIndex;

    final updatedEvaluated = Map<String, QuestionEvaluationState>.from(state.evaluatedAnswers);
    updatedEvaluated[questionId] = QuestionEvaluationState(
      selectedOptionIndex: optionIndex,
      isCorrect: isCorrect,
      isLocked: true,
      correctOptionIndex: correctIdx,
      explanation: question.explanation,
    );

    state = state.copyWith(
      selectedAnswers: updatedSelected,
      evaluatedAnswers: updatedEvaluated,
      lastSelectedQuestionId: questionId,
      lastSelectedOptionIndex: optionIndex,
    );

    // Persist immediately locally and debounce backend sync
    _persistProgress();
  }

  void toggleFlag(String questionId) {
    final updated = Set<String>.from(state.flaggedQuestions);
    if (updated.contains(questionId)) {
      updated.remove(questionId);
    } else {
      updated.add(questionId);
    }
    state = state.copyWith(flaggedQuestions: updated);
    _persistProgress();
  }

  void nextQuestion() {
    if (state.currentIndex < state.questions.length - 1) {
      state = state.copyWith(
        currentIndex: state.currentIndex + 1,
        lastSelectedQuestionId: null,
        lastSelectedOptionIndex: null,
      );
      _persistProgress();
    }
  }

  void prevQuestion() {
    if (state.currentIndex > 0) {
      state = state.copyWith(
        currentIndex: state.currentIndex - 1,
        lastSelectedQuestionId: null,
        lastSelectedOptionIndex: null,
      );
      _persistProgress();
    }
  }

  void jumpToQuestion(int index) {
    if (index >= 0 && index < state.questions.length) {
      state = state.copyWith(
        currentIndex: index,
        lastSelectedQuestionId: null,
        lastSelectedOptionIndex: null,
      );
      _persistProgress();
    }
  }

  // Persist progress to local storage and backend attempt
  void _persistProgress() {
    _saveToLocal();

    if (state.attemptId != null && state.attemptId!.isNotEmpty) {
      _autoSaveDebounceTimer?.cancel();
      _autoSaveDebounceTimer = Timer(const Duration(milliseconds: 500), () async {
        try {
          final repository = _ref.read(quizRepositoryProvider);
          final Map<String, dynamic> answersPayload = {};
          state.selectedAnswers.forEach((k, v) => answersPayload[k] = v);

          await repository.updateAttemptProgress(
            state.attemptId!,
            currentQuestionIndex: state.currentIndex,
            answers: answersPayload,
            flaggedQuestions: state.flaggedQuestions.toList(),
            answeredCount: state.selectedAnswers.length,
            progressPercentage: state.totalQuestions > 0
                ? (state.selectedAnswers.length / state.totalQuestions) * 100
                : 0.0,
          );
        } catch (_) {}
      });
    }
  }

  Future<void> _saveToLocal() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final storageKey = _getStorageKey(state.category, state.session);

      final Map<String, dynamic> evaluatedMap = {};
      state.evaluatedAnswers.forEach((k, v) {
        evaluatedMap[k] = v.toJson();
      });

      final durationSeconds = _quizStartTime != null
          ? DateTime.now().difference(_quizStartTime!).inSeconds
          : state.timeTakenSeconds;

      final data = {
        'attemptId': state.attemptId,
        'category': state.category,
        'session': state.session,
        'currentIndex': state.currentIndex,
        'selectedAnswers': state.selectedAnswers,
        'evaluatedAnswers': evaluatedMap,
        'flaggedQuestions': state.flaggedQuestions.toList(),
        'questions': state.questions.map((q) => q.toJson()).toList(),
        'timeTakenSeconds': durationSeconds,
        'lastSavedAt': DateTime.now().toIso8601String(),
      };

      await prefs.setString(storageKey, jsonEncode(data));
    } catch (_) {}
  }

  Future<void> _clearLocalProgress() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final storageKey = _getStorageKey(state.category, state.session);
      await prefs.remove(storageKey);
    } catch (_) {}
  }

  // Submit assessment to backend for authoritative evaluation
  Future<QuizResultModel?> submitQuiz() async {
    if (state.isSubmitting || state.isSubmitted) return state.lastResult;

    final durationSeconds = _quizStartTime != null
        ? DateTime.now().difference(_quizStartTime!).inSeconds
        : state.timeTakenSeconds;

    state = state.copyWith(
      isSubmitting: true,
      timeTakenSeconds: durationSeconds,
    );

    try {
      final repository = _ref.read(quizRepositoryProvider);
      final Map<String, dynamic> answersPayload = {};
      state.selectedAnswers.forEach((key, val) {
        answersPayload[key] = val;
      });

      final result = await repository.submitQuiz(
        category: state.category,
        session: state.session,
        answers: answersPayload,
        attemptId: state.attemptId,
        timeTaken: durationSeconds,
        questionsSnapshot: state.questions.map((q) => q.toJson()).toList(),
      );

      await _clearLocalProgress();

      state = state.copyWith(
        isSubmitting: false,
        isLoading: false,
        isSubmitted: true,
        lastResult: result,
      );
      return result;
    } catch (e) {
      // Local fallback calculation using user's original selections
      int fallbackScore = 0;
      for (final q in state.questions) {
        final selectedIdx = state.selectedAnswers[q.id];
        if (selectedIdx != null && selectedIdx < q.options.length) {
          final chosenText = q.options[selectedIdx].trim().toLowerCase();
          final correctText = q.correctAnswer.trim().toLowerCase();
          if (chosenText == correctText) {
            fallbackScore++;
          }
        }
      }

      final total = state.questions.length;
      final percentage = total > 0 ? ((fallbackScore / total) * 100).roundToDouble() : 0.0;

      final fallbackResult = QuizResultModel(
        id: 'HB-OFFLINE-${DateTime.now().millisecondsSinceEpoch}',
        category: state.category,
        session: state.session,
        score: fallbackScore,
        total: total,
        percentage: percentage,
        passed: percentage >= 70,
        createdAt: DateTime.now().toIso8601String(),
      );

      await _clearLocalProgress();

      state = state.copyWith(
        isSubmitting: false,
        isLoading: false,
        isSubmitted: true,
        lastResult: fallbackResult,
      );
      return fallbackResult;
    }
  }

  /// Discard current attempt and clear saved state
  Future<void> discardCurrentAttempt() async {
    _autoSaveDebounceTimer?.cancel();
    if (state.attemptId != null && state.attemptId!.isNotEmpty) {
      try {
        final repository = _ref.read(quizRepositoryProvider);
        await repository.discardAttempt(state.attemptId!);
      } catch (_) {}
    }
    await _clearLocalProgress();
    state = const QuizState();
  }

  void resetQuiz() {
    _autoSaveDebounceTimer?.cancel();
    state = const QuizState();
  }

  @override
  void dispose() {
    _autoSaveDebounceTimer?.cancel();
    super.dispose();
  }
}

final quizProvider = StateNotifierProvider<QuizNotifier, QuizState>((ref) {
  return QuizNotifier(ref);
});
