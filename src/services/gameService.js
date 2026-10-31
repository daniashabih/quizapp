import axios from 'axios';

const API_BASE = '/api/games';
const ADMIN_API_BASE = '/api/admin/games';

const gameService = {
    /**
     * Get published games with optional category/search filters
     */
    getGames: async (params = {}) => {
        const response = await axios.get(API_BASE, {
            params,
            withCredentials: true
        });
        return response.data;
    },

    /**
     * Get single game details by slug
     */
    getGameBySlug: async (slug) => {
        const response = await axios.get(`${API_BASE}/${slug}`, {
            withCredentials: true
        });
        return response.data;
    },

    /**
     * Get challenges for a game
     */
    getChallenges: async (slug, params = {}) => {
        const response = await axios.get(`${API_BASE}/${slug}/challenges`, {
            params,
            withCredentials: true
        });
        return response.data;
    },

    /**
     * Verify challenge submission on backend
     */
    verifyChallenge: async (slug, challengeId, submission) => {
        const response = await axios.post(
            `${API_BASE}/${slug}/verify`,
            { challengeId, submission },
            { withCredentials: true }
        );
        return response.data;
    },

    /**
     * Get daily featured game quest
     */
    getDailyChallenge: async () => {
        const response = await axios.get(`${API_BASE}/daily/challenge`, {
            withCredentials: true
        });
        return response.data;
    },

    /**
     * Get game leaderboard
     */
    getLeaderboard: async (slug, limit = 10) => {
        const response = await axios.get(`${API_BASE}/leaderboard/${slug}`, {
            params: { limit },
            withCredentials: true
        });
        return response.data;
    },

    /**
     * Submit game score
     */
    submitScore: async (slug, { score, durationSeconds, accuracy, wpm, difficulty, metadata }) => {
        const response = await axios.post(
            `${API_BASE}/${slug}/score`,
            { score, durationSeconds, accuracy, wpm, difficulty, metadata },
            { withCredentials: true }
        );
        return response.data;
    },

    /**
     * Toggle favorite status
     */
    toggleFavorite: async (slug) => {
        const response = await axios.post(
            `${API_BASE}/${slug}/favorite`,
            {},
            { withCredentials: true }
        );
        return response.data;
    },

    /**
     * Get user game stats (high scores, favorites, recent history)
     */
    getUserStats: async () => {
        const response = await axios.get(`${API_BASE}/user/stats`, {
            withCredentials: true
        });
        return response.data;
    },

    // Admin endpoints
    adminGetGames: async () => {
        const response = await axios.get(ADMIN_API_BASE, {
            withCredentials: true
        });
        return response.data;
    },

    adminCreateGame: async (data) => {
        const response = await axios.post(ADMIN_API_BASE, data, {
            withCredentials: true
        });
        return response.data;
    },

    adminUpdateGame: async (id, data) => {
        const response = await axios.put(`${ADMIN_API_BASE}/${id}`, data, {
            withCredentials: true
        });
        return response.data;
    },

    adminDeleteGame: async (id) => {
        const response = await axios.delete(`${ADMIN_API_BASE}/${id}`, {
            withCredentials: true
        });
        return response.data;
    },

    adminTogglePublish: async (id) => {
        const response = await axios.patch(`${ADMIN_API_BASE}/${id}/toggle-publish`, {}, {
            withCredentials: true
        });
        return response.data;
    },

    adminToggleFeature: async (id) => {
        const response = await axios.patch(`${ADMIN_API_BASE}/${id}/toggle-feature`, {}, {
            withCredentials: true
        });
        return response.data;
    },

    adminSeedGames: async () => {
        const response = await axios.post(`${ADMIN_API_BASE}/seed`, {}, {
            withCredentials: true
        });
        return response.data;
    }
};

export default gameService;
