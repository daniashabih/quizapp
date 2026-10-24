const test = require('node:test');
const assert = require('node:assert/strict');

const prisma = require('../api/_config/prisma');
const dashboardController = require('../api/_controllers/dashboardController');
const quizController = require('../api/_controllers/quizController');
const Result = require('../api/_models/resultModel');
const Setting = require('../api/_models/settingModel');

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

test('1. Leaderboard calculates XP, average score, certs, and sorts deterministically while excluding 0-quiz users', async () => {
    const origUserFindMany = prisma.user.findMany;
    const now = new Date();

    try {
        prisma.user.findMany = async () => [
            {
                id: 'u_unranked',
                name: 'No Quizzes User',
                email: 'noquiz@example.com',
                avatar: '',
                role: 'user',
                createdAt: now,
                results: []
            },
            {
                id: 'u_second',
                name: 'Alice Runner',
                email: 'alice@example.com',
                avatar: '',
                role: 'user',
                createdAt: now,
                results: [
                    // 80% -> 80*10 + 100 = 900 XP
                    { id: 'r1', category: 'React', score: 8, total: 10, percentage: 80, createdAt: now }
                ]
            },
            {
                id: 'u_first',
                name: 'Bob Champion',
                email: 'bob@example.com',
                avatar: '',
                role: 'admin',
                createdAt: now,
                results: [
                    // 90% -> 90*10 + 100 = 1000 XP
                    { id: 'r2', category: 'JavaScript', score: 9, total: 10, percentage: 90, createdAt: now },
                    // 100% -> 100*10 + 100 = 1100 XP
                    { id: 'r3', category: 'JavaScript', score: 10, total: 10, percentage: 100, createdAt: now }
                ]
            }
        ];

        const req = { query: { timeframe: 'all-time', category: 'All' } };
        const res = createMockRes();
        await dashboardController.getLeaderboard(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.totalRanked, 2, 'User with 0 completed quizzes must be excluded from rankings');
        assert.equal(res.body.leaderboard.length, 2);

        const first = res.body.leaderboard[0];
        const second = res.body.leaderboard[1];

        assert.equal(first.id, 'u_first');
        assert.equal(first.rank, 1);
        assert.equal(first.xp, 2100);
        assert.equal(first.score, 95);
        assert.equal(first.quizzes, 2);
        assert.equal(first.certs, 2);
        assert.equal(first.category, 'JavaScript');
        assert.equal(first.role, 'Administrator');

        assert.equal(second.id, 'u_second');
        assert.equal(second.rank, 2);
        assert.equal(second.xp, 900);
        assert.equal(second.score, 80);
        assert.equal(second.quizzes, 1);
        assert.equal(second.certs, 1);

        // Verify no private data is leaked
        for (const entry of res.body.leaderboard) {
            assert.equal('email' in entry, false, 'Public leaderboard must not expose user email addresses');
            assert.equal('password' in entry, false, 'Public leaderboard must not expose password hashes');
            assert.equal('resetToken' in entry, false, 'Public leaderboard must not expose reset tokens');
        }
    } finally {
        prisma.user.findMany = origUserFindMany;
    }
});

test('2. Leaderboard handles empty datasets and category filters cleanly', async () => {
    const origUserFindMany = prisma.user.findMany;
    const now = new Date();

    try {
        prisma.user.findMany = async () => [
            {
                id: 'u1',
                name: 'React Dev',
                avatar: '',
                role: 'user',
                createdAt: now,
                results: [
                    { id: 'r1', category: 'React', score: 9, total: 10, percentage: 90, createdAt: now }
                ]
            }
        ];

        // Query a category with no completions
        const reqEmptyCat = { query: { timeframe: 'all-time', category: 'Python' } };
        const resEmptyCat = createMockRes();
        await dashboardController.getLeaderboard(reqEmptyCat, resEmptyCat);

        assert.equal(resEmptyCat.statusCode, 200);
        assert.equal(resEmptyCat.body.totalRanked, 0);
        assert.deepEqual(resEmptyCat.body.leaderboard, []);

        // Query matching category
        const reqReactCat = { query: { timeframe: 'all-time', category: 'React' } };
        const resReactCat = createMockRes();
        await dashboardController.getLeaderboard(reqReactCat, resReactCat);

        assert.equal(resReactCat.statusCode, 200);
        assert.equal(resReactCat.body.totalRanked, 1);
        assert.equal(resReactCat.body.leaderboard[0].id, 'u1');
        assert.equal(resReactCat.body.leaderboard[0].rank, 1);
    } finally {
        prisma.user.findMany = origUserFindMany;
    }
});

