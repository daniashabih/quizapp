import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/app_settings_model.dart';
import 'core_providers.dart';

class SettingsNotifier extends StateNotifier<AppSettingsModel> {
  final Ref ref;

  SettingsNotifier(this.ref) : super(const AppSettingsModel()) {
    fetchSettings();
  }

  Future<void> fetchSettings() async {
    try {
      final service = ref.read(settingsServiceProvider);
      final newSettings = await service.getSettings();
      state = newSettings;
    } catch (_) {
      // Keep current state on error
    }
  }

  Future<void> refreshSettings() => fetchSettings();

  Future<bool> updateSettings(Map<String, dynamic> payload) async {
    try {
      final service = ref.read(settingsServiceProvider);
      final updated = await service.updateSettings(payload);
      state = updated;
      return true;
    } catch (_) {
      return false;
    }
  }
}

final settingsProvider =
    StateNotifierProvider<SettingsNotifier, AppSettingsModel>((ref) {
  return SettingsNotifier(ref);
});
