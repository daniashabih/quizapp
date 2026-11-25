import 'package:flutter/material.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../models/seo_dashboard_model.dart';
import 'seo_theme_tokens.dart';

void showSeoIssueDetailSheet(BuildContext context, SeoAuditIssue issue) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) {
      return DraggableScrollableSheet(
        initialChildSize: 0.78,
        minChildSize: 0.45,
        maxChildSize: 0.94,
        builder: (_, scrollController) {
          return Container(
            decoration: BoxDecoration(
              color: SeoColors.cardBg(ctx),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(24)),
              border: Border.all(color: SeoColors.border(ctx)),
            ),
            child: Column(
              children: [
                const SizedBox(height: 10),
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: SeoColors.border(ctx),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 14, 12, 12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Wrap(
                              spacing: 8,
                              runSpacing: 6,
                              children: [
                                SeoStatusBadge(status: issue.status),
                                Text(
                                  'Severity: ${issue.severity} · ${issue.type}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: SeoColors.textMuted(ctx),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              issue.title,
                              style: AppTextStyles.displaySmall.copyWith(
                                fontSize: 17,
                                color: SeoColors.textPrimary(ctx),
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.of(ctx).pop(),
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),
                ),
                Divider(height: 1, color: SeoColors.border(ctx)),
                Expanded(
                  child: ListView(
                    controller: scrollController,
                    padding: const EdgeInsets.all(20),
                    children: [
                      _ReportSection(
                        title: '1. What is the issue?',
                        body: issue.whatIsIssue,
                      ),
                      const SizedBox(height: 12),
                      _ReportSection(
                        title: '2. Why does it matter?',
                        body: issue.whyItMatters,
                      ),
                      const SizedBox(height: 12),
                      _ReportSection(
                        title:
                            '3. Affected Pages (${issue.affectedCount})',
                        body: issue.affectedUrls.isEmpty
                            ? 'No affected pages — check passed.'
                            : issue.affectedUrls
                                .map((u) => u.detail.isNotEmpty
                                    ? '${u.displayLabel} — ${u.detail}'
                                    : u.displayLabel)
                                .join('\n'),
                        isMonospace: issue.affectedUrls.isNotEmpty,
                      ),
                      const SizedBox(height: 12),
                      _ReportSection(
                        title: '4. How serious is it?',
                        body: '${issue.severity} (${issue.status})',
                      ),
                      const SizedBox(height: 12),
                      _ReportSection(
                        title: '5. What should be done?',
                        body: issue.recommendedAction,
                        highlighted: true,
                      ),
                      const SizedBox(height: 12),
                      _ReportSection(
                        title: '6. How can it be fixed?',
                        body: issue.howToFix,
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'Source: ${issue.source}',
                        style: TextStyle(
                          fontSize: 11,
                          color: SeoColors.textMuted(ctx),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      );
    },
  );
}

class _ReportSection extends StatelessWidget {
  final String title;
  final String body;
  final bool highlighted;
  final bool isMonospace;

  const _ReportSection({
    required this.title,
    required this.body,
    this.highlighted = false,
    this.isMonospace = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: highlighted
            ? SeoColors.mintSurface(context)
            : SeoColors.scaffoldBg(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: highlighted
              ? SeoColors.accentGreen.withValues(alpha: 0.45)
              : SeoColors.border(context),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w800,
              color: SeoColors.primaryBrand(context),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            body,
            style: TextStyle(
              fontSize: isMonospace ? 11.5 : 12.5,
              fontFamily: isMonospace ? 'monospace' : null,
              height: 1.45,
              color: SeoColors.textPrimary(context),
            ),
          ),
        ],
      ),
    );
  }
}
