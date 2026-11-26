const {
    BASE_URL,
    SITE_HOME_URL,
    SITE_NAME,
    SITE_ALTERNATE_NAME,
    OFFICIAL_DESCRIPTION,
    DEFAULT_LOGO_URL,
    formatGameSeoTitle,
    normalizeCanonicalUrl,
    renderStaticNavbarHtml,
    renderStaticFooterHtml,
    applyHeadMetadata,
    buildOrganizationNode,
    buildWebSiteNode,
    buildBreadcrumbListNode
} = require('./blogSeoRenderer');

const GAMES_SEO_LIST = [
    {
        slug: 'code-puzzle',
        name: 'Code Puzzle',
        category: 'Coding Games',
        title: formatGameSeoTitle('Code Puzzle', 'Coding Games'),
        h1: 'Code Puzzle: Master Algorithm Logic by Arranging Code Blocks',
        description: 'Reconstruct scrambled code blocks into functioning algorithms. Test and improve your algorithmic thinking, syntax understanding, and control flow intuition on Hangbug.'
    },
    {
        slug: 'find-the-bug',
        name: 'Find The Bug',
        category: 'Coding Games',
        title: formatGameSeoTitle('Find The Bug', 'Coding Games'),
        h1: 'Find The Bug: Spot Hidden Syntax & Runtime Errors in Real Code',
        description: 'Sharpen your code review skills by identifying subtle syntax bugs, logical errors, off-by-one indices, and type mismatches across multi-language snippets on Hangbug.'
    },
    {
        slug: 'output-predictor',
        name: 'Output Predictor',
        category: 'Coding Games',
        title: formatGameSeoTitle('Output Predictor', 'Coding Games'),
        h1: 'Output Predictor: Mentally Trace Code & Predict Console Output',
        description: 'Test your understanding of scopes, closures, operator precedence, and type coercion by mentally executing code and predicting the exact program output.'
    },
    {
        slug: 'code-scramble',
        name: 'Code Scramble',
        category: 'Coding Games',
        title: formatGameSeoTitle('Code Scramble', 'Coding Games'),
        h1: 'Code Scramble: Piece Together Scrambled Statements & Logic',
        description: 'Solve code sequencing challenges under time constraints. Reassemble shuffled statement lines into working methods and verify your programming flow.'
    },
    {
        slug: 'missing-code',
        name: 'Missing Code',
        category: 'Coding Games',
        title: formatGameSeoTitle('Missing Code', 'Coding Games'),
        h1: 'Missing Code: Fill in Critical Keywords, Operators & Syntax',
        description: 'Complete truncated code snippets by inserting missing keywords, method calls, and operators to restore full program compilation and functionality.'
    },
    {
        slug: 'logic-builder',
        name: 'Logic Builder',
        category: 'Coding Games',
        title: formatGameSeoTitle('Logic Builder', 'Coding Games'),
        h1: 'Logic Builder: Construct Step-by-Step Problem Solving Workflows',
        description: 'Assemble conditional branching, looping, and state transformations to solve complex computational puzzles and enhance your core software engineering logic.'
    },
    {
        slug: 'sql-challenge',
        name: 'SQL Challenge',
        category: 'Coding Games',
        title: formatGameSeoTitle('SQL Challenge', 'Coding Games'),
        h1: 'SQL Challenge: Solve Real Relational Queries & Database Puzzles',
        description: 'Practice writing relational SQL queries against dynamic schemas. Formulate JOINs, GROUP BY aggregations, WHERE filters, and subqueries against simulated databases.'
    },
    {
        slug: 'memory-match',
        name: 'Memory Match',
        category: 'Coding Games',
        title: formatGameSeoTitle('Memory Match', 'Coding Games'),
        h1: 'Coding Memory Match: Pair Programming Terms, Syntax & Concepts',
        description: 'Boost technical recall by matching programming concepts with their corresponding code implementations, time complexities, and architectural definitions.'
    },
    {
        slug: 'speed-typing',
        name: 'Speed Typing',
        category: 'Typing Games',
        title: formatGameSeoTitle('Speed Typing', 'Typing Games'),
        h1: 'Speed Typing: Benchmark Your Developer Keystrokes & WPM',
        description: 'Measure your coding typing speed and raw typing accuracy with developer-centric prose, variable names, and technical terminology in words per minute.'
    },
    {
        slug: 'code-typing',
        name: 'Code Typing',
        category: 'Typing Games',
        title: formatGameSeoTitle('Code Typing', 'Typing Games'),
        h1: 'Code Typing: Type Real Syntax, Braces, Arrows & Operators',
        description: 'Train muscle memory for programming symbols including brackets, arrow functions, semicolons, and operators using real code samples across diverse languages.'
    },
    {
        slug: 'sixty-second-challenge',
        name: '60-Second Challenge',
        category: 'Typing Games',
        title: formatGameSeoTitle('60-Second Challenge', 'Typing Games'),
        h1: '60-Second Challenge: Fast-Paced Coding Typing Sprints',
        description: 'Push your coding throughput to the limit with high-intensity 60-second sprints. Maximize accurate keystrokes under strict time pressure.'
    },
    {
        slug: 'error-free-typing',
        name: 'Error-Free Typing',
        category: 'Typing Games',
        title: formatGameSeoTitle('Error-Free Typing', 'Typing Games'),
        h1: 'Error-Free Typing: Practice Pure Precision & Flawless Accuracy',
        description: 'Cultivate precision typing where a single miskeyed character interrupts the streak. Perfect your rhythm for cleaner, error-free production code.'
    },
    {
        slug: 'syntax-typing',
        name: 'Syntax Typing',
        category: 'Typing Games',
        title: formatGameSeoTitle('Syntax Typing', 'Typing Games'),
        h1: 'Syntax Typing: Master Language-Specific Keywords & Grammar',
        description: 'Focus exclusively on language keywords, type annotations, imports, and declarative syntax across JavaScript, Python, Dart, C#, and PHP.'
    },
    {
        slug: 'word-rain',
        name: 'Word Rain',
        category: 'Typing Games',
        title: formatGameSeoTitle('Word Rain', 'Typing Games'),
        h1: 'Word Rain: Intercept Falling Coding Terms Before They Hit Bottom',
        description: 'Type falling software development keywords and technical concepts before they reach the ground. Fast-paced arcade action designed to sharpen keyboard reaction speed.'
    },
    {
        slug: 'csharp-oop-challenge',
        name: 'C# OOP Challenge',
        category: 'Coding Games',
        title: formatGameSeoTitle('C# OOP Challenge', 'Coding Games'),
        h1: 'C# OOP Challenge: Master Classes, Interfaces, Inheritance & Polymorphism',
        description: 'Explore C# object-oriented programming with interactive challenges covering encapsulation, abstract classes, polymorphism, interfaces, and virtual method overrides.'
    },
    {
        slug: 'csharp-collections-challenge',
        name: 'C# Collections Challenge',
        category: 'Coding Games',
        title: formatGameSeoTitle('C# Collections Challenge', 'Coding Games'),
        h1: 'C# Collections Challenge: Practice Generic Lists, Dictionaries & Sets',
        description: 'Practice working with .NET generic collections, including List<T>, Dictionary<TKey, TValue>, Queue<T>, Stack<T>, and HashSet<T> with practical manipulation tasks.'
    },
    {
        slug: 'csharp-linq-challenge',
        name: 'C# LINQ Challenge',
        category: 'Coding Games',
        title: formatGameSeoTitle('C# LINQ Challenge', 'Coding Games'),
        h1: 'C# LINQ Challenge: Write Fluent Queries, Select, Where & GroupBy',
        description: 'Master .NET LINQ expressions with hands-on transformation puzzles. Practice Select, Where, OrderBy, GroupBy, Any, All, and complex method chaining.'
    },
    {
        slug: 'csharp-exception-handling',
        name: 'C# Exception Handling',
        category: 'Coding Games',
        title: formatGameSeoTitle('C# Exception Handling', 'Coding Games'),
        h1: 'C# Exception Handling: Build Resilient Error Management Workflows',
        description: 'Learn robust exception handling patterns in C# using try, catch, finally, when filter clauses, custom exception types, and proper resource disposal.'
    },
    {
        slug: 'complete-the-code',
        name: 'Complete The Code',
        category: 'Coding Games',
        title: formatGameSeoTitle('Complete The Code', 'Coding Games'),
        h1: 'Complete The Code: Supply Missing Method Bodies & Return Logic',
        description: 'Implement missing function bodies, return statements, and loop boundaries to make automated unit tests pass in this interactive coding challenge.'
    },
    {
        slug: 'csharp-quiz-challenge',
        name: 'C# Quiz Challenge',
        category: 'Coding Games',
        title: formatGameSeoTitle('C# Quiz Challenge', 'Coding Games'),
        h1: 'C# Quiz Challenge: Rapid .NET Runtime, CLR & Language Knowledge',
        description: 'Fast-paced multi-round quiz evaluating your grasp of modern C#, memory management, garbage collection, value vs reference types, and async Tasks.'
    }
];

