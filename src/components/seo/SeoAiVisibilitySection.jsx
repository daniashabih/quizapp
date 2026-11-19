import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import {
    ChatGptIcon,
    GoogleAiOverviewIcon,
    GoogleGeminiIcon,
    GoogleAiModeIcon
} from './BrandIcons';
import { getStatusBadgeClasses } from './seoUtils';

export default function SeoAiVisibilitySection({ data, onNavigate }) {
    const ai = data?.aiVisibility || {};
    const platforms = ai.platforms || [];
    const readiness = ai.readinessChecks || [];

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

                <button
                    type="button"
                    onClick={() => onNavigate('settings')}
                    className="px-3.5 py-2 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                    Configure Provider
                </button>
            </div>

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

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClasses(plat.mentions !== null ? 'Verified' : 'Not checked')}`}>
                                {plat.mentions !== null ? 'Verified Provider' : 'Unavailable'}
                            </span>
                        </div>

                        {plat.mentions !== null && plat.mentions !== undefined ? (
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#E4EAE6] dark:border-[#2A3832]">
                                <div>
                                    <p className="text-[11px] text-[#75817C]">Verified Mentions</p>
                                    <p className="text-xl font-display font-bold text-[#193D35] dark:text-emerald-300 mt-0.5">
                                        {plat.mentions}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#75817C]">Cited Pages</p>
                                    <p className="text-xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-0.5">
                                        {plat.citedPages}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] flex items-start gap-2 text-xs text-[#75817C] dark:text-[#8FA69C]">
                                <Info size={14} className="shrink-0 mt-0.5 text-[#2F806B]" />
                                <span>{plat.reason || 'Citation metrics require a connected AI visibility provider.'}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

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
