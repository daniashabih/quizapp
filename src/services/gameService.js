import axios from 'axios';

/**
 * Dedicated Axios instance matching attemptService and settingsService architecture.
 * Correctly prepends /api when baseURL is relative without duplicating /api/api/...
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
    timeout: 15000,
});

/**
 * Standard Catalog of all 14 Coding & Typing Games
 * Used for instant client-side resiliency if backend or database is unreachable
 */
export const FALLBACK_GAMES = [
    // --- 8 CODING GAMES ---
    {
        id: 'game_code_puzzle',
        slug: 'code-puzzle',
        title: 'Code Puzzle',
        category: 'Coding Games',
        badge: 'Popular',
        cardSize: 'large',
        difficulty: 'Intermediate',
        rating: 4.9,
        playsCount: 3840,
        order: 1,
        isPublished: true,
        isFeatured: true,
        thumbnail: 'gradient-indigo',
        description: 'Arrange shuffled programming code blocks in the correct logical order to complete working snippets.',
        instructions: 'Drag, reorder, or click the code blocks to arrange them from top to bottom into a valid, working program. Switch between HTML, CSS, JavaScript, PHP, Python, and SQL!'
    },
    {
        id: 'game_find_the_bug',
        slug: 'find-the-bug',
        title: 'Find the Bug',
        category: 'Coding Games',
        badge: 'Hot',
        cardSize: 'tall',
        difficulty: 'Beginner',
        rating: 4.9,
        playsCount: 4210,
        order: 2,
        isPublished: true,
        isFeatured: true,
        thumbnail: 'gradient-rose',
        description: 'Spot syntax, logic, and type errors hidden in real code snippets and click the buggy line.',
        instructions: 'Inspect the code snippet carefully with line numbers. Click or tap the exact line where the defect exists, then read the explanation and fix!'
    },
    {
        id: 'game_output_predictor',
        slug: 'output-predictor',
        title: 'Output Predictor',
        category: 'Coding Games',
        badge: 'Brain Boost',
        cardSize: 'medium',
        difficulty: 'Intermediate',
        rating: 4.8,
        playsCount: 3120,
        order: 3,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-amber',
        description: 'Trace loops, closures, scope, and operations to predict the exact terminal output before code runs.',
        instructions: 'Read the snippet and predict what will be logged to console or returned. Choose from multiple options or type your prediction, then review step-by-step evaluation.'
    },
    {
        id: 'game_code_scramble',
        slug: 'code-scramble',
        title: 'Code Scramble',
        category: 'Coding Games',
        badge: 'Challenge',
        cardSize: 'medium',
        difficulty: 'Intermediate',
        rating: 4.7,
        playsCount: 2650,
        order: 4,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-cyan',
        description: 'Rearrange scrambled programming statements into the correct executable sequence.',
        instructions: 'Move scrambled statements up and down until they form a coherent, executable algorithm. Test your understanding of program flow.'
    },
    {
        id: 'game_missing_code',
        slug: 'missing-code',
        title: 'Missing Code',
        category: 'Coding Games',
        badge: 'Featured',
        cardSize: 'large',
        difficulty: 'Beginner',
        rating: 4.9,
        playsCount: 3590,
        order: 5,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-emerald',
        description: 'Fill in missing keywords, expressions, and syntax tokens to complete defective code structures.',
        instructions: 'Locate the blank spaces (_____) in the code editor. Select the correct syntax keyword or token from the choices to restore functionality.'
    },
    {
        id: 'game_logic_builder',
        slug: 'logic-builder',
        title: 'Logic Builder',
        category: 'Coding Games',
        badge: 'Mental Gym',
        cardSize: 'medium',
        difficulty: 'Advanced',
        rating: 4.8,
        playsCount: 2890,
        order: 6,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-purple',
        description: 'Solve programmatic logic puzzles involving sequences, truth tables, loop bounds, and array transforms.',
        instructions: 'Analyze problem requirements and configure inputs, conditional branches, or loop steps to satisfy the algorithmic test cases.'
    },
    {
        id: 'game_sql_challenge',
        slug: 'sql-challenge',
        title: 'SQL Challenge',
        category: 'Coding Games',
        badge: 'Database Pro',
        cardSize: 'wide',
        difficulty: 'Intermediate',
        rating: 4.9,
        playsCount: 3780,
        order: 7,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-teal',
        description: 'Write SQL queries (SELECT, WHERE, JOIN, GROUP BY) against practice schemas to retrieve target datasets.',
        instructions: 'Review the sample relational tables (Students, Courses, Orders). Write queries in the safe interactive SQL editor and execute against isolated client-side test data. Never touches production!'
    },
    {
        id: 'game_memory_match',
        slug: 'memory-match',
        title: 'Memory Match',
        category: 'Coding Games',
        badge: 'Quick Mind',
        cardSize: 'medium',
        difficulty: 'Beginner',
        rating: 4.8,
        playsCount: 4500,
        order: 8,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-blue',
        description: 'Match programming concepts and syntax with their correct definitions and code outputs.',
        instructions: 'Flip cards two at a time to pair programming terms (like Closure, Polymorphism, Foreign Key, Flexbox) with their accurate definitions or code output pairs.'
    },

    // --- 6 TYPING GAMES ---
    {
        id: 'game_speed_typing',
        slug: 'speed-typing',
        title: 'Speed Typing',
        category: 'Typing Games',
        badge: 'High Speed',
        cardSize: 'large',
        difficulty: 'All Levels',
        rating: 4.9,
        playsCount: 5210,
        order: 9,
        isPublished: true,
        isFeatured: true,
        thumbnail: 'gradient-emerald',
        description: 'Type developer articles, documentation, and technical passages with live WPM and accuracy tracking.',
        instructions: 'Start typing the displayed text. Monitor your live Words Per Minute (WPM), accuracy percentage, and Characters Per Minute (CPM) in real time.'
    },
    {
        id: 'game_code_typing',
        slug: 'code-typing',
        title: 'Code Typing',
        category: 'Typing Games',
        badge: 'Dev Stamina',
        cardSize: 'tall',
        difficulty: 'Intermediate',
        rating: 4.9,
        playsCount: 4890,
        order: 10,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-indigo',
        description: 'Practice typing authentic syntax and code snippets across JavaScript, Python, PHP, HTML, CSS, and SQL.',
        instructions: 'Type out indented, syntax-highlighted code character-by-character. Trains muscle memory for camelCase, indentation, and syntax structures.'
    },
    {
        id: 'game_sixty_second',
        slug: 'sixty-second-challenge',
        title: '60-Second Challenge',
        category: 'Typing Games',
        badge: 'Sprint',
        cardSize: 'medium',
        difficulty: 'All Levels',
        rating: 4.8,
        playsCount: 4100,
        order: 11,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-rose',
        description: 'A rapid 60-second typing sprint to type as many programming words and statements as humanly possible.',
        instructions: 'Timer starts the instant you press your first key! Type as many words accurately as you can before the 60-second buzzer sounds.'
    },
    {
        id: 'game_error_free_typing',
        slug: 'error-free-typing',
        title: 'Error-Free Typing',
        category: 'Typing Games',
        badge: 'Precision',
        cardSize: 'medium',
        difficulty: 'Advanced',
        rating: 4.9,
        playsCount: 3950,
        order: 12,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-amber',
        description: 'Zero tolerance typing drill where typos immediately halt progress until backspaced and corrected.',
        instructions: 'Every stroke counts! If you hit an incorrect character, the caret locks in place until you press Backspace and type the exact matching symbol.'
    },
    {
        id: 'game_syntax_typing',
        slug: 'syntax-typing',
        title: 'Syntax Typing',
        category: 'Typing Games',
        badge: 'Muscle Memory',
        cardSize: 'medium',
        difficulty: 'Intermediate',
        rating: 4.7,
        playsCount: 3620,
        order: 13,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-cyan',
        description: 'Drill complex punctuation, braces, arrows, operators, and brackets common in modern software development.',
        instructions: 'Specially designed passage sequences consisting of curly braces, arrows, pipes, ampersands, semicolons, and brackets to eliminate keyboard reach hesitation.'
    },
    {
        id: 'game_word_rain',
        slug: 'word-rain',
        title: 'Word Rain',
        category: 'Typing Games',
        badge: 'Arcade Rush',
        cardSize: 'large',
        difficulty: 'All Levels',
        rating: 4.9,
        playsCount: 5680,
        order: 14,
        isPublished: true,
        isFeatured: true,
        thumbnail: 'gradient-purple',
        description: 'Programming keywords rain down from the sky—destroy them with precise typing before they touch ground!',
        instructions: 'Type the falling programming keywords before they touch the red ground line. Three lives total. Clear waves to earn speed multipliers and bonus scores!'
    }
];

