const GameModel = require('../_models/gameModel');
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
     * Public list of published games with category filtering, search, and optional user metrics
     */
    getGames: async (req, res) => {
        try {
            const { category, search, featured } = req.query;
            const userId = getOptionalUserId(req);

            const games = await GameModel.getAll({
                category,
                search,
                isPublished: true,
                isFeatured: featured ? (featured === 'true' || featured === '1') : undefined,
                userId
            });

            // Find daily featured game (or fallback to first featured game)
            const featuredGames = games.filter(g => g.isFeatured);
            const featuredGame = featuredGames.length > 0 ? featuredGames[0] : (games[0] || null);

            // Compute category counts
            const allPublished = await GameModel.getAll({ isPublished: true, userId });
            const categoryCounts = {
                'All Games': allPublished.length,
                'Puzzle Games': 0,
                'Arcade Games': 0,
                'Racing Games': 0,
                'Sports Games': 0,
                'Brain Games': 0,
                'Adventure Games': 0,
                'Casual Games': 0
            };
            allPublished.forEach(g => {
                if (categoryCounts[g.category] !== undefined) {
                    categoryCounts[g.category] += 1;
                }
            });

            res.json({
                success: true,
                count: games.length,
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
     * POST /api/games/:slug/score
     * Record a user's score (supports authenticated users, returns guest hint if unauthenticated)
     */
    submitScore: async (req, res) => {
        try {
            const { slug } = req.params;
            const { score, durationSeconds, metadata } = req.body;
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
                    message: 'Score acknowledged for guest. Sign in to save your personal best and track progress on the leaderboard!'
                });
            }

            const result = await GameModel.recordScore({
                userId,
                gameSlug: slug.toLowerCase(),
                score: Number(score),
                durationSeconds: Number(durationSeconds || 0),
                metadata: metadata || {}
            });

            res.json({
                success: true,
                isGuest: false,
                ...result,
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
            const { title, description, instructions, category, thumbnail, badge, cardSize, isPublished, isFeatured, order } = req.body;
            if (!title) {
                return res.status(400).json({ success: false, message: 'Game title is required.' });
            }

            const game = await GameModel.create({
                title,
                description: description || '',
                instructions: instructions || '',
                category: category || 'Casual Games',
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
            const seeded = GameModel.resetSeed();
            res.json({
                success: true,
                message: 'Initial games catalog seeded successfully.',
                data: seeded
            });
        } catch (err) {
            console.error('Admin seed games error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = gameController;
