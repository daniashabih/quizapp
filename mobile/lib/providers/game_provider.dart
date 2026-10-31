import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/game_model.dart';
import '../repositories/game_repository.dart';
import 'core_providers.dart';

final gameRepositoryProvider = Provider<GameRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return GameRepository(client);
});

final selectedGameCategoryProvider = StateProvider<String>((ref) => 'All Games');
final gameSearchQueryProvider = StateProvider<String>((ref) => '');

final gamesListProvider = FutureProvider<List<GameModel>>((ref) async {
  final repo = ref.watch(gameRepositoryProvider);
  final category = ref.watch(selectedGameCategoryProvider);
  final search = ref.watch(gameSearchQueryProvider);

  return repo.getGames(
    category: category,
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
