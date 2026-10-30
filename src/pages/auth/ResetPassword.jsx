import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, ArrowLeft, Check, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BrandLogo from '../../components/BrandLogo';
import InputField from '../../components/ui/InputField';

export default function ResetPassword() {
    const { token: pathToken } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Support both query param (?token=xyz) and path param (/reset-password/xyz)
    const token = (searchParams.get('token') || pathToken || '').trim();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Verification states
    const [verifying, setVerifying] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [tokenError, setTokenError] = useState('');

    // Submission states
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Password strength rules matching backend policy
    const passwordChecks = useMemo(() => {
        return {
            hasLength: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            matches: Boolean(password && confirmPassword && password === confirmPassword)
        };
    }, [password, confirmPassword]);

    const isFormValid =
        passwordChecks.hasLength &&
        passwordChecks.hasUpper &&
        passwordChecks.hasNumber &&
        password === confirmPassword;

    // Verify token with backend upon mounting
    useEffect(() => {
        let isMounted = true;

        if (!token) {
            setVerifying(false);
            setIsTokenValid(false);
            setTokenError('No reset token found in link. Please request a new password reset.');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await axios.get(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
                if (isMounted) {
                    if (res.data?.valid || res.data?.success) {
                        setIsTokenValid(true);
                    } else {
                        setIsTokenValid(false);
                        setTokenError(res.data?.message || 'Password reset link is invalid or expired.');
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setIsTokenValid(false);
                    const msg = err.response?.data?.message || 'This password reset link is invalid, expired, or has already been used.';
                    setTokenError(msg);
                }
            } finally {
                if (isMounted) {
                    setVerifying(false);
                }
            }
        };

        verifyToken();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!password) {
            setErrorMessage('Please enter a new password.');
            return;
        }

        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            return;
        }

        if (!/[A-Z]/.test(password)) {
            setErrorMessage('Password must contain at least one uppercase letter (A-Z).');
            return;
        }

        if (!/[0-9]/.test(password)) {
            setErrorMessage('Password must contain at least one number (0-9).');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setSubmitting(true);

        try {
            const res = await axios.post('/auth/reset-password', {
                token,
                password,
                confirmPassword
            });

            setIsSuccess(true);
            toast.success(res.data?.message || 'Password reset successfully! Please log in.');

            // Navigate back to login after short delay
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Password updated successfully. Please sign in with your new credentials.' }
                });
            }, 2500);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to reset password. Please try again or request a new link.';
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
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
                        {/* Token Verifying State */}
                        {verifying && (
                            <div className="text-center py-10">
                                <div className="w-8 h-8 border-3 border-[#193D35]/20 border-t-[#193D35] rounded-full animate-spin mx-auto mb-4" />
                                <h2 className="text-base font-semibold text-[var(--foreground)]">Verifying reset link...</h2>
                                <p className="text-xs text-[var(--foreground-secondary)] mt-1">Please wait while we validate your security token.</p>
                            </div>
                        )}

                        {/* Token Invalid / Expired State */}
                        {!verifying && !isTokenValid && !isSuccess && (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3">
                                    <AlertTriangle size={24} className="text-amber-600" />
                                </div>
                                <h1 className="text-xl font-display font-bold text-[var(--foreground)] mb-1">
                                    Invalid or Expired Link
                                </h1>
                                <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mb-6 leading-relaxed">
                                    {tokenError || 'This password reset link is invalid, expired, or has already been used.'}
                                </p>

                                <div className="space-y-2">
                                    <Link
                                        to="/forgot-password"
                                        className="btn-primary w-full justify-center py-2.5 text-xs sm:text-sm flex items-center gap-2"
                                    >
                                        Request New Reset Link <ArrowRight size={15} />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="btn-secondary w-full justify-center py-2.5 text-xs sm:text-sm flex items-center gap-2"
                                    >
                                        Return to Login
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Success State */}
                        {isSuccess && (
                            <div className="text-center py-6 animate-fade-in">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 size={30} className="text-emerald-600" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-display font-bold text-[var(--foreground)] mb-1">
                                    Password Reset Complete!
                                </h1>
                                <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mb-6">
                                    Your Hangbug password has been updated. Redirecting to sign in...
                                </p>
                                <Link
                                    to="/login"
                                    className="btn-primary w-full justify-center py-2.5 text-xs sm:text-sm inline-flex items-center gap-2"
                                >
                                    Proceed to Login <ArrowRight size={15} />
                                </Link>
                            </div>
                        )}

                        {/* Valid Token: Form to set new password */}
                        {!verifying && isTokenValid && !isSuccess && (
                            <>
                                <div className="text-center mb-6">
                                    <BrandLogo variant="mark" size="md" className="mx-auto mb-3" />
                                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--foreground)] mb-1">
                                        Reset Your Password
                                    </h1>
                                    <p className="text-xs sm:text-sm text-[var(--foreground-secondary)]">
                                        Choose a strong new password for your Hangbug account.
                                    </p>
                                </div>

                                {errorMessage && (
                                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fade-in">
                                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* New Password */}
                                    <InputField
                                        label="New Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        autoFocus
                                        prefixIcon={<Lock size={16} />}
                                        autoComplete="new-password"
                                        suffix={
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="input-suffix-action"
                                                tabIndex={-1}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        }
                                    />

                                    {/* Confirm New Password */}
                                    <InputField
                                        label="Confirm New Password"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        required
                                        prefixIcon={<Lock size={16} />}
                                        autoComplete="new-password"
                                        suffix={
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="input-suffix-action"
                                                tabIndex={-1}
                                                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                            >
                                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        }
                                    />

                                    {/* Password Policy Requirements Checklist */}
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
                                            {confirmPassword && (
                                                <div className={`flex items-center gap-1.5 text-[11px] ${passwordChecks.matches ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}`}>
                                                    {passwordChecks.matches ? <Check size={13} className="text-emerald-600 shrink-0" /> : <X size={13} className="text-red-500 shrink-0" />}
                                                    <span>Passwords match</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || !isFormValid}
                                        className="btn-primary w-full justify-center py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Reset Password <ArrowRight size={15} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
