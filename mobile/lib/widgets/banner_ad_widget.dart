import 'dart:developer' as developer;
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../core/config/ad_config.dart';
import '../core/constants/app_colors.dart';

/// A reusable, memory-safe Banner Ad component for Hangbug.
///
/// Features:
/// - Asynchronous ad loading using official Google Mobile Ads SDK.
/// - Compact adaptive banner sizing constrained to card width (avoids oversized 100dp+ banners).
/// - Theme-aware card framing that blends cleanly with Hangbug light and dark modes.
/// - Caches ad instance across parent widget rebuilds to avoid reload loops.
/// - Disposes the BannerAd instance properly in [dispose] to prevent memory leaks.
/// - Returns [SizedBox.shrink] while loading or if loading fails (no blank placeholders).
/// - Gracefully no-ops on unsupported platforms (web/desktop/tests).
class BannerAdWidget extends StatefulWidget {
  /// The AdMob Ad Unit ID. Defaults to [AdConfig.bannerAdUnitId].
  final String? adUnitId;

  /// The banner ad size. If null, automatically computes a compact anchored adaptive banner size.
  final AdSize? adSize;

  /// Optional outer margin around the banner card container.
  final EdgeInsetsGeometry? padding;

  const BannerAdWidget({
    super.key,
    this.adUnitId,
    this.adSize,
    this.padding,
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

  static const double _maxAdaptiveBannerHeight = 64.0;
  static const double _preferredHorizontalMargin = 16.0;
  static const double _innerHorizontalPadding = 6.0;

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

  int _computeTargetAdWidth(double screenWidth) {
    final rawAvailable = screenWidth -
        (_preferredHorizontalMargin * 2) -
        (_innerHorizontalPadding * 2);
    return math.max(320, rawAvailable.truncate());
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
        final screenWidth = MediaQuery.sizeOf(context).width;
        final availableAdWidth = _computeTargetAdWidth(screenWidth);
        // Use standard (non-large) anchored adaptive banner size so the ad stays
        // sleek and compact (~50-60dp) instead of taking 100-120dp vertical space.
        // ignore: deprecated_member_use
        final adaptiveSize = await AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(
          availableAdWidth,
        );
        if (adaptiveSize != null &&
            adaptiveSize.height <= _maxAdaptiveBannerHeight) {
          targetSize = adaptiveSize;
        } else {
          targetSize = AdSize.banner;
        }
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

    final isDark = context.isDarkMode;
    final screenWidth = MediaQuery.sizeOf(context).width;
    final adWidth = _bannerAd!.size.width.toDouble();
    final adHeight = _bannerAd!.size.height.toDouble();

    final horizontalMargin = math
        .min(
          _preferredHorizontalMargin,
          math.max(0.0, (screenWidth - adWidth - (_innerHorizontalPadding * 2) - 2) / 2),
        )
        .floorToDouble();

    final effectivePadding = widget.padding ??
        EdgeInsets.fromLTRB(horizontalMargin, 4.0, horizontalMargin, 8.0);

    return SafeArea(
      top: false,
      child: Padding(
        padding: effectivePadding,
        child: Center(
          child: Container(
            decoration: BoxDecoration(
              color: context.cardBgColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: context.borderColor,
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.22 : 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(10, 4, 10, 3),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 4,
                              vertical: 1,
                            ),
                            decoration: BoxDecoration(
                              color: context.mutedBgColor,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: context.borderColor,
                                width: 0.8,
                              ),
                            ),
                            child: Text(
                              'AD',
                              style: TextStyle(
                                fontSize: 8.5,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                                height: 1.1,
                                color: context.textSecondaryColor,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Sponsored',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                              letterSpacing: 0.2,
                              height: 1.1,
                              color: context.textMutedColor,
                            ),
                          ),
                        ],
                      ),
                      Icon(
                        Icons.campaign_outlined,
                        size: 12,
                        color: context.textMutedColor,
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    _innerHorizontalPadding,
                    0,
                    _innerHorizontalPadding,
                    6,
                  ),
                  child: SizedBox(
                    width: adWidth,
                    height: adHeight,
                    child: AdWidget(ad: _bannerAd!),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
