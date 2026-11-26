const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const prisma = require('../api/_config/prisma');
const Category = require('../api/_models/categoryModel');
const Question = require('../api/_models/questionModel');
const Attempt = require('../api/_models/attemptModel');

const EXPECTED_SESSIONS = {
    1: { title: 'Session 1: Introduction to Azure Cloud Computing', shortTitle: 'Introduction to Azure Cloud Computing', count: 55 },
    2: { title: 'Session 2: Understanding Microsoft Azure Cloud Services', shortTitle: 'Understanding Microsoft Azure Cloud Services', count: 54 },
    3: { title: 'Session 3: Data Access Technologies in Azure', shortTitle: 'Data Access Technologies in Azure', count: 54 },
    4: { title: 'Session 4: Data Access Using ADO.NET', shortTitle: 'Data Access Using ADO.NET', count: 54 },
    5: { title: 'Session 5: Data Access Using Entity Framework', shortTitle: 'Data Access Using Entity Framework', count: 55 },
    6: { title: 'Session 6: Data Access Using Third-party Databases and Azure Storage Services', shortTitle: 'Data Access Using Third-party Databases and Azure Storage Services', count: 51 },
    7: { title: 'Session 7: Design and Implementation of Web API', shortTitle: 'Design and Implementation of Web API', count: 55 },
    8: { title: 'Session 8: Security in Web API', shortTitle: 'Security in Web API', count: 55 },
    9: { title: 'Session 9: Hosting and Consuming Web API', shortTitle: 'Hosting and Consuming Web API', count: 52 },
    10: { title: 'Session 10: Introduction to WCF Services', shortTitle: 'Introduction to WCF Services', count: 55 },
    11: { title: 'Session 11: Implementing Azure Serverless Web Services and API Management', shortTitle: 'Implementing Azure Serverless Web Services and API Management', count: 55 },
    12: { title: 'Session 12: Traffic Management and Monitoring Strategies for Web Services', shortTitle: 'Traffic Management and Monitoring Strategies for Web Services', count: 52 },
    13: { title: 'Session 13: Configuring Web Applications for Deployment', shortTitle: 'Configuring Web Applications for Deployment', count: 55 },
    14: { title: 'Session 14: Deploying Web Applications and Services', shortTitle: 'Deploying Web Applications and Services', count: 55 },
    15: { title: 'Session 15: Working with Shared Assemblies', shortTitle: 'Working with Shared Assemblies', count: 55 }
};

test('1. Azure Question Bank: all 15 session JSON/CSV files exist with exact titles and 812 unique MCQs', () => {
    let grandTotal = 0;
    for (let s = 1; s <= 15; s++) {
        const jsonPath = path.join(__dirname, '..', 'scripts', `azure_session${s}.json`);
        const csvPath = path.join(__dirname, '..', 'scripts', `azure_session${s}.csv`);
        assert.ok(fs.existsSync(jsonPath), `Missing ${jsonPath}`);
        assert.ok(fs.existsSync(csvPath), `Missing ${csvPath}`);

        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        assert.equal(data.category, 'Azure');
        assert.equal(data.session, s);
        assert.equal(data.title, EXPECTED_SESSIONS[s].title);
        assert.equal(data.totalQuestions, EXPECTED_SESSIONS[s].count);
        assert.equal(data.questions.length, EXPECTED_SESSIONS[s].count);
        grandTotal += data.questions.length;
    }
    assert.equal(grandTotal, 812, 'Total unique Azure MCQs must equal 812');
});

