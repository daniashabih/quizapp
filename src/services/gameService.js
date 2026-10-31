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
     * Submit game score
     */
    submitScore: async (slug, { score, durationSeconds, metadata }) => {
        const response = await axios.post(
            `${API_BASE}/${slug}/score`,
            { score, durationSeconds, metadata },
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
