import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
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

class _MaterialUiStubQuizRepository implements QuizRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<List<CategoryModel>> getCategories() async {
    return [
      CategoryModel(
        id: 'cat_materialui',
        name: 'Material UI',
        questionCount: 150,
        sessions: [1, 2, 3],
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
        title: 'Introduction to UI',
        count: 50,
      ),
      CategorySessionInfo(
        session: 2,
        title: 'Introduction to Material Design',
        count: 50,
      ),
      CategorySessionInfo(
        session: 3,
        title: 'Creating a Material Design Type and Component System',
        count: 50,
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
        id: 'mui_s01_q001',
        category: 'Material UI',
        session: 1,
        questionText: 'What does UI stand for?',
        options: [
          'Unified Input',
          'User Interaction',
          'User Interface',
          'Universal Integration',
        ],
        correctAnswer: 'User Interface',
        explanation: 'Correct answer is C) User Interface.',
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
    'ExploreScreen renders Material UI SVG logo, matches "mui" search alias, and opens 3-session sheet',
    (tester) async {
      final stubRepo = _MaterialUiStubQuizRepository();

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

      expect(find.text('Material UI'), findsOneWidget);
      expect(find.text('150 Questions · 3 Sessions'), findsOneWidget);
      expect(find.byType(SvgPicture), findsOneWidget);

      // Search with alias "mui" -> must match Material UI
      await tester.enterText(find.byType(TextField), 'mui');
      await tester.pumpAndSettle();
      expect(find.text('Material UI'), findsOneWidget);

      await tester.tap(find.text('Material UI'));
      await tester.pumpAndSettle();

      expect(find.text('Introduction to UI'), findsOneWidget);
      expect(find.text('Introduction to Material Design'), findsOneWidget);
      expect(
        find.text('Creating a Material Design Type and Component System'),
        findsOneWidget,
      );
      expect(find.text('Session 1 · 50 Questions'), findsOneWidget);
    },
  );

  testWidgets('QuizScreen displays Material UI session title and question cleanly', (
    tester,
  ) async {
    final stubRepo = _MaterialUiStubQuizRepository();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          quizRepositoryProvider.overrideWithValue(stubRepo),
        ],
        child: const MaterialApp(
          home: QuizScreen(
            category: 'Material UI',
            session: 1,
            sessionTitle: 'Introduction to UI',
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Material UI'), findsOneWidget);
    expect(find.text('Session 1 · Introduction to UI'), findsOneWidget);
    expect(find.text('What does UI stand for?'), findsOneWidget);
  });
}
