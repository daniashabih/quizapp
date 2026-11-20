import React, { useState, useMemo, useRef } from 'react';
import {
    Link2,
    Upload,
    ExternalLink,
    Info,
    ShieldCheck,
    AlertCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Minus,
    FileSpreadsheet,
    CheckCircle2,
    Zap,
    Settings as SettingsIcon,
    Trash2,
    Globe,
    FileText,
    BarChart3
} from 'lucide-react';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';
import { formatSeoTimestamp } from './seoUtils';

function getConnectionBadgeClasses(status = 'Not Configured') {
    if (status === 'Connected') {
        return 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60';
    }
    if (status === 'Invalid API Key' || status === 'Quota Exceeded') {
        return 'bg-[#FCEEED] text-[#B91C1C] border-[#F8C9C6] dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60';
    }
    if (status === 'Provider Unavailable') {
        return 'bg-[#FEF5E7] text-[#B45309] border-[#F8DFB6] dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60';
    }
    return 'bg-[#F7F8F6] text-[#75817C] border-[#E4EAE6] dark:bg-[#1F2D27] dark:text-[#8FA69C] dark:border-[#2A3832]';
}

function formatDeltaBadge(delta) {
    if (delta === null || delta === undefined || Number.isNaN(Number(delta))) return null;
    const num = Number(delta);
    const sign = num > 0 ? '+' : '';
    return {
        text: `${sign}${num.toFixed(2)}`,
        direction: num > 0 ? 'up' : num < 0 ? 'down' : 'flat',
        classes: num > 0
            ? 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
            : num < 0
                ? 'bg-[#FCEEED] text-[#B91C1C] border-[#F8C9C6] dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
                : 'bg-[#F7F8F6] text-[#75817C] border-[#E4EAE6] dark:bg-[#1F2D27] dark:text-[#8FA69C] dark:border-[#2A3832]'
    };
}

/**
 * Interactive SVG Monthly Authority History Chart
 * Clearly distinguishes Measured (estimated: false) vs Estimated (estimated: true) points.
 */
