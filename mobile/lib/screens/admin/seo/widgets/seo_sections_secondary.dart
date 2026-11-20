import 'package:flutter/material.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../models/seo_dashboard_model.dart';
import 'seo_charts.dart';
import 'seo_theme_tokens.dart';

/// 7. TECHNICAL SEO TAB
class SeoTechnicalTab extends StatefulWidget {
  final SeoDashboardPayload data;
  final Future<void> Function(String url, String strategy) onRunPageSpeed;

  const SeoTechnicalTab({
    super.key,
    required this.data,
    required this.onRunPageSpeed,
  });

  @override
  State<SeoTechnicalTab> createState() => _SeoTechnicalTabState();
}

class _SeoTechnicalTabState extends State<SeoTechnicalTab> {
  String _strategy = 'mobile';
  String _targetPath = '/';
  bool _runningPsi = false;

  Future<void> _triggerPsi() async {
    if (_runningPsi) return;
    setState(() => _runningPsi = true);
    try {
      await widget.onRunPageSpeed(_targetPath, _strategy);
    } finally {
      if (mounted) setState(() => _runningPsi = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tech = widget.data.technical;
    final psi = tech['pageSpeed'] as Map<String, dynamic>? ?? {};
    final activePsi = (_strategy == 'desktop' ? psi['desktop'] : psi['mobile'])
        as Map<String, dynamic>?;
    final cwv = activePsi?['coreWebVitals'] as Map<String, dynamic>? ?? {};
    final scores = activePsi?['scores'] as Map<String, dynamic>? ?? {};

    final checks = [
      ('HTTP Status Codes', tech['httpStatusCodes']),
      ('Broken Links', tech['brokenLinks']),
      ('Redirect Chains', tech['redirectChains']),
      ('Canonical Tags', tech['canonicalTags']),
      ('XML Sitemap', tech['sitemap']),
      ('Robots.txt', tech['robotsTxt']),
      ('Mobile Usability', tech['mobileUsability']),
      ('Structured Data', tech['structuredData']),
      ('Image Optimization', tech['imageOptimization']),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // PageSpeed & Core Web Vitals Card
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
                    'Page Speed & Core Web Vitals',
                    style: AppTextStyles.labelBold.copyWith(
                      fontSize: 15,
                      color: SeoColors.textPrimary(context),
                    ),
                  ),
                  SeoStatusBadge(
                    status: (tech['coreWebVitals']?['status'] ?? 'Not checked')
                        .toString(),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'URL',
                        isDense: true,
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _targetPath,
                          isDense: true,
                          items: const [
                            DropdownMenuItem(value: '/', child: Text('/ (Home)')),
                            DropdownMenuItem(
                                value: '/technologies',
                                child: Text('/technologies')),
                            DropdownMenuItem(
                                value: '/games', child: Text('/games')),
                            DropdownMenuItem(
                                value: '/blog', child: Text('/blog')),
                          ],
                          onChanged: (v) =>
                              setState(() => _targetPath = v ?? '/'),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ChoiceChip(
                    label: const Text('Mobile'),
                    selected: _strategy == 'mobile',
                    onSelected: (_) => setState(() => _strategy = 'mobile'),
                  ),
                  const SizedBox(width: 4),
                  ChoiceChip(
                    label: const Text('Desktop'),
                    selected: _strategy == 'desktop',
                    onSelected: (_) => setState(() => _strategy = 'desktop'),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              ElevatedButton.icon(
                onPressed: _runningPsi ? null : _triggerPsi,
                style: ElevatedButton.styleFrom(
                  backgroundColor: SeoColors.primaryDarkGreen,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(42),
                ),
                icon: _runningPsi
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.speed_rounded, size: 18),
                label: Text(_runningPsi
                    ? 'Running PageSpeed Insights...'
                    : 'Run PageSpeed Check'),
              ),
              if (activePsi != null) ...[
                const SizedBox(height: 14),
                Text(
                  'Performance: ${scores['performance'] ?? '—'} · Accessibility: ${scores['accessibility'] ?? '—'} · SEO: ${scores['seo'] ?? '—'}',
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: SeoColors.textPrimary(context),
                  ),
                ),
                const SizedBox(height: 8),
                ...['lcp', 'cls', 'inp', 'fcp', 'ttfb'].map((k) {
                  final m = cwv[k] as Map<String, dynamic>?;
                  if (m == null) return const SizedBox.shrink();
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${k.toUpperCase()}: ${m['displayValue'] ?? '—'}',
                          style: const TextStyle(fontSize: 12),
                        ),
                        SeoStatusBadge(
                          status: m['status']?.toString() ?? 'Not checked',
                        ),
                      ],
                    ),
                  );
                }),
              ] else ...[
                const SizedBox(height: 10),
                Text(
                  psi['explanation']?.toString() ??
                      'Run PageSpeed Check to measure live LCP, CLS, INP, and Lighthouse scores.',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: SeoColors.textMuted(context),
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 14),
        ...checks.map((entry) {
          final map = entry.$2 as Map<String, dynamic>? ?? {};
          final status = map['status']?.toString() ?? 'Not checked';
          final explanation = map['explanation']?.toString() ?? '';
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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      entry.$1,
                      style: AppTextStyles.labelBold.copyWith(
                        color: SeoColors.textPrimary(context),
                      ),
                    ),
                    SeoStatusBadge(status: status),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  explanation,
                  style: TextStyle(
                    fontSize: 12,
                    color: SeoColors.textMuted(context),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}

/// 8. BACKLINKS TAB
class SeoBacklinksTab extends StatefulWidget {
  final SeoDashboardPayload data;
  final Future<void> Function(List<Map<String, dynamic>> items) onImportLinks;
  final VoidCallback onOpenSettings;

  const SeoBacklinksTab({
    super.key,
    required this.data,
    required this.onImportLinks,
    required this.onOpenSettings,
  });

  @override
  State<SeoBacklinksTab> createState() => _SeoBacklinksTabState();
}

class _SeoBacklinksTabState extends State<SeoBacklinksTab> {
  final TextEditingController _csvCtrl = TextEditingController();
  bool _showImporter = false;
  bool _importing = false;

  @override
  void dispose() {
    _csvCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitImport() async {
    final lines = _csvCtrl.text
        .split('\n')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();
    final items = <Map<String, dynamic>>[];
    for (final line in lines) {
      final parts = line.split(',').map((p) => p.trim()).toList();
      if (parts.isNotEmpty && parts[0].isNotEmpty) {
        items.add({
          'referringDomain': parts[0],
          'linksCount': parts.length > 1 ? (int.tryParse(parts[1]) ?? 1) : 1,
          'targetPage': parts.length > 2 ? parts[2] : '/',
          'anchorText': parts.length > 3 ? parts[3] : '',
        });
      }
    }
    if (items.isEmpty) return;

    setState(() => _importing = true);
    try {
      await widget.onImportLinks(items);
      if (mounted) {
        _csvCtrl.clear();
        setState(() => _showImporter = false);
      }
    } finally {
      if (mounted) setState(() => _importing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bl = widget.data.backlinks;
    final connected = bl['connected'] == true;
    final summary = bl['summary'] as Map<String, dynamic>? ?? {};
    final list = (bl['referringDomainsList'] as List? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        OutlinedButton.icon(
          onPressed: () => setState(() => _showImporter = !_showImporter),
          icon: const Icon(Icons.upload_file_rounded, size: 18),
          label: Text(
            _showImporter ? 'Hide GSC Links Importer' : 'Import GSC Links Export',
          ),
        ),
        if (_showImporter) ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: SeoColors.cardBg(context),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: SeoColors.border(context)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Format: domain.com, linksCount, /target, anchorText',
                  style: TextStyle(
                    fontSize: 11,
                    color: SeoColors.textMuted(context),
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _csvCtrl,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    hintText: 'github.com, 4, /, Hangbug Quizzes',
                  ),
                ),
                const SizedBox(height: 10),
                ElevatedButton(
                  onPressed: _importing ? null : _submitImport,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: SeoColors.primaryDarkGreen,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(42),
                  ),
                  child: Text(_importing ? 'Importing...' : 'Save Links'),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 12),
        if (!connected)
          SeoEmptyIntegrationCard(
            title: 'No Backlink Provider Connected',
            description: bl['reason']?.toString() ??
                'Import a GSC Links export or configure OpenPageRank in Settings.',
            source: 'Google Search Console Links / OpenPageRank',
            onConfigure: widget.onOpenSettings,
          )
        else ...[
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Referring Domains: ${summary['referringDomains'] ?? '—'}',
                      style: AppTextStyles.labelBold,
                    ),
                    if (bl['isEstimated'] == true)
                      const SeoStatusBadge(status: 'Estimated'),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Total Backlinks: ${summary['totalBacklinks'] ?? '—'} · Source: ${bl['source'] ?? ''}',
                  style: TextStyle(
                    fontSize: 12,
                    color: SeoColors.textMuted(context),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          ...list.map((d) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: SeoColors.cardBg(context),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: SeoColors.border(context)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        '${d['referringDomain']} → ${d['targetPage']}',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Text(
                      '${d['linksCount']} link(s)',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: SeoColors.primaryBrand(context),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ],
    );
  }
}

/// 9. AI VISIBILITY TAB
class SeoAiVisibilityTab extends StatelessWidget {
  final SeoDashboardPayload data;

  const SeoAiVisibilityTab({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final ai = data.aiVisibility;
    final platforms = (ai['platforms'] as List? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final readiness = (ai['readinessChecks'] as List? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: SeoColors.mintSurface(context),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: SeoColors.accentGreen.withValues(alpha: 0.35),
            ),
          ),
          child: Text(
            ai['explanation']?.toString() ?? '',
            style: TextStyle(
              fontSize: 12,
              height: 1.4,
              color: SeoColors.textPrimary(context),
            ),
          ),
        ),
        const SizedBox(height: 12),
        ...platforms.map((p) => Container(
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
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        p['name']?.toString() ?? '',
                        style: AppTextStyles.labelBold.copyWith(
                          color: SeoColors.textPrimary(context),
                        ),
                      ),
                      SeoStatusBadge(
                        status: p['mentions'] != null ? 'Verified' : 'Unavailable',
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    p['mentions'] != null
                        ? 'Mentions: ${p['mentions']} · Cited Pages: ${p['citedPages']}'
                        : (p['reason']?.toString() ??
                            'Requires connected AI visibility provider.'),
                    style: TextStyle(
                      fontSize: 11.5,
                      color: SeoColors.textMuted(context),
                    ),
                  ),
                ],
              ),
            )),
        const SizedBox(height: 10),
        Text(
          'AI Crawler & Entity Readiness (Measured)',
          style: AppTextStyles.displaySmall.copyWith(
            fontSize: 15,
            color: SeoColors.textPrimary(context),
          ),
        ),
        const SizedBox(height: 8),
        ...readiness.map((r) => Container(
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
                          r['label']?.toString() ?? '',
                          style: const TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          r['detail']?.toString() ?? '',
                          style: TextStyle(
                            fontSize: 11,
                            color: SeoColors.textMuted(context),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SeoStatusBadge(
                    status: r['status']?.toString() ?? 'Not checked',
                  ),
                ],
              ),
            )),
      ],
    );
  }
}

