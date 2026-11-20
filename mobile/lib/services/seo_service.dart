import 'package:dio/dio.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/api_client.dart';
import '../models/seo_dashboard_model.dart';

class SeoService {
  final ApiClient apiClient;

  SeoService({required this.apiClient});

  Future<SeoDashboardPayload> getDashboard({
    String domain = 'www.hangbug.com',
    String range = '28d',
    String? startDate,
    String? endDate,
  }) async {
    final params = <String, dynamic>{
      'domain': domain,
      'range': range,
    };
    if (range == 'custom' &&
        startDate != null &&
        startDate.isNotEmpty &&
        endDate != null &&
        endDate.isNotEmpty) {
      params['startDate'] = startDate;
      params['endDate'] = endDate;
    }

    final response = await apiClient.get(
      ApiEndpoints.adminSeoDashboard,
      queryParameters: params,
      options: Options(receiveTimeout: const Duration(seconds: 30)),
    );
    return SeoDashboardPayload.fromJson(response.data as Map<String, dynamic>);
  }

  Future<String> runAudit({
    String domain = 'www.hangbug.com',
    bool useLiveHttp = true,
  }) async {
    final response = await apiClient.post(
      ApiEndpoints.adminSeoAuditRun,
      data: {'domain': domain, 'useLiveHttp': useLiveHttp},
      options: Options(receiveTimeout: const Duration(seconds: 60)),
    );
    final data = response.data as Map<String, dynamic>;
    return data['message']?.toString() ?? 'SEO audit completed.';
  }

  Future<String> runPageSpeed({
    String domain = 'www.hangbug.com',
    String url = '/',
    String strategy = 'mobile',
  }) async {
    final response = await apiClient.post(
      ApiEndpoints.adminSeoPageSpeedRun,
      data: {'domain': domain, 'url': url, 'strategy': strategy},
      options: Options(receiveTimeout: const Duration(seconds: 45)),
    );
    final data = response.data as Map<String, dynamic>;
    return data['message']?.toString() ?? 'PageSpeed check completed.';
  }

  Future<Map<String, dynamic>> inspectUrl({
    String domain = 'www.hangbug.com',
    required String url,
  }) async {
    final response = await apiClient.post(
      ApiEndpoints.adminSeoInspectUrl,
      data: {'domain': domain, 'url': url},
      options: Options(receiveTimeout: const Duration(seconds: 25)),
    );
    final data = response.data as Map<String, dynamic>;
    return data['inspection'] as Map<String, dynamic>? ?? {};
  }

  Future<String> toggleRecommendation({
    required String recKey,
    String domain = 'www.hangbug.com',
    required bool isCompleted,
    required String title,
    required String priority,
  }) async {
    final response = await apiClient.patch(
      ApiEndpoints.adminSeoRecommendationToggle(recKey),
      data: {
        'domain': domain,
        'isCompleted': isCompleted,
        'title': title,
        'priority': priority,
      },
    );
    final data = response.data as Map<String, dynamic>;
    return data['message']?.toString() ?? 'Updated recommendation.';
  }

  Future<String> addCompetitor({
    String domain = 'www.hangbug.com',
    required String competitorDomain,
    String label = '',
  }) async {
    final response = await apiClient.post(
      ApiEndpoints.adminSeoCompetitors,
      data: {
        'domain': domain,
        'competitorDomain': competitorDomain,
        'label': label,
      },
      options: Options(receiveTimeout: const Duration(seconds: 25)),
    );
    final data = response.data as Map<String, dynamic>;
    return data['message']?.toString() ?? 'Competitor analyzed.';
  }

  Future<String> refreshCompetitor(
    String id, {
    String domain = 'www.hangbug.com',
  }) async {
    final response = await apiClient.post(
      ApiEndpoints.adminSeoCompetitorRefresh(id),
      data: {'domain': domain},
      options: Options(receiveTimeout: const Duration(seconds: 25)),
    );
    final data = response.data as Map<String, dynamic>;
    return data['message']?.toString() ?? 'Competitor refreshed.';
  }

  Future<void> deleteCompetitor(
    String id, {
    String domain = 'www.hangbug.com',
  }) async {
    await apiClient.delete(
      ApiEndpoints.adminSeoCompetitorDelete(id),
      queryParameters: {'domain': domain},
    );
  }

  Future<Map<String, dynamic>> getSettings({
    String domain = 'www.hangbug.com',
  }) async {
    final response = await apiClient.get(
      ApiEndpoints.adminSeoSettings,
      queryParameters: {'domain': domain},
    );
    final data = response.data as Map<String, dynamic>;
    return data['settings'] as Map<String, dynamic>? ?? {};
  }

  Future<String> updateSettings(
    String domain,
    Map<String, dynamic> payload,
  ) async {
    final response = await apiClient.put(
      ApiEndpoints.adminSeoSettings,
      data: {'domain': domain, ...payload},
    );
    final data = response.data as Map<String, dynamic>;
    return data['message']?.toString() ?? 'SEO settings saved.';
  }

  Future<Map<String, dynamic>> testIntegration(
    String domain,
    String target,
  ) async {
    final response = await apiClient.post(
      ApiEndpoints.adminSeoTestIntegration,
      data: {'domain': domain, 'target': target},
      options: Options(receiveTimeout: const Duration(seconds: 30)),
    );
    final data = response.data as Map<String, dynamic>;
    return data['result'] as Map<String, dynamic>? ?? {};
  }

  Future<String> importBacklinks(
    String domain,
    List<Map<String, dynamic>> items,
  ) async {
    final response = await apiClient.post(
      ApiEndpoints.adminSeoImportBacklinks,
      data: {'domain': domain, 'items': items},
    );
    final data = response.data as Map<String, dynamic>;
    return data['message']?.toString() ?? 'Backlinks imported.';
  }
}
