/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
    }, []);

    return (
        <ThemeContext.Provider value={{
            theme: 'dark',
            resolvedTheme: 'dark',
            toggleTheme: () => {},
            setThemeMode: () => {},
            isDark: true
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};

