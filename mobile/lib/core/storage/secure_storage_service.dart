import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const String _keyToken = 'hb_jwt_token';
  static const String _keyUserData = 'hb_user_data';

  final FlutterSecureStorage _storage;

  SecureStorageService([FlutterSecureStorage? storage])
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
              ),
            );

  // JWT Token Management
  Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _keyToken, value: token);
    } catch (_) {}
  }

  Future<String?> getToken() async {
    try {
      return await _storage.read(key: _keyToken);
    } catch (_) {
      try {
        await _storage.deleteAll();
      } catch (_) {}
      return null;
    }
  }

  Future<bool> hasToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> deleteToken() async {
    try {
      await _storage.delete(key: _keyToken);
    } catch (_) {}
  }

  // User Profile Cache Management
  Future<void> saveUserData(Map<String, dynamic> userData) async {
    try {
      await _storage.write(key: _keyUserData, value: jsonEncode(userData));
    } catch (_) {}
  }

  Future<Map<String, dynamic>?> getUserData() async {
    try {
      final raw = await _storage.read(key: _keyUserData);
      if (raw == null || raw.isEmpty) return null;
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> deleteUserData() async {
    try {
      await _storage.delete(key: _keyUserData);
    } catch (_) {}
  }

  // Clear all credentials upon logout / account deletion
  Future<void> clearAll() async {
    try {
      await _storage.deleteAll();
    } catch (_) {}
  }
}
