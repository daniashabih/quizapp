class QuizResultModel {
  final String id;
  final String category;
  final int session;
  final int score;
  final int total;
  final double percentage;
  final bool? passed;
  final bool? isEligibleForCertificate;
  final String? certificateId;
  final int? passingScore;
  final String? createdAt;

  const QuizResultModel({
    required this.id,
    required this.category,
    this.session = 1,
    required this.score,
    required this.total,
    required this.percentage,
    this.passed,
    this.isEligibleForCertificate,
    this.certificateId,
    this.passingScore,
    this.createdAt,
  });

  bool get isPassed => passed ?? (percentage >= (passingScore ?? 70));
  bool get isCertified =>
      isEligibleForCertificate ?? (percentage >= (passingScore ?? 70));

  factory QuizResultModel.fromJson(Map<String, dynamic> json) {
    return QuizResultModel(
      id: json['id']?.toString() ??
          json['_id']?.toString() ??
          json['resultId']?.toString() ??
          '',
      category: json['category']?.toString() ?? 'General',
      session: json['session'] is int
          ? json['session'] as int
          : (int.tryParse(json['session']?.toString() ?? '1') ?? 1),
      score: json['score'] is int
          ? json['score'] as int
          : (int.tryParse(json['score']?.toString() ?? '0') ?? 0),
      total: json['total'] is int
          ? json['total'] as int
          : (int.tryParse(json['total']?.toString() ?? '0') ?? 0),
      percentage: json['percentage'] is num
          ? (json['percentage'] as num).toDouble()
          : (double.tryParse(json['percentage']?.toString() ?? '0') ?? 0.0),
      passed: json['passed'] is bool ? json['passed'] as bool : null,
      isEligibleForCertificate: json['isEligibleForCertificate'] is bool
          ? json['isEligibleForCertificate'] as bool
          : (json['is_eligible_for_certificate'] is bool
              ? json['is_eligible_for_certificate'] as bool
              : null),
      certificateId: json['certificateId']?.toString() ??
          json['certificate_id']?.toString(),
      passingScore: json['passingScore'] is int
          ? json['passingScore'] as int
          : (int.tryParse(json['passingScore']?.toString() ?? '')),
      createdAt:
          json['createdAt']?.toString() ?? json['created_at']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category': category,
      'session': session,
      'score': score,
      'total': total,
      'percentage': percentage,
      'passed': isPassed,
      'isEligibleForCertificate': isCertified,
      if (certificateId != null) 'certificateId': certificateId,
      if (passingScore != null) 'passingScore': passingScore,
      'createdAt': createdAt,
    };
  }
}
