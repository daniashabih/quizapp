import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/constants/app_strings.dart';
import 'core/theme/app_theme.dart';
import 'providers/theme_provider.dart';
import 'routes/app_router.dart';
import 'services/ad_service.dart';
import 'widgets/hangbug_toast.dart';
import 'widgets/theme_transition_overlay.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Google Mobile Ads SDK safely
  await AdService.initialize();

  // Lock orientation to portrait for consistent quiz experience
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Restore saved theme preference prior to first frame
  final initialThemeMode = await loadSavedThemeMode();

  runApp(
    ProviderScope(
      overrides: [
        themeModeProvider.overrideWith(
          (ref) => ThemeModeNotifier(initialThemeMode),
        ),
      ],
      child: const HangbugApp(),
    ),
  );
}

class HangbugApp extends ConsumerStatefulWidget {
  const HangbugApp({super.key});

  @override
  ConsumerState<HangbugApp> createState() => _HangbugAppState();
}

class _HangbugAppState extends ConsumerState<HangbugApp> {
  final ValueNotifier<bool> _snapshotRevealActive = ValueNotifier<bool>(false);

  @override
  void dispose() {
    _snapshotRevealActive.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);
    final platformBrightness = MediaQuery.platformBrightnessOf(context);
    final disableAnimations = MediaQuery.disableAnimationsOf(context);
    final bool isDarkEffective = themeMode == ThemeMode.dark ||
        (themeMode == ThemeMode.system &&
            platformBrightness == Brightness.dark);

    final overlayStyle = isDarkEffective
        ? AppTheme.darkOverlayStyle
        : AppTheme.lightOverlayStyle;

    SystemChrome.setSystemUIOverlayStyle(overlayStyle);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: overlayStyle,
      child: ValueListenableBuilder<bool>(
        valueListenable: _snapshotRevealActive,
        builder: (context, isSnapshotActive, _) {
          return MaterialApp.router(
            title: AppStrings.appName,
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeMode,
            themeAnimationDuration: (disableAnimations || isSnapshotActive)
                ? Duration.zero
                : const Duration(milliseconds: 580),
            themeAnimationCurve: Curves.easeInOutCubic,
            routerConfig: router,
            builder: (context, child) => ThemeTransitionViewport(
              snapshotActiveNotifier: _snapshotRevealActive,
              child: HangbugNotificationViewport(child: child),
            ),
          );
        },
      ),
    );
  }
}
