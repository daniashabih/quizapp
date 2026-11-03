import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/category_model.dart';
import '../models/certificate_model.dart';
import '../models/dashboard_model.dart';
import 'core_providers.dart';

// User Dashboard Data Provider
final userDashboardProvider =
    FutureProvider.autoDispose<UserDashboardModel>((ref) async {
  final repository = ref.watch(dashboardRepositoryProvider);
  return await repository.getUserDashboard();
});

// Categories / Technologies Provider
final categoriesProvider =
    FutureProvider.autoDispose<List<CategoryModel>>((ref) async {
  final repository = ref.watch(quizRepositoryProvider);
  return await repository.getCategories();
});

// Certificates Provider
final certificatesProvider =
    FutureProvider.autoDispose<List<CertificateModel>>((ref) async {
  final repository = ref.watch(dashboardRepositoryProvider);
  return await repository.getCertificates();
});

// Top 5 Global Leaderboard Provider (Quick View)
final top5LeaderboardProvider =
    FutureProvider.autoDispose<List<LeaderboardEntryModel>>((ref) async {
  final repository = ref.watch(dashboardRepositoryProvider);
  final list = await repository.getLeaderboard(
    timeframe: 'all-time',
    category: 'All',
  );
  return list.take(5).toList();
});

// Full/Filtered Leaderboard Provider
class LeaderboardFilter {
  final String timeframe;
  final String category;
  final int? limit;
  final int? page;

  const LeaderboardFilter({
    this.timeframe = 'all-time',
    this.category = 'All',
    this.limit,
    this.page,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is LeaderboardFilter &&
          runtimeType == other.runtimeType &&
          timeframe == other.timeframe &&
          category == other.category &&
          limit == other.limit &&
          page == other.page;

  @override
  int get hashCode =>
      timeframe.hashCode ^ category.hashCode ^ limit.hashCode ^ page.hashCode;
}

final leaderboardProvider = FutureProvider.autoDispose
    .family<List<LeaderboardEntryModel>, LeaderboardFilter>(
  (ref, filter) async {
    final repository = ref.watch(dashboardRepositoryProvider);
    return await repository.getLeaderboard(
      timeframe: filter.timeframe,
      category: filter.category,
      limit: filter.limit,
      page: filter.page,
    );
  },
);
