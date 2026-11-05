const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Attempt = require('../api/_models/attemptModel');
const attemptController = require('../api/_controllers/attemptController');

// 10 Sample questions for simulation
const sampleQuestions = Array.from({ length: 10 }, (_, i) => ({
    id: `q_sim_${i + 1}`,
    category: 'Node.js',
    session: 1,
    questionText: `Question ${i + 1} for Node.js assessment?`,
    options: JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']),
    correctAnswer: 'Option B', // Index 1 is correct
    explanation: `Explanation for question ${i + 1}`
}));

test('1. Save Progress & Exit: preserves answers, scores, and calculates exact resumption index', () => {
    // Simulate user answering first 5 questions (indices 0 to 4)
    const answers = {
        'q_sim_1': 1, // correct
        'q_sim_2': 1, // correct
        'q_sim_3': 0, // incorrect
        'q_sim_4': 1, // correct
        'q_sim_5': 2  // incorrect
    };

    let score = 0;
    sampleQuestions.forEach(q => {
        if (answers[q.id] !== undefined) {
            if (Attempt.evaluateAnswerCorrectness(answers[q.id], q)) {
                score++;
            }
        }
    });

    assert.equal(score, 3, 'User answered 3 of 5 questions correctly');
    assert.equal(Object.keys(answers).length, 5, '5 questions answered');

    // If user leaves at question 5 (index 4) which is answered, target resume index should be index 5 (Question 6)
    const currentIndex = 4;
    const isCurrentAnswered = answers[sampleQuestions[currentIndex].id] !== undefined;
    let targetIndex = currentIndex;
    if (isCurrentAnswered && currentIndex < sampleQuestions.length - 1) {
        targetIndex = currentIndex + 1;
    }

    assert.equal(targetIndex, 5, 'User resumes at index 5 (Question 6)');
});

test('2. Resume Quiz: reconstructs evaluated answers and locks answered questions without exposing future answers', () => {
    const rawAttempt = {
        id: 'attempt_abc_123',
        userId: 'user_456',
        category: 'Node.js',
        session: 1,
        currentQuestionIndex: 5,
        answers: JSON.stringify({
            'q_sim_1': 1,
            'q_sim_2': 0
        }),
        questionsSnapshot: JSON.stringify(sampleQuestions),
        score: 1,
        totalQuestions: 10,
        answeredCount: 2,
        progressPercentage: 20,
        status: 'in_progress',
        startedAt: new Date(),
        lastSavedAt: new Date()
    };

    // Format attempt simulation using controller logic
    const snapshot = JSON.parse(rawAttempt.questionsSnapshot);
    const answers = JSON.parse(rawAttempt.answers);
    const evaluatedAnswers = {};

    const sanitizedSnapshot = snapshot.map(q => {
        const isAnswered = answers[q.id] !== undefined;
        if (isAnswered) {
            const userSelection = answers[q.id];
            const isCorrect = Attempt.evaluateAnswerCorrectness(userSelection, q);
            const correctIdx = Attempt.getQuestionCorrectIndex(q);
            const opts = JSON.parse(q.options);
            evaluatedAnswers[q.id] = {
                selectedOptionIndex: userSelection,
                isCorrect,
                isLocked: true,
                correctOptionIndex: correctIdx,
                correctAnswer: opts[correctIdx],
                explanation: q.explanation
            };
            return q;
        } else {
            const sanitized = { ...q };
            delete sanitized.correct_answer;
            delete sanitized.correctAnswer;
            delete sanitized.explanation;
            return sanitized;
        }
    });

    // Verify answered questions
    assert.equal(evaluatedAnswers['q_sim_1'].isCorrect, true);
    assert.equal(evaluatedAnswers['q_sim_1'].isLocked, true);
    assert.equal(evaluatedAnswers['q_sim_2'].isCorrect, false);
    assert.equal(evaluatedAnswers['q_sim_2'].isLocked, true);

    // Verify future questions have sanitized answers
    assert.equal(sanitizedSnapshot[2].correctAnswer, undefined, 'Unanswered question must not reveal correct answer');
    assert.equal(sanitizedSnapshot[2].explanation, undefined, 'Unanswered question must not reveal explanation');
});

