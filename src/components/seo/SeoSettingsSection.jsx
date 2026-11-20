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
    ShieldCheck
} from 'lucide-react';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';

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
        ga4PropertyId: '',
        ga4MeasurementId: 'G-BSZBBFZZH0',
        googleServiceAccountEmail: '',
        googlePrivateKey: '',
        googleServiceAccountJson: '',
        pagespeedApiKey: '',
        backlinkProvider: 'none',
        backlinkProviderKey: '',
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
            ga4PropertyId: s.ga4PropertyId || '',
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
                applySettings(res.settings || {});
                setForm((prev) => ({
                    ...prev,
                    gscProperty: res.settings?.gscProperty || normalizedProp,
                    googlePrivateKey: '',
                    googleServiceAccountJson: '',
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
                            <p className="leading-relaxed">{testResult.message}</p>
                        </div>
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
