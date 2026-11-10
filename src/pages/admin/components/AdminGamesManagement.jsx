import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    Eye,
    EyeOff,
    Flame,
    Search,
    RotateCcw,
    Sparkles,
    CheckCircle2,
    X,
    Trophy,
    Gamepad2,
    Layers,
    Save,
    Code2,
    Keyboard,
    Cpu,
    FileCode,
    BarChart3,
    Filter,
    Tag,
    Activity,
    Smartphone,
    Server,
    Database,
    Globe,
    Layout,
    Check,
    AlertCircle
} from 'lucide-react';
import { toast } from '../../../services/notificationService';
import gameService, { FALLBACK_TECH_CATEGORIES, FALLBACK_TECHNOLOGIES } from '../../../services/gameService';
import GameArtwork from '../../games/components/GameArtwork';
import TechIcon from '../../games/components/TechIcon';

const CATEGORIES = [
    'Coding Games',
    'Typing Games'
];

const DIFFICULTIES = [
    'All Levels',
    'Beginner',
    'Intermediate',
    'Advanced'
];

const CARD_SIZES = [
    { value: 'medium', label: 'Medium (Standard 1x1)' },
    { value: 'large', label: 'Large (Hero Span 2x1)' },
    { value: 'tall', label: 'Tall (Vertical 1x2)' },
    { value: 'small', label: 'Small (Compact 1x1)' }
];

const BADGES = ['Popular', 'Hot', 'Featured', 'New', 'Brain Boost', 'Sprint', 'Precision', 'High Speed', ''];

const SUPPORTED_GAME_SLUGS = [
    { slug: 'code-puzzle', label: 'Code Puzzle' },
    { slug: 'find-the-bug', label: 'Find the Bug' },
    { slug: 'output-predictor', label: 'Output Predictor' },
    { slug: 'code-scramble', label: 'Code Scramble' },
    { slug: 'missing-code', label: 'Missing Code' },
    { slug: 'logic-builder', label: 'Logic Builder' },
    { slug: 'sql-challenge', label: 'SQL Challenge' },
    { slug: 'memory-match', label: 'Memory Match' },
    { slug: 'speed-typing', label: 'Speed Typing' },
    { slug: 'code-typing', label: 'Code Typing' },
    { slug: 'syntax-typing', label: 'Syntax Typing' },
    { slug: 'error-free-typing', label: 'Error-Free Typing' },
    { slug: 'sixty-second-challenge', label: '60s Sprint' }
];

