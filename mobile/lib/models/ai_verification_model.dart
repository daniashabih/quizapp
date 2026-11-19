class AiVerificationResult {
  final String id;
  final String verificationStatus;
  final String originalCorrectAnswer;
  final String verifiedCorrectAnswer;
  final String explanation;
  final String sourceBook;
  final String sourceAuthor;
  final String sourceChapter;
  final String sourcePage;
  final String supportingExcerpt;
  final String issueDescription;
  final String suggestedCorrection;
  final double confidence;
  final bool cached;

  const AiVerificationResult({
    required this.id,
    required this.verificationStatus,
    required this.originalCorrectAnswer,
    required this.verifiedCorrectAnswer,
    required this.explanation,
    required this.sourceBook,
    required this.sourceAuthor,
    required this.sourceChapter,
    required this.sourcePage,
    required this.supportingExcerpt,
    required this.issueDescription,
    required this.suggestedCorrection,
    required this.confidence,
    this.cached = false,
  });

  String get statusLabel {
    switch (verificationStatus) {
      case 'verified':
        return 'Verified';
      case 'incorrect':
        return 'Incorrect Answer Detected';
      case 'ambiguous':
        return 'Ambiguous Question';
      case 'insufficient_evidence':
      default:
        return 'Insufficient Book Evidence';
    }
  }

  factory AiVerificationResult.fromJson(Map<String, dynamic> json, {bool cached = false}) {
    final rawStatus = json['verification_status']?.toString() ??
        json['verificationStatus']?.toString() ??
        json['status']?.toString() ??
        'insufficient_evidence';
    final normalizedStatus = rawStatus == 'correct' ? 'verified' : rawStatus;

    return AiVerificationResult(
      id: json['id']?.toString() ?? '',
      verificationStatus: normalizedStatus,
      originalCorrectAnswer: json['original_correct_answer']?.toString() ??
          json['originalCorrectAnswer']?.toString() ??
          '',
      verifiedCorrectAnswer: json['verified_correct_answer']?.toString() ??
          json['verifiedCorrectAnswer']?.toString() ??
          json['verifiedAnswer']?.toString() ??
          '',
      explanation: json['explanation']?.toString() ?? '',
      sourceBook: json['source_book']?.toString() ?? json['sourceBook']?.toString() ?? '',
      sourceAuthor: json['source_author']?.toString() ?? json['sourceAuthor']?.toString() ?? '',
      sourceChapter: json['source_chapter']?.toString() ??
          json['sourceChapter']?.toString() ??
          json['chapter']?.toString() ??
          '',
      sourcePage: json['source_page']?.toString() ??
          json['sourcePage']?.toString() ??
          json['page']?.toString() ??
          '',
      supportingExcerpt: json['supporting_excerpt']?.toString() ??
          json['supportingExcerpt']?.toString() ??
          '',
      issueDescription: json['issue_description']?.toString() ??
          json['issueDescription']?.toString() ??
          json['reason']?.toString() ??
          '',
      suggestedCorrection: json['suggested_correction']?.toString() ?? json['suggestedCorrection']?.toString() ?? '',
      confidence: (json['confidence'] is num) ? (json['confidence'] as num).toDouble() : 0.0,
      cached: cached,
    );
  }
}

class KnowledgeBookModel {
  final String id;
  final String title;
  final String author;
  final String edition;
  final String description;
  final int? publicationYear;
  final String technology;
  final String fileName;
  final String fileType;
  final int fileSize;
  final bool isEnabled;
  final String processingStatus;
  final int processingProgress;
  final String processingError;
  final bool ocrUsed;
  final int totalPages;
  final int totalChunks;
  final int indexedChunks;
  final String embeddingModel;
  final int embeddingDimensions;
  final DateTime? createdAt;

  const KnowledgeBookModel({
    required this.id,
    required this.title,
    required this.author,
    this.edition = '',
    this.description = '',
    this.publicationYear,
    required this.technology,
    required this.fileName,
    required this.fileType,
    this.fileSize = 0,
    this.isEnabled = true,
    this.processingStatus = 'Uploaded',
    this.processingProgress = 0,
    this.processingError = '',
    this.ocrUsed = false,
    this.totalPages = 0,
    this.totalChunks = 0,
    this.indexedChunks = 0,
    this.embeddingModel = '',
    this.embeddingDimensions = 1536,
    this.createdAt,
  });

