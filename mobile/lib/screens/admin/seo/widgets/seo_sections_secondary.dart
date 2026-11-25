import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../models/seo_dashboard_model.dart';
import 'seo_charts.dart';
import 'seo_theme_tokens.dart';

const String kPageSpeedQuotaExhaustedMessage =
    'Google PageSpeed API daily quota has been reached. Previously cached reports are still available. Please try again after the quota resets.';

/// 7. TECHNICAL SEO TAB
class SeoTechnicalTab extends StatefulWidget {
  final SeoDashboardPayload data;
  final Future<void> Function(String url, String strategy, {bool forceRefresh})
      onRunPageSpeed;
  final Future<Map<String, dynamic>> Function()? onTestPageSpeedConnection;

  const SeoTechnicalTab({
    super.key,
    required this.data,
    required this.onRunPageSpeed,
    this.onTestPageSpeedConnection,
  });

  @override
  State<SeoTechnicalTab> createState() => _SeoTechnicalTabState();
}

class _SeoTechnicalTabState extends State<SeoTechnicalTab> {
  String _strategy = 'mobile';
  String _targetPath = '/';
  bool _runningPsi = false;
  bool _testingConnection = false;
  Map<String, dynamic>? _connectionResult;

  Map<String, dynamic> _resolveUrlCache(Map<String, dynamic> psi) {
    final byPath = psi['byPath'] as Map<String, dynamic>? ?? {};
    final byUrl = psi['byUrl'] as Map<String, dynamic>? ?? {};
    final fullUrl = '${widget.data.siteUrl}$_targetPath';

    if (byPath[_targetPath] is Map<String, dynamic>) {
      return byPath[_targetPath] as Map<String, dynamic>;
    }
    if (byUrl[fullUrl] is Map<String, dynamic>) {
      return byUrl[fullUrl] as Map<String, dynamic>;
    }

    final topMobile = psi['mobile'] as Map<String, dynamic>?;
    final topDesktop = psi['desktop'] as Map<String, dynamic>?;
    final mobileMatch = topMobile != null &&
        (topMobile['path'] == _targetPath ||
            topMobile['url'] == fullUrl ||
            _targetPath == '/');
    final desktopMatch = topDesktop != null &&
        (topDesktop['path'] == _targetPath ||
            topDesktop['url'] == fullUrl ||
            _targetPath == '/');

    return {
      'url': fullUrl,
      'path': _targetPath,
      'mobile': mobileMatch ? topMobile : null,
      'desktop': desktopMatch ? topDesktop : null,
    };
  }

