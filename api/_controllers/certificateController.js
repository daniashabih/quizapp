const prisma = require('../_config/prisma');
const Setting = require('../_models/settingModel');

const certificateController = {
    /**
     * GET /api/certificates
     * GET /api/certificates/my
     * Authenticated endpoint to fetch user's earned certificates
     */
    getMyCertificates: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Authentication required' });
            }

            const settings = await Setting.get();
            const certPassingScore = settings.certificatePassingScore || 80;

            const results = await prisma.quizResult.findMany({
                where: { userId: String(userId) },
                orderBy: { createdAt: 'desc' }
            });

            const certificates = results
                .filter(r => r.percentage >= certPassingScore)
                .map(r => ({
                    id: `HB-CERT-${r.id.slice(-6).toUpperCase()}`,
                    resultId: r.id,
                    tech: r.category,
                    category: r.category,
                    session: r.session || 1,
                    score: Math.round(r.percentage),
                    percentage: Math.round(r.percentage),
                    date: new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    createdAt: r.createdAt,
                    issued: true
                }));

            return res.status(200).json({
                success: true,
                certificates
            });
        } catch (error) {
            console.error('[Certificates Controller Error]:', error);
            return res.status(500).json({
                success: false,
                message: 'Unable to fetch certificates'
            });
        }
    },

    /**
     * GET /api/certificates/verify/:id
     * Public verification endpoint
     */
    verifyCertificate: async (req, res) => {
        try {
            const rawId = String(req.params.id || '').trim();
            if (!rawId) {
                return res.status(400).json({ success: false, message: 'Certificate ID is required' });
            }

            const settings = await Setting.get();
            const certPassingScore = settings.certificatePassingScore || 80;

            let result = null;

            // 1. Direct MongoDB ObjectId match
            if (/^[0-9a-fA-F]{24}$/.test(rawId)) {
                result = await prisma.quizResult.findUnique({
                    where: { id: rawId },
                    include: { user: { select: { id: true, name: true, email: true } } }
                });
            }

            // 2. Format: HB-CERT-XXXXXX
            if (!result) {
                const cleanedSuffix = rawId.replace(/^HB-CERT-/i, '').trim().toLowerCase();
                const candidates = await prisma.quizResult.findMany({
                    where: { percentage: { gte: certPassingScore } },
                    include: { user: { select: { id: true, name: true, email: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 200
                });
                result = candidates.find(r => r.id.toLowerCase().endsWith(cleanedSuffix));
            }

            if (!result || result.percentage < certPassingScore) {
                return res.status(404).json({
                    success: false,
                    valid: false,
                    message: 'Certificate credential could not be verified or does not exist.'
                });
            }

            const certId = `HB-CERT-${result.id.slice(-6).toUpperCase()}`;

            return res.status(200).json({
                success: true,
                valid: true,
                certificate: {
                    id: certId,
                    resultId: result.id,
                    learnerName: result.user?.name || 'Verified Learner',
                    category: result.category,
                    session: result.session || 1,
                    score: Math.round(result.percentage),
                    percentage: Math.round(result.percentage),
                    issueDate: new Date(result.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    createdAt: result.createdAt,
                    status: 'Verified & Authentic'
                }
            });
        } catch (error) {
            console.error('[Verify Certificate Error]:', error);
            return res.status(500).json({
                success: false,
                valid: false,
                message: 'Error verifying certificate'
            });
        }
    }
};

module.exports = certificateController;