  bool get isProcessing => const {
        'Uploaded',
        'Processing',
        'Extracting Text',
        'Generating Embeddings',
        'Indexing',
      }.contains(processingStatus);

  factory KnowledgeBookModel.fromJson(Map<String, dynamic> json) {
    return KnowledgeBookModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      author: json['author']?.toString() ?? '',
      edition: json['edition']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      publicationYear: json['publicationYear'] is int
          ? json['publicationYear'] as int
          : int.tryParse(json['publicationYear']?.toString() ?? ''),
      technology: json['technology']?.toString() ?? '',
      fileName: json['fileName']?.toString() ?? '',
      fileType: json['fileType']?.toString() ?? '',
      fileSize: (json['fileSize'] is num) ? (json['fileSize'] as num).toInt() : 0,
      isEnabled: json['isEnabled'] != false,
      processingStatus: json['processingStatus']?.toString() ?? 'Uploaded',
      processingProgress: (json['processingProgress'] is num) ? (json['processingProgress'] as num).toInt() : 0,
      processingError: json['processingError']?.toString() ?? '',
      ocrUsed: json['ocrUsed'] == true,
      totalPages: (json['totalPages'] is num) ? (json['totalPages'] as num).toInt() : 0,
      totalChunks: (json['totalChunks'] is num) ? (json['totalChunks'] as num).toInt() : 0,
      indexedChunks: (json['indexedChunks'] is num) ? (json['indexedChunks'] as num).toInt() : 0,
      embeddingModel: json['embeddingModel']?.toString() ?? '',
      embeddingDimensions: (json['embeddingDimensions'] is num) ? (json['embeddingDimensions'] as num).toInt() : 1536,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
    );
  }
}

class KnowledgeBaseListResponse {
  final List<KnowledgeBookModel> books;
  final List<String> technologies;
  final int totalBooks;
  final int activeBooks;
  final int processingBooks;
  final int failedBooks;
  final int totalPages;
  final int totalIndexedChunks;
  final bool aiProviderConfigured;
  final String activeProvider;
  final String activeVerificationModel;
  final String activeEmbeddingModel;
  final int activeEmbeddingDimensions;

  const KnowledgeBaseListResponse({
    required this.books,
    required this.technologies,
    this.totalBooks = 0,
    this.activeBooks = 0,
    this.processingBooks = 0,
    this.failedBooks = 0,
    this.totalPages = 0,
    this.totalIndexedChunks = 0,
    this.aiProviderConfigured = true,
    this.activeProvider = '',
    this.activeVerificationModel = '',
    this.activeEmbeddingModel = '',
    this.activeEmbeddingDimensions = 1536,
  });

  factory KnowledgeBaseListResponse.fromJson(Map<String, dynamic> json) {
    final rawBooks = (json['books'] as List?) ?? [];
    final rawTechs = (json['technologies'] as List?) ?? [];
    final summary = (json['summary'] as Map<String, dynamic>?) ?? {};
    final aiProvider = (json['aiProvider'] as Map<String, dynamic>?) ?? {};

    return KnowledgeBaseListResponse(
      books: rawBooks.map((e) => KnowledgeBookModel.fromJson(e as Map<String, dynamic>)).toList(),
      technologies: rawTechs
          .map((t) => t is Map ? (t['name']?.toString() ?? '') : t.toString())
          .where((s) => s.isNotEmpty)
          .toList(),
      totalBooks: (summary['totalBooks'] as num?)?.toInt() ?? rawBooks.length,
      activeBooks: (summary['activeBooks'] as num?)?.toInt() ?? 0,
      processingBooks: (summary['processingBooks'] as num?)?.toInt() ?? 0,
      failedBooks: (summary['failedBooks'] as num?)?.toInt() ?? 0,
      totalPages: (summary['totalPages'] as num?)?.toInt() ?? 0,
      totalIndexedChunks: (summary['totalIndexedChunks'] as num?)?.toInt() ?? 0,
      aiProviderConfigured: aiProvider['configured'] != false,
      activeProvider: aiProvider['provider']?.toString() ?? '',
      activeVerificationModel: aiProvider['verificationModel']?.toString() ?? '',
      activeEmbeddingModel: aiProvider['embeddingModel']?.toString() ?? '',
      activeEmbeddingDimensions: (aiProvider['embeddingDimensions'] as num?)?.toInt() ?? 1536,
    );
  }
}