/// 10. COMPETITORS TAB
class SeoCompetitorsTab extends StatefulWidget {
  final SeoDashboardPayload data;
  final Future<void> Function(String competitorDomain, String label) onAdd;
  final Future<void> Function(String id) onRefresh;
  final Future<void> Function(String id) onDelete;

  const SeoCompetitorsTab({
    super.key,
    required this.data,
    required this.onAdd,
    required this.onRefresh,
    required this.onDelete,
  });

  @override
  State<SeoCompetitorsTab> createState() => _SeoCompetitorsTabState();
}

class _SeoCompetitorsTabState extends State<SeoCompetitorsTab> {
  final TextEditingController _domCtrl = TextEditingController();
  final TextEditingController _labelCtrl = TextEditingController();
  bool _adding = false;

  @override
  void dispose() {
    _domCtrl.dispose();
    _labelCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_domCtrl.text.trim().isEmpty || _adding) return;
    setState(() => _adding = true);
    try {
      await widget.onAdd(_domCtrl.text.trim(), _labelCtrl.text.trim());
      if (mounted) {
        _domCtrl.clear();
        _labelCtrl.clear();
      }
    } finally {
      if (mounted) setState(() => _adding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
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
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Add Competitor Domain',
                style: AppTextStyles.labelBold.copyWith(
                  color: SeoColors.textPrimary(context),
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _domCtrl,
                decoration: const InputDecoration(
                  hintText: 'e.g. w3schools.com',
                  isDense: true,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _labelCtrl,
                decoration: const InputDecoration(
                  hintText: 'Label (optional)',
                  isDense: true,
                ),
              ),
              const SizedBox(height: 10),
              ElevatedButton.icon(
                onPressed: _adding ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: SeoColors.primaryDarkGreen,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(42),
                ),
                icon: const Icon(Icons.add_rounded, size: 18),
                label: Text(_adding ? 'Analyzing...' : 'Add & Compare'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        if (widget.data.competitors.isEmpty)
          Padding(
            padding: const EdgeInsets.all(20),
            child: Text(
              widget.data.competitorsExplanation,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: SeoColors.textMuted(context)),
            ),
          )
        else
          ...widget.data.competitors.map((comp) {
            final snap = comp.snapshot;
            final gaps = (snap['topicGapsForHangbug'] as List? ?? []);
            final tp = snap['thirdPartyMetrics'] as Map<String, dynamic>? ?? {};
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
                          comp.competitorDomain,
                          style: AppTextStyles.labelBold.copyWith(
                            fontSize: 14,
                            color: SeoColors.textPrimary(context),
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.refresh_rounded, size: 18),
                        onPressed: () => widget.onRefresh(comp.id),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline_rounded,
                            size: 18, color: Color(0xFFC96155)),
                        onPressed: () => widget.onDelete(comp.id),
                      ),
                    ],
                  ),
                  Text(
                    snap['homepageTitle']?.toString() ?? 'No title fetched',
                    style: TextStyle(
                      fontSize: 11.5,
                      color: SeoColors.textMuted(context),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Sitemap Entries: ${snap['sitemapEntriesDetected'] ?? (snap['hasSitemapXml'] == true ? 'Present' : 'Not exposed')} · Keywords (Est): ${tp['estimatedOrganicKeywords'] ?? 'Provider off'}',
                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600),
                  ),
                  if (gaps.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: gaps
                          .take(8)
                          .map((g) => Chip(
                                label: Text(g.toString(),
                                    style: const TextStyle(fontSize: 10.5)),
                                visualDensity: VisualDensity.compact,
                              ))
                          .toList(),
                    ),
                  ],
                ],
              ),
            );
          }),
      ],
    );
  }
}

