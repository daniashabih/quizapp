import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/constants/app_text_styles.dart';
import '../../providers/quiz_provider.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/loading_state_widget.dart';

class QuizScreen extends ConsumerStatefulWidget {
  final String category;
  final int session;

  const QuizScreen({
    super.key,
    required this.category,
    required this.session,
  });

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  bool _isNavigating = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(quizProvider.notifier).startQuiz(
            category: widget.category,
            session: widget.session,
          );
    });
  }

  void _handleNextQuestion() {
    if (_isNavigating) return;
    setState(() => _isNavigating = true);
    ref.read(quizProvider.notifier).nextQuestion();
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) setState(() => _isNavigating = false);
    });
  }

  void _handlePrevQuestion() {
    if (_isNavigating) return;
    setState(() => _isNavigating = true);
    ref.read(quizProvider.notifier).prevQuestion();
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) setState(() => _isNavigating = false);
    });
  }

  void _showQuitConfirmation() {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(AppStrings.quitQuizTitle),
        content: const Text(
          'Your progress has been automatically saved. You can resume this attempt later, or discard it now.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('Resume Quiz'),
          ),
          TextButton(
            style: TextButton.styleFrom(
              foregroundColor: context.brandAccentColor,
            ),
            onPressed: () {
              Navigator.of(dialogCtx).pop();
              context.pop();
            },
            child: const Text('Save & Exit'),
          ),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: context.errorColor),
            onPressed: () async {
              Navigator.of(dialogCtx).pop();
              await ref.read(quizProvider.notifier).discardCurrentAttempt();
              if (mounted) context.pop();
            },
            child: const Text('Discard'),
          ),
        ],
      ),
    );
  }

  void _showSubmitConfirmation(int answered, int total) {
    if (_isSubmitting) return;

    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(AppStrings.submitQuizTitle),
        content: Text(
          'You answered $answered of $total questions.\n\n'
          '${total - answered > 0 ? "⚠️ ${total - answered} question(s) remain unanswered." : "All questions have been evaluated and locked."}',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('Review Answers'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: context.isDarkMode
                  ? AppColors.primaryLight
                  : AppColors.primary,
              foregroundColor: Colors.white,
              minimumSize: const Size(100, 40),
            ),
            onPressed: () async {
              Navigator.of(dialogCtx).pop();
              if (_isSubmitting) return;
              setState(() => _isSubmitting = true);

              final result = await ref.read(quizProvider.notifier).submitQuiz();
              if (mounted) {
                setState(() => _isSubmitting = false);
                if (result != null) {
                  context.go('/quiz/results', extra: result);
                }
              }
            },
            child: const Text('Submit Now'),
          ),
        ],
      ),
    );
  }

  void _showQuestionNavigator(QuizState state) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) {
        final isDark = sheetCtx.isDarkMode;
        return Container(
          height: MediaQuery.of(sheetCtx).size.height * 0.7,
          decoration: BoxDecoration(
            color: sheetCtx.cardBgColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border(
              top: BorderSide(color: sheetCtx.borderColor),
            ),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: sheetCtx.borderColor,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Question Navigator',
                    style: AppTextStyles.displaySmall.copyWith(fontSize: 18),
                  ),
                  Text(
                    '${state.answeredCount}/${state.totalQuestions} Answered',
                    style: AppTextStyles.mono.copyWith(
                      color: sheetCtx.brandAccentColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 5,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 1.1,
                  ),
                  itemCount: state.questions.length,
                  itemBuilder: (gridCtx, index) {
                    final q = state.questions[index];
                    final isCurrent = state.currentIndex == index;
                    final eval = state.evaluatedAnswers[q.id];
                    final isFlagged = state.flaggedQuestions.contains(q.id);

                    Color bg = gridCtx.mutedBgColor;
                    Color fg = gridCtx.textPrimaryColor;
                    BorderSide side = BorderSide(color: gridCtx.borderColor);

                    if (isCurrent) {
                      bg = isDark ? AppColors.primaryLight : AppColors.primary;
                      fg = Colors.white;
                      side = BorderSide(
                        color: gridCtx.brandAccentColor,
                        width: 2,
                      );
                    } else if (eval != null) {
                      if (eval.isCorrect) {
                        bg = gridCtx.successBgColor;
                        fg = gridCtx.successColor;
                        side = BorderSide(
                          color: gridCtx.successColor,
                          width: 1.5,
                        );
                      } else {
                        bg = gridCtx.errorBgColor;
                        fg = gridCtx.errorColor;
                        side = BorderSide(
                          color: gridCtx.errorColor,
                          width: 1.5,
                        );
                      }
                    }

                    return Stack(
                      children: [
                        Positioned.fill(
                          child: Material(
                            color: bg,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: side,
                            ),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () {
                                ref
                                    .read(quizProvider.notifier)
                                    .jumpToQuestion(index);
                                Navigator.of(sheetCtx).pop();
                              },
                              child: Center(
                                child: Text(
                                  '${index + 1}',
                                  style: AppTextStyles.mono.copyWith(
                                    color: fg,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        if (isFlagged)
                          Positioned(
                            top: 4,
                            right: 4,
                            child: Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.accent,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(quizProvider);
    final isDark = context.isDarkMode;
    final activePrimary = isDark ? AppColors.primaryLight : AppColors.primary;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        _showQuitConfirmation();
      },
      child: Scaffold(
        backgroundColor: context.scaffoldBgColor,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.close_rounded),
            onPressed: _showQuitConfirmation,
            tooltip: 'Exit Quiz',
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                state.category.isNotEmpty ? state.category : widget.category,
                style: AppTextStyles.displaySmall.copyWith(fontSize: 16),
              ),
              Text(
                state.session == 0 ? 'All Sessions' : 'Session ${state.session}',
                style: AppTextStyles.bodySmall.copyWith(
                  fontSize: 11,
                  color: context.textSecondaryColor,
                ),
              ),
            ],
          ),
          actions: [
            if (!state.isLoading && state.questions.isNotEmpty) ...[
              IconButton(
                icon: const Icon(Icons.grid_view_rounded, size: 20),
                onPressed: () => _showQuestionNavigator(state),
                tooltip: 'Question Map',
              ),
            ],
            const SizedBox(width: 6),
          ],
        ),
        body: state.isLoading
            ? const LoadingStateWidget(message: 'Preparing your assessment...')
            : state.questions.isEmpty
                ? EmptyStateWidget(
                    title: 'No questions available',
                    subtitle:
                        'There are no questions in this track and session.',
                    buttonText: 'Back to Explore',
                    onButtonPressed: () => context.pop(),
                  )
                : SafeArea(
                    child: Column(
                      children: [
                        // Progress bar across questions
                        LinearProgressIndicator(
                          value: (state.currentIndex + 1) / state.totalQuestions,
                          backgroundColor: context.borderColor,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            context.brandAccentColor,
                          ),
                          minHeight: 4,
                        ),

                        Expanded(
                          child: SingleChildScrollView(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20.0,
                              vertical: 16.0,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Question Header & Flag Toggle
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: context.mutedBgColor,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        'Question ${state.currentIndex + 1} of ${state.totalQuestions}',
                                        style: AppTextStyles.labelBold.copyWith(
                                          color: context.textSecondaryColor,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ),
                                    IconButton(
                                      icon: Icon(
                                        state.isCurrentFlagged
                                            ? Icons.bookmark_rounded
                                            : Icons.bookmark_border_rounded,
                                        color: state.isCurrentFlagged
                                            ? AppColors.accent
                                            : context.textSecondaryColor,
                                        size: 22,
                                      ),
                                      onPressed: () {
                                        if (state.currentQuestion != null) {
                                          ref
                                              .read(quizProvider.notifier)
                                              .toggleFlag(
                                                state.currentQuestion!.id,
                                              );
                                        }
                                      },
                                      tooltip: 'Flag for review',
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),

                                // Question Card
                                Container(
                                  padding: const EdgeInsets.all(18),
                                  decoration: BoxDecoration(
                                    color: context.cardBgColor,
                                    borderRadius: BorderRadius.circular(18),
                                    border: Border.all(
                                      color: context.borderColor,
                                    ),
                                  ),
                                  child: Text(
                                    state.currentQuestion?.questionText ?? '',
                                    style: AppTextStyles.bodyLarge.copyWith(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 16,
                                      height: 1.45,
                                    ),
                                  ),
                                ),

                                const SizedBox(height: 20),

                                // Controlled Question Data Integrity Notice
                                if (state.currentQuestion != null &&
                                    !state.currentQuestion!
                                        .hasValidCorrectAnswer)
                                  Container(
                                    margin: const EdgeInsets.only(bottom: 14),
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: context.errorBgColor,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: context.errorColor.withValues(
                                          alpha: 0.35,
                                        ),
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          Icons.error_outline_rounded,
                                          color: context.errorColor,
                                          size: 20,
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Text(
                                            'Data Notice: The correct answer for this question could not be verified against the options. Reported for correction.',
                                            style:
                                                AppTextStyles.bodySmall.copyWith(
                                              color: context.errorColor,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                                // Interactive Options Deck with Immediate Feedback & Animations
                                if (state.currentQuestion != null) ...[
                                  ...state.currentQuestion!.options
                                      .asMap()
                                      .entries
                                      .map((entry) {
                                    final index = entry.key;
                                    final optionText = entry.value;
                                    final questionId =
                                        state.currentQuestion!.id;
                                    final optionLetter =
                                        String.fromCharCode(65 + index);

                                    final eval =
                                        state.evaluatedAnswers[questionId];
                                    final isEvaluated = eval != null ||
                                        state.selectedAnswers
                                            .containsKey(questionId);
                                    final userSelectedIdx =
                                        eval?.selectedOptionIndex ??
                                            state.selectedAnswers[questionId];
                                    final isUserSelection = isEvaluated &&
                                        userSelectedIdx == index;
                                    final hasValid = state.currentQuestion!
                                        .hasValidCorrectAnswer;
                                    final correctOptionIndex =
                                        eval?.correctOptionIndex ??
                                            state.currentQuestion!
                                                .correctOptionIndex;
                                    final isCorrectOption = hasValid &&
                                        correctOptionIndex != -1 &&
                                        index == correctOptionIndex;

                                    final shouldAnimate =
                                        state.lastSelectedQuestionId ==
                                                questionId &&
                                            state.lastSelectedOptionIndex ==
                                                index;

                                    return QuizAnswerOptionCard(
                                      key: ValueKey('${questionId}_$index'),
                                      index: index,
                                      optionLetter: optionLetter,
                                      optionText: optionText,
                                      isEvaluated: isEvaluated,
                                      isUserSelection: isUserSelection,
                                      isCorrectOption: isCorrectOption,
                                      hasValidCorrectAnswer: hasValid,
                                      shouldAnimate: shouldAnimate,
                                      onTap: isEvaluated
                                          ? null
                                          : () {
                                              ref
                                                  .read(quizProvider.notifier)
                                                  .selectAnswer(
                                                    questionId,
                                                    index,
                                                  );
                                            },
                                    );
                                  }),

                                  // Explanation Card
                                  if (state.isCurrentQuestionAnswered &&
                                      state.currentQuestion?.explanation !=
                                          null &&
                                      state.currentQuestion!.explanation!
                                          .trim()
                                          .isNotEmpty)
                                    Container(
                                      margin: const EdgeInsets.only(
                                        top: 10,
                                        bottom: 12,
                                      ),
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: context.mutedBgColor,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(
                                          color: context.borderColor,
                                        ),
                                      ),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Container(
                                                padding:
                                                    const EdgeInsets.all(6),
                                                decoration: BoxDecoration(
                                                  color: context
                                                      .brandAccentColor
                                                      .withValues(alpha: 0.14),
                                                  borderRadius:
                                                      BorderRadius.circular(8),
                                                ),
                                                child: Icon(
                                                  Icons.lightbulb_rounded,
                                                  color:
                                                      context.brandAccentColor,
                                                  size: 18,
                                                ),
                                              ),
                                              const SizedBox(width: 10),
                                              Text(
                                                'Explanation',
                                                style: AppTextStyles
                                                    .displaySmall
                                                    .copyWith(
                                                  fontSize: 14,
                                                  color:
                                                      context.brandAccentColor,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 10),
                                          Text(
                                            state.currentQuestion!.explanation!,
                                            style: AppTextStyles.bodyMedium
                                                .copyWith(
                                              color: context.textPrimaryColor,
                                              fontSize: 13.5,
                                              height: 1.45,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                ],
                              ],
                            ),
                          ),
                        ),

                        // Bottom Navigation Action Dock
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: context.cardBgColor,
                            border: Border(
                              top: BorderSide(
                                color: context.borderColor,
                                width: 1,
                              ),
                            ),
                          ),
                          child: Row(
                            children: [
                              OutlinedButton(
                                onPressed:
                                    (state.currentIndex > 0 && !_isNavigating)
                                        ? _handlePrevQuestion
                                        : null,
                                style: OutlinedButton.styleFrom(
                                  minimumSize: const Size(80, 44),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 14,
                                  ),
                                ),
                                child: const Text('Prev'),
                              ),
                              const Spacer(),
                              Text(
                                '${state.currentIndex + 1} / ${state.totalQuestions}',
                                style: AppTextStyles.mono.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: context.textSecondaryColor,
                                ),
                              ),
                              const Spacer(),
                              if (state.isLastQuestion)
                                ElevatedButton(
                                  onPressed: (!state.isCurrentQuestionAnswered ||
                                          _isSubmitting ||
                                          state.isSubmitting)
                                      ? null
                                      : () => _showSubmitConfirmation(
                                            state.answeredCount,
                                            state.totalQuestions,
                                          ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: activePrimary,
                                    foregroundColor: Colors.white,
                                    disabledBackgroundColor:
                                        activePrimary.withValues(alpha: 0.35),
                                    disabledForegroundColor:
                                        Colors.white.withValues(alpha: 0.7),
                                    minimumSize: const Size(100, 44),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: _isSubmitting || state.isSubmitting
                                      ? const SizedBox(
                                          width: 18,
                                          height: 18,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.white,
                                          ),
                                        )
                                      : const Text('Submit'),
                                )
                              else
                                ElevatedButton(
                                  onPressed:
                                      (!state.isCurrentQuestionAnswered ||
                                              _isNavigating)
                                          ? null
                                          : _handleNextQuestion,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: activePrimary,
                                    foregroundColor: Colors.white,
                                    disabledBackgroundColor:
                                        activePrimary.withValues(alpha: 0.35),
                                    disabledForegroundColor:
                                        Colors.white.withValues(alpha: 0.7),
                                    minimumSize: const Size(80, 44),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 14,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: const Text('Next'),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }
}

/// Specialized Answer Card with:
/// - Wrong answer side-to-side shake animation, accessible red color, red cross, and message badge.
/// - Correct answer scale/pulse animation, accessible green color, green checkmark, and message badge.
/// - Immediate answer locking upon first selection.
/// - Accessible semantics and reduced-motion support in both Light and Dark themes.
class QuizAnswerOptionCard extends StatefulWidget {
  final int index;
  final String optionLetter;
  final String optionText;
  final bool isEvaluated;
  final bool isUserSelection;
  final bool isCorrectOption;
  final bool hasValidCorrectAnswer;
  final bool shouldAnimate;
  final VoidCallback? onTap;

  const QuizAnswerOptionCard({
    super.key,
    required this.index,
    required this.optionLetter,
    required this.optionText,
    required this.isEvaluated,
    required this.isUserSelection,
    required this.isCorrectOption,
    this.hasValidCorrectAnswer = true,
    required this.shouldAnimate,
    this.onTap,
  });

  @override
  State<QuizAnswerOptionCard> createState() => _QuizAnswerOptionCardState();
}

class _QuizAnswerOptionCardState extends State<QuizAnswerOptionCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _animController;
  late final Animation<double> _animCurve;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    );
    _animCurve =
        CurvedAnimation(parent: _animController, curve: Curves.easeInOut);

    if (widget.shouldAnimate) {
      _triggerHapticAndAnimation();
    }
  }

  @override
  void didUpdateWidget(covariant QuizAnswerOptionCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.shouldAnimate && !oldWidget.shouldAnimate) {
      _triggerHapticAndAnimation();
    }
  }

  void _triggerHapticAndAnimation() {
    try {
      HapticFeedback.lightImpact();
    } catch (_) {}

    final bool reduceMotion =
        MediaQuery.maybeOf(context)?.disableAnimations ?? false;
    if (!reduceMotion) {
      _animController.forward(from: 0.0);
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEvaluated = widget.isEvaluated;
    final isUserSelection = widget.isUserSelection;
    final isCorrectOption = widget.isCorrectOption;
    final hasValidCorrectAnswer = widget.hasValidCorrectAnswer;

    Color cardBg;
    Color borderColor;
    double borderWidth;
    Color chipBg;
    Color chipFg;
    Color textColor;
    Widget? trailingIcon;
    Widget? statusBadge;

    if (!isEvaluated) {
      // 1. Unanswered state
      cardBg = context.cardBgColor;
      borderColor = context.borderColor;
      borderWidth = 1.0;
      chipBg = context.mutedBgColor;
      chipFg = context.textPrimaryColor;
      textColor = context.textPrimaryColor;
      trailingIcon = null;
      statusBadge = null;
    } else if (isUserSelection && !hasValidCorrectAnswer) {
      // 1.5. Evaluated & User selected option with missing/invalid correct answer in DB
      cardBg = context.warningBgColor;
      borderColor = context.warningColor;
      borderWidth = 2.0;
      chipBg = context.warningColor;
      chipFg = Colors.white;
      textColor = context.textPrimaryColor;
      trailingIcon = Icon(
        Icons.warning_amber_rounded,
        color: context.warningColor,
        size: 22,
      );
      statusBadge = Container(
        margin: const EdgeInsets.only(top: 4),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: context.warningColor.withValues(alpha: 0.18),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          'Unverified Answer Data',
          style: AppTextStyles.labelBold.copyWith(
            color: context.warningColor,
            fontSize: 11,
          ),
        ),
      );
    } else if (isUserSelection && !isCorrectOption) {
      // 2. Evaluated & User selected WRONG answer
      cardBg = context.errorBgColor;
      borderColor = context.errorColor;
      borderWidth = 2.0;
      chipBg = context.errorColor;
      chipFg = Colors.white;
      textColor = context.textPrimaryColor;
      trailingIcon = Icon(
        Icons.cancel_rounded,
        color: context.errorColor,
        size: 22,
      );
      statusBadge = Container(
        margin: const EdgeInsets.only(top: 4),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: context.errorColor.withValues(alpha: 0.18),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          'Incorrect Answer',
          style: AppTextStyles.labelBold.copyWith(
            color: context.errorColor,
            fontSize: 11,
          ),
        ),
      );
    } else if (isCorrectOption) {
      // 3. Evaluated & Revealed CORRECT answer (selected or revealed)
      cardBg = context.successBgColor;
      borderColor = context.successColor;
      borderWidth = 2.0;
      chipBg = context.successColor;
      chipFg = Colors.white;
      textColor = context.textPrimaryColor;
      trailingIcon = Icon(
        Icons.check_circle_rounded,
        color: context.successColor,
        size: 22,
      );
      statusBadge = Container(
        margin: const EdgeInsets.only(top: 4),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: context.successColor.withValues(alpha: 0.18),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          'Correct Answer',
          style: AppTextStyles.labelBold.copyWith(
            color: context.successColor,
            fontSize: 11,
          ),
        ),
      );
    } else {
      // 4. Evaluated & Unselected other option
      cardBg = context.cardBgColor.withValues(alpha: 0.6);
      borderColor = context.borderColor.withValues(alpha: 0.6);
      borderWidth = 1.0;
      chipBg = context.mutedBgColor.withValues(alpha: 0.5);
      chipFg = context.textMutedColor;
      textColor = context.textSecondaryColor;
      trailingIcon = null;
      statusBadge = null;
    }

    String semanticDescription =
        'Option ${widget.optionLetter}: ${widget.optionText}';
    if (isEvaluated) {
      if (isUserSelection && isCorrectOption) {
        semanticDescription += ', Your answer, Correct';
      } else if (isUserSelection) {
        semanticDescription += ', Your answer, Incorrect';
      } else if (isCorrectOption) {
        semanticDescription += ', Correct answer';
      } else {
        semanticDescription += ', Unselected';
      }
    }

    return AnimatedBuilder(
      animation: _animCurve,
      builder: (context, child) {
        double shakeOffset = 0.0;
        double scaleValue = 1.0;

        if (widget.shouldAnimate && _animController.isAnimating) {
          final t = _animCurve.value;
          if (isUserSelection && !isCorrectOption) {
            final decay = 1.0 - t;
            shakeOffset = 6.0 * decay * math.sin(t * 6.0 * math.pi);
          } else if (isCorrectOption) {
            scaleValue = 1.0 + (0.025 * math.sin(t * math.pi));
          }
        }

        return Transform.translate(
          offset: Offset(shakeOffset, 0),
          child: Transform.scale(
            scale: scaleValue,
            child: child,
          ),
        );
      },
      child: Semantics(
        label: semanticDescription,
        button: !isEvaluated,
        enabled: !isEvaluated,
        selected: isUserSelection,
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: borderColor,
              width: borderWidth,
            ),
          ),
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: widget.onTap,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 14.0,
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Option Letter Chip
                    Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        color: chipBg,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Center(
                        child: Text(
                          widget.optionLetter,
                          style: AppTextStyles.mono.copyWith(
                            color: chipFg,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),

                    // Option Text and Optional Status Badge
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            widget.optionText,
                            style: AppTextStyles.bodyMedium.copyWith(
                              fontWeight: (isUserSelection ||
                                      (isEvaluated && isCorrectOption))
                                  ? FontWeight.w700
                                  : FontWeight.normal,
                              color: textColor,
                            ),
                          ),
                          ?statusBadge,
                        ],
                      ),
                    ),

                    if (trailingIcon != null) ...[
                      const SizedBox(width: 8),
                      trailingIcon,
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
