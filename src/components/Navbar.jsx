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
    Globe,
    Gamepad2,
    Newspaper
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [drawerMounted, setDrawerMounted] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();

    const openMobileMenu = () => {
        setDrawerMounted(true);
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => setDrawerVisible(true));
        });
    };

    const closeMobileMenu = () => {
        setDrawerVisible(false);
    };

    useEffect(() => {
        if (!drawerVisible && drawerMounted) {
            const timer = window.setTimeout(() => setDrawerMounted(false), 260);
            return () => window.clearTimeout(timer);
        }
    }, [drawerVisible, drawerMounted]);

    useEffect(() => {
        setDrawerVisible(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!drawerMounted) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeMobileMenu();
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [drawerMounted]);

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Quizzes', path: '/technologies', icon: BookOpen },
        { name: 'Games', path: '/games', icon: Gamepad2 },
        { name: 'Blog', path: '/blog', icon: Newspaper },
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 xl:px-8 h-16 flex items-center justify-between gap-2">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center group shrink-0">
                        <BrandLogo variant="compact" size="md" loading="eager" fetchPriority="high" />
                    </Link>

                    {/* Desktop Links */}
                    <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-[var(--muted-bg)]/80 p-1 rounded-xl border border-[var(--card-border)] min-w-0">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-semibold whitespace-nowrap transition-all ${
                                        active
                                            ? 'bg-[var(--card-bg)] text-[#193D35] dark:text-emerald-300 shadow-2xs border border-[var(--card-border)]'
                                            : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    <Icon size={14} className={`hidden xl:block shrink-0 ${active ? 'text-[#193D35] dark:text-emerald-400' : ''}`} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
                        <ThemeToggle />

                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/dashboard/profile"
                                    className="flex items-center gap-2 px-2.5 xl:px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#193D35] dark:hover:border-emerald-400 transition-all text-xs font-semibold"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-[#193D35] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="max-w-[84px] xl:max-w-[110px] truncate">{user.name}</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    title="Logout"
                                    aria-label="Logout"
                                    className="p-2 min-h-10 min-w-10 inline-flex items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-red-500 hover:border-red-500/30 transition-all cursor-pointer"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-3 xl:px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] whitespace-nowrap transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn-primary text-xs py-2 px-3.5 xl:px-4 whitespace-nowrap">
                                    Get Started <ChevronRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile & Tablet Controls */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <ThemeToggle />
                        <button
                            type="button"
                            onClick={openMobileMenu}
                            aria-label="Open menu"
                            aria-expanded={drawerVisible}
                            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors cursor-pointer"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile & Tablet Slide-Out Drawer */}
            {drawerMounted && (
                <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Site navigation">
                    <div
                        className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-out ${
                            drawerVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        onClick={closeMobileMenu}
                    />
                    <div
                        className={`fixed right-0 top-0 bottom-0 w-[min(20rem,88vw)] bg-[var(--sidebar-bg)] border-l border-[var(--card-border)] p-4 sm:p-5 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-out ${
                            drawerVisible ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--card-border)] shrink-0">
                            <BrandLogo variant="compact" size="sm" />
                            <button
                                type="button"
                                onClick={closeMobileMenu}
                                aria-label="Close menu"
                                className="min-h-10 min-w-10 inline-flex items-center justify-center rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-4">
                            {user && (
                                <div className="p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#193D35] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-[var(--foreground)] truncate">{user.name}</p>
                                        <p className="text-[11px] text-[var(--foreground-muted)] truncate">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5 px-1">
                                    Appearance
                                </p>
                                <ThemeToggle variant="segmented" className="w-full justify-between" />
                            </div>

                            <nav className="space-y-1" aria-label="Mobile navigation">
                                {navLinks.map((link) => {
                                    const Icon = link.icon;
                                    const active = isActive(link.path);
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={closeMobileMenu}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 min-h-11 rounded-xl text-xs font-semibold transition-all ${
                                                active
                                                    ? 'bg-[#F3E5C5] dark:bg-emerald-500/15 text-[#193D35] dark:text-emerald-300 border border-[#E2D0A6] dark:border-emerald-500/30'
                                                    : 'text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)]'
                                            }`}
                                        >
                                            <Icon size={16} className="shrink-0" />
                                            <span className="truncate">{link.name}</span>
                                        </Link>
                                    );
                                })}
                                {user && (
                                    <>
                                        <Link
                                            to="/dashboard/profile"
                                            onClick={closeMobileMenu}
                                            className="flex items-center gap-3 px-3.5 py-2.5 min-h-11 rounded-xl text-xs font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)]"
                                        >
                                            <User size={16} className="shrink-0" /> Profile
                                        </Link>
                                        <Link
                                            to="/dashboard/settings"
                                            onClick={closeMobileMenu}
                                            className="flex items-center gap-3 px-3.5 py-2.5 min-h-11 rounded-xl text-xs font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)]"
                                        >
                                            <Settings size={16} className="shrink-0" /> Settings
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>

                        <div className="pt-3.5 border-t border-[var(--card-border)] shrink-0">
                            {user ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        logout();
                                        closeMobileMenu();
                                    }}
                                    className="w-full min-h-11 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                >
                                    <LogOut size={15} /> Sign Out
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        to="/login"
                                        onClick={closeMobileMenu}
                                        className="btn-secondary text-xs py-2.5 min-h-11 text-center"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeMobileMenu}
                                        className="btn-primary text-xs py-2.5 min-h-11 text-center"
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
