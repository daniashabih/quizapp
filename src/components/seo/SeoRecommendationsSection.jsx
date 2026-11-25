import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Square, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';
import { getPriorityBadgeClasses } from './seoUtils';

export default function SeoRecommendationsSection({ data, domain, onDataUpdated }) {
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [showCompleted, setShowCompleted] = useState(true);
    const [togglingKey, setTogglingKey] = useState(null);

    const recsData = data?.recommendations || {};
    const items = recsData.items || [];
    const stats = recsData.stats || { total: 0, completed: 0 };

    const filtered = items.filter((r) => {
        if (!showCompleted && r.isCompleted) return false;
        if (priorityFilter !== 'all' && String(r.priority || '').toLowerCase() !== priorityFilter) return false;
        return true;
    });

    const handleToggle = async (rec) => {
        setTogglingKey(rec.recKey);
        try {
            const nextState = !rec.isCompleted;
            const res = await seoService.toggleRecommendation(rec.recKey, {
                domain,
                isCompleted: nextState,
                title: rec.title,
                priority: rec.priority
            });
            if (res?.success) {
                toast.success(res.message);
                if (onDataUpdated) await onDataUpdated();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not update recommendation status.');
        } finally {
            setTogglingKey(null);
        }
    };

    const pctComplete = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Progress Header */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 shadow-[0_1px_3px_rgba(25,61,53,0.04)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            SEO Prioritized Action Center
                        </h2>
                        <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-0.5">
                            Ranked by impact. Completion state is saved in MongoDB and synced across Web and Mobile.
                        </p>
                    </div>
                    <div className="text-xs font-semibold text-[#193D35] dark:text-emerald-300 bg-[#E5F2EC] dark:bg-[#1F352E] px-3 py-1.5 rounded-xl">
                        {stats.completed} / {stats.total} completed ({pctComplete}%)
                    </div>
                </div>

                <div className="mt-4 h-2 w-full rounded-full bg-[#E4EAE6] dark:bg-[#2A3832] overflow-hidden">
                    <div
                        className="h-full bg-[#2F806B] rounded-full transition-all duration-500"
                        style={{ width: `${pctComplete}%` }}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5 text-xs">
                    {['all', 'critical', 'high', 'medium', 'opportunity'].map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPriorityFilter(p)}
                            className={`px-3 py-1.5 rounded-xl font-semibold capitalize cursor-pointer ${
                                priorityFilter === p
                                    ? 'bg-[#193D35] text-white'
                                    : 'bg-white dark:bg-[#18221E] border border-[#E4EAE6] dark:border-[#2A3832] text-[#75817C] dark:text-[#8FA69C]'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#75817C] dark:text-[#8FA69C] cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showCompleted}
                        onChange={(e) => setShowCompleted(e.target.checked)}
                        className="rounded accent-[#193D35]"
                    />
                    <span>Show completed</span>
                </label>
            </div>

            {/* Recommendations List */}
            {filtered.length === 0 ? (
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-8 text-center text-xs text-[#75817C] flex flex-col items-center gap-2">
                    <CheckCircle2 size={24} className="text-[#2F806B]" />
                    <span>No recommendations match this filter.</span>
                </div>
            ) : (
                <div className="space-y-3.5">
                    {filtered.map((rec) => {
                        const busy = togglingKey === rec.recKey;
                        return (
                            <div
                                key={rec.recKey}
                                className={`bg-white dark:bg-[#18221E] rounded-2xl border p-5 transition-all ${
                                    rec.isCompleted
                                        ? 'border-[#BBE0CE] dark:border-[#2A3832] opacity-75'
                                        : 'border-[#E4EAE6] dark:border-[#2A3832] hover:border-[#2F806B]/60'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPriorityBadgeClasses(rec.priority)}`}>
                                                {rec.priority}
                                            </span>
                                            <span className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                                Source: {rec.source}
                                            </span>
                                        </div>
                                        <h3 className={`text-sm sm:text-base font-display font-bold ${
                                            rec.isCompleted ? 'line-through text-[#75817C]' : 'text-[#17221F] dark:text-[#F3F6F4]'
                                        }`}>
                                            {rec.title}
                                        </h3>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => handleToggle(rec)}
                                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                                            rec.isCompleted
                                                ? 'bg-[#E5F2EC] dark:bg-[#1F352E] text-[#193D35] dark:text-emerald-300 border border-[#BBE0CE]'
                                                : 'bg-[#193D35] hover:bg-[#2F806B] text-white'
                                        }`}
                                    >
                                        {rec.isCompleted ? <CheckSquare size={14} /> : <Square size={14} />}
                                        <span>{rec.isCompleted ? 'Completed' : 'Mark as Completed'}</span>
                                    </button>
                                </div>

                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                    <div className="p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19]">
                                        <span className="block text-[10px] font-bold uppercase text-[#75817C] mb-1">Explanation</span>
                                        <p className="text-[#17221F] dark:text-[#F3F6F4] leading-relaxed">{rec.explanation}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19]">
                                        <span className="block text-[10px] font-bold uppercase text-[#75817C] mb-1">Expected Benefit</span>
                                        <p className="text-[#17221F] dark:text-[#B8CEC5] leading-relaxed">{rec.expectedBenefit}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-[#E5F2EC]/50 dark:bg-[#1F352E]/50 space-y-2">
                                        <div>
                                            <span className="block text-[10px] font-bold uppercase text-[#193D35] dark:text-emerald-300 mb-1">Suggested Action</span>
                                            <p className="text-[#17221F] dark:text-[#F3F6F4] leading-relaxed">{rec.suggestedAction}</p>
                                        </div>
                                        {rec.recKey === 'audit_empty_tech_categories_opportunity' && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                <Link
                                                    to="/admin?tab=ai&count=15"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#193D35] hover:bg-[#2F806B] text-white text-[11px] font-semibold"
                                                >
                                                    <Sparkles size={11} /> AI Generator
                                                </Link>
                                                <Link
                                                    to="/admin?tab=questions"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] text-[#193D35] dark:text-emerald-300 text-[11px] font-semibold"
                                                >
                                                    <BookOpen size={11} /> Questions Bank
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {Array.isArray(rec.affectedPages) && rec.affectedPages.length > 0 && (
                                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                                        <span className="text-[#75817C]">Affected pages:</span>
                                        {rec.affectedPages.slice(0, 6).map((p, idx) => (
                                            <span key={`${p}-${idx}`} className="px-2 py-0.5 rounded-md bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] font-mono">
                                                {p}
                                            </span>
                                        ))}
                                        {rec.affectedPages.length > 6 && (
                                            <span className="text-[#2F806B] dark:text-emerald-400 font-semibold">
                                                +{rec.affectedPages.length - 6} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
