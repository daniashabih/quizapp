const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
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
const blogRoutes = require('./_routes/blogRoutes');
const {
    getDynamicSitemap,
    getRobotsTxt,
    isKnownAppRoute,
    resolveAppRoute,
    findPrerenderedFile,
    renderStatusHtml
} = require('./_controllers/seoController');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxies (e.g. Vercel, Render)
app.set('trust proxy', 1);

// Restore original requested path when invoked via Vercel catch-all rewrite (?__hangbug_route=...)
app.use((req, _res, next) => {
    try {
        const parsed = new URL(req.url, 'https://www.hangbug.com');
        const rewrittenRoute = parsed.searchParams.get('__hangbug_route');
        if (typeof rewrittenRoute === 'string' && rewrittenRoute.length > 0) {
            const safeRoute = '/' + rewrittenRoute.replace(/^\/+/, '');
            if (!safeRoute.startsWith('/api/') && safeRoute !== '/api') {
                parsed.searchParams.delete('__hangbug_route');
                const remainingQs = parsed.searchParams.toString();
                req.url = safeRoute + (remainingQs ? `?${remainingQs}` : '');
            }
        }
    } catch {
        // Ignore malformed URLs and allow normal Express routing
    }
    next();
});

// SEO: Canonical Domain Redirection (non-www -> www) & Trailing Slash Normalization for known routes
app.use((req, res, next) => {
    const host = (req.headers.host || '').toLowerCase();
    if (host === 'hangbug.com') {
        const safeOriginal = req.originalUrl && req.originalUrl.startsWith('/')
            ? '/' + req.originalUrl.replace(/^\/+/, '')
            : '/';
        return res.redirect(301, `https://www.hangbug.com${safeOriginal}`);
    }
    if (!req.path.startsWith('/api') && req.path.length > 1 && req.path.endsWith('/')) {
        const query = req.url.slice(req.path.length);
        const safePath = '/' + req.path.slice(0, -1).replace(/^\/+/, '');
        if (isKnownAppRoute(safePath)) {
            return res.redirect(301, safePath + query);
        }
    }
    next();
});

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
app.use('/api/blog', blogRoutes);

// Canonical Technical SEO Directives, AI Crawlers & Dynamic XML Sitemap
app.get('/robots.txt', getRobotsTxt);
app.get('/sitemap.xml', getDynamicSitemap);
app.get('/api/sitemap.xml', getDynamicSitemap);
app.get('/sitemap', (req, res) => res.redirect(301, '/sitemap.xml'));
app.get('/robots', (req, res) => res.redirect(301, '/robots.txt'));
app.get('/llms.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const p = path.join(process.cwd(), 'public', 'llms.txt');
    if (fs.existsSync(p)) return res.sendFile(p);
    return res.status(404).send('# Not Found');
});
app.get('/llms-full.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const p = path.join(process.cwd(), 'public', 'llms-full.txt');
    if (fs.existsSync(p)) return res.sendFile(p);
    return res.status(404).send('# Not Found');
});

// Technical SEO 301 Canonical Redirects
app.get('/privacy', (req, res) => res.redirect(301, '/privacy-policy'));
app.get('/account-deletion', (req, res) => res.redirect(301, '/delete-account'));
app.get('/data-deletion', (req, res) => res.redirect(301, '/delete-account'));
app.get('/quizzes', (req, res) => res.redirect(301, '/technologies'));
app.get('/quiz', (req, res) => res.redirect(301, '/technologies'));
app.get('/technologies/level', (req, res) => res.redirect(301, '/technologies'));
app.get('/technologies/reactjs', (req, res) => res.redirect(301, '/technologies/react'));
app.get('/technologies/react.js', (req, res) => res.redirect(301, '/technologies/react'));
app.get('/technologies/js', (req, res) => res.redirect(301, '/technologies/javascript'));
app.get('/technologies/html5', (req, res) => res.redirect(301, '/technologies/html'));
app.get('/technologies/css3', (req, res) => res.redirect(301, '/technologies/css'));
app.get('/technologies/fundamentals', (req, res) => res.redirect(301, '/technologies/programming-fundamentals'));
app.get('/technologies/programming-logic', (req, res) => res.redirect(301, '/technologies/programming-fundamentals'));
app.get('/games/coding-memory-match', (req, res) => res.redirect(301, '/games/memory-match'));
app.get('/games/csharp-complete-the-code', (req, res) => res.redirect(301, '/games/complete-the-code'));
app.get('/games/complete-the-code-csharp', (req, res) => res.redirect(301, '/games/complete-the-code'));
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

async function handlePageRequest(req, res, next) {
    try {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.setHeader('X-Robots-Tag', 'noindex, nofollow');
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(404).send(renderStatusHtml({ statusCode: 404, noindex: true }));
        }

        const resolution = await resolveAppRoute(req.path);

        if (resolution.statusCode === 404) {
            res.setHeader('X-Robots-Tag', 'noindex, nofollow');
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(404).send(renderStatusHtml(resolution));
        }

        if (req.path.length > 1 && req.path.endsWith('/')) {
            const query = req.url.slice(req.path.length);
            return res.redirect(301, resolution.cleanPath + query);
        }

        if (resolution.noindex) {
            res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        }

        const prerenderedFile = findPrerenderedFile(resolution.cleanPath);
        if (prerenderedFile) {
            return res.status(200).sendFile(prerenderedFile);
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(renderStatusHtml(resolution));
    } catch (err) {
        return next(err);
    }
}

function registerStaticAndPageFallback() {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
        app.use(express.static(distPath, { redirect: false }));
    }
    app.use(handlePageRequest);
}

function registerErrorHandler() {
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
}

// Mount static/page resolution immediately for Vercel Serverless, production runs, and imported app tests
if (require.main !== module || process.env.NODE_ENV === 'production') {
    registerStaticAndPageFallback();
    registerErrorHandler();
}

async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'custom',
        });
        app.use(vite.middlewares);
        app.use(async (req, res, next) => {
            try {
                if (req.method !== 'GET' && req.method !== 'HEAD') {
                    return handlePageRequest(req, res, next);
                }
                const resolution = await resolveAppRoute(req.path);
                if (resolution.statusCode === 200 && req.path.length > 1 && req.path.endsWith('/')) {
                    const query = req.url.slice(req.path.length);
                    return res.redirect(301, resolution.cleanPath + query);
                }
                if (resolution.noindex || resolution.statusCode === 404) {
                    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
                }
                const rawHtml = renderStatusHtml(resolution);
                const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                return res.status(resolution.statusCode).end(transformed);
            } catch (e) {
                vite.ssrFixStacktrace(e);
                return next(e);
            }
        });
        registerErrorHandler();
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
