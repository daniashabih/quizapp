import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/network/network_exceptions.dart';
import 'package:hangbug/core/storage/secure_storage_service.dart';
import 'package:hangbug/models/user_model.dart';
import 'package:hangbug/repositories/auth_repository.dart';
import 'package:hangbug/services/auth_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// In-memory test double for SecureStorageService
class MockSecureStorageService extends SecureStorageService {
  final Map<String, String> _data = {};

  MockSecureStorageService() : super(const FlutterSecureStorage());

  @override
  Future<void> saveToken(String token) async {
    _data['hb_jwt_token'] = token;
  }

  @override
  Future<String?> getToken() async {
    return _data['hb_jwt_token'];
  }

  @override
  Future<bool> hasToken() async {
    final t = _data['hb_jwt_token'];
    return t != null && t.isNotEmpty;
  }

  @override
  Future<void> deleteToken() async {
    _data.remove('hb_jwt_token');
  }

  @override
  Future<void> saveUserData(Map<String, dynamic> userData) async {
    // ignore: avoid_dynamic_calls
    _data['hb_user_data'] = userData.toString();
    _storedUserData = Map<String, dynamic>.from(userData);
  }

  Map<String, dynamic>? _storedUserData;

  @override
  Future<Map<String, dynamic>?> getUserData() async {
    return _storedUserData;
  }

  @override
  Future<void> deleteUserData() async {
    _storedUserData = null;
    _data.remove('hb_user_data');
  }

  @override
  Future<void> clearAll() async {
    _data.clear();
    _storedUserData = null;
  }
}

// Fake AuthService to simulate API behavior
class FakeAuthService implements AuthService {
  UserModel? mockUser;
  String? mockToken;
  Object? errorToThrow;
  bool logoutCalled = false;
  bool deleteAccountCalled = false;

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);

  @override
  Future<({UserModel user, String token})> login({
    required String email,
    required String password,
  }) async {
    if (errorToThrow != null) throw errorToThrow!;
    return (
      user: mockUser ??
          const UserModel(
            id: 'u_123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'user',
          ),
      token: mockToken ?? 'fake_jwt_token_123',
    );
  }

  @override
  Future<({UserModel user, String token})> signup({
    required String name,
    required String email,
    required String password,
  }) async {
    if (errorToThrow != null) throw errorToThrow!;
    return (
      user: mockUser ??
          UserModel(
            id: 'u_new',
            name: name,
            email: email,
            role: 'user',
          ),
      token: mockToken ?? 'fake_signup_token_456',
    );
  }

  @override
  Future<UserModel> getMe() async {
    if (errorToThrow != null) throw errorToThrow!;
    return mockUser ??
        const UserModel(
          id: 'u_123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        );
  }

  @override
  Future<void> logout() async {
    logoutCalled = true;
    if (errorToThrow != null) throw errorToThrow!;
  }

  @override
  Future<void> deleteAccount() async {
    deleteAccountCalled = true;
    if (errorToThrow != null) throw errorToThrow!;
  }
}

