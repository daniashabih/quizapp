import React, { useState } from 'react';
import { X, Plus, MessageSquare, Settings, Check, Globe } from 'lucide-react';
import { toast } from 'react-toastify';

// Create SEO Project Modal
export function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
    const [domain, setDomain] = useState('');
    const [projectName, setProjectName] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!domain.trim()) {
            toast.error("Please enter a valid domain name");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success(`SEO Project "${projectName || domain}" created successfully!`);
            if (onProjectCreated) onProjectCreated(domain.trim());
            onClose();
        }, 600);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5E7] relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#222222] hover:bg-[#F3F4F6] transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
                        <Globe size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-[#222222]">Create SEO Project</h2>
                </div>
                <p className="text-xs text-[#707070] mb-5">
                    Track domain visibility, organic keywords, and AI Search performance.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#222222] mb-1">
                            Domain Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. hangbug.vercel.app or myapp.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E5E5E7] focus:outline-none focus:border-[#4F5BD5] focus:ring-2 focus:ring-[#4F5BD5]/15 transition-all text-[#222222]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#222222] mb-1">
                            Project Name (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Hangbug Web App"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E5E5E7] focus:outline-none focus:border-[#4F5BD5] focus:ring-2 focus:ring-[#4F5BD5]/15 transition-all text-[#222222]"
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-[#707070] hover:text-[#222222] hover:bg-[#F4F4F5] rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                        >
                            <Plus size={14} />
                            <span>{loading ? 'Creating...' : 'Create Project'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Send Feedback Modal
export function FeedbackModal({ isOpen, onClose }) {
    const [feedback, setFeedback] = useState('');
    const [type, setType] = useState('idea');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!feedback.trim()) return;
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            toast.success("Thank you for your feedback! It helps improve Hangbug SEO.");
            setFeedback('');
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5E7] relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#222222] hover:bg-[#F3F4F6] transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#4F5BD5]">
                        <MessageSquare size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-[#222222]">Send Feedback</h2>
                </div>
                <p className="text-xs text-[#707070] mb-4">
                    Have an idea or spotted an issue on the SEO dashboard? We'd love to hear from you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        {['idea', 'issue', 'other'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold capitalize border transition-colors ${
                                    type === t 
                                        ? 'bg-[#EEF2FF] border-[#4F5BD5] text-[#4F5BD5]' 
                                        : 'bg-white border-[#E5E5E7] text-[#707070] hover:bg-[#F9FAFB]'
                                }`}
                            >
                                {t === 'idea' ? '💡 Idea' : t === 'issue' ? '🐞 Bug' : '💬 Other'}
                            </button>
                        ))}
                    </div>

                    <div>
                        <textarea
                            rows={4}
                            placeholder="Tell us what you think or what features you'd like to see..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[#E5E5E7] focus:outline-none focus:border-[#4F5BD5] focus:ring-2 focus:ring-[#4F5BD5]/15 transition-all text-[#222222] resize-none"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-[#707070] hover:text-[#222222] hover:bg-[#F4F4F5] rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !feedback.trim()}
                            className="px-4 py-2 bg-[#4F5BD5] hover:bg-[#434eb8] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                        >
                            {submitting ? 'Sending...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Settings Modal
export function SettingsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5E7] relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#222222] hover:bg-[#F3F4F6] transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
                        <Settings size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-[#222222]">SEO Dashboard Settings</h2>
                </div>
                <p className="text-xs text-[#707070] mb-5">
                    Configure metric data providers and alert preferences.
                </p>

                <div className="space-y-3.5 text-xs text-[#222222]">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E5E7]">
                        <div>
                            <p className="font-semibold">AI Search Tracking</p>
                            <p className="text-[#707070] text-[11px]">Monitor ChatGPT, AI Overview & Gemini mentions</p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                            Enabled
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E5E7]">
                        <div>
                            <p className="font-semibold">Daily SERP Crawl</p>
                            <p className="text-[#707070] text-[11px]">Sync Google organic rankings daily</p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                            Active
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E5E7]">
                        <div>
                            <p className="font-semibold">Data Refresh Interval</p>
                            <p className="text-[#707070] text-[11px]">Default: 24 hours</p>
                        </div>
                        <span className="text-[11px] font-medium text-[#707070]">
                            Daily
                        </span>
                    </div>
                </div>

                <div className="mt-5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
