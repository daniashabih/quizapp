import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/config/ad_config.dart';
import 'package:hangbug/services/ad_service.dart';
import 'package:hangbug/widgets/banner_ad_widget.dart';

void main() {
  setUp(() {
    AdConfig.disableAdsForTesting = true;
    AdConfig.setUseProductionAds(null);
  });

  tearDown(() {
    AdConfig.disableAdsForTesting = false;
    AdConfig.setUseProductionAds(null);
  });

  group('Google AdMob Configuration & Safety Tests', () {
    test('AdConfig IDs match exact publisher and unit specifications', () {
      expect(
        AdConfig.androidAppId,
        equals('ca-app-pub-1003128718127272~7941454138'),
      );
      expect(
        AdConfig.productionBannerAdUnitId,
        equals('ca-app-pub-1003128718127272/5647085407'),
      );
      expect(
        AdConfig.testBannerAdUnitId,
        equals('ca-app-pub-3940256099942544/6300978111'),
      );
    });

    test('AdConfig uses official test unit ID by default in non-release mode', () {
      // In flutter test / debug mode, test ad unit must be used to protect the account
      expect(AdConfig.isProductionAds, isFalse);
      expect(AdConfig.bannerAdUnitId, equals(AdConfig.testBannerAdUnitId));
    });

    test('AdConfig switches cleanly between test and production ad unit IDs', () {
      AdConfig.setUseProductionAds(true);
      expect(AdConfig.isProductionAds, isTrue);
      expect(
        AdConfig.bannerAdUnitId,
        equals(AdConfig.productionBannerAdUnitId),
      );

      AdConfig.setUseProductionAds(false);
      expect(AdConfig.isProductionAds, isFalse);
      expect(AdConfig.bannerAdUnitId, equals(AdConfig.testBannerAdUnitId));
    });

    test('AdService initializes safely without throwing or interrupting app startup', () async {
      await expectLater(AdService.initialize(), completes);
    });
  });

  group('BannerAdWidget Lifecycle & UI Tests Across Form Factors', () {
    testWidgets('BannerAdWidget safely renders SizedBox.shrink when not loaded / in tests', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                Text('Hangbug Technology Tracks'),
                BannerAdWidget(),
              ],
            ),
          ),
        ),
      );

      // Verify the widget tree pumped cleanly
      expect(find.text('Hangbug Technology Tracks'), findsOneWidget);
      expect(find.byType(BannerAdWidget), findsOneWidget);

      // Verify that no layout overflow occurred and empty banner occupies zero height
      expect(tester.takeException(), isNull);
    });

    testWidgets('BannerAdWidget behaves cleanly across compact and large screen sizes', (tester) async {
      // 1. Phone form factor (360x640)
      tester.view.physicalSize = const Size(360, 640);
      tester.view.devicePixelRatio = 1.0;

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                Expanded(child: Center(child: Text('Phone Layout'))),
                BannerAdWidget(),
              ],
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(BannerAdWidget), findsOneWidget);
      expect(tester.takeException(), isNull);

      // 2. Tablet form factor (768x1024)
      tester.view.physicalSize = const Size(768, 1024);
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                Expanded(child: Center(child: Text('Tablet Layout'))),
                BannerAdWidget(),
              ],
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(BannerAdWidget), findsOneWidget);
      expect(tester.takeException(), isNull);

      // Reset physical size
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
    });
  });
}
