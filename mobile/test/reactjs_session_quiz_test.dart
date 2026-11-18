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

class _ReactJsStubQuizRepository implements QuizRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<List<CategoryModel>> getCategories() async {
    return [
      CategoryModel(
        id: 'cat_reactjs',
        name: 'React.js',
        questionCount: 399,
        sessions: List<int>.generate(8, (i) => i + 1),
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
        title: 'Introduction to ReactJS',
        count: 52,
      ),
      CategorySessionInfo(
        session: 2,
        title: 'ReactJS Components',
        count: 48,
      ),
      CategorySessionInfo(
        session: 3,
        title: 'JSX Elements',
        count: 47,
      ),
      CategorySessionInfo(
        session: 4,
        title: 'Event Handling in ReactJS',
        count: 51,
      ),
      CategorySessionInfo(
        session: 5,
        title: 'ReactJS Router',
        count: 52,
      ),
      CategorySessionInfo(
        session: 6,
        title: 'Styling React Elements',
        count: 50,
      ),
      CategorySessionInfo(
        session: 7,
        title: 'ReactJS Component Lifecycle',
        count: 49,
      ),
      CategorySessionInfo(
        session: 8,
        title: 'Creating a CRUD Application Using ReactJS Forms',
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
        id: 'reactjs_s01_q001',
        category: 'React.js',
        session: 1,
        questionText: 'What is ReactJS?',
        options: [
          'A CSS pre-processor',
          'A backend framework for Node.js',
          'An open-source front-end JavaScript library for building component-based user interfaces',
          'A server-side database engine',
        ],
        correctAnswer:
            'An open-source front-end JavaScript library for building component-based user interfaces',
        explanation:
            'Correct answer is C) An open-source front-end JavaScript library for building component-based user interfaces.',
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
    'ExploreScreen matches "React JS" search query, displays 399 Qs across 8 sessions, and opens session sheet',
    (tester) async {
      final stubRepo = _ReactJsStubQuizRepository();

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

      expect(find.text('React.js'), findsOneWidget);
      expect(find.text('399 Questions · 8 Sessions'), findsOneWidget);

      // Search with space ("React JS") -> must still find "React.js"
      await tester.enterText(find.byType(TextField), 'React JS');
      await tester.pumpAndSettle();
      expect(find.text('React.js'), findsOneWidget);

      // Open session selector sheet
      await tester.tap(find.text('React.js'));
      await tester.pumpAndSettle();

      expect(find.text('Introduction to ReactJS'), findsOneWidget);
      expect(find.text('ReactJS Components'), findsOneWidget);
      expect(find.text('Session 1 · 52 Questions'), findsOneWidget);
    },
  );

  testWidgets('QuizScreen displays React.js session title and question cleanly', (
    tester,
  ) async {
    final stubRepo = _ReactJsStubQuizRepository();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          quizRepositoryProvider.overrideWithValue(stubRepo),
        ],
        child: const MaterialApp(
          home: QuizScreen(
            category: 'React.js',
            session: 1,
            sessionTitle: 'Introduction to ReactJS',
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('React.js'), findsOneWidget);
    expect(find.text('Session 1 · Introduction to ReactJS'), findsOneWidget);
    expect(find.text('What is ReactJS?'), findsOneWidget);
  });
}
