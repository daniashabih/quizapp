const GameModel = require('../_models/gameModel');
const TechnologyModel = require('../_models/technologyModel');
const { TECHNOLOGY_CHALLENGES } = require('../_models/technologyChallenges');
const prisma = require('../_config/prisma');
const jwt = require('jsonwebtoken');

/**
 * Helper to optionally extract userId from auth header or cookie without failing if unauthenticated
 */
function getOptionalUserId(req) {
    if (req.user && req.user.id) return req.user.id;
    try {
        let token = req.cookies?.token;
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7).trim();
            } else {
                token = authHeader.trim();
            }
        }
        if (!token) return null;
        if (token === 'guest-admin-token') return 'guest_admin';
        if (token === 'guest-candidate-token') return 'guest_candidate';

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hangbug_secure_jwt_secret_key_2026');
        return decoded?.id || decoded?.userId || null;
    } catch {
        return null;
    }
}

const gameController = {
    /**
     * GET /api/games
     * Public list of published games with category filtering, technology filtering, search, and user metrics
     */
    getGames: async (req, res) => {
        try {
            const { category, search, difficulty, featured, technology, tech } = req.query;
            const activeTech = technology || tech || null;
            const userId = getOptionalUserId(req);

            const games = await GameModel.getAll({
                category,
                search,
                difficulty,
                technology: activeTech,
                isPublished: true,
                isFeatured: featured ? (featured === 'true' || featured === '1') : undefined,
                userId
            });

            // Find daily featured game (or fallback to first featured game)
            const featuredGames = games.filter(g => g.isFeatured);
            const featuredGame = featuredGames.length > 0 ? featuredGames[0] : (games[0] || null);

            // Compute category counts
            const allPublished = await GameModel.getAll({ isPublished: true, technology: activeTech, userId });
            const categoryCounts = {
                'All Games': allPublished.length,
                'Coding Games': 0,
                'Typing Games': 0
            };
            allPublished.forEach(g => {
                if (categoryCounts[g.category] !== undefined) {
                    categoryCounts[g.category] += 1;
                } else {
                    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
                }
            });

            res.json({
                success: true,
                count: games.length,
                technology: activeTech,
                featuredGame,
                categoryCounts,
                data: games
            });
        } catch (err) {
            console.error('Error fetching games:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve games catalog.',
                error: err.message
            });
        }
    },

    /**
     * GET /api/games/categories
     * List all technology categories with their technologies and game statistics
     */
    getTechnologyCategories: async (req, res) => {
        try {
            const categories = await TechnologyModel.getAllCategories({ includeDisabled: false });
            res.json({
                success: true,
                count: categories.length,
                data: categories
            });
        } catch (err) {
            console.error('Error fetching technology categories:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve technology categories.',
                error: err.message
            });
        }
    },

    /**
     * GET /api/games/technologies
     * List all technologies with game counts and optional category filtering
     */
    getTechnologies: async (req, res) => {
        try {
            const { category, categorySlug, search } = req.query;
            const userId = getOptionalUserId(req);
            const technologies = await TechnologyModel.getAllTechnologies({
                categorySlug: categorySlug || category || 'all',
                isEnabled: true,
                search,
                userId
            });

            res.json({
                success: true,
                count: technologies.length,
                data: technologies
            });
        } catch (err) {
            console.error('Error fetching technologies:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve technologies.',
                error: err.message
            });
        }
    },

    /**
     * GET /api/games/technologies/:techSlug
     * Single technology details with user progress and supported games
     */
    getTechnologyDetails: async (req, res) => {
        try {
            const { techSlug } = req.params;
            const userId = getOptionalUserId(req);
            const technology = await TechnologyModel.getTechnologyBySlug(techSlug, userId);

            if (!technology) {
                return res.status(404).json({
                    success: false,
                    message: `Technology with slug "${techSlug}" was not found.`
                });
            }

            // Get available games for this technology
            const games = await GameModel.getAll({
                technology: techSlug,
                isPublished: true,
                userId
            });

            res.json({
                success: true,
                data: {
                    ...technology,
                    availableGames: games,
                    availableGamesCount: games.length
                }
            });
        } catch (err) {
            console.error('Error getting technology details:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve technology details.',
                error: err.message
            });
        }
    },

    /**
     * GET /api/games/technologies/:techSlug/games
     * List games supported by this technology
     */
    getGamesByTechnology: async (req, res) => {
        try {
            const { techSlug } = req.params;
            const { difficulty, search } = req.query;
            const userId = getOptionalUserId(req);

            const games = await GameModel.getAll({
                technology: techSlug,
                difficulty,
                search,
                isPublished: true,
                userId
            });

            res.json({
                success: true,
                technology: techSlug,
                count: games.length,
                data: games
            });
        } catch (err) {
            console.error('Error getting games by technology:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve games for technology.',
                error: err.message
            });
        }
    },

    /**
     * GET /api/games/technologies/:techSlug/stats
     * Get user's statistics and progress for a specific technology
     */
    getUserTechStats: async (req, res) => {
        try {
            const { techSlug } = req.params;
            const userId = req.user?.id || getOptionalUserId(req);

            if (!userId) {
                return res.json({
                    success: true,
                    isGuest: true,
                    data: {
                        totalPlays: 0,
                        highScore: 0,
                        bestWpm: 0,
                        bestAccuracy: 100
                    }
                });
            }

            const stats = await TechnologyModel.getUserTechStats(userId, techSlug);
            res.json({
                success: true,
                isGuest: false,
                technology: techSlug,
                data: stats
            });
        } catch (err) {
            console.error('Error getting user tech stats:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user technology statistics.',
                error: err.message
            });
        }
    },

    /**
     * GET /api/games/:slug
     * Get single game details
     */
    getGameDetails: async (req, res) => {
        try {
            const { slug } = req.params;
            const userId = getOptionalUserId(req);

            const game = await GameModel.findBySlug(slug, userId);
            if (!game) {
                return res.status(404).json({
                    success: false,
                    message: `Game with slug "${slug}" was not found.`
                });
            }

            res.json({
                success: true,
                data: game
            });
        } catch (err) {
            console.error('Error getting game details:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch game details.',
                error: err.message
            });
        }
    },

    /**
     * GET /api/games/:slug/challenges
     * Get sanitized challenges for a game
     */
    getChallenges: async (req, res) => {
        try {
            const { slug } = req.params;
            const { difficulty, language, technology, tech } = req.query;
            const activeTech = technology || tech || null;

            const challenges = await GameModel.getChallenges(slug.toLowerCase(), {
                difficulty,
                language,
                technology: activeTech
            });
            res.json({
                success: true,
                count: challenges.length,
                data: challenges
            });
        } catch (err) {
            console.error('Error getting game challenges:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch game challenges.',
                error: err.message
            });
        }
    },

    /**
     * POST /api/games/:slug/verify
     * Securely verify a coding challenge solution on the server
     */
    verifyChallenge: async (req, res) => {
        try {
            const { slug } = req.params;
            const { challengeId, submission } = req.body;

            if (!challengeId) {
                return res.status(400).json({
                    success: false,
                    message: 'challengeId is required.'
                });
            }

            const result = await GameModel.verifyChallenge(slug.toLowerCase(), challengeId, submission);
            res.json({
                success: true,
                ...result
            });
        } catch (err) {
            console.error('Error verifying game challenge:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to verify challenge submission.',
                error: err.message
            });
        }
    },

    /**
     * GET /api/games/daily/challenge
     * Get today's daily featured game challenge
     */
    getDailyChallenge: async (req, res) => {
        try {
            const daily = await GameModel.getDailyChallenge();
            res.json({
                success: true,
                data: daily
            });
        } catch (err) {
            console.error('Error getting daily game challenge:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch daily challenge.',
                error: err.message
            });
        }
    },

    /**
     * GET /api/games/leaderboard/:slug
     * Get game leaderboard
     */
    getLeaderboard: async (req, res) => {
        try {
            const { slug } = req.params;
            const limit = parseInt(req.query.limit, 10) || 10;
            const leaderboard = await GameModel.getLeaderboard(slug.toLowerCase(), limit);

            res.json({
                success: true,
                count: leaderboard.length,
                data: leaderboard
            });
        } catch (err) {
            console.error('Error getting game leaderboard:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch leaderboard.',
                error: err.message
            });
        }
    },

    /**
     * POST /api/games/:slug/score
     * Record a user's score (supports authenticated users, returns guest hint if unauthenticated)
     */
    submitScore: async (req, res) => {
        try {
            const { slug } = req.params;
            const { score, durationSeconds, accuracy, wpm, difficulty, technology, tech, metadata } = req.body;
            const userId = req.user?.id || getOptionalUserId(req);

            if (!slug) {
                return res.status(400).json({
                    success: false,
                    message: 'Game slug is required.'
                });
            }

            if (score === undefined || score === null || isNaN(Number(score))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid numeric score is required.'
                });
            }

            if (!userId) {
                return res.status(200).json({
                    success: true,
                    isGuest: true,
                    score: Number(score),
                    wpm: Number(wpm || 0),
                    accuracy: Number(accuracy || 100),
                    technology: technology || tech || 'all',
                    message: 'Score acknowledged for guest. Sign in to save your personal best and track progress on the leaderboard!'
                });
            }

            const result = await GameModel.recordScore({
                userId,
                gameSlug: slug.toLowerCase(),
                score: Number(score),
                durationSeconds: Number(durationSeconds || 0),
                accuracy: accuracy !== undefined ? Number(accuracy) : 100,
                wpm: wpm !== undefined ? Number(wpm) : 0,
                difficulty: difficulty || 'All Levels',
                technology: technology || tech || 'all',
                metadata: metadata || {}
            });

            res.json({
                success: true,
                isGuest: false,
                ...result,
                technology: technology || tech || 'all',
                message: result.isNewHighScore
                    ? 'Incredible! New personal best score recorded!'
                    : 'Game score recorded successfully.'
            });
        } catch (err) {
            console.error('Error submitting game score:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to record game score.',
                error: err.message
            });
        }
    },

    /**
     * POST /api/games/:slug/favorite
     * Toggle favorite game for logged-in user
     */
    toggleFavorite: async (req, res) => {
        try {
            const { slug } = req.params;
            const userId = req.user?.id || getOptionalUserId(req);

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Please sign in to favorite games.'
                });
            }

            const isFavorite = await GameModel.toggleFavorite(userId, slug.toLowerCase());
            res.json({
                success: true,
                isFavorite,
                message: isFavorite ? 'Added to your favorite games!' : 'Removed from your favorites.'
            });
        } catch (err) {
            console.error('Error toggling game favorite:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle favorite status.',
                error: err.message
            });
        }
    },

    /**
     * GET /api/games/user/stats
     * Get personal game statistics for logged-in user
     */
    getUserGameStats: async (req, res) => {
        try {
            const userId = req.user?.id || getOptionalUserId(req);
            if (!userId) {
                return res.json({
                    success: true,
                    isGuest: true,
                    data: {
                        totalPlayed: 0,
                        highScores: {},
                        bestWpm: {},
                        bestAccuracy: {},
                        favorites: [],
                        recentGames: [],
                        history: []
                    }
                });
            }

            const stats = await GameModel.getUserStats(userId);
            res.json({
                success: true,
                isGuest: false,
                data: stats
            });
        } catch (err) {
            console.error('Error getting user game stats:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch personal game stats.',
                error: err.message
            });
        }
    },

    /**
     * GET /api/games/:slug/progress
     * Retrieve saved in-progress game state
     */
    getProgress: async (req, res) => {
        try {
            const { slug } = req.params;
            const userId = req.user?.id || getOptionalUserId(req) || 'guest';
            const progress = await GameModel.getActiveProgress(userId, slug.toLowerCase());
            res.json({
                success: true,
                isGuest: userId === 'guest',
                data: progress
            });
        } catch (err) {
            console.error('Error getting game progress:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve game progress.',
                error: err.message
            });
        }
    },

    /**
     * POST /api/games/:slug/progress
     * Save active in-progress game state
     */
    saveProgress: async (req, res) => {
        try {
            const { slug } = req.params;
            const userId = req.user?.id || getOptionalUserId(req) || 'guest';
            const { puzzleIndex, score, streak, completedPuzzles, currentBlocks } = req.body;

            const record = await GameModel.saveActiveProgress(userId, slug.toLowerCase(), {
                puzzleIndex: Number(puzzleIndex || 0),
                score: Number(score || 0),
                streak: Number(streak || 0),
                completedPuzzles: completedPuzzles || [],
                currentBlocks: currentBlocks || null
            });

            res.json({
                success: true,
                isGuest: userId === 'guest',
                data: record,
                message: 'Game progress saved successfully.'
            });
        } catch (err) {
            console.error('Error saving game progress:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to save game progress.',
                error: err.message
            });
        }
    },

    /**
     * DELETE /api/games/:slug/progress
     * Reset/clear active in-progress game state
     */
    clearProgress: async (req, res) => {
        try {
            const { slug } = req.params;
            const userId = req.user?.id || getOptionalUserId(req) || 'guest';
            await GameModel.clearActiveProgress(userId, slug.toLowerCase());
            res.json({
                success: true,
                message: 'Game progress reset successfully.'
            });
        } catch (err) {
            console.error('Error clearing game progress:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to clear game progress.',
                error: err.message
            });
        }
    },

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * GET /api/admin/games
     * List all games including unpublished
     */
    adminGetGames: async (req, res) => {
        try {
            const games = await GameModel.getAll();
            res.json({
                success: true,
                count: games.length,
                data: games
            });
        } catch (err) {
            console.error('Admin get games error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    /**
     * POST /api/admin/games
     * Create a new game
     */
    adminCreateGame: async (req, res) => {
        try {
            const { title, description, instructions, category, difficulty, thumbnail, badge, cardSize, isPublished, isFeatured, order } = req.body;
            if (!title) {
                return res.status(400).json({ success: false, message: 'Game title is required.' });
            }

            const game = await GameModel.create({
                title,
                description: description || '',
                instructions: instructions || '',
                category: category || 'Coding Games',
                difficulty: difficulty || 'All Levels',
                thumbnail: thumbnail || 'gradient-indigo',
                badge: badge || '',
                cardSize: cardSize || 'medium',
                isPublished: isPublished !== false,
                isFeatured: Boolean(isFeatured),
                order: Number(order || 0)
            });

            res.status(201).json({
                success: true,
                message: 'Game created successfully.',
                data: game
            });
        } catch (err) {
            console.error('Admin create game error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    /**
     * PUT /api/admin/games/:id
     * Update existing game
     */
    adminUpdateGame: async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await GameModel.update(id, req.body);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Game not found.' });
            }
            res.json({
                success: true,
                message: 'Game updated successfully.',
                data: updated
            });
        } catch (err) {
            console.error('Admin update game error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    /**
     * DELETE /api/admin/games/:id
     * Delete a game
     */
    adminDeleteGame: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await GameModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Game not found.' });
            }
            res.json({
                success: true,
                message: 'Game deleted successfully.'
            });
        } catch (err) {
            console.error('Admin delete game error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    /**
     * PATCH /api/admin/games/:id/toggle-publish
     */
    adminTogglePublish: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await GameModel.findBySlug(id) || (await GameModel.getAll()).find(g => g.id === id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Game not found.' });
            }
            const updated = await GameModel.update(existing.id || existing.slug, {
                isPublished: !existing.isPublished
            });
            res.json({
                success: true,
                message: `Game ${updated.isPublished ? 'published' : 'unpublished'} successfully.`,
                data: updated
            });
        } catch (err) {
            console.error('Admin toggle publish error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    /**
     * PATCH /api/admin/games/:id/toggle-feature
     */
    adminToggleFeature: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await GameModel.findBySlug(id) || (await GameModel.getAll()).find(g => g.id === id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Game not found.' });
            }
            const updated = await GameModel.update(existing.id || existing.slug, {
                isFeatured: !existing.isFeatured
            });
            res.json({
                success: true,
                message: `Game feature status ${updated.isFeatured ? 'enabled' : 'disabled'}.`,
                data: updated
            });
        } catch (err) {
            console.error('Admin toggle feature error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    /**
     * POST /api/admin/games/seed
     * Reset / seed initial games
     */
    adminSeedGames: async (req, res) => {
        try {
            const seeded = await GameModel.resetSeed();
            res.json({
                success: true,
                message: 'Initial games catalog seeded successfully.',
                data: seeded
            });
        } catch (err) {
            console.error('Admin seed games error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ==========================================
    // TECHNOLOGY CATEGORIES ADMIN ENDPOINTS
    // ==========================================

    adminGetTechCategories: async (req, res) => {
        try {
            const categories = await TechnologyModel.getAllCategories({ includeDisabled: true });
            res.json({ success: true, count: categories.length, data: categories });
        } catch (err) {
            console.error('Admin get categories error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    adminCreateTechCategory: async (req, res) => {
        try {
            const category = await TechnologyModel.createCategory(req.body);
            res.status(201).json({ success: true, message: 'Technology category created.', data: category });
        } catch (err) {
            console.error('Admin create category error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    adminUpdateTechCategory: async (req, res) => {
        try {
            const updated = await TechnologyModel.updateCategory(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Category not found.' });
            }
            res.json({ success: true, message: 'Technology category updated.', data: updated });
        } catch (err) {
            console.error('Admin update category error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    adminDeleteTechCategory: async (req, res) => {
        try {
            const success = await TechnologyModel.deleteCategory(req.params.id);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Category not found.' });
            }
            res.json({ success: true, message: 'Technology category deleted successfully.' });
        } catch (err) {
            console.error('Admin delete category error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ==========================================
    // TECHNOLOGIES ADMIN ENDPOINTS
    // ==========================================

    adminGetTechnologies: async (req, res) => {
        try {
            const { categorySlug, search } = req.query;
            const technologies = await TechnologyModel.getAllTechnologies({
                categorySlug,
                isEnabled: null,
                search
            });
            res.json({ success: true, count: technologies.length, data: technologies });
        } catch (err) {
            console.error('Admin get technologies error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    adminCreateTechnology: async (req, res) => {
        try {
            const tech = await TechnologyModel.createTechnology(req.body);
            res.status(201).json({ success: true, message: 'Technology created successfully.', data: tech });
        } catch (err) {
            console.error('Admin create technology error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    adminUpdateTechnology: async (req, res) => {
        try {
            const updated = await TechnologyModel.updateTechnology(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Technology not found.' });
            }
            res.json({ success: true, message: 'Technology updated successfully.', data: updated });
        } catch (err) {
            console.error('Admin update technology error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    adminDeleteTechnology: async (req, res) => {
        try {
            const success = await TechnologyModel.deleteTechnology(req.params.id);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Technology not found.' });
            }
            res.json({ success: true, message: 'Technology deleted successfully.' });
        } catch (err) {
            console.error('Admin delete technology error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    adminToggleTechnology: async (req, res) => {
        try {
            const updated = await TechnologyModel.toggleTechnology(req.params.id);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Technology not found.' });
            }
            res.json({
                success: true,
                message: `Technology ${updated.isEnabled ? 'activated' : 'deactivated'} successfully.`,
                data: updated
            });
        } catch (err) {
            console.error('Admin toggle technology error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ==========================================
    // TECHNOLOGY-SPECIFIC CHALLENGES & QUESTIONS ADMIN
    // ==========================================

    adminGetChallenges: async (req, res) => {
        try {
            const { gameSlug, technology, difficulty } = req.query;
            const where = {};
            if (gameSlug && gameSlug !== 'all') where.gameSlug = gameSlug;
            if (technology && technology !== 'all') where.technology = technology;
            if (difficulty && difficulty !== 'All Levels') where.difficulty = difficulty;

            let challenges = await prisma.gameChallenge.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            }).catch(() => []);

            if (!challenges || challenges.length === 0) {
                challenges = TECHNOLOGY_CHALLENGES.filter(c =>
                    (!gameSlug || gameSlug === 'all' || c.gameSlug === gameSlug) &&
                    (!technology || technology === 'all' || c.technology === technology) &&
                    (!difficulty || difficulty === 'All Levels' || c.difficulty === difficulty)
                );
            }

            res.json({
                success: true,
                count: challenges.length,
                data: challenges
            });
        } catch (err) {
            console.error('Admin get challenges error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    adminCreateChallenge: async (req, res) => {
        try {
            const { gameSlug, technology, title, difficulty, language, description, content, solution, hints, explanation, points } = req.body;
            if (!gameSlug || !title) {
                return res.status(400).json({ success: false, message: 'gameSlug and title are required.' });
            }

            const challenge = await prisma.gameChallenge.create({
                data: {
                    gameSlug: gameSlug.toLowerCase(),
                    technology: technology ? technology.toLowerCase() : 'general',
                    technologyName: req.body.technologyName || '',
                    title,
                    difficulty: difficulty || 'Beginner',
                    language: language || 'javascript',
                    description: description || '',
                    content: typeof content === 'object' ? JSON.stringify(content) : (content || ''),
                    solution: typeof solution === 'object' ? JSON.stringify(solution) : (solution || ''),
                    hints: hints || '',
                    explanation: explanation || '',
                    points: Number(points || 100),
                    order: 0
                }
            }).catch(async () => {
                // In-memory fallback
                const newC = {
                    id: `ch_${Date.now()}`,
                    gameSlug: gameSlug.toLowerCase(),
                    technology: technology ? technology.toLowerCase() : 'general',
                    title,
                    difficulty: difficulty || 'Beginner',
                    language: language || 'javascript',
                    description: description || '',
                    content: typeof content === 'object' ? JSON.stringify(content) : (content || ''),
                    solution: typeof solution === 'object' ? JSON.stringify(solution) : (solution || ''),
                    hints: hints || '',
                    explanation: explanation || '',
                    points: Number(points || 100),
                    order: 0,
                    createdAt: new Date()
                };
                TECHNOLOGY_CHALLENGES.unshift(newC);
                return newC;
            });

            res.status(201).json({
                success: true,
                message: 'Challenge created successfully.',
                data: challenge
            });
        } catch (err) {
            console.error('Admin create challenge error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    adminUpdateChallenge: async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await prisma.gameChallenge.update({
                where: { id },
                data: {
                    title: req.body.title,
                    gameSlug: req.body.gameSlug,
                    technology: req.body.technology,
                    difficulty: req.body.difficulty,
                    language: req.body.language,
                    description: req.body.description,
                    content: typeof req.body.content === 'object' ? JSON.stringify(req.body.content) : req.body.content,
                    solution: typeof req.body.solution === 'object' ? JSON.stringify(req.body.solution) : req.body.solution,
                    hints: req.body.hints,
                    explanation: req.body.explanation,
                    points: req.body.points ? Number(req.body.points) : undefined
                }
            }).catch(() => {
                const c = TECHNOLOGY_CHALLENGES.find(item => item.id === id);
                if (c) {
                    Object.assign(c, req.body);
                    return c;
                }
                return null;
            });

            if (!updated) {
                return res.status(404).json({ success: false, message: 'Challenge not found.' });
            }

            res.json({ success: true, message: 'Challenge updated.', data: updated });
        } catch (err) {
            console.error('Admin update challenge error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    adminDeleteChallenge: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.gameChallenge.delete({ where: { id } }).catch(() => {
                const idx = TECHNOLOGY_CHALLENGES.findIndex(c => c.id === id);
                if (idx !== -1) TECHNOLOGY_CHALLENGES.splice(idx, 1);
            });
            res.json({ success: true, message: 'Challenge deleted successfully.' });
        } catch (err) {
            console.error('Admin delete challenge error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ==========================================
    // ADMIN STATISTICS & USER PERFORMANCE
    // ==========================================

    adminGetStats: async (req, res) => {
        try {
            const stats = await TechnologyModel.getAdminStatistics();
            res.json({
                success: true,
                data: stats
            });
        } catch (err) {
            console.error('Admin get stats error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = gameController;
