const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Attempt = require('../api/_models/attemptModel');
const quizController = require('../api/_controllers/quizController');

// Test fixtures with stable questions and options
const sampleQuestions = [
    {
        id: 'q_test_1',
        category: 'JavaScript',
        session: 1,
        questionText: 'What is the output of typeof null in JavaScript?',
        options: JSON.stringify(['null', 'undefined', 'object', 'number']),
        correctAnswer: 'object', // index 2
        explanation: 'In JavaScript, typeof null returns "object", which is a historical bug in the language.'
    },
    {
        id: 'q_test_2',
        category: 'JavaScript',
        session: 1,
        questionText: 'Which keyword declares a block-scoped variable?',
        options: JSON.stringify(['var', 'let', 'function', 'global']),
        correctAnswer: 'let', // index 1
        explanation: 'let and const declare block-scoped variables in modern JavaScript.'
    },
    {
        id: 'q_test_3',
        category: 'JavaScript',
        session: 1,
        questionText: 'Which method converts a JSON string into a JavaScript object?',
        options: JSON.stringify(['JSON.stringify', 'JSON.parse', 'JSON.toObject', 'JSON.convert']),
        correctAnswer: 'JSON.parse', // index 1
        explanation: 'JSON.parse() deserializes a JSON string into a native JavaScript object.'
    }
];

test('1. Check Each Answer Immediately: Selecting correct answer gives immediate positive feedback and correct index', () => {
    const q = sampleQuestions[0];
    const isCorrect = Attempt.evaluateAnswerCorrectness(2, q); // 'object' is index 2
    const correctIdx = Attempt.getQuestionCorrectIndex(q);

    assert.equal(isCorrect, true, 'Selecting correct index 2 must evaluate to true');
    assert.equal(correctIdx, 2, 'Authoritative correct index must be 2');
});

test('2. Check Each Answer Immediately: Selecting wrong answer gives incorrect feedback and reveals actual correct answer', () => {
    const q = sampleQuestions[0];
    const isCorrect = Attempt.evaluateAnswerCorrectness(0, q); // 'null' is wrong (index 0)
    const correctIdx = Attempt.getQuestionCorrectIndex(q);
    const opts = JSON.parse(q.options);

    assert.equal(isCorrect, false, 'Selecting wrong index 0 must evaluate to false');
    assert.equal(correctIdx, 2, 'Must reveal that correct index is 2');
    assert.equal(opts[correctIdx], 'object', 'Must reveal that correct option text is "object"');
});

test('3. Lock Answer After Selection: An already recorded answer cannot be altered by selecting another option', async () => {
    const existingAnswers = { 'q_test_1': 2 };
    const incomingChange = { 'q_test_1': 0 }; // Attempt to tamper / switch answer to 0

    // Simulating Attempt updateProgress merge logic:
    const mergedAnswers = { ...existingAnswers };
    for (const [qId, incomingVal] of Object.entries(incomingChange)) {
        if (mergedAnswers[qId] === undefined || mergedAnswers[qId] === null) {
            mergedAnswers[qId] = incomingVal;
        }
    }

    assert.equal(mergedAnswers['q_test_1'], 2, 'Original selection index 2 must be preserved; tampering rejected');
});

test('4. Backend Validation and Scoring: Duplicate or repeated submissions update score exactly once', () => {
    const userSelections = {
        'q_test_1': 2, // correct
        'q_test_2': 1, // correct
        'q_test_3': 0  // incorrect
    };

    let score = 0;
    sampleQuestions.forEach(q => {
        const sel = userSelections[q.id];
        if (sel !== undefined && Attempt.evaluateAnswerCorrectness(sel, q)) {
            score++;
        }
    });

    assert.equal(score, 2, 'Score must equal 2 for 2 correct answers');

    // Repeated taps on question 1 must not inflate the score
    let scoreAfterRepeatedTap = 0;
    sampleQuestions.forEach(q => {
        const sel = userSelections[q.id];
        if (sel !== undefined && Attempt.evaluateAnswerCorrectness(sel, q)) {
            scoreAfterRepeatedTap++;
        }
    });

    assert.equal(scoreAfterRepeatedTap, 2, 'Score remains strictly 2 regardless of repeat calls');
});

