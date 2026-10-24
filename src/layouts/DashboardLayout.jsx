import { useState } from 'react';
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
    Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Overview', path: '/dashboard', matchPaths: ['/dashboard'], exact: true, icon: LayoutDashboard },
        { name: 'Practice Quizzes', path: '/dashboard/technologies', matchPaths: ['/dashboard/technologies', '/dashboard/quizzes', '/technologies'], icon: BookOpen },
        { name: 'Certificates', path: '/dashboard/certificates', matchPaths: ['/dashboard/certificates', '/certificates'], icon: Award },
        { name: 'Leaderboard', path: '/dashboard/leaderboard', matchPaths: ['/dashboard/leaderboard', '/leaderboard'], icon: Trophy },
        { name: 'Profile', path: '/dashboard/profile', matchPaths: ['/dashboard/profile', '/profile'], icon: User },
        { name: 'Settings', path: '/dashboard/settings', matchPaths: ['/dashboard/settings', '/settings'], icon: Settings },
        ...(isAdmin ? [
            { name: 'Admin Panel', path: '/admin', matchPaths: ['/admin', '/dashboard/admin'], exact: true, icon: ShieldCheck },
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
                <header className="h-16 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--card-border)] sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open navigation sidebar"
                            className="lg:hidden p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)]"
                        >
                            <Menu size={18} />
                        </button>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-display font-bold text-[var(--foreground)]">
                                {navItems.find((i) => isActive(i))?.name || 'Workspace'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            to="/technologies"
                            className="btn-primary text-xs py-1.5 px-3.5"
                        >
                            <BookOpen size={14} />
                            <span className="hidden sm:inline">Take a Quiz</span>
                        </Link>
                        <ThemeToggle />
                        {user && (
                            <Link
                                to="/dashboard/profile"
                                className="w-8 h-8 rounded-lg bg-[#193D35] flex items-center justify-center text-white text-xs font-bold"
                                title={user.name}
                            >
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </Link>
                        )}
                    </div>
                </header>

                {/* Page Body */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
                    {children || <Outlet />}
                </main>
            </div>

            {/* Mobile Sidebar Drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 w-72 bg-[var(--sidebar-bg)] border-r border-[var(--card-border)] p-4 flex flex-col justify-between z-50">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)]">
                                <BrandLogo variant="compact" size="sm" />
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    aria-label="Close navigation sidebar"
                                    className="p-1.5 rounded-lg text-[var(--foreground-muted)]"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mt-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5 px-1">
                                    Appearance
                                </p>
                                <ThemeToggle variant="segmented" className="w-full justify-between" />
                            </div>

                            <nav className="mt-4 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                                                active
                                                    ? 'bg-[#F3E5C5] dark:bg-emerald-500/15 text-[#193D35] dark:text-emerald-300 border border-[#E2D0A6] dark:border-emerald-500/30'
                                                    : 'text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)]'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-[var(--card-border)] space-y-2">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10"
                            >
                                <LogOut size={16} />
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
