import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/models/game_model.dart';
import 'package:hangbug/repositories/game_repository.dart';

void main() {
  group('Coding & Typing Games Feature Model & Repository Tests', () {
    test('1. Fallback Games Collection contains all 14 coding & typing games', () {
      final games = GameRepository.fallbackGames;
      expect(games, isNotEmpty);
      expect(games.length, equals(14));

      final slugs = games.map((g) => g.slug).toList();
      // 8 Coding Games
      expect(slugs, contains('code-puzzle'));
      expect(slugs, contains('find-the-bug'));
      expect(slugs, contains('output-predictor'));
      expect(slugs, contains('code-scramble'));
      expect(slugs, contains('missing-code'));
      expect(slugs, contains('logic-builder'));
      expect(slugs, contains('sql-challenge'));
      expect(slugs, contains('memory-match'));

      // 6 Typing Games
      expect(slugs, contains('speed-typing'));
      expect(slugs, contains('code-typing'));
      expect(slugs, contains('sixty-second-challenge'));
      expect(slugs, contains('error-free-typing'));
      expect(slugs, contains('syntax-typing'));
      expect(slugs, contains('word-rain'));
    });

    test('2. GameModel JSON serialization roundtrip with difficulty & WPM', () {
      final json = {
        'id': 'g_123',
        'slug': 'code-puzzle',
        'title': 'Code Puzzle',
        'description': 'Order code blocks logically',
        'instructions': 'Drag to reorder',
        'category': 'Coding Games',
        'difficulty': 'Intermediate',
        'badge': 'Popular',
        'cardSize': 'large',
        'rating': 4.9,
        'playsCount': 100,
        'isPublished': true,
        'isFeatured': true,
        'userHighScore': 500,
        'userBestWpm': 75.0,
        'userBestAccuracy': 98.0,
        'userTotalPlays': 5,
        'isFavorite': true,
      };

      final game = GameModel.fromJson(json);
      expect(game.id, 'g_123');
      expect(game.slug, 'code-puzzle');
      expect(game.title, 'Code Puzzle');
      expect(game.category, 'Coding Games');
      expect(game.difficulty, 'Intermediate');
      expect(game.userHighScore, 500);
      expect(game.userBestWpm, 75.0);
      expect(game.isFavorite, true);

      final out = game.toJson();
      expect(out['slug'], 'code-puzzle');
      expect(out['category'], 'Coding Games');
      expect(out['difficulty'], 'Intermediate');
      expect(out['userHighScore'], 500);
    });

    test('3. GameScoreSubmitResult parsing with WPM and accuracy', () {
      final json = {
        'success': true,
        'isNewHighScore': true,
        'highScore': 650,
        'score': 650,
        'wpm': 82.5,
        'accuracy': 99.0,
        'totalPlays': 3,
        'message': 'New personal best!',
        'isGuest': false,
      };

      final result = GameScoreSubmitResult.fromJson(json);
      expect(result.success, true);
      expect(result.isNewHighScore, true);
      expect(result.highScore, 650);
      expect(result.wpm, 82.5);
      expect(result.accuracy, 99.0);
      expect(result.totalPlays, 3);
    });

    test('4. UserGameStatsModel parsing', () {
      final json = {
        'totalPlayed': 14,
        'favorites': ['code-puzzle', 'speed-typing'],
        'highScores': {'code-puzzle': 500, 'speed-typing': 820},
      };

      final stats = UserGameStatsModel.fromJson(json);
      expect(stats.totalPlayed, 14);
      expect(stats.favorites, contains('code-puzzle'));
      expect(stats.favorites, contains('speed-typing'));
      expect(stats.highScores['code-puzzle'], 500);
      expect(stats.highScores['speed-typing'], 820);
    });
  });
}
