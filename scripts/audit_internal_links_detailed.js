const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const { SEO_PAGES_CONFIG, TECHNOLOGY_SEO_SLUGS } = require('../src/config/seoPagesConfig.js');
const { INITIAL_BLOG_ARTICLES } = require('../src/services/blogArticles.js');

// 1. Get all published games
const ALL_GAME_SLUGS = [
    'code-puzzle',
    'find-the-bug',
    'output-predictor',
    'code-scramble',
    'missing-code',
    'logic-builder',
    'sql-challenge',
    'memory-match',
    'speed-typing',
    'code-typing',
    'sixty-second-challenge',
    'error-free-typing',
    'syntax-typing',
    'word-rain',
    'csharp-oop-challenge',
    'csharp-collections-challenge',
    'csharp-linq-challenge',
    'csharp-exception-handling',
    'complete-the-code',
    'csharp-quiz-challenge'
];

// 2. All canonical public pages that should be crawlable and indexable
const ALL_CANONICAL_PAGES = [
    '/',
    '/technologies',
    ...TECHNOLOGY_SEO_SLUGS.map(s => `/technologies/${s}`),
    '/games',
    ...ALL_GAME_SLUGS.map(s => `/games/${s}`),
    '/blog',
    ...INITIAL_BLOG_ARTICLES.map(a => `/blog/${a.slug}`),
    '/login',
    '/register',
    '/certificate/view',
    '/leaderboard',
    '/leaderboard/full',
    '/privacy-policy',
    '/terms',
    '/about',
    '/contact',
    '/delete-account'
];

console.log(`Total canonical public pages in Hangbug catalog: ${ALL_CANONICAL_PAGES.length}`);

// Inspect specific components
const keyFiles = [
    'src/pages/Landing.jsx',
    'src/components/Navbar.jsx',
    'src/components/Footer.jsx',
    'src/pages/quiz/Technologies.jsx',
    'src/pages/quiz/TechnologyDetail.jsx',
    'src/pages/games/GamesHub.jsx',
    'src/pages/games/GamePlayer.jsx',
    'src/pages/blog/BlogList.jsx',
    'src/pages/blog/BlogDetail.jsx',
    'src/pages/legal/AboutUs.jsx',
    'src/pages/legal/ContactUs.jsx',
    'src/pages/legal/PrivacyPolicy.jsx',
    'src/pages/legal/TermsOfService.jsx',
    'src/pages/legal/DeleteAccount.jsx',
    'src/pages/certificates/CertificateView.jsx',
    'src/pages/leaderboard/Leaderboard.jsx',
    'src/config/seoPagesConfig.js',
    'src/services/blogArticles.js',
    'scripts/prerenderPublicPages.mjs',
    'public/sitemap.xml',
    'public/llms.txt',
    'public/llms-full.txt'
];

