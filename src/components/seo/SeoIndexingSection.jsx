import React, { useState } from 'react';
import {
    Database,
    Search,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    ExternalLink,
    FileCode2
} from 'lucide-react';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';
import { getStatusBadgeClasses } from './seoUtils';

export default function SeoIndexingSection({ data, domain, onNavigate }) {
    const [urlFilter, setUrlFilter] = useState('all'); // all | indexable | issues | redirects
    const [inspectTarget, setInspectTarget] = useState('/technologies/javascript');
    const [inspecting, setInspecting] = useState(false);
    const [inspectionResult, setInspectionResult] = useState(null);
    const [showUrlTable, setShowUrlTable] = useState(true);

    const indexing = data?.indexing || {};
    const summary = indexing.summary || {};
    const inventory = indexing.urlInventory || [];
    const redirectChecks = indexing.redirectChecks || [];
    const siteUrl = data?.project?.siteUrl || 'https://www.hangbug.com';

    const filteredInventory = inventory.filter((row) => {
        if (urlFilter === 'indexable') return row.httpStatus === 200 && !row.isNoindex;
        if (urlFilter === 'issues') return row.httpStatus >= 400 || row.httpStatus === 0 || row.isNoindex || !row.canonicalValid;
        return true;
    });

    const handleInspectUrl = async (targetPath) => {
        const clean = (targetPath || inspectTarget || '/').trim();
        if (!clean) return;
        setInspectTarget(clean);
        setInspecting(true);
        try {
            const res = await seoService.inspectUrl({ domain, url: clean });
            if (res?.success) {
                setInspectionResult(res.inspection);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'URL inspection failed.');
        } finally {
            setInspecting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Source & Explanation Header */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Database size={17} className="text-[#2F806B]" />
                        <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            Google Indexing Overview
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            indexing.gscConnected
                                ? getStatusBadgeClasses('Verified')
                                : getStatusBadgeClasses('Not checked')
                        }`}>
                            {indexing.gscConnected ? 'GSC Connected' : 'GSC Not Connected'}
                        </span>
                    </div>
                    <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-1 leading-relaxed">
                        {indexing.explanation}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            setUrlFilter('issues');
                            setShowUrlTable(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Inspect Affected URLs
                    </button>
                    {!indexing.gscConnected && (
                        <button
                            type="button"
                            onClick={() => onNavigate('settings')}
                            className="px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4] hover:border-[#2F806B] cursor-pointer"
                        >
                            Connect GSC
                        </button>
                    )}
                </div>
            </div>

            {/* 5 Indexing Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                    <p className="text-[11px] font-semibold uppercase text-[#75817C] dark:text-[#8FA69C]">Indexed Pages</p>
                    <p className="text-2xl font-display font-bold text-[#193D35] dark:text-emerald-300 mt-2">
                        {summary.indexedPages?.value !== null && summary.indexedPages?.value !== undefined
                            ? summary.indexedPages.value
                            : `${summary.indexedPages?.crawlableReadyCount ?? 0} Ready`}
                    </p>
                    <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] mt-1.5 leading-relaxed">
                        {summary.indexedPages?.explanation}
                    </p>
                </div>

                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                    <p className="text-[11px] font-semibold uppercase text-[#75817C] dark:text-[#8FA69C]">Not Indexed Pages</p>
                    <p className="text-2xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-2">
                        {summary.notIndexedPages?.value !== null && summary.notIndexedPages?.value !== undefined
                            ? summary.notIndexedPages.value
                            : `${summary.notIndexedPages?.crawlNoindexCount ?? 0} Excluded`}
                    </p>
                    <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] mt-1.5 leading-relaxed">
                        {summary.notIndexedPages?.explanation}
                    </p>
                </div>

                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                    <p className="text-[11px] font-semibold uppercase text-[#75817C] dark:text-[#8FA69C]">Pages With Redirects</p>
                    <p className="text-2xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-2">
                        {summary.redirects?.value ?? 0}
                    </p>
                    <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] mt-1.5 leading-relaxed">
                        {summary.redirects?.explanation}
                    </p>
                </div>

                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                    <p className="text-[11px] font-semibold uppercase text-[#75817C] dark:text-[#8FA69C]">Pages With Errors</p>
                    <p className={`text-2xl font-display font-bold mt-2 ${(summary.errors?.value ?? 0) > 0 ? 'text-[#C96155]' : 'text-[#2F806B]'}`}>
                        {summary.errors?.value ?? 0}
                    </p>
                    <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] mt-1.5 leading-relaxed">
                        {summary.errors?.explanation}
                    </p>
                </div>

                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                    <p className="text-[11px] font-semibold uppercase text-[#75817C] dark:text-[#8FA69C]">Sitemap Status</p>
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClasses(summary.sitemapStatus?.status)}`}>
                            {summary.sitemapStatus?.status || 'Unknown'}
                        </span>
                        <span className="text-sm font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            {summary.sitemapStatus?.urlCount ?? 0} URLs
                        </span>
                    </div>
                    <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] mt-1.5 leading-relaxed">
                        {summary.sitemapStatus?.explanation}
                    </p>
                </div>
            </div>

            {/* Live URL Inspector Tool */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5">
                <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mb-1">
                    Inspect Any Hangbug URL
                </h3>
                <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mb-3">
                    Check live HTTP status, canonical tag, meta robots, X-Robots-Tag, sitemap inclusion, and Google Search Console inspection status (when connected).
                </p>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleInspectUrl(inspectTarget);
                    }}
                    className="flex flex-col sm:flex-row gap-2.5"
                >
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75817C]" />
                        <input
                            type="text"
                            value={inspectTarget}
                            onChange={(e) => setInspectTarget(e.target.value)}
                            placeholder="/technologies/javascript or https://www.hangbug.com/blog/html-tutorial-for-beginners"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs font-mono text-[#17221F] dark:text-[#F3F6F4]"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={inspecting}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer shrink-0"
                    >
                        {inspecting ? <RefreshCw size={13} className="animate-spin" /> : <FileCode2 size={13} />}
                        <span>{inspecting ? 'Inspecting...' : 'Inspect URL'}</span>
                    </button>
                </form>

                {inspectionResult && (
                    <div className="mt-4 p-4 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                            <p className="font-bold text-[#193D35] dark:text-emerald-300">Live Crawl Inspection</p>
                            <p>URL: <span className="font-mono">{inspectionResult.crawl?.url}</span></p>
                            <p>HTTP Status: <strong>{inspectionResult.crawl?.httpStatus}</strong> ({inspectionResult.crawl?.responseTimeMs} ms)</p>
                            <p>Title: <strong>{inspectionResult.crawl?.title || 'Missing'}</strong></p>
                            <p>Canonical: <span className="font-mono">{inspectionResult.crawl?.canonicalUrl || 'Missing'}</span></p>
                            <p>Robots Meta: <strong>{inspectionResult.crawl?.robotsMeta || 'none'}</strong> · In Sitemap: <strong>{inspectionResult.crawl?.inSitemap ? 'Yes' : 'No'}</strong></p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="font-bold text-[#193D35] dark:text-emerald-300">Google Search Console URL Inspection</p>
                            {inspectionResult.gsc?.gscConnected && !inspectionResult.gsc?.error ? (
                                <>
                                    <p>Verdict: <strong>{inspectionResult.gsc.verdict}</strong></p>
                                    <p>Coverage State: <strong>{inspectionResult.gsc.coverageState}</strong></p>
                                    <p>Google Canonical: <span className="font-mono">{inspectionResult.gsc.googleCanonical || '—'}</span></p>
                                    <p>Last Crawl: <strong>{inspectionResult.gsc.lastCrawlTime || '—'}</strong></p>
                                </>
                            ) : (
                                <p className="text-[#75817C] dark:text-[#8FA69C]">
                                    {inspectionResult.gsc?.error || inspectionResult.gsc?.reason}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Audited URL Inventory Table */}
            {showUrlTable && (
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] overflow-hidden">
                    <div className="p-4 border-b border-[#E4EAE6] dark:border-[#2A3832] flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            URL Indexing Inventory ({filteredInventory.length})
                        </h3>
                        <div className="flex flex-wrap gap-1.5 text-xs">
                            {[
                                { id: 'all', label: `All (${inventory.length})` },
                                { id: 'indexable', label: 'Indexable' },
                                { id: 'issues', label: 'Affected / Needs Attention' },
                                { id: 'redirects', label: `Redirects (${redirectChecks.length})` }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setUrlFilter(tab.id)}
                                    className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                                        urlFilter === tab.id
                                            ? 'bg-[#193D35] text-white'
                                            : 'bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C] dark:text-[#8FA69C]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {urlFilter === 'redirects' ? (
                        <div className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                            {redirectChecks.map((r) => (
                                <div key={r.sourcePath} className="p-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                                    <div>
                                        <span className="font-mono font-semibold text-[#17221F] dark:text-[#F3F6F4]">{r.sourcePath}</span>
                                        <span className="mx-2 text-[#75817C]">→</span>
                                        <span className="font-mono text-[#2F806B]">{r.finalUrl}</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E5F2EC] text-[#193D35] dark:bg-emerald-950/60 dark:text-emerald-300">
                                        {r.redirectHops} hop(s) · HTTP {r.finalStatus}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#F7F8F6] dark:bg-[#141D19] border-b border-[#E4EAE6] dark:border-[#2A3832] text-[#75817C] dark:text-[#8FA69C]">
                                    <tr>
                                        <th className="py-2.5 px-4 font-semibold">Page Path</th>
                                        <th className="py-2.5 px-3 font-semibold">HTTP</th>
                                        <th className="py-2.5 px-3 font-semibold">Canonical</th>
                                        <th className="py-2.5 px-3 font-semibold">Sitemap</th>
                                        <th className="py-2.5 px-3 font-semibold">Words</th>
                                        <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                                    {filteredInventory.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-[#75817C]">
                                                No URLs match this filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInventory.map((row) => (
                                            <tr key={row.path} className="hover:bg-[#F7F8F6]/60 dark:hover:bg-[#141D19]/60">
                                                <td className="py-2.5 px-4 font-mono text-[#17221F] dark:text-[#F3F6F4]">{row.path}</td>
                                                <td className="py-2.5 px-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        row.httpStatus === 200 ? getStatusBadgeClasses('Good') : getStatusBadgeClasses('Critical')
                                                    }`}>
                                                        {row.httpStatus}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    {row.canonicalValid ? (
                                                        <span className="inline-flex items-center gap-1 text-[#2F806B] font-medium">
                                                            <CheckCircle2 size={12} /> Valid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[#B45309] font-medium">
                                                            <AlertTriangle size={12} /> Check
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3">{row.inSitemap ? 'Listed' : 'Excluded'}</td>
                                                <td className="py-2.5 px-3">{row.wordCount}</td>
                                                <td className="py-2.5 px-4 text-right space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleInspectUrl(row.path)}
                                                        className="text-[#193D35] dark:text-emerald-300 font-semibold hover:underline cursor-pointer"
                                                    >
                                                        Inspect
                                                    </button>
                                                    <a
                                                        href={`${siteUrl}${row.path === '/' ? '/' : row.path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-[#75817C] hover:text-[#17221F]"
                                                    >
                                                        <ExternalLink size={12} />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
