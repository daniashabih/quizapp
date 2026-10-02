class AppSettingsModel {
  final String appName;
  final int passingScore;
  final int certificatePassingScore;
  final bool quizTimerEnabled;
  final int quizTimerSeconds;
  final bool adsEnabled;
  final bool maintenanceMode;
  final String maintenanceMessage;
  final bool certificateEnabled;
  final bool leaderboardEnabled;
  final String primaryColor;
  final String secondaryColor;

  const AppSettingsModel({
    this.appName = 'HangBug',
    this.passingScore = 70,
    this.certificatePassingScore = 70,
    this.quizTimerEnabled = false,
    this.quizTimerSeconds = 60,
    this.adsEnabled = false,
    this.maintenanceMode = false,
    this.maintenanceMessage =
        "HangBug is undergoing scheduled upgrades and maintenance. We'll be back online momentarily!",
    this.certificateEnabled = true,
    this.leaderboardEnabled = true,
    this.primaryColor = '#193D35',
    this.secondaryColor = '#FFFFFF',
  });

  factory AppSettingsModel.fromJson(Map<String, dynamic> json) {
    return AppSettingsModel(
      appName: json['appName']?.toString() ?? 'HangBug',
      passingScore: json['passingScore'] is int
          ? json['passingScore'] as int
          : (int.tryParse(json['passingScore']?.toString() ?? '70') ?? 70),
      certificatePassingScore: json['certificatePassingScore'] is int
          ? json['certificatePassingScore'] as int
          : (int.tryParse(json['certificatePassingScore']?.toString() ?? '70') ?? 70),
      quizTimerEnabled: json['quizTimerEnabled'] == true,
      quizTimerSeconds: json['quizTimerSeconds'] is int
          ? json['quizTimerSeconds'] as int
          : (int.tryParse(json['quizTimerSeconds']?.toString() ?? '60') ?? 60),
      adsEnabled: json['adsEnabled'] == true,
      maintenanceMode: json['maintenanceMode'] == true,
      maintenanceMessage: json['maintenanceMessage']?.toString() ??
          "HangBug is undergoing scheduled upgrades and maintenance. We'll be back online momentarily!",
      certificateEnabled: json['certificateEnabled'] != false,
      leaderboardEnabled: json['leaderboardEnabled'] != false,
      primaryColor: json['primaryColor']?.toString() ?? '#193D35',
      secondaryColor: json['secondaryColor']?.toString() ?? '#FFFFFF',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'appName': appName,
      'passingScore': passingScore,
      'certificatePassingScore': certificatePassingScore,
      'quizTimerEnabled': quizTimerEnabled,
      'quizTimerSeconds': quizTimerSeconds,
      'adsEnabled': adsEnabled,
      'maintenanceMode': maintenanceMode,
      'maintenanceMessage': maintenanceMessage,
      'certificateEnabled': certificateEnabled,
      'leaderboardEnabled': leaderboardEnabled,
      'primaryColor': primaryColor,
      'secondaryColor': secondaryColor,
    };
  }
}