class VerificationReportModel {
  final String id;
  final String questionId;
  final String technology;
  final String questionText;
  final List<String> options;
  final String originalCorrectAnswer;
  final String verifiedCorrectAnswer;
  final String verificationStatus;
  final String explanation;
  final String sourceBook;
  final String sourceAuthor;
  final String sourceChapter;
  final String sourcePage;
  final String supportingExcerpt;
  final String issueDescription;
  final String suggestedCorrection;
  final double confidence;
  final String reviewStatus;
  final int requestCount;

  const VerificationReportModel({
    required this.id,
    this.questionId = '',
    required this.technology,
    required this.questionText,
    required this.options,
    required this.originalCorrectAnswer,
    required this.verifiedCorrectAnswer,
    required this.verificationStatus,
    required this.explanation,
    this.sourceBook = '',
    this.sourceAuthor = '',
    this.sourceChapter = '',
    this.sourcePage = '',
    this.supportingExcerpt = '',
    this.issueDescription = '',
    this.suggestedCorrection = '',
    this.confidence = 0,
    this.reviewStatus = 'pending',
    this.requestCount = 1,
  });

  String get statusLabel {
    switch (verificationStatus) {
      case 'verified':
        return 'Verified';
      case 'incorrect':
        return 'Incorrect Answer Detected';
      case 'ambiguous':
        return 'Ambiguous Question';
      case 'insufficient_evidence':
      default:
        return 'Insufficient Book Evidence';
    }
  }

  factory VerificationReportModel.fromJson(Map<String, dynamic> json) {
    final rawOpts = (json['options'] as List?) ?? [];
    return VerificationReportModel(
      id: json['id']?.toString() ?? '',
      questionId: json['questionId']?.toString() ?? '',
      technology: json['technology']?.toString() ?? '',
      questionText: json['questionText']?.toString() ?? '',
      options: rawOpts.map((e) => e.toString()).toList(),
      originalCorrectAnswer: json['originalCorrectAnswer']?.toString() ?? '',
      verifiedCorrectAnswer: json['verifiedCorrectAnswer']?.toString() ?? '',
      verificationStatus: json['verificationStatus']?.toString() ?? 'insufficient_evidence',
      explanation: json['explanation']?.toString() ?? '',
      sourceBook: json['sourceBook']?.toString() ?? '',
      sourceAuthor: json['sourceAuthor']?.toString() ?? '',
      sourceChapter: json['sourceChapter']?.toString() ?? '',
      sourcePage: json['sourcePage']?.toString() ?? '',
      supportingExcerpt: json['supportingExcerpt']?.toString() ?? '',
      issueDescription: json['issueDescription']?.toString() ?? '',
      suggestedCorrection: json['suggestedCorrection']?.toString() ?? '',
      confidence: (json['confidence'] is num) ? (json['confidence'] as num).toDouble() : 0.0,
      reviewStatus: json['reviewStatus']?.toString() ?? 'pending',
      requestCount: (json['requestCount'] is num) ? (json['requestCount'] as num).toInt() : 1,
    );
  }
}

class CorrectionHistoryModel {
  final String id;
  final String technology;
  final String questionText;
  final String previousCorrectAnswer;
  final String newCorrectAnswer;
  final String sourceBook;
  final String sourcePage;
  final String approvedBy;
  final String notes;
  final DateTime? createdAt;

  const CorrectionHistoryModel({
    required this.id,
    required this.technology,
    required this.questionText,
    required this.previousCorrectAnswer,
    required this.newCorrectAnswer,
    this.sourceBook = '',
    this.sourcePage = '',
    required this.approvedBy,
    this.notes = '',
    this.createdAt,
  });