function AuthorityHistoryChart({ history = [] }) {
    const [hoverIdx, setHoverIdx] = useState(null);

    if (!Array.isArray(history) || history.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center rounded-xl border border-dashed border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs text-[#75817C] dark:text-[#8FA69C] px-4 text-center">
                No monthly historical authority series available for this domain yet.
            </div>
        );
    }

    const width = 680;
    const height = 240;
    const padLeft = 42;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 32;
    const innerW = width - padLeft - padRight;
    const innerH = height - padTop - padBottom;

    const scores = history.map((d) => Number(d.open_page_rank ?? d.score ?? 0));
    const minScore = Math.max(0, Math.floor(Math.min(...scores, 0) * 2) / 2);
    const maxScore = Math.min(10, Math.max(Math.ceil(Math.max(...scores, 2) * 2) / 2, minScore + 2));
    const span = Math.max(0.5, maxScore - minScore);

    const getX = (idx) => {
        if (history.length === 1) return padLeft + innerW / 2;
        return padLeft + (idx / (history.length - 1)) * innerW;
    };

    const getY = (val) => {
        const norm = (val - minScore) / span;
        return padTop + (1 - norm) * innerH;
    };

    const points = scores.map((v, i) => `${getX(i).toFixed(1)},${getY(v).toFixed(1)}`);
    const linePath = `M ${points.join(' L ')}`;
    const areaPath = `${linePath} L ${getX(history.length - 1).toFixed(1)},${(padTop + innerH).toFixed(1)} L ${getX(0).toFixed(1)},${(padTop + innerH).toFixed(1)} Z`;

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
        const val = minScore + (1 - t) * span;
        return {
            y: padTop + t * innerH,
            label: val.toFixed(1)
        };
    });

    const activeIdx = hoverIdx !== null && history[hoverIdx] ? hoverIdx : (history.length - 1);
    const activePoint = history[activeIdx] || null;

    return (
        <div className="space-y-3 select-none">
            {/* Legend distinguishing Measured vs Estimated points */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#193D35] dark:bg-emerald-400 inline-block" />
                        <strong className="text-[#17221F] dark:text-[#F3F6F4]">Measured</strong>
                        <span>(Common Crawl release, <code className="font-mono">estimated: false</code>)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#18221E] border-2 border-[#D19A45] inline-block" />
                        <strong className="text-[#17221F] dark:text-[#F3F6F4]">Estimated</strong>
                        <span>(Linearly interpolated month, <code className="font-mono">estimated: true</code>)</span>
                    </span>
                </div>
                <span>Scale: 0–10 OpenPageRank Authority</span>
            </div>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label="Monthly OpenPageRank authority history chart"
            >
                <defs>
                    <linearGradient id="hb-opr-history-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2F806B" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="#2F806B" stopOpacity="0.01" />
                    </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
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
                            {tick.label}
                        </text>
                    </g>
                ))}

                {/* Area & Line */}
                <path d={areaPath} fill="url(#hb-opr-history-grad)" />
                <path
                    d={linePath}
                    fill="none"
                    stroke="#193D35"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Individual Measured vs Estimated Data Markers */}
                {history.map((pt, idx) => {
                    const cx = getX(idx);
                    const cy = getY(Number(pt.open_page_rank ?? pt.score ?? 0));
                    const isHovered = hoverIdx === idx;
                    const showMarker = history.length <= 36 || isHovered || idx === 0 || idx === history.length - 1 || pt.estimated;

                    if (!showMarker) return null;

                    if (pt.estimated) {
                        return (
                            <circle
                                key={`pt-${pt.date}-${idx}`}
                                cx={cx}
                                cy={cy}
                                r={isHovered ? 5 : 3.4}
                                fill="#FFFFFF"
                                stroke="#D19A45"
                                strokeWidth={isHovered ? 2.5 : 2}
                            />
                        );
                    }

                    return (
                        <circle
                            key={`pt-${pt.date}-${idx}`}
                            cx={cx}
                            cy={cy}
                            r={isHovered ? 5 : 3.2}
                            fill="#193D35"
                            stroke="#FFFFFF"
                            strokeWidth={isHovered ? 2 : 1.2}
                        />
                    );
                })}

                {/* X-Axis Labels */}
                {[0, Math.floor((history.length - 1) / 2), history.length - 1]
                    .filter((v, i, arr) => arr.indexOf(v) === i)
                    .map((idx) => (
                        <text
                            key={`x-${idx}`}
                            x={getX(idx)}
                            y={height - 8}
                            textAnchor={idx === 0 ? 'start' : idx === history.length - 1 ? 'end' : 'middle'}
                            className="fill-[#75817C] dark:fill-[#8FA69C] text-[10px]"
                        >
                            {history[idx].date}
                        </text>
                    ))}

                {/* Hover Crosshair */}
                {hoverIdx !== null && history[hoverIdx] && (
                    <line
                        x1={getX(hoverIdx)}
                        y1={padTop}
                        x2={getX(hoverIdx)}
                        y2={padTop + innerH}
                        stroke="#2F806B"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                    />
                )}

                {/* Hit zones */}
                {history.map((_, i) => {
                    const colWidth = innerW / Math.max(1, history.length);
                    return (
                        <rect
                            key={`hit-${i}`}
                            x={getX(i) - colWidth / 2}
                            y={padTop}
                            width={Math.max(6, colWidth)}
                            height={innerH}
                            fill="transparent"
                            className="cursor-crosshair"
                            onMouseEnter={() => setHoverIdx(i)}
                            onMouseLeave={() => setHoverIdx(null)}
                        />
                    );
                })}
            </svg>

            {/* Active / Hovered Point Detail Bar */}
            {activePoint && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#E5F2EC]/80 dark:bg-[#1F352E] border border-[#BBE0CE] dark:border-[#2A3832] text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#193D35] dark:text-[#F3F6F4]">
                            {activePoint.date}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            activePoint.estimated
                                ? 'bg-[#FEF5E7] text-[#B45309] border-[#F8DFB6] dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                                : 'bg-white text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                        }`}>
                            {activePoint.estimated ? 'Estimated (Interpolated)' : 'Measured (Common Crawl Release)'}
                        </span>
                    </div>
                    <div className="text-[#17221F] dark:text-[#F3F6F4]">
                        OpenPageRank Score: <strong className="font-display text-sm text-[#193D35] dark:text-emerald-300">{Number(activePoint.open_page_rank ?? activePoint.score ?? 0).toFixed(2)} / 10</strong>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SeoBacklinksSection({ data, domain, onDataUpdated, onNavigate }) {
    const [showImport, setShowImport] = useState(false);
    const [rawCsv, setRawCsv] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [importing, setImporting] = useState(false);
    const [clearingImport, setClearingImport] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [historyRange, setHistoryRange] = useState('24m');
    const [showHistoryTable, setShowHistoryTable] = useState(false);
    const [activeGscTab, setActiveGscTab] = useState('domains');
    const fileInputRef = useRef(null);

    const backlinks = data?.backlinks || {};
    const opr = backlinks.openPageRank || {};
    const gscImport = backlinks.gscLinksImport || {};
    const explanations = backlinks.metricExplanations || {};

    const connectionStatus = opr.connectionStatus || backlinks.connectionStatus || 'Not Configured';
    const isOprConnected = connectionStatus === 'Connected' && Boolean(opr.connected);
    const history = Array.isArray(opr.history) ? opr.history : [];
    const historySummary = opr.historySummary || {};
    const quota = opr.quota || null;

    const filteredHistory = useMemo(() => {
        if (historyRange === '12m') return history.slice(-12);
        if (historyRange === '24m') return history.slice(-24);
        return history;
    }, [history, historyRange]);

    const externalDomains = gscImport.externalLinkingDomains || backlinks.referringDomainsList || [];
    const targetPages = gscImport.targetPages || backlinks.targetPagesList || [];
    const linkingPages = gscImport.linkingPages || backlinks.linkingPagesList || [];
    const anchors = gscImport.topAnchors || backlinks.topAnchors || [];

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = String(evt.target?.result || '');
            setRawCsv(content);
            toast.info(`Loaded "${file.name}" (${content.split(/\r?\n/).filter(Boolean).length} lines). Click Import Report to save.`);
        };
        reader.onerror = () => {
            toast.error('Unable to read the selected CSV file.');
        };
        reader.readAsText(file);
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!rawCsv.trim()) {
            toast.error('Upload a Google Search Console Links CSV file or paste CSV rows first.');
            return;
        }

        setImporting(true);
        try {
            const res = await seoService.importBacklinks(domain, {
                csvText: rawCsv,
                fileName: uploadedFileName || 'gsc-links-export.csv'
            });
            if (res?.success) {
                toast.success(res.message || 'Google Search Console Links report imported.');
                setShowImport(false);
                setRawCsv('');
                setUploadedFileName('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to import Google Search Console Links CSV.');
        } finally {
            setImporting(false);
        }
    };

    const handleClearImport = async () => {
        setClearingImport(true);
        try {
            const res = await seoService.clearImportedBacklinks(domain);
            if (res?.success) {
                toast.info(res.message || 'Cleared imported GSC Links report.');
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Unable to clear imported report.');
        } finally {
            setClearingImport(false);
        }
    };

    const handleTestConnection = async () => {
        setTestingConnection(true);
        try {
            const res = await seoService.testIntegration(domain, 'openpagerank');
            const result = res?.result || {};
            if (result.ok) {
                toast.success(result.message || 'Connected to OpenPageRank API.');
            } else {
                toast.error(result.message || `OpenPageRank status: ${result.connectionStatus || 'Failed'}`);
            }
            if (onDataUpdated) await onDataUpdated();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'OpenPageRank connection test failed.');
        } finally {
            setTestingConnection(false);
        }
    };

    const momBadge = formatDeltaBadge(historySummary.monthOverMonthChange);
    const yoyBadge = formatDeltaBadge(historySummary.yearOverYearChange);
    const allTimeBadge = formatDeltaBadge(historySummary.allTimeChange);

    return (
        <div className="space-y-6 animate-fade-up">
            {/* 1. Header, Connection Status & Actions */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#E5F2EC] dark:bg-[#1F352E] text-[#193D35] dark:text-emerald-300 flex items-center justify-center shrink-0 border border-[#BBE0CE] dark:border-[#2F806B]/40">
                            <Link2 size={17} />
                        </div>
                        <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            Backlink Overview &amp; Domain Authority
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getConnectionBadgeClasses(connectionStatus)}`}>
                            OpenPageRank: {connectionStatus}
                        </span>
                    </div>
                    <p className="text-xs text-[#75817C] dark:text-[#8FA69C]">
                        Provider: <strong className="text-[#17221F] dark:text-[#F3F6F4]">OpenPageRank API</strong> (<code className="font-mono">{opr.domain || 'hangbug.com'}</code>)
                        {' · '}Last data update: <strong className="text-[#17221F] dark:text-[#F3F6F4]">{formatSeoTimestamp(opr.syncedAt || backlinks.lastDataUpdate)}</strong>
                        {opr.asOf ? (
                            <> · Common Crawl Release: <strong className="font-mono text-[#2F806B]">{opr.asOf}</strong></>
                        ) : null}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        type="button"
                        disabled={testingConnection}
                        onClick={handleTestConnection}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] hover:border-[#2F806B] text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4] transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <Zap size={13} className="text-[#2F806B]" />
                        <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowImport((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#BBE0CE] dark:border-[#2A3832] bg-[#E5F2EC] dark:bg-[#1F352E] hover:bg-[#193D35] hover:text-white text-xs font-semibold text-[#193D35] dark:text-emerald-300 transition-colors cursor-pointer"
                    >
                        <Upload size={13} />
                        <span>{showImport ? 'Hide GSC Links Importer' : 'Import Google Search Console Links Report'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onNavigate('settings')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <SettingsIcon size={13} />
                        <span>API Settings</span>
                    </button>
                </div>
            </div>

            {/* Connection Status Banner when not Connected */}
            {!isOprConnected && (
                <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs ${
                    connectionStatus === 'Invalid API Key' || connectionStatus === 'Quota Exceeded'
                        ? 'bg-[#FCEEED] border-[#F8C9C6] text-[#B91C1C] dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-300'
                        : connectionStatus === 'Provider Unavailable'
                            ? 'bg-[#FEF5E7] border-[#F8DFB6] text-[#B45309] dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300'
                            : 'bg-white dark:bg-[#18221E] border-[#E4EAE6] dark:border-[#2A3832] text-[#17221F] dark:text-[#F3F6F4]'
                }`}>
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-bold text-sm">
                                OpenPageRank Connection Status: {connectionStatus}
                            </p>
                            <p className="leading-relaxed">
                                {opr.message || backlinks.reason || 'Configure your OpenPageRank API key in SEO & Growth → Settings to fetch live domain authority, referring domain counts, and monthly authority history.'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onNavigate('settings')}
                        className="px-4 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                        Configure API Key
                    </button>
                </div>
            )}

            {/* 2. Manual Google Search Console Links CSV Upload & Import Panel */}
            {showImport && (
                <form
                    onSubmit={handleImport}
                    className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#BBE0CE] dark:border-[#2A3832] p-5 space-y-4 shadow-[0_1px_3px_rgba(25,61,53,0.04)]"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet size={17} className="text-[#2F806B]" />
                            <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Import Google Search Console Links Report (Official CSV Export)
                            </h3>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E5F2EC] text-[#193D35] dark:bg-emerald-950/60 dark:text-emerald-300">
                            Static CSV Snapshot · Stored in MongoDB
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#E5F2EC]/60 dark:bg-[#1F352E]/50 border border-[#BBE0CE] dark:border-[#2A3832] flex items-start gap-2.5 text-xs text-[#193D35] dark:text-[#F3F6F4]">
                        <Info size={15} className="shrink-0 mt-0.5 text-[#2F806B]" />
                        <div className="space-y-1 leading-relaxed">
                            <p>
                                In Google Search Console, open <strong>Links → Export External Links</strong> (Top linking sites, Top linked pages, or Latest links CSV) and upload the official <code className="font-mono">.csv</code> file below.
                            </p>
                            <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                Hangbug extracts external linking domains, target pages, and available linking-page details while preserving the original source and import date. Imported CSV data is clearly labeled as a static snapshot, not live backlink data.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-5">
                            <label className="block text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4] mb-1.5">
                                Upload Official GSC Links CSV File
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,text/csv,text/plain"
                                onChange={handleFileSelect}
                                className="block w-full text-xs text-[#75817C] file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#193D35] file:text-white hover:file:bg-[#2F806B] file:cursor-pointer"
                            />
                            {uploadedFileName && (
                                <p className="mt-1.5 text-[11px] font-mono text-[#2F806B]">
                                    Selected file: {uploadedFileName}
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-7">
                            <label className="block text-xs font-semibold text-[#17221F] dark:text-[#F3F6F4] mb-1.5">
                                Or Paste CSV Content Directly
                            </label>
                            <textarea
                                rows={4}
                                value={rawCsv}
                                onChange={(e) => setRawCsv(e.target.value)}
                                placeholder={'Source page,Target page\nhttps://github.com/example/repo,https://www.hangbug.com/technologies/javascript\nhttps://dev.to/author/article,https://www.hangbug.com/blog/javascript-fundamentals-beginners-guide'}
                                className="w-full p-3 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] font-mono text-xs text-[#17221F] dark:text-[#F3F6F4]"
                            />
                        </div>
                    </div>

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
                            {importing ? 'Importing CSV...' : 'Import Report'}
                        </button>
                    </div>
                </form>
            )}

            {/* 3. Backlink Overview Cards (with Simple-Language Explanations) */}
            <section aria-label="Backlink Overview Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: OpenPageRank Score (0-10) */}
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#75817C] dark:text-[#8FA69C]">
                                OpenPageRank Score
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E5F2EC] text-[#193D35] dark:bg-emerald-950/60 dark:text-emerald-300">
                                0–10 Scale
                            </span>
                        </div>

                        <div className="mt-3 flex items-baseline gap-2">
                            {isOprConnected && opr.score !== null && opr.score !== undefined ? (
                                <>
                                    <span className="text-3xl font-display font-extrabold text-[#193D35] dark:text-emerald-300">
                                        {Number(opr.score).toFixed(2)}
                                    </span>
                                    <span className="text-sm font-semibold text-[#75817C]">/ 10</span>
                                    {momBadge && (
                                        <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold border ${momBadge.classes}`}>
                                            {momBadge.text} MoM
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-[#F7F8F6] dark:bg-[#1F2D27] text-[#75817C] dark:text-[#8FA69C] border border-[#E4EAE6] dark:border-[#2A3832]">
                                    {isOprConnected ? 'Not yet scored' : connectionStatus}
                                </span>
                            )}
                        </div>

                        {isOprConnected && opr.score !== null && opr.score !== undefined && (
                            <div className="mt-3 h-2 w-full rounded-full bg-[#E4EAE6] dark:bg-[#2A3832] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-[#2F806B] transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(0, (Number(opr.score) / 10) * 100))}%` }}
                                />
                            </div>
                        )}

                        <p className="mt-3 text-[11px] leading-relaxed text-[#75817C] dark:text-[#8FA69C]">
                            {explanations.openPageRankScore || "An external estimate of your website's authority based on its link graph. It is not a Google ranking score."}
                        </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-[#E4EAE6] dark:border-[#2A3832] text-[10px] text-[#75817C] dark:text-[#8FA69C] flex items-center justify-between">
                        <span>Source: OpenPageRank API</span>
                        <span>{opr.asOf ? `Release ${opr.asOf}` : 'External estimate'}</span>
                    </div>
                </div>

                {/* Card 2: Global Domain Rank */}
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#75817C] dark:text-[#8FA69C]">
                                Global Domain Rank
                            </span>
                            <Globe size={14} className="text-[#2F806B]" />
                        </div>

                        <div className="mt-3">
                            {isOprConnected && opr.globalRank !== null && opr.globalRank !== undefined ? (
                                <span className="text-3xl font-display font-extrabold text-[#17221F] dark:text-[#F3F6F4]">
                                    #{Number(opr.globalRank).toLocaleString('en-US')}
                                </span>
                            ) : (
                                <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-[#F7F8F6] dark:bg-[#1F2D27] text-[#75817C] dark:text-[#8FA69C] border border-[#E4EAE6] dark:border-[#2A3832] inline-block">
                                    {isOprConnected ? 'Unranked' : connectionStatus}
                                </span>
                            )}
                        </div>

                        <p className="mt-3 text-[11px] leading-relaxed text-[#75817C] dark:text-[#8FA69C]">
                            {explanations.globalDomainRank || "Your website's estimated global position compared with other domains in the OpenPageRank link graph (#1 is the highest authority worldwide)."}
                        </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-[#E4EAE6] dark:border-[#2A3832] text-[10px] text-[#75817C] dark:text-[#8FA69C] flex items-center justify-between">
                        <span>Source: OpenPageRank Link Graph</span>
                        <span>1 = Highest global rank</span>
                    </div>
                </div>

                {/* Card 3: Referring Domains Reported by OpenPageRank */}
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#75817C] dark:text-[#8FA69C]">
                                Referring Domains
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF5E7] text-[#B45309] border border-[#F8DFB6] dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
                                Provider Reported
                            </span>
                        </div>

                        <div className="mt-3">
                            {isOprConnected && opr.referringDomains !== null && opr.referringDomains !== undefined ? (
                                <span className="text-3xl font-display font-extrabold text-[#17221F] dark:text-[#F3F6F4]">
                                    {Number(opr.referringDomains).toLocaleString('en-US')}
                                </span>
                            ) : (
                                <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-[#F7F8F6] dark:bg-[#1F2D27] text-[#75817C] dark:text-[#8FA69C] border border-[#E4EAE6] dark:border-[#2A3832] inline-block">
                                    {isOprConnected ? '0 reported' : connectionStatus}
                                </span>
                            )}
                        </div>

                        <p className="mt-3 text-[11px] leading-relaxed text-[#75817C] dark:text-[#8FA69C]">
                            {explanations.referringDomains || "The number of linking domains reported by the selected data provider. This is an authority-weighted count from OpenPageRank, not a complete verified backlink count."}
                        </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-[#E4EAE6] dark:border-[#2A3832] text-[10px] text-[#75817C] dark:text-[#8FA69C] flex items-center justify-between">
                        <span>Source: OpenPageRank (referring_domains)</span>
                        <span>Not a full backlink count</span>
                    </div>
                </div>

                {/* Card 4: API Usage & Remaining Quota */}
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#75817C] dark:text-[#8FA69C]">
                                API Usage &amp; Quota
                            </span>
                            <ShieldCheck size={14} className="text-[#2F806B]" />
                        </div>

                        <div className="mt-3">
                            {quota && quota.domainsRemaining !== null && quota.domainsRemaining !== undefined ? (
                                <div>
                                    <span className="text-2xl font-display font-extrabold text-[#17221F] dark:text-[#F3F6F4]">
                                        {Number(quota.domainsRemaining).toLocaleString('en-US')}
                                    </span>
                                    <span className="text-xs text-[#75817C] ml-1">
                                        / {Number(quota.monthlyDomainLimit || 30000).toLocaleString('en-US')} left
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-[#F7F8F6] dark:bg-[#1F2D27] text-[#75817C] dark:text-[#8FA69C] border border-[#E4EAE6] dark:border-[#2A3832] inline-block">
                                    {isOprConnected ? 'Quota active' : 'Available after connection'}
                                </span>
                            )}
                        </div>

                        {quota && quota.domainsUsed !== null && quota.domainsUsed !== undefined && (
                            <p className="mt-2 text-[11px] font-semibold text-[#193D35] dark:text-emerald-300">
                                Used this month: {Number(quota.domainsUsed).toLocaleString('en-US')} domain(s)
                                {quota.requestsPerMinute ? ` · ${quota.requestsPerMinute} RPM limit` : ''}
                            </p>
                        )}

                        <p className="mt-2 text-[11px] leading-relaxed text-[#75817C] dark:text-[#8FA69C]">
                            {explanations.apiQuota || "Your OpenPageRank plan's monthly domain lookup usage, remaining domain quota, and per-minute rate limit balance."}
                        </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-[#E4EAE6] dark:border-[#2A3832] text-[10px] text-[#75817C] dark:text-[#8FA69C] flex items-center justify-between">
                        <span>Tier: {quota?.tier ? quota.tier.toUpperCase() : 'Standard'}</span>
                        <span>{quota?.resetsAt ? `Resets ${new Date(quota.resetsAt).toLocaleDateString()}` : 'Monthly reset'}</span>
                    </div>
                </div>
            </section>

            {/* 4. Historical Authority Charts & Growth / Decline Analysis */}
            <section className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6 space-y-5 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <BarChart3 size={18} className="text-[#2F806B]" />
                            <h3 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Monthly Authority History ({opr.domain || 'hangbug.com'})
                            </h3>
                            {historySummary.growthStatus && (
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                    historySummary.trendDirection === 'growth'
                                        ? 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                        : historySummary.trendDirection === 'decline'
                                            ? 'bg-[#FCEEED] text-[#B91C1C] border-[#F8C9C6] dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
                                            : 'bg-[#F7F8F6] text-[#75817C] border-[#E4EAE6] dark:bg-[#1F2D27] dark:text-[#8FA69C] dark:border-[#2A3832]'
                                }`}>
                                    {historySummary.growthStatus}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-1">
                            {explanations.monthlyAuthorityHistory || "Tracks how your domain's OpenPageRank score (0–10) has changed month by month. Measured months correspond to Common Crawl releases; Estimated months are linearly interpolated."}
                        </p>
                    </div>

                    {history.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs shrink-0">
                            {[
                                { id: '12m', label: 'Last 12M' },
                                { id: '24m', label: 'Last 24M' },
                                { id: 'all', label: `All (${history.length}M)` }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setHistoryRange(tab.id)}
                                    className={`px-3 py-1.5 rounded-xl font-semibold border transition-colors cursor-pointer ${
                                        historyRange === tab.id
                                            ? 'bg-[#193D35] text-white border-[#193D35]'
                                            : 'bg-[#F7F8F6] dark:bg-[#141D19] text-[#17221F] dark:text-[#F3F6F4] border-[#E4EAE6] dark:border-[#2A3832] hover:border-[#2F806B]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Historical Data Availability & Growth Metrics Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Historical Data Availability</p>
                        <p className="mt-1.5 font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            {historySummary.available
                                ? `${historySummary.totalMonths} Monthly Points`
                                : 'No History Available'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C]">
                            {historySummary.startDate && historySummary.endDate
                                ? `${historySummary.startDate} → ${historySummary.endDate}`
                                : 'Requires connected OPR data'}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Measured vs Estimated Months</p>
                        <div className="mt-1.5 flex items-center gap-2 font-bold">
                            <span className="text-[#193D35] dark:text-emerald-300">
                                {historySummary.measuredMonthsCount ?? 0} Measured
                            </span>
                            <span className="text-[#75817C]">·</span>
                            <span className="text-[#B45309] dark:text-amber-300">
                                {historySummary.estimatedMonthsCount ?? 0} Estimated
                            </span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-[#75817C]">Common Crawl vs interpolated</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Month-over-Month Change</p>
                        <div className="mt-1.5 flex items-center gap-1.5 font-bold">
                            {momBadge ? (
                                <>
                                    {momBadge.direction === 'up' && <TrendingUp size={13} className="text-[#2F806B]" />}
                                    {momBadge.direction === 'down' && <TrendingDown size={13} className="text-[#B91C1C]" />}
                                    {momBadge.direction === 'flat' && <Minus size={13} className="text-[#75817C]" />}
                                    <span className={momBadge.direction === 'up' ? 'text-[#193D35] dark:text-emerald-300' : momBadge.direction === 'down' ? 'text-[#B91C1C]' : 'text-[#17221F] dark:text-[#F3F6F4]'}>
                                        {momBadge.text} pts
                                    </span>
                                </>
                            ) : (
                                <span className="text-[#75817C]">N/A</span>
                            )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-[#75817C]">Latest month vs prior month</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">12-Month Authority Change</p>
                        <div className="mt-1.5 flex items-center gap-1.5 font-bold">
                            {yoyBadge ? (
                                <>
                                    {yoyBadge.direction === 'up' && <TrendingUp size={13} className="text-[#2F806B]" />}
                                    {yoyBadge.direction === 'down' && <TrendingDown size={13} className="text-[#B91C1C]" />}
                                    {yoyBadge.direction === 'flat' && <Minus size={13} className="text-[#75817C]" />}
                                    <span className={yoyBadge.direction === 'up' ? 'text-[#193D35] dark:text-emerald-300' : yoyBadge.direction === 'down' ? 'text-[#B91C1C]' : 'text-[#17221F] dark:text-[#F3F6F4]'}>
                                        {yoyBadge.text} pts
                                    </span>
                                </>
                            ) : (
                                <span className="text-[#75817C]">N/A</span>
                            )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-[#75817C]">Year-over-year growth/decline</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">All-Time Authority Range</p>
                        <p className="mt-1.5 font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            {historySummary.available
                                ? `${Number(historySummary.lowestScore ?? 0).toFixed(2)} – ${Number(historySummary.peakScore ?? 0).toFixed(2)} / 10`
                                : 'N/A'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C]">
                            {allTimeBadge ? `Net change: ${allTimeBadge.text} pts` : 'Min to peak authority'}
                        </p>
                    </div>
                </div>

                {/* SVG Monthly Authority History Chart */}
                <AuthorityHistoryChart history={filteredHistory} />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E4EAE6] dark:border-[#2A3832] text-xs">
                    <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                        {historySummary.availabilityNote || 'Connect OpenPageRank in Settings to load actual monthly authority history.'}
                    </p>
                    {history.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowHistoryTable((prev) => !prev)}
                            className="font-semibold text-[#2F806B] dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                            {showHistoryTable ? 'Hide Monthly History Table' : `View Monthly History Table (${history.length} months)`}
                        </button>
                    )}
                </div>

                {showHistoryTable && history.length > 0 && (
                    <div className="max-h-72 overflow-y-auto rounded-xl border border-[#E4EAE6] dark:border-[#2A3832]">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C] sticky top-0">
                                <tr>
                                    <th className="py-2.5 px-4">Month (Date)</th>
                                    <th className="py-2.5 px-4">OpenPageRank Score</th>
                                    <th className="py-2.5 px-4">Data Classification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                                {[...history].reverse().map((row) => (
                                    <tr key={row.date}>
                                        <td className="py-2 px-4 font-mono font-semibold">{row.date}</td>
                                        <td className="py-2 px-4 font-bold text-[#193D35] dark:text-emerald-300">
                                            {Number(row.open_page_rank ?? row.score ?? 0).toFixed(2)} / 10
                                        </td>
                                        <td className="py-2 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                row.estimated
                                                    ? 'bg-[#FEF5E7] text-[#B45309] border-[#F8DFB6] dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                                                    : 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                            }`}>
                                                {row.estimated ? 'Estimated (Interpolated)' : 'Measured (Common Crawl Release)'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* 5. Manual Google Search Console Links Report Section */}
            <section className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6 space-y-5 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <FileText size={17} className="text-[#2F806B]" />
                            <h3 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Imported Google Search Console Links Report
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                gscImport.available
                                    ? 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-[#F7F8F6] text-[#75817C] border-[#E4EAE6] dark:bg-[#1F2D27] dark:text-[#8FA69C]'
                            }`}>
                                {gscImport.available ? 'Manual CSV Snapshot Loaded' : 'No CSV Imported Yet'}
                            </span>
                        </div>
                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-1">
                            {explanations.gscLinksReport || 'A static snapshot manually imported from your official Google Search Console Links CSV export, preserving the original source and import date.'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowImport(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                            <Upload size={13} />
                            <span>{gscImport.available ? 'Upload New GSC CSV' : 'Upload Official GSC CSV'}</span>
                        </button>
                        {gscImport.available && (
                            <button
                                type="button"
                                disabled={clearingImport}
                                onClick={handleClearImport}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#F8C9C6] bg-[#FCEEED] text-[#B91C1C] text-xs font-semibold cursor-pointer disabled:opacity-50"
                            >
                                <Trash2 size={13} />
                                <span>{clearingImport ? 'Clearing...' : 'Clear Snapshot'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {!gscImport.available ? (
                    <div className="p-6 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-dashed border-[#BBE0CE] dark:border-[#2A3832] text-center space-y-2">
                        <p className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            No Google Search Console Links CSV Imported Yet
                        </p>
                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C] max-w-2xl mx-auto leading-relaxed">
                            OpenPageRank provides aggregate domain authority and referring domain counts, and never invents individual backlink URLs. To inspect specific external linking domains, target pages, and linking-page information, upload your official CSV export from Google Search Console → Links.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Preserved Original Source & Import Date Metadata Bar */}
                        <div className="p-4 rounded-xl bg-[#E5F2EC]/60 dark:bg-[#1F352E]/50 border border-[#BBE0CE] dark:border-[#2A3832] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <CheckCircle2 size={15} className="text-[#2F806B]" />
                                    <strong className="text-[#193D35] dark:text-emerald-300">
                                        Original Source: {gscImport.originalSource || 'Google Search Console Links Report (Manual CSV Import)'}
                                    </strong>
                                    {gscImport.fileName && (
                                        <span className="px-2 py-0.5 rounded bg-white dark:bg-[#18221E] font-mono text-[11px] text-[#193D35] dark:text-emerald-300 border border-[#BBE0CE] dark:border-[#2A3832]">
                                            {gscImport.fileName}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                    {gscImport.disclosure || 'This imported CSV is a static snapshot as of the import date below and does not represent a live backlink feed.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#193D35] dark:text-emerald-300 shrink-0">
                                <Clock size={13} />
                                <span>Imported Report Date: {formatSeoTimestamp(gscImport.importedAt)}</span>
                            </div>
                        </div>

                        {/* Imported GSC Summary Counters */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] font-semibold text-[#75817C]">External Linking Domains (CSV)</p>
                                <p className="mt-1 text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    {externalDomains.length.toLocaleString('en-US')}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] font-semibold text-[#75817C]">Target Pages on Hangbug (CSV)</p>
                                <p className="mt-1 text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    {targetPages.length.toLocaleString('en-US')}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                                <p className="text-[11px] font-semibold text-[#75817C]">Available Linking-Page Records (CSV)</p>
                                <p className="mt-1 text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    {linkingPages.length.toLocaleString('en-US')}
                                </p>
                            </div>
                        </div>

                        {/* Sub-tab Switcher: External Linking Domains | Target Pages | Available Linking-Page Info */}
                        <div className="flex flex-wrap gap-2 border-b border-[#E4EAE6] dark:border-[#2A3832] pb-3 text-xs">
                            {[
                                { id: 'domains', label: `External Linking Domains (${externalDomains.length})` },
                                { id: 'targets', label: `Target Pages (${targetPages.length})` },
                                { id: 'pages', label: `Available Linking-Page Information (${linkingPages.length})` }
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setActiveGscTab(t.id)}
                                    className={`px-3.5 py-2 rounded-xl font-semibold border transition-colors cursor-pointer ${
                                        activeGscTab === t.id
                                            ? 'bg-[#193D35] text-white border-[#193D35]'
                                            : 'bg-[#F7F8F6] dark:bg-[#141D19] text-[#17221F] dark:text-[#F3F6F4] border-[#E4EAE6] dark:border-[#2A3832] hover:border-[#2F806B]'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab 1: External Linking Domains */}
                        {activeGscTab === 'domains' && (
                            <div className="overflow-x-auto rounded-xl border border-[#E4EAE6] dark:border-[#2A3832]">
                                {externalDomains.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-[#75817C]">
                                        No external linking domains were present in this CSV export.
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C]">
                                            <tr>
                                                <th className="py-2.5 px-4">External Linking Domain</th>
                                                <th className="py-2.5 px-3 text-right">External Links (CSV)</th>
                                                <th className="py-2.5 px-4">Target Pages on Hangbug</th>
                                                <th className="py-2.5 px-4">Sample Linking Page / Anchor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                                            {externalDomains.map((d, idx) => (
                                                <tr key={`${d.referringDomain}-${idx}`}>
                                                    <td className="py-2.5 px-4 font-semibold flex items-center gap-1.5">
                                                        <span>{d.referringDomain}</span>
                                                        <ExternalLink size={11} className="text-[#75817C]" />
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-[#193D35] dark:text-emerald-300">
                                                        {d.linksCount}
                                                    </td>
                                                    <td className="py-2.5 px-4 font-mono text-[#2F806B]">
                                                        {Array.isArray(d.targetPages) && d.targetPages.length > 0
                                                            ? d.targetPages.slice(0, 3).join(', ')
                                                            : (d.targetPage || '/')}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-[#75817C]">
                                                        {Array.isArray(d.linkingPages) && d.linkingPages.length > 0
                                                            ? d.linkingPages[0]
                                                            : (d.anchorText || 'Domain-level GSC row')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* Tab 2: Target Pages */}
                        {activeGscTab === 'targets' && (
                            <div className="overflow-x-auto rounded-xl border border-[#E4EAE6] dark:border-[#2A3832]">
                                {targetPages.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-[#75817C]">
                                        No target page rows were present in this CSV export.
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C]">
                                            <tr>
                                                <th className="py-2.5 px-4">Target Page</th>
                                                <th className="py-2.5 px-3 text-right">External Links (CSV)</th>
                                                <th className="py-2.5 px-3 text-right">Linking Domains</th>
                                                <th className="py-2.5 px-4">External Domains Linking Here</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                                            {targetPages.map((t, idx) => (
                                                <tr key={`${t.targetPage}-${idx}`}>
                                                    <td className="py-2.5 px-4 font-mono font-semibold text-[#2F806B]">
                                                        {t.targetPage}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-[#193D35] dark:text-emerald-300">
                                                        {t.linksCount}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-semibold">
                                                        {t.linkingDomainsCount}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-[#75817C]">
                                                        {Array.isArray(t.linkingDomains) && t.linkingDomains.length > 0
                                                            ? t.linkingDomains.slice(0, 5).join(', ')
                                                            : 'Aggregated target page export'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* Tab 3: Available Linking-Page Information */}
                        {activeGscTab === 'pages' && (
                            <div className="overflow-x-auto rounded-xl border border-[#E4EAE6] dark:border-[#2A3832]">
                                {linkingPages.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-[#75817C]">
                                        The uploaded GSC CSV contained domain or target-page summaries without individual source URLs. Upload a Google Search Console &ldquo;Latest links&rdquo; or &ldquo;More sample links&rdquo; CSV export to view specific linking-page URLs.
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C]">
                                            <tr>
                                                <th className="py-2.5 px-4">Linking Page / Source Info</th>
                                                <th className="py-2.5 px-4">External Domain</th>
                                                <th className="py-2.5 px-4">Target Page</th>
                                                <th className="py-2.5 px-4">Anchor / Discovery Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                                            {linkingPages.map((lp, idx) => (
                                                <tr key={`${lp.linkingPage}-${idx}`}>
                                                    <td className="py-2.5 px-4 font-mono text-[11px] break-all">
                                                        {lp.linkingPage}
                                                    </td>
                                                    <td className="py-2.5 px-4 font-semibold">
                                                        {lp.referringDomain}
                                                    </td>
                                                    <td className="py-2.5 px-4 font-mono text-[#2F806B]">
                                                        {lp.targetPage}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-[#75817C]">
                                                        {[lp.anchorText, lp.firstSeen].filter(Boolean).join(' · ') || '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {anchors.length > 0 && (
                            <div className="pt-2">
                                <h4 className="text-xs font-bold text-[#17221F] dark:text-[#F3F6F4] mb-2">
                                    Imported Anchor Texts (from CSV)
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {anchors.map((a) => (
                                        <span
                                            key={a.anchor}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] text-xs"
                                        >
                                            <span>{a.anchor}</span>
                                            <strong className="text-[#193D35] dark:text-emerald-300">({a.count})</strong>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