void main() {
  group('Authentication Persistence & Session Restoration Tests', () {
    late MockSecureStorageService storage;
    late FakeAuthService authService;
    late AuthRepository repository;

    const dummyUser = UserModel(
      id: 'u_real_456',
      name: 'Persisted User',
      email: 'persisted@example.com',
      role: 'user',
      isVerified: true,
    );

    const dummyAdmin = UserModel(
      id: 'u_admin_789',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      isVerified: true,
    );

    setUp(() {
      storage = MockSecureStorageService();
      authService = FakeAuthService();
      repository = AuthRepository(
        authService: authService,
        secureStorage: storage,
      );
    });

    test('1. Fresh installation without stored token returns null and unauthenticated', () async {
      final user = await repository.restoreSession();
      expect(user, isNull);
      expect(await storage.getToken(), isNull);
    });

    test('2. Successful login persists token and user data to secure storage', () async {
      authService.mockUser = dummyUser;
      authService.mockToken = 'jwt_token_abc';

      final user = await repository.login(
        email: 'persisted@example.com',
        password: 'Password123!',
      );

      expect(user.id, equals('u_real_456'));
      expect(await storage.getToken(), equals('jwt_token_abc'));
      final cached = await storage.getUserData();
      expect(cached, isNotNull);
      expect(cached!['email'], equals('persisted@example.com'));
    });

    test('3. Reopening app with valid token restores session from backend', () async {
      // Seed pre-existing storage as if from previous session
      await storage.saveToken('jwt_valid_existing');
      await storage.saveUserData(dummyUser.toJson());
      authService.mockUser = dummyUser;

      final restored = await repository.restoreSession();

      expect(restored, isNotNull);
      expect(restored!.id, equals(dummyUser.id));
      expect(restored.name, equals('Persisted User'));
      expect(await storage.getToken(), equals('jwt_valid_existing'));
    });

    test('4. Expired token (HTTP 401) clears secure storage and denies access', () async {
      await storage.saveToken('jwt_expired_session');
      await storage.saveUserData(dummyUser.toJson());

      // Backend returns 401 Unauthorized
      authService.errorToThrow = const NetworkException(
        message: 'Session expired. Please log in again.',
        statusCode: 401,
      );

      final restored = await repository.restoreSession();

      // Must NOT return cached user; session is invalid!
      expect(restored, isNull);
      // Secure storage must be purged
      expect(await storage.getToken(), isNull);
      expect(await storage.getUserData(), isNull);
    });

    test('5. Revoked token (HTTP 403) clears secure storage and denies access', () async {
      await storage.saveToken('jwt_revoked');
      await storage.saveUserData(dummyUser.toJson());

      authService.errorToThrow = const NetworkException(
        message: 'Access denied.',
        statusCode: 403,
      );

      final restored = await repository.restoreSession();

      expect(restored, isNull);
      expect(await storage.getToken(), isNull);
    });

    test('6. Temporary network unavailability retains cached session gracefully', () async {
      await storage.saveToken('jwt_valid_offline');
      await storage.saveUserData(dummyUser.toJson());

      // Simulate offline / no internet connection error
      authService.errorToThrow = const NetworkException(
        message: 'No internet connection',
        statusCode: null,
      );

      final restored = await repository.restoreSession();

      // User is NOT logged out due to transient offline status
      expect(restored, isNotNull);
      expect(restored!.email, equals(dummyUser.email));
      expect(await storage.getToken(), equals('jwt_valid_offline'));
    });

    test('7. Temporary server error (500/503) retains cached session gracefully', () async {
      await storage.saveToken('jwt_valid_server_down');
      await storage.saveUserData(dummyUser.toJson());

      // Simulate backend 503 Service Unavailable
      authService.errorToThrow = const NetworkException(
        message: 'Server error',
        statusCode: 503,
      );

      final restored = await repository.restoreSession();

      expect(restored, isNotNull);
      expect(restored!.id, equals(dummyUser.id));
      expect(await storage.getToken(), equals('jwt_valid_server_down'));
    });

    test('8. Logout wipes all local credentials and invokes server logout', () async {
      await storage.saveToken('jwt_to_logout');
      await storage.saveUserData(dummyUser.toJson());

      await repository.logout();

      expect(authService.logoutCalled, isTrue);
      expect(await storage.getToken(), isNull);
      expect(await storage.getUserData(), isNull);
    });

    test('9. Logout succeeds even if backend is temporarily unreachable', () async {
      await storage.saveToken('jwt_to_logout_offline');
      await storage.saveUserData(dummyUser.toJson());
      authService.errorToThrow = const NetworkException(
        message: 'Network error during logout',
      );

      await repository.logout();

      // Local storage must still be wiped cleanly
      expect(await storage.getToken(), isNull);
      expect(await storage.getUserData(), isNull);
    });

    test('10. Account deletion wipes all secure local credentials', () async {
      await storage.saveToken('jwt_to_delete');
      await storage.saveUserData(dummyUser.toJson());

      await repository.deleteAccount();

      expect(authService.deleteAccountCalled, isTrue);
      expect(await storage.getToken(), isNull);
      expect(await storage.getUserData(), isNull);
    });

    test('11. Admin vs Regular user role check', () {
      expect(dummyUser.isAdmin, isFalse);
      expect(dummyAdmin.isAdmin, isTrue);
    });

    test('12. User initials formatting', () {
      expect(dummyUser.initials, equals('PU'));
      const singleNameUser = UserModel(id: '1', name: 'Developer', email: 'd@d.com');
      expect(singleNameUser.initials, equals('D'));
    });
  });
}
