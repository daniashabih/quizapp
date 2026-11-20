import axios from 'axios';

const CHUNK_UPLOAD_THRESHOLD = 3 * 1024 * 1024; // 3MB threshold for Vercel-safe chunked uploads
const CHUNK_PART_SIZE = 2 * 1024 * 1024; // 2MB per chunk

async function computeFileSha256(file) {
    try {
        if (typeof window !== 'undefined' && window.crypto?.subtle) {
            const buffer = await file.arrayBuffer();
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
    } catch {
        // Fallback when Web Crypto is unavailable
    }
    return '';
}

const aiVerificationService = {
    verifyQuestion: async ({
        questionId,
        questionText,
        options,
        correctAnswer,
        technology,
        userSelectedAnswer,
        bypassCache = false
    }) => {
        const res = await axios.post(
            '/ai/verify-question',
            {
                questionId,
                questionText,
                options,
                correctAnswer,
                technology,
                userSelectedAnswer,
                bypassCache
            },
            { timeout: 45000 }
        );
        return res.data;
    },

    // --- Admin AI Knowledge Base ---
    getKnowledgeBaseStatus: async () => {
        const res = await axios.get('/admin/knowledge-base/status', { timeout: 20000 });
        return res.data;
    },

    setupVectorIndex: async () => {
        const res = await axios.post('/admin/knowledge-base/setup-vector-index', {}, { timeout: 30000 });
        return res.data;
    },

    listBooks: async ({ technology = 'all', status = 'all', search = '' } = {}) => {
        const params = {};
        if (technology && technology !== 'all') params.technology = technology;
        if (status && status !== 'all') params.status = status;
        if (search && search.trim()) params.search = search.trim();
        const res = await axios.get('/admin/knowledge-base/books', { params, timeout: 20000 });
        return res.data;
    },

    getBookDetails: async (bookId) => {
        const res = await axios.get(`/admin/knowledge-base/books/${bookId}`, { timeout: 20000 });
        return res.data;
    },

    uploadBook: async ({ file, title = '', author = '', edition = '', description = '', publicationYear = null, technology, onProgress }) => {
        // Use Vercel-safe chunked upload automatically for larger books (>3MB)
        if (file && file.size > CHUNK_UPLOAD_THRESHOLD) {
            const totalParts = Math.ceil(file.size / CHUNK_PART_SIZE);
            const ext = (file.name.split('.').pop() || '').toLowerCase();
            const fileHash = await computeFileSha256(file);

            if (onProgress) onProgress(5);
            const initRes = await axios.post('/admin/knowledge-base/books/init-upload', {
                ...(title ? { title } : {}),
                ...(author ? { author } : {}),
                ...(edition ? { edition } : {}),
                ...(description ? { description } : {}),
                ...(publicationYear ? { publicationYear } : {}),
                technology,
                fileName: file.name,
                fileType: ext,
                mimeType: file.type || 'application/octet-stream',
                fileSize: file.size,
                fileHash,
                totalParts
            }, { timeout: 30000 });

            const bookId = initRes.data?.book?.id;
            if (!bookId) throw new Error('Failed to initialize chunked book upload.');

            for (let partIndex = 0; partIndex < totalParts; partIndex++) {
                const start = partIndex * CHUNK_PART_SIZE;
                const end = Math.min(file.size, start + CHUNK_PART_SIZE);
                const slice = file.slice(start, end);
                const formData = new FormData();
                formData.append('partIndex', String(partIndex));
                formData.append('chunk', slice, `${file.name}.part${partIndex}`);

                await axios.post(`/admin/knowledge-base/books/${bookId}/upload-part`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 60000
                });

                if (onProgress) {
                    const pct = 10 + Math.round(((partIndex + 1) / totalParts) * 80);
                    onProgress(Math.min(90, pct));
                }
            }

            const finalRes = await axios.post(
                `/admin/knowledge-base/books/${bookId}/finalize-upload`,
                {},
                { timeout: 60000 }
            );
            if (onProgress) onProgress(100);
            return finalRes.data;
        }

        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);
        if (author) formData.append('author', author);
        if (edition) formData.append('edition', edition);
        if (description) formData.append('description', description);
        if (publicationYear) formData.append('publicationYear', String(publicationYear));
        formData.append('technology', technology);

        const res = await axios.post('/admin/knowledge-base/books', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000,
            onUploadProgress: (evt) => {
                if (onProgress && evt.total) {
                    onProgress(Math.round((evt.loaded / evt.total) * 100));
                }
            }
        });
        return res.data;
    },

    updateBookMetadata: async (bookId, payload) => {
        const res = await axios.put(`/admin/knowledge-base/books/${bookId}`, payload, { timeout: 20000 });
        return res.data;
    },

    replaceBookFile: async (bookId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`/admin/knowledge-base/books/${bookId}/replace`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000
        });
        return res.data;
    },

    toggleBookEnabled: async (bookId, isEnabled) => {
        const res = await axios.patch(`/admin/knowledge-base/books/${bookId}/toggle`, { isEnabled }, { timeout: 20000 });
        return res.data;
    },

    processBookStep: async (bookId, payload = {}) => {
        const res = await axios.post(`/admin/knowledge-base/books/${bookId}/process-step`, payload, { timeout: 55000 });
        return res.data;
    },

    retryBookProcessing: async (bookId, payload = {}) => {
        const res = await axios.post(`/admin/knowledge-base/books/${bookId}/retry`, payload, { timeout: 30000 });
        return res.data;
    },

    deleteBook: async (bookId) => {
        const res = await axios.delete(`/admin/knowledge-base/books/${bookId}`, { timeout: 20000 });
        return res.data;
    },

    // --- Admin AI Verification Reports ---
    getVerificationReports: async ({ status = 'all', technology = 'all', reviewStatus = 'all', search = '' } = {}) => {
        const params = {};
        if (status && status !== 'all') params.status = status;
        if (technology && technology !== 'all') params.technology = technology;
        if (reviewStatus && reviewStatus !== 'all') params.reviewStatus = reviewStatus;
        if (search && search.trim()) params.search = search.trim();
        const res = await axios.get('/admin/verification-reports', { params, timeout: 20000 });
        return res.data;
    },

    getCorrectionHistory: async () => {
        const res = await axios.get('/admin/verification-reports/history', { timeout: 20000 });
        return res.data;
    },

    approveReportCorrection: async (reportId, { correctedAnswer, correctedExplanation, notes }) => {
        const res = await axios.post(
            `/admin/verification-reports/${reportId}/approve`,
            { correctedAnswer, correctedExplanation, notes },
            { timeout: 20000 }
        );
        return res.data;
    },

    dismissReport: async (reportId, notes = '') => {
        const res = await axios.post(
            `/admin/verification-reports/${reportId}/dismiss`,
            { notes },
            { timeout: 20000 }
        );
        return res.data;
    },

    deleteReport: async (reportId) => {
        const res = await axios.delete(`/admin/verification-reports/${reportId}`, { timeout: 20000 });
        return res.data;
    },

    // --- Admin AI Provider Controls, Testing & Usage ---
    getAiStatus: async () => {
        const res = await axios.get('/admin/ai/status', { timeout: 20000 });
        return res.data;
    },

    getAiModels: async ({ refresh = false } = {}) => {
        const res = await axios.get('/admin/ai/models', {
            params: refresh ? { refresh: '1' } : {},
            timeout: 20000
        });
        return res.data;
    },

    getAiUsage: async () => {
        const res = await axios.get('/admin/ai/usage', { timeout: 20000 });
        return res.data;
    },

    testAiModel: async (payload) => {
        const res = await axios.post('/admin/ai/test', payload, { timeout: 45000 });
        return res.data;
    },

    clearAiCache: async () => {
        const res = await axios.post('/admin/ai/cache/clear', {}, { timeout: 15000 });
        return res.data;
    }
};

export default aiVerificationService;
