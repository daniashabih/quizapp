import React, { useState, useMemo, useRef, useEffect } from 'react';
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
    ArrowDown,
    ChevronDown,
    Filter,
    RotateCcw,
    Zap,
    Compass
} from 'lucide-react';
import TechIcon from './TechIcon';

// Curated concise descriptions for technologies to ensure every track has a rich, informative summary
const TECH_DESCRIPTIONS = {
    'html': 'Semantic structure, accessible markup, modern HTML5 elements, and interactive forms.',
    'css': 'Modern CSS layouts, Flexbox, CSS Grid, responsive design, and CSS variables.',
    'javascript': 'ES6+ syntax, asynchronous programming, DOM manipulation, and core JS algorithms.',
    'bootstrap': 'Responsive utility classes, component layouts, and rapid web UI development.',
    'jquery': 'DOM traversal, event listeners, dynamic effects, and web scripting fundamentals.',
    'react': 'Component hierarchy, hooks, state synchronization, and modern React patterns.',
    'php': 'Server-side scripting, request handling, arrays, superglobals, and backend APIs.',
    'laravel': 'MVC architecture, Eloquent ORM, Blade templating, routing, and artisan workflows.',
    'nodejs': 'Event-driven JavaScript runtime, asynchronous I/O, event loops, and npm modules.',
    'express': 'RESTful API routing, middleware pipelines, controllers, and backend endpoints.',
    'python': 'Clean Pythonic syntax, list comprehensions, data structures, and script logic.',
    'mysql': 'Relational data modeling, table joins, aggregation queries, and SQL constraints.',
    'mongodb': 'Document databases, NoSQL aggregation pipelines, BSON structures, and querying.',
    'sql': 'Standard SQL queries, subqueries, analytical grouping, joins, and schema management.',
    'flutter': 'Declarative widget trees, reactive state, cross-platform animations, and mobile UI.',
    'dart': 'Strongly typed OOP language, null safety, async/await futures, and streams.',
    'android-development': 'Native Android architecture, activities, intents, XML views, and Jetpack components.',
    'programming-logic': 'Algorithmic reasoning, boolean logic, recursion, control flow, and problem solving.',
    'oop': 'Encapsulation, inheritance, polymorphism, abstraction, and object-oriented patterns.',
    'dsa': 'Arrays, linked lists, trees, graphs, sorting algorithms, and complexity analysis.',
    'html-css': 'Unified frontend foundations blending semantic HTML structure with modern styling.',
    'full-stack': 'End-to-end engineering connecting frontend client UI, backend APIs, and databases.',
    'web-fundamentals': 'HTTP protocols, DNS, client-server lifecycle, cookies, and web standards.',
    'csharp': 'C# programming, strong typing, LINQ expressions, OOP, and modern .NET engineering.'
};

