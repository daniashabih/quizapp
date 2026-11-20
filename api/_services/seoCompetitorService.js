const prisma = require('../_config/prisma');
const {
    DEFAULT_DOMAIN,
    OPENPAGERANK_BULK_ENDPOINT,
    normalizeDomain,
    normalizeRootDomain,
    resolveOpenPageRankApiKey
} = require('./seoIntegrationService');

const memoryCompetitors = new Map();

const TRACKED_TOPIC_TERMS = [
    'html', 'css', 'javascript', 'typescript', 'react', 'next.js', 'node.js',
    'php', 'laravel', 'mysql', 'sql', 'mongodb', 'python', 'flutter', 'dart',
    'c#', 'docker', 'git', 'algorithms', 'data structures', 'quizzes',
    'coding games', 'certificates', 'tutorials', 'interview'
];

function isValidPublicDomain(rawDomain = '') {
    const clean = normalizeDomain(rawDomain);
    if (!clean || clean.length < 4 || clean.length > 180) return false;
    if (clean === 'localhost' || clean.startsWith('127.') || clean.startsWith('10.') || clean.startsWith('192.168.') || clean.endsWith('.local')) {
        return false;
    }
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(clean);
}

async function fetchPublicText(url, timeoutMs = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            headers: { 'User-Agent': 'Hangbug-Competitor-Inspector/1.0 (+https://www.hangbug.com)' },
            signal: controller.signal
        });
        const text = await res.text();
        return { ok: res.ok, status: res.status, text };
    } catch (err) {
        return { ok: false, status: 0, text: '', error: err.message };
    } finally {
        clearTimeout(timer);
    }
}

