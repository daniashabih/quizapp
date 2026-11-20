import React, { useState, useEffect, useCallback } from 'react';
import {
    Settings,
    Shield,
    Save,
    Zap,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Link2,
    Unlink,
    Globe,
    Mail,
    Clock,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';
import { formatSeoTimestamp } from './seoUtils';

const GSC_STATUS_STYLE = {
    connected: {
        label: 'Connected',
        badge: 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70',
        dot: 'bg-[#2F806B]'
    },
    not_connected: {
        label: 'Not Connected',
        badge: 'bg-[#F7F8F6] text-[#75817C] border-[#E4EAE6] dark:bg-[#1F2D27] dark:text-[#8FA69C] dark:border-[#2A3832]',
        dot: 'bg-[#75817C]'
    },
    expired: {
        label: 'Connection Expired',
        badge: 'bg-[#FEF5E7] text-[#B45309] border-[#F8DFB6] dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70',
        dot: 'bg-[#D19A45]'
    },
    revoked: {
        label: 'Permission Revoked',
        badge: 'bg-[#FCEEED] text-[#B91C1C] border-[#F8C9C6] dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/70',
        dot: 'bg-[#C96155]'
    }
};

export default function SeoSettingsSection({ domain, onDataUpdated }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingTarget, setTestingTarget] = useState('');
    const [testResult, setTestResult] = useState(null);

    const [connectingGsc, setConnectingGsc] = useState(false);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [savingProperty, setSavingProperty] = useState(false);
    const [refreshingGsc, setRefreshingGsc] = useState(false);
    const [disconnectingGsc, setDisconnectingGsc] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState('');
    const [gscBanner, setGscBanner] = useState(null);

    const [form, setForm] = useState({
        projectName: 'Hangbug',
        siteUrl: 'https://www.hangbug.com',
        ga4PropertyId: '',
        ga4MeasurementId: 'G-BSZBBFZZH0',
        pagespeedApiKey: '',
        backlinkProvider: 'none',
        backlinkProviderKey: '',
        keywordProvider: 'none',
        keywordProviderKey: '',
        crawlFrequency: 'daily',
        maxCrawlPages: 60
    });

    const [flags, setFlags] = useState({});

    const applySettingsResponse = useCallback((s) => {
        if (!s) return;
        setFlags(s);
        setSelectedProperty(s.gscProperty || '');
        setForm((prev) => ({
            ...prev,
            projectName: s.projectName || 'Hangbug',
            siteUrl: s.siteUrl || `https://${domain}`,
            ga4PropertyId: s.ga4PropertyId || '',
            ga4MeasurementId: s.ga4MeasurementId || 'G-BSZBBFZZH0',
            backlinkProvider: s.backlinkProvider || 'none',
            keywordProvider: s.keywordProvider || 'none',
            crawlFrequency: s.crawlFrequency || 'daily',
            maxCrawlPages: s.maxCrawlPages || 60
        }));
    }, [domain]);

    const loadSettings = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);
        try {
            const res = await seoService.getSettings(domain);
            if (res?.settings) {
                applySettingsResponse(res.settings);
            }
        } catch {
            toast.error('Failed to load SEO settings.');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [domain, applySettingsResponse]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    // Handle OAuth 2.0 callback return query parameters (?gsc_oauth=connected|select_property|error)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const oauthStatus = params.get('gsc_oauth');
        if (!oauthStatus) return;

        const message = params.get('message') || '';

        if (oauthStatus === 'connected') {
            toast.success('Google Search Console connected successfully.');
            setGscBanner({
                type: 'success',
                text: 'Google account authorized and Search Console property verified. You can now refresh or view live Search Analytics.'
            });
        } else if (oauthStatus === 'select_property') {
            toast.info('Google account connected. Please select and verify your Hangbug property below.');
            setGscBanner({
                type: 'info',
                text: 'Google account connected! Select your Hangbug property (e.g. sc-domain:hangbug.com or https://www.hangbug.com/) from the dropdown below and verify access.'
            });
        } else if (oauthStatus === 'error') {
            const errText = message || 'Google Search Console authorization did not complete.';
            toast.error(errText);
            setGscBanner({ type: 'error', text: errText });
        }

        // Remove OAuth query params from address bar cleanly
        params.delete('gsc_oauth');
        params.delete('message');
        params.delete('domain');
        const nextQuery = params.toString();
        const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
        window.history.replaceState({}, '', nextUrl);

        loadSettings({ silent: true }).then(() => {
            if (onDataUpdated) onDataUpdated();
        });
    }, [loadSettings, onDataUpdated]);

    const handleConnectGoogleAccount = async () => {
        setConnectingGsc(true);
        setGscBanner(null);
        try {
            const res = await seoService.getGscOAuthAuthorizeUrl(domain, 'web');
            if (res?.success && res?.authUrl) {
                window.location.assign(res.authUrl);
                return;
            }
            throw new Error(res?.message || 'Unable to generate Google OAuth authorization URL.');
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Failed to start Google OAuth flow.';
            toast.error(msg);
            setGscBanner({ type: 'error', text: msg });
            setConnectingGsc(false);
        }
    };

    const handleFetchProperties = async () => {
        setLoadingProperties(true);
        try {
            const res = await seoService.getGscProperties(domain);
            if (res?.settings) {
                applySettingsResponse(res.settings);
            }
            const count = Array.isArray(res?.properties) ? res.properties.length : 0;
            toast.success(`Retrieved ${count} Search Console propert${count === 1 ? 'y' : 'ies'}.`);
        } catch (err) {
            const data = err?.response?.data;
            if (data?.settings) {
                applySettingsResponse(data.settings);
            }
            toast.error(data?.message || 'Unable to fetch Search Console properties.');
        } finally {
            setLoadingProperties(false);
        }
    };

    const handleVerifyAndSaveProperty = async () => {
        if (!selectedProperty) {
            toast.error('Please select a Search Console property from the dropdown.');
            return;
        }
        setSavingProperty(true);
        setGscBanner(null);
        try {
            const res = await seoService.selectGscProperty(domain, selectedProperty);
            if (res?.settings) {
                applySettingsResponse(res.settings);
            }
            toast.success(res?.message || `Verified and saved property ${selectedProperty}.`);
            setGscBanner({
                type: 'success',
                text: `Verified access to ${res?.property || selectedProperty}.`
            });
            if (onDataUpdated) await onDataUpdated();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Unable to verify property access.';
            toast.error(msg);
            setGscBanner({ type: 'error', text: msg });
        } finally {
            setSavingProperty(false);
        }
    };

    const handleRefreshGscData = async () => {
        setRefreshingGsc(true);
        setTestResult(null);
        try {
            const res = await seoService.refreshGscData(domain, '28d');
            if (res?.settings) {
                applySettingsResponse(res.settings);
            }
            if (res?.success) {
                toast.success(res.message || 'Search Console data refreshed.');
                if (onDataUpdated) await onDataUpdated();
            } else {
                toast.error(res?.message || 'Unable to refresh Search Console data.');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to refresh Search Console data.');
        } finally {
            setRefreshingGsc(false);
        }
    };

    const handleDisconnectGsc = async () => {
        const confirmed = window.confirm(
            'Disconnect this Google account from Hangbug Search Console integration? Stored OAuth tokens will be revoked and removed.'
        );
        if (!confirmed) return;

        setDisconnectingGsc(true);
        setTestResult(null);
        setGscBanner(null);
        try {
            const res = await seoService.disconnectGscAccount(domain);
            if (res?.settings) {
                applySettingsResponse(res.settings);
            }
            toast.success(res?.message || 'Google Search Console disconnected.');
            if (onDataUpdated) await onDataUpdated();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Unable to disconnect Google account.');
        } finally {
            setDisconnectingGsc(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                projectName: form.projectName,
                siteUrl: form.siteUrl,
                ga4PropertyId: form.ga4PropertyId,
                ga4MeasurementId: form.ga4MeasurementId,
                ...(form.pagespeedApiKey ? { pagespeedApiKey: form.pagespeedApiKey } : {}),
                backlinkProvider: form.backlinkProvider,
                ...(form.backlinkProviderKey ? { backlinkProviderKey: form.backlinkProviderKey } : {}),
                keywordProvider: form.keywordProvider,
                ...(form.keywordProviderKey ? { keywordProviderKey: form.keywordProviderKey } : {}),
                crawlFrequency: form.crawlFrequency,
                maxCrawlPages: form.maxCrawlPages
            };

            const res = await seoService.updateSettings(domain, payload);
            if (res?.success) {
                toast.success(res.message || 'SEO settings saved.');
                applySettingsResponse(res.settings);
                setForm(prev => ({
                    ...prev,
                    pagespeedApiKey: '',
                    backlinkProviderKey: '',
                    keywordProviderKey: ''
                }));
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save SEO settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async (target) => {
        setTestingTarget(target);
        setTestResult(null);
        try {
            const res = await seoService.testIntegration(domain, target);
            setTestResult(res?.result || { ok: false, provider: target, message: 'No response' });
            if (target === 'gsc') {
                await loadSettings({ silent: true });
            }
        } catch (err) {
            setTestResult({
                ok: false,
                provider: target,
                message: err?.response?.data?.message || 'Test request failed.'
            });
        } finally {
            setTestingTarget('');
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-8 text-center text-xs text-[#75817C]">
                Loading SEO &amp; integration settings...
            </div>
        );
    }

    const gscStatusKey = flags.gscConnectionStatus || 'not_connected';
    const statusUi = GSC_STATUS_STYLE[gscStatusKey] || GSC_STATUS_STYLE.not_connected;
    const isGscConnected = gscStatusKey === 'connected';
    const isGscDisconnected = gscStatusKey === 'not_connected';
    const availableProperties = Array.isArray(flags.gscAvailableProperties) ? flags.gscAvailableProperties : [];

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Security Note */}
            <div className="bg-[#E5F2EC]/70 dark:bg-[#1F352E]/60 border border-[#BBE0CE] dark:border-[#2A3832] rounded-2xl p-4 flex items-start gap-2.5 text-xs text-[#193D35] dark:text-[#F3F6F4]">
                <Shield size={16} className="shrink-0 mt-0.5 text-[#2F806B]" />
                <p className="leading-relaxed">
                    Google Search Console uses secure <strong>Google OAuth 2.0</strong> read-only authorization (<code className="text-[11px]">webmasters.readonly</code>) — no service account JSON keys required. OAuth tokens are encrypted on the backend and never exposed to browser JavaScript.
                </p>
            </div>

            {/* Google Search Console Integration Panel */}
            <section className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6 space-y-5 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E5F2EC] dark:bg-[#1F352E] text-[#193D35] dark:text-emerald-300 flex items-center justify-center shrink-0 border border-[#BBE0CE] dark:border-[#2F806B]/40">
                            <Globe size={18} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    Google Search Console Integration
                                </h2>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusUi.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusUi.dot}`} />
                                    {flags.gscConnectionStatusLabel || statusUi.label}
                                </span>
                            </div>
                            <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-0.5">
                                Authorize read-only Search Analytics access via Google OAuth 2.0 and select your verified property.
                            </p>
                        </div>
                    </div>

                    {/* Primary OAuth Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <button
                            type="button"
                            disabled={connectingGsc}
                            onClick={handleConnectGoogleAccount}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white font-semibold transition-colors cursor-pointer disabled:opacity-60"
                        >
                            <Link2 size={13} />
                            <span>
                                {connectingGsc
                                    ? 'Redirecting...'
                                    : isGscConnected
                                        ? 'Reconnect Google Account'
                                        : 'Connect Google Account'}
                            </span>
                        </button>

                        <button
                            type="button"
                            disabled={Boolean(testingTarget) || isGscDisconnected}
                            onClick={() => handleTest('gsc')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] hover:border-[#2F806B] font-semibold text-[#17221F] dark:text-[#F3F6F4] cursor-pointer disabled:opacity-50"
                        >
                            <Zap size={13} className="text-[#2F806B]" />
                            <span>{testingTarget === 'gsc' ? 'Testing...' : 'Test Connection'}</span>
                        </button>

                        <button
                            type="button"
                            disabled={refreshingGsc || !isGscConnected || !flags.gscPropertyVerified}
                            onClick={handleRefreshGscData}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] hover:border-[#2F806B] font-semibold text-[#17221F] dark:text-[#F3F6F4] cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw size={13} className={refreshingGsc ? 'animate-spin text-[#2F806B]' : 'text-[#2F806B]'} />
                            <span>{refreshingGsc ? 'Refreshing...' : 'Refresh Data'}</span>
                        </button>

                        {!isGscDisconnected && (
                            <button
                                type="button"
                                disabled={disconnectingGsc}
                                onClick={handleDisconnectGsc}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#F8C9C6] dark:border-red-800/70 bg-[#FCEEED] dark:bg-red-950/40 text-[#B91C1C] dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/70 font-semibold cursor-pointer disabled:opacity-50"
                            >
                                <Unlink size={13} />
                                <span>{disconnectingGsc ? 'Disconnecting...' : 'Disconnect'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Server Env Warning if GOOGLE_CLIENT_ID/SECRET missing */}
                {flags.gscOAuthConfigured === false && (
                    <div className="p-3.5 rounded-xl bg-[#FEF5E7] dark:bg-amber-950/40 border border-[#F8DFB6] dark:border-amber-800/70 text-xs text-[#B45309] dark:text-amber-300 flex items-start gap-2">
                        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Google OAuth Environment Variables Required</p>
                            <p className="mt-0.5">
                                Configure <code className="font-mono">GOOGLE_CLIENT_ID</code>, <code className="font-mono">GOOGLE_CLIENT_SECRET</code>, and <code className="font-mono">GOOGLE_REDIRECT_URI</code> on the server before connecting.
                            </p>
                        </div>
                    </div>
                )}

                {/* OAuth Feedback Banner */}
                {gscBanner && (
                    <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                        gscBanner.type === 'success'
                            ? 'bg-[#E5F2EC] border-[#BBE0CE] text-[#193D35] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                            : gscBanner.type === 'error'
                                ? 'bg-[#FCEEED] border-[#F8C9C6] text-[#B91C1C] dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                                : 'bg-[#F7F8F6] border-[#E4EAE6] text-[#17221F] dark:bg-[#141D19] dark:text-[#F3F6F4] dark:border-[#2A3832]'
                    }`}>
                        {gscBanner.type === 'success' ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" /> : <AlertCircle size={15} className="shrink-0 mt-0.5" />}
                        <p className="leading-relaxed">{gscBanner.text}</p>
                    </div>
                )}

                {/* Last Error Notice (Expired / Revoked / Property Access Denied) */}
                {flags.gscLastError && (gscStatusKey === 'expired' || gscStatusKey === 'revoked' || !flags.gscPropertyVerified) && (
                    <div className="p-3.5 rounded-xl bg-[#FEF5E7] dark:bg-amber-950/40 border border-[#F8DFB6] dark:border-amber-800/70 text-xs text-[#B45309] dark:text-amber-300 flex items-start gap-2">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{flags.gscLastError}</p>
                    </div>
                )}

                {/* Connected Metadata Grid */}
                {!isGscDisconnected && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                                <Mail size={12} className="text-[#2F806B]" />
                                <span>Connected Google Account</span>
                            </div>
                            <p className="mt-1.5 font-semibold text-[#17221F] dark:text-[#F3F6F4] truncate" title={flags.gscAccountEmail || 'Not available'}>
                                {flags.gscAccountEmail || 'Not available'}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                                <Globe size={12} className="text-[#2F806B]" />
                                <span>Selected Search Console Property</span>
                            </div>
                            <p className="mt-1.5 font-mono text-[11px] font-semibold text-[#17221F] dark:text-[#F3F6F4] truncate" title={flags.gscProperty || 'Not selected'}>
                                {flags.gscProperty || 'Not selected'}
                            </p>
                            <p className="mt-0.5 text-[10px] font-semibold text-[#2F806B] dark:text-emerald-400">
                                {flags.gscPropertyVerified ? 'Verified access' : 'Verification required'}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                                <Clock size={12} className="text-[#2F806B]" />
                                <span>Last Successful Sync</span>
                            </div>
                            <p className="mt-1.5 font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                                {flags.gscLastSyncedAt ? formatSeoTimestamp(flags.gscLastSyncedAt) : 'Not synced yet'}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                                <ShieldCheck size={12} className="text-[#2F806B]" />
                                <span>Connection Status</span>
                            </div>
                            <p className="mt-1.5 font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                                {flags.gscConnectionStatusLabel || statusUi.label}
                            </p>
                        </div>
                    </div>
                )}

                {/* Search Console Property Selector & Verification */}
                {isGscConnected && (
                    <div className="p-4 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] space-y-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <p className="font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                    Select &amp; Verify Search Console Property
                                </p>
                                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                    Choose your verified Hangbug property (supports Domain properties like <code className="font-mono">sc-domain:hangbug.com</code> and URL-prefix properties).
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={loadingProperties}
                                onClick={handleFetchProperties}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4EAE6] dark:border-[#2A3832] bg-white dark:bg-[#18221E] hover:border-[#2F806B] font-semibold cursor-pointer disabled:opacity-50"
                            >
                                <RefreshCw size={12} className={loadingProperties ? 'animate-spin text-[#2F806B]' : 'text-[#2F806B]'} />
                                <span>{loadingProperties ? 'Loading...' : 'Fetch Properties'}</span>
                            </button>
                        </div>

                        {availableProperties.length === 0 ? (
                            <p className="text-[11px] text-[#B45309] dark:text-amber-300">
                                No Search Console properties were returned for this Google account. Verify that <strong>{flags.gscAccountEmail || 'your Google account'}</strong> is added to Hangbug in Google Search Console, then click <strong>Fetch Properties</strong>.
                            </p>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                <select
                                    value={selectedProperty}
                                    onChange={(e) => setSelectedProperty(e.target.value)}
                                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-white dark:bg-[#18221E] text-xs font-mono text-[#17221F] dark:text-[#F3F6F4]"
                                >
                                    <option value="">-- Select a verified Search Console property --</option>
                                    {availableProperties.map((prop) => (
                                        <option key={prop.siteUrl} value={prop.siteUrl} disabled={!prop.hasAccess}>
                                            {prop.siteUrl} ({prop.isDomainProperty ? 'Domain Property' : 'URL Prefix'} · {prop.permissionLevel}{!prop.hasAccess ? ' — No Verified Access' : ''})
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    disabled={savingProperty || !selectedProperty}
                                    onClick={handleVerifyAndSaveProperty}
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                                >
                                    <ShieldCheck size={13} />
                                    <span>{savingProperty ? 'Verifying...' : 'Verify & Save Property'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Other Integration Test Actions */}
                <div className="pt-2 border-t border-[#E4EAE6] dark:border-[#2A3832] flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                        Test other configured integrations:
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {[
                            { id: 'ga4', label: 'Test GA4' },
                            { id: 'pagespeed', label: 'Test PageSpeed' },
                            { id: 'backlinks', label: 'Test Backlinks' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                type="button"
                                disabled={Boolean(testingTarget)}
                                onClick={() => handleTest(btn.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] hover:border-[#2F806B] font-semibold cursor-pointer disabled:opacity-50"
                            >
                                <Zap size={12} className="text-[#2F806B]" />
                                <span>{testingTarget === btn.id ? 'Testing...' : btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {testResult && (
                    <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                        testResult.ok
                            ? 'bg-[#E5F2EC] border-[#BBE0CE] text-[#193D35] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-[#FEF5E7] border-[#F8DFB6] text-[#B45309] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                    }`}>
                        {testResult.ok ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" /> : <AlertCircle size={15} className="shrink-0 mt-0.5" />}
                        <div>
                            <p className="font-bold">{testResult.provider}</p>
                            <p className="mt-0.5">{testResult.message}</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Remaining Integrations & Crawler Settings Form */}
            <form onSubmit={handleSave} className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6 space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <Settings size={17} className="text-[#2F806B]" />
                    <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                        GA4, PageSpeed, Backlinks &amp; Crawler Configuration ({domain})
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <label className="block font-semibold text-[#17221F] dark:text-[#F3F6F4] mb-1">
                            Official Site URL
                        </label>
                        <input
                            type="url"
                            value={form.siteUrl}
                            onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-[#17221F] dark:text-[#F3F6F4] mb-1">
                            GA4 Measurement ID (Frontend Tag)
                        </label>
                        <input
                            type="text"
                            value={form.ga4MeasurementId}
                            onChange={(e) => setForm({ ...form, ga4MeasurementId: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-[#17221F] dark:text-[#F3F6F4] mb-1">
                            GA4 Numeric Property ID (for Data API)
                        </label>
                        <input
                            type="text"
                            value={form.ga4PropertyId}
                            onChange={(e) => setForm({ ...form, ga4PropertyId: e.target.value })}
                            placeholder="e.g. 412345678"
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">
                            PageSpeed API Key (Optional)
                        </label>
                        <input
                            type="password"
                            value={form.pagespeedApiKey}
                            onChange={(e) => setForm({ ...form, pagespeedApiKey: e.target.value })}
                            placeholder={flags.hasPagespeedApiKey ? '•••••••• (Saved)' : 'Increases PageSpeed quota'}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Backlink Provider</label>
                        <select
                            value={form.backlinkProvider}
                            onChange={(e) => setForm({ ...form, backlinkProvider: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]"
                        >
                            <option value="none">None (Use GSC Links Import)</option>
                            <option value="openpagerank">OpenPageRank API</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Backlink Provider API Key</label>
                        <input
                            type="password"
                            value={form.backlinkProviderKey}
                            onChange={(e) => setForm({ ...form, backlinkProviderKey: e.target.value })}
                            placeholder={flags.hasBacklinkProviderKey ? '•••••••• (Saved)' : 'Optional API key'}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Audit Crawl Frequency</label>
                        <select
                            value={form.crawlFrequency}
                            onChange={(e) => setForm({ ...form, crawlFrequency: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]"
                        >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="manual">Manual Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Max Pages Per Audit</label>
                        <input
                            type="number"
                            min={10}
                            max={120}
                            value={form.maxCrawlPages}
                            onChange={(e) => setForm({ ...form, maxCrawlPages: Number(e.target.value) || 60 })}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]"
                        />
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                    >
                        <Save size={14} />
                        <span>{saving ? 'Saving...' : 'Save Integration Settings'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
