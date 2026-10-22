import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/utils/validators.dart';
import 'package:hangbug/models/user_model.dart';
import 'package:hangbug/repositories/auth_repository.dart';
import 'package:hangbug/screens/auth/forgot_password_screen.dart';
import 'package:hangbug/screens/auth/reset_password_screen.dart';
import 'package:hangbug/providers/core_providers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Test double for AuthRepository
class FakeAuthRepository extends Fake implements AuthRepository {
  bool forgotPasswordCalled = false;
  String? lastForgotEmail;
  String? tokenToVerify;
  bool shouldTokenBeValid = true;
  bool resetPasswordCalled = false;
  String? lastResetToken;
  String? lastResetPassword;

  @override
  Future<String> forgotPassword(String email) async {
    forgotPasswordCalled = true;
    lastForgotEmail = email;
    return 'If an account exists for this email address, you will receive a password reset link shortly.';
  }

  @override
  Future<bool> verifyResetToken(String token) async {
    tokenToVerify = token;
    return shouldTokenBeValid;
  }

  @override
  Future<String> resetPassword({
    required String token,
    required String password,
    String? confirmPassword,
  }) async {
    resetPasswordCalled = true;
    lastResetToken = token;
    lastResetPassword = password;
    return 'Password has been reset successfully.';
  }

  @override
  Future<UserModel?> restoreSession() async => null;
}

void main() {
  group('Password Policy & Validation Unit Tests', () {
    test('Validators.validateEmail accepts valid email formats', () {
      expect(Validators.validateEmail('user@hangbug.com'), isNull);
      expect(Validators.validateEmail('test.dev+alias@sub.example.co'), isNull);
    });

    test('Validators.validateEmail rejects empty and malformed emails', () {
      expect(Validators.validateEmail(''), isNotNull);
      expect(Validators.validateEmail('   '), isNotNull);
      expect(Validators.validateEmail('notanemail'), isNotNull);
      expect(Validators.validateEmail('user@'), isNotNull);
      expect(Validators.validateEmail('@domain.com'), isNotNull);
    });

    test('Validators.validatePassword enforces length >= 8', () {
      expect(Validators.validatePassword('Pass1'), 'Password must be at least 8 characters');
      expect(Validators.validatePassword('Pass1234'), isNull);
    });

    test('Validators.validatePassword enforces at least one uppercase letter', () {
      expect(Validators.validatePassword('password123'), 'Must contain at least one uppercase letter');
      expect(Validators.validatePassword('Password123'), isNull);
    });

    test('Validators.validatePassword enforces at least one numeric digit', () {
      expect(Validators.validatePassword('PasswordABC'), 'Must contain at least one number');
      expect(Validators.validatePassword('Password123'), isNull);
    });

    test('Validators.validateConfirmPassword matches original password', () {
      expect(Validators.validateConfirmPassword('Secret123', 'Secret123'), isNull);
      expect(Validators.validateConfirmPassword('Secret1234', 'Secret123'), 'Passwords do not match');
      expect(Validators.validateConfirmPassword('', 'Secret123'), 'Please confirm your password');
    });
  });

  group('FakeAuthRepository Forgot & Reset Integration Tests', () {
    late FakeAuthRepository fakeRepo;

    setUp(() {
      fakeRepo = FakeAuthRepository();
    });

    test('forgotPassword delegates to repository and records email', () async {
      final msg = await fakeRepo.forgotPassword('learner@hangbug.com');
      expect(fakeRepo.forgotPasswordCalled, isTrue);
      expect(fakeRepo.lastForgotEmail, 'learner@hangbug.com');
      expect(msg, contains('receive a password reset link shortly'));
    });

    test('verifyResetToken validates token parameter', () async {
      fakeRepo.shouldTokenBeValid = true;
      final valid = await fakeRepo.verifyResetToken('valid-token-12345');
      expect(valid, isTrue);
      expect(fakeRepo.tokenToVerify, 'valid-token-12345');

      fakeRepo.shouldTokenBeValid = false;
      final invalid = await fakeRepo.verifyResetToken('expired-token');
      expect(invalid, isFalse);
    });

    test('resetPassword sends new password and token to repository', () async {
      final msg = await fakeRepo.resetPassword(
        token: 'token-abc-987',
        password: 'NewStrongPassword1!',
        confirmPassword: 'NewStrongPassword1!',
      );
      expect(fakeRepo.resetPasswordCalled, isTrue);
      expect(fakeRepo.lastResetToken, 'token-abc-987');
      expect(fakeRepo.lastResetPassword, 'NewStrongPassword1!');
      expect(msg, contains('reset successfully'));
    });
  });

  group('Widget Tests: ForgotPasswordScreen & ResetPasswordScreen', () {
    testWidgets('ForgotPasswordScreen renders branding, fields, and calls repo on submit', (tester) async {
      final fakeRepo = FakeAuthRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(fakeRepo),
          ],
          child: const MaterialApp(
            home: ForgotPasswordScreen(),
          ),
        ),
      );

      // Verify UI elements
      expect(find.text('Forgot Password?'), findsOneWidget);
      expect(find.text("Enter your registered email address and we'll send you a link to reset your password."), findsOneWidget);
      expect(find.text('Send Reset Link'), findsOneWidget);
      expect(find.text('Return to Login'), findsOneWidget);

      // Enter valid email and tap submit
      await tester.enterText(find.byType(TextFormField), 'student@hangbug.com');
      await tester.tap(find.text('Send Reset Link'));
      await tester.pumpAndSettle();

      // Verify repository invocation and success banner
      expect(fakeRepo.forgotPasswordCalled, isTrue);
      expect(fakeRepo.lastForgotEmail, 'student@hangbug.com');
      expect(find.text('If an account exists for this email address, you will receive a password reset link shortly.'), findsOneWidget);
    });

    testWidgets('ResetPasswordScreen shows invalid state when token is empty', (tester) async {
      final fakeRepo = FakeAuthRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(fakeRepo),
          ],
          child: const MaterialApp(
            home: ResetPasswordScreen(token: ''),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Invalid or Expired Link'), findsOneWidget);
      expect(find.text('Request New Link'), findsOneWidget);
    });

    testWidgets('ResetPasswordScreen displays password inputs when token is valid', (tester) async {
      final fakeRepo = FakeAuthRepository();
      fakeRepo.shouldTokenBeValid = true;

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(fakeRepo),
          ],
          child: const MaterialApp(
            home: ResetPasswordScreen(token: 'valid-test-token-123'),
          ),
        ),
      );

      // Initial validation pump
      await tester.pumpAndSettle();

      expect(find.text('Set New Password'), findsOneWidget);
      expect(find.text('Password Requirements:'), findsOneWidget);
      expect(find.text('Reset Password'), findsOneWidget);
    });
  });
}
