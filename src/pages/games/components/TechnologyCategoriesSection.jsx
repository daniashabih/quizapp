import React, { useState, useMemo } from 'react';
import {
    Code2,
    Layers,
    Search,
    X,
    Trophy,
    Gamepad2,
    Check,
    Sparkles,
    ArrowRight,
    Flame
} from 'lucide-react';
import TechIcon from './TechIcon';

export const TechnologyCategoriesSection = ({
    categories = [],
    technologies = [],
    selectedTechnology = null,
    onSelectTechnology,
    userStats = null,
    totalGamesCount = 14
}) => {
    const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
    const [techSearchQuery, setTechSearchQuery] = useState('');

    // Filter technologies by active category tab and search query
    const filteredTechnologies = useMemo(() => {
        return technologies.filter((tech) => {
            if (selectedCategoryTab !== 'all' && tech.categorySlug !== selectedCategoryTab) {
                return false;
            }
            if (techSearchQuery.trim()) {
                const q = techSearchQuery.toLowerCase();
                const matchName = (tech.name || '').toLowerCase().includes(q);
                const matchSlug = (tech.slug || '').toLowerCase().includes(q);
                const matchDesc = (tech.description || '').toLowerCase().includes(q);
                if (!matchName && !matchSlug && !matchDesc) return false;
            }
            return true;
        });
    }, [technologies, selectedCategoryTab, techSearchQuery]);

    // Active selected technology object
    const activeTechObj = useMemo(() => {
        if (!selectedTechnology || selectedTechnology === 'all') return null;
        return technologies.find(t => t.slug === selectedTechnology) || null;
    }, [technologies, selectedTechnology]);

    return (
        <section className="mb-10">
            {/* Header: Title, Subtitle, and Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                        <Layers size={13} /> Technology Tracks
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                        Choose Your Technology
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] font-medium mt-0.5">
                        Practice real code syntax and challenges tailored to your stack
                    </p>
                </div>

                {/* Search Bar for Technologies */}
                <div className="relative w-full md:w-72">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search HTML, React, Flutter..."
                        value={techSearchQuery}
                        onChange={(e) => setTechSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-hidden focus:border-emerald-500 transition-all"
                    />
                    {techSearchQuery && (
                        <button
                            onClick={() => setTechSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
                <button
                    onClick={() => setSelectedCategoryTab('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        selectedCategoryTab === 'all'
                            ? 'bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 border-[#193D35] dark:border-emerald-400 shadow-xs'
                            : 'bg-[var(--card-bg)] text-[var(--foreground-muted)] border-[var(--card-border)] hover:text-[var(--foreground)]'
                    }`}
                >
                    All Categories ({technologies.length})
                </button>
                {categories.map((cat) => {
                    const isSelected = selectedCategoryTab === cat.slug;
                    const count = technologies.filter(t => t.categorySlug === cat.slug).length;
                    return (
                        <button
                            key={cat.slug}
                            onClick={() => setSelectedCategoryTab(cat.slug)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                                isSelected
                                    ? 'bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 border-[#193D35] dark:border-emerald-400 shadow-xs'
                                    : 'bg-[var(--card-bg)] text-[var(--foreground-muted)] border-[var(--card-border)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            <span>{cat.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                isSelected ? 'bg-white/20 text-white dark:text-stone-950' : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)]'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Technology Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* 1. All Technologies Card */}
                <button
                    onClick={() => onSelectTechnology(null)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                        !selectedTechnology || selectedTechnology === 'all'
                            ? 'bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                            : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-emerald-500/50 hover:shadow-xs'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                            <Gamepad2 size={18} />
                        </div>
                        {(!selectedTechnology || selectedTechnology === 'all') && (
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-[10px] font-black">
                                <Check size={12} strokeWidth={3} />
                            </span>
                        )}
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-[var(--foreground)] leading-tight mb-0.5">
                            All Technologies
                        </h4>
                        <p className="text-[10px] text-[var(--foreground-muted)] font-medium">
                            {totalGamesCount} Games available
                        </p>
                    </div>
                </button>

                {/* 2. Dynamic Technology Cards */}
                {filteredTechnologies.map((tech) => {
                    const isSelected = selectedTechnology === tech.slug;
                    const gamesCount = (tech.supportedGames || []).length;
                    const userHighScore = tech.userHighScore || 0;
                    const totalPlays = tech.userTotalPlays || 0;

                    return (
                        <button
                            key={tech.slug}
                            onClick={() => onSelectTechnology(tech.slug)}
                            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                                isSelected
                                    ? 'bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500 shadow-lg ring-2 ring-emerald-500/40 transform -translate-y-0.5'
                                    : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-emerald-500/60 hover:shadow-md hover:-translate-y-0.5'
                            }`}
                        >
                            {/* Card Header with Icon and Selected Indicator */}
                            <div className="flex items-center justify-between mb-2.5">
                                <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: `${tech.color || '#10B981'}20` }}
                                >
                                    <TechIcon slug={tech.slug} className="w-4 h-4" />
                                </div>

                                {isSelected ? (
                                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-[10px] font-black shadow-xs">
                                        <Check size={12} strokeWidth={3} />
                                    </span>
                                ) : tech.badge ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--muted-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)]">
                                        {tech.badge}
                                    </span>
                                ) : null}
                            </div>

                            {/* Card Body with Name and Game Count */}
                            <div>
                                <h4 className="text-xs font-black text-[var(--foreground)] leading-tight mb-1 group-hover:text-emerald-500 transition-colors truncate">
                                    {tech.name}
                                </h4>
                                <div className="flex items-center justify-between text-[10px] text-[var(--foreground-muted)]">
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                        {gamesCount} Games
                                    </span>
                                    {userHighScore > 0 && (
                                        <span className="font-bold text-amber-500 flex items-center gap-0.5">
                                            ★ {userHighScore}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Active Selected Technology Highlight Banner */}
            {activeTechObj && (
                <div className="mt-4 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-md text-[var(--foreground)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-md"
                            style={{ backgroundColor: `${activeTechObj.color || '#10B981'}30` }}
                        >
                            <TechIcon slug={activeTechObj.slug} className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                    Active Technology
                                </span>
                                <h3 className="text-base font-black text-[var(--foreground)]">{activeTechObj.name}</h3>
                            </div>
                            <p className="text-xs text-[var(--foreground-muted)] max-w-xl line-clamp-1 mt-0.5">
                                {activeTechObj.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {activeTechObj.userHighScore > 0 && (
                            <div className="px-3 py-1.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-center">
                                <span className="text-[10px] text-[var(--foreground-muted)] block font-bold uppercase">Best Score</span>
                                <span className="text-xs font-black text-amber-400">★ {activeTechObj.userHighScore} pts</span>
                            </div>
                        )}
                        <div className="px-3 py-1.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-center">
                            <span className="text-[10px] text-[var(--foreground-muted)] block font-bold uppercase">Available Games</span>
                            <span className="text-xs font-black text-emerald-400">{(activeTechObj.supportedGames || []).length}</span>
                        </div>
                        <button
                            onClick={() => onSelectTechnology(null)}
                            className="game-btn-secondary text-xs"
                        >
                            <X size={14} /> Clear Filter
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TechnologyCategoriesSection;
