import axios from 'axios';

const CHUNK_THRESHOLD_BYTES = 3 * 1024 * 1024;
const CHUNK_SIZE_BYTES = 2 * 1024 * 1024;

async function computeFileSha256(file) {
    try {
        if (typeof window !== 'undefined' && window.crypto?.subtle && file?.arrayBuffer) {
            const buffer = await file.arrayBuffer();
            const digest = await window.crypto.subtle.digest('SHA-256', buffer);
            return Array.from(new Uint8Array(digest))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
    } catch {
        // Fallback when running in non-HTTPS contexts where WebCrypto subtle is unavailable
    }
    return '';
}

const bookQuizService = {
    getCategories: async () => {
        const res = await axios.get('/categories', { timeout: 15000 });
        return Array.isArray(res.data) ? res.data : (res.data?.categories || []);
    },

    listJobs: async (category = 'all') => {
        const res = await axios.get('/admin/book-quiz/jobs', {
            params: category && category !== 'all' ? { category } : {},
            timeout: 20000
        });
        return res.data;
    },

    getJobDetails: async (jobId) => {
        const res = await axios.get(`/admin/book-quiz/jobs/${encodeURIComponent(jobId)}`, {
            timeout: 20000
        });
        return res.data;
    },

    uploadPdf: async ({ file, category, targetPerSession = 50, onUploadProgress }) => {
        if (!file) {
            throw new Error('Please choose a PDF file to upload.');
        }

        if (file.size <= CHUNK_THRESHOLD_BYTES) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);
            formData.append('targetPerSession', String(targetPerSession));

            const res = await axios.post('/admin/book-quiz/jobs/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000,
                onUploadProgress: (evt) => {
                    if (evt.total && onUploadProgress) {
                        onUploadProgress({
                            phase: 'uploading',
                            percent: Math.min(99, Math.round((evt.loaded / evt.total) * 100)),
                            loadedParts: 1,
                            totalParts: 1
                        });
                    }
                }
            });
            onUploadProgress?.({ phase: 'uploaded', percent: 100, loadedParts: 1, totalParts: 1 });
            return res.data;
        }

        const totalParts = Math.ceil(file.size / CHUNK_SIZE_BYTES);
        const fileHash = await computeFileSha256(file);

        const initRes = await axios.post('/admin/book-quiz/jobs/init-upload', {
            fileName: file.name,
            fileSize: file.size,
            fileHash,
            mimeType: file.type || 'application/pdf',
            totalParts,
            category,
            targetPerSession
        }, { timeout: 30000 });

        const jobId = initRes.data?.job?.id;
        if (!jobId) {
            throw new Error('Failed to initialize chunked PDF upload.');
        }

        for (let partIndex = 0; partIndex < totalParts; partIndex++) {
            const start = partIndex * CHUNK_SIZE_BYTES;
            const end = Math.min(file.size, start + CHUNK_SIZE_BYTES);
            const slice = file.slice(start, end);

            const chunkForm = new FormData();
            chunkForm.append('chunk', slice, `${file.name}.part${partIndex}`);
            chunkForm.append('partIndex', String(partIndex));

            await axios.post(`/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/upload-part`, chunkForm, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000
            });

            onUploadProgress?.({
                phase: 'uploading',
                percent: Math.round(((partIndex + 1) / totalParts) * 100),
                loadedParts: partIndex + 1,
                totalParts
            });
        }

        const finalRes = await axios.post(
            `/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/finalize-upload`,
            {},
            { timeout: 60000 }
        );
        return finalRes.data;
    },

    runExtractStep: async (jobId, timeBudgetMs) => {
        const res = await axios.post(
            `/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/extract-step`,
            timeBudgetMs ? { timeBudgetMs } : {},
            { timeout: 58000 }
        );
        return res.data;
    },

    startGeneration: async (jobId) => {
        const res = await axios.post(
            `/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/start`,
            {},
            { timeout: 25000 }
        );
        return res.data;
    },

    runGenerationStep: async (jobId) => {
        const res = await axios.post(
            `/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/step`,
            {},
            { timeout: 58000 }
        );
        return res.data;
    },

    pauseGeneration: async (jobId) => {
        const res = await axios.post(
            `/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/pause`,
            {},
            { timeout: 20000 }
        );
        return res.data;
    },

    resumeGeneration: async (jobId) => {
        const res = await axios.post(
            `/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/resume`,
            {},
            { timeout: 25000 }
        );
        return res.data;
    },

    retrySession: async (jobId, sessionNumber) => {
        const res = await axios.post(
            `/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/sessions/${encodeURIComponent(sessionNumber)}/retry`,
            {},
            { timeout: 25000 }
        );
        return res.data;
    },

    getJobQuestions: async (jobId, { session = 'all', difficulty = 'all', approved = 'all', search = '' } = {}) => {
        const res = await axios.get(`/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/questions`, {
            params: { session, difficulty, approved, search },
            timeout: 25000
        });
        return res.data;
    },

    updateStagedQuestion: async (jobId, sessionNumber, uid, patch) => {
        const res = await axios.patch(
            `/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/sessions/${encodeURIComponent(sessionNumber)}/questions/${encodeURIComponent(uid)}`,
            patch,
            { timeout: 20000 }
        );
        return res.data;
    },

    uploadApprovedQuestions: async (jobId, sessionNumber = 'all') => {
        const res = await axios.post(
            `/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/upload-questions`,
            { sessionNumber },
            { timeout: 60000 }
        );
        return res.data;
    },

    cancelProcessing: async (jobId) => {
        const res = await axios.post(
            `/admin/book-quiz/jobs/${encodeURIComponent(jobId)}/cancel`,
            {},
            { timeout: 20000 }
        );
        return res.data;
    },

    deleteJob: async (jobId) => {
        const res = await axios.delete(`/admin/book-quiz/jobs/${encodeURIComponent(jobId)}`, {
            timeout: 20000
        });
        return res.data;
    }
};

export default bookQuizService;
