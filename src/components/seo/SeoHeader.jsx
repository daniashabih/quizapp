import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    ChevronDown,
    ExternalLink,
    RefreshCw,
    Menu,
    Check,
    Play,
    Clock
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { formatSeoTimestamp } from './seoUtils';

export default function SeoHeader({
    currentDomain = 'www.hangbug.com',
    availableDomains = ['www.hangbug.com', 'hangbug.com'],
    activeSectionLabel = 'Overview',
    lastUpdated = null,
    isAuditing = false,
    isRefreshing = false,
    onDomainChange,
    onRunAudit,
    onRefresh,
    onOpenMobileMenu
}) {
    const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDomainDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="w-full bg-white/95 dark:bg-[#141D19]/95 backdrop-blur-md border-b border-[#E4EAE6] dark:border-[#2A3832] sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
                {/* Left: Mobile Sidebar Toggle + Breadcrumbs + Domain Switcher */}
                <div className="flex items-center gap-3 min-w-0">
                    {onOpenMobileMenu && (
                        <button
                            type="button"
                            onClick={onOpenMobileMenu}
                            aria-label="Open SEO navigation menu"
                            className="lg:hidden p-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#18221E] text-[#17221F] dark:text-[#F3F6F4] cursor-pointer"
                        >
                            <Menu size={18} />
                        </button>
                    )}

                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                            <Link to="/dashboard" className="hover:text-[#193D35] dark:hover:text-emerald-300 transition-colors">
                                Home
                            </Link>
                            <ChevronRight size={12} />
                            <span>SEO &amp; Growth</span>
                            <ChevronRight size={12} />
                            <span className="font-semibold text-[#17221F] dark:text-[#F3F6F4] truncate">
                                {activeSectionLabel}
                            </span>
                        </div>

                        <div className="flex items-center flex-wrap gap-2 mt-0.5">
                            <h1 className="text-base sm:text-lg font-display font-bold text-[#17221F] dark:text-[#F3F6F4] tracking-tight">
                                {activeSectionLabel} — Search Performance &amp; Audit
                            </h1>

                            {/* Domain Selector */}
                            <div className="relative inline-flex items-center gap-1" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setDomainDropdownOpen(prev => !prev)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E5F2EC] dark:bg-[#1F352E] text-[#193D35] dark:text-emerald-300 border border-[#BBE0CE] dark:border-[#2F806B]/40 text-xs font-semibold hover:bg-[#d5ebe0] dark:hover:bg-[#26443b] transition-colors cursor-pointer"
                                    title="Switch active domain"
                                >
                                    <span>{currentDomain}</span>
                                    <ChevronDown
                                        size={13}
                                        className={`transition-transform duration-150 ${domainDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                <a
                                    href={`https://${currentDomain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg text-[#75817C] hover:text-[#193D35] dark:hover:text-emerald-300 hover:bg-[#F7F8F6] dark:hover:bg-[#18221E] transition-colors"
                                    title={`Open https://${currentDomain}`}
                                >
                                    <ExternalLink size={14} />
                                </a>

                                {domainDropdownOpen && (
                                    <div className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-[#18221E] rounded-xl shadow-lg border border-[#E4EAE6] dark:border-[#2A3832] py-1.5 z-50">
                                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#75817C] dark:text-[#8FA69C]">
                                            Tracked Properties
                                        </div>
                                        {availableDomains.map((dom) => (
                                            <button
                                                key={dom}
                                                type="button"
                                                onClick={() => {
                                                    if (onDomainChange) onDomainChange(dom);
                                                    setDomainDropdownOpen(false);
                                                }}
                                                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#F7F8F6] dark:hover:bg-[#1F2D27] transition-colors cursor-pointer ${
                                                    dom === currentDomain
                                                        ? 'text-[#193D35] dark:text-emerald-300 font-semibold bg-[#E5F2EC]/50 dark:bg-[#1F352E]/50'
                                                        : 'text-[#17221F] dark:text-[#F3F6F4]'
                                                }`}
                                            >
                                                <span className="truncate">{dom}</span>
                                                {dom === currentDomain && <Check size={13} className="text-[#2F806B] shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Last Updated + Refresh + Run Audit + ThemeToggle */}
                <div className="flex items-center flex-wrap gap-2">
                    {lastUpdated && (
                        <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F8F6] dark:bg-[#18221E] border border-[#E4EAE6] dark:border-[#2A3832] text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                            <Clock size={12} />
                            <span>Updated {formatSeoTimestamp(lastUpdated)}</span>
                        </div>
                    )}

                    {onRefresh && (
                        <button
                            type="button"
                            onClick={onRefresh}
                            disabled={isRefreshing || isAuditing}
                            title="Refresh SEO data"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-white dark:bg-[#18221E] hover:bg-[#F7F8F6] dark:hover:bg-[#1F2D27] text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4] transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    )}

                    {onRunAudit && (
                        <button
                            type="button"
                            onClick={onRunAudit}
                            disabled={isAuditing}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
                        >
                            {isAuditing ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : (
                                <Play size={13} className="fill-current" />
                            )}
                            <span>{isAuditing ? 'Auditing...' : 'Run New Audit'}</span>
                        </button>
                    )}

                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
