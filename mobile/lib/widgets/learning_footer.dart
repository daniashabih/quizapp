import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/config/app_config.dart';
import '../core/constants/app_colors.dart';
import '../models/category_model.dart';

class LearningFooter extends StatelessWidget {
  final List<CategoryModel> categories;

  const LearningFooter({super.key, required this.categories});

  static const _technologyLinks = <_FooterLink>[
    _FooterLink('HTML', '/technologies/html', ['html', 'html & css']),
    _FooterLink('CSS', '/technologies/css', ['css', 'html & css']),
    _FooterLink(
      'JavaScript',
      '/technologies/javascript',
      ['javascript', 'php, xml json, laravel, mysql, javascript'],
    ),
    _FooterLink('React.js', '/technologies/react', ['react', 'react.js']),
    _FooterLink('Python', '/technologies/python', ['python']),
    _FooterLink(
      'PHP',
      '/technologies/php',
      ['php', 'php, xml json, laravel, mysql, javascript'],
    ),
    _FooterLink(
      'Laravel',
      '/technologies/laravel',
      ['laravel', 'php, xml json, laravel, mysql, javascript'],
    ),
    _FooterLink(
      'MySQL',
      '/technologies/mysql',
      ['mysql', 'sql', 'sql server', 'php, xml json, laravel, mysql, javascript'],
    ),
    _FooterLink('MongoDB', '/technologies/mongodb', ['mongodb', 'mongo db']),
    _FooterLink('Flutter', '/technologies/flutter', ['flutter']),
    _FooterLink('Dart', '/technologies/dart', ['dart']),
    _FooterLink(
      'Fundamentals & OOP',
      '/technologies/programming-fundamentals',
      ['programming fundamentals', 'programming logic', 'oop', 'dsa'],
    ),
  ];

  static const _tutorialLinks = <_FooterLink>[
    _FooterLink('HTML Tutorial for Beginners', '/blog/html-tutorial-for-beginners'),
    _FooterLink(
      "CSS Basics Beginner's Guide",
      '/blog/css-basics-beginners-guide',
    ),
    _FooterLink(
      'JavaScript Fundamentals',
      '/blog/javascript-fundamentals-beginners-guide',
    ),
    _FooterLink('PHP Programming Guide', '/blog/php-programming-beginners-guide'),
    _FooterLink(
      'Laravel MVC Architecture',
      '/blog/laravel-basics-mvc-architecture',
    ),
    _FooterLink(
      'Flutter & Dart Mobile Guide',
      '/blog/flutter-dart-mobile-app-development',
    ),
  ];

  String _normalize(String value) => value
      .trim()
      .toLowerCase()
      .replaceAll(' and ', ' & ')
      .replaceAll(RegExp(r'\s+'), ' ');

  List<_FooterLink> get _availableTechnologyLinks {
    final activeNames = categories
        .where((category) => category.isEnabled && category.questionCount > 0)
        .map((category) => _normalize(category.name))
        .toSet();
    return _technologyLinks
        .where(
          (link) => link.matchers
              .any((matcher) => activeNames.contains(_normalize(matcher))),
        )
        .toList();
  }

  Future<void> _openLink(BuildContext context, String path) async {
    if (path == '/legal/privacy' ||
        path == '/legal/terms' ||
        path == '/legal/contact') {
      context.push(path);
      return;
    }

    final uri = path.startsWith('mailto:')
        ? Uri.parse(path)
        : Uri.parse('${AppConfig.websiteUrl}$path');
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to open this Hangbug link.')),
      );
    }
  }

  Widget _linkGroup(BuildContext context, String title, List<_FooterLink> links) {
    final color =
        context.isDarkMode ? AppColors.darkTextSecondary : AppColors.textSecondary;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            color: context.textPrimaryColor,
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 4,
          runSpacing: 0,
          children: [
            for (final link in links)
              TextButton(
                onPressed: () => _openLink(context, link.path),
                style: TextButton.styleFrom(
                  foregroundColor: color,
                  minimumSize: const Size(44, 44),
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  alignment: Alignment.centerLeft,
                ),
                child: Text(link.label, style: const TextStyle(fontSize: 12)),
              ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final borderColor = context.borderColor;
    final mutedColor =
        context.isDarkMode ? AppColors.darkTextSecondary : AppColors.textSecondary;
    final year = DateTime.now().year;
    final techLinks = <_FooterLink>[
      const _FooterLink('All Technologies', '/technologies'),
      ..._availableTechnologyLinks,
    ];
    final learnLinks = <_FooterLink>[
      const _FooterLink('All Tutorials', '/blog'),
      ..._tutorialLinks,
      const _FooterLink('Coding Games', '/games'),
      const _FooterLink('Developer Challenges', '/games/code-puzzle'),
      const _FooterLink('Global Leaderboard', '/leaderboard'),
    ];
    final companyLinks = const <_FooterLink>[
      _FooterLink('About Hangbug', '/about'),
      _FooterLink('Contact Support', '/legal/contact'),
      _FooterLink('Privacy Policy', '/legal/privacy'),
      _FooterLink('Terms of Service', '/legal/terms'),
      _FooterLink('Delete Account', '/delete-account'),
    ];

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 24),
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
      decoration: BoxDecoration(
        color: context.cardBgColor,
        border: Border(top: BorderSide(color: borderColor)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Image.asset(
            context.brandCompactLogoAsset,
            height: 28,
            fit: BoxFit.contain,
          ),
          const SizedBox(height: 10),
          Text(
            'Build your programming skills with Hangbug. Practice interactive quizzes, explore coding challenges, learn through tutorials, and earn certificates as you progress.',
            style: TextStyle(color: mutedColor, height: 1.5, fontSize: 12),
          ),
          const SizedBox(height: 8),
          Text(
            'Learn. Practice. Challenge Yourself.',
            style: TextStyle(
              color: context.textPrimaryColor,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 20),
          _linkGroup(context, 'Explore Technologies', techLinks),
          const SizedBox(height: 12),
          _linkGroup(context, 'Learn & Practice', learnLinks),
          const SizedBox(height: 12),
          _linkGroup(context, 'Company & Support', companyLinks),
          const SizedBox(height: 12),
          Divider(color: borderColor, height: 1),
          const SizedBox(height: 10),
          Text(
            '© $year Hangbug. All rights reserved.',
            style: TextStyle(color: mutedColor, fontSize: 11),
          ),
          const SizedBox(height: 4),
          Text(
            'Built for developers and lifelong learners.',
            style: TextStyle(color: mutedColor, fontSize: 11),
          ),
          TextButton.icon(
            onPressed: () => _openLink(context, 'mailto:${AppConfig.supportEmail}'),
            icon: const Icon(Icons.mail_outline_rounded, size: 15),
            label: Text(
              AppConfig.supportEmail,
              style: const TextStyle(fontSize: 11),
            ),
            style: TextButton.styleFrom(
              foregroundColor: context.brandAccentColor,
              minimumSize: const Size(44, 44),
              padding: EdgeInsets.zero,
            ),
          ),
        ],
      ),
    );
  }
}

class _FooterLink {
  final String label;
  final String path;
  final List<String> matchers;

  const _FooterLink(this.label, this.path, [this.matchers = const []]);
}