test('2. Every single one of the 812 Azure MCQs has zero duplicates and grades uniquely', () => {
    const seen = new Map();
    for (let s = 1; s <= 15; s++) {
        const jsonPath = path.join(__dirname, '..', 'scripts', `azure_session${s}.json`);
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
    assert.equal(seen.size, 812);
});

test('3. Question.getSessionsByCategory & getFiltered enrich all 15 Azure sessions and support "Microsoft Azure" alias', async () => {
    const originalFindMany = prisma.question.findMany;
    const mockSessionRows = [];
    for (let s = 1; s <= 15; s++) {
        for (let i = 0; i < EXPECTED_SESSIONS[s].count; i++) {
            mockSessionRows.push({ session: s });
        }
    }
    prisma.question.findMany = async () => mockSessionRows;

    try {
        const sessions = await Question.getSessionsByCategory('Azure');
        assert.equal(sessions.length, 15);
        for (let s = 1; s <= 15; s++) {
            const entry = sessions.find(x => x.session === s);
            assert.ok(entry, `Session ${s} must exist`);
            assert.equal(entry.title, EXPECTED_SESSIONS[s].shortTitle);
            assert.equal(entry.count, EXPECTED_SESSIONS[s].count);
        }

        const aliasSessions = await Question.getSessionsByCategory('Microsoft Azure');
        assert.equal(aliasSessions.length, 15);
        assert.equal(aliasSessions[0].title, EXPECTED_SESSIONS[1].shortTitle);
        assert.equal(aliasSessions[14].title, EXPECTED_SESSIONS[15].shortTitle);

        prisma.question.findMany = async () => ([
            {
                id: 'azure_q_1',
                category: 'Azure',
                session: 11,
                questionText: 'Which of the following is a serverless service in Azure?',
                options: JSON.stringify(['Only Active Directory', 'Only Azure VMs', 'Azure Logic Apps and Azure Functions', 'Only SQL Server']),
                correctAnswer: 'Azure Logic Apps and Azure Functions',
                explanation: '',
                createdAt: new Date()
            }
        ]);
        const filtered = await Question.getFiltered({ category: 'MS Azure', session: 11 });
        assert.equal(filtered.length, 1);
        assert.equal(filtered[0].sessionTitle, EXPECTED_SESSIONS[11].shortTitle);
    } finally {
        prisma.question.findMany = originalFindMany;
    }
});

test('4. Category.getAll does not synthesize Azure when the database is unavailable', async () => {
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

test('5. Web & Mobile client files support Azure logo assets, "microsoft azure" / "ms azure" search aliases, and sessionTitle', () => {
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'public', 'assets', 'tech-logos', 'azure.svg')));
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'mobile', 'assets', 'tech_logos', 'azure.svg')));

    const webTech = fs.readFileSync(path.join(__dirname, '..', 'src', 'pages', 'quiz', 'Technologies.jsx'), 'utf8');
    assert.ok(webTech.includes("q === 'microsoft azure'"), 'Web Technologies.jsx must match "microsoft azure" search alias');

    const webLogos = fs.readFileSync(path.join(__dirname, '..', 'src', 'utils', 'techLogos.js'), 'utf8');
    assert.ok(webLogos.includes("'microsoft azure': ['azure']"), 'Web techLogos.js must resolve "microsoft azure"');

    const webTechDetail = fs.readFileSync(path.join(__dirname, '..', 'src', 'pages', 'quiz', 'TechnologyDetail.jsx'), 'utf8');
    assert.ok(webTechDetail.includes('sessionTitle'), 'Web TechnologyDetail.jsx must pass sessionTitle when starting a session');

    const mobileExplore = fs.readFileSync(
        path.join(__dirname, '..', 'mobile', 'lib', 'screens', 'explore', 'explore_screen.dart'),
        'utf8'
    );
    assert.ok(mobileExplore.includes("q == 'microsoft azure'"), 'Mobile ExploreScreen must match "microsoft azure" search alias');

    const mobileLogos = fs.readFileSync(
        path.join(__dirname, '..', 'mobile', 'lib', 'core', 'constants', 'tech_logo_registry.dart'),
        'utf8'
    );
    assert.ok(mobileLogos.includes("'microsoft azure': ['azure']"), 'Mobile TechLogoRegistry must resolve "microsoft azure"');
});
