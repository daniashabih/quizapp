class GameModel {
  final String id;
  final String slug;
  final String title;
  final String description;
  final String instructions;
  final String category;
  final String difficulty;
  final String thumbnail;
  final String badge;
  final String cardSize;
  final double rating;
  final int playsCount;
  final bool isPublished;
  final bool isFeatured;
  final int userHighScore;
  final double userBestWpm;
  final double userBestAccuracy;
  final int userTotalPlays;
  final bool isFavorite;
  final List<String> supportedTechnologies;

  const GameModel({
    required this.id,
    required this.slug,
    required this.title,
    required this.description,
    this.instructions = '',
    required this.category,
    this.difficulty = 'All Levels',
    this.thumbnail = 'gradient-indigo',
    this.badge = '',
    this.cardSize = 'medium',
    this.rating = 4.8,
    this.playsCount = 0,
    this.isPublished = true,
    this.isFeatured = false,
    this.userHighScore = 0,
    this.userBestWpm = 0,
    this.userBestAccuracy = 100,
    this.userTotalPlays = 0,
    this.isFavorite = false,
    this.supportedTechnologies = const [],
  });

  factory GameModel.fromJson(Map<String, dynamic> json) {
    List<String> techs = [];
    if (json['supportedTechnologies'] is List) {
      techs = (json['supportedTechnologies'] as List).map((e) => e.toString()).toList();
    }

    return GameModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? json['slug']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      instructions: json['instructions']?.toString() ?? '',
      category: json['category']?.toString() ?? 'Coding Games',
      difficulty: json['difficulty']?.toString() ?? 'All Levels',
      thumbnail: json['thumbnail']?.toString() ?? 'gradient-indigo',
      badge: json['badge']?.toString() ?? '',
      cardSize: json['cardSize']?.toString() ?? json['card_size']?.toString() ?? 'medium',
      rating: (json['rating'] is num) ? (json['rating'] as num).toDouble() : 4.8,
      playsCount: (json['playsCount'] is num)
          ? (json['playsCount'] as num).toInt()
          : (json['plays_count'] is num ? (json['plays_count'] as num).toInt() : 0),
      isPublished: json['isPublished'] ?? json['is_published'] ?? true,
      isFeatured: json['isFeatured'] ?? json['is_featured'] ?? false,
      userHighScore: (json['userHighScore'] is num)
          ? (json['userHighScore'] as num).toInt()
          : (json['highScore'] is num ? (json['highScore'] as num).toInt() : 0),
      userBestWpm: (json['userBestWpm'] is num)
          ? (json['userBestWpm'] as num).toDouble()
          : (json['bestWpm'] is num ? (json['bestWpm'] as num).toDouble() : 0),
      userBestAccuracy: (json['userBestAccuracy'] is num)
          ? (json['userBestAccuracy'] as num).toDouble()
          : (json['bestAccuracy'] is num ? (json['bestAccuracy'] as num).toDouble() : 100),
      userTotalPlays: (json['userTotalPlays'] is num)
          ? (json['userTotalPlays'] as num).toInt()
          : (json['totalPlays'] is num ? (json['totalPlays'] as num).toInt() : 0),
      isFavorite: json['isFavorite'] == true,
      supportedTechnologies: techs,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'slug': slug,
      'title': title,
      'description': description,
      'instructions': instructions,
      'category': category,
      'difficulty': difficulty,
      'thumbnail': thumbnail,
      'badge': badge,
      'cardSize': cardSize,
      'rating': rating,
      'playsCount': playsCount,
      'isPublished': isPublished,
      'isFeatured': isFeatured,
      'userHighScore': userHighScore,
      'userBestWpm': userBestWpm,
      'userBestAccuracy': userBestAccuracy,
      'userTotalPlays': userTotalPlays,
      'isFavorite': isFavorite,
      'supportedTechnologies': supportedTechnologies,
    };
  }

  GameModel copyWith({
    String? title,
    String? description,
    String? instructions,
    String? category,
    String? difficulty,
    String? thumbnail,
    String? badge,
    String? cardSize,
    double? rating,
    int? playsCount,
    bool? isPublished,
    bool? isFeatured,
    int? userHighScore,
    double? userBestWpm,
    double? userBestAccuracy,
    int? userTotalPlays,
    bool? isFavorite,
    List<String>? supportedTechnologies,
  }) {
    return GameModel(
      id: id,
      slug: slug,
      title: title ?? this.title,
      description: description ?? this.description,
      instructions: instructions ?? this.instructions,
      category: category ?? this.category,
      difficulty: difficulty ?? this.difficulty,
      thumbnail: thumbnail ?? this.thumbnail,
      badge: badge ?? this.badge,
      cardSize: cardSize ?? this.cardSize,
      rating: rating ?? this.rating,
      playsCount: playsCount ?? this.playsCount,
      isPublished: isPublished ?? this.isPublished,
      isFeatured: isFeatured ?? this.isFeatured,
      userHighScore: userHighScore ?? this.userHighScore,
      userBestWpm: userBestWpm ?? this.userBestWpm,
      userBestAccuracy: userBestAccuracy ?? this.userBestAccuracy,
      userTotalPlays: userTotalPlays ?? this.userTotalPlays,
      isFavorite: isFavorite ?? this.isFavorite,
      supportedTechnologies: supportedTechnologies ?? this.supportedTechnologies,
    );
  }
}

