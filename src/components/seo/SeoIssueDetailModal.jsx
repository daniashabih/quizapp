import React from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    AlertTriangle,
    HelpCircle,
    FileCode2,
    Wrench,
    CheckCircle2,
    ExternalLink,
    ShieldAlert
} from 'lucide-react';
import { getStatusBadgeClasses, formatSeoTimestamp } from './seoUtils';

/**
 * Plain-English 6-Part SEO Report Detail Modal:
 * 1. What is the issue?
 * 2. Why does it matter?
 * 3. Which page is affected?
 * 4. How serious is it?
 * 5. What should be done?
 * 6. How can it be fixed?
 */
export default function SeoIssueDetailModal({ issue, siteUrl = 'https://www.hangbug.com', onClose }) {
    if (!issue) return null;

    const modal = (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white dark:bg-[#18221E] border border-[#E4EAE6] dark:border-[#2A3832] rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#E4EAE6] dark:border-[#2A3832] flex items-start justify-between gap-4 bg-[#F7F8F6] dark:bg-[#141D19]">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClasses(issue.status)}`}>
                                {issue.status}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#18221E] border border-[#E4EAE6] dark:border-[#2A3832] text-[#75817C] dark:text-[#8FA69C] capitalize">
                                {issue.type}
                            </span>
                            <span className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                Severity: <strong className="text-[#17221F] dark:text-[#F3F6F4]">{issue.severity}</strong>
                            </span>
                        </div>
                        <h2 className="text-lg font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            {issue.title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close issue details"
                        className="p-1.5 rounded-lg text-[#75817C] hover:text-[#17221F] dark:hover:text-white hover:bg-[#E4EAE6]/50 dark:hover:bg-[#2A3832] transition-colors cursor-pointer shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-5 text-sm">
                    {/* 1. What is the issue? */}
                    <div className="p-4 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#193D35] dark:text-emerald-300 mb-1.5">
                            <AlertTriangle size={14} />
                            <span>1. What is the issue?</span>
                        </div>
                        <p className="text-[#17221F] dark:text-[#F3F6F4] leading-relaxed text-xs sm:text-sm">
                            {issue.whatIsIssue}
                        </p>
                    </div>

                    {/* 2. Why does it matter? */}
                    <div className="p-4 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#193D35] dark:text-emerald-300 mb-1.5">
                            <HelpCircle size={14} />
                            <span>2. Why does it matter?</span>
                        </div>
                        <p className="text-[#17221F] dark:text-[#B8CEC5] leading-relaxed text-xs sm:text-sm">
                            {issue.whyItMatters}
                        </p>
                    </div>

                    {/* 4. How serious is it? */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-white dark:bg-[#18221E]">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#75817C] dark:text-[#8FA69C] mb-1">
                                <ShieldAlert size={13} />
                                <span>4. How serious is it?</span>
                            </div>
                            <p className="text-sm font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                {issue.severity} ({issue.status})
                            </p>
                        </div>
                        <div className="p-3.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-white dark:bg-[#18221E]">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-[#75817C] dark:text-[#8FA69C] mb-1">
                                Affected Pages
                            </div>
                            <p className="text-sm font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                {issue.affectedCount || 0} page(s)
                            </p>
                        </div>
                    </div>

                    {/* 3. Which page(s) are affected? */}
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#193D35] dark:text-emerald-300 mb-2">
                            <FileCode2 size={14} />
                            <span>3. Affected Pages ({issue.affectedCount || 0})</span>
                        </div>
                        {Array.isArray(issue.affectedUrls) && issue.affectedUrls.length > 0 ? (
                            <div className="border border-[#E4EAE6] dark:border-[#2A3832] rounded-xl divide-y divide-[#E4EAE6] dark:divide-[#2A3832] max-h-48 overflow-y-auto">
                                {issue.affectedUrls.map((item, idx) => {
                                    const href = item.url?.startsWith('http') ? item.url : `${siteUrl}${item.url?.startsWith('/') ? '' : '/'}${item.url || ''}`;
                                    return (
                                        <div key={`${item.url}-${idx}`} className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
                                            <div className="min-w-0">
                                                <p className="font-mono font-medium text-[#17221F] dark:text-[#F3F6F4] truncate">
                                                    {item.url}
                                                </p>
                                                {item.detail && (
                                                    <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] mt-0.5">
                                                        {item.detail}
                                                    </p>
                                                )}
                                            </div>
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg text-[#2F806B] dark:text-emerald-400 hover:bg-[#E5F2EC] dark:hover:bg-[#1F352E] shrink-0"
                                                title="Open page"
                                            >
                                                <ExternalLink size={13} />
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-3 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] text-xs text-[#75817C] dark:text-[#8FA69C]">
                                No affected error pages — check passed across all audited URLs.
                            </div>
                        )}
                    </div>

                    {/* 5. What should be done? */}
                    <div className="p-4 rounded-xl bg-[#E5F2EC]/60 dark:bg-[#1F352E]/60 border border-[#BBE0CE] dark:border-[#2A3832]">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#193D35] dark:text-emerald-300 mb-1.5">
                            <CheckCircle2 size={14} />
                            <span>5. What should be done? (Recommended Action)</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#17221F] dark:text-[#F3F6F4] leading-relaxed font-medium">
                            {issue.recommendedAction}
                        </p>
                    </div>

                    {/* 6. How can it be fixed? */}
                    <div className="p-4 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-white dark:bg-[#141D19]">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#193D35] dark:text-emerald-300 mb-1.5">
                            <Wrench size={14} />
                            <span>6. How can it be fixed?</span>
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#17221F] dark:text-[#B8CEC5] leading-relaxed">
                            {issue.howToFix}
                        </pre>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] flex items-center justify-between gap-3 text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                    <span>Source: {issue.source || 'Hangbug SEO Crawler'} · Checked {formatSeoTimestamp(issue.checkedAt)}</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modal, document.body);
    }
    return modal;
}
