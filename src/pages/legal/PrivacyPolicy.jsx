import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cookie, Lock, Eye, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PrivacyPolicy() {
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
                        <ShieldCheck size={14} /> Official Policy
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--foreground)] tracking-tight mb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                        Last updated: <span className="font-semibold text-[var(--foreground)]">{lastUpdated}</span>
                    </p>
                </div>

                {/* Policy Body */}
                <div className="space-y-8 text-sm leading-relaxed text-[var(--foreground)]">
                    {/* Introduction */}
                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold flex items-center gap-2 text-[var(--foreground)]">
                            <Eye size={18} className="text-[#193D35]" /> 1. Introduction
                        </h2>
                        <p className="text-[var(--foreground-muted)]">
                            Welcome to <strong>HangBug</strong> ("we", "our", or "us"). We are committed to protecting your privacy and ensuring transparency in how your personal information is collected, used, and protected. This Privacy Policy explains how our web application handles your data when you practice quizzes, earn certificates, and interact with our platform.
                        </p>
                    </section>

                    {/* Google AdSense & Advertising Disclosure (Strict Requirement) */}
                    <section className="bg-[var(--card-bg)] border-2 border-[#193D35]/30 rounded-2xl p-6 sm:p-8 space-y-4 relative overflow-hidden">
                        <div className="flex items-center gap-2 text-base font-display font-bold text-[#193D35]">
                            <Cookie size={20} />
                            <h2>2. Google AdSense & Third-Party Advertising (Cookie Policy)</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            HangBug partners with third-party advertising networks, including <strong>Google AdSense</strong>, to serve advertisements when you visit our website.
                        </p>
                        <div className="space-y-3 pl-2 border-l-2 border-[#D19A45]">
                            <p className="text-xs text-[var(--foreground-muted)]">
                                • <strong>Third-Party Cookies:</strong> Third-party vendors, including Google, use cookies and web beacons to serve ads based on a user's prior visits to HangBug or other websites across the internet.
                            </p>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                • <strong>Advertising Cookies:</strong> Google's use of advertising cookies enables it and its partners to serve targeted ads to our users based on their visits to our site and other destinations online.
                            </p>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                • <strong>Opting Out of Personalized Ads:</strong> You may opt out of personalized advertising by visiting{' '}
                                <a
                                    href="https://adssettings.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#193D35] font-semibold underline inline-flex items-center gap-1"
                                >
                                    Google Ads Settings <ExternalLink size={12} />
                                </a>. Alternatively, you can opt out of third-party vendor cookies for personalized advertising by visiting{' '}
                                <a
                                    href="https://www.aboutads.info/choices/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#193D35] font-semibold underline inline-flex items-center gap-1"
                                >
                                    aboutads.info <ExternalLink size={12} />
                                </a>.
                            </p>
                        </div>
                    </section>

                    {/* Information We Collect */}
                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold flex items-center gap-2 text-[var(--foreground)]">
                            <Lock size={18} className="text-[#193D35]" /> 3. Information We Collect
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-[var(--foreground-muted)] text-xs sm:text-sm">
                            <li><strong>Account Details:</strong> When you register, we collect your name, email address, password hash, and optional profile data.</li>
                            <li><strong>Quiz Performance & Activity:</strong> Information regarding quizzes taken, session numbers, scores, completion times, XP, and certificates earned.</li>
                            <li><strong>Log and Device Data:</strong> Standard browser request data such as IP address, browser type, referring pages, device type, and visit timestamps.</li>
                        </ul>
                    </section>

                    {/* How We Use Your Data */}
                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold text-[var(--foreground)]">4. How We Use Information</h2>
                        <p className="text-[var(--foreground-muted)]">We use collected information to:</p>
                        <ul className="list-disc list-inside space-y-1 text-[var(--foreground-muted)] text-xs sm:text-sm">
                            <li>Provide and personalize your quiz assessment experience.</li>
                            <li>Generate and verify authentic skill certificates.</li>
                            <li>Maintain leaderboards and ranking analytics.</li>
                            <li>Monitor platform security, prevent fraudulent activity, and debug errors.</li>
                            <li>Comply with applicable legal obligations and enforce platform terms.</li>
                        </ul>
                    </section>

                    {/* Data Security & Sharing */}
                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold text-[var(--foreground)]">5. Data Protection & Sharing</h2>
                        <p className="text-[var(--foreground-muted)]">
                            We do not sell or rent your personal identifiable information to third parties. We employ industry-standard encryption, secure databases, and tokenized authentication to safeguard your credentials and private activity.
                        </p>
                    </section>

                    {/* Contact Us Section */}
                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold flex items-center gap-2 text-[var(--foreground)]">
                            <Mail size={18} className="text-[#193D35]" /> 6. Contact Information
                        </h2>
                        <p className="text-[var(--foreground-muted)]">
                            If you have questions, concerns, or requests regarding this Privacy Policy or data deletion, please contact our team:
                        </p>
                        <p className="font-semibold text-[#193D35]">
                            Email: <a href="mailto:support@hangbug.com" className="underline">support@hangbug.com</a>
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
