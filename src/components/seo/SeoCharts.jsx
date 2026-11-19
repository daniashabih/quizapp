import React, { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Info,
    Plug,
    ArrowRight,
    Clock
} from 'lucide-react';
import { getScoreTierInfo } from './seoUtils';

/**
 * Circular 0-100 Health Score Gauge in Hangbug's green palette
 */
export function HealthRadialGauge({ score = 0, size = 148, strokeWidth = 12, label = 'SEO Health' }) {
    const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (safeScore / 100) * circumference;
    const tier = getScoreTierInfo(safeScore);

    return (
        <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90" aria-label={`${label}: ${safeScore} out of 100`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-[#E4EAE6] dark:text-[#2A3832]"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={tier.stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                <span className="text-3xl font-display font-extrabold text-[#17221F] dark:text-[#F3F6F4] leading-none">
                    {safeScore}
                </span>
                <span className="text-[11px] font-medium text-[#75817C] dark:text-[#8FA69C] mt-1">
                    out of 100
                </span>
            </div>
        </div>
    );
}

/**
 * Interactive SVG Trend Line / Area Chart for GSC & GA4 timeseries
 */
export function SearchTrendChart({
    data = [],
    metricKey = 'clicks',
    prevMetricKey = 'previousClicks',
    label = 'Clicks',
    color = '#193D35',
    unit = '',
    invertY = false,
    height = 220
}) {
    const [hoverIdx, setHoverIdx] = useState(null);

    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="h-44 flex items-center justify-center rounded-xl border border-dashed border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs text-[#75817C] dark:text-[#8FA69C] px-4 text-center">
                No time-series data available for the selected date range.
            </div>
        );
    }

    const width = 640;
    const padLeft = 42;
    const padRight = 16;
    const padTop = 16;
    const padBottom = 28;
    const innerW = width - padLeft - padRight;
    const innerH = height - padTop - padBottom;

    const values = data.map(d => Number(d[metricKey] ?? 0));
    const prevValues = data.map(d => (d[prevMetricKey] !== null && d[prevMetricKey] !== undefined ? Number(d[prevMetricKey]) : null));
    const allNums = [...values, ...prevValues.filter(v => v !== null)];

    const minVal = invertY ? Math.min(...allNums, 1) : 0;
    const maxVal = Math.max(...allNums, invertY ? minVal + 1 : 1);
    const span = Math.max(0.0001, maxVal - minVal);

    const getX = (idx) => {
        if (data.length === 1) return padLeft + innerW / 2;
        return padLeft + (idx / (data.length - 1)) * innerW;
    };

    const getY = (val) => {
        const norm = (val - minVal) / span;
        return invertY
            ? padTop + norm * innerH
            : padTop + (1 - norm) * innerH;
    };

    const points = values.map((v, i) => `${getX(i).toFixed(1)},${getY(v).toFixed(1)}`);
    const linePath = `M ${points.join(' L ')}`;
    const areaPath = `${linePath} L ${getX(data.length - 1).toFixed(1)},${(padTop + innerH).toFixed(1)} L ${getX(0).toFixed(1)},${(padTop + innerH).toFixed(1)} Z`;

    const hasPrev = prevValues.some(v => v !== null);
    const prevPath = hasPrev
        ? prevValues
            .map((v, i) => (v === null ? null : `${i === 0 || prevValues[i - 1] === null ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(v).toFixed(1)}`))
            .filter(Boolean)
            .join(' ')
        : '';

    const yTicks = [0, 0.5, 1].map(t => {
        const val = invertY ? minVal + t * span : minVal + (1 - t) * span;
        return {
            y: padTop + t * innerH,
            label: Number.isInteger(val) ? val.toLocaleString('en-US') : val.toFixed(1)
        };
    });

    const activePoint = hoverIdx !== null && data[hoverIdx] ? data[hoverIdx] : null;
    const gradId = `hb-grad-${metricKey}`;

    return (
        <div className="relative w-full select-none">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label={`${label} trend chart`}
            >
                <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                    </linearGradient>
                </defs>

                {/* Horizontal Grid Lines & Y-Axis Labels */}
                {yTicks.map((tick, idx) => (
                    <g key={idx}>
                        <line
                            x1={padLeft}
                            y1={tick.y}
                            x2={width - padRight}
                            y2={tick.y}
                            stroke="currentColor"
                            strokeDasharray="3 3"
                            className="text-[#E4EAE6] dark:text-[#2A3832]"
                        />
                        <text
                            x={padLeft - 8}
                            y={tick.y + 3}
                            textAnchor="end"
                            className="fill-[#75817C] dark:fill-[#8FA69C] text-[10px]"
                        >
                            {tick.label}{unit}
                        </text>
                    </g>
                ))}

                {/* Previous Period Comparison Line */}
                {prevPath && (
                    <path
                        d={prevPath}
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="1.75"
                        strokeDasharray="4 4"
                        opacity="0.7"
                    />
                )}

                {/* Area & Current Trend Line */}
                <path d={areaPath} fill={`url(#${gradId})`} />
                <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* X-Axis Labels (first, mid, last) */}
                {[0, Math.floor((data.length - 1) / 2), data.length - 1]
                    .filter((v, i, arr) => arr.indexOf(v) === i)
                    .map(idx => (
                        <text
                            key={idx}
                            x={getX(idx)}
                            y={height - 6}
                            textAnchor={idx === 0 ? 'start' : idx === data.length - 1 ? 'end' : 'middle'}
                            className="fill-[#75817C] dark:fill-[#8FA69C] text-[10px]"
                        >
                            {data[idx].date}
                        </text>
                    ))}

                {/* Hover Crosshair & Interactive Hit Zones */}
                {hoverIdx !== null && data[hoverIdx] && (
                    <g>
                        <line
                            x1={getX(hoverIdx)}
                            y1={padTop}
                            x2={getX(hoverIdx)}
                            y2={padTop + innerH}
                            stroke={color}
                            strokeWidth="1"
                            strokeDasharray="2 2"
                        />
                        <circle
                            cx={getX(hoverIdx)}
                            cy={getY(values[hoverIdx])}
                            r="4.5"
                            fill="#FFFFFF"
                            stroke={color}
                            strokeWidth="2.5"
                        />
                    </g>
                )}

                {data.map((_, i) => {
                    const colWidth = innerW / Math.max(1, data.length);
                    return (
                        <rect
                            key={i}
                            x={getX(i) - colWidth / 2}
                            y={padTop}
                            width={Math.max(8, colWidth)}
                            height={innerH}
                            fill="transparent"
                            className="cursor-crosshair"
                            onMouseEnter={() => setHoverIdx(i)}
                            onMouseLeave={() => setHoverIdx(null)}
                        />
                    );
                })}
            </svg>

            {/* Hover Tooltip */}
            {activePoint && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[#E5F2EC] dark:bg-[#1F352E] border border-[#BBE0CE] dark:border-[#2A3832] text-xs">
                    <span className="font-semibold text-[#193D35] dark:text-[#F3F6F4]">{activePoint.date}</span>
                    <div className="flex items-center gap-3 text-[#17221F] dark:text-[#B8CEC5]">
                        <span>
                            {label}: <strong>{activePoint[metricKey]}{unit}</strong>
                        </span>
                        {activePoint[prevMetricKey] !== null && activePoint[prevMetricKey] !== undefined && (
                            <span className="text-[#75817C] dark:text-[#8FA69C]">
                                Prev: {activePoint[prevMetricKey]}{unit}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Metric Card for Website Overview with explicit explanation, source, and honest empty states
 */
export function MetricCard({ metric, onConfigureClick }) {
    const [showTip, setShowTip] = useState(false);

    const hasTrend = metric.available && metric.trend !== null && metric.trend !== undefined;
    const isPositiveTrend = hasTrend && (metric.invertTrendGood ? metric.trend <= 0 : metric.trend >= 0);

    return (
        <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4 sm:p-5 shadow-[0_1px_3px_rgba(25,61,53,0.04)] hover:border-[#2F806B]/50 transition-all duration-200 flex flex-col justify-between relative">
            <div>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#75817C] dark:text-[#8FA69C] truncate">
                            {metric.label}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowTip(prev => !prev)}
                            onMouseEnter={() => setShowTip(true)}
                            onMouseLeave={() => setShowTip(false)}
                            aria-label={`Explain ${metric.label}`}
                            className="text-[#75817C] hover:text-[#193D35] dark:hover:text-emerald-300 cursor-pointer shrink-0"
                        >
                            <Info size={13} />
                        </button>
                    </div>

                    {metric.isEstimated && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF5E7] text-[#B45309] border border-[#F8DFB6] dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60 shrink-0">
                            Estimated
                        </span>
                    )}
                </div>

                {showTip && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] text-[11px] text-[#17221F] dark:text-[#B8CEC5] leading-relaxed">
                        {metric.explanation}
                    </div>
                )}

                <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
                    {metric.available ? (
                        <span className="text-2xl sm:text-[28px] font-display font-bold text-[#17221F] dark:text-[#F3F6F4] tracking-tight">
                            {metric.formattedValue}
                        </span>
                    ) : (
                        <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-[#F7F8F6] dark:bg-[#1F2D27] text-[#75817C] dark:text-[#8FA69C] border border-[#E4EAE6] dark:border-[#2A3832]">
                            {metric.formattedValue || 'Not connected'}
                        </span>
                    )}

                    {hasTrend && (
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                isPositiveTrend
                                    ? 'bg-[#E5F2EC] text-[#193D35] dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-[#FCEEED] text-[#B91C1C] dark:bg-red-950/50 dark:text-red-300'
                            }`}
                        >
                            {metric.trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {metric.trend > 0 ? `+${metric.trend}` : metric.trend}
                            {metric.trendUnit || ''}
                        </span>
                    )}
                </div>

                {!metric.available && metric.unavailabilityReason && (
                    <p className="mt-2.5 text-[11px] leading-relaxed text-[#75817C] dark:text-[#8FA69C]">
                        {metric.unavailabilityReason}
                    </p>
                )}

                {metric.available && (
                    <p className="mt-2 text-[11px] leading-relaxed text-[#75817C] dark:text-[#8FA69C]">
                        {metric.explanation}
                    </p>
                )}
            </div>

            <div className="mt-4 pt-2.5 border-t border-[#E4EAE6] dark:border-[#2A3832] flex items-center justify-between gap-2 text-[11px]">
                <span className="text-[#75817C] dark:text-[#8FA69C] truncate">
                    Source: <strong className="font-medium text-[#17221F] dark:text-[#B8CEC5]">{metric.source}</strong>
                </span>
                {!metric.available && onConfigureClick ? (
                    <button
                        type="button"
                        onClick={onConfigureClick}
                        className="inline-flex items-center gap-1 font-semibold text-[#2F806B] dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
                    >
                        <span>Connect</span>
                        <ArrowRight size={11} />
                    </button>
                ) : metric.updatedAt ? (
                    <span className="inline-flex items-center gap-1 text-[#75817C] dark:text-[#8FA69C] shrink-0">
                        <Clock size={11} />
                        <span>{new Date(metric.updatedAt).toLocaleDateString()}</span>
                    </span>
                ) : null}
            </div>
        </div>
    );
}

/**
 * Honest Empty / Setup State Card when an integration isn't connected yet
 */
export function EmptyIntegrationCard({ title, description, source, onConfigure }) {
    return (
        <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-dashed border-[#BBE0CE] dark:border-[#2A3832] p-6 sm:p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E5F2EC] dark:bg-[#1F352E] text-[#193D35] dark:text-emerald-300 flex items-center justify-center mx-auto mb-3">
                <Plug size={22} />
            </div>
            <h3 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                {title}
            </h3>
            <p className="text-xs sm:text-sm text-[#75817C] dark:text-[#8FA69C] max-w-xl mx-auto mt-1.5 leading-relaxed">
                {description}
            </p>
            {source && (
                <p className="text-[11px] font-medium text-[#2F806B] dark:text-emerald-400 mt-3">
                    Provider: {source}
                </p>
            )}
            {onConfigure && (
                <button
                    type="button"
                    onClick={onConfigure}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                    <span>Configure in Settings</span>
                    <ArrowRight size={14} />
                </button>
            )}
        </div>
    );
}

/**
 * Horizontal segmented status bar
 */
export function StatusDistributionBar({ segments = [] }) {
    const total = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0);
    if (total === 0) {
        return <div className="h-2.5 w-full rounded-full bg-[#E4EAE6] dark:bg-[#2A3832]" />;
    }

    return (
        <div className="space-y-2">
            <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-[#E4EAE6] dark:bg-[#2A3832]">
                {segments.map((seg) => {
                    const pct = (seg.value / total) * 100;
                    if (pct <= 0) return null;
                    return (
                        <div
                            key={seg.label}
                            style={{ width: `${pct}%`, backgroundColor: seg.color }}
                            title={`${seg.label}: ${seg.value}`}
                            className="h-full transition-all duration-500"
                        />
                    );
                })}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                {segments.map((seg) => (
                    <div key={seg.label} className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span>{seg.label}:</span>
                        <strong className="text-[#17221F] dark:text-[#F3F6F4]">{seg.value}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}
