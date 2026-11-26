import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/config/app_config.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Semantics(
              header: true,
              child: Text(
                'HangBug Privacy Policy & Personal Data Protection',
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
              title: '1. Introduction',
              body:
                  'Hangbug operates a web and Android technology quiz platform. This policy explains information processed when you use the website or app.',
            ),
            _buildSection(
              context: context,
              title: '2. Information We Collect',
              body:
                  'Information processed may include:\n\n'
                  '• Account details you provide, such as your name, email address, and optional profile information; Google account information if you choose Google sign-in.\n'
                  '• Quiz answers, scores, progress, leaderboard information, and certificate records.\n'
                  '• Name, email address, subject, and message when you contact support.\n'
                  '• Device, app, network, and diagnostic information needed to operate, secure, and troubleshoot the service.\n'
                  '• On the website, Google Analytics 4 page-view, landing-page, scroll-depth, and engaged-session events. The website also loads Google AdSense; the Android app uses Google Mobile Ads (AdMob).',
            ),
            _buildSection(
              context: context,
              title: '3. How We Use Your Data',
              body:
                  'We use information to:\n\n'
                  '• Authenticate your identity and maintain your active learning session.\n'
                  '• Track your learning progress, quiz history, and skill assessment levels.\n'
                  '• Calculate quiz results, issue eligible certificates, and support certificate verification.\n'
                  '• Protect, maintain, and improve the platform and respond to support requests.\n'
                  '• Measure website usage through Google Analytics 4 and display and measure ads through Google AdSense or Google Mobile Ads.',
            ),
            _buildSection(
              context: context,
              title: '4. Third-Party Services and Advertising',
              body:
                  'Hangbug uses third-party services for hosting, databases, Google sign-in, website analytics, and advertising. Google and its partners may process information such as browser or device details, online identifiers, approximate location, and ad interactions under their own privacy policies and your available settings.\n\n'
                  'Ads may be personalized based on your settings and available information, or non-personalized and based on context such as the page or app. Turning off ad personalization does not necessarily remove ads. Hangbug does not currently offer an in-app ad-personalization or cookie-preference switch.',
            ),
            _buildSection(
              context: context,
              title: '5. Cookies, Analytics & Advertising Preferences',
              body:
                  'The website uses cookies and similar technologies for sign-in, preferences, Google Analytics 4 measurement, and Google AdSense advertising. The Android app uses the Google Mobile Ads SDK, which may use mobile advertising identifiers and device storage.\n\n'
                  'Manage, block, or clear website cookies and site data in your browser privacy settings; blocking essential storage may affect sign-in. Manage Google ad personalization at Google Ads Settings and review your Android device Privacy or Ads settings for advertising ID controls. These settings may vary by device, location, and account.',
            ),
            _buildSection(
              context: context,
              title: '6. Account & Data Deletion',
              body:
                  'You can start account deletion from the app settings or submit a request at https://www.hangbug.com/delete-account. Support requests can also be sent to support@hangbug.com. Deletion affects account-associated data; processing time and any retention required for security or legal reasons may apply.',
            ),
            _buildSection(
              context: context,
              title: '7. Children\'s Privacy',
              body:
                  'Hangbug is intended for people learning and practicing technology. We do not knowingly collect personal information from children where collection is prohibited by applicable law.',
            ),
            _buildSection(
              context: context,
              title: '8. Contact and Google Partner Sites',
              body:
                  'For privacy requests or questions, email ${AppConfig.supportEmail} or visit https://www.hangbug.com/contact.\n\n'
                  'Google explains how it uses information from sites and apps that use its services here: https://policies.google.com/technologies/partner-sites',
            ),
            TextButton.icon(
              onPressed: () => _openLink(
                context,
                Uri.parse(
                  'https://policies.google.com/technologies/partner-sites',
                ),
              ),
              icon: const Icon(Icons.open_in_new),
              label: const Text('Google Partner Sites policy'),
            ),
            TextButton.icon(
              onPressed: () => _openLink(
                context,
                Uri(
                  scheme: 'mailto',
                  path: AppConfig.supportEmail,
                  queryParameters: {'subject': 'Hangbug privacy request'},
                ),
              ),
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

  Future<void> _openLink(BuildContext context, Uri uri) async {
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to open this link.')),
      );
    }
  }
}
