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

test('Code Puzzle: Dynamic challenges loading with sanitized solutions', async () => {
    const challenges = await GameModel.getChallenges('code-puzzle');
    assert.ok(Array.isArray(challenges), 'Challenges must be an array');
    assert.equal(challenges.length, 4, 'Must return exactly 4 curated puzzles');

    // Verify 4 puzzles
    const titles = challenges.map(c => c.title);
    assert.ok(titles.includes('Filter & Map Evens Squared'));
    assert.ok(titles.includes('Python Fibonacci Generator'));
    assert.ok(titles.includes('SQL Top Department Salaries'));
    assert.ok(titles.includes('HTML Semantic Card Structure'));

    // Verify solutions are WITHHELD from client
    challenges.forEach(c => {
        assert.equal(c.solution, undefined, 'Solution must NEVER be exposed in getChallenges');
        assert.ok(Array.isArray(c.blocks), 'Blocks array must be present');
        assert.ok(c.blocks.length >= 3, 'Must have at least 3 statements to rearrange');
        assert.ok(c.difficulty, 'Difficulty must be defined');
        assert.ok(c.language, 'Programming language must be defined');
    });
});

test('Code Puzzle: Validation awards points only for correct arrangement', async () => {
    const challenges = await GameModel.getChallenges('code-puzzle');
    const firstPuzzle = challenges[0];

    // Correct arrangement
    const correctSequence = [
        'const numbers = [1, 2, 3, 4, 5, 6];',
        'const evens = numbers.filter(n => n % 2 === 0);',
        'const squared = evens.map(n => n * n);',
        'return squared;'
    ];
    const correctRes = await GameModel.verifyChallenge('code-puzzle', firstPuzzle.id, correctSequence);
    assert.equal(correctRes.isCorrect, true, 'Correct sequence must validate as true');
    assert.ok(correctRes.points > 0, 'Points must be awarded for correct answer');
    assert.ok(correctRes.explanation, 'Explanation must be provided');

    // Incorrect arrangement
    const wrongSequence = [
        'return squared;',
        'const squared = evens.map(n => n * n);',
        'const numbers = [1, 2, 3, 4, 5, 6];',
        'const evens = numbers.filter(n => n % 2 === 0);'
    ];
    const wrongRes = await GameModel.verifyChallenge('code-puzzle', firstPuzzle.id, wrongSequence);
    assert.equal(wrongRes.isCorrect, false, 'Wrong sequence must validate as false');
    assert.equal(wrongRes.points, 0, 'Zero points must be awarded for incorrect answer');
    assert.ok(wrongRes.solution, 'Solution may be provided for reveal upon failure');
});

test('Code Puzzle: Progress Save, Resume, and Reset', async () => {
    const testUserId = 'test_player_puzzle_prog_1';

    // 1. Save progress
    const saveReq = {
        params: { slug: 'code-puzzle' },
        user: { id: testUserId },
        body: {
            puzzleIndex: 2,
            score: 300,
            streak: 2,
            completedPuzzles: ['cp_1', 'cp_2'],
            currentBlocks: ['def get_fib(n):', 'fib = [0, 1]']
        }
    };
    const saveRes = createMockRes();
    await gameController.saveProgress(saveReq, saveRes);
    assert.equal(saveRes.statusCode, 200);
    assert.equal(saveRes.body.success, true);

    // 2. Resume progress
    const getReq = {
        params: { slug: 'code-puzzle' },
        user: { id: testUserId }
    };
    const getRes = createMockRes();
    await gameController.getProgress(getReq, getRes);
    assert.equal(getRes.statusCode, 200);
    assert.equal(getRes.body.success, true);
    assert.equal(getRes.body.data.puzzleIndex, 2);
    assert.equal(getRes.body.data.score, 300);
    assert.equal(getRes.body.data.streak, 2);
    assert.deepEqual(getRes.body.data.completedPuzzles, ['cp_1', 'cp_2']);

    // 3. Clear progress (upon restart or completion)
    const clearReq = {
        params: { slug: 'code-puzzle' },
        user: { id: testUserId }
    };
    const clearRes = createMockRes();
    await gameController.clearProgress(clearReq, clearRes);
    assert.equal(clearRes.statusCode, 200);
    assert.equal(clearRes.body.success, true);

    // 4. Verify cleared
    const verifyReq = {
        params: { slug: 'code-puzzle' },
        user: { id: testUserId }
    };
    const verifyRes = createMockRes();
    await gameController.getProgress(verifyReq, verifyRes);
    assert.equal(verifyRes.body.data, null);
});

test('Code Puzzle: Score Submission and Personal Best tracking', async () => {
    const testUserId = 'test_player_puzzle_score_1';

    // Submit first score
    const res1 = await GameModel.recordScore({
        userId: testUserId,
        gameSlug: 'code-puzzle',
        score: 600,
        accuracy: 100,
        durationSeconds: 45,
        metadata: { puzzlesSolved: 4 }
    });
    assert.equal(res1.success, true);
    assert.equal(res1.isNewHighScore, true);
    assert.equal(res1.highScore, 600);
    assert.equal(res1.totalPlays, 1);

    // Submit lower score
    const res2 = await GameModel.recordScore({
        userId: testUserId,
        gameSlug: 'code-puzzle',
        score: 400,
        accuracy: 100,
        durationSeconds: 60,
        metadata: { puzzlesSolved: 3 }
    });
    assert.equal(res2.success, true);
    assert.equal(res2.isNewHighScore, false);
    assert.equal(res2.highScore, 600, 'Best score must remain at 600');
    assert.equal(res2.totalPlays, 2);
});
