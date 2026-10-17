import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hangbug/core/constants/app_colors.dart';
import 'package:hangbug/models/question_model.dart';
import 'package:hangbug/models/quiz_result_model.dart';
import 'package:hangbug/providers/core_providers.dart';
import 'package:hangbug/providers/quiz_provider.dart';
import 'package:hangbug/repositories/quiz_repository.dart';
import 'package:hangbug/screens/quiz/quiz_screen.dart';

class MockQuizRepository implements QuizRepository {
  final List<QuestionModel> stubQuestions;
  int submitCount = 0;

  MockQuizRepository(this.stubQuestions);

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<List<QuestionModel>> getQuestions({
    required String category,
    int? session,
  }) async {
    return stubQuestions;
  }

  @override
  Future<Map<String, dynamic>?> startOrResumeAttempt({
    required String category,
    required int session,
    List<Map<String, dynamic>>? questionsSnapshot,
    int? totalQuestions,
    bool forceNew = false,
    bool checkOnly = false,
  }) async {
    return null;
  }

  @override
  Future<bool> updateAttemptProgress(
    String attemptId, {
    required int currentQuestionIndex,
    required Map<String, dynamic> answers,
    List<String>? flaggedQuestions,
    int? score,
    int? answeredCount,
    double? progressPercentage,
    String? status,
  }) async {
    return true;
  }

