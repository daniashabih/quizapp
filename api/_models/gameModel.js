const prisma = require('../_config/prisma');

const INITIAL_GAMES = [
    {
        id: 'game_2048',
        slug: '2048',
        title: '2048',
        category: 'Puzzle Games',
        badge: 'Hot',
        cardSize: 'large',
        rating: 4.9,
        playsCount: 1420,
        order: 1,
        isPublished: true,
        isFeatured: true,
        thumbnail: 'gradient-amber',
        description: 'Join identical numbered tiles and reach the legendary 2048 tile in this addictive sliding puzzle.',
        instructions: 'Use Arrow keys, WASD, or swipe on touchscreen to slide all tiles across the grid. Tiles with identical numbers merge when they collide (2+2=4, 4+4=8). Plan ahead to keep space open and beat your high score!'
    },
    {
        id: 'game_snake',
        slug: 'snake',
        title: 'Snake Classic',
        category: 'Arcade Games',
        badge: 'Popular',
        cardSize: 'tall',
        rating: 4.8,
        playsCount: 2150,
        order: 2,
        isPublished: true,
        isFeatured: true,
        thumbnail: 'gradient-emerald',
        description: 'Guide the retro pixel snake to munch delicious apples, grow longer, and dodge dangerous wall collisions.',
        instructions: 'Steer the snake with Arrow keys, WASD, or the on-screen D-pad. Gobble up regular apples for +10 points and catch rare golden fruits for +50 bonus points. Don\'t bite yourself or hit the borders!'
    },
    {
        id: 'game_brick_breaker',
        slug: 'brick-breaker',
        title: 'Brick Breaker',
        category: 'Arcade Games',
        badge: 'Featured',
        cardSize: 'large',
        rating: 4.9,
        playsCount: 1890,
        order: 3,
        isPublished: true,
        isFeatured: true,
        thumbnail: 'gradient-indigo',
        description: 'Smash through vibrant brick matrices with bouncing balls, dynamic paddle rebounds, and power reflexes.',
        instructions: 'Move the paddle with your mouse, left/right arrow keys, or touchscreen drag. Bounce the ball to shatter all bricks without letting it slip past your paddle. Keep your 3 lives safe!'
    },
    {
        id: 'game_tic_tac_toe',
        slug: 'tic-tac-toe',
        title: 'Tic Tac Toe',
        category: 'Puzzle Games',
        badge: 'Classic',
        cardSize: 'medium',
        rating: 4.7,
        playsCount: 3100,
        order: 4,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-cyan',
        description: 'The timeless strategy game with Single Player (Easy, Medium, Unbeatable Minimax AI) and 2-Player Pass & Play modes.',
        instructions: 'Take turns placing X or O on the 3x3 grid. Line up 3 marks in a row horizontally, vertically, or diagonally to win! Play against the smart AI or challenge a friend locally.'
    },
    {
        id: 'game_memory_match',
        slug: 'memory-match',
        title: 'Memory Match',
        category: 'Brain Games',
        badge: 'Brain Boost',
        cardSize: 'medium',
        rating: 4.8,
        playsCount: 1650,
        order: 5,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-purple',
        description: 'Test and sharpen your visual recall by matching pairs of colorful arcade and tech cards.',
        instructions: 'Flip cards two at a time to reveal hidden icons. Remember their locations and pair all matching cards in the fewest moves and quickest time possible! Streaks earn bonus points.'
    },
    {
        id: 'game_flappy_bug',
        slug: 'flappy-bug',
        title: 'Flappy Bug',
        category: 'Arcade Games',
        badge: 'New',
        cardSize: 'medium',
        rating: 4.6,
        playsCount: 980,
        order: 6,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-rose',
        description: 'Help the cute Hangbug mascot flap gracefully through perilous green obstacle pipes.',
        instructions: 'Click, tap the screen, or press Spacebar to flap Hangbug upward. Timing is key—fly carefully through pipe gaps to rack up an epic high score!'
    },
    {
        id: 'game_color_match',
        slug: 'color-match',
        title: 'Color Match',
        category: 'Casual Games',
        badge: 'Quick Play',
        cardSize: 'small',
        rating: 4.5,
        playsCount: 740,
        order: 7,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-teal',
        description: 'A lightning-fast casual reflex test. Match the shifting color names with the actual displayed colors.',
        instructions: 'Read the color name and check whether the ink color matches before the timer runs out. Fast accurate answers build up streak multipliers!'
    },
    {
        id: 'game_number_puzzle',
        slug: 'number-puzzle',
        title: 'Number Puzzle',
        category: 'Brain Games',
        badge: 'Challenge',
        cardSize: 'small',
        rating: 4.7,
        playsCount: 820,
        order: 8,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-blue',
        description: 'Slide the numbered tiles into numerical order from 1 to 15 in this classic brain teaser.',
        instructions: 'Click or tap any tile adjacent to the empty slot to slide it. Arrange tiles sequentially in rows from 1 to 15 with the empty space at bottom-right.'
    }
];

