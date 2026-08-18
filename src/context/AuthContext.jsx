/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Configure Axios defaults for HttpOnly Cookie Authentication
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const extractErrorMessage = (error, fallbackMessage) => {
        if (typeof error.response?.data?.message === 'string') {
            return error.response.data.message;
        }
        if (typeof error.response?.data?.error === 'string') {
            return error.response.data.error;
        }
        if (error.response?.status === 503 || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
            return 'Cannot connect to server. Please ensure the backend is running.';
        }
        if (error.response?.status === 409) {
            return error.response?.data?.message || 'An account with this email already exists.';
        }
        if (error.response?.status === 401) {
            return error.response?.data?.message || 'Invalid email or password.';
        }
        return error.response?.data?.message || error.message || fallbackMessage;
    };

    /**
     * Check current session on initial page load
     */
    const getCurrentUser = useCallback(async () => {
        try {
            const res = await axios.get('/auth/me');
            if (res.data?.success && res.data?.user) {
                setUser(res.data.user);
                return res.data.user;
            } else if (res.data?.id) {
                setUser(res.data);
                return res.data;
            }
            setUser(null);
            return null;
        } catch (err) {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getCurrentUser();
    }, [getCurrentUser]);

    /**
     * User Signup
     */
    const signup = async (name, email, password) => {
        try {
            const res = await axios.post('/auth/signup', { name, email, password });
            const userData = res.data?.user || res.data;
            setUser(userData);
            toast.success('Account created successfully! Welcome to HangBug.');
            return userData;
        } catch (error) {
            const msg = extractErrorMessage(error, 'Registration failed');
            toast.error(msg);
            throw new Error(msg);
        }
    };

    /**
     * User Login
     */
    const login = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            const userData = res.data?.user || res.data;
            setUser(userData);
            toast.success('Signed in successfully!');
            return userData;
        } catch (error) {
            const msg = extractErrorMessage(error, 'Login failed');
            toast.error(msg);
            throw new Error(msg);
        }
    };

    /**
     * User Logout
     */
    const logout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch (err) {
            console.warn('[Logout]: error clearing cookie on server', err.message);
        } finally {
            setUser(null);
            toast.info('Logged out successfully');
        }
    };

    /**
     * Demo / Guest Login
     */
    const loginAsGuest = async (role = 'user') => {
        const demoEmail = role === 'admin' ? 'admin@example.com' : 'user@example.com';
        const demoPass = role === 'admin' ? 'AdminPassword123!' : 'password';

        try {
            const res = await axios.post('/auth/login', { email: demoEmail, password: demoPass });
            const userData = res.data?.user || res.data;
            setUser(userData);
            toast.success(`Signed in as Guest (${role === 'admin' ? 'Admin' : 'Candidate'})`);
            return userData;
        } catch (err) {
            // Fallback client session for demo
            const guestUser = {
                id: role === 'admin' ? 'guest_admin' : 'guest_candidate',
                name: role === 'admin' ? 'Guest Admin' : 'Guest Candidate',
                email: demoEmail,
                role: role === 'admin' ? 'admin' : 'user',
                avatar: '',
                isVerified: true
            };
            setUser(guestUser);
            toast.success(`Signed in as Guest (${role === 'admin' ? 'Admin' : 'Candidate'})`);
            return guestUser;
        }
    };

    const loginWithGoogle = async () => {
        toast.info('Google OAuth provider integration is available via backend OAuth configuration.');
    };

    const updateUser = (data) => {
        setUser(prev => (prev ? { ...prev, ...data } : data));
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        signup,
        register: signup,
        login,
        logout,
        getCurrentUser,
        loginAsGuest,
        loginWithGoogle,
        loginWithGithub: loginWithGoogle,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
