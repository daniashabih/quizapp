class ApiEndpoints {
  // Health
  static const String health = '/health';

  // Authentication
  static const String signup = '/auth/signup';
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String getMe = '/auth/me';
  static const String updateProfile = '/auth/update-profile';
  static const String deleteAccount = '/auth/delete-account';
  static const String forgotPassword = '/auth/forgot-password';
  static const String verifyResetToken = '/auth/verify-reset-token';
  static const String resetPassword = '/auth/reset-password';
  static const String allUsers = '/auth/users';

  // Dashboard & Analytics
  static const String userDashboard = '/dashboard/user';
  static const String adminDashboard = '/dashboard/admin';
  static const String leaderboard = '/dashboard/leaderboard';
  static const String certificates = '/dashboard/certificates';

  // Questions & Assessment
  static const String questions = '/questions';
  static const String questionSessions = '/questions/sessions';
  static const String generateQuestions = '/questions/generate';

  // Technologies / Categories
  static const String categories = '/categories';

  // Quizzes & Authoritative Evaluation
  static const String submitQuiz = '/quizzes/submit';

  // Attempts & Resumption
  static const String attemptsStart = '/attempts/start';
  static const String attemptsInProgress = '/attempts/in-progress';
  static String attemptById(String id) => '/attempts/$id';
  static String attemptAnswer(String id) => '/attempts/$id/answer';
  static String attemptUpdate(String id) => '/attempts/$id';
  static String attemptComplete(String id) => '/attempts/$id/complete';
  static String attemptDiscard(String id) => '/attempts/$id';

  // Results
  static const String saveResult = '/results/save';
  static const String myResults = '/results/my-results';
  static const String resultStats = '/results/stats';

  // Central Platform Settings
  static const String settings = '/settings';
  static const String adminSettings = '/admin/settings';

  // Public Certificates Verification
  static const String verifyCertificate = '/certificates/verify';

  // Admin Specific
  static const String adminUsers = '/admin/users';
  static const String adminTechnologies = '/admin/technologies';
  static const String adminQuestions = '/admin/questions';
  static const String adminCertificates = '/admin/certificates';
  static const String adminResults = '/admin/results';

  // Games & Technologies
  static const String games = '/games';
  static const String gameCategories = '/games/categories';
  static const String gameTechnologies = '/games/technologies';
  static String gameTechnologyBySlug(String slug) => '/games/technologies/$slug';
  static String gameTechnologyGames(String slug) => '/games/technologies/$slug/games';
  static String gameTechnologyStats(String slug) => '/games/technologies/$slug/stats';
  static const String gamesUserStats = '/games/user/stats';
  static String gameBySlug(String slug) => '/games/$slug';
  static String gameChallenges(String slug) => '/games/$slug/challenges';
  static String gameVerify(String slug) => '/games/$slug/verify';
  static String gameProgress(String slug) => '/games/$slug/progress';
  static String gameScore(String slug) => '/games/$slug/score';
  static String gameFavorite(String slug) => '/games/$slug/favorite';
  static const String adminGames = '/admin/games';
  static const String adminGameCategories = '/admin/games/categories';
  static const String adminGameTechnologies = '/admin/games/technologies';
  static const String adminGameChallenges = '/admin/games/challenges';
  static const String adminGameStats = '/admin/games/stats';
  static String adminGameTogglePublish(String id) => '/admin/games/$id/toggle-publish';
  static String adminGameToggleFeature(String id) => '/admin/games/$id/toggle-feature';

  // AI Book-Based Question Verification (RAG)
  static const String aiVerifyQuestion = '/ai/verify-question';
  static const String adminKnowledgeBaseStatus = '/admin/knowledge-base/status';
  static const String adminKnowledgeBaseSetupVectorIndex = '/admin/knowledge-base/setup-vector-index';
  static const String adminKnowledgeBaseBooks = '/admin/knowledge-base/books';
  static const String adminKnowledgeBaseInitUpload = '/admin/knowledge-base/books/init-upload';
  static String adminKnowledgeBaseBookById(String id) => '/admin/knowledge-base/books/$id';
  static String adminKnowledgeBaseBookUploadPart(String id) => '/admin/knowledge-base/books/$id/upload-part';
  static String adminKnowledgeBaseBookFinalizeUpload(String id) => '/admin/knowledge-base/books/$id/finalize-upload';
  static String adminKnowledgeBaseBookProcessStep(String id) => '/admin/knowledge-base/books/$id/process-step';
  static String adminKnowledgeBaseBookToggle(String id) => '/admin/knowledge-base/books/$id/toggle';
  static String adminKnowledgeBaseBookRetry(String id) => '/admin/knowledge-base/books/$id/retry';
  static String adminKnowledgeBaseBookReplace(String id) => '/admin/knowledge-base/books/$id/replace';

  // AI Verification Reports & Approval History
  static const String adminVerificationReports = '/admin/verification-reports';
  static const String adminVerificationHistory = '/admin/verification-reports/history';
  static String adminVerificationReportApprove(String id) => '/admin/verification-reports/$id/approve';
  static String adminVerificationReportDismiss(String id) => '/admin/verification-reports/$id/dismiss';
  static String adminVerificationReportById(String id) => '/admin/verification-reports/$id';

  // Admin AI Provider Controls, Diagnostics & Usage
  static const String adminAiStatus = '/admin/ai/status';
  static const String adminAiModels = '/admin/ai/models';
  static const String adminAiUsage = '/admin/ai/usage';
  static const String adminAiTest = '/admin/ai/test';
  static const String adminAiCacheClear = '/admin/ai/cache/clear';

  // Admin SEO & Growth Studio
  static const String adminSeoDashboard = '/admin/seo/dashboard';
  static const String adminSeoAuditRun = '/admin/seo/audit/run';
  static const String adminSeoPageSpeedRun = '/admin/seo/pagespeed/run';
  static const String adminSeoInspectUrl = '/admin/seo/inspect-url';
  static String adminSeoRecommendationToggle(String recKey) =>
      '/admin/seo/recommendations/${Uri.encodeComponent(recKey)}';
  static const String adminSeoCompetitors = '/admin/seo/competitors';
  static String adminSeoCompetitorRefresh(String id) =>
      '/admin/seo/competitors/${Uri.encodeComponent(id)}/refresh';
  static String adminSeoCompetitorDelete(String id) =>
      '/admin/seo/competitors/${Uri.encodeComponent(id)}';
  static const String adminSeoSettings = '/admin/seo/settings';
  static const String adminSeoTestIntegration = '/admin/seo/integrations/test';
  static const String adminSeoImportBacklinks = '/admin/seo/backlinks/import';
}
