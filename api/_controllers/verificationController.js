const prisma = require('../_config/prisma');
const { normalizeTechnology } = require('../_utils/ragTechnology');
const {
    verifyQuestionWithBooks,
    approveVerificationCorrection
} = require('../_services/questionVerificationService');

function parseOptionsSafe(raw) {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try {
            const p = JSON.parse(raw);
            return Array.isArray(p) ? p : [];
        } catch {
            return [];
        }
    }
    return [];
}

function formatReport(r) {
    return {
        id: r.id,
        questionId: r.questionId || '',
        technology: r.technology,
        questionText: r.questionText,
        options: parseOptionsSafe(r.options),
        originalCorrectAnswer: r.originalCorrectAnswer,
        verifiedCorrectAnswer: r.verifiedCorrectAnswer || '',
        verificationStatus: r.verificationStatus,
        explanation: r.explanation,
        sourceBook: r.sourceBook || '',
        sourceAuthor: r.sourceAuthor || '',
        sourceChapter: r.sourceChapter || '',
        sourcePage: r.sourcePage || '',
        supportingExcerpt: r.supportingExcerpt || '',
        issueDescription: r.issueDescription || '',
        suggestedCorrection: r.suggestedCorrection || '',
        confidence: typeof r.confidence === 'number' ? r.confidence : 0,
        reviewStatus: r.reviewStatus || 'pending',
        reviewedBy: r.reviewedBy || '',
        reviewedAt: r.reviewedAt,
        reviewNotes: r.reviewNotes || '',
        requestCount: r.requestCount || 1,
        lastRequestedAt: r.lastRequestedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
    };
}

/**
 * POST /api/ai/verify-question
 * Learner / Quiz Question Verification endpoint
 */
async function verifyQuestion(req, res) {
    try {
        const {
            questionId,
            questionText,
            question_text,
            options,
            correctAnswer,
            correct_answer,
            technology,
            category,
            userSelectedAnswer,
            user_selected_answer,
            bypassCache
        } = req.body || {};

        const isAdmin = String(req.user?.role || '').toLowerCase() === 'admin';
        const result = await verifyQuestionWithBooks({
            questionId: questionId || '',
            questionText: questionText || question_text || '',
            options,
            correctAnswer: correctAnswer || correct_answer || '',
            technology: technology || category || '',
            category: category || technology || '',
            userSelectedAnswer: userSelectedAnswer || user_selected_answer || '',
            bypassCache: isAdmin && Boolean(bypassCache)
        });

        res.json({
            success: true,
            cached: Boolean(result.cached),
            deduplicated: Boolean(result.deduplicated),
            searchMode: result.searchMode,
            verification: result.verification
        });
    } catch (err) {
        console.error('[AI Question Verification Error]:', err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Unable to verify this question with reference books right now.'
        });
    }
}

/**
 * GET /api/admin/verification-reports
 */
