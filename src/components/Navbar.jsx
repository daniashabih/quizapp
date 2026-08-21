import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Menu, X, User, LogOut, ChevronDown, LayoutDashboard,
    Settings as SettingsIcon, BookOpen, Trophy, Code2, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const navItems = [
    { to: '/', label: 'Home', icon: BookOpen },
    { to: '/technologies', label: 'Technologies', icon: Code2 },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
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

    // Close menus when route changes
    useEffect(() => {
        setIsOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle Escape key to close menus
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setUserMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    return (
        <>
            {/* Desktop & Mobile Header Bar */}
            <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
                scrolled ? 'bg-[var(--card-bg)]/95 backdrop-blur-xl shadow-sm border-b border-[var(--card-border)]' : 'bg-[var(--card-bg)]/85 backdrop-blur-xl border-b border-[var(--card-border)]/60'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Brand Logo */}
                        <Link to="/" className="flex items-center group shrink-0">
                            <BrandLogo size="md" className="transition-transform duration-300 group-hover:scale-[1.02]" />
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive(item.to)
                                            ? 'bg-[#193D35] text-[#FCFAF4] shadow-xs font-semibold'
                                            : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            {user && (
                                <Link
                                    to="/dashboard"
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive('/dashboard')
                                            ? 'bg-[#193D35] text-[#FCFAF4] shadow-xs font-semibold'
                                            : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                            )}
                        </nav>

                        {/* Desktop Auth / User Menu */}
                        <div className="hidden lg:flex items-center gap-3">
                            {user ? (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-[var(--muted-bg)] transition-all border border-transparent hover:border-[var(--card-border)] cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-[#193D35] flex items-center justify-center text-[#FCFAF4] text-xs font-bold shadow-xs">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="hidden xl:block text-left leading-tight">
                                            <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                                            <p className="text-[10px] text-[var(--foreground-secondary)] font-medium">{user.role || 'Member'}</p>
                                        </div>
                                        <ChevronDown size={14} className="text-[var(--foreground-muted)]" />
                                    </button>

                                    {userMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                            <div className="absolute right-0 mt-2 w-56 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl overflow-hidden animate-scale-in z-50">
                                                <div className="p-3 border-b border-[var(--card-border)] bg-[var(--muted-bg)]/50">
                                                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user.name}</p>
                                                    <p className="text-xs text-[var(--foreground-muted)] truncate">{user.email}</p>
                                                </div>
                                                <div className="p-2 space-y-0.5">
                                                    <DropdownItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" onClick={() => setUserMenuOpen(false)} />
                                                    <DropdownItem icon={User} label="Profile" to="/dashboard/profile" onClick={() => setUserMenuOpen(false)} />
                                                    <DropdownItem icon={SettingsIcon} label="Settings" to="/dashboard/settings" onClick={() => setUserMenuOpen(false)} />
                                                    {user.role === 'admin' && (
                                                        <DropdownItem icon={ShieldCheck} label="Admin Panel" to="/dashboard/admin" onClick={() => setUserMenuOpen(false)} />
                                                    )}
                                                </div>
                                                <div className="p-2 border-t border-[var(--card-border)]">
                                                    <button
                                                        type="button"
                                                        onClick={() => { logout(); setUserMenuOpen(false); }}
                                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#C96155] hover:bg-[#C96155]/10 transition-all cursor-pointer"
                                                    >
                                                        <LogOut size={16} /> Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login" className="btn-ghost text-sm font-semibold text-[var(--foreground-secondary)] hover:text-[var(--foreground)]">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="btn-primary text-sm px-5 py-2.5">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger Toggle Button */}
                        <div className="flex lg:hidden items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label={isOpen ? "Close menu" : "Open menu"}
                                className="p-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors cursor-pointer"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay & Sidebar (Rendered OUTSIDE <header> to prevent containing-block trapping) */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
                        {/* Backdrop Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                            onClick={() => setIsOpen(false)}
                            aria-hidden="true"
                        />

                        {/* Slide-in Drawer Container */}
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                            className="relative w-full max-w-[310px] sm:max-w-xs h-full bg-[var(--page-bg)] border-l border-[var(--card-border)] shadow-2xl flex flex-col z-10 overflow-hidden"
                            aria-modal="true"
                            role="dialog"
                        >
                            {/* Drawer Header with Logo & Close Button */}
                            <div className="flex items-center justify-between px-5 h-16 sm:h-20 border-b border-[var(--card-border)] bg-[var(--card-bg)] shrink-0">
                                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center">
                                    <BrandLogo size="sm" />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close menu"
                                    className="p-2 rounded-xl text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors cursor-pointer"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Drawer Navigation Links */}
                            <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
                                <p className="px-3.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Menu</p>
                                {navItems.map(item => (
                                    <MobileNavItem
                                        key={item.to}
                                        to={item.to}
                                        label={item.label}
                                        icon={item.icon}
                                        active={isActive(item.to)}
                                        onClick={() => setIsOpen(false)}
                                    />
                                ))}

                                {user && (
                                    <>
                                        <div className="divider my-3" />
                                        <p className="px-3.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">User Account</p>
                                        <MobileNavItem
                                            to="/dashboard"
                                            label="Dashboard"
                                            icon={LayoutDashboard}
                                            active={isActive('/dashboard')}
                                            onClick={() => setIsOpen(false)}
                                        />
                                        <MobileNavItem
                                            to="/dashboard/profile"
                                            label="Profile"
                                            icon={User}
                                            active={isActive('/dashboard/profile')}
                                            onClick={() => setIsOpen(false)}
                                        />
                                        <MobileNavItem
                                            to="/dashboard/settings"
                                            label="Settings"
                                            icon={SettingsIcon}
                                            active={isActive('/dashboard/settings')}
                                            onClick={() => setIsOpen(false)}
                                        />
                                        {user.role === 'admin' && (
                                            <MobileNavItem
                                                to="/dashboard/admin"
                                                label="Admin Panel"
                                                icon={ShieldCheck}
                                                active={isActive('/dashboard/admin')}
                                                onClick={() => setIsOpen(false)}
                                            />
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Drawer Footer Actions */}
                            <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card-bg)] shrink-0">
                                {user ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                            <div className="w-10 h-10 rounded-lg bg-[#193D35] flex items-center justify-center text-[#FCFAF4] font-bold text-sm shrink-0 shadow-2xs">
                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user.name}</p>
                                                <p className="text-xs text-[var(--foreground-muted)] truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { logout(); setIsOpen(false); }}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-[#C96155] hover:bg-[#C96155]/10 border border-[var(--card-border)] transition-all cursor-pointer"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2.5">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="btn-secondary w-full justify-center text-sm py-2.5"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsOpen(false)}
                                            className="btn-primary w-full justify-center text-sm py-2.5"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function DropdownItem({ icon: Icon, label, to, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all"
        >
            <Icon size={16} className="text-[var(--foreground-muted)]" />
            <span>{label}</span>
        </Link>
    );
}

function MobileNavItem({ to, label, icon: Icon, active, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                    ? 'bg-[#193D35] text-[#FCFAF4] font-semibold shadow-xs'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
            }`}
        >
            <Icon size={18} className={active ? 'text-[#FCFAF4]' : 'text-[var(--foreground-muted)]'} />
            <span>{label}</span>
        </Link>
    );
}
