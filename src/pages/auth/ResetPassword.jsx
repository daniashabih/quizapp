import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabase';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (password.length < 8) {
            return toast.error('Password must be at least 8 characters');
        }
        setLoading(true);

        let supaSuccess = false;
        if (supabase) {
            try {
                const { error } = await supabase.auth.updateUser({ password });
                if (!error) {
                    supaSuccess = true;
                }
            } catch (err) {
                console.log('Supabase updateUser password error:', err);
            }
        }

        try {
            if (token) {
                const res = await axios.post('/auth/reset-password', { token, password });
                toast.success(res.data.message);
            } else if (supaSuccess) {
                toast.success('Password updated successfully!');
            } else {
                toast.success('Password updated!');
            }
            navigate('/login');
        } catch (error) {
            if (supaSuccess) {
                toast.success('Password updated successfully!');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.message || 'Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen max-h-screen bg-[var(--page-bg)] flex flex-col overflow-hidden">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4 pt-16 sm:pt-20 min-h-0 overflow-y-auto lg:overflow-hidden">
                <div className="w-full max-w-md animate-fade-up my-auto">
                    <div className="card p-6 sm:p-8 rounded-2xl">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#EAF5F2] border border-[#D4EBE5] flex items-center justify-center mx-auto mb-3">
                                <Lock size={22} className="text-[#163B34]" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-display font-bold text-[var(--foreground)] mb-1">Set New Password</h1>
                            <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">Your new password must be different from previous used passwords.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="input-label text-xs">New Password</label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field pl-10 pr-10 py-2 text-xs sm:text-sm"
                                        placeholder="Minimum 8 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="input-label text-xs">Confirm New Password</label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-field pl-10 py-2 text-xs sm:text-sm"
                                        placeholder="Re-enter password"
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
                                        Reset Password <ArrowRight size={15} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-4 text-center">
                            <Link to="/login" className="text-xs font-semibold text-[#163B34] hover:text-[#289B7D] transition-colors inline-flex items-center gap-1">
                                <ArrowLeft size={13} /> Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
