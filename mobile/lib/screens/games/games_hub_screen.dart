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
            const Icon(Icons.sports_esports_rounded, color: AppColors.primary, size: 24),
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
                        // 1. Featured Spotlight Banner
                        if (featuredGame != null)
                          Container(
                            margin: const EdgeInsets.only(bottom: 16.0),
                            padding: const EdgeInsets.all(16.0),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF0F2B24), Color(0xFF193D35), Color(0xFF0A1B16)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(24.0),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.25),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.amber.withValues(alpha: 0.25),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.local_fire_department_rounded, color: Colors.amber, size: 14),
                                          SizedBox(width: 4),
                                          Text(
                                            'DAILY QUEST',
                                            style: TextStyle(
                                              color: Colors.amber,
                                              fontSize: 10,
                                              fontWeight: FontWeight.w900,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Spacer(),
                                    Text(
                                      '⭐ ${featuredGame.rating}',
                                      style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 12),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        gradient: _getCardGradient(featuredGame.slug),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Center(
                                        child: Text(_getGameIcon(featuredGame.slug), style: const TextStyle(fontSize: 22)),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            featuredGame.title,
                                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            '${featuredGame.category} • ${featuredGame.difficulty}',
                                            style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.7)),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  featuredGame.description,
                                  style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.8), height: 1.4),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 14),
                                SizedBox(
                                  width: double.infinity,
                                  child: FilledButton.icon(
                                    onPressed: () {
                                      final techParam = selectedTech != 'all' ? '?tech=$selectedTech' : '';
                                      context.push('/games/${featuredGame.slug}$techParam');
                                    },
                                    icon: const Icon(Icons.play_arrow_rounded, size: 18),
                                    label: const Text('PLAY DAILY QUEST', style: TextStyle(fontWeight: FontWeight.w900)),
                                    style: FilledButton.styleFrom(
                                      backgroundColor: AppColors.gamePrimaryButton,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    ),
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
                            fillColor: Theme.of(context).cardColor,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(color: isDark ? Colors.white12 : Colors.black12),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(color: isDark ? Colors.white12 : Colors.black12),
                            ),
                          ),
                          onChanged: (val) {
                            ref.read(gameSearchQueryProvider.notifier).state = val;
                          },
                        ),
                        const SizedBox(height: 14),

                        // 3. Category Filter Chips (All Games / Coding / Typing)
                        SizedBox(
                          height: 38,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: _categories.length,
                            separatorBuilder: (_, _) => const SizedBox(width: 8),
                            itemBuilder: (context, idx) {
                              final cat = _categories[idx];
                              final isSelected = selectedCategory == cat['name'];

                              return FilterChip(
                                selected: isSelected,
                                label: Text('${cat['icon']} ${cat['name']}'),
                                labelStyle: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected
                                      ? Colors.white
                                      : (isDark ? Colors.white70 : Colors.black87),
                                ),
                                backgroundColor: Theme.of(context).cardColor,
                                selectedColor: AppColors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                                side: BorderSide(
                                  color: isSelected ? AppColors.primary : (isDark ? Colors.white12 : Colors.black12),
                                ),
                                onSelected: (_) {
                                  ref.read(selectedGameCategoryProvider.notifier).state = cat['name']!;
                                },
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 16),

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
                                          color: AppColors.primary.withValues(alpha: 0.12),
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.25)),
                                        ),
                                        child: const Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(Icons.layers_rounded, size: 12, color: AppColors.primary),
                                            SizedBox(width: 4),
                                            Text(
                                              'TECHNOLOGY EXPLORER',
                                              style: TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.w900,
                                                color: AppColors.primary,
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
                                          Container(
                                            width: 34,
                                            height: 34,
                                            decoration: BoxDecoration(
                                              color: activeColor.withValues(alpha: 0.16),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: Center(
                                              child: activeTech == null
                                                  ? const Icon(Icons.sports_esports_rounded, size: 18, color: AppColors.primary)
                                                  : Text(
                                                      _getTechGlyph(activeTech.slug, activeTech.name),
                                                      style: TextStyle(
                                                        color: activeColor,
                                                        fontSize: 11,
                                                        fontWeight: FontWeight.w900,
                                                      ),
                                                    ),
                                            ),
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
                                              color: AppColors.primary.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              '$availableGamesCount Games',
                                              style: const TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.primary,
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
                                            Container(
                                              width: 36,
                                              height: 36,
                                              decoration: BoxDecoration(
                                                color: activeColor.withValues(alpha: 0.18),
                                                borderRadius: BorderRadius.circular(10),
                                              ),
                                              child: Center(
                                                child: activeTech == null
                                                    ? const Icon(Icons.gamepad_rounded, size: 18, color: AppColors.primary)
                                                    : Text(
                                                        _getTechGlyph(activeTech.slug, activeTech.name),
                                                        style: TextStyle(
                                                          color: activeColor,
                                                          fontSize: 12,
                                                          fontWeight: FontWeight.w900,
                                                        ),
                                                      ),
                                              ),
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
                                                          color: AppColors.primary.withValues(alpha: 0.12),
                                                          borderRadius: BorderRadius.circular(6),
                                                        ),
                                                        child: Text(
                                                          activeCategory?.name ?? 'Full Catalog',
                                                          style: const TextStyle(
                                                            fontSize: 9,
                                                            fontWeight: FontWeight.bold,
                                                            color: AppColors.primary,
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
                                                    color: AppColors.primary.withValues(alpha: 0.1),
                                                    borderRadius: BorderRadius.circular(8),
                                                  ),
                                                  child: Text(
                                                    '$availableGamesCount Games Ready',
                                                    style: const TextStyle(
                                                      fontSize: 10,
                                                      fontWeight: FontWeight.bold,
                                                      color: AppColors.primary,
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
                                borderRadius: BorderRadius.circular(20),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Theme.of(context).cardColor,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: isDark ? Colors.white12 : Colors.black12),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                                        blurRadius: 8,
                                        offset: const Offset(0, 3),
                                      ),
                                    ],
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.stretch,
                                    children: [
                                      // Top Gradient Banner with Icon
                                      Container(
                                        height: 76,
                                        decoration: BoxDecoration(
                                          gradient: _getCardGradient(game.slug),
                                          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
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
                                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                  decoration: BoxDecoration(
                                                    color: Colors.black45,
                                                    borderRadius: BorderRadius.circular(6),
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
                                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: Colors.black45,
                                                  borderRadius: BorderRadius.circular(6),
                                                ),
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    const Icon(Icons.star, color: Colors.amber, size: 10),
                                                    const SizedBox(width: 2),
                                                    Text(
                                                      '${game.rating}',
                                                      style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
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
                                          padding: const EdgeInsets.all(10.0),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    game.title,
                                                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    game.description,
                                                    style: TextStyle(
                                                      fontSize: 10,
                                                      color: isDark ? Colors.white60 : Colors.black54,
                                                      height: 1.3,
                                                    ),
                                                    maxLines: 2,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ],
                                              ),
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Text(
                                                    game.difficulty,
                                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary),
                                                  ),
                                                  if (game.userHighScore > 0)
                                                    Row(
                                                      children: [
                                                        const Icon(Icons.emoji_events_rounded, size: 11, color: Colors.amber),
                                                        const SizedBox(width: 2),
                                                        Text(
                                                          '${game.userHighScore}',
                                                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                                        ),
                                                      ],
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
                const Row(
                  children: [
                    Icon(Icons.layers_rounded, color: AppColors.primary, size: 20),
                    SizedBox(width: 8),
                    Text(
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
                            Container(
                              width: 30,
                              height: 30,
                              decoration: BoxDecoration(
                                color: techColor.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Center(
                                child: Text(
                                  widget.getTechGlyph(tech.slug, tech.name),
                                  style: TextStyle(
                                    color: techColor,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
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
                                color: AppColors.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                '${tech.supportedGames.length}g',
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary),
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
