class AppConfig {
  static const String appName = 'Hangbug';
  static const String appVersion = '1.3.2';
  static const int appBuildNumber = 16;

  // Production API Base URL (Vercel Live Deployment)
  static const String defaultProductionApiUrl = 'https://www.hangbug.com/api';

  // Configurable at compile time via: --dart-define=API_URL=https://...
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: defaultProductionApiUrl,
  );

  static const String apiBaseUrl = baseUrl;

  // Legal and Documentation URLs
  static const String privacyPolicyUrl = 'https://www.hangbug.com/privacy-policy';
  static const String termsOfServiceUrl = 'https://www.hangbug.com/terms';
  static const String accountDeletionUrl = 'https://www.hangbug.com/delete-account';
  static const String supportEmail = 'support@hangbug.com';
  static const String websiteUrl = 'https://www.hangbug.com';
}
