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

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/technologies', categoryRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/activity', activityRoutes);

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
}

if (require.main === module) {
    startServer();
}

module.exports = app;

