import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
});

export const attemptService = {
    /**
     * Start a new attempt or resume an active one
     * POST /api/attempts/start
     */
    startOrResumeAttempt: async ({ category, session, questionsSnapshot, totalQuestions, forceNew = false, checkOnly = false }) => {
        const response = await api.post('/attempts/start', {
            category,
            session,
            questionsSnapshot,
            totalQuestions,
            forceNew,
            checkOnly
        });
        return response.data;
    },

    /**
     * Check if an active in-progress attempt exists without creating one
     */
    checkActiveAttempt: async (category, session) => {
        const response = await api.post('/attempts/start', {
            category,
            session,
            checkOnly: true
        });
        return response.data;
    },

    /**
     * Get all in-progress quiz attempts for current user
     * GET /api/attempts/in-progress
     */
    getInProgressAttempts: async () => {
        const response = await api.get('/attempts/in-progress');
        return response.data;
    },

    /**
     * Fetch a specific attempt by ID
     * GET /api/attempts/:id
     */
    getAttemptById: async (id) => {
        const response = await api.get(`/attempts/${id}`);
        return response.data;
    },

    /**
     * Update progress of an in-progress attempt
     * PUT /api/attempts/:id
     */
    updateProgress: async (id, data) => {
        const response = await api.put(`/attempts/${id}`, data);
        return response.data;
    },

    /**
     * Mark an attempt as completed upon final submit
     * POST /api/attempts/:id/complete
     */
    completeAttempt: async (id, data = {}) => {
        const response = await api.post(`/attempts/${id}/complete`, data);
        return response.data;
    },

    /**
     * Discard an unfinished attempt
     * DELETE /api/attempts/:id
     */
    discardAttempt: async (id) => {
        const response = await api.delete(`/attempts/${id}`);
        return response.data;
    }
};

export default attemptService;
