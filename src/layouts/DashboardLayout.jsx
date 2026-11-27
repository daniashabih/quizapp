import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Award,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Trophy,
    ShieldCheck,
    ChevronRight,
    Home,
    Globe,
    Gamepad2,
    Library,
    FileCheck2,
    Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';
import usePageSeo from '../hooks/usePageSeo';
import { getSeoSectionTitle } from '../components/seo/seoUtils';

const resolveDashboardRouteTitle = (pathname = '') => {
    const clean = String(pathname || '').replace(/\/+$/, '') || '/dashboard';
    if (clean.startsWith('/dashboard/seo')) {
        const section = clean.slice('/dashboard/seo'.length).replace(/^\/+/, '') || 'overview';
        return getSeoSectionTitle(section);
    }
    if (clean === '/admin/knowledge-base') return 'Admin Knowledge Base & PDF RAG Library — Hangbug';
    if (clean === '/admin/verification-reports') return 'Admin AI Verification Reports & Audits — Hangbug';
    if (clean === '/admin/ai-controls') return 'Admin AI Models, Embeddings & Usage — Hangbug';
    if (clean.startsWith('/admin')) return 'Admin Console: Questions & Platform Control — Hangbug';
    if (clean.startsWith('/dashboard/technologies') || clean.startsWith('/dashboard/quizzes')) {
        return 'Dashboard Practice Quizzes & Tech Tracks — Hangbug';
    }
    if (clean.startsWith('/dashboard/certificates') || clean.startsWith('/certificates')) {
        return 'My Verified Programming Certificates — Hangbug';
    }
    if (clean.startsWith('/dashboard/leaderboard/full')) {
        return 'Full Dashboard Developer Leaderboard Ranks — Hangbug';
    }
    if (clean.startsWith('/dashboard/leaderboard')) {
        return 'Dashboard Developer Standings & Ranks — Hangbug';
    }
    if (clean.startsWith('/dashboard/profile') || clean.startsWith('/profile')) {
        return 'Developer Profile & Coding Credentials — Hangbug';
    }
    if (clean.startsWith('/dashboard/settings') || clean.startsWith('/settings')) {
        return 'Account Theme Settings & Preferences — Hangbug';
    }
    return 'Developer Overview & Learning Progress — Hangbug';
};