async function getVerificationReports(req, res) {
    try {
        const { status, technology, reviewStatus, search } = req.query || {};
        const where = {};

        if (status && status !== 'all') {
            where.verificationStatus = String(status);
        }
        if (technology && technology !== 'all') {
            where.technologyNormalized = normalizeTechnology(technology);
        }
        if (reviewStatus && reviewStatus !== 'all') {
            where.reviewStatus = String(reviewStatus);
        }

        const [reports, allForStats] = await Promise.all([
            prisma.questionVerification.findMany({
                where,
                orderBy: { lastRequestedAt: 'desc' },
                take: 250
            }),
            prisma.questionVerification.findMany({
                select: {
                    verificationStatus: true,
                    reviewStatus: true,
                    technology: true
                }
            })
        ]);

        const cleanSearch = String(search || '').trim().toLowerCase();
        const filtered = cleanSearch
            ? reports.filter(r =>
                String(r.questionText || '').toLowerCase().includes(cleanSearch) ||
                String(r.technology || '').toLowerCase().includes(cleanSearch) ||
                String(r.sourceBook || '').toLowerCase().includes(cleanSearch) ||
                String(r.originalCorrectAnswer || '').toLowerCase().includes(cleanSearch) ||
                String(r.verifiedCorrectAnswer || '').toLowerCase().includes(cleanSearch)
            )
            : reports;

        const stats = {
            totalVerified: allForStats.length,
            confirmedCorrect: allForStats.filter(r => r.verificationStatus === 'verified').length,
            incorrectDetected: allForStats.filter(r => r.verificationStatus === 'incorrect').length,
            ambiguousCount: allForStats.filter(r => r.verificationStatus === 'ambiguous').length,
            insufficientEvidenceCount: allForStats.filter(r => r.verificationStatus === 'insufficient_evidence').length,
            pendingReviewCount: allForStats.filter(r =>
                r.reviewStatus === 'pending' &&
                (r.verificationStatus === 'incorrect' || r.verificationStatus === 'ambiguous')
            ).length,
            approvedCorrectionsCount: allForStats.filter(r =>
                r.reviewStatus === 'approved' && r.verificationStatus !== 'verified'
            ).length
        };

        const technologies = Array.from(new Set(allForStats.map(r => r.technology).filter(Boolean))).sort();

        res.json({
            success: true,
            stats,
            technologies,
            reports: filtered.map(formatReport)
        });
    } catch (err) {
        console.error('[Verification Reports List Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to load verification reports.' });
    }
}

/**
 * GET /api/admin/verification-reports/history
 */
async function getCorrectionHistory(req, res) {
    try {
        const history = await prisma.questionCorrectionHistory.findMany({
            orderBy: { createdAt: 'desc' },
            take: 150
        });
        res.json({
            success: true,
            history
        });
    } catch (err) {
        console.error('[Correction History Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to load correction history.' });
    }
}

/**
 * POST /api/admin/verification-reports/:id/approve
 * Admin explicitly approves a suggested correction and updates the Question collection
 */
async function approveReportCorrection(req, res) {
    try {
        const { id } = req.params;
        const { correctedAnswer, correctedExplanation, notes } = req.body || {};

        const result = await approveVerificationCorrection({
            reportId: id,
            correctedAnswer,
            correctedExplanation,
            notes,
            adminUser: req.user
        });

        res.json({
            success: true,
            message: 'Correction approved and original question updated in MongoDB.',
            report: formatReport(result.report),
            historyEntry: result.historyEntry,
            updatedQuestionId: result.updatedQuestionId
        });
    } catch (err) {
        console.error('[Approve Correction Error]:', err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Failed to approve correction.'
        });
    }
}

/**
 * POST /api/admin/verification-reports/:id/dismiss
 */
async function dismissReport(req, res) {
    try {
        const { id } = req.params;
        const { notes = '' } = req.body || {};
        const existing = await prisma.questionVerification.findUnique({ where: { id: String(id) } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Verification report not found.' });
        }

        const updated = await prisma.questionVerification.update({
            where: { id: existing.id },
            data: {
                reviewStatus: 'dismissed',
                reviewedBy: String(req.user?.name || req.user?.email || 'Admin'),
                reviewedAt: new Date(),
                reviewNotes: String(notes || '').trim()
            }
        });

        res.json({
            success: true,
            message: 'Verification report dismissed.',
            report: formatReport(updated)
        });
    } catch (err) {
        console.error('[Dismiss Report Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to dismiss report.' });
    }
}

/**
 * DELETE /api/admin/verification-reports/:id
 */
async function deleteReport(req, res) {
    try {
        const { id } = req.params;
        const existing = await prisma.questionVerification.findUnique({ where: { id: String(id) } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Verification report not found.' });
        }

        await prisma.questionVerification.delete({ where: { id: existing.id } });
        res.json({ success: true, message: 'Verification report removed from cache.' });
    } catch (err) {
        console.error('[Delete Report Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to delete verification report.' });
    }
}

module.exports = {
    verifyQuestion,
    getVerificationReports,
    getCorrectionHistory,
    approveReportCorrection,
    dismissReport,
    deleteReport
};
