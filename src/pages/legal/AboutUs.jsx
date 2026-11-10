import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    Code2,
    Award,
    Target,
    Gamepad2,
    BarChart3,
    CheckCircle2,
    BookOpen,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BrandLogo from '../../components/BrandLogo';
import usePageSeo from '../../hooks/usePageSeo';

const COVERED_TECHNOLOGIES = [
    { name: 'HTML', slug: 'html', group: 'Frontend & Web Markup' },
    { name: 'CSS', slug: 'css', group: 'Styling & Responsive Layouts' },
    { name: 'JavaScript', slug: 'javascript', group: 'Frontend & Full-Stack Scripting' },
    { name: 'Bootstrap', slug: null, group: 'Frontend UI Framework' },
    { name: 'jQuery', slug: null, group: 'DOM & Scripting Library' },
    { name: 'React.js', slug: 'react', group: 'Component UI Library' },
    { name: 'PHP', slug: 'php', group: 'Server-Side Web Development' },
    { name: 'Laravel', slug: 'laravel', group: 'PHP MVC Framework' },
    { name: 'Node.js & Express.js', slug: null, group: 'JavaScript Backend Runtime' },
    { name: 'MySQL & SQL Server', slug: 'mysql', group: 'Relational Databases' },
    { name: 'MongoDB', slug: 'mongodb', group: 'NoSQL Document Database' },
    { name: 'Flutter', slug: 'flutter', group: 'Cross-Platform Mobile UI' },
    { name: 'Dart', slug: 'dart', group: 'Client-Optimized Language' },
    { name: 'C#', slug: null, group: 'Object-Oriented & .NET Programming' },
    { name: 'Python', slug: 'python', group: 'General-Purpose Programming' },
    { name: 'Agile, DevOps, Azure & Data Tools', slug: 'programming-fundamentals', group: 'Engineering & Analytics' }
];

