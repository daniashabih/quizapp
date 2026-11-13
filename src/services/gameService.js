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
    },

    // --- 4 DEDICATED C# CODING GAMES ---
    {
        id: 'game_csharp_oop_challenge',
        slug: 'csharp-oop-challenge',
        title: 'C# OOP Challenge',
        category: 'Coding Games',
        badge: 'OOP Mastery',
        cardSize: 'medium',
        difficulty: 'Intermediate',
        rating: 4.9,
        playsCount: 2980,
        order: 15,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-purple',
        description: 'Practice classes, objects, inheritance, polymorphism, encapsulation, and design patterns in C#.',
        instructions: 'Read real-world C# class architectures. Predict polymorphic output, configure abstract contracts, and solve object-oriented challenges.'
    },
    {
        id: 'game_csharp_collections_challenge',
        slug: 'csharp-collections-challenge',
        title: 'C# Collections Challenge',
        category: 'Coding Games',
        badge: 'Data Structures',
        cardSize: 'medium',
        difficulty: 'Intermediate',
        rating: 4.8,
        playsCount: 2740,
        order: 16,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-teal',
        description: 'Solve challenges using arrays, lists, dictionaries, hashsets, queues, and generic collections.',
        instructions: 'Test your understanding of C# collections, memory allocations, TryGetValue lookups, and concurrent collections.'
    },
    {
        id: 'game_csharp_linq_challenge',
        slug: 'csharp-linq-challenge',
        title: 'C# LINQ Challenge',
        category: 'Coding Games',
        badge: 'LINQ Query',
        cardSize: 'medium',
        difficulty: 'Advanced',
        rating: 4.9,
        playsCount: 3340,
        order: 17,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-indigo',
        description: 'Practice Where, Select, OrderBy, GroupBy, SelectMany, and deferred execution operations.',
        instructions: 'Analyze LINQ method and query syntax expressions. Trace pipelines, determine projected types, and predict sequence outputs.'
    },
    {
        id: 'game_csharp_exception_handling',
        slug: 'csharp-exception-handling',
        title: 'C# Exception Handling',
        category: 'Coding Games',
        badge: 'Fault Tolerance',
        cardSize: 'tall',
        difficulty: 'Intermediate',
        rating: 4.8,
        playsCount: 2510,
        order: 18,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-rose',
        description: 'Identify and implement try, catch, finally, when filters, throw preservation, and custom exceptions.',
        instructions: 'Inspect robust error handling code snippets. Identify exception bugs, ensure clean finally execution, and catch filtered errors.'
    },
    {
        id: 'game_complete_the_code',
        slug: 'complete-the-code',
        title: 'Complete the Code',
        category: 'Coding Games',
        badge: 'Interactive',
        cardSize: 'large',
        difficulty: 'All Levels',
        rating: 4.9,
        playsCount: 4620,
        order: 19,
        isPublished: true,
        isFeatured: true,
        thumbnail: 'gradient-emerald',
        description: 'Complete missing C# statements, keywords, and expressions across beginner, intermediate, and advanced levels.',
        instructions: 'Examine the incomplete C# program. Fill in the blank by choosing from multiple-choice options or typing the exact missing code token. Click Submit Answer to test your solution and view explanations.'
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
     * Get active game progress for session resumption
     */
    getProgress: async (slug) => {
        try {
            const response = await api.get(`/games/${slug}/progress`);
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
        } catch (err) {
            console.warn(`[gameService] getProgress API failed for ${slug}:`, err.message);
        }

        // Local storage fallback for offline / guest
        try {
            const local = localStorage.getItem(`hangbug_game_progress_${slug}`);
            if (local) {
                return JSON.parse(local);
            }
        } catch {
            // ignore
        }
        return null;
    },

    /**
     * Save active game progress for session resumption
     */
    saveProgress: async (slug, progressData) => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(`hangbug_game_progress_${slug}`, JSON.stringify(progressData));
            }
        } catch {
            // storage quota safety
        }

        try {
            const response = await api.post(`/games/${slug}/progress`, progressData);
            return response.data;
        } catch (err) {
            return {
                success: true,
                message: 'Progress saved locally'
            };
        }
    },

    /**
     * Clear active game progress upon completion or restart
     */
    clearProgress: async (slug) => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(`hangbug_game_progress_${slug}`);
            }
        } catch {
            // ignore
        }

        try {
            const response = await api.delete(`/games/${slug}/progress`);
            return response.data;
        } catch (err) {
            return { success: true };
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
    submitScore: async (slug, { score, durationSeconds, accuracy, wpm, difficulty, technology, metadata }) => {
        try {
            const response = await api.post(`/games/${slug}/score`, {
                score,
                durationSeconds,
                accuracy,
                wpm,
                difficulty,
                technology,
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
                technology: technology || 'all',
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
    },

    // Technology Categories & Technologies
    getCategories: async () => {
        try {
            const response = await api.get('/games/categories');
            return response.data;
        } catch (err) {
            console.warn('[gameService] getCategories fallback:', err.message);
            return {
                success: true,
                data: FALLBACK_TECH_CATEGORIES,
                isOffline: true
            };
        }
    },

    getTechnologies: async (params = {}) => {
        try {
            const response = await api.get('/games/technologies', { params });
            return response.data;
        } catch (err) {
            console.warn('[gameService] getTechnologies fallback:', err.message);
            let list = FALLBACK_TECHNOLOGIES.slice();
            if (params.categorySlug && params.categorySlug !== 'all') {
                list = list.filter(t => t.categorySlug === params.categorySlug);
            }
            if (params.search) {
                const q = params.search.toLowerCase();
                list = list.filter(t => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
            }
            return {
                success: true,
                count: list.length,
                data: list,
                isOffline: true
            };
        }
    },

    getTechnologyBySlug: async (slug) => {
        try {
            const response = await api.get(`/games/technologies/${slug}`);
            return response.data;
        } catch (err) {
            console.warn(`[gameService] getTechnologyBySlug fallback for ${slug}:`, err.message);
            const tech = FALLBACK_TECHNOLOGIES.find(t => t.slug === slug);
            return {
                success: Boolean(tech),
                data: tech || null,
                isOffline: true
            };
        }
    },

    getGamesByTechnology: async (slug, params = {}) => {
        try {
            const response = await api.get(`/games/technologies/${slug}/games`, { params });
            return response.data;
        } catch (err) {
            console.warn(`[gameService] getGamesByTechnology fallback for ${slug}:`, err.message);
            const tech = FALLBACK_TECHNOLOGIES.find(t => t.slug === slug);
            const list = FALLBACK_GAMES.filter(g => tech?.supportedGames?.includes(g.slug));
            return {
                success: true,
                technology: slug,
                count: list.length,
                data: list,
                isOffline: true
            };
        }
    },

    getUserTechStats: async (slug) => {
        try {
            const response = await api.get(`/games/technologies/${slug}/stats`);
            return response.data;
        } catch {
            return {
                success: true,
                isGuest: true,
                data: { totalPlays: 0, highScore: 0, bestWpm: 0, bestAccuracy: 100 }
            };
        }
    },

    // Admin Technology Management
    adminGetTechCategories: async () => {
        const response = await api.get('/admin/games/categories');
        return response.data;
    },

    adminCreateTechCategory: async (data) => {
        const response = await api.post('/admin/games/categories', data);
        return response.data;
    },

    adminUpdateTechCategory: async (id, data) => {
        const response = await api.put(`/admin/games/categories/${id}`, data);
        return response.data;
    },

    adminDeleteTechCategory: async (id) => {
        const response = await api.delete(`/admin/games/categories/${id}`);
        return response.data;
    },

    adminGetTechnologies: async (params = {}) => {
        const response = await api.get('/admin/games/technologies', { params });
        return response.data;
    },

    adminCreateTechnology: async (data) => {
        const response = await api.post('/admin/games/technologies', data);
        return response.data;
    },

    adminUpdateTechnology: async (id, data) => {
        const response = await api.put(`/admin/games/technologies/${id}`, data);
        return response.data;
    },

    adminDeleteTechnology: async (id) => {
        const response = await api.delete(`/admin/games/technologies/${id}`);
        return response.data;
    },

    adminToggleTechnology: async (id) => {
        const response = await api.patch(`/admin/games/technologies/${id}/toggle`, {});
        return response.data;
    },

    adminGetChallenges: async (params = {}) => {
        const response = await api.get('/admin/games/challenges', { params });
        return response.data;
    },

    adminCreateChallenge: async (data) => {
        const response = await api.post('/admin/games/challenges', data);
        return response.data;
    },

    adminUpdateChallenge: async (id, data) => {
        const response = await api.put(`/admin/games/challenges/${id}`, data);
        return response.data;
    },

    adminDeleteChallenge: async (id) => {
        const response = await api.delete(`/admin/games/challenges/${id}`);
        return response.data;
    },

    adminGetStats: async () => {
        const response = await api.get('/admin/games/stats');
        return response.data;
    }
};

export const FALLBACK_TECH_CATEGORIES = [
    { id: 'cat_frontend', name: 'Frontend Development', slug: 'frontend-development', description: 'Client-side interfaces and responsive UX.', icon: 'Layout', isEnabled: true, order: 1 },
    { id: 'cat_backend', name: 'Backend Development', slug: 'backend-development', description: 'Server APIs, data layers, and services.', icon: 'Server', isEnabled: true, order: 2 },
    { id: 'cat_database', name: 'Database', slug: 'database', description: 'Relational and NoSQL database query engines.', icon: 'Database', isEnabled: true, order: 3 },
    { id: 'cat_mobile', name: 'Mobile Development', slug: 'mobile-development', description: 'Cross-platform mobile apps for iOS and Android.', icon: 'Smartphone', isEnabled: true, order: 4 },
    { id: 'cat_fundamentals', name: 'Programming Fundamentals', slug: 'programming-fundamentals', description: 'Logic, OOP, and data structures.', icon: 'Cpu', isEnabled: true, order: 5 },
    { id: 'cat_webdev', name: 'Web Development', slug: 'web-development', description: 'Full stack development and web protocols.', icon: 'Globe', isEnabled: true, order: 6 },
    { id: 'cat_languages', name: 'Programming Languages', slug: 'programming-languages', description: 'Core programming languages, syntax paradigms, runtime environments, and typing systems.', icon: 'Code2', isEnabled: true, order: 7 }
];

export const FALLBACK_TECHNOLOGIES = [
    { id: 'tech_html', categorySlug: 'frontend-development', name: 'HTML', slug: 'html', color: '#E34F26', icon: 'html5', supportedGames: ['find-the-bug', 'code-puzzle', 'missing-code', 'memory-match', 'code-typing', 'syntax-typing', 'speed-typing'], isEnabled: true },
    { id: 'tech_css', categorySlug: 'frontend-development', name: 'CSS', slug: 'css', color: '#1572B6', icon: 'css3', supportedGames: ['code-puzzle', 'find-the-bug', 'output-predictor', 'missing-code', 'memory-match', 'code-typing', 'syntax-typing'], isEnabled: true },
    { id: 'tech_javascript', categorySlug: 'frontend-development', name: 'JavaScript', slug: 'javascript', color: '#F7DF1E', icon: 'javascript', supportedGames: ['output-predictor', 'code-scramble', 'logic-builder', 'code-puzzle', 'find-the-bug', 'missing-code', 'memory-match', 'speed-typing', 'code-typing', 'syntax-typing', 'sixty-second-challenge', 'error-free-typing', 'word-rain'], isEnabled: true },
    { id: 'tech_bootstrap', categorySlug: 'frontend-development', name: 'Bootstrap', slug: 'bootstrap', color: '#7952B3', icon: 'bootstrap', supportedGames: ['find-the-bug', 'missing-code', 'code-puzzle', 'memory-match', 'code-typing'], isEnabled: true },
    { id: 'tech_jquery', categorySlug: 'frontend-development', name: 'jQuery', slug: 'jquery', color: '#0769AD', icon: 'jquery', supportedGames: ['find-the-bug', 'code-puzzle', 'missing-code', 'code-typing', 'output-predictor'], isEnabled: true },
    { id: 'tech_react', categorySlug: 'frontend-development', name: 'React.js', slug: 'react', color: '#61DAFB', icon: 'react', supportedGames: ['code-puzzle', 'find-the-bug', 'output-predictor', 'missing-code', 'logic-builder', 'code-typing', 'syntax-typing'], isEnabled: true },

    { id: 'tech_php', categorySlug: 'backend-development', name: 'PHP', slug: 'php', color: '#777BB4', icon: 'php', supportedGames: ['find-the-bug', 'missing-code', 'code-puzzle', 'output-predictor', 'code-typing', 'syntax-typing'], isEnabled: true },
    { id: 'tech_laravel', categorySlug: 'backend-development', name: 'Laravel', slug: 'laravel', color: '#FF2D20', icon: 'laravel', supportedGames: ['code-puzzle', 'find-the-bug', 'logic-builder', 'missing-code', 'code-typing'], isEnabled: true },
    { id: 'tech_nodejs', categorySlug: 'backend-development', name: 'Node.js', slug: 'nodejs', color: '#339933', icon: 'nodejs', supportedGames: ['output-predictor', 'code-puzzle', 'find-the-bug', 'code-scramble', 'code-typing', 'speed-typing'], isEnabled: true },
    { id: 'tech_express', categorySlug: 'backend-development', name: 'Express.js', slug: 'express', color: '#68A063', icon: 'express', supportedGames: ['find-the-bug', 'code-puzzle', 'missing-code', 'logic-builder', 'code-typing'], isEnabled: true },
    { id: 'tech_python', categorySlug: 'backend-development', name: 'Python', slug: 'python', color: '#3776AB', icon: 'python', supportedGames: ['output-predictor', 'code-puzzle', 'find-the-bug', 'logic-builder', 'code-scramble', 'code-typing', 'speed-typing'], isEnabled: true },

    { id: 'tech_mysql', categorySlug: 'database', name: 'MySQL', slug: 'mysql', color: '#4479A1', icon: 'mysql', supportedGames: ['sql-challenge', 'output-predictor', 'code-puzzle', 'find-the-bug', 'code-typing'], isEnabled: true },
    { id: 'tech_mongodb', categorySlug: 'database', name: 'MongoDB', slug: 'mongodb', color: '#47A248', icon: 'mongodb', supportedGames: ['sql-challenge', 'find-the-bug', 'output-predictor', 'code-puzzle', 'code-typing'], isEnabled: true },
    { id: 'tech_sql', categorySlug: 'database', name: 'SQL', slug: 'sql', color: '#00758F', icon: 'sql', supportedGames: ['sql-challenge', 'output-predictor', 'code-puzzle', 'find-the-bug', 'code-typing', 'syntax-typing'], isEnabled: true },

    { id: 'tech_flutter', categorySlug: 'mobile-development', name: 'Flutter', slug: 'flutter', color: '#02569B', icon: 'flutter', supportedGames: ['code-puzzle', 'find-the-bug', 'code-scramble', 'missing-code', 'code-typing', 'syntax-typing'], isEnabled: true },
    { id: 'tech_dart', categorySlug: 'mobile-development', name: 'Dart', slug: 'dart', color: '#0175C2', icon: 'dart', supportedGames: ['code-puzzle', 'find-the-bug', 'output-predictor', 'code-scramble', 'code-typing', 'syntax-typing'], isEnabled: true },
    { id: 'tech_android', categorySlug: 'mobile-development', name: 'Android Development', slug: 'android-development', color: '#3DDC84', icon: 'android', supportedGames: ['find-the-bug', 'code-puzzle', 'output-predictor', 'code-typing', 'missing-code'], isEnabled: true },

    { id: 'tech_logic', categorySlug: 'programming-fundamentals', name: 'Programming Logic', slug: 'programming-logic', color: '#8B5CF6', icon: 'binary', supportedGames: ['logic-builder', 'output-predictor', 'code-scramble', 'code-puzzle', 'memory-match'], isEnabled: true },
    { id: 'tech_oop', categorySlug: 'programming-fundamentals', name: 'Object-Oriented Programming (OOP)', slug: 'oop', color: '#EC4899', icon: 'box', supportedGames: ['memory-match', 'find-the-bug', 'code-puzzle', 'output-predictor', 'logic-builder'], isEnabled: true },
    { id: 'tech_dsa', categorySlug: 'programming-fundamentals', name: 'Data Structures & Algorithms', slug: 'dsa', color: '#F97316', icon: 'network', supportedGames: ['logic-builder', 'code-scramble', 'output-predictor', 'code-puzzle', 'memory-match'], isEnabled: true },

    { id: 'tech_html_css', categorySlug: 'web-development', name: 'HTML & CSS', slug: 'html-css', color: '#E44D26', icon: 'palette', supportedGames: ['code-puzzle', 'find-the-bug', 'missing-code', 'memory-match', 'code-typing', 'speed-typing'], isEnabled: true },
    { id: 'tech_fullstack', categorySlug: 'web-development', name: 'Full Stack Development', slug: 'full-stack', color: '#10B981', icon: 'layers', supportedGames: ['logic-builder', 'code-puzzle', 'find-the-bug', 'output-predictor', 'code-typing'], isEnabled: true },
    { id: 'tech_web_fundamentals', categorySlug: 'web-development', name: 'Web Development Fundamentals', slug: 'web-fundamentals', color: '#06B6D4', icon: 'compass', supportedGames: ['memory-match', 'speed-typing', 'output-predictor', 'find-the-bug', 'code-puzzle'], isEnabled: true },

    // Programming Languages (1)
    {
        id: 'tech_csharp',
        categorySlug: 'programming-languages',
        name: 'C#',
        slug: 'csharp',
        description: 'Practice C# programming through interactive coding games and challenges.',
        color: '#9B4993',
        icon: 'csharp',
        badge: 'Modern .NET',
        supportedGames: [
            'complete-the-code',
            'csharp-complete-the-code',
            'code-puzzle',
            'find-the-bug',
            'output-predictor',
            'code-scramble',
            'missing-code',
            'logic-builder',
            'csharp-oop-challenge',
            'csharp-collections-challenge',
            'csharp-linq-challenge',
            'csharp-exception-handling',
            'speed-typing',
            'syntax-typing',
            'code-typing',
            'error-free-typing'
        ],
        isEnabled: true,
        order: 24
    }
];

export default gameService;