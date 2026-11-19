import React, { useState } from 'react';
import { Link2, Upload, ExternalLink, Info } from 'lucide-react';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';
import { EmptyIntegrationCard } from './SeoCharts';

export default function SeoBacklinksSection({ data, domain, onDataUpdated, onNavigate }) {
    const [showImport, setShowImport] = useState(false);
    const [rawCsv, setRawCsv] = useState('');
    const [importing, setImporting] = useState(false);

    const backlinks = data?.backlinks || {};
    const summary = backlinks.summary || {};
    const domainsList = backlinks.referringDomainsList || [];
    const anchors = backlinks.topAnchors || [];

    const handleImport = async (e) => {
        e.preventDefault();
        const lines = rawCsv
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(Boolean);

        const items = [];
        for (const line of lines) {
            if (line.toLowerCase().startsWith('domain') || line.toLowerCase().startsWith('referring')) continue;
            const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
            if (parts[0]) {
                items.push({
                    referringDomain: parts[0],
                    linksCount: parseInt(parts[1] || '1', 10) || 1,
                    targetPage: parts[2] || '/',
                    anchorText: parts[3] || ''
                });
            }
        }

        if (items.length === 0) {
            toast.error('Enter at least one row formatted as: domain.com, linksCount, /target-page, anchorText');
            return;
        }

        setImporting(true);
        try {
            const res = await seoService.importBacklinks(domain, items);
            if (res?.success) {
                toast.success(res.message);
                setShowImport(false);
                setRawCsv('');
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to import backlinks.');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Header & Import Action */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Link2 size={17} className="text-[#2F806B]" />
                        <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            Backlinks &amp; Referring Domains
                        </h2>
                        {backlinks.isEstimated && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF5E7] text-[#B45309] border border-[#F8DFB6]">
                                Estimated
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-1">
                        Source: {backlinks.source || 'Not connected'}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowImport(prev => !prev)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] hover:bg-[#E5F2EC] dark:hover:bg-[#1F352E] text-xs font-semibold text-[#193D35] dark:text-emerald-300 transition-colors cursor-pointer shrink-0"
                >
                    <Upload size={13} />
                    <span>{showImport ? 'Hide GSC Links Importer' : 'Import GSC Links Export'}</span>
                </button>
            </div>

            {showImport && (
                <form onSubmit={handleImport} className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 space-y-3">
                    <div className="flex items-start gap-2 text-xs text-[#75817C] dark:text-[#8FA69C]">
                        <Info size={14} className="shrink-0 mt-0.5 text-[#2F806B]" />
                        <p>
                            Paste verified rows exported from Google Search Console → Links (`referringDomain, linksCount, targetPage, anchorText`). Stored securely in MongoDB for both Web and Mobile.
                        </p>
                    </div>
                    <textarea
                        rows={5}
                        value={rawCsv}
                        onChange={(e) => setRawCsv(e.target.value)}
                        placeholder={'github.com, 4, /, Hangbug Quiz Platform\ndev.to, 2, /blog/javascript-fundamentals-beginners-guide, JavaScript guide'}
                        className="w-full p-3 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] font-mono text-xs text-[#17221F] dark:text-[#F3F6F4]"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowImport(false)}
                            className="px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] text-xs font-semibold cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={importing}
                            className="px-4 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
                        >
                            {importing ? 'Saving...' : 'Save Verified Links'}
                        </button>
                    </div>
                </form>
            )}

            {!backlinks.connected ? (
                <EmptyIntegrationCard
                    title="No Backlink Provider Connected Yet"
                    description={backlinks.reason}
                    source="Google Search Console Links Export / OpenPageRank"
                    onConfigure={() => onNavigate('settings')}
                />
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                            <p className="text-xs text-[#75817C]">Referring Domains</p>
                            <p className="text-2xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                {summary.referringDomains !== null && summary.referringDomains !== undefined ? summary.referringDomains : 'Requires GSC Export'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                            <p className="text-xs text-[#75817C]">Total Backlinks</p>
                            <p className="text-2xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                {summary.totalBacklinks !== null && summary.totalBacklinks !== undefined ? summary.totalBacklinks : 'Requires GSC Export'}
                            </p>
                        </div>
                        {summary.domainRankScore !== null && summary.domainRankScore !== undefined && (
                            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                                <p className="text-xs text-[#75817C]">OpenPageRank Score (Est.)</p>
                                <p className="text-2xl font-display font-bold text-[#2F806B] mt-1">{summary.domainRankScore}/10</p>
                            </div>
                        )}
                        {summary.globalRank !== null && summary.globalRank !== undefined && (
                            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                                <p className="text-xs text-[#75817C]">Global Domain Rank (Est.)</p>
                                <p className="text-2xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                    #{summary.globalRank.toLocaleString('en-US')}
                                </p>
                            </div>
                        )}
                    </div>

                    {domainsList.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] overflow-hidden">
                                <div className="p-4 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                                    <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                        Top Referring Domains
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C]">
                                            <tr>
                                                <th className="py-2.5 px-4">Referring Domain</th>
                                                <th className="py-2.5 px-3 text-right">Links</th>
                                                <th className="py-2.5 px-4">Target Page</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                                            {domainsList.map((d, idx) => (
                                                <tr key={`${d.referringDomain}-${idx}`}>
                                                    <td className="py-2.5 px-4 font-semibold flex items-center gap-1.5">
                                                        <span>{d.referringDomain}</span>
                                                        <ExternalLink size={11} className="text-[#75817C]" />
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-semibold">{d.linksCount}</td>
                                                    <td className="py-2.5 px-4 font-mono text-[#2F806B]">{d.targetPage}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5">
                                <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mb-3">
                                    Top Anchor Texts
                                </h3>
                                {anchors.length === 0 ? (
                                    <p className="text-xs text-[#75817C]">No anchor texts included in import.</p>
                                ) : (
                                    <div className="space-y-2 text-xs">
                                        {anchors.map((a) => (
                                            <div key={a.anchor} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19]">
                                                <span className="truncate pr-2">{a.anchor}</span>
                                                <span className="font-bold text-[#193D35] dark:text-emerald-300">{a.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
