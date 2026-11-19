import React, { useMemo, useState } from 'react';
import {
    Play,
    RefreshCw,
    Filter,
    Eye,
    AlertOctagon,
    AlertTriangle,
    Lightbulb,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import { formatSeoTimestamp, getStatusBadgeClasses } from './seoUtils';

const BUCKETS = [
    { id: 'all', label: 'All Findings', icon: ShieldCheck },
    { id: 'critical', label: 'Critical Issues', icon: AlertOctagon },
    { id: 'warning', label: 'Warnings', icon: AlertTriangle },
    { id: 'opportunity', label: 'Optimization Opportunities', icon: Lightbulb },
    { id: 'passed', label: 'Passed Checks', icon: CheckCircle2 }
];

export default function SeoAuditSection({ data, isAuditing, onRunAudit, onInspectIssue }) {
    const [activeBucket, setActiveBucket] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const audit = data?.audit || {};
    const issues = audit.issues || [];

    const bucketCounts = useMemo(() => ({
        all: issues.length,
        critical: issues.filter(i => i.bucket === 'critical').length,
        warning: issues.filter(i => i.bucket === 'warning').length,
        opportunity: issues.filter(i => i.bucket === 'opportunity').length,
        passed: issues.filter(i => i.bucket === 'passed').length
    }), [issues]);

    const filteredIssues = useMemo(() => {
        return issues.filter((i) => {
            if (activeBucket !== 'all' && i.bucket !== activeBucket) return false;
            if (severityFilter !== 'all' && String(i.severity || '').toLowerCase() !== severityFilter) return false;
            if (typeFilter !== 'all' && String(i.type || '').toLowerCase() !== typeFilter) return false;
            return true;
        });
    }, [issues, activeBucket, severityFilter, typeFilter]);

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Audit Top Action Banner */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            Hangbug SEO Audit Center
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E5F2EC] text-[#193D35] dark:bg-emerald-950/60 dark:text-emerald-300">
                            Read-Only (Safe)
                        </span>
                    </div>
                    <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-1">
                        Scanned <strong className="text-[#17221F] dark:text-[#F3F6F4]">{audit.pagesScanned || 0} pages</strong> · Source: {audit.source || 'Hangbug Crawler'} · Last run: {formatSeoTimestamp(audit.createdAt)}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onRunAudit}
                    disabled={isAuditing}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer shrink-0"
                >
                    {isAuditing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={13} className="fill-current" />}
                    <span>{isAuditing ? 'Running Live Audit...' : 'Run New Audit'}</span>
                </button>
            </div>

            {/* Category Bucket Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {BUCKETS.map((b) => {
                    const Icon = b.icon;
                    const active = activeBucket === b.id;
                    return (
                        <button
                            key={b.id}
                            type="button"
                            onClick={() => setActiveBucket(b.id)}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                active
                                    ? 'bg-[#E5F2EC] dark:bg-[#1F352E] border-[#2F806B] text-[#193D35] dark:text-emerald-300'
                                    : 'bg-white dark:bg-[#18221E] border-[#E4EAE6] dark:border-[#2A3832] text-[#17221F] dark:text-[#F3F6F4] hover:border-[#2F806B]/50'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <Icon size={15} className={active ? 'text-[#193D35] dark:text-emerald-300' : 'text-[#75817C]'} />
                                <span className="text-lg font-display font-bold">{bucketCounts[b.id]}</span>
                            </div>
                            <p className="text-[11px] font-semibold mt-1.5 truncate">{b.label}</p>
                        </button>
                    );
                })}
            </div>

            {/* Severity & Type Filters */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                    <Filter size={14} className="text-[#2F806B]" />
                    <span>Filter Findings ({filteredIssues.length})</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-[#17221F] dark:text-[#F3F6F4]"
                    >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                        <option value="info">Passed / Info</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-[#17221F] dark:text-[#F3F6F4]"
                    >
                        <option value="all">All Issue Types</option>
                        <option value="technical">Technical</option>
                        <option value="on-page">On-page</option>
                        <option value="content">Content</option>
                        <option value="indexing">Indexing</option>
                        <option value="linking">Internal Linking</option>
                        <option value="performance">Performance</option>
                    </select>
                </div>
            </div>

            {/* Issue Cards */}
            <div className="space-y-3.5">
                {filteredIssues.length === 0 ? (
                    <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-8 text-center text-xs text-[#75817C] dark:text-[#8FA69C]">
                        No issues match the selected filters.
                    </div>
                ) : (
                    filteredIssues.map((issue) => (
                        <div
                            key={issue.id}
                            className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 hover:border-[#2F806B]/50 transition-all shadow-[0_1px_3px_rgba(25,61,53,0.03)]"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClasses(issue.status)}`}>
                                            {issue.status}
                                        </span>
                                        <span className="text-[11px] font-medium text-[#75817C] dark:text-[#8FA69C]">
                                            Severity: <strong className="text-[#17221F] dark:text-[#F3F6F4]">{issue.severity}</strong>
                                        </span>
                                        <span className="text-[11px] text-[#75817C] dark:text-[#8FA69C] capitalize">
                                            · {issue.type}
                                        </span>
                                        <span className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                            · {issue.affectedCount || 0} affected page(s)
                                        </span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                        {issue.title}
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onInspectIssue(issue)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] hover:bg-[#E5F2EC] dark:hover:bg-[#1F352E] text-xs font-semibold text-[#193D35] dark:text-emerald-300 transition-colors cursor-pointer shrink-0"
                                >
                                    <Eye size={13} />
                                    <span>View Details</span>
                                </button>
                            </div>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19]">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#75817C] dark:text-[#8FA69C] mb-1">
                                        What is the issue? &amp; Why it matters
                                    </span>
                                    <p className="text-[#17221F] dark:text-[#F3F6F4] leading-relaxed">
                                        {issue.whatIsIssue} {issue.whyItMatters}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-[#E5F2EC]/50 dark:bg-[#1F352E]/50">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#193D35] dark:text-emerald-300 mb-1">
                                        Recommended Fix
                                    </span>
                                    <p className="text-[#17221F] dark:text-[#B8CEC5] leading-relaxed">
                                        {issue.recommendedAction}
                                    </p>
                                </div>
                            </div>

                            {Array.isArray(issue.affectedUrls) && issue.affectedUrls.length > 0 && (
                                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                                    <span className="text-[#75817C] dark:text-[#8FA69C] font-medium">Affected URLs:</span>
                                    {issue.affectedUrls.slice(0, 4).map((u, idx) => (
                                        <span
                                            key={`${u.url}-${idx}`}
                                            className="px-2 py-0.5 rounded-md bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] font-mono text-[#17221F] dark:text-[#F3F6F4]"
                                        >
                                            {u.url}
                                        </span>
                                    ))}
                                    {issue.affectedUrls.length > 4 && (
                                        <button
                                            type="button"
                                            onClick={() => onInspectIssue(issue)}
                                            className="text-[#2F806B] dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                                        >
                                            +{issue.affectedUrls.length - 4} more
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
