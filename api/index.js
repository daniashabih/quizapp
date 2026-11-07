const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./_routes/authRoutes');
const adminRoutes = require('./_routes/adminRoutes');
const questionRoutes = require('./_routes/questionRoutes');
const categoryRoutes = require('./_routes/categoryRoutes');
const resultRoutes = require('./_routes/resultRoutes');
const activityRoutes = require('./_routes/activityRoutes');
const dashboardRoutes = require('./_routes/dashboardRoutes');
const attemptRoutes = require('./_routes/attemptRoutes');
const settingRoutes = require('./_routes/settingRoutes');
const quizRoutes = require('./_routes/quizRoutes');
const certificateRoutes = require('./_routes/certificateRoutes');
const userRoutes = require('./_routes/userRoutes');
const gameRoutes = require('./_routes/gameRoutes');
const { getDynamicSitemap, getRobotsTxt } = require('./_controllers/seoController');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxies (e.g. Vercel, Render)
app.set('trust proxy', 1);

app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth rate limiter to prevent brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.'
    }
});

// Centralized Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/technologies', categoryRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/api/games', gameRoutes); // Defensive alias for clients with redundant base URL

// Canonical Technical SEO Directives & Dynamic XML Sitemap
app.get('/robots.txt', getRobotsTxt);
app.get('/sitemap.xml', getDynamicSitemap);
app.get('/api/sitemap.xml', getDynamicSitemap);

// Technical SEO 301 Canonical Redirects
app.get('/privacy', (req, res) => res.redirect(301, '/privacy-policy'));
app.get('/account-deletion', (req, res) => res.redirect(301, '/delete-account'));
app.get('/data-deletion', (req, res) => res.redirect(301, '/delete-account'));
app.get('/quizzes', (req, res) => res.redirect(301, '/technologies'));
app.get('/quiz', (req, res) => res.redirect(301, '/technologies'));
app.get('/technologies/level', (req, res) => res.redirect(301, '/technologies'));
app.get('/games/coding-memory-match', (req, res) => res.redirect(301, '/games/memory-match'));
app.get('/seo', (req, res) => res.redirect(301, '/dashboard/seo'));
app.get('/admin/seo', (req, res) => res.redirect(301, '/dashboard/seo'));
app.get('/certificates', (req, res) => res.redirect(301, '/dashboard/certificates'));
app.get('/profile', (req, res) => res.redirect(301, '/dashboard/profile'));
app.get('/settings', (req, res) => res.redirect(301, '/dashboard/settings'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API 404 Handler - Catch-all for unmatched API routes
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global Error Handler
app.use((err, req, res, _next) => {
    console.error('=== ERROR ===');
    console.error('Message:', err.message);
    
    // Log Prisma-specific errors with more detail
    if (err.code && err.code.startsWith('P')) {
        console.error('Prisma Error Code:', err.code);
    }

    res.status(err.status || 500).json({ 
        message: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.use((req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });

    if (process.env.NODE_ENV !== 'production' && Number(PORT) !== 5173) {
        const devMirror = app.listen(5173, '0.0.0.0', () => {
            console.log('Dev server also listening on http://localhost:5173 (Google OAuth authorized origin)');
        });
        devMirror.on('error', () => {
            // Port 5173 already in use (e.g. standalone Vite server running)
        });
    }
}

if (require.main === module) {
    startServer();
}

module.exports = app;
