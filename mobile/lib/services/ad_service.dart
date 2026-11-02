import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../core/config/ad_config.dart';

/// Centralized service for Google Mobile Ads SDK lifecycle.
class AdService {
  AdService._();

  static bool _isInitialized = false;

  /// Indicates whether the Google Mobile Ads SDK was initialized.
  static bool get isInitialized => _isInitialized;

  /// Initializes Google Mobile Ads SDK safely before runApp().
  /// Catches and isolates any potential startup errors so application
  /// launch, Firebase, and authentication are never disrupted.
  static Future<void> initialize() async {
    // Google Mobile Ads is supported on Android and iOS (and bypassed in tests)
    if (AdConfig.disableAdsForTesting ||
        kIsWeb ||
        (defaultTargetPlatform != TargetPlatform.android &&
            defaultTargetPlatform != TargetPlatform.iOS)) {
      developer.log(
        'Google Mobile Ads initialization skipped on non-mobile or test platform.',
        name: 'AdService',
      );
      return;
    }

    try {
      final status = await MobileAds.instance.initialize();
      _isInitialized = true;
      developer.log(
        'Google Mobile Ads SDK initialized successfully. Status: ${status.adapterStatuses}',
        name: 'AdService',
      );
    } catch (e, stackTrace) {
      _isInitialized = false;
      developer.log(
        'Warning: Google Mobile Ads initialization failed: $e',
        name: 'AdService',
        error: e,
        stackTrace: stackTrace,
      );
    }
  }
}
