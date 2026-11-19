const Category = require('../_models/categoryModel');

const CORE_TECHNOLOGIES = [
    'HTML',
    'CSS',
    'JavaScript',
    'Bootstrap',
    'jQuery',
    'PHP',
    'Laravel',
    'MySQL',
    'XML',
    'JSON',
    'Flutter',
    'Dart',
    'C#',
    'TypeScript',
    'React.js',
    'Next.js',
    'Angular',
    'Vue',
    'Node.js',
    'Express.js',
    'MongoDB',
    'SQL',
    'SQL Server',
    'Python',
    'Django',
    'Git',
    'GitHub',
    'Tailwind CSS',
    'WordPress',
    'Docker',
    'Agile & DevOps',
    'Azure',
    'SEO',
    'Power BI',
    'Excel',
    'Material UI'
];

const TECHNOLOGY_ALIASES = {
    'html': 'html',
    'html5': 'html',
    'html & css': 'html',
    'css': 'css',
    'css3': 'css',
    'javascript': 'javascript',
    'js': 'javascript',
    'ecmascript': 'javascript',
    'es6': 'javascript',
    'bootstrap': 'bootstrap',
    'bootstrap 5': 'bootstrap',
    'jquery': 'jquery',
    'php': 'php',
    'laravel': 'laravel',
    'mysql': 'mysql',
    'xml': 'xml',
    'json': 'json',
    'xml & json': 'xml',
    'xml json': 'xml',
    'flutter': 'flutter',
    'dart': 'dart',
    'c#': 'csharp',
    'csharp': 'csharp',
    'c sharp': 'csharp',
    'dotnet': 'csharp',
    '.net': 'csharp',
    'react': 'reactjs',
    'react.js': 'reactjs',
    'react js': 'reactjs',
    'reactjs': 'reactjs',
    'next.js': 'nextjs',
    'nextjs': 'nextjs',
    'node.js': 'nodejs',
    'nodejs': 'nodejs',
    'node js': 'nodejs',
    'express': 'expressjs',
    'express.js': 'expressjs',
    'expressjs': 'expressjs',
    'mongodb': 'mongodb',
    'mongo db': 'mongodb',
    'mongo': 'mongodb',
    'sql': 'sql',
    'sql server': 'sql server',
    'mssql': 'sql server',
    'ts': 'typescript',
    'typescript': 'typescript',
    'material ui': 'material ui',
    'material-ui': 'material ui',
    'materialui': 'material ui',
    'mui': 'material ui',
    'mterial ui': 'material ui',
    'tailwind': 'tailwind css',
    'tailwind css': 'tailwind css',
    'tailwindcss': 'tailwind css',
    'agile & devops': 'agile & devops',
    'agile and devops': 'agile & devops',
    'agile': 'agile & devops',
    'devops': 'agile & devops',
    'power bi': 'power bi',
    'powerbi': 'power bi'
};

function normalizeTechnology(name) {
    const cleaned = String(name || '')
        .trim()
        .toLowerCase()
        .replace(/\band\b/g, '&')
        .replace(/\s+/g, ' ');
    if (!cleaned) return '';
    if (TECHNOLOGY_ALIASES[cleaned]) {
        return TECHNOLOGY_ALIASES[cleaned];
    }
    return cleaned;
}

/**
 * Detect relevant normalized technologies for a quiz question.
 * Handles single categories (e.g., "HTML", "C#") and combined categories
 * (e.g., "PHP, XML JSON, Laravel, MySQL, JavaScript" or "HTML & CSS").
 */
function resolveQuestionTechnologies(category, questionText = '') {
    const rawCategory = String(category || '').trim();
    const normPrimary = normalizeTechnology(rawCategory);
    const matches = new Set();

    if (normPrimary) {
        matches.add(normPrimary);
    }

    // Handle combined / multi-topic categories
    const lowerCat = rawCategory.toLowerCase();
    if (lowerCat.includes(',') || lowerCat.includes('&') || lowerCat.includes('/')) {
        const tokens = lowerCat
            .split(/[,/&]+/)
            .map(t => t.trim())
            .filter(Boolean);

        for (const token of tokens) {
            const normTok = normalizeTechnology(token);
            if (normTok) matches.add(normTok);

            // Handle space-separated known pairs like "xml json"
            if (token.includes('xml') && token.includes('json')) {
                matches.add('xml');
                matches.add('json');
            }
        }
    }

    // If question text explicitly references a sub-technology inside a combined category, prioritize it
    const qLower = String(questionText || '').toLowerCase();
    if (matches.size > 1 && qLower) {
        const prioritized = [];
        const keywordMap = {
            html: /\b(html|html5|<[a-z]+|doctype|semantic tag|href|src)\b/i,
            css: /\b(css|css3|flexbox|grid|selector|margin|padding|z-index|media query)\b/i,
            javascript: /\b(javascript|js\b|const |let |var |promise|async|dom|json\.parse|closure|hoisting)\b/i,
            jquery: /\b(jquery|\$\(|ajax\(|fadein|slideup)\b/i,
            bootstrap: /\b(bootstrap|col-md|navbar|container-fluid|btn-primary)\b/i,
            php: /\b(php|\$_get|\$_post|\$_session|echo |composer|PDO)\b/i,
            laravel: /\b(laravel|artisan|eloquent|blade|middleware|route::|migration)\b/i,
            mysql: /\b(mysql|innodb|auto_increment|mysqldump|select |join |primary key)\b/i,
            xml: /\b(xml|dtd|xsd|xpath|xslt|cdata|well-formed)\b/i,
            json: /\b(json|json\.stringify|json\.parse|key-value pair|application\/json)\b/i,
            flutter: /\b(flutter|widget|statelesswidget|statefulwidget|scaffold|buildcontext|pubspec)\b/i,
            dart: /\b(dart|future<|stream<|mixin|late |final |null safety|async\*)\b/i,
            csharp: /\b(c#|csharp|\.net|linq|namespace|ienumerable|async task|delegate)\b/i
        };
        for (const tech of matches) {
            const pattern = keywordMap[tech];
            if (pattern && pattern.test(qLower)) {
                prioritized.push(tech);
            }
        }
        if (prioritized.length > 0) {
            return Array.from(new Set([...prioritized, ...matches]));
        }
    }

    return Array.from(matches);
}

/**
 * Return merged, deduplicated list of all supported technologies (DB categories + core list)
 */
async function getSupportedTechnologies() {
    const seen = new Map();
    const addTech = (name) => {
        const clean = String(name || '').trim();
        if (!clean) return;
        const norm = normalizeTechnology(clean);
        if (!seen.has(norm)) {
            seen.set(norm, { name: clean, normalized: norm });
        }
    };

    try {
        const dbCategories = await Category.getAll();
        if (Array.isArray(dbCategories)) {
            for (const cat of dbCategories) {
                addTech(cat.name);
            }
        }
    } catch {
        // Fallback to core list if DB unavailable
    }

    for (const core of CORE_TECHNOLOGIES) {
        addTech(core);
    }

    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = {
    CORE_TECHNOLOGIES,
    normalizeTechnology,
    resolveQuestionTechnologies,
    getSupportedTechnologies
};
