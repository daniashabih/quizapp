import '../models/certificate_model.dart';
import '../models/dashboard_model.dart';
import '../services/dashboard_service.dart';

class DashboardRepository {
  final DashboardService dashboardService;

  DashboardRepository({required this.dashboardService});

  Future<UserDashboardModel> getUserDashboard() async {
    return await dashboardService.getUserDashboard();
  }

  Future<List<LeaderboardEntryModel>> getLeaderboard({
    String timeframe = 'all-time',
    String category = 'All',
  }) async {
    return await dashboardService.getLeaderboard(
      timeframe: timeframe,
      category: category,
    );
  }

  Future<List<CertificateModel>> getCertificates() async {
    return await dashboardService.getCertificates();
  }
}
