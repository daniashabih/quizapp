import React, { useState, useEffect, useCallback } from 'react';
import {
    Settings,
    Shield,
    Save,
    Zap,
    CheckCircle2,
    AlertCircle,
    Globe,
    Mail,
    KeyRound,
    ShieldCheck,
    Activity,
    Clock,
    Link2,
    Trash2,
    Gauge
} from 'lucide-react';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';
import { formatSeoTimestamp } from './seoUtils';

function normalizeClientGscProperty(raw) {
    const val = String(raw || '').trim();
    if (!val) return 'sc-domain:hangbug.com';
    if (/^sc-domain:/i.test(val)) {
        let host = val.replace(/^sc-domain:\s*/i, '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        if (host === 'www.hangbug.com') host = 'hangbug.com';
        return host ? `sc-domain:${host}` : 'sc-domain:hangbug.com';
    }
    if (/^https?:\/\//i.test(val)) {
        return val;
    }
    let bare = val.toLowerCase().replace(/\/.*$/, '');
    if (bare === 'www.hangbug.com') bare = 'hangbug.com';
    return `sc-domain:${bare}`;
}

export default function SeoSettingsSection({ domain, onDataUpdated }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingTarget, setTestingTarget] = useState('');
    const [testResult, setTestResult] = useState(null);

    const [form, setForm] = useState({
        projectName: 'Hangbug',
        siteUrl: 'https://www.hangbug.com',
        gscProperty: 'sc-domain:hangbug.com',
        ga4PropertyId: '561909161',
        ga4MeasurementId: 'G-BSZBBFZZH0',
        googleServiceAccountEmail: '',
        googlePrivateKey: '',
        googleServiceAccountJson: '',
        pagespeedApiKey: '',
        backlinkProvider: 'openpagerank',
        backlinkProviderKey: '',
        openPageRankApiKey: '',
        keywordProvider: 'none',
        keywordProviderKey: '',
        crawlFrequency: 'daily',
        maxCrawlPages: 60
    });

    const [flags, setFlags] = useState({});

    const applySettings = useCallback((s) => {
        if (!s) return;
        setFlags(s);
        setForm((prev) => ({
            ...prev,
            projectName: s.projectName || 'Hangbug',
            siteUrl: s.siteUrl || `https://${domain}`,
            gscProperty: s.gscProperty || 'sc-domain:hangbug.com',
            ga4PropertyId: s.ga4PropertyId || '561909161',
            ga4MeasurementId: s.ga4MeasurementId || 'G-BSZBBFZZH0',
            googleServiceAccountEmail: s.googleServiceAccountEmail || s.googleServiceAccountEmailMasked || '',
            backlinkProvider: s.backlinkProvider || 'none',
            keywordProvider: s.keywordProvider || 'none',
            crawlFrequency: s.crawlFrequency || 'daily',
            maxCrawlPages: s.maxCrawlPages || 60
        }));
    }, [domain]);

    useEffect(() => {
        let active = true;
        setLoading(true);
        seoService.getSettings(domain)
            .then((res) => {
                if (!active || !res?.settings) return;
                applySettings(res.settings);
            })
            .catch(() => {
                toast.error('Failed to load SEO settings.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [domain, applySettings]);

    const handleJsonPasteChange = (rawText) => {
        let extractedEmail = form.googleServiceAccountEmail;
        if (rawText && rawText.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(rawText.trim());
                if (parsed.client_email) {
                    extractedEmail = String(parsed.client_email).trim();
                }
            } catch {
                // Wait until full JSON is pasted
            }
        }
        setForm((prev) => ({
            ...prev,
            googleServiceAccountJson: rawText,
            googleServiceAccountEmail: extractedEmail
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const normalizedProp = normalizeClientGscProperty(form.gscProperty);
            const payload = {
                projectName: form.projectName,
                siteUrl: form.siteUrl,
                gscProperty: normalizedProp,
                ga4PropertyId: form.ga4PropertyId,
                ga4MeasurementId: form.ga4MeasurementId,
                googleServiceAccountEmail: form.googleServiceAccountEmail,
                ...(form.googlePrivateKey ? { googlePrivateKey: form.googlePrivateKey } : {}),
                ...(form.googleServiceAccountJson ? { googleServiceAccountJson: form.googleServiceAccountJson } : {}),
                ...(form.pagespeedApiKey ? { pagespeedApiKey: form.pagespeedApiKey } : {}),
                backlinkProvider: (form.openPageRankApiKey || form.backlinkProviderKey)
                    ? 'openpagerank'
                    : form.backlinkProvider,
                ...(form.openPageRankApiKey
                    ? { openPageRankApiKey: form.openPageRankApiKey, backlinkProviderKey: form.openPageRankApiKey }
                    : form.backlinkProviderKey
                        ? { backlinkProviderKey: form.backlinkProviderKey }
                        : {}),
                keywordProvider: form.keywordProvider,
                ...(form.keywordProviderKey ? { keywordProviderKey: form.keywordProviderKey } : {}),
                crawlFrequency: form.crawlFrequency,
                maxCrawlPages: form.maxCrawlPages
            };

            const res = await seoService.updateSettings(domain, payload);
            if (res?.success) {
                toast.success(res.message || 'SEO settings saved.');
                applySettings(res.settings || {});
                setForm((prev) => ({
                    ...prev,
                    gscProperty: res.settings?.gscProperty || normalizedProp,
                    googlePrivateKey: '',
                    googleServiceAccountJson: '',
                    pagespeedApiKey: '',
                    backlinkProviderKey: '',
                    openPageRankApiKey: '',
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

    const handleRemoveOpenPageRankKey = async () => {
        setSaving(true);
        try {
            const res = await seoService.updateSettings(domain, {
                clearOpenPageRankApiKey: true,
                clearBacklinkProviderKey: true,
                backlinkProvider: 'none'
            });
            if (res?.success) {
                toast.info('OpenPageRank API key removed.');
                applySettings(res.settings || {});
                setForm((prev) => ({
                    ...prev,
                    backlinkProvider: 'none',
                    backlinkProviderKey: '',
                    openPageRankApiKey: ''
                }));
                setTestResult(null);
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to remove OpenPageRank API key.');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async (target) => {
        setTestingTarget(target);
        setTestResult(null);
        try {
            const pendingOprKey = (target === 'openpagerank' || target === 'backlinks')
                ? (form.openPageRankApiKey || form.backlinkProviderKey || '').trim()
                : '';
            const res = await seoService.testIntegration(
                domain,
                target,
                pendingOprKey ? { apiKey: pendingOprKey } : {}
            );
            const result = res?.result || { ok: false, provider: target, message: 'No response' };
            setTestResult(result);
            if (target === 'gsc') {
                setFlags((prev) => ({
                    ...prev,
                    gscAuthStatus: result.authStatus || prev.gscAuthStatus,
                    gscAuthenticated: Boolean(result.authenticated),
                    gscPropertyVerified: Boolean(result.ok),
                    gscPermissionLevel: result.permissionLevel ?? prev.gscPermissionLevel,
                    gscAvailableProperties: Array.isArray(result.availableProperties)
                        ? result.availableProperties
                        : (prev.gscAvailableProperties || []),
                    gscVerificationMessage: result.message || prev.gscVerificationMessage,
                    googleServiceAccountEmail: result.serviceAccountEmail || prev.googleServiceAccountEmail,
                    gscProperty: result.property || prev.gscProperty
                }));
                if (result.property) {
                    setForm((prev) => ({ ...prev, gscProperty: result.property }));
                }
            } else if (target === 'ga4') {
                setFlags((prev) => ({
                    ...prev,
                    ga4Connected: Boolean(result.ok),
                    ga4ConnectionStatus: result.ok ? 'Connected' : 'Connection Error',
                    ga4PropertyId: result.propertyId || prev.ga4PropertyId,
                    ga4ResourceName: result.resourceName || prev.ga4ResourceName,
                    ga4LastSyncedAt: result.syncedAt || prev.ga4LastSyncedAt,
                    ga4VerificationMessage: result.message || prev.ga4VerificationMessage
                }));
            } else if (target === 'pagespeed') {
                setFlags((prev) => ({
                    ...prev,
                    hasPagespeedApiKey: result.apiKeyConfigured ?? prev.hasPagespeedApiKey,
                    pagespeedApiKeySource: result.apiKeySource || prev.pagespeedApiKeySource,
                    pagespeedConnected: Boolean(result.ok),
                    pagespeedConnectionStatus: result.connectionStatus || (result.ok ? 'Connected' : 'Connection Error'),
                    pagespeedApiEnabled: result.apiEnabled ?? prev.pagespeedApiEnabled,
                    pagespeedLastTestedAt: result.checkedAt || prev.pagespeedLastTestedAt,
                    pagespeedMobilePerformance: result.mobilePerformance ?? prev.pagespeedMobilePerformance,
                    pagespeedDesktopPerformance: result.desktopPerformance ?? prev.pagespeedDesktopPerformance,
                    pagespeedVerificationMessage: result.message || prev.pagespeedVerificationMessage,
                    pagespeedErrorCategory: result.errorCategory || null,
                    pagespeedQuotaExhausted: Boolean(result.isDailyQuota || result.errorCategory === 'daily_quota_exceeded'),
                    pagespeedNextRetryAt: result.nextRetryAt || null
                }));
                if (onDataUpdated) await onDataUpdated();
            } else if (target === 'openpagerank' || target === 'backlinks') {
                setFlags((prev) => ({
                    ...prev,
                    openPageRankConnected: Boolean(result.ok),
                    openPageRankStatus: result.connectionStatus || (result.ok ? 'Connected' : 'Provider Unavailable'),
                    openPageRankMessage: result.message || prev.openPageRankMessage,
                    openPageRankLastSyncedAt: result.syncedAt || prev.openPageRankLastSyncedAt,
                    openPageRankAsOf: result.asOf || prev.openPageRankAsOf,
                    openPageRankQuota: result.quota || prev.openPageRankQuota
                }));
            } else if (target === 'ai_visibility') {
                setFlags((prev) => ({
                    ...prev,
                    aiVisibilityConfigured: Boolean(result.configured),
                    aiVisibilityProvider: result.configured ? 'dataforseo' : prev.aiVisibilityProvider,
                    aiVisibilityConnectionStatus: result.ok ? 'Connected' : 'Not connected'
                }));
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

    const availableProperties = Array.isArray(flags.gscAvailableProperties) ? flags.gscAvailableProperties : [];
    const authStatus = flags.gscAuthStatus || (flags.hasGoogleServiceAccount ? 'Authenticated' : 'Not Configured');
    const serviceAccountEmailDisplay = flags.googleServiceAccountEmail || form.googleServiceAccountEmail || flags.googleServiceAccountEmailMasked || 'Not configured';
    const selectedPropertyDisplay = form.gscProperty || flags.gscProperty || 'sc-domain:hangbug.com';
    const permissionLevelDisplay = flags.gscPermissionLevel || (flags.gscPropertyVerified ? 'Verified' : 'Not verified');

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Security Note */}
            <div className="bg-[#E5F2EC]/70 dark:bg-[#1F352E]/60 border border-[#BBE0CE] dark:border-[#2A3832] rounded-2xl p-4 flex items-start gap-2.5 text-xs text-[#193D35] dark:text-[#F3F6F4]">
                <Shield size={16} className="shrink-0 mt-0.5 text-[#2F806B]" />
                <p className="leading-relaxed">
                    Google Service Account keys and third-party API tokens are stored securely in MongoDB (or server environment variables) and are never returned in plaintext to the browser. For Domain properties in Google Search Console, Hangbug uses the exact identifier <code className="font-mono font-semibold">sc-domain:hangbug.com</code>.
                </p>
            </div>

            {/* Google Search Console Status, Property Verification & Test Connection */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <div>
                        <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            Google Search Console Status &amp; Live Connection Test
                        </h2>
                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C]">
                            Verifies Service Account authentication, lists accessible properties via Google Sites API (<code className="font-mono">sites.list</code>), and confirms <code className="font-mono">permissionLevel</code> before running Search Analytics queries.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {[
                            { id: 'gsc', label: 'Test GSC' },
                            { id: 'ga4', label: 'Test GA4 Connection' },
                            { id: 'pagespeed', label: 'Test PageSpeed Connection' },
                            { id: 'openpagerank', label: 'Test OpenPageRank' }
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

                {/* 4 Status Cards: Authentication Status, Service Account Email, Selected Property, Google Permission Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                            <KeyRound size={12} className="text-[#2F806B]" />
                            <span>Authentication Status</span>
                        </div>
                        <p className={`mt-1.5 font-bold ${
                            flags.gscAuthenticated
                                ? 'text-[#193D35] dark:text-emerald-300'
                                : authStatus === 'Authentication Failed'
                                    ? 'text-[#B91C1C] dark:text-red-300'
                                    : 'text-[#17221F] dark:text-[#F3F6F4]'
                        }`}>
                            {authStatus}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                            <Mail size={12} className="text-[#2F806B]" />
                            <span>Service Account Email</span>
                        </div>
                        <p className="mt-1.5 font-mono text-[11px] font-semibold text-[#17221F] dark:text-[#F3F6F4] break-all">
                            {serviceAccountEmailDisplay}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                            <Globe size={12} className="text-[#2F806B]" />
                            <span>Selected Property</span>
                        </div>
                        <p className="mt-1.5 font-mono text-[11px] font-bold text-[#17221F] dark:text-[#F3F6F4] break-all">
                            {selectedPropertyDisplay}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                            <ShieldCheck size={12} className="text-[#2F806B]" />
                            <span>Google Permission Level</span>
                        </div>
                        <p className={`mt-1.5 font-bold ${
                            flags.gscPropertyVerified
                                ? 'text-[#2F806B] dark:text-emerald-300'
                                : 'text-[#B45309] dark:text-amber-300'
                        }`}>
                            {permissionLevelDisplay}
                        </p>
                    </div>
                </div>

                {/* Available Search Console Properties from sites.list */}
                <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            Available Search Console Properties (<code className="font-mono">sites.list</code>)
                        </span>
                        <span className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                            {availableProperties.length} accessible propert{availableProperties.length === 1 ? 'y' : 'ies'}
                        </span>
                    </div>

                    {availableProperties.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {availableProperties.map((prop) => {
                                const isSelected = prop.siteUrl === form.gscProperty;
                                return (
                                    <button
                                        key={prop.siteUrl}
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, gscProperty: prop.siteUrl }))}
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left transition-colors cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#E5F2EC] border-[#2F806B] text-[#193D35] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                                                : 'bg-white dark:bg-[#18221E] border-[#E4EAE6] dark:border-[#2A3832] text-[#17221F] dark:text-[#F3F6F4] hover:border-[#2F806B]'
                                        }`}
                                    >
                                        <span className="font-mono font-semibold">{prop.siteUrl}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-[#F7F8F6] dark:bg-[#141D19] text-[10px] font-semibold text-[#2F806B]">
                                            {prop.permissionLevel}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] leading-relaxed">
                            {flags.gscVerificationMessage
                                || `No properties returned by sites.list yet. Add your service account client_email (${serviceAccountEmailDisplay}) in Google Search Console -> Settings -> Users and permissions for Domain property hangbug.com (sc-domain:hangbug.com), then click Test GSC.`}
                        </p>
                    )}
                </div>

                {/* Test Connection Result */}
                {testResult && (
                    <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                        testResult.ok
                            ? 'bg-[#E5F2EC] border-[#BBE0CE] text-[#193D35] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-[#FEF5E7] border-[#F8DFB6] text-[#B45309] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                    }`}>
                        {testResult.ok ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                        <div className="space-y-1">
                            <p className="font-bold">
                                Test Connection Result — {testResult.provider}: {testResult.ok ? 'Verified & Connected' : 'Verification Failed'}
                            </p>
                            {testResult.property && (
                                <p className="text-[11px]">
                                    Property Sent to Google API: <code className="font-mono font-bold">{testResult.property}</code>
                                    {testResult.permissionLevel ? (
                                        <> · Permission Level: <code className="font-mono font-bold">{testResult.permissionLevel}</code></>
                                    ) : null}
                                </p>
                            )}
                            {testResult.resourceName && (
                                <p className="text-[11px]">
                                    GA4 Resource: <code className="font-mono font-bold">{testResult.resourceName}</code>
                                    {testResult.measurementId ? (
                                        <> · Frontend Tag: <code className="font-mono font-bold">{testResult.measurementId}</code></>
                                    ) : null}
                                </p>
                            )}
                            {testResult.provider === 'Google PageSpeed Insights' && (
                                <p className="text-[11px]">
                                    Target URL: <code className="font-mono font-bold">{testResult.targetUrl || 'https://www.hangbug.com/'}</code>
                                    {' · '}Mobile: <strong>{typeof testResult.mobilePerformance === 'number' ? `${testResult.mobilePerformance}/100` : 'Unavailable'}</strong>
                                    {' · '}Desktop: <strong>{typeof testResult.desktopPerformance === 'number' ? `${testResult.desktopPerformance}/100` : 'Unavailable'}</strong>
                                    {testResult.errorCategory ? (
                                        <> · Error: <code className="font-mono font-bold">{testResult.errorCategory}</code></>
                                    ) : null}
                                </p>
                            )}
                            <p className="leading-relaxed">{testResult.message}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Google Analytics 4 Server-Side Integration Status Card */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <div className="flex items-center gap-2.5">
                        <Activity size={17} className="text-[#2F806B]" />
                        <div>
                            <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Google Analytics 4 Server-Side Integration
                            </h2>
                            <p className="text-xs text-[#75817C] dark:text-[#8FA69C]">
                                Reuses the stored Google Service Account JSON with read-only scope <code className="font-mono">analytics.readonly</code> against <code className="font-mono">properties/{form.ga4PropertyId || flags.ga4PropertyId || '561909161'}</code>.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={Boolean(testingTarget)}
                        onClick={() => handleTest('ga4')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <Zap size={13} />
                        <span>{testingTarget === 'ga4' ? 'Testing GA4...' : 'Test GA4 Connection'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Measurement ID</p>
                        <p className="mt-1.5 font-mono font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            {form.ga4MeasurementId || flags.ga4MeasurementId || 'G-BSZBBFZZH0'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C]">Frontend tracking only</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Numeric Property ID</p>
                        <p className="mt-1.5 font-mono font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            {form.ga4PropertyId || flags.ga4PropertyId || '561909161'}
                        </p>
                        <p className="mt-0.5 text-[10px] font-mono text-[#2F806B]">
                            properties/{form.ga4PropertyId || flags.ga4PropertyId || '561909161'}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Service Account Email</p>
                        <p className="mt-1.5 font-mono text-[11px] font-semibold text-[#17221F] dark:text-[#F3F6F4] break-all">
                            {serviceAccountEmailDisplay}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Connection Status</p>
                        <p className={`mt-1.5 font-bold ${
                            flags.ga4Connected
                                ? 'text-[#2F806B] dark:text-emerald-300'
                                : 'text-[#B45309] dark:text-amber-300'
                        }`}>
                            {flags.ga4Connected ? 'Connected' : (flags.ga4ConnectionStatus || 'Not Connected')}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                            <Clock size={11} className="text-[#2F806B]" />
                            <span>Last Successful Sync</span>
                        </div>
                        <p className="mt-1.5 font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                            {flags.ga4LastSyncedAt ? formatSeoTimestamp(flags.ga4LastSyncedAt) : 'Not synced yet'}
                        </p>
                    </div>
                </div>
            </div>

            {/* OpenPageRank Domain Authority & Referring Domains Integration Status Card */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <div className="flex items-center gap-2.5">
                        <Link2 size={17} className="text-[#2F806B]" />
                        <div>
                            <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                OpenPageRank Domain Authority &amp; Referring Domains Integration
                            </h2>
                            <p className="text-xs text-[#75817C] dark:text-[#8FA69C]">
                                Connects to <code className="font-mono">POST https://openpagerank.keywordseverywhere.com/v1/domains/bulk</code> using <code className="font-mono">Authorization: Bearer YOUR_API_KEY</code> (<code className="font-mono">OPENPAGERANK_API_KEY</code>).
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={Boolean(testingTarget)}
                            onClick={() => handleTest('openpagerank')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <Zap size={13} />
                            <span>{testingTarget === 'openpagerank' ? 'Testing OpenPageRank...' : 'Test Connection'}</span>
                        </button>
                        {(flags.hasOpenPageRankApiKey || flags.hasBacklinkProviderKey) && (
                            <button
                                type="button"
                                disabled={saving}
                                onClick={handleRemoveOpenPageRankKey}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#F8C9C6] dark:border-red-800/60 bg-[#FCEEED] dark:bg-red-950/40 text-[#B91C1C] dark:text-red-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <Trash2 size={13} />
                                <span>Remove API Key</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Connection Status</p>
                        <p className={`mt-1.5 font-bold ${
                            flags.openPageRankStatus === 'Connected'
                                ? 'text-[#2F806B] dark:text-emerald-300'
                                : flags.openPageRankStatus === 'Invalid API Key' || flags.openPageRankStatus === 'Quota Exceeded'
                                    ? 'text-[#B91C1C] dark:text-red-300'
                                    : flags.openPageRankStatus === 'Provider Unavailable'
                                        ? 'text-[#B45309] dark:text-amber-300'
                                        : 'text-[#75817C] dark:text-[#8FA69C]'
                        }`}>
                            {flags.openPageRankStatus || 'Not Configured'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C]">Verified only on real API call</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">API Key Storage</p>
                        <p className="mt-1.5 font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                            {flags.hasOpenPageRankApiKey || flags.hasBacklinkProviderKey
                                ? 'Stored securely on backend'
                                : 'Not Configured'}
                        </p>
                        <p className="mt-0.5 text-[10px] font-mono text-[#2F806B]">
                            OPENPAGERANK_API_KEY
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Remaining Domain Quota</p>
                        <p className="mt-1.5 font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            {flags.openPageRankQuota?.domainsRemaining !== null && flags.openPageRankQuota?.domainsRemaining !== undefined
                                ? `${Number(flags.openPageRankQuota.domainsRemaining).toLocaleString('en-US')} / ${Number(flags.openPageRankQuota.monthlyDomainLimit || 30000).toLocaleString('en-US')}`
                                : 'Available when connected'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C]">
                            {flags.openPageRankQuota?.requestsPerMinute
                                ? `${flags.openPageRankQuota.requestsPerMinute} req/min limit`
                                : 'Monthly domain lookups'}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Data Release (as_of)</p>
                        <p className="mt-1.5 font-mono font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            {flags.openPageRankAsOf || 'Pending'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C]">Common Crawl release date</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                            <Clock size={11} className="text-[#2F806B]" />
                            <span>Last Data Update</span>
                        </div>
                        <p className="mt-1.5 font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                            {flags.openPageRankLastSyncedAt ? formatSeoTimestamp(flags.openPageRankLastSyncedAt) : 'Not synced yet'}
                        </p>
                    </div>
                </div>

                {flags.openPageRankMessage && (
                    <div className={`p-3 rounded-xl border text-xs ${
                        flags.openPageRankStatus === 'Connected'
                            ? 'bg-[#E5F2EC]/80 border-[#BBE0CE] text-[#193D35] dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300'
                            : 'bg-[#F7F8F6] border-[#E4EAE6] text-[#75817C] dark:bg-[#141D19] dark:border-[#2A3832] dark:text-[#8FA69C]'
                    }`}>
                        {flags.openPageRankMessage}
                    </div>
                )}
            </div>

            {/* Google PageSpeed Insights API v5 Integration Status Card */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <div className="flex items-center gap-2.5">
                        <Gauge size={17} className="text-[#2F806B]" />
                        <div>
                            <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Google PageSpeed Insights API v5 Integration
                            </h2>
                            <p className="text-xs text-[#75817C] dark:text-[#8FA69C]">
                                Reads <code className="font-mono">PAGESPEED_API_KEY</code> securely on the backend and verifies both Mobile &amp; Desktop strategies for <code className="font-mono">https://www.hangbug.com/</code>.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={Boolean(testingTarget)}
                        onClick={() => handleTest('pagespeed')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <Zap size={13} />
                        <span>{testingTarget === 'pagespeed' ? 'Testing Mobile & Desktop...' : 'Test PageSpeed Connection'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Connection Status</p>
                        <p className={`mt-1.5 font-bold ${
                            flags.pagespeedConnectionStatus === 'Connected'
                                ? 'text-[#2F806B] dark:text-emerald-300'
                                : ['Invalid API Key', 'API Not Enabled', 'Quota Exceeded', 'Connection Error'].includes(flags.pagespeedConnectionStatus)
                                    ? 'text-[#B91C1C] dark:text-red-300'
                                    : flags.pagespeedConnectionStatus === 'Configured (Not Tested)'
                                        ? 'text-[#B45309] dark:text-amber-300'
                                        : 'text-[#75817C] dark:text-[#8FA69C]'
                        }`}>
                            {flags.pagespeedConnectionStatus || (flags.hasPagespeedApiKey ? 'Configured (Not Tested)' : 'Not Configured')}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C]">Verified only on real API v5 call</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">API Key Source</p>
                        <p className="mt-1.5 font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                            {flags.hasPagespeedApiKey
                                ? (flags.pagespeedApiKeySource === 'env:PAGESPEED_API_KEY'
                                    ? 'Backend Env Variable'
                                    : 'Stored securely on backend')
                                : 'Not Configured'}
                        </p>
                        <p className="mt-0.5 text-[10px] font-mono text-[#2F806B]">
                            PAGESPEED_API_KEY
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">API Enabled</p>
                        <p className={`mt-1.5 font-bold ${
                            flags.pagespeedApiEnabled === true
                                ? 'text-[#2F806B] dark:text-emerald-300'
                                : flags.pagespeedApiEnabled === false
                                    ? 'text-[#B91C1C] dark:text-red-300'
                                    : 'text-[#75817C] dark:text-[#8FA69C]'
                        }`}>
                            {flags.pagespeedApiEnabled === true
                                ? 'Enabled'
                                : flags.pagespeedApiEnabled === false
                                    ? 'Not Enabled'
                                    : 'Pending Test'}
                        </p>
                        <p className="mt-0.5 text-[10px] font-mono text-[#75817C]">pagespeedonline v5</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <p className="text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">Mobile / Desktop Score</p>
                        <p className="mt-1.5 font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            {typeof flags.pagespeedMobilePerformance === 'number' || typeof flags.pagespeedDesktopPerformance === 'number'
                                ? `M: ${typeof flags.pagespeedMobilePerformance === 'number' ? flags.pagespeedMobilePerformance : '—'} · D: ${typeof flags.pagespeedDesktopPerformance === 'number' ? flags.pagespeedDesktopPerformance : '—'}`
                                : 'Pending Test'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#75817C]">https://www.hangbug.com/</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832]">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#75817C] dark:text-[#8FA69C]">
                            <Clock size={11} className="text-[#2F806B]" />
                            <span>Last Connection Test</span>
                        </div>
                        <p className="mt-1.5 font-semibold text-[#17221F] dark:text-[#F3F6F4]">
                            {flags.pagespeedLastTestedAt ? formatSeoTimestamp(flags.pagespeedLastTestedAt) : 'Not tested yet'}
                        </p>
                    </div>
                </div>

                {flags.pagespeedVerificationMessage && (
                    <div className={`p-3 rounded-xl border text-xs ${
                        flags.pagespeedConnected
                            ? 'bg-[#E5F2EC]/80 border-[#BBE0CE] text-[#193D35] dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300'
                            : ['Invalid API Key', 'API Not Enabled', 'Quota Exceeded', 'Connection Error', 'Not Configured'].includes(flags.pagespeedConnectionStatus)
                                ? 'bg-[#FEF5E7] border-[#F8DFB6] text-[#92400E] dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300'
                                : 'bg-[#F7F8F6] border-[#E4EAE6] text-[#75817C] dark:bg-[#141D19] dark:border-[#2A3832] dark:text-[#8FA69C]'
                    }`}>
                        {flags.pagespeedVerificationMessage}
                    </div>
                )}
            </div>

            {/* Settings Form */}
            <form onSubmit={handleSave} className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6 space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E4EAE6] dark:border-[#2A3832]">
                    <Settings size={17} className="text-[#2F806B]" />
                    <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                        Property &amp; API Configuration ({domain})
                    </h2>
                </div>

                {/* Google Search Console & GA4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
                            Google Search Console Property
                        </label>
                        {availableProperties.length > 0 ? (
                            <div className="space-y-1.5">
                                <select
                                    value={availableProperties.some((p) => p.siteUrl === form.gscProperty) ? form.gscProperty : ''}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            setForm({ ...form, gscProperty: e.target.value });
                                        }
                                    }}
                                    className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] font-mono text-xs"
                                >
                                    <option value="">-- Choose from available sites.list properties --</option>
                                    {availableProperties.map((p) => (
                                        <option key={p.siteUrl} value={p.siteUrl}>
                                            {p.siteUrl} ({p.isDomainProperty ? 'Domain Property' : 'URL Prefix'} · {p.permissionLevel})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={form.gscProperty}
                                    onChange={(e) => setForm({ ...form, gscProperty: e.target.value })}
                                    placeholder="sc-domain:hangbug.com"
                                    className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] font-mono"
                                />
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={form.gscProperty}
                                onChange={(e) => setForm({ ...form, gscProperty: e.target.value })}
                                placeholder="sc-domain:hangbug.com"
                                className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] font-mono"
                            />
                        )}
                        <p className="mt-1 text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                            Domain property uses <code className="font-mono">sc-domain:hangbug.com</code> (bare <code className="font-mono">hangbug.com</code> is automatically formatted as <code className="font-mono">sc-domain:hangbug.com</code>).
                        </p>
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
                </div>

                {/* Google Service Account */}
                <div className="p-4 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                        <p className="font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            Google Service Account (for GSC + GA4 Data API)
                        </p>
                        <span className="text-[11px] font-semibold text-[#2F806B]">
                            {flags.gscPropertyVerified
                                ? `Verified (${flags.gscPermissionLevel})`
                                : flags.hasGoogleServiceAccount
                                    ? 'Credentials Saved'
                                    : 'Not configured'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold mb-1">Service Account Email</label>
                            <input
                                type="text"
                                value={form.googleServiceAccountEmail}
                                onChange={(e) => setForm({ ...form, googleServiceAccountEmail: e.target.value })}
                                placeholder="seo-bot@project-id.iam.gserviceaccount.com"
                                className="w-full px-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-white dark:bg-[#18221E] font-mono text-[11px]"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">
                                New Private Key (leave blank to keep existing)
                            </label>
                            <input
                                type="password"
                                value={form.googlePrivateKey}
                                onChange={(e) => setForm({ ...form, googlePrivateKey: e.target.value })}
                                placeholder={flags.hasGoogleServiceAccount ? '•••••••• (Saved securely)' : '-----BEGIN PRIVATE KEY-----...'}
                                className="w-full px-3 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-white dark:bg-[#18221E]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">
                            Or Paste Full Google Service Account JSON
                        </label>
                        <textarea
                            rows={3}
                            value={form.googleServiceAccountJson}
                            onChange={(e) => handleJsonPasteChange(e.target.value)}
                            placeholder='{"type":"service_account","client_email":"...","private_key":"..."}'
                            className="w-full p-2.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-white dark:bg-[#18221E] font-mono text-[11px]"
                        />
                    </div>
                </div>

                {/* PageSpeed + Backlink + Crawler */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <label className="block font-semibold mb-1">
                            PageSpeed API Key (<code className="font-mono">PAGESPEED_API_KEY</code>)
                        </label>
                        <input
                            type="password"
                            value={form.pagespeedApiKey}
                            onChange={(e) => setForm({ ...form, pagespeedApiKey: e.target.value })}
                            placeholder={
                                flags.pagespeedApiKeySource === 'env:PAGESPEED_API_KEY'
                                    ? '•••••••• (Loaded from PAGESPEED_API_KEY env)'
                                    : flags.hasPagespeedApiKey
                                        ? '•••••••• (Saved on backend)'
                                        : 'Server-side Google Cloud API key'
                            }
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]"
                        />
                        <p className="mt-1 text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                            Used exclusively on the backend; never returned to the browser.
                        </p>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Backlink Provider</label>
                        <select
                            value={form.backlinkProvider}
                            onChange={(e) => setForm({ ...form, backlinkProvider: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]"
                        >
                            <option value="openpagerank">OpenPageRank API</option>
                            <option value="none">None (GSC Links CSV Import Only)</option>
                        </select>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block font-semibold">
                                OpenPageRank API Key (<code className="font-mono">OPENPAGERANK_API_KEY</code>)
                            </label>
                            {(flags.hasOpenPageRankApiKey || flags.hasBacklinkProviderKey) && (
                                <button
                                    type="button"
                                    onClick={handleRemoveOpenPageRankKey}
                                    className="text-[11px] font-semibold text-[#B91C1C] hover:underline cursor-pointer"
                                >
                                    Remove Key
                                </button>
                            )}
                        </div>
                        <input
                            type="password"
                            value={form.openPageRankApiKey || form.backlinkProviderKey}
                            onChange={(e) => setForm({
                                ...form,
                                openPageRankApiKey: e.target.value,
                                backlinkProviderKey: e.target.value,
                                backlinkProvider: 'openpagerank'
                            })}
                            placeholder={
                                flags.openPageRankKeySource === 'env:OPENPAGERANK_API_KEY'
                                    ? '•••••••• (Loaded from OPENPAGERANK_API_KEY env)'
                                    : (flags.hasOpenPageRankApiKey || flags.hasBacklinkProviderKey)
                                        ? '•••••••• (Stored securely on backend)'
                                        : 'Enter OpenPageRank API key (opr_live_...)'
                            }
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]"
                        />
                        <p className="mt-1 text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                            Stored securely on the backend; never exposed to frontend JavaScript, API responses, or logs.
                        </p>
                    </div>

                    <div className="md:col-span-3 p-4 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <p className="font-bold text-[#17221F] dark:text-[#F3F6F4]">AI Search Visibility · DataForSEO</p>
                                <p className="mt-1 text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                    {flags.aiVisibilityConfigured
                                        ? `Credentials are configured${flags.aiVisibilityConnectionStatus === 'Connected' ? ' and verified' : ' (test the connection)'}.`
                                        : 'Not configured. Add the DataForSEO credentials to the server environment.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={testingTarget === 'ai_visibility'}
                                onClick={() => handleTest('ai_visibility')}
                                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                            >
                                <Zap size={13} />
                                {testingTarget === 'ai_visibility' ? 'Testing...' : 'Test DataForSEO'}
                            </button>
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed text-[#75817C] dark:text-[#8FA69C]">
                            Set <code className="font-mono">DATAFORSEO_LOGIN</code> and <code className="font-mono">DATAFORSEO_PASSWORD</code> in Vercel Project Settings → Environment Variables. Credentials stay server-side. Connection testing is free; live visibility checks incur DataForSEO API charges.
                        </p>
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
