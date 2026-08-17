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

    const login = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            setUser(res.data);
            toast.success('Signed in successfully!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login Failed');
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await axios.post('/auth/register', { name, email, password });
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            setUser(res.data);
            toast.success('Account created successfully!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration Failed');
            return false;
        }
    };

    const loginWithGoogle = async () => {
        toast.info('Social login requires backend OAuth provider configuration.');
    };

    const loginAsGuest = async (role = 'candidate') => {
        const demoEmail = role === 'admin' ? 'admin@example.com' : 'user@example.com';
        try {
            const success = await login(demoEmail, 'password');
            if (success) {
                return true;
            }
        } catch {
            // Fallback to offline guest user
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