  factory CorrectionHistoryModel.fromJson(Map<String, dynamic> json) {
    return CorrectionHistoryModel(
      id: json['id']?.toString() ?? '',
      technology: json['technology']?.toString() ?? '',
      questionText: json['questionText']?.toString() ?? '',
      previousCorrectAnswer: json['previousCorrectAnswer']?.toString() ?? '',
      newCorrectAnswer: json['newCorrectAnswer']?.toString() ?? '',
      sourceBook: json['sourceBook']?.toString() ?? '',
      sourcePage: json['sourcePage']?.toString() ?? '',
      approvedBy: json['approvedBy']?.toString() ?? 'Admin',
      notes: json['notes']?.toString() ?? '',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
    );
  }
}

class VerificationReportsResponse {
  final List<VerificationReportModel> reports;
  final List<String> technologies;
  final int totalVerified;
  final int confirmedCorrect;
  final int incorrectDetected;
  final int ambiguousCount;
  final int insufficientEvidenceCount;

  const VerificationReportsResponse({
    required this.reports,
    required this.technologies,
    this.totalVerified = 0,
    this.confirmedCorrect = 0,
    this.incorrectDetected = 0,
    this.ambiguousCount = 0,
    this.insufficientEvidenceCount = 0,
  });

  factory VerificationReportsResponse.fromJson(Map<String, dynamic> json) {
    final rawReports = (json['reports'] as List?) ?? [];
    final rawTechs = (json['technologies'] as List?) ?? [];
    final stats = (json['stats'] as Map<String, dynamic>?) ?? {};

    return VerificationReportsResponse(
      reports: rawReports.map((e) => VerificationReportModel.fromJson(e as Map<String, dynamic>)).toList(),
      technologies: rawTechs.map((e) => e.toString()).toList(),
      totalVerified: (stats['totalVerified'] as num?)?.toInt() ?? 0,
      confirmedCorrect: (stats['confirmedCorrect'] as num?)?.toInt() ?? 0,
      incorrectDetected: (stats['incorrectDetected'] as num?)?.toInt() ?? 0,
      ambiguousCount: (stats['ambiguousCount'] as num?)?.toInt() ?? 0,
      insufficientEvidenceCount: (stats['insufficientEvidenceCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class AdminAiEventModel {
  final String timestamp;
  final String operation;
  final String provider;
  final String model;
  final bool cached;
  final String cacheLayer;
  final int totalTokens;
  final int latencyMs;
  final String status;

  const AdminAiEventModel({
    required this.timestamp,
    required this.operation,
    required this.provider,
    required this.model,
    this.cached = false,
    this.cacheLayer = '',
    this.totalTokens = 0,
    this.latencyMs = 0,
    this.status = 'ok',
  });

  factory AdminAiEventModel.fromJson(Map<String, dynamic> json) {
    return AdminAiEventModel(
      timestamp: json['timestamp']?.toString() ?? '',
      operation: json['operation']?.toString() ?? '',
      provider: json['provider']?.toString() ?? '',
      model: json['model']?.toString() ?? '',
      cached: json['cached'] == true,
      cacheLayer: json['cacheLayer']?.toString() ?? '',
      totalTokens: (json['totalTokens'] as num?)?.toInt() ?? 0,
      latencyMs: (json['latencyMs'] as num?)?.toInt() ?? 0,
      status: json['status']?.toString() ?? 'ok',
    );
  }
}

class AdminAiStatusModel {
  final bool configured;
  final String provider;
  final String chatProvider;
  final String embeddingProvider;
  final bool embeddingConfigured;
  final bool? modelValid;
  final String modelValidationError;
  final int availableChatModelsCount;
  final String chatModel;
  final String embeddingModel;
  final int embeddingDimensions;
  final String vectorIndexName;
  final int dimensionMismatchCount;
  final int timeoutMs;
  final int maxRetries;
  final int totalRequests;
  final double cacheHitRatePercent;
  final int totalTokens;
  final int errors;
  final int cachedVerificationsCount;
  final int totalIndexedChunks;
  final int memoryEmbeddingCacheEntries;
  final int memoryChatCacheEntries;
  final List<AdminAiEventModel> recentEvents;

  const AdminAiStatusModel({
    required this.configured,
    required this.provider,
    this.chatProvider = '',
    this.embeddingProvider = '',
    this.embeddingConfigured = false,
    this.modelValid,
    this.modelValidationError = '',
    this.availableChatModelsCount = 0,
    required this.chatModel,
    required this.embeddingModel,
    required this.embeddingDimensions,
    required this.vectorIndexName,
    this.dimensionMismatchCount = 0,
    this.timeoutMs = 25000,
    this.maxRetries = 3,
    this.totalRequests = 0,
    this.cacheHitRatePercent = 0,
    this.totalTokens = 0,
    this.errors = 0,
    this.cachedVerificationsCount = 0,
    this.totalIndexedChunks = 0,
    this.memoryEmbeddingCacheEntries = 0,
    this.memoryChatCacheEntries = 0,
    this.recentEvents = const [],
  });

  factory AdminAiStatusModel.fromJson(Map<String, dynamic> json) {
    final aiProvider = (json['aiProvider'] as Map<String, dynamic>?) ?? {};
    final providers = (json['providers'] as Map<String, dynamic>?) ?? {};
    final modelValidation = (json['modelValidation'] as Map<String, dynamic>?);
    final config = (json['config'] as Map<String, dynamic>?) ?? {};
    final vectorIndex = (json['vectorIndex'] as Map<String, dynamic>?) ?? {};
    final cache = (json['cache'] as Map<String, dynamic>?) ?? {};
    final usage = (json['usage'] as Map<String, dynamic>?) ?? {};
    final totals = (usage['totals'] as Map<String, dynamic>?) ?? {};
    final persistent = (usage['persistentDbStats'] as Map<String, dynamic>?) ?? {};
    final rawEvents = (usage['recentEvents'] as List?) ?? [];

    return AdminAiStatusModel(
      configured: aiProvider['configured'] == true,
      provider: aiProvider['provider']?.toString() ?? '',
      chatProvider: providers['chatProvider']?.toString() ?? aiProvider['provider']?.toString() ?? '',
      embeddingProvider: providers['embeddingProvider']?.toString() ?? '',
      embeddingConfigured: providers['embeddingConfigured'] == true ||
          (config['embeddingModel']?.toString().isNotEmpty ?? false),
      modelValid: modelValidation?['valid'] as bool?,
      modelValidationError: modelValidation?['error']?.toString() ?? '',
      availableChatModelsCount: (modelValidation?['availableChatModelsCount'] as num?)?.toInt() ?? 0,
      chatModel: config['chatModel']?.toString() ?? aiProvider['verificationModel']?.toString() ?? '',
      embeddingModel: config['embeddingModel']?.toString() ?? aiProvider['embeddingModel']?.toString() ?? '',
      embeddingDimensions: (config['embeddingDimensions'] as num?)?.toInt() ?? 1536,
      vectorIndexName: vectorIndex['name']?.toString() ?? 'book_chunks_vector_index',
      dimensionMismatchCount: (vectorIndex['dimensionMismatchCount'] as num?)?.toInt() ?? 0,
      timeoutMs: (config['timeoutMs'] as num?)?.toInt() ?? 25000,
      maxRetries: (config['maxRetries'] as num?)?.toInt() ?? 3,
      totalRequests: (totals['totalRequests'] as num?)?.toInt() ?? 0,
      cacheHitRatePercent: (totals['cacheHitRatePercent'] as num?)?.toDouble() ?? 0.0,
      totalTokens: (totals['totalTokens'] as num?)?.toInt() ?? 0,
      errors: (totals['errors'] as num?)?.toInt() ?? 0,
      cachedVerificationsCount: (persistent['cachedVerificationsCount'] as num?)?.toInt() ?? 0,
      totalIndexedChunks: (persistent['totalIndexedChunks'] as num?)?.toInt() ?? 0,
      memoryEmbeddingCacheEntries: (cache['embeddingEntries'] as num?)?.toInt() ?? 0,
      memoryChatCacheEntries: (cache['chatEntries'] as num?)?.toInt() ?? 0,
      recentEvents: rawEvents
          .whereType<Map<String, dynamic>>()
          .map(AdminAiEventModel.fromJson)
          .toList(),
    );
  }
}
