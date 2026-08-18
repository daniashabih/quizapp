/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Configure axios defaults at module scope
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const res = await axios.get('/auth/me');
                    setUser(res.data);
                } catch {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const extractErrorMessage = (error, fallbackMessage) => {
        if (typeof error.response?.data?.message === 'string') {
            return error.response.data.message;
        }
        if (typeof error.response?.data?.error === 'string') {
            return error.response.data.error;
        }
        if (error.response?.status === 503 || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
            return 'Backend server is connecting or offline on port 3000. Please start the backend server.';
        }
        if (error.response?.status === 500) {
            return error.response?.data?.message || 'Server error (500). Please check backend logs or try again.';
        }
        return error.response?.data?.message || error.message || fallbackMessage;
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            setUser(res.data);
            toast.success('Signed in successfully!');
            return res.data;
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Login Failed'));
            return null;
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await axios.post('/auth/register', { name, email, password });
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            setUser(res.data);
            toast.success('Account created successfully!');
            return res.data;
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Registration Failed'));
            return null;
        }
    };

    const loginWithGoogle = async () => {
        toast.info('Social login requires backend OAuth provider configuration.');
    };

    const loginAsGuest = async (role = 'candidate') => {
        const demoEmail = role === 'admin' ? 'admin@example.com' : 'user@example.com';
        const demoPass = role === 'admin' ? 'AdminPassword123!' : 'password';

        try {
            const res = await axios.post('/auth/login', { email: demoEmail, password: demoPass });
            if (res.data && res.data.token) {
                localStorage.setItem('token', res.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setUser(res.data);
                toast.success(`Signed in as Guest (${role === 'admin' ? 'Admin' : 'Candidate'})`);
                return true;
            }
        } catch (err) {
            console.warn('Backend login unavailable, using guest session:', err.message);
        }

        const guestUser = role === 'admin' ? {
            id: 1,
            name: 'Guest Admin',
            email: 'admin@example.com',
            role: 'admin',
            token: 'guest-admin-token'
        } : {
            id: 2,
            name: 'Guest Candidate',
            email: 'user@example.com',
            role: 'candidate',
            token: 'guest-candidate-token'
        };

        localStorage.setItem('token', guestUser.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${guestUser.token}`;
        setUser(guestUser);
        toast.success(`Continuing as Guest (${role === 'admin' ? 'Admin' : 'Candidate'})`);
        return true;
    };

    const logout = async () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        toast.info('Logged out');
    };

    const updateUser = (data) => {
        setUser(prev => ({ ...prev, ...data }));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, loginWithGoogle, loginWithGithub: loginWithGoogle, loginAsGuest, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
