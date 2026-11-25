import React, { useState, useMemo } from 'react';
import {
    Wrench,
    Gauge,
    RefreshCw,
    CheckCircle2,
    Smartphone,
    Monitor,
    Code2,
    Image as ImageIcon,
    Link2,
    FileText,
    AlertTriangle,
    Clock,
    Database,
    ShieldAlert,
    Zap
} from 'lucide-react';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';
import { StatusDistributionBar } from './SeoCharts';
import { getStatusBadgeClasses, formatSeoTimestamp } from './seoUtils';

const QUOTA_EXHAUSTED_BANNER_TEXT =
    'Google PageSpeed API daily quota has been reached. Previously cached reports are still available. Please try again after the quota resets.';

const ERROR_CATEGORY_LABELS = {
    daily_quota_exceeded: 'Daily Quota Exhausted (HTTP 429)',
    rate_limit_exceeded: 'Requests-Per-Minute Limit (HTTP 429)',
    invalid_api_key: 'Invalid API Key',
    missing_api_key: 'Missing API Key (PAGESPEED_API_KEY)',
    api_disabled: 'PageSpeed Insights API Disabled',
    network_error: 'Network / Upstream Timeout Error',
    invalid_url: 'Invalid Target URL'
};

const DEFAULT_PRIORITIZED_URLS = [
    { path: '/', label: '/ (Homepage)', category: 'Homepage' },
    { path: '/technologies', label: '/technologies (Technologies Hub)', category: 'Important Technology Pages' },
    { path: '/technologies/javascript', label: 'JavaScript Quiz & Track (/technologies/javascript)', category: 'Important Technology Pages' },
    { path: '/technologies/react', label: 'React.js Quiz & Track (/technologies/react)', category: 'Important Technology Pages' },
    { path: '/technologies/python', label: 'Python Quiz & Track (/technologies/python)', category: 'Important Technology Pages' },
    { path: '/technologies/html', label: 'HTML5 Quiz & Track (/technologies/html)', category: 'Important Technology Pages' },
    { path: '/technologies/css', label: 'CSS3 Quiz & Track (/technologies/css)', category: 'Important Technology Pages' },
    { path: '/technologies/php', label: 'PHP Quiz & Track (/technologies/php)', category: 'Important Technology Pages' },
    { path: '/technologies/csharp', label: 'C# & .NET Quiz & Track (/technologies/csharp)', category: 'Important Technology Pages' },
    { path: '/blog', label: '/blog (Published Blog Articles Hub)', category: 'Published Blog Articles' },
    { path: '/games', label: '/games (Interactive Coding Games Hub)', category: 'Important Public Game Pages' },
    { path: '/games/memory-match', label: 'Coding Memory Match (/games/memory-match)', category: 'Important Public Game Pages' },
    { path: '/games/code-jumble', label: 'Code Jumble (/games/code-jumble)', category: 'Important Public Game Pages' },
    { path: '/games/bug-hunter', label: 'Bug Hunter (/games/bug-hunter)', category: 'Important Public Game Pages' }
];

function isValidScore(val) {
    return typeof val === 'number' && !Number.isNaN(val);
}

