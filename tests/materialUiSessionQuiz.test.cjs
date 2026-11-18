const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const prisma = require('../api/_config/prisma');
const Question = require('../api/_models/questionModel');
const Attempt = require('../api/_models/attemptModel');

const EXPECTED_SESSIONS = {
    1: { title: 'Session 1: Introduction to UI', shortTitle: 'Introduction to UI', count: 50 },
    2: { title: 'Session 2: Introduction to Material Design', shortTitle: 'Introduction to Material Design', count: 50 },
    3: { title: 'Session 3: Creating a Material Design Type and Component System', shortTitle: 'Creating a Material Design Type and Component System', count: 50 }
};

test('1. Material UI Question Bank: all 3 session JSON/CSV files exist with exact titles and 150 total MCQs', () => {
    let grandTotal = 0;
    for (let s = 1; s <= 3; s++) {
        const jsonPath = path.join(__dirname, '..', 'scripts', `materialui_session${s}.json`);
        const csvPath = path.join(__dirname, '..', 'scripts', `materialui_session${s}.csv`);
        assert.ok(fs.existsSync(jsonPath), `Missing ${jsonPath}`);
        assert.ok(fs.existsSync(csvPath), `Missing ${csvPath}`);

        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        assert.equal(data.category, 'Material UI');
        assert.equal(data.session, s);
        assert.equal(data.title, EXPECTED_SESSIONS[s].title);
        assert.equal(data.totalQuestions, EXPECTED_SESSIONS[s].count);
        assert.equal(data.questions.length, EXPECTED_SESSIONS[s].count);
        grandTotal += data.questions.length;
    }
    assert.equal(grandTotal, 150, 'Total Material UI MCQs must equal 150');
});

test('2. Every single one of the 150 Material UI MCQs has zero duplicates and grades uniquely', () => {
    const seen = new Map();
    for (let s = 1; s <= 3; s++) {
        const jsonPath = path.join(__dirname, '..', 'scripts', `materialui_session${s}.json`);
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
    assert.equal(seen.size, 150);
});

test('3. Question.getSessionsByCategory enriches all 3 Material UI sessions with titles and supports MUI alias', async () => {
    const originalFindMany = prisma.question.findMany;
    const mockRows = [];
    for (let s = 1; s <= 3; s++) {
        for (let i = 0; i < EXPECTED_SESSIONS[s].count; i++) {
            mockRows.push({ session: s });
        }
    }
    prisma.question.findMany = async () => mockRows;

    try {
        const sessions = await Question.getSessionsByCategory('Material UI');
        assert.equal(sessions.length, 3);
        for (let s = 1; s <= 3; s++) {
            const entry = sessions.find(x => x.session === s);
            assert.ok(entry, `Session ${s} must exist`);
            assert.equal(entry.title, EXPECTED_SESSIONS[s].shortTitle);
            assert.equal(entry.count, EXPECTED_SESSIONS[s].count);
        }

        const aliasSessions = await Question.getSessionsByCategory('MUI');
        assert.equal(aliasSessions.length, 3);
        assert.equal(aliasSessions[0].title, EXPECTED_SESSIONS[1].shortTitle);
    } finally {
        prisma.question.findMany = originalFindMany;
    }
});

test('4. Web & Mobile client files support Material UI logo assets and MUI search aliases', () => {
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'public', 'assets', 'tech-logos', 'materialui.svg')));
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'mobile', 'assets', 'tech_logos', 'materialui.svg')));

    const webTech = fs.readFileSync(path.join(__dirname, '..', 'src', 'pages', 'quiz', 'Technologies.jsx'), 'utf8');
    assert.ok(webTech.includes("q === 'mui'"), 'Web Technologies.jsx must match "mui" search alias');

    const mobileExplore = fs.readFileSync(
        path.join(__dirname, '..', 'mobile', 'lib', 'screens', 'explore', 'explore_screen.dart'),
        'utf8'
    );
    assert.ok(mobileExplore.includes("q == 'mui'"), 'Mobile ExploreScreen must match "mui" search alias');
});
