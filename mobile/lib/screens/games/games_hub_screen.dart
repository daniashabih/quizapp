import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../models/game_model.dart';
import '../../../providers/game_provider.dart';
import '../../../widgets/empty_state_widget.dart';
import '../../../widgets/error_state_widget.dart';
import '../../../widgets/loading_state_widget.dart';
import '../../../widgets/banner_ad_widget.dart';
import '../../../widgets/tech_logo_widget.dart';

class GamesHubScreen extends ConsumerStatefulWidget {
  const GamesHubScreen({super.key});

  @override
  ConsumerState<GamesHubScreen> createState() => _GamesHubScreenState();
}

class _GamesHubScreenState extends ConsumerState<GamesHubScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  static const List<Map<String, String>> _categories = [
    {'name': 'All Games', 'icon': '🎮'},
    {'name': 'Coding Games', 'icon': '💻'},
    {'name': 'Typing Games', 'icon': '⌨️'},
  ];

  static const Map<String, String> _techDescriptions = {
    'html': 'Semantic structure, accessible markup, modern HTML5 elements, and forms.',
    'css': 'Modern CSS layouts, Flexbox, CSS Grid, responsive styling, and variables.',
    'javascript': 'ES6+ syntax, async programming, DOM manipulation, and core JS algorithms.',
    'bootstrap': 'Responsive utility classes, component layouts, and rapid web styling.',
    'jquery': 'DOM traversal, event listeners, dynamic effects, and web scripting.',
    'react': 'Component hierarchy, hooks, state management, and modern React patterns.',
    'php': 'Server-side scripting, request handling, arrays, superglobals, and backend APIs.',
    'laravel': 'MVC architecture, Eloquent ORM, Blade templating, and artisan workflows.',
    'nodejs': 'Event-driven JavaScript runtime, asynchronous I/O, and npm modules.',
    'express': 'RESTful API routing, middleware pipelines, controllers, and backend endpoints.',
    'python': 'Clean Pythonic syntax, list comprehensions, data structures, and script logic.',
    'mysql': 'Relational data modeling, table joins, aggregation queries, and schemas.',
    'mongodb': 'Document databases, NoSQL aggregation pipelines, and querying.',
    'sql': 'Standard SQL queries, analytical grouping, joins, and schema management.',
    'flutter': 'Declarative widget trees, reactive state, cross-platform animations, and UI.',
    'dart': 'Strongly typed OOP language, null safety, async/await futures, and streams.',
    'android-development': 'Native Android architecture, activities, XML views, and Jetpack components.',
    'programming-logic': 'Algorithmic reasoning, boolean logic, recursion, and problem solving.',
    'oop': 'Encapsulation, inheritance, polymorphism, abstraction, and OOP patterns.',
    'dsa': 'Arrays, linked lists, trees, graphs, sorting algorithms, and complexity analysis.',
    'html-css': 'Unified frontend foundations blending semantic HTML structure and CSS.',
    'full-stack': 'End-to-end engineering connecting frontend UI, backend APIs, and databases.',
    'web-fundamentals': 'HTTP protocols, DNS, client-server lifecycle, cookies, and standards.',
    'csharp': 'C# programming, strong typing, LINQ expressions, OOP, and modern .NET.',
  };

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Color _parseHexColor(String hex) {
    try {
      final clean = hex.replaceAll('#', '');
      return Color(int.parse('FF$clean', radix: 16));
    } catch (_) {
      return AppColors.primary;
    }
  }

  String _getTechGlyph(String slug, String name) {
    switch (slug) {
      case 'html': return '</>';
      case 'css': return '#';
      case 'javascript': return 'JS';
      case 'bootstrap': return 'B';
      case 'jquery': return 'jq';
      case 'react': return '⚛';
      case 'php': return 'PHP';
      case 'laravel': return 'Lv';
      case 'nodejs': return 'Node';
      case 'express': return 'Ex';
      case 'python': return 'Py';
      case 'mysql': return 'SQL';
      case 'mongodb': return 'MDB';
      case 'sql': return 'SQL';
      case 'flutter': return 'Fl';
      case 'dart': return '🎯';
      case 'android-development': return '🤖';
      case 'programming-logic': return '🧠';
      case 'oop': return 'OOP';
      case 'dsa': return 'DSA';
      case 'html-css': return 'Web';
      case 'full-stack': return 'Full';
      case 'web-fundamentals': return 'Net';
      case 'csharp': return 'C#';
      default: return name.isNotEmpty ? name[0] : 'T';
    }
  }

  void _showTechnologyPickerBottomSheet(
    BuildContext context,
    List<TechnologyCategoryModel> categories,
    List<TechnologyModel> technologies,
    String selectedTechSlug,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _TechnologyPickerSheet(
        categories: categories,
        technologies: technologies,
        selectedTechSlug: selectedTechSlug,
        parseHexColor: _parseHexColor,
        getTechGlyph: _getTechGlyph,
        onSelect: (slug) {
          ref.read(selectedGameTechnologyProvider.notifier).state = slug;
        },
      ),
    );
  }

  LinearGradient _getCardGradient(String slug) {
    switch (slug) {
      case 'code-puzzle':
        return const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF4338CA)]);
      case 'find-the-bug':
        return const LinearGradient(colors: [Color(0xFFF43F5E), Color(0xFFBE123C)]);
      case 'output-predictor':
        return const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFD97706)]);
      case 'code-scramble':
        return const LinearGradient(colors: [Color(0xFF06B6D4), Color(0xFF0369A1)]);
      case 'complete-the-code':
      case 'csharp-complete-the-code':
        return const LinearGradient(colors: [Color(0xFF9B4993), Color(0xFF6D28D9)]);
      case 'missing-code':
        return const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF047857)]);
      case 'logic-builder':
        return const LinearGradient(colors: [Color(0xFFA855F7), Color(0xFF7E22CE)]);
      case 'sql-challenge':
        return const LinearGradient(colors: [Color(0xFF14B8A6), Color(0xFF0F766E)]);
      case 'memory-match':
        return const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)]);
      case 'speed-typing':
        return const LinearGradient(colors: [Color(0xFF059669), Color(0xFF047857)]);
      case 'code-typing':
        return const LinearGradient(colors: [Color(0xFF4F46E5), Color(0xFF3730A3)]);
      case 'sixty-second-challenge':
        return const LinearGradient(colors: [Color(0xFFDC2626), Color(0xFF991B1B)]);
      case 'error-free-typing':
        return const LinearGradient(colors: [Color(0xFFD97706), Color(0xFFB45309)]);
      case 'syntax-typing':
        return const LinearGradient(colors: [Color(0xFF0891B2), Color(0xFF0E7490)]);
      case 'word-rain':
        return const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF5B21B6)]);
      default:
        return const LinearGradient(colors: [AppColors.primary, AppColors.secondary]);
    }
  }

  String _getGameIcon(String slug) {
    switch (slug) {
      case 'code-puzzle':
        return '🧩';
      case 'find-the-bug':
        return '🐛';
      case 'output-predictor':
        return '💻';
      case 'code-scramble':
        return '🔀';
      case 'complete-the-code':
      case 'csharp-complete-the-code':
        return '🧩';
      case 'missing-code':
        return '❓';
      case 'logic-builder':
        return '🧠';
      case 'sql-challenge':
        return '🗄️';
      case 'memory-match':
        return '💎';
      case 'speed-typing':
        return '⚡';
      case 'code-typing':
        return '⌨️';
      case 'sixty-second-challenge':
        return '⏱️';
      case 'error-free-typing':
        return '🎯';
      case 'syntax-typing':
        return '🔣';
      case 'word-rain':
        return '🌧️';
      default:
        return '🎮';
    }
  }

  @override
  Widget build(BuildContext context) {
    final gamesAsync = ref.watch(gamesListProvider);
    final selectedCategory = ref.watch(selectedGameCategoryProvider);
    final selectedTech = ref.watch(selectedGameTechnologyProvider);
    final techCategoriesAsync = ref.watch(gameCategoriesProvider);
    final technologiesAsync = ref.watch(gameTechnologiesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Icon(Icons.sports_esports_rounded, color: context.brandAccentColor, size: 24),
            const SizedBox(width: 8),
            const Text('Coding & Typing Games', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: () {
              ref.invalidate(gamesListProvider);
              ref.invalidate(gameCategoriesProvider);
              ref.invalidate(gameTechnologiesProvider);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: gamesAsync.when(
              loading: () => const LoadingStateWidget(message: 'Loading games catalog...'),
              error: (err, _) => ErrorStateWidget(
                message: err.toString(),
                onRetry: () => ref.refresh(gamesListProvider),
              ),
              data: (games) {
                final featuredGame = games.where((g) => g.isFeatured).firstOrNull ?? games.firstOrNull;

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(gamesListProvider);
                    ref.invalidate(gameCategoriesProvider);
                    ref.invalidate(gameTechnologiesProvider);
                  },
                  child: SingleChildScrollView(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // 1. Featured Spotlight Banner (Reference Mockup 1 Hero Card)
                        if (featuredGame != null)
                          Container(
                            margin: const EdgeInsets.only(bottom: 18.0),
                            padding: const EdgeInsets.all(12.0),
                            decoration: BoxDecoration(
                              color: context.cardBgColor,
                              borderRadius: BorderRadius.circular(26.0),
                              border: Border.all(
                                color: context.borderColor.withValues(alpha: 0.7),
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(
                                    alpha: isDark ? 0.3 : 0.06,
                                  ),
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Inner Rounded Visual Showcase Container
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(18.0),
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [
                                        AppColors.primary,
                                        AppColors.secondary,
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(20.0),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 10,
                                              vertical: 4,
                                            ),
                                            decoration: BoxDecoration(
                                              color: AppColors.accent.withValues(
                                                alpha: 0.25,
                                              ),
                                              borderRadius: BorderRadius.circular(14),
                                              border: Border.all(
                                                color: AppColors.accent.withValues(
                                                  alpha: 0.5,
                                                ),
                                              ),
                                            ),
                                            child: const Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  Icons.local_fire_department_rounded,
                                                  color: AppColors.accentLight,
                                                  size: 14,
                                                ),
                                                SizedBox(width: 4),
                                                Text(
                                                  'DAILY QUEST',
                                                  style: TextStyle(
                                                    color: AppColors.accentLight,
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.w900,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const Spacer(),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 9,
                                              vertical: 4,
                                            ),
                                            decoration: BoxDecoration(
                                              color: Colors.black.withValues(alpha: 0.2),
                                              borderRadius: BorderRadius.circular(14),
                                            ),
                                            child: Text(
                                              '⭐ ${featuredGame.rating}',
                                              style: const TextStyle(
                                                color: AppColors.accentLight,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 11.5,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 14),
                                      Row(
                                        children: [
                                          Container(
                                            width: 52,
                                            height: 52,
                                            decoration: BoxDecoration(
                                              color: Colors.white.withValues(alpha: 0.14),
                                              borderRadius: BorderRadius.circular(16),
                                              border: Border.all(
                                                color: Colors.white.withValues(alpha: 0.2),
                                              ),
                                            ),
                                            child: Center(
                                              child: Text(
                                                _getGameIcon(featuredGame.slug),
                                                style: const TextStyle(fontSize: 26),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  featuredGame.title,
                                                  style: const TextStyle(
                                                    fontSize: 18,
                                                    fontWeight: FontWeight.w900,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                                const SizedBox(height: 2),
                                                Text(
                                                  '${featuredGame.category} • ${featuredGame.difficulty}',
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.white.withValues(
                                                      alpha: 0.78,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      Text(
                                        featuredGame.description,
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.white.withValues(alpha: 0.85),
                                          height: 1.4,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 14),
                                // Bottom Hero Bar (Reference Mockup 1 Title + Thick Progress Pill + Circular Play Button)
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 4,
                                    vertical: 2,
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              featuredGame.title,
                                              style: const TextStyle(
                                                fontSize: 14.5,
                                                fontWeight: FontWeight.w800,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 8),
                                            Container(
                                              height: 18,
                                              width: double.infinity,
                                              decoration: BoxDecoration(
                                                color: isDark
                                                    ? AppColors.primary.withValues(
                                                        alpha: 0.45,
                                                      )
                                                    : AppColors.primary.withValues(
                                                        alpha: 0.14,
                                                      ),
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                              ),
                                              child: Stack(
                                                children: [
                                                  FractionallySizedBox(
                                                    widthFactor:
                                                        ((featuredGame.rating / 5.0)
                                                            .clamp(0.2, 1.0)),
                                                    child: Container(
                                                      decoration: BoxDecoration(
                                                        gradient:
                                                            const LinearGradient(
                                                          colors: [
                                                            AppColors.accent,
                                                            Color(0xFFE0B15E),
                                                          ],
                                                        ),
                                                        borderRadius:
                                                            BorderRadius.circular(
                                                              12,
                                                            ),
                                                      ),
                                                    ),
                                                  ),
                                                  Positioned.fill(
                                                    child: Padding(
                                                      padding: const EdgeInsets
                                                          .symmetric(
                                                        horizontal: 10,
                                                      ),
                                                      child: Align(
                                                        alignment:
                                                            Alignment.centerRight,
                                                        child: Text(
                                                          '${((featuredGame.rating / 5.0) * 100).round()}%',
                                                          style: TextStyle(
                                                            fontSize: 10,
                                                            fontWeight:
                                                                FontWeight.w800,
                                                            color: isDark
                                                                ? Colors.white
                                                                : AppColors.primary,
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 14),
                                      Semantics(
                                        button: true,
                                        label: 'PLAY DAILY QUEST',
                                        child: InkWell(
                                          onTap: () {
                                            final techParam =
                                                selectedTech != 'all'
                                                    ? '?tech=$selectedTech'
                                                    : '';
                                            context.push(
                                              '/games/${featuredGame.slug}$techParam',
                                            );
                                          },
                                          borderRadius: BorderRadius.circular(28),
                                          child: Container(
                                            width: 52,
                                            height: 52,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              gradient: const LinearGradient(
                                                colors: [
                                                  AppColors.primary,
                                                  AppColors.primaryLight,
                                                ],
                                                begin: Alignment.topLeft,
                                                end: Alignment.bottomRight,
                                              ),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: AppColors.primary
                                                      .withValues(alpha: 0.3),
                                                  blurRadius: 12,
                                                  offset: const Offset(0, 5),
                                                ),
                                              ],
                                            ),
                                            child: const Icon(
                                              Icons.play_arrow_rounded,
                                              color: Colors.white,
                                              size: 28,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),

                        // 2. Search Field
                        TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: 'Search coding & typing games...',
                            prefixIcon: const Icon(Icons.search_rounded, size: 20),
                            filled: true,
                            fillColor: context.cardBgColor,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 13,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(20),
                              borderSide: BorderSide(color: context.borderColor),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(20),
                              borderSide: BorderSide(color: context.borderColor),
                            ),
                          ),
                          onChanged: (val) {
                            ref.read(gameSearchQueryProvider.notifier).state = val;
                          },
                        ),
                        const SizedBox(height: 18),

                        // 3. Categories Section (Reference Mockup 1 Vertical Cards + Dots)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Categories',
                              style: TextStyle(
                                fontSize: 16.5,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            GestureDetector(
                              onTap: () {
                                ref
                                    .read(selectedGameCategoryProvider.notifier)
                                    .state = 'All Games';
                              },
                              child: Text(
                                'See All',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: context.brandAccentColor,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: List.generate(_categories.length, (idx) {
                            final cat = _categories[idx];
                            final name = cat['name']!;
                            final isSelected = selectedCategory == name;
                            final colors = <Color>[
                              AppColors.primary,
                              AppColors.accent,
                              AppColors.secondary,
                            ];
                            final tint = colors[idx % colors.length];

                            return Expanded(
                              child: Padding(
                                padding: EdgeInsets.only(
                                  right: idx < _categories.length - 1 ? 10 : 0,
                                ),
                                child: GestureDetector(
                                  onTap: () {
                                    ref
                                        .read(
                                          selectedGameCategoryProvider.notifier,
                                        )
                                        .state = name;
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 14,
                                      horizontal: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? (isDark
                                              ? AppColors.primaryLight
                                              : AppColors.primary)
                                          : (isDark
                                              ? context.cardBgColor
                                              : tint.withValues(alpha: 0.09)),
                                      borderRadius: BorderRadius.circular(22),
                                      border: Border.all(
                                        color: isSelected
                                            ? AppColors.accent
                                            : tint.withValues(
                                                alpha: isDark ? 0.35 : 0.22,
                                              ),
                                        width: isSelected ? 1.8 : 1,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(
                                            alpha: isDark ? 0.22 : 0.04,
                                          ),
                                          blurRadius: 10,
                                          offset: const Offset(0, 4),
                                        ),
                                      ],
                                    ),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Container(
                                          width: 40,
                                          height: 40,
                                          decoration: BoxDecoration(
                                            color: isSelected
                                                ? Colors.white.withValues(
                                                    alpha: 0.18,
                                                  )
                                                : tint.withValues(alpha: 0.16),
                                            borderRadius:
                                                BorderRadius.circular(14),
                                          ),
                                          child: Center(
                                            child: Text(
                                              cat['icon']!,
                                              style: const TextStyle(
                                                fontSize: 20,
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          name,
                                          style: TextStyle(
                                            fontSize: 11.5,
                                            fontWeight: FontWeight.w800,
                                            color: isSelected
                                                ? Colors.white
                                                : context.textPrimaryColor,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          textAlign: TextAlign.center,
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          idx == 0
                                              ? '${games.length} Games'
                                              : 'Interactive',
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: isSelected
                                                ? Colors.white.withValues(
                                                    alpha: 0.8,
                                                  )
                                                : context.textSecondaryColor,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: List.generate(_categories.length, (idx) {
                            final isSelected =
                                selectedCategory == _categories[idx]['name'];
                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              margin: const EdgeInsets.only(right: 6),
                              width: isSelected ? 18 : 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? context.brandAccentColor
                                    : context.borderColor,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            );
                          }),
                        ),
                        const SizedBox(height: 18),

                        // 4. Technology Categories & Selection Section (Modern Technology Explorer)
                        techCategoriesAsync.when(
                          data: (categories) => technologiesAsync.when(
                            data: (technologies) {
                              final activeTech = selectedTech != 'all'
                                  ? technologies.where((t) => t.slug == selectedTech).firstOrNull
                                  : null;
                              final activeCategory = activeTech != null
                                  ? categories.where((c) => c.slug == activeTech.categorySlug).firstOrNull
                                  : null;
                              final activeColor = activeTech != null
                                  ? _parseHexColor(activeTech.color)
                                  : AppColors.primary;
                              final availableGamesCount = activeTech != null
                                  ? activeTech.supportedGames.length
                                  : games.length;

                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  // 4a. Header
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: context.brandAccentColor.withValues(alpha: 0.14),
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(color: context.brandAccentColor.withValues(alpha: 0.3)),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(Icons.layers_rounded, size: 12, color: context.brandAccentColor),
                                            const SizedBox(width: 4),
                                            Text(
                                              'TECHNOLOGY EXPLORER',
                                              style: TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.w900,
                                                color: context.brandAccentColor,
                                                letterSpacing: 0.5,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      const Text(
                                        'Choose Your Technology',
                                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Practice real code syntax tailored to your stack',
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: isDark ? Colors.white60 : Colors.black54,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),

                                  // 4b. Compact Dropdown-Style Selector Button
                                  InkWell(
                                    onTap: () => _showTechnologyPickerBottomSheet(
                                      context,
                                      categories,
                                      technologies,
                                      selectedTech,
                                    ),
                                    borderRadius: BorderRadius.circular(16),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: Theme.of(context).cardColor,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(
                                          color: selectedTech != 'all'
                                              ? activeColor.withValues(alpha: 0.6)
                                              : (isDark ? Colors.white12 : Colors.black12),
                                          width: selectedTech != 'all' ? 1.5 : 1,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: 0.04),
                                            blurRadius: 6,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Row(
                                        children: [
                                          // Tech squircle icon
                                          activeTech == null
                                              ? Container(
                                                  width: 34,
                                                  height: 34,
                                                  decoration: BoxDecoration(
                                                    color: activeColor.withValues(alpha: 0.16),
                                                    borderRadius: BorderRadius.circular(10),
                                                  ),
                                                  child: const Center(
                                                    child: Icon(Icons.sports_esports_rounded, size: 18, color: AppColors.primary),
                                                  ),
                                                )
                                              : TechLogoWidget(
                                                  name: activeTech.slug,
                                                  size: 34,
                                                  borderRadius: 10,
                                                ),
                                          const SizedBox(width: 10),

                                          // Track text
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  activeTech != null ? 'SELECTED TRACK' : 'ALL TECHNOLOGIES',
                                                  style: TextStyle(
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.w900,
                                                    color: isDark ? Colors.white54 : Colors.black45,
                                                    letterSpacing: 0.5,
                                                  ),
                                                ),
                                                Text(
                                                  activeTech?.name ?? 'All Technologies Catalog',
                                                  style: const TextStyle(
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.w900,
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ],
                                            ),
                                          ),

                                          // Available games pill
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: context.brandAccentColor.withValues(alpha: 0.12),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              '$availableGamesCount Games',
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: context.brandAccentColor,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          const Icon(Icons.keyboard_arrow_down_rounded, size: 20, color: Colors.grey),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),

                                  // 4c. Selected Technology Display (Compact Info & Action Card)
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).cardColor,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: isDark ? Colors.white10 : Colors.black12,
                                      ),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            activeTech == null
                                                ? Container(
                                                    width: 36,
                                                    height: 36,
                                                    decoration: BoxDecoration(
                                                      color: activeColor.withValues(alpha: 0.18),
                                                      borderRadius: BorderRadius.circular(10),
                                                    ),
                                                    child: const Center(
                                                      child: Icon(Icons.gamepad_rounded, size: 18, color: AppColors.primary),
                                                    ),
                                                  )
                                                : TechLogoWidget(
                                                    name: activeTech.slug,
                                                    size: 36,
                                                    borderRadius: 10,
                                                  ),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Row(
                                                    children: [
                                                      Flexible(
                                                        child: Text(
                                                          activeTech?.name ?? 'All Technologies Track',
                                                          style: const TextStyle(
                                                            fontSize: 13,
                                                            fontWeight: FontWeight.w900,
                                                          ),
                                                          maxLines: 1,
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                      ),
                                                      const SizedBox(width: 6),
                                                      Container(
                                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                        decoration: BoxDecoration(
                                                          color: context.brandAccentColor.withValues(alpha: 0.14),
                                                          borderRadius: BorderRadius.circular(6),
                                                        ),
                                                        child: Text(
                                                          activeCategory?.name ?? 'Full Catalog',
                                                          style: TextStyle(
                                                            fontSize: 9,
                                                            fontWeight: FontWeight.bold,
                                                            color: context.brandAccentColor,
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 3),
                                                  Text(
                                                    activeTech != null
                                                        ? (_techDescriptions[activeTech.slug] ?? activeTech.description)
                                                        : 'Explore all 14 coding and typing games across 23 technologies.',
                                                    style: TextStyle(
                                                      fontSize: 11,
                                                      color: isDark ? Colors.white60 : Colors.black54,
                                                    ),
                                                    maxLines: 2,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 10),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                  decoration: BoxDecoration(
                                                    color: context.brandAccentColor.withValues(alpha: 0.12),
                                                    borderRadius: BorderRadius.circular(8),
                                                  ),
                                                  child: Text(
                                                    '$availableGamesCount Games Ready',
                                                    style: TextStyle(
                                                      fontSize: 10,
                                                      fontWeight: FontWeight.bold,
                                                      color: context.brandAccentColor,
                                                    ),
                                                  ),
                                                ),
                                                if (activeTech != null && (activeTech.userHighScore ?? 0) > 0) ...[
                                                  const SizedBox(width: 6),
                                                  Text(
                                                    '★ ${activeTech.userHighScore} pts',
                                                    style: const TextStyle(
                                                      fontSize: 10,
                                                      fontWeight: FontWeight.bold,
                                                      color: Colors.amber,
                                                    ),
                                                  ),
                                                ],
                                              ],
                                            ),
                                            Row(
                                              children: [
                                                if (selectedTech != 'all')
                                                  GestureDetector(
                                                    onTap: () {
                                                      ref.read(selectedGameTechnologyProvider.notifier).state = 'all';
                                                    },
                                                    child: Padding(
                                                      padding: const EdgeInsets.only(right: 8.0),
                                                      child: Text(
                                                        'Clear',
                                                        style: TextStyle(
                                                          fontSize: 11,
                                                          fontWeight: FontWeight.bold,
                                                          color: isDark ? Colors.white60 : Colors.black54,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                FilledButton.icon(
                                                  onPressed: () {
                                                    _scrollController.animateTo(
                                                      460.0,
                                                      duration: const Duration(milliseconds: 350),
                                                      curve: Curves.easeInOut,
                                                    );
                                                  },
                                                  icon: const Icon(Icons.arrow_downward_rounded, size: 14),
                                                  label: const Text('Explore Games', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                                  style: FilledButton.styleFrom(
                                                    backgroundColor: AppColors.primary,
                                                    foregroundColor: Colors.white,
                                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                    minimumSize: Size.zero,
                                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (selectedTech == 'csharp') ...[
                                    const SizedBox(height: 14),
                                    Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        gradient: const LinearGradient(
                                          colors: [Color(0xFF2E1065), Color(0xFF1E1B4B)],
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                        ),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(color: const Color(0xFF9B4993).withValues(alpha: 0.4)),
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(0xFF9B4993).withValues(alpha: 0.2),
                                            blurRadius: 16,
                                            offset: const Offset(0, 4),
                                          ),
                                        ],
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              const TechLogoWidget(name: 'csharp', size: 36, borderRadius: 10),
                                              const SizedBox(width: 10),
                                              const Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      'DEDICATED C# GAMES SECTION',
                                                      style: TextStyle(
                                                        color: Color(0xFFC084FC),
                                                        fontSize: 10,
                                                        fontWeight: FontWeight.w900,
                                                        letterSpacing: 0.5,
                                                      ),
                                                    ),
                                                    Text(
                                                      'C# Complete the Code',
                                                      style: TextStyle(
                                                        color: Colors.white,
                                                        fontSize: 16,
                                                        fontWeight: FontWeight.w900,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 10),
                                          const Text(
                                            'Master C# syntax and OOP through 100+ code completion challenges across Beginner, Intermediate, and Advanced levels.',
                                            style: TextStyle(color: Color(0xFFE9D5FF), fontSize: 12, height: 1.4),
                                          ),
                                          const SizedBox(height: 12),
                                          SizedBox(
                                            width: double.infinity,
                                            child: FilledButton.icon(
                                              onPressed: () {
                                                context.push('/games/complete-the-code?tech=csharp');
                                              },
                                              icon: const Icon(Icons.play_arrow_rounded, size: 18),
                                              label: const Text(
                                                'Play Complete the Code Game',
                                                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                                              ),
                                              style: FilledButton.styleFrom(
                                                backgroundColor: const Color(0xFF9B4993),
                                                foregroundColor: Colors.white,
                                                padding: const EdgeInsets.symmetric(vertical: 12),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              );
                            },
                            loading: () => const SizedBox.shrink(),
                            error: (_, _) => const SizedBox.shrink(),
                          ),
                          loading: () => const SizedBox.shrink(),
                          error: (_, _) => const SizedBox.shrink(),
                        ),
                        const SizedBox(height: 18),

                        // 5. Section Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              selectedCategory,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                            ),
                            Text(
                              '${games.length} games',
                              style: const TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // 6. Games Grid
                        if (games.isEmpty)
                          const EmptyStateWidget(
                            title: 'No Games Found',
                            description: 'Try selecting another category or clearing your search.',
                          )
                        else
                          GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 0.88,
                            ),
                            itemCount: games.length,
                            itemBuilder: (context, index) {
                              final game = games[index];

                              return InkWell(
                                onTap: () {
                                  final techParam = selectedTech != 'all' ? '?tech=$selectedTech' : '';
                                  context.push('/games/${game.slug}$techParam');
                                },
                                borderRadius: BorderRadius.circular(24),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: context.cardBgColor,
                                    borderRadius: BorderRadius.circular(24),
                                    border: Border.all(
                                      color: context.borderColor.withValues(alpha: 0.7),
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: isDark ? 0.24 : 0.05),
                                        blurRadius: 14,
                                        offset: const Offset(0, 5),
                                      ),
                                    ],
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.stretch,
                                    children: [
                                      // Inner Rounded Gradient Thumbnail with Icon
                                      Container(
                                        height: 78,
                                        margin: const EdgeInsets.fromLTRB(8, 8, 8, 0),
                                        decoration: BoxDecoration(
                                          gradient: _getCardGradient(game.slug),
                                          borderRadius: BorderRadius.circular(18),
                                        ),
                                        child: Stack(
                                          children: [
                                            Center(
                                              child: Text(
                                                _getGameIcon(game.slug),
                                                style: const TextStyle(fontSize: 32),
                                              ),
                                            ),
                                            if (game.badge.isNotEmpty)
                                              Positioned(
                                                top: 8,
                                                left: 8,
                                                child: Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                                  decoration: BoxDecoration(
                                                    color: Colors.black.withValues(alpha: 0.42),
                                                    borderRadius: BorderRadius.circular(8),
                                                  ),
                                                  child: Text(
                                                    game.badge,
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 9,
                                                      fontWeight: FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            Positioned(
                                              top: 8,
                                              right: 8,
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                                                decoration: BoxDecoration(
                                                  color: Colors.black.withValues(alpha: 0.42),
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    const Icon(Icons.star_rounded, color: AppColors.accent, size: 11),
                                                    const SizedBox(width: 2),
                                                    Text(
                                                      '${game.rating}',
                                                      style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),

                                      // Bottom Details
                                      Expanded(
                                        child: Padding(
                                          padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    game.title,
                                                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                  const SizedBox(height: 3),
                                                  Text(
                                                    game.description,
                                                    style: TextStyle(
                                                      fontSize: 10,
                                                      color: context.textSecondaryColor,
                                                      height: 1.25,
                                                    ),
                                                    maxLines: 2,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ],
                                              ),
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                    decoration: BoxDecoration(
                                                      color: context.brandAccentColor.withValues(alpha: 0.12),
                                                      borderRadius: BorderRadius.circular(10),
                                                    ),
                                                    child: Text(
                                                      game.difficulty,
                                                      style: TextStyle(
                                                        fontSize: 9.5,
                                                        fontWeight: FontWeight.w800,
                                                        color: context.brandAccentColor,
                                                      ),
                                                    ),
                                                  ),
                                                  if (game.userHighScore > 0)
                                                    Row(
                                                      children: [
                                                        const Icon(Icons.emoji_events_rounded, size: 12, color: AppColors.accent),
                                                        const SizedBox(width: 2),
                                                        Text(
                                                          '${game.userHighScore}',
                                                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800),
                                                        ),
                                                      ],
                                                    )
                                                  else
                                                    Container(
                                                      width: 24,
                                                      height: 24,
                                                      decoration: BoxDecoration(
                                                        color: isDark ? AppColors.primaryLight : AppColors.primary,
                                                        shape: BoxShape.circle,
                                                      ),
                                                      child: const Icon(
                                                        Icons.play_arrow_rounded,
                                                        size: 15,
                                                        color: Colors.white,
                                                      ),
                                                    ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        const SizedBox(height: 24),
                      ],
                    ),
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
}

class _TechnologyPickerSheet extends StatefulWidget {
  final List<TechnologyCategoryModel> categories;
  final List<TechnologyModel> technologies;
  final String selectedTechSlug;
  final Color Function(String) parseHexColor;
  final String Function(String, String) getTechGlyph;
  final ValueChanged<String> onSelect;

  const _TechnologyPickerSheet({
    required this.categories,
    required this.technologies,
    required this.selectedTechSlug,
    required this.parseHexColor,
    required this.getTechGlyph,
    required this.onSelect,
  });

  @override
  State<_TechnologyPickerSheet> createState() => _TechnologyPickerSheetState();
}

class _TechnologyPickerSheetState extends State<_TechnologyPickerSheet> {
  final TextEditingController _searchCtrl = TextEditingController();
  String _activeCategory = 'all';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final query = _searchCtrl.text.trim().toLowerCase();

    final filtered = widget.technologies.where((tech) {
      if (_activeCategory != 'all' && tech.categorySlug != _activeCategory) {
        return false;
      }
      if (query.isNotEmpty) {
        final matchName = tech.name.toLowerCase().contains(query);
        final matchSlug = tech.slug.toLowerCase().contains(query);
        final matchDesc = tech.description.toLowerCase().contains(query);
        if (!matchName && !matchSlug && !matchDesc) return false;
      }
      return true;
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: 10, bottom: 6),
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? Colors.white24 : Colors.black26,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.layers_rounded, color: context.brandAccentColor, size: 20),
                    const SizedBox(width: 8),
                    const Text(
                      'Choose Your Technology',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20),
                  onPressed: () => Navigator.pop(context),
                  tooltip: 'Close',
                ),
              ],
            ),
          ),

          // Search Field
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Search 23 technologies (React, Python...)',
                hintStyle: const TextStyle(fontSize: 12),
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 16),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() {});
                        },
                      )
                    : null,
                filled: true,
                fillColor: Theme.of(context).cardColor,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: isDark ? Colors.white12 : Colors.black12),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: isDark ? Colors.white12 : Colors.black12),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),

          // Category Filter Chips
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              children: [
                Padding(
                  padding: const EdgeInsets.only(right: 6.0),
                  child: ChoiceChip(
                    label: Text('All (${widget.technologies.length})'),
                    selected: _activeCategory == 'all',
                    labelStyle: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: _activeCategory == 'all' ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                    ),
                    backgroundColor: Theme.of(context).cardColor,
                    selectedColor: AppColors.primary,
                    onSelected: (_) => setState(() => _activeCategory = 'all'),
                  ),
                ),
                ...widget.categories.map((cat) {
                  final isSelected = _activeCategory == cat.slug;
                  final count = widget.technologies.where((t) => t.categorySlug == cat.slug).length;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6.0),
                    child: ChoiceChip(
                      label: Text('${cat.name} ($count)'),
                      selected: isSelected,
                      labelStyle: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                      ),
                      backgroundColor: Theme.of(context).cardColor,
                      selectedColor: AppColors.primary,
                      onSelected: (_) => setState(() => _activeCategory = cat.slug),
                    ),
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Scrollable List of Technologies
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
              children: [
                // All Technologies Tile
                if ((query.isEmpty || 'all technologies'.contains(query)) && _activeCategory == 'all')
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: InkWell(
                      onTap: () {
                        widget.onSelect('all');
                        Navigator.pop(context);
                      },
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: widget.selectedTechSlug == 'all'
                                ? AppColors.primary
                                : (isDark ? Colors.white12 : Colors.black12),
                            width: widget.selectedTechSlug == 'all' ? 1.5 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.sports_esports_rounded, size: 18, color: AppColors.primary),
                            ),
                            const SizedBox(width: 10),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'All Technologies',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
                                  ),
                                  Text(
                                    'Browse all 14 games across all tracks',
                                    style: TextStyle(fontSize: 10, color: Colors.grey),
                                  ),
                                ],
                              ),
                            ),
                            if (widget.selectedTechSlug == 'all')
                              const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 18),
                          ],
                        ),
                      ),
                    ),
                  ),

                // Technologies List
                ...filtered.map((tech) {
                  final isSelected = widget.selectedTechSlug == tech.slug;
                  final techColor = widget.parseHexColor(tech.color);

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6.0),
                    child: InkWell(
                      onTap: () {
                        widget.onSelect(tech.slug);
                        Navigator.pop(context);
                      },
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? techColor.withValues(alpha: 0.12)
                              : Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isSelected ? techColor : (isDark ? Colors.white12 : Colors.black12),
                            width: isSelected ? 1.5 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            TechLogoWidget(
                              name: tech.slug,
                              size: 30,
                              borderRadius: 8,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    tech.name,
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    tech.categorySlug,
                                    style: const TextStyle(fontSize: 9, color: Colors.grey),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: context.brandAccentColor.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                '${tech.supportedGames.length}g',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: context.brandAccentColor,
                                ),
                              ),
                            ),
                            if (isSelected) ...[
                              const SizedBox(width: 6),
                              Icon(Icons.check_circle_rounded, color: techColor, size: 16),
                            ],
                          ],
                        ),
                      ),
                    ),
                  );
                }),

                if (filtered.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 32.0),
                    child: Center(
                      child: Column(
                        children: [
                          const Icon(Icons.search_off_rounded, size: 36, color: Colors.grey),
                          const SizedBox(height: 8),
                          Text(
                            'No technologies match "${_searchCtrl.text}"',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
