/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabase';

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
            } else if (supabase) {
                // Check Supabase session
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        setUser({
                            id: session.user.id,
                            email: session.user.email,
                            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
                            role: session.user.user_metadata?.role || 'candidate',
                            token: session.access_token
                        });
                    }
                } catch (e) {
                    console.log('Supabase session check error:', e);
                }
            }
            setLoading(false);
        };
        checkLoggedIn();

        // Listen for Supabase auth state changes
        let authListener = null;
        if (supabase) {
            const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
                        role: session.user.user_metadata?.role || 'candidate',
                        token: session.access_token
                    });
                }
            });
            authListener = data.subscription;
        }

        return () => {
            if (authListener) authListener.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        // Try backend API login first
        try {
            const res = await axios.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            setUser(res.data);
            toast.success('Signed in successfully!');
            return true;
        } catch (error) {
            // If backend fails, try Supabase Auth
            if (supabase) {
                try {
                    const { data, error: supaError } = await supabase.auth.signInWithPassword({ email, password });
                    if (supaError) throw supaError;
                    if (data?.user) {
                        const loggedUser = {
                            id: data.user.id,
                            email: data.user.email,
                            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
                            role: 'candidate',
                            token: data.session?.access_token
                        };
                        setUser(loggedUser);
                        toast.success('Signed in with Supabase!');
                        return true;
                    }
                } catch (supaErr) {
                    toast.error(supaErr.message || error.response?.data?.message || 'Login Failed');
                    return false;
                }
            }
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
            // Fallback to Supabase auth signup
            if (supabase) {
                try {
                    const { data, error: supaError } = await supabase.auth.signUp({
                        email,
                        password,
                        options: { data: { full_name: name, name } }
                    });
                    if (supaError) throw supaError;
                    if (data?.user) {
                        const newUser = {
                            id: data.user.id,
                            email: data.user.email,
                            name: name || data.user.email?.split('@')[0],
                            role: 'candidate'
                        };
                        setUser(newUser);
                        toast.success('Registration successful!');
                        return true;
                    }
                } catch (supaErr) {
                    toast.error(supaErr.message || error.response?.data?.message || 'Registration Failed');
                    return false;
                }
            }
            toast.error(error.response?.data?.message || 'Registration Failed');
            return false;
        }
    };

    const loginWithGithub = async () => {
        if (!supabase) {
            toast.error('Supabase client not configured for GitHub login');
            return;
        }
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: { redirectTo: window.location.origin }
            });
            if (error) throw error;
        } catch (error) {
            toast.error(error.message || 'GitHub login failed');
        }
    };

    const logout = async () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        if (supabase) {
            try { await supabase.auth.signOut(); } catch (e) { console.log('Supabase signout error:', e); }
        }
        setUser(null);
        toast.info('Logged out');
    };

    const updateUser = (data) => {
        setUser(prev => ({ ...prev, ...data }));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, loginWithGithub, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