const GAMES_SEO_MAP = new Map(GAMES_SEO_LIST.map(g => [g.slug, g]));

const TECH_SEO_KEYS = [
    'html',
    'css',
    'javascript',
    'react',
    'php',
    'laravel',
    'mysql',
    'mongodb',
    'flutter',
    'dart',
    'python',
    'programming-fundamentals'
];

const CORE_INDEXABLE_PAGE_KEYS = [
    'home',
    'technologies',
    'games',
    'leaderboard',
    'about',
    'contact',
    'privacyPolicy',
    'terms'
];

function escapeAttrPreserveEntities(str) {
    return String(str || '')
        .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)(?=[a-zA-Z#])/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeTextPreserveEntities(str) {
    return String(str || '')
        .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)(?=[a-zA-Z#])/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function resolveDistinctH1(config, fallbackH1 = '') {
    if (!config) return fallbackH1;
    let distinctH1 = config.h1 || fallbackH1 || config.name || config.title || '';
    if (config.title && distinctH1.toLowerCase() === config.title.toLowerCase()) {
        if (config.name) {
            distinctH1 = `${config.name} Programming Quizzes & Hands-On Practice`;
        } else {
            distinctH1 = config.title.replace(/^Hangbug\s*[–—-]\s*/, '').replace(/\s*[|–—-]\s*Hangbug$/, '');
        }
    }
    return distinctH1;
}

function resolveStaticHeaderForPath(routePath = '/') {
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

function generatePublicBodyHtml(pageConfig) {
    const {
        h1,
        h2s = [],
        h3s = [],
        introContent = '',
        primaryKeyword = 'programming practice',
        secondaryKeywords = [],
        internalLinks = []
    } = pageConfig;

    const sections = [];

    sections.push(`
      <header class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">${h1}</h1>
        <p class="text-base sm:text-lg text-[var(--foreground-muted)] leading-relaxed max-w-3xl">${introContent}</p>
      </header>
    `);

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

    sections.push(`
      <section class="my-6">
        <h2 class="text-2xl font-bold text-[var(--foreground)] mb-3">${h2s[3] || 'Interactive Games & Speed Challenges'}</h2>
        <p class="text-[var(--foreground-muted)] leading-relaxed mb-4">
          Reinforce conceptual quiz learning with hands-on browser games. Tackle algorithmic ordering in Code Puzzle, spot defects in Find The Bug, trace execution in Output Predictor, write database queries in SQL Challenge, and sharpen your coding cadence with developer speed and syntax typing challenges.
        </p>
      </section>
    `);

    if (internalLinks.length > 0) {
        sections.push(`
          <nav aria-label="Related Topics and Practice Tracks" class="mt-8 pt-6 border-t border-[var(--border)]">
            <h3 class="text-lg font-semibold text-[var(--foreground)] mb-3">Explore Related Practice Tracks &amp; Resources</h3>
            <p class="flex flex-wrap gap-3">
              ${internalLinks.map(l => `<a href="${l.to}"${l.rel ? ` rel="${escapeAttrPreserveEntities(l.rel)}"` : ''} class="text-sm font-medium text-[var(--brand)] hover:underline">${l.label}</a>`).join(' • ')}
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

function generateHomeBodyHtml(pageConfig, publishedBlogArticles = []) {
    const { h1, introContent, internalLinks = [] } = pageConfig;
    const gameLinks = GAMES_SEO_LIST;
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
            ${blogLinks.map(b => `<a href="/blog/${escapeAttrPreserveEntities(b.slug)}">${escapeTextPreserveEntities(b.title)}</a>`).join('\n            ')}
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

function deriveBreadcrumbs(canonicalPath = '/', pageTitle = '') {
    const cleanPath = !canonicalPath || canonicalPath === '/'
        ? '/'
        : (canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`).replace(/\/+$/, '');

    if (cleanPath === '/') return [{ name: 'Home', path: '/' }];
    const labelMap = {
        '/': 'Home',
        '/technologies': 'Technologies',
        '/games': 'Games',
        '/blog': 'Blog & Tutorials',
        '/leaderboard': 'Leaderboard',
        '/about': 'About Us',
        '/contact': 'Contact Support',
        '/privacy-policy': 'Privacy Policy',
        '/terms': 'Terms of Service'
    };
    const crumbs = [{ name: 'Home', path: '/' }];
    const segments = cleanPath.split('/').filter(Boolean);
    let currentPath = '';
    segments.forEach((seg, idx) => {
        currentPath += `/${seg}`;
        const isLast = idx === segments.length - 1;
        let label = labelMap[currentPath];
        if (!label) {
            label = isLast && pageTitle
                ? pageTitle.split(/[—|]/)[0].trim()
                : seg.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
        crumbs.push({ name: label, path: currentPath });
    });
    return crumbs;
}

function buildPlatformSoftwareAppNode() {
    return {
        '@type': 'SoftwareApplication',
        '@id': `${BASE_URL}/#application`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAME,
        url: SITE_HOME_URL,
        description: OFFICIAL_DESCRIPTION,
        applicationCategory: 'EducationalApplication',
        applicationSubCategory: 'Technology Learning & Skill Assessment Platform',
        operatingSystem: 'Web, Android',
        softwareVersion: '1.3.1',
        identifier: 'com.hangbug.app',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
        },
        inLanguage: 'en',
        image: DEFAULT_LOGO_URL,
        featureList: [
            'Practice technology-related multiple-choice (MCQ) quizzes',
            'Test programming and web development knowledge across HTML, CSS, JavaScript, Bootstrap, jQuery, PHP, Laravel, MySQL, Flutter, Dart, C#, and more',
            'Explore interactive browser-based coding and typing games',
            'Track quiz performance, accuracy, and saved progress',
            'Earn score-based certificates and share earned certificates on LinkedIn'
        ],
        author: { '@id': `${BASE_URL}/#organization` },
        publisher: { '@id': `${BASE_URL}/#organization` }
    };
}

function buildPublicPageStructuredDataFallback({
    title,
    description,
    canonicalPath = '/',
    includeApplicationSchema = false,
    softwareApplication = null
} = {}) {
    const pageUrl = normalizeCanonicalUrl(canonicalPath);
    const resolvedTitle = title || `Interactive Coding Quizzes, Free Practice & Certificates`;
    const resolvedDescription = description || OFFICIAL_DESCRIPTION;
    const breadcrumbNode = buildBreadcrumbListNode(deriveBreadcrumbs(canonicalPath, resolvedTitle), pageUrl);

    const graph = [
        buildOrganizationNode(),
        buildWebSiteNode(),
        breadcrumbNode
    ];

    let mainEntityId;
    if (includeApplicationSchema || canonicalPath === '/') {
        const appNode = buildPlatformSoftwareAppNode();
        graph.push(appNode);
        mainEntityId = appNode['@id'];
    }

    if (softwareApplication && softwareApplication.slug) {
        if (!graph.some(n => n['@id'] === `${BASE_URL}/#application`)) {
            graph.push(buildPlatformSoftwareAppNode());
        }
        const gameUrl = normalizeCanonicalUrl(`/games/${softwareApplication.slug}`);
        const gameNode = {
            '@type': 'SoftwareApplication',
            '@id': `${gameUrl}#application`,
            name: `${softwareApplication.name || softwareApplication.title || 'Developer Game Challenge'} – Hangbug`,
            url: gameUrl,
            description: softwareApplication.description || 'Interactive browser-based coding and typing challenge for software developers on Hangbug.',
            applicationCategory: 'EducationalApplication',
            applicationSubCategory: softwareApplication.category || 'Coding & Typing Games',
            operatingSystem: 'Web Browser',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
            },
            inLanguage: 'en',
            image: DEFAULT_LOGO_URL,
            isPartOf: { '@id': `${BASE_URL}/#application` },
            author: { '@id': `${BASE_URL}/#organization` },
            publisher: { '@id': `${BASE_URL}/#organization` }
        };
        graph.push(gameNode);
        mainEntityId = gameNode['@id'];
    }

    graph.push({
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: resolvedTitle,
        description: resolvedDescription,
        inLanguage: 'en',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        about: { '@id': `${BASE_URL}/#organization` },
        primaryImageOfPage: {
            '@type': 'ImageObject',
            url: DEFAULT_LOGO_URL
        },
        breadcrumb: { '@id': breadcrumbNode['@id'] },
        ...(mainEntityId ? { mainEntity: { '@id': mainEntityId } } : {})
    });

    return {
        '@context': 'https://schema.org',
        '@graph': graph
    };
}

function buildGameBodyHtml(game, { canonicalSlug, title, h1, description } = {}) {
    const slug = canonicalSlug || game.slug;
    const name = game.name || game.title || 'Developer Challenge';
    const desc = description || game.description || '';
    return generatePublicBodyHtml({
        title,
        h1,
        description: desc,
        primaryKeyword: `${name} game`,
        introContent: desc,
        h2s: [
            `How ${name} Works`,
            'Skills and Concepts Trained',
            'Scoring, Accuracy & Speed Tracking',
            'Recommended Practice Strategy'
        ],
        h3s: [
            'Immediate Interactive Feedback',
            'Keyboard Shortcuts & Fast-Flow Controls',
            'Adaptive Difficulty & Progressive Challenges'
        ],
        internalLinks: resolveContextualLinksForGame({ slug, category: game.category })
    });
}

const CORE_INDEXABLE_FALLBACK_META = {
    '/': {
        canonicalPath: '/',
        title: 'Interactive Coding Quizzes, Free Practice & Certificates',
        description: OFFICIAL_DESCRIPTION,
        h1: 'Practice Coding Quizzes, Interactive Games & Developer Skills',
        primaryKeyword: 'online coding practice platform',
        includeApplicationSchema: true
    },
    '/technologies': {
        canonicalPath: '/technologies',
        title: 'All Tech Quizzes: Free Interactive Practice & Certificates',
        description: 'Select from HTML, CSS, JavaScript, React, PHP, Laravel, MySQL, MongoDB, Flutter, Dart, and Python quiz tracks on Hangbug.',
        h1: 'Choose Your Technology Track & Start Coding Practice',
        primaryKeyword: 'programming and framework quizzes'
    },
    '/games': {
        canonicalPath: '/games',
        title: 'Free Interactive Coding Games & Typing Practice | Hangbug',
        description: 'Play 20 browser-based coding puzzles, bug-finding challenges, SQL query games, and developer typing speed tests on Hangbug.',
        h1: 'Interactive Coding & Typing Games for Software Developers',
        primaryKeyword: 'developer coding and typing games',
        includeApplicationSchema: true
    },
    '/leaderboard': {
        canonicalPath: '/leaderboard',
        title: 'Global Developer Leaderboard & Rankings — Hangbug',
        description: 'See top ranked software engineers and learners worldwide. Track XP, accuracy, quiz streaks, and score-based certificates on Hangbug.',
        h1: 'Global Developer Rankings & Top Quiz Performers',
        primaryKeyword: 'developer leaderboard'
    },
    '/about': {
        canonicalPath: '/about',
        title: 'About Hangbug: Free Interactive Quizzes & Certificates',
        description: 'Learn how Hangbug combines programming quizzes, browser coding games, and score-based certificates for active developer practice.',
        h1: 'About Hangbug: Interactive Coding Quizzes, Games & Skill Practice',
        primaryKeyword: 'interactive coding quiz platform'
    },
    '/contact': {
        canonicalPath: '/contact',
        title: 'Contact Support & Inquiries — Hangbug Coding Quiz Platform',
        description: 'Get in touch with the Hangbug team for questions regarding technology quizzes, score-based certificates, coding games, or technical support.',
        h1: 'Get in Touch with the Hangbug Support Team',
        primaryKeyword: 'contact Hangbug support'
    },
    '/privacy-policy': {
        canonicalPath: '/privacy-policy',
        title: 'Privacy Policy — Hangbug Data Protection & Cookie Policy',
        description: 'Understand how Hangbug collects, utilizes, stores, and protects user data, authentication credentials, and advertising cookie disclosures.',
        h1: 'Hangbug Privacy Policy & Data Protection Disclosures',
        primaryKeyword: 'Hangbug privacy policy'
    },
    '/terms': {
        canonicalPath: '/terms',
        title: 'Terms of Service — Hangbug Platform Terms & Conditions',
        description: 'Review Hangbug terms of service covering accounts, interactive coding quizzes, verification certificates, and acceptable platform use.',
        h1: 'Hangbug Terms of Service & Acceptable Use Conditions',
        primaryKeyword: 'Hangbug terms of service'
    }
};

/**
 * Builds a CTR-focused technology quiz title (<= 60 chars) that highlights
 * free interactive practice and certificates, keeping the brand when it fits.
 */
function buildTechnologyQuizFallbackTitle(techName) {
    const name = String(techName || 'Tech').trim() || 'Tech';
    const candidates = [
        `Free ${name} Quiz: Interactive Practice & Certificate | Hangbug`,
        `Free ${name} Quiz: Interactive Practice & Certificate`,
        `Free Interactive ${name} Quiz & Certificate`,
        `Free ${name} Quiz & Certificate`
    ];
    return candidates.find(c => c.length <= 60) || candidates[candidates.length - 1];
}

function resolveCoreFallbackMeta(cleanPath = '/') {
    const clean = !cleanPath || cleanPath === '/'
        ? '/'
        : (cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`).split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

    if (CORE_INDEXABLE_FALLBACK_META[clean]) {
        const entry = CORE_INDEXABLE_FALLBACK_META[clean];
        return {
            ...entry,
            introContent: entry.description,
            jsonLd: buildPublicPageStructuredDataFallback({
                title: entry.title,
                description: entry.description,
                canonicalPath: entry.canonicalPath,
                includeApplicationSchema: Boolean(entry.includeApplicationSchema)
            })
        };
    }

    if (clean.startsWith('/technologies/')) {
        const rawSlug = clean.slice('/technologies/'.length).toLowerCase();
        const techName = rawSlug
            .split('-')
            .map(w => (w === 'html' || w === 'css' || w === 'php' || w === 'sql' ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
            .join(' ');
        const title = buildTechnologyQuizFallbackTitle(techName);
        const description = `Practice ${techName} programming questions with instant feedback and downloadable score-based certificates on Hangbug.`;
        return {
            canonicalPath: clean,
            title,
            description,
            h1: `${techName} Programming Quizzes & Hands-On Practice`,
            introContent: description,
            primaryKeyword: `${techName} programming quizzes`,
            jsonLd: buildPublicPageStructuredDataFallback({
                title,
                description,
                canonicalPath: clean
            })
        };
    }

    if (clean.startsWith('/games/')) {
        const slug = clean.slice('/games/'.length).toLowerCase();
        const game = GAMES_SEO_MAP.get(slug);
        if (game) {
            return {
                canonicalPath: `/games/${game.slug}`,
                title: game.title,
                description: game.description,
                h1: game.h1,
                introContent: game.description,
                isGame: true,
                canonicalSlug: game.slug,
                name: game.name,
                category: game.category,
                includeApplicationSchema: true,
                softwareApplication: {
                    slug: game.slug,
                    name: game.name,
                    category: game.category,
                    description: game.description
                },
                jsonLd: buildPublicPageStructuredDataFallback({
                    title: game.title,
                    description: game.description,
                    canonicalPath: `/games/${game.slug}`,
                    includeApplicationSchema: true,
                    softwareApplication: {
                        slug: game.slug,
                        name: game.name,
                        category: game.category,
                        description: game.description
                    }
                })
            };
        }
    }

    return null;
}

function renderPublicPageHtml(baseHtml, page = {}) {
    const {
        path: routePath = '/',
        canonicalPath,
        title,
        description,
        ogType = 'website',
        ogImage = DEFAULT_LOGO_URL,
        ogImageAlt,
        robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
        omitCanonical = false,
        omitJsonLd = false,
        includeApplicationSchema = false,
        softwareApplication = null,
        jsonLd = null,
        staticHeaderHtml = '',
        staticFooterHtml = '',
        bodyHtml = ''
    } = page;

    const targetPath = canonicalPath || routePath || '/';
    const canonicalUrl = omitCanonical ? undefined : normalizeCanonicalUrl(targetPath);
    const resolvedDescription = description || OFFICIAL_DESCRIPTION;

    const resolvedJsonLd = omitJsonLd
        ? null
        : (jsonLd || buildPublicPageStructuredDataFallback({
              title,
              description: resolvedDescription,
              canonicalPath: targetPath,
              includeApplicationSchema,
              softwareApplication
          }));

    const combinedBodyHtml = [staticHeaderHtml, bodyHtml, staticFooterHtml]
        .filter(Boolean)
        .join('\n');

    return applyHeadMetadata(baseHtml, {
        title,
        description: resolvedDescription,
        canonicalUrl,
        robots,
        ogType,
        ogImage,
        ogImageAlt,
        omitCanonical,
        jsonLd: resolvedJsonLd,
        bodyHtml: combinedBodyHtml
    });
}

module.exports = {
    GAMES_SEO_LIST,
    GAMES_SEO_MAP,
    TECH_SEO_KEYS,
    CORE_INDEXABLE_PAGE_KEYS,
    escapeAttrPreserveEntities,
    escapeTextPreserveEntities,
    resolveDistinctH1,
    resolveStaticHeaderForPath,
    resolveContextualLinksForGame,
    generatePublicBodyHtml,
    generateHomeBodyHtml,
    buildGameBodyHtml,
    buildPublicPageStructuredDataFallback,
    resolveCoreFallbackMeta,
    buildTechnologyQuizFallbackTitle,
    renderPublicPageHtml
};
