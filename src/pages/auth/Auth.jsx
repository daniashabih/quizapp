import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, User, Mail, Lock, Eye, EyeOff, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
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
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login, register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const fillDemoUser = (demoEmail) => {
        setEmail(demoEmail);
        setPassword('password');
        setIsSignUp(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                if (password !== confirm) {
                    toast.error("Passwords do not match");
                    setLoading(false);
                    return;
                }
                if (password.length < 8) {
                    toast.error("Password must be at least 8 characters");
                    setLoading(false);
                    return;
                }

                const success = await register(name, email, password);
                if (success) {
                    navigate('/dashboard');
                }
            } else {
                const success = await login(email, password);
                if (success) {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            toast.error(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen max-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col overflow-hidden transition-colors duration-300">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4 pt-16 sm:pt-20 min-h-0 overflow-y-auto lg:overflow-hidden">
                <div className="w-full max-w-md animate-fade-up my-auto">
                    {/* Brand Header */}
                    <div className="text-center mb-3 sm:mb-5">
                        <BrandLogo variant="mark" size="lg" className="mx-auto mb-2" />
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--foreground)] mb-1">
                            {isSignUp ? 'Create an Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-xs sm:text-sm">
                            {isSignUp ? 'Start your HangBug journey today.' : 'Sign in to continue your assessment.'}
                        </p>
                    </div>

                    {/* Mode Toggle Pills (Emerald Styled) */}
                    <div className="bg-[var(--muted-bg)] p-1 rounded-2xl border border-[var(--card-border)] mb-4 flex items-center justify-between shadow-inner">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(false)}
                            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                                !isSignUp
                                    ? 'bg-[#289B7D] text-white shadow-md'
                                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            <LogIn size={14} /> Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(true)}
                            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                                isSignUp
                                    ? 'bg-[#289B7D] text-white shadow-md'
                                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            <UserPlus size={14} /> Sign Up
                        </button>
                    </div>

                    {/* Quick Demo Login (In Sign In mode) */}
                    {!isSignUp && (
                        <div className="mb-4 p-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] space-y-1.5">
                            <p className="text-[10px] font-semibold text-[var(--foreground-secondary)] text-center uppercase tracking-wider flex items-center justify-center gap-1">
                                <Sparkles size={11} className="text-[#289B7D]" /> Quick Demo Login
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => fillDemoUser('user@example.com')}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[#289B7D] transition-all cursor-pointer shadow-xs"
                                >
                                    <UserCheck size={13} className="text-[#289B7D]" /> Candidate
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillDemoUser('admin@example.com')}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[#289B7D] transition-all cursor-pointer shadow-xs"
                                >
                                    <ShieldCheck size={13} className="text-[#289B7D]" /> Admin
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Auth Card */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 sm:p-6 shadow-lg">
                        {/* Google OAuth Button */}
                        <button
                            type="button"
                            onClick={loginWithGoogle}
                            className="btn-social text-xs sm:text-sm mb-4 w-full flex items-center justify-center gap-2"
                        >
                            <GoogleIcon /> {isSignUp ? 'Sign up with Google' : 'Continue with Google'}
                        </button>

                        <div className="relative mb-4">
                            <div className="divider" />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-[10px] sm:text-xs font-semibold text-[var(--foreground-secondary)] bg-[var(--card-bg)]">
                                or with email
                            </span>
                        </div>

                        {/* Unified Form */}
                        <form onSubmit={handleSubmit} className="space-y-3">
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
                                            className="input-field pl-10 py-2 text-xs sm:text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email field */}
                            <div className="space-y-1">
                                <label className="input-label text-xs">Email</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field pl-10 py-2 text-xs sm:text-sm"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password fields */}
                            {isSignUp ? (
                                <div className="grid grid-cols-2 gap-2 animate-fade-in">
                                    <div className="space-y-1">
                                        <label className="input-label text-xs">Password</label>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="input-field pl-10 pr-8 py-2 text-xs sm:text-sm"
                                                placeholder="Min 8 chars"
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
                                        <label className="input-label text-xs">Confirm</label>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                            <input
                                                type={showConfirm ? 'text' : 'password'}
                                                required
                                                value={confirm}
                                                onChange={(e) => setConfirm(e.target.value)}
                                                className="input-field pl-10 pr-8 py-2 text-xs sm:text-sm"
                                                placeholder="Re-enter"
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
                            ) : (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="input-label text-xs">Password</label>
                                        <Link to="/forgot-password" className="text-xs font-semibold text-[#289B7D] hover:underline">
                                            Forgot?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input-field pl-10 pr-10 py-2 text-xs sm:text-sm"
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
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-2.5 rounded-xl text-xs sm:text-sm mt-1 cursor-pointer flex items-center justify-center gap-2"
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
                                        onClick={() => setIsSignUp(false)}
                                        className="font-semibold text-[#289B7D] hover:underline cursor-pointer"
                                    >
                                        Sign in
                                    </button>
                                </>
                            ) : (
                                <>
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setIsSignUp(true)}
                                        className="font-semibold text-[#289B7D] hover:underline cursor-pointer"
                                    >
                                        Create one free
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
