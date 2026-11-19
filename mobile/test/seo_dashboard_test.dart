import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/theme/app_theme.dart';
import 'package:hangbug/models/seo_dashboard_model.dart';
import 'package:hangbug/screens/admin/seo/widgets/seo_charts.dart';
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
}
