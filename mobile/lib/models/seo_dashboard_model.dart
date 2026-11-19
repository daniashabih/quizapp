class SeoOverviewMetric {
  final String key;
  final String label;
  final String explanation;
  final bool available;
  final num? value;
  final String formattedValue;
  final String unavailabilityReason;
  final double? trend;
  final String trendUnit;
  final bool invertTrendGood;
  final bool isEstimated;
  final String source;
  final String? updatedAt;

  const SeoOverviewMetric({
    required this.key,
    required this.label,
    required this.explanation,
    required this.available,
    this.value,
    required this.formattedValue,
    this.unavailabilityReason = '',
    this.trend,
    this.trendUnit = '',
    this.invertTrendGood = false,
    this.isEstimated = false,
    required this.source,
    this.updatedAt,
  });

  factory SeoOverviewMetric.fromJson(Map<String, dynamic> json) {
    return SeoOverviewMetric(
      key: json['key']?.toString() ?? '',
      label: json['label']?.toString() ?? '',
      explanation: json['explanation']?.toString() ?? '',
      available: json['available'] == true,
      value: json['value'] is num ? json['value'] as num : null,
      formattedValue: json['formattedValue']?.toString() ?? 'Not connected',
      unavailabilityReason: json['unavailabilityReason']?.toString() ?? '',
      trend: json['trend'] is num ? (json['trend'] as num).toDouble() : null,
      trendUnit: json['trendUnit']?.toString() ?? '',
      invertTrendGood: json['invertTrendGood'] == true,
      isEstimated: json['isEstimated'] == true,
      source: json['source']?.toString() ?? '',
      updatedAt: json['updatedAt']?.toString(),
    );
  }
}

class SeoHealthCategory {
  final String key;
  final String label;
  final int score;
  final int weight;
  final String formula;
  final int checksPassed;
  final int checksTotal;
  final String source;
  final bool isVerifiedGoogleData;
  final String explanation;

  const SeoHealthCategory({
    required this.key,
    required this.label,
    required this.score,
    required this.weight,
    required this.formula,
    required this.checksPassed,
    required this.checksTotal,
    required this.source,
    required this.isVerifiedGoogleData,
    required this.explanation,
  });

  factory SeoHealthCategory.fromJson(Map<String, dynamic> json) {
    return SeoHealthCategory(
      key: json['key']?.toString() ?? '',
      label: json['label']?.toString() ?? '',
      score: (json['score'] is num) ? (json['score'] as num).toInt() : 0,
      weight: (json['weight'] is num) ? (json['weight'] as num).toInt() : 0,
      formula: json['formula']?.toString() ?? '',
      checksPassed:
          (json['checksPassed'] is num) ? (json['checksPassed'] as num).toInt() : 0,
      checksTotal:
          (json['checksTotal'] is num) ? (json['checksTotal'] as num).toInt() : 0,
      source: json['source']?.toString() ?? '',
      isVerifiedGoogleData: json['isVerifiedGoogleData'] == true,
      explanation: json['explanation']?.toString() ?? '',
    );
  }
}

class SeoHealthScore {
  final int overall;
  final List<SeoHealthCategory> categories;
  final String methodologyNote;
  final String source;

  const SeoHealthScore({
    required this.overall,
    required this.categories,
    required this.methodologyNote,
    required this.source,
  });

  factory SeoHealthScore.fromJson(Map<String, dynamic> json) {
    final cats = (json['categories'] as List? ?? [])
        .whereType<Map<String, dynamic>>()
        .map(SeoHealthCategory.fromJson)
        .toList();
    return SeoHealthScore(
      overall: (json['overall'] is num) ? (json['overall'] as num).toInt() : 0,
      categories: cats,
      methodologyNote: json['methodologyNote']?.toString() ?? '',
      source: json['source']?.toString() ?? 'Hangbug Audit Scoring Engine',
    );
  }
}

