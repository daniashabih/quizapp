import React, { useState } from 'react';
import SeoHeader from '../../components/seo/SeoHeader';
import AiSearchCard from '../../components/seo/AiSearchCard';
import SeoOverviewCard from '../../components/seo/SeoOverviewCard';
import { CreateProjectModal, FeedbackModal, SettingsModal } from '../../components/seo/SeoModals';
import { RefreshCw, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SeoDashboard() {
    const [domain, setDomain] = useState("hangbug.vercel.app");
    const [card1Visible, setCard1Visible] = useState(true);
    const [card2Visible, setCard2Visible] = useState(true);
    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Realistic static placeholder values structured for future API integration
    const [aiSearchData, setAiSearchData] = useState({
        visibility: 0,
        mentions: 0,
        citedPages: 0,
        platforms: [
            { id: 'chatgpt', name: 'ChatGPT', mentions: 0, citedPages: 0 },
            { id: 'ai-overview', name: 'AI Overview', mentions: 0, citedPages: 0 },
            { id: 'ai-mode', name: 'AI Mode', mentions: 0, citedPages: 0 },
            { id: 'gemini', name: 'Gemini', mentions: 0, citedPages: 0 }
        ]
    });

    const [seoData, setSeoData] = useState({
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
    });

    const handleCloseCard1 = () => {
        setCard1Visible(false);
        toast.info("AI Search card hidden. You can restore it anytime.", { autoClose: 2500 });
    };

    const handleCloseCard2 = () => {
        setCard2Visible(false);
        toast.info("SEO Overview card hidden. You can restore it anytime.", { autoClose: 2500 });
    };

    const handleResetCards = () => {
        setCard1Visible(true);
        setCard2Visible(true);
        toast.success("Dashboard cards restored!");
    };

    return (
        <div className="min-h-screen bg-[#F7F7F8] text-[#222222] font-sans antialiased flex flex-col selection:bg-[#4F5BD5]/15 selection:text-[#4F5BD5]">
            {/* Top Navigation / Header */}
            <SeoHeader
                currentDomain={domain}
                onDomainChange={(newDomain) => {
                    setDomain(newDomain);
                    toast.info(`Switched active domain to ${newDomain}`);
                }}
                onOpenFeedback={() => setFeedbackOpen(true)}
                onOpenCreateProject={() => setCreateProjectOpen(true)}
                onOpenSettings={() => setSettingsOpen(true)}
            />

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
                
                {/* Restore cards banner if any card was closed */}
                {(!card1Visible || !card2Visible) && (
                    <div className="mb-5 p-3 rounded-xl bg-white border border-[#E5E5E7] flex items-center justify-between text-xs text-[#707070] shadow-xs animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={15} className="text-[#3B82F6]" />
                            <span>One or more dashboard cards are currently hidden.</span>
                        </div>
                        <button
                            onClick={handleResetCards}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#18181B] font-semibold rounded-lg transition-colors"
                        >
                            <RotateCcw size={12} />
                            <span>Restore all cards</span>
                        </button>
                    </div>
                )}

                {/* Two Large Cards Side-by-Side */}
                <div className={`grid gap-5 items-stretch ${
                    card1Visible && card2Visible 
                        ? 'grid-cols-1 lg:grid-cols-2' 
                        : 'grid-cols-1'
                }`}>
                    {/* Card 1: AI Search */}
                    {card1Visible && (
                        <AiSearchCard
                            data={aiSearchData}
                            onClose={handleCloseCard1}
                        />
                    )}

                    {/* Card 2: SEO Overview */}
                    {card2Visible && (
                        <SeoOverviewCard
                            data={seoData}
                            onClose={handleCloseCard2}
                        />
                    )}
                </div>
            </main>

            {/* Subtle Footer */}
            <footer className="w-full border-t border-[#E5E5E7] bg-white py-4 text-center text-xs text-[#8E8E93] mt-auto">
                <div className="max-w-[1140px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p>© 2026 HangBug SEO Intelligence. All metrics powered by Semrush API index.</p>
                    <div className="flex items-center gap-4 text-[#707070]">
                        <button onClick={() => setFeedbackOpen(true)} className="hover:text-[#222222] transition-colors">
                            Feedback
                        </button>
                        <button onClick={() => setSettingsOpen(true)} className="hover:text-[#222222] transition-colors">
                            Documentation
                        </button>
                        <button onClick={() => setSettingsOpen(true)} className="hover:text-[#222222] transition-colors">
                            Settings
                        </button>
                    </div>
                </div>
            </footer>

            {/* Modals */}
            <CreateProjectModal
                isOpen={createProjectOpen}
                onClose={() => setCreateProjectOpen(false)}
                onProjectCreated={(newDom) => setDomain(newDom)}
            />

            <FeedbackModal
                isOpen={feedbackOpen}
                onClose={() => setFeedbackOpen(false)}
            />

            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />
        </div>
    );
}
