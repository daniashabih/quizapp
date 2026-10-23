import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/app_config.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/utils/validators.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();

    final success = await ref.read(authProvider.notifier).signup(
          _nameController.text,
          _emailController.text,
          _passwordController.text,
        );

    if (success && mounted) {
      final auth = ref.read(authProvider);
      if (auth.isAdmin) {
        context.go('/admin');
      } else {
        context.go('/home');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = context.isDarkMode;

    return Scaffold(
      backgroundColor: context.scaffoldBgColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            icon: Icon(
              isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
              color: context.textSecondaryColor,
            ),
            onPressed: () {
              ref
                  .read(themeModeProvider.notifier)
                  .toggleTheme(MediaQuery.platformBrightnessOf(context));
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding:
                const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Create Your Account',
                      style: AppTextStyles.displayMedium.copyWith(fontSize: 22),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Join ${AppConfig.appName} to practice technology assessments and earn verified credentials.',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: context.textSecondaryColor,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Error Banner
                    if (authState.error != null) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: context.errorBgColor,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: context.errorColor.withValues(alpha: 0.35),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.error_outline_rounded,
                              color: context.errorColor,
                              size: 18,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                authState.error!,
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: context.errorColor,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Full Name Field
                    AppTextField(
                      label: 'Full Name',
                      hint: 'Jane Doe',
                      controller: _nameController,
                      keyboardType: TextInputType.name,
                      textInputAction: TextInputAction.next,
                      validator: Validators.validateName,
                      prefixIcon: Icon(
                        Icons.person_outline_rounded,
                        size: 20,
                        color: context.textSecondaryColor,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Email Field
                    AppTextField(
                      label: 'Email Address',
                      hint: 'name@example.com',
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      validator: Validators.validateEmail,
                      prefixIcon: Icon(
                        Icons.mail_outline_rounded,
                        size: 20,
                        color: context.textSecondaryColor,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Password Field
                    AppTextField(
                      label: 'Password',
                      hint: 'Min 8 chars, 1 uppercase, 1 number',
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
                      label: 'Confirm Password',
                      hint: '••••••••',
                      controller: _confirmPasswordController,
                      isPassword: true,
                      textInputAction: TextInputAction.done,
                      validator: (v) => Validators.validateConfirmPassword(
                        v,
                        _passwordController.text,
                      ),
                      prefixIcon: Icon(
                        Icons.lock_reset_rounded,
                        size: 20,
                        color: context.textSecondaryColor,
                      ),
                      onSubmitted: (_) => _handleRegister(),
                    ),
                    const SizedBox(height: 24),

                    // Sign Up Button
                    AppButton(
                      text: 'Create Account',
                      onPressed: _handleRegister,
                      isLoading: authState.isLoading,
                    ),

                    const SizedBox(height: 20),

                    // Terms disclaimer
                    Text(
                      'By registering, you agree to ${AppConfig.appName} Terms of Service and Privacy Policy.',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: context.textSecondaryColor,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