async function probeCompetitorPublicSignals(competitorDomain, hangbugTopics = [], config = null) {
    const clean = normalizeDomain(competitorDomain);
    if (!isValidPublicDomain(clean)) {
        throw new Error('Please enter a valid public domain name (e.g. w3schools.com).');
    }

    const baseUrl = `https://${clean}`;
    const startedAt = Date.now();
    const [homeRes, robotsRes, sitemapRes] = await Promise.all([
        fetchPublicText(`${baseUrl}/`, 5500),
        fetchPublicText(`${baseUrl}/robots.txt`, 4000),
        fetchPublicText(`${baseUrl}/sitemap.xml`, 4500)
    ]);

    const html = homeRes.text || '';
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescMatch =
        html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
        html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    const h1Match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    const h2Matches = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, ' ').trim()).filter(Boolean);

    const sitemapCount = sitemapRes.ok
        ? (sitemapRes.text.match(/<loc>/gi) || []).length + (sitemapRes.text.match(/<sitemap>/gi) || []).length
        : null;

    const textSample = `${titleMatch?.[1] || ''} ${metaDescMatch?.[1] || ''} ${h1Match?.[1] || ''} ${h2Matches.join(' ')} ${html.slice(0, 25000)}`
        .replace(/<[^>]+>/g, ' ')
        .toLowerCase();

    const detectedTopics = TRACKED_TOPIC_TERMS.filter(term => textSample.includes(term));
    const hangbugSet = new Set(hangbugTopics.map(t => String(t || '').toLowerCase()));
    const topicGapsForHangbug = detectedTopics.filter(t => !hangbugSet.has(t));
    const hangbugUniqueAdvantages = Array.from(hangbugSet).filter(t => TRACKED_TOPIC_TERMS.includes(t) && !detectedTopics.includes(t));

    // Optional verified OpenPageRank lookup if configured
    let thirdPartyDomainRank = null;
    let thirdPartyGlobalRank = null;
    let thirdPartyReferringDomains = null;
    let thirdPartySource = null;
    const oprKeyInfo = resolveOpenPageRankApiKey(config || {});
    if (oprKeyInfo.hasKey) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        try {
            const targetRoot = normalizeRootDomain(clean);
            const r = await fetch(OPENPAGERANK_BULK_ENDPOINT, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${oprKeyInfo.key}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    domains: [targetRoot],
                    include_history: false
                }),
                signal: controller.signal
            });
            if (r.ok) {
                const json = await r.json();
                const row = Array.isArray(json?.results) ? json.results[0] : null;
                if (row && row.found && row.open_page_rank !== null && row.open_page_rank !== undefined) {
                    thirdPartyDomainRank = Number(row.open_page_rank);
                    thirdPartyGlobalRank = row.rank !== null && row.rank !== undefined ? Number(row.rank) : null;
                    thirdPartyReferringDomains = row.referring_domains !== null && row.referring_domains !== undefined
                        ? Number(row.referring_domains)
                        : null;
                    thirdPartySource = 'OpenPageRank API (Estimated)';
                }
            }
        } catch {
            // ignore provider failure
        } finally {
            clearTimeout(timer);
        }
    }

    return {
        competitorDomain: clean,
        reachable: homeRes.ok || homeRes.status > 0,
        httpStatus: homeRes.status || 0,
        responseTimeMs: Date.now() - startedAt,
        homepageTitle: titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '',
        metaDescription: metaDescMatch ? metaDescMatch[1].replace(/\s+/g, ' ').trim() : '',
        h1Heading: h1Match ? h1Match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '',
        hasRobotsTxt: robotsRes.ok && robotsRes.status === 200,
        hasSitemapXml: sitemapRes.ok && sitemapRes.status === 200,
        sitemapEntriesDetected: sitemapCount,
        detectedTopics,
        topicGapsForHangbug,
        hangbugUniqueAdvantages,
        // Third-party keyword/backlink visibility (only populated when provider connected)
        thirdPartyMetrics: {
            providerConnected: Boolean(thirdPartySource),
            isEstimated: true,
            source: thirdPartySource || 'No third-party keyword/backlink provider connected',
            domainAuthorityScore: thirdPartyDomainRank,
            globalDomainRank: thirdPartyGlobalRank,
            referringDomains: thirdPartyReferringDomains,
            estimatedOrganicKeywords: null,
            estimatedBacklinks: null,
            explanation: thirdPartySource
                ? 'Domain score and referring domains fetched from OpenPageRank (Estimated). Organic keyword counts require a connected keyword research API.'
                : 'Keyword visibility and domain authority are unavailable until a verified third-party SEO provider is configured in Settings. Topic coverage and sitemap checks above are measured directly.'
        },
        source: homeRes.ok ? `Live Public Crawl (${clean})` : 'Public Probe Unreachable',
        checkedAt: new Date().toISOString()
    };
}

function hydrateCompetitor(row) {
    let snapshot = {};
    try {
        snapshot = row.snapshotJson ? JSON.parse(row.snapshotJson) : {};
    } catch {
        snapshot = {};
    }
    return {
        id: row.id,
        domain: row.domain,
        competitorDomain: row.competitorDomain,
        label: row.label || row.competitorDomain,
        notes: row.notes || '',
        snapshot,
        lastCheckedAt: row.lastCheckedAt ? new Date(row.lastCheckedAt).toISOString() : (snapshot.checkedAt || null),
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null
    };
}

async function listCompetitors(domain = DEFAULT_DOMAIN) {
    const cleanDomain = normalizeDomain(domain);
    try {
        if (prisma && prisma.seoCompetitor && typeof prisma.seoCompetitor.findMany === 'function') {
            const rows = await prisma.seoCompetitor.findMany({
                where: { domain: cleanDomain },
                orderBy: { createdAt: 'desc' }
            });
            return rows.map(hydrateCompetitor);
        }
    } catch {
        // Fallback below
    }

    return memoryCompetitors.get(cleanDomain) || [];
}

