import 'dart:io';
import 'dart:typed_data';
import 'package:dio/dio.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/api_client.dart';
import '../models/ai_verification_model.dart';

class AiVerificationService {
  final ApiClient apiClient;

  AiVerificationService({required this.apiClient});

  /// Verify a quiz question strictly against uploaded reference books (RAG)
  Future<AiVerificationResult> verifyQuestion({
    required String questionId,
    required String questionText,
    required List<String> options,
    required String correctAnswer,
    required String technology,
    String? userSelectedAnswer,
  }) async {
    final response = await apiClient.post(
      ApiEndpoints.aiVerifyQuestion,
      data: {
        'questionId': questionId,
        'questionText': questionText,
        'options': options,
        'correctAnswer': correctAnswer,
        'technology': technology,
        if (userSelectedAnswer != null && userSelectedAnswer.isNotEmpty)
          'userSelectedAnswer': userSelectedAnswer,
      },
      options: Options(
        receiveTimeout: const Duration(seconds: 45),
        sendTimeout: const Duration(seconds: 20),
      ),
    );

    final data = response.data as Map<String, dynamic>;
    final verificationJson = data['verification'] as Map<String, dynamic>? ?? data;
    return AiVerificationResult.fromJson(
      verificationJson,
      cached: data['cached'] == true,
    );
  }