const DashboardLayout = ({ children }) => {
    const [drawerMounted, setDrawerMounted] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const { user, logout, isAdmin: authIsAdmin } = useAuth();
    const isAdmin = Boolean(authIsAdmin || String(user?.role || '').toLowerCase() === 'admin');
    const location = useLocation();

    const openSidebar = () => {
        setDrawerMounted(true);
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => setDrawerVisible(true));
        });
    };

    const closeSidebar = () => {
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
        if (!drawerMounted) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeSidebar();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [drawerMounted]);

    usePageSeo({
        title: resolveDashboardRouteTitle(location.pathname),
        noindex: true
    });

    const navItems = [
        { name: 'Overview', path: '/dashboard', matchPaths: ['/dashboard'], exact: true, icon: LayoutDashboard },
        { name: 'Practice Quizzes', path: '/dashboard/technologies', matchPaths: ['/dashboard/technologies', '/dashboard/quizzes', '/technologies'], icon: BookOpen },
        { name: 'Mini Games', path: '/games', matchPaths: ['/games', '/dashboard/games'], icon: Gamepad2 },
        { name: 'Certificates', path: '/dashboard/certificates', matchPaths: ['/dashboard/certificates', '/certificates'], icon: Award },
        { name: 'Leaderboard', path: '/dashboard/leaderboard', matchPaths: ['/dashboard/leaderboard', '/leaderboard'], icon: Trophy },
        { name: 'Profile', path: '/dashboard/profile', matchPaths: ['/dashboard/profile', '/profile'], icon: User },
        { name: 'Settings', path: '/dashboard/settings', matchPaths: ['/dashboard/settings', '/settings'], icon: Settings },
        ...(isAdmin ? [
            { name: 'Admin Panel', path: '/admin', matchPaths: ['/admin', '/dashboard/admin'], exact: true, icon: ShieldCheck },
            { name: 'AI Knowledge Base', path: '/admin/knowledge-base', matchPaths: ['/admin/knowledge-base'], icon: Library },
            { name: 'AI Verification Reports', path: '/admin/verification-reports', matchPaths: ['/admin/verification-reports'], icon: FileCheck2 },
            { name: 'AI Models & Usage', path: '/admin/ai-controls', matchPaths: ['/admin/ai-controls'], icon: Cpu },
            { name: 'SEO & Growth', path: '/dashboard/seo', matchPaths: ['/dashboard/seo', '/admin/seo', '/seo'], icon: Globe },
        ] : []),
    ];

    const isActive = (item) => {
        const paths = item.matchPaths || [item.path];
        if (item.exact) {
            return paths.includes(location.pathname);
        }
        return paths.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));
    };

    return (
        <div className="min-h-screen flex bg-[var(--page-bg)] text-[var(--foreground)]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-[var(--sidebar-bg)] border-r border-[var(--card-border)] fixed inset-y-0 left-0 z-40">
                {/* Brand */}
                <div className="h-16 px-5 flex items-center justify-between border-b border-[var(--card-border)]">
                    <Link to="/" className="flex items-center">
                        <BrandLogo variant="compact" size="md" />
                    </Link>
                    <Link
                        to="/"
                        title="Back to Home"
                        className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors"
                    >
                        <Home size={16} />
                    </Link>
                </div>

                {/* User Summary */}
                {user && (
                    <div className="p-4 border-b border-[var(--card-border)]">
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--muted-bg)]/60 border border-[var(--card-border)]">
                            <div className="w-9 h-9 rounded-lg bg-[#193D35] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[var(--foreground)] truncate">{user.name}</p>
                                <p className="text-[11px] text-[var(--foreground-muted)] truncate">
                                    {isAdmin ? 'Administrator' : 'Developer'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                    active
                                        ? 'bg-[#F3E5C5] dark:bg-emerald-500/15 text-[#193D35] dark:text-emerald-300 border border-[#E2D0A6] dark:border-emerald-500/30'
                                        : 'text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Icon size={16} className={active ? 'text-[#193D35] dark:text-emerald-400' : 'text-[var(--foreground-muted)]'} />
                                    <span>{item.name}</span>
                                </div>
                                {active && <ChevronRight size={14} className="text-[#193D35] dark:text-emerald-400" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-[var(--card-border)] space-y-2">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
                {/* Top Bar */}
                <header className="h-16 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--card-border)] sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={openSidebar}
                            aria-label="Open navigation sidebar"
                            aria-expanded={drawerVisible}
                            className="lg:hidden min-h-10 min-w-10 inline-flex items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors shrink-0 cursor-pointer"
                        >
                            <Menu size={18} />
                        </button>
                        <div className="min-w-0">
                            <p className="text-xs xs:text-sm font-display font-bold text-[var(--foreground)] truncate">
                                {navItems.find((i) => isActive(i))?.name || 'Workspace'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                        <Link
                            to="/technologies"
                            className="btn-primary text-xs py-2 px-3 sm:px-3.5 min-h-9"
                        >
                            <BookOpen size={14} />
                            <span className="hidden xs:inline">Take a Quiz</span>
                        </Link>
                        <ThemeToggle />
                        {user && (
                            <Link
                                to="/dashboard/profile"
                                className="w-9 h-9 rounded-xl bg-[#193D35] flex items-center justify-center text-white text-xs font-bold shrink-0"
                                title={user.name}
                            >
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </Link>
                        )}
                    </div>
                </header>

                {/* Page Body */}
                <main className="flex-1 p-3.5 xs:p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
                    {children || <Outlet />}
                </main>
            </div>

            {/* Mobile & Tablet Sidebar Drawer */}
            {drawerMounted && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Workspace navigation">
                    <div
                        className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-out ${
                            drawerVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        onClick={closeSidebar}
                    />
                    <aside
                        className={`fixed inset-y-0 left-0 w-[min(18rem,86vw)] bg-[var(--sidebar-bg)] border-r border-[var(--card-border)] p-4 flex flex-col justify-between z-50 shadow-2xl transition-transform duration-300 ease-out ${
                            drawerVisible ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--card-border)] shrink-0">
                            <Link to="/" onClick={closeSidebar} className="flex items-center">
                                <BrandLogo variant="compact" size="sm" />
                            </Link>
                            <button
                                type="button"
                                onClick={closeSidebar}
                                aria-label="Close navigation sidebar"
                                className="min-h-10 min-w-10 inline-flex items-center justify-center rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5 px-1">
                                    Appearance
                                </p>
                                <ThemeToggle variant="segmented" className="w-full justify-between" />
                            </div>

                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={closeSidebar}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 min-h-11 rounded-xl text-xs font-semibold transition-colors ${
                                                active
                                                    ? 'bg-[#F3E5C5] dark:bg-emerald-500/15 text-[#193D35] dark:text-emerald-300 border border-[#E2D0A6] dark:border-emerald-500/30'
                                                    : 'text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)]'
                                            }`}
                                        >
                                            <Icon size={16} className="shrink-0" />
                                            <span className="truncate">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="pt-3.5 border-t border-[var(--card-border)] shrink-0 space-y-1.5">
                            <Link
                                to="/"
                                onClick={closeSidebar}
                                className="w-full flex items-center gap-3 px-3.5 py-2 min-h-10 rounded-xl text-xs font-semibold text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)]"
                            >
                                <Home size={15} className="shrink-0" />
                                <span>Public Website</span>
                            </Link>
                            <button
                                type="button"
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 min-h-11 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 cursor-pointer"
                            >
                                <LogOut size={16} className="shrink-0" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
