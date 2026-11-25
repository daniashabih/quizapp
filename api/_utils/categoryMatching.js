/**
 * Shared category normalization, alias matching, and question-count resolution
 * used across QuestionModel, seoAuditService, seoController, and Admin coverage APIs.
 */

const CATEGORY_ALIAS_GROUPS = [
    ['c#', 'csharp', 'c sharp'],
    ['react.js', 'react js', 'reactjs', 'react'],
    ['material ui', 'material-ui', 'materialui', 'mui'],
    ['mongodb', 'mongo db', 'mongo'],
    ['azure', 'microsoft azure', 'ms azure', 'windows azure'],
    ['wordpress', 'word press'],
    ['agile & devops', 'agile and devops', 'agile devops'],
    ['next.js', 'next js', 'nextjs'],
    ['vue', 'vue.js', 'vue js', 'vuejs'],
    ['tailwind css', 'tailwindcss', 'tailwind'],
    ['node.js', 'node js', 'nodejs'],
    ['express.js', 'express js', 'expressjs'],
    ['angular', 'angularjs', 'angular js']
];

const VARIATIONS_BY_KEY = new Map([
    ['c#', ['C#', 'csharp', 'c sharp', 'CSharp']],
    ['csharp', ['C#', 'csharp', 'c sharp', 'CSharp']],
    ['c sharp', ['C#', 'csharp', 'c sharp', 'CSharp']],
    ['react.js', ['React.js', 'React JS', 'ReactJS', 'React', 'react.js', 'react js', 'reactjs', 'react']],
    ['react js', ['React.js', 'React JS', 'ReactJS', 'React', 'react.js', 'react js', 'reactjs', 'react']],
    ['reactjs', ['React.js', 'React JS', 'ReactJS', 'React', 'react.js', 'react js', 'reactjs', 'react']],
    ['react', ['React.js', 'React JS', 'ReactJS', 'React', 'react.js', 'react js', 'reactjs', 'react']],
    ['material ui', ['Material UI', 'Material-UI', 'MaterialUI', 'MUI', 'material ui', 'materialui', 'mui']],
    ['material-ui', ['Material UI', 'Material-UI', 'MaterialUI', 'MUI', 'material ui', 'materialui', 'mui']],
    ['materialui', ['Material UI', 'Material-UI', 'MaterialUI', 'MUI', 'material ui', 'materialui', 'mui']],
    ['mui', ['Material UI', 'Material-UI', 'MaterialUI', 'MUI', 'material ui', 'materialui', 'mui']],
    ['mterial ui', ['Material UI', 'Material-UI', 'MaterialUI', 'MUI', 'material ui', 'materialui', 'mui']],
    ['mongodb', ['MongoDB', 'Mongo DB', 'mongodb', 'mongo db', 'mongo']],
    ['mongo db', ['MongoDB', 'Mongo DB', 'mongodb', 'mongo db', 'mongo']],
    ['mongo', ['MongoDB', 'Mongo DB', 'mongodb', 'mongo db', 'mongo']],
    ['azure', ['Azure', 'Microsoft Azure', 'MS Azure', 'Windows Azure', 'azure', 'microsoft azure', 'ms azure']],
    ['microsoft azure', ['Azure', 'Microsoft Azure', 'MS Azure', 'Windows Azure', 'azure', 'microsoft azure', 'ms azure']],
    ['ms azure', ['Azure', 'Microsoft Azure', 'MS Azure', 'Windows Azure', 'azure', 'microsoft azure', 'ms azure']],
    ['windows azure', ['Azure', 'Microsoft Azure', 'MS Azure', 'Windows Azure', 'azure', 'microsoft azure', 'ms azure']],
    ['wordpress', ['WordPress', 'wordpress', 'Word Press']],
    ['word press', ['WordPress', 'wordpress', 'Word Press']]
]);

const ALIAS_LOOKUP = new Map();
CATEGORY_ALIAS_GROUPS.forEach((group, idx) => {
    const canonicalKey = `group_${idx}`;
    for (const entry of group) {
        ALIAS_LOOKUP.set(normalizeCategoryKey(entry), canonicalKey);
    }
});

function normalizeCategoryKey(name) {
    return String(name || '')
        .trim()
        .toLowerCase()
        .replace(/\band\b/g, '&')
        .replace(/\s+/g, ' ');
}

