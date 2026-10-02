const Result = require('../_models/resultModel');
const Setting = require('../_models/settingModel');
const quizController = require('./quizController');

const resultController = {
    saveResult: async (req, res) => {
        // If answers are provided, delegate directly to authoritative quiz submit
        if (req.body.answers && Object.keys(req.body.answers).length > 0) {
            return quizController.submitQuiz(req, res);
        }

        try {
            const { category, session, score, total, percentage } = req.body;
            const sessionNum = session === 'all' || session === 'All' ? 0 : (parseInt(session, 10) || 1);
            const userId = req.user.id;

            const computedScore = parseInt(score, 10) || 0;
            const computedTotal = parseInt(total, 10) || 1;
            const computedPercentage = computedTotal > 0
                ? Math.round((computedScore / computedTotal) * 100)
                : (parseFloat(percentage) || 0);

            // Fetch central settings
            const settings = await Setting.get();
            const passingScore = settings.passingScore || 70;
            const certPassingScore = settings.certificatePassingScore || 80;
            const certificateEnabled = settings.certificateEnabled !== false;

            const passed = computedPercentage >= passingScore;
            const certificateEligible = certificateEnabled && (computedPercentage >= certPassingScore);

            const insertId = await Result.create(userId, category, computedScore, computedTotal, computedPercentage, sessionNum);

            const certId = certificateEligible ? `HB-CERT-${String(insertId).slice(-6).toUpperCase()}` : null;

            res.status(201).json({
                success: true,
                message: 'Result saved successfully.',
                resultId: insertId,
                score: computedScore,
                total: computedTotal,
                percentage: computedPercentage,
                passed,
                passingScore,
                certificateEligible,
                certificateId: certId
            });
        } catch (error) {
            console.error('❌ Error saving result:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while saving result',
                error: error.message
            });
        }
    },

    getUserResults: async (req, res) => {
        try {
            const userId = req.user.id;
            const results = await Result.findByUserId(userId);
            res.status(200).json(results);
        } catch (error) {
            console.error('❌ Error fetching results:', error);
            res.status(500).json({
                message: 'Internal server error while fetching results',
                error: error.message
            });
        }
    },

    getUserStats: async (req, res) => {
        try {
            const userId = req.user.id;
            const stats = await Result.getStatisticsByUserId(userId);
            res.status(200).json(stats);
        } catch (error) {
            console.error('❌ Error fetching stats:', error);
            res.status(500).json({
                message: 'Internal server error while fetching stats',
                error: error.message
            });
        }
    }
};

module.exports = resultController;
