import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/config/app_config.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/network/network_exceptions.dart';
import '../../providers/core_providers.dart';

class ContactScreen extends ConsumerStatefulWidget {
  const ContactScreen({super.key});

  @override
  ConsumerState<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends ConsumerState<ContactScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  String? _validateName(String? value) {
    final name = value?.trim() ?? '';
    if (name.isEmpty || name.length > 100 || RegExp(r'[\x00-\x1f\x7f]').hasMatch(name)) {
      return 'Enter a name of 1 to 100 characters.';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    final email = value?.trim() ?? '';
    final pattern = RegExp(
      r"^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$",
      caseSensitive: false,
    );
    if (email.length > 254 || !pattern.hasMatch(email)) {
      return 'Enter a valid email address.';
    }
    return null;
  }

  String? _validateSubject(String? value) {
    final subject = value?.trim() ?? '';
    if (subject.length > 150 || RegExp(r'[\x00-\x1f\x7f]').hasMatch(subject)) {
      return 'Keep the subject under 150 characters and on one line.';
    }
    return null;
  }

  String? _validateMessage(String? value) {
    final message = value?.trim() ?? '';
    if (message.length < 10 || message.length > 5000) {
      return 'Enter a message between 10 and 5,000 characters.';
    }
    return null;
  }

  Future<void> _submitMessage() async {
    if (_sending || !(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _sending = true);
    try {
      final response = await ref.read(apiClientProvider).post(
        '/contact',
        data: {
          'name': _nameController.text.trim(),
          'email': _emailController.text.trim(),
          'subject': _subjectController.text.trim(),
          'message': _messageController.text.trim(),
          'website': '',
        },
      );
      final data = response.data;
      if (data is! Map || data['success'] != true) {
        final message = data is Map ? data['message']?.toString() : null;
        _showMessage(message?.isNotEmpty == true
            ? message!
            : 'We could not confirm delivery. Please try again or email ${AppConfig.supportEmail}.');
        return;
      }

      _formKey.currentState?.reset();
      _nameController.clear();
      _emailController.clear();
      _subjectController.clear();
      _messageController.clear();
      _showMessage('Your message was accepted for delivery to Hangbug support.');
    } on NetworkException catch (error) {
      _showMessage(error.message);
    } catch (_) {
      _showMessage(
        'We could not send your message. Please try again or email ${AppConfig.supportEmail}.',
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

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
                const SizedBox(height: 20),
                Text(
                  'Send us a message',
                  style: AppTextStyles.displaySmall.copyWith(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      TextFormField(
                        key: const Key('contact-name'),
                        controller: _nameController,
                        maxLength: 100,
                        validator: _validateName,
                        textCapitalization: TextCapitalization.words,
                        autofillHints: const [AutofillHints.name],
                        decoration: const InputDecoration(labelText: 'Your name'),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        key: const Key('contact-email'),
                        controller: _emailController,
                        maxLength: 254,
                        validator: _validateEmail,
                        keyboardType: TextInputType.emailAddress,
                        autofillHints: const [AutofillHints.email],
                        decoration: const InputDecoration(labelText: 'Email address'),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        key: const Key('contact-subject'),
                        controller: _subjectController,
                        maxLength: 150,
                        validator: _validateSubject,
                        decoration: const InputDecoration(labelText: 'Subject (optional)'),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        key: const Key('contact-message'),
                        controller: _messageController,
                        minLines: 5,
                        maxLines: 8,
                        maxLength: 5000,
                        validator: _validateMessage,
                        textCapitalization: TextCapitalization.sentences,
                        decoration: const InputDecoration(labelText: 'Message'),
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: _sending ? null : _submitMessage,
                          icon: _sending
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.send),
                          label: Text(_sending ? 'Sending...' : 'Send Message'),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'You can also contact support directly at ${AppConfig.supportEmail}.',
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