const gameService = {
    /**
     * Get published games with optional category/search filters
     * Calls GET /api/games without duplicate /api prefix
     */
    getGames: async (params = {}) => {
        try {
            const response = await api.get('/games', { params });
            if (response.data && response.data.success) {
                return response.data;
            }
            throw new Error(response.data?.message || 'Invalid games response from server');
        } catch (err) {
            console.warn('[gameService] API getGames network/server error:', err.message);
            // Fallback to local catalog if offline or network connection interrupted
            let list = [...FALLBACK_GAMES];
            if (params.category && params.category !== 'All Games' && params.category !== 'All') {
                list = list.filter(g => g.category.toLowerCase().includes(params.category.toLowerCase().replace(' games', '')));
            }
            if (params.search) {
                const q = params.search.toLowerCase();
                list = list.filter(g => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
            }
            if (params.difficulty && params.difficulty !== 'All Levels') {
                list = list.filter(g => (g.difficulty || '').toLowerCase() === params.difficulty.toLowerCase());
            }

            return {
                success: true,
                count: list.length,
                data: list,
                featuredGame: list.find(g => g.isFeatured) || list[0],
                categoryCounts: {
                    'All Games': FALLBACK_GAMES.length,
                    'Coding Games': FALLBACK_GAMES.filter(g => g.category === 'Coding Games').length,
                    'Typing Games': FALLBACK_GAMES.filter(g => g.category === 'Typing Games').length
                },
                isOffline: true
            };
        }
    },

    /**
     * Get single game details by slug
     * Calls GET /api/games/:slug
     */
    getGameBySlug: async (slug) => {
        try {
            const response = await api.get(`/games/${slug}`);
            if (response.data && response.data.success) {
                return response.data;
            }
        } catch (err) {
            console.warn(`[gameService] API getGameBySlug failed for ${slug}:`, err.message);
        }

        const fallback = FALLBACK_GAMES.find(g => g.slug === slug);
        if (fallback) {
            return {
                success: true,
                data: fallback,
                isOffline: true
            };
        }

        return {
            success: false,
            message: `Game ${slug} not found`
        };
    },

    /**
     * Get challenges for a game
     */
    getChallenges: async (slug, params = {}) => {
        try {
            const response = await api.get(`/games/${slug}/challenges`, { params });
            return response.data;
        } catch (err) {
            console.warn(`[gameService] API getChallenges failed for ${slug}:`, err.message);
            return {
                success: false,
                data: []
            };
        }
    },

    /**
     * Verify challenge submission on backend
     */
    verifyChallenge: async (slug, challengeId, submission) => {
        try {
            const response = await api.post(`/games/${slug}/verify`, { challengeId, submission });
            return response.data;
        } catch (err) {
            console.error(`[gameService] verifyChallenge failed for ${slug}:`, err.message);
            return {
                success: false,
                isCorrect: false,
                points: 0,
                message: err.response?.data?.message || err.message
            };
        }
    },

    /**
     * Get daily featured game quest
     */
    getDailyChallenge: async () => {
        try {
            const response = await api.get('/games/daily/challenge');
            if (response.data && response.data.success) {
                return response.data;
            }
        } catch (err) {
            console.warn('[gameService] getDailyChallenge failed, computing client fallback:', err.message);
        }

        const today = new Date().toISOString().slice(0, 10);
        let hash = 0;
        for (let i = 0; i < today.length; i++) {
            hash = (hash << 5) - hash + today.charCodeAt(i);
            hash |= 0;
        }
        const dailyGame = FALLBACK_GAMES[Math.abs(hash) % FALLBACK_GAMES.length];

        return {
            success: true,
            data: {
                date: today,
                game: dailyGame,
                bonusMultiplier: 1.5,
                message: `Today's Daily Quest: Master ${dailyGame.title} for 1.5x bonus score!`
            }
        };
    },

    /**
     * Get game leaderboard
     */
    getLeaderboard: async (slug, limit = 10) => {
        try {
            const response = await api.get(`/games/leaderboard/${slug}`, { params: { limit } });
            return response.data;
        } catch (err) {
            return { success: true, data: [] };
        }
    },

    /**
     * Submit game score
     */
    submitScore: async (slug, { score, durationSeconds, accuracy, wpm, difficulty, metadata }) => {
        try {
            const response = await api.post(`/games/${slug}/score`, {
                score,
                durationSeconds,
                accuracy,
                wpm,
                difficulty,
                metadata
            });
            return response.data;
        } catch (err) {
            console.warn('[gameService] submitScore offline fallback:', err.message);
            return {
                success: true,
                isNewHighScore: true,
                highScore: score,
                score,
                wpm: wpm || 0,
                accuracy: accuracy || 100,
                totalPlays: 1,
                message: 'Score recorded locally'
            };
        }
    },

    /**
     * Toggle favorite status
     */
    toggleFavorite: async (slug) => {
        try {
            const response = await api.post(`/games/${slug}/favorite`, {});
            return response.data;
        } catch (err) {
            return { success: true, isFavorite: true };
        }
    },

    /**
     * Get user game stats (high scores, favorites, recent history)
     */
    getUserStats: async () => {
        try {
            const response = await api.get('/games/user/stats');
            return response.data;
        } catch (err) {
            return {
                success: false,
                data: {
                    totalPlayed: 0,
                    highScores: {},
                    bestWpm: {},
                    bestAccuracy: {},
                    favorites: [],
                    recentGames: [],
                    history: []
                }
            };
        }
    },

    // Admin endpoints
    adminGetGames: async () => {
        const response = await api.get('/admin/games');
        return response.data;
    },

    adminCreateGame: async (data) => {
        const response = await api.post('/admin/games', data);
        return response.data;
    },

    adminUpdateGame: async (id, data) => {
        const response = await api.put(`/admin/games/${id}`, data);
        return response.data;
    },

    adminDeleteGame: async (id) => {
        const response = await api.delete(`/admin/games/${id}`);
        return response.data;
    },

    adminTogglePublish: async (id) => {
        const response = await api.patch(`/admin/games/${id}/toggle-publish`, {});
        return response.data;
    },

    adminToggleFeature: async (id) => {
        const response = await api.patch(`/admin/games/${id}/toggle-feature`, {});
        return response.data;
    },

    adminSeedGames: async () => {
        const response = await api.post('/admin/games/seed', {});
        return response.data;
    }
};

export default gameService;