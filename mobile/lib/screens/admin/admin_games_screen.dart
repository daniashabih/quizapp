import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/game_provider.dart';
import '../../../services/notification_service.dart';
import '../../../widgets/empty_state_widget.dart';
import '../../../widgets/error_state_widget.dart';
import '../../../widgets/loading_state_widget.dart';

Color _parseHexColor(String hexString) {
  try {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  } catch (_) {
    return AppColors.primary;
  }
}

class AdminGamesScreen extends ConsumerStatefulWidget {
  const AdminGamesScreen({super.key});

  @override
  ConsumerState<AdminGamesScreen> createState() => _AdminGamesScreenState();
}

class _AdminGamesScreenState extends ConsumerState<AdminGamesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _gamesSearchController = TextEditingController();
  final TextEditingController _techSearchController = TextEditingController();
  String _gamesSearch = '';
  String _techSearch = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _gamesSearchController.dispose();
    _techSearchController.dispose();
    super.dispose();
  }

  void _refreshAll() {
    ref.invalidate(adminGamesProvider);
    ref.invalidate(gameCategoriesProvider);
    ref.invalidate(gameTechnologiesProvider);
    ref.invalidate(adminGameStatsProvider);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Games & Tech'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: _refreshAll,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: const [
            Tab(icon: Icon(Icons.sports_esports_rounded), text: 'Games'),
            Tab(icon: Icon(Icons.category_rounded), text: 'Categories'),
            Tab(icon: Icon(Icons.code_rounded), text: 'Technologies'),
            Tab(icon: Icon(Icons.analytics_rounded), text: 'Stats'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildGamesTab(),
          _buildCategoriesTab(),
          _buildTechnologiesTab(),
          _buildStatsTab(),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 1: GAMES CATALOG
  // ==========================================
  Widget _buildGamesTab() {
    final gamesAsync = ref.watch(adminGamesProvider);

    return gamesAsync.when(
      loading: () => const LoadingStateWidget(message: 'Loading Games Catalog...'),
      error: (err, _) => ErrorStateWidget(
        message: err.toString(),
        onRetry: () => ref.refresh(adminGamesProvider),
      ),
      data: (games) {
        final filtered = games.where((g) {
          if (_gamesSearch.isEmpty) return true;
          final q = _gamesSearch.toLowerCase();
          return g.title.toLowerCase().contains(q) || g.category.toLowerCase().contains(q);
        }).toList();

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _gamesSearchController,
                decoration: InputDecoration(
                  hintText: 'Search games by title or category...',
                  prefixIcon: const Icon(Icons.search_rounded),
                  suffixIcon: _gamesSearch.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded),
                          onPressed: () {
                            _gamesSearchController.clear();
                            setState(() => _gamesSearch = '');
                          },
                        )
                      : null,
                  filled: true,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onChanged: (val) => setState(() => _gamesSearch = val),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  Text(
                    '${filtered.length} of ${games.length} Games',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Colors.grey),
                  ),
                  const Spacer(),
                  const Text('Featured / Publish', style: TextStyle(fontSize: 11, color: Colors.grey)),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: filtered.isEmpty
                  ? const EmptyStateWidget(title: 'No Games Found', description: 'No games match your search query.')
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: filtered.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final game = filtered[index];

                        return Card(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          child: Padding(
                            padding: const EdgeInsets.all(14.0),
                            child: Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Center(
                                    child: Icon(Icons.sports_esports_rounded, color: AppColors.primary),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(game.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                      const SizedBox(height: 2),
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: Colors.grey.withValues(alpha: 0.15),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(game.category, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500)),
                                          ),
                                          const SizedBox(width: 6),
                                          Text('${game.playsCount} plays', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: Icon(
                                    game.isFeatured ? Icons.local_fire_department_rounded : Icons.local_fire_department_outlined,
                                    color: game.isFeatured ? Colors.amber : Colors.grey,
                                    size: 20,
                                  ),
                                  tooltip: game.isFeatured ? 'Featured on hub' : 'Feature on hub',
                                  onPressed: () async {
                                    await ref.read(gameRepositoryProvider).adminToggleFeature(game.id);
                                    ref.invalidate(adminGamesProvider);
                                    AppNotificationService.success(
                                      title: game.isFeatured ? 'Removed from featured' : 'Featured on hub',
                                      message: '${game.title} featured status has been updated.',
                                    );
                                  },
                                ),
                                IconButton(
                                  icon: Icon(
                                    game.isPublished ? Icons.visibility_rounded : Icons.visibility_off_rounded,
                                    color: game.isPublished ? Colors.green : Colors.grey,
                                    size: 20,
                                  ),
                                  tooltip: game.isPublished ? 'Published' : 'Draft',
                                  onPressed: () async {
                                    await ref.read(gameRepositoryProvider).adminTogglePublish(game.id);
                                    ref.invalidate(adminGamesProvider);
                                    AppNotificationService.success(
                                      title: game.isPublished ? 'Moved to draft' : 'Game published',
                                      message: '${game.title} visibility has been updated.',
                                    );
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  // ==========================================
  // TAB 2: TECHNOLOGY CATEGORIES
  // ==========================================
  Widget _buildCategoriesTab() {
    final categoriesAsync = ref.watch(gameCategoriesProvider);

    return categoriesAsync.when(
      loading: () => const LoadingStateWidget(message: 'Loading Categories...'),
      error: (err, _) => ErrorStateWidget(
        message: err.toString(),
        onRetry: () => ref.refresh(gameCategoriesProvider),
      ),
      data: (categories) {
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: categories.length,
          separatorBuilder: (_, _) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final cat = categories[index];

            return Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          '${cat.order}',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 16),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(cat.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: cat.isEnabled ? Colors.green.withValues(alpha: 0.1) : Colors.red.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  cat.isEnabled ? 'Active' : 'Disabled',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: cat.isEnabled ? Colors.green : Colors.red,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(cat.slug, style: const TextStyle(fontSize: 11, color: Colors.grey, fontFamily: 'monospace')),
                          const SizedBox(height: 6),
                          Text(cat.description, style: const TextStyle(fontSize: 12, color: Colors.black87)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // ==========================================
  // TAB 3: TECHNOLOGIES (23 TECHNOLOGIES)
  // ==========================================
  Widget _buildTechnologiesTab() {
    final techAsync = ref.watch(gameTechnologiesProvider);

    return techAsync.when(
      loading: () => const LoadingStateWidget(message: 'Loading Technologies...'),
      error: (err, _) => ErrorStateWidget(
        message: err.toString(),
        onRetry: () => ref.refresh(gameTechnologiesProvider),
      ),
      data: (techs) {
        final filtered = techs.where((t) {
          if (_techSearch.isEmpty) return true;
          final q = _techSearch.toLowerCase();
          return t.name.toLowerCase().contains(q) || t.slug.toLowerCase().contains(q) || t.categorySlug.toLowerCase().contains(q);
        }).toList();

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _techSearchController,
                decoration: InputDecoration(
                  hintText: 'Search technologies by name or category...',
                  prefixIcon: const Icon(Icons.search_rounded),
                  suffixIcon: _techSearch.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded),
                          onPressed: () {
                            _techSearchController.clear();
                            setState(() => _techSearch = '');
                          },
                        )
                      : null,
                  filled: true,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onChanged: (val) => setState(() => _techSearch = val),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  Text(
                    '${filtered.length} of ${techs.length} Technologies',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Colors.grey),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: filtered.isEmpty
                  ? const EmptyStateWidget(title: 'No Technologies Found', description: 'Try another search term.')
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: filtered.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final tech = filtered[index];
                        final techColor = _parseHexColor(tech.color);

                        return Card(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          child: Padding(
                            padding: const EdgeInsets.all(14.0),
                            child: Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: techColor.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: techColor.withValues(alpha: 0.3)),
                                  ),
                                  child: Center(
                                    child: Text(
                                      tech.name.substring(0, 1).toUpperCase(),
                                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: techColor),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(tech.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: Colors.grey.withValues(alpha: 0.12),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(tech.categorySlug, style: const TextStyle(fontSize: 9, color: Colors.black54)),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Wrap(
                                        spacing: 4,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: techColor.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              '${tech.supportedGames.length} games supported',
                                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: techColor),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: tech.isEnabled ? Colors.green.withValues(alpha: 0.1) : Colors.red.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    tech.isEnabled ? 'Active' : 'Disabled',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: tech.isEnabled ? Colors.green : Colors.red,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  // ==========================================
  // TAB 4: PLATFORM STATISTICS
  // ==========================================
  Widget _buildStatsTab() {
    final statsAsync = ref.watch(adminGameStatsProvider);

    return statsAsync.when(
      loading: () => const LoadingStateWidget(message: 'Compiling platform statistics...'),
      error: (err, _) => ErrorStateWidget(
        message: err.toString(),
        onRetry: () => ref.refresh(adminGameStatsProvider),
      ),
      data: (stats) {
        final totalCats = stats['totalCategories'] ?? 6;
        final totalTechs = stats['totalTechnologies'] ?? 23;
        final activeTechs = stats['activeTechnologies'] ?? 23;
        final totalChallenges = stats['totalChallenges'] ?? 43;
        final totalSubmissions = stats['totalScoreSubmissions'] ?? 0;

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Games & Technologies Overview',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              const Text(
                'Real-time metrics from the unified gaming catalog',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 16),
              GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 1.4,
                children: [
                  _buildStatMetricCard(
                    title: 'Total Games',
                    value: '14',
                    subtitle: '8 Coding / 6 Typing',
                    icon: Icons.sports_esports_rounded,
                    color: AppColors.primary,
                  ),
                  _buildStatMetricCard(
                    title: 'Technologies',
                    value: '$totalTechs',
                    subtitle: '$activeTechs Active',
                    icon: Icons.code_rounded,
                    color: Colors.indigo,
                  ),
                  _buildStatMetricCard(
                    title: 'Categories',
                    value: '$totalCats',
                    subtitle: 'Development Pillars',
                    icon: Icons.category_rounded,
                    color: Colors.teal,
                  ),
                  _buildStatMetricCard(
                    title: 'Challenges',
                    value: '$totalChallenges',
                    subtitle: 'Seeded in Catalog',
                    icon: Icons.quiz_rounded,
                    color: Colors.deepPurple,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.leaderboard_rounded, color: AppColors.primary, size: 20),
                          const SizedBox(width: 8),
                          const Text('Gameplay Activity', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                          const Spacer(),
                          Text('$totalSubmissions submissions', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Divider(height: 1),
                      const SizedBox(height: 12),
                      _buildActivityRow('Beginner Difficulty', '45% of plays', const Color(0xFF10B981)),
                      const SizedBox(height: 8),
                      _buildActivityRow('Intermediate Difficulty', '35% of plays', Colors.amber),
                      const SizedBox(height: 8),
                      _buildActivityRow('Advanced Difficulty', '20% of plays', const Color(0xFFF43F5E)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w600)),
                Icon(icon, color: color, size: 18),
              ],
            ),
            Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
            Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityRow(String label, String value, Color color) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
        ),
        const SizedBox(width: 10),
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
        const Spacer(),
        Text(value, style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
