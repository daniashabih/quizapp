import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../core/config/ad_config.dart';

/// A reusable, memory-safe Banner Ad component for Hangbug.
///
/// Features:
/// - Asynchronous ad loading using official Google Mobile Ads SDK.
/// - Caches ad instance across parent widget rebuilds to avoid reload loops.
/// - Disposes the BannerAd instance properly in [dispose] to prevent memory leaks.
/// - Returns [SizedBox.shrink] while loading or if loading fails (no blank placeholders).
/// - Gracefully no-ops on unsupported platforms (web/desktop/tests).
class BannerAdWidget extends StatefulWidget {
  /// The AdMob Ad Unit ID. Defaults to [AdConfig.bannerAdUnitId].
  final String? adUnitId;

  /// The banner ad size. Defaults to [AdSize.banner] (320x50 standard).
  final AdSize adSize;

  /// Optional padding around the banner container.
  final EdgeInsetsGeometry padding;

  const BannerAdWidget({
    super.key,
    this.adUnitId,
    this.adSize = AdSize.banner,
    this.padding = const EdgeInsets.symmetric(vertical: 6.0),
  });

  @override
  State<BannerAdWidget> createState() => _BannerAdWidgetState();
}

class _BannerAdWidgetState extends State<BannerAdWidget> {
  BannerAd? _bannerAd;
  bool _isLoaded = false;
  bool _hasFailed = false;

  @override
  void initState() {
    super.initState();
    _loadBannerAd();
  }

  void _loadBannerAd() {
    // Mobile Ads are only supported on physical/emulated Android & iOS devices
    if (AdConfig.disableAdsForTesting ||
        kIsWeb ||
        (defaultTargetPlatform != TargetPlatform.android &&
            defaultTargetPlatform != TargetPlatform.iOS)) {
      return;
    }

    final targetUnitId = widget.adUnitId ?? AdConfig.bannerAdUnitId;

    _bannerAd = BannerAd(
      adUnitId: targetUnitId,
      size: widget.adSize,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (ad) {
          if (!mounted) {
            ad.dispose();
            return;
          }
          setState(() {
            _isLoaded = true;
            _hasFailed = false;
          });
          developer.log(
            'Banner ad loaded successfully ($targetUnitId)',
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

    _bannerAd!.load();
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

    return Padding(
      padding: widget.padding,
      child: Center(
        child: SizedBox(
          width: _bannerAd!.size.width.toDouble(),
          height: _bannerAd!.size.height.toDouble(),
          child: AdWidget(ad: _bannerAd!),
        ),
      ),
    );
  }
}