export default function SeoTechnicalSection({ data, domain, onDataUpdated }) {
    const [psiStrategy, setPsiStrategy] = useState('mobile');
    const [psiTargetPath, setPsiTargetPath] = useState('/');
    const [customPathInput, setCustomPathInput] = useState('');
    const [useCustomPath, setUseCustomPath] = useState(false);
    const [runningPsi, setRunningPsi] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState(null);
    const [confirmingRefresh, setConfirmingRefresh] = useState(false);
    const [localPsiResult, setLocalPsiResult] = useState(null);
    const [psiErrorState, setPsiErrorState] = useState(null);

    const tech = data?.technical || {};
    const integrations = data?.project?.integrations || {};
    const statusDist = tech.httpStatusCodes?.distribution || { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
    const psiData = localPsiResult || tech.pageSpeed || {};
    const cwv = tech.coreWebVitals || {};
    const psiConnectionStatus = connectionTestResult?.connectionStatus
        || psiData.connectionStatus
        || integrations.pagespeedConnectionStatus
        || (psiData.apiKeyConfigured || integrations.pagespeedHasKey ? 'Configured (Not Tested)' : 'Not Configured');

    const effectiveTargetPath = useMemo(() => {
        const raw = useCustomPath ? customPathInput.trim() : psiTargetPath;
        if (!raw) return '/';
        if (/^https?:\/\//i.test(raw)) {
            try {
                const u = new URL(raw);
                return !u.pathname || u.pathname === '/' ? '/' : u.pathname.replace(/\/+$/, '');
            } catch {
                return raw;
            }
        }
        return raw === '/' ? '/' : (raw.startsWith('/') ? raw.replace(/\/+$/, '') : `/${raw.replace(/\/+$/, '')}`);
    }, [useCustomPath, customPathInput, psiTargetPath]);

    const prioritizedUrlGroups = useMemo(() => {
        const list = Array.isArray(psiData.auditableUrls) && psiData.auditableUrls.length > 0
            ? psiData.auditableUrls
            : DEFAULT_PRIORITIZED_URLS;
        const groups = {
            Homepage: [],
            'Important Technology Pages': [],
            'Published Blog Articles': [],
            'Important Public Game Pages': []
        };
        for (const item of list) {
            const cat = groups[item.category] ? item.category : 'Important Technology Pages';
            groups[cat].push(item);
        }
        return groups;
    }, [psiData.auditableUrls]);

    // Resolve cached Mobile & Desktop reports for the currently selected URL
    const selectedUrlEntry = useMemo(() => {
        const byPath = psiData.byPath || {};
        const byUrl = psiData.byUrl || {};
        const siteOrigin = `https://${domain || 'www.hangbug.com'}`;
        const fullUrl = `${siteOrigin}${effectiveTargetPath}`;

        if (byPath[effectiveTargetPath]) {
            return byPath[effectiveTargetPath];
        }
        if (byUrl[fullUrl]) {
            return byUrl[fullUrl];
        }

        const mobileMatches = psiData.mobile && (psiData.mobile.path === effectiveTargetPath || psiData.mobile.url === fullUrl);
        const desktopMatches = psiData.desktop && (psiData.desktop.path === effectiveTargetPath || psiData.desktop.url === fullUrl);
        if (mobileMatches || desktopMatches || effectiveTargetPath === '/') {
            return {
                url: fullUrl,
                path: effectiveTargetPath,
                mobile: mobileMatches ? psiData.mobile : (effectiveTargetPath === '/' ? psiData.mobile : null),
                desktop: desktopMatches ? psiData.desktop : (effectiveTargetPath === '/' ? psiData.desktop : null)
            };
        }

        return { url: fullUrl, path: effectiveTargetPath, mobile: null, desktop: null };
    }, [psiData, effectiveTargetPath, domain]);

    const selectedMobilePsi = selectedUrlEntry?.mobile || null;
    const selectedDesktopPsi = selectedUrlEntry?.desktop || null;
    const activePsi = psiStrategy === 'desktop' ? selectedDesktopPsi : selectedMobilePsi;

    const mobilePerfScore = isValidScore(selectedMobilePsi?.scores?.performance)
        ? selectedMobilePsi.scores.performance
        : null;
    const desktopPerfScore = isValidScore(selectedDesktopPsi?.scores?.performance)
        ? selectedDesktopPsi.scores.performance
        : null;

    const activeLastAuditDate = activePsi?.checkedAt
        || selectedMobilePsi?.checkedAt
        || selectedDesktopPsi?.checkedAt
        || psiData.lastAuditedAt
        || null;

    const activeQuotaError = useMemo(() => {
        if (psiErrorState) return psiErrorState;
        if (psiData.quotaState?.exhausted || psiData.quotaState?.errorCategory) {
            return psiData.quotaState;
        }
        if (psiData.lastError?.errorCategory) {
            return psiData.lastError;
        }
        return null;
    }, [psiErrorState, psiData.quotaState, psiData.lastError]);

    const isDailyQuotaExhausted = Boolean(
        activeQuotaError?.errorCategory === 'daily_quota_exceeded'
        || activeQuotaError?.isDailyQuota
        || psiData.quotaState?.exhausted
    );

    const nextRetryAt = activeQuotaError?.nextRetryAt || psiData.nextRetryAt || null;

    const cachedStatusLabel = useMemo(() => {
        if (activePsi) {
            if (isDailyQuotaExhausted) return 'Cached Report (Quota Fallback)';
            if (activePsi.fromCache || activePsi.cacheStatus === 'cached') return 'Cached (24h TTL Active)';
            return 'Cached Report Available (24h TTL)';
        }
        if (selectedMobilePsi || selectedDesktopPsi) {
            return `Cached (${selectedMobilePsi ? 'Mobile' : 'Desktop'} Available)`;
        }
        return 'No Cached Report';
    }, [activePsi, selectedMobilePsi, selectedDesktopPsi, isDailyQuotaExhausted]);

    const executePageSpeedAudit = async ({ forceRefresh = false } = {}) => {
        if (runningPsi) return;
        setConfirmingRefresh(false);
        setRunningPsi(true);
        setPsiErrorState(null);

        try {
            const targetToAudit = useCustomPath ? customPathInput.trim() : effectiveTargetPath;
            const res = await seoService.runPageSpeed({
                domain,
                url: targetToAudit || '/',
                strategy: psiStrategy,
                forceRefresh
            });
            if (res?.success) {
                if (res.pagespeed) {
                    setLocalPsiResult(res.pagespeed);
                }
                toast.success(res.message || 'PageSpeed Insights metrics updated.');
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            const errData = err?.response?.data || {};
            const errCategory = errData.errorCategory || 'api_error';
            const userMsg = errData.errorCategory === 'daily_quota_exceeded'
                ? QUOTA_EXHAUSTED_BANNER_TEXT
                : (errData.userMessage || errData.message || err.message || 'Unable to run PageSpeed check right now.');

            setPsiErrorState({
                errorCategory: errCategory,
                isQuotaError: Boolean(errData.isQuotaError),
                isDailyQuota: Boolean(errData.isDailyQuota || errCategory === 'daily_quota_exceeded'),
                userMessage: userMsg,
                technicalDetail: errData.technicalDetail || errData.message || '',
                nextRetryAt: errData.nextRetryAt || null,
                projectNumber: errData.projectNumber || null
            });

            if (errData.pagespeed) {
                setLocalPsiResult(errData.pagespeed);
            }
            toast.error(userMsg);
        } finally {
            setRunningPsi(false);
        }
    };

    const handlePrimaryAuditClick = () => {
        if (activePsi && !confirmingRefresh) {
            setConfirmingRefresh(true);
            return;
        }
        executePageSpeedAudit({ forceRefresh: false });
    };

    const handleTestConnection = async () => {
        if (testingConnection || runningPsi) return;
        setTestingConnection(true);
        setConnectionTestResult(null);
        setPsiErrorState(null);
        try {
            const res = await seoService.testIntegration(domain, 'pagespeed');
            const result = res?.result || { ok: false, provider: 'Google PageSpeed Insights', message: 'No response from backend.' };
            setConnectionTestResult(result);
            if (result.ok) {
                setLocalPsiResult(null);
                toast.success(result.message || 'PageSpeed Insights connection verified.');
                if (onDataUpdated) await onDataUpdated();
            } else {
                const errCat = result.errorCategory || 'api_error';
                const errMsg = result.message || 'PageSpeed Insights connection test failed.';
                setPsiErrorState({
                    errorCategory: errCat,
                    isQuotaError: Boolean(result.isQuotaError),
                    isDailyQuota: Boolean(result.isDailyQuota),
                    userMessage: errMsg,
                    technicalDetail: '',
                    nextRetryAt: result.nextRetryAt || null,
                    projectNumber: result.projectNumber || null
                });
                toast.error(errMsg);
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            const errMsg = err?.response?.data?.message || err.message || 'PageSpeed connection test failed.';
            setConnectionTestResult({
                ok: false,
                connectionStatus: 'Connection Error',
                message: errMsg
            });
            setPsiErrorState({
                errorCategory: 'api_error',
                userMessage: errMsg
            });
            toast.error(errMsg);
        } finally {
            setTestingConnection(false);
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
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6 shadow-[0_1px_3px_rgba(25,61,53,0.04)] space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Gauge size={18} className="text-[#2F806B]" />
                            <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Page Speed &amp; Core Web Vitals (Lighthouse)
                            </h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClasses(cwv.status || psiData.status)}`}>
                                {cwv.status || psiData.status || 'Not checked'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E5F2EC] dark:bg-[#1F352E] text-[#193D35] dark:text-emerald-300 border border-[#BBE0CE] dark:border-[#2A3832]">
                                {cachedStatusLabel}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                psiConnectionStatus === 'Connected'
                                    ? 'bg-[#E5F2EC] dark:bg-emerald-950/50 text-[#193D35] dark:text-emerald-300 border-[#BBE0CE] dark:border-emerald-800/60'
                                    : ['Invalid API Key', 'API Not Enabled', 'Quota Exceeded', 'Connection Error'].includes(psiConnectionStatus)
                                        ? 'bg-[#FCEEED] dark:bg-red-950/50 text-[#B91C1C] dark:text-red-300 border-[#F8C9C6] dark:border-red-800/60'
                                        : psiConnectionStatus === 'Configured (Not Tested)'
                                            ? 'bg-[#FEF5E7] dark:bg-amber-950/50 text-[#B45309] dark:text-amber-300 border-[#F8DFB6] dark:border-amber-800/60'
                                            : 'bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C] dark:text-[#8FA69C] border-[#E4EAE6] dark:border-[#2A3832]'
                            }`}>
                                API: {psiConnectionStatus}
                            </span>
                        </div>
                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-1">
                            On-demand Google PageSpeed Insights checks for {domain}. Successful results are cached by URL &amp; strategy for 24 hours.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            aria-label="Select URL for PageSpeed audit"
                            value={useCustomPath ? '__custom__' : psiTargetPath}
                            onChange={(e) => {
                                setConfirmingRefresh(false);
                                if (e.target.value === '__custom__') {
                                    setUseCustomPath(true);
                                } else {
                                    setUseCustomPath(false);
                                    setPsiTargetPath(e.target.value);
                                }
                            }}
                            className="max-w-xs px-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs text-[#17221F] dark:text-[#F3F6F4]"
                        >
                            {Object.entries(prioritizedUrlGroups).map(([groupLabel, items]) => (
                                items.length > 0 ? (
                                    <optgroup key={groupLabel} label={groupLabel}>
                                        {items.map((item) => {
                                            const cachedTag = item.hasMobileCache || item.hasDesktopCache ? ' [Cached]' : '';
                                            return (
                                                <option key={item.path} value={item.path}>
                                                    {item.label}{cachedTag}
                                                </option>
                                            );
                                        })}
                                    </optgroup>
                                ) : null
                            ))}
                            <option value="__custom__">Custom URL / Path...</option>
                        </select>

                        {useCustomPath && (
                            <input
                                type="text"
                                value={customPathInput}
                                onChange={(e) => setCustomPathInput(e.target.value)}
                                placeholder="/technologies/javascript"
                                className="px-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs text-[#17221F] dark:text-[#F3F6F4] font-mono w-48"
                            />
                        )}

                        <div className="inline-flex rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] overflow-hidden text-xs">
                            <button
                                type="button"
                                onClick={() => {
                                    setPsiStrategy('mobile');
                                    setConfirmingRefresh(false);
                                }}
                                className={`px-3 py-2 font-semibold cursor-pointer ${
                                    psiStrategy === 'mobile' ? 'bg-[#193D35] text-white' : 'bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C]'
                                }`}
                            >
                                Mobile
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setPsiStrategy('desktop');
                                    setConfirmingRefresh(false);
                                }}
                                className={`px-3 py-2 font-semibold cursor-pointer ${
                                    psiStrategy === 'desktop' ? 'bg-[#193D35] text-white' : 'bg-[#F7F8F6] dark:bg-[#141D19] text-[#75817C]'
                                }`}
                            >
                                Desktop
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handlePrimaryAuditClick}
                            disabled={runningPsi || testingConnection || (isDailyQuotaExhausted && Boolean(activePsi))}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                        >
                            <RefreshCw size={13} className={runningPsi ? 'animate-spin' : ''} />
                            <span>
                                {runningPsi
                                    ? 'Measuring...'
                                    : activePsi
                                        ? 'Refresh Audit'
                                        : 'Run PageSpeed Check'}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={testingConnection || runningPsi}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] hover:border-[#2F806B] text-[#17221F] dark:text-[#F3F6F4] text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                        >
                            <Zap size={13} className="text-[#2F806B]" />
                            <span>{testingConnection ? 'Testing Connection...' : 'Test PageSpeed Connection'}</span>
                        </button>
                    </div>
                </div>

                {/* Live Connection Test Result Banner */}
                {connectionTestResult?.ok && (
                    <div className="p-3.5 rounded-xl bg-[#E5F2EC] dark:bg-emerald-950/40 border border-[#BBE0CE] dark:border-emerald-800/60 text-xs text-[#193D35] dark:text-emerald-300 flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#2F806B]" />
                        <div className="space-y-0.5">
                            <p className="font-bold">
                                PageSpeed Insights API v5 Verified ({connectionTestResult.targetUrl || 'https://www.hangbug.com/'})
                            </p>
                            <p className="leading-relaxed">{connectionTestResult.message}</p>
                        </div>
                    </div>
                )}

                {/* Manual Refresh Confirmation Prompt */}
                {confirmingRefresh && (
                    <div className="p-4 rounded-xl bg-[#FEF5E7] dark:bg-amber-950/40 border border-[#F8DFB6] dark:border-amber-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#92400E] dark:text-amber-200">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-[#D19A45]" />
                            <div>
                                <p className="font-bold">Confirm Live PageSpeed Refresh</p>
                                <p className="mt-0.5 leading-relaxed">
                                    A cached {psiStrategy} report for <code className="font-mono font-semibold">{effectiveTargetPath}</code> from{' '}
                                    <span className="font-semibold">{formatSeoTimestamp(activePsi?.checkedAt)}</span> is still valid (24-hour cache). Running a fresh live check will consume Google PageSpeed API quota.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setConfirmingRefresh(false)}
                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18221E] border border-[#E4EAE6] dark:border-[#2A3832] text-[#17221F] dark:text-[#F3F6F4] font-semibold cursor-pointer"
                            >
                                Keep Cached Report
                            </button>
                            <button
                                type="button"
                                onClick={() => executePageSpeedAudit({ forceRefresh: true })}
                                disabled={runningPsi || isDailyQuotaExhausted}
                                className="px-3.5 py-1.5 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white font-semibold cursor-pointer disabled:opacity-50"
                            >
                                Confirm Live Refresh
                            </button>
                        </div>
                    </div>
                )}

                {/* Quota Exhausted & API Error Details Banner */}
                {activeQuotaError && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                        isDailyQuotaExhausted
                            ? 'bg-[#FEF5E7] dark:bg-amber-950/40 border-[#F8DFB6] dark:border-amber-800/70 text-[#92400E] dark:text-amber-200'
                            : 'bg-[#FCEEED] dark:bg-red-950/40 border-[#F8C9C6] dark:border-red-800/60 text-[#B91C1C] dark:text-red-200'
                    }`}>
                        <div className="flex items-start gap-2.5">
                            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                            <div className="space-y-1 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-bold">
                                        {ERROR_CATEGORY_LABELS[activeQuotaError.errorCategory] || 'Google PageSpeed API Notice'}
                                    </span>
                                    {activeQuotaError.projectNumber && (
                                        <span className="px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 font-mono text-[11px] font-semibold">
                                            GCP Project: {activeQuotaError.projectNumber}
                                        </span>
                                    )}
                                </div>
                                <p className="font-semibold leading-relaxed">
                                    {isDailyQuotaExhausted
                                        ? QUOTA_EXHAUSTED_BANNER_TEXT
                                        : (activeQuotaError.userMessage || activeQuotaError.message)}
                                </p>
                                {(activeQuotaError.technicalDetail || activeQuotaError.message) && (
                                    <p className="text-[11px] opacity-90 font-mono break-all">
                                        Details: {activeQuotaError.technicalDetail || activeQuotaError.message}
                                    </p>
                                )}
                                {nextRetryAt && (
                                    <p className="text-[11px] font-semibold flex items-center gap-1.5 pt-0.5">
                                        <Clock size={12} />
                                        <span>Next Available Retry: {formatSeoTimestamp(nextRetryAt)} ({nextRetryAt})</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4 Summary Cards: Last Audit Date, Cached Result Status, Mobile Performance, Desktop Performance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                            <Clock size={12} className="text-[#2F806B]" />
                            <span>Last Audit Date</span>
                        </div>
                        <p className="mt-1.5 font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            {activeLastAuditDate ? formatSeoTimestamp(activeLastAuditDate) : 'Not audited yet'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C] dark:text-[#8FA69C] font-mono truncate">
                            Target: {effectiveTargetPath}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                            <Database size={12} className="text-[#2F806B]" />
                            <span>Cached Result Status</span>
                        </div>
                        <p className="mt-1.5 font-bold text-[#193D35] dark:text-emerald-300">
                            {cachedStatusLabel}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C] dark:text-[#8FA69C]">
                            {activePsi?.expiresAt
                                ? `Expires ${formatSeoTimestamp(activePsi.expiresAt)}`
                                : (nextRetryAt ? `Next retry: ${formatSeoTimestamp(nextRetryAt)}` : '24-hour cache window')}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center justify-between gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                            <span className="inline-flex items-center gap-1.5">
                                <Smartphone size={12} className="text-[#2F806B]" />
                                <span>Mobile Performance</span>
                            </span>
                            {selectedMobilePsi && (
                                <span className="px-1.5 py-0.5 rounded bg-[#E5F2EC] dark:bg-[#1F352E] text-[10px] text-[#193D35] dark:text-emerald-300 font-semibold">
                                    Cached
                                </span>
                            )}
                        </div>
                        <p className={`mt-1.5 text-lg font-display font-bold ${
                            mobilePerfScore === null
                                ? 'text-[#75817C] dark:text-[#8FA69C]'
                                : mobilePerfScore >= 90
                                    ? 'text-[#2F806B]'
                                    : mobilePerfScore >= 50
                                        ? 'text-[#D19A45]'
                                        : 'text-[#C96155]'
                        }`}>
                            {mobilePerfScore !== null ? `${mobilePerfScore}/100` : 'Not audited'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C] dark:text-[#8FA69C]">
                            {selectedMobilePsi?.checkedAt ? `Audited ${formatSeoTimestamp(selectedMobilePsi.checkedAt)}` : 'Select Mobile & run check'}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center justify-between gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                            <span className="inline-flex items-center gap-1.5">
                                <Monitor size={12} className="text-[#2F806B]" />
                                <span>Desktop Performance</span>
                            </span>
                            {selectedDesktopPsi && (
                                <span className="px-1.5 py-0.5 rounded bg-[#E5F2EC] dark:bg-[#1F352E] text-[10px] text-[#193D35] dark:text-emerald-300 font-semibold">
                                    Cached
                                </span>
                            )}
                        </div>
                        <p className={`mt-1.5 text-lg font-display font-bold ${
                            desktopPerfScore === null
                                ? 'text-[#75817C] dark:text-[#8FA69C]'
                                : desktopPerfScore >= 90
                                    ? 'text-[#2F806B]'
                                    : desktopPerfScore >= 50
                                        ? 'text-[#D19A45]'
                                        : 'text-[#C96155]'
                        }`}>
                            {desktopPerfScore !== null ? `${desktopPerfScore}/100` : 'Not audited'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C] dark:text-[#8FA69C]">
                            {selectedDesktopPsi?.checkedAt ? `Audited ${formatSeoTimestamp(selectedDesktopPsi.checkedAt)}` : 'Select Desktop & run check'}
                        </p>
                    </div>
                </div>

                {activePsi ? (
                    <div className="pt-2 space-y-5">
                        {/* 4 Lighthouse Scores (Never converts missing/error scores into 0) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Performance', val: activePsi.scores?.performance },
                                { label: 'Accessibility', val: activePsi.scores?.accessibility },
                                { label: 'Best Practices', val: activePsi.scores?.bestPractices },
                                { label: 'Lighthouse SEO', val: activePsi.scores?.seo }
                            ].map((s) => {
                                const hasScore = isValidScore(s.val);
                                return (
                                    <div key={s.label} className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] text-center">
                                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">{s.label}</p>
                                        <p className={`text-2xl font-display font-bold mt-1 ${
                                            !hasScore
                                                ? 'text-[#75817C] dark:text-[#8FA69C]'
                                                : s.val >= 90
                                                    ? 'text-[#2F806B]'
                                                    : s.val >= 50
                                                        ? 'text-[#D19A45]'
                                                        : 'text-[#C96155]'
                                        }`}>
                                            {hasScore ? s.val : '—'}
                                        </p>
                                    </div>
                                );
                            })}
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
                            Source: {activePsi.source} ({activePsi.strategy}) · URL: {activePsi.url} · Last Audit: {formatSeoTimestamp(activePsi.checkedAt)} · Status: {cachedStatusLabel}
                        </p>
                    </div>
                ) : (
                    <div className="pt-1">
                        <div className="p-4 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-dashed border-[#E4EAE6] dark:border-[#2A3832] text-xs text-[#75817C] dark:text-[#8FA69C]">
                            {isDailyQuotaExhausted
                                ? QUOTA_EXHAUSTED_BANNER_TEXT
                                : (psiData.explanation || `No cached ${psiStrategy} PageSpeed Insights report found for ${effectiveTargetPath}. Click "Run PageSpeed Check" to audit this URL on demand.`)}
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
