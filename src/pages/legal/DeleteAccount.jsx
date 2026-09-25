import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Trash2,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    HelpCircle,
    Smartphone,
    Globe,
    Mail,
    ArrowLeft,
    Clock,
    FileText,
    Database,
    Lock,
    Info,
    ExternalLink,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BrandLogo from '../../components/BrandLogo';
import { useAuth } from '../../context/AuthContext';

export default function DeleteAccount() {
    const navigate = useNavigate();
    const { user, deleteAccount } = useAuth();

    // Form state for unauthenticated / web requests
    const [email, setEmail] = useState('');
    const [scope, setScope] = useState('all'); // 'all' or 'quiz_only'
    const [reason, setReason] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submittedSuccess, setSubmittedSuccess] = useState(false);
    const [deletingLive, setDeletingLive] = useState(false);

    // FAQ accordion state
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        const previousTitle = document.title;
        document.title = "HangBug — Account Deletion & Data Removal Request";

        let metaDesc = document.querySelector('meta[name="description"]');
        let createdMeta = false;
        let previousDesc = "";

        if (metaDesc) {
            previousDesc = metaDesc.getAttribute('content') || "";
            metaDesc.setAttribute('content', 'Request account and associated data deletion for the HangBug app in compliance with Google Play Store User Data policies.');
        } else {
            metaDesc = document.createElement('meta');
            metaDesc.name = "description";
            metaDesc.content = "Request account and associated data deletion for the HangBug app in compliance with Google Play Store User Data policies.";
            document.head.appendChild(metaDesc);
            createdMeta = true;
        }

        return () => {
            document.title = previousTitle || "HangBug — Debug Your Knowledge. Build Your Future.";
            if (metaDesc) {
                if (createdMeta) {
                    document.head.removeChild(metaDesc);
                } else if (previousDesc) {
                    metaDesc.setAttribute('content', previousDesc);
                }
            }
        };
    }, []);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Handle authenticated live deletion
    const handleLiveDelete = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to permanently delete your HangBug account? All quiz results, certificates, and profile data will be permanently erased immediately.'
        );
        if (!confirmed) return;

        setDeletingLive(true);
        try {
            await deleteAccount();
            navigate('/');
        } catch {
            // Toast shown in AuthContext
        } finally {
            setDeletingLive(false);
        }
    };

    // Handle unauthenticated web deletion request submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            toast.error('Please enter a valid registered email address');
            return;
        }

        if (!agreed) {
            toast.error('Please confirm that you understand this action is permanent');
            return;
        }

        setSubmitting(true);
        try {
            const res = await axios.post('/auth/request-deletion', {
                email,
                scope,
                reason
            });

            setSubmittedSuccess(true);
            toast.success(res.data?.message || 'Deletion request submitted successfully.');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to submit deletion request. Please contact support@hangbug.com.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const faqs = [
        {
            q: "Can I recover my HangBug account after deletion?",
            a: "No. Account deletion is permanent and irreversible. Once deleted, your account credentials, quiz attempts, high scores, earned certificates, and rankings cannot be restored."
        },
        {
            q: "What happens to certificates I have already earned?",
            a: "All certificates linked to your account will be permanently deactivated. Their public verification URLs and QR codes will display as revoked/invalidated."
        },
        {
            q: "How long does it take for data deletion to complete?",
            a: "If you delete your account directly through the mobile app or while logged in on the web, deletion is executed immediately in real-time. If you submit a web request without logging in or contact support via email, requests are validated and fully purged within 30 calendar days."
        },
        {
            q: "What if I signed up using Google Sign-In?",
            a: "Deleting your HangBug account severs the connection to Google OAuth and wipes your HangBug user record completely. It does NOT affect your Google account itself."
        },
        {
            q: "Can I request deletion of quiz history only without deleting my login?",
            a: "Yes. In the request form below, you can select 'Quiz Progress & History Only' to reset your scores, stats, and certificates while keeping your email login intact."
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                {/* Back Link */}
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--foreground-muted)] hover:text-[#193D35] transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <span className="text-xs text-[var(--foreground-muted)] hidden sm:inline">
                        Google Play Data Safety & User Privacy Compliance
                    </span>
                </div>

                {/* Hero Header */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 mb-8 shadow-sm relative overflow-hidden">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900/50 mb-4">
                        <Trash2 size={14} /> Account & Data Deletion
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-[var(--foreground)] tracking-tight mb-3">
                        Delete Your HangBug Account & Data
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--foreground-muted)] max-w-3xl leading-relaxed">
                        In accordance with <strong className="text-[var(--foreground)]">Google Play's User Data & Account Deletion Policy</strong>,
                        HangBug provides users with transparent, self-service options to permanently delete their account and associated data.
                    </p>

                    {/* App identifier metadata box */}
                    <div className="mt-5 p-3.5 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-xl flex flex-wrap items-center gap-4 text-xs text-[var(--foreground-muted)]">
                        <div>
                            <span className="font-semibold text-[var(--foreground)]">Application:</span> HangBug
                        </div>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <div>
                            <span className="font-semibold text-[var(--foreground)]">Package Name:</span> <code className="bg-[var(--card-bg)] px-1.5 py-0.5 rounded border border-[var(--card-border)] font-mono text-[11px]">com.hangbug.app</code>
                        </div>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <div>
                            <span className="font-semibold text-[var(--foreground)]">Developer:</span> HangBug Dev Team
                        </div>
                    </div>
                </div>

                {/* Active user status banner if logged in */}
                {user ? (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                                    Currently Signed In
                                </p>
                                <p className="text-sm font-bold text-[var(--foreground)]">
                                    {user.name} <span className="font-normal text-[var(--foreground-muted)]">({user.email})</span>
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={deletingLive}
                            onClick={handleLiveDelete}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            {deletingLive ? 'Deleting Account...' : 'Instant Delete (Logged In)'}
                        </button>
                    </div>
                ) : null}

                {/* Main 3 Deletion Options */}
                <div className="space-y-6 mb-12">
                    <h2 className="text-xl font-display font-bold text-[var(--foreground)] flex items-center gap-2">
                        <ShieldAlert size={20} className="text-red-500" />
                        How to Request Account & Data Deletion
                    </h2>

                    {/* Method 1: Web Request Form */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-[#F3E5C5] text-[#193D35] flex items-center justify-center font-bold text-sm">
                                <Globe size={18} />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                                    Option 1: Submit Online Deletion Request (Web)
                                </h3>
                                <p className="text-xs text-[var(--foreground-muted)]">
                                    Use this form if you have uninstalled the app or prefer to request deletion online.
                                </p>
                            </div>
                        </div>

                        {submittedSuccess ? (
                            <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-center space-y-3 animate-fade-up">
                                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h4 className="text-base font-bold text-green-900 dark:text-green-300">
                                    Deletion Request Received
                                </h4>
                                <p className="text-xs sm:text-sm text-green-800 dark:text-green-400 max-w-md mx-auto">
                                    Your request to delete account data for <strong>{email}</strong> has been logged.
                                    If this account exists in our system, all requested data will be permanently wiped within 30 days.
                                </p>
                                <button
                                    onClick={() => {
                                        setSubmittedSuccess(false);
                                        setEmail('');
                                        setReason('');
                                        setAgreed(false);
                                    }}
                                    className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 dark:text-green-300 underline pt-2"
                                >
                                    Submit another request
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                                <div>
                                    <label htmlFor="del-email" className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
                                        Registered Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="del-email"
                                        type="email"
                                        required
                                        placeholder="developer@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--input-bg,var(--page-bg))] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[#193D35] transition-all"
                                    />
                                    <p className="text-[11px] text-[var(--foreground-muted)] mt-1">
                                        Must match the email address associated with your HangBug account.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
                                        Deletion Scope <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                            scope === 'all'
                                                ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                                                : 'border-[var(--card-border)] bg-[var(--page-bg)] hover:bg-[var(--muted-bg)]'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="deletion_scope"
                                                value="all"
                                                checked={scope === 'all'}
                                                onChange={() => setScope('all')}
                                                className="mt-0.5 text-red-600 focus:ring-red-500"
                                            />
                                            <div className="text-xs">
                                                <span className="font-bold text-[var(--foreground)] block mb-0.5">
                                                    Full Account & All Data (Recommended)
                                                </span>
                                                <span className="text-[var(--foreground-muted)]">
                                                    Permanently delete account credentials, certificates, scores, and quiz history.
                                                </span>
                                            </div>
                                        </label>

                                        <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                            scope === 'quiz_only'
                                                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                                                : 'border-[var(--card-border)] bg-[var(--page-bg)] hover:bg-[var(--muted-bg)]'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="deletion_scope"
                                                value="quiz_only"
                                                checked={scope === 'quiz_only'}
                                                onChange={() => setScope('quiz_only')}
                                                className="mt-0.5 text-amber-600 focus:ring-amber-500"
                                            />
                                            <div className="text-xs">
                                                <span className="font-bold text-[var(--foreground)] block mb-0.5">
                                                    Quiz History & Certificates Only
                                                </span>
                                                <span className="text-[var(--foreground-muted)]">
                                                    Reset test scores and certificates while retaining your login account.
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="del-reason" className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
                                        Reason for Deletion <span className="text-[var(--foreground-muted)] font-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        id="del-reason"
                                        rows={2}
                                        placeholder="Let us know how we could improve (optional)..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--input-bg,var(--page-bg))] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[#193D35] transition-all resize-none"
                                    />
                                </div>

                                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            required
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-xs text-red-800 dark:text-red-300 leading-normal">
                                            I understand that this request is permanent and irreversible. Once processed, my account, certificates, and quiz statistics will cannot be recovered.
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                    {submitting ? 'Submitting Request...' : 'Submit Deletion Request'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Method 2: Mobile App In-App Steps */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-[#193D35] text-white flex items-center justify-center font-bold text-sm">
                                <Smartphone size={18} />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                                    Option 2: Delete Directly Inside the Mobile App (Instant)
                                </h3>
                                <p className="text-xs text-[var(--foreground-muted)]">
                                    If you still have the HangBug app on Android or iOS, you can delete your account in real-time.
                                </p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-4 gap-3 pt-2">
                            <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--page-bg)] space-y-1.5">
                                <span className="inline-block px-2 py-0.5 rounded bg-[#F3E5C5] text-[#193D35] font-bold text-[10px]">
                                    STEP 1
                                </span>
                                <p className="text-xs font-bold text-[var(--foreground)]">Open App</p>
                                <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                                    Open the HangBug application on your device and sign in.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--page-bg)] space-y-1.5">
                                <span className="inline-block px-2 py-0.5 rounded bg-[#F3E5C5] text-[#193D35] font-bold text-[10px]">
                                    STEP 2
                                </span>
                                <p className="text-xs font-bold text-[var(--foreground)]">Settings</p>
                                <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                                    Navigate to <strong>Profile</strong> &gt; tap the <strong>Settings</strong> gear icon.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--page-bg)] space-y-1.5">
                                <span className="inline-block px-2 py-0.5 rounded bg-[#F3E5C5] text-[#193D35] font-bold text-[10px]">
                                    STEP 3
                                </span>
                                <p className="text-xs font-bold text-[var(--foreground)]">Danger Zone</p>
                                <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                                    Scroll to the bottom to find the <strong>Danger Zone</strong> section.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--page-bg)] space-y-1.5">
                                <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                                    STEP 4
                                </span>
                                <p className="text-xs font-bold text-[var(--foreground)]">Confirm Delete</p>
                                <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                                    Tap <strong>Delete My Account</strong> and confirm the warning dialogue.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Method 3: Email Support */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-[var(--foreground)] flex items-center justify-center font-bold text-sm shrink-0">
                                <Mail size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[var(--foreground)]">
                                    Option 3: Manual Request via Support Email
                                </h3>
                                <p className="text-xs text-[var(--foreground-muted)]">
                                    You can also email our compliance officer directly at <a href="mailto:support@hangbug.com" className="text-[#193D35] font-bold underline">support@hangbug.com</a>.
                                </p>
                            </div>
                        </div>

                        <a
                            href="mailto:support@hangbug.com?subject=HangBug%20Account%20Deletion%20Request&body=Hello%20HangBug%20Support,%0A%0APlease%20permanently%20delete%20my%20HangBug%20account%20and%20all%20associated%20data.%0A%0ARegistered%20Email:%20[Your%20Email%20Here]%0A%0AThank%20you."
                            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--page-bg)] hover:bg-[var(--muted-bg)] text-xs font-bold text-[var(--foreground)] transition-colors flex items-center justify-center gap-2"
                        >
                            <Mail size={14} /> Send Email Request
                        </a>
                    </div>
                </div>

                {/* Data Deletion & Retention Disclosure (Google Play Mandate) */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 mb-12 shadow-sm space-y-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3E5C5] text-[#193D35] text-xs font-bold border border-[#E2D0A6] mb-2">
                            <FileText size={14} /> Policy Disclosure
                        </div>
                        <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--foreground)]">
                            What Data Is Deleted and What Is Retained?
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                            Google Play requires clear disclosure of all user data elements subject to deletion and retention schedules.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* Data Deleted */}
                        <div className="p-5 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 space-y-3">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
                                <Trash2 size={16} />
                                <span>Permanently Deleted Data</span>
                            </div>
                            <ul className="text-xs text-[var(--foreground)] space-y-2 list-disc list-inside">
                                <li>
                                    <strong>Personal Credentials:</strong> Your full name, email address, password hash, and avatar picture.
                                </li>
                                <li>
                                    <strong>Quiz History & Scores:</strong> All test attempts, chosen answers, category scores, and percentages.
                                </li>
                                <li>
                                    <strong>Certificates & Badges:</strong> Digital certificates, verification IDs, and verifiable QR codes.
                                </li>
                                <li>
                                    <strong>Leaderboard Rankings:</strong> Your position, public score listings, and user activity streaks.
                                </li>
                                <li>
                                    <strong>Session Credentials:</strong> All active authentication tokens (JWT) and login cookies.
                                </li>
                            </ul>
                        </div>

                        {/* Data Retained */}
                        <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10 space-y-3">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
                                <Database size={16} />
                                <span>Retained Data & Retention Period</span>
                            </div>
                            <ul className="text-xs text-[var(--foreground)] space-y-2 list-disc list-inside">
                                <li>
                                    <strong>Anonymized Aggregate Metrics:</strong> Total platform quiz completion counts and question difficulty metrics (fully stripped of any user identifiers).
                                </li>
                                <li>
                                    <strong>Security & Server Access Logs:</strong> Standard web server IP logs retained for up to 30 days solely for DDoS and brute-force threat prevention, then purged automatically.
                                </li>
                                <li>
                                    <strong>Legal / Tax Records:</strong> If applicable, financial compliance records retained only as mandated by law.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Timelines */}
                    <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--page-bg)] flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-[var(--foreground-muted)]">
                        <div className="flex items-center gap-2 text-[var(--foreground)] font-bold shrink-0">
                            <Clock size={16} className="text-[#193D35]" /> Deletion Timeframe:
                        </div>
                        <div>
                            Direct in-app deletion is <strong>instant</strong>. Web form and email requests are verified and completed within <strong>30 calendar days</strong>.
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 mb-12 shadow-sm space-y-4">
                    <h2 className="text-xl font-display font-bold text-[var(--foreground)] flex items-center gap-2 mb-2">
                        <HelpCircle size={20} className="text-[#193D35]" />
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-3">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="border border-[var(--card-border)] rounded-2xl overflow-hidden bg-[var(--page-bg)] transition-all"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[var(--foreground)] hover:text-[#193D35] transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    {openFaq === idx ? (
                                        <ChevronUp size={16} className="shrink-0 text-[#193D35]" />
                                    ) : (
                                        <ChevronDown size={16} className="shrink-0 text-[var(--foreground-muted)]" />
                                    )}
                                </button>
                                {openFaq === idx && (
                                    <div className="px-5 pb-4 pt-1 text-xs text-[var(--foreground-muted)] leading-relaxed border-t border-[var(--card-border)]">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy Policy Link footer note */}
                <div className="text-center text-xs text-[var(--foreground-muted)] space-y-2">
                    <p>
                        For complete details on our data protection commitments, please read the full{' '}
                        <Link to="/privacy-policy" className="text-[#193D35] font-semibold underline">
                            HangBug Privacy Policy
                        </Link>{' '}
                        and{' '}
                        <Link to="/terms" className="text-[#193D35] font-semibold underline">
                            Terms of Service
                        </Link>.
                    </p>
                    <p>
                        Questions or inquiries? Contact our Data Protection Officer at{' '}
                        <a href="mailto:support@hangbug.com" className="text-[#193D35] font-semibold underline">
                            support@hangbug.com
                        </a>.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
