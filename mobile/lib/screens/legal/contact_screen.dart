import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/config/app_config.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';

class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key});

  Future<void> _emailSupport(BuildContext context) async {
    final opened = await launchUrl(
      Uri(
        scheme: 'mailto',
        path: AppConfig.supportEmail,
        queryParameters: {'subject': 'Hangbug support request'},
      ),
      mode: LaunchMode.externalApplication,
    );
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Unable to open email. Please contact support@hangbug.com.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Contact Hangbug')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Support & Inquiries',
                  style: AppTextStyles.displaySmall.copyWith(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Contact us about quizzes, certificates, account access, privacy requests, or technical issues.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: context.textSecondaryColor,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 20),
                Card(
                  child: ListTile(
                    leading: Icon(
                      Icons.email_outlined,
                      color: context.brandAccentColor,
                    ),
                    title: const Text('Email Support'),
                    subtitle: Text(AppConfig.supportEmail),
                    trailing: const Icon(Icons.open_in_new),
                    onTap: () => _emailSupport(context),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'You can also send a message using the contact form on the Hangbug website.',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: context.textSecondaryColor,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
