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
        canonicalPath: '/terms',
        schemaType: 'WebPage',
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Terms of Service', path: '/terms' }
        ]
    });
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const lastUpdated = "November 26, 2026";

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
                        Hangbug Platform Terms and Conditions of Service
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
                            <CheckCircle2 size={18} className="text-[#193D35]" /> 2. Acceptable Use &amp; Account Responsibilities
                        </h2>
                        <p className="text-[var(--foreground-muted)]">
                            Provide accurate account information and keep your password and sign-in credentials confidential. You are responsible for activity under your account and should contact support promptly if you suspect unauthorized access.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-[var(--foreground-muted)] text-xs sm:text-sm">
                            <li>Do not use bots, scripts, answer scrapers, or other automation to complete quizzes or collect question content.</li>
                            <li>Do not cheat, manipulate scores or leaderboard standings, interfere with the service, or attempt unauthorized access.</li>
                            <li>Do not misuse, disrupt, or use Hangbug in violation of applicable law or these terms. We may restrict access when needed to address abuse or protect the service.</li>
                        </ul>
                    </section>

                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold flex items-center gap-2 text-[var(--foreground)]">
                            <Award size={18} className="text-[#193D35]" /> 3. Quizzes &amp; Score-Based Certificates
                        </h2>
                        <p className="text-[var(--foreground-muted)]">
                            Quiz scores are calculated from submitted answers and shown as a percentage of the questions answered correctly. When certificates are enabled, a passing result at or above the configured certificate threshold makes a certificate available; the current default threshold is 80%. Certificates record the assessment result and include a unique verification ID and verification link. They document performance on Hangbug and are not a guarantee of professional qualification, employment, or accreditation by an outside body. Attempts to obtain a result or certificate through cheating or manipulation may result in its removal.
                        </p>
                    </section>

                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold text-[var(--foreground)]">4. Intellectual Property</h2>
                        <p className="text-[var(--foreground-muted)]">
                            Hangbug and its licensors retain rights in the platform, software, branding, designs, quiz questions, explanations, and games, except for third-party materials identified as such. You may use the service for personal learning; you may not copy, scrape, republish, or commercially redistribute protected content without permission or a legal right to do so.
                        </p>
                    </section>

                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold flex items-center gap-2 text-[var(--foreground)]">
                            <AlertCircle size={18} className="text-[#193D35]" /> 5. Service Disclaimer &amp; Limitation of Liability
                        </h2>
                        <p className="text-[var(--foreground-muted)]">
                            Hangbug is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We work to keep the service and learning materials useful, but do not guarantee uninterrupted access, error-free content, or that quiz results or certificates will meet a particular purpose.
                        </p>
                        <p className="text-[var(--foreground-muted)]">
                            To the extent permitted by applicable law, Hangbug will not be liable for indirect, incidental, special, consequential, or punitive loss, or loss of data, profits, or goodwill arising from use of or inability to use the service. Nothing in these terms excludes or limits liability or consumer rights that applicable law does not allow to be excluded or limited.
                        </p>
                    </section>

                    <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-3">
                        <h2 className="text-lg font-display font-bold text-[var(--foreground)]">6. Changes &amp; Contact</h2>
                        <p className="text-[var(--foreground-muted)]">
                            We may update these terms as the service changes. The revised date will appear above. For questions about these terms, contact <a href="mailto:support@hangbug.com" className="text-[#193D35] font-semibold underline">support@hangbug.com</a>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