class TechnologyCategoryModel {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String icon;
  final bool isEnabled;
  final int order;

  const TechnologyCategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description = '',
    this.icon = 'Layout',
    this.isEnabled = true,
    this.order = 1,
  });

  factory TechnologyCategoryModel.fromJson(Map<String, dynamic> json) {
    return TechnologyCategoryModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? json['slug']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      icon: json['icon']?.toString() ?? 'Layout',
      isEnabled: json['isEnabled'] ?? json['is_enabled'] ?? true,
      order: (json['order'] is num) ? (json['order'] as num).toInt() : 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'icon': icon,
      'isEnabled': isEnabled,
      'order': order,
    };
  }
}

class TechnologyModel {
  final String id;
  final String categorySlug;
  final String name;
  final String slug;
  final String description;
  final String color;
  final String icon;
  final String badge;
  final List<String> supportedGames;
  final bool isEnabled;
  final int order;
  final int? userHighScore;
  final int? userTotalPlays;

  const TechnologyModel({
    required this.id,
    required this.categorySlug,
    required this.name,
    required this.slug,
    this.description = '',
    this.color = '#10B981',
    this.icon = 'code',
    this.badge = '',
    this.supportedGames = const [],
    this.isEnabled = true,
    this.order = 1,
    this.userHighScore,
    this.userTotalPlays,
  });

  factory TechnologyModel.fromJson(Map<String, dynamic> json) {
    List<String> games = [];
    if (json['supportedGames'] is List) {
      games = (json['supportedGames'] as List).map((e) => e.toString()).toList();
    }

    return TechnologyModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? json['slug']?.toString() ?? '',
      categorySlug: json['categorySlug']?.toString() ?? json['category_slug']?.toString() ?? 'frontend-development',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      color: json['color']?.toString() ?? '#10B981',
      icon: json['icon']?.toString() ?? 'code',
      badge: json['badge']?.toString() ?? '',
      supportedGames: games,
      isEnabled: json['isEnabled'] ?? json['is_enabled'] ?? true,
      order: (json['order'] is num) ? (json['order'] as num).toInt() : 1,
      userHighScore: (json['userHighScore'] is num) ? (json['userHighScore'] as num).toInt() : null,
      userTotalPlays: (json['userTotalPlays'] is num) ? (json['userTotalPlays'] as num).toInt() : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'categorySlug': categorySlug,
      'name': name,
      'slug': slug,
      'description': description,
      'color': color,
      'icon': icon,
      'badge': badge,
      'supportedGames': supportedGames,
      'isEnabled': isEnabled,
      'order': order,
      'userHighScore': userHighScore,
      'userTotalPlays': userTotalPlays,
    };
  }
}

class GameScoreSubmitResult {
  final bool success;
  final bool isNewHighScore;
  final int highScore;
  final int score;
  final double wpm;
  final double accuracy;
  final int totalPlays;
  final String message;
  final bool isGuest;
  final String? technology;

  const GameScoreSubmitResult({
    required this.success,
    required this.isNewHighScore,
    required this.highScore,
    required this.score,
    this.wpm = 0,
    this.accuracy = 100,
    required this.totalPlays,
    required this.message,
    this.isGuest = false,
    this.technology,
  });

  factory GameScoreSubmitResult.fromJson(Map<String, dynamic> json) {
    return GameScoreSubmitResult(
      success: json['success'] == true,
      isNewHighScore: json['isNewHighScore'] == true,
      highScore: (json['highScore'] is num) ? (json['highScore'] as num).toInt() : 0,
      score: (json['score'] is num) ? (json['score'] as num).toInt() : 0,
      wpm: (json['wpm'] is num) ? (json['wpm'] as num).toDouble() : 0,
      accuracy: (json['accuracy'] is num) ? (json['accuracy'] as num).toDouble() : 100,
      totalPlays: (json['totalPlays'] is num) ? (json['totalPlays'] as num).toInt() : 1,
      message: json['message']?.toString() ?? '',
      isGuest: json['isGuest'] == true,
      technology: json['technology']?.toString(),
    );
  }
}

class UserGameStatsModel {
  final int totalPlayed;
  final List<String> favorites;
  final Map<String, int> highScores;

  const UserGameStatsModel({
    required this.totalPlayed,
    required this.favorites,
    required this.highScores,
  });

  factory UserGameStatsModel.fromJson(Map<String, dynamic> json) {
    final rawFavs = json['favorites'];
    final favList = (rawFavs is List) ? rawFavs.map((e) => e.toString()).toList() : <String>[];

    final rawHighScores = json['highScores'];
    final Map<String, int> hsMap = {};
    if (rawHighScores is Map) {
      rawHighScores.forEach((k, v) {
        if (v is num) hsMap[k.toString()] = v.toInt();
      });
    }

    return UserGameStatsModel(
      totalPlayed: (json['totalPlayed'] is num) ? (json['totalPlayed'] as num).toInt() : 0,
      favorites: favList,
      highScores: hsMap,
    );
  }
}