test('3. User Dashboard global rank matches Leaderboard XP ranking formula', async () => {
    const origUserFindUnique = prisma.user.findUnique;
    const origQuizResultFindMany = prisma.quizResult.findMany;
    const origQuizAttemptFindMany = prisma.quizAttempt.findMany;
    const now = new Date();

    try {
        prisma.user.findUnique = async ({ where }) => ({
            id: where.id,
            name: 'Target Learner',
            email: 'target@example.com',
            role: 'user',
            avatar: '',
            isVerified: true,
            createdAt: now
        });

        prisma.quizAttempt.findMany = async () => [];

        const targetUserResults = [
            // 80% -> 900 XP
            { id: 'r_target_1', userId: 'u_target', category: 'React', session: 1, score: 8, total: 10, percentage: 80, createdAt: now }
        ];

        const allSystemResults = [
            ...targetUserResults,
            // u_leader has 90% -> 1000 XP (Rank #1)
            { id: 'r_leader_1', userId: 'u_leader', category: 'React', session: 1, score: 9, total: 10, percentage: 90, createdAt: now },
            // u_third has 50% -> 500 XP (Rank #3)
            { id: 'r_third_1', userId: 'u_third', category: 'React', session: 1, score: 5, total: 10, percentage: 50, createdAt: now }
        ];

        prisma.quizResult.findMany = async (args) => {
            if (args && args.where && args.where.userId) {
                return targetUserResults;
            }
            return allSystemResults;
        };

        const req = { user: { id: 'u_target' } };
        const res = createMockRes();
        await dashboardController.getUserDashboard(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.stats.xp, 900);
        assert.equal(res.body.data.stats.rank, 2, 'u_target (900 XP) must rank #2 behind u_leader (1000 XP) and ahead of u_third (500 XP)');
    } finally {
        prisma.user.findUnique = origUserFindUnique;
        prisma.quizResult.findMany = origQuizResultFindMany;
        prisma.quizAttempt.findMany = origQuizAttemptFindMany;
    }
});

test('4. Duplicate quiz submissions within 30 seconds do not create duplicate QuizResult records', async () => {
    const origFindFirst = prisma.quizResult.findFirst;
    const origCreate = prisma.quizResult.create;
    const origQuestionFindMany = prisma.question.findMany;
    const origQuestionCount = prisma.question.count;
    const origSettingGet = Setting.get;

    const savedResults = [];

    try {
        Setting.get = async () => ({
            passingScore: 70,
            certificatePassingScore: 80,
            certificateEnabled: true
        });

        prisma.question.findMany = async () => [
            {
                id: 'q1',
                category: 'React',
                session: 1,
                options: JSON.stringify(['A', 'B', 'C', 'D']),
                correctAnswer: 'B'
            }
        ];
        prisma.question.count = async () => 1;

        prisma.quizResult.findFirst = async ({ where }) => {
            return savedResults.find(
                r =>
                    r.userId === where.userId &&
                    r.category === where.category &&
                    r.session === where.session &&
                    r.score === where.score &&
                    r.total === where.total &&
                    (!where.createdAt?.gte || r.createdAt >= where.createdAt.gte)
            ) || null;
        };

        prisma.quizResult.create = async ({ data }) => {
            const record = {
                id: `res_${savedResults.length + 1}`,
                ...data,
                createdAt: new Date()
            };
            savedResults.push(record);
            return record;
        };

        const req = {
            user: { id: 'u_dup_test', name: 'Dup Tester' },
            body: {
                category: 'React',
                session: 1,
                answers: { q1: 1 }
            }
        };

        const res1 = createMockRes();
        await quizController.submitQuiz(req, res1);

        const res2 = createMockRes();
        await quizController.submitQuiz(req, res2);

        assert.equal(savedResults.length, 1, 'Duplicate submission within 30s must not insert a second QuizResult row');
        assert.equal(res1.body.resultId, 'res_1');
        assert.equal(res2.body.resultId, 'res_1');

        // Also test Result.create directly
        const id3 = await Result.create('u_dup_test', 'React', 1, 1, 100, 1);
        assert.equal(id3, 'res_1');
        assert.equal(savedResults.length, 1);
    } finally {
        prisma.quizResult.findFirst = origFindFirst;
        prisma.quizResult.create = origCreate;
        prisma.question.findMany = origQuestionFindMany;
        prisma.question.count = origQuestionCount;
        Setting.get = origSettingGet;
    }
});
