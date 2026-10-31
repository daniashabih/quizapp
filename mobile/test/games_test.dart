import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/models/game_model.dart';
import 'package:hangbug/repositories/game_repository.dart';

void main() {
  group('Games Feature Model & Repository Tests', () {
    test('1. Fallback Games Collection contains initial playable games', () {
      final games = GameRepository.fallbackGames;
      expect(games, isNotEmpty);
      expect(games.length, greaterThanOrEqualTo(5));

      final slugs = games.map((g) => g.slug).toList();
      expect(slugs, contains('tic-tac-toe'));
      expect(slugs, contains('2048'));
      expect(slugs, contains('snake'));
      expect(slugs, contains('memory-match'));
      expect(slugs, contains('brick-breaker'));
      expect(slugs, contains('flappy-bug'));
    });

    test('2. GameModel JSON serialization roundtrip', () {
      final json = {
        'id': 'g_123',
        'slug': 'snake',
        'title': 'Snake Classic',
        'description': 'Fun arcade snake',
        'instructions': 'Use D-pad to steer',
        'category': 'Arcade Games',
        'badge': 'Popular',
        'cardSize': 'tall',
        'rating': 4.8,
        'playsCount': 100,
        'isPublished': true,
        'isFeatured': true,
        'userHighScore': 120,
        'userTotalPlays': 5,
        'isFavorite': true,
      };

      final game = GameModel.fromJson(json);
      expect(game.id, 'g_123');
      expect(game.slug, 'snake');
      expect(game.title, 'Snake Classic');
      expect(game.userHighScore, 120);
      expect(game.isFavorite, true);

      final out = game.toJson();
      expect(out['slug'], 'snake');
      expect(out['userHighScore'], 120);
    });

    test('3. GameScoreSubmitResult parsing', () {
      final json = {
        'success': true,
        'isNewHighScore': true,
        'highScore': 500,
        'score': 500,
        'totalPlays': 3,
        'message': 'New personal best!',
        'isGuest': false,
      };

      final result = GameScoreSubmitResult.fromJson(json);
      expect(result.success, true);
      expect(result.isNewHighScore, true);
      expect(result.highScore, 500);
      expect(result.totalPlays, 3);
    });

    test('4. UserGameStatsModel parsing', () {
      final json = {
        'totalPlayed': 12,
        'favorites': ['snake', '2048'],
        'highScores': {'snake': 200, '2048': 1024},
      };

      final stats = UserGameStatsModel.fromJson(json);
      expect(stats.totalPlayed, 12);
      expect(stats.favorites, contains('snake'));
      expect(stats.favorites, contains('2048'));
      expect(stats.highScores['snake'], 200);
      expect(stats.highScores['2048'], 1024);
    });
  });
}
