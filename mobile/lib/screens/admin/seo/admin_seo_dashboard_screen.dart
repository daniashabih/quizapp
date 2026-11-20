import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../models/seo_dashboard_model.dart';
import '../../../providers/seo_provider.dart';
import '../../../services/notification_service.dart';
import '../../../widgets/animated_theme_toggle.dart';
import '../../../widgets/error_state_widget.dart';
import '../../../widgets/loading_state_widget.dart';
import 'widgets/seo_sections_primary.dart';
import 'widgets/seo_sections_secondary.dart';
import 'widgets/seo_theme_tokens.dart';

class AdminSeoDashboardScreen extends ConsumerStatefulWidget {
  const AdminSeoDashboardScreen({super.key});

  @override
  ConsumerState<AdminSeoDashboardScreen> createState() =>
      _AdminSeoDashboardScreenState();
}

class _AdminSeoDashboardScreenState
    extends ConsumerState<AdminSeoDashboardScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  bool _runningAudit = false;

  Future<void> _runAudit() async {
    if (_runningAudit) return;
    setState(() => _runningAudit = true);
    try {
      final domain = ref.read(seoDomainProvider);
      final msg = await ref
          .read(seoServiceProvider)
          .runAudit(domain: domain, useLiveHttp: true);
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.success(
        id: 'seo-audit-ok',
        title: 'SEO Audit Completed',
        message: msg,
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-audit-err',
        title: 'Audit Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    } finally {
      if (mounted) setState(() => _runningAudit = false);
    }
  }

  Future<void> _pickCustomDateRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: now.subtract(const Duration(days: 365)),
      lastDate: now,
      initialDateRange: DateTimeRange(
        start: now.subtract(const Duration(days: 28)),
        end: now.subtract(const Duration(days: 1)),
      ),
    );
    if (picked != null && mounted) {
      String fmt(DateTime d) => d.toIso8601String().split('T').first;
      ref.read(seoCustomDatesProvider.notifier).state = (
        start: fmt(picked.start),
        end: fmt(picked.end),
      );
      ref.read(seoDateRangeProvider.notifier).state = 'custom';
    }
  }

  Future<void> _runPageSpeed(
    String url,
    String strategy, {
    bool forceRefresh = false,
  }) async {
    try {
      final domain = ref.read(seoDomainProvider);
      final msg = await ref.read(seoServiceProvider).runPageSpeed(
            domain: domain,
            url: url,
            strategy: strategy,
            forceRefresh: forceRefresh,
          );
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.success(
        id: 'seo-psi-ok',
        title: 'PageSpeed Check Done',
        message: msg,
      );
    } catch (e) {
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.error(
        id: 'seo-psi-err',
        title: 'PageSpeed Notice',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<Map<String, dynamic>> _inspectUrl(String url) async {
    final domain = ref.read(seoDomainProvider);
    return ref.read(seoServiceProvider).inspectUrl(domain: domain, url: url);
  }

  Future<void> _toggleRecommendation(SeoRecommendationItem item) async {
    try {
      final domain = ref.read(seoDomainProvider);
      final msg = await ref.read(seoServiceProvider).toggleRecommendation(
            recKey: item.recKey,
            domain: domain,
            isCompleted: !item.isCompleted,
            title: item.title,
            priority: item.priority,
          );
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.success(
        id: 'seo-rec-ok',
        title: 'Updated',
        message: msg,
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-rec-err',
        title: 'Error',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _addCompetitor(String compDomain, String label) async {
    try {
      final domain = ref.read(seoDomainProvider);
      final msg = await ref.read(seoServiceProvider).addCompetitor(
            domain: domain,
            competitorDomain: compDomain,
            label: label,
          );
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.success(
        id: 'seo-comp-add',
        title: 'Competitor Added',
        message: msg,
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-comp-err',
        title: 'Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _refreshCompetitor(String id) async {
    try {
      final domain = ref.read(seoDomainProvider);
      final msg = await ref
          .read(seoServiceProvider)
          .refreshCompetitor(id, domain: domain);
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.success(
        id: 'seo-comp-ref',
        title: 'Refreshed',
        message: msg,
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-comp-ref-err',
        title: 'Refresh Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _deleteCompetitor(String id) async {
    try {
      final domain = ref.read(seoDomainProvider);
      await ref.read(seoServiceProvider).deleteCompetitor(id, domain: domain);
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.info(
        id: 'seo-comp-del',
        title: 'Removed',
        message: 'Competitor removed.',
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-comp-del-err',
        title: 'Delete Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _importBacklinks(List<Map<String, dynamic>> items) async {
    try {
      final domain = ref.read(seoDomainProvider);
      final msg = await ref
          .read(seoServiceProvider)
          .importBacklinks(domain, items);
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.success(
        id: 'seo-bl-ok',
        title: 'Links Imported',
        message: msg,
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-bl-err',
        title: 'Import Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _importBacklinksCsv(String csvText, String fileName) async {
    try {
      final domain = ref.read(seoDomainProvider);
      final msg = await ref.read(seoServiceProvider).importBacklinksCsv(
            domain: domain,
            csvText: csvText,
            fileName: fileName,
          );
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.success(
        id: 'seo-bl-csv-ok',
        title: 'GSC Links Report Imported',
        message: msg,
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-bl-csv-err',
        title: 'CSV Import Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _clearImportedBacklinks() async {
    try {
      final domain = ref.read(seoDomainProvider);
      final msg = await ref
          .read(seoServiceProvider)
          .clearImportedBacklinks(domain: domain);
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.info(
        id: 'seo-bl-clear-ok',
        title: 'Snapshot Cleared',
        message: msg,
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-bl-clear-err',
        title: 'Clear Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _saveSettings(Map<String, dynamic> payload) async {
    try {
      final domain = ref.read(seoDomainProvider);
      final msg =
          await ref.read(seoServiceProvider).updateSettings(domain, payload);
      ref.invalidate(seoSettingsProvider);
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.success(
        id: 'seo-set-ok',
        title: 'Settings Saved',
        message: msg,
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-set-err',
        title: 'Save Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<Map<String, dynamic>> _testIntegration(
    String target, {
    String? apiKey,
  }) async {
    final domain = ref.read(seoDomainProvider);
    final res = await ref
        .read(seoServiceProvider)
        .testIntegration(domain, target, apiKey: apiKey);
    ref.invalidate(seoDashboardProvider);
    return res;
  }

  Widget _buildActiveTab(
    String activeSection,
    SeoDashboardPayload data,
    String domain,
    String dateRange,
  ) {
    switch (activeSection) {
      case 'overview':
        return SeoOverviewTab(
          data: data,
          onNavigateSection: (s) =>
              ref.read(seoActiveSectionProvider.notifier).state = s,
        );
      case 'search-performance':
        return SeoSearchPerformanceTab(
          data: data,
          currentRange: dateRange,
          onSelectRange: (r) =>
              ref.read(seoDateRangeProvider.notifier).state = r,
          onPickCustomDates: _pickCustomDateRange,
          onOpenSettings: () =>
              ref.read(seoActiveSectionProvider.notifier).state = 'settings',
        );
      case 'keywords':
        return SeoKeywordsTab(data: data);
      case 'audit':
        return SeoAuditTab(
          data: data,
          isAuditing: _runningAudit,
          onRunAudit: _runAudit,
        );
      case 'indexing':
        return SeoIndexingTab(data: data, onInspectUrl: _inspectUrl);
      case 'content':
        return SeoContentTab(data: data);
      case 'technical':
        return SeoTechnicalTab(data: data, onRunPageSpeed: _runPageSpeed);
      case 'backlinks':
        return SeoBacklinksTab(
          data: data,
          onImportLinks: _importBacklinks,
          onImportCsv: _importBacklinksCsv,
          onClearImport: _clearImportedBacklinks,
          onTestOpenPageRank: () => _testIntegration('openpagerank'),
          onOpenSettings: () =>
              ref.read(seoActiveSectionProvider.notifier).state = 'settings',
        );
      case 'ai-visibility':
        return SeoAiVisibilityTab(data: data);
      case 'competitors':
        return SeoCompetitorsTab(
          data: data,
          onAdd: _addCompetitor,
          onRefresh: _refreshCompetitor,
          onDelete: _deleteCompetitor,
        );
      case 'recommendations':
        return SeoRecommendationsTab(
          data: data,
          onToggle: _toggleRecommendation,
        );
      case 'settings':
        final settingsAsync = ref.watch(seoSettingsProvider);
        return settingsAsync.when(
          loading: () => const Padding(
            padding: EdgeInsets.all(24),
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (err, _) => ErrorStateWidget(
            message: err.toString(),
            onRetry: () => ref.invalidate(seoSettingsProvider),
          ),
          data: (settings) => SeoSettingsTab(
            domain: domain,
            initialSettings: settings,
            onSave: _saveSettings,
            onTest: _testIntegration,
          ),
        );
      default:
        return SeoOverviewTab(
          data: data,
          onNavigateSection: (s) =>
              ref.read(seoActiveSectionProvider.notifier).state = s,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeSection = ref.watch(seoActiveSectionProvider);
    final domain = ref.watch(seoDomainProvider);
    final dateRange = ref.watch(seoDateRangeProvider);
    final dashboardAsync = ref.watch(seoDashboardProvider);

    final activeItem = kSeoNavItems.firstWhere(
      (i) => i.id == activeSection,
      orElse: () => kSeoNavItems.first,
    );
    final selectedIndex =
        kSeoNavItems.indexWhere((i) => i.id == activeSection).clamp(0, 11);

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: SeoColors.scaffoldBg(context),
      appBar: AppBar(
        backgroundColor: SeoColors.cardBg(context),
        leading: IconButton(
          icon: const Icon(Icons.menu_rounded),
          tooltip: 'SEO Navigation',
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              activeItem.label,
              style: AppTextStyles.displaySmall.copyWith(fontSize: 16),
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              domain,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: SeoColors.primaryBrand(context),
              ),
            ),
          ],
        ),
        actions: [
          PopupMenuButton<String>(
            tooltip: 'Switch Property Domain',
            icon: const Icon(Icons.language_rounded, size: 20),
            onSelected: (val) =>
                ref.read(seoDomainProvider.notifier).state = val,
            itemBuilder: (_) => const [
              PopupMenuItem(
                value: 'www.hangbug.com',
                child: Text('www.hangbug.com'),
              ),
              PopupMenuItem(
                value: 'hangbug.com',
                child: Text('hangbug.com'),
              ),
            ],
          ),
          const AnimatedThemeToggleButton(iconSize: 20),
          IconButton(
            tooltip: 'Refresh SEO Data',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.invalidate(seoDashboardProvider),
          ),
        ],
      ),
      drawer: NavigationDrawer(
        selectedIndex: selectedIndex,
        onDestinationSelected: (idx) {
          ref.read(seoActiveSectionProvider.notifier).state =
              kSeoNavItems[idx].id;
          Navigator.of(context).pop();
        },
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hangbug SEO & Growth',
                  style: AppTextStyles.displaySmall.copyWith(
                    fontSize: 16,
                    color: SeoColors.primaryBrand(context),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  domain,
                  style: TextStyle(
                    fontSize: 12,
                    color: SeoColors.textMuted(context),
                  ),
                ),
              ],
            ),
          ),
          const Divider(),
          ...kSeoNavItems.map(
            (item) => NavigationDrawerDestination(
              icon: Icon(item.icon),
              label: Text(item.label),
            ),
          ),
          const Divider(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).maybePop();
              },
              icon: const Icon(Icons.arrow_back_rounded, size: 16),
              label: const Text('Back to Admin Panel'),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Quick 12-Section Pill Switcher
          Container(
            color: SeoColors.cardBg(context),
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                children: kSeoNavItems.map((item) {
                  final active = item.id == activeSection;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(
                      avatar: Icon(
                        item.icon,
                        size: 15,
                        color: active
                            ? SeoColors.primaryBrand(context)
                            : SeoColors.textMuted(context),
                      ),
                      label: Text(item.label),
                      selected: active,
                      selectedColor: SeoColors.mintSurface(context),
                      onSelected: (_) => ref
                          .read(seoActiveSectionProvider.notifier)
                          .state = item.id,
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          Divider(height: 1, color: SeoColors.border(context)),
          Expanded(
            child: dashboardAsync.when(
              loading: () => const LoadingStateWidget(
                message: 'Analyzing Hangbug SEO & Growth metrics...',
              ),
              error: (err, _) => ErrorStateWidget(
                message: err.toString(),
                onRetry: () => ref.invalidate(seoDashboardProvider),
              ),
              data: (payload) => RefreshIndicator(
                onRefresh: () async => ref.invalidate(seoDashboardProvider),
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 36),
                  children: [
                    _buildActiveTab(activeSection, payload, domain, dateRange),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: activeSection == 'overview' || activeSection == 'audit'
          ? FloatingActionButton.extended(
              onPressed: _runningAudit ? null : _runAudit,
              backgroundColor: SeoColors.primaryDarkGreen,
              foregroundColor: Colors.white,
              icon: _runningAudit
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.play_arrow_rounded),
              label: Text(_runningAudit ? 'Auditing...' : 'Run Audit'),
            )
          : null,
    );
  }
}
