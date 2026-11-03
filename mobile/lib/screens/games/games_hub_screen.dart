import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
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
  String _selectedTechCategorySlug = 'all';

  static const List<Map<String, String>> _categories = [
    {'name': 'All Games', 'icon': '🎮'},
    {'name': 'Coding Games', 'icon': '💻'},
    {'name': 'Typing Games', 'icon': '⌨️'},
  ];

  @override
  void dispose() {
    _searchController.dispose();
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

                        // 4. Technology Categories & Selection Section
                        techCategoriesAsync.when(
                          data: (categories) => technologiesAsync.when(
                            data: (technologies) {
                              // Filter technologies by selected tech category
                              final displayTechs = _selectedTechCategorySlug == 'all'
                                  ? technologies
                                  : technologies.where((t) => t.categorySlug == _selectedTechCategorySlug).toList();

                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  // Technology Section Header
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Row(
                                        children: [
                                          Icon(Icons.terminal_rounded, size: 16, color: AppColors.primary),
                                          SizedBox(width: 6),
                                          Text(
                                            'Technology Categories',
                                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
                                          ),
                                        ],
                                      ),
                                      if (selectedTech != 'all')
                                        GestureDetector(
                                          onTap: () {
                                            ref.read(selectedGameTechnologyProvider.notifier).state = 'all';
                                          },
                                          child: const Text(
                                            'Clear Filter',
                                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),

                                  // Technology Category Selector Chips
                                  SizedBox(
                                    height: 32,
                                    child: ListView(
                                      scrollDirection: Axis.horizontal,
                                      children: [
                                        Padding(
                                          padding: const EdgeInsets.only(right: 6.0),
                                          child: ChoiceChip(
                                            label: const Text('All Tracks'),
                                            selected: _selectedTechCategorySlug == 'all',
                                            labelStyle: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: _selectedTechCategorySlug == 'all' ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                                            ),
                                            backgroundColor: Theme.of(context).cardColor,
                                            selectedColor: AppColors.primary,
                                            onSelected: (_) {
                                              setState(() => _selectedTechCategorySlug = 'all');
                                            },
                                          ),
                                        ),
                                        ...categories.map((cat) {
                                          final isSelected = _selectedTechCategorySlug == cat.slug;
                                          return Padding(
                                            padding: const EdgeInsets.only(right: 6.0),
                                            child: ChoiceChip(
                                              label: Text(cat.name),
                                              selected: isSelected,
                                              labelStyle: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: isSelected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                                              ),
                                              backgroundColor: Theme.of(context).cardColor,
                                              selectedColor: AppColors.primary,
                                              onSelected: (_) {
                                                setState(() => _selectedTechCategorySlug = cat.slug);
                                              },
                                            ),
                                          );
                                        }),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 10),

                                  // Horizontal Scroll of Technology Cards
                                  SizedBox(
                                    height: 78,
                                    child: ListView.separated(
                                      scrollDirection: Axis.horizontal,
                                      itemCount: displayTechs.length + 1,
                                      separatorBuilder: (_, _) => const SizedBox(width: 8),
                                      itemBuilder: (context, idx) {
                                        if (idx == 0) {
                                          final isAllSelected = selectedTech == 'all';
                                          return GestureDetector(
                                            onTap: () {
                                              ref.read(selectedGameTechnologyProvider.notifier).state = 'all';
                                            },
                                            child: Container(
                                              width: 90,
                                              padding: const EdgeInsets.all(8),
                                              decoration: BoxDecoration(
                                                color: Theme.of(context).cardColor,
                                                borderRadius: BorderRadius.circular(16),
                                                border: Border.all(
                                                  color: isAllSelected ? AppColors.primary : (isDark ? Colors.white12 : Colors.black12),
                                                  width: isAllSelected ? 2 : 1,
                                                ),
                                              ),
                                              child: Column(
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                children: [
                                                  Icon(
                                                    Icons.apps_rounded,
                                                    color: isAllSelected ? AppColors.primary : Colors.grey,
                                                    size: 22,
                                                  ),
                                                  const SizedBox(height: 4),
                                                  const Text(
                                                    'All Techs',
                                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ],
                                              ),
                                            ),
                                          );
                                        }

                                        final tech = displayTechs[idx - 1];
                                        final isSelected = selectedTech == tech.slug;
                                        final techColor = _parseHexColor(tech.color);

                                        return GestureDetector(
                                          onTap: () {
                                            if (selectedTech == tech.slug) {
                                              ref.read(selectedGameTechnologyProvider.notifier).state = 'all';
                                            } else {
                                              ref.read(selectedGameTechnologyProvider.notifier).state = tech.slug;
                                            }
                                          },
                                          child: Container(
                                            width: 100,
                                            padding: const EdgeInsets.all(8),
                                            decoration: BoxDecoration(
                                              color: isSelected
                                                  ? techColor.withValues(alpha: 0.15)
                                                  : Theme.of(context).cardColor,
                                              borderRadius: BorderRadius.circular(16),
                                              border: Border.all(
                                                color: isSelected ? techColor : (isDark ? Colors.white12 : Colors.black12),
                                                width: isSelected ? 2 : 1,
                                              ),
                                            ),
                                            child: Column(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [
                                                Container(
                                                  width: 24,
                                                  height: 24,
                                                  decoration: BoxDecoration(
                                                    color: techColor.withValues(alpha: 0.2),
                                                    borderRadius: BorderRadius.circular(6),
                                                  ),
                                                  child: Center(
                                                    child: Text(
                                                      tech.slug == 'csharp' ? 'C#' : (tech.name.isNotEmpty ? tech.name[0] : 'T'),
                                                      style: TextStyle(
                                                        color: techColor,
                                                        fontSize: tech.slug == 'csharp' ? 10 : 12,
                                                        fontWeight: FontWeight.w900,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  tech.name,
                                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                                Text(
                                                  '${tech.supportedGames.length} games',
                                                  style: const TextStyle(fontSize: 8, color: Colors.grey),
                                                ),
                                              ],
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ),

                                  // Active Technology Banner
                                  if (selectedTech != 'all') ...[
                                    const SizedBox(height: 10),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 16),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              'Filtered by ${selectedTech.toUpperCase()} • ${games.length} games ready to play',
                                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                          GestureDetector(
                                            onTap: () {
                                              ref.read(selectedGameTechnologyProvider.notifier).state = 'all';
                                            },
                                            child: const Icon(Icons.close_rounded, size: 16),
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
