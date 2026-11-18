const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const prisma = require('../api/_config/prisma');
const Question = require('../api/_models/questionModel');
const Attempt = require('../api/_models/attemptModel');

const EXPECTED_SESSIONS = {
    1: { title: 'Session 1: Introduction to ReactJS', shortTitle: 'Introduction to ReactJS', count: 52 },
    2: { title: 'Session 2: ReactJS Components', shortTitle: 'ReactJS Components', count: 48 },
    3: { title: 'Session 3: JSX Elements', shortTitle: 'JSX Elements', count: 47 },
    4: { title: 'Session 4: Event Handling in ReactJS', shortTitle: 'Event Handling in ReactJS', count: 51 },
    5: { title: 'Session 5: ReactJS Router', shortTitle: 'ReactJS Router', count: 52 },
    6: { title: 'Session 6: Styling React Elements', shortTitle: 'Styling React Elements', count: 50 },
    7: { title: 'Session 7: ReactJS Component Lifecycle', shortTitle: 'ReactJS Component Lifecycle', count: 49 },
    8: { title: 'Session 8: Creating a CRUD Application Using ReactJS Forms', shortTitle: 'Creating a CRUD Application Using ReactJS Forms', count: 50 }
};

test('1. React.js Question Bank: all 8 session JSON/CSV files exist with exact titles and 399 total MCQs', () => {
    let grandTotal = 0;
    for (let s = 1; s <= 8; s++) {
        const jsonPath = path.join(__dirname, '..', 'scripts', `reactjs_session${s}.json`);
        const csvPath = path.join(__dirname, '..', 'scripts', `reactjs_session${s}.csv`);
        assert.ok(fs.existsSync(jsonPath), `Missing ${jsonPath}`);
        assert.ok(fs.existsSync(csvPath), `Missing ${csvPath}`);

        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        assert.equal(data.category, 'React.js');
        assert.equal(data.session, s);
        assert.equal(data.title, EXPECTED_SESSIONS[s].title);
        assert.equal(data.totalQuestions, EXPECTED_SESSIONS[s].count);
        assert.equal(data.questions.length, EXPECTED_SESSIONS[s].count);
        grandTotal += data.questions.length;
    }
    assert.equal(grandTotal, 399, 'Total React.js MCQs must equal 399');
});

test('2. Every single one of the 399 React.js MCQs has zero duplicates and grades uniquely', () => {
    const seen = new Map();
    for (let s = 1; s <= 8; s++) {
        const jsonPath = path.join(__dirname, '..', 'scripts', `reactjs_session${s}.json`);
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        data.questions.forEach((q, idx) => {
            assert.equal(q.options.length, 4, `Session ${s} Q${idx + 1} must have 4 options`);
            assert.ok(q.options.includes(q.correctAnswer), `Session ${s} Q${idx + 1} correctAnswer must exist in options`);

            const correctIdx = Attempt.getQuestionCorrectIndex(q);
            assert.ok(correctIdx >= 0 && correctIdx < 4, `Session ${s} Q${idx + 1} must resolve valid correct index`);
            assert.equal(q.options[correctIdx], q.correctAnswer);
            assert.equal(Attempt.evaluateAnswerCorrectness(correctIdx, q), true);

            for (let i = 0; i < 4; i++) {
                if (i !== correctIdx) {
                    assert.equal(
                        Attempt.evaluateAnswerCorrectness(i, q),
                        false,
                        `Session ${s} Q${idx + 1} option ${i} should evaluate false`
                    );
                }
            }

            const norm = Question.normalizeQuestionText(q.questionText);
            assert.equal(seen.has(norm), false, `Duplicate question found (${seen.get(norm)} vs S${s} Q${idx + 1}): ${q.questionText}`);
            seen.set(norm, `S${s} Q${idx + 1}`);
        });
    }
    assert.equal(seen.size, 399);
});

test('3. Question.getSessionsByCategory enriches all 8 React.js sessions with human-readable titles', async () => {
    const originalFindMany = prisma.question.findMany;
    const mockRows = [];
    for (let s = 1; s <= 8; s++) {
        for (let i = 0; i < EXPECTED_SESSIONS[s].count; i++) {
            mockRows.push({ session: s });
        }
    }
    prisma.question.findMany = async () => mockRows;

    try {
        const sessions = await Question.getSessionsByCategory('React.js');
        assert.equal(sessions.length, 8);
        for (let s = 1; s <= 8; s++) {
            const entry = sessions.find(x => x.session === s);
            assert.ok(entry, `Session ${s} must exist`);
            assert.equal(entry.title, EXPECTED_SESSIONS[s].shortTitle);
            assert.equal(entry.count, EXPECTED_SESSIONS[s].count);
        }

        const aliasSessions = await Question.getSessionsByCategory('React JS');
        assert.equal(aliasSessions.length, 8);
        assert.equal(aliasSessions[0].title, EXPECTED_SESSIONS[1].shortTitle);
    } finally {
        prisma.question.findMany = originalFindMany;
    }
});

test('4. Web & Mobile client files support React JS search aliases and session title propagation', () => {
    const webTech = fs.readFileSync(path.join(__dirname, '..', 'src', 'pages', 'quiz', 'Technologies.jsx'), 'utf8');
    assert.ok(webTech.includes("q === 'react js'"), 'Web Technologies.jsx must match "react js" search alias');

    const webTechDetail = fs.readFileSync(path.join(__dirname, '..', 'src', 'pages', 'quiz', 'TechnologyDetail.jsx'), 'utf8');
    assert.ok(webTechDetail.includes('sessionTitle'), 'Web TechnologyDetail.jsx must pass sessionTitle when starting a session');

    const mobileExplore = fs.readFileSync(
        path.join(__dirname, '..', 'mobile', 'lib', 'screens', 'explore', 'explore_screen.dart'),
        'utf8'
    );
    assert.ok(mobileExplore.includes("q == 'react js'"), 'Mobile ExploreScreen must match "react js" search alias');
});
