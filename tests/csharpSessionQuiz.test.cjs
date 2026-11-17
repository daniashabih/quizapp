const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { CSHARP_QUIZ_QUESTIONS, CSHARP_QUIZ_SESSIONS } = require('../api/_models/csharpQuizQuestionsData');
const Category = require('../api/_models/categoryModel');
const Question = require('../api/_models/questionModel');
const Attempt = require('../api/_models/attemptModel');
const quizController = require('../api/_controllers/quizController');

const EXPECTED_SESSION_COUNTS = {
    1: 50,
    2: 50,
    3: 49,
    4: 49,
    5: 46,
    6: 48,
    7: 46,
    8: 44,
    9: 50,
    10: 50,
    11: 49,
    12: 50,
    13: 45,
    14: 37,
    15: 50
};

const EXPECTED_SESSION_TITLES = {
    1: 'Getting Started with C#',
    2: 'Variables and Data Types',
    3: 'Statements and Operators',
    4: 'Programming Constructs and Arrays',
    5: 'Classes and Methods',
    6: 'Inheritance and Polymorphism',
    7: 'Abstract Classes and Interfaces',
    8: 'Properties, Indexers, and Record Types',
    9: 'Namespaces and Exception Handling',
    10: 'Events, Delegates, and Collections',
    11: 'Generics and Iterators',
    12: 'Advanced Concepts in C#',
    13: 'New Features of C# 9.0',
    14: '.NET Core Development and the Future',
    15: 'GUI/Desktop Apps with C#'
};

function createMockRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}

test('1. C# Session-Wise Question Bank: 15 sessions, 713 verified MCQs with exact titles and counts', () => {
    assert.equal(Object.keys(CSHARP_QUIZ_SESSIONS).length, 15, 'Must define 15 C# sessions');
    assert.equal(CSHARP_QUIZ_QUESTIONS.length, 713, 'Must contain 713 C# MCQs');

    for (let s = 1; s <= 15; s++) {
        assert.equal(CSHARP_QUIZ_SESSIONS[s], EXPECTED_SESSION_TITLES[s], `Session ${s} title must match`);
        const sessionQs = CSHARP_QUIZ_QUESTIONS.filter(q => q.session === s);
        assert.equal(sessionQs.length, EXPECTED_SESSION_COUNTS[s], `Session ${s} must have ${EXPECTED_SESSION_COUNTS[s]} questions`);
    }
});

test('2. Every single one of the 713 C# questions grades uniquely and accurately', () => {
    for (const q of CSHARP_QUIZ_QUESTIONS) {
        assert.equal(q.options.length, 4, `${q.id} must have 4 options`);
        assert.ok(q.options.includes(q.correctAnswer), `${q.id} correctAnswer must exist in options`);

        const correctIdx = Attempt.getQuestionCorrectIndex(q);
        assert.ok(correctIdx >= 0 && correctIdx < 4, `${q.id} must resolve valid correct index`);
        assert.equal(q.options[correctIdx], q.correctAnswer, `${q.id} resolved option text must match correctAnswer`);
        assert.equal(Attempt.evaluateAnswerCorrectness(correctIdx, q), true, `${q.id} correct index must evaluate true`);

        for (let i = 0; i < 4; i++) {
            if (i !== correctIdx) {
                assert.equal(
                    Attempt.evaluateAnswerCorrectness(i, q),
                    false,
                    `${q.id} wrong option index ${i} must evaluate false`
                );
            }
        }
    }
});

test('3. Category & Question Models expose all 15 C# sessions and support C#/csharp aliases', async () => {
    const categories = await Category.getAll();
    const csharpCat = categories.find(c => c.name === 'C#');
    assert.ok(csharpCat, 'C# category must exist');
    assert.equal(csharpCat.isEnabled, true);
    assert.ok(csharpCat.questionCount >= 713);
    assert.deepEqual(csharpCat.sessions, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

    const sessionList = await Question.getSessionsByCategory('C#');
    assert.equal(sessionList.length, 15);
    for (let s = 1; s <= 15; s++) {
        const entry = sessionList.find(x => x.session === s);
        assert.ok(entry, `Session ${s} must be returned by getSessionsByCategory`);
        assert.equal(entry.title, EXPECTED_SESSION_TITLES[s]);
        assert.equal(entry.count, EXPECTED_SESSION_COUNTS[s]);
    }

    const s15 = await Question.getFiltered({ category: 'csharp', session: 15 });
    assert.equal(s15.length, 50);
    assert.equal(s15[0].sessionTitle, 'GUI/Desktop Apps with C#');
});

test('4. quizController.validateAnswer supports C# in-memory fallback questions', async () => {
    const firstQ = CSHARP_QUIZ_QUESTIONS[0];
    const correctIdx = firstQ.options.indexOf(firstQ.correctAnswer);

    const resCorrect = createMockRes();
    await quizController.validateAnswer(
        { body: { questionId: firstQ.id, selectedOptionIndex: correctIdx } },
        resCorrect
    );
    assert.equal(resCorrect.statusCode, 200);
    assert.equal(resCorrect.body.success, true);
    assert.equal(resCorrect.body.isCorrect, true);
    assert.equal(resCorrect.body.correctOptionIndex, correctIdx);

    const lastQ = CSHARP_QUIZ_QUESTIONS[CSHARP_QUIZ_QUESTIONS.length - 1];
    const lastCorrectIdx = lastQ.options.indexOf(lastQ.correctAnswer);
    const wrongIdx = (lastCorrectIdx + 1) % 4;
    const resWrong = createMockRes();
    await quizController.validateAnswer(
        { body: { questionId: lastQ.id, selectedOptionIndex: wrongIdx } },
        resWrong
    );
    assert.equal(resWrong.statusCode, 200);
    assert.equal(resWrong.body.success, true);
    assert.equal(resWrong.body.isCorrect, false);
    assert.equal(resWrong.body.correctOptionIndex, lastCorrectIdx);
});

test('5. Web & Mobile client files support C# session titles and 15-session navigation', () => {
    const webTech = fs.readFileSync(path.join(__dirname, '..', 'src', 'pages', 'quiz', 'Technologies.jsx'), 'utf8');
    assert.ok(webTech.includes('hasSessionTitles'), 'Web Technologies.jsx must render session titles when available');
    assert.ok(webTech.includes('sessionTitle'), 'Web Technologies.jsx must pass sessionTitle to quiz start');

    const mobileExplore = fs.readFileSync(
        path.join(__dirname, '..', 'mobile', 'lib', 'screens', 'explore', 'explore_screen.dart'),
        'utf8'
    );
    assert.ok(mobileExplore.includes('getCategorySessionDetails'), 'Mobile ExploreScreen must fetch detailed sessions');
    assert.ok(mobileExplore.includes('hasCustomTitles'), 'Mobile ExploreScreen must display session titles cleanly');
    assert.ok(mobileExplore.includes("q == 'csharp'"), 'Mobile ExploreScreen search must match csharp alias for C#');
});
