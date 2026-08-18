import axios from 'axios';

// Ensure baseURL and credentials are set
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
});

export const dashboardService = {
    /**
     * Get Authenticated User Dashboard Data
     * GET /api/dashboard/user
     */
    getUserDashboard: async () => {
        const response = await api.get('/dashboard/user');
        return response.data;
    },

    /**
     * Get Admin Dashboard Analytics & Metrics
     * GET /api/dashboard/admin?period=...
     */
    getAdminDashboard: async (period = 'month') => {
        const response = await api.get(`/dashboard/admin?period=${encodeURIComponent(period)}`);
        return response.data;
    },

    /**
     * Get Global Leaderboard derived from MongoDB
     * GET /api/dashboard/leaderboard
     */
    getLeaderboard: async ({ timeframe = 'all-time', category = 'All' } = {}) => {
        const params = new URLSearchParams();
        if (timeframe) params.append('timeframe', timeframe);
        if (category) params.append('category', category);
        const response = await api.get(`/dashboard/leaderboard?${params.toString()}`);
        return response.data;
    },

    /**
     * Get Authenticated User Certificates
     * GET /api/dashboard/certificates
     */
    getMyCertificates: async () => {
        const response = await api.get('/dashboard/certificates');
        return response.data;
    }
};

export default dashboardService;