export default function AboutUs() {
    usePageSeo({
        title: 'About Hangbug – Technology Learning, Tech Quizzes & Skill Assessment Platform',
        description: 'Test your programming and web development skills with Hangbug. Practice interactive tech quizzes, play coding games, track your progress, and earn score-based certificates.',
        canonicalPath: '/about'
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
                {/* Back Link */}
                <div className="mb-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[#193D35] transition-colors">
                        <ArrowLeft size={14} /> Back to Home
                    </Link>
                </div>

                {/* Hero Header */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-12 mb-10 shadow-sm text-center relative overflow-hidden">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3E5C5] text-[#193D35] text-xs font-bold border border-[#E2D0A6] mb-4">
                        <Sparkles size={14} /> Official Platform Overview
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-[var(--foreground)] tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
                        About Hangbug – <span className="text-[#193D35]">Technology Learning &amp; Skill Assessment Platform</span>
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--foreground-muted)] max-w-2xl mx-auto leading-relaxed">
                        Test your programming and web development skills with Hangbug. Practice interactive tech quizzes, play coding games, track your progress, and earn score-based certificates.
                    </p>
                </div>

                {/* Section 1: What is Hangbug? */}
                <section aria-labelledby="what-is-hangbug" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 mb-10 space-y-4 shadow-xs">
                    <h2 id="what-is-hangbug" className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">
                        What is Hangbug?
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                        <strong>Hangbug</strong> (<a href="https://www.hangbug.com/" className="text-[#193D35] font-semibold underline">https://www.hangbug.com/</a>) is an online technology learning and skill assessment platform where students, software developers, and programming enthusiasts can practice technology-related multiple-choice quizzes (MCQs), test their programming and web development knowledge, play interactive coding and typing games, track their quiz performance, and earn score-based completion certificates.
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                        Hangbug is strictly an educational programming practice and skill assessment platform. It is not a software bug-tracking tool, issue tracker, or cybersecurity vulnerability reporting service.
                    </p>
                </section>

                {/* Pillars Grid */}
                <section aria-labelledby="core-platform-pillars" className="mb-12">
                    <h2 id="core-platform-pillars" className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)] mb-6 text-center">
                        Core Platform Pillars
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-[#193D35] text-[#FCFAF4] flex items-center justify-center font-bold">
                                <Code2 size={20} />
                            </div>
                            <h3 className="text-base font-display font-bold text-[var(--foreground)]">Interactive MCQ Tech Quizzes</h3>
                            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                Practice multi-session multiple-choice quizzes across web development, backend programming, databases, and mobile technologies with instant answer feedback.
                            </p>
                        </div>

                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-[#193D35] text-[#FCFAF4] flex items-center justify-center font-bold">
                                <Gamepad2 size={20} />
                            </div>
                            <h3 className="text-base font-display font-bold text-[var(--foreground)]">Coding &amp; Typing Games</h3>
                            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                Sharpen logic and keyboard speed with browser-based coding puzzles, syntax bug-finding challenges, output predictors, SQL query challenges, and developer typing drills.
                            </p>
                        </div>

                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-[#193D35] text-[#FCFAF4] flex items-center justify-center font-bold">
                                <Award size={20} />
                            </div>
                            <h3 className="text-base font-display font-bold text-[var(--foreground)]">Score-Based Certificates</h3>
                            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                Score 80% or higher on technology quiz assessments to unlock score-based completion certificates with unique verification IDs, QR codes, and LinkedIn sharing.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 2: How Hangbug Works */}
                <section aria-labelledby="how-hangbug-works" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 mb-10 space-y-6 shadow-xs">
                    <div>
                        <h2 id="how-hangbug-works" className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">
                            How Hangbug Works
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1">
                            Hangbug combines structured quiz sessions, interactive games, and performance tracking into a straightforward learning workflow:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)] space-y-2">
                            <div className="flex items-center gap-2 text-xs font-extrabold text-[#193D35]">
                                <BookOpen size={15} /> Step 1 · Select a Technology Track
                            </div>
                            <h3 className="text-sm font-display font-bold text-[var(--foreground)]">Choose Your Topic &amp; Session</h3>
                            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                Browse the <Link to="/technologies" className="text-[#193D35] font-semibold underline">Technologies directory</Link> and pick a programming language or framework. You can practice individual sessions or take a complete track assessment.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)] space-y-2">
                            <div className="flex items-center gap-2 text-xs font-extrabold text-[#193D35]">
                                <CheckCircle2 size={15} /> Step 2 · Practice Interactive MCQ Quizzes
                            </div>
                            <h3 className="text-sm font-display font-bold text-[var(--foreground)]">Answer Questions &amp; Save Progress</h3>
                            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                Answer multiple-choice questions with instant verification. Logged-in users can save in-progress quiz attempts and resume from where they left off on web or mobile.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)] space-y-2">
                            <div className="flex items-center gap-2 text-xs font-extrabold text-[#193D35]">
                                <BarChart3 size={15} /> Step 3 · Track Performance &amp; Progress
                            </div>
                            <h3 className="text-sm font-display font-bold text-[var(--foreground)]">Review Accuracy &amp; Leaderboard Rank</h3>
                            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                View detailed score breakdowns, accuracy percentages, completed quiz history, XP points, and rankings on the <Link to="/leaderboard" className="text-[#193D35] font-semibold underline">Global Leaderboard</Link>.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)] space-y-2">
                            <div className="flex items-center gap-2 text-xs font-extrabold text-[#193D35]">
                                <Award size={15} /> Step 4 · Earn &amp; Share Certificates
                            </div>
                            <h3 className="text-sm font-display font-bold text-[var(--foreground)]">Download PDF or Share on LinkedIn</h3>
                            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                Passing a quiz assessment with a score of 80% or above generates a score-based completion certificate that you can download or share on LinkedIn.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 3: Technology Quiz Categories */}
                <section aria-labelledby="technology-quiz-categories" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 mb-10 space-y-5 shadow-xs">
                    <div>
                        <h2 id="technology-quiz-categories" className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">
                            Technology Quiz Categories Covered
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1 leading-relaxed">
                            Hangbug offers technology learning and interactive practice across web development, backend programming, databases, and mobile application development, including HTML, CSS, JavaScript, Bootstrap, jQuery, PHP, Laravel, MySQL, Flutter, Dart, C#, and additional programming technologies:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {COVERED_TECHNOLOGIES.map((tech) => (
                            <div
                                key={tech.name}
                                className="p-3.5 rounded-2xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)] flex flex-col justify-between gap-1"
                            >
                                {tech.slug ? (
                                    <Link to={`/technologies/${tech.slug}`} className="text-xs sm:text-sm font-bold text-[var(--foreground)] hover:text-[#193D35] transition-colors">
                                        {tech.name}
                                    </Link>
                                ) : (
                                    <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                                        {tech.name}
                                    </span>
                                )}
                                <span className="text-[11px] text-[var(--foreground-muted)]">{tech.group}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 4: Coding & Typing Games + Score-Based Certificates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <section aria-labelledby="coding-and-typing-games" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
                        <h2 id="coding-and-typing-games" className="text-lg sm:text-xl font-display font-extrabold text-[var(--foreground)]">
                            Coding and Typing Games
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                            In addition to MCQ quizzes, the <Link to="/games" className="text-[#193D35] font-semibold underline">Hangbug Games Hub</Link> features interactive browser games designed for developers and students:
                        </p>
                        <ul className="space-y-1.5 text-xs text-[var(--foreground-muted)]">
                            <li>• <strong>Coding Games:</strong> Code Puzzle, Find the Bug, Output Predictor, Code Scramble, Missing Code, Logic Builder, SQL Challenge, and Coding Memory Match.</li>
                            <li>• <strong>Typing Games:</strong> Speed Typing, Code Typing, 60-Second Challenge, Error-Free Typing, Syntax Typing, and Word Rain with live WPM and accuracy metrics.</li>
                        </ul>
                    </section>

                    <section aria-labelledby="score-based-certificates" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
                        <h2 id="score-based-certificates" className="text-lg sm:text-xl font-display font-extrabold text-[var(--foreground)]">
                            Score-Based Certificates &amp; LinkedIn Sharing
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                            Learners who complete a technology quiz with a score of <strong>80% or higher</strong> earn a Hangbug Certificate of Completion containing their name, technology category, score percentage, issue date, and verification ID.
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                            Certificates can be verified online at <Link to="/certificate/view" className="text-[#193D35] font-semibold underline">/certificate/view</Link> and shared directly on LinkedIn. Hangbug certificates represent platform-based quiz completion and self-assessment achievements.
                        </p>
                    </section>
                </div>

                {/* Section 5: Student and Developer Learning Benefits & Getting Started */}
                <section aria-labelledby="learning-benefits" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 mb-12 flex flex-col md:flex-row items-center gap-8 shadow-xs">
                    <div className="flex-1 space-y-3">
                        <h2 id="learning-benefits" className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">
                            Student &amp; Developer Learning Benefits — How to Get Started
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                            Active self-assessment helps computer science students and software developers identify knowledge gaps, reinforce syntax memory, and prepare for technical interviews. Getting started on Hangbug is free: explore the public <Link to="/technologies" className="text-[#193D35] font-semibold underline">technology quiz tracks</Link> or <Link to="/games" className="text-[#193D35] font-semibold underline">coding games</Link>, or create an account to save quiz progress, track your history, and earn score-based certificates.
                        </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-center gap-3">
                        <BrandLogo size="lg" />
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <Link to="/technologies" className="btn-primary text-xs py-2.5 px-5 rounded-xl">
                                Explore Technologies <ArrowRight size={14} />
                            </Link>
                            <Link to="/games" className="btn-secondary text-xs py-2.5 px-4 rounded-xl">
                                Play Games
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
