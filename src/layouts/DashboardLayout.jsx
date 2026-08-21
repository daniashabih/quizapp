import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Code2, Trophy, Award, User, Settings as SettingsIcon,
    LogOut, Menu, X, Bell, Search, ChevronLeft, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import dashboardService from '../services/dashboardService';

const baseSidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
    { icon: Code2, label: "Technologies", to: "/dashboard/technologies" },
    { icon: Trophy, label: "My Quizzes", to: "/dashboard/quizzes" },
    { icon: Award, label: "Certificates", to: "/dashboard/certificates" },
    { icon: Trophy, label: "Leaderboard", to: "/dashboard/leaderboard" },
    { icon: User, label: "Profile", to: "/dashboard/profile" },
    { icon: SettingsIcon, label: "Settings", to: "/dashboard/settings" },
];

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchFocus, setSearchFocus] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
    useEffect(() => { setMobileOpen(false); setNotifOpen(false); }, [location.pathname]);

    useEffect(() => {
        const fetchNotifs = async () => {
            if (!user) return;
            try {
                const res = await dashboardService.getUserDashboard();
                if (res?.data?.notifications) {
                    setNotifications(res.data.notifications);
                }
            } catch {
                // silent
            }
        };
        fetchNotifs();
    }, [user, location.pathname]);

    useEffect(() => {
        const h = () => { if (window.innerWidth < 1024) setSidebarOpen(false); else setSidebarOpen(true); };
        h(); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h);
    }, []);

    const sidebarItems = [
        ...baseSidebarItems,
        ...(user?.role === 'admin' ? [{ icon: ShieldCheck, label: "Admin Panel", to: "/dashboard/admin" }] : [])
    ];

    const isActive = (path) => path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);

    return (
        <div className="h-screen max-h-screen w-full bg-[var(--page-bg)] text-[var(--foreground)] flex overflow-hidden">
            {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}

            {/* Sidebar */}
            <aside className={`fixed lg:relative top-0 left-0 z-50 h-full transition-all duration-300 bg-[var(--card-bg)] border-r border-[var(--card-border)] flex flex-col shrink-0 ${
                sidebarOpen ? 'w-64' : 'w-0 lg:w-16'
            } ${mobileOpen ? 'translate-x-0 !w-64' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-full flex flex-col overflow-hidden">
                    <div className={`flex items-center h-16 px-4 border-b border-[var(--card-border)] ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                        {(sidebarOpen || mobileOpen) && (
                            <Link to="/" className="flex items-center shrink-0">
                                <BrandLogo size="sm" />
                            </Link>
                        )}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden lg:flex p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all">
                            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                        {sidebarItems.map(item => (
                            <Link key={item.to} to={item.to}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                                    isActive(item.to) ? 'bg-[#193D35] text-[#FCFAF4] shadow-sm font-semibold' : 'text-[var(--foreground-secondary)] hover:text-[#193D35] hover:bg-[var(--muted-bg)]'
                                }`}
                                title={!sidebarOpen ? item.label : undefined}>
                                <item.icon size={18} className="shrink-0" />
                                {(sidebarOpen || mobileOpen) && <span>{item.label}</span>}
                                {!sidebarOpen && !mobileOpen && (
                                    <div className="absolute left-16 ml-2 px-2 py-1 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg text-xs font-medium text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </nav>
                    <div className={`p-3 border-t border-[var(--card-border)] ${!sidebarOpen && !mobileOpen ? 'flex justify-center' : ''}`}>
                        {(sidebarOpen || mobileOpen) ? (
                            <div className="space-y-1">
                                <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--foreground-secondary)] hover:text-[#193D35] hover:bg-[var(--muted-bg)] transition-all">Home</Link>
                                <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-medium text-[#C96155] hover:bg-[#C96155]/10 transition-all"><LogOut size={16} /> Sign Out</button>
                            </div>
                        ) : (
                            <button onClick={logout} className="p-2 rounded-xl text-[#C96155] hover:bg-[#C96155]/10" title="Sign Out"><LogOut size={18} /></button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                <header className="h-16 bg-[var(--card-bg)]/90 backdrop-blur-xl border-b border-[var(--card-border)] shrink-0 z-30">
                    <div className="flex items-center justify-between h-full px-4 lg:px-6">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[#193D35] hover:bg-[var(--muted-bg)]"><Menu size={20} /></button>
                            <div className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all duration-200 bg-[var(--muted-bg)] ${searchFocus ? 'border-[#193D35]' : 'border-[var(--card-border)]'}`}>
                                <Search size={15} className="text-[var(--foreground-muted)]" />
                                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-xs text-[var(--foreground)] placeholder:[var(--foreground-muted)] w-40 lg:w-56"
                                    onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <button onClick={() => setNotifOpen(!notifOpen)}
                                    className="relative p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[#193D35] hover:bg-[var(--muted-bg)] transition-all">
                                    <Bell size={18} />
                                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D19A45] ring-2 ring-[var(--card-bg)]" />
                                </button>
                                {notifOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-80 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl overflow-hidden animate-scale-in z-50">
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)]">
                                                <h3 className="text-xs font-semibold text-[var(--foreground)]">Notifications</h3>
                                                <button className="text-[11px] font-medium text-[var(--foreground-muted)] hover:text-[#193D35]">Mark all read</button>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto divide-y divide-[var(--card-border)]">
                                                {notifications.length === 0 ? (
                                                    <div className="p-6 text-center text-xs text-[var(--foreground-muted)]">
                                                        No new notifications.
                                                    </div>
                                                ) : (
                                                    notifications.map((n, i) => (
                                                        <div key={n.id || i} className={`px-4 py-3 hover:bg-[var(--muted-bg)] transition-colors cursor-pointer ${n.unread ? 'bg-[var(--muted-bg)]/50' : ''}`}>
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                    <p className="text-xs font-semibold text-[var(--foreground)]">{n.title}</p>
                                                                    <p className="text-[11px] text-[var(--foreground-secondary)] mt-0.5">{n.desc}</p>
                                                                </div>
                                                                {n.unread && <div className="w-2 h-2 rounded-full bg-[#D19A45] mt-1 shrink-0" />}
                                                            </div>
                                                            <p className="text-[10px] text-[var(--foreground-muted)] mt-1 font-medium">{n.time}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button onClick={() => navigate('/dashboard/profile')}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-[var(--muted-bg)] transition-all group">
                                <div className="w-7 h-7 rounded-lg bg-[#193D35] flex items-center justify-center text-[#FCFAF4] text-xs font-bold shadow-xs">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="hidden lg:block text-left leading-tight">
                                    <p className="text-xs font-semibold text-[var(--foreground)]">{user?.name || 'User'}</p>
                                    <p className="text-[10px] text-[var(--foreground-secondary)] font-medium">Learner</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto min-h-0"><Outlet /></main>
            </div>
        </div>
    );
}
