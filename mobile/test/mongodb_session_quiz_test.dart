import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hangbug/core/constants/tech_logo_registry.dart';
import 'package:hangbug/models/category_model.dart';
import 'package:hangbug/models/question_model.dart';
import 'package:hangbug/providers/core_providers.dart';
import 'package:hangbug/providers/dashboard_provider.dart';
import 'package:hangbug/repositories/quiz_repository.dart';
import 'package:hangbug/screens/explore/explore_screen.dart';
import 'package:hangbug/screens/quiz/quiz_screen.dart';

class _MongoDbStubQuizRepository implements QuizRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<List<CategoryModel>> getCategories() async {
    return [
      CategoryModel(
        id: 'cat_mongodb',
        name: 'MongoDB',
        questionCount: 350,
        sessions: [1, 2, 3, 4, 5, 6, 7],
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
        title: 'Introduction to NoSQL Databases',
        count: 50,
      ),
      CategorySessionInfo(
        session: 2,
        title: 'MongoDB - A Database for the Modern Web',
        count: 50,
      ),
      CategorySessionInfo(
        session: 3,
        title: 'CRUD Operations in MongoDB',
        count: 50,
      ),
      CategorySessionInfo(
        session: 4,
        title: 'Indexing and Aggregation in MongoDB',
        count: 50,
      ),
      CategorySessionInfo(
        session: 5,
        title: 'Replication and Sharding in MongoDB',
        count: 50,
      ),
      CategorySessionInfo(
        session: 6,
        title: 'Developing Java and Node JS Applications with MongoDB',
        count: 50,
      ),
      CategorySessionInfo(
        session: 7,
        title: 'Administration of MongoDB Cluster Operations',
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
        id: 'mongo_s01_q001',
        category: 'MongoDB',
        session: 1,
        questionText: 'What does the term NoSQL stand for?',
        options: [
          'Not Only SQL',
          'No Structured Query Language',
          'Network Object SQL',
          'New Online SQL',
        ],
        correctAnswer: 'Not Only SQL',
        explanation: 'Correct answer is A) Not Only SQL.',
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

  test('TechLogoRegistry resolves "Mongo DB" and "MongoDB" to mongodb SVG', () {
    expect(
      TechLogoRegistry.resolve('MongoDB').map((e) => e.id).toList(),
      equals(['mongodb']),
    );
    expect(
      TechLogoRegistry.resolve('Mongo DB').map((e) => e.id).toList(),
      equals(['mongodb']),
    );
  });

  testWidgets(
    'ExploreScreen renders MongoDB SVG logo, matches "mongo db" search alias, and opens 7-session sheet',
    (tester) async {
      final stubRepo = _MongoDbStubQuizRepository();

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

      expect(find.text('MongoDB'), findsOneWidget);
      expect(find.text('350 Questions · 7 Sessions'), findsOneWidget);
      expect(find.byType(SvgPicture), findsOneWidget);

      // Search with space ("mongo db") -> must match MongoDB
      await tester.enterText(find.byType(TextField), 'mongo db');
      await tester.pumpAndSettle();
      expect(find.text('MongoDB'), findsOneWidget);

      await tester.tap(find.text('MongoDB'));
      await tester.pumpAndSettle();

      expect(find.text('All Sessions (350 Questions)'), findsOneWidget);
      expect(find.text('Introduction to NoSQL Databases'), findsOneWidget);
      expect(
        find.text('MongoDB - A Database for the Modern Web'),
        findsOneWidget,
      );
      expect(find.text('CRUD Operations in MongoDB'), findsOneWidget);
      expect(find.text('Session 1 · 50 Questions'), findsOneWidget);
    },
  );

  testWidgets(
    'QuizScreen displays MongoDB session title, evaluates answer immediately, and locks selection',
    (tester) async {
      final stubRepo = _MongoDbStubQuizRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            quizRepositoryProvider.overrideWithValue(stubRepo),
          ],
          child: const MaterialApp(
            home: QuizScreen(
              category: 'MongoDB',
              session: 1,
              sessionTitle: 'Introduction to NoSQL Databases',
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('MongoDB'), findsOneWidget);
      expect(
        find.text('Session 1 · Introduction to NoSQL Databases'),
        findsOneWidget,
      );
      expect(find.text('What does the term NoSQL stand for?'), findsOneWidget);

      await tester.tap(find.text('Not Only SQL'));
      await tester.pumpAndSettle();

      expect(find.byKey(const ValueKey('quiz_feedback_banner')), findsOneWidget);
      expect(
        find.byKey(const ValueKey('quiz_explanation_card')),
        findsOneWidget,
      );
    },
  );
}
