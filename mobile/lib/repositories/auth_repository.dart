import '../core/network/network_exceptions.dart';
import '../core/storage/secure_storage_service.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthRepository {
  final AuthService authService;
  final SecureStorageService secureStorage;

  AuthRepository({
    required this.authService,
    required this.secureStorage,
  });

  // Restore authenticated session on app cold-start
  Future<UserModel?> restoreSession() async {
    final token = await secureStorage.getToken();
    if (token == null || token.isEmpty) {
      await secureStorage.clearAll();
      return null;
    }

    try {
      final user = await authService.getMe();
      await secureStorage.saveUserData(user.toJson());
      return user;
    } on NetworkException catch (e) {
      // If unauthorized (401) or forbidden (403), the session is invalid or expired
      if (e.statusCode == 401 || e.statusCode == 403) {
        await secureStorage.clearAll();
        return null;
      }

      // If network error (offline, timeout, server 5xx), do not log out; use cached profile
      final cachedJson = await secureStorage.getUserData();
      if (cachedJson != null) {
        try {
          return UserModel.fromJson(cachedJson);
        } catch (_) {
          return null;
        }
      }
      return null;
    } catch (_) {
      // Fallback to cached profile if unexpected error occurs while token exists
      final cachedJson = await secureStorage.getUserData();
      if (cachedJson != null) {
        try {
          return UserModel.fromJson(cachedJson);
        } catch (_) {
          return null;
        }
      }
      return null;
    }
  }

  // Login
  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    final result = await authService.login(email: email, password: password);
    await secureStorage.saveToken(result.token);
    await secureStorage.saveUserData(result.user.toJson());
    return result.user;
  }

  // Signup
  Future<UserModel> signup({
    required String name,
    required String email,
    required String password,
  }) async {
    final result = await authService.signup(name: name, email: email, password: password);
    await secureStorage.saveToken(result.token);
    await secureStorage.saveUserData(result.user.toJson());
    return result.user;
  }

  // Update Profile
  Future<UserModel> updateProfile({String? name, String? email}) async {
    final updatedUser = await authService.updateProfile(name: name, email: email);
    await secureStorage.saveUserData(updatedUser.toJson());
    return updatedUser;
  }

  // Delete Account
  Future<void> deleteAccount() async {
    try {
      await authService.deleteAccount();
    } catch (_) {}
    await secureStorage.clearAll();
  }

  // Logout
  Future<void> logout() async {
    try {
      await authService.logout();
    } catch (_) {}
    await secureStorage.clearAll();
  }

  // Forgot password
  Future<String> forgotPassword(String email) async {
    return await authService.forgotPassword(email);
  }

  // Verify Reset Token
  Future<bool> verifyResetToken(String token) async {
    return await authService.verifyResetToken(token);
  }

  // Reset password
  Future<String> resetPassword({
    required String token,
    required String password,
    String? confirmPassword,
  }) async {
    return await authService.resetPassword(
      token: token,
      password: password,
      confirmPassword: confirmPassword,
    );
  }
}
