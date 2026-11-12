/**
 * Centralized Technology Logo Registry & Dynamic Multi-Technology Resolver.
 * Maps canonical technology identifiers and normalized category names (single or combined)
 * to official brand SVG assets stored under /assets/tech-logos/.
 */

export const TECH_LOGO_CATALOG = {
    android: { id: 'android', label: 'Android', file: 'android.svg', darkInk: false, lightBacking: false },
    angular: { id: 'angular', label: 'Angular', file: 'angular.svg', darkInk: false, lightBacking: false },
    aws: { id: 'aws', label: 'AWS', file: 'aws.svg', darkInk: false, lightBacking: true },
    azure: { id: 'azure', label: 'Microsoft Azure', file: 'azure.svg', darkInk: false, lightBacking: false },
    bootstrap: { id: 'bootstrap', label: 'Bootstrap', file: 'bootstrap.svg', darkInk: false, lightBacking: false },
    c: { id: 'c', label: 'C', file: 'c.svg', darkInk: false, lightBacking: false },
    cplusplus: { id: 'cplusplus', label: 'C++', file: 'cplusplus.svg', darkInk: false, lightBacking: false },
    csharp: { id: 'csharp', label: 'C#', file: 'csharp.svg', darkInk: false, lightBacking: false },
    css3: { id: 'css3', label: 'CSS3', file: 'css3.svg', darkInk: false, lightBacking: false },
    dart: { id: 'dart', label: 'Dart', file: 'dart.svg', darkInk: false, lightBacking: false },
    devops: { id: 'devops', label: 'Agile & DevOps', file: 'devops.svg', darkInk: false, lightBacking: false },
    django: { id: 'django', label: 'Django', file: 'django.svg', darkInk: true, lightBacking: false },
    docker: { id: 'docker', label: 'Docker', file: 'docker.svg', darkInk: false, lightBacking: false },
    excel: { id: 'excel', label: 'Microsoft Excel', file: 'excel.svg', darkInk: false, lightBacking: false },
    express: { id: 'express', label: 'Express.js', file: 'express.svg', darkInk: true, lightBacking: false },
    firebase: { id: 'firebase', label: 'Firebase', file: 'firebase.svg', darkInk: false, lightBacking: false },
    flutter: { id: 'flutter', label: 'Flutter', file: 'flutter.svg', darkInk: false, lightBacking: false },
    git: { id: 'git', label: 'Git', file: 'git.svg', darkInk: false, lightBacking: false },
    github: { id: 'github', label: 'GitHub', file: 'github.svg', darkInk: true, lightBacking: false },
    go: { id: 'go', label: 'Go', file: 'go.svg', darkInk: false, lightBacking: false },
    graphql: { id: 'graphql', label: 'GraphQL', file: 'graphql.svg', darkInk: false, lightBacking: false },
    html5: { id: 'html5', label: 'HTML5', file: 'html5.svg', darkInk: false, lightBacking: false },
    java: { id: 'java', label: 'Java', file: 'java.svg', darkInk: false, lightBacking: false },
    javascript: { id: 'javascript', label: 'JavaScript', file: 'javascript.svg', darkInk: false, lightBacking: false },
    jquery: { id: 'jquery', label: 'jQuery', file: 'jquery.svg', darkInk: false, lightBacking: false },
    json: { id: 'json', label: 'JSON', file: 'json.svg', darkInk: false, lightBacking: false },
    kotlin: { id: 'kotlin', label: 'Kotlin', file: 'kotlin.svg', darkInk: false, lightBacking: false },
    kubernetes: { id: 'kubernetes', label: 'Kubernetes', file: 'kubernetes.svg', darkInk: false, lightBacking: false },
    laravel: { id: 'laravel', label: 'Laravel', file: 'laravel.svg', darkInk: false, lightBacking: false },
    linux: { id: 'linux', label: 'Linux', file: 'linux.svg', darkInk: true, lightBacking: false },
    mongodb: { id: 'mongodb', label: 'MongoDB', file: 'mongodb.svg', darkInk: false, lightBacking: false },
    mysql: { id: 'mysql', label: 'MySQL', file: 'mysql.svg', darkInk: false, lightBacking: false },
    nextjs: { id: 'nextjs', label: 'Next.js', file: 'nextjs.svg', darkInk: false, lightBacking: true },
    nodejs: { id: 'nodejs', label: 'Node.js', file: 'nodejs.svg', darkInk: false, lightBacking: false },
    php: { id: 'php', label: 'PHP', file: 'php.svg', darkInk: false, lightBacking: false },
    postgresql: { id: 'postgresql', label: 'PostgreSQL', file: 'postgresql.svg', darkInk: false, lightBacking: false },
    powerbi: { id: 'powerbi', label: 'Power BI', file: 'powerbi.svg', darkInk: false, lightBacking: false },
    python: { id: 'python', label: 'Python', file: 'python.svg', darkInk: false, lightBacking: false },
    react: { id: 'react', label: 'React', file: 'react.svg', darkInk: false, lightBacking: false },
    rust: { id: 'rust', label: 'Rust', file: 'rust.svg', darkInk: true, lightBacking: false },
    seo: { id: 'seo', label: 'SEO', file: 'seo.svg', darkInk: false, lightBacking: false },
    sql: { id: 'sql', label: 'SQL', file: 'sql.svg', darkInk: false, lightBacking: false },
    sqlserver: { id: 'sqlserver', label: 'SQL Server', file: 'sqlserver.svg', darkInk: false, lightBacking: false },
    swift: { id: 'swift', label: 'Swift', file: 'swift.svg', darkInk: false, lightBacking: false },
    tailwindcss: { id: 'tailwindcss', label: 'Tailwind CSS', file: 'tailwindcss.svg', darkInk: false, lightBacking: false },
    typescript: { id: 'typescript', label: 'TypeScript', file: 'typescript.svg', darkInk: false, lightBacking: false },
    vuejs: { id: 'vuejs', label: 'Vue.js', file: 'vuejs.svg', darkInk: false, lightBacking: false },
    wordpress: { id: 'wordpress', label: 'WordPress', file: 'wordpress.svg', darkInk: true, lightBacking: false },
    xml: { id: 'xml', label: 'XML', file: 'xml.svg', darkInk: false, lightBacking: false },
};