/// 11. SEO RECOMMENDATIONS TAB
class SeoRecommendationsTab extends StatefulWidget {
  final SeoDashboardPayload data;
  final Future<void> Function(SeoRecommendationItem item) onToggle;

  const SeoRecommendationsTab({
    super.key,
    required this.data,
    required this.onToggle,
  });

  @override
  State<SeoRecommendationsTab> createState() => _SeoRecommendationsTabState();
}

class _SeoRecommendationsTabState extends State<SeoRecommendationsTab> {
  String _priority = 'all';

  @override
  Widget build(BuildContext context) {
    final recs = widget.data.recommendations.where((r) {
      if (_priority != 'all' &&
          r.priority.toLowerCase() != _priority.toLowerCase()) {
        return false;
      }
      return true;
    }).toList();

    final completed =
        widget.data.recommendations.where((r) => r.isCompleted).length;
    final total = widget.data.recommendations.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Action Center Progress',
                    style: AppTextStyles.labelBold,
                  ),
                  Text(
                    '$completed / $total completed',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: SeoColors.primaryBrand(context),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: total > 0 ? completed / total : 0.0,
                  minHeight: 7,
                  backgroundColor: SeoColors.border(context),
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    SeoColors.accentGreen,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: ['all', 'Critical', 'High', 'Medium', 'Opportunity']
                .map((p) => Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: ChoiceChip(
                        label: Text(p == 'all' ? 'All' : p),
                        selected: _priority == p,
                        onSelected: (_) => setState(() => _priority = p),
                      ),
                    ))
                .toList(),
          ),
        ),
        const SizedBox(height: 12),
        ...recs.map((rec) => Container(
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
                      SeoStatusBadge(status: rec.priority),
                      const Spacer(),
                      Checkbox(
                        value: rec.isCompleted,
                        activeColor: SeoColors.primaryDarkGreen,
                        onChanged: (_) => widget.onToggle(rec),
                      ),
                    ],
                  ),
                  Text(
                    rec.title,
                    style: AppTextStyles.labelBold.copyWith(
                      fontSize: 13.5,
                      decoration:
                          rec.isCompleted ? TextDecoration.lineThrough : null,
                      color: SeoColors.textPrimary(context),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    rec.explanation,
                    style: TextStyle(
                      fontSize: 12,
                      color: SeoColors.textMuted(context),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Benefit: ${rec.expectedBenefit}',
                    style: const TextStyle(fontSize: 11.5),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Action: ${rec.suggestedAction}',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: SeoColors.primaryBrand(context),
                    ),
                  ),
                ],
              ),
            )),
      ],
    );
  }
}

