import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
    timeout: 15000,
});

export const settingsService = {
    /**
     * Get Central Application Settings
     * GET /api/settings
     */
    getSettings: async () => {
        const response = await api.get('/settings');
        return response.data;
    },

    /**
     * Update Central Application Settings (Admin Only)
     * PUT /api/settings
     */
    updateSettings: async (updates) => {
        const response = await api.put('/settings', updates);
        return response.data;
    }
};

export default settingsService;