// In-memory fallback state for dev / offline / test environments
let memGames = JSON.parse(JSON.stringify(INITIAL_GAMES));
let memScores = [];
let memProgress = {}; // key: `${userId}_${gameSlug}`
let memFavorites = {}; // key: `${userId}_${gameSlug}`

const GameModel = {
    INITIAL_GAMES,

    /**
     * Get all games with optional filtering
     */
    getAll: async ({ category, search, isPublished, isFeatured, userId } = {}) => {
        try {
            const where = {};
            if (isPublished !== undefined) {
                where.isPublished = Boolean(isPublished);
            }
            if (isFeatured !== undefined) {
                where.isFeatured = Boolean(isFeatured);
            }
            if (category && category !== 'All Games' && category !== 'All') {
                where.category = { equals: category, mode: 'insensitive' };
            }

            let games = await prisma.game.findMany({
                where,
                orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
            });

            // If DB is empty, auto-seed with initial games
            if (!games || games.length === 0) {
                try {
                    await prisma.game.createMany({
                        data: INITIAL_GAMES.map(g => ({
                            slug: g.slug,
                            title: g.title,
                            category: g.category,
                            badge: g.badge,
                            cardSize: g.cardSize,
                            rating: g.rating,
                            playsCount: g.playsCount,
                            order: g.order,
                            isPublished: g.isPublished,
                            isFeatured: g.isFeatured,
                            thumbnail: g.thumbnail,
                            description: g.description,
                            instructions: g.instructions
                        }))
                    });
                    games = await prisma.game.findMany({
                        where,
                        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
                    });
                } catch {
                    // fall back to in-memory if createMany fails
                    games = null;
                }
            }

            if (games && games.length > 0) {
                // Enrich with user high scores and favorites if userId provided
                if (userId) {
                    const [userProgress, userFavs] = await Promise.all([
                        prisma.userGameProgress.findMany({ where: { userId: String(userId) } }).catch(() => []),
                        prisma.userGameFavorite.findMany({ where: { userId: String(userId) } }).catch(() => [])
                    ]);
                    const progressMap = {};
                    userProgress.forEach(p => { progressMap[p.gameSlug] = p; });
                    const favSet = new Set(userFavs.map(f => f.gameSlug));

                    games = games.map(g => ({
                        ...g,
                        userHighScore: progressMap[g.slug]?.highScore || 0,
                        userTotalPlays: progressMap[g.slug]?.totalPlays || 0,
                        isFavorite: favSet.has(g.slug)
                    }));
                }

                if (search) {
                    const q = search.toLowerCase();
                    games = games.filter(g =>
                        g.title.toLowerCase().includes(q) ||
                        g.description.toLowerCase().includes(q) ||
                        g.category.toLowerCase().includes(q)
                    );
                }

                return games;
            }
        } catch {
            // Prisma failed / DB offline - use in-memory fallback
        }

        // Memory fallback
        let games = memGames.slice();
        if (isPublished !== undefined) {
            games = games.filter(g => Boolean(g.isPublished) === Boolean(isPublished));
        }
        if (isFeatured !== undefined) {
            games = games.filter(g => Boolean(g.isFeatured) === Boolean(isFeatured));
        }
        if (category && category !== 'All Games' && category !== 'All') {
            const catNorm = category.toLowerCase();
            games = games.filter(g => g.category.toLowerCase().includes(catNorm.replace(' games', '')));
        }
        if (search) {
            const q = search.toLowerCase();
            games = games.filter(g =>
                g.title.toLowerCase().includes(q) ||
                g.description.toLowerCase().includes(q) ||
                g.category.toLowerCase().includes(q)
            );
        }

        if (userId) {
            games = games.map(g => {
                const progKey = `${userId}_${g.slug}`;
                const prog = memProgress[progKey];
                return {
                    ...g,
                    userHighScore: prog?.highScore || 0,
                    userTotalPlays: prog?.totalPlays || 0,
                    isFavorite: Boolean(memFavorites[progKey])
                };
            });
        }

        return games;
    },

    /**
     * Get single game by slug
     */
    findBySlug: async (slug, userId) => {
        const cleanSlug = String(slug || '').trim().toLowerCase();
        try {
            const game = await prisma.game.findUnique({
                where: { slug: cleanSlug }
            });
            if (game) {
                let userHighScore = 0;
                let userTotalPlays = 0;
                let isFavorite = false;

                if (userId) {
                    const [prog, fav] = await Promise.all([
                        prisma.userGameProgress.findUnique({
                            where: { userId_gameSlug: { userId: String(userId), gameSlug: cleanSlug } }
                        }).catch(() => null),
                        prisma.userGameFavorite.findUnique({
                            where: { userId_gameSlug: { userId: String(userId), gameSlug: cleanSlug } }
                        }).catch(() => null)
                    ]);
                    userHighScore = prog?.highScore || 0;
                    userTotalPlays = prog?.totalPlays || 0;
                    isFavorite = Boolean(fav);
                }

                return {
                    ...game,
                    userHighScore,
                    userTotalPlays,
                    isFavorite
                };
            }
        } catch {
            // Prisma failed / DB offline
        }

        const game = memGames.find(g => g.slug === cleanSlug);
        if (!game) return null;

        let userHighScore = 0;
        let userTotalPlays = 0;
        let isFavorite = false;

        if (userId) {
            const progKey = `${userId}_${cleanSlug}`;
            const prog = memProgress[progKey];
            userHighScore = prog?.highScore || 0;
            userTotalPlays = prog?.totalPlays || 0;
            isFavorite = Boolean(memFavorites[progKey]);
        }

        return {
            ...game,
            userHighScore,
            userTotalPlays,
            isFavorite
        };
    },

    /**
     * Create a new game (Admin)
     */
    create: async (data) => {
        const slug = String(data.slug || data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const payload = {
            slug,
            title: String(data.title || '').trim(),
            description: String(data.description || '').trim(),
            instructions: String(data.instructions || '').trim(),
            category: String(data.category || 'Casual Games').trim(),
            thumbnail: data.thumbnail || 'gradient-indigo',
            badge: data.badge || '',
            cardSize: data.cardSize || 'medium',
            aspectRatio: data.aspectRatio || '16/9',
            order: Number(data.order || 0),
            isPublished: data.isPublished !== false,
            isFeatured: Boolean(data.isFeatured),
            rating: Number(data.rating || 4.8),
            playsCount: Number(data.playsCount || 0)
        };

        try {
            const created = await prisma.game.create({ data: payload });
            return created;
        } catch {
            const newMem = {
                id: `mem_game_${Date.now()}`,
                ...payload,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            memGames.push(newMem);
            return newMem;
        }
    },

    /**
     * Update game by ID or slug (Admin)
     */
    update: async (idOrSlug, data) => {
        const payload = { ...data };
        delete payload.id;
        if (payload.order !== undefined) payload.order = Number(payload.order);
        if (payload.rating !== undefined) payload.rating = Number(payload.rating);
        if (payload.playsCount !== undefined) payload.playsCount = Number(payload.playsCount);

        try {
            // Try updating by id, fallback by slug
            let updated;
            try {
                updated = await prisma.game.update({
                    where: { id: String(idOrSlug) },
                    data: payload
                });
            } catch {
                updated = await prisma.game.update({
                    where: { slug: String(idOrSlug) },
                    data: payload
                });
            }
            return updated;
        } catch {
            const idx = memGames.findIndex(g => g.id === idOrSlug || g.slug === idOrSlug);
            if (idx !== -1) {
                memGames[idx] = { ...memGames[idx], ...payload, updatedAt: new Date() };
                return memGames[idx];
            }
            return null;
        }
    },

    /**
     * Delete game by ID or slug (Admin)
     */
    delete: async (idOrSlug) => {
        try {
            try {
                await prisma.game.delete({ where: { id: String(idOrSlug) } });
            } catch {
                await prisma.game.delete({ where: { slug: String(idOrSlug) } });
            }
            return true;
        } catch {
            const before = memGames.length;
            memGames = memGames.filter(g => g.id !== idOrSlug && g.slug !== idOrSlug);
            return memGames.length < before;
        }
    },

    /**
     * Record a user's game score
     */
    recordScore: async ({ userId, gameSlug, score, durationSeconds = 0, metadata = {} }) => {
        const numericScore = Math.max(0, parseInt(score, 10) || 0);
        const duration = Math.max(0, parseInt(durationSeconds, 10) || 0);
        const metaStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

        let isNewHighScore = false;
        let userHighScore = numericScore;
        let totalPlays = 1;

        try {
            const game = await prisma.game.findUnique({
                where: { slug: gameSlug }
            });

            if (game && userId) {
                // Check existing progress
                const existingProg = await prisma.userGameProgress.findUnique({
                    where: { userId_gameSlug: { userId: String(userId), gameSlug } }
                });

                if (existingProg) {
                    isNewHighScore = numericScore > existingProg.highScore;
                    userHighScore = Math.max(numericScore, existingProg.highScore);
                    totalPlays = existingProg.totalPlays + 1;

                    await prisma.userGameProgress.update({
                        where: { id: existingProg.id },
                        data: {
                            highScore: userHighScore,
                            totalPlays,
                            lastPlayedAt: new Date()
                        }
                    });
                } else {
                    isNewHighScore = true;
                    userHighScore = numericScore;
                    totalPlays = 1;

                    await prisma.userGameProgress.create({
                        data: {
                            userId: String(userId),
                            gameSlug,
                            highScore: userHighScore,
                            totalPlays: 1,
                            lastPlayedAt: new Date()
                        }
                    });
                }

                // Increment overall game plays count
                await prisma.game.update({
                    where: { id: game.id },
                    data: { playsCount: { increment: 1 } }
                }).catch(() => {});

                // Record score history entry
                await prisma.gameScore.create({
                    data: {
                        userId: String(userId),
                        gameId: game.id,
                        gameSlug,
                        score: numericScore,
                        highScore: userHighScore,
                        durationSeconds: duration,
                        metadata: metaStr
                    }
                }).catch(() => {});

                return {
                    success: true,
                    isNewHighScore,
                    highScore: userHighScore,
                    score: numericScore,
                    totalPlays
                };
            }
        } catch {
            // DB fallback
        }

        // Memory fallback
        const progKey = `${userId}_${gameSlug}`;
        const existing = memProgress[progKey];
        if (existing) {
            isNewHighScore = numericScore > existing.highScore;
            userHighScore = Math.max(numericScore, existing.highScore);
            totalPlays = existing.totalPlays + 1;
            memProgress[progKey] = {
                highScore: userHighScore,
                totalPlays,
                lastPlayedAt: new Date()
            };
        } else {
            isNewHighScore = true;
            userHighScore = numericScore;
            totalPlays = 1;
            memProgress[progKey] = {
                highScore: userHighScore,
                totalPlays: 1,
                lastPlayedAt: new Date()
            };
        }

        // Increment memory game plays
        const gIdx = memGames.findIndex(g => g.slug === gameSlug);
        if (gIdx !== -1) {
            memGames[gIdx].playsCount = (memGames[gIdx].playsCount || 0) + 1;
        }

        memScores.push({
            id: `score_${Date.now()}`,
            userId,
            gameSlug,
            score: numericScore,
            highScore: userHighScore,
            durationSeconds: duration,
            metadata: metaStr,
            createdAt: new Date()
        });

        return {
            success: true,
            isNewHighScore,
            highScore: userHighScore,
            score: numericScore,
            totalPlays
        };
    },

    /**
     * Toggle favorite game for a user
     */
    toggleFavorite: async (userId, gameSlug) => {
        if (!userId) return false;
        try {
            const game = await prisma.game.findUnique({ where: { slug: gameSlug } });
            if (game) {
                const existing = await prisma.userGameFavorite.findUnique({
                    where: { userId_gameSlug: { userId: String(userId), gameSlug } }
                });
                if (existing) {
                    await prisma.userGameFavorite.delete({ where: { id: existing.id } });
                    return false;
                } else {
                    await prisma.userGameFavorite.create({
                        data: {
                            userId: String(userId),
                            gameId: game.id,
                            gameSlug
                        }
                    });
                    return true;
                }
            }
        } catch {
            // DB fallback
        }

        const progKey = `${userId}_${gameSlug}`;
        if (memFavorites[progKey]) {
            delete memFavorites[progKey];
            return false;
        } else {
            memFavorites[progKey] = true;
            return true;
        }
    },

    /**
     * Get aggregate game stats for a user
     */
    getUserStats: async (userId) => {
        if (!userId) {
            return {
                totalPlayed: 0,
                highScores: {},
                favorites: [],
                recentGames: [],
                history: []
            };
        }

        try {
            const [progressList, favorites, history] = await Promise.all([
                prisma.userGameProgress.findMany({
                    where: { userId: String(userId) },
                    orderBy: { lastPlayedAt: 'desc' }
                }),
                prisma.userGameFavorite.findMany({
                    where: { userId: String(userId) }
                }),
                prisma.gameScore.findMany({
                    where: { userId: String(userId) },
                    orderBy: { createdAt: 'desc' },
                    take: 20
                })
            ]);

            const highScores = {};
            let totalPlayed = 0;
            progressList.forEach(p => {
                highScores[p.gameSlug] = p.highScore;
                totalPlayed += p.totalPlays;
            });

            return {
                totalPlayed,
                highScores,
                favorites: favorites.map(f => f.gameSlug),
                recentGames: progressList.map(p => ({
                    slug: p.gameSlug,
                    highScore: p.highScore,
                    totalPlays: p.totalPlays,
                    lastPlayedAt: p.lastPlayedAt
                })),
                history
            };
        } catch {
            // DB fallback
        }

        const highScores = {};
        let totalPlayed = 0;
        const recentGames = [];

        Object.keys(memProgress).forEach(key => {
            if (key.startsWith(`${userId}_`)) {
                const slug = key.replace(`${userId}_`, '');
                const p = memProgress[key];
                highScores[slug] = p.highScore;
                totalPlayed += p.totalPlays;
                recentGames.push({
                    slug,
                    highScore: p.highScore,
                    totalPlays: p.totalPlays,
                    lastPlayedAt: p.lastPlayedAt
                });
            }
        });

        const userFavs = Object.keys(memFavorites)
            .filter(k => k.startsWith(`${userId}_`))
            .map(k => k.replace(`${userId}_`, ''));

        const history = memScores
            .filter(s => s.userId === userId)
            .slice(-20)
            .reverse();

        return {
            totalPlayed,
            highScores,
            favorites: userFavs,
            recentGames,
            history
        };
    },

    /**
     * Reset default games in memory
     */
    resetSeed: () => {
        memGames = JSON.parse(JSON.stringify(INITIAL_GAMES));
        return memGames;
    }
};

module.exports = GameModel;
