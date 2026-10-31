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
  });

  factory GameModel.fromJson(Map<String, dynamic> json) {
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
    );
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
