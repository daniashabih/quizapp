import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../core/config/ad_config.dart';

/// A reusable, memory-safe Banner Ad component for Hangbug.
///
/// Features:
/// - Asynchronous ad loading using official Google Mobile Ads SDK.
/// - Adaptive banner sizing support based on screen width.
/// - Caches ad instance across parent widget rebuilds to avoid reload loops.
/// - Disposes the BannerAd instance properly in [dispose] to prevent memory leaks.
/// - Returns [SizedBox.shrink] while loading or if loading fails (no blank placeholders).
/// - Gracefully no-ops on unsupported platforms (web/desktop/tests).
class BannerAdWidget extends StatefulWidget {
  /// The AdMob Ad Unit ID. Defaults to [AdConfig.bannerAdUnitId].
  final String? adUnitId;

  /// The banner ad size. If null, automatically computes anchored adaptive banner size based on device width.
  final AdSize? adSize;

  /// Optional padding around the banner container.
  final EdgeInsetsGeometry padding;

  const BannerAdWidget({
    super.key,
    this.adUnitId,
    this.adSize,
    this.padding = const EdgeInsets.symmetric(vertical: 6.0),
  });

  @override
  State<BannerAdWidget> createState() => _BannerAdWidgetState();
}

class _BannerAdWidgetState extends State<BannerAdWidget> {
  BannerAd? _bannerAd;
  bool _isLoaded = false;
  bool _hasFailed = false;
  bool _isLoading = false;
  bool _isInitialized = false;
  Orientation? _lastOrientation;
  double? _lastWidth;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (AdConfig.disableAdsForTesting ||
        kIsWeb ||
        (defaultTargetPlatform != TargetPlatform.android &&
            defaultTargetPlatform != TargetPlatform.iOS)) {
      return;
    }

    final orientation = MediaQuery.orientationOf(context);
    final width = MediaQuery.sizeOf(context).width;

    if (!_isInitialized) {
      _isInitialized = true;
      _lastOrientation = orientation;
      _lastWidth = width;
      _loadBannerAd();
    } else if (_lastOrientation != orientation ||
        (_lastWidth != null && (_lastWidth! - width).abs() > 40)) {
      _lastOrientation = orientation;
      _lastWidth = width;
      _loadBannerAd();
    }
  }

  Future<void> _loadBannerAd() async {
    if (AdConfig.disableAdsForTesting ||
        kIsWeb ||
        (defaultTargetPlatform != TargetPlatform.android &&
            defaultTargetPlatform != TargetPlatform.iOS)) {
      return;
    }

    if (_isLoading) return;
    _isLoading = true;

    AdSize targetSize;
    if (widget.adSize != null) {
      targetSize = widget.adSize!;
    } else {
      try {
        final screenWidth = MediaQuery.sizeOf(context).width.truncate();
        final adaptiveSize =
            await AdSize.getLargeAnchoredAdaptiveBannerAdSize(screenWidth) ??
                // ignore: deprecated_member_use
                await AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(
                  screenWidth,
                );
        targetSize = adaptiveSize ?? AdSize.banner;
      } catch (e) {
        targetSize = AdSize.banner;
      }
    }

    if (!mounted) {
      _isLoading = false;
      return;
    }

    final targetUnitId = widget.adUnitId ?? AdConfig.bannerAdUnitId;

    await _bannerAd?.dispose();
    _bannerAd = BannerAd(
      adUnitId: targetUnitId,
      size: targetSize,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (ad) {
          if (!mounted) {
            ad.dispose();
            return;
          }
          setState(() {
            _bannerAd = ad as BannerAd;
            _isLoaded = true;
            _hasFailed = false;
            _isLoading = false;
          });
          developer.log(
            'Banner ad loaded successfully ($targetUnitId, size: ${targetSize.width}x${targetSize.height})',
            name: 'BannerAdWidget',
          );
        },
        onAdFailedToLoad: (ad, error) {
          developer.log(
            'Banner ad failed to load: ${error.message} (code: ${error.code})',
            name: 'BannerAdWidget',
          );
          ad.dispose();
          if (!mounted) return;
          setState(() {
            _bannerAd = null;
            _isLoaded = false;
            _hasFailed = true;
            _isLoading = false;
          });
        },
        onAdOpened: (ad) =>
            developer.log('Banner ad clicked/opened', name: 'BannerAdWidget'),
        onAdClosed: (ad) =>
            developer.log('Banner ad closed', name: 'BannerAdWidget'),
        onAdImpression: (ad) =>
            developer.log('Banner ad impression recorded', name: 'BannerAdWidget'),
      ),
    );

    return _bannerAd!.load();
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    _bannerAd = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // If not loaded, failed, or unsupported platform: render zero-size widget
    if (!_isLoaded || _bannerAd == null || _hasFailed) {
      return const SizedBox.shrink();
    }

    return SafeArea(
      top: false,
      child: Padding(
        padding: widget.padding,
        child: Center(
          child: SizedBox(
            width: _bannerAd!.size.width.toDouble(),
            height: _bannerAd!.size.height.toDouble(),
            child: AdWidget(ad: _bannerAd!),
          ),
        ),
      ),
    );
  }
}
