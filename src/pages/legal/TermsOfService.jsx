import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Award, AlertCircle, Scale, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import usePageSeo from '../../hooks/usePageSeo';

export default function TermsOfService() {
    usePageSeo({
        title: 'Terms of Service — Hangbug Platform Terms & Conditions',
        description: 'Review the Hangbug Terms of Service governing platform usage, score-based certificate verification, intellectual property, and community guidelines.',
        canonicalPath: '/terms'
    });
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const lastUpdated = "August 19, 2026";

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                {/* Back Link */}
                <div className="mb-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[#193D35] transition-colors">
                        <ArrowLeft size={14} /> Back to Home
                    </Link>
                </div>

                {/* Header */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 mb-8 shadow-sm">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3E5C5] text-[#193D35] text-xs font-bold border border-[#E2D0A6] mb-4">
                        <Scale size={14} /> Legal Agreement
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--foreground)] tracking-tight mb-2">
                        Terms of Service
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                        Last updated: <span className="font-semibold text-[var(--foreground)]">{lastUpdated}</span>
                    </p>
                </div>

                {/* Terms Body */}
                <div className="space-y-8 text-sm leading-relaxed text-[var(--foreground)]">
                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold flex items-center gap-2 text-[var(--foreground)]">
                            <FileText size={18} className="text-[#193D35]" /> 1. Agreement to Terms
                        </h2>
                        <p className="text-[var(--foreground-muted)]">
                            By accessing or using Hangbug (<a href="https://www.hangbug.com/" className="text-[#193D35] font-semibold underline">https://www.hangbug.com/</a>), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use the platform.
                        </p>
                    </section>

                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold flex items-center gap-2 text-[var(--foreground)]">
                            <CheckCircle2 size={18} className="text-[#193D35]" /> 2. User Accounts &amp; Fair Play
                        </h2>
                        <p className="text-[var(--foreground-muted)]">
                            Users must provide accurate information when creating an account. You are responsible for keeping your credentials confidential.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-[var(--foreground-muted)] text-xs sm:text-sm">
                            <li>Automated bots, scripts, or answer scrapers are strictly prohibited.</li>
                            <li>Attempting to manipulate leaderboard standings or quiz results will result in account suspension.</li>
                            <li>You are solely responsible for all activities occurring under your account.</li>
                        </ul>
                    </section>

                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold flex items-center gap-2 text-[var(--foreground)]">
                            <Award size={18} className="text-[#193D35]" /> 3. Quizzes &amp; Score-Based Certificates
                        </h2>
                        <p className="text-[var(--foreground-muted)]">
                            Certificates issued by Hangbug represent platform-based quiz completion and self-assessment based on the score achieved (80% or higher) at the time of testing. Certificates include a unique verification ID and QR verification link.
                        </p>
                    </section>

                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold text-[var(--foreground)]">4. Intellectual Property</h2>
                        <p className="text-[var(--foreground-muted)]">
                            All platform designs, branding, quiz structures, coding games, and question databases are the property of Hangbug and protected under applicable intellectual property laws.
                        </p>
                    </section>

                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold flex items-center gap-2 text-[var(--foreground)]">
                            <AlertCircle size={18} className="text-[#193D35]" /> 5. Disclaimer of Warranties
                        </h2>
                        <p className="text-[var(--foreground-muted)]">
                            Hangbug is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. While we strive for accuracy across all quiz questions and system uptime, we do not guarantee uninterrupted access or error-free question banks.
                        </p>
                    </section>

                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold text-[var(--foreground)]">6. Contact &amp; Disputes</h2>
                        <p className="text-[var(--foreground-muted)]">
                            For legal inquiries or feedback regarding these terms, contact us at <a href="mailto:support@hangbug.com" className="text-[#193D35] font-semibold underline">support@hangbug.com</a>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
