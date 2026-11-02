import '../core/constants/api_endpoints.dart';
import '../core/network/api_client.dart';
import '../models/game_model.dart';

class GameRepository {
  final ApiClient _apiClient;

  GameRepository(this._apiClient);

  // Fallback initial games for offline or local preview
  static final List<GameModel> fallbackGames = [
    // --- 8 Coding Games ---
    const GameModel(
      id: 'code-puzzle',
      slug: 'code-puzzle',
      title: 'Code Puzzle',
      description: 'Arrange shuffled programming code blocks in the correct logical order to complete working snippets.',
      instructions: 'Drag or use arrows to rearrange statements in the correct logical execution flow.',
      category: 'Coding Games',
      difficulty: 'Intermediate',
      badge: 'Popular',
      cardSize: 'large',
      rating: 4.9,
      playsCount: 3840,
      isPublished: true,
      isFeatured: true,
    ),
    const GameModel(
      id: 'find-the-bug',
      slug: 'find-the-bug',
      title: 'Find the Bug',
      description: 'Spot syntax, logic, and type errors hidden in real code snippets and click the buggy line.',
      instructions: 'Inspect line by line and tap the line with the defect.',
      category: 'Coding Games',
      difficulty: 'Beginner',
      badge: 'Hot',
      cardSize: 'tall',
      rating: 4.9,
      playsCount: 4210,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'output-predictor',
      slug: 'output-predictor',
      title: 'Output Predictor',
      description: 'Trace loops, closures, scope, and operations to predict the exact terminal output before code runs.',
      instructions: 'Read code carefully and choose the correct predicted output.',
      category: 'Coding Games',
      difficulty: 'Intermediate',
      badge: 'Brain Boost',
      cardSize: 'medium',
      rating: 4.8,
      playsCount: 3120,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'code-scramble',
      slug: 'code-scramble',
      title: 'Code Scramble',
      description: 'Rearrange scrambled programming statements into the correct executable sequence.',
      instructions: 'Move scrambled lines up and down until they form a coherent algorithm.',
      category: 'Coding Games',
      difficulty: 'Intermediate',
      badge: 'Challenge',
      cardSize: 'medium',
      rating: 4.7,
      playsCount: 2650,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'missing-code',
      slug: 'missing-code',
      title: 'Missing Code',
      description: 'Fill in missing keywords, expressions, and syntax tokens to complete defective code structures.',
      instructions: 'Select the missing keyword from choices to restore the code snippet.',
      category: 'Coding Games',
      difficulty: 'Beginner',
      badge: 'Featured',
      cardSize: 'large',
      rating: 4.9,
      playsCount: 3590,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'logic-builder',
      slug: 'logic-builder',
      title: 'Logic Builder',
      description: 'Solve programmatic logic puzzles involving sequences, truth tables, loop bounds, and array transforms.',
      instructions: 'Evaluate algorithmic rules and choose the correct solution.',
      category: 'Coding Games',
      difficulty: 'Advanced',
      badge: 'Mental Gym',
      cardSize: 'medium',
      rating: 4.8,
      playsCount: 2890,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'sql-challenge',
      slug: 'sql-challenge',
      title: 'SQL Challenge',
      description: 'Write SQL queries (SELECT, WHERE, JOIN, GROUP BY) against practice schemas to retrieve target datasets.',
      instructions: 'Test queries safely against in-memory datasets. Production DB is never touched.',
      category: 'Coding Games',
      difficulty: 'Intermediate',
      badge: 'Database Pro',
      cardSize: 'medium',
      rating: 4.9,
      playsCount: 3780,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'memory-match',
      slug: 'memory-match',
      title: 'Memory Match',
      description: 'Match programming concepts and syntax with their correct definitions and code outputs.',
      instructions: 'Flip cards two at a time to find matching terms and definitions.',
      category: 'Coding Games',
      difficulty: 'Beginner',
      badge: 'Quick Mind',
      cardSize: 'medium',
      rating: 4.8,
      playsCount: 4500,
      isPublished: true,
      isFeatured: false,
    ),

    // --- 6 Typing Games ---
    const GameModel(
      id: 'speed-typing',
      slug: 'speed-typing',
      title: 'Speed Typing',
      description: 'Type developer articles, documentation, and technical passages with live WPM and accuracy tracking.',
      instructions: 'Type displayed prose to benchmark developer WPM and accuracy.',
      category: 'Typing Games',
      difficulty: 'All Levels',
      badge: 'High Speed',
      cardSize: 'large',
      rating: 4.9,
      playsCount: 5210,
      isPublished: true,
      isFeatured: true,
    ),
    const GameModel(
      id: 'code-typing',
      slug: 'code-typing',
      title: 'Code Typing',
      description: 'Practice typing authentic syntax and code snippets across JavaScript, Python, PHP, HTML, CSS, and SQL.',
      instructions: 'Type out indented code character-by-character to build syntax muscle memory.',
      category: 'Typing Games',
      difficulty: 'Intermediate',
      badge: 'Dev Stamina',
      cardSize: 'tall',
      rating: 4.9,
      playsCount: 4890,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'sixty-second-challenge',
      slug: 'sixty-second-challenge',
      title: '60-Second Challenge',
      description: 'A rapid 60-second typing sprint to type as many programming words and statements as humanly possible.',
      instructions: 'Timer starts on first keypress. Type as many keywords as you can in 60s!',
      category: 'Typing Games',
      difficulty: 'All Levels',
      badge: 'Sprint',
      cardSize: 'medium',
      rating: 4.8,
      playsCount: 4100,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'error-free-typing',
      slug: 'error-free-typing',
      title: 'Error-Free Typing',
      description: 'Perfectionist typing mode: zero mistakes allowed! Typos block progress until corrected.',
      instructions: 'Type flawlessly. Mistakes will halt progression until backspaced.',
      category: 'Typing Games',
      difficulty: 'Advanced',
      badge: 'Precision',
      cardSize: 'medium',
      rating: 4.7,
      playsCount: 3200,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'syntax-typing',
      slug: 'syntax-typing',
      title: 'Syntax Typing',
      description: 'Drill tricky programming symbols: curly braces, brackets, semicolons, arrows =>, and logical operators.',
      instructions: 'Drill special symbols: {}, [], (), ;, :, =>, &&, ||, !==.',
      category: 'Typing Games',
      difficulty: 'Intermediate',
      badge: 'Symbol Drill',
      cardSize: 'medium',
      rating: 4.8,
      playsCount: 3670,
      isPublished: true,
      isFeatured: false,
    ),
    const GameModel(
      id: 'word-rain',
      slug: 'word-rain',
      title: 'Word Rain',
      description: 'Programming keywords and identifiers fall from the sky! Type them rapidly before they hit the ground.',
      instructions: 'Type falling keywords to destroy them before reaching the danger zone!',
      category: 'Typing Games',
      difficulty: 'All Levels',
      badge: 'Arcade Rush',
      cardSize: 'large',
      rating: 4.9,
      playsCount: 6100,
      isPublished: true,
      isFeatured: false,
    ),
  ];

