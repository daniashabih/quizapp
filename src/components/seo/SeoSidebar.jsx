import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    Search,
    ShieldCheck,
    Database,
    FileText,
    Wrench,
    Link2,
    Sparkles,
    Users,
    CheckSquare,
    Settings,
    ArrowLeft,
    X,
    ChevronRight
} from 'lucide-react';
import BrandLogo from '../BrandLogo';
import { SEO_NAV_ITEMS } from './seoUtils';

const NAV_ICONS = {
    overview: LayoutDashboard,
    'search-performance': TrendingUp,
    keywords: Search,
    audit: ShieldCheck,
    indexing: Database,
    content: FileText,
    technical: Wrench,
    backlinks: Link2,
    'ai-visibility': Sparkles,
    competitors: Users,
    recommendations: CheckSquare,
    settings: Settings
};

function SidebarContent({
    activeSection,
    onSelectSection,
    auditBadgeCount = 0,
    pendingRecsCount = 0,
    domain = 'www.hangbug.com',
    onCloseMobile
}) {
    const getBadge = (id) => {
        if (id === 'audit' && auditBadgeCount > 0) return auditBadgeCount;
        if (id === 'recommendations' && pendingRecsCount > 0) return pendingRecsCount;
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#141D19] border-r border-[#E4EAE6] dark:border-[#2A3832]">
            {/* Brand Header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-[#E4EAE6] dark:border-[#2A3832] shrink-0">
                <Link to="/" className="flex items-center gap-2 min-w-0">
                    <BrandLogo variant="compact" size="md" />
                </Link>
                {onCloseMobile && (
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        aria-label="Close SEO sidebar"
                        className="p-1.5 rounded-lg text-[#75817C] hover:text-[#17221F] dark:hover:text-white lg:hidden cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Active Property Pill */}
            <div className="px-4 py-3 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                <div className="px-3 py-2 rounded-xl bg-[#F7F8F6] dark:bg-[#18221E] border border-[#E4EAE6] dark:border-[#2A3832]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#75817C] dark:text-[#8FA69C]">
                        SEO &amp; Growth Studio
                    </p>
                    <p className="text-xs font-semibold text-[#193D35] dark:text-emerald-300 truncate mt-0.5">
                        {domain}
                    </p>
                </div>
            </div>

            {/* 12 Hangbug SEO Navigation Items */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="SEO & Growth navigation">
                {SEO_NAV_ITEMS.map((item) => {
                    const Icon = NAV_ICONS[item.id] || LayoutDashboard;
                    const active = activeSection === item.id;
                    const badge = getBadge(item.id);

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                onSelectSection(item.id);
                                if (onCloseMobile) onCloseMobile();
                            }}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                active
                                    ? 'bg-[#E5F2EC] dark:bg-[#1F352E] text-[#193D35] dark:text-emerald-300 border border-[#BBE0CE] dark:border-[#2F806B]/40 shadow-2xs'
                                    : 'text-[#75817C] dark:text-[#8FA69C] hover:bg-[#F7F8F6] dark:hover:bg-[#18221E] hover:text-[#17221F] dark:hover:text-[#F3F6F4] border border-transparent'
                            }`}
                        >
                            <span className="flex items-center gap-2.5 min-w-0">
                                <Icon
                                    size={16}
                                    className={active ? 'text-[#193D35] dark:text-emerald-300 shrink-0' : 'text-[#75817C] dark:text-[#8FA69C] shrink-0'}
                                />
                                <span className="truncate">{item.label}</span>
                            </span>
                            <span className="flex items-center gap-1.5 shrink-0">
                                {badge !== null && (
                                    <span
                                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            active
                                                ? 'bg-[#193D35] text-white dark:bg-emerald-500 dark:text-[#0F1513]'
                                                : 'bg-[#FEF5E7] text-[#B45309] dark:bg-amber-950/60 dark:text-amber-300'
                                        }`}
                                    >
                                        {badge}
                                    </span>
                                )}
                                {active && <ChevronRight size={13} className="text-[#2F806B] dark:text-emerald-400" />}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer Link back to Hangbug Admin */}
            <div className="p-3 border-t border-[#E4EAE6] dark:border-[#2A3832] space-y-1.5 shrink-0">
                <Link
                    to="/admin"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#193D35] dark:text-emerald-300 hover:bg-[#E5F2EC]/60 dark:hover:bg-[#1F352E] transition-colors"
                >
                    <ArrowLeft size={14} />
                    <span>Back to Admin Panel</span>
                </Link>
                <Link
                    to="/dashboard"
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-medium text-[#75817C] dark:text-[#8FA69C] hover:text-[#17221F] dark:hover:text-white transition-colors"
                >
                    <span>Developer Workspace</span>
                </Link>
            </div>
        </div>
    );
}

export default function SeoSidebar({
    activeSection,
    onSelectSection,
    auditBadgeCount = 0,
    pendingRecsCount = 0,
    domain = 'www.hangbug.com',
    mobileOpen = false,
    onCloseMobile
}) {
    const [drawerMounted, setDrawerMounted] = useState(mobileOpen);
    const [drawerVisible, setDrawerVisible] = useState(mobileOpen);

    useEffect(() => {
        if (mobileOpen) {
            setDrawerMounted(true);
            const raf = window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => setDrawerVisible(true));
            });
            return () => window.cancelAnimationFrame(raf);
        }
        setDrawerVisible(false);
        const timer = window.setTimeout(() => setDrawerMounted(false), 260);
        return () => window.clearTimeout(timer);
    }, [mobileOpen]);

    useEffect(() => {
        if (!drawerMounted) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onCloseMobile) onCloseMobile();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [drawerMounted, onCloseMobile]);

    return (
        <>
            {/* Fixed Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-40">
                <SidebarContent
                    activeSection={activeSection}
                    onSelectSection={onSelectSection}
                    auditBadgeCount={auditBadgeCount}
                    pendingRecsCount={pendingRecsCount}
                    domain={domain}
                />
            </aside>

            {/* Mobile / Tablet Drawer */}
            {drawerMounted && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="SEO Studio navigation">
                    <div
                        className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-out ${
                            drawerVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        onClick={onCloseMobile}
                    />
                    <aside
                        className={`fixed inset-y-0 left-0 w-[min(18rem,86vw)] z-50 shadow-2xl transition-transform duration-300 ease-out ${
                            drawerVisible ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <SidebarContent
                            activeSection={activeSection}
                            onSelectSection={onSelectSection}
                            auditBadgeCount={auditBadgeCount}
                            pendingRecsCount={pendingRecsCount}
                            domain={domain}
                            onCloseMobile={onCloseMobile}
                        />
                    </aside>
                </div>
            )}
        </>
    );
}
