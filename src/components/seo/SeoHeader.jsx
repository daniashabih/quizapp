import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ChevronRight, 
    ChevronDown, 
    ExternalLink, 
    MessageSquare, 
    Plus, 
    Share2, 
    Settings, 
    Check,
    Globe
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function SeoHeader({
    currentDomain = "hangbug.vercel.app",
    onDomainChange,
    onOpenFeedback,
    onOpenCreateProject,
    onOpenSettings
}) {
    const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const availableDomains = [
        "hangbug.vercel.app",
        "hangbug.com",
        "quizapp-azure.vercel.app"
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDomainDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCopyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("SEO Dashboard link copied to clipboard!");
        } catch {
            toast.info("Link: " + window.location.href);
        }
    };

    return (
        <header className="w-full bg-white border-b border-[#E5E5E7] sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-3.5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                    
                    {/* Left Column: Breadcrumbs + Title with Domain */}
                    <div className="flex flex-col space-y-1">
                        {/* Breadcrumbs */}
                        <div className="flex items-center space-x-1.5 text-xs text-[#707070] font-normal">
                            <Link to="/dashboard" className="hover:text-[#222222] transition-colors">
                                Home
                            </Link>
                            <ChevronRight size={13} className="text-[#A0A0A5]" />
                            <span className="text-[#222222] font-medium">SEO</span>
                        </div>

                        {/* Title row: SEO Dashboard: domain */}
                        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                            <h1 className="text-lg sm:text-xl font-bold text-[#222222] tracking-tight">
                                SEO Dashboard:
                            </h1>

                            {/* Clickable Domain with Dropdown and External Link */}
                            <div className="relative inline-flex items-center gap-1.5" ref={dropdownRef}>
                                <button
                                    onClick={() => setDomainDropdownOpen(!domainDropdownOpen)}
                                    className="group inline-flex items-center gap-1 text-[#3B82F6] hover:text-[#2563EB] font-semibold text-base sm:text-lg transition-colors cursor-pointer"
                                    title="Switch domain"
                                >
                                    <span>{currentDomain}</span>
                                    <ChevronDown 
                                        size={15} 
                                        className={`text-[#3B82F6] group-hover:text-[#2563EB] transition-transform duration-200 ${
                                            domainDropdownOpen ? 'rotate-180' : ''
                                        }`} 
                                    />
                                </button>

                                <a
                                    href={`https://${currentDomain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#9CA3AF] hover:text-[#3B82F6] p-1 rounded-md hover:bg-[#F3F4F6] transition-colors"
                                    title="Open website in new tab"
                                >
                                    <ExternalLink size={15} />
                                </a>

                                {/* Domain Switcher Dropdown Menu */}
                                {domainDropdownOpen && (
                                    <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-[#E5E5E7] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                                            Select Project Domain
                                        </div>
                                        {availableDomains.map((dom) => (
                                            <button
                                                key={dom}
                                                onClick={() => {
                                                    if (onDomainChange) onDomainChange(dom);
                                                    setDomainDropdownOpen(false);
                                                }}
                                                className={`w-full px-3 py-2 text-left text-xs sm:text-sm flex items-center justify-between hover:bg-[#F4F4F5] transition-colors ${
                                                    dom === currentDomain ? 'text-[#3B82F6] font-semibold bg-[#EFF6FF]' : 'text-[#222222]'
                                                }`}
                                            >
                                                <span className="truncate">{dom}</span>
                                                {dom === currentDomain && <Check size={14} className="text-[#3B82F6] shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Feedback link + Action buttons */}
                    <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 self-start md:self-center">
                        
                        {/* Send feedback button */}
                        <button
                            onClick={onOpenFeedback}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#4F5BD5] hover:text-[#434eb8] hover:underline transition-all px-2 py-1.5 rounded-lg"
                        >
                            <MessageSquare size={15} className="text-[#4F5BD5]" />
                            <span>Send feedback</span>
                        </button>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            {/* + Create SEO Project Button */}
                            <button
                                onClick={onOpenCreateProject}
                                className="inline-flex items-center gap-1.5 bg-[#18181B] hover:bg-[#27272A] text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition-colors shadow-xs active:scale-[0.98]"
                            >
                                <Plus size={15} className="stroke-[2.5]" />
                                <span>Create SEO Project</span>
                            </button>

                            {/* Share button */}
                            <button
                                onClick={handleCopyShareLink}
                                className="inline-flex items-center gap-1.5 bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#18181B] border border-[#E4E4E7] text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition-colors active:scale-[0.98]"
                                title="Share dashboard link"
                            >
                                <Share2 size={14} className="text-[#71717A]" />
                                <span>Share</span>
                            </button>

                            {/* Settings icon button */}
                            <button
                                onClick={onOpenSettings}
                                className="p-2 text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] border border-[#E4E4E7] rounded-lg transition-colors active:scale-[0.98]"
                                title="Dashboard settings"
                                aria-label="Settings"
                            >
                                <Settings size={16} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </header>
    );
}
