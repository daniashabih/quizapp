import React, { useState } from 'react';
import {
    Globe,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    Sparkles,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    Database,
    TrendingUp
} from 'lucide-react';
import { HealthRadialGauge, MetricCard, SearchTrendChart } from './SeoCharts';
import { formatSeoTimestamp, getPriorityBadgeClasses, getScoreTierInfo, getStatusBadgeClasses } from './seoUtils';

export default function SeoOverviewSection({ data, onNavigate, onInspectIssue }) {
    const [expandedFormulaKey, setExpandedFormulaKey] = useState(null);

    const overview = data?.overview || {};
    const metrics = overview.metrics || [];
    const healthScore = data?.healthScore || { overall: 0, categories: [] };
    const searchPerformance = data?.searchPerformance || {};
    const indexing = data?.indexing || {};
    const aiVisibility = data?.aiVisibility || {};
    const recommendations = data?.recommendations?.items || [];
    const integrations = data?.project?.integrations || {};
    const tier = getScoreTierInfo(healthScore.overall || 0);

    const topPendingRecs = recommendations.filter(r => !r.isCompleted).slice(0, 3);
    const recentCriticalOrWarn = (data?.audit?.issues || []).filter(i => i.bucket === 'critical' || i.bucket === 'warning').slice(0, 3);

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Domain & Integration Status Banner */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#E5F2EC] dark:bg-[#1F352E] text-[#193D35] dark:text-emerald-300 flex items-center justify-center shrink-0 border border-[#BBE0CE] dark:border-[#2F806B]/40">
                        <Globe size={20} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                {overview.domain || 'www.hangbug.com'}
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E5F2EC] text-[#193D35] dark:bg-emerald-950/60 dark:text-emerald-300">
                                Hangbug Production Property
                            </span>
                        </div>
                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-0.5">
                            Last data update: <strong className="text-[#17221F] dark:text-[#F3F6F4]">{formatSeoTimestamp(overview.lastDataUpdate)}</strong>
                        </p>
                    </div>
                </div>

                {/* Live Integration Chips */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <button
                        type="button"
                        onClick={() => onNavigate('settings')}
                        className={`px-2.5 py-1 rounded-full font-semibold border cursor-pointer transition-colors ${
                            integrations.gscConnected
                                ? 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                : 'bg-[#F7F8F6] text-[#75817C] border-[#E4EAE6] dark:bg-[#1F2D27] dark:text-[#8FA69C] dark:border-[#2A3832]'
                        }`}
                    >
                        Search Console: {integrations.gscConnected ? 'Connected' : 'Not connected'}
                    </button>
                    <button
                        type="button"
                        onClick={() => onNavigate('settings')}
                        className={`px-2.5 py-1 rounded-full font-semibold border cursor-pointer transition-colors ${
                            integrations.ga4Connected
                                ? 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                : 'bg-[#FEF5E7] text-[#B45309] border-[#F8DFB6] dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
                        }`}
                    >
                        GA4 ({integrations.ga4TagMeasurementId || 'G-BSZBBFZZH0'}): {integrations.ga4Connected ? 'API Connected' : 'Tag Active / API Off'}
                    </button>
                    {(() => {
                        const psiStatus = integrations.pagespeedConnectionStatus
                            || (integrations.pagespeedConnected
                                ? 'Connected'
                                : integrations.pagespeedHasKey
                                    ? 'Configured (Not Tested)'
                                    : 'Not Configured');
                        const psiChipClass = psiStatus === 'Connected'
                            ? 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                            : psiStatus === 'Invalid API Key' || psiStatus === 'API Not Enabled' || psiStatus === 'Quota Exceeded' || psiStatus === 'Connection Error'
                                ? 'bg-[#FCEEED] text-[#B91C1C] border-[#F8C9C6] dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
                                : psiStatus === 'Configured (Not Tested)'
                                    ? 'bg-[#FEF5E7] text-[#B45309] border-[#F8DFB6] dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
                                    : 'bg-[#F7F8F6] text-[#75817C] border-[#E4EAE6] dark:bg-[#1F2D27] dark:text-[#8FA69C] dark:border-[#2A3832]';
                        return (
                            <button
                                type="button"
                                onClick={() => onNavigate('technical')}
                                className={`px-2.5 py-1 rounded-full font-semibold border cursor-pointer transition-colors ${psiChipClass}`}
                            >
                                PageSpeed: {psiStatus}
                            </button>
                        );
                    })()}
                    <button
                        type="button"
                        onClick={() => onNavigate('backlinks')}
                        className={`px-2.5 py-1 rounded-full font-semibold border cursor-pointer transition-colors ${
                            integrations.openPageRankConnected
                                ? 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                : integrations.openPageRankStatus === 'Invalid API Key' || integrations.openPageRankStatus === 'Quota Exceeded'
                                    ? 'bg-[#FCEEED] text-[#B91C1C] border-[#F8C9C6] dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
                                    : 'bg-[#F7F8F6] text-[#75817C] border-[#E4EAE6] dark:bg-[#1F2D27] dark:text-[#8FA69C] dark:border-[#2A3832]'
                        }`}
                    >
                        OpenPageRank: {integrations.openPageRankStatus || 'Not Configured'}
                    </button>
                </div>
            </div>

            {/* Website Overview Metrics Grid */}
            <section aria-label="Website Overview Metrics">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                        Website Overview
                    </h2>
                    <span className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                        Every metric displays its verified source and unavailability explanation
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {metrics.map((m) => (
                        <MetricCard
                            key={m.key}
                            metric={m}
                            onConfigureClick={() => onNavigate('settings')}
                        />
                    ))}
                </div>
            </section>

            {/* SEO Health Score (0-100) + 5 Categories */}
            <section className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-[#2F806B]" />
                            <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                SEO Health Score (0–100)
                            </h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${tier.bgClass}`}>
                                {tier.label}
                            </span>
                        </div>
                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-1 max-w-2xl">
                            {healthScore.methodologyNote}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => onNavigate('audit')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#193D35] dark:text-emerald-300 hover:underline cursor-pointer shrink-0"
                    >
                        <span>View full audit breakdown</span>
                        <ArrowRight size={13} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
                    <div className="lg:col-span-3 flex flex-col items-center text-center p-4 rounded-2xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <HealthRadialGauge score={healthScore.overall || 0} size={146} />
                        <p className="text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4] mt-3">
                            Composite Hangbug Score
                        </p>
                        <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] mt-1">
                            Source: {healthScore.source || 'Hangbug Audit Engine'}
                        </p>
                    </div>

                    <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {(healthScore.categories || []).map((cat) => {
                            const isExpanded = expandedFormulaKey === cat.key;
                            const barColor = cat.score >= 85 ? 'bg-[#2F806B]' : cat.score >= 65 ? 'bg-[#D19A45]' : 'bg-[#C96155]';
                            return (
                                <div
                                    key={cat.key}
                                    className="p-4 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6]/60 dark:bg-[#141D19]/70 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                                {cat.label}
                                            </span>
                                            <span className="text-sm font-display font-bold text-[#193D35] dark:text-emerald-300">
                                                {cat.score}/100
                                            </span>
                                        </div>

                                        <div className="mt-2 h-2 w-full rounded-full bg-[#E4EAE6] dark:bg-[#2A3832] overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                                style={{ width: `${cat.score}%` }}
                                            />
                                        </div>

                                        <p className="mt-2 text-[11px] text-[#75817C] dark:text-[#8FA69C] leading-relaxed">
                                            {cat.explanation}
                                        </p>
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-[#E4EAE6] dark:border-[#2A3832] flex items-center justify-between gap-2 text-[10px] text-[#75817C] dark:text-[#8FA69C]">
                                        <span className="truncate">
                                            {cat.source} ({cat.checksPassed}/{cat.checksTotal} checks)
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setExpandedFormulaKey(isExpanded ? null : cat.key)}
                                            className="inline-flex items-center gap-0.5 font-semibold text-[#2F806B] dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
                                        >
                                            <span>Formula</span>
                                            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-2 p-2.5 rounded-lg bg-white dark:bg-[#18221E] border border-[#E4EAE6] dark:border-[#2A3832] text-[11px] text-[#17221F] dark:text-[#B8CEC5]">
                                            <strong className="block text-[10px] uppercase text-[#75817C] mb-0.5">
                                                Calculation (Weight: {cat.weight}%)
                                            </strong>
                                            {cat.formula}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Row: Search Performance Preview + Google Indexing Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Search Performance Preview */}
                <div className="lg:col-span-7 bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={17} className="text-[#2F806B]" />
                            <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Organic Search Performance
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => onNavigate('search-performance')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F806B] dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                            <span>Full Search Report</span>
                            <ArrowRight size={13} />
                        </button>
                    </div>

                    {searchPerformance.connected ? (
                        <SearchTrendChart
                            data={searchPerformance.timeseries}
                            metricKey="clicks"
                            prevMetricKey="previousClicks"
                            label="Organic Clicks"
                            color="#193D35"
                        />
                    ) : (
                        <div className="p-5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-dashed border-[#E4EAE6] dark:border-[#2A3832] space-y-2">
                            <p className="text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                                Google Search Console Not Connected
                            </p>
                            <p className="text-xs text-[#75817C] dark:text-[#8FA69C] leading-relaxed">
                                {searchPerformance.reason}
                            </p>
                            <button
                                type="button"
                                onClick={() => onNavigate('settings')}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#193D35] dark:text-emerald-300 hover:underline cursor-pointer pt-1"
                            >
                                <span>Connect Google Search Console</span>
                                <ArrowRight size={12} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Google Indexing Overview Preview */}
                <div className="lg:col-span-5 bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6 shadow-[0_1px_3px_rgba(25,61,53,0.04)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                            <div className="flex items-center gap-2">
                                <Database size={17} className="text-[#2F806B]" />
                                <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    Page Indexing Overview
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => onNavigate('indexing')}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F806B] dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                                <span>Inspect URLs</span>
                                <ArrowRight size={13} />
                            </button>
                        </div>

                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <span className="text-[#75817C] dark:text-[#8FA69C]">Google Indexed (GSC)</span>
                                <span className="font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    {indexing.summary?.indexedPages?.value !== null && indexing.summary?.indexedPages?.value !== undefined
                                        ? indexing.summary.indexedPages.value
                                        : 'GSC not connected'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <span className="text-[#75817C] dark:text-[#8FA69C]">Crawlable Canonical Pages</span>
                                <span className="font-bold text-[#193D35] dark:text-emerald-300">
                                    {indexing.summary?.indexedPages?.crawlableReadyCount ?? 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <span className="text-[#75817C] dark:text-[#8FA69C]">301 Redirect Rules</span>
                                <span className="font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    {indexing.summary?.redirects?.value ?? 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <span className="text-[#75817C] dark:text-[#8FA69C]">Sitemap XML URLs</span>
                                <span className="font-bold text-[#193D35] dark:text-emerald-300">
                                    {indexing.summary?.sitemapStatus?.urlCount ?? 0} URLs
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] mt-3">
                        Source: {indexing.source || 'Hangbug Crawler'}
                    </p>
                </div>
            </div>

            {/* Bottom Row: Top Recommendations + Active Issues + AI Visibility Readiness */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Priority Actions */}
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 shadow-[0_1px_3px_rgba(25,61,53,0.04)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Top SEO Recommendations
                            </h2>
                            <button
                                type="button"
                                onClick={() => onNavigate('recommendations')}
                                className="text-xs font-semibold text-[#2F806B] dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                                View All
                            </button>
                        </div>

                        {topPendingRecs.length === 0 ? (
                            <div className="p-4 rounded-xl bg-[#E5F2EC]/50 dark:bg-[#1F352E]/50 text-xs text-[#193D35] dark:text-emerald-300 flex items-center gap-2">
                                <CheckCircle2 size={16} />
                                <span>All current recommendations have been completed.</span>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {topPendingRecs.map((rec) => (
                                    <div key={rec.recKey} className="p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mb-1 ${getPriorityBadgeClasses(rec.priority)}`}>
                                            {rec.priority}
                                        </span>
                                        <p className="text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                                            {rec.title}
                                        </p>
                                        <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] mt-0.5 line-clamp-2">
                                            {rec.suggestedAction}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Findings */}
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 shadow-[0_1px_3px_rgba(25,61,53,0.04)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Issues Needing Attention
                            </h2>
                            <button
                                type="button"
                                onClick={() => onNavigate('audit')}
                                className="text-xs font-semibold text-[#2F806B] dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                                Audit Center
                            </button>
                        </div>

                        {recentCriticalOrWarn.length === 0 ? (
                            <div className="p-4 rounded-xl bg-[#E5F2EC]/50 dark:bg-[#1F352E]/50 text-xs text-[#193D35] dark:text-emerald-300 flex items-center gap-2">
                                <CheckCircle2 size={16} />
                                <span>No critical or warning issues found in the latest audit.</span>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {recentCriticalOrWarn.map((issue) => (
                                    <div key={issue.id} className="p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClasses(issue.status)}`}>
                                                {issue.status}
                                            </span>
                                            <span className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                                {issue.affectedCount} page(s)
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                                            {issue.title}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => onInspectIssue && onInspectIssue(issue)}
                                            className="mt-1.5 text-[11px] font-semibold text-[#2F806B] dark:text-emerald-400 hover:underline cursor-pointer"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Search Visibility Summary */}
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 shadow-[0_1px_3px_rgba(25,61,53,0.04)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                                <Sparkles size={16} className="text-[#2F806B]" />
                                <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    AI Search Visibility
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => onNavigate('ai-visibility')}
                                className="text-xs font-semibold text-[#2F806B] dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                                Details
                            </button>
                        </div>

                        {!aiVisibility.connected ? (
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                                    <AlertTriangle size={14} className="text-[#D19A45]" />
                                    <span>External Citation Provider Not Connected</span>
                                </div>
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] leading-relaxed">
                                    Live ChatGPT, Google AI Overviews, and Gemini citation counts are hidden instead of showing fake zeros.
                                </p>
                            </div>
                        ) : null}

                        <div className="mt-3 space-y-2">
                            {(aiVisibility.readinessChecks || []).slice(0, 3).map((chk) => (
                                <div key={chk.id} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-[#F7F8F6]/70 dark:bg-[#141D19]/70">
                                    <span className="text-[#17221F] dark:text-[#F3F6F4] truncate pr-2">{chk.label}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${getStatusBadgeClasses(chk.status)}`}>
                                        {chk.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
