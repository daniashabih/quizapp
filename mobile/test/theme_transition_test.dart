import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/constants/app_colors.dart';
import 'package:hangbug/core/theme/app_theme.dart';
import 'package:hangbug/providers/theme_provider.dart';
import 'package:hangbug/widgets/animated_theme_toggle.dart';
import 'package:hangbug/widgets/theme_transition_overlay.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('Premium Light & Dark Theme Transition (Mobile)', () {
    testWidgets(
      'AnimatedThemeToggleButton toggles Light <-> Dark, animates Sun/Moon icon, and preserves persistence',
      (WidgetTester tester) async {
        SharedPreferences.setMockInitialValues({});
        final snapshotNotifier = ValueNotifier<bool>(false);
        addTearDown(snapshotNotifier.dispose);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              themeModeProvider.overrideWith(
                (ref) => ThemeModeNotifier(ThemeMode.light),
              ),
            ],
            child: Consumer(
              builder: (context, ref, _) {
                final themeMode = ref.watch(themeModeProvider);
                return MaterialApp(
                  theme: AppTheme.lightTheme,
                  darkTheme: AppTheme.darkTheme,
                  themeMode: themeMode,
                  themeAnimationDuration: const Duration(milliseconds: 580),
                  themeAnimationCurve: Curves.easeInOutCubic,
                  builder: (context, child) => ThemeTransitionViewport(
                    snapshotActiveNotifier: snapshotNotifier,
                    child: child,
                  ),
                  home: Scaffold(
                    appBar: AppBar(
                      actions: const [AnimatedThemeToggleButton()],
                    ),
                    body: Builder(
                      builder: (ctx) => Text(
                        ctx.isDarkMode ? 'DarkActive' : 'LightActive',
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        );

        await tester.pumpAndSettle();
        expect(find.text('LightActive'), findsOneWidget);
        var iconOpacities = tester
            .widgetList<Opacity>(
              find.descendant(
                of: find.byType(AnimatedThemeIcon),
                matching: find.byType(Opacity),
              ),
            )
            .toList();
        expect(iconOpacities[0].opacity, equals(1.0));
        expect(iconOpacities[1].opacity, equals(0.0));

        // Tap toggle: Light -> Dark
        await tester.tap(find.byType(AnimatedThemeToggleButton));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 250));
        await tester.pumpAndSettle();

        expect(find.text('DarkActive'), findsOneWidget);
        iconOpacities = tester
            .widgetList<Opacity>(
              find.descendant(
                of: find.byType(AnimatedThemeIcon),
                matching: find.byType(Opacity),
              ),
            )
            .toList();
        expect(iconOpacities[0].opacity, equals(0.0));
        expect(iconOpacities[1].opacity, equals(1.0));
        expect(await loadSavedThemeMode(), equals(ThemeMode.dark));

        // Tap toggle again: Dark -> Light
        await tester.tap(find.byType(AnimatedThemeToggleButton));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 250));
        await tester.pumpAndSettle();

        expect(find.text('LightActive'), findsOneWidget);
        expect(await loadSavedThemeMode(), equals(ThemeMode.light));
      },
    );

    testWidgets(
      'ThemeTransitionViewport guards against overlapping rapid taps',
      (WidgetTester tester) async {
        SharedPreferences.setMockInitialValues({});

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              themeModeProvider.overrideWith(
                (ref) => ThemeModeNotifier(ThemeMode.light),
              ),
            ],
            child: Consumer(
              builder: (context, ref, _) {
                final themeMode = ref.watch(themeModeProvider);
                return MaterialApp(
                  theme: AppTheme.lightTheme,
                  darkTheme: AppTheme.darkTheme,
                  themeMode: themeMode,
                  builder: (context, child) => ThemeTransitionViewport(
                    child: child,
                  ),
                  home: Scaffold(
                    appBar: AppBar(
                      actions: const [AnimatedThemeToggleButton()],
                    ),
                    body: Builder(
                      builder: (ctx) => Text(
                        ctx.isDarkMode ? 'DarkActive' : 'LightActive',
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        );

        await tester.pumpAndSettle();

        // Rapid double tap within 50ms should only execute one transition
        await tester.tap(find.byType(AnimatedThemeToggleButton));
        await tester.pump(const Duration(milliseconds: 50));
        await tester.tap(find.byType(AnimatedThemeToggleButton));
        await tester.pumpAndSettle();

        expect(find.text('DarkActive'), findsOneWidget);
      },
    );

    testWidgets(
      'ThemeTransitionViewport respects MediaQuery.disableAnimations (reduced motion)',
      (WidgetTester tester) async {
        SharedPreferences.setMockInitialValues({});

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              themeModeProvider.overrideWith(
                (ref) => ThemeModeNotifier(ThemeMode.light),
              ),
            ],
            child: Consumer(
              builder: (context, ref, _) {
                final themeMode = ref.watch(themeModeProvider);
                return MediaQuery(
                  data: const MediaQueryData(disableAnimations: true),
                  child: MaterialApp(
                    theme: AppTheme.lightTheme,
                    darkTheme: AppTheme.darkTheme,
                    themeMode: themeMode,
                    themeAnimationDuration: Duration.zero,
                    builder: (context, child) => ThemeTransitionViewport(
                      child: child,
                    ),
                    home: Scaffold(
                      appBar: AppBar(
                        actions: const [AnimatedThemeToggleButton()],
                      ),
                      body: Builder(
                        builder: (ctx) => Text(
                          ctx.isDarkMode ? 'DarkActive' : 'LightActive',
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        );

        await tester.pumpAndSettle();
        await tester.tap(find.byType(AnimatedThemeToggleButton));
        await tester.pump();

        expect(find.text('DarkActive'), findsOneWidget);
      },
    );
  });
}
