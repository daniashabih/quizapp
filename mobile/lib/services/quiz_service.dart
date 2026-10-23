import '../core/constants/api_endpoints.dart';
import '../core/network/api_client.dart';
import '../models/category_model.dart';
import '../models/question_model.dart';
import '../models/quiz_result_model.dart';

class QuizService {
  final ApiClient apiClient;

  QuizService({required this.apiClient});

  // Get all available technologies
  Future<List<CategoryModel>> getCategories() async {
    final response = await apiClient.get(ApiEndpoints.categories);
    final list = response.data as List;
    return list
        .map((item) => CategoryModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  // Get sessions list for a specific category
  Future<List<int>> getCategorySessions(String categoryName) async {
    final response = await apiClient.get(
      ApiEndpoints.questionSessions,
      queryParameters: {'category': categoryName},
    );
    final list = response.data as List;
    final Set<int> sessions = {};
    for (final item in list) {
      if (item is Map && item.containsKey('session')) {
        final val = int.tryParse(item['session'].toString());
        if (val != null) sessions.add(val);
      } else if (item is num) {
        sessions.add(item.toInt());
      }
    }
    final sorted = sessions.toList()..sort();
    return sorted.isEmpty ? [1] : sorted;
  }

  // Fetch questions for assessment
  Future<List<QuestionModel>> getQuestions({
    required String category,
    int? session,
  }) async {
    final Map<String, dynamic> params = {'category': category};
    if (session != null && session > 0) {
      params['session'] = session;
    }

    final response = await apiClient.get(
      ApiEndpoints.questions,
      queryParameters: params,
    );

    final list = response.data as List;
    return list
        .map((item) => QuestionModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  // Authoritative server-side quiz evaluation
  Future<QuizResultModel> submitQuiz({
    required String category,
    required int session,
    required Map<String, dynamic> answers,
    String? attemptId,
    int? timeTaken,
    List<Map<String, dynamic>>? questionsSnapshot,
  }) async {
    final payload = <String, dynamic>{
      'category': category,
      'session': session,
      'answers': answers,
    };
    if (attemptId != null) payload['attemptId'] = attemptId;
    if (timeTaken != null) payload['timeTaken'] = timeTaken;
    if (questionsSnapshot != null) payload['questions'] = questionsSnapshot;

    final response = await apiClient.post(
      ApiEndpoints.submitQuiz,
      data: payload,
    );

    final data = response.data as Map<String, dynamic>;
    final resultData = data['result'] as Map<String, dynamic>? ?? data;

    return QuizResultModel.fromJson(resultData);
  }

  // Start or resume in-progress attempt on backend
  Future<Map<String, dynamic>?> startOrResumeAttempt({
    required String category,
    required int session,
    List<Map<String, dynamic>>? questionsSnapshot,
    int? totalQuestions,
    bool forceNew = false,
    bool checkOnly = false,
  }) async {
    try {
      final payload = <String, dynamic>{
        'category': category,
        'session': session,
        'forceNew': forceNew,
        'checkOnly': checkOnly,
      };
      if (questionsSnapshot != null) payload['questionsSnapshot'] = questionsSnapshot;
      if (totalQuestions != null) payload['totalQuestions'] = totalQuestions;

      final response = await apiClient.post(
        ApiEndpoints.attemptsStart,
        data: payload,
      );
      if (response.data is Map<String, dynamic>) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // Auto-save in-progress attempt to backend
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
    try {
      final payload = <String, dynamic>{
        'currentQuestionIndex': currentQuestionIndex,
        'answers': answers,
      };
      if (flaggedQuestions != null) payload['flaggedQuestions'] = flaggedQuestions;
      if (score != null) payload['score'] = score;
      if (answeredCount != null) payload['answeredCount'] = answeredCount;
      if (progressPercentage != null) payload['progressPercentage'] = progressPercentage;
      if (status != null) payload['status'] = status;

      await apiClient.put(
        ApiEndpoints.attemptUpdate(attemptId),
        data: payload,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // Submit single answer for authoritative immediate evaluation
  Future<Map<String, dynamic>?> submitAnswer(
    String attemptId, {
    required String questionId,
    required int selectedOptionIndex,
  }) async {
    try {
      final response = await apiClient.post(
        ApiEndpoints.attemptAnswer(attemptId),
        data: {
          'questionId': questionId,
          'selectedOptionIndex': selectedOptionIndex,
        },
      );
      if (response.data is Map<String, dynamic>) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }
  // Get full attempt by ID
  Future<Map<String, dynamic>?> getAttemptById(String attemptId) async {
    try {
      final response = await apiClient.get(ApiEndpoints.attemptById(attemptId));
      if (response.data is Map<String, dynamic>) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // Discard attempt
  Future<bool> discardAttempt(String attemptId) async {
    try {
      await apiClient.delete(ApiEndpoints.attemptDiscard(attemptId));
      return true;
    } catch (_) {
      return false;
    }
  }

  // Save quiz result (legacy / fallback)
  Future<QuizResultModel> saveResult({
    required String category,
    required int session,
    required int score,
    required int total,
    required double percentage,
  }) async {
    final response = await apiClient.post(
      ApiEndpoints.saveResult,
      data: {
        'category': category,
        'session': session,
        'score': score,
        'total': total,
        'percentage': percentage,
      },
    );

    final data = response.data as Map<String, dynamic>;
    final resultId = data['resultId']?.toString() ?? '';

    return QuizResultModel(
      id: resultId,
      category: category,
      session: session,
      score: score,
      total: total,
      percentage: percentage,
      createdAt: DateTime.now().toIso8601String(),
    );
  }

  // Fetch candidate's previous quiz results
  Future<List<QuizResultModel>> getMyResults() async {
    final response = await apiClient.get(ApiEndpoints.myResults);
    final list = response.data as List;
    return list
        .map((item) => QuizResultModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
