import React, { useMemo, useState } from 'react';
import { Search, ArrowUpDown, Info } from 'lucide-react';

export default function SeoKeywordsSection({ data, onNavigate }) {
    const [searchText, setSearchText] = useState('');
    const [intentFilter, setIntentFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [sortField, setSortField] = useState('impressions');
    const [sortDir, setSortDir] = useState('desc');

    const keywordsData = data?.keywords || {};
    const measuredQueries = keywordsData.measuredQueries || [];
    const targetKeywords = keywordsData.targetContentKeywords || [];
    const researchKeywords = keywordsData.researchKeywords || [];

    const combinedRows = useMemo(() => {
        const gscRows = measuredQueries.map((q) => ({
            ...q,
            dataType: 'measured_gsc',
            badgeLabel: 'Verified GSC'
        }));
        const targetRows = targetKeywords.map((t) => ({
            ...t,
            dataType: 'target_content',
            badgeLabel: 'On-Page Target'
        }));
        const estRows = researchKeywords.map((r) => ({
            ...r,
            dataType: 'estimated_research',
            badgeLabel: 'Estimated',
            isEstimated: true
        }));
        return [...gscRows, ...targetRows, ...estRows];
    }, [measuredQueries, targetKeywords, researchKeywords]);

    const filteredRows = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        return combinedRows
            .filter((row) => {
                if (sourceFilter === 'gsc' && row.dataType !== 'measured_gsc') return false;
                if (sourceFilter === 'target' && row.dataType !== 'target_content') return false;
                if (sourceFilter === 'estimated' && row.dataType !== 'estimated_research') return false;
                if (intentFilter !== 'all' && String(row.intent || '').toLowerCase() !== intentFilter) return false;
                if (q && !String(row.keyword || '').toLowerCase().includes(q) && !String(row.landingPage || '').toLowerCase().includes(q)) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                const av = a[sortField];
                const bv = b[sortField];
                if (av === null || av === undefined) return 1;
                if (bv === null || bv === undefined) return -1;
                const cmp = typeof av === 'string' ? av.localeCompare(bv) : Number(av) - Number(bv);
                return sortDir === 'asc' ? cmp : -cmp;
            });
    }, [combinedRows, searchText, intentFilter, sourceFilter, sortField, sortDir]);

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir(field === 'position' || field === 'keyword' ? 'asc' : 'desc');
        }
    };

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Transparency Notice */}
            <div className="bg-[#E5F2EC]/70 dark:bg-[#1F352E]/60 border border-[#BBE0CE] dark:border-[#2A3832] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 text-xs text-[#193D35] dark:text-[#F3F6F4]">
                    <Info size={16} className="shrink-0 mt-0.5 text-[#2F806B]" />
                    <div>
                        <p className="font-semibold">
                            Measured Search Console Queries vs. Target On-Page Keywords
                        </p>
                        <p className="text-[#75817C] dark:text-[#B8CEC5] mt-0.5 leading-relaxed">
                            {keywordsData.explanation}
                        </p>
                    </div>
                </div>
                {!keywordsData.gscConnected && (
                    <button
                        type="button"
                        onClick={() => onNavigate('settings')}
                        className="px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                    >
                        Connect Search Console
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75817C]" />
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Filter by keyword or landing page..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs text-[#17221F] dark:text-[#F3F6F4] focus:outline-none focus:border-[#193D35]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-[#17221F] dark:text-[#F3F6F4]"
                    >
                        <option value="all">All Sources ({combinedRows.length})</option>
                        <option value="gsc">Verified GSC Queries ({measuredQueries.length})</option>
                        <option value="target">On-Page Target Keywords ({targetKeywords.length})</option>
                    </select>

                    <select
                        value={intentFilter}
                        onChange={(e) => setIntentFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-[#17221F] dark:text-[#F3F6F4]"
                    >
                        <option value="all">All Intents</option>
                        <option value="informational">Informational</option>
                        <option value="transactional">Transactional</option>
                        <option value="navigational">Navigational</option>
                        <option value="commercial">Commercial</option>
                    </select>
                </div>
            </div>

            {/* Keyword Performance Table */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] overflow-hidden shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#F7F8F6] dark:bg-[#141D19] border-b border-[#E4EAE6] dark:border-[#2A3832] text-[#75817C] dark:text-[#8FA69C]">
                            <tr>
                                <th className="py-3 px-4 font-semibold">
                                    <button type="button" onClick={() => toggleSort('keyword')} className="inline-flex items-center gap-1 cursor-pointer hover:text-[#17221F]">
                                        <span>Keyword</span>
                                        <ArrowUpDown size={11} />
                                    </button>
                                </th>
                                <th className="py-3 px-3 font-semibold">Intent</th>
                                <th className="py-3 px-3 font-semibold text-right">
                                    <button type="button" onClick={() => toggleSort('position')} className="inline-flex items-center gap-1 cursor-pointer hover:text-[#17221F]">
                                        <span>Position</span>
                                        <ArrowUpDown size={11} />
                                    </button>
                                </th>
                                <th className="py-3 px-3 font-semibold text-right">
                                    <button type="button" onClick={() => toggleSort('impressions')} className="inline-flex items-center gap-1 cursor-pointer hover:text-[#17221F]">
                                        <span>Impressions</span>
                                        <ArrowUpDown size={11} />
                                    </button>
                                </th>
                                <th className="py-3 px-3 font-semibold text-right">
                                    <button type="button" onClick={() => toggleSort('clicks')} className="inline-flex items-center gap-1 cursor-pointer hover:text-[#17221F]">
                                        <span>Clicks</span>
                                        <ArrowUpDown size={11} />
                                    </button>
                                </th>
                                <th className="py-3 px-3 font-semibold text-right">
                                    <button type="button" onClick={() => toggleSort('ctr')} className="inline-flex items-center gap-1 cursor-pointer hover:text-[#17221F]">
                                        <span>CTR</span>
                                        <ArrowUpDown size={11} />
                                    </button>
                                </th>
                                <th className="py-3 px-3 font-semibold">Landing Page</th>
                                <th className="py-3 px-4 font-semibold">Data Source</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-10 px-4 text-center text-[#75817C] dark:text-[#8FA69C]">
                                        No keywords match your active filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row, idx) => (
                                    <tr key={`${row.keyword}-${row.landingPage}-${idx}`} className="hover:bg-[#F7F8F6]/70 dark:hover:bg-[#141D19]/70 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                                            {row.keyword}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7F8F6] dark:bg-[#1F2D27] border border-[#E4EAE6] dark:border-[#2A3832] text-[#75817C] dark:text-[#B8CEC5]">
                                                {row.intent}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right font-medium text-[#17221F] dark:text-[#F3F6F4]">
                                            {row.position !== null && row.position !== undefined ? row.position : 'Requires GSC'}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            {row.impressions !== null && row.impressions !== undefined ? row.impressions.toLocaleString('en-US') : 'Requires GSC'}
                                        </td>
                                        <td className="py-3 px-3 text-right font-semibold text-[#193D35] dark:text-emerald-300">
                                            {row.clicks !== null && row.clicks !== undefined ? row.clicks.toLocaleString('en-US') : '—'}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            {row.ctr !== null && row.ctr !== undefined ? `${row.ctr}%` : '—'}
                                        </td>
                                        <td className="py-3 px-3 font-mono text-[11px] text-[#2F806B] dark:text-emerald-400">
                                            {row.landingPage}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                    row.dataType === 'measured_gsc'
                                                        ? 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : row.isEstimated
                                                            ? 'bg-[#FEF5E7] text-[#B45309] border-[#F8DFB6]'
                                                            : 'bg-[#F7F8F6] text-[#75817C] border-[#E4EAE6] dark:bg-[#1F2D27] dark:text-[#8FA69C] dark:border-[#2A3832]'
                                                }`}
                                            >
                                                {row.badgeLabel}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