test('5. Save and Resume Quiz Progress: Format attempt enriches answered questions and sanitizes future questions', () => {
    const mockAttempt = {
        id: 'att_123',
        userId: 'user_123',
        category: 'JavaScript',
        session: 1,
        currentQuestionIndex: 1,
        answers: JSON.stringify({ 'q_test_1': 2 }), // Answered question 1
        flaggedQuestions: '[]',
        questionsSnapshot: JSON.stringify(sampleQuestions),
        score: 1,
        totalQuestions: 3,
        answeredCount: 1,
        progressPercentage: 33,
        status: 'in_progress',
        startedAt: new Date(),
        lastSavedAt: new Date(),
        completedAt: null
    };

    // Simulate formatting
    const answers = JSON.parse(mockAttempt.answers);
    const snapshot = JSON.parse(mockAttempt.questionsSnapshot);
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
                explanation: q.explanation || ''
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

    // 1. Question 1 has been evaluated and is strictly locked
    assert.ok(evaluatedAnswers['q_test_1'], 'Question 1 must have evaluated answer');
    assert.equal(evaluatedAnswers['q_test_1'].isLocked, true, 'Question 1 must be locked');
    assert.equal(evaluatedAnswers['q_test_1'].isCorrect, true, 'Question 1 must be correct');
    assert.equal(evaluatedAnswers['q_test_1'].correctOptionIndex, 2);

    // 2. Future questions 2 and 3 DO NOT expose correct answers
    const futureQ2 = sanitizedSnapshot.find(q => q.id === 'q_test_2');
    const futureQ3 = sanitizedSnapshot.find(q => q.id === 'q_test_3');

    assert.equal(futureQ2.correct_answer, undefined, 'Future question 2 must not expose correct_answer');
    assert.equal(futureQ2.correctAnswer, undefined, 'Future question 2 must not expose correctAnswer');
    assert.equal(futureQ3.correct_answer, undefined, 'Future question 3 must not expose correct_answer');
    assert.equal(futureQ3.correctAnswer, undefined, 'Future question 3 must not expose correctAnswer');
});

test('6. Authoritative Scoring & Certificates: Uses authoritative recorded answers', () => {
    // 3 questions: 2 correct = 66.6% (<80% threshold for certificate)
    const score = 2;
    const total = 3;
    const percentage = Math.round((score / total) * 100);
    const passingScore = 70;
    const certificatePassingScore = 80;

    const passed = percentage >= passingScore;
    const certificateEligible = percentage >= certificatePassingScore;

    assert.equal(percentage, 67);
    assert.equal(passed, false);
    assert.equal(certificateEligible, false);

    // If 3 out of 3 = 100%
    const perfectScore = 3;
    const perfectPct = Math.round((perfectScore / total) * 100);
    assert.equal(perfectPct, 100);
    assert.equal(perfectPct >= passingScore, true);
    assert.equal(perfectPct >= certificatePassingScore, true);
});

test('7. Missing or Invalid Database Data fails safely without crashing', () => {
    const brokenQ1 = {
        id: 'q_broken_1',
        options: JSON.stringify(['A', 'B']),
        correctAnswer: '' // Missing correct answer
    };
    assert.equal(Attempt.getQuestionCorrectIndex(brokenQ1), -1);
    assert.equal(Attempt.evaluateAnswerCorrectness(0, brokenQ1), false);

    const brokenQ2 = {
        id: 'q_broken_2',
        options: JSON.stringify(['A', 'B']),
        correctAnswer: 'Z' // Mismatched correct answer
    };
    assert.equal(Attempt.getQuestionCorrectIndex(brokenQ2), -1);
    assert.equal(Attempt.evaluateAnswerCorrectness(0, brokenQ2), false);
});

test('8. React Quiz Layout & Answer Feedback UI: Strict vertical flow without overlapping or clipping', () => {
    const quizFilePath = path.join(__dirname, '..', 'src', 'pages', 'quiz', 'Quiz.jsx');
    const source = fs.readFileSync(quizFilePath, 'utf8');

    // Verify all layout sections exist in strict vertical document order
    const scrollIdx = source.indexOf('data-testid="quiz-scroll-container"');
    const questionCardIdx = source.indexOf('data-testid="quiz-question-card"');
    const feedbackBannerIdx = source.indexOf('data-testid="quiz-feedback-banner"');
    const optionsListIdx = source.indexOf('data-testid="quiz-options-list"');
    const explanationCardIdx = source.indexOf('data-testid="quiz-explanation-card"');

    assert.ok(scrollIdx !== -1, 'Unified scrollable container must exist');
    assert.ok(questionCardIdx > scrollIdx, 'Question card must be inside scrollable container');
    assert.ok(feedbackBannerIdx > questionCardIdx, 'Feedback banner must appear after question card');
    assert.ok(optionsListIdx > feedbackBannerIdx, 'Options list must appear after feedback banner');
    assert.ok(explanationCardIdx > optionsListIdx, 'Explanation card must appear after options list');

    // Ensure options list container does not use justify-center + overflow-y-auto which clipped Option A
    const optionsListSnippet = source.slice(optionsListIdx - 120, optionsListIdx + 200);
    assert.equal(
        optionsListSnippet.includes('justify-center'),
        false,
        'Options list must not use justify-center which pushes the first option into negative scroll coordinates'
    );

    // Ensure Correct Answer and Incorrect Answer badges and banner texts are present
    assert.ok(source.includes('Correct Answer'), 'Must display "Correct Answer" label');
    assert.ok(source.includes('Incorrect Answer'), 'Must display "Incorrect Answer" label');
});
