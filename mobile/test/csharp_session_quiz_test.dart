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

class _CSharpStubQuizRepository implements QuizRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<List<CategoryModel>> getCategories() async {
    return [
      CategoryModel(
        id: 'cat_csharp',
        name: 'C#',
        questionCount: 713,
        sessions: List<int>.generate(15, (i) => i + 1),
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
        title: 'Getting Started with C#',
        count: 50,
      ),
      CategorySessionInfo(
        session: 2,
        title: 'Variables and Data Types',
        count: 50,
      ),
      CategorySessionInfo(
        session: 15,
        title: 'GUI/Desktop Apps with C#',
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
        id: 'csharp_s01_q001',
        category: 'C#',
        session: 1,
        questionText: 'The .NET Framework is primarily an infrastructure used to',
        options: [
          'compile only C++ programs',
          'design hardware circuits',
          'build, deploy, and run applications and services using .NET technologies',
          'manage only database servers',
        ],
        correctAnswer:
            'build, deploy, and run applications and services using .NET technologies',
        explanation:
            'The correct answer is C) build, deploy, and run applications and services using .NET technologies. (Getting Started with C#)',
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

  test('CategorySessionInfo parses session metadata and custom title flag', () {
    final csharpS1 = CategorySessionInfo.fromJson({
      'session': 1,
      'title': 'Getting Started with C#',
      'count': 50,
    });
    expect(csharpS1.session, 1);
    expect(csharpS1.title, 'Getting Started with C#');
    expect(csharpS1.count, 50);
    expect(csharpS1.hasCustomTitle, isTrue);

    final genericS1 = CategorySessionInfo.fromJson({
      'session': 1,
      'title': 'Session 1',
      'count': 20,
    });
    expect(genericS1.hasCustomTitle, isFalse);
  });

  testWidgets('ExploreScreen displays C# 15 sessions and opens detailed session sheet', (
    tester,
  ) async {
    final stubRepo = _CSharpStubQuizRepository();

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

    expect(find.text('C#'), findsOneWidget);
    expect(find.text('713 Questions · 15 Sessions'), findsOneWidget);

    await tester.tap(find.text('C#'));
    await tester.pumpAndSettle();

    expect(find.text('Getting Started with C#'), findsOneWidget);
    expect(find.text('Variables and Data Types'), findsOneWidget);
    expect(find.text('GUI/Desktop Apps with C#'), findsOneWidget);
    expect(find.text('Session 1 · 50 Questions'), findsOneWidget);
  });

  testWidgets('QuizScreen displays optional session title in AppBar', (
    tester,
  ) async {
    final stubRepo = _CSharpStubQuizRepository();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          quizRepositoryProvider.overrideWithValue(stubRepo),
        ],
        child: const MaterialApp(
          home: QuizScreen(
            category: 'C#',
            session: 1,
            sessionTitle: 'Getting Started with C#',
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('C#'), findsOneWidget);
    expect(find.text('Session 1 · Getting Started with C#'), findsOneWidget);
    expect(
      find.text('The .NET Framework is primarily an infrastructure used to'),
      findsOneWidget,
    );
  });
}