/// 12. SETTINGS TAB
class SeoSettingsTab extends StatefulWidget {
  final String domain;
  final Map<String, dynamic> initialSettings;
  final Future<void> Function(Map<String, dynamic> payload) onSave;
  final Future<Map<String, dynamic>> Function(String target) onTest;

  const SeoSettingsTab({
    super.key,
    required this.domain,
    required this.initialSettings,
    required this.onSave,
    required this.onTest,
  });

  @override
  State<SeoSettingsTab> createState() => _SeoSettingsTabState();
}

class _SeoSettingsTabState extends State<SeoSettingsTab> {
  late final TextEditingController _siteUrlCtrl;
  late final TextEditingController _gscCtrl;
  late final TextEditingController _ga4Ctrl;
  late final TextEditingController _saEmailCtrl;
  final TextEditingController _saKeyCtrl = TextEditingController();
  final TextEditingController _saJsonCtrl = TextEditingController();
  final TextEditingController _psiKeyCtrl = TextEditingController();
  late String _crawlFreq;
  bool _saving = false;
  Map<String, dynamic>? _testResult;

  @override
  void initState() {
    super.initState();
    final s = widget.initialSettings;
    _siteUrlCtrl = TextEditingController(
      text: s['siteUrl']?.toString() ?? 'https://www.hangbug.com',
    );
    _gscCtrl = TextEditingController(
      text: s['gscProperty']?.toString() ?? 'sc-domain:hangbug.com',
    );
    _ga4Ctrl = TextEditingController(
      text: s['ga4PropertyId']?.toString() ?? '',
    );
    _saEmailCtrl = TextEditingController(
      text: s['googleServiceAccountEmail']?.toString() ??
          s['googleServiceAccountEmailMasked']?.toString() ??
          '',
    );
    _crawlFreq = s['crawlFrequency']?.toString() ?? 'daily';
  }

