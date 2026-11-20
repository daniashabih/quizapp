import axios from 'axios';

const seoService = {
    getDashboard: async ({ domain = 'www.hangbug.com', range = '28d', startDate = '', endDate = '' } = {}) => {
        const params = { domain, range };
        if (range === 'custom' && startDate && endDate) {
            params.startDate = startDate;
            params.endDate = endDate;
        }
        const res = await axios.get('/admin/seo/dashboard', { params, timeout: 30000 });
        return res.data;
    },

    runAudit: async ({ domain = 'www.hangbug.com', useLiveHttp = true } = {}) => {
        const res = await axios.post('/admin/seo/audit/run', { domain, useLiveHttp }, { timeout: 60000 });
        return res.data;
    },

    runPageSpeed: async ({ domain = 'www.hangbug.com', url = '', strategy = 'mobile', forceRefresh = false } = {}) => {
        const res = await axios.post('/admin/seo/pagespeed/run', { domain, url, strategy, forceRefresh }, { timeout: 45000 });
        return res.data;
    },

    inspectUrl: async ({ domain = 'www.hangbug.com', url = '/' } = {}) => {
        const res = await axios.post('/admin/seo/inspect-url', { domain, url }, { timeout: 25000 });
        return res.data;
    },

    toggleRecommendation: async (recKey, { domain = 'www.hangbug.com', isCompleted, title, priority, notes } = {}) => {
        const res = await axios.patch(
            `/admin/seo/recommendations/${encodeURIComponent(recKey)}`,
            { domain, isCompleted, title, priority, notes },
            { timeout: 15000 }
        );
        return res.data;
    },

    addCompetitor: async ({ domain = 'www.hangbug.com', competitorDomain, label = '', notes = '' } = {}) => {
        const res = await axios.post(
            '/admin/seo/competitors',
            { domain, competitorDomain, label, notes },
            { timeout: 25000 }
        );
        return res.data;
    },

    refreshCompetitor: async (id, domain = 'www.hangbug.com') => {
        const res = await axios.post(`/admin/seo/competitors/${encodeURIComponent(id)}/refresh`, { domain }, { timeout: 25000 });
        return res.data;
    },

    deleteCompetitor: async (id, domain = 'www.hangbug.com') => {
        const res = await axios.delete(`/admin/seo/competitors/${encodeURIComponent(id)}`, {
            params: { domain },
            timeout: 15000
        });
        return res.data;
    },

    getSettings: async (domain = 'www.hangbug.com') => {
        const res = await axios.get('/admin/seo/settings', { params: { domain }, timeout: 15000 });
        return res.data;
    },

    updateSettings: async (domain, payload) => {
        const res = await axios.put('/admin/seo/settings', { domain, ...payload }, { timeout: 20000 });
        return res.data;
    },

    testIntegration: async (domain, target, options = {}) => {
        const res = await axios.post(
            '/admin/seo/integrations/test',
            { domain, target, ...options },
            { timeout: 30000 }
        );
        return res.data;
    },

    importBacklinks: async (domain, payload) => {
        const body = Array.isArray(payload)
            ? { domain, items: payload }
            : { domain, ...(payload || {}) };
        const res = await axios.post('/admin/seo/backlinks/import', body, { timeout: 25000 });
        return res.data;
    },

    clearImportedBacklinks: async (domain = 'www.hangbug.com') => {
        const res = await axios.delete('/admin/seo/backlinks/import', {
            params: { domain },
            timeout: 15000
        });
        return res.data;
    }
};

export default seoService;
