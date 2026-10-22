import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BrandLogo from '../../components/BrandLogo';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setErrorMessage('');

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            setErrorMessage('Please enter your email address.');
            return;
        }

        if (!EMAIL_REGEX.test(cleanEmail)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post('/auth/forgot-password', { email: cleanEmail });
            const message = res.data?.message || 'If an account exists for this email address, you will receive a password reset link shortly.';
            toast.success(message);
            setSubmitted(true);
            setResendCooldown(30);

            // Cooldown countdown timer
            const interval = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to process password reset. Please try again.';
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
            <Navbar />
            <main className="flex-1 flex flex-col items-center justify-start sm:justify-center px-4 pt-24 sm:pt-28 pb-12 w-full">
                <div className="w-full max-w-md animate-fade-up">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--foreground-muted)] hover:text-[#193D35] transition-colors mb-4 font-medium"
                    >
                        <ArrowLeft size={15} /> Back to Login
                    </Link>

                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 shadow-lg">
                        {/* Brand Icon & Heading */}
                        <div className="text-center mb-6">
                            <BrandLogo variant="mark" size="md" className="mx-auto mb-3" />
                            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--foreground)] mb-1">
                                Forgot Password?
                            </h1>
                            <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] max-w-xs mx-auto">
                                Enter your registered email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        {/* Error Alert Banner */}
                        {errorMessage && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fade-in">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="input-label text-xs">Email Address</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (errorMessage) setErrorMessage('');
                                            }}
                                            className="input-field pl-10 py-2.5 text-xs sm:text-sm w-full"
                                            placeholder="name@example.com"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full justify-center py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Send Reset Link <Send size={15} />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-3 animate-fade-in">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle size={24} className="text-emerald-600" />
                                </div>
                                <h2 className="text-lg font-display font-bold text-[var(--foreground)] mb-1">Check your inbox</h2>
                                <p className="text-xs text-[var(--foreground-secondary)] mb-4 leading-relaxed">
                                    If an account is associated with <strong className="text-[var(--foreground)]">{email}</strong>, you will receive a secure password reset link valid for 30 minutes.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading || resendCooldown > 0}
                                        className="text-xs font-semibold text-[#193D35] hover:underline disabled:text-gray-400 disabled:no-underline transition-colors block w-full"
                                    >
                                        {resendCooldown > 0
                                            ? `Resend link available in ${resendCooldown}s`
                                            : "Didn't receive it? Click to resend"}
                                    </button>

                                    <div className="pt-2 border-t border-[var(--card-border)]">
                                        <Link
                                            to="/login"
                                            className="text-xs font-semibold text-[#193D35] hover:underline inline-flex items-center gap-1"
                                        >
                                            <ArrowLeft size={13} /> Return to Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-[var(--card-border)] text-center">
                            <Link to="/login" className="text-xs text-[var(--foreground-secondary)] hover:text-[#193D35] transition-colors">
                                Remember your password? <span className="font-semibold text-[#193D35]">Sign in</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
