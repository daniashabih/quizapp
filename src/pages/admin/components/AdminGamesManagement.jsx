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
    Save
} from 'lucide-react';
import { toast } from 'react-toastify';
import gameService from '../../../services/gameService';
import GameArtwork from '../../games/components/GameArtwork';

const CATEGORIES = [
    'Puzzle Games',
    'Arcade Games',
    'Racing Games',
    'Sports Games',
    'Brain Games',
    'Adventure Games',
    'Casual Games'
];

const CARD_SIZES = [
    { value: 'medium', label: 'Medium (Standard 1x1)' },
    { value: 'large', label: 'Large (Hero Span 2x1)' },
    { value: 'tall', label: 'Tall (Vertical 1x2)' },
    { value: 'small', label: 'Small (Compact 1x1)' }
];

const BADGES = ['Featured', 'Hot', 'Popular', 'Classic', 'New', 'Brain Boost', 'Quick Play', ''];

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
        category: 'Casual Games',
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

    // Open Add Modal
    const handleOpenAdd = () => {
        setEditingGame(null);
        setFormData({
            title: '',
            slug: '',
            category: 'Casual Games',
            description: '',
            instructions: '',
            cardSize: 'medium',
            badge: 'New',
            thumbnail: 'gradient-indigo',
            isPublished: true,
            isFeatured: false,
            order: games.length + 1
        });
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (game) => {
        setEditingGame(game);
        setFormData({
            title: game.title,
            slug: game.slug,
            category: game.category,
            description: game.description,
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
            toast.error('Please enter a game title.');
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
                    toast.success('Game created successfully!');
                    setIsModalOpen(false);
                    fetchGames();
                }
            }
        } catch (err) {
            console.error('Save game error:', err);
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
        if (!window.confirm('Reset/Reseed games to default arcade catalog?')) return;
        try {
            const res = await gameService.adminSeedGames();
            if (res.success) {
                toast.success('Games catalog refreshed!');
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
                        Mini Games Management
                    </h2>
                    <p className="text-xs text-[var(--foreground-muted)]">
                        Manage catalog, configure categories, assign thumbnails, and toggle homepage featured status.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleReseed}
                        className="px-3.5 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground-secondary)] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Reseed Default Games"
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

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === 'All'
                                ? 'bg-[#193D35] text-white'
                                : 'bg-[var(--card-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)]'
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
                                    : 'bg-[var(--card-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)]'
                            }`}
                        >
                            {cat.replace(' Games', '')}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                    <input
                        type="text"
                        placeholder="Search games..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                    />
                </div>
            </div>

            {/* Games Table */}
            <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden shadow-xs">
                {loading ? (
                    <div className="p-8 text-center text-xs text-[var(--foreground-muted)]">Loading games bank...</div>
                ) : filteredGames.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--foreground-muted)]">No games match your criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[var(--muted-bg)]/80 text-[var(--foreground-muted)] font-bold uppercase text-[10px] border-b border-[var(--card-border)]">
                                <tr>
                                    <th className="py-3 px-4">Game</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Card Size</th>
                                    <th className="py-3 px-4">Badge</th>
                                    <th className="py-3 px-4 text-center">Featured</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Plays</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]">
                                {filteredGames.map((game) => (
                                    <tr key={game.slug} className="hover:bg-[var(--muted-bg)]/40 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-10 rounded-xl overflow-hidden shrink-0 border border-[var(--card-border)]">
                                                    <GameArtwork slug={game.slug} title={game.title} />
                                                </div>
                                                <div>
                                                    <span className="font-extrabold text-[var(--foreground)] block">{game.title}</span>
                                                    <span className="text-[10px] text-[var(--foreground-muted)] font-mono">/{game.slug}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-[var(--foreground-secondary)]">
                                            {game.category}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="capitalize px-2 py-0.5 rounded-md bg-[var(--muted-bg)] text-[10px] font-bold">
                                                {game.cardSize || 'medium'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {game.badge ? (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase">
                                                    {game.badge}
                                                </span>
                                            ) : (
                                                <span className="text-[var(--foreground-muted)]">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleToggleFeature(game)}
                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                    game.isFeatured
                                                        ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                                                        : 'text-[var(--foreground-muted)] hover:bg-[var(--muted-bg)]'
                                                }`}
                                                title={game.isFeatured ? "Featured on hub homepage" : "Not featured"}
                                            >
                                                <Flame size={16} className={game.isFeatured ? 'fill-amber-500' : ''} />
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleTogglePublish(game)}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                                                    game.isPublished
                                                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                                        : 'bg-stone-500/15 text-stone-400 border border-stone-500/30'
                                                }`}
                                            >
                                                {game.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                                                <span>{game.isPublished ? 'Published' : 'Draft'}</span>
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-[var(--foreground-muted)]">
                                            {(game.playsCount || 0).toLocaleString()}
                                        </td>
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
                            {/* Title & Slug */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Game Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Sudoku Challenge"
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">URL Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="e.g. sudoku-challenge"
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] font-mono"
                                    />
                                </div>
                            </div>

                            {/* Category & Card Size */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Bento Card Size</label>
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
                            </div>

                            {/* Badge & Order */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                <div>
                                    <label className="block font-bold mb-1 text-[var(--foreground)]">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Short Description</label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description for discovery card..."
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] resize-none"
                                />
                            </div>

                            {/* Instructions */}
                            <div>
                                <label className="block font-bold mb-1 text-[var(--foreground)]">Gameplay Instructions</label>
                                <textarea
                                    rows={3}
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    placeholder="How to play, controls, rules..."
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] resize-none"
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer font-bold">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                        className="rounded-sm text-emerald-600 focus:ring-0"
                                    />
                                    <span>Published</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer font-bold">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="rounded-sm text-amber-500 focus:ring-0"
                                    />
                                    <span>Featured on Hub</span>
                                </label>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--card-border)]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] font-bold transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2 rounded-xl bg-[#193D35] hover:bg-[#193D35]/90 text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Save size={14} />
                                    <span>{isSaving ? 'Saving...' : 'Save Game'}</span>
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
