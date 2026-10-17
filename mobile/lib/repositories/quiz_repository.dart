import '../models/category_model.dart';
import '../models/question_model.dart';
import '../models/quiz_result_model.dart';
import '../services/quiz_service.dart';

class QuizRepository {
  final QuizService quizService;

  QuizRepository({required this.quizService});

  Future<List<CategoryModel>> getCategories() async {
    return await quizService.getCategories();
  }

  Future<List<int>> getCategorySessions(String categoryName) async {
    return await quizService.getCategorySessions(categoryName);
  }

  Future<List<QuestionModel>> getQuestions({
    required String category,
    int? session,
  }) async {
    return await quizService.getQuestions(category: category, session: session);
  }

  Future<QuizResultModel> submitQuiz({
    required String category,
    required int session,
    required Map<String, dynamic> answers,
    String? attemptId,
    int? timeTaken,
    List<Map<String, dynamic>>? questionsSnapshot,
  }) async {
    return await quizService.submitQuiz(
      category: category,
      session: session,
      answers: answers,
      attemptId: attemptId,
      timeTaken: timeTaken,
      questionsSnapshot: questionsSnapshot,
    );
  }

  Future<Map<String, dynamic>?> startOrResumeAttempt({
    required String category,
    required int session,
    List<Map<String, dynamic>>? questionsSnapshot,
    int? totalQuestions,
    bool forceNew = false,
    bool checkOnly = false,
  }) async {
    return await quizService.startOrResumeAttempt(
      category: category,
      session: session,
      questionsSnapshot: questionsSnapshot,
      totalQuestions: totalQuestions,
      forceNew: forceNew,
      checkOnly: checkOnly,
    );
  }

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
    return await quizService.updateAttemptProgress(
      attemptId,
      currentQuestionIndex: currentQuestionIndex,
      answers: answers,
      flaggedQuestions: flaggedQuestions,
      score: score,
      answeredCount: answeredCount,
      progressPercentage: progressPercentage,
      status: status,
    );
  }

  Future<Map<String, dynamic>?> getAttemptById(String attemptId) async {
    return await quizService.getAttemptById(attemptId);
  }

  Future<bool> discardAttempt(String attemptId) async {
    return await quizService.discardAttempt(attemptId);
  }

  Future<QuizResultModel> saveResult({
    required String category,
    required int session,
    required int score,
    required int total,
    required double percentage,
  }) async {
    return await quizService.saveResult(
      category: category,
      session: session,
      score: score,
      total: total,
      percentage: percentage,
    );
  }

  Future<List<QuizResultModel>> getMyResults() async {
    return await quizService.getMyResults();
  }
}
