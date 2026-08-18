const prisma = require('../_config/prisma');

/**
 * Helper: Calculate user streak from quiz attempt timestamps
 */
function calculateStreak(results) {
    if (!results || results.length === 0) return 0;

    // Extract unique dates formatted as YYYY-MM-DD
    const dateSet = new Set(
        results.map(r => {
            const d = new Date(r.createdAt || r.created_at);
            return d.toISOString().split('T')[0];
        })
    );

    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // If no activity today or yesterday, streak is broken
    if (!dateSet.has(today) && !dateSet.has(yesterday)) {
        return 0;
    }

    let streak = 0;
    const checkDate = new Date(dateSet.has(today) ? today : yesterday);

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (dateSet.has(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Helper: Calculate Weekly Activity (Mon - Sun) for current week
 */
function calculateWeeklyActivity(results) {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMonday = (currentDayOfWeek + 6) % 7; // days since Monday
    
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return weekDays.map((dayName, index) => {
        const startOfDay = new Date(monday);
        startOfDay.setDate(monday.getDate() + index);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(startOfDay.getDate() + 1);

        const count = results.filter(r => {
            const rDate = new Date(r.createdAt || r.created_at);
            return rDate >= startOfDay && rDate < endOfDay;
        }).length;

        return {
            day: dayName,
            date: startOfDay.toISOString().split('T')[0],
            attempts: count
        };
    });
}

/**
 * Helper: Format Dynamic Achievements based on real user performance
 */
function calculateAchievements(stats, results) {
    return [
        {
            id: 'quick_learner',
            label: 'Quick Learner',
            description: 'Completed your first quiz challenge',
            earned: stats.totalQuizzes >= 1,
            icon: 'Zap',
            dateEarned: results.length > 0 ? (results[results.length - 1].createdAt || results[results.length - 1].created_at) : null
        },
        {
            id: 'dedicated',
            label: 'Dedicated',
            description: 'Maintained an active 7-day quiz streak',
            earned: stats.streak >= 7,
            icon: 'Flame',
            dateEarned: null
        },
        {
            id: 'knowledge_seeker',
            label: 'Knowledge Seeker',
            description: 'Completed 5 or more quizzes',
            earned: stats.totalQuizzes >= 5,
            icon: 'BookOpen',
            dateEarned: results.length >= 5 ? (results[results.length - 5].createdAt || results[results.length - 5].created_at) : null
        },
        {
            id: 'top_scorer',
            label: 'Top Scorer',
            description: 'Scored 90% or higher on a quiz',
            earned: results.some(r => r.percentage >= 90),
            icon: 'Trophy',
            dateEarned: (results.find(r => r.percentage >= 90)?.createdAt) || null
        },
        {
            id: 'certificate_holder',
            label: 'Certified Pro',
            description: 'Earned at least 1 verified certificate (80%+)',
            earned: stats.certificates >= 1,
            icon: 'Award',
            dateEarned: (results.find(r => r.percentage >= 80)?.createdAt) || null
        },
        {
            id: 'flawless',
            label: 'Flawless Master',
            description: 'Achieved a perfect 100% score',
            earned: results.some(r => r.percentage === 100),
            icon: 'Sparkles',
            dateEarned: (results.find(r => r.percentage === 100)?.createdAt) || null
        }
    ];
}

/**
 * Helper: Format relative timestamp
 */
function formatTimeAgo(date) {
    if (!date) return 'Recently';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
}

/**
 * Helper: Build dynamic notifications from real database records
 */
function calculateNotifications(user, results, certificates, streak) {
    const notifs = [];

    // 1. Earned Certificates notifications
    if (certificates && certificates.length > 0) {
        certificates.slice(0, 2).forEach(c => {
            notifs.push({
                id: `cert-${c.id}`,
                title: 'Certificate Earned',
                desc: `${c.category || c.tech} — Score: ${c.score}% ✓`,
                time: formatTimeAgo(c.createdAt),
                unread: true,
                type: 'certificate'
            });
        });
    }

    // 2. Recent Quiz Attempts
    if (results && results.length > 0) {
        const latest = results[0];
        notifs.push({
            id: `quiz-${latest.id}`,
            title: `Quiz Completed: ${latest.category}`,
            desc: `You scored ${Math.round(latest.percentage)}% (${latest.score}/${latest.total})`,
            time: formatTimeAgo(latest.createdAt || latest.created_at),
            unread: false,
            type: 'quiz'
        });
    }

    // 3. Streak Milestones
    if (streak > 0) {
        notifs.push({
            id: `streak-${streak}`,
            title: `${streak}-Day Quiz Streak! 🔥`,
            desc: 'Great consistency! Keep practicing daily.',
            time: 'Today',
            unread: false,
            type: 'streak'
        });
    }

    // 4. Welcome Platform Notification
    notifs.push({
        id: `welcome-${user?.id || 'new'}`,
        title: 'Welcome to HangBug!',
        desc: 'Explore technologies, test your skills, and earn verified certificates.',
        time: formatTimeAgo(user?.createdAt),
        unread: false,
        type: 'system'
    });

    return notifs;
}

/**
 * GET /api/dashboard/user
 * Authenticated User Dashboard
 * Strictly scoped to req.user.id
 */
const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // 1. Fetch user profile from DB
        const user = await prisma.user.findUnique({
            where: { id: String(userId) },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                isVerified: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found'
            });
        }

        // 2. Fetch all quiz results for this user
        const results = await prisma.quizResult.findMany({
            where: { userId: String(userId) },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Compute User Statistics
        const totalQuizzes = results.length;
        const passedQuizzes = results.filter(r => r.percentage >= 70).length;
        const failedQuizzes = results.filter(r => r.percentage < 70).length;
        const certificatesCount = results.filter(r => r.percentage >= 80).length;
        
        const averageScore = totalQuizzes > 0
            ? parseFloat((results.reduce((acc, r) => acc + (parseFloat(r.percentage) || 0), 0) / totalQuizzes).toFixed(1))
            : 0;

        // XP System: 10 XP per percentage point + 100 bonus XP per certificate
        const xp = Math.round(results.reduce((acc, r) => {
            let pts = (parseFloat(r.percentage) || 0) * 10;
            if (r.percentage >= 80) pts += 100;
            return acc + pts;
        }, 0));

        // Level calculation: 3 quizzes per level
        const level = Math.floor(totalQuizzes / 3) + 1;
        const levelProgress = totalQuizzes % 3;

        // Streak calculation
        const streak = calculateStreak(results);

        // 4. Calculate Global Rank across all users in MongoDB
        let rank = 1;
        try {
            const allUsersResults = await prisma.quizResult.groupBy({
                by: ['userId'],
                _sum: { score: true },
                _avg: { percentage: true },
                _count: { _all: true }
            });

            // Map user scores into XP rankings
            const userScores = allUsersResults.map(u => ({
                userId: u.userId,
                xp: Math.round((u._sum.score || 0) * 50 + (u._avg.percentage || 0) * 10)
            })).sort((a, b) => b.xp - a.xp);

            const userRankIndex = userScores.findIndex(u => String(u.userId) === String(userId));
            rank = userRankIndex !== -1 ? userRankIndex + 1 : (userScores.length + 1);
        } catch (rankErr) {
            console.warn('[Dashboard Warning] Could not calculate exact global rank:', rankErr.message);
            rank = 1;
        }

        // 5. Technology Progress (Category-wise breakdown)
        const techMap = {};
        results.forEach(r => {
            const cat = r.category || 'General';
            if (!techMap[cat]) {
                techMap[cat] = {
                    category: cat,
                    attempts: 0,
                    totalPercentage: 0,
                    bestScore: 0,
                    passedCount: 0
                };
            }
            techMap[cat].attempts += 1;
            techMap[cat].totalPercentage += parseFloat(r.percentage) || 0;
            techMap[cat].bestScore = Math.max(techMap[cat].bestScore, parseFloat(r.percentage) || 0);
            if (r.percentage >= 70) techMap[cat].passedCount += 1;
        });

        const technologyProgress = Object.values(techMap).map(t => ({
            category: t.category,
            attempts: t.attempts,
            bestScore: Math.round(t.bestScore),
            averageScore: Math.round(t.totalPercentage / t.attempts),
            passRate: Math.round((t.passedCount / t.attempts) * 100)
        }));

        // 6. Earned Certificates (Results with percentage >= 80)
        const certificates = results
            .filter(r => r.percentage >= 80)
            .map(r => ({
                id: `HB-CERT-${r.id.slice(-6).toUpperCase()}`,
                resultId: r.id,
                category: r.category,
                tech: r.category,
                score: Math.round(r.percentage),
                percentage: Math.round(r.percentage),
                issueDate: new Date(r.createdAt || r.created_at).toISOString().split('T')[0],
                createdAt: r.createdAt || r.created_at,
                issued: true
            }));

        // 7. Dynamic Achievements
        const stats = {
            totalQuizzes,
            averageScore,
            passedQuizzes,
            failedQuizzes,
            certificates: certificatesCount,
            xp,
            level,
            levelProgress,
            streak,
            rank
        };

        const achievements = calculateAchievements(stats, results);

        // 8. Weekly Activity for Chart
        const weeklyActivity = calculateWeeklyActivity(results);

        // 9. Format Recent Attempts (up to 10)
        const recentAttempts = results.slice(0, 10).map(r => ({
            id: r.id,
            category: r.category,
            session: r.session || 1,
            score: r.score,
            total: r.total,
            percentage: Math.round(r.percentage),
            passed: r.percentage >= 70,
            createdAt: r.createdAt || r.created_at,
            created_at: r.createdAt || r.created_at
        }));

        // 10. Real-time User Notifications
        const notifications = calculateNotifications(user, results, certificates, streak);

        return res.status(200).json({
            success: true,
            data: {
                user,
                stats,
                recentAttempts,
                technologyProgress,
                certificates,
                achievements,
                weeklyActivity,
                notifications
            }
        });

    } catch (error) {
        console.error('[User Dashboard Controller Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to load dashboard data. Please try again.'
        });
    }
};

/**
 * GET /api/dashboard/admin
 * Admin Dashboard Statistics & Aggregations
 * Protected by authMiddleware + adminMiddleware
 */
const getAdminDashboard = async (req, res) => {
    try {
        const period = req.query.period || 'month'; // '7d' | '30d' | 'month' | 'year' | 'all'

        // 1. Total counts from MongoDB
        const [
            totalUsers,
            totalTechnologies,
            totalQuestions,
            totalAttempts,
            totalCertificates,
            passedAttempts,
            failedAttempts,
            allUsers,
            allResults,
            recentUsersRaw,
            recentAttemptsRaw
        ] = await Promise.all([
            prisma.user.count(),
            prisma.category.count(),
            prisma.question.count(),
            prisma.quizResult.count(),
            prisma.quizResult.count({ where: { percentage: { gte: 80 } } }),
            prisma.quizResult.count({ where: { percentage: { gte: 70 } } }),
            prisma.quizResult.count({ where: { percentage: { lt: 70 } } }),
            prisma.user.findMany({ select: { createdAt: true } }),
            prisma.quizResult.findMany({ select: { category: true, percentage: true, createdAt: true } }),
            prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    avatar: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            }),
            prisma.quizResult.findMany({
                include: {
                    user: {
                        select: { id: true, name: true, email: true, avatar: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            })
        ]);

        // 2. Average Quiz Score across all attempts
        const averageScore = totalAttempts > 0
            ? parseFloat((allResults.reduce((acc, r) => acc + (parseFloat(r.percentage) || 0), 0) / totalAttempts).toFixed(1))
            : 0;

        // 3. User Growth Timeline (grouped by day)
        let daysToLookBack = 30;
        if (period === '7d' || period === 'week') daysToLookBack = 7;
        else if (period === '30d' || period === 'month') daysToLookBack = 30;
        else if (period === 'year') daysToLookBack = 365;

        const timelineMap = {};
        const now = new Date();

        for (let i = daysToLookBack - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            timelineMap[dateStr] = { date: dateStr, users: 0, attempts: 0 };
        }

        // Populate actual user growth
        allUsers.forEach(u => {
            const dateStr = new Date(u.createdAt).toISOString().split('T')[0];
            if (timelineMap[dateStr]) {
                timelineMap[dateStr].users += 1;
            }
        });

        // Populate actual quiz activity
        allResults.forEach(r => {
            const dateStr = new Date(r.createdAt).toISOString().split('T')[0];
            if (timelineMap[dateStr]) {
                timelineMap[dateStr].attempts += 1;
            }
        });

        const timelineArray = Object.values(timelineMap);
        const userGrowth = timelineArray.map(t => ({ date: t.date, users: t.users }));
        const quizActivity = timelineArray.map(t => ({ date: t.date, attempts: t.attempts }));

        // 4. Popular Technologies Aggregation
        const techCounts = {};
        allResults.forEach(r => {
            const cat = r.category || 'General';
            if (!techCounts[cat]) {
                techCounts[cat] = {
                    category: cat,
                    attempts: 0,
                    totalScore: 0,
                    passedCount: 0
                };
            }
            techCounts[cat].attempts += 1;
            techCounts[cat].totalScore += parseFloat(r.percentage) || 0;
            if (r.percentage >= 70) techCounts[cat].passedCount += 1;
        });

        const popularTechnologies = Object.values(techCounts)
            .map(t => ({
                category: t.category,
                attempts: t.attempts,
                averageScore: Math.round(t.totalScore / t.attempts),
                passRate: Math.round((t.passedCount / t.attempts) * 100)
            }))
            .sort((a, b) => b.attempts - a.attempts);

        // 5. Recent Users
        const recentUsers = recentUsersRaw.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || 'user',
            avatar: u.avatar || '',
            createdAt: u.createdAt
        }));

        // 6. Recent Quiz Attempts
        const recentAttempts = recentAttemptsRaw.map(r => ({
            id: r.id,
            userName: r.user?.name || 'Anonymous Learner',
            userEmail: r.user?.email || '',
            category: r.category,
            session: r.session || 1,
            score: r.score,
            total: r.total,
            percentage: Math.round(r.percentage),
            passed: r.percentage >= 70,
            createdAt: r.createdAt
        }));

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalTechnologies,
                    totalQuestions,
                    totalAttempts,
                    totalCertificates,
                    passedAttempts,
                    failedAttempts,
                    averageScore
                },
                userGrowth,
                quizActivity,
                popularTechnologies,
                recentUsers,
                recentAttempts
            }
        });

    } catch (error) {
        console.error('[Admin Dashboard Controller Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to load admin dashboard data. Please try again.'
        });
    }
};