class SeoSearchTimeseriesPoint {
  final String date;
  final int clicks;
  final int impressions;
  final double ctr;
  final double position;
  final int? previousClicks;
  final int? previousImpressions;

  const SeoSearchTimeseriesPoint({
    required this.date,
    required this.clicks,
    required this.impressions,
    required this.ctr,
    required this.position,
    this.previousClicks,
    this.previousImpressions,
  });

  factory SeoSearchTimeseriesPoint.fromJson(Map<String, dynamic> json) {
    return SeoSearchTimeseriesPoint(
      date: json['date']?.toString() ?? '',
      clicks: (json['clicks'] is num) ? (json['clicks'] as num).toInt() : 0,
      impressions:
          (json['impressions'] is num) ? (json['impressions'] as num).toInt() : 0,
      ctr: (json['ctr'] is num) ? (json['ctr'] as num).toDouble() : 0.0,
      position:
          (json['position'] is num) ? (json['position'] as num).toDouble() : 0.0,
      previousClicks: (json['previousClicks'] is num)
          ? (json['previousClicks'] as num).toInt()
          : null,
      previousImpressions: (json['previousImpressions'] is num)
          ? (json['previousImpressions'] as num).toInt()
          : null,
    );
  }
}

class SeoKeywordRow {
  final String keyword;
  final String intent;
  final double? position;
  final int? impressions;
  final int? clicks;
  final double? ctr;
  final String landingPage;
  final String source;
  final bool isEstimated;
  final String keywordType;

  const SeoKeywordRow({
    required this.keyword,
    required this.intent,
    this.position,
    this.impressions,
    this.clicks,
    this.ctr,
    required this.landingPage,
    required this.source,
    this.isEstimated = false,
    this.keywordType = '',
  });

  factory SeoKeywordRow.fromJson(Map<String, dynamic> json) {
    return SeoKeywordRow(
      keyword: json['keyword']?.toString() ?? '',
      intent: json['intent']?.toString() ?? 'Informational',
      position:
          json['position'] is num ? (json['position'] as num).toDouble() : null,
      impressions:
          json['impressions'] is num ? (json['impressions'] as num).toInt() : null,
      clicks: json['clicks'] is num ? (json['clicks'] as num).toInt() : null,
      ctr: json['ctr'] is num ? (json['ctr'] as num).toDouble() : null,
      landingPage: json['landingPage']?.toString() ?? '/',
      source: json['source']?.toString() ?? '',
      isEstimated: json['isEstimated'] == true,
      keywordType: json['keywordType']?.toString() ?? '',
    );
  }
}

class SeoAffectedUrl {
  final String url;
  final String detail;

  const SeoAffectedUrl({required this.url, this.detail = ''});

  factory SeoAffectedUrl.fromJson(dynamic raw) {
    if (raw is Map<String, dynamic>) {
      return SeoAffectedUrl(
        url: raw['url']?.toString() ?? '',
        detail: raw['detail']?.toString() ?? '',
      );
    }
    return SeoAffectedUrl(url: raw?.toString() ?? '');
  }
}

class SeoAuditIssue {
  final String id;
  final String title;
  final String bucket;
  final String severity;
  final String status;
  final String type;
  final String whatIsIssue;
  final String whyItMatters;
  final List<SeoAffectedUrl> affectedUrls;
  final int affectedCount;
  final String recommendedAction;
  final String howToFix;
  final String source;
  final String? checkedAt;

  const SeoAuditIssue({
    required this.id,
    required this.title,
    required this.bucket,
    required this.severity,
    required this.status,
    required this.type,
    required this.whatIsIssue,
    required this.whyItMatters,
    required this.affectedUrls,
    required this.affectedCount,
    required this.recommendedAction,
    required this.howToFix,
    required this.source,
    this.checkedAt,
  });

