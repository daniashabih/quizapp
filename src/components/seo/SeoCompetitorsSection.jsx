import React, { useState } from 'react';
import {
    Users,
    Plus,
    RefreshCw,
    Trash2,
    ExternalLink,
    Info
} from 'lucide-react';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';
import { formatSeoTimestamp } from './seoUtils';

export default function SeoCompetitorsSection({ data, domain, onDataUpdated }) {
    const [competitorDomain, setCompetitorDomain] = useState('');
    const [label, setLabel] = useState('');
    const [adding, setAdding] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const competitorsData = data?.competitors || {};
    const items = competitorsData.items || [];

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!competitorDomain.trim()) return;
        setAdding(true);
        try {
            const res = await seoService.addCompetitor({
                domain,
                competitorDomain: competitorDomain.trim(),
                label: label.trim()
            });
            if (res?.success) {
                toast.success(res.message || 'Competitor added.');
                setCompetitorDomain('');
                setLabel('');
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Unable to analyze competitor domain.');
        } finally {
            setAdding(false);
        }
    };

    const handleRefresh = async (id) => {
        setBusyId(id);
        try {
            const res = await seoService.refreshCompetitor(id, domain);
            if (res?.success) {
                toast.success(res.message || 'Competitor refreshed.');
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to refresh competitor.');
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (id) => {
        setBusyId(id);
        try {
            const res = await seoService.deleteCompetitor(id, domain);
            if (res?.success) {
                toast.info('Competitor removed.');
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to remove competitor.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Transparency Banner */}
            <div className="bg-[#E5F2EC]/70 dark:bg-[#1F352E]/60 border border-[#BBE0CE] dark:border-[#2A3832] rounded-2xl p-4 flex items-start gap-2.5 text-xs text-[#193D35] dark:text-[#F3F6F4]">
                <Info size={16} className="shrink-0 mt-0.5 text-[#2F806B]" />
                <p className="leading-relaxed">
                    {competitorsData.explanation}
                </p>
            </div>

            {/* Add Competitor Form */}
            <form
                onSubmit={handleAdd}
                className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 space-y-4 shadow-[0_1px_3px_rgba(25,61,53,0.04)]"
            >
                <div className="flex items-center gap-2">
                    <Users size={17} className="text-[#2F806B]" />
                    <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                        Add Competitor Website to Compare
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5">
                        <input
                            type="text"
                            value={competitorDomain}
                            onChange={(e) => setCompetitorDomain(e.target.value)}
                            placeholder="Competitor domain (e.g. w3schools.com)"
                            required
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs text-[#17221F] dark:text-[#F3F6F4]"
                        />
                    </div>
                    <div className="sm:col-span-4">
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Label (optional, e.g. Coding Tutorials)"
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs text-[#17221F] dark:text-[#F3F6F4]"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <button
                            type="submit"
                            disabled={adding}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                        >
                            {adding ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={14} />}
                            <span>{adding ? 'Analyzing...' : 'Add & Compare'}</span>
                        </button>
                    </div>
                </div>
            </form>

            {/* Competitor Comparison List */}
            {items.length === 0 ? (
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-dashed border-[#E4EAE6] dark:border-[#2A3832] p-8 text-center text-xs text-[#75817C] dark:text-[#8FA69C]">
                    No competitor websites added yet. Add a programming learning or quiz website above to compare content coverage, sitemaps, and topic gaps.
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((comp) => {
                        const snap = comp.snapshot || {};
                        const thirdParty = snap.thirdPartyMetrics || {};
                        const isBusy = busyId === comp.id;
                        return (
                            <div
                                key={comp.id}
                                className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 space-y-4"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                                {comp.competitorDomain}
                                            </h3>
                                            <a
                                                href={`https://${comp.competitorDomain}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#75817C] hover:text-[#193D35]"
                                            >
                                                <ExternalLink size={13} />
                                            </a>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F7F8F6] dark:bg-[#1F2D27] border border-[#E4EAE6] dark:border-[#2A3832] text-[#75817C]">
                                                {snap.reachable ? `HTTP ${snap.httpStatus}` : 'Probe Unreachable'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-0.5">
                                            {snap.homepageTitle || 'No homepage title fetched'} · Checked {formatSeoTimestamp(comp.lastCheckedAt)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRefresh(comp.id)}
                                            disabled={isBusy}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] text-xs font-semibold hover:bg-[#F7F8F6] dark:hover:bg-[#141D19] cursor-pointer disabled:opacity-50"
                                        >
                                            <RefreshCw size={12} className={isBusy ? 'animate-spin' : ''} />
                                            <span>Refresh</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(comp.id)}
                                            disabled={isBusy}
                                            className="p-1.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] text-[#C96155] hover:bg-[#FCEEED] cursor-pointer disabled:opacity-50"
                                            title="Remove competitor"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                    <div className="p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19]">
                                        <p className="text-[11px] text-[#75817C]">Sitemap Coverage (Measured)</p>
                                        <p className="text-base font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                            {snap.sitemapEntriesDetected !== null && snap.sitemapEntriesDetected !== undefined
                                                ? `${snap.sitemapEntriesDetected.toLocaleString('en-US')} entries`
                                                : snap.hasSitemapXml ? 'Sitemap present' : 'Not exposed'}
                                        </p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19]">
                                        <p className="text-[11px] text-[#75817C]">Topic Coverage Overlap</p>
                                        <p className="text-base font-bold text-[#2F806B] mt-1">
                                            {(snap.detectedTopics || []).length} topics detected
                                        </p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19]">
                                        <p className="text-[11px] text-[#75817C]">
                                            Keyword Visibility {thirdParty.isEstimated ? '(Estimated)' : ''}
                                        </p>
                                        <p className="text-xs font-semibold text-[#75817C] dark:text-[#8FA69C] mt-1.5">
                                            {thirdParty.estimatedOrganicKeywords ?? 'Provider not connected'}
                                        </p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19]">
                                        <p className="text-[11px] text-[#75817C]">
                                            Domain Authority / Backlinks {thirdParty.isEstimated ? '(Estimated)' : ''}
                                        </p>
                                        <p className="text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4] mt-1.5">
                                            {thirdParty.domainAuthorityScore !== null && thirdParty.domainAuthorityScore !== undefined
                                                ? `OPR ${thirdParty.domainAuthorityScore}/10 (Est.)`
                                                : 'Provider not connected'}
                                        </p>
                                    </div>
                                </div>

                                {/* Topic Gaps vs Hangbug Advantages */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                    <div className="p-3.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832]">
                                        <p className="font-bold text-[#17221F] dark:text-[#F3F6F4] mb-1.5">
                                            Topic Gaps &amp; Ranking Opportunities for Hangbug
                                        </p>
                                        {(snap.topicGapsForHangbug || []).length === 0 ? (
                                            <p className="text-[#75817C]">Hangbug already covers the core topics detected on this competitor’s homepage.</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5">
                                                {snap.topicGapsForHangbug.map((t) => (
                                                    <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF5E7] text-[#B45309] border border-[#F8DFB6]">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832]">
                                        <p className="font-bold text-[#193D35] dark:text-emerald-300 mb-1.5">
                                            Hangbug Unique Topic Strengths
                                        </p>
                                        {(snap.hangbugUniqueAdvantages || []).length === 0 ? (
                                            <p className="text-[#75817C]">Run refresh after adding more Hangbug technology tracks.</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5">
                                                {snap.hangbugUniqueAdvantages.slice(0, 10).map((t) => (
                                                    <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E5F2EC] text-[#193D35] dark:bg-[#1F352E] dark:text-emerald-300">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
