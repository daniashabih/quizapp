const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Question = require('../api/_models/questionModel');
const questionController = require('../api/_controllers/questionController');
const Attempt = require('../api/_models/attemptModel');

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

test('1. Question.normalizeQuestionText normalizes underscores, whitespace, and casing', () => {
    const a = Question.normalizeQuestionText('PHP variables must start with a _____.');
    const b = Question.normalizeQuestionText('  php   variables must start with a _______.  ');
    assert.equal(a, b);
    assert.equal(a, 'php variables must start with a _.');
});

test('2. PHP, XML JSON, Laravel, MySQL, JavaScript holds all 149 unique questions in Session 1 with Session 2 merged', () => {
    const s1 = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'scripts', 'php_xml_json_laravel_mysql_javascript_session1.json'), 'utf8')
    );
    const s2 = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'scripts', 'php_xml_json_laravel_mysql_javascript_session2.json'), 'utf8')
    );

    const seen = new Map();
    for (const [label, dataset] of [['Session 1', s1], ['Session 2', s2]]) {
        assert.equal(dataset.totalQuestions, dataset.questions.length, `${label} totalQuestions must match questions length`);
        for (const q of dataset.questions) {
            assert.ok(Array.isArray(q.options) && q.options.length >= 2, `${label} question options must have >= 2 items`);
            assert.ok(q.options.includes(q.correctAnswer), `${label} correctAnswer "${q.correctAnswer}" must be in options for: ${q.questionText}`);
            assert.ok(Attempt.getQuestionCorrectIndex(q) >= 0, `${label} must resolve valid correct index`);

            const norm = Question.normalizeQuestionText(q.questionText);
            assert.equal(seen.has(norm), false, `Duplicate question across/within sessions (${seen.get(norm)} vs ${label}): ${q.questionText}`);
            seen.set(norm, label);
        }
    }

    assert.equal(s1.session, 1);
    assert.equal(s1.questions.length, 149);
    assert.equal(s2.questions.length, 0);
});

test('3. questionController.createQuestion returns 409 when Question.findDuplicate detects an existing question', async () => {
    const originalFindDuplicate = Question.findDuplicate;
    const originalCreate = Question.create;
    let createCalled = false;

    Question.findDuplicate = async () => ({
        id: 'dup_123',
        category: 'PHP, XML JSON, Laravel, MySQL, JavaScript',
        session: 1,
        questionText: 'PHP variables must start with a _____.'
    });
    Question.create = async () => {
        createCalled = true;
        return 'should_not_create';
    };

    try {
        const res = createMockRes();
        await questionController.createQuestion({
            body: {
                category: 'PHP, XML JSON, Laravel, MySQL, JavaScript',
                session: 2,
                question_text: 'PHP variables must start with a ______.',
                options: ['Underscore sign', 'Dollar sign', 'Alpha-numeric character', 'Asterisk sign'],
                correct_answer: 'Dollar sign'
            }
        }, res);

        assert.equal(res.statusCode, 409);
        assert.equal(res.body.duplicate, true);
        assert.equal(res.body.existingSession, 1);
        assert.equal(createCalled, false);
    } finally {
        Question.findDuplicate = originalFindDuplicate;
        Question.create = originalCreate;
    }
});

test('4. Web & Mobile admin question handlers surface duplicate error messages and prevent lost input', () => {
    const webAdmin = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'pages', 'admin', 'AdminDashboard.jsx'),
        'utf8'
    );
    assert.ok(webAdmin.includes('err.response?.data?.message'), 'Web AdminDashboard must display server duplicate error message');

    const mobileProvider = fs.readFileSync(
        path.join(__dirname, '..', 'mobile', 'lib', 'providers', 'admin_provider.dart'),
        'utf8'
    );
    assert.ok(mobileProvider.includes('lastErrorMessage'), 'Mobile AdminController must retain lastErrorMessage for UI error display');

    const mobileScreen = fs.readFileSync(
        path.join(__dirname, '..', 'mobile', 'lib', 'screens', 'admin', 'admin_questions_screen.dart'),
        'utf8'
    );
    assert.ok(mobileScreen.includes('lastErrorMessage'), 'Mobile AdminQuestionsScreen must show server duplicate error message');
});
