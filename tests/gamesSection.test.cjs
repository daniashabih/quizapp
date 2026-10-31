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

test('1. Games Catalog: Default list contains initial playable games across categories', async () => {
    const games = await GameModel.getAll();
    assert.ok(Array.isArray(games), 'Games must be returned as an array');
    assert.ok(games.length >= 5, 'Must contain at least 5 playable games');

    const slugs = games.map(g => g.slug);
    assert.ok(slugs.includes('tic-tac-toe'), 'Must include Tic Tac Toe');
    assert.ok(slugs.includes('2048'), 'Must include 2048');
    assert.ok(slugs.includes('snake'), 'Must include Snake');
    assert.ok(slugs.includes('memory-match'), 'Must include Memory Match');
    assert.ok(slugs.includes('brick-breaker'), 'Must include Brick Breaker');
});

test('2. Games Filtering: Category filter returns matching subset', async () => {
    const puzzleGames = await GameModel.getAll({ category: 'Puzzle Games' });
    assert.ok(puzzleGames.length > 0, 'Must return puzzle games');
    puzzleGames.forEach(g => {
        assert.equal(g.category, 'Puzzle Games');
    });

    const arcadeGames = await GameModel.getAll({ category: 'Arcade Games' });
    assert.ok(arcadeGames.length > 0, 'Must return arcade games');
    arcadeGames.forEach(g => {
        assert.equal(g.category, 'Arcade Games');
    });
});

test('3. Game Details: Lookup by slug returns instructions and metadata', async () => {
    const snake = await GameModel.findBySlug('snake');
    assert.ok(snake, 'Snake game must exist');
    assert.equal(snake.title, 'Snake Classic');
    assert.ok(snake.instructions.length > 10, 'Game must contain detailed gameplay instructions');
    assert.ok(snake.description.length > 5, 'Game must contain description');
});

test('4. Score Recording & Personal Best: Correctly tracks high score and increments play count', async () => {
    const testUserId = 'test_user_score_1';
    const slug = '2048';

    // First score
    const res1 = await GameModel.recordScore({
        userId: testUserId,
        gameSlug: slug,
        score: 512,
        durationSeconds: 120
    });
    assert.equal(res1.success, true);
    assert.equal(res1.isNewHighScore, true);
    assert.equal(res1.highScore, 512);
    assert.equal(res1.totalPlays, 1);

    // Second lower score -> does not overwrite high score
    const res2 = await GameModel.recordScore({
        userId: testUserId,
        gameSlug: slug,
        score: 256,
        durationSeconds: 60
    });
    assert.equal(res2.success, true);
    assert.equal(res2.isNewHighScore, false);
    assert.equal(res2.highScore, 512);
    assert.equal(res2.totalPlays, 2);

    // Third higher score -> updates high score
    const res3 = await GameModel.recordScore({
        userId: testUserId,
        gameSlug: slug,
        score: 1024,
        durationSeconds: 180
    });
    assert.equal(res3.success, true);
    assert.equal(res3.isNewHighScore, true);
    assert.equal(res3.highScore, 1024);
    assert.equal(res3.totalPlays, 3);
});

test('5. User Game Stats: Aggregates total plays, personal bests, and recent history', async () => {
    const testUserId = 'test_user_stats_2';

    await GameModel.recordScore({ userId: testUserId, gameSlug: 'tic-tac-toe', score: 10 });
    await GameModel.recordScore({ userId: testUserId, gameSlug: 'snake', score: 80 });

    const stats = await GameModel.getUserStats(testUserId);
    assert.ok(stats.totalPlayed >= 2, 'Should aggregate total plays');
    assert.equal(stats.highScores['tic-tac-toe'], 10);
    assert.equal(stats.highScores['snake'], 80);
});

test('6. Favorite Toggle: Allows favoriting and unfavoriting games', async () => {
    const testUserId = 'test_user_fav_3';
    const slug = 'memory-match';

    const fav1 = await GameModel.toggleFavorite(testUserId, slug);
    assert.equal(fav1, true, 'First toggle should favorite the game');

    const stats = await GameModel.getUserStats(testUserId);
    assert.ok(stats.favorites.includes(slug), 'Favorites should list the favorited game');

    const fav2 = await GameModel.toggleFavorite(testUserId, slug);
    assert.equal(fav2, false, 'Second toggle should unfavorite the game');
});

test('7. Controller API: GET /api/games returns payload with categories and featured game', async () => {
    const req = { query: {} };
    const res = createMockRes();

    await gameController.getGames(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length >= 5);
    assert.ok(res.body.featuredGame, 'Must return a featured game');
    assert.ok(res.body.categoryCounts['All Games'] >= 5);
});

test('8. Controller API: Guest score submission acknowledged without error', async () => {
    const req = {
        params: { slug: 'snake' },
        body: { score: 120 },
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

test('9. Admin Game Management: Can create, update, and toggle publish status', async () => {
    const reqCreate = {
        body: {
            title: 'Test New Game',
            category: 'Casual Games',
            description: 'Test description',
            instructions: 'Test instructions',
            badge: 'New'
        }
    };
    const resCreate = createMockRes();
    await gameController.adminCreateGame(reqCreate, resCreate);
    assert.equal(resCreate.statusCode, 201);
    assert.equal(resCreate.body.success, true);
    const createdId = resCreate.body.data.id || resCreate.body.data.slug;

    // Toggle publish
    const reqToggle = { params: { id: createdId } };
    const resToggle = createMockRes();
    await gameController.adminTogglePublish(reqToggle, resToggle);
    assert.equal(resToggle.statusCode, 200);
    assert.equal(resToggle.body.success, true);

    // Delete
    const reqDelete = { params: { id: createdId } };
    const resDelete = createMockRes();
    await gameController.adminDeleteGame(reqDelete, resDelete);
    assert.equal(resDelete.statusCode, 200);
    assert.equal(resDelete.body.success, true);
});
