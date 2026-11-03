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

test('1. Technology Categories: Returns all 7 required primary development categories including Programming Languages', async () => {
    const categories = await TechnologyModel.getAllCategories();
    assert.ok(Array.isArray(categories), 'Categories must be an array');
    assert.ok(categories.length >= 7, 'Must contain at least 7 categories');

    const expectedSlugs = [
        'frontend-development',
        'backend-development',
        'database',
        'mobile-development',
        'programming-fundamentals',
        'web-development',
        'programming-languages'
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

test('2. Technologies Catalog: Returns all 24 official programming technologies across categories including C#', async () => {
    const technologies = await TechnologyModel.getAllTechnologies();
    assert.ok(Array.isArray(technologies), 'Technologies must be an array');
    assert.equal(technologies.length, 24, 'Must contain all 24 programming technologies');

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
        'html-css', 'full-stack', 'web-fundamentals',
        // Programming Languages
        'csharp'
    ];

    const actualSlugs = technologies.map(t => t.slug);
    expectedSlugs.forEach(slug => {
        assert.ok(actualSlugs.includes(slug), `Must contain technology slug: ${slug}`);
    });

    const csharpTech = technologies.find(t => t.slug === 'csharp');
    assert.ok(csharpTech, 'C# technology must exist');
    assert.equal(csharpTech.name, 'C#');
    assert.equal(csharpTech.categorySlug, 'programming-languages');
    assert.equal(csharpTech.isEnabled, true);
    assert.equal(csharpTech.supportedGames.length, 14, 'C# must support 14 games');

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

    // C# games
    const csharpTech = allTechs.find(t => t.slug === 'csharp');
    assert.ok(csharpTech, 'C# technology must exist');
    const csharpGames = await GameModel.getAll({ technology: 'csharp' });
    assert.equal(csharpGames.length, 14, 'C# must return all 14 supported games');
    csharpGames.forEach(g => {
        assert.ok(csharpTech.supportedGames.includes(g.slug), `Game ${g.slug} must support C#`);
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
    assert.equal(allGames.length, 18, 'Technology "all" must return all 18 games');
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

    // C# Code Puzzle (Beginner, Intermediate, Advanced)
    const csharpBeginnerPuzzles = await GameModel.getChallenges('code-puzzle', { technology: 'csharp', difficulty: 'Beginner' });
    assert.ok(csharpBeginnerPuzzles.length > 0, 'Must have C# Beginner puzzles');
    assert.equal(csharpBeginnerPuzzles[0].difficulty, 'Beginner');
    assert.equal(csharpBeginnerPuzzles[0].solution, undefined);

    const csharpAdvPuzzles = await GameModel.getChallenges('code-puzzle', { technology: 'csharp', difficulty: 'Advanced' });
    assert.ok(csharpAdvPuzzles.length > 0, 'Must have C# Advanced puzzles');
    assert.equal(csharpAdvPuzzles[0].difficulty, 'Advanced');
    assert.equal(csharpAdvPuzzles[0].solution, undefined);

    // C# Dedicated OOP Challenge
    const oopChallenges = await GameModel.getChallenges('csharp-oop-challenge');
    assert.ok(oopChallenges.length >= 3, 'Must return C# OOP challenges across 3 difficulties');
    oopChallenges.forEach(c => {
        assert.equal(c.solution, undefined);
        assert.equal(c.technology, 'csharp');
    });

    // C# Dedicated LINQ Challenge
    const linqChallenges = await GameModel.getChallenges('csharp-linq-challenge');
    assert.ok(linqChallenges.length >= 3, 'Must return C# LINQ challenges across 3 difficulties');
    linqChallenges.forEach(c => {
        assert.equal(c.solution, undefined);
        assert.equal(c.technology, 'csharp');
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

    // C# Code Puzzle Verification (Beginner: Jordan greeting)
    const csharpPuzzles = await GameModel.getChallenges('code-puzzle', { technology: 'csharp', difficulty: 'Beginner' });
    assert.ok(csharpPuzzles.length > 0, 'C# puzzles must exist');
    const csChallenge = csharpPuzzles[0];
    const resCsCorrect = await GameModel.verifyChallenge('code-puzzle', csChallenge.id, [
        'string name = "Jordan";',
        'int currentAge = 25;',
        'int retirementAge = 65;',
        'int yearsLeft = retirementAge - currentAge;',
        'Console.WriteLine($"Hello {name}, you have {yearsLeft} years until retirement.");'
    ]);
    assert.equal(resCsCorrect.isCorrect, true, 'Valid C# puzzle arrangement must be verified as true');
    assert.ok(resCsCorrect.points > 0, 'Points must be awarded for C# puzzle');
    assert.ok(resCsCorrect.explanation.length > 0);

    // C# Find the Bug Verification (Line number match)
    const csBugs = await GameModel.getChallenges('find-the-bug', { technology: 'csharp', difficulty: 'Beginner' });
    assert.ok(csBugs.length > 0, 'C# bug challenges must exist');
    const bugRes = await GameModel.verifyChallenge('find-the-bug', csBugs[0].id, 5);
    assert.equal(bugRes.isCorrect, true, 'Line 5 contains integer division bug');

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

    // Submit score for C# game
    const csScoreResult = await GameModel.recordScore({
        userId: testUserId,
        gameSlug: 'csharp-linq-challenge',
        score: 680,
        wpm: 0,
        accuracy: 100,
        durationSeconds: 35,
        technology: 'csharp',
        difficulty: 'Advanced'
    });
    assert.equal(csScoreResult.success, true);

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
    assert.equal(resCat.body.data.length, 7, 'Must return 7 categories including Programming Languages');

    // Test technologies endpoint
    const reqTech = { query: {} };
    const resTech = createMockRes();
    await gameController.getTechnologies(reqTech, resTech);

    assert.equal(resTech.statusCode, 200);
    assert.equal(resTech.body.success, true);
    assert.ok(Array.isArray(resTech.body.data));
    assert.equal(resTech.body.data.length, 24, 'Must return 24 technologies including C#');
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

    // Test C# details
    const reqCs = { params: { techSlug: 'csharp' }, user: null, headers: {}, cookies: {} };
    const resCs = createMockRes();
    await gameController.getTechnologyDetails(reqCs, resCs);

    assert.equal(resCs.statusCode, 200);
    assert.equal(resCs.body.success, true);
    assert.equal(resCs.body.data.slug, 'csharp');
    assert.equal(resCs.body.data.name, 'C#');
    assert.equal(resCs.body.data.categorySlug, 'programming-languages');
    assert.equal(resCs.body.data.availableGames.length, 14, 'C# must support all 14 coding & typing games');
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

test('10. Admin Game Statistics: Returns complete platform metrics including C# and Programming Languages', async () => {
    const req = {};
    const res = createMockRes();
    await gameController.adminGetStats(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    const stats = res.body.data;
    assert.ok(stats.totalCategories >= 7, 'Must report at least 7 total categories');
    assert.ok(stats.totalTechnologies >= 24, 'Must report at least 24 total technologies');
    assert.ok(stats.activeTechnologies >= 24, 'Must report at least 24 active technologies');
    assert.ok(typeof stats.playsByDifficulty === 'object', 'Must report plays by difficulty');
});

test('11. Dedicated C# Games Architecture: All 10 coding & 4 typing games support C# and resolve aliases', async () => {
    // 1. Verify 10 C# Coding Games return valid challenges
    const codingGames = [
        { slug: 'code-puzzle', tech: 'csharp' },
        { slug: 'find-the-bug', tech: 'csharp' },
        { slug: 'output-predictor', tech: 'csharp' },
        { slug: 'code-scramble', tech: 'csharp' },
        { slug: 'missing-code', tech: 'csharp' },
        { slug: 'logic-builder', tech: 'csharp' },
        { slug: 'csharp-oop-challenge', tech: null },
        { slug: 'csharp-collections-challenge', tech: null },
        { slug: 'csharp-linq-challenge', tech: null },
        { slug: 'csharp-exception-handling', tech: null }
    ];

    for (const g of codingGames) {
        const challenges = await GameModel.getChallenges(g.slug, g.tech ? { technology: g.tech } : {});
        assert.ok(challenges.length >= 3, `Game ${g.slug} must provide at least 3 C# challenges across difficulties`);
        challenges.forEach(c => {
            assert.equal(c.solution, undefined, `Solution must be sanitized for ${g.slug}`);
            assert.ok(c.difficulty, `Difficulty must exist for ${g.slug}`);
        });
    }

    // 2. Verify C# Game Aliases resolve to their base game definitions
    const aliases = [
        'csharp-code-puzzle',
        'find-the-bug-csharp',
        'csharp-output-predictor',
        'csharp-code-scramble',
        'missing-code-csharp',
        'csharp-logic-builder',
        'csharp-speed-typing',
        'csharp-syntax-typing',
        'csharp-code-typing',
        'csharp-accuracy-challenge'
    ];

    for (const alias of aliases) {
        const game = await GameModel.findBySlug(alias);
        assert.ok(game, `Alias ${alias} must resolve to a valid game`);
    }

    // 3. Verify C# Technology supports all 14 game slugs
    const csharpTech = await TechnologyModel.getTechnologyBySlug('csharp');
    assert.ok(csharpTech, 'C# technology must be found by slug');
    assert.equal(csharpTech.supportedGames.length, 14, 'Must support exactly 14 games');

    // 4. Verify C# Exception Handling server-side validation
    const exChallenges = await GameModel.getChallenges('csharp-exception-handling');
    assert.ok(exChallenges.length > 0, 'Exception handling challenges must exist');
    const exBeg = exChallenges.find(c => c.difficulty === 'Beginner');
    assert.ok(exBeg, 'Beginner exception challenge must exist');
    const exRes = await GameModel.verifyChallenge('csharp-exception-handling', exBeg.id, 'Cleanup 10');
    assert.equal(exRes.isCorrect, true, 'Cleanup 10 is the correct answer');
    assert.ok(exRes.points > 0);
});
