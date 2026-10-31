const test = require('node:test');
const assert = require('node:assert/strict');
const GameModel = require('../api/_models/gameModel');
const gameController = require('../api/_controllers/gameController');

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

test('1. Coding & Typing Games Catalog: List contains all 14 educational coding & typing games', async () => {
    const games = await GameModel.getAll();
    assert.ok(Array.isArray(games), 'Games must be returned as an array');
    assert.equal(games.length, 14, 'Must contain exactly 14 coding and typing games');

    const slugs = games.map(g => g.slug);
    // 8 Coding Games
    assert.ok(slugs.includes('code-puzzle'), 'Must include Code Puzzle');
    assert.ok(slugs.includes('find-the-bug'), 'Must include Find the Bug');
    assert.ok(slugs.includes('output-predictor'), 'Must include Output Predictor');
    assert.ok(slugs.includes('code-scramble'), 'Must include Code Scramble');
    assert.ok(slugs.includes('missing-code'), 'Must include Missing Code');
    assert.ok(slugs.includes('logic-builder'), 'Must include Logic Builder');
    assert.ok(slugs.includes('sql-challenge'), 'Must include SQL Challenge');
    assert.ok(slugs.includes('memory-match'), 'Must include Memory Match');

    // 6 Typing Games
    assert.ok(slugs.includes('speed-typing'), 'Must include Speed Typing');
    assert.ok(slugs.includes('code-typing'), 'Must include Code Typing');
    assert.ok(slugs.includes('sixty-second-challenge'), 'Must include 60-Second Challenge');
    assert.ok(slugs.includes('error-free-typing'), 'Must include Error-Free Typing');
    assert.ok(slugs.includes('syntax-typing'), 'Must include Syntax Typing');
    assert.ok(slugs.includes('word-rain'), 'Must include Word Rain');
});

test('2. Educational Categories Filtering: Category filter returns matching Coding vs Typing subsets', async () => {
    const codingGames = await GameModel.getAll({ category: 'Coding Games' });
    assert.equal(codingGames.length, 8, 'Must return exactly 8 Coding Games');
    codingGames.forEach(g => {
        assert.equal(g.category, 'Coding Games');
    });

    const typingGames = await GameModel.getAll({ category: 'Typing Games' });
    assert.equal(typingGames.length, 6, 'Must return exactly 6 Typing Games');
    typingGames.forEach(g => {
        assert.equal(g.category, 'Typing Games');
    });
});

test('3. Game Details: Lookup by slug returns instructions, difficulty, and metadata', async () => {
    const bugGame = await GameModel.findBySlug('find-the-bug');
    assert.ok(bugGame, 'Find the Bug game must exist');
    assert.equal(bugGame.title, 'Find the Bug');
    assert.equal(bugGame.category, 'Coding Games');
    assert.equal(bugGame.difficulty, 'Beginner');
    assert.ok(bugGame.instructions.length > 10, 'Game must contain detailed gameplay instructions');
    assert.ok(bugGame.description.length > 5, 'Game must contain description');
});

test('4. Score Recording & Gamification: Tracks high score, WPM, and accuracy', async () => {
    const testUserId = 'test_user_score_typing_1';
    const slug = 'speed-typing';

    // First attempt
    const res1 = await GameModel.recordScore({
        userId: testUserId,
        gameSlug: slug,
        score: 450,
        wpm: 65,
        accuracy: 98.5,
        durationSeconds: 60
    });
    assert.equal(res1.success, true);
    assert.equal(res1.isNewHighScore, true);
    assert.equal(res1.highScore, 450);
    assert.equal(res1.wpm, 65);
    assert.equal(res1.accuracy, 98.5);
    assert.equal(res1.totalPlays, 1);

    // Second higher score
    const res2 = await GameModel.recordScore({
        userId: testUserId,
        gameSlug: slug,
        score: 620,
        wpm: 82,
        accuracy: 99.1,
        durationSeconds: 58
    });
    assert.equal(res2.success, true);
    assert.equal(res2.isNewHighScore, true);
    assert.equal(res2.highScore, 620);
    assert.equal(res2.totalPlays, 2);
});

test('5. Challenge Sanitization: Client challenge retrieval withholds raw solutions', async () => {
    const challenges = await GameModel.getChallenges('find-the-bug');
    assert.ok(challenges.length > 0, 'Must have Find the Bug challenges');
    challenges.forEach(c => {
        assert.equal(c.solution, undefined, 'Solution must NEVER be exposed in getChallenges payload');
        assert.ok(c.title, 'Challenge must have title');
        assert.ok(c.content, 'Challenge must have content');
    });
});

test('6. Server-Side Challenge Verification: Validates answers and awards points securely', async () => {
    const challenges = await GameModel.getChallenges('find-the-bug');
    const firstChallenge = challenges[0];

    // Correct line number submission (line 3 for sumArray off-by-one bug)
    const verificationCorrect = await GameModel.verifyChallenge('find-the-bug', firstChallenge.id, '3');
    assert.equal(verificationCorrect.isCorrect, true);
    assert.ok(verificationCorrect.points > 0);
    assert.ok(verificationCorrect.explanation.length > 10);

    // Incorrect line number submission
    const verificationWrong = await GameModel.verifyChallenge('find-the-bug', firstChallenge.id, '1');
    assert.equal(verificationWrong.isCorrect, false);
    assert.equal(verificationWrong.points, 0);
});

test('7. Daily Featured Game Challenge: Returns deterministic daily challenge', async () => {
    const daily = await GameModel.getDailyChallenge();
    assert.ok(daily.date, 'Must return date');
    assert.ok(daily.game, 'Must return daily featured game');
    assert.ok(daily.bonusMultiplier >= 1.0, 'Must include bonus multiplier');
});

test('8. Controller API: GET /api/games returns Coding and Typing category counts', async () => {
    const req = { query: {} };
    const res = createMockRes();

    await gameController.getGames(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 14);
    assert.ok(res.body.featuredGame, 'Must return a featured game');
    assert.equal(res.body.categoryCounts['Coding Games'], 8);
    assert.equal(res.body.categoryCounts['Typing Games'], 6);
});

test('9. Controller API: Guest score submission acknowledged without persistence error', async () => {
    const req = {
        params: { slug: 'word-rain' },
        body: { score: 350, wpm: 45, accuracy: 96 },
        user: null,
        cookies: {},
        headers: {}
    };
    const res = createMockRes();

    await gameController.submitScore(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.isGuest, true);
});
