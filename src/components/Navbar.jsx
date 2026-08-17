import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard, Settings as SettingsIcon, BookOpen, Trophy, Code2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const navItems = [
    { to: '/', label: 'Home' },
    { to: '/technologies', label: 'Technologies' },
    { to: '/leaderboard', label: 'Leaderboard' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setIsOpen(false); setUserMenuOpen(false); }, [location.pathname]);

    const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? 'bg-[var(--card-bg)]/90 backdrop-blur-xl shadow-sm border-b border-[var(--card-border)]' : 'bg-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    <Link to="/" className="flex items-center group shrink-0">
                        <BrandLogo size="md" className="transition-transform duration-300 group-hover:scale-[1.02]" />
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map(item => (
                            <Link key={item.to} to={item.to}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive(item.to) ? 'bg-black text-white' : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
                                }`}>
                                {item.label}
                            </Link>
                        ))}
                        {user && (
                            <Link to="/dashboard"
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive('/dashboard') ? 'bg-black text-white' : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
                                }`}>
                                Dashboard
                            </Link>
                        )}
                    </nav>

                    <div className="hidden lg:flex items-center gap-3">
                        {user ? (
                            <div className="relative">
                                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-[var(--muted-bg)] transition-all border border-transparent hover:border-[var(--card-border)]">
                                    <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white text-xs font-bold">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="hidden xl:block text-left leading-tight">
                                        <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                                        <p className="text-[10px] text-[var(--foreground-secondary)] font-medium">{user.role}</p>
                                    </div>
                                    <ChevronDown size={14} className="text-[var(--foreground-muted)]" />
                                </button>
                                {userMenuOpen && (
                                    <>
                                        <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-56 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl overflow-hidden animate-scale-in z-50">
                                            <div className="p-3 border-b border-[var(--card-border)]">
                                                <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                                                <p className="text-xs text-[var(--foreground-secondary)]">{user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                <DropdownItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
                                                <DropdownItem icon={User} label="Profile" to="/dashboard/profile" />
                                                <DropdownItem icon={SettingsIcon} label="Settings" to="/dashboard/settings" />
                                                {user.role === 'admin' && <DropdownItem icon={ShieldCheck} label="Admin" to="/dashboard/admin" />}
                                            </div>
                                            <div className="p-2 border-t border-[var(--card-border)]">
                                                <button onClick={logout}
                                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all">
                                                    <LogOut size={16} /> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="btn-ghost text-sm font-semibold text-[var(--foreground-secondary)] hover:text-[var(--foreground)]">Sign In</Link>
                                <Link to="/register" className="btn-primary text-sm px-5 py-2.5">Get Started</Link>
                            </div>
                        )}
                    </div>

                    <div className="flex lg:hidden items-center gap-2">
                        <button onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)] transition-all">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
                <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsOpen(false)} />
                <div className={`absolute top-0 right-0 h-full w-72 bg-[var(--card-bg)] border-l border-[var(--card-border)] shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full pt-20 px-5 pb-8">
                        <button onClick={() => setIsOpen(false)} className="absolute top-6 right-5 p-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"><X size={22} /></button>
                        <div className="space-y-1 flex-1">
                            <MobileNavItem to="/" label="Home" icon={BookOpen} active={isActive('/')} />
                            <MobileNavItem to="/technologies" label="Technologies" icon={Code2} active={isActive('/technologies')} />
                            <MobileNavItem to="/leaderboard" label="Leaderboard" icon={Trophy} active={isActive('/leaderboard')} />
                            {user && (
                                <>
                                    <div className="divider my-3" />
                                    <MobileNavItem to="/dashboard" label="Dashboard" icon={LayoutDashboard} active={isActive('/dashboard')} />
                                    <MobileNavItem to="/dashboard/profile" label="Profile" icon={User} active={isActive('/dashboard/profile')} />
                                    <MobileNavItem to="/dashboard/settings" label="Settings" icon={SettingsIcon} active={isActive('/dashboard/settings')} />
                                </>
                            )}
                        </div>
                        <div className="pt-6 border-t border-[var(--card-border)]">
                            {user ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--muted-bg)]">
                                        <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white font-bold">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                                            <p className="text-xs text-[var(--foreground-secondary)]">{user.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={logout}
                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 border border-[var(--card-border)] transition-all">
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="btn-secondary w-full justify-center text-sm">Sign In</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary w-full justify-center text-sm">Get Started</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function DropdownItem({ icon: Icon, label, to }) {
    return (
        <Link to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all">
            <Icon size={16} /> {label}
        </Link>
    );
}

function MobileNavItem({ to, label, icon: Icon, active }) {
    return (
        <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            active ? 'bg-black text-white' : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
        }`}>
            <Icon size={18} /> {label}
        </Link>
    );
}
