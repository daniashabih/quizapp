import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/constants/app_strings.dart';
import 'package:hangbug/core/theme/app_theme.dart';
import 'package:hangbug/widgets/app_button.dart';

void main() {
  testWidgets('AppButton widget renders and triggers callback', (WidgetTester tester) async {
    bool tapped = false;

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        home: Scaffold(
          body: AppButton(
            text: 'Test Button',
            onPressed: () => tapped = true,
          ),
        ),
      ),
    );

    expect(find.text('Test Button'), findsOneWidget);
    await tester.tap(find.text('Test Button'));
    expect(tapped, isTrue);
  });

  test('AppStrings constants verify app branding', () {
    expect(AppStrings.appName, equals('Hangbug'));
    expect(AppStrings.appTagline, contains('Certification'));
  });
}
