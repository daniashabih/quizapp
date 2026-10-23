import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const String kThemeModeStorageKey = 'hangbug_theme_mode';

ThemeMode parseThemeMode(String? rawValue) {
  switch (rawValue) {
    case 'light':
      return ThemeMode.light;
    case 'dark':
      return ThemeMode.dark;
    case 'system':
    default:
      return ThemeMode.system;
  }
}

String serializeThemeMode(ThemeMode mode) {
  switch (mode) {
    case ThemeMode.light:
      return 'light';
    case ThemeMode.dark:
      return 'dark';
    case ThemeMode.system:
      return 'system';
  }
}

/// Safely loads the saved theme preference before app startup.
/// Falls back to [ThemeMode.system] if no preference exists or if local storage fails.
Future<ThemeMode> loadSavedThemeMode() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(kThemeModeStorageKey);
    return parseThemeMode(saved);
  } catch (_) {
    return ThemeMode.system;
  }
}

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier([super.initialMode = ThemeMode.system]) {
    _syncFromStorage();
  }

  Future<void> _syncFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(kThemeModeStorageKey);
      if (saved != null && mounted) {
        final parsed = parseThemeMode(saved);
        if (state != parsed) {
          state = parsed;
        }
      }
    } catch (_) {
      // Gracefully ignore storage errors and keep in-memory state
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    if (state == mode) return;
    state = mode;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(kThemeModeStorageKey, serializeThemeMode(mode));
    } catch (_) {
      // Gracefully keep the selected mode in memory if persistence fails
    }
  }

  Future<void> toggleTheme(Brightness platformBrightness) async {
    final bool currentlyDark = state == ThemeMode.dark ||
        (state == ThemeMode.system && platformBrightness == Brightness.dark);
    await setThemeMode(currentlyDark ? ThemeMode.light : ThemeMode.dark);
  }
}

final themeModeProvider =
    StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier();
});
