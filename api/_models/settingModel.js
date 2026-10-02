const prisma = require('../_config/prisma');

const DEFAULT_SETTINGS = {
    appName: 'HangBug',
    passingScore: 70,
    certificatePassingScore: 80,
    quizTimerEnabled: false,
    quizTimerSeconds: 30,
    adsEnabled: true,
    maintenanceMode: false,
    maintenanceMessage: "HangBug is undergoing scheduled maintenance. We'll be back shortly!",
    certificateEnabled: true,
    leaderboardEnabled: true,
    primaryColor: '#193D35',
    secondaryColor: '#FFFFFF'
};

const Setting = {
    get: async () => {
        try {
            let setting = await prisma.setting.findFirst();
            if (!setting) {
                setting = await prisma.setting.create({
                    data: DEFAULT_SETTINGS
                });
            }
            return {
                id: setting.id,
                appName: setting.appName ?? DEFAULT_SETTINGS.appName,
                passingScore: setting.passingScore ?? DEFAULT_SETTINGS.passingScore,
                certificatePassingScore: setting.certificatePassingScore ?? DEFAULT_SETTINGS.certificatePassingScore,
                quizTimerEnabled: setting.quizTimerEnabled ?? DEFAULT_SETTINGS.quizTimerEnabled,
                quizTimerSeconds: setting.quizTimerSeconds ?? DEFAULT_SETTINGS.quizTimerSeconds,
                adsEnabled: setting.adsEnabled ?? DEFAULT_SETTINGS.adsEnabled,
                maintenanceMode: setting.maintenanceMode ?? DEFAULT_SETTINGS.maintenanceMode,
                maintenanceMessage: setting.maintenanceMessage ?? DEFAULT_SETTINGS.maintenanceMessage,
                certificateEnabled: setting.certificateEnabled ?? DEFAULT_SETTINGS.certificateEnabled,
                leaderboardEnabled: setting.leaderboardEnabled ?? DEFAULT_SETTINGS.leaderboardEnabled,
                primaryColor: setting.primaryColor ?? DEFAULT_SETTINGS.primaryColor,
                secondaryColor: setting.secondaryColor ?? DEFAULT_SETTINGS.secondaryColor,
                updatedAt: setting.updatedAt
            };
        } catch (error) {
            console.error('[Setting Model get Error]:', error.message);
            return { ...DEFAULT_SETTINGS, id: 'fallback-settings' };
        }
    },

    update: async (updates) => {
        try {
            let setting = await prisma.setting.findFirst();
            const cleanData = {};

            if (updates.appName !== undefined) cleanData.appName = String(updates.appName).trim();
            if (updates.passingScore !== undefined) {
                const score = parseInt(updates.passingScore, 10);
                if (!isNaN(score) && score >= 1 && score <= 100) cleanData.passingScore = score;
            }
            if (updates.certificatePassingScore !== undefined) {
                const certScore = parseInt(updates.certificatePassingScore, 10);
                if (!isNaN(certScore) && certScore >= 1 && certScore <= 100) cleanData.certificatePassingScore = certScore;
            }
            if (updates.quizTimerEnabled !== undefined) cleanData.quizTimerEnabled = Boolean(updates.quizTimerEnabled);
            if (updates.quizTimerSeconds !== undefined) {
                const secs = parseInt(updates.quizTimerSeconds, 10);
                if (!isNaN(secs) && secs >= 5) cleanData.quizTimerSeconds = secs;
            }
            if (updates.adsEnabled !== undefined) cleanData.adsEnabled = Boolean(updates.adsEnabled);
            if (updates.maintenanceMode !== undefined) cleanData.maintenanceMode = Boolean(updates.maintenanceMode);
            if (updates.maintenanceMessage !== undefined) cleanData.maintenanceMessage = String(updates.maintenanceMessage).trim();
            if (updates.certificateEnabled !== undefined) cleanData.certificateEnabled = Boolean(updates.certificateEnabled);
            if (updates.leaderboardEnabled !== undefined) cleanData.leaderboardEnabled = Boolean(updates.leaderboardEnabled);
            if (updates.primaryColor !== undefined) cleanData.primaryColor = String(updates.primaryColor).trim();
            if (updates.secondaryColor !== undefined) cleanData.secondaryColor = String(updates.secondaryColor).trim();

            if (!setting) {
                setting = await prisma.setting.create({
                    data: { ...DEFAULT_SETTINGS, ...cleanData }
                });
            } else {
                setting = await prisma.setting.update({
                    where: { id: setting.id },
                    data: cleanData
                });
            }

            return setting;
        } catch (error) {
            console.error('[Setting Model update Error]:', error.message);
            throw error;
        }
    }
};

module.exports = Setting;
