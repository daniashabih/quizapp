import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Menu,
    X,
    LayoutDashboard,
    LogOut,
    ChevronRight,
    Award,
    User,
    Settings,
    BookOpen,
    Trophy,
    Home,
    ShieldCheck,
    Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Quizzes', path: '/technologies', icon: BookOpen },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        ...(user ? [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Certificates', path: '/dashboard/certificates', icon: Award },
        ] : []),
        ...(isAdmin ? [
            { name: 'Admin Panel', path: '/admin', icon: ShieldCheck },
            { name: 'SEO & Growth', path: '/dashboard/seo', icon: Globe },
        ] : []),
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
                    scrolled
                        ? 'bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--card-border)] shadow-xs'
                        : 'bg-transparent'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center group">
                        <BrandLogo variant="compact" size="md" />
                    </Link>

                    {/* Desktop Links */}
                    <nav className="hidden md:flex items-center gap-1 bg-[var(--muted-bg)]/80 p-1 rounded-xl border border-[var(--card-border)]">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        active
                                            ? 'bg-[var(--card-bg)] text-[#193D35] dark:text-emerald-300 shadow-2xs border border-[var(--card-border)]'
                                            : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    <Icon size={14} className={active ? 'text-[#193D35] dark:text-emerald-400' : ''} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-2.5">
                        <ThemeToggle />

                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/dashboard/profile"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#193D35] dark:hover:border-emerald-400 transition-all text-xs font-semibold"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-[#193D35] flex items-center justify-center text-white text-[11px] font-bold">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="max-w-[110px] truncate">{user.name}</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    title="Logout"
                                    className="p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-red-500 hover:border-red-500/30 transition-all cursor-pointer"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn-primary text-xs py-2 px-4">
                                    Get Started <ChevronRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex items-center gap-2 md:hidden">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open menu"
                            className="p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)]"
                        >
                            <Menu size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed right-0 top-0 bottom-0 w-72 bg-[var(--sidebar-bg)] border-l border-[var(--card-border)] p-5 flex flex-col justify-between shadow-2xl">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)]">
                                <BrandLogo variant="compact" size="sm" />
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    aria-label="Close menu"
                                    className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {user && (
                                <div className="mt-4 p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#193D35] flex items-center justify-center text-white font-bold text-sm">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-[var(--foreground)] truncate">{user.name}</p>
                                        <p className="text-[11px] text-[var(--foreground-muted)] truncate">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5 px-1">
                                    Appearance
                                </p>
                                <ThemeToggle variant="segmented" className="w-full justify-between" />
                            </div>

                            <nav className="mt-4 space-y-1">
                                {navLinks.map((link) => {
                                    const Icon = link.icon;
                                    const active = isActive(link.path);
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                                active
                                                    ? 'bg-[#F3E5C5] dark:bg-emerald-500/15 text-[#193D35] dark:text-emerald-300 border border-[#E2D0A6] dark:border-emerald-500/30'
                                                    : 'text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)]'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            {link.name}
                                        </Link>
                                    );
                                })}
                                {user && (
                                    <>
                                        <Link
                                            to="/dashboard/profile"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)]"
                                        >
                                            <User size={16} /> Profile
                                        </Link>
                                        <Link
                                            to="/dashboard/settings"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)]"
                                        >
                                            <Settings size={16} /> Settings
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-[var(--card-border)]">
                            {user ? (
                                <button
                                    onClick={() => {
                                        logout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                >
                                    <LogOut size={15} /> Sign Out
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="btn-secondary text-xs py-2.5 text-center"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="btn-primary text-xs py-2.5 text-center"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
