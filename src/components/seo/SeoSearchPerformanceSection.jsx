import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Activity, ArrowRight } from 'lucide-react';
import { SearchTrendChart, EmptyIntegrationCard } from './SeoCharts';
import { getSeoTelemetrySnapshot } from '../../utils/analytics';

const PRESET_RANGES = [
    { id: '7d', label: 'Last 7 days' },
    { id: '28d', label: 'Last 28 days' },
    { id: '3m', label: 'Last 3 months' },
    { id: '6m', label: 'Last 6 months' },
    { id: 'custom', label: 'Custom range' }
];

export default function SeoSearchPerformanceSection({
    data,
    dateRange,
    customStart,
    customEnd,
    onChangeDateRange,
    onApplyCustomRange,
    onNavigate
}) {
    const [localStart, setLocalStart] = useState(customStart || '');
    const [localEnd, setLocalEnd] = useState(customEnd || '');

    const gsc = data?.searchPerformance || {};
    const ga4 = data?.analyticsOverview || {};
    const summary = gsc.summary || {};
    const timeseries = gsc.timeseries || [];
    const localTelemetry = typeof window !== 'undefined' ? getSeoTelemetrySnapshot() : null;

    const kpis = gsc.connected
        ? [
            {
                key: 'clicks',
                label: 'Organic Clicks',
                value: (summary.totalClicks ?? 0).toLocaleString('en-US'),
                delta: summary.clicksChangePct,
                suffix: '%'
            },
            {
                key: 'impressions',
                label: 'Organic Impressions',
                value: (summary.totalImpressions ?? 0).toLocaleString('en-US'),
                delta: summary.impressionsChangePct,
                suffix: '%'
            },
            {
                key: 'position',
                label: 'Average Position',
                value: summary.averagePosition ?? '-',
                delta: summary.positionDelta,
                suffix: ' pos',
                note: 'Lower rank number is better'
            },
            {
                key: 'ctr',
                label: 'Click-Through Rate',
                value: `${summary.averageCtr ?? 0}%`,
                delta: summary.ctrDelta,
                suffix: ' pts'
            }
        ]
        : [];

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Date Range Filter Bar */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div className="flex items-center gap-2 text-xs text-[#75817C] dark:text-[#8FA69C]">
                    <Calendar size={15} className="text-[#2F806B]" />
                    <span>
                        Active Window:{' '}
                        <strong className="text-[#17221F] dark:text-[#F3F6F4]">
                            {gsc.dateRange?.startDate || '—'} to {gsc.dateRange?.endDate || '—'}
                        </strong>
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    {PRESET_RANGES.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => onChangeDateRange(r.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                                dateRange === r.id
                                    ? 'bg-[#193D35] text-white'
                                    : 'bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C] dark:text-[#8FA69C] hover:text-[#17221F] dark:hover:text-white border border-[#E4EAE6] dark:border-[#2A3832]'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Date Range Picker */}
            {dateRange === 'custom' && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (localStart && localEnd) {
                            onApplyCustomRange(localStart, localEnd);
                        }
                    }}
                    className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4 flex flex-wrap items-end gap-3"
                >
                    <div>
                        <label className="block text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C] mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={localStart}
                            onChange={(e) => setLocalStart(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs text-[#17221F] dark:text-[#F3F6F4]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C] mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={localEnd}
                            onChange={(e) => setLocalEnd(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs text-[#17221F] dark:text-[#F3F6F4]"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Apply Date Range
                    </button>
                </form>
            )}

            {/* Google Search Console Section */}
            {!gsc.connected ? (
                <EmptyIntegrationCard
                    title="Connect Google Search Console for Verified Search Charts"
                    description={gsc.reason || 'Connect Google Search Console in Settings to view real Organic Clicks, Organic Impressions, Average Position, CTR, and period-over-period comparisons.'}
                    source="Google Search Console API"
                    onConfigure={() => onNavigate('settings')}
                />
            ) : (
                <>
                    {/* Summary KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {kpis.map((kpi) => {
                            const hasDelta = gsc.comparisonAvailable && kpi.delta !== null && kpi.delta !== undefined;
                            const isGood = hasDelta && kpi.delta >= 0;
                            return (
                                <div key={kpi.key} className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                                    <p className="text-xs font-semibold text-[#75817C] dark:text-[#8FA69C]">
                                        {kpi.label}
                                    </p>
                                    <div className="mt-2 flex items-baseline gap-2.5">
                                        <span className="text-2xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                            {kpi.value}
                                        </span>
                                        {hasDelta && (
                                            <span
                                                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                                    isGood
                                                        ? 'bg-[#E5F2EC] text-[#193D35] dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : 'bg-[#FCEEED] text-[#B91C1C] dark:bg-red-950/50 dark:text-red-300'
                                                }`}
                                            >
                                                {isGood ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                                {kpi.delta > 0 ? `+${kpi.delta}` : kpi.delta}{kpi.suffix}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-[#75817C] dark:text-[#8FA69C] mt-2">
                                        {kpi.note || `Verified GSC (${gsc.property})`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* 4 Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    Organic Clicks
                                </h3>
                                <span className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Dashed = prior period</span>
                            </div>
                            <SearchTrendChart data={timeseries} metricKey="clicks" prevMetricKey="previousClicks" label="Clicks" color="#193D35" />
                        </div>

                        <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    Organic Impressions
                                </h3>
                                <span className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Dashed = prior period</span>
                            </div>
                            <SearchTrendChart data={timeseries} metricKey="impressions" prevMetricKey="previousImpressions" label="Impressions" color="#2F806B" />
                        </div>

                        <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    Average Search Position
                                </h3>
                                <span className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Lower = higher rank</span>
                            </div>
                            <SearchTrendChart data={timeseries} metricKey="position" prevMetricKey="previousPosition" label="Avg Position" color="#D19A45" invertY />
                        </div>

                        <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    Click-Through Rate (CTR)
                                </h3>
                                <span className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Percentage %</span>
                            </div>
                            <SearchTrendChart data={timeseries} metricKey="ctr" prevMetricKey="previousCtr" label="CTR" color="#2F806B" unit="%" />
                        </div>
                    </div>
                </>
            )}

            {/* Google Analytics 4 Section */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <div className="flex items-center gap-2">
                        <Activity size={17} className="text-[#2F806B]" />
                        <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            Google Analytics 4 — Organic Traffic &amp; Engagement
                        </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-[#193D35] dark:text-emerald-300 bg-[#E5F2EC] dark:bg-[#1F352E] px-2.5 py-1 rounded-full">
                        Tag ID: {ga4.measurementId || 'G-BSZBBFZZH0'}
                    </span>
                </div>

                {ga4.connected && ga4.summary ? (
                    <div className="pt-4 space-y-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Organic Sessions</p>
                                <p className="text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                    {ga4.summary.organicSessions.toLocaleString('en-US')}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Active Organic Users</p>
                                <p className="text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                    {ga4.summary.organicUsers.toLocaleString('en-US')}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Engaged Sessions</p>
                                <p className="text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                    {ga4.summary.engagedSessions.toLocaleString('en-US')}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Engagement Rate</p>
                                <p className="text-xl font-display font-bold text-[#2F806B] dark:text-emerald-300 mt-1">
                                    {ga4.summary.engagementRate}%
                                </p>
                            </div>
                        </div>

                        {Array.isArray(ga4.topLandingPages) && ga4.topLandingPages.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-[#E4EAE6] dark:border-[#2A3832] text-[#75817C] dark:text-[#8FA69C]">
                                            <th className="py-2 pr-4 font-semibold">Organic Landing Page</th>
                                            <th className="py-2 px-3 font-semibold text-right">Sessions</th>
                                            <th className="py-2 px-3 font-semibold text-right">Active Users</th>
                                            <th className="py-2 pl-3 font-semibold text-right">Engagement Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                                        {ga4.topLandingPages.slice(0, 10).map((lp) => (
                                            <tr key={lp.path}>
                                                <td className="py-2.5 pr-4 font-mono text-[#17221F] dark:text-[#F3F6F4]">{lp.path}</td>
                                                <td className="py-2.5 px-3 text-right font-semibold">{lp.sessions}</td>
                                                <td className="py-2.5 px-3 text-right">{lp.users}</td>
                                                <td className="py-2.5 pl-3 text-right text-[#2F806B] font-semibold">{lp.engagementRate}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="pt-4 space-y-4">
                        <div className="p-4 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-xs text-[#75817C] dark:text-[#8FA69C] leading-relaxed">
                                {ga4.reason}
                            </p>
                            <button
                                type="button"
                                onClick={() => onNavigate('settings')}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#193D35] dark:text-emerald-300 hover:underline shrink-0 cursor-pointer"
                            >
                                <span>Configure GA4 API</span>
                                <ArrowRight size={12} />
                            </button>
                        </div>

                        {localTelemetry && (
                            <div className="p-4 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832]">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-xs font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                        Current Browser Session GA4 Telemetry Check
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F7F8F6] dark:bg-[#1F2D27] text-[#75817C] border border-[#E4EAE6] dark:border-[#2A3832]">
                                        Local Browser Only (Not Site-Wide)
                                    </span>
                                </div>
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                    Stream ID {localTelemetry.streamId} verified active. Channel detected for this session:{' '}
                                    <strong className="text-[#17221F] dark:text-[#F3F6F4]">
                                        {localTelemetry.sessionAttribution?.channel || 'Direct'}
                                    </strong>{' '}
                                    · Tracked events in this browser: {Object.values(localTelemetry.eventCounts || {}).reduce((a, b) => a + b, 0)}.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
