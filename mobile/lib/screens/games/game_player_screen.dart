import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../models/game_model.dart';
import '../../../providers/game_provider.dart';

// Engines
import 'engines/flutter_code_puzzle.dart';
import 'engines/flutter_find_the_bug.dart';
import 'engines/flutter_output_predictor.dart';
import 'engines/flutter_speed_typing.dart';
import 'engines/flutter_word_rain.dart';
import 'engines/flutter_memory_match.dart';

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
            const Text(
              'Challenge Complete!',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Text('FINAL SCORE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                  const SizedBox(height: 2),
                  Text(
                    '$finalScore pts',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF10B981)),
                  ),
                  if (isNewHigh) ...[
                    const SizedBox(height: 4),
                    const Text('⭐ New Personal Best! ⭐', style: TextStyle(fontSize: 11, color: Colors.amber, fontWeight: FontWeight.bold)),
                  ],
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.pop();
            },
            child: const Text('All Games'),
          ),
          FilledButton.icon(
            onPressed: () {
              Navigator.pop(ctx);
              _restartGame();
            },
            icon: const Icon(Icons.replay_rounded, size: 16),
            label: const Text('Play Again'),
          ),
        ],
      ),
    );
  }

  void _restartGame() {
    setState(() {
      _currentScore = 0;
      _isPaused = false;
      _engineKey = UniqueKey();
    });
  }

  void _showInstructions(GameModel game) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
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
      // Coding Games
      case 'code-puzzle':
      case 'code-scramble':
        return FlutterCodePuzzle(
          key: _engineKey,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'find-the-bug':
      case 'sql-challenge':
        return FlutterFindTheBug(
          key: _engineKey,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'output-predictor':
      case 'missing-code':
      case 'logic-builder':
        return FlutterOutputPredictor(
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

      // Typing Games
      case 'speed-typing':
      case 'code-typing':
      case 'sixty-second-challenge':
      case 'error-free-typing':
      case 'syntax-typing':
        return FlutterSpeedTyping(
          key: _engineKey,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'word-rain':
        return FlutterWordRain(
          key: _engineKey,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      default:
        return const Center(child: Text('Game challenge ready!'));
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
          // Favorite
          IconButton(
            icon: Icon(
              _isFavorite ? Icons.favorite : Icons.favorite_border,
              color: _isFavorite ? Colors.red : null,
            ),
            onPressed: () async {
              final newFav = await ref.read(gameRepositoryProvider).toggleFavorite(widget.slug);
              setState(() => _isFavorite = newFav);
            },
          ),
          // Instructions
          gameAsync.maybeWhen(
            data: (game) => game != null
                ? IconButton(
                    icon: const Icon(Icons.info_outline_rounded),
                    onPressed: () => _showInstructions(game),
                  )
                : const SizedBox.shrink(),
            orElse: () => const SizedBox.shrink(),
          ),
          // Restart
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _restartGame,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Top HUD Bar: Score & Best
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              color: Theme.of(context).cardColor,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      const Text('SCORE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                      Text(
                        '$_currentScore',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF10B981)),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      const Text('BEST', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                      Text(
                        '$_personalBest',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.amber),
                      ),
                    ],
                  ),
                  IconButton.filledTonal(
                    icon: Icon(_isPaused ? Icons.play_arrow_rounded : Icons.pause_rounded),
                    onPressed: () => setState(() => _isPaused = !_isPaused),
                  ),
                ],
              ),
            ),

            if (_isPaused)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 6),
                color: Colors.amber.withValues(alpha: 0.2),
                alignment: Alignment.center,
                child: const Text(
                  'PAUSED - Tap Play to continue',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.amber),
                ),
              ),

            // Game Engine Viewport
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: _buildEngine(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
