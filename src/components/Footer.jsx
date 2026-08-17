import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart, Code2 } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="border-t border-[var(--card-border)] bg-[var(--card-bg)] py-3 px-4 sm:px-6 lg:px-8 shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--foreground-muted)]">
                <div className="flex items-center gap-3">
                    <Link to="/">
                        <BrandLogo size="sm" />
                    </Link>
                    <span className="hidden sm:inline text-[var(--card-border)]">|</span>
                    <p>© {year} HangBug. All rights reserved.</p>
                </div>

                <div className="flex items-center gap-6 font-medium">
                    <Link to="/technologies" className="hover:text-[var(--foreground)] transition-colors">Technologies</Link>
                    <Link to="/leaderboard" className="hover:text-[var(--foreground)] transition-colors">Leaderboard</Link>
                    <Link to="/certificate/view" className="hover:text-[var(--foreground)] transition-colors">Certificates</Link>
                    <Link to="/dashboard" className="hover:text-[var(--foreground)] transition-colors">Dashboard</Link>
                </div>

                <div className="flex items-center gap-2">
                    {[
                        { icon: Github, href: '#' },
                        { icon: Twitter, href: '#' },
                        { icon: Linkedin, href: '#' },
                        { icon: Mail, href: '#' },
                    ].map((s, i) => (
                        <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[#059669] hover:border-[#059669] transition-all">
                            <s.icon size={13} />
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}

