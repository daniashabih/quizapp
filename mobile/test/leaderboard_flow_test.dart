import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/theme/app_theme.dart';
import 'package:hangbug/models/dashboard_model.dart';
import 'package:hangbug/models/user_model.dart';
import 'package:hangbug/providers/auth_provider.dart';
import 'package:hangbug/providers/dashboard_provider.dart';
import 'package:hangbug/screens/leaderboard/leaderboard_screen.dart';
import 'package:hangbug/screens/leaderboard/leaderboard_full_screen.dart';

class MockAuthNotifier extends StateNotifier<AuthState> implements AuthNotifier {
  MockAuthNotifier(super.initial);

  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

List<LeaderboardEntryModel> createMockRankedUsers({int count = 10}) {
  return List.generate(count, (index) {
    final rank = index + 1;
    final xp = 10000 - (index * 800);
    return LeaderboardEntryModel(
      id: 'user_$rank',
      rank: rank,
      name: 'Developer $rank',
      avatar: '',
      initials: 'D$rank',
      role: rank == 1 ? 'Administrator' : 'Software Engineer',
      xp: xp,
      score: 95.0 - (index * 2),
      quizzes: 20 - index,
      certs: 5 - (index ~/ 2),
      streak: '${10 - index}d',
      category: index % 2 == 0 ? 'React' : 'JavaScript',
    );
  });
}

void main() {
  group('Leaderboard Model & Filter Unit Tests', () {
    test('LeaderboardEntryModel ranks from 1 to 5 based on actual points/scores', () {
      final mockData = createMockRankedUsers(count: 7);

      // Verify descending order by XP
      for (int i = 0; i < mockData.length - 1; i++) {
        expect(mockData[i].xp >= mockData[i + 1].xp, isTrue);
        expect(mockData[i].rank, equals(i + 1));
      }

      // Verify top 5 slice
      final top5 = mockData.take(5).toList();
      expect(top5.length, equals(5));
      expect(top5.first.rank, equals(1));
      expect(top5.first.xp, equals(10000));
      expect(top5.last.rank, equals(5));
      expect(top5.last.xp, equals(6800));
    });

    test('LeaderboardFilter equality and hashcode', () {
      const f1 = LeaderboardFilter(timeframe: 'all-time', category: 'All');
      const f2 = LeaderboardFilter(timeframe: 'all-time', category: 'All');
      const f3 = LeaderboardFilter(timeframe: 'weekly', category: 'React');

      expect(f1, equals(f2));
      expect(f1.hashCode, equals(f2.hashCode));
      expect(f1 == f3, isFalse);
    });
  });

  group('LeaderboardScreen (Top 5 View) Widget Tests', () {
    testWidgets('Displays only top 5 users with Gold, Silver, Bronze highlights and See More button', (WidgetTester tester) async {
      final mockTop5 = createMockRankedUsers(count: 5);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            top5LeaderboardProvider.overrideWith((ref) => Future.value(mockTop5)),
            authProvider.overrideWith((ref) => MockAuthNotifier(
                  const AuthState(
                    user: UserModel(id: 'u_test', name: 'Tester', email: 'test@example.com'),
                    isInitialized: true,
                  ),
                )),
          ],
          child: MaterialApp(
            theme: AppTheme.lightTheme,
            home: const LeaderboardScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify Top 5 Heading & Podium
      expect(find.text('Top 5 Performers'), findsOneWidget);
      expect(find.text('Podium Highlights'), findsOneWidget);

      // Verify Rank 1 Gold highlight
      expect(find.text('#1 Gold Champion'), findsOneWidget);
      expect(find.text('Developer 1'), findsOneWidget);
      expect(find.text('10000'), findsOneWidget);

      // Verify Rank 2 Silver highlight
      expect(find.text('#2 Silver Runner-Up'), findsOneWidget);
      expect(find.text('Developer 2'), findsOneWidget);
      expect(find.text('9200'), findsOneWidget);

      // Verify Rank 3 Bronze highlight
      expect(find.text('#3 Bronze Podium'), findsOneWidget);
      expect(find.text('Developer 3'), findsOneWidget);
      expect(find.text('8400'), findsOneWidget);

      // Verify Ranks 4 and 5
      expect(find.text('#4'), findsOneWidget);
      expect(find.text('Developer 4'), findsOneWidget);
      expect(find.text('7600 XP'), findsOneWidget);

      expect(find.text('#5'), findsOneWidget);
      expect(find.text('Developer 5'), findsOneWidget);
      expect(find.text('6800 XP'), findsOneWidget);

      // Ensure rank 6 is NOT present (only top 5 users shown)
      expect(find.text('#6'), findsNothing);
      expect(find.text('Developer 6'), findsNothing);

      // Verify See More button is prominently displayed
      expect(find.text('See More Rankings'), findsOneWidget);
    });

    testWidgets('Guest / Logged-out visitor can view Top 5 users without restriction', (WidgetTester tester) async {
      final mockTop5 = createMockRankedUsers(count: 5);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            top5LeaderboardProvider.overrideWith((ref) => Future.value(mockTop5)),
            authProvider.overrideWith((ref) => MockAuthNotifier(
                  const AuthState(
                    user: null,
                    isInitialized: true,
                  ),
                )),
          ],
          child: MaterialApp(
            theme: AppTheme.lightTheme,
            home: const LeaderboardScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Logged out visitor can view top 5
      expect(find.text('Top 5 Performers'), findsOneWidget);
      expect(find.text('Developer 1'), findsOneWidget);
      expect(find.text('#1 Gold Champion'), findsOneWidget);
      expect(find.text('See More Rankings'), findsOneWidget);
    });
  });

  group('LeaderboardFullScreen (All Standings View) Widget Tests', () {
    testWidgets('Displays all ranked users with pagination and Show Less option', (WidgetTester tester) async {
      final mockAllUsers = createMockRankedUsers(count: 15);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            leaderboardProvider.overrideWith((ref, filter) => Future.value(mockAllUsers)),
            authProvider.overrideWith((ref) => MockAuthNotifier(
                  const AuthState(
                    user: UserModel(id: 'u_auth', name: 'Auth User', email: 'auth@example.com'),
                    isInitialized: true,
                  ),
                )),
          ],
          child: MaterialApp(
            theme: AppTheme.lightTheme,
            home: const LeaderboardFullScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Header and Show Less button
      expect(find.text('All Standings'), findsOneWidget);
      expect(find.text('Show Less'), findsOneWidget);

      // Top 3 badges in full standings
      expect(find.text('GOLD'), findsOneWidget);
      expect(find.text('SILVER'), findsOneWidget);
      expect(find.text('BRONZE'), findsOneWidget);

      // Scroll down to Load More footer
      await tester.scrollUntilVisible(
        find.text('Load More (+5)'),
        200,
        scrollable: find.byType(Scrollable).last,
      );
      await tester.pumpAndSettle();

      // Pagination indicator: initial 10 items displayed out of 15
      expect(find.text('Showing 10 of 15 ranked developers'), findsOneWidget);
      expect(find.text('Load More (+5)'), findsOneWidget);

      // Tap Load More
      await tester.tap(find.text('Load More (+5)'));
      await tester.pumpAndSettle();

      // Scroll to bottom
      await tester.scrollUntilVisible(
        find.text('End of leaderboard (15 total ranked)'),
        200,
        scrollable: find.byType(Scrollable).last,
      );
      await tester.pumpAndSettle();

      // Now all 15 are shown
      expect(find.text('End of leaderboard (15 total ranked)'), findsOneWidget);
      expect(find.text('Developer 15'), findsOneWidget);
    });
  });
}
