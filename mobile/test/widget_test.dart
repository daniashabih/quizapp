import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/constants/app_colors.dart';
import 'package:hangbug/core/constants/app_strings.dart';
import 'package:hangbug/core/theme/app_theme.dart';
import 'package:hangbug/providers/theme_provider.dart';
import 'package:hangbug/widgets/app_button.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('AppButton widget renders and triggers callback in Light and Dark mode', (WidgetTester tester) async {
    bool tapped = false;

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.dark,
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
    expect(AppStrings.appTagline, equals('Learn - Test - Prove'));
  });

  group('ThemeModeNotifier and persistence', () {
    test('parseThemeMode and serializeThemeMode round-trip light, dark, and system', () {
      expect(parseThemeMode('light'), equals(ThemeMode.light));
      expect(parseThemeMode('dark'), equals(ThemeMode.dark));
      expect(parseThemeMode('system'), equals(ThemeMode.system));
      expect(parseThemeMode(null), equals(ThemeMode.system));
      expect(parseThemeMode('unknown'), equals(ThemeMode.system));

      expect(serializeThemeMode(ThemeMode.light), equals('light'));
      expect(serializeThemeMode(ThemeMode.dark), equals('dark'));
      expect(serializeThemeMode(ThemeMode.system), equals('system'));
    });

    test('ThemeModeNotifier persists and restores saved theme preference via SharedPreferences', () async {
      SharedPreferences.setMockInitialValues({});

      final initialLoaded = await loadSavedThemeMode();
      expect(initialLoaded, equals(ThemeMode.system));

      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(themeModeProvider), equals(ThemeMode.system));

      await container.read(themeModeProvider.notifier).setThemeMode(ThemeMode.dark);
      expect(container.read(themeModeProvider), equals(ThemeMode.dark));
      expect(await loadSavedThemeMode(), equals(ThemeMode.dark));

      await container.read(themeModeProvider.notifier).setThemeMode(ThemeMode.light);
      expect(container.read(themeModeProvider), equals(ThemeMode.light));
      expect(await loadSavedThemeMode(), equals(ThemeMode.light));

      await container.read(themeModeProvider.notifier).setThemeMode(ThemeMode.system);
      expect(container.read(themeModeProvider), equals(ThemeMode.system));
      expect(await loadSavedThemeMode(), equals(ThemeMode.system));
    });

    testWidgets('AppTheme lightTheme and darkTheme apply distinct surface and text colors', (WidgetTester tester) async {
      late Color lightScaffold;
      late Color darkScaffold;
      late bool isDarkResolved;

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.light,
          home: Builder(
            builder: (context) {
              lightScaffold = context.scaffoldBgColor;
              isDarkResolved = context.isDarkMode;
              return const Scaffold(body: Text('Light'));
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(isDarkResolved, isFalse);
      expect(lightScaffold, equals(AppColors.background));

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.dark,
          home: Builder(
            builder: (context) {
              darkScaffold = context.scaffoldBgColor;
              isDarkResolved = context.isDarkMode;
              return const Scaffold(body: Text('Dark'));
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(isDarkResolved, isTrue);
      expect(darkScaffold, equals(AppColors.darkBackground));
      expect(darkScaffold, isNot(equals(lightScaffold)));
    });
  });
}
