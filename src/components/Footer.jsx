import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-[var(--card-border)] bg-[var(--card-bg)] pt-8 pb-6 px-4 sm:px-6 lg:px-8 shrink-0 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Main Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand & Description */}
                    <div className="md:col-span-2 space-y-3">
                        <Link to="/" className="inline-block">
                            <BrandLogo size="md" />
                        </Link>
                        <p className="text-xs text-[var(--foreground-muted)] max-w-sm leading-relaxed">
                            HangBug is an interactive developer quiz and certification platform. Practice web technologies, evaluate your skills, and earn verified credentials.
                        </p>
                    </div>

                    {/* Platform Links */}
                    <div className="space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Platform</p>
                        <ul className="space-y-2 text-xs text-[var(--foreground-muted)] font-medium">
                            <li><Link to="/technologies" className="hover:text-[var(--foreground)] transition-colors">Technologies</Link></li>
                            <li><Link to="/leaderboard" className="hover:text-[var(--foreground)] transition-colors">Global Leaderboard</Link></li>
                            <li><Link to="/certificate/view" className="hover:text-[var(--foreground)] transition-colors">Verify Certificate</Link></li>
                            <li><Link to="/dashboard" className="hover:text-[var(--foreground)] transition-colors">Developer Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Company & Legal */}
                    <div className="space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Company & Legal</p>
                        <ul className="space-y-2 text-xs text-[var(--foreground-muted)] font-medium">
                            <li><Link to="/about" className="hover:text-[var(--foreground)] transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-[var(--foreground)] transition-colors">Contact Support</Link></li>
                            <li><Link to="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-[var(--foreground)] transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--foreground-muted)]">
                    <p>© {year} HangBug. All rights reserved.</p>

                    <div className="flex items-center gap-3">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className="w-8 h-8 rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[#193D35] hover:border-[#193D35] transition-all"
                        >
                            <Github size={14} />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                            className="w-8 h-8 rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[#193D35] hover:border-[#193D35] transition-all"
                        >
                            <Linkedin size={14} />
                        </a>
                        <a
                            href="mailto:support@hangbug.com"
                            aria-label="Email Support"
                            className="w-8 h-8 rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[#193D35] hover:border-[#193D35] transition-all"
                        >
                            <Mail size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