function getCanonicalAliasGroupKey(name) {
    const norm = normalizeCategoryKey(name);
    if (!norm) return '';
    return ALIAS_LOOKUP.get(norm) || norm;
}

function getCategoryVariations(category) {
    if (!category) return [];
    const clean = String(category).trim();
    const lower = clean.toLowerCase();
    const preset = VARIATIONS_BY_KEY.get(lower);
    if (preset) return preset;

    const norm = normalizeCategoryKey(clean);
    const groupIdx = CATEGORY_ALIAS_GROUPS.findIndex(group =>
        group.some(alias => normalizeCategoryKey(alias) === norm)
    );
    if (groupIdx !== -1) {
        const groupVariations = CATEGORY_ALIAS_GROUPS[groupIdx];
        return Array.from(new Set([clean, ...groupVariations]));
    }

    const withAnd = clean.replace(/&/g, 'and');
    const withAmp = clean.replace(/\band\b/gi, '&');
    return Array.from(new Set([clean, withAnd, withAmp]));
}

/**
 * Resolve category question counts with direct DB normalization + canonical alias fallback
 * + optional built-in dataset floors (e.g. Agile & DevOps, C#).
 */
function resolveCategoryQuestionStats(categories = [], questionStats = [], builtInCounts = {}) {
    const directMap = new Map();
    const groupMap = new Map();

    const recordStat = (rawName, count, latestAt = null) => {
        const norm = normalizeCategoryKey(rawName);
        if (!norm) return;
        const safeCount = Number(count || 0);
        const tsMs = latestAt ? new Date(latestAt).getTime() : 0;

        const prevDirect = directMap.get(norm) || { count: 0, latestMs: 0, sourceName: rawName };
        directMap.set(norm, {
            count: prevDirect.count + safeCount,
            latestMs: Math.max(prevDirect.latestMs, Number.isNaN(tsMs) ? 0 : tsMs),
            sourceName: prevDirect.sourceName || rawName
        });

        const groupKey = getCanonicalAliasGroupKey(rawName);
        const prevGroup = groupMap.get(groupKey) || { count: 0, latestMs: 0, topSourceName: '', topSourceCount: -1 };
        const nextTop = safeCount > prevGroup.topSourceCount
            ? { topSourceName: String(rawName), topSourceCount: safeCount }
            : { topSourceName: prevGroup.topSourceName, topSourceCount: prevGroup.topSourceCount };

        groupMap.set(groupKey, {
            count: prevGroup.count + safeCount,
            latestMs: Math.max(prevGroup.latestMs, Number.isNaN(tsMs) ? 0 : tsMs),
            ...nextTop
        });
    };

    for (const q of (Array.isArray(questionStats) ? questionStats : [])) {
        if (!q || !q.category) continue;
        const count = q._count?._all ?? q._count?.id ?? q.count ?? 0;
        const latestAt = q._max?.createdAt ?? q.latestQuestionAt ?? null;
        recordStat(q.category, count, latestAt);
    }

    // Apply built-in dataset minimums if DB has fewer rows than built-in modules
    for (const [name, minCount] of Object.entries(builtInCounts || {})) {
        const norm = normalizeCategoryKey(name);
        const existing = directMap.get(norm)?.count || 0;
        if (Number(minCount || 0) > existing) {
            recordStat(name, Number(minCount) - existing, null);
        }
    }

    return (Array.isArray(categories) ? categories : []).map(cat => {
        const norm = normalizeCategoryKey(cat.name);
        const groupKey = getCanonicalAliasGroupKey(cat.name);
        const direct = directMap.get(norm);
        const group = groupMap.get(groupKey);

        const directCount = direct ? direct.count : 0;
        const effectiveCount = directCount > 0 ? directCount : (group ? group.count : 0);
        const latestMs = Math.max(direct?.latestMs || 0, group?.latestMs || 0);
        const coveredByAlias = directCount === 0 && effectiveCount > 0 && group?.topSourceName
            ? group.topSourceName
            : null;

        return {
            id: cat.id,
            name: cat.name,
            isEnabled: cat.isEnabled !== false,
            directQuestionCount: directCount,
            questionCount: effectiveCount,
            coveredByAlias,
            latestQuestionAt: latestMs > 0 ? new Date(latestMs).toISOString() : null
        };
    });
}

module.exports = {
    CATEGORY_ALIAS_GROUPS,
    normalizeCategoryKey,
    getCanonicalAliasGroupKey,
    getCategoryVariations,
    resolveCategoryQuestionStats
};
