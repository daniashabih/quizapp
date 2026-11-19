import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/ai_verification_model.dart';
import '../services/ai_verification_service.dart';
import 'core_providers.dart';

final aiVerificationServiceProvider = Provider<AiVerificationService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AiVerificationService(apiClient: apiClient);
});

/// Per-question verification cache during an active quiz session
class QuizAiVerificationNotifier extends StateNotifier<Map<String, AsyncValue<AiVerificationResult>>> {
  final AiVerificationService service;

  QuizAiVerificationNotifier(this.service) : super(const {});

  Future<void> verify({
    required String questionId,
    required String questionText,
    required List<String> options,
    required String correctAnswer,
    required String technology,
    String? userSelectedAnswer,
  }) async {
    final key = questionId.isNotEmpty ? questionId : questionText;
    if (state[key]?.isLoading == true) return;

    state = {
      ...state,
      key: const AsyncValue.loading(),
    };

    try {
      final result = await service.verifyQuestion(
        questionId: questionId,
        questionText: questionText,
        options: options,
        correctAnswer: correctAnswer,
        technology: technology,
        userSelectedAnswer: userSelectedAnswer,
      );
      state = {
        ...state,
        key: AsyncValue.data(result),
      };
    } catch (e, st) {
      state = {
        ...state,
        key: AsyncValue.error(e, st),
      };
    }
  }

  void clear() {
    state = const {};
  }
}

final quizAiVerificationProvider = StateNotifierProvider.autoDispose<
    QuizAiVerificationNotifier, Map<String, AsyncValue<AiVerificationResult>>>((ref) {
  final service = ref.watch(aiVerificationServiceProvider);
  return QuizAiVerificationNotifier(service);
});

final adminKnowledgeBaseFilterTechProvider = StateProvider<String>((ref) => 'all');
final adminKnowledgeBaseSearchProvider = StateProvider<String>((ref) => '');

final adminKnowledgeBaseProvider = FutureProvider.autoDispose<KnowledgeBaseListResponse>((ref) async {
  final service = ref.watch(aiVerificationServiceProvider);
  final tech = ref.watch(adminKnowledgeBaseFilterTechProvider);
  final search = ref.watch(adminKnowledgeBaseSearchProvider);
  return service.listBooks(technology: tech, search: search);
});

final adminVerificationStatusFilterProvider = StateProvider<String>((ref) => 'all');

final adminVerificationReportsProvider = FutureProvider.autoDispose<VerificationReportsResponse>((ref) async {
  final service = ref.watch(aiVerificationServiceProvider);
  final status = ref.watch(adminVerificationStatusFilterProvider);
  return service.getVerificationReports(status: status);
});

final adminCorrectionHistoryProvider = FutureProvider.autoDispose<List<CorrectionHistoryModel>>((ref) async {
  final service = ref.watch(aiVerificationServiceProvider);
  return service.getCorrectionHistory();
});

final adminAiStatusProvider = FutureProvider.autoDispose<AdminAiStatusModel>((ref) async {
  final service = ref.watch(aiVerificationServiceProvider);
  return service.getAiStatus();
});
