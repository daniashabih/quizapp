import '../core/constants/api_endpoints.dart';
import '../core/network/api_client.dart';
import '../models/game_model.dart';

class GameRepository {
  final ApiClient _apiClient;

  GameRepository(this._apiClient);

  // Fallback initial games for offline or local preview
  static final List<GameModel> fallbackGames = [
    const GameModel(
      id: '2048',
      slug: '2048',
      title: '2048',
      description: 'Join identical numbered tiles and reach the legendary 2048 tile in this addictive sliding puzzle.',
      instructions: 'Swipe in any direction to slide tiles. Identical numbers merge when they collide. Reach 2048 to win!',
      category: 'Puzzle Games',
      badge: 'Hot',
      cardSize: 'large',
      rating: 4.9,
      playsCount: 1420,
      isPublished: true,
      isFeatured: true,
    ),
    const GameModel(
      id: 'snake',
      slug: 'snake',
      title: 'Snake Classic',
      description: 'Guide the retro pixel snake to munch delicious apples, grow longer, and dodge dangerous wall collisions.',
      instructions: 'Use the D-pad or swipe gestures to steer the snake. Gobble apples for +10 points. Don\'t bite yourself or walls!',
      category: 'Arcade Games',
      badge: 'Popular',
      cardSize: 'tall',
      rating: 4.8,
      playsCount: 2150,
      isPublished: true,
      isFeatured: true,
    ),
    const GameModel(
      id: 'brick-breaker',
      slug: 'brick-breaker',
      title: 'Brick Breaker',
      description: 'Smash through vibrant brick matrices with bouncing balls, dynamic paddle rebounds, and power reflexes.',
      instructions: 'Drag your finger to move the paddle. Bounce the ball to shatter all bricks before losing your 3 lives!',
      category: 'Arcade Games',
      badge: 'Featured',
      cardSize: 'large',
      rating: 4.9,
      playsCount: 1890,
      isPublished: true,
      isFeatured: true,
    ),
    const GameModel(
      id: 'tic-tac-toe',
      slug: 'tic-tac-toe',
      title: 'Tic Tac Toe',
      description: 'The timeless strategy game with Single Player (Easy, Medium, Unbeatable Minimax AI) and 2-Player modes.',
      instructions: 'Take turns placing X or O on the 3x3 grid. Line up 3 in a row to win against smart AI or a friend!',
      category: 'Puzzle Games',
      badge: 'Classic',
      cardSize: 'medium',
      rating: 4.7,
      playsCount: 3100,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'memory-match',
      slug: 'memory-match',
      title: 'Memory Match',
      description: 'Test and sharpen your visual recall by matching pairs of colorful arcade and tech cards.',
      instructions: 'Flip cards two at a time to find identical pairs. Clear the board in the fewest moves!',
      category: 'Brain Games',
      badge: 'Brain Boost',
      cardSize: 'medium',
      rating: 4.8,
      playsCount: 1650,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'flappy-bug',
      slug: 'flappy-bug',
      title: 'Flappy Bug',
      description: 'Help the cute Hangbug mascot flap gracefully through perilous green obstacle pipes.',
      instructions: 'Tap anywhere to flap Hangbug upward. Time your flaps to fly between pipe gaps without crashing!',
      category: 'Arcade Games',
      badge: 'New',
      cardSize: 'medium',
      rating: 4.6,
      playsCount: 980,
      isPublished: true,
      isFeatured: false,
    ),
  ];

  /// Get published games
  Future<List<GameModel>> getGames({
    String? category,
    String? search,
    bool? featured,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null && category.isNotEmpty && category != 'All Games') {
        queryParams['category'] = category;
      }
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      if (featured != null) {
        queryParams['featured'] = featured.toString();
      }

      final response = await _apiClient.get(
        ApiEndpoints.games,
        queryParameters: queryParams,
      );

      final data = response.data;
      if (data != null && data['data'] is List) {
        return (data['data'] as List)
            .map((item) => GameModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return fallbackGames;
    } catch (_) {
      // Offline fallback
      var list = List<GameModel>.from(fallbackGames);
      if (category != null && category.isNotEmpty && category != 'All Games') {
        list = list.where((g) => g.category.toLowerCase().contains(category.toLowerCase().replaceAll(' games', ''))).toList();
      }
      if (search != null && search.isNotEmpty) {
        final q = search.toLowerCase();
        list = list.where((g) => g.title.toLowerCase().contains(q) || g.category.toLowerCase().contains(q)).toList();
      }
      return list;
    }
  }

  /// Get single game by slug
  Future<GameModel?> getGameBySlug(String slug) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.gameBySlug(slug));
      final data = response.data;
      if (data != null && data['data'] is Map<String, dynamic>) {
        return GameModel.fromJson(data['data'] as Map<String, dynamic>);
      }
    } catch (_) {}

    // Fallback search
    try {
      return fallbackGames.firstWhere((g) => g.slug == slug);
    } catch (_) {
      return null;
    }
  }

  /// Submit score
  Future<GameScoreSubmitResult> submitScore(
    String slug,
    int score, {
    int durationSeconds = 0,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.gameScore(slug),
        data: {
          'score': score,
          'durationSeconds': durationSeconds,
          'metadata': metadata ?? {},
        },
      );
      if (response.data is Map<String, dynamic>) {
        return GameScoreSubmitResult.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}

    return GameScoreSubmitResult(
      success: true,
      isNewHighScore: false,
      highScore: score,
      score: score,
      totalPlays: 1,
      message: 'Score saved locally.',
      isGuest: true,
    );
  }

  /// Toggle favorite
  Future<bool> toggleFavorite(String slug) async {
    try {
      final response = await _apiClient.post(ApiEndpoints.gameFavorite(slug));
      return response.data?['isFavorite'] == true;
    } catch (_) {
      return false;
    }
  }

  /// Get user stats
  Future<UserGameStatsModel?> getUserStats() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.gamesUserStats);
      if (response.data?['data'] is Map<String, dynamic>) {
        return UserGameStatsModel.fromJson(response.data['data'] as Map<String, dynamic>);
      }
    } catch (_) {}
    return null;
  }

  // Admin Methods
  Future<List<GameModel>> adminGetGames() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.adminGames);
      final data = response.data;
      if (data != null && data['data'] is List) {
        return (data['data'] as List)
            .map((item) => GameModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {}
    return fallbackGames;
  }

  Future<bool> adminTogglePublish(String id) async {
    try {
      final response = await _apiClient.patch(ApiEndpoints.adminGameTogglePublish(id));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<bool> adminToggleFeature(String id) async {
    try {
      final response = await _apiClient.patch(ApiEndpoints.adminGameToggleFeature(id));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