  static final List<Map<String, dynamic>> fallbackCodePuzzles = [
    {
      'id': 'cp_1',
      'title': 'Filter & Map Evens Squared',
      'language': 'javascript',
      'difficulty': 'Beginner',
      'description': 'Arrange blocks to filter even numbers and calculate their squares.',
      'blocks': [
        'return squared;',
        'const numbers = [1, 2, 3, 4, 5, 6];',
        'const squared = evens.map(n => n * n);',
        'const evens = numbers.filter(n => n % 2 === 0);',
      ],
      'hints': 'Variables must be initialized before they can be referenced in .filter() and .map() pipeline.',
      'explanation': 'Variables must be initialized before they can be referenced in .filter() and .map() pipeline.',
      'order': 1,
    },
    {
      'id': 'cp_2',
      'title': 'Python Fibonacci Generator',
      'language': 'python',
      'difficulty': 'Intermediate',
      'description': 'Order statements to produce a Fibonacci list of length n.',
      'blocks': [
        'return fib',
        'def get_fib(n):',
        '    for _ in range(2, n):',
        '        fib.append(fib[-1] + fib[-2])',
        '    fib = [0, 1]',
      ],
      'hints': 'The function header defines scope, seed list is created, iterative loop appends sum, then list is returned.',
      'explanation': 'The function header defines scope, seed list is created, iterative loop appends sum, then list is returned.',
      'order': 2,
    },
    {
      'id': 'cp_3',
      'title': 'SQL Top Department Salaries',
      'language': 'sql',
      'difficulty': 'Advanced',
      'description': 'Arrange clauses to aggregate average department salaries above 50k.',
      'blocks': [
        'LIMIT 5;',
        'SELECT department, AVG(salary) AS avg_sal',
        'HAVING AVG(salary) > 50000',
        'FROM employees',
        'ORDER BY avg_sal DESC',
        'GROUP BY department',
      ],
      'hints': 'SQL grammar requires SELECT, FROM, GROUP BY, HAVING, ORDER BY, and finally LIMIT.',
      'explanation': 'SQL grammar requires SELECT, FROM, GROUP BY, HAVING, ORDER BY, and finally LIMIT.',
      'order': 3,
    },
    {
      'id': 'cp_4',
      'title': 'HTML Semantic Card Structure',
      'language': 'html',
      'difficulty': 'Beginner',
      'description': 'Arrange HTML elements into a semantic card layout.',
      'blocks': [
        '  </div>',
        '  <img src="avatar.jpg" alt="Profile" />',
        '<article class="user-card">',
        '  <div class="user-info">',
        '    <h3>Alex Rivera</h3>',
        '</article>',
      ],
      'hints': 'HTML tags must open and close symmetrically, nesting the heading within the info wrapper.',
      'explanation': 'HTML tags must open and close symmetrically, nesting the heading within the info wrapper.',
      'order': 4,
    },
  ];

