import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import settingsService from '../services/settingsService';

const defaultSettings = {
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

const SettingsContext = createContext({
    settings: defaultSettings,
    loading: true,
    refreshSettings: async () => {},
    updateSettings: async () => {}
});

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);

    const refreshSettings = useCallback(async () => {
        try {
            const res = await settingsService.getSettings();
            if (res.success && res.data) {
                setSettings(prev => ({ ...prev, ...res.data }));
            }
        } catch (err) {
            console.warn('[SettingsContext Warning] Could not load settings from API:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = useCallback(async (updates) => {
        try {
            const res = await settingsService.updateSettings(updates);
            if (res.success && res.data) {
                setSettings(res.data);
                return res.data;
            }
        } catch (err) {
            console.error('[SettingsContext Error] Could not update settings:', err);
            throw err;
        }
    }, []);

    useEffect(() => {
        refreshSettings();
    }, [refreshSettings]);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export default SettingsContext;
