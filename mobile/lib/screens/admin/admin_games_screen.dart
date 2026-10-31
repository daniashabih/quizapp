import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../providers/game_provider.dart';
import '../../../widgets/empty_state_widget.dart';
import '../../../widgets/error_state_widget.dart';
import '../../../widgets/loading_state_widget.dart';

class AdminGamesScreen extends ConsumerStatefulWidget {
  const AdminGamesScreen({super.key});

  @override
  ConsumerState<AdminGamesScreen> createState() => _AdminGamesScreenState();
}

class _AdminGamesScreenState extends ConsumerState<AdminGamesScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _search = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gamesAsync = ref.watch(adminGamesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Mini Games'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: () => ref.refresh(adminGamesProvider),
          ),
        ],
      ),
      body: gamesAsync.when(
        loading: () => const LoadingStateWidget(message: 'Loading Games Bank...'),
        error: (err, _) => ErrorStateWidget(
          message: err.toString(),
          onRetry: () => ref.refresh(adminGamesProvider),
        ),
        data: (games) {
          final filtered = games.where((g) {
            if (_search.isEmpty) return true;
            final q = _search.toLowerCase();
            return g.title.toLowerCase().contains(q) || g.category.toLowerCase().contains(q);
          }).toList();

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search games...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    filled: true,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onChanged: (val) => setState(() => _search = val),
                ),
              ),
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
                                        Text(game.category, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                                        const SizedBox(height: 4),
                                        Text('${game.playsCount} plays', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                                      ],
                                    ),
                                  ),
                                  // Toggle feature
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
                                    },
                                  ),
                                  // Toggle publish
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
      ),
    );
  }
}
