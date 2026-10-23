import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_text_styles.dart';
import '../models/certificate_model.dart';

class CertificateCard extends StatelessWidget {
  final CertificateModel certificate;
  final String learnerName;

  const CertificateCard({
    super.key,
    required this.certificate,
    required this.learnerName,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return Container(
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark
              ? AppColors.accent.withValues(alpha: 0.65)
              : AppColors.primary,
          width: 6,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.08),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Top Official Brand Header
              Image.asset(
                context.brandCompactLogoAsset,
                height: 26,
                fit: BoxFit.contain,
              ),
              const SizedBox(height: 12),

              // Top Ribbon Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.accent.withValues(alpha: 0.2)
                      : AppColors.accentLight,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isDark
                        ? AppColors.accent.withValues(alpha: 0.45)
                        : AppColors.accentBorder,
                  ),
                ),
                child: Text(
                  'CERTIFICATE OF COMPLETION',
                  style: AppTextStyles.labelBold.copyWith(
                    color: isDark ? AppColors.accentLight : AppColors.primary,
                    letterSpacing: 1.2,
                    fontSize: 10,
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Gold divider
              Container(
                width: 60,
                height: 3,
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              const SizedBox(height: 16),

              Text(
                'This is to certify that',
                style: AppTextStyles.bodySmall.copyWith(
                  color: context.textSecondaryColor,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),

              const SizedBox(height: 8),

              // Learner Name
              Text(
                learnerName.isNotEmpty ? learnerName : 'Verified Candidate',
                textAlign: TextAlign.center,
                style: AppTextStyles.displayMedium.copyWith(
                  color: context.brandAccentColor,
                  fontWeight: FontWeight.w800,
                  fontSize: 22,
                ),
              ),

              const SizedBox(height: 12),

              // Certificate body
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Text(
                  'has successfully completed the ${certificate.category} technical assessment with a score of ${certificate.score}%, demonstrating proficiency and mastery.',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: context.textSecondaryColor,
                    fontSize: 12,
                    height: 1.4,
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // 3-Column Info Bar
              Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                decoration: BoxDecoration(
                  color: context.mutedBgColor.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: context.borderColor),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildInfoColumn(context, 'Score', '${certificate.score}%'),
                    _buildDivider(context),
                    _buildInfoColumn(context, 'Date', certificate.date),
                    _buildDivider(context),
                    _buildInfoColumn(context, 'ID', certificate.id),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Bottom Verification & QR Code
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // QR Code (always crisp white background for scanner readability)
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: context.borderColor),
                        ),
                        child: QrImageView(
                          data: certificate.verificationUrl,
                          version: QrVersions.auto,
                          size: 44.0,
                          backgroundColor: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'VERIFY ONLINE',
                            style: AppTextStyles.labelBold.copyWith(
                              fontSize: 9,
                              color: context.textSecondaryColor,
                            ),
                          ),
                          Text(
                            'hangbug.vercel.app',
                            style: AppTextStyles.mono.copyWith(
                              fontSize: 10,
                              color: context.brandAccentColor,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Gold Award Seal
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.accent.withValues(alpha: 0.2)
                          : AppColors.accentLight,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isDark
                            ? AppColors.accent.withValues(alpha: 0.5)
                            : AppColors.accentBorder,
                        width: 2,
                      ),
                    ),
                    child: const Icon(
                      Icons.military_tech_rounded,
                      color: AppColors.accent,
                      size: 26,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoColumn(BuildContext context, String label, String value) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label.toUpperCase(),
          style: AppTextStyles.labelBold.copyWith(
            fontSize: 9,
            color: context.textSecondaryColor,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.w700,
            color: context.brandAccentColor,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildDivider(BuildContext context) {
    return Container(
      width: 1,
      height: 24,
      color: context.borderColor,
    );
  }
}
