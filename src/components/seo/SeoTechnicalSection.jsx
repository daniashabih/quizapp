import React, { useState } from 'react';
import {
    Wrench,
    Gauge,
    RefreshCw,
    CheckCircle2,
    Smartphone,
    Code2,
    Image as ImageIcon,
    Link2,
    FileText
} from 'lucide-react';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';
import { StatusDistributionBar } from './SeoCharts';
import { getStatusBadgeClasses, formatSeoTimestamp } from './seoUtils';

export default function SeoTechnicalSection({ data, domain, onDataUpdated }) {
    const [psiStrategy, setPsiStrategy] = useState('mobile');
    const [psiTargetPath, setPsiTargetPath] = useState('/');
    const [runningPsi, setRunningPsi] = useState(false);

    const tech = data?.technical || {};
    const statusDist = tech.httpStatusCodes?.distribution || { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
    const psiData = tech.pageSpeed || {};
    const activePsi = psiStrategy === 'desktop' ? psiData.desktop : psiData.mobile;
    const cwv = tech.coreWebVitals || {};

    const handleRunPageSpeed = async () => {
        setRunningPsi(true);
        try {
            const res = await seoService.runPageSpeed({
                domain,
                url: psiTargetPath,
                strategy: psiStrategy
            });
            if (res?.success) {
                toast.success(res.message || 'PageSpeed Insights metrics updated.');
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Unable to run PageSpeed check right now.');
        } finally {
            setRunningPsi(false);
        }
    };

    const reportCards = [
        {
            key: 'brokenLinks',
            title: 'Broken Links',
            icon: Link2,
            status: tech.brokenLinks?.status || 'Not checked',
            explanation: tech.brokenLinks?.explanation,
            urls: (tech.brokenLinks?.items || []).map(b => ({ url: b.sourcePage, detail: `Broken -> ${b.targetUrl} (${b.status})` }))
        },
        {
            key: 'redirectChains',
            title: 'Redirect Chains',
            icon: Link2,
            status: tech.redirectChains?.status || 'Not checked',
            explanation: tech.redirectChains?.explanation,
            urls: (tech.redirectChains?.items || []).map(r => ({ url: r.sourcePath, detail: `${r.redirectHops} hop(s) -> ${r.finalUrl} (${r.finalStatus})` }))
        },
        {
            key: 'canonicalTags',
            title: 'Canonical Tags',
            icon: Code2,
            status: tech.canonicalTags?.status || 'Not checked',
            explanation: tech.canonicalTags?.explanation,
            urls: tech.canonicalTags?.affectedUrls || []
        },
        {
            key: 'sitemap',
            title: 'XML Sitemap',
            icon: FileText,
            status: tech.sitemap?.status || 'Not checked',
            explanation: tech.sitemap?.explanation,
            urls: (tech.sitemap?.sampleUrls || []).slice(0, 6).map(u => ({ url: u, detail: 'Included in /sitemap.xml' }))
        },
        {
            key: 'robotsTxt',
            title: 'Robots.txt',
            icon: FileText,
            status: tech.robotsTxt?.status || 'Not checked',
            explanation: tech.robotsTxt?.explanation,
            urls: [{ url: '/robots.txt', detail: tech.robotsTxt?.valid ? 'Valid crawl directives' : 'Review directives' }]
        },
        {
            key: 'mobileUsability',
            title: 'Mobile Usability',
            icon: Smartphone,
            status: tech.mobileUsability?.status || 'Not checked',
            explanation: tech.mobileUsability?.explanation,
            urls: []
        },
        {
            key: 'structuredData',
            title: 'Structured Data (JSON-LD)',
            icon: Code2,
            status: tech.structuredData?.status || 'Not checked',
            explanation: `${tech.structuredData?.explanation || ''} Schemas: ${(tech.structuredData?.schemasDetected || []).join(', ') || 'None'}`,
            urls: tech.structuredData?.affectedUrls || []
        },
        {
            key: 'imageOptimization',
            title: 'Image Optimization',
            icon: ImageIcon,
            status: tech.imageOptimization?.status || 'Not checked',
            explanation: tech.imageOptimization?.explanation,
            urls: tech.imageOptimization?.affectedUrls || []
        }
    ];

    return (
        <div className="space-y-6 animate-fade-up">
            {/* HTTP Status Distribution */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <Wrench size={17} className="text-[#2F806B]" />
                        <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            HTTP Status Codes ({tech.httpStatusCodes?.totalChecked || 0} Pages Checked)
                        </h2>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClasses(tech.httpStatusCodes?.status)}`}>
                        {tech.httpStatusCodes?.status || 'Not checked'}
                    </span>
                </div>
                <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mb-4">
                    {tech.httpStatusCodes?.explanation}
                </p>
                <StatusDistributionBar
                    segments={[
                        { label: '200 OK', value: statusDist['2xx'] || 0, color: '#2F806B' },
                        { label: '3xx Redirect', value: statusDist['3xx'] || 0, color: '#D19A45' },
                        { label: '4xx Client Error', value: statusDist['4xx'] || 0, color: '#C96155' },
                        { label: '5xx Server Error', value: statusDist['5xx'] || 0, color: '#991B1B' }
                    ]}
                />
            </div>

            {/* Live PageSpeed & Core Web Vitals Card */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <div>
                        <div className="flex items-center gap-2">
                            <Gauge size={18} className="text-[#2F806B]" />
                            <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Page Speed &amp; Core Web Vitals (Lighthouse)
                            </h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClasses(cwv.status || psiData.status)}`}>
                                {cwv.status || psiData.status || 'Not checked'}
                            </span>
                        </div>
                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-1">
                            Runs real Google PageSpeed Insights checks for {domain} without modifying site code.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={psiTargetPath}
                            onChange={(e) => setPsiTargetPath(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs text-[#17221F] dark:text-[#F3F6F4]"
                        >
                            <option value="/">/ (Homepage)</option>
                            <option value="/technologies">/technologies</option>
                            <option value="/games">/games</option>
                            <option value="/blog">/blog</option>
                        </select>

                        <div className="inline-flex rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] overflow-hidden text-xs">
                            <button
                                type="button"
                                onClick={() => setPsiStrategy('mobile')}
                                className={`px-3 py-2 font-semibold cursor-pointer ${
                                    psiStrategy === 'mobile' ? 'bg-[#193D35] text-white' : 'bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C]'
                                }`}
                            >
                                Mobile
                            </button>
                            <button
                                type="button"
                                onClick={() => setPsiStrategy('desktop')}
                                className={`px-3 py-2 font-semibold cursor-pointer ${
                                    psiStrategy === 'desktop' ? 'bg-[#193D35] text-white' : 'bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C]'
                                }`}
                            >
                                Desktop
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleRunPageSpeed}
                            disabled={runningPsi}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                        >
                            <RefreshCw size={13} className={runningPsi ? 'animate-spin' : ''} />
                            <span>{runningPsi ? 'Measuring...' : 'Run PageSpeed Check'}</span>
                        </button>
                    </div>
                </div>

                {activePsi ? (
                    <div className="pt-5 space-y-5">
                        {/* 4 Lighthouse Scores */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Performance', val: activePsi.scores?.performance },
                                { label: 'Accessibility', val: activePsi.scores?.accessibility },
                                { label: 'Best Practices', val: activePsi.scores?.bestPractices },
                                { label: 'Lighthouse SEO', val: activePsi.scores?.seo }
                            ].map((s) => (
                                <div key={s.label} className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] text-center">
                                    <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">{s.label}</p>
                                    <p className={`text-2xl font-display font-bold mt-1 ${
                                        (s.val ?? 0) >= 90 ? 'text-[#2F806B]' : (s.val ?? 0) >= 50 ? 'text-[#D19A45]' : 'text-[#C96155]'
                                    }`}>
                                        {s.val ?? '—'}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Core Web Vitals Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {['lcp', 'cls', 'inp', 'fcp', 'ttfb'].map((k) => {
                                const m = activePsi.coreWebVitals?.[k];
                                if (!m) return null;
                                return (
                                    <div key={k} className="p-3.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832]">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-[11px] font-bold uppercase text-[#75817C]">{k.toUpperCase()}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClasses(m.status)}`}>
                                                {m.status}
                                            </span>
                                        </div>
                                        <p className="text-lg font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1.5">
                                            {m.displayValue}
                                        </p>
                                        <p className="text-[10px] text-[#75817C] dark:text-[#8FA69C] mt-0.5">{m.label}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                            Source: {activePsi.source} ({activePsi.strategy}) · URL: {activePsi.url} · Checked {formatSeoTimestamp(activePsi.checkedAt)}
                        </p>
                    </div>
                ) : (
                    <div className="pt-5">
                        <div className="p-4 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-dashed border-[#E4EAE6] dark:border-[#2A3832] text-xs text-[#75817C] dark:text-[#8FA69C]">
                            {psiData.explanation || 'No live PageSpeed Insights snapshot saved for this strategy yet. Click "Run PageSpeed Check" to fetch real Core Web Vitals and Lighthouse diagnostics.'}
                        </div>
                    </div>
                )}
            </div>

            {/* Technical Checks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.key} className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Icon size={16} className="text-[#2F806B]" />
                                        <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                            {card.title}
                                        </h3>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClasses(card.status)}`}>
                                        {card.status}
                                    </span>
                                </div>

                                <p className="text-xs text-[#75817C] dark:text-[#8FA69C] leading-relaxed">
                                    {card.explanation}
                                </p>
                            </div>

                            {Array.isArray(card.urls) && card.urls.length > 0 ? (
                                <div className="mt-3 pt-3 border-t border-[#E4EAE6] dark:border-[#2A3832] space-y-1.5 max-h-36 overflow-y-auto">
                                    {card.urls.slice(0, 6).map((u, idx) => (
                                        <div key={`${u.url}-${idx}`} className="flex items-center justify-between gap-2 text-[11px]">
                                            <span className="font-mono text-[#17221F] dark:text-[#F3F6F4] truncate">{u.url}</span>
                                            <span className="text-[#75817C] dark:text-[#8FA69C] shrink-0">{u.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-3 pt-2.5 border-t border-[#E4EAE6] dark:border-[#2A3832] flex items-center gap-1.5 text-[11px] text-[#2F806B] font-medium">
                                    <CheckCircle2 size={12} />
                                    <span>No affected error URLs</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