export const TechnologyCategoriesSection = ({
    categories = [],
    technologies = [],
    selectedTechnology = null,
    onSelectTechnology,
    userStats = null,
    totalGamesCount = 14
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
    
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Active selected technology object
    const activeTechObj = useMemo(() => {
        if (!selectedTechnology || selectedTechnology === 'all') return null;
        return technologies.find(t => t.slug === selectedTechnology) || null;
    }, [technologies, selectedTechnology]);

    // Active category object for the selected tech
    const activeCategoryObj = useMemo(() => {
        if (!activeTechObj) return null;
        return categories.find(c => c.slug === activeTechObj.categorySlug) || null;
    }, [categories, activeTechObj]);

    // Filter technologies for the dropdown based on search query and category tab
    const filteredTechnologies = useMemo(() => {
        return technologies.filter((tech) => {
            if (selectedCategoryTab !== 'all' && tech.categorySlug !== selectedCategoryTab) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = (tech.name || '').toLowerCase().includes(q);
                const matchSlug = (tech.slug || '').toLowerCase().includes(q);
                const matchDesc = (tech.description || '').toLowerCase().includes(q);
                const matchBadge = (tech.badge || '').toLowerCase().includes(q);
                if (!matchName && !matchSlug && !matchDesc && !matchBadge) return false;
            }
            return true;
        });
    }, [technologies, selectedCategoryTab, searchQuery]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
            // Auto focus search input when opened
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 60);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Handle selecting a technology
    const handleSelect = (slug) => {
        onSelectTechnology(slug);
        setIsOpen(false);
        setSearchQuery('');
    };

    // Smooth scroll to games catalog
    const handleExploreGames = () => {
        const el = document.getElementById('games-catalog');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollBy({ top: 320, behavior: 'smooth' });
        }
    };

    // Description text for active technology or full catalog
    const currentDescription = activeTechObj
        ? (activeTechObj.description || TECH_DESCRIPTIONS[activeTechObj.slug] || `Interactive code challenges, bug fixing, and typing practice for ${activeTechObj.name}.`)
        : 'Explore all 14 interactive coding challenges and typing games spanning 23 frontend, backend, database, mobile, and fundamental tracks.';

    // Total available games for active tech or full catalog
    const availableGamesForSelection = activeTechObj
        ? (activeTechObj.supportedGames || []).length
        : totalGamesCount;

    return (
        <section className="mb-8 relative" ref={dropdownRef}>
            {/* COMPACT TOP ROW: Header + Dropdown Technology Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 mb-3">
                {/* Section Title & Subtitle */}
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                        <Layers size={12} /> Technology Explorer
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-[var(--foreground)] tracking-tight">
                        Choose Your Technology
                    </h2>
                    <p className="text-xs text-[var(--foreground-muted)] font-medium">
                        Practice real code syntax and challenges tailored to your stack
                    </p>
                </div>

                {/* THE COMPACT DROPDOWN SELECTOR TRIGGER */}
                <div className="relative w-full md:w-auto">
                    <button
                        type="button"
                        onClick={() => setIsOpen((prev) => !prev)}
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                        className={`w-full md:w-80 px-3 py-2 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 shadow-xs select-none ${
                            isOpen
                                ? 'bg-[var(--card-bg)] border-emerald-500 ring-2 ring-emerald-500/25 shadow-md'
                                : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-emerald-500/60 hover:shadow-xs'
                        }`}
                    >
                        {/* Selected Tech Icon + Name */}
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 transition-transform"
                                style={{
                                    backgroundColor: activeTechObj?.color
                                        ? `${activeTechObj.color}20`
                                        : 'rgba(16, 185, 129, 0.15)'
                                }}
                            >
                                {activeTechObj ? (
                                    <TechIcon slug={activeTechObj.slug} className="w-4 h-4" />
                                ) : (
                                    <Gamepad2 className="w-4 h-4 text-emerald-500" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] leading-none mb-0.5">
                                    {activeTechObj ? 'Selected Track' : 'All Technologies'}
                                </div>
                                <div className="text-xs font-black text-[var(--foreground)] truncate">
                                    {activeTechObj ? activeTechObj.name : 'All Technologies'}
                                </div>
                            </div>
                        </div>

                        {/* Right: Games Count Pill + Animated Chevron */}
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {availableGamesForSelection} Games
                            </span>
                            <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[var(--foreground-muted)] transition-transform duration-200 ${
                                    isOpen ? 'rotate-180 text-emerald-500' : ''
                                }`}
                            >
                                <ChevronDown size={15} />
                            </div>
                        </div>
                    </button>

                    {/* FLOATING DROPDOWN PANEL */}
                    {isOpen && (
                        <div className="absolute right-0 top-full mt-2 w-full md:w-[480px] lg:w-[520px] max-w-[95vw] z-50 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl shadow-black/25 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                            {/* 1. Search Bar */}
                            <div className="p-3 border-b border-[var(--card-border)] bg-[var(--card-bg)]">
                                <div className="relative">
                                    <Search
                                        size={15}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none"
                                    />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search 23 technologies (React, Python, SQL...)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-hidden focus:border-emerald-500 focus:bg-[var(--card-bg)] transition-all"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                                            title="Clear search"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 2. Category Filter Pills */}
                            <div className="px-3 py-2 border-b border-[var(--card-border)] bg-[var(--muted-bg)]/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategoryTab('all')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                                        selectedCategoryTab === 'all'
                                            ? 'bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 border-[#193D35] dark:border-emerald-400 shadow-xs'
                                            : 'bg-[var(--card-bg)] text-[var(--foreground-muted)] border-[var(--card-border)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    All ({technologies.length})
                                </button>
                                {categories.map((cat) => {
                                    const isSelected = selectedCategoryTab === cat.slug;
                                    const count = technologies.filter(t => t.categorySlug === cat.slug).length;
                                    return (
                                        <button
                                            key={cat.slug}
                                            type="button"
                                            onClick={() => setSelectedCategoryTab(cat.slug)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                                                isSelected
                                                    ? 'bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 border-[#193D35] dark:border-emerald-400 shadow-xs'
                                                    : 'bg-[var(--card-bg)] text-[var(--foreground-muted)] border-[var(--card-border)] hover:text-[var(--foreground)]'
                                            }`}
                                        >
                                            <span>{cat.name}</span>
                                            <span className={`text-[10px] px-1 rounded-full font-bold ${
                                                isSelected ? 'bg-white/20 text-white dark:text-stone-950' : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)]'
                                            }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 3. Technologies Scrollable List */}
                            <div className="max-h-[300px] overflow-y-auto p-2.5 space-y-1.5 divide-y divide-[var(--card-border)]/40">
                                {/* Option A: All Technologies Option (always available at top when on 'all' tab or empty search) */}
                                {(!searchQuery.trim() || 'all technologies'.includes(searchQuery.toLowerCase())) && selectedCategoryTab === 'all' && (
                                    <div className="pb-1.5">
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(null)}
                                            className={`w-full p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group ${
                                                !selectedTechnology || selectedTechnology === 'all'
                                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30'
                                                    : 'bg-[var(--card-bg)] border-[var(--card-border)]/70 hover:bg-[var(--muted-bg)] hover:border-emerald-500/40'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                                                    <Gamepad2 size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-black text-[var(--foreground)] leading-tight">
                                                        All Technologies
                                                    </div>
                                                    <div className="text-[10px] text-[var(--foreground-muted)] truncate">
                                                        Browse all 14 coding & typing challenges
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[10px] font-bold text-[var(--foreground-muted)]">
                                                    {totalGamesCount} Games
                                                </span>
                                                {(!selectedTechnology || selectedTechnology === 'all') && (
                                                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-[10px] font-black">
                                                        <Check size={11} strokeWidth={3} />
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {/* Option B: Filtered Technologies 2-Column Grid */}
                                {filteredTechnologies.length > 0 ? (
                                    <div className="pt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        {filteredTechnologies.map((tech) => {
                                            const isSelected = selectedTechnology === tech.slug;
                                            const gamesCount = (tech.supportedGames || []).length;
                                            const category = categories.find(c => c.slug === tech.categorySlug);

                                            return (
                                                <button
                                                    key={tech.slug}
                                                    type="button"
                                                    onClick={() => handleSelect(tech.slug)}
                                                    className={`p-2 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 group ${
                                                        isSelected
                                                            ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/30'
                                                            : 'bg-[var(--card-bg)] border-[var(--card-border)]/70 hover:bg-[var(--muted-bg)] hover:border-emerald-500/40'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div
                                                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                                                            style={{ backgroundColor: `${tech.color || '#10B981'}25` }}
                                                        >
                                                            <TechIcon slug={tech.slug} className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[11px] font-bold text-[var(--foreground)] truncate group-hover:text-emerald-500 transition-colors">
                                                                {tech.name}
                                                            </div>
                                                            <div className="text-[9px] text-[var(--foreground-muted)] truncate">
                                                                {category?.name || tech.categorySlug}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                            {gamesCount}g
                                                        </span>
                                                        {isSelected && (
                                                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-[8px] font-black">
                                                                <Check size={9} strokeWidth={3} />
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Empty State */
                                    <div className="py-8 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2">
                                            <Search size={18} />
                                        </div>
                                        <div className="text-xs font-bold text-[var(--foreground)]">No technologies match</div>
                                        <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5 max-w-xs mx-auto">
                                            No technology found for "{searchQuery}". Try searching another name or reset filters.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSelectedCategoryTab('all');
                                            }}
                                            className="mt-3 px-3 py-1 rounded-lg bg-[var(--muted-bg)] text-[var(--foreground)] text-[11px] font-bold border border-[var(--card-border)] hover:bg-[var(--card-bg)] cursor-pointer"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 4. Dropdown Footer */}
                            <div className="px-3.5 py-2 bg-[var(--muted-bg)]/60 border-t border-[var(--card-border)] flex items-center justify-between text-[11px] text-[var(--foreground-muted)]">
                                <span>
                                    {filteredTechnologies.length} of {technologies.length} tracks
                                </span>
                                <div className="flex items-center gap-2">
                                    {selectedTechnology && selectedTechnology !== 'all' && (
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(null)}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                        >
                                            Reset to All
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="text-[11px] font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SELECTED TECHNOLOGY DISPLAY (Compact Information Section Below Selector) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs text-[var(--foreground)] flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-all">
                {/* Left: Icon + Name + Description */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 shadow-xs"
                        style={{
                            backgroundColor: activeTechObj?.color
                                ? `${activeTechObj.color}25`
                                : 'rgba(16, 185, 129, 0.18)'
                        }}
                    >
                        {activeTechObj ? (
                            <TechIcon slug={activeTechObj.slug} className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                            <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                                {activeTechObj ? (activeCategoryObj?.name || 'Active Track') : 'Full Catalog'}
                            </span>
                            <h3 className="text-sm sm:text-base font-black text-[var(--foreground)] truncate">
                                {activeTechObj ? activeTechObj.name : 'All Technologies Track'}
                            </h3>
                            {activeTechObj?.badge && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    {activeTechObj.badge}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-[var(--foreground-muted)] line-clamp-1 max-w-2xl font-medium">
                            {currentDescription}
                        </p>
                    </div>
                </div>

                {/* Right: Metrics + Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--card-border)]">
                    {/* Metrics Chip */}
                    <div className="flex items-center gap-2">
                        {activeTechObj?.userHighScore > 0 && (
                            <div className="px-2.5 py-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-center">
                                <span className="text-[9px] text-[var(--foreground-muted)] block font-bold uppercase">Best</span>
                                <span className="text-xs font-black text-amber-500">★ {activeTechObj.userHighScore}</span>
                            </div>
                        )}
                        <div className="px-3 py-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-center">
                            <span className="text-[9px] text-[var(--foreground-muted)] block font-bold uppercase">Games</span>
                            <span className="text-xs font-black text-emerald-500">{availableGamesForSelection}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {activeTechObj && (
                            <button
                                type="button"
                                onClick={() => handleSelect(null)}
                                className="px-3 py-2 rounded-xl bg-[var(--muted-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] border border-[var(--card-border)] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title="Reset to all technologies"
                            >
                                <X size={13} />
                                <span className="hidden sm:inline">Clear</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleExploreGames}
                            className="px-4 py-2 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                            <Gamepad2 size={14} />
                            <span>Explore Games</span>
                            <ArrowDown size={13} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TechnologyCategoriesSection;
