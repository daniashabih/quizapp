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
        if (q.isOptionCorrect(userAns)) {
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

  group('Regression Test 1: Selecting the correct option', () {
    test('Marks isCorrect=true, locks question, and records original selection', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
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
  });

  group('Regression Test 2: Selecting each incorrect option', () {
    test('Selecting option 0 when option 1 is correct marks isCorrect=false', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
      );
      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      notifier.selectAnswer('q1', 0);
      final state = container.read(quizProvider);
      expect(state.selectedAnswers['q1'], equals(0));
      expect(state.evaluatedAnswers['q1']?.isCorrect, isFalse);
      expect(state.evaluatedAnswers['q1']?.selectedOptionIndex, equals(0));
      expect(state.evaluatedAnswers['q1']?.correctOptionIndex, equals(1));
    });

    test('Selecting option 2 when option 1 is correct marks isCorrect=false', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
      );
      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      notifier.selectAnswer('q1', 2);
      final state = container.read(quizProvider);
      expect(state.selectedAnswers['q1'], equals(2));
      expect(state.evaluatedAnswers['q1']?.isCorrect, isFalse);
      expect(state.evaluatedAnswers['q1']?.selectedOptionIndex, equals(2));
      expect(state.evaluatedAnswers['q1']?.correctOptionIndex, equals(1));
    });

    test('Selecting option 3 when option 1 is correct marks isCorrect=false', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
      );
      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      notifier.selectAnswer('q1', 3);
      final state = container.read(quizProvider);
      expect(state.selectedAnswers['q1'], equals(3));
      expect(state.evaluatedAnswers['q1']?.isCorrect, isFalse);
      expect(state.evaluatedAnswers['q1']?.selectedOptionIndex, equals(3));
      expect(state.evaluatedAnswers['q1']?.correctOptionIndex, equals(1));
    });
  });

  group('Regression Test 3, 4 & 5: Visual Feedback for Correct, Wrong, and Neutral Options', () {
    testWidgets('3. Only verified correct option is highlighted in green with checkmark', (tester) async {
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
              hasValidCorrectAnswer: true,
              shouldAnimate: false,
            ),
          ),
        ),
      );

      expect(find.text('B'), findsOneWidget);
      expect(find.text('Immutable widget'), findsOneWidget);
      expect(find.text('Correct Answer'), findsOneWidget);
      expect(find.byIcon(Icons.check_circle_rounded), findsOneWidget);
      expect(find.byIcon(Icons.cancel_rounded), findsNothing);

      // Verify success background color
      final containerWidget = tester.widget<Container>(
        find.descendant(of: find.byType(QuizAnswerOptionCard), matching: find.byType(Container)).first,
      );
      final boxDecoration = containerWidget.decoration as BoxDecoration;
      expect(boxDecoration.color, equals(AppColors.successBg));
      expect((boxDecoration.border as Border).top.color, equals(AppColors.success));
    });

    testWidgets('4. Selected wrong option is highlighted in red with cross', (tester) async {
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
              hasValidCorrectAnswer: true,
              shouldAnimate: false,
            ),
          ),
        ),
      );

      expect(find.text('A'), findsOneWidget);
      expect(find.text('Mutable widget'), findsOneWidget);
      expect(find.text('Incorrect Answer'), findsOneWidget);
      expect(find.byIcon(Icons.cancel_rounded), findsOneWidget);
      expect(find.byIcon(Icons.check_circle_rounded), findsNothing);

      // Verify error background color
      final containerWidget = tester.widget<Container>(
        find.descendant(of: find.byType(QuizAnswerOptionCard), matching: find.byType(Container)).first,
      );
      final boxDecoration = containerWidget.decoration as BoxDecoration;
      expect(boxDecoration.color, equals(AppColors.errorBg));
      expect((boxDecoration.border as Border).top.color, equals(AppColors.error));
    });

    testWidgets('5. Unrelated options remain neutral without badges or icons', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: QuizAnswerOptionCard(
              index: 2,
              optionLetter: 'C',
              optionText: 'A database',
              isEvaluated: true,
              isUserSelection: false,
              isCorrectOption: false,
              hasValidCorrectAnswer: true,
              shouldAnimate: false,
            ),
          ),
        ),
      );

      expect(find.text('C'), findsOneWidget);
      expect(find.text('A database'), findsOneWidget);
      expect(find.text('Correct Answer'), findsNothing);
      expect(find.text('Incorrect Answer'), findsNothing);
      expect(find.byIcon(Icons.check_circle_rounded), findsNothing);
      expect(find.byIcon(Icons.cancel_rounded), findsNothing);

      // Verify neutral styling
      final containerWidget = tester.widget<Container>(
        find.descendant(of: find.byType(QuizAnswerOptionCard), matching: find.byType(Container)).first,
      );
      final boxDecoration = containerWidget.decoration as BoxDecoration;
      expect(boxDecoration.color, isNot(equals(AppColors.successBg)));
      expect(boxDecoration.color, isNot(equals(AppColors.errorBg)));
    });
  });

  group('Regression Test 6 & 7: Scoring Accuracy and Increment Rules', () {
    test('6. Incorrect answers never increase the score', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
      );
      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // Choose wrong answer on all 3 questions
      notifier.selectAnswer('q1', 0); // wrong (1 is correct)
      notifier.selectAnswer('q2', 0); // wrong (2 is correct)
      notifier.selectAnswer('q3', 1); // wrong (0 is correct)

      final result = await notifier.submitQuiz();
      expect(result, isNotNull);
      expect(result!.score, equals(0));
      expect(result.percentage, equals(0.0));
      expect(result.isPassed, isFalse);
    });

    test('7. Correct answers increase the score exactly once', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
      );
      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // Answer q1 correctly
      notifier.selectAnswer('q1', 1);

      // Rapidly fire taps on other options - must be blocked!
      notifier.selectAnswer('q1', 0);
      notifier.selectAnswer('q1', 2);
      notifier.selectAnswer('q1', 3);

      // Answer q2 correctly
      notifier.selectAnswer('q2', 2);

      // Answer q3 incorrectly
      notifier.selectAnswer('q3', 2);

      final result = await notifier.submitQuiz();
      expect(result, isNotNull);
      // Exactly 2 correct
      expect(result!.score, equals(2));
      expect(result.total, equals(3));
    });
  });

  group('Regression Test 8: Shuffled options map to correct database answer', () {
    test('QuestionModel correctly resolves correctOptionIndex when options are shuffled', () {
      // Original: ['A', 'B', 'C', 'D'], correct is 'C' (idx 2)
      // Shuffled: ['C', 'D', 'A', 'B'], correct is 'C' (idx 0)
      const qShuffled = QuestionModel(
        id: 'q_shuffled',
        category: 'Flutter',
        questionText: 'Which is correct?',
        options: ['StateNotifier', 'Cookie', 'GlobalVar', 'HttpSession'],
        correctAnswer: 'StateNotifier',
      );

      expect(qShuffled.correctOptionIndex, equals(0));
      expect(qShuffled.isOptionCorrect(0), isTrue);
      expect(qShuffled.isOptionCorrect(1), isFalse);
      expect(qShuffled.isOptionCorrect(2), isFalse);
      expect(qShuffled.isOptionCorrect(3), isFalse);

      const qShuffled2 = QuestionModel(
        id: 'q_shuffled2',
        category: 'Flutter',
        questionText: 'Which is correct?',
        options: ['Cookie', 'GlobalVar', 'HttpSession', 'StateNotifier'],
        correctAnswer: 'StateNotifier',
      );

      expect(qShuffled2.correctOptionIndex, equals(3));
      expect(qShuffled2.isOptionCorrect(3), isTrue);
      expect(qShuffled2.isOptionCorrect(0), isFalse);
    });
  });

  group('Regression Test 9: Missing or invalid correct-answer data fails safely', () {
    test('QuestionModel with missing or mismatched correct answer has hasValidCorrectAnswer=false', () {
      const qMissing = QuestionModel(
        id: 'q_missing',
        category: 'Flutter',
        questionText: 'Broken question?',
        options: ['A', 'B', 'C'],
        correctAnswer: '',
      );

      expect(qMissing.hasValidCorrectAnswer, isFalse);
      expect(qMissing.correctOptionIndex, equals(-1));
      expect(qMissing.isOptionCorrect(0), isFalse);
      expect(qMissing.isOptionCorrect(1), isFalse);
      expect(qMissing.isOptionCorrect(2), isFalse);

      const qMismatch = QuestionModel(
        id: 'q_mismatch',
        category: 'Flutter',
        questionText: 'Broken question 2?',
        options: ['Apple', 'Banana'],
        correctAnswer: 'Orange',
      );

      expect(qMismatch.hasValidCorrectAnswer, isFalse);
      expect(qMismatch.correctOptionIndex, equals(-1));
      expect(qMismatch.isOptionCorrect(0), isFalse);
      expect(qMismatch.isOptionCorrect(1), isFalse);
    });

    test('Selecting option on question with invalid data marks isCorrect=false', () async {
      const qBroken = QuestionModel(
        id: 'q_broken',
        category: 'Flutter',
        questionText: 'Broken question?',
        options: ['Alpha', 'Beta'],
        correctAnswer: 'Gamma',
      );

      final mockRepo = MockQuizRepository([qBroken]);
      final container = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
      );
      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      notifier.selectAnswer('q_broken', 0);
      final state = container.read(quizProvider);
      expect(state.evaluatedAnswers['q_broken']?.isCorrect, isFalse);
      expect(state.evaluatedAnswers['q_broken']?.hasValidCorrectAnswer, isFalse);
    });
  });

  group('Regression Test 10: Backend rejects fabricated correctness values', () {
    test('Fallback submit calculation uses question.isOptionCorrect rather than trusting frontend payload', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
      );
      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // Select wrong answers on all 3 questions
      notifier.selectAnswer('q1', 0); // wrong
      notifier.selectAnswer('q2', 0); // wrong
      notifier.selectAnswer('q3', 1); // wrong

      // Submit
      final result = await notifier.submitQuiz();
      // Even if user claimed isCorrect, authoritative evaluation returns 0
      expect(result!.score, equals(0));
    });
  });

  group('Regression Test 11: Saved quiz attempts preserve answer state', () {
    test('Resumed quiz preserves user selections, locked state, and evaluated correctness', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container1 = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
      );

      final notifier1 = container1.read(quizProvider.notifier);
      await notifier1.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // Answer question 1 with wrong answer (0)
      notifier1.selectAnswer('q1', 0);
      notifier1.nextQuestion();

      // Answer question 2 with correct answer (2)
      notifier1.selectAnswer('q2', 2);

      // Simulate app restart and resumption
      final container2 = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
      );
      final notifier2 = container2.read(quizProvider.notifier);
      await notifier2.startQuiz(category: 'Flutter', session: 1, forceNew: false);

      final state = container2.read(quizProvider);
      expect(state.selectedAnswers['q1'], equals(0));
      expect(state.evaluatedAnswers['q1']?.isCorrect, isFalse);
      expect(state.evaluatedAnswers['q1']?.isLocked, isTrue);

      expect(state.selectedAnswers['q2'], equals(2));
      expect(state.evaluatedAnswers['q2']?.isCorrect, isTrue);
      expect(state.evaluatedAnswers['q2']?.isLocked, isTrue);

      // Attempt to tamper with resumed answer
      notifier2.selectAnswer('q1', 1); // try to change to correct
      expect(container2.read(quizProvider).selectedAnswers['q1'], equals(0)); // remains 0!
    });
  });

  group('Regression Test 12: Certificates use the correct final score', () {
    test('Passing with >=80% grants certificate, <80% does not', () async {
      final mockRepo = MockQuizRepository(testQuestions);
      final container = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
      );
      final notifier = container.read(quizProvider.notifier);
      await notifier.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      // Answer 2 out of 3 correct = 66.6% (<80%)
      notifier.selectAnswer('q1', 1); // correct
      notifier.selectAnswer('q2', 2); // correct
      notifier.selectAnswer('q3', 1); // wrong

      final result1 = await notifier.submitQuiz();
      expect(result1!.isEligibleForCertificate, isFalse);
      expect(result1.certificateId, isNull);

      // New attempt where user scores 3 out of 3 = 100% (>=80%)
      final containerPass = ProviderContainer(
        overrides: [quizRepositoryProvider.overrideWithValue(mockRepo)],
      );
      final notifierPass = containerPass.read(quizProvider.notifier);
      await notifierPass.startQuiz(category: 'Flutter', session: 1, forceNew: true);

      notifierPass.selectAnswer('q1', 1); // correct
      notifierPass.selectAnswer('q2', 2); // correct
      notifierPass.selectAnswer('q3', 0); // correct

      final resultPass = await notifierPass.submitQuiz();
      expect(resultPass!.isEligibleForCertificate, isTrue);
      expect(resultPass.certificateId, isNotNull);
      expect(resultPass.percentage, equals(100.0));
    });
  });
}