function extractLinksFromFile(relPath) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(fullPath)) return [];
    const content = fs.readFileSync(fullPath, 'utf8');

    const links = [];

    // Link/NavLink to="..."
    const toMatches = content.matchAll(/<(?:Link|NavLink)\s+[^>]*?to=(?:["']|{\s*["'])([^"'`{}]+)(?:["']|["']\s*})[^>]*?>([\s\S]*?)<\/(?:Link|NavLink)>/g);
    for (const m of toMatches) {
        links.push({
            type: 'router_link',
            target: m[1],
            text: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
            raw: m[0].slice(0, 100)
        });
    }

    // Anchor <a href="...">
    const aMatches = content.matchAll(/<a\s+[^>]*?href=(?:["']|{\s*["'])([^"'`{}]+)(?:["']|["']\s*})[^>]*?>([\s\S]*?)<\/a>/g);
    for (const m of aMatches) {
        links.push({
            type: 'anchor_tag',
            target: m[1],
            text: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
            raw: m[0].slice(0, 100)
        });
    }

    // Config arrays e.g. { to: '/...', label: '...' }
    const cfgMatches = content.matchAll(/{\s*(?:label|title|name):\s*['"]([^'"]+)['"]\s*,\s*(?:to|path):\s*['"]([^'"]+)['"]/g);
    for (const m of cfgMatches) {
        links.push({
            type: 'config_object',
            target: m[2],
            text: m[1],
            raw: m[0]
        });
    }

    const cfgMatches2 = content.matchAll(/{\s*(?:to|path):\s*['"]([^'"]+)['"]\s*,\s*(?:label|title|name):\s*['"]([^'"]+)['"]/g);
    for (const m of cfgMatches2) {
        links.push({
            type: 'config_object',
            target: m[1],
            text: m[2],
            raw: m[0]
        });
    }

    // Sitemap loc
    const locMatches = content.matchAll(/<loc>https?:\/\/www\.hangbug\.com([^<]+)<\/loc>/g);
    for (const m of locMatches) {
        links.push({
            type: 'sitemap_loc',
            target: m[1],
            text: m[1],
            raw: m[0]
        });
    }

    // llms.txt markdown links: [label](/path) or [label](https://www.hangbug.com/path)
    const mdMatches = content.matchAll(/\[([^\]]+)\]\((https?:\/\/www\.hangbug\.com)?(\/[^)]*)\)/g);
    for (const m of mdMatches) {
        links.push({
            type: 'markdown_link',
            target: m[3],
            text: m[1],
            raw: m[0]
        });
    }

    return links;
}

const fileLinksMap = {};
for (const f of keyFiles) {
    fileLinksMap[f] = extractLinksFromFile(f);
}

// 1. Check duplicate links within each page
console.log('\n=== DUPLICATE LINKS WITHIN INDIVIDUAL PAGES ===');
for (const [file, links] of Object.entries(fileLinksMap)) {
    const counts = {};
    for (const l of links) {
        const clean = l.target.split('?')[0].split('#')[0];
        if (!clean.startsWith('/')) continue;
        counts[clean] = (counts[clean] || 0) + 1;
    }
    const dupes = Object.entries(counts).filter(([_, c]) => c > 3);
    if (dupes.length > 0) {
        console.log(`\nFile: ${file}`);
        for (const [t, c] of dupes) {
            console.log(`  Target "${t}" appears ${c} times`);
        }
    }
}

// 2. Incoming links count for all canonical pages
const incoming = {};
for (const p of ALL_CANONICAL_PAGES) {
    incoming[p] = [];
}

for (const [file, links] of Object.entries(fileLinksMap)) {
    for (const l of links) {
        const clean = l.target.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
        if (incoming[clean]) {
            incoming[clean].push({ file, ...l });
        }
    }
}

console.log('\n=== CANONICAL PAGES INCOMING LINK AUDIT ===');
const orphans = [];
const underLinked = [];

for (const [page, inc] of Object.entries(incoming)) {
    const files = Array.from(new Set(inc.map(i => i.file)));
    if (files.length === 0) {
        orphans.push(page);
    } else if (files.length <= 2) {
        underLinked.push({ page, count: inc.length, files });
    }
}

console.log(`\nFound ${orphans.length} ORPHAN pages (0 incoming links from audited files):`);
orphans.forEach(p => console.log('  ORPHAN:', p));

console.log(`\nFound ${underLinked.length} UNDER-LINKED pages (<=2 incoming sources):`);
underLinked.forEach(u => console.log(`  UNDER-LINKED: ${u.page} (${u.count} links in [${u.files.join(', ')}])`));

// Check blog article internal links
console.log('\n=== BLOG ARTICLES INTERNAL LINKING AUDIT ===');
for (const article of INITIAL_BLOG_ARTICLES) {
    const mdContent = article.content || '';
    const internalMdLinks = [...mdContent.matchAll(/\[([^\]]+)\]\((https?:\/\/www\.hangbug\.com)?(\/[^)]*)\)/g)];
    console.log(`Article "${article.slug}": ${internalMdLinks.length} contextual internal link(s) in markdown content`);
    if (internalMdLinks.length === 0) {
        console.log(`  -> ZERO contextual links inside article body!`);
    } else {
        internalMdLinks.forEach(m => console.log(`     - [${m[1]}] -> ${m[3]}`));
    }
}

// Check TechnologyDetail internal links
console.log('\n=== TECHNOLOGY DETAIL INTERNAL LINKING AUDIT ===');
for (const tech of TECHNOLOGY_SEO_SLUGS) {
    const cfg = SEO_PAGES_CONFIG[tech];
    console.log(`Tech "${tech}": ${cfg?.internalLinks?.length || 0} internal links in SEO config`);
}

// Check GamesHub and GamePlayer links
console.log('\n=== GAMES HUB INTERNAL LINKING AUDIT ===');
const gamesHubLinks = fileLinksMap['src/pages/games/GamesHub.jsx'];
console.log(`GamesHub links count: ${gamesHubLinks.length}`);
const gamePlayerLinks = fileLinksMap['src/pages/games/GamePlayer.jsx'];
console.log(`GamePlayer links count: ${gamePlayerLinks.length}`);