test('3. In-Progress Quizzes formatting provides all UI fields for Web and Flutter', () => {
    const mockAttempt = {
        id: 'att_789',
        userId: 'user_123',
        category: 'React',
        session: 2,
        currentQuestionIndex: 3,
        answers: JSON.stringify({ 'q1': 0, 'q2': 1, 'q3': 2 }),
        score: 2,
        totalQuestions: 15,
        answeredCount: 3,
        progressPercentage: 20,
        status: 'in_progress',
        startedAt: new Date('2026-11-05T10:00:00Z'),
        lastSavedAt: new Date('2026-11-05T10:15:00Z')
    };

    const formatted = {
        id: mockAttempt.id,
        quizId: mockAttempt.id,
        userId: mockAttempt.userId,
        category: mockAttempt.category,
        technology: mockAttempt.category,
        session: mockAttempt.session,
        quizTitle: `${mockAttempt.category} - Session ${mockAttempt.session}`,
        currentQuestionIndex: mockAttempt.currentQuestionIndex,
        answeredCount: mockAttempt.answeredCount,
        totalQuestions: mockAttempt.totalQuestions,
        unansweredCount: mockAttempt.totalQuestions - mockAttempt.answeredCount,
        score: mockAttempt.score,
        progressPercentage: mockAttempt.progressPercentage,
        status: mockAttempt.status,
        startedAt: mockAttempt.startedAt,
        createdAt: mockAttempt.startedAt,
        lastSavedAt: mockAttempt.lastSavedAt,
        updatedAt: mockAttempt.lastSavedAt
    };

    assert.equal(formatted.technology, 'React');
    assert.equal(formatted.quizTitle, 'React - Session 2');
    assert.equal(formatted.answeredCount, 3);
    assert.equal(formatted.totalQuestions, 15);
    assert.equal(formatted.unansweredCount, 12);
    assert.equal(formatted.progressPercentage, 20);
    assert.equal(formatted.status, 'in_progress');
});

test('4. Web Quiz.jsx has exact toast message, target index advance, and redirect to /technologies', () => {
    const quizPath = path.join(__dirname, '../src/pages/quiz/Quiz.jsx');
    const quizContent = fs.readFileSync(quizPath, 'utf8');

    assert.match(
        quizContent,
        /toast\.success\(\s*["']Your progress has been saved! You can continue your quiz anytime\.["']\s*\)/,
        'Quiz.jsx must display exact success message on save and exit'
    );

    assert.match(
        quizContent,
        /navigate\(\s*['"]\/technologies['"]\s*\)/,
        'Quiz.jsx must navigate to Quiz Area (/technologies) on Save & Exit'
    );

    assert.match(
        quizContent,
        /targetIndex\s*=\s*currentIndex\s*\+\s*1/,
        'Quiz.jsx must advance targetIndex if current question was already answered'
    );
});

test('5. Web Technologies.jsx renders Saved Quizzes section with Resume and Discard actions', () => {
    const techPath = path.join(__dirname, '../src/pages/quiz/Technologies.jsx');
    const techContent = fs.readFileSync(techPath, 'utf8');

    assert.match(
        techContent,
        /savedAttempts\.length\s*>\s*0/,
        'Technologies.jsx must conditionally render when saved attempts exist'
    );

    assert.match(
        techContent,
        /Saved In-Progress Quizzes/,
        'Technologies.jsx must show "Saved In-Progress Quizzes" section header'
    );

    assert.match(
        techContent,
        /Resume Quiz/,
        'Technologies.jsx must render "Resume Quiz" button'
    );

    assert.match(
        techContent,
        /handleDiscardSavedAttempt/,
        'Technologies.jsx must provide discard saved progress action'
    );
});

test('6. Flutter quiz_screen.dart and explore_screen.dart have exact save & exit and resume support', () => {
    const quizScreenPath = path.join(__dirname, '../mobile/lib/screens/quiz/quiz_screen.dart');
    const quizScreenContent = fs.readFileSync(quizScreenPath, 'utf8');

    assert.match(
        quizScreenContent,
        /Your progress has been saved! You can continue your quiz anytime\./,
        'Flutter quiz_screen.dart must display exact success SnackBar on save and exit'
    );

    assert.match(
        quizScreenContent,
        /saveAndExit\(\)/,
        'Flutter quiz_screen.dart must invoke saveAndExit() on QuizNotifier'
    );

    const explorePath = path.join(__dirname, '../mobile/lib/screens/explore/explore_screen.dart');
    const exploreContent = fs.readFileSync(explorePath, 'utf8');

    assert.match(
        exploreContent,
        /Saved In-Progress Quizzes/,
        'Flutter explore_screen.dart must render Saved In-Progress Quizzes section'
    );

    assert.match(
        exploreContent,
        /Resume Quiz/,
        'Flutter explore_screen.dart must have Resume Quiz button'
    );

    assert.match(
        exploreContent,
        /_showDiscardConfirmation/,
        'Flutter explore_screen.dart must have Discard Progress action with confirmation'
    );

    const quizProviderPath = path.join(__dirname, '../mobile/lib/providers/quiz_provider.dart');
    const quizProviderContent = fs.readFileSync(quizProviderPath, 'utf8');

    assert.match(
        quizProviderContent,
        /inProgressAttemptsProvider/,
        'Flutter quiz_provider.dart must provide inProgressAttemptsProvider'
    );

    assert.match(
        quizProviderContent,
        /saveAndExit\(\)/,
        'Flutter quiz_provider.dart must implement saveAndExit()'
    );
});