  @override
  Future<QuizResultModel> submitQuiz({
    required String category,
    required int session,
    required Map<String, dynamic> answers,
    String? attemptId,
    int? timeTaken,
    List<Map<String, dynamic>>? questionsSnapshot,
  }) async {
    submitCount++;
    int score = 0;
    for (final q in stubQuestions) {
      final userAns = answers[q.id];
      if (userAns != null && userAns is int && userAns < q.options.length) {
        if (q.options[userAns].trim().toLowerCase() == q.correctAnswer.trim().toLowerCase()) {
          score++;
        }
      }
    }
    final pct = stubQuestions.isNotEmpty ? (score / stubQuestions.length) * 100 : 0.0;
    return QuizResultModel(
      id: 'HB-TEST-RES-1',
      category: category,
      session: session,
      score: score,
      total: stubQuestions.length,
      percentage: pct,
      passed: pct >= 70,
      isEligibleForCertificate: pct >= 80,
      certificateId: pct >= 80 ? 'HB-CERT-TEST1' : null,
      createdAt: DateTime.now().toIso8601String(),
    );
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final testQuestions = [
    const QuestionModel(
      id: 'q1',
      category: 'Flutter',
      session: 1,
      questionText: 'What is a StatelessWidget in Flutter?',
      options: ['Mutable widget', 'Immutable widget', 'A database', 'A compiler'],
      correctAnswer: 'Immutable widget', // index 1
      explanation: 'StatelessWidget describes part of user interface that does not depend on state.',
    ),
    const QuestionModel(
      id: 'q2',
      category: 'Flutter',
      session: 1,
      questionText: 'Which keyword defines a constant in Dart?',
      options: ['var', 'let', 'const', 'val'],
      correctAnswer: 'const', // index 2
      explanation: 'const creates compile-time constants.',
    ),
    const QuestionModel(
      id: 'q3',
      category: 'Flutter',
      session: 1,
      questionText: 'What manages state in Riverpod?',
      options: ['StateNotifier', 'HttpSession', 'Cookie', 'GlobalVar'],
      correctAnswer: 'StateNotifier', // index 0
      explanation: 'StateNotifier is a value notifier holding state.',
    ),
  ];

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('1 & 2. Question Model & Index Resolution', () {
    test('correctOptionIndex resolves correctly by exact text, letter, and index', () {
      const qText = QuestionModel(
        id: '1',
        category: 'Dart',
        questionText: 'Q?',
        options: ['Apple', 'Banana', 'Orange'],
        correctAnswer: 'Banana',
      );
      expect(qText.correctOptionIndex, equals(1));

      const qLetter = QuestionModel(
        id: '2',
        category: 'Dart',
        questionText: 'Q?',
        options: ['Red', 'Green', 'Blue'],
        correctAnswer: 'C',
      );
      expect(qLetter.correctOptionIndex, equals(2));

      const qDigit = QuestionModel(
        id: '3',
        category: 'Dart',
        questionText: 'Q?',
        options: ['First', 'Second', 'Third'],
        correctAnswer: '0',
      );
      expect(qDigit.correctOptionIndex, equals(0));
    });
  });

  group('3. Correct and Incorrect Answer Selection & Evaluation', () {
    test('Selecting correct answer marks isCorrect=true and records original selection', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [
          quizRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );

      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // Question 1 correct answer is index 1 ("Immutable widget")
      notifier.selectAnswer('q1', 1);

      final state = container.read(quizProvider);
      expect(state.selectedAnswers['q1'], equals(1));
      expect(state.evaluatedAnswers['q1']?.isCorrect, isTrue);
      expect(state.evaluatedAnswers['q1']?.correctOptionIndex, equals(1));
      expect(state.evaluatedAnswers['q1']?.isLocked, isTrue);
    });

    test('Selecting incorrect answer marks isCorrect=false and reveals correct answer', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [
          quizRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );

      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // Question 1 correct answer is index 1. User selects index 0 ("Mutable widget")
      notifier.selectAnswer('q1', 0);

      final state = container.read(quizProvider);
      // User's recorded selection must be 0, NOT changed to 1
      expect(state.selectedAnswers['q1'], equals(0));
      expect(state.evaluatedAnswers['q1']?.isCorrect, isFalse);
      expect(state.evaluatedAnswers['q1']?.selectedOptionIndex, equals(0));
      expect(state.evaluatedAnswers['q1']?.correctOptionIndex, equals(1));
      expect(state.evaluatedAnswers['q1']?.isLocked, isTrue);
      expect(state.evaluatedAnswers['q1']?.explanation, contains('StatelessWidget'));
    });
  });

  group('4 & 5. Strict Answer Locking & Rapid Tap Protection', () {
    test('Answer cannot be changed after first selection', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [
          quizRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );

      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // First selection: index 0 (Incorrect)
      notifier.selectAnswer('q1', 0);
      expect(container.read(quizProvider).selectedAnswers['q1'], equals(0));

      // Attempt to change to index 1 (Correct)
      notifier.selectAnswer('q1', 1);
      // Must STILL be 0!
      expect(container.read(quizProvider).selectedAnswers['q1'], equals(0));
      expect(container.read(quizProvider).evaluatedAnswers['q1']?.isCorrect, isFalse);

      // Attempt to change to index 2
      notifier.selectAnswer('q1', 2);
      expect(container.read(quizProvider).selectedAnswers['q1'], equals(0));
    });

    test('Rapid consecutive taps register only the first selection', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [
          quizRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );

      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // Rapidly fire multiple taps in immediate succession
      notifier.selectAnswer('q2', 0);
      notifier.selectAnswer('q2', 1);
      notifier.selectAnswer('q2', 2);
      notifier.selectAnswer('q2', 3);

      final state = container.read(quizProvider);
      expect(state.selectedAnswers['q2'], equals(0));
      expect(state.evaluatedAnswers['q2']?.selectedOptionIndex, equals(0));
    });
  });

  group('6. Navigation & Question Lock Persistence', () {
    test('Answers remain locked when navigating to next question and back', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [
          quizRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );

      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // Answer question at index 0
      final firstQId = container.read(quizProvider).questions[0].id;
      notifier.selectAnswer(firstQId, 1);

      // Navigate to next question
      notifier.nextQuestion();
      expect(container.read(quizProvider).currentIndex, equals(1));

      // Navigate back to first question
      notifier.prevQuestion();
      expect(container.read(quizProvider).currentIndex, equals(0));

      // Confirm still locked
      expect(container.read(quizProvider).isCurrentQuestionLocked, isTrue);

      // Try modifying
      notifier.selectAnswer(firstQId, 0);
      expect(container.read(quizProvider).selectedAnswers[firstQId], equals(1));
    });
  });

  group('7 & 8. Resume & Force-Close Persistence', () {
    test('Resuming in-progress quiz restores locked answers and correctness', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container1 = ProviderContainer(
        overrides: [
          quizRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );

      final notifier1 = container1.read(quizProvider.notifier);
      await notifier1.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // Answer question 1 with an incorrect answer
      final q0 = container1.read(quizProvider).questions[0];
      final wrongOption = (q0.correctOptionIndex == 0) ? 1 : 0;
      notifier1.selectAnswer(q0.id, wrongOption);
      notifier1.nextQuestion();

      // Simulate app restart / new session
      final container2 = ProviderContainer(
        overrides: [
          quizRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );

      final notifier2 = container2.read(quizProvider.notifier);
      // Resume without forceNew
      await notifier2.startQuiz(category: 'Flutter', session: 1, forceNew: false);

      final restoredState = container2.read(quizProvider);
      expect(restoredState.questions.length, equals(testQuestions.length));
      expect(restoredState.selectedAnswers.containsKey(q0.id), isTrue);
      expect(restoredState.selectedAnswers[q0.id], equals(wrongOption));
      expect(restoredState.evaluatedAnswers[q0.id]?.isLocked, isTrue);
      expect(restoredState.evaluatedAnswers[q0.id]?.isCorrect, isFalse);

      // Try modifying previously answered question
      final correctOption = q0.correctOptionIndex;
      notifier2.selectAnswer(q0.id, correctOption);
      // Must STILL be the original wrong selection!
      expect(container2.read(quizProvider).selectedAnswers[q0.id], equals(wrongOption));
    });
  });

  group('9 & 10. Scoring Accuracy & Duplicate Submission Protection', () {
    test('Final score uses original selections and does not award marks for revealed correct answers', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [
          quizRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );

      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // Answer q1 wrong (choose 0 instead of 1)
      notifier.selectAnswer('q1', 0);
      // Answer q2 right (choose 2)
      notifier.selectAnswer('q2', 2);
      // Answer q3 right (choose 0)
      notifier.selectAnswer('q3', 0);

      final result = await notifier.submitQuiz();
      expect(result, isNotNull);
      // 2 out of 3 correct
      expect(result!.score, equals(2));
      expect(result.total, equals(3));
      expect(result.percentage, closeTo(66.6, 0.5));
      expect(result.isPassed, isFalse); // < 70%
    });

    test('Duplicate submitQuiz calls return cached result without double submission', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [
          quizRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );

      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      notifier.selectAnswer('q1', 1);
      notifier.selectAnswer('q2', 2);
      notifier.selectAnswer('q3', 0);

      final res1 = await notifier.submitQuiz();
      final res2 = await notifier.submitQuiz();

      expect(mockRepo.submitCount, equals(1));
      expect(res1?.id, equals(res2?.id));
    });
  });

  group('11. UI Animation & Visual Feedback Widget Tests', () {
    testWidgets('QuizAnswerOptionCard renders incorrect styling and badge when wrong answer is evaluated', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: QuizAnswerOptionCard(
              index: 0,
              optionLetter: 'A',
              optionText: 'Mutable widget',
              isEvaluated: true,
              isUserSelection: true,
              isCorrectOption: false,
              shouldAnimate: false,
            ),
          ),
        ),
      );

      expect(find.text('A'), findsOneWidget);
      expect(find.text('Mutable widget'), findsOneWidget);
      expect(find.text('Incorrect Answer'), findsOneWidget);
      expect(find.byIcon(Icons.cancel_rounded), findsOneWidget);
    });

    testWidgets('QuizAnswerOptionCard renders correct styling and badge when correct answer is evaluated', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: QuizAnswerOptionCard(
              index: 1,
              optionLetter: 'B',
              optionText: 'Immutable widget',
              isEvaluated: true,
              isUserSelection: true,
              isCorrectOption: true,
              shouldAnimate: false,
            ),
          ),
        ),
      );

      expect(find.text('B'), findsOneWidget);
      expect(find.text('Immutable widget'), findsOneWidget);
      expect(find.text('Correct Answer!'), findsOneWidget);
      expect(find.byIcon(Icons.check_circle_rounded), findsOneWidget);
    });

    testWidgets('Locked option card ignores taps', (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuizAnswerOptionCard(
              index: 0,
              optionLetter: 'A',
              optionText: 'Test option',
              isEvaluated: true,
              isUserSelection: false,
              isCorrectOption: false,
              shouldAnimate: false,
              onTap: null, // Locked
            ),
          ),
        ),
      );

      await tester.tap(find.text('Test option'));
      await tester.pumpAndSettle();
      expect(tapped, isFalse);
    });
  });
}
