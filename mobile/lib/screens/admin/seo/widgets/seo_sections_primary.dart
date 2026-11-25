import 'package:flutter/material.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../models/seo_dashboard_model.dart';
import 'seo_charts.dart';
import 'seo_issue_detail_sheet.dart';
import 'seo_theme_tokens.dart';

/// 1. OVERVIEW TAB
class SeoOverviewTab extends StatefulWidget {
  final SeoDashboardPayload data;
  final ValueChanged<String> onNavigateSection;

  const SeoOverviewTab({
    super.key,
    required this.data,
    required this.onNavigateSection,
  });

  @override
  State<SeoOverviewTab> createState() => _SeoOverviewTabState();
}

class _SeoOverviewTabState extends State<SeoOverviewTab> {
  String? _expandedCategoryKey;

  @override
  Widget build(BuildContext context) {
    final data = widget.data;
    final health = data.healthScore;
    final gscOk = data.integrations['gscConnected'] == true;
    final ga4Ok = data.integrations['ga4Connected'] == true;
    final psiStatus = data.integrations['pagespeedConnectionStatus']?.toString() ??
        (data.integrations['pagespeedConnected'] == true
            ? 'Connected'
            : (data.integrations['pagespeedHasKey'] == true
                ? 'Configured (Not Tested)'
                : 'Not Configured'));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Domain & Integration Summary Card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: SeoColors.cardBg(context),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: SeoColors.border(context)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(9),
                    decoration: BoxDecoration(
                      color: SeoColors.mintSurface(context),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.public_rounded,
                      size: 20,
                      color: SeoColors.primaryBrand(context),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          data.domain,
                          style: AppTextStyles.labelBold.copyWith(
                            fontSize: 15,
                            color: SeoColors.textPrimary(context),
                          ),
                        ),
                        if (data.lastDataUpdate != null)
                          Text(
                            'Updated ${DateFormatter.formatRelativeFromString(data.lastDataUpdate!)}',
                            style: TextStyle(
                              fontSize: 11,
                              color: SeoColors.textMuted(context),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  SeoStatusBadge(
                    status: gscOk ? 'Search Console: Verified' : 'GSC: Not Connected',
                  ),
                  SeoStatusBadge(
                    status: ga4Ok ? 'GA4 API: Verified' : 'GA4 Tag Active',
                  ),
                  SeoStatusBadge(status: 'PageSpeed: $psiStatus'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        Text(
          'Website Overview',
          style: AppTextStyles.displaySmall.copyWith(
            fontSize: 16,
            color: SeoColors.textPrimary(context),
          ),
        ),
        const SizedBox(height: 10),
        ...data.overviewMetrics.map(
          (metric) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: SeoMetricCard(
              metric: metric,
              onConnectTap: () => widget.onNavigateSection('settings'),
            ),
          ),
        ),
        const SizedBox(height: 10),

        // SEO Health Score (0-100) + 5 Categories
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: SeoColors.cardBg(context),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: SeoColors.border(context)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'SEO Health Score',
                    style: AppTextStyles.displaySmall.copyWith(
                      fontSize: 16,
                      color: SeoColors.textPrimary(context),
                    ),
                  ),
                  SeoStatusBadge(
                    status: health.overall >= 85
                        ? 'Good'
                        : health.overall >= 65
                            ? 'Needs attention'
                            : 'Critical',
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Center(child: SeoHealthRingGauge(score: health.overall)),
              const SizedBox(height: 12),
              Text(
                health.methodologyNote,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 11.5,
                  height: 1.4,
                  color: SeoColors.textMuted(context),
                ),
              ),
              const SizedBox(height: 16),
              ...health.categories.map((cat) {
                final expanded = _expandedCategoryKey == cat.key;
                final barColor = cat.score >= 85
                    ? SeoColors.accentGreen
                    : cat.score >= 65
                        ? const Color(0xFFD19A45)
                        : const Color(0xFFC96155);
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: SeoColors.scaffoldBg(context),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: SeoColors.border(context)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            cat.label,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: SeoColors.textPrimary(context),
                            ),
                          ),
                          Text(
                            '${cat.score}/100',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: SeoColors.primaryBrand(context),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: LinearProgressIndicator(
                          value: cat.score / 100.0,
                          minHeight: 7,
                          backgroundColor: SeoColors.border(context),
                          valueColor: AlwaysStoppedAnimation<Color>(barColor),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        cat.explanation,
                        style: TextStyle(
                          fontSize: 11,
                          color: SeoColors.textMuted(context),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '${cat.source} (${cat.checksPassed}/${cat.checksTotal})',
                              style: TextStyle(
                                fontSize: 10,
                                color: SeoColors.textMuted(context),
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: () => setState(() {
                              _expandedCategoryKey = expanded ? null : cat.key;
                            }),
                            child: Text(
                              expanded ? 'Hide formula' : 'How calculated',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: SeoColors.primaryBrand(context),
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (expanded) ...[
                        const SizedBox(height: 8),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: SeoColors.cardBg(context),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: SeoColors.border(context)),
                          ),
                          child: Text(
                            'Weight ${cat.weight}%: ${cat.formula}',
                            style: TextStyle(
                              fontSize: 11,
                              color: SeoColors.textPrimary(context),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }
}

/// 2. SEARCH PERFORMANCE TAB
class SeoSearchPerformanceTab extends StatelessWidget {
  final SeoDashboardPayload data;
  final String currentRange;
  final ValueChanged<String> onSelectRange;
  final VoidCallback onPickCustomDates;
  final VoidCallback onOpenSettings;

  const SeoSearchPerformanceTab({
    super.key,
    required this.data,
    required this.currentRange,
    required this.onSelectRange,
    required this.onPickCustomDates,
    required this.onOpenSettings,
  });

  @override
  Widget build(BuildContext context) {
    final sp = data.searchPerformance;
    final connected = sp['connected'] == true;
    final summary = sp['summary'] as Map<String, dynamic>? ?? {};
    final ga4 = data.analyticsOverview;
    final ga4Connected = ga4['connected'] == true;
    final ga4Summary = ga4['summary'] as Map<String, dynamic>? ?? {};

    final rangeOptions = [
      ('7d', '7 Days'),
      ('28d', '28 Days'),
      ('3m', '90 Days'),
      ('6m', '6 Months'),
      ('12m', '12 Months'),
      ('custom', 'Custom'),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: rangeOptions.map((opt) {
            final selected = currentRange == opt.$1;
            return ChoiceChip(
              label: Text(opt.$2),
              selected: selected,
              selectedColor: SeoColors.mintSurface(context),
              onSelected: (_) {
                if (opt.$1 == 'custom') {
                  onPickCustomDates();
                } else {
                  onSelectRange(opt.$1);
                }
              },
            );
          }).toList(),
        ),
        const SizedBox(height: 14),
        if (!connected)
          SeoEmptyIntegrationCard(
            title: 'Connect Google Search Console',
            description: sp['reason']?.toString() ??
                'Connect Google Search Console in Settings to view Organic Clicks, Impressions, Position, and CTR.',
            source: 'Google Search Console API',
            onConfigure: onOpenSettings,
          )
        else ...[
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.65,
            children: [
              _MiniKpiTile(
                label: 'Organic Clicks',
                value: '${summary['totalClicks'] ?? 0}',
                delta: summary['clicksChangePct'],
              ),
              _MiniKpiTile(
                label: 'Impressions',
                value: '${summary['totalImpressions'] ?? 0}',
                delta: summary['impressionsChangePct'],
              ),
              _MiniKpiTile(
                label: 'Avg Position',
                value: '${summary['averagePosition'] ?? '-'}',
                delta: summary['positionDelta'],
              ),
              _MiniKpiTile(
                label: 'Average CTR',
                value: '${summary['averageCtr'] ?? 0}%',
                delta: summary['ctrDelta'],
              ),
            ],
          ),
          const SizedBox(height: 14),
          SeoTrendChart(
            title: 'Organic Clicks',
            values: data.searchTimeseries
                .map((e) => e.clicks.toDouble())
                .toList(),
            previousValues: data.searchTimeseries
                .map((e) => e.previousClicks?.toDouble())
                .toList(),
            labels: data.searchTimeseries.map((e) => e.date).toList(),
            color: SeoColors.primaryDarkGreen,
          ),
          const SizedBox(height: 12),
          SeoTrendChart(
            title: 'Organic Impressions',
            values: data.searchTimeseries
                .map((e) => e.impressions.toDouble())
                .toList(),
            previousValues: data.searchTimeseries
                .map((e) => e.previousImpressions?.toDouble())
                .toList(),
            labels: data.searchTimeseries.map((e) => e.date).toList(),
            color: SeoColors.accentGreen,
          ),
          const SizedBox(height: 12),
          SeoTrendChart(
            title: 'Average Position (Lower is Better)',
            values: data.searchTimeseries.map((e) => e.position).toList(),
            labels: data.searchTimeseries.map((e) => e.date).toList(),
            color: const Color(0xFFD19A45),
            invertY: true,
          ),
          const SizedBox(height: 12),
          SeoTrendChart(
            title: 'Click-Through Rate (%)',
            values: data.searchTimeseries.map((e) => e.ctr).toList(),
            labels: data.searchTimeseries.map((e) => e.date).toList(),
            color: SeoColors.accentGreen,
          ),
        ],
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: SeoColors.cardBg(context),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: SeoColors.border(context)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Google Analytics 4',
                    style: AppTextStyles.labelBold.copyWith(
                      color: SeoColors.textPrimary(context),
                    ),
                  ),
                  SeoStatusBadge(
                    status: ga4Connected ? 'Connected' : 'Tag Active / API Off',
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (ga4Connected) ...[
                Text(
                  'Active Users: ${ga4Summary['activeUsers'] ?? ga4Summary['organicUsers'] ?? 0} · Total Users: ${ga4Summary['totalUsers'] ?? 0} · Sessions: ${ga4Summary['sessions'] ?? ga4Summary['organicSessions'] ?? 0} · New Users: ${ga4Summary['newUsers'] ?? 0}',
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: SeoColors.textPrimary(context),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Page Views: ${ga4Summary['pageViews'] ?? 0} · Bounce Rate: ${ga4Summary['bounceRate'] ?? 0}% · Avg Engagement: ${ga4Summary['avgEngagementTimeFormatted'] ?? '0s'}',
                  style: TextStyle(
                    fontSize: 12,
                    color: SeoColors.textMuted(context),
                  ),
                ),
              ] else
                Text(
                  ga4['reason']?.toString() ??
                      'GA4 Measurement ID G-BSZBBFZZH0 is active. Connect GA4 Property ID & Service Account in Settings.',
                  style: TextStyle(
                    fontSize: 12,
                    color: SeoColors.textMuted(context),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _MiniKpiTile extends StatelessWidget {
  final String label;
  final String value;
  final dynamic delta;

  const _MiniKpiTile({
    required this.label,
    required this.value,
    this.delta,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: SeoColors.cardBg(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: SeoColors.border(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: SeoColors.textMuted(context),
            ),
          ),
          Row(
            children: [
              Text(
                value,
                style: AppTextStyles.displaySmall.copyWith(
                  fontSize: 20,
                  color: SeoColors.textPrimary(context),
                ),
              ),
              if (delta is num) ...[
                const SizedBox(width: 6),
                Text(
                  '${delta > 0 ? '+' : ''}$delta',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: delta >= 0
                        ? SeoColors.accentGreen
                        : const Color(0xFFC96155),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

/// 3. KEYWORD RESEARCH TAB
class SeoKeywordsTab extends StatefulWidget {
  final SeoDashboardPayload data;

  const SeoKeywordsTab({super.key, required this.data});

  @override
  State<SeoKeywordsTab> createState() => _SeoKeywordsTabState();
}

class _SeoKeywordsTabState extends State<SeoKeywordsTab> {
  String _query = '';
  String _intentFilter = 'all';
  String _sourceFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final allRows = <SeoKeywordRow>[
      ...widget.data.measuredQueries,
      ...widget.data.targetKeywords,
    ];

    final filtered = allRows.where((r) {
      if (_sourceFilter == 'gsc' && !r.source.contains('Search Console')) {
        return false;
      }
      if (_sourceFilter == 'target' && r.source.contains('Search Console')) {
        return false;
      }
      if (_intentFilter != 'all' &&
          r.intent.toLowerCase() != _intentFilter.toLowerCase()) {
        return false;
      }
      if (_query.isNotEmpty &&
          !r.keyword.toLowerCase().contains(_query.toLowerCase()) &&
          !r.landingPage.toLowerCase().contains(_query.toLowerCase())) {
        return false;
      }
      return true;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: SeoColors.mintSurface(context),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: SeoColors.accentGreen.withValues(alpha: 0.35),
            ),
          ),
          child: Text(
            widget.data.keywordsExplanation,
            style: TextStyle(
              fontSize: 11.5,
              height: 1.4,
              color: SeoColors.textPrimary(context),
            ),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          onChanged: (v) => setState(() => _query = v.trim()),
          decoration: const InputDecoration(
            hintText: 'Filter by keyword or landing page...',
            prefixIcon: Icon(Icons.search_rounded, size: 18),
            isDense: true,
          ),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 6,
          children: [
            ChoiceChip(
              label: Text('All (${allRows.length})'),
              selected: _sourceFilter == 'all',
              onSelected: (_) => setState(() => _sourceFilter = 'all'),
            ),
            ChoiceChip(
              label: Text('Verified GSC (${widget.data.measuredQueries.length})'),
              selected: _sourceFilter == 'gsc',
              onSelected: (_) => setState(() => _sourceFilter = 'gsc'),
            ),
            ChoiceChip(
              label: Text('On-Page Target (${widget.data.targetKeywords.length})'),
              selected: _sourceFilter == 'target',
              onSelected: (_) => setState(() => _sourceFilter = 'target'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: ['all', 'Informational', 'Transactional', 'Navigational', 'Commercial']
                .map((intent) => Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: FilterChip(
                        label: Text(intent == 'all' ? 'All Intents' : intent),
                        selected: _intentFilter == intent,
                        onSelected: (_) =>
                            setState(() => _intentFilter = intent),
                      ),
                    ))
                .toList(),
          ),
        ),
        const SizedBox(height: 12),
        if (filtered.isEmpty)
          Padding(
            padding: const EdgeInsets.all(24),
            child: Center(
              child: Text(
                'No keywords match your active filters.',
                style: TextStyle(color: SeoColors.textMuted(context)),
              ),
            ),
          )
        else
          ...filtered.map((kw) {
            final isGsc = kw.source.contains('Search Console');
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: SeoColors.cardBg(context),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: SeoColors.border(context)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          kw.keyword,
                          style: AppTextStyles.labelBold.copyWith(
                            fontSize: 13.5,
                            color: SeoColors.textPrimary(context),
                          ),
                        ),
                      ),
                      SeoStatusBadge(
                        status: isGsc ? 'Verified' : 'On-Page Target',
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Intent: ${kw.intent} · Page: ${kw.landingPage}',
                    style: TextStyle(
                      fontSize: 11.5,
                      color: SeoColors.textMuted(context),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Pos: ${kw.position ?? 'Requires GSC'}',
                        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        'Impr: ${kw.impressions ?? '—'}',
                        style: const TextStyle(fontSize: 11.5),
                      ),
                      Text(
                        'Clicks: ${kw.clicks ?? '—'}',
                        style: const TextStyle(fontSize: 11.5),
                      ),
                      Text(
                        'CTR: ${kw.ctr != null ? '${kw.ctr}%' : '—'}',
                        style: const TextStyle(fontSize: 11.5),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
      ],
    );
  }
}

/// 4. WEBSITE AUDIT TAB
class SeoAuditTab extends StatefulWidget {
  final SeoDashboardPayload data;
  final bool isAuditing;
  final VoidCallback onRunAudit;

  const SeoAuditTab({
    super.key,
    required this.data,
    required this.isAuditing,
    required this.onRunAudit,
  });

  @override
  State<SeoAuditTab> createState() => _SeoAuditTabState();
}

class _SeoAuditTabState extends State<SeoAuditTab> {
  String _bucket = 'all';
  String _severity = 'all';
  String _type = 'all';

  @override
  Widget build(BuildContext context) {
    final issues = widget.data.auditIssues;
    final filtered = issues.where((i) {
      if (_bucket != 'all' && i.bucket != _bucket) return false;
      if (_severity != 'all' &&
          i.severity.toLowerCase() != _severity.toLowerCase()) {
        return false;
      }
      if (_type != 'all' && i.type.toLowerCase() != _type.toLowerCase()) {
        return false;
      }
      return true;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: SeoColors.cardBg(context),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: SeoColors.border(context)),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SEO Audit Center',
                      style: AppTextStyles.labelBold.copyWith(
                        fontSize: 15,
                        color: SeoColors.textPrimary(context),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Scanned ${widget.data.auditMeta['pagesScanned'] ?? 0} pages · Read-only scan',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: SeoColors.textMuted(context),
                      ),
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: widget.isAuditing ? null : widget.onRunAudit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: SeoColors.primaryDarkGreen,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(124, 40),
                ),
                icon: widget.isAuditing
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.play_arrow_rounded, size: 18),
                label: Text(widget.isAuditing ? 'Auditing' : 'Run Audit'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              ('all', 'All (${issues.length})'),
              ('critical', 'Critical (${issues.where((i) => i.bucket == 'critical').length})'),
              ('warning', 'Warnings (${issues.where((i) => i.bucket == 'warning').length})'),
              ('opportunity', 'Opportunities (${issues.where((i) => i.bucket == 'opportunity').length})'),
              ('passed', 'Passed (${issues.where((i) => i.bucket == 'passed').length})'),
            ].map((b) {
              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: ChoiceChip(
                  label: Text(b.$2),
                  selected: _bucket == b.$1,
                  onSelected: (_) => setState(() => _bucket = b.$1),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Severity',
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _severity,
                    isDense: true,
                    items: const [
                      DropdownMenuItem(value: 'all', child: Text('All Severities')),
                      DropdownMenuItem(value: 'critical', child: Text('Critical')),
                      DropdownMenuItem(value: 'high', child: Text('High')),
                      DropdownMenuItem(value: 'medium', child: Text('Medium')),
                      DropdownMenuItem(value: 'low', child: Text('Low')),
                    ],
                    onChanged: (v) => setState(() => _severity = v ?? 'all'),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Issue Type',
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _type,
                    isDense: true,
                    items: const [
                      DropdownMenuItem(value: 'all', child: Text('All Types')),
                      DropdownMenuItem(value: 'technical', child: Text('Technical')),
                      DropdownMenuItem(value: 'on-page', child: Text('On-Page')),
                      DropdownMenuItem(value: 'content', child: Text('Content')),
                      DropdownMenuItem(value: 'indexing', child: Text('Indexing')),
                      DropdownMenuItem(value: 'linking', child: Text('Internal Linking')),
                      DropdownMenuItem(value: 'performance', child: Text('Performance')),
                    ],
                    onChanged: (v) => setState(() => _type = v ?? 'all'),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        ...filtered.map(
          (issue) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: SeoColors.cardBg(context),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: SeoColors.border(context)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    SeoStatusBadge(status: issue.status),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${issue.severity} · ${issue.affectedCount} page(s)',
                        style: TextStyle(
                          fontSize: 11,
                          color: SeoColors.textMuted(context),
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () => showSeoIssueDetailSheet(context, issue),
                      child: const Text('View Details'),
                    ),
                  ],
                ),
                Text(
                  issue.title,
                  style: AppTextStyles.labelBold.copyWith(
                    fontSize: 14,
                    color: SeoColors.textPrimary(context),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  issue.whatIsIssue,
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: SeoColors.textMuted(context),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Recommended: ${issue.recommendedAction}',
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: SeoColors.primaryBrand(context),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// 5. PAGE INDEXING TAB
class SeoIndexingTab extends StatefulWidget {
  final SeoDashboardPayload data;
  final Future<Map<String, dynamic>> Function(String url) onInspectUrl;

  const SeoIndexingTab({
    super.key,
    required this.data,
    required this.onInspectUrl,
  });

  @override
  State<SeoIndexingTab> createState() => _SeoIndexingTabState();
}

class _SeoIndexingTabState extends State<SeoIndexingTab> {
  final TextEditingController _urlCtrl =
      TextEditingController(text: '/technologies/javascript');
  bool _inspecting = false;
  Map<String, dynamic>? _inspection;
  bool _showAffectedOnly = false;

  @override
  void dispose() {
    _urlCtrl.dispose();
    super.dispose();
  }

  String _formatRobotsStatus(dynamic crawl) {
    if (crawl is! Map) return '—';
    if (crawl['isNoindex'] == true) return 'noindex';
    final meta = crawl['robotsMeta']?.toString().trim() ?? '';
    if (meta.isNotEmpty) return meta;
    final xRobots = crawl['xRobotsTag']?.toString().trim() ?? '';
    return xRobots.isNotEmpty ? xRobots : 'index, follow';
  }

  Future<void> _runInspect() async {
    if (_inspecting) return;
    setState(() => _inspecting = true);
    try {
      final res = await widget.onInspectUrl(_urlCtrl.text.trim());
      if (mounted) setState(() => _inspection = res);
    } finally {
      if (mounted) setState(() => _inspecting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final idx = widget.data.indexing;
    final summary = idx['summary'] as Map<String, dynamic>? ?? {};
    final inventory = (idx['urlInventory'] as List? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final filtered = _showAffectedOnly
        ? inventory
            .where((u) =>
                u['httpStatus'] != 200 ||
                u['isNoindex'] == true ||
                u['canonicalValid'] != true)
            .toList()
        : inventory;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: SeoColors.cardBg(context),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: SeoColors.border(context)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Google Indexing Overview',
                    style: AppTextStyles.labelBold.copyWith(
                      fontSize: 15,
                      color: SeoColors.textPrimary(context),
                    ),
                  ),
                  SeoStatusBadge(
                    status: idx['gscConnected'] == true
                        ? 'Verified'
                        : 'GSC Not Connected',
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                idx['explanation']?.toString() ?? '',
                style: TextStyle(
                  fontSize: 11.5,
                  color: SeoColors.textMuted(context),
                ),
              ),
              const SizedBox(height: 12),
              _KvRow('Indexed Pages',
                  '${summary['indexedPages']?['value'] ?? '${summary['indexedPages']?['crawlableReadyCount'] ?? 0} crawlable'}'),
              _KvRow('Not Indexed Pages',
                  '${summary['notIndexedPages']?['value'] ?? '${summary['notIndexedPages']?['crawlNoindexCount'] ?? 0} excluded'}'),
              _KvRow('Redirects (301)', '${summary['redirects']?['value'] ?? 0}'),
              _KvRow('Errors', '${summary['errors']?['value'] ?? 0}'),
              _KvRow('Sitemap URLs',
                  '${summary['sitemapStatus']?['urlCount'] ?? 0} (${summary['sitemapStatus']?['status'] ?? 'Unknown'})'),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: () =>
                    setState(() => _showAffectedOnly = !_showAffectedOnly),
                icon: const Icon(Icons.filter_list_rounded, size: 16),
                label: Text(_showAffectedOnly
                    ? 'Show All URLs (${inventory.length})'
                    : 'Inspect Affected URLs'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: SeoColors.cardBg(context),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: SeoColors.border(context)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Inspect Any URL',
                style: AppTextStyles.labelBold.copyWith(
                  color: SeoColors.textPrimary(context),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _urlCtrl,
                      decoration: const InputDecoration(
                        hintText: '/technologies/javascript',
                        isDense: true,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: _inspecting ? null : _runInspect,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: SeoColors.primaryDarkGreen,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(88, 44),
                    ),
                    child: Text(_inspecting ? '...' : 'Inspect'),
                  ),
                ],
              ),
              if (_inspection != null) ...[
                const SizedBox(height: 12),
                Text(
                  'HTTP ${_inspection!['crawl']?['httpStatus']} · Title: ${_inspection!['crawl']?['title'] ?? '—'}\nCanonical: ${_inspection!['crawl']?['canonicalUrl'] ?? '—'}\nRobots: ${_formatRobotsStatus(_inspection!['crawl'])} · Sitemap: ${_inspection!['crawl']?['inSitemap'] == true ? 'Listed' : 'Excluded'}',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: SeoColors.textPrimary(context),
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 12),
        ...filtered.take(25).map((u) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: SeoColors.cardBg(context),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: SeoColors.border(context)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          u['path']?.toString() ?? '/',
                          style: const TextStyle(
                            fontSize: 12,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          'Words: ${u['wordCount'] ?? 0} · Canonical: ${u['canonicalValid'] == true ? 'Valid' : 'Check'} · ${u['isNoindex'] == true ? 'Noindex' : (u['inSitemap'] == true ? 'Sitemap' : 'Not in Sitemap')}',
                          style: TextStyle(
                            fontSize: 10.5,
                            color: SeoColors.textMuted(context),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SeoStatusBadge(
                    status: u['httpStatus'] == 200 && u['isNoindex'] != true
                        ? 'Good'
                        : 'Critical',
                  ),
                ],
              ),
            )),
      ],
    );
  }
}

class _KvRow extends StatelessWidget {
  final String k;
  final String v;

  const _KvRow(this.k, this.v);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            k,
            style: TextStyle(fontSize: 12, color: SeoColors.textMuted(context)),
          ),
          Text(
            v,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: SeoColors.textPrimary(context),
            ),
          ),
        ],
      ),
    );
  }
}

/// 6. CONTENT ANALYSIS TAB
class SeoContentTab extends StatelessWidget {
  final SeoDashboardPayload data;

  const SeoContentTab({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final content = data.content;
    final articles = (content['bestPerformingArticles'] as List? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final needsImp = (content['contentNeedingImprovement'] as List? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final missingMeta = (content['missingMetaDescriptions'] as List? ?? []);
    final dupTitles = (content['duplicateOrMissingTitles'] as List? ?? []);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 1.75,
          children: [
            _MiniKpiTile(label: 'Published Articles', value: '${articles.length}'),
            _MiniKpiTile(label: 'Need Improvement', value: '${needsImp.length}'),
            _MiniKpiTile(label: 'Missing Meta Desc', value: '${missingMeta.length}'),
            _MiniKpiTile(label: 'Title Issues', value: '${dupTitles.length}'),
          ],
        ),
        const SizedBox(height: 16),
        Text(
          'Best-Performing Blog Articles',
          style: AppTextStyles.displaySmall.copyWith(
            fontSize: 15,
            color: SeoColors.textPrimary(context),
          ),
        ),
        const SizedBox(height: 8),
        ...articles.map((art) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: SeoColors.cardBg(context),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: SeoColors.border(context)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    art['title']?.toString() ?? '',
                    style: AppTextStyles.labelBold.copyWith(
                      fontSize: 13.5,
                      color: SeoColors.textPrimary(context),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '/blog/${art['slug']} · ${art['category']}',
                    style: TextStyle(
                      fontSize: 11,
                      color: SeoColors.textMuted(context),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'App Views: ${art['viewsCount'] ?? 0}',
                        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        'GSC Clicks: ${art['gscClicks'] ?? 'GSC off'}',
                        style: const TextStyle(fontSize: 11.5),
                      ),
                    ],
                  ),
                ],
              ),
            )),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: SeoColors.cardBg(context),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: SeoColors.border(context)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Declining Performance & Recommendations',
                style: AppTextStyles.labelBold.copyWith(
                  color: SeoColors.textPrimary(context),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                content['decliningExplanation']?.toString() ??
                    'Connect Google Search Console to track page performance declines.',
                style: TextStyle(
                  fontSize: 12,
                  color: SeoColors.textMuted(context),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
