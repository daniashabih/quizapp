const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Gather all valid public routes from App.jsx, seoPagesConfig.js, gameService.js, blogArticles.js
const { SEO_PAGES_CONFIG, TECHNOLOGY_SEO_SLUGS } = require('../src/config/seoPagesConfig.js');

const VALID_GAME_SLUGS = [
    'code-puzzle', 'find-the-bug', 'output-predictor', 'code-scramble',
    'missing-code', 'logic-builder', 'sql-challenge', 'memory-match',
    'speed-typing', 'code-typing', 'sixty-second-challenge', 'error-free-typing',
    'syntax-typing', 'word-rain', 'csharp-oop-challenge', 'csharp-collections-challenge',
    'csharp-linq-challenge', 'csharp-exception-handling', 'complete-the-code',
    'csharp-quiz-challenge'
];

const PUBLISHED_BLOG_SLUGS = [
    'html-tutorial-for-beginners',
    'css-basics-beginners-guide',
    'javascript-fundamentals-beginners-guide',
    'php-programming-beginners-guide',
    'laravel-basics-mvc-architecture',
    'flutter-dart-mobile-app-development'
];

console.log('--- CANONICAL VALID PUBLIC ROUTES ---');
const CANONICAL_ROUTES = new Set([
    '/',
    '/technologies',
    ...TECHNOLOGY_SEO_SLUGS.map(s => `/technologies/${s}`),
    '/games',
    ...VALID_GAME_SLUGS.map(s => `/games/${s}`),
    '/blog',
    ...PUBLISHED_BLOG_SLUGS.map(s => `/blog/${s}`),
    '/login',
    '/register',
    '/forgot-password',
    '/certificate/view',
    '/leaderboard',
    '/leaderboard/full',
    '/privacy-policy',
    '/terms',
    '/about',
    '/contact',
    '/delete-account'
]);

// Redirect routes known from vercel.json and App.jsx
const KNOWN_REDIRECTS = {
    '/privacy': '/privacy-policy',
    '/resources': '/blog',
    '/signup': '/register',
    '/account-deletion': '/delete-account',
    '/data-deletion': '/delete-account',
    '/quizzes': '/technologies',
    '/quiz': '/technologies',
    '/technologies/level': '/technologies',
    '/technologies/reactjs': '/technologies/react',
    '/technologies/react.js': '/technologies/react',
    '/technologies/js': '/technologies/javascript',
    '/technologies/html5': '/technologies/html',
    '/technologies/css3': '/technologies/css',
    '/technologies/fundamentals': '/technologies/programming-fundamentals',
    '/technologies/programming-logic': '/technologies/programming-fundamentals',
    '/games/coding-memory-match': '/games/memory-match',
    '/games/csharp-complete-the-code': '/games/complete-the-code',
    '/games/complete-the-code-csharp': '/games/complete-the-code',
    '/seo': '/dashboard/seo',
    '/admin/seo': '/dashboard/seo',
    '/certificates': '/dashboard/certificates',
    '/profile': '/dashboard/profile',
    '/settings': '/dashboard/settings'
};

// Scan files in src, public
const DIRS_TO_SCAN = ['src', 'public'];

function getFiles(dir, exts = ['.jsx', '.js', '.tsx', '.ts', '.html', '.mjs', '.json', '.xml', '.txt']) {
    let results = [];
    const fullDir = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullDir)) return results;
    const list = fs.readdirSync(fullDir, { withFileTypes: true });
    for (const item of list) {
        if (item.name === 'node_modules' || item.name === 'dist' || item.name === '.git') continue;
        const resPath = path.join(fullDir, item.name);
        if (item.isDirectory()) {
            results = results.concat(getFiles(path.relative(ROOT_DIR, resPath), exts));
        } else {
            const ext = path.extname(item.name).toLowerCase();
            if (exts.includes(ext)) {
                results.push(resPath);
            }
        }
    }
    return results;
}

const allFiles = DIRS_TO_SCAN.flatMap(d => getFiles(d));

console.log(`Found ${allFiles.length} files to scan across ${DIRS_TO_SCAN.join(', ')}.`);

// Regexes to extract links:
// to="..." or to={'...'} or to={`...`}
// href="..." or href={'...'}
// loc in sitemap: <loc>https://www.hangbug.com/path</loc>
// canonicalUrl: 'https://www.hangbug.com/path'
// navigate('...')

const linkOccurrences = [];

