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
    Keyboard
} from 'lucide-react';
import { toast } from 'react-toastify';
import gameService from '../../../services/gameService';
import GameArtwork from '../../games/components/GameArtwork';

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

export const AdminGamesManagement = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [formData, setFormData] = useState({
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
    const [isSaving, setIsSaving] = useState(false);

    const fetchGames = useCallback(async () => {
        setLoading(true);
        try {
            const res = await gameService.adminGetGames();
            if (res.success) {
                setGames(res.data || []);
            }
        } catch (err) {
            console.error('Failed to load admin games:', err);
            toast.error('Failed to load games list.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    // Open Modal for Add
    const handleOpenAdd = () => {
        setEditingGame(null);
        setFormData({
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
        setIsModalOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEdit = (game) => {
        setEditingGame(game);
        setFormData({
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
        setIsModalOpen(true);
    };

    // Save Game (Create or Update)
    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Game title is required.');
            return;
        }

        setIsSaving(true);
        try {
            if (editingGame) {
                const res = await gameService.adminUpdateGame(editingGame.id || editingGame.slug, formData);
                if (res.success) {
                    toast.success('Game updated successfully!');
                    setIsModalOpen(false);
                    fetchGames();
                }
            } else {
                const res = await gameService.adminCreateGame(formData);
                if (res.success) {
                    toast.success('New game created successfully!');
                    setIsModalOpen(false);
                    fetchGames();
                }
            }
        } catch (err) {
            console.error('Save game failed:', err);
            toast.error(err.response?.data?.message || 'Failed to save game.');
        } finally {
            setIsSaving(false);
        }
    };

    // Toggle Publish
    const handleTogglePublish = async (game) => {
        try {
            const res = await gameService.adminTogglePublish(game.id || game.slug);
            if (res.success) {
                toast.success(res.message);
                setGames(prev =>
                    prev.map(g => (g.slug === game.slug ? { ...g, isPublished: res.data.isPublished } : g))
                );
            }
        } catch (err) {
            toast.error('Failed to toggle publish status.');
        }
    };

    // Toggle Featured
    const handleToggleFeature = async (game) => {
        try {
            const res = await gameService.adminToggleFeature(game.id || game.slug);
            if (res.success) {
                toast.success(res.message);
                setGames(prev =>
                    prev.map(g => (g.slug === game.slug ? { ...g, isFeatured: res.data.isFeatured } : g))
                );
            }
        } catch (err) {
            toast.error('Failed to toggle featured status.');
        }
    };

    // Delete Game
    const handleDelete = async (game) => {
        if (!window.confirm(`Are you sure you want to delete "${game.title}"?`)) return;

        try {
            const res = await gameService.adminDeleteGame(game.id || game.slug);
            if (res.success) {
                toast.success('Game removed.');
                setGames(prev => prev.filter(g => g.slug !== game.slug));
            }
        } catch (err) {
            toast.error('Failed to delete game.');
        }
    };

    // Reseed Default Games
    const handleReseed = async () => {
        if (!window.confirm('Reset/Reseed games to default 14 Coding & Typing catalog?')) return;
        try {
            const res = await gameService.adminSeedGames();
            if (res.success) {
                toast.success('Coding & Typing games catalog refreshed!');
                fetchGames();
            }
        } catch (err) {
            toast.error('Failed to seed games.');
        }
    };

    const filteredGames = games.filter(g => {
        if (selectedCategory !== 'All' && g.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q) || g.slug.includes(q);
        }
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
                <div>
                    <h2 className="text-lg font-black flex items-center gap-2">
                        <Gamepad2 className="text-emerald-500" size={22} />
                        Coding & Typing Games Management
                    </h2>
                    <p className="text-xs text-[var(--foreground-muted)]">
                        Manage 14 interactive coding & typing challenges, assign difficulty levels, and toggle featured daily quests.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleReseed}
                        className="px-3.5 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground-secondary)] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Reseed Default 14 Games"
                    >
                        <RotateCcw size={14} /> Reset Seed
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="px-4 py-2 rounded-xl bg-[#193D35] dark:bg-emerald-500 hover:bg-[#193D35]/90 text-white dark:text-stone-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus size={16} /> Add Game
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <span className="text-[10px] font-bold uppercase text-[var(--foreground-muted)] block">Total Games</span>
                    <span className="text-xl font-black text-emerald-500">{games.length}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <span className="text-[10px] font-bold uppercase text-[var(--foreground-muted)] block">Published</span>
                    <span className="text-xl font-black text-cyan-500">{games.filter(g => g.isPublished).length}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <span className="text-[10px] font-bold uppercase text-[var(--foreground-muted)] block">Featured Quests</span>
                    <span className="text-xl font-black text-amber-500">{games.filter(g => g.isFeatured).length}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <span className="text-[10px] font-bold uppercase text-[var(--foreground-muted)] block">Total Plays</span>
                    <span className="text-xl font-black text-purple-500">
                        {games.reduce((acc, g) => acc + (g.playsCount || 0), 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === 'All'
                                ? 'bg-[#193D35] text-white'
                                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                        }`}
                    >
                        All Categories ({games.length})
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                selectedCategory === cat
                                    ? 'bg-[#193D35] text-white'
                                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            {cat} ({games.filter(g => g.category === cat).length})
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                    <input
                        type="text"
                        placeholder="Search games..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] focus:outline-hidden"
                    />
                </div>
            </div>

            {/* Games Table List */}
            <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden shadow-xs">
                {loading ? (
                    <div className="p-8 text-center text-xs text-[var(--foreground-muted)] animate-pulse">
                        Loading games repository...
                    </div>
                ) : filteredGames.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--foreground-muted)]">
                        No games match the selected filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[var(--muted-bg)] border-b border-[var(--card-border)] text-[var(--foreground-muted)] uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="py-3 px-4">Game</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Difficulty</th>
                                    <th className="py-3 px-4">Badge</th>
                                    <th className="py-3 px-4">Card Size</th>
                                    <th className="py-3 px-4">Plays</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]">
                                {filteredGames.map((game) => (
                                    <tr key={game.id || game.slug} className="hover:bg-[var(--muted-bg)]/50 transition-colors">
                                        {/* Game Info */}
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-9 rounded-lg overflow-hidden border border-[var(--card-border)] shrink-0">
                                                    <GameArtwork slug={game.slug} title={game.title} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[var(--foreground)]">{game.title}</div>
                                                    <div className="text-[10px] font-mono text-[var(--foreground-muted)]">/{game.slug}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="py-3 px-4 font-semibold text-[var(--foreground-secondary)]">
                                            {game.category}
                                        </td>

                                        {/* Difficulty */}
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--muted-bg)] text-[var(--foreground-secondary)]">
                                                {game.difficulty || 'All Levels'}
                                            </span>
                                        </td>

                                        {/* Badge */}
                                        <td className="py-3 px-4">
                                            {game.badge ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                    {game.badge}
                                                </span>
                                            ) : (
                                                <span className="text-[var(--foreground-muted)]">—</span>
                                            )}
                                        </td>

                                        {/* Card Size */}
                                        <td className="py-3 px-4 text-[var(--foreground-muted)] uppercase text-[10px] font-bold">
                                            {game.cardSize || 'medium'}
                                        </td>

                                        {/* Plays */}
                                        <td className="py-3 px-4 font-mono font-semibold">
                                            {(game.playsCount || 0).toLocaleString()}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3 px-4 text-center">
                                            <div className="inline-flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleTogglePublish(game)}
                                                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                                        game.isPublished
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : 'bg-stone-500/20 text-stone-400'
                                                    }`}
                                                    title={game.isPublished ? "Unpublish game" : "Publish game"}
                                                >
                                                    {game.isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleFeature(game)}
                                                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                                        game.isFeatured
                                                            ? 'bg-amber-500/20 text-amber-400'
                                                            : 'bg-stone-500/20 text-stone-400'
                                                    }`}
                                                    title={game.isFeatured ? "Remove daily spotlight" : "Set daily spotlight"}
                                                >
                                                    <Flame size={13} className={game.isFeatured ? "fill-amber-400" : ""} />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleOpenEdit(game)}
                                                    className="p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] transition-colors cursor-pointer"
                                                    title="Edit game"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(game)}
                                                    className="p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-red-500/20 text-[var(--foreground-muted)] hover:text-red-500 transition-colors cursor-pointer"
                                                    title="Delete game"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Game Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-4">
                            <h3 className="text-base font-black flex items-center gap-2">
                                <Gamepad2 size={18} className="text-emerald-500" />
                                {editingGame ? 'Edit Game' : 'Add New Game'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-xl bg-[var(--muted-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Game Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Code Puzzle"
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">URL Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="e.g. code-puzzle"
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    >
                                        {DIFFICULTIES.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Card Size (Bento)</label>
                                    <select
                                        value={formData.cardSize}
                                        onChange={(e) => setFormData({ ...formData, cardSize: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    >
                                        {CARD_SIZES.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Badge Tag</label>
                                    <select
                                        value={formData.badge}
                                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    >
                                        {BADGES.map(b => (
                                            <option key={b} value={b}>{b || 'None'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Short Description *</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">How to Play Instructions</label>
                                <textarea
                                    rows={3}
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                />
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                        className="rounded text-emerald-500"
                                    />
                                    <span className="font-bold text-[var(--foreground)]">Published & Playable</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="rounded text-amber-500"
                                    />
                                    <span className="font-bold text-[var(--foreground)]">Daily Featured Spotlight</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] text-[var(--foreground)] font-bold hover:bg-[var(--card-border)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                                >
                                    <Save size={14} /> {isSaving ? 'Saving...' : 'Save Game'}
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