  factory SeoAuditIssue.fromJson(Map<String, dynamic> json) {
    final urls = (json['affectedUrls'] as List? ?? [])
        .map(SeoAffectedUrl.fromJson)
        .toList();
    return SeoAuditIssue(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      bucket: json['bucket']?.toString() ?? 'warning',
      severity: json['severity']?.toString() ?? 'Medium',
      status: json['status']?.toString() ?? 'Needs attention',
      type: json['type']?.toString() ?? 'technical',
      whatIsIssue: json['whatIsIssue']?.toString() ?? '',
      whyItMatters: json['whyItMatters']?.toString() ?? '',
      affectedUrls: urls,
      affectedCount: (json['affectedCount'] is num)
          ? (json['affectedCount'] as num).toInt()
          : urls.length,
      recommendedAction: json['recommendedAction']?.toString() ?? '',
      howToFix: json['howToFix']?.toString() ?? '',
      source: json['source']?.toString() ?? 'Hangbug SEO Crawler',
      checkedAt: json['checkedAt']?.toString(),
    );
  }
}

class SeoRecommendationItem {
  final String recKey;
  final String title;
  final String priority;
  final String explanation;
  final String expectedBenefit;
  final List<String> affectedPages;
  final String suggestedAction;
  final String howToFix;
  final String source;
  final bool isCompleted;
  final String? completedAt;

  const SeoRecommendationItem({
    required this.recKey,
    required this.title,
    required this.priority,
    required this.explanation,
    required this.expectedBenefit,
    required this.affectedPages,
    required this.suggestedAction,
    required this.howToFix,
    required this.source,
    required this.isCompleted,
    this.completedAt,
  });

  factory SeoRecommendationItem.fromJson(Map<String, dynamic> json) {
    return SeoRecommendationItem(
      recKey: json['recKey']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      priority: json['priority']?.toString() ?? 'Medium',
      explanation: json['explanation']?.toString() ?? '',
      expectedBenefit: json['expectedBenefit']?.toString() ?? '',
      affectedPages: (json['affectedPages'] as List? ?? [])
          .map((e) => e.toString())
          .toList(),
      suggestedAction: json['suggestedAction']?.toString() ?? '',
      howToFix: json['howToFix']?.toString() ?? '',
      source: json['source']?.toString() ?? '',
      isCompleted: json['isCompleted'] == true,
      completedAt: json['completedAt']?.toString(),
    );
  }
}

class SeoCompetitorModel {
  final String id;
  final String competitorDomain;
  final String label;
  final Map<String, dynamic> snapshot;
  final String? lastCheckedAt;

  const SeoCompetitorModel({
    required this.id,
    required this.competitorDomain,
    required this.label,
    required this.snapshot,
    this.lastCheckedAt,
  });

  factory SeoCompetitorModel.fromJson(Map<String, dynamic> json) {
    return SeoCompetitorModel(
      id: json['id']?.toString() ?? '',
      competitorDomain: json['competitorDomain']?.toString() ?? '',
      label: json['label']?.toString() ?? '',
      snapshot: json['snapshot'] is Map<String, dynamic>
          ? json['snapshot'] as Map<String, dynamic>
          : <String, dynamic>{},
      lastCheckedAt: json['lastCheckedAt']?.toString(),
    );
  }
}

class SeoDashboardPayload {
  final String domain;
  final String siteUrl;
  final String? lastDataUpdate;
  final Map<String, dynamic> integrations;
  final List<SeoOverviewMetric> overviewMetrics;
  final SeoHealthScore healthScore;
  final Map<String, dynamic> searchPerformance;
  final List<SeoSearchTimeseriesPoint> searchTimeseries;
  final Map<String, dynamic> analyticsOverview;
  final Map<String, dynamic> indexing;
  final List<SeoKeywordRow> measuredQueries;
  final List<SeoKeywordRow> targetKeywords;
  final bool gscConnected;
  final String keywordsExplanation;
  final Map<String, dynamic> auditMeta;
  final List<SeoAuditIssue> auditIssues;
  final Map<String, dynamic> content;
  final Map<String, dynamic> technical;
  final Map<String, dynamic> backlinks;
  final Map<String, dynamic> aiVisibility;
  final List<SeoCompetitorModel> competitors;
  final String competitorsExplanation;
  final List<SeoRecommendationItem> recommendations;
  final Map<String, dynamic> recommendationsStats;

