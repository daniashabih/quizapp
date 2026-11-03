const test = require('node:test');
const assert = require('node:assert/strict');
const TechnologyModel = require('../api/_models/technologyModel');
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

test('1. Technology Categories: Returns all 6 required primary development categories', async () => {
    const categories = await TechnologyModel.getAllCategories();
    assert.ok(Array.isArray(categories), 'Categories must be an array');
    assert.ok(categories.length >= 6, 'Must contain at least 6 categories');

    const expectedSlugs = [
        'frontend-development',
        'backend-development',
        'database',
        'mobile-development',
        'programming-fundamentals',
        'web-development'
    ];

    const actualSlugs = categories.map(c => c.slug);
    expectedSlugs.forEach(slug => {
        assert.ok(actualSlugs.includes(slug), `Must include category slug: ${slug}`);
    });

    categories.forEach(cat => {
        assert.ok(cat.id, 'Category must have an id');
        assert.ok(cat.name, 'Category must have a name');
        assert.ok(cat.slug, 'Category must have a slug');
        assert.ok(cat.description, 'Category must have a description');
        assert.ok(cat.icon, 'Category must have an icon');
        assert.equal(cat.isEnabled, true, 'Category must be enabled');
    });
});

test('2. Technologies Catalog: Returns all 23 official programming technologies across categories', async () => {
    const technologies = await TechnologyModel.getAllTechnologies();
    assert.ok(Array.isArray(technologies), 'Technologies must be an array');
    assert.equal(technologies.length, 23, 'Must contain all 23 programming technologies');

    const expectedSlugs = [
        // Frontend Development
        'html', 'css', 'javascript', 'bootstrap', 'jquery', 'react',
        // Backend Development
        'php', 'laravel', 'nodejs', 'express', 'python',
        // Database
        'mysql', 'mongodb', 'sql',
        // Mobile Development
        'flutter', 'dart', 'android-development',
        // Programming Fundamentals
        'programming-logic', 'oop', 'dsa',
        // Web Development
        'html-css', 'full-stack', 'web-fundamentals'
    ];

    const actualSlugs = technologies.map(t => t.slug);
    expectedSlugs.forEach(slug => {
        assert.ok(actualSlugs.includes(slug), `Must contain technology slug: ${slug}`);
    });

    technologies.forEach(tech => {
        assert.ok(tech.id, 'Technology must have an id');
        assert.ok(tech.name, 'Technology must have a name');
        assert.ok(tech.categorySlug, 'Technology must belong to a categorySlug');
        assert.ok(tech.color, 'Technology must define a theme color');
        assert.ok(Array.isArray(tech.supportedGames), 'Technology must list supportedGames');
        assert.ok(tech.supportedGames.length > 0, `${tech.name} must support at least one game`);
        assert.equal(tech.isEnabled, true, 'Technology must be active by default');
    });
});

test('3. Game Filtering by Technology: Technology-specific filtering restricts game list appropriately', async () => {
    const allTechs = await TechnologyModel.getAllTechnologies();
    const reactTech = allTechs.find(t => t.slug === 'react');
    assert.ok(reactTech, 'React technology must exist');

    // React games
    const reactGames = await GameModel.getAll({ technology: 'react' });
    assert.ok(reactGames.length > 0, 'React must support games');
    reactGames.forEach(g => {
        assert.ok(
            reactTech.supportedGames.includes(g.slug),
            `Game ${g.slug} must be in React supportedGames`
        );
    });

    // SQL games
    const mysqlTech = allTechs.find(t => t.slug === 'mysql');
    const sqlGames = await GameModel.getAll({ technology: 'mysql' });
    const sqlSlugs = sqlGames.map(g => g.slug);
    assert.ok(sqlSlugs.includes('sql-challenge'), 'MySQL must support SQL Challenge');
    sqlGames.forEach(g => {
        assert.ok(mysqlTech.supportedGames.includes(g.slug), `Game ${g.slug} must support MySQL`);
    });

    // All technologies reset
    const allGames = await GameModel.getAll({ technology: 'all' });
    assert.equal(allGames.length, 14, 'Technology "all" must return all 14 games');
});

test('4. Technology-Specific Content Engine: Returns authentic challenges matching technology and difficulty', async () => {
    // HTML Code Puzzle (Beginner)
    const htmlPuzzles = await GameModel.getChallenges('code-puzzle', { technology: 'html', difficulty: 'Beginner' });
    assert.ok(htmlPuzzles.length > 0, 'Must have HTML code puzzle challenges');
    htmlPuzzles.forEach(p => {
        assert.equal(p.solution, undefined, 'Solution must be withheld from client');
        assert.ok(p.blocks && p.blocks.length >= 3, 'Must have puzzle blocks');
        assert.equal(p.difficulty, 'Beginner', 'Must match requested difficulty');
    });

    // PHP Find the Bug (Beginner)
    const phpBugs = await GameModel.getChallenges('find-the-bug', { technology: 'php', difficulty: 'Beginner' });
    assert.ok(phpBugs.length > 0, 'Must have PHP bug challenges');
    phpBugs.forEach(b => {
        assert.equal(b.solution, undefined, 'Solution must be withheld from client');
        assert.ok(b.code, 'Bug challenge must contain code snippet');
    });

    // Flutter / Dart Code Scramble
    const flutterChallenges = await GameModel.getChallenges('code-scramble', { technology: 'flutter' });
    assert.ok(flutterChallenges.length > 0, 'Must return Flutter scramble challenges');
    flutterChallenges.forEach(c => {
        assert.equal(c.solution, undefined);
    });
});