for (const filePath of allFiles) {
    const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    // Skip test files, mocks, locks
    if (relPath.includes('node_modules') || relPath.endsWith('.lock') || relPath.includes('test')) continue;

    const content = fs.readFileSync(filePath, 'utf8');

    // Pattern 1: to="..." or to='...' or to={"..."} or to={'...'}
    const toMatches = content.matchAll(/to=(?:["']|{\s*["'])([^"'`{}]+)(?:["']|["']\s*})/g);
    for (const m of toMatches) {
        linkOccurrences.push({ source: relPath, raw: m[1], type: 'to' });
    }

    // Pattern 2: href="..." or href='...'
    const hrefMatches = content.matchAll(/href=(?:["']|{\s*["'])([^"'`{}]+)(?:["']|["']\s*})/g);
    for (const m of hrefMatches) {
        linkOccurrences.push({ source: relPath, raw: m[1], type: 'href' });
    }

    // Pattern 3: <loc>https://www.hangbug.com/...</loc>
    const locMatches = content.matchAll(/<loc>https?:\/\/www\.hangbug\.com([^<]+)<\/loc>/g);
    for (const m of locMatches) {
        linkOccurrences.push({ source: relPath, raw: m[1], type: 'sitemap_loc' });
    }

    // Pattern 4: internalLinks arrays e.g. { label: '...', to: '...' } or path: '...'
    const objToMatches = content.matchAll(/(?:to|path|canonicalPath|url):\s*['"](\/[^'"]*)['"]/g);
    for (const m of objToMatches) {
        linkOccurrences.push({ source: relPath, raw: m[1], type: 'config_path' });
    }

    // Pattern 5: navigate('...')
    const navMatches = content.matchAll(/navigate\(\s*['"](\/[^'"]*)['"]/g);
    for (const m of navMatches) {
        linkOccurrences.push({ source: relPath, raw: m[1], type: 'navigate' });
    }
}

// Clean and filter links (only internal web links starting with / or hangbug.com)
const cleanedLinks = [];
for (const item of linkOccurrences) {
    let url = item.raw.trim();
    if (url.startsWith('https://www.hangbug.com')) {
        url = url.replace('https://www.hangbug.com', '') || '/';
    } else if (url.startsWith('http://www.hangbug.com')) {
        url = url.replace('http://www.hangbug.com', '') || '/';
    } else if (url.startsWith('https://hangbug.com')) {
        url = url.replace('https://hangbug.com', '') || '/';
    }

    // Ignore non-internal links (e.g. mailto, external https, #anchors, api calls)
    if (!url.startsWith('/')) continue;
    if (url.startsWith('/api') || url.startsWith('/assets') || url.startsWith('/branding') || url.startsWith('/favicon') || /\.(png|svg|ico|xml|txt|json|pdf|jpg|jpeg)$/i.test(url)) continue;

    // Remove hash and query for path evaluation
    const cleanPath = url.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/';
    cleanedLinks.push({
        source: item.source,
        raw: item.raw,
        path: cleanPath,
        fullUrl: url,
        type: item.type
    });
}

console.log(`Total internal link occurrences extracted: ${cleanedLinks.length}`);

// Analysis:
// 1. Broken / Nonexistent links (neither canonical nor redirect nor protected dashboard/admin)
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/quiz/start', '/quiz/result'];

const brokenLinks = [];
const redirectLinks = [];
const incorrectTechLinks = [];
const validLinks = [];

for (const link of cleanedLinks) {
    if (KNOWN_REDIRECTS[link.path]) {
        redirectLinks.push({ ...link, destination: KNOWN_REDIRECTS[link.path] });
    } else if (
        link.path.startsWith('/technologies/') &&
        !CANONICAL_ROUTES.has(link.path) &&
        !['/technologies'].includes(link.path)
    ) {
        incorrectTechLinks.push(link);
    } else if (
        CANONICAL_ROUTES.has(link.path) ||
        PROTECTED_PREFIXES.some(p => link.path === p || link.path.startsWith(p + '/'))
    ) {
        validLinks.push(link);
    } else {
        brokenLinks.push(link);
    }
}

console.log('\n=== AUDIT RESULTS ===');
console.log(`Valid Links: ${validLinks.length}`);
console.log(`Redirect Links: ${redirectLinks.length}`);
console.log(`Incorrect Technology Links: ${incorrectTechLinks.length}`);
console.log(`Broken / Nonexistent Links: ${brokenLinks.length}`);

if (redirectLinks.length > 0) {
    console.log('\n--- REDIRECT LINKS FOUND ---');
    const grouped = {};
    for (const r of redirectLinks) {
        const key = `${r.path} -> ${r.destination}`;
        grouped[key] = (grouped[key] || 0) + 1;
        console.log(`  [${r.source}] ${r.raw} points to redirect (should be: ${r.destination})`);
    }
    console.log('Summary of redirects:', grouped);
}

if (incorrectTechLinks.length > 0) {
    console.log('\n--- INCORRECT TECHNOLOGY LINKS FOUND ---');
    for (const it of incorrectTechLinks) {
        console.log(`  [${it.source}] ${it.raw} (path: ${it.path})`);
    }
}

if (brokenLinks.length > 0) {
    console.log('\n--- BROKEN / NONEXISTENT LINKS FOUND ---');
    for (const bl of brokenLinks) {
        console.log(`  [${bl.source}] ${bl.raw} (path: ${bl.path})`);
    }
}

// 2. Orphan Pages: Canonical public routes that have NO incoming links from anywhere in src/ or prerender!
console.log('\n--- INCOMING LINK COUNTS FOR ALL CANONICAL PUBLIC ROUTES ---');
const incomingMap = {};
for (const route of CANONICAL_ROUTES) {
    incomingMap[route] = [];
}

for (const link of cleanedLinks) {
    if (incomingMap[link.path]) {
        incomingMap[link.path].push(link);
    }
}

const orphanPages = [];
const lowIncomingPages = [];

for (const [route, links] of Object.entries(incomingMap)) {
    const distinctSources = new Set(links.map(l => l.source));
    console.log(`${route}: ${links.length} incoming link(s) across ${distinctSources.size} file(s)`);
    if (links.length === 0) {
        orphanPages.push(route);
    } else if (links.length < 3) {
        lowIncomingPages.push({ route, count: links.length, sources: Array.from(distinctSources) });
    }
}

console.log('\n=== ORPHAN PAGES ===');
console.log(orphanPages.length > 0 ? orphanPages : 'None! All canonical routes have at least 1 incoming link.');

console.log('\n=== PAGES WITH LOW INCOMING LINKS (<3) ===');
console.log(lowIncomingPages);
