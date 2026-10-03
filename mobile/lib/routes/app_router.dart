import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/certificate_model.dart';
import '../models/quiz_result_model.dart';
import '../models/app_settings_model.dart';
import '../providers/auth_provider.dart';
import '../providers/settings_provider.dart';
import '../screens/admin/admin_ai_generator_screen.dart';
import '../screens/admin/admin_categories_screen.dart';
import '../screens/admin/admin_dashboard_screen.dart';
import '../screens/admin/admin_questions_screen.dart';
import '../screens/admin/admin_users_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/certificates/certificate_view_screen.dart';
import '../screens/certificates/certificates_screen.dart';
import '../screens/explore/explore_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/home/main_shell_screen.dart';
import '../screens/legal/privacy_policy_screen.dart';
import '../screens/legal/terms_screen.dart';
import '../screens/maintenance/maintenance_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/settings_screen.dart';
import '../screens/quiz/quiz_screen.dart';
import '../screens/results/result_screen.dart';
import '../screens/splash/splash_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final _shellNavigatorHomeKey = GlobalKey<NavigatorState>(debugLabel: 'shellHome');
final _shellNavigatorExploreKey = GlobalKey<NavigatorState>(debugLabel: 'shellExplore');
final _shellNavigatorCertsKey = GlobalKey<NavigatorState>(debugLabel: 'shellCerts');
final _shellNavigatorProfileKey = GlobalKey<NavigatorState>(debugLabel: 'shellProfile');
final _shellNavigatorAdminKey = GlobalKey<NavigatorState>(debugLabel: 'shellAdmin');

class RouterNotifier extends ChangeNotifier {
  final Ref _ref;

  RouterNotifier(this._ref) {
    _ref.listen<AuthState>(
      authProvider,
      (previous, next) => notifyListeners(),
    );
    _ref.listen<AppSettingsModel>(
      settingsProvider,
      (previous, next) => notifyListeners(),
    );
  }
}

final routerNotifierProvider = Provider<RouterNotifier>((ref) {
  return RouterNotifier(ref);
});

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(routerNotifierProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: notifier,
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      final currentLoc = state.uri.path;

      // Allow splash screen while initializing
      if (!auth.isInitialized) {
        return currentLoc == '/splash' ? null : '/splash';
      }

      final isAuth = auth.isAuthenticated;
      final isAdmin = auth.isAdmin;

      // Central Maintenance Mode enforcement (Admins bypass maintenance)
      final settings = ref.read(settingsProvider);
      final isMaintenance = settings.maintenanceMode;
      if (isMaintenance && !isAdmin) {
        if (currentLoc != '/maintenance') {
          return '/maintenance';
        }
        return null;
      } else if (!isMaintenance && currentLoc == '/maintenance') {
        return isAuth ? '/home' : '/login';
      }

      final isPublicRoute = currentLoc == '/splash' ||
          currentLoc == '/login' ||
          currentLoc == '/register' ||
          currentLoc == '/forgot-password' ||
          currentLoc == '/maintenance' ||
          currentLoc.startsWith('/legal');

      // Unauthenticated user trying to access protected screen
      if (!isAuth && !isPublicRoute) {
        return '/login';
      }

      // Authenticated user on auth entry screen
      if (isAuth && (currentLoc == '/login' || currentLoc == '/register')) {
        return '/home';
      }

      // Non-admin attempting to access admin routes
      if (currentLoc.startsWith('/admin') && !isAdmin) {
        return '/home';
      }

      return null;
    },
    routes: [
      // Maintenance
      GoRoute(
        path: '/maintenance',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const MaintenanceScreen(),
      ),

      // Splash
      GoRoute(
        path: '/splash',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SplashScreen(),
      ),

      // Auth routes
      GoRoute(
        path: '/login',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),

      // Main Stateful Shell with Bottom Navigation
      StatefulShellRoute.indexedStack(
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state, navigationShell) {
          return MainShellScreen(navigationShell: navigationShell);
        },
        branches: [
          // Branch 0: Home
          StatefulShellBranch(
            navigatorKey: _shellNavigatorHomeKey,
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),

          // Branch 1: Explore
          StatefulShellBranch(
            navigatorKey: _shellNavigatorExploreKey,
            routes: [
              GoRoute(
                path: '/explore',
                builder: (context, state) => const ExploreScreen(),
              ),
            ],
          ),

          // Branch 2: Certificates
          StatefulShellBranch(
            navigatorKey: _shellNavigatorCertsKey,
            routes: [
              GoRoute(
                path: '/certificates',
                builder: (context, state) => const CertificatesScreen(),
              ),
            ],
          ),

          // Branch 3: Profile
          StatefulShellBranch(
            navigatorKey: _shellNavigatorProfileKey,
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),

          // Branch 4: Admin (Available when user is admin)
          StatefulShellBranch(
            navigatorKey: _shellNavigatorAdminKey,
            routes: [
              GoRoute(
                path: '/admin',
                builder: (context, state) => const AdminDashboardScreen(),
              ),
            ],
          ),
        ],
      ),

      // Quiz execution screen (fullscreen) - supports both /quiz and /quiz/play
      GoRoute(
        path: '/quiz',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => _buildQuizScreen(state),
      ),
      GoRoute(
        path: '/quiz/play',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => _buildQuizScreen(state),
      ),

      // Quiz result screen
      GoRoute(
        path: '/quiz/results',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final result = state.extra as QuizResultModel?;
          if (result == null) {
            return const Scaffold(
              body: Center(child: Text('Quiz result not found.')),
            );
          }
          return ResultScreen(result: result);
        },
      ),

      // Certificate detail viewer
      GoRoute(
        path: '/certificates/view',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final cert = state.extra as CertificateModel?;
          if (cert == null) {
            return const Scaffold(
              body: Center(child: Text('Certificate not found.')),
            );
          }
          return CertificateViewScreen(certificate: cert);
        },
      ),

      // Profile & Settings
      GoRoute(
        path: '/settings',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SettingsScreen(),
      ),

      // Compliance & Legal
      GoRoute(
        path: '/legal/privacy',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const PrivacyPolicyScreen(),
      ),
      GoRoute(
        path: '/legal/terms',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const TermsScreen(),
      ),

      // Admin sub-management tools
      GoRoute(
        path: '/admin/questions',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AdminQuestionsScreen(),
      ),
      GoRoute(
        path: '/admin/categories',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AdminCategoriesScreen(),
      ),
      GoRoute(
        path: '/admin/users',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AdminUsersScreen(),
      ),
      GoRoute(
        path: '/admin/ai-generator',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AdminAiGeneratorScreen(),
      ),
    ],
  );
});

Widget _buildQuizScreen(GoRouterState state) {
  String? category;
  int? session;

  if (state.extra is Map) {
    final map = state.extra as Map;
    if (map['category'] != null) {
      category = map['category'].toString();
    }
    if (map['session'] != null) {
      session = int.tryParse(map['session'].toString());
    }
  }

  category ??= state.uri.queryParameters['category'] ?? 'JavaScript';
  session ??= int.tryParse(state.uri.queryParameters['session'] ?? '1') ?? 1;

  return QuizScreen(category: category, session: session);
}