test('5. Server-Side Challenge Verification: Validates technology-specific answers correctly', async () => {
    // Challenge from technologyChallenges catalog for react in code-puzzle
    const challenges = await GameModel.getChallenges('code-puzzle', { technology: 'react' });
    assert.ok(challenges.length > 0, 'React puzzles should exist');
    const challenge = challenges[0];

    // Verification with correct sequence for react useFetch hook
    const resCorrect = await GameModel.verifyChallenge('code-puzzle', challenge.id, [
        'const useFetch = (url) => {',
        '  const [data, setData] = useState(null);',
        '  const [loading, setLoading] = useState(true);',
        '  useEffect(() => {',
        '    fetch(url).then(r => r.json()).then(d => { setData(d); setLoading(false); });',
        '  }, [url]);',
        '  return { data, loading };',
        '};'
    ]);
    assert.equal(resCorrect.isCorrect, true);
    assert.ok(resCorrect.points > 0);
    assert.ok(resCorrect.explanation.length > 0);

    // Verification with wrong submission
    const resWrong = await GameModel.verifyChallenge('code-puzzle', challenge.id, ['wrong block']);
    assert.equal(resWrong.isCorrect, false);
    assert.equal(resWrong.points, 0);
});

test('6. User Score Tracking with Technology & Difficulty: Updates scores and UserTechProgress', async () => {
    const testUserId = 'test_user_tech_progress_42';

    // Submit score for Flutter game
    const scoreResult = await GameModel.recordScore({
        userId: testUserId,
        gameSlug: 'code-puzzle',
        score: 520,
        wpm: 0,
        accuracy: 100,
        durationSeconds: 45,
        technology: 'flutter',
        difficulty: 'Intermediate'
    });

    assert.equal(scoreResult.success, true);
    assert.equal(scoreResult.highScore, 520);

    // Verify UserTechStats calculation
    const progress = await TechnologyModel.getUserTechStats(testUserId, 'flutter');
    assert.ok(progress.totalPlays >= 1);
    assert.ok(progress.perTech['flutter']);
    assert.equal(progress.perTech['flutter'].highScore, 520);
});

test('7. Controller API: GET /api/games/categories and GET /api/games/technologies', async () => {
    // Test categories endpoint
    const reqCat = { query: {} };
    const resCat = createMockRes();
    await gameController.getTechnologyCategories(reqCat, resCat);

    assert.equal(resCat.statusCode, 200);
    assert.equal(resCat.body.success, true);
    assert.ok(Array.isArray(resCat.body.data));
    assert.equal(resCat.body.data.length, 6);

    // Test technologies endpoint
    const reqTech = { query: {} };
    const resTech = createMockRes();
    await gameController.getTechnologies(reqTech, resTech);

    assert.equal(resTech.statusCode, 200);
    assert.equal(resTech.body.success, true);
    assert.ok(Array.isArray(resTech.body.data));
    assert.equal(resTech.body.data.length, 23);
});

test('8. Controller API: GET /api/games/technologies/:slug returns technology details with supported games', async () => {
    const req = { params: { techSlug: 'javascript' }, user: null, headers: {}, cookies: {} };
    const res = createMockRes();
    await gameController.getTechnologyDetails(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.slug, 'javascript');
    assert.equal(res.body.data.name, 'JavaScript');
    assert.ok(res.body.data.availableGames.length >= 8, 'JavaScript must support multiple games');
});

test('9. Admin Management: Full CRUD and activation toggle for Technology Categories & Technologies', async () => {
    // 1. Admin Create Technology Category
    const newCategory = await TechnologyModel.createCategory({
        name: 'Cloud Computing & DevOps',
        slug: 'cloud-devops-test',
        description: 'Cloud infrastructure and containers.',
        icon: 'Cloud',
        order: 99
    });
    assert.ok(newCategory.id);
    assert.equal(newCategory.slug, 'cloud-devops-test');

    // 2. Admin Create Technology in that category
    const newTech = await TechnologyModel.createTechnology({
        name: 'Docker',
        slug: 'docker-test',
        categorySlug: 'cloud-devops-test',
        color: '#2496ED',
        icon: 'docker',
        supportedGames: ['code-puzzle', 'find-the-bug']
    });
    assert.ok(newTech.id);
    assert.equal(newTech.slug, 'docker-test');
    assert.equal(newTech.isEnabled, true);

    // 3. Admin Toggle Technology Status
    const toggled = await TechnologyModel.toggleTechnology(newTech.id);
    assert.ok(toggled, 'Toggle must return updated technology object');
    assert.equal(toggled.isEnabled, false, 'Technology should be disabled after toggle');

    // 4. Admin Update Technology
    const updated = await TechnologyModel.updateTechnology(newTech.id, {
        name: 'Docker Engine',
        supportedGames: ['code-puzzle', 'find-the-bug', 'code-typing']
    });
    assert.equal(updated.name, 'Docker Engine');
    assert.equal(updated.supportedGames.length, 3);

    // 5. Admin Delete Technology & Category
    const delTech = await TechnologyModel.deleteTechnology(newTech.id);
    assert.equal(delTech, true);

    const delCat = await TechnologyModel.deleteCategory(newCategory.id);
    assert.equal(delCat, true);
});

test('10. Admin Game Statistics: Returns complete platform metrics', async () => {
    const req = {};
    const res = createMockRes();
    await gameController.adminGetStats(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    const stats = res.body.data;
    assert.ok(stats.totalCategories >= 6, 'Must report total categories');
    assert.ok(stats.totalTechnologies >= 23, 'Must report total technologies');
    assert.ok(stats.activeTechnologies >= 23, 'Must report active technologies');
    assert.ok(typeof stats.playsByDifficulty === 'object', 'Must report plays by difficulty');
});
