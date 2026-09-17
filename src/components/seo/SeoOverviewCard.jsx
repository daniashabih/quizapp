import React, { useState, useRef, useEffect } from 'react';
import { 
    X, 
    ChevronDown, 
    Monitor, 
    Smartphone, 
    Info, 
    Check,
    HelpCircle
} from 'lucide-react';
import { FlagPkIcon, FlagUsIcon } from './BrandIcons';

export default function SeoOverviewCard({
    data = {
        authorityScore: 0,
        semrushRank: 0,
        organicTraffic: 0,
        organicTrafficChange: "0%",
        organicKeywords: 0,
        organicKeywordsChange: "0%",
        paidKeywords: 0,
        paidTraffic: 0,
        refDomains: "n/a",
        backlinks: "n/a"
    },
    onClose
}) {
    const [country, setCountry] = useState('PK');
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [device, setDevice] = useState('Desktop');
    const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState(null);

    const countryDropdownRef = useRef(null);
    const deviceDropdownRef = useRef(null);

    const countries = [
        { code: 'PK', name: 'Pakistan', flag: FlagPkIcon, emoji: '🇵🇰' },
        { code: 'US', name: 'United States', flag: FlagUsIcon, emoji: '🇺🇸' },
        { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧' },
        { code: 'CA', name: 'Canada', emoji: '🇨🇦' },
        { code: 'DE', name: 'Germany', emoji: '🇩🇪' }
    ];

    const currentCountry = countries.find(c => c.code === country) || countries[0];

    useEffect(() => {
        function handleClickOutside(event) {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
                setCountryDropdownOpen(false);
            }
            if (deviceDropdownRef.current && !deviceDropdownRef.current.contains(event.target)) {
                setDeviceDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tooltip explanations for metrics
    const metricTooltips = {
        authority: "Authority Score measures domain reputation based on organic search data, backlinks, and traffic data.",
        traffic: "Estimated monthly visits to the domain from Google organic search.",
        keywords: "Number of keywords that bring users to the domain via Google's organic search results.",
        paid: "Number of keywords that bring users to the domain via Google's paid search (Google Ads).",
        refDomains: "Total number of referring domains that point at least one backlink to this domain."
    };

    return (
        <div className="bg-white rounded-2xl border border-[#E5E5E7] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3">
                    {/* Light Purple / Lavender Rounded Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] text-[#6D28D9] text-xs font-semibold tracking-wide">
                        <span>SEO</span>
                    </div>

                    {/* Right Close X icon */}
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-[#9CA3AF] hover:text-[#222222] hover:bg-[#F3F4F6] transition-colors"
                        title="Close card"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Subheader Filters: Scope, Country, Device, Date */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-3 text-xs text-[#707070]">
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                        {/* Scope */}
                        <div className="flex items-center gap-1 font-medium text-[#222222]">
                            <span className="text-[#8E8E93]">Scope:</span>
                            <span className="bg-[#F4F4F5] px-2 py-0.5 rounded text-[11px] font-semibold text-[#3F3F46]">
                                Root Domain
                            </span>
                        </div>

                        {/* Country Selector: Pakistan 🇵🇰 */}
                        <div className="relative" ref={countryDropdownRef}>
                            <button
                                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-[#222222] bg-[#F7F7F8] hover:bg-[#EAEAEA] border border-[#E5E5E7] rounded-lg transition-colors cursor-pointer"
                            >
                                <span className="text-sm leading-none">{currentCountry.emoji}</span>
                                <span>{currentCountry.name}</span>
                                <ChevronDown size={12} className="text-[#707070]" />
                            </button>

                            {countryDropdownOpen && (
                                <div className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-[#E5E5E7] py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    {countries.map((c) => (
                                        <button
                                            key={c.code}
                                            onClick={() => {
                                                setCountry(c.code);
                                                setCountryDropdownOpen(false);
                                            }}
                                            className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-[#F4F4F5] transition-colors ${
                                                c.code === country ? 'text-[#4F5BD5] font-semibold bg-[#EEF2FF]' : 'text-[#222222]'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span>{c.emoji}</span>
                                                <span>{c.name}</span>
                                            </span>
                                            {c.code === country && <Check size={13} className="text-[#4F5BD5]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Device Selector: Desktop */}
                        <div className="relative" ref={deviceDropdownRef}>
                            <button
                                onClick={() => setDeviceDropdownOpen(!deviceDropdownOpen)}
                                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-[#222222] bg-[#F7F7F8] hover:bg-[#EAEAEA] border border-[#E5E5E7] rounded-lg transition-colors cursor-pointer"
                            >
                                {device === 'Desktop' ? <Monitor size={13} className="text-[#707070]" /> : <Smartphone size={13} className="text-[#707070]" />}
                                <span>{device}</span>
                                <ChevronDown size={12} className="text-[#707070]" />
                            </button>

                            {deviceDropdownOpen && (
                                <div className="absolute left-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-[#E5E5E7] py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <button
                                        onClick={() => { setDevice('Desktop'); setDeviceDropdownOpen(false); }}
                                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-[#F4F4F5] transition-colors ${
                                            device === 'Desktop' ? 'text-[#4F5BD5] font-semibold bg-[#EEF2FF]' : 'text-[#222222]'
                                        }`}
                                    >
                                        <Monitor size={13} />
                                        <span>Desktop</span>
                                    </button>
                                    <button
                                        onClick={() => { setDevice('Mobile'); setDeviceDropdownOpen(false); }}
                                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-[#F4F4F5] transition-colors ${
                                            device === 'Mobile' ? 'text-[#4F5BD5] font-semibold bg-[#EEF2FF]' : 'text-[#222222]'
                                        }`}
                                    >
                                        <Smartphone size={13} />
                                        <span>Mobile</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-[#8E8E93] font-medium">
                        Sep 16, 2026
                    </div>
                </div>

                {/* Thin Divider below subheader */}
                <div className="border-b border-[#E5E5E7] -mx-5 sm:-mx-6 mb-5" />

                {/* SEO Metrics Grid: 5 columns on desktop with vertical dividers */}
                <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E7] -mx-2">
                    
                    {/* 1. Authority Score */}
                    <div className="p-2 sm:p-2.5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#707070] font-medium mb-2">
                                <span className="truncate">Authority Score</span>
                                <div className="relative group">
                                    <Info size={12} className="text-[#9CA3AF] hover:text-[#4F5BD5] cursor-pointer shrink-0" />
                                    <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 bg-[#18181B] text-white text-[11px] rounded-lg shadow-xl z-50 leading-tight">
                                        {metricTooltips.authority}
                                    </div>
                                </div>
                            </div>

                            {/* Circular Indicator + Value */}
                            <div className="flex items-center gap-2.5 my-1">
                                <div className="relative w-8 h-8 rounded-full border-2 border-[#E5E7EB] flex items-center justify-center bg-[#F9FAFB]">
                                    <span className="text-xs font-bold text-[#6B7280]">0</span>
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 32 32">
                                        <circle
                                            cx="16"
                                            cy="16"
                                            r="13"
                                            fill="none"
                                            stroke="#CBD5E1"
                                            strokeWidth="2.5"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                                    {data.authorityScore}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 text-[11px] text-[#707070]">
                            Semrush Rank <span className="font-medium text-[#222222]">{data.semrushRank}</span>
                        </div>
                    </div>

                    {/* 2. Organic Traffic */}
                    <div className="p-2 sm:p-2.5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#707070] font-medium mb-2">
                                <span className="truncate">Organic Traffic</span>
                                <div className="relative group">
                                    <Info size={12} className="text-[#9CA3AF] hover:text-[#4F5BD5] cursor-pointer shrink-0" />
                                    <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 bg-[#18181B] text-white text-[11px] rounded-lg shadow-xl z-50 leading-tight">
                                        {metricTooltips.traffic}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 my-1">
                                <span className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                                    {data.organicTraffic}
                                </span>
                                <span className="text-xs font-medium text-[#9CA3AF]">
                                    {data.organicTrafficChange}
                                </span>
                            </div>
                        </div>

                        {/* Small horizontal line / flatline sparkline chart */}
                        <div className="pt-2">
                            <div className="w-full h-3 flex items-center">
                                <div className="w-full h-[2px] bg-[#E2E8F0] rounded-full relative overflow-hidden">
                                    <div className="w-0 h-full bg-[#3B82F6]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Organic Keywords */}
                    <div className="p-2 sm:p-2.5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#707070] font-medium mb-2">
                                <span className="truncate">Organic Keywords</span>
                                <div className="relative group">
                                    <Info size={12} className="text-[#9CA3AF] hover:text-[#4F5BD5] cursor-pointer shrink-0" />
                                    <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 bg-[#18181B] text-white text-[11px] rounded-lg shadow-xl z-50 leading-tight">
                                        {metricTooltips.keywords}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 my-1">
                                <span className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                                    {data.organicKeywords}
                                </span>
                                <span className="text-xs font-medium text-[#9CA3AF]">
                                    {data.organicKeywordsChange}
                                </span>
                            </div>
                        </div>

                        {/* Small horizontal line / sparkline */}
                        <div className="pt-2">
                            <div className="w-full h-3 flex items-center">
                                <div className="w-full h-[2px] bg-[#E2E8F0] rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* 4. Paid Keywords */}
                    <div className="p-2 sm:p-2.5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#707070] font-medium mb-2">
                                <span className="truncate">Paid Keywords</span>
                                <div className="relative group">
                                    <Info size={12} className="text-[#9CA3AF] hover:text-[#4F5BD5] cursor-pointer shrink-0" />
                                    <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 bg-[#18181B] text-white text-[11px] rounded-lg shadow-xl z-50 leading-tight">
                                        {metricTooltips.paid}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 my-1">
                                <span className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
                                    {data.paidKeywords}
                                </span>
                                <span className="text-xs font-medium text-[#9CA3AF]">
                                    0%
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 text-[11px] text-[#707070]">
                            Paid Traffic <span className="font-medium text-[#222222]">{data.paidTraffic}</span>
                        </div>
                    </div>

                    {/* 5. Ref. Domains */}
                    <div className="p-2 sm:p-2.5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#707070] font-medium mb-2">
                                <span className="truncate">Ref. Domains</span>
                                <div className="relative group">
                                    <Info size={12} className="text-[#9CA3AF] hover:text-[#4F5BD5] cursor-pointer shrink-0" />
                                    <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 bg-[#18181B] text-white text-[11px] rounded-lg shadow-xl z-50 leading-tight">
                                        {metricTooltips.refDomains}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 my-1">
                                <span className="text-xl sm:text-2xl font-bold text-[#707070] tracking-tight lowercase">
                                    {data.refDomains}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 text-[11px] text-[#707070]">
                            Backlinks <span className="font-medium text-[#707070]">{data.backlinks}</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom subtle note or link */}
            <div className="mt-4 pt-3 border-t border-[#F0F0F2] flex items-center justify-between text-[11px] text-[#A0A0A5]">
                <span>Data updated daily from Google SERP index</span>
                <span className="text-[#4F5BD5] hover:underline cursor-pointer font-medium">Full SEO report</span>
            </div>
        </div>
    );
}
