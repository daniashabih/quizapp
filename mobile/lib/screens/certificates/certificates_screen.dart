import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/config/app_config.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/certificate_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_state_widget.dart';
import '../../widgets/loading_state_widget.dart';
import '../../widgets/banner_ad_widget.dart';

class CertificatesScreen extends ConsumerWidget {
  const CertificatesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final certsAsync = ref.watch(certificatesProvider);
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final userName = user?.name ?? 'Learner';

    return Scaffold(
      backgroundColor: context.scaffoldBgColor,
      appBar: AppBar(
        titleSpacing: 16,
        title: const Text('My Certificates'),
        actions: [
          Container(
            width: 36,
            height: 36,
            margin: const EdgeInsets.only(right: 14),
            decoration: BoxDecoration(
              color: context.cardBgColor,
              shape: BoxShape.circle,
              border: Border.all(color: context.borderColor),
            ),
            child: IconButton(
              padding: EdgeInsets.zero,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              tooltip: 'Refresh',
              onPressed: () => ref.invalidate(certificatesProvider),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: certsAsync.when(
              loading: () => const LoadingStateWidget(
                message: 'Loading your certificates...',
              ),
              error: (err, stack) => ErrorStateWidget(
                message: 'Failed to load certificates: ${err.toString()}',
                onRetry: () => ref.invalidate(certificatesProvider),
              ),
              data: (certificates) {
                if (certificates.isEmpty) {
                  return EmptyStateWidget(
                    icon: Icons.workspace_premium_outlined,
                    title: 'No Certificates Yet',
                    description:
                        'Earn verified industry-grade certificates by scoring 80% or higher on any technology quiz.',
                    actionText: 'Explore Quizzes',
                    onAction: () => context.go('/explore'),
                  );
                }

                return RefreshIndicator(
                  color: context.brandAccentColor,
                  onRefresh: () async {
                    ref.invalidate(certificatesProvider);
                  },
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                    itemCount: certificates.length + 1,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return _buildHeaderBanner(
                          context,
                          certificates.length,
                          userName,
                        );
                      }
                      final cert = certificates[index - 1];
                      return _buildCertificateTile(context, cert, userName);
                    },
                  ),
                );
              },
            ),
          ),
          const BannerAdWidget(),
        ],
      ),
    );
  }

  Widget _buildHeaderBanner(
    BuildContext context,
    int count,
    String learnerName,
  ) {
    final isDark = context.isDarkMode;
    return Container(
      padding: const EdgeInsets.fromLTRB(6, 6, 18, 6),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, AppColors.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(46),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(
              alpha: isDark ? 0.35 : 0.2,
            ),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 68,
            height: 68,
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.accent,
                width: 2,
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                color: context.cardBgColor,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.verified_rounded,
                color: AppColors.accent,
                size: 32,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Text(
                          '$count Certified ${count == 1 ? "Credential" : "Credentials"}',
                          style: AppTextStyles.displaySmall.copyWith(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: List.generate(
                          4,
                          (_) => const Icon(
                            Icons.star_rounded,
                            size: 13,
                            color: AppColors.accent,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'Verifiable through ${AppConfig.appName} QR verification portal.',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 11.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCertificateTile(
    BuildContext context,
    CertificateModel cert,
    String learnerName,
  ) {
    final effectiveName = cert.learnerName ?? learnerName;
    final isDark = context.isDarkMode;
    final scoreFraction = (cert.score.clamp(0, 100)) / 100.0;

    return Container(
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: context.borderColor.withValues(alpha: 0.75),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.05),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(24),
        child: InkWell(
          borderRadius: BorderRadius.circular(24),
          onTap: () {
            context.push('/certificates/view', extra: cert);
          },
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Title + Subtitle on left, Mini Progress Pill + Score on right (Reference Mockup 3)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            cert.category,
                            style: AppTextStyles.displaySmall.copyWith(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Awarded to $effectiveName · Score: ${cert.score}%',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: context.textSecondaryColor,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Container(
                          width: 58,
                          height: 10,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.16),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: FractionallySizedBox(
                            alignment: Alignment.centerLeft,
                            widthFactor: scoreFraction.clamp(0.2, 1.0),
                            child: Container(
                              decoration: BoxDecoration(
                                color: AppColors.accent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.accent.withValues(alpha: 0.16),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.verified_rounded,
                                size: 12,
                                color: AppColors.accent,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                'VERIFIED',
                                style: AppTextStyles.mono.copyWith(
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w800,
                                  color: isDark
                                      ? AppColors.accentLight
                                      : AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Reference Mockup 3 Row of 5 Compact Badge Tiles
                Row(
                  children: [
                    Expanded(
                      child: _buildMiniBadgeTile(
                        context: context,
                        icon: Icons.shield_rounded,
                        label: 'Passed',
                        tint: AppColors.primary,
                        unlocked: true,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: _buildMiniBadgeTile(
                        context: context,
                        icon: Icons.verified_user_rounded,
                        label: '80%+',
                        tint: AppColors.accent,
                        unlocked: cert.score >= 80,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: _buildMiniBadgeTile(
                        context: context,
                        icon: Icons.stars_rounded,
                        label: '90%+',
                        tint: AppColors.secondary,
                        unlocked: cert.score >= 90,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: _buildMiniBadgeTile(
                        context: context,
                        icon: Icons.workspace_premium_rounded,
                        label: 'Master',
                        tint: AppColors.accent,
                        unlocked: cert.score >= 95,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: _buildMiniBadgeTile(
                        context: context,
                        icon: Icons.qr_code_verified_rounded,
                        label: 'QR Valid',
                        tint: AppColors.primary,
                        unlocked: true,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),
                const Divider(height: 1),
                const SizedBox(height: 12),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Issued: ${DateFormatter.formatDate(cert.date)}',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: context.textSecondaryColor,
                      ),
                    ),
                    Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: context.mutedBgColor,
                            shape: BoxShape.circle,
                          ),
                          child: IconButton(
                            icon: Icon(
                              Icons.share_outlined,
                              size: 16,
                              color: context.textSecondaryColor,
                            ),
                            tooltip: 'Share',
                            padding: EdgeInsets.zero,
                            onPressed: () {
                              Share.share(
                                '🎓 View my official verified certificate in ${cert.category} on ${AppConfig.appName}: '
                                '${cert.verificationUrl}',
                                subject:
                                    'My ${AppConfig.appName} ${cert.category} Certificate',
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.primaryLight
                                : AppColors.primary,
                            borderRadius: BorderRadius.circular(18),
                          ),
                          child: Row(
                            children: [
                              Text(
                                'View Certificate',
                                style: AppTextStyles.labelBold.copyWith(
                                  color: Colors.white,
                                  fontSize: 11.5,
                                ),
                              ),
                              const SizedBox(width: 2),
                              const Icon(
                                Icons.chevron_right_rounded,
                                size: 16,
                                color: Colors.white,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMiniBadgeTile({
    required BuildContext context,
    required IconData icon,
    required String label,
    required Color tint,
    required bool unlocked,
  }) {
    final isDark = context.isDark;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      decoration: BoxDecoration(
        color: unlocked
            ? (isDark ? context.mutedBgColor : tint.withValues(alpha: 0.08))
            : context.mutedBgColor.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(13),
        border: Border.all(
          color: unlocked
              ? tint.withValues(alpha: isDark ? 0.35 : 0.22)
              : context.borderColor.withValues(alpha: 0.5),
        ),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 18,
            color: unlocked
                ? (isDark && tint == AppColors.primary
                      ? AppColors.accentLight
                      : tint)
                : context.textMutedColor.withValues(alpha: 0.45),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 9.5,
              fontWeight: FontWeight.w700,
              color: unlocked
                  ? context.textPrimaryColor
                  : context.textMutedColor,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