  @override
  void dispose() {
    _siteUrlCtrl.dispose();
    _gscCtrl.dispose();
    _ga4Ctrl.dispose();
    _saEmailCtrl.dispose();
    _saKeyCtrl.dispose();
    _saJsonCtrl.dispose();
    _psiKeyCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (_saving) return;
    setState(() => _saving = true);
    try {
      await widget.onSave({
        'siteUrl': _siteUrlCtrl.text.trim(),
        'gscProperty': _gscCtrl.text.trim(),
        'ga4PropertyId': _ga4Ctrl.text.trim(),
        'googleServiceAccountEmail': _saEmailCtrl.text.trim(),
        if (_saKeyCtrl.text.trim().isNotEmpty)
          'googlePrivateKey': _saKeyCtrl.text.trim(),
        if (_saJsonCtrl.text.trim().isNotEmpty)
          'googleServiceAccountJson': _saJsonCtrl.text.trim(),
        if (_psiKeyCtrl.text.trim().isNotEmpty)
          'pagespeedApiKey': _psiKeyCtrl.text.trim(),
        'crawlFrequency': _crawlFreq,
      });
      if (mounted) {
        _saKeyCtrl.clear();
        _saJsonCtrl.clear();
        _psiKeyCtrl.clear();
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _handleTest(String target) async {
    final res = await widget.onTest(target);
    if (mounted) {
      setState(() {
        _testResult = res;
        if (target == 'gsc' && res['property'] != null) {
          _gscCtrl.text = res['property'].toString();
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.initialSettings;
    final authStatus = _testResult?['authStatus']?.toString() ??
        s['gscAuthStatus']?.toString() ??
        (s['hasGoogleServiceAccount'] == true
            ? 'Authenticated'
            : 'Not Configured');
    final saEmail = _testResult?['serviceAccountEmail']?.toString() ??
        s['googleServiceAccountEmail']?.toString() ??
        (_saEmailCtrl.text.isNotEmpty
            ? _saEmailCtrl.text
            : (s['googleServiceAccountEmailMasked']?.toString() ??
                'Not configured'));
    final selectedProp = _testResult?['property']?.toString() ??
        (_gscCtrl.text.isNotEmpty
            ? _gscCtrl.text
            : (s['gscProperty']?.toString() ?? 'sc-domain:hangbug.com'));
    final permLevel = _testResult?['permissionLevel']?.toString() ??
        s['gscPermissionLevel']?.toString() ??
        (s['gscPropertyVerified'] == true ? 'Verified' : 'Not verified');
    final availableProps = ((_testResult?['availableProperties'] as List?) ??
            (s['gscAvailableProperties'] as List?) ??
            [])
        .whereType<Map<String, dynamic>>()
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            OutlinedButton(
              onPressed: () => _handleTest('gsc'),
              child: const Text('Test GSC'),
            ),
            OutlinedButton(
              onPressed: () => _handleTest('ga4'),
              child: const Text('Test GA4'),
            ),
            OutlinedButton(
              onPressed: () => _handleTest('pagespeed'),
              child: const Text('Test PageSpeed'),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: SeoColors.cardBg(context),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: SeoColors.border(context)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Google Search Console Verification',
                style: AppTextStyles.labelBold.copyWith(
                  fontSize: 13.5,
                  color: SeoColors.textPrimary(context),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Authentication Status: $authStatus',
                style: const TextStyle(fontSize: 11.5),
              ),
              Text(
                'Service Account Email: $saEmail',
                style: const TextStyle(fontSize: 11.5),
              ),
              Text(
                'Selected Property: $selectedProp',
                style: const TextStyle(fontSize: 11.5),
              ),
              Text(
                'Google Permission Level: $permLevel',
                style: const TextStyle(fontSize: 11.5),
              ),
              const SizedBox(height: 6),
              Text(
                'Available Search Console Properties (${availableProps.length}):',
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (availableProps.isEmpty)
                Text(
                  s['gscVerificationMessage']?.toString() ??
                      'Add $saEmail to Google Search Console Users & permissions for sc-domain:hangbug.com.',
                  style: TextStyle(
                    fontSize: 11,
                    color: SeoColors.textMuted(context),
                  ),
                )
              else
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: availableProps.map((p) {
                    final siteUrl = p['siteUrl']?.toString() ?? '';
                    final pLevel = p['permissionLevel']?.toString() ?? '';
                    return ActionChip(
                      label: Text(
                        '$siteUrl ($pLevel)',
                        style: const TextStyle(fontSize: 11),
                      ),
                      onPressed: () {
                        setState(() => _gscCtrl.text = siteUrl);
                      },
                    );
                  }).toList(),
                ),
            ],
          ),
        ),
        if (_testResult != null) ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _testResult!['ok'] == true
                  ? SeoColors.mintSurface(context)
                  : const Color(0xFFFEF5E7),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              'Test Connection Result — ${_testResult!['provider'] ?? 'Integration'}: ${_testResult!['message'] ?? 'Tested'}',
              style: const TextStyle(fontSize: 12),
            ),
          ),
        ],
        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: SeoColors.cardBg(context),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: SeoColors.border(context)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextField(
                controller: _siteUrlCtrl,
                decoration: const InputDecoration(labelText: 'Site URL'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _gscCtrl,
                decoration: const InputDecoration(
                  labelText: 'Google Search Console Property',
                  hintText: 'sc-domain:hangbug.com',
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _ga4Ctrl,
                decoration: const InputDecoration(
                  labelText: 'GA4 Numeric Property ID',
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _saEmailCtrl,
                decoration: const InputDecoration(
                  labelText: 'Google Service Account Email',
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _saKeyCtrl,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'New Private Key (blank keeps existing)',
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _saJsonCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Or Paste Full Google Service Account JSON',
                  hintText:
                      '{"type":"service_account","client_email":"...","private_key":"..."}',
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _psiKeyCtrl,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'PageSpeed Insights API Key (Optional)',
                ),
              ),
              const SizedBox(height: 10),
              InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Audit Frequency',
                  isDense: true,
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _crawlFreq,
                    isDense: true,
                    items: const [
                      DropdownMenuItem(value: 'hourly', child: Text('Hourly')),
                      DropdownMenuItem(value: 'daily', child: Text('Daily')),
                      DropdownMenuItem(value: 'weekly', child: Text('Weekly')),
                      DropdownMenuItem(value: 'manual', child: Text('Manual')),
                    ],
                    onChanged: (v) =>
                        setState(() => _crawlFreq = v ?? 'daily'),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              ElevatedButton(
                onPressed: _saving ? null : _handleSave,
                style: ElevatedButton.styleFrom(
                  backgroundColor: SeoColors.primaryDarkGreen,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(44),
                ),
                child: Text(_saving ? 'Saving...' : 'Save SEO Settings'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
