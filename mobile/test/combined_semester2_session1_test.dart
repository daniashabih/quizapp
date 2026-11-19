import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hangbug/models/category_model.dart';
import 'package:hangbug/models/question_model.dart';
import 'package:hangbug/providers/core_providers.dart';
import 'package:hangbug/providers/dashboard_provider.dart';
import 'package:hangbug/repositories/quiz_repository.dart';
import 'package:hangbug/screens/explore/explore_screen.dart';
import 'package:hangbug/screens/quiz/quiz_screen.dart';

class _CombinedSemester2StubQuizRepository implements QuizRepository {
  static const String categoryName = 'PHP, XML JSON, Laravel, MySQL, JavaScript';

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<List<CategoryModel>> getCategories() async {
    return [
      const CategoryModel(
        id: 'cat_combined_sem2',
        name: categoryName,
        questionCount: 149,
        sessions: [1],
        isEnabled: true,
      ),
    ];
  }

  @override
  Future<List<CategorySessionInfo>> getCategorySessionDetails(
    String categoryName,
  ) async {
    return const [
      CategorySessionInfo(
        session: 1,
        title: 'Session 1',
        count: 149,
      ),
    ];
  }

  @override
  Future<List<QuestionModel>> getQuestions({
    required String category,
    int? session,
  }) async {
    return const [
      QuestionModel(
        id: 'comb_s1_q1',
        category: categoryName,
        session: 1,
        questionText: 'PHP variables must start with a _____.',
        options: [
          'Underscore sign',
          'Dollar sign',
          'Alpha-numeric character',
          'Asterisk sign',
        ],
        correctAnswer: 'Dollar sign',
        explanation: r'In PHP, all variable names must begin with a dollar sign ($).',
      ),
    ];
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
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets(
    'ExploreScreen displays 149 questions in a single Session 1 after merging Session 2',
    (tester) async {
      final stubRepo = _CombinedSemester2StubQuizRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            quizRepositoryProvider.overrideWithValue(stubRepo),
            categoriesProvider.overrideWith((ref) => stubRepo.getCategories()),
          ],
          child: const MaterialApp(
            home: ExploreScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(
        find.text(_CombinedSemester2StubQuizRepository.categoryName),
        findsOneWidget,
      );
      expect(find.text('149 Questions'), findsOneWidget);

      await tester.tap(
        find.text(_CombinedSemester2StubQuizRepository.categoryName),
      );
      await tester.pumpAndSettle();

      expect(find.text('1 Session · 149 Qs'), findsOneWidget);
      expect(find.text('Session 1 (149)'), findsOneWidget);
      expect(find.text('Session 2 (26)'), findsNothing);
      expect(find.textContaining('All Sessions'), findsNothing);
    },
  );

  testWidgets('QuizScreen loads merged Session 1 question cleanly', (
    tester,
  ) async {
    final stubRepo = _CombinedSemester2StubQuizRepository();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          quizRepositoryProvider.overrideWithValue(stubRepo),
        ],
        child: const MaterialApp(
          home: QuizScreen(
            category: _CombinedSemester2StubQuizRepository.categoryName,
            session: 1,
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(
      find.text(_CombinedSemester2StubQuizRepository.categoryName),
      findsOneWidget,
    );
    expect(find.text('PHP variables must start with a _____.'), findsOneWidget);
  });
}
