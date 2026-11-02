import 'package:flutter/foundation.dart';

/// Centralized Google AdMob configuration for Hangbug.
class AdConfig {
  AdConfig._();

  /// Google AdMob Android Application ID.
  static const String androidAppId = 'ca-app-pub-1003128718127272~7941454138';

  /// Official Hangbug Production Banner Ad Unit ID.
  static const String productionBannerAdUnitId =
      'ca-app-pub-1003128718127272/5647085407';

  /// Google Official Test Banner Ad Unit ID.
  /// Used during development to prevent policy violations and account bans.
  static const String testBannerAdUnitId =
      'ca-app-pub-3940256099942544/6300978111';

  /// Compile-time or runtime toggle to disable native ad loading in automated test suites
  static bool disableAdsForTesting = false;

  /// Optional compile-time override:
  /// e.g. flutter run --dart-define=USE_PRODUCTION_ADS=true
  static const bool _forceProductionAds = bool.fromEnvironment(
    'USE_PRODUCTION_ADS',
    defaultValue: false,
  );

  /// Returns whether production ads should be served.
  /// Defaults to test ads in debug and profile modes to protect publisher account,
  /// and automatically switches to production ads in release builds.
  static bool get isProductionAds => _forceProductionAds || kReleaseMode;

  /// Returns the appropriate Banner Ad Unit ID based on the current build mode.
  static String get bannerAdUnitId {
    if (isProductionAds) {
      return productionBannerAdUnitId;
    }
    return testBannerAdUnitId;
  }
}