// Exact normalized phrases -> ordered canonical ID arrays (for composite titles & multi-word names)
const COMPOSITE_ALIASES = {
    'agile and devops': ['devops'],
    'agile & devops': ['devops'],
    'agile devops': ['devops'],
    'agile characteristics': ['devops'],
    'agile': ['devops'],
    'scrum': ['devops'],
    'devops': ['devops'],
    'ci/cd': ['devops'],
    'cicd': ['devops'],
    'microsoft azure': ['azure'],
    'ms azure': ['azure'],
    'azure': ['azure'],
    'amazon web services': ['aws'],
    'aws': ['aws'],
    'microsoft excel': ['excel'],
    'ms excel': ['excel'],
    'excel': ['excel'],
    'power bi': ['powerbi'],
    'powerbi': ['powerbi'],
    'microsoft power bi': ['powerbi'],
    'sql server': ['sqlserver'],
    'mssql': ['sqlserver'],
    'ms sql': ['sqlserver'],
    'ms sql server': ['sqlserver'],
    'microsoft sql server': ['sqlserver'],
    'tailwind css': ['tailwindcss'],
    'tailwind': ['tailwindcss'],
    'tailwindcss': ['tailwindcss'],
    'express js': ['express'],
    'express.js': ['express'],
    'expressjs': ['express'],
    'express': ['express'],
    'node js': ['nodejs'],
    'node.js': ['nodejs'],
    'nodejs': ['nodejs'],
    'node': ['nodejs'],
    'next js': ['nextjs'],
    'next.js': ['nextjs'],
    'nextjs': ['nextjs'],
    'vue js': ['vuejs'],
    'vue.js': ['vuejs'],
    'vuejs': ['vuejs'],
    'vue': ['vuejs'],
    'react js': ['react'],
    'react.js': ['react'],
    'reactjs': ['react'],
    'react': ['react'],
    'react native': ['react'],
    'angular js': ['angular'],
    'angularjs': ['angular'],
    'angular': ['angular'],
    'html5': ['html5'],
    'html': ['html5'],
    'css3': ['css3'],
    'css': ['css3'],
    'javascript': ['javascript'],
    'js': ['javascript'],
    'ecmascript': ['javascript'],
    'typescript': ['typescript'],
    'ts': ['typescript'],
    'c#': ['csharp'],
    'csharp': ['csharp'],
    'c sharp': ['csharp'],
    'c++': ['cplusplus'],
    'cpp': ['cplusplus'],
    'cplusplus': ['cplusplus'],
    'c': ['c'],
    'golang': ['go'],
    'go': ['go'],
    'mongo': ['mongodb'],
    'mongodb': ['mongodb'],
    'postgres': ['postgresql'],
    'postgresql': ['postgresql'],
    'mysql': ['mysql'],
    'sql': ['sql'],
    'php': ['php'],
    'xml': ['xml'],
    'json': ['json'],
    'laravel': ['laravel'],
    'python': ['python'],
    'django': ['django'],
    'flutter': ['flutter'],
    'dart': ['dart'],
    'git': ['git'],
    'github': ['github'],
    'bootstrap': ['bootstrap'],
    'wordpress': ['wordpress'],
    'docker': ['docker'],
    'kubernetes': ['kubernetes'],
    'k8s': ['kubernetes'],
    'jquery': ['jquery'],
    'java': ['java'],
    'kotlin': ['kotlin'],
    'swift': ['swift'],
    'rust': ['rust'],
    'android': ['android'],
    'firebase': ['firebase'],
    'graphql': ['graphql'],
    'linux': ['linux'],
    'seo': ['seo'],
    'search engine optimization': ['seo'],
};