  Future<void> _triggerPsi({
    required bool hasExistingCache,
    required String? lastCheckedAt,
  }) async {
    if (_runningPsi) return;
    bool forceRefresh = false;

    if (hasExistingCache) {
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Confirm Live PageSpeed Refresh'),
          content: Text(
            'A cached $_strategy report for $_targetPath '
            '${lastCheckedAt != null ? "from $lastCheckedAt " : ""}'
            'is already available (24-hour cache). Running a live refresh will consume Google PageSpeed API quota. Proceed?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Keep Cached Report'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: SeoColors.primaryDarkGreen,
                foregroundColor: Colors.white,
              ),
              onPressed: () => Navigator.of(ctx).pop(true),
              child: const Text('Confirm Live Refresh'),
            ),
          ],
        ),
      );
      if (confirmed != true) return;
      forceRefresh = true;
    }

    setState(() => _runningPsi = true);
    try {
      await widget.onRunPageSpeed(
        _targetPath,
        _strategy,
        forceRefresh: forceRefresh,
      );
    } finally {
      if (mounted) setState(() => _runningPsi = false);
    }
  }

  Future<void> _triggerConnectionTest() async {
    if (_testingConnection || _runningPsi || widget.onTestPageSpeedConnection == null) {
      return;
    }
    setState(() {
      _testingConnection = true;
      _connectionResult = null;
    });
    try {
      final res = await widget.onTestPageSpeedConnection!();
      if (mounted) {
        setState(() => _connectionResult = res);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _connectionResult = {
              'ok': false,
              'connectionStatus': 'Connection Error',
              'message': e.toString().replaceFirst('Exception: ', ''),
            });
      }
    } finally {
      if (mounted) setState(() => _testingConnection = false);
    }
  }

  List<Map<String, String>> _buildPrioritizedDropdownItems(
    Map<String, dynamic> psi,
  ) {
    final rawList = psi['auditableUrls'] as List?;
    if (rawList != null && rawList.isNotEmpty) {
      final seen = <String>{};
      final items = <Map<String, String>>[];
      for (final entry in rawList.whereType<Map<String, dynamic>>()) {
        final p = entry['path']?.toString() ?? '/';
        if (seen.add(p)) {
          final hasCache = entry['hasMobileCache'] == true ||
              entry['hasDesktopCache'] == true;
          final label = entry['label']?.toString() ?? p;
          items.add({
            'path': p,
            'label': hasCache ? '$label [Cached]' : label,
          });
        }
      }
      if (items.isNotEmpty) return items;
    }

    return const [
      {'path': '/', 'label': '/ (Homepage)'},
      {'path': '/technologies', 'label': '/technologies (Tech Hub)'},
      {
        'path': '/technologies/javascript',
        'label': '/technologies/javascript'
      },
      {'path': '/technologies/react', 'label': '/technologies/react'},
      {'path': '/technologies/python', 'label': '/technologies/python'},
      {'path': '/technologies/html', 'label': '/technologies/html'},
      {'path': '/technologies/css', 'label': '/technologies/css'},
      {'path': '/technologies/csharp', 'label': '/technologies/csharp'},
      {'path': '/blog', 'label': '/blog (Published Articles)'},
      {'path': '/games', 'label': '/games (Public Games Hub)'},
      {'path': '/games/memory-match', 'label': '/games/memory-match'},
      {'path': '/games/code-jumble', 'label': '/games/code-jumble'},
      {'path': '/games/bug-hunter', 'label': '/games/bug-hunter'},
    ];
  }

  @override
  Widget build(BuildContext context) {
    final tech = widget.data.technical;
    final psi = tech['pageSpeed'] as Map<String, dynamic>? ?? {};
    final urlCache = _resolveUrlCache(psi);
    final mobilePsi = urlCache['mobile'] as Map<String, dynamic>?;
    final desktopPsi = urlCache['desktop'] as Map<String, dynamic>?;
    final activePsi = _strategy == 'desktop' ? desktopPsi : mobilePsi;
    final cwv = activePsi?['coreWebVitals'] as Map<String, dynamic>? ?? {};
    final scores = activePsi?['scores'] as Map<String, dynamic>? ?? {};

    final mobilePerf = (mobilePsi?['scores'] as Map<String, dynamic>?)?['performance'];
    final desktopPerf = (desktopPsi?['scores'] as Map<String, dynamic>?)?['performance'];

    final quotaState = psi['quotaState'] as Map<String, dynamic>?;
    final lastError = psi['lastError'] as Map<String, dynamic>?;
    final activeError =
        (quotaState != null && (quotaState['exhausted'] == true || quotaState['errorCategory'] != null))
            ? quotaState
            : lastError;
    final isDailyQuotaExhausted = quotaState?['exhausted'] == true ||
        activeError?['errorCategory'] == 'daily_quota_exceeded';
    final nextRetryAt = activeError?['nextRetryAt']?.toString() ??
        psi['nextRetryAt']?.toString();

    final lastAuditDate = activePsi?['checkedAt']?.toString() ??
        mobilePsi?['checkedAt']?.toString() ??
        desktopPsi?['checkedAt']?.toString() ??
        psi['lastAuditedAt']?.toString();

    final cachedStatus = activePsi != null
        ? (isDailyQuotaExhausted
            ? 'Cached Report (Quota Fallback)'
            : 'Cached (24h TTL Active)')
        : ((mobilePsi != null || desktopPsi != null)
            ? 'Cached (${mobilePsi != null ? "Mobile" : "Desktop"} Available)'
            : 'No Cached Report');

    final psiConnectionStatus = _connectionResult?['connectionStatus']?.toString() ??
        psi['connectionStatus']?.toString() ??
        widget.data.integrations['pagespeedConnectionStatus']?.toString() ??
        (psi['apiKeyConfigured'] == true ||
                widget.data.integrations['pagespeedHasKey'] == true
            ? 'Configured (Not Tested)'
            : 'Not Configured');

    final dropdownItems = _buildPrioritizedDropdownItems(psi);
    final selectedExists = dropdownItems.any((e) => e['path'] == _targetPath);
    final effectiveSelected = selectedExists ? _targetPath : '/';

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
                  Expanded(
                    child: Text(
                      'Page Speed & Core Web Vitals',
                      style: AppTextStyles.labelBold.copyWith(
                        fontSize: 15,
                        color: SeoColors.textPrimary(context),
                      ),
                    ),
                  ),
                  SeoStatusBadge(
                    status: (tech['coreWebVitals']?['status'] ??
                            psi['status'] ??
                            'Not checked')
                        .toString(),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  SeoStatusBadge(status: 'API: $psiConnectionStatus'),
                  SeoStatusBadge(status: cachedStatus),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Prioritized URL',
                        isDense: true,
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: effectiveSelected,
                          isExpanded: true,
                          isDense: true,
                          items: dropdownItems
                              .map(
                                (item) => DropdownMenuItem<String>(
                                  value: item['path'],
                                  child: Text(
                                    item['label'] ?? item['path'] ?? '/',
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                ),
                              )
                              .toList(),
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
              // Summary metrics: Last Audit Date, Cached Result Status, Mobile & Desktop Performance
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: SeoColors.scaffoldBg(context),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: SeoColors.border(context)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Last Audit Date: ${lastAuditDate ?? "Not audited yet"}',
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: SeoColors.textPrimary(context),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Cached Result Status: $cachedStatus',
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: SeoColors.primaryBrand(context),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Mobile Performance: ${mobilePerf is num ? "$mobilePerf/100" : "Not audited"}',
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            'Desktop Performance: ${desktopPerf is num ? "$desktopPerf/100" : "Not audited"}',
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (activeError != null) ...[
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF5E7),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFF8DFB6)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isDailyQuotaExhausted
                            ? kPageSpeedQuotaExhaustedMessage
                            : (activeError['userMessage']?.toString() ??
                                activeError['message']?.toString() ??
                                'PageSpeed API notice'),
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF92400E),
                        ),
                      ),
                      if (activeError['message'] != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Error Details (${activeError['errorCategory'] ?? 'api_error'}): ${activeError['message']}',
                          style: const TextStyle(
                            fontSize: 10.5,
                            color: Color(0xFF92400E),
                          ),
                        ),
                      ],
                      if (nextRetryAt != null && nextRetryAt.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Next Available Retry: $nextRetryAt',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF92400E),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 10),
              ElevatedButton.icon(
                onPressed: (_runningPsi ||
                        _testingConnection ||
                        (isDailyQuotaExhausted && activePsi != null))
                    ? null
                    : () => _triggerPsi(
                          hasExistingCache: activePsi != null,
                          lastCheckedAt: activePsi?['checkedAt']?.toString(),
                        ),
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
                label: Text(
                  _runningPsi
                      ? 'Running PageSpeed Insights...'
                      : activePsi != null
                          ? 'Refresh PageSpeed Audit'
                          : 'Run PageSpeed Check',
                ),
              ),
              if (widget.onTestPageSpeedConnection != null) ...[
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: (_testingConnection || _runningPsi)
                      ? null
                      : _triggerConnectionTest,
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(40),
                  ),
                  icon: _testingConnection
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.bolt_rounded, size: 18),
                  label: Text(
                    _testingConnection
                        ? 'Testing PageSpeed Connection...'
                        : 'Test PageSpeed Connection',
                  ),
                ),
              ],
              if (_connectionResult != null) ...[
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: _connectionResult!['ok'] == true
                        ? SeoColors.mintSurface(context)
                        : const Color(0xFFFEF5E7),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _connectionResult!['message']?.toString() ?? '',
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
              if (activePsi != null) ...[
                const SizedBox(height: 14),
                Text(
                  'Performance: ${scores['performance'] ?? '—'} · Accessibility: ${scores['accessibility'] ?? '—'} · Best Practices: ${scores['bestPractices'] ?? '—'} · SEO: ${scores['seo'] ?? '—'}',
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
                  isDailyQuotaExhausted
                      ? kPageSpeedQuotaExhaustedMessage
                      : (psi['explanation']?.toString() ??
                          'Run PageSpeed Check to measure live LCP, CLS, INP, and Lighthouse scores.'),
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
          final schemasDetected = (map['schemasDetected'] as List? ?? [])
              .map((e) => e.toString())
              .where((e) => e.isNotEmpty)
              .toList();
          final affectedUrls = (map['affectedUrls'] as List? ?? [])
              .whereType<Map>()
              .map((e) => {
                    'url': e['url']?.toString() ?? '',
                    'detail': e['detail']?.toString() ?? '',
                  })
              .where((e) => (e['url'] ?? '').isNotEmpty)
              .toList();
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
                if (schemasDetected.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: schemasDetected
                        .map(
                          (schema) => Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: SeoColors.mintSurface(context),
                              borderRadius: BorderRadius.circular(8),
                              border:
                                  Border.all(color: SeoColors.border(context)),
                            ),
                            child: Text(
                              schema,
                              style: TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                                color: SeoColors.textPrimary(context),
                              ),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ],
                if (affectedUrls.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  ...affectedUrls.take(5).map(
                        (item) {
                          final detail = item['detail'] ?? '';
                          return Padding(
                            padding: const EdgeInsets.only(top: 3),
                            child: Text(
                              '• ${item['url']}${detail.isNotEmpty ? ' — $detail' : ''}',
                              style: TextStyle(
                                fontSize: 11,
                                fontFamily: 'monospace',
                                color: SeoColors.textMuted(context),
                              ),
                            ),
                          );
                        },
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

/// 8. BACKLINKS TAB
class SeoBacklinksTab extends StatefulWidget {
  final SeoDashboardPayload data;
  final Future<void> Function(List<Map<String, dynamic>> items) onImportLinks;
  final Future<void> Function(String csvText, String fileName)? onImportCsv;
  final Future<void> Function()? onClearImport;
  final Future<Map<String, dynamic>> Function()? onTestOpenPageRank;
  final VoidCallback onOpenSettings;

  const SeoBacklinksTab({
    super.key,
    required this.data,
    required this.onImportLinks,
    this.onImportCsv,
    this.onClearImport,
    this.onTestOpenPageRank,
    required this.onOpenSettings,
  });

  @override
  State<SeoBacklinksTab> createState() => _SeoBacklinksTabState();
}

class _SeoBacklinksTabState extends State<SeoBacklinksTab> {
  final TextEditingController _csvCtrl = TextEditingController();
  String _selectedFileName = '';
  bool _showImporter = false;
  bool _importing = false;
  bool _clearing = false;
  bool _testingOpr = false;
  String _gscSubTab = 'domains';

  @override
  void dispose() {
    _csvCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickCsvFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: const ['csv', 'txt'],
        withData: true,
      );
      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        final bytes = file.bytes;
        if (bytes != null) {
          final content = utf8.decode(bytes, allowMalformed: true);
          if (mounted) {
            setState(() {
              _selectedFileName = file.name;
              _csvCtrl.text = content;
            });
          }
        }
      }
    } catch (_) {
      // Ignore picker cancel/error
    }
  }

  Future<void> _submitImport() async {
    final rawText = _csvCtrl.text.trim();
    if (rawText.isEmpty) return;

    setState(() => _importing = true);
    try {
      if (widget.onImportCsv != null) {
        await widget.onImportCsv!(
          rawText,
          _selectedFileName.isNotEmpty
              ? _selectedFileName
              : 'gsc-links-export.csv',
        );
      } else {
        final lines = rawText
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
              'linksCount':
                  parts.length > 1 ? (int.tryParse(parts[1]) ?? 1) : 1,
              'targetPage': parts.length > 2 ? parts[2] : '/',
              'anchorText': parts.length > 3 ? parts[3] : '',
            });
          }
        }
        if (items.isNotEmpty) {
          await widget.onImportLinks(items);
        }
      }
      if (mounted) {
        _csvCtrl.clear();
        setState(() {
          _selectedFileName = '';
          _showImporter = false;
        });
      }
    } finally {
      if (mounted) setState(() => _importing = false);
    }
  }

  Future<void> _triggerTestOpr() async {
    if (_testingOpr || widget.onTestOpenPageRank == null) return;
    setState(() => _testingOpr = true);
    try {
      await widget.onTestOpenPageRank!();
    } finally {
      if (mounted) setState(() => _testingOpr = false);
    }
  }

  Future<void> _triggerClearImport() async {
    if (_clearing || widget.onClearImport == null) return;
    setState(() => _clearing = true);
    try {
      await widget.onClearImport!();
    } finally {
      if (mounted) setState(() => _clearing = false);
    }
  }

  Widget _buildOverviewCard(
    BuildContext context, {
    required String title,
    required String value,
    required String badge,
    required String explanation,
    required String footer,
  }) {
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
                title,
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: SeoColors.textMuted(context),
                ),
              ),
              SeoStatusBadge(status: badge),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTextStyles.displaySmall.copyWith(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: SeoColors.textPrimary(context),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            explanation,
            style: TextStyle(
              fontSize: 11.5,
              height: 1.35,
              color: SeoColors.textMuted(context),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            footer,
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.w600,
              color: SeoColors.primaryBrand(context),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bl = widget.data.backlinks;
    final opr = bl['openPageRank'] as Map<String, dynamic>? ?? {};
    final gscImport = bl['gscLinksImport'] as Map<String, dynamic>? ?? {};
    final explanations =
        bl['metricExplanations'] as Map<String, dynamic>? ?? {};

    final connectionStatus = opr['connectionStatus']?.toString() ??
        bl['connectionStatus']?.toString() ??
        'Not Configured';
    final isOprConnected =
        connectionStatus == 'Connected' && opr['connected'] == true;

    final oprScore = opr['score'];
    final globalRank = opr['globalRank'];
    final oprReferringDomains = opr['referringDomains'];
    final quota = opr['quota'] as Map<String, dynamic>?;
    final history = (opr['history'] as List? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final historySummary =
        opr['historySummary'] as Map<String, dynamic>? ?? {};

    final gscAvailable = gscImport['available'] == true;
    final externalDomains = ((gscImport['externalLinkingDomains'] as List?) ??
            (bl['referringDomainsList'] as List?) ??
            [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final targetPages = ((gscImport['targetPages'] as List?) ??
            (bl['targetPagesList'] as List?) ??
            [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final linkingPages = ((gscImport['linkingPages'] as List?) ??
            (bl['linkingPagesList'] as List?) ??
            [])
        .whereType<Map<String, dynamic>>()
        .toList();

    final quotaDisplay = (quota != null && quota['domainsRemaining'] != null)
        ? '${quota['domainsRemaining']} / ${quota['monthlyDomainLimit'] ?? 30000} remaining'
        : (isOprConnected ? 'Quota active' : 'Available after connection');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. OpenPageRank Connection Status & Action Header
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
                  Expanded(
                    child: Text(
                      'Backlink Overview & OpenPageRank',
                      style: AppTextStyles.labelBold.copyWith(
                        fontSize: 15,
                        color: SeoColors.textPrimary(context),
                      ),
                    ),
                  ),
                  SeoStatusBadge(status: connectionStatus),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Domain: ${opr['domain'] ?? 'hangbug.com'} · Last Data Update: ${opr['syncedAt'] ?? bl['lastDataUpdate'] ?? 'Not synced yet'}${opr['asOf'] != null ? ' · Release: ${opr['asOf']}' : ''}',
                style: TextStyle(
                  fontSize: 11.5,
                  color: SeoColors.textMuted(context),
                ),
              ),
              if (!isOprConnected &&
                  (opr['message']?.toString().isNotEmpty == true ||
                      bl['reason']?.toString().isNotEmpty == true)) ...[
                const SizedBox(height: 8),
                Text(
                  opr['message']?.toString() ?? bl['reason']?.toString() ?? '',
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: Color(0xFFB45309),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (widget.onTestOpenPageRank != null)
                    OutlinedButton.icon(
                      onPressed: _testingOpr ? null : _triggerTestOpr,
                      icon: const Icon(Icons.bolt_rounded, size: 16),
                      label: Text(
                        _testingOpr ? 'Testing...' : 'Test Connection',
                      ),
                    ),
                  OutlinedButton.icon(
                    onPressed: () =>
                        setState(() => _showImporter = !_showImporter),
                    icon: const Icon(Icons.upload_file_rounded, size: 16),
                    label: Text(
                      _showImporter
                          ? 'Hide GSC Links Importer'
                          : 'Import Google Search Console Links Report',
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: widget.onOpenSettings,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: SeoColors.primaryDarkGreen,
                      foregroundColor: Colors.white,
                    ),
                    icon: const Icon(Icons.settings_rounded, size: 16),
                    label: const Text('API Settings'),
                  ),
                ],
              ),
            ],
          ),
        ),

        // 2. Manual Google Search Console Links Importer
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
                  'Import Google Search Console Links Report (Official CSV)',
                  style: AppTextStyles.labelBold.copyWith(
                    color: SeoColors.textPrimary(context),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Upload your official Google Search Console Links CSV export or paste CSV rows. Preserves original source and import date as a static snapshot (not live backlink data).',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: SeoColors.textMuted(context),
                  ),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: _pickCsvFile,
                  icon: const Icon(Icons.folder_open_rounded, size: 16),
                  label: Text(
                    _selectedFileName.isNotEmpty
                        ? 'Selected: $_selectedFileName'
                        : 'Select Official GSC CSV File',
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _csvCtrl,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    hintText:
                        'Source page,Target page\nhttps://github.com/org/repo,https://www.hangbug.com/technologies/javascript',
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
                  child: Text(
                    _importing ? 'Importing CSV...' : 'Import GSC Links Report',
                  ),
                ),
              ],
            ),
          ),
        ],

        const SizedBox(height: 12),

        // 3. Backlink Overview Metric Cards (with Simple-Language Explanations)
        _buildOverviewCard(
          context,
          title: 'OpenPageRank Score (0–10)',
          value: isOprConnected && oprScore != null
              ? '$oprScore / 10'
              : connectionStatus,
          badge: isOprConnected ? 'Connected' : connectionStatus,
          explanation: explanations['openPageRankScore']?.toString() ??
              "An external estimate of your website's authority based on its link graph. It is not a Google ranking score.",
          footer:
              'Source: OpenPageRank API${opr['asOf'] != null ? ' · Release ${opr['asOf']}' : ''}',
        ),
        _buildOverviewCard(
          context,
          title: 'Global Domain Rank',
          value: isOprConnected && globalRank != null
              ? '#$globalRank'
              : connectionStatus,
          badge: 'Link Graph Rank',
          explanation: explanations['globalDomainRank']?.toString() ??
              "Your website's estimated global position in the OpenPageRank link graph (#1 is highest worldwide).",
          footer: 'Source: OpenPageRank Link Graph',
        ),
        _buildOverviewCard(
          context,
          title: 'Referring Domains (OpenPageRank)',
          value: isOprConnected && oprReferringDomains != null
              ? '$oprReferringDomains'
              : connectionStatus,
          badge: 'Provider Estimate',
          explanation: explanations['referringDomains']?.toString() ??
              'The number of linking domains reported by the selected data provider. This is an authority-weighted count from OpenPageRank, not a complete verified backlink count.',
          footer:
              'Source: OpenPageRank (referring_domains) · Not a full backlink count',
        ),
        _buildOverviewCard(
          context,
          title: 'API Usage & Remaining Quota',
          value: quotaDisplay,
          badge: quota?['tier']?.toString().toUpperCase() ?? 'QUOTA',
          explanation: explanations['apiQuota']?.toString() ??
              "Your OpenPageRank plan's monthly domain lookup usage and remaining quota.",
          footer: quota?['domainsUsed'] != null
              ? 'Domains used this month: ${quota!['domainsUsed']} · RPM limit: ${quota['requestsPerMinute'] ?? 60}'
              : 'Monthly OpenPageRank quota allowance',
        ),

        // 4. Historical Authority Chart & Measured vs Estimated Breakdown
        const SizedBox(height: 6),
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
                  Expanded(
                    child: Text(
                      'Monthly Authority History',
                      style: AppTextStyles.labelBold.copyWith(
                        fontSize: 14.5,
                        color: SeoColors.textPrimary(context),
                      ),
                    ),
                  ),
                  SeoStatusBadge(
                    status: historySummary['growthStatus']?.toString() ??
                        'History',
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                explanations['monthlyAuthorityHistory']?.toString() ??
                    'Monthly authority scores (0–10). Measured months come from Common Crawl releases; Estimated months are linearly interpolated.',
                style: TextStyle(
                  fontSize: 11.5,
                  color: SeoColors.textMuted(context),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Availability: ${historySummary['totalMonths'] ?? 0} months · Measured: ${historySummary['measuredMonthsCount'] ?? 0} · Estimated: ${historySummary['estimatedMonthsCount'] ?? 0}',
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: SeoColors.primaryBrand(context),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'MoM Change: ${historySummary['monthOverMonthChange'] ?? 'N/A'} · 12M YoY Change: ${historySummary['yearOverYearChange'] ?? 'N/A'} · All-Time Change: ${historySummary['allTimeChange'] ?? 'N/A'}',
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 10),
              SeoTrendChart(
                title: 'OpenPageRank Monthly Authority (0–10)',
                values: history
                    .map((h) =>
                        (h['open_page_rank'] is num)
                            ? (h['open_page_rank'] as num).toDouble()
                            : 0.0)
                    .toList(),
                labels:
                    history.map((h) => h['date']?.toString() ?? '').toList(),
                color: SeoColors.primaryDarkGreen,
              ),
              if (history.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  'Recent Monthly Authority Points (Measured vs Estimated):',
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 6),
                ...history.reversed.take(6).map((pt) {
                  final isEst = pt['estimated'] == true;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 5),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${pt['date']} — Score: ${pt['open_page_rank']}/10',
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SeoStatusBadge(
                          status: isEst
                              ? 'Estimated (Interpolated)'
                              : 'Measured (Release)',
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ],
          ),
        ),

        // 5. Imported Google Search Console Links Report Section
        const SizedBox(height: 12),
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
                  Expanded(
                    child: Text(
                      'Imported Google Search Console Links Report',
                      style: AppTextStyles.labelBold.copyWith(
                        fontSize: 14.5,
                        color: SeoColors.textPrimary(context),
                      ),
                    ),
                  ),
                  SeoStatusBadge(
                    status: gscAvailable ? 'Static CSV Snapshot' : 'No CSV',
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                gscImport['disclosure']?.toString() ??
                    'Upload an official Google Search Console Links CSV export to inspect external linking domains, target pages, and available linking-page details.',
                style: TextStyle(
                  fontSize: 11.5,
                  color: SeoColors.textMuted(context),
                ),
              ),
              if (gscAvailable) ...[
                const SizedBox(height: 8),
                Text(
                  'Original Source: ${gscImport['originalSource'] ?? 'Google Search Console Links CSV'} · File: ${gscImport['fileName'] ?? 'gsc-links-export.csv'}',
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  'Imported Report Date: ${gscImport['importedAt'] ?? 'Recent'}',
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: SeoColors.primaryBrand(context),
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      ChoiceChip(
                        label: Text(
                          'External Domains (${externalDomains.length})',
                        ),
                        selected: _gscSubTab == 'domains',
                        onSelected: (_) =>
                            setState(() => _gscSubTab = 'domains'),
                      ),
                      const SizedBox(width: 6),
                      ChoiceChip(
                        label: Text('Target Pages (${targetPages.length})'),
                        selected: _gscSubTab == 'targets',
                        onSelected: (_) =>
                            setState(() => _gscSubTab = 'targets'),
                      ),
                      const SizedBox(width: 6),
                      ChoiceChip(
                        label: Text('Linking Pages (${linkingPages.length})'),
                        selected: _gscSubTab == 'pages',
                        onSelected: (_) => setState(() => _gscSubTab = 'pages'),
                      ),
                      if (widget.onClearImport != null) ...[
                        const SizedBox(width: 8),
                        ActionChip(
                          label: Text(_clearing ? 'Clearing...' : 'Clear CSV'),
                          onPressed: _clearing ? null : _triggerClearImport,
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                if (_gscSubTab == 'domains')
                  ...externalDomains.take(30).map((d) => Container(
                        margin: const EdgeInsets.only(bottom: 6),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: SeoColors.scaffoldBg(context),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: SeoColors.border(context)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                '${d['referringDomain']} → ${d['targetPage'] ?? '/'}',
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
                if (_gscSubTab == 'targets')
                  ...targetPages.take(30).map((t) => Container(
                        margin: const EdgeInsets.only(bottom: 6),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: SeoColors.scaffoldBg(context),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: SeoColors.border(context)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                '${t['targetPage']}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            Text(
                              '${t['linksCount']} links · ${t['linkingDomainsCount']} domains',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: SeoColors.primaryBrand(context),
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      )),
                if (_gscSubTab == 'pages')
                  ...linkingPages.take(30).map((lp) => Container(
                        margin: const EdgeInsets.only(bottom: 6),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: SeoColors.scaffoldBg(context),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: SeoColors.border(context)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${lp['linkingPage']}',
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Target: ${lp['targetPage']}${lp['anchorText']?.toString().isNotEmpty == true ? ' · Anchor: ${lp['anchorText']}' : ''}',
                              style: TextStyle(
                                fontSize: 11,
                                color: SeoColors.textMuted(context),
                              ),
                            ),
                          ],
                        ),
                      )),
              ],
            ],
          ),
        ),
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
                  if (rec.affectedPages.isNotEmpty)
                    SeoAffectedChipsWrap(
                      label: 'Affected pages:',
                      items: rec.affectedPages,
                      maxVisible: 4,
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
  String? _testingTarget;
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
      text: s['ga4PropertyId']?.toString().isNotEmpty == true
          ? s['ga4PropertyId'].toString()
          : '561909161',
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
    if (_testingTarget != null) return;
    setState(() {
      _testingTarget = target;
      _testResult = null;
    });
    try {
      final res = await widget.onTest(target);
      if (mounted) {
        setState(() {
          _testResult = res;
          if (target == 'gsc' && res['property'] != null) {
            _gscCtrl.text = res['property'].toString();
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _testResult = {
            'ok': false,
            'provider': target == 'pagespeed' ? 'Google PageSpeed Insights' : target,
            'connectionStatus': 'Connection Error',
            'message': e.toString().replaceFirst('Exception: ', ''),
          };
        });
      }
    } finally {
      if (mounted) setState(() => _testingTarget = null);
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
    final ga4MeasurementId =
        s['ga4MeasurementId']?.toString() ?? 'G-BSZBBFZZH0';
    final ga4NumericId = _ga4Ctrl.text.isNotEmpty
        ? _ga4Ctrl.text
        : (s['ga4PropertyId']?.toString() ?? '561909161');
    final ga4Status = (_testResult?['provider'] == 'Google Analytics 4')
        ? (_testResult?['ok'] == true ? 'Connected' : 'Connection Error')
        : (s['ga4Connected'] == true
            ? 'Connected'
            : (s['ga4ConnectionStatus']?.toString() ?? 'Not Connected'));
    final ga4LastSync = (_testResult?['provider'] == 'Google Analytics 4' &&
            _testResult?['syncedAt'] != null)
        ? _testResult!['syncedAt'].toString()
        : (s['ga4LastSyncedAt']?.toString() ?? 'Not synced yet');

    final isPsiTest = _testResult?['provider'] == 'Google PageSpeed Insights';
    final psiConnected = isPsiTest
        ? (_testResult?['ok'] == true)
        : (s['pagespeedConnected'] == true);
    final psiStatus = isPsiTest
        ? (_testResult?['connectionStatus']?.toString() ??
            (psiConnected ? 'Connected' : 'Connection Error'))
        : (s['pagespeedConnectionStatus']?.toString() ??
            (s['hasPagespeedApiKey'] == true
                ? 'Configured (Not Tested)'
                : 'Not Configured'));
    final psiHasKey = isPsiTest
        ? (_testResult?['apiKeyConfigured'] == true || s['hasPagespeedApiKey'] == true)
        : (s['hasPagespeedApiKey'] == true);
    final psiKeySource = isPsiTest
        ? (_testResult?['apiKeySource']?.toString() ?? s['pagespeedApiKeySource']?.toString() ?? 'none')
        : (s['pagespeedApiKeySource']?.toString() ?? 'none');
    final psiApiEnabled = isPsiTest ? _testResult?['apiEnabled'] : s['pagespeedApiEnabled'];
    final psiMobilePerf = isPsiTest ? _testResult?['mobilePerformance'] : s['pagespeedMobilePerformance'];
    final psiDesktopPerf = isPsiTest ? _testResult?['desktopPerformance'] : s['pagespeedDesktopPerformance'];
    final psiLastTestedAt = isPsiTest
        ? (_testResult?['checkedAt']?.toString() ?? s['pagespeedLastTestedAt']?.toString())
        : s['pagespeedLastTestedAt']?.toString();
    final psiKeySourceLabel = !psiHasKey
        ? 'Not Configured'
        : (psiKeySource == 'env:PAGESPEED_API_KEY'
            ? 'Backend Env (PAGESPEED_API_KEY)'
            : 'Stored securely on backend');
    final psiApiEnabledLabel = psiApiEnabled == true
        ? 'Enabled'
        : (psiApiEnabled == false ? 'Not Enabled' : 'Pending Test');
    final psiMobileLabel = psiMobilePerf is num ? '$psiMobilePerf/100' : '—';
    final psiDesktopLabel = psiDesktopPerf is num ? '$psiDesktopPerf/100' : '—';
    final psiLastTestedLabel = psiLastTestedAt ?? 'Not tested yet';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            OutlinedButton(
              onPressed: _testingTarget != null ? null : () => _handleTest('gsc'),
              child: Text(_testingTarget == 'gsc' ? 'Testing GSC...' : 'Test GSC'),
            ),
            OutlinedButton(
              onPressed: _testingTarget != null ? null : () => _handleTest('ga4'),
              child: Text(_testingTarget == 'ga4' ? 'Testing GA4...' : 'Test GA4 Connection'),
            ),
            OutlinedButton(
              onPressed: _testingTarget != null ? null : () => _handleTest('pagespeed'),
              child: Text(
                _testingTarget == 'pagespeed'
                    ? 'Testing PageSpeed...'
                    : 'Test PageSpeed Connection',
              ),
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
                'Google Analytics 4 Integration',
                style: AppTextStyles.labelBold.copyWith(
                  fontSize: 13.5,
                  color: SeoColors.textPrimary(context),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Measurement ID: $ga4MeasurementId',
                style: const TextStyle(fontSize: 11.5),
              ),
              Text(
                'Numeric Property ID: $ga4NumericId (properties/$ga4NumericId)',
                style: const TextStyle(fontSize: 11.5),
              ),
              Text(
                'Service Account Email: $saEmail',
                style: const TextStyle(fontSize: 11.5),
              ),
              Text(
                'Connection Status: $ga4Status',
                style: const TextStyle(fontSize: 11.5),
              ),
              Text(
                'Last Successful Sync: $ga4LastSync',
                style: const TextStyle(fontSize: 11.5),
              ),
            ],
          ),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'Google PageSpeed Insights API v5',
                      style: AppTextStyles.labelBold.copyWith(
                        fontSize: 13.5,
                        color: SeoColors.textPrimary(context),
                      ),
                    ),
                  ),
                  SeoStatusBadge(status: psiStatus),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'API Key Source: $psiKeySourceLabel',
                style: const TextStyle(fontSize: 11.5),
              ),
              Text(
                'API Enabled: $psiApiEnabledLabel',
                style: const TextStyle(fontSize: 11.5),
              ),
              Text(
                'Mobile / Desktop (https://www.hangbug.com/): Mobile $psiMobileLabel · Desktop $psiDesktopLabel',
                style: const TextStyle(fontSize: 11.5),
              ),
              Text(
                'Last Connection Test: $psiLastTestedLabel',
                style: const TextStyle(fontSize: 11.5),
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: _testingTarget != null
                    ? null
                    : () => _handleTest('pagespeed'),
                icon: const Icon(Icons.bolt_rounded, size: 16),
                label: Text(
                  _testingTarget == 'pagespeed'
                      ? 'Testing Mobile & Desktop...'
                      : 'Test PageSpeed Connection',
                ),
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Test Connection Result — ${_testResult!['provider'] ?? 'Integration'}: ${_testResult!['message'] ?? 'Tested'}',
                  style: const TextStyle(fontSize: 12),
                ),
                if (_testResult!['provider'] == 'Google PageSpeed Insights') ...[
                  const SizedBox(height: 4),
                  Text(
                    'Target: ${_testResult!['targetUrl'] ?? 'https://www.hangbug.com/'} · Mobile: ${_testResult!['mobilePerformance'] ?? '—'}/100 · Desktop: ${_testResult!['desktopPerformance'] ?? '—'}/100',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
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
                decoration: InputDecoration(
                  labelText: 'PageSpeed Insights API Key (Optional)',
                  hintText: s['pagespeedApiKeySource'] == 'env:PAGESPEED_API_KEY'
                      ? '•••••••• (Loaded from PAGESPEED_API_KEY env)'
                      : (s['hasPagespeedApiKey'] == true
                          ? '•••••••• (Saved securely on backend)'
                          : 'Server-side Google Cloud API key'),
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