async function addCompetitor({ domain = DEFAULT_DOMAIN, competitorDomain, label = '', notes = '', hangbugTopics = [], config = null }) {
    const cleanDomain = normalizeDomain(domain);
    const cleanComp = normalizeDomain(competitorDomain);
    if (!isValidPublicDomain(cleanComp)) {
        throw new Error('Please enter a valid public domain name (e.g. w3schools.com or codecademy.com).');
    }
    if (cleanComp === cleanDomain || cleanComp === 'hangbug.com' || cleanComp === 'www.hangbug.com') {
        throw new Error('Please enter an external competitor domain rather than Hangbug itself.');
    }

    const snapshot = await probeCompetitorPublicSignals(cleanComp, hangbugTopics, config);
    const now = new Date();

    try {
        if (prisma && prisma.seoCompetitor && typeof prisma.seoCompetitor.upsert === 'function') {
            const saved = await prisma.seoCompetitor.upsert({
                where: {
                    domain_competitorDomain: {
                        domain: cleanDomain,
                        competitorDomain: cleanComp
                    }
                },
                create: {
                    domain: cleanDomain,
                    competitorDomain: cleanComp,
                    label: label.trim() || cleanComp,
                    notes: notes.trim(),
                    snapshotJson: JSON.stringify(snapshot),
                    lastCheckedAt: now
                },
                update: {
                    label: label.trim() || cleanComp,
                    notes: notes.trim(),
                    snapshotJson: JSON.stringify(snapshot),
                    lastCheckedAt: now
                }
            });
            return hydrateCompetitor(saved);
        }
    } catch {
        // Fallback below
    }

    const item = {
        id: `comp_${Date.now()}`,
        domain: cleanDomain,
        competitorDomain: cleanComp,
        label: label.trim() || cleanComp,
        notes: notes.trim(),
        snapshot,
        lastCheckedAt: now.toISOString(),
        createdAt: now.toISOString()
    };
    const existing = memoryCompetitors.get(cleanDomain) || [];
    memoryCompetitors.set(cleanDomain, [item, ...existing.filter(c => c.competitorDomain !== cleanComp)]);
    return item;
}

async function refreshCompetitor({ domain = DEFAULT_DOMAIN, id, hangbugTopics = [], config = null }) {
    const cleanDomain = normalizeDomain(domain);
    let target = null;

    try {
        if (prisma && prisma.seoCompetitor && typeof prisma.seoCompetitor.findUnique === 'function') {
            target = await prisma.seoCompetitor.findUnique({ where: { id: String(id) } });
        }
    } catch {
        target = null;
    }

    if (!target) {
        const memList = memoryCompetitors.get(cleanDomain) || [];
        target = memList.find(c => c.id === id);
    }

    if (!target) {
        throw new Error('Competitor record not found.');
    }

    const snapshot = await probeCompetitorPublicSignals(target.competitorDomain, hangbugTopics, config);
    const now = new Date();

    try {
        if (prisma && prisma.seoCompetitor && typeof prisma.seoCompetitor.update === 'function') {
            const updated = await prisma.seoCompetitor.update({
                where: { id: String(id) },
                data: {
                    snapshotJson: JSON.stringify(snapshot),
                    lastCheckedAt: now
                }
            });
            return hydrateCompetitor(updated);
        }
    } catch {
        // Fallback below
    }

    const memList = memoryCompetitors.get(cleanDomain) || [];
    const nextList = memList.map(c => c.id === id ? { ...c, snapshot, lastCheckedAt: now.toISOString() } : c);
    memoryCompetitors.set(cleanDomain, nextList);
    return nextList.find(c => c.id === id);
}

async function deleteCompetitor({ domain = DEFAULT_DOMAIN, id }) {
    const cleanDomain = normalizeDomain(domain);
    try {
        if (prisma && prisma.seoCompetitor && typeof prisma.seoCompetitor.delete === 'function') {
            await prisma.seoCompetitor.delete({ where: { id: String(id) } });
        }
    } catch {
        // Ignore if missing or memory-only
    }
    const memList = memoryCompetitors.get(cleanDomain) || [];
    memoryCompetitors.set(cleanDomain, memList.filter(c => c.id !== id));
    return { deleted: true };
}

module.exports = {
    isValidPublicDomain,
    listCompetitors,
    addCompetitor,
    refreshCompetitor,
    deleteCompetitor,
    probeCompetitorPublicSignals
};
