import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../models/category_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/core_providers.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/quiz_provider.dart';
import '../../services/notification_service.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_state_widget.dart';
import '../../widgets/loading_state_widget.dart';
import '../../widgets/banner_ad_widget.dart';

class ExploreScreen extends ConsumerStatefulWidget {
  const ExploreScreen({super.key});

  @override
  ConsumerState<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends ConsumerState<ExploreScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showSessionSelector(CategoryModel category) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _SessionSelectorSheet(category: category),
    );
  }

  String _formatTimeAgo(dynamic dateVal) {
    if (dateVal == null) return 'recently';
    DateTime? dt;
    if (dateVal is DateTime) {
      dt = dateVal;
    } else if (dateVal is String) {
      dt = DateTime.tryParse(dateVal);
    }
    if (dt == null) return 'recently';

    final diff = DateTime.now().difference(dt);
    if (diff.inSeconds < 60) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  void _showDiscardConfirmation(Map<String, dynamic> quiz) {
    final id = quiz['id']?.toString() ?? '';
    final category = quiz['category'] ?? quiz['technology'] ?? 'Quiz';
    final session = quiz['session']?.toString() ?? '1';

    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Discard Saved Progress?'),
        content: Text(
          'Discard saved progress for $category (Session $session)? This specific quiz attempt will be deleted.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: context.errorColor,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.of(dialogCtx).pop();
              final success = await ref.read(quizRepositoryProvider).discardAttempt(id);
              if (success) {
                ref.invalidate(inProgressAttemptsProvider);
                if (mounted) {
                  AppNotificationService.info(
                    id: 'mobile-discard-attempt',
                    title: 'Attempt discarded',
                    message: 'Quiz progress discarded.',
                  );
                }
              }
            },
            child: const Text('Discard'),
          ),
        ],
      ),
    );
  }

  Widget _buildSavedQuizzesSection(
    BuildContext context,
    List<Map<String, dynamic>> attempts,
  ) {
    if (attempts.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 10.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.bookmark_added_rounded,
                size: 16,
                color: context.brandAccentColor,
              ),
              const SizedBox(width: 6),
              Text(
                'Saved In-Progress Quizzes',
                style: AppTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: context.brandAccentColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${attempts.length} Saved',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: context.brandAccentColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 155,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: attempts.length,
              separatorBuilder: (context, index) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final quiz = attempts[index];
                final category = (quiz['category'] ?? quiz['technology'] ?? 'Quiz').toString();
                final session = int.tryParse(quiz['session']?.toString() ?? '1') ?? 1;
                final answered = int.tryParse(quiz['answeredCount']?.toString() ?? '0') ?? 0;
                final total = int.tryParse(quiz['totalQuestions']?.toString() ?? '0') ?? 0;
                final pct = (total > 0 ? (answered / total) : 0.0).clamp(0.0, 1.0);
                final pctInt = (pct * 100).round();
                final lastSaved = quiz['lastSavedAt'] ?? quiz['updatedAt'];

                return Container(
                  width: 290,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: context.cardBgColor,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: context.brandAccentColor.withValues(alpha: 0.35),
                      width: 1.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Top Row: Title, Session Badge, Time
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  category,
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 3),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 6,
                                        vertical: 1.5,
                                      ),
                                      decoration: BoxDecoration(
                                        color: context.brandAccentColor.withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        session == 0 ? 'All Sessions' : 'Session $session',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: context.brandAccentColor,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Icon(
                                      Icons.access_time_rounded,
                                      size: 11,
                                      color: context.textSecondaryColor,
                                    ),
                                    const SizedBox(width: 2),
                                    Text(
                                      _formatTimeAgo(lastSaved),
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: context.textSecondaryColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          // Discard Button
                          IconButton(
                            icon: Icon(
                              Icons.delete_outline_rounded,
                              size: 18,
                              color: context.errorColor,
                            ),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                            tooltip: 'Discard progress',
                            onPressed: () => _showDiscardConfirmation(quiz),
                          ),
                        ],
                      ),

                      // Progress Bar & Stats
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '$answered / $total questions completed',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: context.textSecondaryColor,
                                ),
                              ),
                              Text(
                                '$pctInt%',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: context.brandAccentColor,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 5),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: pct,
                              minHeight: 5,
                              backgroundColor: context.borderColor,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                context.brandAccentColor,
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Resume Button
                      SizedBox(
                        width: double.infinity,
                        height: 34,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: context.brandAccentColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            elevation: 0,
                          ),
                          icon: const Icon(Icons.play_arrow_rounded, size: 16),
                          label: const Text(
                            'Resume Quiz',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          onPressed: () {
                            context.push(
                              '/quiz',
                              extra: {
                                'category': category,
                                'session': session,
                                'attemptId': quiz['id'],
                              },
                            ).then((_) {
                              ref.invalidate(inProgressAttemptsProvider);
                            });
                          },
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);
    final authState = ref.watch(authProvider);
    final inProgressAsync = authState.isAuthenticated
        ? ref.watch(inProgressAttemptsProvider)
        : null;

    return Scaffold(
      backgroundColor: context.scaffoldBgColor,
      appBar: AppBar(
        title: Text(
          'Explore Technologies',
          style: AppTextStyles.displaySmall.copyWith(fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, size: 20),
            onPressed: () {
              ref.invalidate(categoriesProvider);
              if (authState.isAuthenticated) {
                ref.invalidate(inProgressAttemptsProvider);
              }
            },
            tooltip: 'Refresh Categories',
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: categoriesAsync.when(
        loading: () =>
            const LoadingStateWidget(message: 'Loading technologies...'),
        error: (err, _) => ErrorStateWidget(
          message: err.toString(),
          onRetry: () => ref.refresh(categoriesProvider),
        ),
        data: (categories) {
          final filtered = categories
              .where((c) => c.isEnabled != false)
              .where(
                (c) =>
                    c.name.toLowerCase().contains(_searchQuery.toLowerCase()),
              )
              .toList();

          return RefreshIndicator(
            color: context.brandAccentColor,
            onRefresh: () async {
              ref.invalidate(categoriesProvider);
              if (authState.isAuthenticated) {
                ref.invalidate(inProgressAttemptsProvider);
              }
              await ref.read(categoriesProvider.future);
            },
            child: Column(
              children: [
                // Search Bar
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16.0,
                    vertical: 8.0,
                  ),
                  child: AppTextField(
                    hint: 'Search technologies (e.g. React, PHP, Python)...',
                    controller: _searchController,
                    prefixIcon: Icon(
                      Icons.search_rounded,
                      size: 20,
                      color: context.textSecondaryColor,
                    ),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                    onChanged: (v) => setState(() => _searchQuery = v),
                  ),
                ),

                // Saved In-Progress Quizzes Section
                if (inProgressAsync != null)
                  inProgressAsync.when(
                    data: (attempts) => _buildSavedQuizzesSection(context, attempts),
                    loading: () => const SizedBox.shrink(),
                    error: (error, stack) => const SizedBox.shrink(),
                  ),

                // Grid / List of technologies
                Expanded(
                  child: filtered.isEmpty
                      ? EmptyStateWidget(
                          title: 'No technologies found',
                          subtitle: _searchQuery.isEmpty
                              ? 'No technology tracks available.'
                              : 'No matches found for "$_searchQuery".',
                          icon: Icons.search_off_rounded,
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16.0,
                            vertical: 8.0,
                          ),
                          itemCount: filtered.length,
                          separatorBuilder: (context, index) =>
                              const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final cat = filtered[index];
                            return _buildTechCard(cat);
                          },
                        ),
                ),
              ],
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

  Widget _buildTechCard(CategoryModel cat) {
    return Container(
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _showSessionSelector(cat),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: context.mutedBgColor,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: context.borderColor),
                  ),
                  child: Center(
                    child: Text(
                      cat.name.isNotEmpty ? cat.name[0].toUpperCase() : 'T',
                      style: AppTextStyles.displaySmall.copyWith(
                        color: context.brandAccentColor,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        cat.name,
                        style: AppTextStyles.bodyLarge.copyWith(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        cat.questionCount > 0
                            ? '${cat.questionCount} Questions${cat.sessions.length > 1 ? ' · ${cat.sessions.length} Sessions' : ''}'
                            : 'Multi-session track',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: context.textSecondaryColor,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 14,
                  color: context.textSecondaryColor,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SessionSelectorSheet extends ConsumerStatefulWidget {
  final CategoryModel category;

  const _SessionSelectorSheet({required this.category});

  @override
  ConsumerState<_SessionSelectorSheet> createState() =>
      _SessionSelectorSheetState();
}

class _SessionSelectorSheetState extends ConsumerState<_SessionSelectorSheet> {
  int _selectedSession = 1;
  bool _isAllSessions = false;
  List<int> _sessions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchSessions();
  }

  Future<void> _fetchSessions() async {
    try {
      final repo = ref.read(quizRepositoryProvider);
      final list = await repo.getCategorySessions(widget.category.name);
      if (mounted) {
        setState(() {
          _sessions = list;
          _selectedSession = list.isNotEmpty ? list.first : 1;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _sessions = widget.category.sessions.isNotEmpty
              ? widget.category.sessions
              : [1];
          _selectedSession = _sessions.first;
          _isLoading = false;
        });
      }
    }
  }

  void _startQuiz() {
    Navigator.of(context).pop();
    context.push(
      '/quiz/play',
      extra: {
        'category': widget.category.name,
        'session': _isAllSessions ? 0 : _selectedSession,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return Container(
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: context.borderColor),
        ),
      ),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: context.borderColor,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.accent.withValues(alpha: 0.2)
                      : AppColors.accentLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    widget.category.name.isNotEmpty
                        ? widget.category.name[0]
                        : 'T',
                    style: AppTextStyles.displaySmall.copyWith(
                      color: isDark ? AppColors.accentLight : AppColors.primary,
                      fontSize: 18,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.category.name,
                      style: AppTextStyles.displaySmall.copyWith(fontSize: 18),
                    ),
                    Text(
                      'Select any session to start',
                      style: AppTextStyles.bodySmall.copyWith(
                        fontSize: 12,
                        color: context.textSecondaryColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          if (_isLoading)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24.0),
              child: Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(
                    context.brandAccentColor,
                  ),
                ),
              ),
            )
          else ...[
            Text(
              'Sessions',
              style: AppTextStyles.labelBold.copyWith(
                color: context.textSecondaryColor,
                fontSize: 11,
              ),
            ),
            const SizedBox(height: 10),

            // All Sessions option if multiple sessions exist
            if (_sessions.length > 1) ...[
              Material(
                color: _isAllSessions
                    ? (isDark
                        ? AppColors.darkPrimaryAccent.withValues(alpha: 0.16)
                        : AppColors.accentLight)
                    : context.mutedBgColor,
                borderRadius: BorderRadius.circular(12),
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () {
                    setState(() {
                      _isAllSessions = true;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'All Sessions (Complete Track)',
                          style: AppTextStyles.bodyMedium.copyWith(
                            fontWeight: FontWeight.w700,
                            color: _isAllSessions
                                ? context.brandAccentColor
                                : context.textPrimaryColor,
                          ),
                        ),
                        if (_isAllSessions)
                          Icon(
                            Icons.check_circle_rounded,
                            color: context.brandAccentColor,
                            size: 18,
                          ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],

            // Individual Sessions
            ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.35,
              ),
              child: SingleChildScrollView(
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _sessions.map((sess) {
                    final isSelected =
                        !_isAllSessions && _selectedSession == sess;
                    return ChoiceChip(
                      label: Text('Session $sess'),
                      selected: isSelected,
                      selectedColor:
                          isDark ? AppColors.primaryLight : AppColors.primary,
                      backgroundColor: context.mutedBgColor,
                      labelStyle: TextStyle(
                        color: isSelected
                            ? Colors.white
                            : context.textPrimaryColor,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                        side: BorderSide(
                          color: isSelected
                              ? context.brandAccentColor
                              : context.borderColor,
                        ),
                      ),
                      onSelected: (selected) {
                        if (selected) {
                          setState(() {
                            _selectedSession = sess;
                            _isAllSessions = false;
                          });
                        }
                      },
                    );
                  }).toList(),
                ),
              ),
            ),

            const SizedBox(height: 16),

            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.darkPrimaryAccent.withValues(alpha: 0.12)
                    : AppColors.accentLight.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: context.borderColor),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Selected Session:',
                    style: AppTextStyles.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                      color: context.textPrimaryColor,
                    ),
                  ),
                  Flexible(
                    child: Text(
                      '${widget.category.name} · ${_isAllSessions ? 'All Sessions (Complete Track)' : 'Session $_selectedSession'}',
                      style: AppTextStyles.bodySmall.copyWith(
                        fontWeight: FontWeight.w800,
                        color: context.brandAccentColor,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            AppButton(
              text: _isAllSessions
                  ? 'Start All Sessions Quiz'
                  : 'Start Session Quiz',
              onPressed: _startQuiz,
              icon: const Icon(
                Icons.play_arrow_rounded,
                color: Colors.white,
                size: 20,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