  const SeoDashboardPayload({
    required this.domain,
    required this.siteUrl,
    this.lastDataUpdate,
    required this.integrations,
    required this.overviewMetrics,
    required this.healthScore,
    required this.searchPerformance,
    required this.searchTimeseries,
    required this.analyticsOverview,
    required this.indexing,
    required this.measuredQueries,
    required this.targetKeywords,
    required this.gscConnected,
    required this.keywordsExplanation,
    required this.auditMeta,
    required this.auditIssues,
    required this.content,
    required this.technical,
    required this.backlinks,
    required this.aiVisibility,
    required this.competitors,
    required this.competitorsExplanation,
    required this.recommendations,
    required this.recommendationsStats,
  });

  factory SeoDashboardPayload.fromJson(Map<String, dynamic> root) {
    final data = root['data'] as Map<String, dynamic>? ?? root;
    final project = data['project'] as Map<String, dynamic>? ?? {};
    final overview = data['overview'] as Map<String, dynamic>? ?? {};
    final sp = data['searchPerformance'] as Map<String, dynamic>? ?? {};
    final kw = data['keywords'] as Map<String, dynamic>? ?? {};
    final audit = data['audit'] as Map<String, dynamic>? ?? {};
    final comps = data['competitors'] as Map<String, dynamic>? ?? {};
    final recs = data['recommendations'] as Map<String, dynamic>? ?? {};

    return SeoDashboardPayload(
      domain: overview['domain']?.toString() ?? project['domain']?.toString() ?? 'www.hangbug.com',
      siteUrl: overview['siteUrl']?.toString() ?? project['siteUrl']?.toString() ?? 'https://www.hangbug.com',
      lastDataUpdate: overview['lastDataUpdate']?.toString(),
      integrations: project['integrations'] as Map<String, dynamic>? ?? {},
      overviewMetrics: (overview['metrics'] as List? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(SeoOverviewMetric.fromJson)
          .toList(),
      healthScore: SeoHealthScore.fromJson(
        data['healthScore'] as Map<String, dynamic>? ?? {},
      ),
      searchPerformance: sp,
      searchTimeseries: (sp['timeseries'] as List? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(SeoSearchTimeseriesPoint.fromJson)
          .toList(),
      analyticsOverview: data['analyticsOverview'] as Map<String, dynamic>? ?? {},
      indexing: data['indexing'] as Map<String, dynamic>? ?? {},
      measuredQueries: (kw['measuredQueries'] as List? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(SeoKeywordRow.fromJson)
          .toList(),
      targetKeywords: (kw['targetContentKeywords'] as List? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(SeoKeywordRow.fromJson)
          .toList(),
      gscConnected: kw['gscConnected'] == true,
      keywordsExplanation: kw['explanation']?.toString() ?? '',
      auditMeta: audit,
      auditIssues: (audit['issues'] as List? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(SeoAuditIssue.fromJson)
          .toList(),
      content: data['content'] as Map<String, dynamic>? ?? {},
      technical: data['technical'] as Map<String, dynamic>? ?? {},
      backlinks: data['backlinks'] as Map<String, dynamic>? ?? {},
      aiVisibility: data['aiVisibility'] as Map<String, dynamic>? ?? {},
      competitors: (comps['items'] as List? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(SeoCompetitorModel.fromJson)
          .toList(),
      competitorsExplanation: comps['explanation']?.toString() ?? '',
      recommendations: (recs['items'] as List? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(SeoRecommendationItem.fromJson)
          .toList(),
      recommendationsStats: recs['stats'] as Map<String, dynamic>? ?? {},
    );
  }
}
