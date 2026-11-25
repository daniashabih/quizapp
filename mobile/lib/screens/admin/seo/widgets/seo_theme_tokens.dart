import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class SeoNavItem {
  final String id;
  final String label;
  final IconData icon;

  const SeoNavItem({
    required this.id,
    required this.label,
    required this.icon,
  });
}

const List<SeoNavItem> kSeoNavItems = [
  SeoNavItem(id: 'overview', label: 'Overview', icon: Icons.dashboard_rounded),
  SeoNavItem(
    id: 'search-performance',
    label: 'Search Performance',
    icon: Icons.trending_up_rounded,
  ),
  SeoNavItem(
    id: 'keywords',
    label: 'Keyword Research',
    icon: Icons.search_rounded,
  ),
  SeoNavItem(
    id: 'audit',
    label: 'Website Audit',
    icon: Icons.verified_user_rounded,
  ),
  SeoNavItem(
    id: 'indexing',
    label: 'Page Indexing',
    icon: Icons.storage_rounded,
  ),
  SeoNavItem(
    id: 'content',
    label: 'Content Analysis',
    icon: Icons.article_rounded,
  ),
  SeoNavItem(
    id: 'technical',
    label: 'Technical SEO',
    icon: Icons.build_circle_outlined,
  ),
  SeoNavItem(
    id: 'backlinks',
    label: 'Backlinks',
    icon: Icons.link_rounded,
  ),
  SeoNavItem(
    id: 'ai-visibility',
    label: 'AI Visibility',
    icon: Icons.auto_awesome_rounded,
  ),
  SeoNavItem(
    id: 'competitors',
    label: 'Competitors',
    icon: Icons.groups_rounded,
  ),
  SeoNavItem(
    id: 'recommendations',
    label: 'SEO Recommendations',
    icon: Icons.checklist_rounded,
  ),
  SeoNavItem(
    id: 'settings',
    label: 'Settings',
    icon: Icons.settings_rounded,
  ),
];

class SeoColors {
  static const Color primaryDarkGreen = Color(0xFF193D35);
  static const Color accentGreen = Color(0xFF2F806B);
  static const Color lightMint = Color(0xFFE5F2EC);
  static const Color mintBorder = Color(0xFFBBE0CE);
  static const Color lightBg = Color(0xFFF7F8F6);
  static const Color lightText = Color(0xFF17221F);
  static const Color lightMuted = Color(0xFF75817C);
  static const Color lightBorder = Color(0xFFE4EAE6);

  static Color scaffoldBg(BuildContext context) =>
      context.isDarkMode ? AppColors.darkBackground : lightBg;

  static Color cardBg(BuildContext context) =>
      context.isDarkMode ? AppColors.darkCard : Colors.white;

  static Color border(BuildContext context) =>
      context.isDarkMode ? AppColors.darkBorder : lightBorder;

  static Color textPrimary(BuildContext context) =>
      context.isDarkMode ? AppColors.darkTextPrimary : lightText;

  static Color textMuted(BuildContext context) =>
      context.isDarkMode ? AppColors.darkTextMuted : lightMuted;

  static Color mintSurface(BuildContext context) =>
      context.isDarkMode ? const Color(0xFF1F352E) : lightMint;

  static Color primaryBrand(BuildContext context) =>
      context.isDarkMode ? const Color(0xFF34D399) : primaryDarkGreen;
}

class SeoStatusBadge extends StatelessWidget {
  final String status;

  const SeoStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final s = status.toLowerCase();
    final isDark = context.isDarkMode;

    Color bg;
    Color fg;
    Color border;

    if (s == 'critical' ||
        s.contains('invalid api key') ||
        s.contains('api not enabled') ||
        s.contains('quota exceeded') ||
        s.contains('connection error')) {
      bg = isDark ? const Color(0xFF2D1618) : const Color(0xFFFCEEED);
      fg = isDark ? AppColors.darkError : const Color(0xFFB91C1C);
      border = isDark ? const Color(0xFF7F1D1D) : const Color(0xFFF8C9C6);
    } else if (s == 'needs attention' ||
        s == 'needs improvement' ||
        s == 'warning' ||
        s == 'medium' ||
        s == 'high' ||
        s.contains('not tested')) {
      bg = isDark ? const Color(0xFF2C2212) : const Color(0xFFFEF5E7);
      fg = isDark ? AppColors.darkWarning : const Color(0xFFB45309);
      border = isDark ? const Color(0xFF78350F) : const Color(0xFFF8DFB6);
    } else if (s == 'good' ||
        s == 'verified' ||
        s == 'passed' ||
        s.endsWith(': connected') ||
        s.endsWith(': verified') ||
        s == 'connected') {
      bg = SeoColors.mintSurface(context);
      fg = SeoColors.primaryBrand(context);
      border = isDark ? const Color(0xFF2F806B) : SeoColors.mintBorder;
    } else {
      bg = isDark ? AppColors.darkMutedBg : SeoColors.lightBg;
      fg = SeoColors.textMuted(context);
      border = SeoColors.border(context);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: border),
      ),
      child: Text(
        status,
        style: TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.w700,
          color: fg,
        ),
      ),
    );
  }
}

class SeoAffectedChipsWrap extends StatelessWidget {
  final String label;
  final List<String> items;
  final int maxVisible;
  final VoidCallback? onMoreTap;

  const SeoAffectedChipsWrap({
    super.key,
    required this.label,
    required this.items,
    this.maxVisible = 4,
    this.onMoreTap,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();
    final visible = items.take(maxVisible).toList();
    final remaining = items.length - visible.length;

    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Wrap(
        spacing: 6,
        runSpacing: 6,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: SeoColors.textMuted(context),
            ),
          ),
          ...visible.map(
            (text) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: SeoColors.scaffoldBg(context),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: SeoColors.border(context)),
              ),
              child: Text(
                text,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 10.5,
                  fontFamily: 'monospace',
                  color: SeoColors.textPrimary(context),
                ),
              ),
            ),
          ),
          if (remaining > 0)
            GestureDetector(
              onTap: onMoreTap,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                child: Text(
                  '+$remaining more',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: SeoColors.primaryBrand(context),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
