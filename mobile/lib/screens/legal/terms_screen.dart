import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/config/app_config.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Terms of Service'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Semantics(
              header: true,
              child: Text(
                'HangBug Platform Terms & Conditions of Service',
                style: AppTextStyles.displaySmall.copyWith(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Last Updated: November 26, 2026',
              style: AppTextStyles.bodySmall.copyWith(
                color: context.textSecondaryColor,
              ),
            ),
            const SizedBox(height: 20),
            _buildSection(
              context: context,
              title: '1. Acceptance and Acceptable Use',
              body:
                  'By using Hangbug on the web or mobile, you agree to these terms. Use quizzes and games for learning. Do not cheat, use bots or answer scrapers, manipulate scores or leaderboard standings, disrupt the service, or attempt unauthorized access. We may restrict access to address abuse or protect the platform.',
            ),
            _buildSection(
              context: context,
              title: '2. User Accounts',
              body:
                  'Provide accurate account information, keep your sign-in credentials confidential, and take responsibility for activity under your account. Notify Hangbug support if you suspect unauthorized use.',
            ),
            _buildSection(
              context: context,
              title: '3. Academic Integrity & Quizzes',
              body:
                  'Quiz scores are calculated from submitted answers as a percentage of questions answered correctly. The platform passing score and certificate threshold are configurable; the certificate threshold currently defaults to 80%. When certificates are enabled, a passing result at or above that threshold can generate a certificate with a unique verification ID and link. A certificate documents a Hangbug assessment result and is not a guarantee of outside accreditation, employment, or professional qualification.',
            ),
            _buildSection(
              context: context,
              title: '4. Intellectual Property',
              body:
                  'Hangbug and its licensors retain rights in the service, software, branding, designs, quiz questions, explanations, and games, except for third-party materials identified as such. You may use the platform for personal learning; you may not copy, scrape, republish, or commercially redistribute protected content without permission or a legal right to do so.',
            ),
            _buildSection(
              context: context,
              title: '5. Service Disclaimer and Limitation of Liability',
              body:
                  'Hangbug is provided "as is" and "as available." We do not guarantee uninterrupted access, error-free content, or that quiz results will meet a particular purpose. To the extent permitted by applicable law, Hangbug will not be liable for indirect, incidental, special, consequential, or punitive loss, or loss of data, profits, or goodwill arising from use of or inability to use the service. These terms do not exclude liability or consumer rights that applicable law does not allow to be excluded.',
            ),
            _buildSection(
              context: context,
              title: '6. Changes and Contact',
              body:
                  'We may update these terms as Hangbug changes. For questions about these terms, contact ${AppConfig.supportEmail}.',
            ),
            TextButton.icon(
              onPressed: () async {
                final opened = await launchUrl(
                  Uri(
                    scheme: 'mailto',
                    path: AppConfig.supportEmail,
                    queryParameters: {'subject': 'Hangbug terms inquiry'},
                  ),
                  mode: LaunchMode.externalApplication,
                );
                if (!opened && context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Unable to open email.')),
                  );
                }
              },
              icon: const Icon(Icons.email_outlined),
              label: Text(AppConfig.supportEmail),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({
    required BuildContext context,
    required String title,
    required String body,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTextStyles.labelBold.copyWith(
              fontSize: 16,
              color: context.brandAccentColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: AppTextStyles.bodyMedium.copyWith(
              color: context.textPrimaryColor,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
