import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../models/game_model.dart';
import '../../../providers/game_provider.dart';
import 'engines/flutter_2048.dart';
import 'engines/flutter_brick_breaker.dart';
import 'engines/flutter_flappy_bug.dart';
import 'engines/flutter_memory_match.dart';
import 'engines/flutter_snake.dart';
import 'engines/flutter_tic_tac_toe.dart';

class GamePlayerScreen extends ConsumerStatefulWidget {
  final String slug;

  const GamePlayerScreen({super.key, required this.slug});

  @override
  ConsumerState<GamePlayerScreen> createState() => _GamePlayerScreenState();
}

class _GamePlayerScreenState extends ConsumerState<GamePlayerScreen> {
  int _currentScore = 0;
  int _personalBest = 0;
  bool _isPaused = false;
  bool _isFavorite = false;
  Key _engineKey = UniqueKey();

  @override
  void initState() {
    super.initState();
  }

  void _onScoreUpdate(int newScore) {
    setState(() {
      _currentScore = newScore;
    });
  }

  void _onGameOver(int finalScore, Map<String, dynamic> metadata) async {
    final isNewHigh = finalScore > _personalBest;
    if (isNewHigh) {
      setState(() {
        _personalBest = finalScore;
      });
    }

    // Submit score
    ref.read(gameRepositoryProvider).submitScore(
      widget.slug,
      finalScore,
      metadata: metadata,
    );

    if (!mounted) return;

    // Show Game Over Dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Column(
          children: [
            Icon(
              isNewHigh ? Icons.emoji_events_rounded : Icons.sports_esports_rounded,
              color: isNewHigh ? Colors.amber : Colors.green,
              size: 44,
            ),
            const SizedBox(height: 8),
            Text(
              isNewHigh ? 'New Personal Best! 🎉' : 'Game Finished',
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Text('Final Score', style: TextStyle(fontSize: 11, color: Colors.grey)),
                  Text(
                    '$finalScore',
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.green),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Personal Best: $_personalBest',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        actionsAlignment: MainAxisAlignment.center,
        actions: [
          OutlinedButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.pop();
            },
            child: const Text('Exit'),
          ),
          FilledButton.icon(
            onPressed: () {
              Navigator.pop(ctx);
              _restart();
            },
            icon: const Icon(Icons.refresh_rounded, size: 16),
            label: const Text('Play Again'),
          ),
        ],
      ),
    );
  }

  void _restart() {
    setState(() {
      _currentScore = 0;
      _isPaused = false;
      _engineKey = UniqueKey();
    });
  }

  void _showInstructions(GameModel game) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.info_outline_rounded, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  '${game.title} Instructions',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              game.instructions.isNotEmpty ? game.instructions : game.description,
              style: const TextStyle(fontSize: 13, height: 1.5),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text("Got It, Let's Play!"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEngine() {
    final commonProps = (
      onGameOver: _onGameOver,
      onScoreUpdate: _onScoreUpdate,
      isPaused: _isPaused,
    );

    switch (widget.slug) {
      case '2048':
        return Flutter2048(
          key: _engineKey,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'snake':
        return FlutterSnake(
          key: _engineKey,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'brick-breaker':
        return FlutterBrickBreaker(
          key: _engineKey,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'tic-tac-toe':
        return FlutterTicTacToe(
          key: _engineKey,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'memory-match':
        return FlutterMemoryMatch(
          key: _engineKey,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'flappy-bug':
        return FlutterFlappyBug(
          key: _engineKey,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      default:
        return const Center(child: Text('Game engine coming soon!'));
    }
  }

  @override
  Widget build(BuildContext context) {
    final gameAsync = ref.watch(gameDetailProvider(widget.slug));

    return Scaffold(
      appBar: AppBar(
        title: gameAsync.when(
          data: (game) => Text(game?.title ?? 'Mini Game'),
          loading: () => const Text('Loading...'),
          error: (_, _) => const Text('Mini Game'),
        ),
        actions: [
          IconButton(
            icon: Icon(_isPaused ? Icons.play_arrow_rounded : Icons.pause_rounded),
            tooltip: _isPaused ? 'Resume' : 'Pause',
            onPressed: () => setState(() => _isPaused = !_isPaused),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Restart',
            onPressed: _restart,
          ),
          gameAsync.maybeWhen(
            data: (game) => game != null
                ? IconButton(
                    icon: const Icon(Icons.info_outline_rounded),
                    tooltip: 'Instructions',
                    onPressed: () => _showInstructions(game),
                  )
                : const SizedBox.shrink(),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: gameAsync.when(
        data: (game) {
          if (game != null && _personalBest == 0 && game.userHighScore > 0) {
            _personalBest = game.userHighScore;
            _isFavorite = game.isFavorite;
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                // Top Score Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Theme.of(context).cardColor,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: Theme.of(context).dividerColor.withValues(alpha: 0.15),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.sports_esports_rounded, size: 16, color: Colors.green),
                          const SizedBox(width: 6),
                          Text(
                            'Score: $_currentScore',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          const Icon(Icons.emoji_events_rounded, size: 16, color: Colors.amber),
                          const SizedBox(width: 4),
                          Text(
                            'Best: $_personalBest',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 8),
                          InkWell(
                            onTap: () async {
                              final fav = await ref.read(gameRepositoryProvider).toggleFavorite(widget.slug);
                              setState(() {
                                _isFavorite = fav;
                              });
                            },
                            child: Icon(
                              _isFavorite ? Icons.favorite_rounded : Icons.favorite_outline_rounded,
                              size: 18,
                              color: _isFavorite ? Colors.red : Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Active Engine Container
                _buildEngine(),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading game: $err')),
      ),
    );
  }
}