  /// Get published games
  Future<List<GameModel>> getGames({
    String? category,
    String? search,
    bool? featured,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null && category != 'All Games' && category != 'All') {
        queryParams['category'] = category;
      }
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      if (featured != null) {
        queryParams['featured'] = featured ? 'true' : 'false';
      }

      final response = await _apiClient.get(
        ApiEndpoints.games,
        queryParameters: queryParams,
      );

      if (response.data != null && response.data['success'] == true) {
        final List rawData = response.data['data'] ?? [];
        return rawData.map((json) => GameModel.fromJson(json)).toList();
      }
    } catch (_) {
      // Return filtered fallback data if backend is offline/unreachable
    }

    var list = fallbackGames;
    if (category != null && category != 'All Games' && category != 'All') {
      final cat = category.toLowerCase().replaceAll(' games', '');
      list = list.where((g) => g.category.toLowerCase().contains(cat)).toList();
    }
    if (search != null && search.isNotEmpty) {
      final q = search.toLowerCase();
      list = list.where((g) => g.title.toLowerCase().contains(q) || g.description.toLowerCase().contains(q)).toList();
    }
    if (featured != null) {
      list = list.where((g) => g.isFeatured == featured).toList();
    }
    return list;
  }

  /// Get single game by slug
  Future<GameModel?> getGameBySlug(String slug) async {
    try {
      final response = await _apiClient.get('${ApiEndpoints.games}/$slug');
      if (response.data != null && response.data['success'] == true) {
        return GameModel.fromJson(response.data['data']);
      }
    } catch (_) {}

    try {
      return fallbackGames.firstWhere((g) => g.slug == slug);
    } catch (_) {
      return null;
    }
  }

  /// Submit game score
  Future<GameScoreSubmitResult> submitScore(
    String slug,
    int score, {
    double wpm = 0,
    double accuracy = 100,
    int durationSeconds = 0,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.gameScore(slug),
        data: {
          'score': score,
          'wpm': wpm,
          'accuracy': accuracy,
          'durationSeconds': durationSeconds,
          'metadata': metadata ?? {},
        },
      );
      if (response.data != null && response.data['success'] == true) {
        return GameScoreSubmitResult.fromJson(response.data);
      }
    } catch (_) {}

    return GameScoreSubmitResult(
      success: true,
      isNewHighScore: true,
      highScore: score,
      score: score,
      wpm: wpm,
      accuracy: accuracy,
      totalPlays: 1,
      message: 'Score saved locally!',
    );
  }

  /// Toggle favorite
  Future<bool> toggleFavorite(String slug) async {
    try {
      final response = await _apiClient.post(ApiEndpoints.gameFavorite(slug));
      if (response.data != null && response.data['success'] == true) {
        return response.data['isFavorite'] == true;
      }
    } catch (_) {}
    return false;
  }

  /// Get user game stats
  Future<UserGameStatsModel?> getUserStats() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.gamesUserStats);
      if (response.data != null && response.data['success'] == true) {
        return UserGameStatsModel.fromJson(response.data['data'] ?? {});
      }
    } catch (_) {}
    return null;
  }

  /// Admin: Get all games
  Future<List<GameModel>> adminGetGames() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.adminGames);
      if (response.data != null && response.data['success'] == true) {
        final List rawData = response.data['data'] ?? [];
        return rawData.map((json) => GameModel.fromJson(json)).toList();
      }
    } catch (_) {}
    return fallbackGames;
  }

  /// Admin: Toggle featured status
  Future<bool> adminToggleFeature(String id) async {
    try {
      final response = await _apiClient.patch(ApiEndpoints.adminGameToggleFeature(id));
      return response.data?['success'] == true;
    } catch (_) {}
    return false;
  }

  /// Admin: Toggle published status
  Future<bool> adminTogglePublish(String id) async {
    try {
      final response = await _apiClient.patch(ApiEndpoints.adminGameTogglePublish(id));
      return response.data?['success'] == true;
    } catch (_) {}
    return false;
  }

  /// Get challenges for a game
  Future<List<Map<String, dynamic>>> getChallenges(String slug) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.gameChallenges(slug));
      if (response.data != null && response.data['success'] == true) {
        final List raw = response.data['data'] ?? [];
        return raw.map((item) => Map<String, dynamic>.from(item)).toList();
      }
    } catch (_) {}

    if (slug == 'code-puzzle') {
      return fallbackCodePuzzles;
    }
    return [];
  }

  /// Verify challenge submission on backend
  Future<Map<String, dynamic>> verifyChallenge(
    String slug,
    String challengeId,
    dynamic submission,
  ) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.gameVerify(slug),
        data: {
          'challengeId': challengeId,
          'submission': submission,
        },
      );
      if (response.data != null && response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data);
      }
    } catch (_) {}

    // Offline / fallback verification
    if (slug == 'code-puzzle') {
      final solutions = {
        'cp_1': [
          'const numbers = [1, 2, 3, 4, 5, 6];',
          'const evens = numbers.filter(n => n % 2 === 0);',
          'const squared = evens.map(n => n * n);',
          'return squared;',
        ],
        'cp_2': [
          'def get_fib(n):',
          '    fib = [0, 1]',
          '    for _ in range(2, n):',
          '        fib.append(fib[-1] + fib[-2])',
          '    return fib',
        ],
        'cp_3': [
          'SELECT department, AVG(salary) AS avg_sal',
          'FROM employees',
          'GROUP BY department',
          'HAVING AVG(salary) > 50000',
          'ORDER BY avg_sal DESC',
          'LIMIT 5;',
        ],
        'cp_4': [
          '<article class="user-card">',
          '  <img src="avatar.jpg" alt="Profile" />',
          '  <div class="user-info">',
          '    <h3>Alex Rivera</h3>',
          '  </div>',
          '</article>',
        ],
      };

      final expected = solutions[challengeId];
      if (expected != null && submission is List) {
        bool matches = expected.length == submission.length;
        if (matches) {
          for (int i = 0; i < expected.length; i++) {
            if (expected[i].toString().trim() != submission[i].toString().trim()) {
              matches = false;
              break;
            }
          }
        }
        return {
          'success': true,
          'isCorrect': matches,
          'points': matches ? 200 : 0,
          'solution': matches ? null : expected,
        };
      }
    }

    return {
      'success': false,
      'isCorrect': false,
      'points': 0,
    };
  }

  /// Get active game progress for session resumption
  Future<Map<String, dynamic>?> getProgress(String slug) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.gameProgress(slug));
      if (response.data != null && response.data['success'] == true && response.data['data'] != null) {
        return Map<String, dynamic>.from(response.data['data']);
      }
    } catch (_) {}
    return null;
  }

  /// Save active game progress
  Future<bool> saveProgress(String slug, Map<String, dynamic> progress) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.gameProgress(slug),
        data: progress,
      );
      return response.data?['success'] == true;
    } catch (_) {}
    return false;
  }

  /// Clear active game progress upon completion or restart
  Future<bool> clearProgress(String slug) async {
    try {
      final response = await _apiClient.dio.delete(ApiEndpoints.gameProgress(slug));
      return response.data?['success'] == true;
    } catch (_) {}
    return false;
  }
}
