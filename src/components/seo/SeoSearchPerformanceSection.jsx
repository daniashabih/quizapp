import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Activity, ArrowRight } from 'lucide-react';
import { SearchTrendChart, EmptyIntegrationCard } from './SeoCharts';
import { getSeoTelemetrySnapshot } from '../../utils/analytics';

const PRESET_RANGES = [
    { id: '7d', label: 'Last 7 days' },
    { id: '28d', label: 'Last 28 days' },
    { id: '3m', label: 'Last 90 days' },
    { id: '6m', label: 'Last 6 months' },
    { id: '12m', label: 'Last 12 months' },
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
                            Google Analytics 4 — Traffic, Engagement &amp; Audience Breakdown
                        </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {ga4.propertyId && (
                            <span className="text-[11px] font-mono font-semibold text-[#193D35] dark:text-emerald-300 bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] px-2.5 py-1 rounded-full">
                                Property: properties/{ga4.propertyId}
                            </span>
                        )}
                        <span className="text-[11px] font-semibold text-[#193D35] dark:text-emerald-300 bg-[#E5F2EC] dark:bg-[#1F352E] px-2.5 py-1 rounded-full">
                            Tag ID: {ga4.measurementId || 'G-BSZBBFZZH0'}
                        </span>
                    </div>
                </div>

                {ga4.connected && ga4.summary ? (
                    <div className="pt-4 space-y-6">
                        {ga4.noDataMessage && (
                            <div className="p-3.5 rounded-xl bg-[#FEF5E7] dark:bg-amber-950/40 border border-[#F8DFB6] dark:border-amber-800/70 text-xs text-[#B45309] dark:text-amber-300">
                                {ga4.noDataMessage}
                            </div>
                        )}

                        {/* 7 Core GA4 KPI Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Active Users</p>
                                <p className="text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                    {(ga4.summary.activeUsers ?? ga4.summary.organicUsers ?? 0).toLocaleString('en-US')}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Total Users</p>
                                <p className="text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                    {(ga4.summary.totalUsers ?? 0).toLocaleString('en-US')}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Sessions</p>
                                <p className="text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                    {(ga4.summary.sessions ?? ga4.summary.organicSessions ?? 0).toLocaleString('en-US')}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">New Users</p>
                                <p className="text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                    {(ga4.summary.newUsers ?? 0).toLocaleString('en-US')}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Page Views</p>
                                <p className="text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                    {(ga4.summary.pageViews ?? 0).toLocaleString('en-US')}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Bounce Rate</p>
                                <p className="text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1">
                                    {ga4.summary.bounceRate ?? 0}%
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">Avg Engagement</p>
                                <p className="text-xl font-display font-bold text-[#2F806B] dark:text-emerald-300 mt-1">
                                    {ga4.summary.avgEngagementTimeFormatted || '0s'}
                                </p>
                            </div>
                        </div>

                        {/* Top Landing Pages & Traffic Sources */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="p-4 rounded-xl bg-[#F7F8F6]/60 dark:bg-[#141D19]/70 border border-[#E4EAE6] dark:border-[#2A3832]">
                                <h4 className="text-xs font-bold text-[#17221F] dark:text-[#F3F6F4] mb-3">
                                    Top Landing Pages
                                </h4>
                                {Array.isArray(ga4.topLandingPages) && ga4.topLandingPages.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-[#E4EAE6] dark:border-[#2A3832] text-[#75817C] dark:text-[#8FA69C]">
                                                    <th className="py-2 pr-3 font-semibold">Landing Page</th>
                                                    <th className="py-2 px-2 font-semibold text-right">Sessions</th>
                                                    <th className="py-2 px-2 font-semibold text-right">Users</th>
                                                    <th className="py-2 pl-2 font-semibold text-right">Engagement</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                                                {ga4.topLandingPages.slice(0, 10).map((lp) => (
                                                    <tr key={lp.path}>
                                                        <td className="py-2 pr-3 font-mono text-[11px] text-[#17221F] dark:text-[#F3F6F4] max-w-[200px] truncate" title={lp.path}>{lp.path}</td>
                                                        <td className="py-2 px-2 text-right font-semibold">{lp.sessions}</td>
                                                        <td className="py-2 px-2 text-right">{lp.activeUsers ?? lp.users}</td>
                                                        <td className="py-2 pl-2 text-right text-[#2F806B] font-semibold">{lp.engagementRate}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#75817C]">No landing page rows returned for this date range.</p>
                                )}
                            </div>

                            <div className="p-4 rounded-xl bg-[#F7F8F6]/60 dark:bg-[#141D19]/70 border border-[#E4EAE6] dark:border-[#2A3832]">
                                <h4 className="text-xs font-bold text-[#17221F] dark:text-[#F3F6F4] mb-3">
                                    Traffic Sources (Default Channel Group)
                                </h4>
                                {Array.isArray(ga4.trafficSources) && ga4.trafficSources.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-[#E4EAE6] dark:border-[#2A3832] text-[#75817C] dark:text-[#8FA69C]">
                                                    <th className="py-2 pr-3 font-semibold">Channel</th>
                                                    <th className="py-2 px-2 font-semibold text-right">Sessions</th>
                                                    <th className="py-2 px-2 font-semibold text-right">Active Users</th>
                                                    <th className="py-2 pl-2 font-semibold text-right">Share</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                                                {ga4.trafficSources.map((src) => (
                                                    <tr key={src.channel}>
                                                        <td className="py-2 pr-3 font-semibold text-[#17221F] dark:text-[#F3F6F4]">{src.channel}</td>
                                                        <td className="py-2 px-2 text-right font-semibold">{src.sessions}</td>
                                                        <td className="py-2 px-2 text-right">{src.activeUsers}</td>
                                                        <td className="py-2 pl-2 text-right text-[#2F806B] font-semibold">{src.sharePct}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#75817C]">No traffic source rows returned for this date range.</p>
                                )}
                            </div>
                        </div>

                        {/* Country-wise Visitors & Device Categories */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="p-4 rounded-xl bg-[#F7F8F6]/60 dark:bg-[#141D19]/70 border border-[#E4EAE6] dark:border-[#2A3832]">
                                <h4 className="text-xs font-bold text-[#17221F] dark:text-[#F3F6F4] mb-3">
                                    Country-Wise Visitors
                                </h4>
                                {Array.isArray(ga4.countries) && ga4.countries.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-[#E4EAE6] dark:border-[#2A3832] text-[#75817C] dark:text-[#8FA69C]">
                                                    <th className="py-2 pr-3 font-semibold">Country</th>
                                                    <th className="py-2 px-2 font-semibold text-right">Active Users</th>
                                                    <th className="py-2 px-2 font-semibold text-right">Sessions</th>
                                                    <th className="py-2 pl-2 font-semibold text-right">Share</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                                                {ga4.countries.slice(0, 10).map((c) => (
                                                    <tr key={c.country}>
                                                        <td className="py-2 pr-3 font-medium text-[#17221F] dark:text-[#F3F6F4]">{c.country}</td>
                                                        <td className="py-2 px-2 text-right font-semibold">{c.activeUsers}</td>
                                                        <td className="py-2 px-2 text-right">{c.sessions}</td>
                                                        <td className="py-2 pl-2 text-right text-[#2F806B] font-semibold">{c.sharePct}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#75817C]">No country rows returned for this date range.</p>
                                )}
                            </div>

                            <div className="p-4 rounded-xl bg-[#F7F8F6]/60 dark:bg-[#141D19]/70 border border-[#E4EAE6] dark:border-[#2A3832]">
                                <h4 className="text-xs font-bold text-[#17221F] dark:text-[#F3F6F4] mb-3">
                                    Device Categories
                                </h4>
                                {Array.isArray(ga4.devices) && ga4.devices.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {ga4.devices.map((d) => (
                                            <div key={d.device} className="p-3 rounded-xl bg-white dark:bg-[#18221E] border border-[#E4EAE6] dark:border-[#2A3832]">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-bold text-[#17221F] dark:text-[#F3F6F4]">{d.label}</span>
                                                    <span className="font-semibold text-[#2F806B] dark:text-emerald-300">{d.sharePct}% of sessions</span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                                    <span>Active Users: <strong className="text-[#17221F] dark:text-[#F3F6F4]">{d.activeUsers}</strong></span>
                                                    <span>Sessions: <strong className="text-[#17221F] dark:text-[#F3F6F4]">{d.sessions}</strong></span>
                                                    <span>Page Views: <strong className="text-[#17221F] dark:text-[#F3F6F4]">{d.pageViews}</strong></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#75817C]">No device category rows returned for this date range.</p>
                                )}
                            </div>
                        </div>
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
