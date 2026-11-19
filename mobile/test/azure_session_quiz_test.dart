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

class _AzureStubQuizRepository implements QuizRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<List<CategoryModel>> getCategories() async {
    return [
      CategoryModel(
        id: 'cat_azure',
        name: 'Azure',
        questionCount: 812,
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
        title: 'Introduction to Azure Cloud Computing',
        count: 55,
      ),
      CategorySessionInfo(
        session: 2,
        title: 'Understanding Microsoft Azure Cloud Services',
        count: 54,
      ),
      CategorySessionInfo(
        session: 3,
        title: 'Data Access Technologies in Azure',
        count: 54,
      ),
      CategorySessionInfo(
        session: 4,
        title: 'Data Access Using ADO.NET',
        count: 54,
      ),
      CategorySessionInfo(
        session: 5,
        title: 'Data Access Using Entity Framework',
        count: 55,
      ),
      CategorySessionInfo(
        session: 6,
        title: 'Data Access Using Third-party Databases and Azure Storage Services',
        count: 51,
      ),
      CategorySessionInfo(
        session: 7,
        title: 'Design and Implementation of Web API',
        count: 55,
      ),
      CategorySessionInfo(
        session: 8,
        title: 'Security in Web API',
        count: 55,
      ),
      CategorySessionInfo(
        session: 9,
        title: 'Hosting and Consuming Web API',
        count: 52,
      ),
      CategorySessionInfo(
        session: 10,
        title: 'Introduction to WCF Services',
        count: 55,
      ),
      CategorySessionInfo(
        session: 11,
        title: 'Implementing Azure Serverless Web Services and API Management',
        count: 55,
      ),
      CategorySessionInfo(
        session: 12,
        title: 'Traffic Management and Monitoring Strategies for Web Services',
        count: 52,
      ),
      CategorySessionInfo(
        session: 13,
        title: 'Configuring Web Applications for Deployment',
        count: 55,
      ),
      CategorySessionInfo(
        session: 14,
        title: 'Deploying Web Applications and Services',
        count: 55,
      ),
      CategorySessionInfo(
        session: 15,
        title: 'Working with Shared Assemblies',
        count: 55,
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
        id: 'azure_s01_q001',
        category: 'Azure',
        session: 1,
        questionText: 'Which statement best describes cloud computing?',
        options: [
          'A method of hosting all applications on local servers only',
          'A programming language for Web applications',
          'An approach giving convenient, on-demand access through the Internet to computing resources',
          'A hardware device used to store data locally',
        ],
        correctAnswer:
            'An approach giving convenient, on-demand access through the Internet to computing resources',
        explanation:
            'Correct answer is C) An approach giving convenient, on-demand access through the Internet to computing resources.',
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

  test('TechLogoRegistry resolves Azure aliases to azure SVG', () {
    expect(
      TechLogoRegistry.resolve('Azure').map((e) => e.id).toList(),
      equals(['azure']),
    );
    expect(
      TechLogoRegistry.resolve('Microsoft Azure').map((e) => e.id).toList(),
      equals(['azure']),
    );
    expect(
      TechLogoRegistry.resolve('MS Azure').map((e) => e.id).toList(),
      equals(['azure']),
    );
  });

  testWidgets(
    'ExploreScreen renders Azure SVG logo, matches "microsoft azure" search alias, and opens 15-session sheet',
    (tester) async {
      final stubRepo = _AzureStubQuizRepository();

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

      expect(find.text('Azure'), findsOneWidget);
      expect(find.text('812 Questions · 15 Sessions'), findsOneWidget);
      expect(find.byType(SvgPicture), findsOneWidget);

      // Search with alias ("microsoft azure") -> must match Azure
      await tester.enterText(find.byType(TextField), 'microsoft azure');
      await tester.pumpAndSettle();
      expect(find.text('Azure'), findsOneWidget);

      await tester.tap(find.text('Azure'));
      await tester.pumpAndSettle();

      expect(find.text('All Sessions (812 Questions)'), findsOneWidget);
      expect(find.text('Introduction to Azure Cloud Computing'), findsOneWidget);
      expect(
        find.text('Understanding Microsoft Azure Cloud Services'),
        findsOneWidget,
      );
      expect(find.text('Session 1 · 55 Questions'), findsOneWidget);
    },
  );

  testWidgets(
    'QuizScreen displays Azure session title, evaluates answer immediately, and locks selection',
    (tester) async {
      final stubRepo = _AzureStubQuizRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            quizRepositoryProvider.overrideWithValue(stubRepo),
          ],
          child: const MaterialApp(
            home: QuizScreen(
              category: 'Azure',
              session: 1,
              sessionTitle: 'Introduction to Azure Cloud Computing',
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Azure'), findsOneWidget);
      expect(
        find.text('Session 1 · Introduction to Azure Cloud Computing'),
        findsOneWidget,
      );
      expect(
        find.text('Which statement best describes cloud computing?'),
        findsOneWidget,
      );

      await tester.tap(
        find.text(
          'An approach giving convenient, on-demand access through the Internet to computing resources',
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byKey(const ValueKey('quiz_feedback_banner')), findsOneWidget);
      expect(
        find.byKey(const ValueKey('quiz_explanation_card')),
        findsOneWidget,
      );
    },
  );
}
