import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
  final String? initialTechnology;
  final String? initialDifficulty;

  const GamePlayerScreen({
    super.key,
    required this.slug,
    this.initialTechnology,
    this.initialDifficulty,
  });

  @override
  ConsumerState<GamePlayerScreen> createState() => _GamePlayerScreenState();
}

class _GamePlayerScreenState extends ConsumerState<GamePlayerScreen> {
  int _currentScore = 0;
  int _personalBest = 0;
  bool _isPaused = false;
  bool _isFavorite = false;
  bool _isMuted = false;
  bool _isFullscreen = false;
  Key _engineKey = UniqueKey();
  late String _selectedTechnology;
  late String _selectedDifficulty;

  static const List<String> _difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

  @override
  void initState() {
    super.initState();
    _selectedTechnology = widget.initialTechnology ?? 'all';
    _selectedDifficulty = widget.initialDifficulty ?? 'All Levels';
    _loadSettings();
  }

  void _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        _isMuted = prefs.getBool('hangbug_game_sound_muted') ?? false;
      });
    }
  }

  void _toggleSound() async {
    final newMuted = !_isMuted;
    setState(() => _isMuted = newMuted);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('hangbug_game_sound_muted', newMuted);
  }

  void _toggleFullscreen() {
    setState(() => _isFullscreen = !_isFullscreen);
    if (_isFullscreen) {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    } else {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    }
  }

  @override
  void dispose() {
    if (_isFullscreen) {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    }
    super.dispose();
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

    // Submit score with technology and difficulty
    ref.read(gameRepositoryProvider).submitScore(
      widget.slug,
      finalScore,
      technology: _selectedTechnology,
      difficulty: _selectedDifficulty,
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
                  if (_selectedTechnology != 'all') ...[
                    const SizedBox(height: 4),
                    Text(
                      'Technology: ${_selectedTechnology.toUpperCase()} • $_selectedDifficulty',
                      style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                    ),
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
            label: const Text('Play Again', style: TextStyle(fontWeight: FontWeight.w900)),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.gamePrimaryButton,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
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
    ref.read(gameRepositoryProvider).clearProgress(widget.slug);
  }

  void _showInstructions(GameModel game) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.help_outline_rounded, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  'How to Play ${game.title}',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              game.instructions.isNotEmpty ? game.instructions : game.description,
              style: const TextStyle(fontSize: 14, height: 1.5),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.pop(ctx),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.gamePrimaryButton,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Got It!'),
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

    final key = Key('${_engineKey}_${_selectedTechnology}_${_selectedDifficulty}');

    switch (widget.slug) {
      // Coding Games
      case 'code-puzzle':
      case 'code-scramble':
        return FlutterCodePuzzle(
          key: key,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
          isMuted: _isMuted,
        );
      case 'find-the-bug':
      case 'sql-challenge':
        return FlutterFindTheBug(
          key: key,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'output-predictor':
      case 'missing-code':
      case 'logic-builder':
        return FlutterOutputPredictor(
          key: key,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'memory-match':
        return FlutterMemoryMatch(
          key: key,
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
          key: key,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'word-rain':
        return FlutterWordRain(
          key: key,
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
    final technologiesAsync = ref.watch(gameTechnologiesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: gameAsync.when(
          data: (game) => Text(game?.title ?? 'Mini Game'),
          loading: () => const Text('Loading...'),
          error: (_, _) => const Text('Mini Game'),
        ),
        actions: [
          // Sound toggle
          IconButton(
            icon: Icon(_isMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded),
            tooltip: _isMuted ? 'Unmute Sound' : 'Mute Sound',
            onPressed: _toggleSound,
          ),
          // Fullscreen toggle
          IconButton(
            icon: Icon(_isFullscreen ? Icons.fullscreen_exit_rounded : Icons.fullscreen_rounded),
            tooltip: _isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
            onPressed: _toggleFullscreen,
          ),
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
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                border: Border(bottom: BorderSide(color: isDark ? Colors.white12 : Colors.black12)),
              ),
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
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.gameBestScore),
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

            // Technology & Difficulty Control Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
              color: isDark ? const Color(0xFF141F1A) : const Color(0xFFF0FDF4),
              child: Row(
                children: [
                  // Technology Selector
                  technologiesAsync.when(
                    data: (techs) {
                      final activeTechName = techs.where((t) => t.slug == _selectedTechnology).firstOrNull?.name ??
                          (_selectedTechnology == 'all' ? 'All Techs' : _selectedTechnology.toUpperCase());

                      return Expanded(
                        child: Row(
                          children: [
                            const Icon(Icons.code_rounded, size: 14, color: AppColors.primary),
                            const SizedBox(width: 4),
                            Expanded(
                              child: PopupMenuButton<String>(
                                initialValue: _selectedTechnology,
                                onSelected: (val) {
                                  setState(() {
                                    _selectedTechnology = val;
                                    _currentScore = 0;
                                    _engineKey = UniqueKey();
                                  });
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Flexible(
                                        child: Text(
                                          activeTechName,
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const Icon(Icons.arrow_drop_down, size: 16),
                                    ],
                                  ),
                                ),
                                itemBuilder: (ctx) => [
                                  const PopupMenuItem(
                                    value: 'all',
                                    child: Text('All Technologies (Default)'),
                                  ),
                                  ...techs.map((t) => PopupMenuItem(
                                    value: t.slug,
                                    child: Row(
                                      children: [
                                        Text(t.name),
                                        const Spacer(),
                                        Text(t.categorySlug, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                                      ],
                                    ),
                                  )),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                    loading: () => const SizedBox(width: 80, child: LinearProgressIndicator()),
                    error: (_, _) => const Text('General Tech', style: TextStyle(fontSize: 11)),
                  ),

                  const SizedBox(width: 8),

                  // Difficulty Selector
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.tune_rounded, size: 14, color: AppColors.primary),
                      const SizedBox(width: 4),
                      PopupMenuButton<String>(
                        initialValue: _selectedDifficulty,
                        onSelected: (val) {
                          setState(() {
                            _selectedDifficulty = val;
                            _currentScore = 0;
                            _engineKey = UniqueKey();
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _selectedDifficulty,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                              const Icon(Icons.arrow_drop_down, size: 16),
                            ],
                          ),
                        ),
                        itemBuilder: (ctx) => _difficulties.map((d) => PopupMenuItem(
                          value: d,
                          child: Text(d),
                        )).toList(),
                      ),
                    ],
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
