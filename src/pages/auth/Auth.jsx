import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, User, Mail, Lock, Eye, EyeOff, UserCheck, ShieldCheck, Sparkles, Check, X, ShieldAlert, Info, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BrandLogo from '../../components/BrandLogo';

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </svg>
    );
}

export default function Auth({ initialMode = 'login' }) {
    const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { login, signup, loginWithGoogle, loginAsGuest } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    // Real-time password requirement validations
    const passwordChecks = useMemo(() => {
        return {
            hasLength: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password)
        };
    }, [password]);

    const isPasswordValid = passwordChecks.hasLength && passwordChecks.hasUpper && passwordChecks.hasNumber;

    const handleGuestLogin = async (role) => {
        setLoading(true);
        setErrorMessage('');
        try {
            const user = await loginAsGuest(role);
            if (user?.role === 'admin') {
                navigate('/dashboard/admin');
            } else {
                navigate(from || '/dashboard');
            }
        } catch (err) {
            setErrorMessage(err.message || 'Guest login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setErrorMessage('');
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        // If real Google Client ID is configured and GIS SDK is available
        if (googleClientId && window.google?.accounts?.oauth2) {
            setGoogleLoading(true);
            try {
                const tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: googleClientId,
                    scope: 'email profile openid',
                    callback: async (tokenResponse) => {
                        if (tokenResponse?.error) {
                            setGoogleLoading(false);
                            setErrorMessage(tokenResponse.error_description || 'Google authentication was cancelled or failed.');
                            return;
                        }
                        if (tokenResponse?.access_token) {
                            try {
                                const user = await loginWithGoogle({ token: tokenResponse.access_token });
                                if (user) {
                                    navigate(user.role === 'admin' ? '/dashboard/admin' : from);
                                }
                            } catch (err) {
                                setErrorMessage(err.message || 'Google Sign-In failed');
                            } finally {
                                setGoogleLoading(false);
                            }
                        }
                    },
                });
                tokenClient.requestAccessToken();
                return;
            } catch (err) {
                console.error('[Google OAuth Client Error]:', err);
                setGoogleLoading(false);
            }
        }

        // Show instant demo Google login / setup modal
        setShowGoogleModal(true);
    };

    const handleInstantDemoGoogleLogin = async () => {
        setShowGoogleModal(false);
        setLoading(true);
        setErrorMessage('');
        try {
            const user = await loginWithGoogle({
                isDemo: true,
                name: 'Jane Google',
                email: 'google.user@example.com',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            });
            if (user) {
                navigate(user.role === 'admin' ? '/dashboard/admin' : from);
            }
        } catch (err) {
            setErrorMessage(err.message || 'Google Sign-In failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (isSignUp) {
            if (!name.trim()) {
                setErrorMessage('Please enter your full name');
                return;
            }
            if (!isPasswordValid) {
                setErrorMessage('Password must satisfy all security requirements (8+ chars, uppercase, number)');
                return;
            }
            if (password !== confirm) {
                setErrorMessage('Passwords do not match');
                return;
            }
        }

        setLoading(true);

        try {
            if (isSignUp) {
                const user = await signup(name, email, password);
                if (user) {
                    navigate(user.role === 'admin' ? '/dashboard/admin' : from);
                }
            } else {
                const user = await login(email, password);
                if (user) {
                    navigate(user.role === 'admin' ? '/dashboard/admin' : from);
                }
            }
        } catch (err) {
            setErrorMessage(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
            <Navbar />
            <main className="flex-1 flex flex-col items-center justify-start sm:justify-center px-4 pt-24 sm:pt-28 pb-12 w-full">
                <div className="w-full max-w-md animate-fade-up">
                    {/* Brand Header */}
                    <div className="text-center mb-4 sm:mb-6">
                        <BrandLogo variant="mark" size="lg" className="mx-auto mb-2" />
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--foreground)] mb-1">
                            {isSignUp ? 'Create your Account' : 'Welcome back to HangBug'}
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-xs sm:text-sm">
                            {isSignUp
                                ? 'Join thousands of developers testing and certifying their skills.'
                                : 'Sign in to access your quizzes, track scores, and manage certificates.'}
                        </p>
                    </div>

                    {/* Mode Toggle Pills */}
                    <div className="bg-[var(--muted-bg)] p-1 rounded-2xl border border-[var(--card-border)] mb-4 flex items-center justify-between shadow-inner">
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(false); setErrorMessage(''); }}
                            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                                !isSignUp
                                    ? 'bg-[#163B34] text-[#FCFAF4] shadow-sm'
                                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            <LogIn size={14} /> Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(true); setErrorMessage(''); }}
                            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                                isSignUp
                                    ? 'bg-[#163B34] text-[#FCFAF4] shadow-sm'
                                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            <UserPlus size={14} /> Sign Up
                        </button>
                    </div>

                    {/* Instant Guest Demo Mode */}
                    <div className="mb-4 p-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] space-y-2">
                        <p className="text-[10px] font-semibold text-[var(--foreground-secondary)] text-center uppercase tracking-wider flex items-center justify-center gap-1">
                            <Sparkles size={11} className="text-[#D19A45]" /> Instant Demo Mode
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleGuestLogin('user')}
                                disabled={loading}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[#163B34] hover:bg-[#EAF5F2] transition-all cursor-pointer shadow-xs"
                            >
                                <UserCheck size={14} className="text-[#163B34]" /> Guest Candidate
                            </button>
                            <button
                                type="button"
                                onClick={() => handleGuestLogin('admin')}
                                disabled={loading}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[#163B34] hover:bg-[#EAF5F2] transition-all cursor-pointer shadow-xs"
                            >
                                <ShieldCheck size={14} className="text-[#163B34]" /> Guest Admin
                            </button>
                        </div>
                    </div>

                    {/* Main Auth Card */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 sm:p-6 shadow-lg">
                        {/* Google OAuth Button */}
                        <button
                            type="button"
                            onClick={handleGoogleAuth}
                            disabled={loading || googleLoading}
                            className="btn-social text-xs sm:text-sm mb-4 w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {googleLoading ? (
                                <div className="w-4 h-4 border-2 border-[#163B34] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <GoogleIcon />
                            )}
                            <span>{googleLoading ? 'Connecting to Google...' : (isSignUp ? 'Sign up with Google' : 'Continue with Google')}</span>
                        </button>

                        <div className="relative mb-4">
                            <div className="divider" />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-[10px] sm:text-xs font-semibold text-[var(--foreground-secondary)] bg-[var(--card-bg)]">
                                or with email
                            </span>
                        </div>

                        {/* Error Alert Box if any */}
                        {errorMessage && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fade-in">
                                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            {/* Full Name field in Sign Up mode */}
                            {isSignUp && (
                                <div className="space-y-1 animate-fade-in">
                                    <label className="input-label text-xs">Full Name</label>
                                    <div className="relative">
                                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="input-field pl-10 py-2.5 text-xs sm:text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email field */}
                            <div className="space-y-1">
                                <label className="input-label text-xs">Email Address</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field pl-10 py-2.5 text-xs sm:text-sm"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password fields */}
                            {isSignUp ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                                        <div className="space-y-1">
                                            <label className="input-label text-xs">Password</label>
                                            <div className="relative">
                                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                                <input
                                                    type={showPass ? 'text' : 'password'}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="input-field pl-10 pr-8 py-2.5 text-xs sm:text-sm"
                                                    placeholder="Password123"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPass(!showPass)}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                                >
                                                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="input-label text-xs">Confirm Password</label>
                                            <div className="relative">
                                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                                <input
                                                    type={showConfirm ? 'text' : 'password'}
                                                    required
                                                    value={confirm}
                                                    onChange={(e) => setConfirm(e.target.value)}
                                                    className="input-field pl-10 pr-8 py-2.5 text-xs sm:text-sm"
                                                    placeholder="Confirm password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirm(!showConfirm)}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                                >
                                                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Password Requirements Checklist */}
                                    <div className="p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] space-y-1.5 text-xs">
                                        <p className="text-[11px] font-semibold text-[var(--foreground-secondary)] mb-1">
                                            Password requirements:
                                        </p>
                                        <div className="grid grid-cols-1 gap-1">
                                            <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.hasLength ? 'text-emerald-600 font-medium' : 'text-[var(--foreground-muted)]'}`}>
                                                {passwordChecks.hasLength ? <Check size={13} className="text-emerald-600 shrink-0" /> : <X size={13} className="text-gray-400 shrink-0" />}
                                                <span>At least 8 characters</span>
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.hasUpper ? 'text-emerald-600 font-medium' : 'text-[var(--foreground-muted)]'}`}>
                                                {passwordChecks.hasUpper ? <Check size={13} className="text-emerald-600 shrink-0" /> : <X size={13} className="text-gray-400 shrink-0" />}
                                                <span>At least one uppercase letter (A-Z)</span>
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.hasNumber ? 'text-emerald-600 font-medium' : 'text-[var(--foreground-muted)]'}`}>
                                                {passwordChecks.hasNumber ? <Check size={13} className="text-emerald-600 shrink-0" /> : <X size={13} className="text-gray-400 shrink-0" />}
                                                <span>At least one number (0-9)</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="input-label text-xs">Password</label>
                                        <Link to="/forgot-password" className="text-xs font-semibold text-[#163B34] hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input-field pl-10 pr-10 py-2.5 text-xs sm:text-sm"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                        >
                                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>

                                    {/* Remember Me Checkbox */}
                                    <div className="pt-2 flex items-center">
                                        <label className="flex items-center gap-2 text-xs text-[var(--foreground-secondary)] cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#163B34] focus:ring-[#163B34]"
                                            />
                                            <span>Remember me on this device</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || (isSignUp && !isPasswordValid)}
                                className="btn-primary w-full py-2.5 rounded-xl text-xs sm:text-sm mt-2 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#163B34] hover:bg-[#1F4D44] text-white"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : isSignUp ? (
                                    <>
                                        <UserPlus size={15} /> Create Free Account
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={15} /> Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="divider my-4" />

                        {/* State Toggle Link */}
                        <p className="text-center text-xs text-[var(--foreground-secondary)]">
                            {isSignUp ? (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => { setIsSignUp(false); setErrorMessage(''); }}
                                        className="font-semibold text-[#163B34] hover:underline cursor-pointer"
                                    >
                                        Login
                                    </button>
                                </>
                            ) : (
                                <>
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => { setIsSignUp(true); setErrorMessage(''); }}
                                        className="font-semibold text-[#163B34] hover:underline cursor-pointer"
                                    >
                                        Create one
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Google OAuth Configuration & Instant Test Modal */}
                {showGoogleModal && typeof document !== 'undefined' && createPortal(
                    <div 
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowGoogleModal(false); }}
                    >
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-in text-left">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-600">
                                        <GoogleIcon />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold font-display text-[var(--foreground)]">Google Sign-In</h3>
                                        <p className="text-xs text-[var(--foreground-secondary)]">Authentication & Configuration</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowGoogleModal(false)}
                                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] p-1 rounded-lg hover:bg-[var(--muted-bg)] cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                                <Info size={16} className="shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold">Backend Integration Active</span>
                                    <p className="mt-0.5 opacity-90">
                                        To enable real Google Account chooser popups, set <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono text-[10px]">VITE_GOOGLE_CLIENT_ID</code> in your <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono text-[10px]">.env</code>.
                                    </p>
                                </div>
                            </div>

                            {/* Instant Demo Google Account */}
                            <div className="p-3.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                                        <Sparkles size={13} className="text-[#D19A45]" /> Instant Google Test Mode
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">1-Click Test</span>
                                </div>
                                <p className="text-[11px] text-[var(--foreground-secondary)]">
                                    Test the complete Google OAuth pipeline (database creation, JWT cookie session, and dashboard redirect) right now:
                                </p>
                                <button
                                    type="button"
                                    onClick={handleInstantDemoGoogleLogin}
                                    disabled={loading}
                                    className="btn-primary w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 bg-[#163B34] hover:bg-[#1F4D44] text-white shadow-xs"
                                >
                                    <GoogleIcon /> Continue with Demo Google Account
                                </button>
                            </div>

                            {/* Quick Setup Instructions */}
                            <div className="space-y-1.5 text-xs text-[var(--foreground-secondary)] pt-1">
                                <p className="font-semibold text-[var(--foreground)] text-[11px] uppercase tracking-wider">How to connect your real Google Client ID:</p>
                                <ol className="list-decimal list-inside space-y-1 text-[11px] opacity-90 pl-1">
                                    <li>Create OAuth 2.0 Client ID in <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-medium">Google Cloud Console <ExternalLink size={10} /></a></li>
                                    <li>Add your domain/localhost to Authorized JavaScript Origins</li>
                                    <li>Add <code className="px-1 py-0.5 rounded bg-[var(--muted-bg)] font-mono text-[10px]">VITE_GOOGLE_CLIENT_ID="..."</code> to <code className="px-1 py-0.5 rounded bg-[var(--muted-bg)] font-mono text-[10px]">.env</code></li>
                                </ol>
                            </div>

                            <div className="pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowGoogleModal(false)}
                                    className="w-full py-2 text-xs text-[var(--foreground-secondary)] hover:text-[var(--foreground)] font-medium text-center cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </main>
            <Footer />
        </div>
    );
}
