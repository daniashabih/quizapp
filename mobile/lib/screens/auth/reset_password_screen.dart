import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/utils/validators.dart';
import '../../providers/core_providers.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  final String token;

  const ResetPasswordScreen({
    super.key,
    required this.token,
  });

  @override
  ConsumerState<ResetPasswordScreen> createState() =>
      _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isVerifying = true;
  bool _isTokenValid = false;
  String? _tokenError;

  bool _isSubmitting = false;
  String? _errorMessage;
  bool _isSuccess = false;

  @override
  void initState() {
    super.initState();
    _verifyToken();
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _verifyToken() async {
    if (widget.token.trim().isEmpty) {
      setState(() {
        _isVerifying = false;
        _isTokenValid = false;
        _tokenError =
            'No reset token found in link. Please request a new password reset.';
      });
      return;
    }

    try {
      final repo = ref.read(authRepositoryProvider);
      final isValid = await repo.verifyResetToken(widget.token.trim());
      if (mounted) {
        setState(() {
          _isVerifying = false;
          _isTokenValid = isValid;
          if (!isValid) {
            _tokenError =
                'This password reset link is invalid, expired, or has already been used.';
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isVerifying = false;
          _isTokenValid = false;
          _tokenError =
              e.toString().replaceFirst(RegExp(r'^Exception:\s*'), '');
        });
      }
    }
  }

  Future<void> _handleResetPassword() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final repo = ref.read(authRepositoryProvider);
      await repo.resetPassword(
        token: widget.token.trim(),
        password: _passwordController.text,
        confirmPassword: _confirmPasswordController.text,
      );

      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _isSuccess = true;
        });

        Future.delayed(const Duration(milliseconds: 2000), () {
          if (mounted) {
            context.go('/login');
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _errorMessage =
              e.toString().replaceFirst(RegExp(r'^Exception:\s*'), '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.scaffoldBgColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            size: 18,
            color: context.textPrimaryColor,
          ),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/login');
            }
          },
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding:
                const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: _buildBody(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBody() {
    // 1. Verifying token state
    if (_isVerifying) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 48.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 36,
                height: 36,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    context.brandAccentColor,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Validating reset link...',
                style: AppTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: context.textPrimaryColor,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Please wait while we verify your security credentials.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodySmall.copyWith(
                  color: context.textSecondaryColor,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // 2. Token invalid / expired state
    if (!_isTokenValid && !_isSuccess) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: context.warningBgColor,
                shape: BoxShape.circle,
                border: Border.all(
                  color: context.warningColor.withValues(alpha: 0.4),
                ),
              ),
              child: Icon(
                Icons.warning_amber_rounded,
                size: 36,
                color: context.warningColor,
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Invalid or Expired Link',
            textAlign: TextAlign.center,
            style: AppTextStyles.displayMedium.copyWith(fontSize: 22),
          ),
          const SizedBox(height: 10),
          Text(
            _tokenError ??
                'This password reset link is invalid, expired, or has already been used.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMedium.copyWith(
              color: context.textSecondaryColor,
              fontSize: 13,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 28),
          AppButton(
            text: 'Request New Link',
            onPressed: () => context.go('/forgot-password'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () => context.go('/login'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              side: BorderSide(color: context.borderColor),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              'Return to Login',
              style: AppTextStyles.bodyMedium.copyWith(
                color: context.textPrimaryColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      );
    }

    // 3. Reset Success state
    if (_isSuccess) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: context.successBgColor,
                shape: BoxShape.circle,
                border: Border.all(
                  color: context.successColor.withValues(alpha: 0.35),
                ),
              ),
              child: Icon(
                Icons.check_circle_rounded,
                size: 40,
                color: context.successColor,
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Password Reset Complete!',
            textAlign: TextAlign.center,
            style: AppTextStyles.displayMedium.copyWith(fontSize: 22),
          ),
          const SizedBox(height: 10),
          Text(
            'Your password has been successfully updated. Redirecting to login...',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMedium.copyWith(
              color: context.textSecondaryColor,
              fontSize: 13,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 28),
          AppButton(
            text: 'Proceed to Login',
            onPressed: () => context.go('/login'),
          ),
        ],
      );
    }

    // 4. Reset password form
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 72,
              height: 72,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: context.cardBgColor,
                shape: BoxShape.circle,
                border: Border.all(color: context.borderColor),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(
                      alpha: context.isDarkMode ? 0.28 : 0.06,
                    ),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Image.asset(
                'assets/images/branding/hangbug-icon.png',
                fit: BoxFit.contain,
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Set New Password',
            textAlign: TextAlign.center,
            style: AppTextStyles.displayMedium.copyWith(fontSize: 22),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose a strong new password for your Hangbug account.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMedium.copyWith(
              color: context.textSecondaryColor,
              fontSize: 13,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),

          // Error Banner
          if (_errorMessage != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: context.errorBgColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: context.errorColor.withValues(alpha: 0.35),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.error_outline_rounded,
                    color: context.errorColor,
                    size: 20,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _errorMessage!,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: context.errorColor,
                        fontWeight: FontWeight.w600,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Password Field
          AppTextField(
            label: 'New Password',
            hint: '••••••••',
            controller: _passwordController,
            isPassword: true,
            textInputAction: TextInputAction.next,
            validator: Validators.validatePassword,
            prefixIcon: Icon(
              Icons.lock_outline_rounded,
              size: 20,
              color: context.textSecondaryColor,
            ),
          ),
          const SizedBox(height: 16),

          // Confirm Password Field
          AppTextField(
            label: 'Confirm New Password',
            hint: '••••••••',
            controller: _confirmPasswordController,
            isPassword: true,
            textInputAction: TextInputAction.done,
            validator: (v) => Validators.validateConfirmPassword(
              v,
              _passwordController.text,
            ),
            prefixIcon: Icon(
              Icons.lock_outline_rounded,
              size: 20,
              color: context.textSecondaryColor,
            ),
            onSubmitted: (_) => _handleResetPassword(),
          ),
          const SizedBox(height: 14),

          // Password Requirements Info
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: context.cardBgColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: context.borderColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Password Requirements:',
                  style: AppTextStyles.bodySmall.copyWith(
                    fontWeight: FontWeight.w700,
                    color: context.textPrimaryColor,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 6),
                const _RequirementItem(text: 'At least 8 characters long'),
                const _RequirementItem(
                  text: 'At least one uppercase letter (A-Z)',
                ),
                const _RequirementItem(text: 'At least one number (0-9)'),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Submit Button
          AppButton(
            text: 'Reset Password',
            onPressed: _handleResetPassword,
            isLoading: _isSubmitting,
          ),
          const SizedBox(height: 16),

          Center(
            child: TextButton.icon(
              onPressed: () => context.go('/login'),
              icon: Icon(
                Icons.arrow_back_rounded,
                size: 16,
                color: context.brandAccentColor,
              ),
              label: Text(
                'Cancel & Return to Login',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: context.brandAccentColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RequirementItem extends StatelessWidget {
  final String text;

  const _RequirementItem({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 3.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(
            Icons.check_circle_rounded,
            size: 14,
            color: context.brandAccentColor,
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              text,
              style: AppTextStyles.bodySmall.copyWith(
                color: context.textSecondaryColor,
                fontSize: 11,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
