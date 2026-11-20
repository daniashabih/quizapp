const { redactSecrets } = require('../_services/aiUsageService');
const bookQuizService = require('../_services/bookQuizGeneratorService');

function resolveAdminActor(req) {
    return req.user?.email || req.user?.username || req.user?.id || req.user?.userId || 'admin';
}

function handleBookQuizError(res, err, fallbackMessage) {
    const safeMessage = redactSecrets(err?.message || fallbackMessage || 'Book quiz generation request failed.');
    console.error(`[BookQuizController]: ${safeMessage}`);

    if (err?.retryAfterSeconds) {
        res.set('Retry-After', String(err.retryAfterSeconds));
    }

    const rawStatus = Number(err?.status || err?.statusCode || 500);
    const status = rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500;
    const payload = {
        success: false,
        error: safeMessage
    };
    if (err?.job) {
        payload.job = err.job;
    }
    return res.status(status).json(payload);
}

/**
 * GET /api/admin/book-quiz/jobs
 */
async function listJobs(req, res) {
    try {
        const category = String(req.query?.category || 'all').trim();
        const jobs = await bookQuizService.listJobs({ category });
        return res.json({ success: true, jobs });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to list PDF quiz generation jobs.');
    }
}

/**
 * GET /api/admin/book-quiz/jobs/:id
 */
async function getJobDetails(req, res) {
    try {
        const job = await bookQuizService.getJobDetails(req.params.id);
        return res.json({ success: true, job });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to load PDF quiz generation job details.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/upload
 */
async function uploadPdfDirect(req, res) {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                error: 'No PDF file uploaded. Please attach a valid .pdf book.'
            });
        }
        const category = String(req.body?.category || '').trim();
        if (!category) {
            return res.status(400).json({
                success: false,
                error: 'Please select a target category/technology before uploading.'
            });
        }
        const targetPerSession = req.body?.targetPerSession ?? req.body?.questionsPerSession ?? 50;

        const job = await bookQuizService.createDirectJob({
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            category,
            targetPerSession,
            createdBy: resolveAdminActor(req)
        });

        return res.status(201).json({ success: true, job });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to upload PDF book.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/init-upload
 */
async function initChunkedPdfUpload(req, res) {
    try {
        const {
            fileName,
            fileSize,
            fileHash = '',
            mimeType = 'application/pdf',
            totalParts = 1,
            category = '',
            targetPerSession = 50,
            questionsPerSession
        } = req.body || {};

        if (!String(category || '').trim()) {
            return res.status(400).json({
                success: false,
                error: 'Please select a target category/technology before initializing upload.'
            });
        }

        const job = await bookQuizService.initChunkedJob({
            fileName,
            fileSize,
            fileHash,
            mimeType,
            totalParts,
            category: String(category).trim(),
            targetPerSession: targetPerSession ?? questionsPerSession ?? 50,
            createdBy: resolveAdminActor(req)
        });

        return res.status(201).json({ success: true, job });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to initialize chunked PDF upload.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/:id/upload-part
 */
async function uploadPdfPart(req, res) {
    try {
        const rawPartIdx = req.body?.partIndex ?? req.query?.partIndex ?? 0;
        const partIndex = parseInt(rawPartIdx, 10);
        if (!Number.isInteger(partIndex) || partIndex < 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid non-negative partIndex is required.'
            });
        }

        let buffer = req.file?.buffer || null;
        if (!buffer && typeof req.body?.chunkBase64 === 'string' && req.body.chunkBase64.trim()) {
            buffer = Buffer.from(req.body.chunkBase64.trim(), 'base64');
        }
        if (!buffer || buffer.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No PDF chunk data received.'
            });
        }

        const result = await bookQuizService.saveJobFilePart(req.params.id, partIndex, buffer);
        return res.json({ success: true, ...result });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to save PDF upload chunk.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/:id/finalize-upload
 */
