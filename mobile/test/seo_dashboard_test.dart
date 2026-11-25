import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/theme/app_theme.dart';
import 'package:hangbug/models/seo_dashboard_model.dart';
import 'package:hangbug/screens/admin/seo/widgets/seo_charts.dart';
import 'package:hangbug/screens/admin/seo/widgets/seo_sections_primary.dart';
import 'package:hangbug/screens/admin/seo/widgets/seo_sections_secondary.dart';
import 'package:hangbug/screens/admin/seo/widgets/seo_theme_tokens.dart';

void main() {
  test('kSeoNavItems exposes all 12 required Hangbug SEO & Growth sections', () {
    final labels = kSeoNavItems.map((e) => e.label).toList();
    expect(labels, equals([
      'Overview',
      'Search Performance',
      'Keyword Research',
      'Website Audit',
      'Page Indexing',
      'Content Analysis',
      'Technical SEO',
      'Backlinks',
      'AI Visibility',
      'Competitors',
      'SEO Recommendations',
      'Settings',
    ]));
  });

  test('SeoDashboardPayload parses unified backend response cleanly', () {
    final payload = SeoDashboardPayload.fromJson({
      'success': true,
      'data': {
        'project': {
          'domain': 'www.hangbug.com',
          'siteUrl': 'https://www.hangbug.com',
          'integrations': {'gscConnected': false, 'ga4Connected': false},
        },
        'overview': {
          'domain': 'www.hangbug.com',
          'siteUrl': 'https://www.hangbug.com',
          'lastDataUpdate': '2026-11-19T12:00:00.000Z',
          'metrics': [
            {
              'key': 'overallSeoHealth',
              'label': 'Overall SEO Health',
              'explanation': 'Composite score',
              'available': true,
              'value': 91,
              'formattedValue': '91/100',
              'source': 'Hangbug Audit Engine',
            },
            {
              'key': 'organicTraffic',
              'label': 'Organic Traffic',
              'explanation': 'Search sessions',
              'available': false,
              'value': null,
              'formattedValue': 'Not connected',
              'unavailabilityReason': 'Connect GA4 or GSC',
              'source': 'GA4 / GSC',
            },
          ],
        },
        'healthScore': {
          'overall': 91,
          'methodologyNote': 'Measured locally',
          'source': 'Hangbug Audit Scoring Engine',
          'categories': [
            {
              'key': 'technical',
              'label': 'Technical SEO',
              'score': 94,
              'weight': 25,
              'formula': 'HTTP 200 + Canonicals',
              'checksPassed': 30,
              'checksTotal': 31,
              'source': 'Hangbug Crawler',
              'isVerifiedGoogleData': false,
              'explanation': 'Status and schema checks',
            },
          ],
        },
        'searchPerformance': {'connected': false, 'timeseries': []},
        'keywords': {
          'gscConnected': false,
          'measuredQueries': [],
          'targetContentKeywords': [
            {
              'keyword': 'programming quizzes',
              'intent': 'Transactional',
              'landingPage': '/',
              'source': 'Hangbug SEO Page Config',
              'isEstimated': false,
            }
          ],
          'explanation': 'Connect GSC for real queries',
        },
        'audit': {
          'pagesScanned': 31,
          'issues': [
            {
              'id': 'meta_desc',
              'title': 'Missing Meta Description',
              'bucket': 'warning',
              'severity': 'Medium',
              'status': 'Needs attention',
              'type': 'on-page',
              'whatIsIssue': 'Meta description missing',
              'whyItMatters': 'Search engines generate snippets automatically',
              'affectedUrls': [
                {'url': '/technologies/javascript', 'detail': 'Missing'}
              ],
              'affectedCount': 1,
              'recommendedAction': 'Write unique description',
              'howToFix': 'Update seoPagesConfig.js',
              'source': 'Hangbug Crawler',
            },
          ],
        },
        'recommendations': {
          'items': [
            {
              'recKey': 'audit_meta_desc',
              'title': 'Improve Meta Descriptions',
              'priority': 'Medium',
              'explanation': 'Missing on 1 page',
              'expectedBenefit': 'Higher CTR',
              'affectedPages': ['/technologies/javascript'],
              'suggestedAction': 'Write summary',
              'howToFix': 'Edit config',
              'source': 'Hangbug Crawler',
              'isCompleted': false,
            }
          ],
          'stats': {'total': 1, 'completed': 0},
        },
      },
    });

    expect(payload.domain, equals('www.hangbug.com'));
    expect(payload.healthScore.overall, equals(91));
    expect(payload.overviewMetrics.length, equals(2));
    expect(payload.overviewMetrics[1].available, isFalse);
    expect(payload.auditIssues.first.status, equals('Needs attention'));
    expect(payload.targetKeywords.first.keyword, equals('programming quizzes'));
    expect(payload.recommendations.first.isCompleted, isFalse);
  });

  testWidgets('SeoHealthRingGauge and SeoMetricCard render cleanly in light & dark mode',
      (WidgetTester tester) async {
    const metric = SeoOverviewMetric(
      key: 'organicTraffic',
      label: 'Organic Traffic',
      explanation: 'Visits from search engines',
      available: false,
      formattedValue: 'Not connected',
      unavailabilityReason: 'Connect GSC or GA4 in Settings.',
      source: 'GA4 / GSC',
    );

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.light,
        home: const Scaffold(
          body: SingleChildScrollView(
            child: Column(
              children: [
                SeoHealthRingGauge(score: 88),
                SeoMetricCard(metric: metric),
              ],
            ),
          ),
        ),
      ),
    );

    expect(find.text('88'), findsOneWidget);
    expect(find.text('Organic Traffic'), findsOneWidget);
    expect(find.text('Not connected'), findsOneWidget);
  });

  testWidgets(
      'SeoTechnicalTab renders cached PageSpeed reports, mobile & desktop performance, and quota exhaustion message without zeroing scores',
      (WidgetTester tester) async {
    final payload = SeoDashboardPayload.fromJson({
      'success': true,
      'data': {
        'project': {
          'domain': 'www.hangbug.com',
          'siteUrl': 'https://www.hangbug.com',
          'integrations': {
            'pagespeedHasKey': true,
            'pagespeedConnected': false,
            'pagespeedConnectionStatus': 'Quota Exceeded',
            'pagespeedQuotaExhausted': true,
          },
        },
        'overview': {
          'domain': 'www.hangbug.com',
          'siteUrl': 'https://www.hangbug.com',
          'metrics': [],
        },
        'healthScore': {'overall': 92, 'categories': []},
        'technical': {
          'pageSpeed': {
            'status': 'Good',
            'lastAuditedAt': '2026-11-20T12:00:00.000Z',
            'nextRetryAt': '2026-11-21T08:00:00.000Z',
            'mobile': {
              'url': 'https://www.hangbug.com/',
              'path': '/',
              'strategy': 'mobile',
              'checkedAt': '2026-11-20T12:00:00.000Z',
              'scores': {
                'performance': 91,
                'accessibility': 96,
                'bestPractices': 95,
                'seo': 100,
              },
              'coreWebVitals': {
                'lcp': {'displayValue': '1.8 s', 'status': 'Good'},
              },
            },
            'desktop': {
              'url': 'https://www.hangbug.com/',
              'path': '/',
              'strategy': 'desktop',
              'checkedAt': '2026-11-20T12:05:00.000Z',
              'scores': {
                'performance': 98,
                'accessibility': 97,
                'bestPractices': 100,
                'seo': 100,
              },
              'coreWebVitals': {
                'lcp': {'displayValue': '0.9 s', 'status': 'Good'},
              },
            },
            'quotaState': {
              'exhausted': true,
              'errorCategory': 'daily_quota_exceeded',
              'userMessage':
                  'Google PageSpeed API daily quota has been reached. Previously cached reports are still available. Please try again after the quota resets.',
              'message':
                  "Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com'.",
              'projectNumber': '583797351490',
              'nextRetryAt': '2026-11-21T08:00:00.000Z',
            },
          },
        },
      },
    });

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        home: Scaffold(
          body: SingleChildScrollView(
            child: SeoTechnicalTab(
              data: payload,
              onRunPageSpeed: (url, strategy, {bool forceRefresh = false}) async {},
              onTestPageSpeedConnection: () async => {
                'ok': true,
                'connectionStatus': 'Connected',
                'message': 'Verified mobile and desktop',
              },
            ),
          ),
        ),
      ),
    );

    expect(
      find.text(
        'Google PageSpeed API daily quota has been reached. Previously cached reports are still available. Please try again after the quota resets.',
      ),
      findsOneWidget,
    );
    expect(find.textContaining('Mobile Performance: 91/100'), findsOneWidget);
    expect(find.textContaining('Desktop Performance: 98/100'), findsOneWidget);
    expect(find.textContaining('Cached Report (Quota Fallback)'), findsOneWidget);
    expect(find.textContaining('API: Quota Exceeded'), findsOneWidget);
    expect(find.text('Test PageSpeed Connection'), findsOneWidget);
    expect(find.textContaining('Next Available Retry: 2026-11-21T08:00:00.000Z'), findsOneWidget);
  });

  testWidgets(
      'SeoIndexingTab flags noindex URLs in inventory and displays sitemap status',
      (WidgetTester tester) async {
    final payload = SeoDashboardPayload.fromJson({
      'success': true,
      'data': {
        'project': {
          'domain': 'www.hangbug.com',
          'siteUrl': 'https://www.hangbug.com',
          'integrations': {'gscConnected': false},
        },
        'indexing': {
          'gscConnected': false,
          'explanation': 'Live crawlability summary',
          'summary': {
            'indexedPages': {'crawlableReadyCount': 1},
            'notIndexedPages': {'crawlNoindexCount': 1},
            'redirects': {'value': 0},
            'errors': {'value': 0},
            'sitemapStatus': {'urlCount': 1, 'status': 'Good'},
          },
          'urlInventory': [
            {
              'path': '/technologies/javascript',
              'httpStatus': 200,
              'canonicalValid': true,
              'isNoindex': false,
              'inSitemap': true,
              'wordCount': 850,
            },
            {
              'path': '/private-leak',
              'httpStatus': 200,
              'canonicalValid': false,
              'isNoindex': true,
              'inSitemap': false,
              'wordCount': 120,
            },
          ],
        },
      },
    });

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        home: Scaffold(
          body: SingleChildScrollView(
            child: SeoIndexingTab(
              data: payload,
              onInspectUrl: (_) async => {'crawl': {}},
            ),
          ),
        ),
      ),
    );

    expect(find.text('/technologies/javascript'), findsOneWidget);
    expect(find.textContaining('Sitemap'), findsAtLeastNWidgets(1));
    expect(find.textContaining('JSON-LD:'), findsAtLeastNWidgets(1));
    expect(find.text('/private-leak'), findsOneWidget);
    expect(find.textContaining('Noindex'), findsAtLeastNWidgets(1));
    expect(find.text('Good'), findsAtLeastNWidgets(1));
    expect(find.text('Critical'), findsOneWidget);
  });

  testWidgets(
      'SeoTechnicalTab renders structuredData schemasDetected and affectedUrls',
      (WidgetTester tester) async {
    final payload = SeoDashboardPayload.fromJson({
      'success': true,
      'data': {
        'project': {
          'domain': 'www.hangbug.com',
          'siteUrl': 'https://www.hangbug.com',
          'integrations': {},
        },
        'technical': {
          'structuredData': {
            'status': 'Good',
            'schemasDetected': [
              'Organization',
              'WebSite',
              'BreadcrumbList',
              'SoftwareApplication',
            ],
            'affectedUrls': [
              {
                'url': '/games/code-puzzle',
                'detail': 'Verified #hangbug-jsonld',
              },
            ],
            'explanation':
                'Schema.org JSON-LD blocks checked across public pages.',
          },
        },
      },
    });

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        home: Scaffold(
          body: SingleChildScrollView(
            child: SeoTechnicalTab(
              data: payload,
              onRunPageSpeed: (url, strategy, {bool forceRefresh = false}) async {},
            ),
          ),
        ),
      ),
    );

    expect(find.text('Structured Data'), findsOneWidget);
    expect(find.text('Organization'), findsOneWidget);
    expect(find.text('SoftwareApplication'), findsOneWidget);
    expect(find.textContaining('/games/code-puzzle'), findsOneWidget);
  });

  test('SeoAffectedUrl resolves explicit label and legacy /technologies category detail', () {
    final explicit = SeoAffectedUrl.fromJson({
      'url': '/technologies/css',
      'label': 'CSS (/technologies/css)',
      'detail': 'Category "CSS" has 0 questions',
    });
    expect(explicit.displayLabel, equals('CSS (/technologies/css)'));

    final legacy = SeoAffectedUrl.fromJson({
      'url': '/technologies',
      'detail': 'Category "Angular" has 0 questions',
    });
    expect(legacy.displayLabel, equals('Angular (/technologies)'));

    final standard = SeoAffectedUrl.fromJson({
      'url': '/blog/html-tutorial',
      'detail': 'Missing keywords',
    });
    expect(standard.displayLabel, equals('/blog/html-tutorial'));
  });

  testWidgets(
      'SeoAuditTab displays distinct Affected URLs chips and +N more overflow',
      (WidgetTester tester) async {
    final payload = SeoDashboardPayload.fromJson({
      'success': true,
      'data': {
        'project': {
          'domain': 'www.hangbug.com',
          'siteUrl': 'https://www.hangbug.com',
        },
        'audit': {
          'pagesScanned': 25,
          'issues': [
            {
              'id': 'empty_tech_categories_opportunity',
              'title': 'Technology Tracks Ready for Quiz Questions & Landing Guides',
              'bucket': 'opportunity',
              'severity': 'Low',
              'status': 'Needs attention',
              'type': 'content',
              'whatIsIssue':
                  '5 enabled category record(s) in MongoDB currently have 0 quiz questions.',
              'whyItMatters': 'Capture search demand.',
              'affectedUrls': [
                {
                  'url': '/technologies',
                  'label': 'Angular (/technologies)',
                  'detail': 'Category "Angular" has 0 questions',
                },
                {
                  'url': '/technologies',
                  'label': 'Bootstrap (/technologies)',
                  'detail': 'Category "Bootstrap" has 0 questions',
                },
                {
                  'url': '/technologies/css',
                  'label': 'CSS (/technologies/css)',
                  'detail': 'Category "CSS" has 0 questions',
                },
                {
                  'url': '/technologies',
                  'label': 'Django (/technologies)',
                  'detail': 'Category "Django" has 0 questions',
                },
                {
                  'url': '/technologies/flutter',
                  'label': 'Flutter (/technologies/flutter)',
                  'detail': 'Category "Flutter" has 0 questions',
                },
              ],
              'affectedCount': 5,
              'recommendedAction': 'Add quiz questions.',
              'howToFix': 'Populate questions.',
              'source': 'MongoDB Categories & Questions',
            },
          ],
        },
      },
    });

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.lightTheme,
        home: Scaffold(
          body: SingleChildScrollView(
            child: SeoAuditTab(
              data: payload,
              isAuditing: false,
              onRunAudit: () {},
            ),
          ),
        ),
      ),
    );

    expect(find.text('Affected URLs:'), findsOneWidget);
    expect(find.text('Angular (/technologies)'), findsOneWidget);
    expect(find.text('Bootstrap (/technologies)'), findsOneWidget);
    expect(find.text('CSS (/technologies/css)'), findsOneWidget);
    expect(find.text('Django (/technologies)'), findsOneWidget);
    expect(find.text('+1 more'), findsOneWidget);
    expect(find.text('/technologies'), findsNothing);
  });
}
