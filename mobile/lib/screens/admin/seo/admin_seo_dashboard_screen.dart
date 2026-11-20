import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
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
    extends ConsumerState<AdminSeoDashboardScreen> with WidgetsBindingObserver {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  bool _runningAudit = false;
  bool _awaitingGoogleOAuthReturn = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _awaitingGoogleOAuthReturn) {
      _awaitingGoogleOAuthReturn = false;
      ref.invalidate(seoSettingsProvider);
      ref.invalidate(seoDashboardProvider);
    }
  }

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

  Future<void> _runPageSpeed(String url, String strategy) async {
    try {
      final domain = ref.read(seoDomainProvider);
      final msg = await ref
          .read(seoServiceProvider)
          .runPageSpeed(domain: domain, url: url, strategy: strategy);
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.success(
        id: 'seo-psi-ok',
        title: 'PageSpeed Check Done',
        message: msg,
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-psi-err',
        title: 'PageSpeed Failed',
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

  Future<Map<String, dynamic>> _testIntegration(String target) async {
    final domain = ref.read(seoDomainProvider);
    final res = await ref.read(seoServiceProvider).testIntegration(domain, target);
    if (target == 'gsc') {
      ref.invalidate(seoSettingsProvider);
    }
    return res;
  }

  Future<void> _connectGoogleSearchConsole() async {
    try {
      final domain = ref.read(seoDomainProvider);
      final res = await ref
          .read(seoServiceProvider)
          .getGscOAuthAuthorizeUrl(domain: domain, platform: 'mobile');
      final authUrl = res['authUrl']?.toString() ?? '';
      if (authUrl.isEmpty) {
        throw Exception(
          res['message']?.toString() ??
              'Unable to generate Google OAuth authorization URL.',
        );
      }
      final uri = Uri.parse(authUrl);
      _awaitingGoogleOAuthReturn = true;
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched) {
        _awaitingGoogleOAuthReturn = false;
        throw Exception('Could not open browser for Google authorization.');
      }
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-gsc-auth-err',
        title: 'Google OAuth Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _fetchGscProperties() async {
    try {
      final domain = ref.read(seoDomainProvider);
      final res =
          await ref.read(seoServiceProvider).getGscProperties(domain: domain);
      ref.invalidate(seoSettingsProvider);
      final count = (res['properties'] as List?)?.length ?? 0;
      AppNotificationService.success(
        id: 'seo-gsc-props-ok',
        title: 'Properties Loaded',
        message: 'Found $count Search Console propert${count == 1 ? 'y' : 'ies'}.',
      );
    } catch (e) {
      ref.invalidate(seoSettingsProvider);
      AppNotificationService.error(
        id: 'seo-gsc-props-err',
        title: 'Fetch Properties Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _selectGscProperty(String property) async {
    try {
      final domain = ref.read(seoDomainProvider);
      final res = await ref
          .read(seoServiceProvider)
          .selectGscProperty(domain, property);
      ref.invalidate(seoSettingsProvider);
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.success(
        id: 'seo-gsc-prop-ok',
        title: 'Property Verified',
        message: res['message']?.toString() ?? 'Search Console property saved.',
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-gsc-prop-err',
        title: 'Verification Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _refreshGscData() async {
    try {
      final domain = ref.read(seoDomainProvider);
      final range = ref.read(seoDateRangeProvider);
      final res = await ref
          .read(seoServiceProvider)
          .refreshGscData(domain, range: range);
      ref.invalidate(seoSettingsProvider);
      ref.invalidate(seoDashboardProvider);
      if (res['success'] == true) {
        AppNotificationService.success(
          id: 'seo-gsc-refresh-ok',
          title: 'Search Console Synced',
          message: res['message']?.toString() ?? 'Refreshed Search Console data.',
        );
      } else {
        AppNotificationService.error(
          id: 'seo-gsc-refresh-warn',
          title: 'Sync Incomplete',
          message: res['message']?.toString() ?? 'Could not sync Search Console.',
        );
      }
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-gsc-refresh-err',
        title: 'Refresh Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> _disconnectGscAccount() async {
    try {
      final domain = ref.read(seoDomainProvider);
      final res =
          await ref.read(seoServiceProvider).disconnectGscAccount(domain);
      ref.invalidate(seoSettingsProvider);
      ref.invalidate(seoDashboardProvider);
      AppNotificationService.info(
        id: 'seo-gsc-disc-ok',
        title: 'Disconnected',
        message:
            res['message']?.toString() ?? 'Google Search Console disconnected.',
      );
    } catch (e) {
      AppNotificationService.error(
        id: 'seo-gsc-disc-err',
        title: 'Disconnect Failed',
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
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
            onConnectGoogleAccount: _connectGoogleSearchConsole,
            onFetchGscProperties: _fetchGscProperties,
            onSelectGscProperty: _selectGscProperty,
            onRefreshGscData: _refreshGscData,
            onDisconnectGscAccount: _disconnectGscAccount,
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
