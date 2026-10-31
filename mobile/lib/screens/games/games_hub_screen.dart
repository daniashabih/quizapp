import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/game_provider.dart';
import '../../../widgets/empty_state_widget.dart';
import '../../../widgets/error_state_widget.dart';
import '../../../widgets/loading_state_widget.dart';

class GamesHubScreen extends ConsumerStatefulWidget {
  const GamesHubScreen({super.key});

  @override
  ConsumerState<GamesHubScreen> createState() => _GamesHubScreenState();
}

class _GamesHubScreenState extends ConsumerState<GamesHubScreen> {
  final TextEditingController _searchController = TextEditingController();

  static const List<Map<String, String>> _categories = [
    {'name': 'All Games', 'icon': '🎮'},
    {'name': 'Puzzle Games', 'icon': '🧩'},
    {'name': 'Arcade Games', 'icon': '🕹️'},
    {'name': 'Racing Games', 'icon': '🏎️'},
    {'name': 'Sports Games', 'icon': '⚽'},
    {'name': 'Brain Games', 'icon': '🧠'},
    {'name': 'Adventure Games', 'icon': '🗺️'},
    {'name': 'Casual Games', 'icon': '🎯'},
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  LinearGradient _getCardGradient(String slug) {
    switch (slug) {
      case '2048':
        return const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFD97706)]);
      case 'snake':
        return const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF047857)]);
      case 'brick-breaker':
        return const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF4338CA)]);
      case 'tic-tac-toe':
        return const LinearGradient(colors: [Color(0xFF06B6D4), Color(0xFF0284C7)]);
      case 'memory-match':
        return const LinearGradient(colors: [Color(0xFFA855F7), Color(0xFF7E22CE)]);
      case 'flappy-bug':
        return const LinearGradient(colors: [Color(0xFF0EA5E9), Color(0xFF059669)]);
      default:
        return const LinearGradient(colors: [AppColors.primary, AppColors.secondary]);
    }
  }

  String _getGameIcon(String slug) {
    switch (slug) {
      case '2048':
        return '🔢';
      case 'snake':
        return '🐍';
      case 'brick-breaker':
        return '🧱';
      case 'tic-tac-toe':
        return '❌';
      case 'memory-match':
        return '💎';
      case 'flappy-bug':
        return '🐞';
      default:
        return '🎮';
    }
  }

  @override
  Widget build(BuildContext context) {
    final gamesAsync = ref.watch(gamesListProvider);
    final selectedCategory = ref.watch(selectedGameCategoryProvider);
        final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.sports_esports_rounded, color: AppColors.primary, size: 24),
            const SizedBox(width: 8),
            const Text('Mini Games Arcade', style: TextStyle(fontWeight: FontWeight.w900)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: () => ref.refresh(gamesListProvider),
          ),
        ],
      ),
      body: gamesAsync.when(
        loading: () => const LoadingStateWidget(message: 'Loading Arcade Hub...'),
        error: (err, _) => ErrorStateWidget(
          message: err.toString(),
          onRetry: () => ref.refresh(gamesListProvider),
        ),
        data: (games) {
          final featuredGame = games.isNotEmpty
              ? games.firstWhere((g) => g.isFeatured, orElse: () => games.first)
              : null;

          return RefreshIndicator(
            onRefresh: () async => ref.refresh(gamesListProvider.future),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Arcade Hero Banner & Spotlight
                  if (featuredGame != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.25),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.amber.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.local_fire_department_rounded, size: 14, color: Colors.amber),
                                    SizedBox(width: 4),
                                    Text(
                                      'DAILY SPOTLIGHT',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w900,
                                        color: Colors.amber,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  const Icon(Icons.star_rounded, size: 16, color: Colors.amber),
                                  const SizedBox(width: 2),
                                  Text(
                                    '${featuredGame.rating}',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Container(
                                width: 56,
                                height: 56,
                                decoration: BoxDecoration(
                                  gradient: _getCardGradient(featuredGame.slug),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Center(
                                  child: Text(_getGameIcon(featuredGame.slug), style: const TextStyle(fontSize: 28)),
                                ),
                              ),
                              const SizedBox(width: 14),
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
                                      featuredGame.category,
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
                              onPressed: () => context.push('/games/${featuredGame.slug}'),
                              icon: const Icon(Icons.play_arrow_rounded, size: 18),
                              label: const Text('QUICK PLAY', style: TextStyle(fontWeight: FontWeight.w900)),
                              style: FilledButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                foregroundColor: Colors.black,
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
                      hintText: 'Search mini games...',
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

                  // 3. Category Filter Chips
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
                  const SizedBox(height: 18),

                  // 4. Games Section Title
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

                  // 5. Games Grid
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
                          onTap: () => context.push('/games/${game.slug}'),
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Theme.of(context).cardColor,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: Theme.of(context).dividerColor.withValues(alpha: 0.15),
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Thumbnail Graphic
                                Container(
                                  height: 96,
                                  width: double.infinity,
                                  decoration: BoxDecoration(
                                    gradient: _getCardGradient(game.slug),
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                                  ),
                                  child: Stack(
                                    children: [
                                      Center(
                                        child: Text(_getGameIcon(game.slug), style: const TextStyle(fontSize: 42)),
                                      ),
                                      if (game.badge.isNotEmpty)
                                        Positioned(
                                          top: 8,
                                          left: 8,
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: Colors.black.withValues(alpha: 0.55),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Text(
                                              game.badge,
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 9,
                                                fontWeight: FontWeight.w900,
                                              ),
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),

                                // Content
                                Padding(
                                  padding: const EdgeInsets.all(10.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        game.title,
                                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        game.category.replaceAll(' Games', ''),
                                        style: const TextStyle(fontSize: 10, color: Colors.grey),
                                        maxLines: 1,
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Row(
                                            children: [
                                              const Icon(Icons.star_rounded, size: 13, color: Colors.amber),
                                              const SizedBox(width: 2),
                                              Text(
                                                '${game.rating}',
                                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                              ),
                                            ],
                                          ),
                                          Text(
                                            '${game.playsCount} plays',
                                            style: const TextStyle(fontSize: 10, color: Colors.grey),
                                          ),
                                        ],
                                      ),
                                    ],
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
    );
  }
}