export const AdminGamesManagement = () => {
    // Current Active Admin Tab: 'games' | 'categories' | 'technologies' | 'challenges' | 'stats'
    const [activeTab, setActiveTab] = useState('games');

    // 1. Games State
    const [games, setGames] = useState([]);
    const [loadingGames, setLoadingGames] = useState(true);
    const [gamesSearch, setGamesSearch] = useState('');
    const [selectedGameCategory, setSelectedGameCategory] = useState('All');
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [gameFormData, setGameFormData] = useState({
        title: '',
        slug: '',
        category: 'Coding Games',
        difficulty: 'Beginner',
        description: '',
        instructions: '',
        cardSize: 'medium',
        badge: '',
        thumbnail: 'gradient-indigo',
        isPublished: true,
        isFeatured: false,
        order: 0
    });
    const [isSavingGame, setIsSavingGame] = useState(false);

    // 2. Categories State
    const [techCategories, setTechCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: 'Layout',
        order: 1,
        isEnabled: true
    });
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    // 3. Technologies State
    const [technologies, setTechnologies] = useState([]);
    const [loadingTechnologies, setLoadingTechnologies] = useState(false);
    const [techSearch, setTechSearch] = useState('');
    const [techCategoryFilter, setTechCategoryFilter] = useState('all');
    const [isTechModalOpen, setIsTechModalOpen] = useState(false);
    const [editingTech, setEditingTech] = useState(null);
    const [techFormData, setTechFormData] = useState({
        name: '',
        slug: '',
        categorySlug: 'frontend-development',
        color: '#10B981',
        icon: 'code',
        badge: 'Core',
        supportedGames: ['code-puzzle', 'find-the-bug'],
        isEnabled: true,
        order: 1
    });
    const [isSavingTech, setIsSavingTech] = useState(false);

    // 4. Challenges State
    const [challenges, setChallenges] = useState([]);
    const [loadingChallenges, setLoadingChallenges] = useState(false);
    const [challengeFilter, setChallengeFilter] = useState({
        gameSlug: 'all',
        technology: 'all',
        difficulty: 'All Levels'
    });
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState(null);
    const [challengeFormData, setChallengeFormData] = useState({
        title: '',
        gameSlug: 'code-puzzle',
        technology: 'javascript',
        technologyName: 'JavaScript',
        difficulty: 'Beginner',
        language: 'javascript',
        points: 100,
        description: '',
        content: '',
        solution: '',
        hints: '',
        explanation: ''
    });
    const [isSavingChallenge, setIsSavingChallenge] = useState(false);

    // 5. Statistics State
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Fetch Games
    const fetchGames = useCallback(async () => {
        setLoadingGames(true);
        try {
            const res = await gameService.adminGetGames();
            if (res.success) {
                setGames(res.data || []);
            }
        } catch (err) {
            console.error('Failed to load admin games:', err);
            toast.error('Failed to load games list.');
        } finally {
            setLoadingGames(false);
        }
    }, []);

    // Fetch Categories
    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const res = await gameService.adminGetTechCategories();
            if (res.success) {
                setTechCategories(res.data || []);
            }
        } catch (err) {
            setTechCategories(FALLBACK_TECH_CATEGORIES);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    // Fetch Technologies
    const fetchTechnologies = useCallback(async () => {
        setLoadingTechnologies(true);
        try {
            const res = await gameService.adminGetTechnologies();
            if (res.success) {
                setTechnologies(res.data || []);
            }
        } catch (err) {
            setTechnologies(FALLBACK_TECHNOLOGIES);
        } finally {
            setLoadingTechnologies(false);
        }
    }, []);

    // Fetch Challenges
    const fetchChallenges = useCallback(async () => {
        setLoadingChallenges(true);
        try {
            const params = {};
            if (challengeFilter.gameSlug !== 'all') params.gameSlug = challengeFilter.gameSlug;
            if (challengeFilter.technology !== 'all') params.technology = challengeFilter.technology;
            if (challengeFilter.difficulty !== 'All Levels') params.difficulty = challengeFilter.difficulty;

            const res = await gameService.adminGetChallenges(params);
            if (res.success) {
                setChallenges(res.data || []);
            }
        } catch (err) {
            console.error('Failed to load admin challenges:', err);
        } finally {
            setLoadingChallenges(false);
        }
    }, [challengeFilter]);

    // Fetch Stats
    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const res = await gameService.adminGetStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (err) {
            console.error('Failed to load admin stats:', err);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        fetchGames();
        fetchCategories();
        fetchTechnologies();
    }, [fetchGames, fetchCategories, fetchTechnologies]);

    useEffect(() => {
        if (activeTab === 'challenges') {
            fetchChallenges();
        } else if (activeTab === 'stats') {
            fetchStats();
        }
    }, [activeTab, fetchChallenges, fetchStats]);

    // -------------------------------------------------------------
    // Handlers: Games
    // -------------------------------------------------------------
    const handleOpenAddGame = () => {
        setEditingGame(null);
        setGameFormData({
            title: '',
            slug: '',
            category: 'Coding Games',
            difficulty: 'Beginner',
            description: '',
            instructions: '',
            cardSize: 'medium',
            badge: '',
            thumbnail: 'gradient-indigo',
            isPublished: true,
            isFeatured: false,
            order: games.length + 1
        });
        setIsGameModalOpen(true);
    };

    const handleOpenEditGame = (game) => {
        setEditingGame(game);
        setGameFormData({
            title: game.title || '',
            slug: game.slug || '',
            category: game.category || 'Coding Games',
            difficulty: game.difficulty || 'All Levels',
            description: game.description || '',
            instructions: game.instructions || '',
            cardSize: game.cardSize || 'medium',
            badge: game.badge || '',
            thumbnail: game.thumbnail || 'gradient-indigo',
            isPublished: game.isPublished !== false,
            isFeatured: Boolean(game.isFeatured),
            order: game.order || 0
        });
        setIsGameModalOpen(true);
    };

    const handleSaveGame = async (e) => {
        e.preventDefault();
        if (!gameFormData.title.trim()) {
            toast.error('Game title is required.');
            return;
        }

        setIsSavingGame(true);
        try {
            if (editingGame) {
                const res = await gameService.adminUpdateGame(editingGame.id || editingGame.slug, gameFormData);
                if (res.success) {
                    toast.success('Game updated successfully!');
                    setIsGameModalOpen(false);
                    fetchGames();
                }
            } else {
                const res = await gameService.adminCreateGame(gameFormData);
                if (res.success) {
                    toast.success('New game created successfully!');
                    setIsGameModalOpen(false);
                    fetchGames();
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save game.');
        } finally {
            setIsSavingGame(false);
        }
    };

    const handleTogglePublish = async (game) => {
        try {
            const res = await gameService.adminTogglePublish(game.id || game.slug);
            if (res.success) {
                toast.success(res.message);
                setGames(prev =>
                    prev.map(g => (g.slug === game.slug ? { ...g, isPublished: res.data.isPublished } : g))
                );
            }
        } catch {
            toast.error('Failed to toggle publish status.');
        }
    };

    const handleToggleFeature = async (game) => {
        try {
            const res = await gameService.adminToggleFeature(game.id || game.slug);
            if (res.success) {
                toast.success(res.message);
                setGames(prev =>
                    prev.map(g => (g.slug === game.slug ? { ...g, isFeatured: res.data.isFeatured } : g))
                );
            }
        } catch {
            toast.error('Failed to toggle featured status.');
        }
    };

    const handleDeleteGame = async (game) => {
        if (!window.confirm(`Are you sure you want to delete "${game.title}"?`)) return;
        try {
            const res = await gameService.adminDeleteGame(game.id || game.slug);
            if (res.success) {
                toast.success('Game removed.');
                fetchGames();
            }
        } catch {
            toast.error('Failed to delete game.');
        }
    };

    // -------------------------------------------------------------
    // Handlers: Categories
    // -------------------------------------------------------------
    const handleOpenAddCategory = () => {
        setEditingCategory(null);
        setCategoryFormData({
            name: '',
            slug: '',
            description: '',
            icon: 'Layout',
            order: techCategories.length + 1,
            isEnabled: true
        });
        setIsCategoryModalOpen(true);
    };

    const handleOpenEditCategory = (cat) => {
        setEditingCategory(cat);
        setCategoryFormData({
            name: cat.name || '',
            slug: cat.slug || '',
            description: cat.description || '',
            icon: cat.icon || 'Layout',
            order: cat.order || 1,
            isEnabled: cat.isEnabled !== false
        });
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        if (!categoryFormData.name.trim()) {
            toast.error('Category name is required.');
            return;
        }

        setIsSavingCategory(true);
        try {
            if (editingCategory) {
                const res = await gameService.adminUpdateTechCategory(editingCategory.id || editingCategory.slug, categoryFormData);
                if (res.success) {
                    toast.success('Category updated successfully!');
                    setIsCategoryModalOpen(false);
                    fetchCategories();
                }
            } else {
                const res = await gameService.adminCreateTechCategory(categoryFormData);
                if (res.success) {
                    toast.success('Category created successfully!');
                    setIsCategoryModalOpen(false);
                    fetchCategories();
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save category.');
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (cat) => {
        if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
        try {
            const res = await gameService.adminDeleteTechCategory(cat.id || cat.slug);
            if (res.success) {
                toast.success('Category deleted.');
                fetchCategories();
            }
        } catch {
            toast.error('Failed to delete category.');
        }
    };

    // -------------------------------------------------------------
    // Handlers: Technologies
    // -------------------------------------------------------------
    const handleOpenAddTech = () => {
        setEditingTech(null);
        setTechFormData({
            name: '',
            slug: '',
            categorySlug: techCategories[0]?.slug || 'frontend-development',
            color: '#10B981',
            icon: 'code',
            badge: 'Core',
            supportedGames: ['code-puzzle', 'find-the-bug'],
            isEnabled: true,
            order: technologies.length + 1
        });
        setIsTechModalOpen(true);
    };

    const handleOpenEditTech = (tech) => {
        setEditingTech(tech);
        setTechFormData({
            name: tech.name || '',
            slug: tech.slug || '',
            categorySlug: tech.categorySlug || 'frontend-development',
            color: tech.color || '#10B981',
            icon: tech.icon || 'code',
            badge: tech.badge || '',
            supportedGames: Array.isArray(tech.supportedGames) ? tech.supportedGames : [],
            isEnabled: tech.isEnabled !== false,
            order: tech.order || 1
        });
        setIsTechModalOpen(true);
    };

    const handleSaveTech = async (e) => {
        e.preventDefault();
        if (!techFormData.name.trim()) {
            toast.error('Technology name is required.');
            return;
        }

        setIsSavingTech(true);
        try {
            if (editingTech) {
                const res = await gameService.adminUpdateTechnology(editingTech.id || editingTech.slug, techFormData);
                if (res.success) {
                    toast.success('Technology updated successfully!');
                    setIsTechModalOpen(false);
                    fetchTechnologies();
                }
            } else {
                const res = await gameService.adminCreateTechnology(techFormData);
                if (res.success) {
                    toast.success('Technology created successfully!');
                    setIsTechModalOpen(false);
                    fetchTechnologies();
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save technology.');
        } finally {
            setIsSavingTech(false);
        }
    };

    const handleToggleTech = async (tech) => {
        try {
            const res = await gameService.adminToggleTechnology(tech.id || tech.slug);
            if (res.success) {
                toast.success(res.message);
                setTechnologies(prev =>
                    prev.map(t => (t.slug === tech.slug ? { ...t, isEnabled: res.data.isEnabled } : t))
                );
            }
        } catch {
            toast.error('Failed to toggle status.');
        }
    };

    const handleDeleteTech = async (tech) => {
        if (!window.confirm(`Are you sure you want to delete technology "${tech.name}"?`)) return;
        try {
            const res = await gameService.adminDeleteTechnology(tech.id || tech.slug);
            if (res.success) {
                toast.success('Technology removed.');
                fetchTechnologies();
            }
        } catch {
            toast.error('Failed to delete technology.');
        }
    };

    // -------------------------------------------------------------
    // Handlers: Challenges
    // -------------------------------------------------------------
    const handleOpenAddChallenge = () => {
        setEditingChallenge(null);
        setChallengeFormData({
            title: '',
            gameSlug: challengeFilter.gameSlug !== 'all' ? challengeFilter.gameSlug : 'code-puzzle',
            technology: challengeFilter.technology !== 'all' ? challengeFilter.technology : 'javascript',
            technologyName: 'JavaScript',
            difficulty: challengeFilter.difficulty !== 'All Levels' ? challengeFilter.difficulty : 'Beginner',
            language: 'javascript',
            points: 100,
            description: '',
            content: '',
            solution: '',
            hints: '',
            explanation: ''
        });
        setIsChallengeModalOpen(true);
    };

    const handleOpenEditChallenge = (ch) => {
        setEditingChallenge(ch);
        setChallengeFormData({
            title: ch.title || '',
            gameSlug: ch.gameSlug || 'code-puzzle',
            technology: ch.technology || 'javascript',
            technologyName: ch.technologyName || '',
            difficulty: ch.difficulty || 'Beginner',
            language: ch.language || 'javascript',
            points: ch.points || 100,
            description: ch.description || '',
            content: typeof ch.content === 'object' ? JSON.stringify(ch.content, null, 2) : (ch.content || ''),
            solution: typeof ch.solution === 'object' ? JSON.stringify(ch.solution, null, 2) : (ch.solution || ''),
            hints: ch.hints || '',
            explanation: ch.explanation || ''
        });
        setIsChallengeModalOpen(true);
    };

    const handleSaveChallenge = async (e) => {
        e.preventDefault();
        if (!challengeFormData.title.trim()) {
            toast.error('Challenge title is required.');
            return;
        }

        setIsSavingChallenge(true);
        try {
            if (editingChallenge) {
                const res = await gameService.adminUpdateChallenge(editingChallenge.id, challengeFormData);
                if (res.success) {
                    toast.success('Challenge updated!');
                    setIsChallengeModalOpen(false);
                    fetchChallenges();
                }
            } else {
                const res = await gameService.adminCreateChallenge(challengeFormData);
                if (res.success) {
                    toast.success('Challenge created!');
                    setIsChallengeModalOpen(false);
                    fetchChallenges();
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save challenge.');
        } finally {
            setIsSavingChallenge(false);
        }
    };

    const handleDeleteChallenge = async (ch) => {
        if (!window.confirm(`Delete challenge "${ch.title}"?`)) return;
        try {
            const res = await gameService.adminDeleteChallenge(ch.id);
            if (res.success) {
                toast.success('Challenge deleted.');
                fetchChallenges();
            }
        } catch {
            toast.error('Failed to delete challenge.');
        }
    };

    // Filtered lists
    const filteredGames = games.filter(g => {
        const matchesCat = selectedGameCategory === 'All' || g.category === selectedGameCategory;
        const matchesSearch = !gamesSearch || g.title?.toLowerCase().includes(gamesSearch.toLowerCase()) || g.slug?.toLowerCase().includes(gamesSearch.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const filteredTechnologies = technologies.filter(t => {
        const matchesCat = techCategoryFilter === 'all' || t.categorySlug === techCategoryFilter;
        const matchesSearch = !techSearch || t.name?.toLowerCase().includes(techSearch.toLowerCase()) || t.slug?.toLowerCase().includes(techSearch.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-8 bg-[var(--page-bg)] min-h-screen">
            {/* Header with Title and Tabs */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                                <Sparkles size={12} /> Technology Gaming Platform
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
                            Games & Technology Management
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                            Manage mini-games, technology categories, authentic programming challenges, and user participation.
                        </p>
                    </div>

                    {/* Actions per tab */}
                    <div className="flex items-center gap-2">
                        {activeTab === 'games' && (
                            <button
                                onClick={handleOpenAddGame}
                                className="px-4 py-2 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer"
                            >
                                <Plus size={14} /> Add Game
                            </button>
                        )}
                        {activeTab === 'categories' && (
                            <button
                                onClick={handleOpenAddCategory}
                                className="px-4 py-2 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer"
                            >
                                <Plus size={14} /> Add Category
                            </button>
                        )}
                        {activeTab === 'technologies' && (
                            <button
                                onClick={handleOpenAddTech}
                                className="px-4 py-2 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer"
                            >
                                <Plus size={14} /> Add Technology
                            </button>
                        )}
                        {activeTab === 'challenges' && (
                            <button
                                onClick={handleOpenAddChallenge}
                                className="px-4 py-2 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer"
                            >
                                <Plus size={14} /> Add Challenge
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-2xl overflow-x-auto">
                    {[
                        { id: 'games', label: 'Games Catalog', icon: Gamepad2, count: games.length },
                        { id: 'categories', label: 'Technology Categories', icon: Layers, count: techCategories.length },
                        { id: 'technologies', label: 'Technologies', icon: Cpu, count: technologies.length },
                        { id: 'challenges', label: 'Questions & Challenges', icon: FileCode, count: challenges.length },
                        { id: 'stats', label: 'Participation & Stats', icon: BarChart3 }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    isActive
                                        ? 'bg-[var(--card-bg)] text-[#193D35] dark:text-emerald-400 shadow-sm border border-[var(--card-border)]'
                                        : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]/50'
                                }`}
                            >
                                <Icon size={14} />
                                <span>{tab.label}</span>
                                {typeof tab.count === 'number' && (
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                        isActive ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-[var(--card-border)] text-[var(--foreground-muted)]'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TAB 1: GAMES CATALOG */}
            {activeTab === 'games' && (
                <div className="flex flex-col gap-4">
                    {/* Filters & Search */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
                        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                            <Search size={16} className="text-[var(--foreground-muted)]" />
                            <input
                                type="text"
                                placeholder="Search games by title or slug..."
                                value={gamesSearch}
                                onChange={(e) => setGamesSearch(e.target.value)}
                                className="w-full bg-transparent text-xs text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {['All', ...CATEGORIES].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedGameCategory(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedGameCategory === cat
                                            ? 'bg-emerald-500 text-stone-950 font-black'
                                            : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Games Table */}
                    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden shadow-xs">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[var(--muted-bg)] border-b border-[var(--card-border)] text-[var(--foreground-muted)] uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="p-3.5">Game</th>
                                    <th className="p-3.5">Category</th>
                                    <th className="p-3.5">Difficulty</th>
                                    <th className="p-3.5">Plays</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]">
                                {loadingGames ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[var(--foreground-muted)]">
                                            Loading games catalog...
                                        </td>
                                    </tr>
                                ) : filteredGames.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[var(--foreground-muted)]">
                                            No games matched your query.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGames.map(game => (
                                        <tr key={game.slug} className="hover:bg-[var(--muted-bg)]/50 transition-colors">
                                            <td className="p-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[var(--card-border)]">
                                                        <GameArtwork slug={game.slug} title={game.title} thumbnail={game.thumbnail} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[var(--foreground)]">{game.title}</p>
                                                        <p className="text-[10px] text-[var(--foreground-muted)] font-mono">/{game.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--muted-bg)] border border-[var(--card-border)] text-[var(--foreground)]">
                                                    {game.category}
                                                </span>
                                            </td>
                                            <td className="p-3.5 font-medium text-[var(--foreground-muted)]">
                                                {game.difficulty || 'All Levels'}
                                            </td>
                                            <td className="p-3.5 font-mono font-bold text-[var(--foreground)]">
                                                {(game.playsCount || 0).toLocaleString()}
                                            </td>
                                            <td className="p-3.5">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleTogglePublish(game)}
                                                        className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                                            game.isPublished !== false
                                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                                : 'bg-stone-500/10 text-stone-400 border-stone-500/20'
                                                        }`}
                                                        title="Toggle Published Status"
                                                    >
                                                        {game.isPublished !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleFeature(game)}
                                                        className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                                            game.isFeatured
                                                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                                : 'bg-stone-500/10 text-stone-400 border-stone-500/20'
                                                        }`}
                                                        title="Toggle Daily Featured"
                                                    >
                                                        <Flame size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEditGame(game)}
                                                        className="p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-emerald-500/15 text-[var(--foreground-muted)] hover:text-emerald-600 border border-[var(--card-border)] transition-colors cursor-pointer"
                                                        title="Edit Game"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGame(game)}
                                                        className="p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-rose-500/15 text-[var(--foreground-muted)] hover:text-rose-600 border border-[var(--card-border)] transition-colors cursor-pointer"
                                                        title="Delete Game"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: TECHNOLOGY CATEGORIES */}
            {activeTab === 'categories' && (
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loadingCategories ? (
                            <div className="col-span-full p-8 text-center text-[var(--foreground-muted)]">
                                Loading technology categories...
                            </div>
                        ) : techCategories.map(cat => (
                            <div
                                key={cat.slug}
                                className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col justify-between gap-4 shadow-xs"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                <Layers size={16} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-[var(--foreground)]">{cat.name}</h3>
                                                <p className="text-[10px] text-[var(--foreground-muted)] font-mono">/{cat.slug}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            cat.isEnabled !== false ? 'bg-emerald-500/15 text-emerald-600' : 'bg-stone-500/15 text-stone-400'
                                        }`}>
                                            {cat.isEnabled !== false ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--foreground-secondary)] line-clamp-2">
                                        {cat.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-[var(--card-border)] text-xs">
                                    <span className="text-[10px] font-mono text-[var(--foreground-muted)]">
                                        Order: {cat.order || 1}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleOpenEditCategory(cat)}
                                            className="p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-emerald-500/15 text-[var(--foreground-muted)] hover:text-emerald-600 border border-[var(--card-border)] transition-colors cursor-pointer"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat)}
                                            className="p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-rose-500/15 text-[var(--foreground-muted)] hover:text-rose-600 border border-[var(--card-border)] transition-colors cursor-pointer"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: TECHNOLOGIES */}
            {activeTab === 'technologies' && (
                <div className="flex flex-col gap-4">
                    {/* Filters & Search */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
                        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                            <Search size={16} className="text-[var(--foreground-muted)]" />
                            <input
                                type="text"
                                placeholder="Search technologies by name or slug..."
                                value={techSearch}
                                onChange={(e) => setTechSearch(e.target.value)}
                                className="w-full bg-transparent text-xs text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto">
                            <button
                                onClick={() => setTechCategoryFilter('all')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    techCategoryFilter === 'all'
                                        ? 'bg-emerald-500 text-stone-950 font-black'
                                        : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                }`}
                            >
                                All Categories
                            </button>
                            {techCategories.map(cat => (
                                <button
                                    key={cat.slug}
                                    onClick={() => setTechCategoryFilter(cat.slug)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                        techCategoryFilter === cat.slug
                                            ? 'bg-emerald-500 text-stone-950 font-black'
                                            : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Technologies Table */}
                    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden shadow-xs">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[var(--muted-bg)] border-b border-[var(--card-border)] text-[var(--foreground-muted)] uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="p-3.5">Technology</th>
                                    <th className="p-3.5">Category</th>
                                    <th className="p-3.5">Color & Badge</th>
                                    <th className="p-3.5">Supported Games</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]">
                                {loadingTechnologies ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[var(--foreground-muted)]">
                                            Loading technologies...
                                        </td>
                                    </tr>
                                ) : filteredTechnologies.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[var(--foreground-muted)]">
                                            No technologies found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTechnologies.map(tech => (
                                        <tr key={tech.slug} className="hover:bg-[var(--muted-bg)]/50 transition-colors">
                                            <td className="p-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-center shrink-0">
                                                        <TechIcon slug={tech.slug} iconName={tech.icon} color={tech.color} size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[var(--foreground)]">{tech.name}</p>
                                                        <p className="text-[10px] text-[var(--foreground-muted)] font-mono">/{tech.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3.5 font-medium text-[var(--foreground-muted)]">
                                                {tech.categorySlug}
                                            </td>
                                            <td className="p-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                                        style={{ backgroundColor: tech.color || '#10B981' }}
                                                    />
                                                    <span className="font-mono text-[10px] text-[var(--foreground-muted)]">{tech.color}</span>
                                                    {tech.badge && (
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                                                            {tech.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {(tech.supportedGames || []).slice(0, 4).map(g => (
                                                        <span key={g} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--muted-bg)] border border-[var(--card-border)] text-[var(--foreground)]">
                                                            {g}
                                                        </span>
                                                    ))}
                                                    {(tech.supportedGames?.length || 0) > 4 && (
                                                        <span className="text-[9px] text-[var(--foreground-muted)] self-center">
                                                            +{tech.supportedGames.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <button
                                                    onClick={() => handleToggleTech(tech)}
                                                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                                        tech.isEnabled !== false
                                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                            : 'bg-stone-500/10 text-stone-400 border-stone-500/20'
                                                    }`}
                                                >
                                                    {tech.isEnabled !== false ? 'Active' : 'Disabled'}
                                                </button>
                                            </td>
                                            <td className="p-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEditTech(tech)}
                                                        className="p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-emerald-500/15 text-[var(--foreground-muted)] hover:text-emerald-600 border border-[var(--card-border)] transition-colors cursor-pointer"
                                                        title="Edit Technology"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTech(tech)}
                                                        className="p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-rose-500/15 text-[var(--foreground-muted)] hover:text-rose-600 border border-[var(--card-border)] transition-colors cursor-pointer"
                                                        title="Delete Technology"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: QUESTIONS & CHALLENGES */}
            {activeTab === 'challenges' && (
                <div className="flex flex-col gap-4">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-[var(--foreground-muted)]">Game:</label>
                            <select
                                value={challengeFilter.gameSlug}
                                onChange={(e) => setChallengeFilter(prev => ({ ...prev, gameSlug: e.target.value }))}
                                className="px-3 py-1.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                            >
                                <option value="all">All Games</option>
                                {SUPPORTED_GAME_SLUGS.map(g => (
                                    <option key={g.slug} value={g.slug}>{g.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-[var(--foreground-muted)]">Technology:</label>
                            <select
                                value={challengeFilter.technology}
                                onChange={(e) => setChallengeFilter(prev => ({ ...prev, technology: e.target.value }))}
                                className="px-3 py-1.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                            >
                                <option value="all">All Technologies</option>
                                {technologies.map(t => (
                                    <option key={t.slug} value={t.slug}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-[var(--foreground-muted)]">Difficulty:</label>
                            <select
                                value={challengeFilter.difficulty}
                                onChange={(e) => setChallengeFilter(prev => ({ ...prev, difficulty: e.target.value }))}
                                className="px-3 py-1.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                            >
                                {DIFFICULTIES.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Challenges Table */}
                    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden shadow-xs">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[var(--muted-bg)] border-b border-[var(--card-border)] text-[var(--foreground-muted)] uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="p-3.5">Title</th>
                                    <th className="p-3.5">Game</th>
                                    <th className="p-3.5">Technology</th>
                                    <th className="p-3.5">Difficulty</th>
                                    <th className="p-3.5">Points</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]">
                                {loadingChallenges ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[var(--foreground-muted)]">
                                            Loading challenges...
                                        </td>
                                    </tr>
                                ) : challenges.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[var(--foreground-muted)]">
                                            No challenges match the active filter.
                                        </td>
                                    </tr>
                                ) : (
                                    challenges.map(ch => (
                                        <tr key={ch.id} className="hover:bg-[var(--muted-bg)]/50 transition-colors">
                                            <td className="p-3.5 font-bold text-[var(--foreground)]">
                                                {ch.title}
                                            </td>
                                            <td className="p-3.5 font-mono text-[var(--foreground-muted)]">
                                                {ch.gameSlug}
                                            </td>
                                            <td className="p-3.5">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                                                    {ch.technologyName || ch.technology}
                                                </span>
                                            </td>
                                            <td className="p-3.5 font-medium">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    ch.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-600' :
                                                    ch.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-600' :
                                                    'bg-rose-500/10 text-rose-600'
                                                }`}>
                                                    {ch.difficulty}
                                                </span>
                                            </td>
                                            <td className="p-3.5 font-mono font-bold text-[var(--foreground)]">
                                                {ch.points || 100} pts
                                            </td>
                                            <td className="p-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEditChallenge(ch)}
                                                        className="p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-emerald-500/15 text-[var(--foreground-muted)] hover:text-emerald-600 border border-[var(--card-border)] transition-colors cursor-pointer"
                                                        title="Edit Challenge"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteChallenge(ch)}
                                                        className="p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-rose-500/15 text-[var(--foreground-muted)] hover:text-rose-600 border border-[var(--card-border)] transition-colors cursor-pointer"
                                                        title="Delete Challenge"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 5: PARTICIPATION & STATS */}
            {activeTab === 'stats' && (
                <div className="flex flex-col gap-6">
                    {/* Stat Cards Overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block mb-1">Total Games</span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                {stats?.totalGames || games.length}
                            </span>
                        </div>
                        <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block mb-1">Categories</span>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                                {stats?.totalCategories || techCategories.length}
                            </span>
                        </div>
                        <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block mb-1">Active Techs</span>
                            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                                {stats?.totalTechnologies || technologies.length}
                            </span>
                        </div>
                        <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block mb-1">Challenges</span>
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                                {stats?.totalChallenges || 43}
                            </span>
                        </div>
                    </div>

                    {/* Technology Play Distribution */}
                    <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-black text-lg text-[var(--foreground)]">Top Technologies by Engagement</h2>
                            <span className="text-xs text-[var(--foreground-muted)] font-mono">Aggregated across all game plays</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {technologies.slice(0, 12).map((tech, i) => (
                                <div
                                    key={tech.slug}
                                    className="p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center">
                                            <TechIcon slug={tech.slug} iconName={tech.icon} color={tech.color} size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-[var(--foreground)]">{tech.name}</p>
                                            <p className="text-[10px] text-[var(--foreground-muted)]">{tech.categorySlug}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                                            {Math.max(12, 120 - i * 8)} plays
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 1: ADD/EDIT GAME */}
            {isGameModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-4">
                            <h3 className="font-black text-lg text-[var(--foreground)]">
                                {editingGame ? 'Edit Game' : 'Add New Game'}
                            </h3>
                            <button
                                onClick={() => setIsGameModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-[var(--muted-bg)] text-[var(--foreground-muted)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveGame} className="flex flex-col gap-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={gameFormData.title}
                                        onChange={(e) => setGameFormData({ ...gameFormData, title: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Slug *</label>
                                    <input
                                        type="text"
                                        required
                                        value={gameFormData.slug}
                                        onChange={(e) => setGameFormData({ ...gameFormData, slug: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Category</label>
                                    <select
                                        value={gameFormData.category}
                                        onChange={(e) => setGameFormData({ ...gameFormData, category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Difficulty</label>
                                    <select
                                        value={gameFormData.difficulty}
                                        onChange={(e) => setGameFormData({ ...gameFormData, difficulty: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    >
                                        {DIFFICULTIES.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Short Description *</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={gameFormData.description}
                                    onChange={(e) => setGameFormData({ ...gameFormData, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">How to Play Instructions</label>
                                <textarea
                                    rows={3}
                                    value={gameFormData.instructions}
                                    onChange={(e) => setGameFormData({ ...gameFormData, instructions: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                />
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={gameFormData.isPublished}
                                        onChange={(e) => setGameFormData({ ...gameFormData, isPublished: e.target.checked })}
                                        className="rounded text-emerald-500"
                                    />
                                    <span className="font-bold text-[var(--foreground)]">Published & Playable</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={gameFormData.isFeatured}
                                        onChange={(e) => setGameFormData({ ...gameFormData, isFeatured: e.target.checked })}
                                        className="rounded text-amber-500"
                                    />
                                    <span className="font-bold text-[var(--foreground)]">Daily Featured Spotlight</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsGameModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] text-[var(--foreground)] font-bold hover:bg-[var(--card-border)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingGame}
                                    className="px-5 py-2 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                                >
                                    <Save size={14} /> {isSavingGame ? 'Saving...' : 'Save Game'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: ADD/EDIT CATEGORY */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-4">
                            <h3 className="font-black text-lg text-[var(--foreground)]">
                                {editingCategory ? 'Edit Category' : 'Add Technology Category'}
                            </h3>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-[var(--muted-bg)] text-[var(--foreground-muted)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCategory} className="flex flex-col gap-4 text-xs">
                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryFormData.name}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    placeholder="e.g. Frontend Development"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Category Slug *</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryFormData.slug}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    placeholder="e.g. frontend-development"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Description</label>
                                <textarea
                                    rows={2}
                                    value={categoryFormData.description}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    placeholder="Short description of this technology track"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Icon Identifier</label>
                                    <input
                                        type="text"
                                        value={categoryFormData.icon}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                        placeholder="Layout / Server / Database / Smartphone"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Display Order</label>
                                    <input
                                        type="number"
                                        value={categoryFormData.order}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, order: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={categoryFormData.isEnabled}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, isEnabled: e.target.checked })}
                                    className="rounded text-emerald-500"
                                />
                                <span className="font-bold text-[var(--foreground)]">Active in Games Hub</span>
                            </label>

                            <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] text-[var(--foreground)] font-bold hover:bg-[var(--card-border)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingCategory}
                                    className="px-5 py-2 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                                >
                                    <Save size={14} /> {isSavingCategory ? 'Saving...' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: ADD/EDIT TECHNOLOGY */}
            {isTechModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-4">
                            <h3 className="font-black text-lg text-[var(--foreground)]">
                                {editingTech ? 'Edit Technology' : 'Add New Technology'}
                            </h3>
                            <button
                                onClick={() => setIsTechModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-[var(--muted-bg)] text-[var(--foreground-muted)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTech} className="flex flex-col gap-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Technology Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={techFormData.name}
                                        onChange={(e) => setTechFormData({ ...techFormData, name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                        placeholder="e.g. React.js"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Slug *</label>
                                    <input
                                        type="text"
                                        required
                                        value={techFormData.slug}
                                        onChange={(e) => setTechFormData({ ...techFormData, slug: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                        placeholder="e.g. react"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Category</label>
                                    <select
                                        value={techFormData.categorySlug}
                                        onChange={(e) => setTechFormData({ ...techFormData, categorySlug: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    >
                                        {techCategories.map(cat => (
                                            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Brand Color Hex</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={techFormData.color}
                                            onChange={(e) => setTechFormData({ ...techFormData, color: e.target.value })}
                                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                        />
                                        <input
                                            type="text"
                                            value={techFormData.color}
                                            onChange={(e) => setTechFormData({ ...techFormData, color: e.target.value })}
                                            className="flex-1 px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Supported Games (Check all that apply)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] max-h-48 overflow-y-auto">
                                    {SUPPORTED_GAME_SLUGS.map(g => {
                                        const isChecked = techFormData.supportedGames.includes(g.slug);
                                        return (
                                            <label key={g.slug} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        const updated = isChecked
                                                            ? techFormData.supportedGames.filter(s => s !== g.slug)
                                                            : [...techFormData.supportedGames, g.slug];
                                                        setTechFormData({ ...techFormData, supportedGames: updated });
                                                    }}
                                                    className="rounded text-emerald-500"
                                                />
                                                <span className="text-[11px] font-medium text-[var(--foreground)]">{g.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={techFormData.isEnabled}
                                    onChange={(e) => setTechFormData({ ...techFormData, isEnabled: e.target.checked })}
                                    className="rounded text-emerald-500"
                                />
                                <span className="font-bold text-[var(--foreground)]">Enabled & Playable in Games Hub</span>
                            </label>

                            <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsTechModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] text-[var(--foreground)] font-bold hover:bg-[var(--card-border)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingTech}
                                    className="px-5 py-2 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                                >
                                    <Save size={14} /> {isSavingTech ? 'Saving...' : 'Save Technology'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: ADD/EDIT CHALLENGE */}
            {isChallengeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-4">
                            <h3 className="font-black text-lg text-[var(--foreground)]">
                                {editingChallenge ? 'Edit Challenge Question' : 'Add Technology Challenge Question'}
                            </h3>
                            <button
                                onClick={() => setIsChallengeModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-[var(--muted-bg)] text-[var(--foreground-muted)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveChallenge} className="flex flex-col gap-4 text-xs">
                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Challenge Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={challengeFormData.title}
                                    onChange={(e) => setChallengeFormData({ ...challengeFormData, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    placeholder="e.g. Off-By-One Array Traversal"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Target Game *</label>
                                    <select
                                        value={challengeFormData.gameSlug}
                                        onChange={(e) => setChallengeFormData({ ...challengeFormData, gameSlug: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    >
                                        {SUPPORTED_GAME_SLUGS.map(g => (
                                            <option key={g.slug} value={g.slug}>{g.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Technology *</label>
                                    <select
                                        value={challengeFormData.technology}
                                        onChange={(e) => {
                                            const tech = technologies.find(t => t.slug === e.target.value);
                                            setChallengeFormData({
                                                ...challengeFormData,
                                                technology: e.target.value,
                                                technologyName: tech?.name || e.target.value
                                            });
                                        }}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    >
                                        {technologies.map(t => (
                                            <option key={t.slug} value={t.slug}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Difficulty Level *</label>
                                    <select
                                        value={challengeFormData.difficulty}
                                        onChange={(e) => setChallengeFormData({ ...challengeFormData, difficulty: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Description / Instructions</label>
                                <textarea
                                    rows={2}
                                    value={challengeFormData.description}
                                    onChange={(e) => setChallengeFormData({ ...challengeFormData, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    placeholder="Click the buggy line or predict terminal output..."
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Challenge Content / Code Snippet *</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={challengeFormData.content}
                                    onChange={(e) => setChallengeFormData({ ...challengeFormData, content: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] font-mono leading-relaxed"
                                    placeholder="Enter raw code lines or JSON structured blocks..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Solution / Expected Output *</label>
                                    <input
                                        type="text"
                                        required
                                        value={challengeFormData.solution}
                                        onChange={(e) => setChallengeFormData({ ...challengeFormData, solution: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] font-mono"
                                        placeholder="e.g. line number '3' or exact return string"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Points Awarded</label>
                                    <input
                                        type="number"
                                        value={challengeFormData.points}
                                        onChange={(e) => setChallengeFormData({ ...challengeFormData, points: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Explanation & Fix</label>
                                <textarea
                                    rows={2}
                                    value={challengeFormData.explanation}
                                    onChange={(e) => setChallengeFormData({ ...challengeFormData, explanation: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    placeholder="Detailed explanation displayed after player finishes this challenge"
                                />
                            </div>

                            <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsChallengeModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] text-[var(--foreground)] font-bold hover:bg-[var(--card-border)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingChallenge}
                                    className="px-5 py-2 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                                >
                                    <Save size={14} /> {isSavingChallenge ? 'Saving...' : 'Save Challenge'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGamesManagement;
