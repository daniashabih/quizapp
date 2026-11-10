/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { notify } from '../services/notificationService';
import { trackLogin } from '../utils/analytics';

// Configure Axios defaults for HttpOnly Cookie Authentication & sensible request timeout
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';
axios.defaults.withCredentials = true;
axios.defaults.timeout = 15000;

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
    const userRef = useRef(null);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Global 401 Session Expired interceptor for authenticated sessions
    useEffect(() => {
        const interceptorId = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error?.response?.status;
                const reqUrl = String(error?.config?.url || '');
                const isAuthEndpoint =
                    reqUrl.includes('/auth/login') ||
                    reqUrl.includes('/auth/signup') ||
                    reqUrl.includes('/auth/google') ||
                    reqUrl.includes('/auth/me') ||
                    reqUrl.includes('/auth/logout') ||
                    reqUrl.includes('/auth/forgot-password') ||
                    reqUrl.includes('/auth/reset-password') ||
                    reqUrl.includes('/auth/verify-reset-token');

                if (status === 401 && !isAuthEndpoint && userRef.current) {
                    setUser(null);
                    notify.warning({
                        id: 'hangbug-session-expired',
                        title: 'Session expired',
                        description: 'Your session has expired. Please sign in again.'
                    });
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptorId);
        };
    }, []);

    const extractErrorMessage = (error, fallbackMessage) => {
        if (typeof error.response?.data?.message === 'string') {
            return error.response.data.message;
        }
        if (typeof error.response?.data?.error === 'string') {
            return error.response.data.error;
        }
        if (
            error.response?.status === 503 ||
            error.code === 'ERR_NETWORK' ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ECONNABORTED'
        ) {
            return 'Cannot connect to server. Please check your connection or try again momentarily.';
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
            const res = await axios.get('/auth/me', { timeout: 10000 });
            if (res.data?.success && res.data?.user) {
                setUser(res.data.user);
                return res.data.user;
            } else if (res.data?.id) {
                setUser(res.data);
                return res.data;
            }
            setUser(null);
            return null;
        } catch {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Failsafe timer so auth loading state never hangs indefinitely
        const failsafe = setTimeout(() => {
            setLoading(false);
        }, 10000);

        getCurrentUser().finally(() => {
            clearTimeout(failsafe);
        });

        return () => clearTimeout(failsafe);
    }, [getCurrentUser]);

    /**
     * User Signup
     */
    const signup = async (name, email, password) => {
        const toastId = notify.loading({
            id: 'auth-signup',
            title: 'Creating your account...',
            description: 'Setting up your Hangbug profile.'
        });
        try {
            const res = await axios.post('/auth/signup', { name, email, password });
            const userData = res.data?.user || res.data;
            setUser(userData);
            notify.update(toastId, {
                type: 'success',
                title: 'Welcome to Hangbug!',
                description: 'Your account has been created. Let’s start learning.'
            });
            return userData;
        } catch (error) {
            const msg = extractErrorMessage(error, 'Registration failed');
            notify.update(toastId, {
                type: 'error',
                title: 'Registration failed',
                description: msg
            });
            throw new Error(msg);
        }
    };

    /**
     * User Login
     */
    const login = async (email, password) => {
        const toastId = notify.loading({
            id: 'auth-login',
            title: 'Signing you in...',
            description: 'Verifying your credentials with Hangbug.'
        });
        try {
            const res = await axios.post('/auth/login', { email, password });
            const userData = res.data?.user || res.data;
            setUser(userData);
            notify.update(toastId, {
                type: 'success',
                title: "You're all set!",
                description: 'Welcome back to Hangbug.'
            });
            return userData;
        } catch (error) {
            const msg = extractErrorMessage(error, 'Login failed');
            notify.update(toastId, {
                type: 'error',
                title: 'Sign-in failed',
                description: msg
            });
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
            notify.info({
                id: 'auth-logout',
                title: 'Signed out',
                description: 'You have been safely signed out of Hangbug.'
            });
        }
    };

    /**
     * Delete Account & All Data
     */
    const deleteAccount = async () => {
        const toastId = notify.loading({
            id: 'auth-delete-account',
            title: 'Deleting account...',
            description: 'Removing your account and associated data.'
        });
        try {
            const res = await axios.delete('/auth/delete-account');
            setUser(null);
            notify.update(toastId, {
                type: 'success',
                title: 'Account deleted',
                description: res.data?.message || 'Your account and data have been permanently deleted.'
            });
            return true;
        } catch (error) {
            const msg = extractErrorMessage(error, 'Failed to delete account');
            notify.update(toastId, {
                type: 'error',
                title: 'Deletion failed',
                description: msg
            });
            throw new Error(msg);
        }
    };

    /**
     * Demo / Guest Login
     */
    const loginAsGuest = async (role = 'user') => {
        const demoEmail = role === 'admin' ? 'admin@example.com' : 'user@example.com';
        const demoPass = role === 'admin' ? 'AdminPassword123!' : 'password';
        const roleLabel = role === 'admin' ? 'Admin' : 'Candidate';

        try {
            const res = await axios.post('/auth/login', { email: demoEmail, password: demoPass });
            const userData = res.data?.user || res.data;
            setUser(userData);
            trackLogin('guest');
            notify.success({
                id: 'auth-guest',
                title: "You're all set!",
                description: `Welcome to Hangbug (${roleLabel} access).`
            });
            return userData;
        } catch {
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
            trackLogin('guest');
            notify.success({
                id: 'auth-guest',
                title: "You're all set!",
                description: `Welcome to Hangbug (${roleLabel} access).`
            });
            return guestUser;
        }
    };

    /**
     * Google Sign-In / Sign-Up
     */
    const loginWithGoogle = async (googleData = {}) => {
        const toastId = notify.loading({
            id: 'auth-google',
            title: 'Signing you in...',
            description: 'Authenticating with your Google account.'
        });
        try {
            const res = await axios.post('/auth/google', googleData);
            const userData = res.data?.user || res.data;
            setUser(userData);
            notify.update(toastId, {
                type: 'success',
                title: "You're all set!",
                description: userData.name
                    ? `Welcome to Hangbug, ${userData.name}! Signed in with Google.`
                    : 'Signed in with Google. Welcome back to Hangbug.'
            });
            return userData;
        } catch (error) {
            const msg = extractErrorMessage(error, 'Google Sign-In failed');
            notify.update(toastId, {
                type: 'error',
                title: 'Google sign-in failed',
                description: msg
            });
            throw new Error(msg);
        }
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
        deleteAccount,
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
