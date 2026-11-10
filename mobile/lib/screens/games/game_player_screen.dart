import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/app_colors.dart';
import '../../../models/game_model.dart';
import '../../../providers/game_provider.dart';
import '../../../services/notification_service.dart';

// Engines
import 'engines/flutter_code_puzzle.dart';
import 'engines/flutter_find_the_bug.dart';
import 'engines/flutter_output_predictor.dart';
import 'engines/flutter_speed_typing.dart';
import 'engines/flutter_word_rain.dart';
import 'engines/flutter_memory_match.dart';
import 'engines/flutter_2048.dart';
import 'engines/flutter_snake.dart';
import 'engines/flutter_tic_tac_toe.dart';
import 'engines/flutter_flappy_bug.dart';
import 'engines/flutter_brick_breaker.dart';

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
    final defaultTech = (widget.slug.startsWith('csharp-') || widget.slug.endsWith('-csharp')) ? 'csharp' : 'all';
    _selectedTechnology = widget.initialTechnology ?? defaultTech;
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

    final key = Key('${_engineKey}_${_selectedTechnology}_$_selectedDifficulty');

    switch (widget.slug) {
      // Coding Games
      case 'code-puzzle':
      case 'code-scramble':
      case 'csharp-code-puzzle':
      case 'csharp-code-scramble':
        return FlutterCodePuzzle(
          key: key,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
          isMuted: _isMuted,
        );
      case 'find-the-bug':
      case 'sql-challenge':
      case 'find-the-bug-csharp':
        return FlutterFindTheBug(
          key: key,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'output-predictor':
      case 'missing-code':
      case 'logic-builder':
      case 'csharp-output-predictor':
      case 'csharp-missing-code':
      case 'csharp-logic-builder':
      case 'csharp-oop-challenge':
      case 'csharp-collections-challenge':
      case 'csharp-linq-challenge':
      case 'csharp-exception-handling':
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
      case 'csharp-speed-typing':
      case 'csharp-syntax-typing':
      case 'csharp-code-typing':
      case 'csharp-accuracy-challenge':
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
      case '2048':
        return Flutter2048(
          key: key,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'snake':
        return FlutterSnake(
          key: key,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'tic-tac-toe':
        return FlutterTicTacToe(
          key: key,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'flappy-bug':
        return FlutterFlappyBug(
          key: key,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      case 'brick-breaker':
        return FlutterBrickBreaker(
          key: key,
          onGameOver: commonProps.onGameOver,
          onScoreUpdate: commonProps.onScoreUpdate,
          isPaused: commonProps.isPaused,
        );
      default:
        return const Center(child: Text('Game challenge ready!'));
    }
  }

  Widget _buildAppBarAction({
    required IconData icon,
    required String tooltip,
    required VoidCallback onPressed,
    Color? color,
  }) {
    return IconButton(
      icon: Icon(icon, size: 20, color: color),
      tooltip: tooltip,
      onPressed: onPressed,
      visualDensity: VisualDensity.compact,
      padding: const EdgeInsets.all(6),
      constraints: const BoxConstraints(minWidth: 34, minHeight: 34),
    );
  }

  @override
  Widget build(BuildContext context) {
    final gameAsync = ref.watch(gameDetailProvider(widget.slug));
    final technologiesAsync = ref.watch(gameTechnologiesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: context.scaffoldBgColor,
      appBar: AppBar(
        titleSpacing: 0,
        title: gameAsync.when(
          data: (game) => Text(
            game?.title ?? 'Mini Game',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          loading: () => const Text(
            'Loading...',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
          ),
          error: (_, _) => const Text(
            'Mini Game',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
          ),
        ),
        actions: [
          _buildAppBarAction(
            icon: _isMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
            tooltip: _isMuted ? 'Unmute Sound' : 'Mute Sound',
            onPressed: _toggleSound,
          ),
          _buildAppBarAction(
            icon: _isFullscreen
                ? Icons.fullscreen_exit_rounded
                : Icons.fullscreen_rounded,
            tooltip: _isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
            onPressed: _toggleFullscreen,
          ),
          _buildAppBarAction(
            icon: _isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
            tooltip: 'Favorite',
            color: _isFavorite ? Colors.redAccent : null,
            onPressed: () async {
              final newFav = await ref
                  .read(gameRepositoryProvider)
                  .toggleFavorite(widget.slug);
              if (mounted) {
                setState(() => _isFavorite = newFav);
                if (newFav) {
                  AppNotificationService.success(
                    title: 'Added to favorites',
                    message: 'Saved to your favorite games list.',
                  );
                } else {
                  AppNotificationService.info(
                    title: 'Removed from favorites',
                    message: 'Game removed from your favorites list.',
                  );
                }
              }
            },
          ),
          gameAsync.maybeWhen(
            data: (game) => game != null
                ? _buildAppBarAction(
                    icon: Icons.info_outline_rounded,
                    tooltip: 'How to Play',
                    onPressed: () => _showInstructions(game),
                  )
                : const SizedBox.shrink(),
            orElse: () => const SizedBox.shrink(),
          ),
          _buildAppBarAction(
            icon: Icons.refresh_rounded,
            tooltip: 'Restart Game',
            onPressed: _restartGame,
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Unified Compact HUD Bar: Score, Best & Pause Control
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              decoration: BoxDecoration(
                color: context.cardBgColor,
                border: Border(
                  top: BorderSide(color: context.borderColor, width: 0.8),
                  bottom: BorderSide(color: context.borderColor, width: 0.8),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: context.mutedBgColor,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: context.borderColor),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'SCORE',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                              color: context.textSecondaryColor,
                            ),
                          ),
                          Text(
                            '$_currentScore',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF10B981),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: context.mutedBgColor,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: context.borderColor),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'BEST',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                              color: context.textSecondaryColor,
                            ),
                          ),
                          Text(
                            '$_personalBest',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: AppColors.gameBestScore,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Material(
                    color: _isPaused
                        ? AppColors.gameScore.withValues(alpha: 0.18)
                        : AppColors.accent.withValues(alpha: isDark ? 0.22 : 0.16),
                    borderRadius: BorderRadius.circular(12),
                    child: InkWell(
                      onTap: () => setState(() => _isPaused = !_isPaused),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 7,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _isPaused
                                ? AppColors.gameScore.withValues(alpha: 0.5)
                                : AppColors.accent.withValues(alpha: 0.5),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              _isPaused
                                  ? Icons.play_arrow_rounded
                                  : Icons.pause_rounded,
                              size: 18,
                              color: _isPaused
                                  ? AppColors.gameScore
                                  : (isDark ? AppColors.accentLight : AppColors.accentHover),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _isPaused ? 'Resume' : 'Pause',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: _isPaused
                                    ? AppColors.gameScore
                                    : (isDark ? AppColors.accentLight : AppColors.accentHover),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Technology & Difficulty Control Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF141D19) : AppColors.backgroundAlt,
                border: Border(
                  bottom: BorderSide(color: context.borderColor, width: 0.8),
                ),
              ),
              child: Row(
                children: [
                  // Technology Selector
                  technologiesAsync.when(
                    data: (techs) {
                      final activeTechName = techs
                              .where((t) => t.slug == _selectedTechnology)
                              .firstOrNull
                              ?.name ??
                          (_selectedTechnology == 'all'
                              ? 'All Techs'
                              : _selectedTechnology.toUpperCase());

                      return Expanded(
                        child: Row(
                          children: [
                            Icon(
                              Icons.code_rounded,
                              size: 15,
                              color: context.brandAccentColor,
                            ),
                            const SizedBox(width: 6),
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
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 5,
                                  ),
                                  decoration: BoxDecoration(
                                    color: context.cardBgColor,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: context.borderColor),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          activeTechName,
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            color: context.textPrimaryColor,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      Icon(
                                        Icons.keyboard_arrow_down_rounded,
                                        size: 16,
                                        color: context.textSecondaryColor,
                                      ),
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
                                            Expanded(child: Text(t.name)),
                                            const SizedBox(width: 8),
                                            Text(
                                              t.categorySlug,
                                              style: const TextStyle(
                                                fontSize: 10,
                                                color: Colors.grey,
                                              ),
                                            ),
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
                    loading: () => const Expanded(
                      child: SizedBox(
                        height: 2,
                        child: LinearProgressIndicator(),
                      ),
                    ),
                    error: (_, _) => Expanded(
                      child: Text(
                        'General Tech',
                        style: TextStyle(
                          fontSize: 11,
                          color: context.textSecondaryColor,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(width: 10),

                  // Difficulty Selector
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.tune_rounded,
                        size: 15,
                        color: context.brandAccentColor,
                      ),
                      const SizedBox(width: 6),
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
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: context.cardBgColor,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: context.borderColor),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _selectedDifficulty,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: context.textPrimaryColor,
                                ),
                              ),
                              const SizedBox(width: 2),
                              Icon(
                                Icons.keyboard_arrow_down_rounded,
                                size: 16,
                                color: context.textSecondaryColor,
                              ),
                            ],
                          ),
                        ),
                        itemBuilder: (ctx) => _difficulties
                            .map((d) => PopupMenuItem(
                                  value: d,
                                  child: Text(d),
                                ))
                            .toList(),
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
                color: Colors.amber.withValues(alpha: 0.18),
                alignment: Alignment.center,
                child: const Text(
                  'PAUSED — Tap Resume to continue',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: Colors.amber,
                  ),
                ),
              ),

            // Game Engine Viewport
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12.0,
                  vertical: 8.0,
                ),
                child: _buildEngine(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
