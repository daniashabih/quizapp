import '../core/constants/api_endpoints.dart';
import '../core/network/api_client.dart';
import '../models/app_settings_model.dart';

class SettingsService {
  final ApiClient apiClient;

  SettingsService({required this.apiClient});

  Future<AppSettingsModel> getSettings() async {
    try {
      final response = await apiClient.get(ApiEndpoints.settings);
      final data = response.data;
      if (data is Map<String, dynamic>) {
        final payload = data['data'] is Map<String, dynamic>
            ? data['data'] as Map<String, dynamic>
            : (data['settings'] is Map<String, dynamic>
                ? data['settings'] as Map<String, dynamic>
                : data);
        return AppSettingsModel.fromJson(payload);
      }
      return const AppSettingsModel();
    } catch (_) {
      return const AppSettingsModel();
    }
  }

  Future<AppSettingsModel> updateSettings(Map<String, dynamic> newSettings) async {
    final response = await apiClient.put(
      ApiEndpoints.settings,
      data: newSettings,
    );
    final data = response.data;
    if (data is Map<String, dynamic>) {
      final payload = data['data'] is Map<String, dynamic>
          ? data['data'] as Map<String, dynamic>
          : (data['settings'] is Map<String, dynamic>
              ? data['settings'] as Map<String, dynamic>
              : data);
      return AppSettingsModel.fromJson(payload);
    }
    return const AppSettingsModel();
  }
}
