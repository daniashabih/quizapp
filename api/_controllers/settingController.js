const Setting = require('../_models/settingModel');

const getSettings = async (req, res) => {
    try {
        const settings = await Setting.get();
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('[Settings Controller Error]:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch application settings'
        });
    }
};

const updateSettings = async (req, res) => {
    try {
        const updated = await Setting.update(req.body);
        res.json({
            success: true,
            message: 'Application settings updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('[Settings Controller Update Error]:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Unable to update application settings'
        });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
