import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
    timeout: 15000,
});

export const blogService = {
    /**
     * Get published blog articles with search, category filtering & pagination
     */
    getPublishedArticles: async ({ category = '', search = '', page = 1, limit = 9, tag = '' } = {}) => {
        const params = {};
        if (category && category !== 'All') params.category = category;
        if (search) params.search = search;
        if (page) params.page = page;
        if (limit) params.limit = limit;
        if (tag) params.tag = tag;

        const response = await api.get('/blog', { params });
        return response.data;
    },

    /**
     * Get featured article for hero showcase
     */
    getFeaturedArticle: async () => {
        const response = await api.get('/blog/featured');
        return response.data;
    },

    /**
     * Get active technology categories with published article counts
     */
    getCategories: async () => {
        const response = await api.get('/blog/categories');
        return response.data;
    },

    /**
     * Get single article by slug
     */
    getArticleBySlug: async (slug) => {
        const response = await api.get(`/blog/${slug}`);
        return response.data;
    },

    /**
     * Admin: Get all articles (drafts + published) with pagination
     */
    adminGetArticles: async ({ search = '', category = '', status = '', page = 1, limit = 20 } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (category && category !== 'All') params.category = category;
        if (status) params.status = status;
        if (page) params.page = page;
        if (limit) params.limit = limit;

        const response = await api.get('/admin/blog', { params });
        return response.data;
    },

    /**
     * Admin: Create new blog article
     */
    adminCreateArticle: async (articleData) => {
        const response = await api.post('/admin/blog', articleData);
        return response.data;
    },

    /**
     * Admin: Update existing article
     */
    adminUpdateArticle: async (id, articleData) => {
        const response = await api.put(`/admin/blog/${id}`, articleData);
        return response.data;
    },

    /**
     * Admin: Delete article
     */
    adminDeleteArticle: async (id) => {
        const response = await api.delete(`/admin/blog/${id}`);
        return response.data;
    },

    /**
     * Admin: Toggle publish status
     */
    adminTogglePublish: async (id) => {
        const response = await api.patch(`/admin/blog/${id}/toggle-publish`);
        return response.data;
    },

    /**
     * Admin: Seed default 10 articles to MongoDB
     */
    adminSeedArticles: async () => {
        const response = await api.post('/admin/blog/seed');
        return response.data;
    }
};

export default blogService;