  /// List uploaded reference books for Admin AI Knowledge Base
  Future<KnowledgeBaseListResponse> listBooks({
    String? technology,
    String? status,
    String? search,
  }) async {
    final params = <String, dynamic>{};
    if (technology != null && technology.isNotEmpty && technology != 'all') {
      params['technology'] = technology;
    }
    if (status != null && status.isNotEmpty && status != 'all') {
      params['status'] = status;
    }
    if (search != null && search.trim().isNotEmpty) {
      params['search'] = search.trim();
    }

    final response = await apiClient.get(
      ApiEndpoints.adminKnowledgeBaseBooks,
      queryParameters: params,
      options: Options(receiveTimeout: const Duration(seconds: 25)),
    );
    return KnowledgeBaseListResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// Upload a reference book (PDF, DOCX, TXT). Automatically chunks files > 3MB for Vercel compatibility.
  Future<KnowledgeBookModel> uploadBook({
    required String filePath,
    required String fileName,
    required String technology,
    String title = '',
    String author = '',
    String edition = '',
    String description = '',
    int? publicationYear,
  }) async {
    final file = File(filePath);
    final fileSize = await file.length();
    const chunkThreshold = 3 * 1024 * 1024;
    const chunkSize = 2 * 1024 * 1024;

    if (fileSize > chunkThreshold) {
      final ext = fileName.contains('.') ? fileName.split('.').last.toLowerCase() : 'pdf';
      final totalParts = (fileSize / chunkSize).ceil();

      final initRes = await apiClient.post(
        ApiEndpoints.adminKnowledgeBaseInitUpload,
        data: {
          'title': title.trim(),
          'author': author.trim(),
          'edition': edition.trim(),
          'description': description.trim(),
          'publicationYear': ?publicationYear,
          'technology': technology.trim(),
          'fileName': fileName,
          'fileType': ext,
          'fileSize': fileSize,
          'totalParts': totalParts,
        },
        options: Options(receiveTimeout: const Duration(seconds: 30)),
      );

      final bookJson = (initRes.data as Map<String, dynamic>)['book'] as Map<String, dynamic>;
      final bookId = bookJson['id'].toString();
      final bytes = await file.readAsBytes();

      for (int partIdx = 0; partIdx < totalParts; partIdx++) {
        final start = partIdx * chunkSize;
        final end = (start + chunkSize > bytes.length) ? bytes.length : start + chunkSize;
        final Uint8List slice = bytes.sublist(start, end);

        final formData = FormData.fromMap({
          'partIndex': partIdx.toString(),
          'chunk': MultipartFile.fromBytes(slice, filename: '$fileName.part$partIdx'),
        });

        await apiClient.post(
          ApiEndpoints.adminKnowledgeBaseBookUploadPart(bookId),
          data: formData,
          options: Options(
            contentType: 'multipart/form-data',
            sendTimeout: const Duration(seconds: 60),
            receiveTimeout: const Duration(seconds: 60),
          ),
        );
      }

      final finRes = await apiClient.post(
        ApiEndpoints.adminKnowledgeBaseBookFinalizeUpload(bookId),
        options: Options(receiveTimeout: const Duration(seconds: 60)),
      );
      final finalJson = (finRes.data as Map<String, dynamic>)['book'] as Map<String, dynamic>;
      return KnowledgeBookModel.fromJson(finalJson);
    }

    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath, filename: fileName),
      'title': title.trim(),
      'author': author.trim(),
      'edition': edition.trim(),
      'description': description.trim(),
      if (publicationYear != null) 'publicationYear': publicationYear.toString(),
      'technology': technology.trim(),
    });

    final response = await apiClient.post(
      ApiEndpoints.adminKnowledgeBaseBooks,
      data: formData,
      options: Options(
        contentType: 'multipart/form-data',
        sendTimeout: const Duration(seconds: 60),
        receiveTimeout: const Duration(seconds: 60),
      ),
    );

    final data = response.data as Map<String, dynamic>;
    return KnowledgeBookModel.fromJson(data['book'] as Map<String, dynamic>);
  }

  Future<void> toggleBookEnabled(String bookId, bool isEnabled) async {
    await apiClient.patch(
      ApiEndpoints.adminKnowledgeBaseBookToggle(bookId),
      data: {'isEnabled': isEnabled},
    );
  }

  Future<Map<String, dynamic>> processBookStep(
    String bookId, {
    bool forceReextract = false,
  }) async {
    final response = await apiClient.post(
      ApiEndpoints.adminKnowledgeBaseBookProcessStep(bookId),
      data: {
        if (forceReextract) 'forceReextract': true,
      },
      options: Options(receiveTimeout: const Duration(seconds: 55)),
    );
    return (response.data as Map<String, dynamic>?) ?? const {};
  }

  Future<void> retryBookProcessing(
    String bookId, {
    String mode = 'resume',
  }) async {
    await apiClient.post(
      ApiEndpoints.adminKnowledgeBaseBookRetry(bookId),
      data: {'mode': mode},
    );
  }

  Future<void> deleteBook(String bookId) async {
    await apiClient.delete(ApiEndpoints.adminKnowledgeBaseBookById(bookId));
  }

  Future<Map<String, dynamic>> setupVectorIndex() async {
    final response = await apiClient.post(
      ApiEndpoints.adminKnowledgeBaseSetupVectorIndex,
      options: Options(receiveTimeout: const Duration(seconds: 30)),
    );
    return response.data as Map<String, dynamic>;
  }

  /// Admin Verification Reports
  Future<VerificationReportsResponse> getVerificationReports({
    String? status,
    String? technology,
    String? reviewStatus,
    String? search,
  }) async {
    final params = <String, dynamic>{};
    if (status != null && status.isNotEmpty && status != 'all') params['status'] = status;
    if (technology != null && technology.isNotEmpty && technology != 'all') params['technology'] = technology;
    if (reviewStatus != null && reviewStatus.isNotEmpty && reviewStatus != 'all') params['reviewStatus'] = reviewStatus;
    if (search != null && search.trim().isNotEmpty) params['search'] = search.trim();

    final response = await apiClient.get(
      ApiEndpoints.adminVerificationReports,
      queryParameters: params,
      options: Options(receiveTimeout: const Duration(seconds: 25)),
    );
    return VerificationReportsResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<CorrectionHistoryModel>> getCorrectionHistory() async {
    final response = await apiClient.get(ApiEndpoints.adminVerificationHistory);
    final data = response.data as Map<String, dynamic>;
    final rawList = (data['history'] as List?) ?? [];
    return rawList.map((e) => CorrectionHistoryModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> approveReportCorrection({
    required String reportId,
    required String correctedAnswer,
    String? correctedExplanation,
    String notes = '',
  }) async {
    await apiClient.post(
      ApiEndpoints.adminVerificationReportApprove(reportId),
      data: {
        'correctedAnswer': correctedAnswer,
        if (correctedExplanation != null && correctedExplanation.trim().isNotEmpty)
          'correctedExplanation': correctedExplanation.trim(),
        'notes': notes.trim(),
      },
    );
  }

  Future<void> dismissReport(String reportId, {String notes = ''}) async {
    await apiClient.post(
      ApiEndpoints.adminVerificationReportDismiss(reportId),
      data: {'notes': notes},
    );
  }

  Future<void> deleteReport(String reportId) async {
    await apiClient.delete(ApiEndpoints.adminVerificationReportById(reportId));
  }

  /// Admin AI Provider Controls, Diagnostics & Usage
  Future<AdminAiStatusModel> getAiStatus() async {
    final response = await apiClient.get(
      ApiEndpoints.adminAiStatus,
      options: Options(receiveTimeout: const Duration(seconds: 20)),
    );
    return AdminAiStatusModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> getAiModels({bool refresh = false}) async {
    final response = await apiClient.get(
      ApiEndpoints.adminAiModels,
      queryParameters: refresh ? {'refresh': '1'} : null,
      options: Options(receiveTimeout: const Duration(seconds: 20)),
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> testAiModel(Map<String, dynamic> payload) async {
    final response = await apiClient.post(
      ApiEndpoints.adminAiTest,
      data: payload,
      options: Options(
        sendTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 45),
      ),
    );
    return response.data as Map<String, dynamic>;
  }

  Future<String> clearAiCache() async {
    final response = await apiClient.post(ApiEndpoints.adminAiCacheClear);
    final data = response.data as Map<String, dynamic>;
    return data['message']?.toString() ?? 'Cleared in-memory AI cache.';
  }
}