const normalizePhrase = (raw) =>
    String(raw || '')
        .toLowerCase()
        .replace(/[()[\]{}:;]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const resolveChunk = (chunk, results, seen) => {
    const clean = normalizePhrase(chunk);
    if (!clean) return;

    const direct = COMPOSITE_ALIASES[clean] || (TECH_LOGO_CATALOG[clean] ? [clean] : null);
    if (direct) {
        for (const id of direct) {
            const entry = TECH_LOGO_CATALOG[id];
            if (entry && !seen.has(entry.id)) {
                seen.add(entry.id);
                results.push(entry);
            }
        }
        return;
    }

    // Fallback: inspect space-separated tokens (e.g. "XML JSON")
    const words = clean.split(/\s+/);
    if (words.length > 1) {
        for (let i = 0; i < words.length; i += 1) {
            if (i + 1 < words.length) {
                const pair = `${words[i]} ${words[i + 1]}`;
                const pairIds = COMPOSITE_ALIASES[pair];
                if (pairIds) {
                    for (const id of pairIds) {
                        const entry = TECH_LOGO_CATALOG[id];
                        if (entry && !seen.has(entry.id)) {
                            seen.add(entry.id);
                            results.push(entry);
                        }
                    }
                    i += 1;
                    continue;
                }
            }
            const wordIds = COMPOSITE_ALIASES[words[i]] || (TECH_LOGO_CATALOG[words[i]] ? [words[i]] : null);
            if (wordIds) {
                for (const id of wordIds) {
                    const entry = TECH_LOGO_CATALOG[id];
                    if (entry && !seen.has(entry.id)) {
                        seen.add(entry.id);
                        results.push(entry);
                    }
                }
            }
        }
    }
};

/**
 * Resolves any single or combined technology name into an ordered, deduplicated list
 * of logo descriptor objects: `{ id, label, src, darkInk, lightBacking }`.
 * Returns `[]` only when no known technology token exists in `name` (caller renders fallback icon).
 */
export function resolveTechLogos(name) {
    const clean = normalizePhrase(name);
    if (!clean) return [];

    const results = [];
    const seen = new Set();

    // 1. Check full-phrase match first (preserves multi-word entities like "SQL Server" or "Agile and DevOps")
    const fullIds = COMPOSITE_ALIASES[clean] || (TECH_LOGO_CATALOG[clean] ? [clean] : null);
    if (fullIds) {
        for (const id of fullIds) {
            const entry = TECH_LOGO_CATALOG[id];
            if (entry && !seen.has(entry.id)) {
                seen.add(entry.id);
                results.push(entry);
            }
        }
        return results.map((entry) => ({
            ...entry,
            src: `/assets/tech-logos/${entry.file}`,
        }));
    }

    // 2. Tokenize delimited combinations: ",", "&", "/", "|", " + ", " and ", " with "
    const segments = clean.split(/(?:\s*,\s*|\s*&\s*|\s*\/\s*|\s*\|\s*|\s+\+\s+|\s+(?:and|with)\s+)/i);
    for (const segment of segments) {
        resolveChunk(segment, results, seen);
    }

    return results.map((entry) => ({
        ...entry,
        src: `/assets/tech-logos/${entry.file}`,
    }));
}
