import '../core/constants/api_endpoints.dart';
import '../core/network/api_client.dart';
import '../models/certificate_model.dart';
import '../models/dashboard_model.dart';

class DashboardService {
  final ApiClient apiClient;

  DashboardService({required this.apiClient});

  // Fetch full user dashboard
  Future<UserDashboardModel> getUserDashboard() async {
    final response = await apiClient.get(ApiEndpoints.userDashboard);
    final data = response.data as Map<String, dynamic>;
    final payload = data['data'] as Map<String, dynamic>? ?? data;
    return UserDashboardModel.fromJson(payload);
  }

  // Fetch global leaderboard rankings
  Future<List<LeaderboardEntryModel>> getLeaderboard({
    String timeframe = 'all-time',
    String category = 'All',
  }) async {
    final response = await apiClient.get(
      ApiEndpoints.leaderboard,
      queryParameters: {
        'timeframe': timeframe,
        'category': category,
      },
    );
    final data = response.data as Map<String, dynamic>;
    final list = data['leaderboard'] as List? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(LeaderboardEntryModel.fromJson)
        .where((entry) => entry.quizzes > 0)
        .toList();
  }

  // Fetch earned certificates
  Future<List<CertificateModel>> getCertificates() async {
    final response = await apiClient.get(ApiEndpoints.certificates);
    final data = response.data as Map<String, dynamic>;
    final list = data['certificates'] as List? ?? [];
    return list
        .map((c) => CertificateModel.fromJson(c as Map<String, dynamic>))
        .toList();
  }
}
