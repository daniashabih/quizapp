import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Info, RefreshCw } from 'lucide-react';
import {
    ChatGptIcon,
    GoogleAiOverviewIcon,
    GoogleGeminiIcon,
    GoogleAiModeIcon
} from './BrandIcons';
import { getStatusBadgeClasses } from './seoUtils';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';

export default function SeoAiVisibilitySection({ data, domain, onNavigate, onDataUpdated }) {
    const ai = data?.aiVisibility || {};
    const platforms = ai.platforms || [];
    const readiness = ai.readinessChecks || [];
    const [refreshing, setRefreshing] = useState(false);

    const runLiveCheck = async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
            const result = await seoService.refreshAiVisibility(domain || data?.domain);
            if (!result?.success) {
                throw new Error(result?.message || 'Live AI visibility check failed.');
            }
            toast.success(result.message || 'Live AI visibility check completed.');
            if (onDataUpdated) await onDataUpdated();
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || 'Live AI visibility check failed.');
        } finally {
            setRefreshing(false);
        }
    };

    const getIcon = (id) => {
        if (id === 'chatgpt') return <ChatGptIcon className="w-6 h-6 shrink-0" />;
        if (id === 'ai-overviews') return <GoogleAiOverviewIcon className="w-6 h-6 shrink-0" />;
        if (id === 'gemini') return <GoogleGeminiIcon className="w-6 h-6 shrink-0" />;
        return <GoogleAiModeIcon className="w-6 h-6 shrink-0" />;
    };

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Explanation Banner */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E5F2EC] dark:bg-[#1F352E] text-[#193D35] dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <Sparkles size={19} />
                    </div>
                    <div>
                        <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            AI Search &amp; Answer Engine Visibility
                        </h2>
                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-1 leading-relaxed max-w-3xl">
                            {ai.explanation}
                        </p>
                    </div>
                </div>

                {ai.providerConfigured ? (
                    <button
                        type="button"
                        disabled={refreshing}
                        onClick={runLiveCheck}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 disabled:opacity-60"
                    >
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Checking live results...' : 'Run Live Check (billable)'}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => onNavigate('settings')}
                        className="px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                        Configure DataForSEO
                    </button>
                )}
            </div>

            {ai.checkedAt && (
                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                    Last live sample: {new Date(ai.checkedAt).toLocaleString()}
                    {ai.fromCache ? ' · Loaded from the saved snapshot' : ''}
                </p>
            )}

            {/* Platform Cards (ChatGPT, Google AI Overviews, Gemini, Perplexity) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((plat) => (
                    <div
                        key={plat.id}
                        className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 flex flex-col justify-between"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                {getIcon(plat.id)}
                                <div>
                                    <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                        {plat.name}
                                    </h3>
                                    <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                        {plat.status || 'Not connected'}
                                    </p>
                                </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClasses(plat.mentions != null ? 'Verified' : 'Not checked')}`}>
                                {plat.status || (plat.mentions != null ? 'Sample checked' : 'Unavailable')}
                            </span>
                        </div>

                        {plat.mentions != null ? (
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#E4EAE6] dark:border-[#2A3832]">
                                <div>
                                    <p className="text-[11px] text-[#75817C]">Mentions in sample</p>
                                    <p className="text-xl font-display font-bold text-[#193D35] dark:text-emerald-300 mt-0.5">
                                        {plat.mentions}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#75817C]">Hangbug pages cited</p>
                                    <p className="text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-0.5">
                                        {plat.citedPages ?? 0}
                                    </p>
                                </div>
                                {plat.samplesChecked > 0 && (
                                    <p className="col-span-2 text-[10px] text-[#75817C]">
                                        {plat.samplesChecked} monitored prompt checked
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="mt-4 p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] flex items-start gap-2 text-xs text-[#75817C] dark:text-[#8FA69C]">
                                <Info size={14} className="shrink-0 mt-0.5 text-[#2F806B]" />
                                <span>{plat.reason || 'Citation metrics require a connected AI visibility provider.'}</span>
                            </div>
                        )}

                        {(plat.evidence || []).map((sample, index) => (
                            <details key={`${plat.id}-${index}`} className="mt-3 text-xs">
                                <summary className="cursor-pointer font-semibold text-[#193D35] dark:text-emerald-300">
                                    View measured response and citations
                                </summary>
                                <p className="mt-2 text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                    Prompt: {sample.prompt}
                                </p>
                                {sample.responseExcerpt && (
                                    <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-[#17221F] dark:text-[#F3F6F4]">
                                        {sample.responseExcerpt}
                                    </p>
                                )}
                                {(sample.citations || []).map((citation) => (
                                    <a
                                        key={citation.url}
                                        href={citation.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 block break-all text-[11px] text-[#2F806B] hover:underline"
                                    >
                                        {citation.title || citation.url}
                                    </a>
                                ))}
                            </details>
                        ))}
                    </div>
                ))}
            </div>

            {ai.provider === 'DataForSEO' && (
                <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                    Each live check samples one prompt per available platform. DataForSEO bills live AI and Google SERP requests; these sample counts are not total search-volume estimates.
                </p>
            )}

            {/* Verified Hangbug AI Crawler & Readiness Signals */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div>
                        <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            Hangbug AI Crawler &amp; Entity Readiness (Measured Locally)
                        </h3>
                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-0.5">
                            Direct checks verifying whether ChatGPT, Google AI Overviews, and Gemini crawlers can read Hangbug’s structured docs and entities.
                        </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E5F2EC] text-[#193D35] dark:bg-[#1F352E] dark:text-emerald-300">
                        Verified On-Site
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {readiness.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                                {item.status === 'Good' ? (
                                    <CheckCircle2 size={16} className="text-[#2F806B] shrink-0 mt-0.5" />
                                ) : (
                                    <AlertTriangle size={16} className="text-[#D19A45] shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className="text-xs font-bold text-[#17221F] dark:text-[#F3F6F4]">{item.label}</p>
                                    <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C] mt-0.5">{item.detail}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${getStatusBadgeClasses(item.status)}`}>
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
