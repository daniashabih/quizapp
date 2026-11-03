import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/game_model.dart';
import '../repositories/game_repository.dart';
import 'core_providers.dart';

final gameRepositoryProvider = Provider<GameRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return GameRepository(client);
});

final selectedGameCategoryProvider = StateProvider<String>((ref) => 'All Games');
final selectedGameTechnologyProvider = StateProvider<String>((ref) => 'all');
final selectedGameDifficultyProvider = StateProvider<String>((ref) => 'All Levels');
final gameSearchQueryProvider = StateProvider<String>((ref) => '');

final gameCategoriesProvider = FutureProvider<List<TechnologyCategoryModel>>((ref) async {
  final repo = ref.watch(gameRepositoryProvider);
  return repo.getGameCategories();
});

final gameTechnologiesProvider = FutureProvider<List<TechnologyModel>>((ref) async {
  final repo = ref.watch(gameRepositoryProvider);
  return repo.getGameTechnologies();
});

final gamesListProvider = FutureProvider<List<GameModel>>((ref) async {
  final repo = ref.watch(gameRepositoryProvider);
  final category = ref.watch(selectedGameCategoryProvider);
  final technology = ref.watch(selectedGameTechnologyProvider);
  final search = ref.watch(gameSearchQueryProvider);

  return repo.getGames(
    category: category,
    technology: technology != 'all' ? technology : null,
    search: search,
  );
});

final gameDetailProvider = FutureProvider.family<GameModel?, String>((ref, slug) async {
  final repo = ref.watch(gameRepositoryProvider);
  return repo.getGameBySlug(slug);
});

final userGameStatsProvider = FutureProvider<UserGameStatsModel?>((ref) async {
  final repo = ref.watch(gameRepositoryProvider);
  return repo.getUserStats();
});

final adminGamesProvider = FutureProvider<List<GameModel>>((ref) async {
  final repo = ref.watch(gameRepositoryProvider);
  return repo.adminGetGames();
});

final adminGameStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final repo = ref.watch(gameRepositoryProvider);
  return repo.adminGetGameStats();
});
