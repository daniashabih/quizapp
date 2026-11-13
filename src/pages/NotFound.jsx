import { Link } from 'react-router-dom';
import { Home, Compass, BookOpen, Gamepad2, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BrandLogo from '../components/BrandLogo';
import usePageSeo from '../hooks/usePageSeo';

export default function NotFound() {
    usePageSeo({
        title: '404: Page Not Found — HangBug',
        description: "The page you are looking for doesn't exist, has been removed, or was moved to another URL.",
        noindex: true
    });

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center">
                <div className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-500/20">
                        <Compass size={14} className="animate-spin text-red-500" style={{ animationDuration: '6s' }} />
                        <span>HTTP 404 — Page Not Found</span>
                    </div>

                    {/* 404 Big Display */}
                    <div className="space-y-2">
                        <h1 className="text-6xl sm:text-7xl font-display font-black tracking-tight text-[var(--foreground)]">
                            404
                        </h1>
                        <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--foreground)]">
                            Oops! Lost in the Code?
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-sm mx-auto leading-relaxed">
                            The page or resource you are trying to access does not exist, has been moved, or is temporarily unavailable.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/"
                            className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs py-3 px-6 rounded-xl font-bold shadow-xs"
                        >
                            <Home size={15} /> Return to Home
                        </Link>
                        <Link
                            to="/technologies"
                            className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs py-3 px-5 rounded-xl font-semibold border border-[var(--card-border)]"
                        >
                            <BookOpen size={15} /> Explore Quizzes
                        </Link>
                    </div>

                    {/* Help hint */}
                    <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-center gap-4 text-xs text-[var(--foreground-muted)]">
                        <Link to="/games" className="inline-flex items-center gap-1.5 hover:text-[#193D35] dark:hover:text-emerald-400 transition-colors">
                            <Gamepad2 size={14} /> Play Coding Games
                        </Link>
                        <span>•</span>
                        <Link to="/contact" className="hover:text-[#193D35] dark:hover:text-emerald-400 transition-colors">
                            Report Broken Link
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
