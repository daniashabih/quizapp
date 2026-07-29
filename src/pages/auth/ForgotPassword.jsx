import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/auth/forgot-password', { email });
            toast.success(res.data.message);
            setSubmitted(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen max-h-screen bg-[var(--page-bg)] flex flex-col overflow-hidden">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4 pt-16 sm:pt-20 min-h-0 overflow-y-auto lg:overflow-hidden">
                <div className="w-full max-w-md animate-fade-up my-auto">
                    <Link to="/login" className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--foreground-muted)] hover:text-[#163B34] transition-colors mb-4">
                        <ArrowLeft size={15} /> Back to Login
                    </Link>

                    <div className="card p-6 sm:p-8 rounded-2xl">
                        {!submitted ? (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#EAF5F2] border border-[#D4EBE5] flex items-center justify-center mx-auto mb-3">
                                        <Mail size={22} className="text-[#163B34]" />
                                    </div>
                                    <h1 className="text-xl sm:text-2xl font-display font-bold text-[var(--foreground)] mb-1">Forgot Password?</h1>
                                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">No worries, we'll send you reset instructions.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="input-label text-xs">Email Address</label>
                                        <div className="relative">
                                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="input-field pl-10 py-2 text-xs sm:text-sm"
                                                placeholder="name@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full justify-center py-2.5 text-xs sm:text-sm"
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
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle size={22} className="text-emerald-500" />
                                </div>
                                <h2 className="text-xl font-display font-bold text-[var(--foreground)] mb-2">Check your email</h2>
                                <p className="text-xs text-[var(--foreground-muted)] mb-4">
                                    We've sent a password reset link to <strong className="text-[var(--foreground)]">{email}</strong>.
                                </p>
                                <button onClick={handleSubmit} className="text-xs font-semibold text-[#163B34] hover:text-[#289B7D] transition-colors">
                                    Didn't receive it? Click to resend
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
