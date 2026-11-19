import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
    const year = new Date().getFullYear();
    const { user } = useAuth();

    return (
        <footer className="w-full border-t border-[var(--card-border)] bg-[var(--card-bg)] pt-10 pb-6 px-4 sm:px-6 lg:px-8 shrink-0 mt-auto transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Main Links Grid: Responsive across Mobile, Tablet & Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Column 1: Brand & Overview */}
                    <div className="sm:col-span-2 lg:col-span-1 space-y-3">
                        <Link to="/" className="inline-block" aria-label="Hangbug Home">
                            <BrandLogo size="md" loading="lazy" />
                        </Link>
                        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                            Test your programming and web development skills with Hangbug. Practice interactive tech quizzes, play coding games, track your progress, and earn score-based certificates.
                        </p>
                        <div className="pt-2 flex flex-col space-y-1.5 text-xs text-[var(--foreground-muted)] font-medium">
                            <Link to="/certificate/view" rel="nofollow" className="hover:text-[var(--foreground)] transition-colors">Verify Certificate</Link>
                            <Link to="/leaderboard" className="hover:text-[var(--foreground)] transition-colors">Global Leaderboard</Link>
                            {user ? (
                                <Link to="/dashboard" className="hover:text-[var(--foreground)] transition-colors">Developer Dashboard</Link>
                            ) : (
                                <Link to="/login" className="hover:text-[var(--foreground)] transition-colors">Account Sign In</Link>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Technology Quiz Tracks */}
                    <div className="space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Technologies</p>
                        <ul className="space-y-1.5 text-xs text-[var(--foreground-muted)] font-medium">
                            <li><Link to="/technologies" className="hover:text-[var(--foreground)] transition-colors font-semibold text-[var(--foreground)]">All Technologies</Link></li>
                            <li><Link to="/technologies/html" className="hover:text-[var(--foreground)] transition-colors">HTML Quizzes</Link></li>
                            <li><Link to="/technologies/css" className="hover:text-[var(--foreground)] transition-colors">CSS Quizzes</Link></li>
                            <li><Link to="/technologies/javascript" className="hover:text-[var(--foreground)] transition-colors">JavaScript Quizzes</Link></li>
                            <li><Link to="/technologies/react" className="hover:text-[var(--foreground)] transition-colors">React.js Quizzes</Link></li>
                            <li><Link to="/technologies/python" className="hover:text-[var(--foreground)] transition-colors">Python Quizzes</Link></li>
                            <li><Link to="/technologies/php" className="hover:text-[var(--foreground)] transition-colors">PHP Quizzes</Link></li>
                            <li><Link to="/technologies/laravel" className="hover:text-[var(--foreground)] transition-colors">Laravel Quizzes</Link></li>
                            <li><Link to="/technologies/mysql" className="hover:text-[var(--foreground)] transition-colors">MySQL Quizzes</Link></li>
                            <li><Link to="/technologies/mongodb" className="hover:text-[var(--foreground)] transition-colors">MongoDB Quizzes</Link></li>
                            <li><Link to="/technologies/flutter" className="hover:text-[var(--foreground)] transition-colors">Flutter Quizzes</Link></li>
                            <li><Link to="/technologies/dart" className="hover:text-[var(--foreground)] transition-colors">Dart Quizzes</Link></li>
                            <li><Link to="/technologies/programming-fundamentals" className="hover:text-[var(--foreground)] transition-colors">Fundamentals &amp; OOP</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Coding & Typing Games */}
                    <div className="space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Coding Games</p>
                        <ul className="space-y-1.5 text-xs text-[var(--foreground-muted)] font-medium">
                            <li><Link to="/games" className="hover:text-[var(--foreground)] transition-colors font-semibold text-[var(--foreground)]">All Developer Games</Link></li>
                            <li><Link to="/games/code-puzzle" className="hover:text-[var(--foreground)] transition-colors">Code Puzzle</Link></li>
                            <li><Link to="/games/find-the-bug" className="hover:text-[var(--foreground)] transition-colors">Find The Bug</Link></li>
                            <li><Link to="/games/output-predictor" className="hover:text-[var(--foreground)] transition-colors">Output Predictor</Link></li>
                            <li><Link to="/games/sql-challenge" className="hover:text-[var(--foreground)] transition-colors">SQL Challenge</Link></li>
                            <li><Link to="/games/speed-typing" className="hover:text-[var(--foreground)] transition-colors">Speed Typing</Link></li>
                            <li><Link to="/games/code-typing" className="hover:text-[var(--foreground)] transition-colors">Code Typing</Link></li>
                            <li><Link to="/games/word-rain" className="hover:text-[var(--foreground)] transition-colors">Word Rain</Link></li>
                            <li><Link to="/games/memory-match" className="hover:text-[var(--foreground)] transition-colors">Coding Memory Match</Link></li>
                            <li><Link to="/games/complete-the-code" className="hover:text-[var(--foreground)] transition-colors">Complete The Code</Link></li>
                            <li><Link to="/games/code-scramble" className="hover:text-[var(--foreground)] transition-colors">Code Scramble</Link></li>
                            <li><Link to="/games/missing-code" className="hover:text-[var(--foreground)] transition-colors">Missing Code</Link></li>
                            <li><Link to="/games/syntax-typing" className="hover:text-[var(--foreground)] transition-colors">Syntax Typing</Link></li>
                            <li><Link to="/games/error-free-typing" className="hover:text-[var(--foreground)] transition-colors">Error-Free Typing</Link></li>
                            <li><Link to="/games/sixty-second-challenge" className="hover:text-[var(--foreground)] transition-colors">60-Second Challenge</Link></li>
                            <li><Link to="/games/csharp-oop-challenge" className="hover:text-[var(--foreground)] transition-colors">C# OOP Challenge</Link></li>
                            <li><Link to="/games/csharp-collections-challenge" className="hover:text-[var(--foreground)] transition-colors">C# Collections Challenge</Link></li>
                            <li><Link to="/games/csharp-linq-challenge" className="hover:text-[var(--foreground)] transition-colors">C# LINQ Challenge</Link></li>
                            <li><Link to="/games/csharp-exception-handling" className="hover:text-[var(--foreground)] transition-colors">C# Exception Handling</Link></li>
                            <li><Link to="/games/csharp-quiz-challenge" className="hover:text-[var(--foreground)] transition-colors">C# Quiz Challenge</Link></li>
                            <li><Link to="/games/logic-builder" className="hover:text-[var(--foreground)] transition-colors">Logic Builder</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Published Tutorials & Guides */}
                    <div className="space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Tutorials &amp; Guides</p>
                        <ul className="space-y-1.5 text-xs text-[var(--foreground-muted)] font-medium">
                            <li><Link to="/blog" className="hover:text-[var(--foreground)] transition-colors font-semibold text-[var(--foreground)]">All Blog Articles</Link></li>
                            <li><Link to="/blog/html-tutorial-for-beginners" className="hover:text-[var(--foreground)] transition-colors">HTML Tutorial for Beginners</Link></li>
                            <li><Link to="/blog/css-basics-beginners-guide" className="hover:text-[var(--foreground)] transition-colors">CSS Basics Beginner's Guide</Link></li>
                            <li><Link to="/blog/javascript-fundamentals-beginners-guide" className="hover:text-[var(--foreground)] transition-colors">JavaScript Fundamentals</Link></li>
                            <li><Link to="/blog/php-programming-beginners-guide" className="hover:text-[var(--foreground)] transition-colors">PHP Programming Guide</Link></li>
                            <li><Link to="/blog/laravel-basics-mvc-architecture" className="hover:text-[var(--foreground)] transition-colors">Laravel MVC Architecture</Link></li>
                            <li><Link to="/blog/flutter-dart-mobile-app-development" className="hover:text-[var(--foreground)] transition-colors">Flutter &amp; Dart Mobile Guide</Link></li>
                        </ul>
                    </div>

                    {/* Column 5: Company & Legal */}
                    <div className="space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Company &amp; Legal</p>
                        <ul className="space-y-1.5 text-xs text-[var(--foreground-muted)] font-medium">
                            <li><Link to="/about" className="hover:text-[var(--foreground)] transition-colors">About Hangbug</Link></li>
                            <li><Link to="/contact" className="hover:text-[var(--foreground)] transition-colors">Contact Support</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-[var(--foreground)] transition-colors">Terms of Service</Link></li>
                            <li><Link to="/delete-account" className="hover:text-red-500 transition-colors">Delete Account</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--foreground-muted)]">
                    <p>© {year} Hangbug. All rights reserved.</p>

                    <div className="flex items-center gap-3">
                        <a
                            href="mailto:support@hangbug.com"
                            aria-label="Email Hangbug Support"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[#193D35] hover:border-[#193D35] transition-all"
                        >
                            <Mail size={14} />
                            <span>support@hangbug.com</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
