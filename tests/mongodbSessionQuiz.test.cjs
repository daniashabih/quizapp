const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const prisma = require('../api/_config/prisma');
const Category = require('../api/_models/categoryModel');
const Question = require('../api/_models/questionModel');
const Attempt = require('../api/_models/attemptModel');

const EXPECTED_SESSIONS = {
    1: { title: 'Session 1: Introduction to NoSQL Databases', shortTitle: 'Introduction to NoSQL Databases', count: 50 },
    2: { title: 'Session 2: MongoDB - A Database for the Modern Web', shortTitle: 'MongoDB - A Database for the Modern Web', count: 50 },
    3: { title: 'Session 3: CRUD Operations in MongoDB', shortTitle: 'CRUD Operations in MongoDB', count: 50 },
    4: { title: 'Session 4: Indexing and Aggregation in MongoDB', shortTitle: 'Indexing and Aggregation in MongoDB', count: 50 },
    5: { title: 'Session 5: Replication and Sharding in MongoDB', shortTitle: 'Replication and Sharding in MongoDB', count: 50 },
    6: { title: 'Session 6: Developing Java and Node JS Applications with MongoDB', shortTitle: 'Developing Java and Node JS Applications with MongoDB', count: 50 },
    7: { title: 'Session 7: Administration of MongoDB Cluster Operations', shortTitle: 'Administration of MongoDB Cluster Operations', count: 50 }
};

test('1. MongoDB Question Bank: all 7 session JSON/CSV files exist with exact titles and 350 total MCQs', () => {
    let grandTotal = 0;
    for (let s = 1; s <= 7; s++) {
        const jsonPath = path.join(__dirname, '..', 'scripts', `mongodb_session${s}.json`);
        const csvPath = path.join(__dirname, '..', 'scripts', `mongodb_session${s}.csv`);
        assert.ok(fs.existsSync(jsonPath), `Missing ${jsonPath}`);
        assert.ok(fs.existsSync(csvPath), `Missing ${csvPath}`);

        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        assert.equal(data.category, 'MongoDB');
        assert.equal(data.session, s);
        assert.equal(data.title, EXPECTED_SESSIONS[s].title);
        assert.equal(data.totalQuestions, EXPECTED_SESSIONS[s].count);
        assert.equal(data.questions.length, EXPECTED_SESSIONS[s].count);
        grandTotal += data.questions.length;
    }
    assert.equal(grandTotal, 350, 'Total MongoDB MCQs must equal 350');
});

test('2. Every single one of the 350 MongoDB MCQs has zero duplicates and grades uniquely', () => {
    const seen = new Map();
    for (let s = 1; s <= 7; s++) {
        const jsonPath = path.join(__dirname, '..', 'scripts', `mongodb_session${s}.json`);
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
    assert.equal(seen.size, 350);
});

test('3. Question.getSessionsByCategory & getFiltered enrich all 7 MongoDB sessions and support "Mongo DB" alias', async () => {
    const originalFindMany = prisma.question.findMany;
    const mockSessionRows = [];
    for (let s = 1; s <= 7; s++) {
        for (let i = 0; i < EXPECTED_SESSIONS[s].count; i++) {
            mockSessionRows.push({ session: s });
        }
    }
    prisma.question.findMany = async () => mockSessionRows;

    try {
        const sessions = await Question.getSessionsByCategory('MongoDB');
        assert.equal(sessions.length, 7);
        for (let s = 1; s <= 7; s++) {
            const entry = sessions.find(x => x.session === s);
            assert.ok(entry, `Session ${s} must exist`);
            assert.equal(entry.title, EXPECTED_SESSIONS[s].shortTitle);
            assert.equal(entry.count, EXPECTED_SESSIONS[s].count);
        }

        const aliasSessions = await Question.getSessionsByCategory('Mongo DB');
        assert.equal(aliasSessions.length, 7);
        assert.equal(aliasSessions[0].title, EXPECTED_SESSIONS[1].shortTitle);
        assert.equal(aliasSessions[6].title, EXPECTED_SESSIONS[7].shortTitle);

        prisma.question.findMany = async () => ([
            {
                id: 'mongo_q_1',
                category: 'MongoDB',
                session: 4,
                questionText: 'What are indexes in MongoDB?',
                options: JSON.stringify(['A', 'B', 'C', 'D']),
                correctAnswer: 'B',
                explanation: '',
                createdAt: new Date()
            }
        ]);
        const filtered = await Question.getFiltered({ category: 'Mongo DB', session: 4 });
        assert.equal(filtered.length, 1);
        assert.equal(filtered[0].sessionTitle, EXPECTED_SESSIONS[4].shortTitle);
    } finally {
        prisma.question.findMany = originalFindMany;
    }
});

test('4. Category.getAll does not synthesize MongoDB when the database is unavailable', async () => {
    const originalFindMany = prisma.category.findMany;
    const originalGroupBy = prisma.question.groupBy;
    const originalQuestionFindMany = prisma.question.findMany;
    prisma.category.findMany = async () => {
        throw new Error('Simulated offline fallback');
    };
    prisma.question.groupBy = async () => [];
    prisma.question.findMany = async () => [];
    try {
        await assert.rejects(Category.getAll(), /Simulated offline fallback/);
    } finally {
        prisma.category.findMany = originalFindMany;
        prisma.question.groupBy = originalGroupBy;
        prisma.question.findMany = originalQuestionFindMany;
    }
});

test('5. Web & Mobile client files support MongoDB logo assets, "mongo db" search aliases, and sessionTitle', () => {
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'public', 'assets', 'tech-logos', 'mongodb.svg')));
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'mobile', 'assets', 'tech_logos', 'mongodb.svg')));

    const webTech = fs.readFileSync(path.join(__dirname, '..', 'src', 'pages', 'quiz', 'Technologies.jsx'), 'utf8');
    assert.ok(webTech.includes("q === 'mongo db'"), 'Web Technologies.jsx must match "mongo db" search alias');

    const webLogos = fs.readFileSync(path.join(__dirname, '..', 'src', 'utils', 'techLogos.js'), 'utf8');
    assert.ok(webLogos.includes("'mongo db': ['mongodb']"), 'Web techLogos.js must resolve "mongo db"');

    const webTechDetail = fs.readFileSync(path.join(__dirname, '..', 'src', 'pages', 'quiz', 'TechnologyDetail.jsx'), 'utf8');
    assert.ok(webTechDetail.includes('sessionTitle'), 'Web TechnologyDetail.jsx must pass sessionTitle when starting a session');

    const mobileExplore = fs.readFileSync(
        path.join(__dirname, '..', 'mobile', 'lib', 'screens', 'explore', 'explore_screen.dart'),
        'utf8'
    );
    assert.ok(mobileExplore.includes("q == 'mongo db'"), 'Mobile ExploreScreen must match "mongo db" search alias');

    const mobileLogos = fs.readFileSync(
        path.join(__dirname, '..', 'mobile', 'lib', 'core', 'constants', 'tech_logo_registry.dart'),
        'utf8'
    );
    assert.ok(mobileLogos.includes("'mongo db': ['mongodb']"), 'Mobile TechLogoRegistry must resolve "mongo db"');
});