async function finalizeChunkedPdfUpload(req, res) {
    try {
        const job = await bookQuizService.finalizeChunkedJob(req.params.id);
        return res.json({ success: true, job });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to finalize chunked PDF upload.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/:id/extract-step
 */
async function runExtractStep(req, res) {
    try {
        const rawBudget = Number(req.body?.timeBudgetMs || req.query?.timeBudgetMs || 0);
        const options = rawBudget > 0 ? { timeBudgetMs: rawBudget } : {};
        const result = await bookQuizService.runJobExtractionStep(req.params.id, options);
        return res.json({ success: true, ...result });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed while extracting PDF text and detecting sessions.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/:id/start
 */
async function startGeneration(req, res) {
    try {
        const job = await bookQuizService.startJob(req.params.id);
        return res.json({ success: true, job });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to start session-wise MCQ generation.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/:id/step
 */
async function runGenerationStep(req, res) {
    try {
        const result = await bookQuizService.runJobGenerationStep(req.params.id);
        if (result?.retryAfterSeconds) {
            res.set('Retry-After', String(result.retryAfterSeconds));
        }
        return res.json({ success: true, ...result });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed during MCQ generation & verification step.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/:id/pause
 */
async function pauseGeneration(req, res) {
    try {
        const job = await bookQuizService.pauseJob(req.params.id);
        return res.json({ success: true, job });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to pause MCQ generation.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/:id/resume
 */
async function resumeGeneration(req, res) {
    try {
        const job = await bookQuizService.resumeJob(req.params.id);
        return res.json({ success: true, job });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to resume MCQ generation.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/:id/sessions/:sessionNumber/retry
 */
async function retryFailedSession(req, res) {
    try {
        const job = await bookQuizService.retrySession(req.params.id, req.params.sessionNumber);
        return res.json({ success: true, job });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to queue session retry.');
    }
}

/**
 * GET /api/admin/book-quiz/jobs/:id/questions
 */
async function previewQuestions(req, res) {
    try {
        const {
            session = 'all',
            difficulty = 'all',
            approved = 'all',
            search = ''
        } = req.query || {};

        const result = await bookQuizService.getJobQuestions(req.params.id, {
            session,
            difficulty,
            approved,
            search
        });
        return res.json({ success: true, ...result });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to load staged session questions.');
    }
}

/**
 * PATCH /api/admin/book-quiz/jobs/:id/sessions/:sessionNumber/questions/:uid
 */
async function updateStagedQuestion(req, res) {
    try {
        const result = await bookQuizService.updateStagedQuestion(
            req.params.id,
            req.params.sessionNumber,
            req.params.uid,
            req.body || {}
        );
        return res.json({ success: true, ...result });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to update staged question.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/:id/upload-questions
 */
async function uploadApprovedQuestions(req, res) {
    try {
        const sessionNumber = req.body?.sessionNumber ?? req.query?.sessionNumber ?? 'all';
        const result = await bookQuizService.uploadApprovedQuestions(req.params.id, { sessionNumber });
        return res.json({ success: true, ...result });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to upload approved questions into the question bank.');
    }
}

/**
 * POST /api/admin/book-quiz/jobs/:id/cancel
 */
async function cancelProcessing(req, res) {
    try {
        const job = await bookQuizService.cancelJob(req.params.id);
        return res.json({ success: true, job });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to cancel book quiz generation.');
    }
}

/**
 * DELETE /api/admin/book-quiz/jobs/:id
 */
async function deleteJob(req, res) {
    try {
        const result = await bookQuizService.deleteJob(req.params.id);
        return res.json({ success: true, ...result });
    } catch (err) {
        return handleBookQuizError(res, err, 'Failed to delete book quiz job.');
    }
}

module.exports = {
    listJobs,
    getJobDetails,
    uploadPdfDirect,
    initChunkedPdfUpload,
    uploadPdfPart,
    finalizeChunkedPdfUpload,
    runExtractStep,
    startGeneration,
    runGenerationStep,
    pauseGeneration,
    resumeGeneration,
    retryFailedSession,
    previewQuestions,
    updateStagedQuestion,
    uploadApprovedQuestions,
    cancelProcessing,
    deleteJob
};
