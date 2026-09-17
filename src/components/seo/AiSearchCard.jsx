import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Sparkles } from 'lucide-react';
import { 
    ChatGptIcon, 
    GoogleAiOverviewIcon, 
    GoogleAiModeIcon, 
    GoogleGeminiIcon,
    FlagUsIcon,
    FlagPkIcon
} from './BrandIcons';

export default function AiSearchCard({
    data = {
        visibility: 0,
        mentions: 0,
        citedPages: 0,
        platforms: [
            { id: 'chatgpt', name: 'ChatGPT', mentions: 0, citedPages: 0 },
            { id: 'ai-overview', name: 'AI Overview', mentions: 0, citedPages: 0 },
            { id: 'ai-mode', name: 'AI Mode', mentions: 0, citedPages: 0 },
            { id: 'gemini', name: 'Gemini', mentions: 0, citedPages: 0 }
        ]
    },
    onClose
}) {
    const [country, setCountry] = useState('US');
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const countries = [
        { code: 'US', name: 'United States', flag: FlagUsIcon, emoji: '🇺🇸' },
        { code: 'PK', name: 'Pakistan', flag: FlagPkIcon, emoji: '🇵🇰' },
        { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧' },
        { code: 'CA', name: 'Canada', emoji: '🇨🇦' },
        { code: 'DE', name: 'Germany', emoji: '🇩🇪' }
    ];

    const currentCountry = countries.find(c => c.code === country) || countries[0];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCountryDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getPlatformIcon = (id) => {
        switch (id) {
            case 'chatgpt':
                return <ChatGptIcon className="w-5 h-5 rounded-full shrink-0" />;
            case 'ai-overview':
                return <GoogleAiOverviewIcon className="w-5 h-5 shrink-0" />;
            case 'ai-mode':
                return <GoogleAiModeIcon className="w-5 h-5 shrink-0" />;
            case 'gemini':
                return <GoogleGeminiIcon className="w-5 h-5 shrink-0" />;
            default:
                return <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />;
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-[#E5E5E7] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3">
                    {/* Purple Rounded Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] border border-[#E9D5FF] text-[#7C3AED] text-xs font-semibold tracking-wide">
                        <Sparkles size={13} className="text-[#9333EA]" />
                        <span>AI Search</span>
                    </div>

                    {/* Right side: Country Selector + Close X */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Country Selector */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#222222] bg-[#F7F7F8] hover:bg-[#EAEAEA] border border-[#E5E5E7] rounded-lg transition-colors cursor-pointer"
                            >
                                <span className="text-sm leading-none">{currentCountry.emoji}</span>
                                <span>{currentCountry.name}</span>
                                <ChevronDown size={13} className="text-[#707070]" />
                            </button>

                            {countryDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-[#E5E5E7] py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
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

                        {/* Close X icon */}
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md text-[#9CA3AF] hover:text-[#222222] hover:bg-[#F3F4F6] transition-colors"
                            title="Close card"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Thin Divider below header */}
                <div className="border-b border-[#E5E5E7] -mx-5 sm:-mx-6 mb-5" />

                {/* Stats Section: 3 columns */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pb-5 border-b border-[#E5E5E7]">
                    
                    {/* Column 1: AI Visibility */}
                    <div className="flex flex-col">
                        <span className="text-xs text-[#707070] font-medium mb-1.5 flex items-center gap-1">
                            AI Visibility
                        </span>
                        <div className="flex items-center gap-2.5">
                            {/* Circular Progress Gauge Icon */}
                            <div className="relative w-8 h-8 rounded-full border-2 border-[#E5E7EB] flex items-center justify-center bg-[#FAF5FF]">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#A855F7]/30" />
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 32 32">
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r="13"
                                        fill="none"
                                        stroke="#7C3AED"
                                        strokeWidth="2.5"
                                        strokeDasharray="81.68"
                                        strokeDashoffset="81.68"
                                        strokeLinecap="round"
                                        className="transition-all duration-500"
                                    />
                                </svg>
                            </div>
                            <span className="text-2xl sm:text-3xl font-bold text-[#4F5BD5] tracking-tight">
                                {data.visibility}
                            </span>
                        </div>
                    </div>

                    {/* Column 2: Mentions */}
                    <div className="flex flex-col pl-2 sm:pl-4 border-l border-[#F0F0F2]">
                        <span className="text-xs text-[#707070] font-medium mb-1.5">
                            Mentions
                        </span>
                        <div className="h-8 flex items-center">
                            <span className="text-2xl sm:text-3xl font-bold text-[#4F5BD5] tracking-tight">
                                {data.mentions}
                            </span>
                        </div>
                    </div>

                    {/* Column 3: Cited pages */}
                    <div className="flex flex-col pl-2 sm:pl-4 border-l border-[#F0F0F2]">
                        <span className="text-xs text-[#707070] font-medium mb-1.5">
                            Cited pages
                        </span>
                        <div className="h-8 flex items-center">
                            <span className="text-2xl sm:text-3xl font-bold text-[#4F5BD5] tracking-tight">
                                {data.citedPages}
                            </span>
                        </div>
                    </div>

                </div>

                {/* AI Platform Breakdown List */}
                <div className="pt-4">
                    {/* Optional table headers */}
                    <div className="grid grid-cols-12 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider pb-2 px-1">
                        <div className="col-span-6">Platform</div>
                        <div className="col-span-3 text-right">Mentions</div>
                        <div className="col-span-3 text-right">Cited pages</div>
                    </div>

                    {/* 4 Platform Rows */}
                    <div className="divide-y divide-[#F0F0F2]">
                        {data.platforms.map((plat) => (
                            <div 
                                key={plat.id}
                                className="grid grid-cols-12 items-center py-2.5 px-1 hover:bg-[#F9FAFB] rounded-lg transition-colors group"
                            >
                                {/* Platform Name & Icon */}
                                <div className="col-span-6 flex items-center gap-2.5">
                                    {getPlatformIcon(plat.id)}
                                    <span className="text-xs sm:text-sm font-medium text-[#222222] group-hover:text-[#4F5BD5] transition-colors">
                                        {plat.name}
                                    </span>
                                </div>

                                {/* Mentions count */}
                                <div className="col-span-3 text-right text-xs sm:text-sm font-semibold text-[#4F5BD5]">
                                    {plat.mentions}
                                    <span className="hidden sm:inline font-normal text-[#8E8E93] ml-1 text-xs">
                                        mentions
                                    </span>
                                </div>

                                {/* Cited pages count */}
                                <div className="col-span-3 text-right text-xs sm:text-sm font-semibold text-[#4F5BD5]">
                                    {plat.citedPages}
                                    <span className="hidden sm:inline font-normal text-[#8E8E93] ml-1 text-xs">
                                        cited pages
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom subtle note or timestamp */}
            <div className="mt-4 pt-3 border-t border-[#F0F0F2] flex items-center justify-between text-[11px] text-[#A0A0A5]">
                <span>Tracked via Semrush AI Search Sensor</span>
                <span className="text-[#4F5BD5] hover:underline cursor-pointer font-medium">View detailed analysis</span>
            </div>
        </div>
    );
}
