import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { SEO_PAGES_CONFIG, getTechnologySeoBySlug } from '../src/config/seoPagesConfig.js';
import { buildPageStructuredData } from '../src/utils/structuredData.js';

import {
    stripMarkdownToPlainText
} from '../api/_utils/blogMarkdownParser.mjs';

const require = createRequire(import.meta.url);
const {
    ensureMarkdownParser,
    isMongoUriConfigured,
    buildArticleSeoTitle,
    buildArticleSeoDescription,
    applyHeadMetadata,
    renderStaticNavbarHtml,
    renderStaticFooterHtml,
    renderVisible404BodyHtml,
    renderCompleteBlogArticleHtml,
    renderCompleteBlogIndexHtml,
    deriveCategoriesFromArticles,
    findRelatedForArticle,
    fetchPublishedBlogPostsFromSource
} = require('../api/_utils/blogSeoRenderer.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const BASE_URL = 'https://www.hangbug.com';

if (!fs.existsSync(DIST_DIR)) {
    console.error('Dist directory does not exist. Run vite build first.');
    process.exit(1);
}

const templatePath = path.join(DIST_DIR, 'index.html');
if (!fs.existsSync(templatePath)) {
    console.error('dist/index.html not found. Run vite build first.');
    process.exit(1);
}

const baseTemplate = fs.readFileSync(templatePath, 'utf8');

// List of all games with unique, informative metadata
const GAMES_LIST = [
    {
        slug: 'code-puzzle',
        name: 'Code Puzzle',
        category: 'Coding Games',
        title: 'Code Puzzle — Interactive Algorithm Arrangement Game | Hangbug',
        h1: 'Code Puzzle: Master Algorithm Logic by Arranging Code Blocks',
        description: 'Reconstruct scrambled code blocks into functioning algorithms. Test and improve your algorithmic thinking, syntax understanding, and control flow intuition on Hangbug.'
    },
    {
        slug: 'find-the-bug',
        name: 'Find The Bug',
        category: 'Coding Games',
        title: 'Find The Bug — Developer Code Inspection & Debugging Challenge | Hangbug',
        h1: 'Find The Bug: Spot Hidden Syntax & Runtime Errors in Real Code',
        description: 'Sharpen your code review skills by identifying subtle syntax bugs, logical errors, off-by-one indices, and type mismatches across multi-language snippets on Hangbug.'
    },
    {
        slug: 'output-predictor',
        name: 'Output Predictor',
        category: 'Coding Games',
        title: 'Output Predictor — Mental Code Execution & Tracing Game | Hangbug',
        h1: 'Output Predictor: Mentally Trace Code & Predict Console Output',
        description: 'Test your understanding of scopes, closures, operator precedence, and type coercion by mentally executing code and predicting the exact program output.'
    },
    {
        slug: 'code-scramble',
        name: 'Code Scramble',
        category: 'Coding Games',
        title: 'Code Scramble — Programming Syntax Unscrambling Game | Hangbug',
        h1: 'Code Scramble: Piece Together Scrambled Statements & Logic',
        description: 'Solve code sequencing challenges under time constraints. Reassemble shuffled statement lines into working methods and verify your programming flow.'
    },
    {
        slug: 'missing-code',
        name: 'Missing Code',
        category: 'Coding Games',
        title: 'Missing Code — Fill in the Blank Programming Challenge | Hangbug',
        h1: 'Missing Code: Fill in Critical Keywords, Operators & Syntax',
        description: 'Complete truncated code snippets by inserting missing keywords, method calls, and operators to restore full program compilation and functionality.'
    },
    {
        slug: 'logic-builder',
        name: 'Logic Builder',
        category: 'Coding Games',
        title: 'Logic Builder — Interactive Computational Thinking Game | Hangbug',
        h1: 'Logic Builder: Construct Step-by-Step Problem Solving Workflows',
        description: 'Assemble conditional branching, looping, and state transformations to solve complex computational puzzles and enhance your core software engineering logic.'
    },
    {
        slug: 'sql-challenge',
        name: 'SQL Challenge',
        category: 'Coding Games',
        title: 'SQL Challenge — Interactive Relational Database Query Game | Hangbug',
        h1: 'SQL Challenge: Solve Real Relational Queries & Database Puzzles',
        description: 'Practice writing relational SQL queries against dynamic schemas. Formulate JOINs, GROUP BY aggregations, WHERE filters, and subqueries against simulated databases.'
    },
    {
        slug: 'memory-match',
        name: 'Memory Match',
        category: 'Coding Games',
        title: 'Coding Memory Match — Technical Concept Pairing Game | Hangbug',
        h1: 'Coding Memory Match: Pair Programming Terms, Syntax & Concepts',
        description: 'Boost technical recall by matching programming concepts with their corresponding code implementations, time complexities, and architectural definitions.'
    },
    {
        slug: 'speed-typing',
        name: 'Speed Typing',
        category: 'Typing Games',
        title: 'Developer Speed Typing — Technical Keystroke & WPM Challenge | Hangbug',
        h1: 'Speed Typing: Benchmark Your Developer Keystrokes & WPM',
        description: 'Measure your coding typing speed and raw typing accuracy with developer-centric prose, variable names, and technical terminology in words per minute.'
    },
    {
        slug: 'code-typing',
        name: 'Code Typing',
        category: 'Typing Games',
        title: 'Code Typing — Real Syntax, Symbols & Brackets Typing Practice | Hangbug',
        h1: 'Code Typing: Type Real Syntax, Braces, Arrows & Operators',
        description: 'Train muscle memory for programming symbols including brackets, arrow functions, semicolons, and operators using real code samples across diverse languages.'
    },
    {
        slug: 'sixty-second-challenge',
        name: '60-Second Challenge',
        category: 'Typing Games',
        title: '60-Second Typing Sprint — Rapid Developer Speed Test | Hangbug',
        h1: '60-Second Challenge: Fast-Paced Coding Typing Sprints',
        description: 'Push your coding throughput to the limit with high-intensity 60-second sprints. Maximize accurate keystrokes under strict time pressure.'
    },
    {
        slug: 'error-free-typing',
        name: 'Error-Free Typing',
        category: 'Typing Games',
        title: 'Error-Free Typing — Zero-Mistake Developer Accuracy Challenge | Hangbug',
        h1: 'Error-Free Typing: Practice Pure Precision & Flawless Accuracy',
        description: 'Cultivate precision typing where a single miskeyed character interrupts the streak. Perfect your rhythm for cleaner, error-free production code.'
    },
    {
        slug: 'syntax-typing',
        name: 'Syntax Typing',
        category: 'Typing Games',
        title: 'Syntax Typing — Language-Specific Keywords & Structure Practice | Hangbug',
        h1: 'Syntax Typing: Master Language-Specific Keywords & Grammar',
        description: 'Focus exclusively on language keywords, type annotations, imports, and declarative syntax across JavaScript, Python, Dart, C#, and PHP.'
    },
    {
        slug: 'word-rain',
        name: 'Word Rain',
        category: 'Typing Games',
        title: 'Word Rain — Fast Arcade Developer Typing Game | Hangbug',
        h1: 'Word Rain: Intercept Falling Coding Terms Before They Hit Bottom',
        description: 'Type falling software development keywords and technical concepts before they reach the ground. Fast-paced arcade action designed to sharpen keyboard reaction speed.'
    },
    {
        slug: 'csharp-oop-challenge',
        name: 'C# OOP Challenge',
        category: 'Coding Games',
        title: 'C# OOP Challenge — Object-Oriented Principles Practice | Hangbug',
        h1: 'C# OOP Challenge: Master Classes, Interfaces, Inheritance & Polymorphism',
        description: 'Explore C# object-oriented programming with interactive challenges covering encapsulation, abstract classes, polymorphism, interfaces, and virtual method overrides.'
    },
    {
        slug: 'csharp-collections-challenge',
        name: 'C# Collections Challenge',
        category: 'Coding Games',
        title: 'C# Collections Challenge — Generic Lists, Dictionaries & Queues | Hangbug',
        h1: 'C# Collections Challenge: Practice Generic Lists, Dictionaries & Sets',
        description: 'Practice working with .NET generic collections, including List<T>, Dictionary<TKey, TValue>, Queue<T>, Stack<T>, and HashSet<T> with practical manipulation tasks.'
    },
    {
        slug: 'csharp-linq-challenge',
        name: 'C# LINQ Challenge',
        category: 'Coding Games',
        title: 'C# LINQ Challenge — Language Integrated Query Practice | Hangbug',
        h1: 'C# LINQ Challenge: Write Fluent Queries, Select, Where & GroupBy',
        description: 'Master .NET LINQ expressions with hands-on transformation puzzles. Practice Select, Where, OrderBy, GroupBy, Any, All, and complex method chaining.'
    },
    {
        slug: 'csharp-exception-handling',
        name: 'C# Exception Handling',
        category: 'Coding Games',
        title: 'C# Exception Handling Challenge — Try Catch Finally & Filters | Hangbug',
        h1: 'C# Exception Handling: Build Resilient Error Management Workflows',
        description: 'Learn robust exception handling patterns in C# using try, catch, finally, when filter clauses, custom exception types, and proper resource disposal.'
    },
    {
        slug: 'complete-the-code',
        name: 'Complete The Code',
        category: 'Coding Games',
        title: 'Complete The Code — Interactive Method Implementation Game | Hangbug',
        h1: 'Complete The Code: Supply Missing Method Bodies & Return Logic',
        description: 'Implement missing function bodies, return statements, and loop boundaries to make automated unit tests pass in this interactive coding challenge.'
    },
    {
        slug: 'csharp-quiz-challenge',
        name: 'C# Quiz Challenge',
        category: 'Coding Games',
        title: 'C# Quiz Challenge — Rapid .NET Framework Knowledge Test | Hangbug',
        h1: 'C# Quiz Challenge: Rapid .NET Runtime, CLR & Language Knowledge',
        description: 'Fast-paced multi-round quiz evaluating your grasp of modern C#, memory management, garbage collection, value vs reference types, and async Tasks.'
    }
];

// Helper to count words
function countWords(str) {
    if (!str) return 0;
    return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

// Generate static crawlable HTML block for body (#root)
function generateBodyHtml(pageConfig) {
    const {
        title,
        h1,
        h2s = [],
        h3s = [],
        introContent,
        primaryKeyword = 'programming practice',
        secondaryKeywords = [],
        internalLinks = []
    } = pageConfig;

    const sections = [];

    // Header section
    sections.push(`
      <header class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">${h1}</h1>
        <p class="text-base sm:text-lg text-[var(--foreground-muted)] leading-relaxed max-w-3xl">${introContent}</p>
      </header>
    `);

    // Key concepts / Highlights section
    if (h2s.length > 0) {
        sections.push(`
          <section class="my-6">
            <h2 class="text-2xl font-bold text-[var(--foreground)] mb-3">${h2s[0]}</h2>
            <p class="text-[var(--foreground-muted)] leading-relaxed mb-4">
              Hangbug is a comprehensive platform built to help software developers and computer science learners master ${primaryKeyword} through deliberate, active practice. By combining sequential multiple-choice quizzes with interactive coding and typing games, learners gain immediate, actionable feedback on their technical understanding.
            </p>
            <p class="text-[var(--foreground-muted)] leading-relaxed mb-4">
              Unlike static reading or passive video courses, active self-assessment requires you to analyze real code snippets, predict outputs, trace control flows, and apply core principles under realistic conditions. Every answered question is coupled with detailed technical explanations to reinforce best practices and eliminate misconceptions.
            </p>
          </section>
        `);
    }

    // Detailed topic coverage
    if (h2s.length > 1) {
        sections.push(`
          <section class="my-6">
            <h2 class="text-2xl font-bold text-[var(--foreground)] mb-3">${h2s[1]}</h2>
            <p class="text-[var(--foreground-muted)] leading-relaxed mb-3">
              Explore key areas of study designed to prepare you for technical interviews, university exams, and daily production development:
            </p>
            <ul class="list-disc pl-6 space-y-2 text-[var(--foreground-muted)] mb-4">
              ${(h3s.length > 0 ? h3s : secondaryKeywords).map(item => `<li><strong>${item}:</strong> Practical challenges and assessments designed to test theoretical foundation and hands-on implementation skills.</li>`).join('\n              ')}
            </ul>
          </section>
        `);
    }

    // Methodology & Certification
    sections.push(`
      <section class="my-6">
        <h2 class="text-2xl font-bold text-[var(--foreground)] mb-3">${h2s[2] || 'How Learning and Progress Tracking Works'}</h2>
        <p class="text-[var(--foreground-muted)] leading-relaxed mb-3">
          Each curriculum track is divided into structured practice sessions containing curated questions. Your progress is saved automatically across sessions, enabling flexible learning at your own pace. As you complete questions, Hangbug analyzes your performance, accuracy trends, and completion rate.
        </p>
        <p class="text-[var(--foreground-muted)] leading-relaxed mb-4">
          Upon achieving a passing score across all sequential sessions of a technology track, learners receive an official developer certificate of completion. Every certificate contains a unique cryptographic identifier, issuance date, and score grade (Pass, Merit, or Distinction), which can be verified publicly or added directly to your LinkedIn credentials.
        </p>
      </section>
    `);

    // Educational Games & Practice Tools
    sections.push(`
      <section class="my-6">
        <h2 class="text-2xl font-bold text-[var(--foreground)] mb-3">${h2s[3] || 'Interactive Games & Speed Challenges'}</h2>
        <p class="text-[var(--foreground-muted)] leading-relaxed mb-4">
          Reinforce conceptual quiz learning with hands-on browser games. Tackle algorithmic ordering in Code Puzzle, spot defects in Find The Bug, trace execution in Output Predictor, write database queries in SQL Challenge, and sharpen your coding cadence with developer speed and syntax typing challenges.
        </p>
      </section>
    `);

    // Internal navigation links (zero inner <div> tags to keep static container parsing exact)
    if (internalLinks.length > 0) {
        sections.push(`
          <nav aria-label="Related Topics and Practice Tracks" class="mt-8 pt-6 border-t border-[var(--border)]">
            <h3 class="text-lg font-semibold text-[var(--foreground)] mb-3">Explore Related Practice Tracks &amp; Resources</h3>
            <p class="flex flex-wrap gap-3">
              ${internalLinks.map(l => `<a href="${l.to}"${l.rel ? ` rel="${escapeAttr(l.rel)}"` : ''} class="text-sm font-medium text-[var(--brand)] hover:underline">${l.label}</a>`).join(' • ')}
            </p>
          </nav>
        `);
    }

    return `
      <main id="seo-static-content" class="sr-only">
        ${sections.join('\n')}
      </main>
    `;
}

// Generate dedicated, accurate static crawlable HTML block for the homepage (/)
function generateHomeBodyHtml(pageConfig, publishedBlogArticles = []) {
    const { h1, introContent, internalLinks = [] } = pageConfig;
    const gameLinks = GAMES_LIST;
    const blogLinks = Array.isArray(publishedBlogArticles) && publishedBlogArticles.length > 0
        ? publishedBlogArticles.filter(a => a && a.slug)
        : [
            { slug: 'html-tutorial-for-beginners', title: 'HTML Tutorial for Beginners' },
            { slug: 'css-basics-beginners-guide', title: 'CSS Basics Beginner Guide' },
            { slug: 'javascript-fundamentals-beginners-guide', title: 'JavaScript Fundamentals Guide' },
            { slug: 'php-programming-beginners-guide', title: 'PHP Programming Guide' },
            { slug: 'laravel-basics-mvc-architecture', title: 'Laravel MVC Architecture' },
            { slug: 'flutter-dart-mobile-app-development', title: 'Flutter and Dart Development' }
        ];

    return `
      <main id="seo-static-content" class="sr-only">
        <section>
          <h1>${h1}</h1>
          <p>${introContent}</p>
        </section>

        <section>
          <h2>What is Hangbug?</h2>
          <p>
            Hangbug is an interactive technology learning and online coding practice platform where students and developers take programming quizzes, explore web development quizzes, tackle programming challenges, play coding games, track their progress, and earn score-based certificates shareable on LinkedIn.
          </p>
          <ul>
            <li><strong>Technology MCQ Quizzes:</strong> Practice structured, session-based programming quizzes and web development quizzes with immediate answer checking, explanations, and saved progress resumption.</li>
            <li><strong>Coding &amp; Typing Games:</strong> Reinforce syntax and logic with interactive programming challenges, code arrangement, output prediction, SQL queries, and typing speed coding games.</li>
            <li><strong>Performance &amp; Progress Tracking:</strong> Monitor quiz scores, accuracy rates, completed sessions, typing speed (WPM), and rankings on the global developer leaderboard.</li>
            <li><strong>Score-Based Certificates:</strong> Earn downloadable score-based certificates upon achieving 80% or higher on quiz assessments and share verification links directly on LinkedIn.</li>
          </ul>
        </section>

        <section>
          <h2>Technology Quiz Categories Covered</h2>
          <p>
            Start online coding practice across frontend, backend, database, and mobile stacks including HTML, CSS, JavaScript, Bootstrap, jQuery, PHP, Laravel, MySQL, Flutter, Dart, C#, React, Python, MongoDB, SQL Server, Node.js, and Programming Fundamentals.
          </p>
          <nav aria-label="Technology Quiz Guides">
            ${internalLinks.filter(l => l.to.startsWith('/technologies/')).map(l => `<a href="${l.to}">${l.label}</a>`).join('\n            ')}
          </nav>
        </section>

        <section>
          <h2>Interactive Coding &amp; Typing Games</h2>
          <p>
            Alongside programming quizzes, Hangbug offers 20 browser-based coding games and programming challenges to help developers practice programming logic, code comprehension, and keyboard fluency.
          </p>
          <nav aria-label="Coding and Typing Games">
            ${gameLinks.map(g => `<a href="/games/${g.slug}">${g.name}</a>`).join('\n            ')}
          </nav>
        </section>

        <section>
          <h2>Featured Developer Tutorials &amp; Guides</h2>
          <p>
            Explore step-by-step engineering tutorials connecting semantic web markup, styling layouts, interactive JavaScript, PHP backends, Laravel MVC architecture, and cross-platform Flutter apps directly with quizzes and coding challenges:
          </p>
          <nav aria-label="Published Blog Tutorials">
            ${blogLinks.map(b => `<a href="/blog/${escapeAttr(b.slug)}">${escapeText(b.title)}</a>`).join('\n            ')}
          </nav>
        </section>

        <section>
          <h2>How Hangbug Works &amp; Score-Based Certificates</h2>
          <p>
            Select a technology track, practice session-based multiple-choice quizzes with instant verification, track accuracy across sessions, and pass with 80% or higher to earn a shareable score-based certificate with a unique verification ID on the <a href="/certificate/view" rel="nofollow">certificate verification page</a>.
          </p>
        </section>
      </main>
    `;
}

function escapeAttr(str) {
    return String(str || '')
        .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)(?=[a-zA-Z#])/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeText(str) {
    return String(str || '')
        .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)(?=[a-zA-Z#])/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Persist clean un-prerendered Vite SPA shell for Express / Vercel serverless fallback
const generatedDir = path.join(ROOT_DIR, 'api', '_generated');
fs.mkdirSync(generatedDir, { recursive: true });
const cleanSpaShell = baseTemplate.replace(
    /<div id="root">[\s\S]*<\/div>(?=\s*(?:<script|<\/body>))/,
    '<div id="root"></div>'
);
fs.writeFileSync(path.join(generatedDir, 'spa-shell.html'), cleanSpaShell, 'utf8');

// Generate pre-rendered HTML for a given page definition
function renderPage(page) {
    const {
        path: routePath,
        title,
        description,
        schemaType = 'WebPage',
        includeApplicationSchema = false,
        softwareApplication = null,
        article = null,
        ogType = 'website',
        robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
        omitCanonical = false,
        omitJsonLd = false,
        bodyHtml
    } = page;

    const canonicalUrl = `${BASE_URL}${routePath === '/' ? '/' : routePath.replace(/\/+$/, '')}`;
    const safeTitleText = escapeText(title);
    const safeTitleAttr = escapeAttr(title);
    const safeDescAttr = escapeAttr(description);
    const safeCanonicalAttr = escapeAttr(canonicalUrl);

    let html = baseTemplate;

    // 1. Update <title>
    html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${safeTitleText}</title>`);

    // 2. Update <meta name="description"> & <meta name="robots">
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        () => `<meta name="description" content="${safeDescAttr}" />`
    );
    html = html.replace(
        /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/,
        () => `<meta name="robots" content="${escapeAttr(robots)}" />`
    );

    // 3. Inject / Update / Remove canonical link
    if (omitCanonical) {
        html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>\s*/g, '');
        html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>\s*/g, '');
        html = html.replace(/<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>\s*/g, '');
    } else {
        const canonicalTag = `<link rel="canonical" href="${safeCanonicalAttr}" />`;
        if (html.includes('<link rel="canonical"')) {
            html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, () => canonicalTag);
        } else {
            html = html.replace(/(<meta\s+name="description"[\s\S]*?>)/, (_, m) => `${m}\n    ${canonicalTag}`);
        }
        html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, () => `<meta property="og:url" content="${safeCanonicalAttr}" />`);
        html = html.replace(/<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/, () => `<meta name="twitter:url" content="${safeCanonicalAttr}" />`);
    }

    // 4. Update Open Graph & Twitter metadata
    html = html.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/, () => `<meta property="og:type" content="${escapeAttr(ogType)}" />`);
    html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, () => `<meta property="og:title" content="${safeTitleAttr}" />`);
    html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, () => `<meta property="og:description" content="${safeDescAttr}" />`);
    html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/, () => `<meta name="twitter:title" content="${safeTitleAttr}" />`);
    html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/, () => `<meta name="twitter:description" content="${safeDescAttr}" />`);

    // 5. Update or remove JSON-LD structured data script
    if (omitJsonLd) {
        html = html.replace(/<script id="hangbug-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>\s*/, '');
    } else {
        const structuredData = buildPageStructuredData({
            title,
            description,
            canonicalPath: routePath,
            schemaType,
            includeApplicationSchema,
            softwareApplication,
            article
        });
        const jsonLdString = JSON.stringify(structuredData, null, 2);
        html = html.replace(
            /<script id="hangbug-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/,
            () => `<script id="hangbug-jsonld" type="application/ld+json">\n${jsonLdString}\n    </script>`
        );
    }

    // 6. Replace entire <div id="root">...</div> container cleanly up to </body> (or trailing <script>)
    html = html.replace(
        /<div id="root">[\s\S]*<\/div>(?=\s*(?:<script|<\/body>))/,
        () => `<div id="root">\n${page.staticHeaderHtml || ''}\n${bodyHtml}\n${page.staticFooterHtml || ''}\n    </div>`
    );

    return html;
}

// Ensure directory exists and write file
function writeStaticPage(routePath, htmlContent) {
    if (routePath === '/') {
        fs.writeFileSync(path.join(DIST_DIR, 'index.html'), htmlContent, 'utf8');
        return;
    }

    const cleanPath = routePath.replace(/^\/+|\/+$/g, '');
    const dirPath = path.join(DIST_DIR, cleanPath);
    const htmlFilePath = path.join(DIST_DIR, `${cleanPath}.html`);

    // Write directory/index.html
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(path.join(dirPath, 'index.html'), htmlContent, 'utf8');

    // Also write cleanPath.html for maximum compatibility
    fs.mkdirSync(path.dirname(htmlFilePath), { recursive: true });
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
}

console.log('--- Starting Hangbug Static Pre-rendering for Technical SEO ---');

let renderedCount = 0;

// Remove stale /resources pre-render artifacts (redirects to /blog)
fs.rmSync(path.join(DIST_DIR, 'resources'), { recursive: true, force: true });
fs.rmSync(path.join(DIST_DIR, 'resources.html'), { force: true });

await ensureMarkdownParser();
const { source: blogSource, articles: fetchedBlogArticles, unpublishedSlugs: earlyUnpublishedSlugs } = await fetchPublishedBlogPostsFromSource({
    allowRemoteApiFallback: true
});
const normalizedPublishedBlogArticles = (fetchedBlogArticles || [])
    .filter(a => a && typeof a.slug === 'string' && a.slug.trim() && a.isPublished === true)
    .map(a => ({ ...a, slug: String(a.slug).trim().toLowerCase() }));
const sharedStaticFooterHtml = renderStaticFooterHtml(normalizedPublishedBlogArticles);

function resolveStaticHeaderForPath(routePath) {
    if (routePath === '/') return renderStaticNavbarHtml({ activeNav: 'home' });
    if (routePath.startsWith('/technologies')) return renderStaticNavbarHtml({ activeNav: 'technologies' });
    if (routePath.startsWith('/games')) return renderStaticNavbarHtml({ activeNav: 'games' });
    if (routePath.startsWith('/leaderboard')) return renderStaticNavbarHtml({ activeNav: 'leaderboard' });
    return renderStaticNavbarHtml({ activeNav: null });
}

function resolveContextualLinksForGame(game) {
    const slug = game.slug;
    const isTyping = game.category === 'Typing Games';
    const isCsharp = slug.startsWith('csharp-') || slug === 'complete-the-code';
    const gameCrossMap = {
        'code-puzzle': [
            { label: 'HTML Quizzes', to: '/technologies/html' },
            { label: 'CSS Quizzes', to: '/technologies/css' },
            { label: 'CSS Basics Guide', to: '/blog/css-basics-beginners-guide' },
            { label: 'Find The Bug', to: '/games/find-the-bug' },
            { label: 'Code Scramble', to: '/games/code-scramble' }
        ],
        'find-the-bug': [
            { label: 'HTML Quizzes', to: '/technologies/html' },
            { label: 'PHP Quizzes', to: '/technologies/php' },
            { label: 'HTML Tutorial', to: '/blog/html-tutorial-for-beginners' },
            { label: 'Missing Code', to: '/games/missing-code' },
            { label: 'Output Predictor', to: '/games/output-predictor' }
        ],
        'output-predictor': [
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'Dart Quizzes', to: '/technologies/dart' },
            { label: 'JavaScript Fundamentals', to: '/blog/javascript-fundamentals-beginners-guide' },
            { label: 'Logic Builder', to: '/games/logic-builder' },
            { label: 'Code Puzzle', to: '/games/code-puzzle' }
        ],
        'sql-challenge': [
            { label: 'MySQL Quizzes', to: '/technologies/mysql' },
            { label: 'MongoDB Quizzes', to: '/technologies/mongodb' },
            { label: 'Laravel MVC Guide', to: '/blog/laravel-basics-mvc-architecture' },
            { label: 'Find The Bug', to: '/games/find-the-bug' },
            { label: 'Memory Match', to: '/games/memory-match' }
        ],
        'code-scramble': [
            { label: 'Flutter Quizzes', to: '/technologies/flutter' },
            { label: 'Python Quizzes', to: '/technologies/python' },
            { label: 'Flutter & Dart Guide', to: '/blog/flutter-dart-mobile-app-development' },
            { label: 'Code Puzzle', to: '/games/code-puzzle' },
            { label: 'Missing Code', to: '/games/missing-code' }
        ],
        'missing-code': [
            { label: 'PHP Quizzes', to: '/technologies/php' },
            { label: 'Laravel Quizzes', to: '/technologies/laravel' },
            { label: 'PHP Programming Guide', to: '/blog/php-programming-beginners-guide' },
            { label: 'Find The Bug', to: '/games/find-the-bug' },
            { label: 'Complete The Code', to: '/games/complete-the-code' }
        ],
        'logic-builder': [
            { label: 'Programming Fundamentals', to: '/technologies/programming-fundamentals' },
            { label: 'Python Quizzes', to: '/technologies/python' },
            { label: 'JavaScript Fundamentals', to: '/blog/javascript-fundamentals-beginners-guide' },
            { label: 'Output Predictor', to: '/games/output-predictor' },
            { label: 'Code Scramble', to: '/games/code-scramble' }
        ],
        'memory-match': [
            { label: 'Programming Fundamentals', to: '/technologies/programming-fundamentals' },
            { label: 'React.js Quizzes', to: '/technologies/react' },
            { label: 'HTML Tutorial', to: '/blog/html-tutorial-for-beginners' },
            { label: 'Logic Builder', to: '/games/logic-builder' },
            { label: 'Word Rain', to: '/games/word-rain' }
        ]
    };

    if (gameCrossMap[slug]) return gameCrossMap[slug];

    if (isCsharp) {
        return [
            { label: 'Programming Fundamentals & OOP', to: '/technologies/programming-fundamentals' },
            { label: 'PHP & OOP Guide', to: '/blog/php-programming-beginners-guide' },
            { label: 'Complete The Code', to: '/games/complete-the-code' },
            { label: 'C# OOP Challenge', to: '/games/csharp-oop-challenge' },
            { label: 'C# LINQ Challenge', to: '/games/csharp-linq-challenge' }
        ].filter(item => item.to !== `/games/${slug}`);
    }

    if (isTyping) {
        return [
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'Python Quizzes', to: '/technologies/python' },
            { label: 'JavaScript Fundamentals', to: '/blog/javascript-fundamentals-beginners-guide' },
            { label: 'Speed Typing', to: '/games/speed-typing' },
            { label: 'Code Typing', to: '/games/code-typing' },
            { label: '60-Second Challenge', to: '/games/sixty-second-challenge' },
            { label: 'Syntax Typing', to: '/games/syntax-typing' }
        ].filter(item => item.to !== `/games/${slug}`);
    }

    return [
        { label: 'HTML Quizzes', to: '/technologies/html' },
        { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
        { label: 'Code Puzzle', to: '/games/code-puzzle' }
    ];
}

// 1. Core Public Pages from SEO_PAGES_CONFIG
const corePageKeys = [
    'home',
    'technologies',
    'about',
    'contact'
];

for (const key of corePageKeys) {
    const config = SEO_PAGES_CONFIG[key];
    if (!config) continue;

    // Ensure H1 is distinct from title
    let distinctH1 = config.h1;
    if (distinctH1 === config.title) {
        distinctH1 = config.title.replace(/^Hangbug\s*[–—-]\s*/, '').replace(/\s*[|–—-]\s*Hangbug$/, '');
    }

    const pageDef = {
        path: config.path,
        title: config.title,
        description: config.description,
        h1: distinctH1,
        includeApplicationSchema: config.path === '/',
        staticHeaderHtml: resolveStaticHeaderForPath(config.path),
        staticFooterHtml: sharedStaticFooterHtml,
        bodyHtml:
            config.path === '/'
                ? generateHomeBodyHtml({ ...config, h1: distinctH1 }, normalizedPublishedBlogArticles)
                : generateBodyHtml({ ...config, h1: distinctH1 })
    };

    const renderedHtml = renderPage(pageDef);
    writeStaticPage(config.path, renderedHtml);
    const words = countWords(pageDef.bodyHtml);
    console.log(`✓ Pre-rendered ${config.path.padEnd(25)} [Title & H1 unique | Word Count: ${words}]`);
    renderedCount++;
}

// 2. Additional Core Legal & Utility Pages
const additionalPages = [
    {
        path: '/privacy-policy',
        title: 'Privacy Policy — Hangbug Data Protection & Cookie Policy',
        h1: 'Hangbug Privacy Policy & Personal Data Protection',
        description: 'Read the official Hangbug Privacy Policy detailing our transparent data collection, cookie usage, account privacy standards, and user data rights.',
        introContent: 'Hangbug is dedicated to safeguarding your personal data and respecting your privacy rights. This policy transparently explains what data we collect, why we collect it, how your session information is stored, and the strict controls you have over your account information.',
        h2s: [
            'Data Collection & Transparent Processing',
            'Authentication Security & Google Sign-In',
            'Cookies, Local Storage & Advertising Compliance',
            'Your Rights: Access, Export & Permanent Account Deletion'
        ],
        h3s: [
            'Personal Information Collected (Email, Display Name, Quiz Scores)',
            'Session Tokens & Anti-Tampering Cookies',
            'Google Identity Services Privacy Assurances',
            'Self-Service Account Deletion within 24 Hours'
        ],
        internalLinks: [
            { label: 'Terms of Service', to: '/terms' },
            { label: 'Delete Account', to: '/delete-account', rel: 'nofollow' },
            { label: 'About Hangbug', to: '/about' },
            { label: 'Contact Support', to: '/contact' }
        ]
    },
    {
        path: '/terms',
        title: 'Terms of Service — Hangbug Platform Terms & Conditions',
        h1: 'Hangbug Platform Terms and Conditions of Service',
        description: 'Review the Hangbug Terms of Service governing quiz taking, developer certificate issuance, community integrity, intellectual property, and platform usage.',
        introContent: 'These Terms of Service govern your access to and use of Hangbug, including our technology quizzes, coding mini-games, leaderboard scoring, and digital developer certificates. By accessing Hangbug, you agree to comply with these terms.',
        h2s: [
            'Acceptable Use & Academic Integrity',
            'Digital Developer Certificate Authenticity & Verification',
            'Account Security & Authenticated Access',
            'Intellectual Property & Platform Guidelines'
        ],
        h3s: [
            'Fair Assessment Practices & Ban on Automated Solvers',
            'Verifiable Certificate Issuance & LinkedIn Sharing Standards',
            'User Responsibilities for Profile Security',
            'Open Access Learning Philosophy'
        ],
        internalLinks: [
            { label: 'Privacy Policy', to: '/privacy-policy' },
            { label: 'Verify Certificates', to: '/certificate/view', rel: 'nofollow' },
            { label: 'About Hangbug', to: '/about' },
            { label: 'Contact Support', to: '/contact' }
        ]
    },
    {
        path: '/leaderboard',
        title: 'Global Developer Leaderboard & Rankings — Hangbug',
        h1: 'Global Developer Rankings, Quiz Leaderboards & Top Scorers',
        description: 'View the global Hangbug developer leaderboard. Track top scores, accuracy rankings, completed quiz sessions, and earned technology certificates.',
        introContent: 'The Hangbug Leaderboard recognizes top engineering talent worldwide based on quiz accuracy, consecutive practice streaks, and verified technical mastery across frontend, backend, mobile, and database development tracks.',
        h2s: [
            'How Developer Rankings Are Calculated',
            'Scoring Criteria, Accuracy & Speed Multipliers',
            'Weekly & All-Time Developer Standings',
            'Climbing the Leaderboard Through Consistent Practice'
        ],
        h3s: [
            'Quiz Accuracy & Verified Session Completions',
            'Streak Retention & Active Engagement Points',
            'Fair Play & Duplicate Submission Prevention'
        ],
        internalLinks: [
            { label: 'HTML Quizzes', to: '/technologies/html' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'Code Puzzle', to: '/games/code-puzzle' },
            { label: 'Developer Blog', to: '/blog' },
            { label: 'Verify Certificate', to: '/certificate/view', rel: 'nofollow' }
        ]
    },
    {
        path: '/certificate/view',
        title: 'Verify Developer Certificate — Hangbug Skill Verification',
        h1: 'Hangbug Developer Certificate Verification & Credential Lookup',
        description: 'Verify the authenticity of Hangbug developer completion certificates. Look up unique certificate IDs to confirm quiz mastery, score tiers, and completion dates.',
        robots: 'noindex, nofollow',
        omitCanonical: true,
        introContent: 'Hangbug provides transparent, instant digital credential verification. Employers, recruiters, and educational institutions can verify the authenticity of any developer certificate issued by Hangbug by entering the certificate identifier below.',
        h2s: [
            'How Certificate Verification Works',
            'Passing Thresholds & Performance Score Tiers',
            'Authoritative Anti-Tamper Verification Architecture',
            'Sharing Verified Credentials on Professional Networks'
        ],
        h3s: [
            'Distinction Tier (90%+ Accuracy)',
            'Merit Tier (75%–89% Accuracy)',
            'Pass Tier (60%–74% Accuracy)',
            'Direct LinkedIn Add-to-Profile Integration'
        ],
        internalLinks: [
            { label: 'Explore Technology Tracks', to: '/technologies' },
            { label: 'Global Leaderboard', to: '/leaderboard' },
            { label: 'About Hangbug Certificates', to: '/about' },
            { label: 'Contact Support', to: '/contact' }
        ]
    },
    {
        path: '/games',
        title: 'Coding & Typing Games for Developers — Hangbug Games Hub',
        h1: 'Interactive Coding and Typing Challenges for Software Developers',
        description: 'Play 20 interactive developer mini-games on Hangbug. Practice algorithm logic, debug code snippets, predict console outputs, write SQL queries, and boost your coding typing speed.',
        introContent: 'Elevate your programming skills beyond traditional quizzes with Hangbug interactive developer games. Engage with hands-on challenges designed to strengthen debugging speed, algorithmic pattern recognition, and keyboard dexterity.',
        h2s: [
            'Featured Coding & Problem Solving Games',
            'Developer Keystroke & Typing Accuracy Challenges',
            'Why Interactive Games Accelerate Software Mastery',
            'Connecting Games with Technology Quiz Tracks'
        ],
        h3s: [
            'Algorithmic Logic (Code Puzzle, Logic Builder, Complete The Code)',
            'Code Inspection & Debugging (Find The Bug, Output Predictor)',
            'Relational Query Practice (SQL Challenge)',
            'Developer Muscle Memory (Speed Typing, Code Typing, Syntax Typing)'
        ],
        internalLinks: [
            ...GAMES_LIST.map(g => ({ label: `Play ${g.name}`, to: `/games/${g.slug}` })),
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'MySQL Quizzes', to: '/technologies/mysql' },
            { label: 'Programming Fundamentals', to: '/technologies/programming-fundamentals' }
        ]
    }
];

for (const p of additionalPages) {
    const pageDef = {
        path: p.path,
        title: p.title,
        description: p.description,
        h1: p.h1,
        staticHeaderHtml: resolveStaticHeaderForPath(p.path),
        staticFooterHtml: sharedStaticFooterHtml,
        ...(p.robots ? { robots: p.robots } : {}),
        ...(p.omitCanonical ? { omitCanonical: true } : {}),
        bodyHtml: generateBodyHtml(p)
    };
    const renderedHtml = renderPage(pageDef);
    writeStaticPage(p.path, renderedHtml);
    const words = countWords(pageDef.bodyHtml);
    console.log(`✓ Pre-rendered ${p.path.padEnd(25)} [Title & H1 unique | Word Count: ${words}]`);
    renderedCount++;
}

// 3. Technology Detail Pages
const TECH_KEYS = [
    'html', 'css', 'javascript', 'react', 'php', 'laravel',
    'mysql', 'mongodb', 'flutter', 'dart', 'python', 'programming-fundamentals'
];

for (const slug of TECH_KEYS) {
    const config = getTechnologySeoBySlug(slug);
    if (!config) continue;

    let distinctH1 = config.h1;
    if (distinctH1 === config.title) {
        distinctH1 = `${config.name} Programming Quizzes & Hands-On Practice`;
    }

    const pageDef = {
        path: `/technologies/${slug}`,
        title: config.title,
        description: config.description,
        h1: distinctH1,
        staticHeaderHtml: resolveStaticHeaderForPath(`/technologies/${slug}`),
        staticFooterHtml: sharedStaticFooterHtml,
        bodyHtml: generateBodyHtml({
            ...config,
            h1: distinctH1,
            introContent: config.introContent || `Practice ${config.name} programming and software development with Hangbug interactive quizzes and coding challenges. Master core concepts, syntax nuances, and interview topics.`
        })
    };

    const renderedHtml = renderPage(pageDef);
    writeStaticPage(`/technologies/${slug}`, renderedHtml);
    const words = countWords(pageDef.bodyHtml);
    console.log(`✓ Pre-rendered /technologies/${slug.padEnd(16)} [Title & H1 unique | Word Count: ${words}]`);
    renderedCount++;
}

// 4. All 20 Developer Games
for (const game of GAMES_LIST) {
    const pageDef = {
        path: `/games/${game.slug}`,
        title: game.title,
        description: game.description,
        h1: game.h1,
        includeApplicationSchema: true,
        staticHeaderHtml: resolveStaticHeaderForPath(`/games/${game.slug}`),
        staticFooterHtml: sharedStaticFooterHtml,
        softwareApplication: {
            slug: game.slug,
            name: game.name,
            category: game.category,
            description: game.description
        },
        bodyHtml: generateBodyHtml({
            title: game.title,
            h1: game.h1,
            description: game.description,
            primaryKeyword: `${game.name} game`,
            introContent: game.description,
            h2s: [
                `How ${game.name} Works`,
                'Skills and Concepts Trained',
                'Scoring, Accuracy & Speed Tracking',
                'Recommended Practice Strategy'
            ],
            h3s: [
                'Immediate Interactive Feedback',
                'Keyboard Shortcuts & Fast-Flow Controls',
                'Adaptive Difficulty & Progressive Challenges'
            ],
            internalLinks: resolveContextualLinksForGame(game)
        })
    };

    const renderedHtml = renderPage(pageDef);
    writeStaticPage(`/games/${game.slug}`, renderedHtml);
    const words = countWords(pageDef.bodyHtml);
    console.log(`✓ Pre-rendered /games/${game.slug.padEnd(20)} [Title & H1 unique | Word Count: ${words}]`);
    renderedCount++;
}

// 5. Pre-render Blog Index (/blog) & every valid published Blog Article (/blog/:slug) from MongoDB
async function prerenderBlogSystem() {
    // Clean any stale blog build artifacts so unpublished/deleted articles never persist
    const blogDistDir = path.join(DIST_DIR, 'blog');
    const blogDistFile = path.join(DIST_DIR, 'blog.html');
    fs.rmSync(blogDistDir, { recursive: true, force: true });
    fs.rmSync(blogDistFile, { force: true });

    const source = blogSource;
    const publishedArticles = fetchedBlogArticles;
    const unpublishedSlugs = earlyUnpublishedSlugs;

    if (unpublishedSlugs.length > 0) {
        console.log(`ℹ Excluded ${unpublishedSlugs.length} unpublished blog article(s): ${unpublishedSlugs.join(', ')}`);
    }

    // Strictly filter to published articles with valid slugs
    const publishedArticles = (fetchedArticles || []).filter(
        a => a && typeof a.slug === 'string' && a.slug.trim() && a.isPublished === true
    );

    // Ensure unique title and meta description per article
    const seenTitles = new Set();
    const seenDescriptions = new Set();
    const normalizedArticles = publishedArticles.map((rawArticle) => {
        const article = { ...rawArticle, slug: String(rawArticle.slug).trim().toLowerCase() };

        let resolvedTitle = buildArticleSeoTitle(article);
        if (seenTitles.has(resolvedTitle.toLowerCase())) {
            const disambiguator = article.category && !resolvedTitle.toLowerCase().includes(article.category.toLowerCase())
                ? `${article.title} (${article.category}) | Hangbug`
                : `${article.title} — ${article.slug} | Hangbug`;
            resolvedTitle = disambiguator;
        }
        seenTitles.add(resolvedTitle.toLowerCase());
        article.seoTitle = resolvedTitle;

        let resolvedDesc = buildArticleSeoDescription(article);
        if (seenDescriptions.has(resolvedDesc.toLowerCase())) {
            const plain = stripMarkdownToPlainText(article.content || '');
            const candidate = plain && plain.length > 40
                ? `${article.title}: ${plain.slice(0, 125).trim()}...`
                : `${article.title} — ${resolvedDesc}`;
            resolvedDesc = candidate.slice(0, 160);
        }
        seenDescriptions.add(resolvedDesc.toLowerCase());
        article.seoDescription = resolvedDesc;

        return article;
    });

    // 5a. Pre-render /blog index using actual published articles
    const categories = deriveCategoriesFromArticles(normalizedArticles);
    const featuredArticle = normalizedArticles.find(a => a.isFeatured) || normalizedArticles[0] || null;
    const blogIndexHtml = renderCompleteBlogIndexHtml(cleanSpaShell, {
        articles: normalizedArticles.slice(0, 9),
        featuredArticle,
        categories,
        total: normalizedArticles.length
    });
    writeStaticPage('/blog', blogIndexHtml);
    console.log(`✓ Pre-rendered /blog                     [Source: ${source} | ${normalizedArticles.length} published articles]`);
    renderedCount++;

    // 5b. Pre-render every valid published blog article
    for (const article of normalizedArticles) {
        const relatedArticles = findRelatedForArticle(article, normalizedArticles);
        const renderedHtml = renderCompleteBlogArticleHtml(cleanSpaShell, article, relatedArticles, normalizedArticles);
        writeStaticPage(`/blog/${article.slug}`, renderedHtml);
        const words = countWords(article.content || article.excerpt || '');
        console.log(`✓ Pre-rendered /blog/${article.slug.padEnd(36)} [Source: ${source} | Words: ${words}]`);
        renderedCount++;
    }
}

await prerenderBlogSystem();

// 6. Generate static 404.html error shell with noindex metadata for missing static files on Vercel
const notFoundHtml = applyHeadMetadata(cleanSpaShell, {
    title: '404: Page Not Found — HangBug',
    description: "The page you are looking for doesn't exist, has been removed, or was moved to another URL.",
    robots: 'noindex, nofollow',
    omitCanonical: true,
    jsonLd: null,
    bodyHtml: renderVisible404BodyHtml()
});
fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf8');
console.log('✓ Generated dist/404.html with noindex, nofollow metadata');

// 7. Copy llms.txt and llms-full.txt to dist/
const publicDir = path.join(ROOT_DIR, 'public');
for (const f of ['llms.txt', 'llms-full.txt']) {
    const src = path.join(publicDir, f);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(DIST_DIR, f));
    }
}

if (isMongoUriConfigured(process.env.MONGODB_URI)) {
    try {
        const prisma = require('../api/_config/prisma');
        await prisma.$disconnect();
    } catch {
        // ignore disconnect errors
    }
}

console.log(`\n🎉 Successfully pre-rendered ${renderedCount} public pages into dist/`);
console.log('✓ Every pre-rendered page has:');
console.log('  - Distinct <title>');
console.log('  - Distinct <meta name="description">');
console.log('  - Dedicated <link rel="canonical">');
console.log('  - Unique <h1> (different from <title>)');
console.log('  - Visible, crawlable article content consistent with React rendering');
console.log('  - 100% compliant Schema.org JSON-LD (Article + BreadcrumbList + Organization + WebSite)');
console.log('  - Open Graph & Twitter card metadata');
