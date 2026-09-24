import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    Lock,
    Eye,
    ArrowLeft,
    Mail,
    ExternalLink,
    Database,
    Cpu,
    Layers,
    Megaphone,
    Cookie,
    Clock,
    Trash2,
    Baby,
    Globe2,
    RefreshCw,
    CheckCircle2
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PrivacyPolicy() {
    const lastUpdated = "September 24, 2026";
    const supportEmail = "support@hangbug.com";

    useEffect(() => {
        window.scrollTo(0, 0);

        // SEO: Title & Description metadata update
        const previousTitle = document.title;
        document.title = "Hangbug Privacy Policy";

        let metaDesc = document.querySelector('meta[name="description"]');
        let createdMeta = false;
        let previousDesc = "";

        if (metaDesc) {
            previousDesc = metaDesc.getAttribute('content') || "";
            metaDesc.setAttribute('content', 'Learn how Hangbug collects, uses, stores, and protects user information.');
        } else {
            metaDesc = document.createElement('meta');
            metaDesc.name = "description";
            metaDesc.content = "Learn how Hangbug collects, uses, stores, and protects user information.";
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
                        Hangbug Privacy & Legal Document
                    </span>
                </div>

                {/* Document Header */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 mb-8 shadow-sm">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3E5C5] text-[#193D35] text-xs font-bold border border-[#E2D0A6] mb-4">
                        <ShieldCheck size={14} /> Official Policy
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--foreground)] tracking-tight mb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mb-4">
                        Last Updated: <span className="font-semibold text-[var(--foreground)]">{lastUpdated}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                        This Privacy Policy applies to the <strong>Hangbug</strong> web application, services, and associated mobile applications. It outlines our transparent commitment to safeguarding user privacy, explaining what information is collected, how it is used and protected, and your rights concerning your personal data.
                    </p>

                    {/* Quick Overview Pill Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-[var(--card-border)]">
                        <div className="flex items-center gap-2.5 text-xs text-[var(--foreground-muted)]">
                            <CheckCircle2 size={16} className="text-[#193D35] shrink-0" />
                            <span>No Unnecessary Data Collection</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-[var(--foreground-muted)]">
                            <CheckCircle2 size={16} className="text-[#193D35] shrink-0" />
                            <span>Google Play Policy Ready</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-[var(--foreground-muted)]">
                            <CheckCircle2 size={16} className="text-[#193D35] shrink-0" />
                            <span>Full Data Deletion Support</span>
                        </div>
                    </div>
                </div>

                {/* Table of Contents / Quick Navigation */}
                <nav aria-label="Table of Contents" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-3">
                        Contents & Navigation
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <a href="#section-1" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">1. Introduction</a>
                        <a href="#section-2" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">2. Information We Collect</a>
                        <a href="#section-3" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">3. How We Use Information</a>
                        <a href="#section-4" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">4. Data Storage and Security</a>
                        <a href="#section-5" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">5. Third-Party Services</a>
                        <a href="#section-6" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">6. Advertising</a>
                        <a href="#section-7" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">7. Cookies & Similar Technologies</a>
                        <a href="#section-8" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">8. Data Retention</a>
                        <a href="#section-9" className="hover:text-[#193D35] text-[var(--foreground-muted)] font-semibold text-[#193D35] transition-colors">9. Account and Data Deletion</a>
                        <a href="#section-10" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">10. Children's Privacy</a>
                        <a href="#section-11" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">11. International Data Processing</a>
                        <a href="#section-12" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">12. Changes to This Privacy Policy</a>
                        <a href="#section-13" className="hover:text-[#193D35] text-[var(--foreground-muted)] transition-colors">13. Contact Us</a>
                    </div>
                </nav>

                {/* Policy Sections */}
                <div className="space-y-8 text-sm leading-relaxed text-[var(--foreground)]">

                    {/* Section 1: Introduction */}
                    <section id="section-1" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <Eye size={20} className="text-[#193D35]" />
                            <h2>1. Introduction</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            Welcome to <strong>Hangbug</strong> ("we", "our", or "us"). Hangbug is a <strong>Programming & Technology Quiz and Learning Platform</strong> designed to help developers, students, and technology enthusiasts test, benchmark, and certify their programming knowledge across a wide variety of technical disciplines.
                        </p>
                        <p className="text-[var(--foreground-muted)]">
                            Through the Hangbug web and mobile applications, users can:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-[var(--foreground-muted)] pl-2">
                            <li className="flex items-center gap-2">• Create an account and manage profile details</li>
                            <li className="flex items-center gap-2">• Log in securely via credentials or OAuth</li>
                            <li className="flex items-center gap-2">• Explore programming & technology topics</li>
                            <li className="flex items-center gap-2">• Take interactive skill assessment quizzes</li>
                            <li className="flex items-center gap-2">• Submit answers and receive instant scores</li>
                            <li className="flex items-center gap-2">• View comprehensive quiz history & analytics</li>
                            <li className="flex items-center gap-2">• Earn verified certificates upon passing</li>
                            <li className="flex items-center gap-2">• View and share certificates externally</li>
                        </ul>
                        <p className="text-[var(--foreground-muted)]">
                            This Privacy Policy explains how information is collected, used, stored, and protected when you access or interact with Hangbug. By using our platform, you acknowledge the terms outlined in this document.
                        </p>
                    </section>

                    {/* Section 2: Information We Collect */}
                    <section id="section-2" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <Database size={20} className="text-[#193D35]" />
                            <h2>2. Information We Collect</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            We believe in data minimization. We only collect information that is strictly necessary to deliver, safeguard, and improve the Hangbug experience. Information collected falls into the following categories:
                        </p>

                        {/* Account Information */}
                        <div className="bg-[var(--muted-bg)]/50 border border-[var(--card-border)] rounded-xl p-4 sm:p-5 space-y-2">
                            <h3 className="font-semibold text-[var(--foreground)] text-sm flex items-center gap-2">
                                <Lock size={15} className="text-[#193D35]" /> Account Information
                            </h3>
                            <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                                When you create an account or update your profile, we may collect:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs text-[var(--foreground-muted)]">
                                <li><strong>Full Name or Display Name:</strong> Used to personalize your account and display on earned skill certificates.</li>
                                <li><strong>Email Address:</strong> Used for account creation, authentication, password resets, and critical service notifications.</li>
                                <li><strong>Password / Authentication Credentials:</strong> Passwords are cryptographically salted and hashed using industry-standard hashing algorithms (such as bcrypt) before storage. We never store plain-text passwords.</li>
                                <li><strong>Profile Information:</strong> Optional profile details such as avatar images, role or bio that you choose to provide in your account profile.</li>
                            </ul>
                        </div>

                        {/* Quiz Information */}
                        <div className="bg-[var(--muted-bg)]/50 border border-[var(--card-border)] rounded-xl p-4 sm:p-5 space-y-2">
                            <h3 className="font-semibold text-[var(--foreground)] text-sm flex items-center gap-2">
                                <CheckCircle2 size={15} className="text-[#193D35]" /> Quiz Information
                            </h3>
                            <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                                As you engage with quizzes on Hangbug, we record performance data to power your learning analytics and generate certificates:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs text-[var(--foreground-muted)]">
                                <li><strong>Quiz Attempts & Sessions:</strong> Timestamped records of quizzes initiated, sessions completed, and time taken per session.</li>
                                <li><strong>Answers Submitted:</strong> Selected answers to individual quiz questions, used to calculate scores and generate immediate explanations.</li>
                                <li><strong>Scores & XP:</strong> Numeric scores, accuracy percentages, experience points (XP), and leaderboard rankings.</li>
                                <li><strong>Quiz History:</strong> Historical logs of completed quizzes and progress tracking across technical categories.</li>
                                <li><strong>Completed Technologies:</strong> Record of topics, frameworks, and programming languages mastered.</li>
                                <li><strong>Certificates Earned:</strong> Official credentials awarded upon successfully passing quizzes, including verifiable certificate IDs and issuance dates.</li>
                            </ul>
                        </div>

                        {/* Technical Information */}
                        <div className="bg-[var(--muted-bg)]/50 border border-[var(--card-border)] rounded-xl p-4 sm:p-5 space-y-2">
                            <h3 className="font-semibold text-[var(--foreground)] text-sm flex items-center gap-2">
                                <Cpu size={15} className="text-[#193D35]" /> Technical Information
                            </h3>
                            <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                                Where applicable and automatically communicated through standard HTTP/HTTPS protocols or client requests:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs text-[var(--foreground-muted)]">
                                <li><strong>Device & Operating System Information:</strong> Device category (desktop, tablet, mobile), operating system type, and browser user-agent.</li>
                                <li><strong>App Version:</strong> Web client or mobile client version to ensure compatibility.</li>
                                <li><strong>IP Address:</strong> Processed for rate limiting, DDoS protection, geographic security validation, and fraud prevention.</li>
                                <li><strong>Crash & Error Information:</strong> Diagnostic stack traces and error logs utilized strictly to identify bugs and enhance platform stability.</li>
                                <li><strong>General Usage Information:</strong> Aggregated interaction metrics such as navigation flow and feature usage.</li>
                            </ul>
                        </div>

                        <div className="p-4 rounded-xl bg-[#F3E5C5]/30 border border-[#E2D0A6] text-xs text-[var(--foreground)]">
                            <p className="font-medium">
                                <em>Important:</em> We do not claim that Hangbug collects information that the existing application does not actually collect. Depending on how the service is used, certain technical information may be processed to maintain security and improve the service.
                            </p>
                        </div>
                    </section>

                    {/* Section 3: How We Use Information */}
                    <section id="section-3" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <Cpu size={20} className="text-[#193D35]" />
                            <h2>3. How We Use Information</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            Hangbug uses the collected personal and technical information strictly for legitimate operational, educational, and security purposes, including to:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-[var(--foreground-muted)]">
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>Account Management:</strong> Create, maintain, and administer user accounts and authentication sessions.
                            </li>
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>User Authentication:</strong> Authenticate identity and safeguard against unauthorized access or account compromise.
                            </li>
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>Quiz Delivery:</strong> Serve interactive quizzes and record submitted answers in real time.
                            </li>
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>Results & Scoring:</strong> Calculate quiz scores, answer breakdowns, and competency percentages.
                            </li>
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>History Maintenance:</strong> Maintain historical performance records, quiz activity logs, and learning statistics.
                            </li>
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>Certificate Generation:</strong> Issue tamper-resistant, verifiable completion certificates with unique verification IDs.
                            </li>
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>User Profiles:</strong> Enable users to view, customize, and showcase their educational milestones and badges.
                            </li>
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>Application Improvement:</strong> Analyze performance bottlenecks, refine question quality, and optimize user experience.
                            </li>
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>Technical Diagnostics:</strong> Diagnose server errors, debug crashes, and maintain reliable uptime.
                            </li>
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>Security & Abuse Prevention:</strong> Prevent brute-force attacks, cheating, bot exploitation, and abusive behavior.
                            </li>
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>Customer Support:</strong> Respond to user inquiries, troubleshooting requests, and feedback.
                            </li>
                            <li className="p-2.5 rounded-lg bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <strong>Legal Compliance:</strong> Comply with applicable statutory laws, regulatory requests, and enforce our terms.
                            </li>
                        </ul>
                    </section>

                    {/* Section 4: Data Storage and Security */}
                    <section id="section-4" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <ShieldCheck size={20} className="text-[#193D35]" />
                            <h2>4. Data Storage and Security</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            We take reasonable measures designed to protect personal information from unauthorized access, alteration, disclosure, or destruction.
                        </p>
                        <p className="text-[var(--foreground-muted)]">
                            These measures include:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[var(--foreground-muted)]">
                            <li><strong>Encryption in Transit:</strong> All data transmitted between your device and Hangbug is encrypted using standard Transport Layer Security (TLS/HTTPS).</li>
                            <li><strong>Credential Protection:</strong> Account passwords are never stored in plaintext; they are securely salted and hashed using robust cryptographic algorithms.</li>
                            <li><strong>Session Security:</strong> We utilize secure, tokenized authentication mechanisms (JSON Web Tokens) with expiration timers and protection against common web vulnerabilities.</li>
                            <li><strong>Database Isolation:</strong> Data is hosted in managed, firewall-protected database clusters with restricted network access and role-based permissions.</li>
                        </ul>
                        <p className="text-xs text-[var(--foreground-muted)] italic">
                            Please note that while we implement robust industry-standard safeguards, no method of transmission over the Internet or electronic storage is completely infallible, and absolute security cannot be guaranteed.
                        </p>
                    </section>

                    {/* Section 5: Third-Party Services */}
                    <section id="section-5" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <Layers size={20} className="text-[#193D35]" />
                            <h2>5. Third-Party Services</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            Hangbug may utilize trusted third-party service providers to facilitate infrastructure, hosting, databases, authentication, advertising, and operational maintenance. We only engage reputable service providers that adhere to rigorous security standards.
                        </p>
                        <div className="space-y-3">
                            <div className="p-3.5 rounded-xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)]">
                                <h3 className="font-semibold text-xs sm:text-sm text-[var(--foreground)]">Hosting Provider: Vercel</h3>
                                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                    Our web frontend and serverless API endpoints are deployed on Vercel Inc., which provides global edge delivery, automated routing, and SSL termination.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)]">
                                <h3 className="font-semibold text-xs sm:text-sm text-[var(--foreground)]">Database Provider: MongoDB Atlas</h3>
                                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                    User accounts, quiz session metadata, question repositories, and certificate records are stored in managed MongoDB Atlas cloud databases, accessed securely via Prisma ORM with encrypted connections.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)]">
                                <h3 className="font-semibold text-xs sm:text-sm text-[var(--foreground)]">Authentication Provider: JSON Web Tokens & Google Identity Services</h3>
                                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                    User sessions are verified via cryptographically signed JWT tokens. Where users opt for Google Sign-In, authentication tokens are validated via Google Identity Services (OAuth 2.0).
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)]">
                                <h3 className="font-semibold text-xs sm:text-sm text-[var(--foreground)]">Advertising Provider: Google AdSense</h3>
                                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                    Where enabled, advertisements are served through Google AdSense. Details regarding ad-related cookies and opt-outs are provided in Section 6.
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--foreground-muted)]">
                            These third-party providers have their own independent privacy policies governing how they handle data. We encourage users to review their respective policies.
                        </p>
                    </section>

                    {/* Section 6: Advertising */}
                    <section id="section-6" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <Megaphone size={20} className="text-[#193D35]" />
                            <h2>6. Advertising</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            Hangbug may display advertisements provided by third-party advertising partners, including <strong>Google AdSense</strong>, to help support the availability of free quizzes and learning resources.
                        </p>
                        <p className="text-[var(--foreground-muted)]">
                            Advertising providers may process certain information (such as your IP address, device type, browser information, and interactions with advertisements) to provide, personalize, measure, or improve advertisements, subject to their own policies and applicable user settings.
                        </p>
                        <div className="p-4 rounded-xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)] space-y-2">
                            <h3 className="font-semibold text-xs sm:text-sm text-[var(--foreground)]">Managing Your Advertising Preferences</h3>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                You can control or opt out of personalized advertising at any time through the following industry resources:
                            </p>
                            <ul className="space-y-1.5 text-xs text-[var(--foreground-muted)] pl-2">
                                <li>
                                    • <strong>Google Ads Settings:</strong> Visit{' '}
                                    <a
                                        href="https://adssettings.google.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#193D35] font-semibold underline inline-flex items-center gap-1"
                                    >
                                        Google Ads Settings <ExternalLink size={12} />
                                    </a>{' '}
                                    to manage your ad personalization settings.
                                </li>
                                <li>
                                    • <strong>Digital Advertising Alliance:</strong> Visit{' '}
                                    <a
                                        href="https://www.aboutads.info/choices/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#193D35] font-semibold underline inline-flex items-center gap-1"
                                    >
                                        AboutAds.info Choices <ExternalLink size={12} />
                                    </a>{' '}
                                    to opt out of interest-based ads from participating networks.
                                </li>
                                <li>
                                    • <strong>Network Advertising Initiative:</strong> Visit{' '}
                                    <a
                                        href="https://optout.networkadvertising.org/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#193D35] font-semibold underline inline-flex items-center gap-1"
                                    >
                                        NAI Consumer Opt-Out <ExternalLink size={12} />
                                    </a>.
                                </li>
                            </ul>
                        </div>
                        <p className="text-xs text-[var(--foreground-muted)]">
                            Opting out of personalized advertising does not mean you will no longer see ads; rather, advertisements will be contextual or non-personalized instead of tailored to your interests.
                        </p>
                    </section>

                    {/* Section 7: Cookies and Similar Technologies */}
                    <section id="section-7" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <Cookie size={20} className="text-[#193D35]" />
                            <h2>7. Cookies and Similar Technologies</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            Hangbug and our third-party partners may use cookies, web beacons, and local storage technologies when you access our web application.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <h3 className="font-bold text-[var(--foreground)] mb-1">Essential Cookies</h3>
                                <p className="text-[var(--foreground-muted)]">
                                    Required for core functions, including keeping you logged in securely and protecting against cross-site request forgery.
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <h3 className="font-bold text-[var(--foreground)] mb-1">Preference Storage</h3>
                                <p className="text-[var(--foreground-muted)]">
                                    Local storage entries that remember your interface preferences (such as light or dark theme choices).
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-[var(--muted-bg)]/40 border border-[var(--card-border)]">
                                <h3 className="font-bold text-[var(--foreground)] mb-1">Advertising Cookies</h3>
                                <p className="text-[var(--foreground-muted)]">
                                    Set by advertising partners (such as Google) to deliver relevant advertisements and assess campaign effectiveness.
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--foreground-muted)]">
                            Most web browsers automatically accept cookies by default. You can configure your browser settings to reject cookies or prompt you before accepting cookies. Disabling essential cookies may impair certain features of the platform (such as logging in).
                        </p>
                    </section>

                    {/* Section 8: Data Retention */}
                    <section id="section-8" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <Clock size={20} className="text-[#193D35]" />
                            <h2>8. Data Retention</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            We retain personal information for as long as reasonably necessary to fulfill the purposes described in this Privacy Policy, including to:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-[var(--foreground-muted)]">
                            <li>Provide and maintain the Hangbug service and quiz functionality.</li>
                            <li>Maintain active user accounts and authentication sessions.</li>
                            <li>Maintain verifiable quiz attempt records and earned skill certificates.</li>
                            <li>Resolve disputes, troubleshoot technical errors, and investigate policy breaches.</li>
                            <li>Prevent fraudulent activity, spam, and platform abuse.</li>
                            <li>Comply with applicable legal, accounting, or regulatory requirements.</li>
                            <li>Enforce our applicable agreements and terms of service.</li>
                        </ul>
                        <p className="text-[var(--foreground-muted)] text-xs sm:text-sm">
                            When personal information is no longer needed or when an account deletion request is finalized, the data is either permanently deleted from our active production systems or anonymized so that it can no longer identify an individual user.
                        </p>
                    </section>

                    {/* Section 9: Account and Data Deletion (Google Play Compliance) */}
                    <section id="section-9" className="bg-[var(--card-bg)] border-2 border-[#193D35]/30 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[#193D35]">
                            <Trash2 size={22} />
                            <h2>9. Account and Data Deletion</h2>
                        </div>
                        <div className="p-3 rounded-lg bg-[#F3E5C5]/40 border border-[#E2D0A6] text-xs font-medium text-[#193D35]">
                            Google Play Policy & User Rights Compliance: Users have the right to request deletion of their Hangbug account and all associated personal data at any time.
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            We respect your right to privacy and complete data ownership. Hangbug offers straightforward methods for users to request deletion of their account and all associated personal records:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Method 1: In-App Self-Service */}
                            <div className="p-4 rounded-xl bg-[var(--muted-bg)]/60 border border-[var(--card-border)] space-y-2.5">
                                <h3 className="font-bold text-xs sm:text-sm text-[var(--foreground)] flex items-center gap-1.5">
                                    <CheckCircle2 size={16} className="text-[#193D35]" /> Method 1: In-App Deletion
                                </h3>
                                <p className="text-xs text-[var(--foreground-muted)]">
                                    You can delete your account directly inside the Hangbug web platform:
                                </p>
                                <ol className="list-decimal list-inside space-y-1 text-xs text-[var(--foreground-muted)]">
                                    <li>Log in to your Hangbug account.</li>
                                    <li>Navigate to <strong>Dashboard &gt; Settings</strong> (<Link to="/dashboard/settings" className="text-[#193D35] font-semibold underline">Settings</Link>).</li>
                                    <li>Scroll to the <strong>"Delete Account"</strong> danger zone.</li>
                                    <li>Click <strong>"Delete My Account"</strong> and confirm your choice.</li>
                                </ol>
                                <p className="text-[11px] text-[var(--foreground-muted)] italic">
                                    This immediately triggers our automated deletion API endpoint (<code className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-[10px]">DELETE /api/auth/delete-account</code>) and logs you out.
                                </p>
                            </div>

                            {/* Method 2: Email Request */}
                            <div className="p-4 rounded-xl bg-[var(--muted-bg)]/60 border border-[var(--card-border)] space-y-2.5">
                                <h3 className="font-bold text-xs sm:text-sm text-[var(--foreground)] flex items-center gap-1.5">
                                    <Mail size={16} className="text-[#193D35]" /> Method 2: Email Deletion Request
                                </h3>
                                <p className="text-xs text-[var(--foreground-muted)]">
                                    If you cannot access your account or are using the mobile app, you can submit an account deletion request directly to our support team:
                                </p>
                                <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-xs">
                                    <p className="font-semibold text-[var(--foreground)]">Account deletion request:</p>
                                    <a
                                        href={`mailto:${supportEmail}?subject=Account%20Deletion%20Request`}
                                        className="text-[#193D35] font-bold underline hover:opacity-80 transition-opacity text-sm inline-block mt-1"
                                    >
                                        {supportEmail}
                                    </a>
                                </div>
                                <p className="text-[11px] text-[var(--foreground-muted)]">
                                    Please send the email from the address registered with your Hangbug account and include <em>"Account Deletion Request"</em> in the subject line.
                                </p>
                            </div>
                        </div>

                        {/* What Happens Upon Deletion */}
                        <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
                            <h3 className="font-semibold text-xs sm:text-sm text-[var(--foreground)]">What data is deleted?</h3>
                            <ul className="list-disc list-inside space-y-1 text-xs text-[var(--foreground-muted)]">
                                <li>Your account profile (name, email address, password hash, profile avatar, and bio).</li>
                                <li>All quiz submission records, session histories, scores, accuracy ratings, and earned XP.</li>
                                <li>Associated certificates and verification credentials.</li>
                                <li>Active session tokens and authentication cookies are invalidated immediately.</li>
                            </ul>
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                Once deleted, this action is permanent and cannot be undone. Any certificates earned will no longer be verifiable under that account.
                            </p>
                        </div>
                    </section>

                    {/* Section 10: Children's Privacy */}
                    <section id="section-10" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <Baby size={20} className="text-[#193D35]" />
                            <h2>10. Children's Privacy</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            Hangbug does not knowingly collect personal information from children where prohibited by applicable law. Our services are educational in nature and designed for developers, students, and general audiences seeking technical skill assessment.
                        </p>
                        <p className="text-[var(--foreground-muted)]">
                            If we become aware that we have inadvertently collected personal information from a child without required parental or legal guardian consent, we take immediate steps to remove such information and terminate the associated account. Parents or guardians who believe their child has provided personal information may contact us at{' '}
                            <a href={`mailto:${supportEmail}`} className="text-[#193D35] font-semibold underline">
                                {supportEmail}
                            </a>.
                        </p>
                    </section>

                    {/* Section 11: International Data Processing */}
                    <section id="section-11" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <Globe2 size={20} className="text-[#193D35]" />
                            <h2>11. International Data Processing</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            Hangbug is operated using cloud-based infrastructure (including Vercel edge servers and MongoDB Atlas cloud clusters). Depending on your geographic location, your information may be transferred to, processed, and stored on servers located outside of your home state, province, or country, where data protection laws may differ from those in your jurisdiction.
                        </p>
                        <p className="text-[var(--foreground-muted)]">
                            When data is transferred across borders, we implement reasonable administrative, technical, and physical safeguards designed to ensure that your personal information receives an adequate level of data protection in accordance with this Privacy Policy.
                        </p>
                    </section>

                    {/* Section 12: Changes to This Privacy Policy */}
                    <section id="section-12" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <RefreshCw size={20} className="text-[#193D35]" />
                            <h2>12. Changes to This Privacy Policy</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            Hangbug may update this Privacy Policy periodically to reflect enhancements, new application features, legal obligations, or operational adjustments.
                        </p>
                        <p className="text-[var(--foreground-muted)]">
                            When updates are made, we will revise the <strong>"Last Updated"</strong> date displayed at the top and bottom of this document:
                        </p>
                        <div className="p-3 rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] font-medium">
                            Current Version: <strong>Last Updated: {lastUpdated}</strong>
                        </div>
                        <p className="text-[var(--foreground-muted)] text-xs sm:text-sm">
                            We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your data. Your continued use of Hangbug after any revisions constitutes your acceptance of the updated terms.
                        </p>
                    </section>

                    {/* Section 13: Contact Us */}
                    <section id="section-13" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                            <Mail size={20} className="text-[#193D35]" />
                            <h2>13. Contact Us</h2>
                        </div>
                        <p className="text-[var(--foreground-muted)]">
                            If you have questions, feedback, or requests regarding this Privacy Policy, your personal information, or our data handling practices, please contact our privacy and support team:
                        </p>
                        <div className="p-4 rounded-xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)] space-y-2">
                            <p className="text-xs font-semibold text-[var(--foreground)]">Hangbug Support & Privacy Team</p>
                            <p className="text-sm font-bold text-[#193D35]">
                                Email:{' '}
                                <a
                                    href={`mailto:${supportEmail}`}
                                    className="underline hover:opacity-80 transition-opacity"
                                >
                                    {supportEmail}
                                </a>
                            </p>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Web:{' '}
                                <Link to="/contact" className="text-[#193D35] underline font-semibold">
                                    Contact Support Page
                                </Link>
                            </p>
                        </div>
                        <p className="text-xs text-[var(--foreground-muted)]">
                            We endeavor to respond to all legitimate privacy inquiries and data requests in a prompt and professional manner.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