/**
 * GET /api/dashboard/leaderboard
 * Global Leaderboard derived dynamically from MongoDB
 */
const getLeaderboard = async (req, res) => {
    try {
        const { timeframe = 'all-time', category = 'All' } = req.query;

        // Fetch users with their quiz results
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                createdAt: true,
                results: {
                    select: {
                        id: true,
                        category: true,
                        score: true,
                        total: true,
                        percentage: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        // Filter results by timeframe and category if specified
        const now = new Date();
        const performers = users.map(user => {
            let userResults = user.results || [];

            // Filter by Category
            if (category && category !== 'All') {
                userResults = userResults.filter(r => 
                    (r.category || '').toLowerCase() === category.toLowerCase()
                );
            }

            // Filter by Timeframe
            if (timeframe === 'monthly') {
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                userResults = userResults.filter(r => new Date(r.createdAt) >= thirtyDaysAgo);
            } else if (timeframe === 'weekly') {
                const sevenDaysAgo = new Date(now);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                userResults = userResults.filter(r => new Date(r.createdAt) >= sevenDaysAgo);
            }

            const quizzes = userResults.length;
            const certs = userResults.filter(r => r.percentage >= 80).length;
            const streak = calculateStreak(userResults);
            
            const score = quizzes > 0
                ? parseFloat((userResults.reduce((sum, r) => sum + (parseFloat(r.percentage) || 0), 0) / quizzes).toFixed(1))
                : 0;

            const xp = Math.round(userResults.reduce((sum, r) => {
                let pts = (parseFloat(r.percentage) || 0) * 10;
                if (r.percentage >= 80) pts += 100;
                return sum + pts;
            }, 0));

            const initials = user.name
                ? user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
                : 'U';

            // Dominant tech category
            const categoryCounts = {};
            userResults.forEach(r => {
                categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
            });
            const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0] || 'Full Stack';

            return {
                id: user.id,
                name: user.name || 'Developer',
                email: user.email,
                avatar: user.avatar || '',
                initials,
                role: user.role === 'admin' ? 'Administrator' : 'Software Engineer',
                xp,
                score,
                quizzes,
                certs,
                streak,
                category: topCategory,
                trend: quizzes > 0 ? 'up' : 'same',
                change: quizzes > 0 ? '+1' : '0'
            };
        });

        // Sort by XP DESC, then Score DESC
        performers.sort((a, b) => {
            if (b.xp !== a.xp) return b.xp - a.xp;
            return b.score - a.score;
        });

        // Assign real rank
        const rankedPerformers = performers.map((p, idx) => ({
            ...p,
            rank: idx + 1
        }));

        return res.status(200).json({
            success: true,
            leaderboard: rankedPerformers,
            totalRanked: rankedPerformers.length
        });

    } catch (error) {
        console.error('[Leaderboard Controller Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to load leaderboard. Please try again.'
        });
    }
};

/**
 * GET /api/dashboard/certificates
 * Real user certificates from MongoDB
 */
const getMyCertificates = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const results = await prisma.quizResult.findMany({
            where: { userId: String(userId) },
            orderBy: { createdAt: 'desc' }
        });

        const certificates = results
            .filter(r => r.percentage >= 80)
            .map(r => ({
                id: `HB-CERT-${r.id.slice(-6).toUpperCase()}`,
                resultId: r.id,
                tech: r.category,
                category: r.category,
                score: Math.round(r.percentage),
                percentage: Math.round(r.percentage),
                date: new Date(r.createdAt || r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                createdAt: r.createdAt || r.created_at,
                issued: true
            }));

        return res.status(200).json({
            success: true,
            certificates
        });
    } catch (error) {
        console.error('[Certificates Controller Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch certificates'
        });
    }
};

module.exports = {
    getUserDashboard,
    getAdminDashboard,
    getLeaderboard,
    getMyCertificates
};
