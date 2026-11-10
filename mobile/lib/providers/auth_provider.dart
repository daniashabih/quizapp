import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';
import '../services/notification_service.dart';
import 'core_providers.dart';

class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;
  final bool isInitialized;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
    this.isInitialized = false,
  });

  bool get isAuthenticated => user != null;
  bool get isAdmin => user?.isAdmin ?? false;

  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    String? error,
    bool clearError = false,
    bool? isInitialized,
    bool clearUser = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
      isInitialized: isInitialized ?? this.isInitialized,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref _ref;

  AuthNotifier(this._ref) : super(const AuthState()) {
    _ref.read(apiClientProvider).onUnauthorized = _handleUnauthorized;
    restoreSession();
  }

  void _handleUnauthorized() {
    if (state.user != null) {
      state = state.copyWith(
        clearUser: true,
        error: 'Your session has expired. Please sign in again.',
      );
      AppNotificationService.warning(
        id: 'mobile-session-expired',
        title: 'Session expired',
        message: 'Your session has expired. Please sign in again.',
      );
    }
  }

  // Restore session on app cold-start
  Future<void> restoreSession() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final repository = _ref.read(authRepositoryProvider);
      final user = await repository.restoreSession();
      state = state.copyWith(
        user: user,
        isLoading: false,
        isInitialized: true,
      );
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        isInitialized: true,
      );
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    final toastId = AppNotificationService.loading(
      id: 'mobile-auth-login',
      title: 'Signing you in...',
      message: 'Verifying your credentials with Hangbug.',
    );
    try {
      final repository = _ref.read(authRepositoryProvider);
      final user = await repository.login(email: email, password: password);
      state = state.copyWith(user: user, isLoading: false);
      AppNotificationService.update(
        toastId,
        type: HangbugNotificationType.success,
        title: "You're all set!",
        message: 'Welcome back to Hangbug.',
      );
      return true;
    } catch (e) {
      final cleanError = e.toString().replaceFirst(RegExp(r'^Exception:\s*'), '');
      state = state.copyWith(isLoading: false, error: cleanError);
      AppNotificationService.update(
        toastId,
        type: HangbugNotificationType.error,
        title: 'Sign-in failed',
        message: cleanError,
      );
      return false;
    }
  }

  // Signup
  Future<bool> signup(String name, String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    final toastId = AppNotificationService.loading(
      id: 'mobile-auth-signup',
      title: 'Creating your account...',
      message: 'Setting up your Hangbug profile.',
    );
    try {
      final repository = _ref.read(authRepositoryProvider);
      final user = await repository.signup(
        name: name,
        email: email,
        password: password,
      );
      state = state.copyWith(user: user, isLoading: false);
      AppNotificationService.update(
        toastId,
        type: HangbugNotificationType.success,
        title: 'Welcome to Hangbug!',
        message: 'Your account has been created. Let’s start learning.',
      );
      return true;
    } catch (e) {
      final cleanError = e.toString().replaceFirst(RegExp(r'^Exception:\s*'), '');
      state = state.copyWith(isLoading: false, error: cleanError);
      AppNotificationService.update(
        toastId,
        type: HangbugNotificationType.error,
        title: 'Registration failed',
        message: cleanError,
      );
      return false;
    }
  }

  // Update Profile
  Future<bool> updateProfile({String? name, String? email}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final repository = _ref.read(authRepositoryProvider);
      final updatedUser = await repository.updateProfile(name: name, email: email);
      state = state.copyWith(user: updatedUser, isLoading: false);
      AppNotificationService.success(
        id: 'mobile-profile-update',
        title: 'Profile updated',
        message: 'Your personal details have been saved.',
      );
      return true;
    } catch (e) {
      final cleanError = e.toString().replaceFirst(RegExp(r'^Exception:\s*'), '');
      state = state.copyWith(isLoading: false, error: cleanError);
      AppNotificationService.error(
        id: 'mobile-profile-update',
        title: 'Update failed',
        message: cleanError,
      );
      return false;
    }
  }

  // Delete Account (Google Play Requirement)
  Future<bool> deleteAccount() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final repository = _ref.read(authRepositoryProvider);
      await repository.deleteAccount();
      state = state.copyWith(
        clearUser: true,
        isLoading: false,
      );
      return true;
    } catch (e) {
      final cleanError = e.toString().replaceFirst(RegExp(r'^Exception:\s*'), '');
      state = state.copyWith(isLoading: false, error: cleanError);
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    try {
      final repository = _ref.read(authRepositoryProvider);
      await repository.logout();
    } finally {
      state = state.copyWith(
        clearUser: true,
        isLoading: false,
      );
      AppNotificationService.info(
        id: 'mobile-auth-logout',
        title: 'Signed out',
        message: 'You have been safely signed out of Hangbug.',
      );
    }
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});
