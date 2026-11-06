/**
 * Schema.org JSON-LD Structured Data Builder, Validator, and DOM Manager for HangBug.
 *
 * Implements eligible, accurate, and non-duplicative Schema.org types:
 * 1. Organization Schema for HangBug.
 * 2. WebSite Schema for the official website (https://www.hangbug.com).
 * 3. WebPage Schema for important public and utility pages.
 * 4. BreadcrumbList Schema for navigation hierarchy.
 * 5. Article Schema strictly for genuine blog articles.
 * 6. SoftwareApplication Schema for the HangBug application and interactive games.
 * 7. ProfilePage (and EducationalOccupationalCredential / ItemList) only where appropriate.
 *
 * Strictly avoids fabricated ratings, reviews, prices, or awards.
 */

export const SITE_URL = 'https://www.hangbug.com';
export const SITE_HOME_URL = 'https://www.hangbug.com/';
export const SITE_NAME = 'HangBug';
export const SITE_ALTERNATE_NAME = 'Hangbug';
export const LOGO_URL = 'https://www.hangbug.com/branding/hangbug-logo-full.png';
export const ICON_URL = 'https://www.hangbug.com/branding/hangbug-icon.png';
export const SUPPORT_EMAIL = 'support@hangbug.com';
export const ANDROID_PACKAGE_NAME = 'com.hangbug.app';
export const APP_VERSION = '1.3.1';
export const JSONLD_SCRIPT_ID = 'hangbug-jsonld';

const FORBIDDEN_FABRICATED_KEYS = new Set([
    'aggregateRating',
    'review',
    'reviews',
    'ratingValue',
    'reviewCount',
    'bestRating',
    'worstRating',
    'price',
    'priceCurrency',
    'offers',
    'award',
    'awards'
]);

const DEFAULT_BREADCRUMB_LABELS = {
    '/': 'Home',
    '/technologies': 'Technologies',
    '/games': 'Games',
    '/leaderboard': 'Leaderboard',
    '/leaderboard/full': 'Full Global Leaderboard',
    '/about': 'About Us',
    '/contact': 'Contact Support',
    '/privacy-policy': 'Privacy Policy',
    '/terms': 'Terms of Service',
    '/delete-account': 'Delete Account',
    '/certificate/view': 'Verify Certificate',
    '/dashboard': 'Dashboard',
    '/dashboard/profile': 'Developer Profile'
};

/**
 * Normalizes a relative path or full URL to a canonical HangBug URL.
 * @param {string} pathOrUrl
 * @returns {string}
 */
export function normalizeCanonicalUrl(pathOrUrl = '/') {
    if (!pathOrUrl || typeof pathOrUrl !== 'string') {
        return SITE_HOME_URL;
    }
    const trimmed = pathOrUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        if (trimmed === SITE_URL || trimmed === SITE_HOME_URL) {
            return SITE_HOME_URL;
        }
        return trimmed.replace(/\/+$/, '');
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (cleanPath === '/') {
        return SITE_HOME_URL;
    }
    return `${SITE_URL}${cleanPath.replace(/\/+$/, '')}`;
}

/**
 * 1. Organization Schema for HangBug
 */
export function buildOrganizationSchema() {
    return {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAME,
        url: SITE_HOME_URL,
        logo: {
            '@type': 'ImageObject',
            '@id': `${SITE_URL}/#logo`,
            url: LOGO_URL,
            contentUrl: LOGO_URL,
            caption: 'HangBug Developer Skill Verification Platform'
        },
        image: LOGO_URL,
        description:
            'HangBug is a modern web development quiz & certification platform. Practice quizzes, earn verified certificates, and compete on global leaderboards.',
        email: SUPPORT_EMAIL,
        contactPoint: [
            {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: SUPPORT_EMAIL,
                url: `${SITE_URL}/contact`,
                availableLanguage: ['English']
            }
        ]
    };
}

/**
 * 2. WebSite Schema for the official HangBug website
 */
export function buildWebSiteSchema() {
    return {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_HOME_URL,
        name: SITE_NAME,
        alternateName: 'HangBug — Debug Your Knowledge. Build Your Future.',
        description:
            'HangBug is a modern web development quiz & certification platform. Practice quizzes, earn verified certificates, and compete on global leaderboards.',
        inLanguage: 'en',
        publisher: {
            '@id': `${SITE_URL}/#organization`
        }
    };
}

/**
 * Derives default navigation breadcrumbs from a canonical path when explicit breadcrumbs are not passed.
 * @param {string} canonicalPath
 * @param {string} [pageTitle]
 */
export function deriveDefaultBreadcrumbs(canonicalPath = '/', pageTitle = '') {
    const cleanPath = !canonicalPath || canonicalPath === '/'
        ? '/'
        : (canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`).replace(/\/+$/, '');

    if (cleanPath === '/') {
        return [{ name: 'Home', path: '/' }];
    }

    const crumbs = [{ name: 'Home', path: '/' }];
    const segments = cleanPath.split('/').filter(Boolean);
    let currentPath = '';

    segments.forEach((seg, idx) => {
        currentPath += `/${seg}`;
        const isLast = idx === segments.length - 1;
        let label = DEFAULT_BREADCRUMB_LABELS[currentPath];
        if (!label) {
            if (isLast && pageTitle) {
                label = pageTitle.split(/[—|]/)[0].trim();
            } else {
                label = seg
                    .split('-')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
            }
        }
        crumbs.push({ name: label, path: currentPath });
    });

    return crumbs;
}

/**
 * 4. BreadcrumbList Schema for navigation
 */
export function buildBreadcrumbListSchema(breadcrumbs = [], pageUrl = SITE_HOME_URL) {
    const normalizedPageUrl = normalizeCanonicalUrl(pageUrl);
    const validItems = Array.isArray(breadcrumbs) && breadcrumbs.length > 0
        ? breadcrumbs.filter(b => b && typeof b.name === 'string' && b.name.trim())
        : [{ name: 'Home', path: '/' }];

    return {
        '@type': 'BreadcrumbList',
        '@id': `${normalizedPageUrl}#breadcrumb`,
        itemListElement: validItems.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name.trim(),
            item: normalizeCanonicalUrl(crumb.url || crumb.path || '/')
        }))
    };
}

/**
 * 3. WebPage Schema for important pages
 */
export function buildWebPageSchema({
    url = SITE_HOME_URL,
    title = 'HangBug — Debug Your Knowledge. Build Your Future.',
    description = 'HangBug is a modern web development quiz & certification platform. Practice quizzes, earn verified certificates, and compete on global leaderboards.',
    image = LOGO_URL,
    breadcrumbId,
    mainEntityId,
    datePublished,
    dateModified
} = {}) {
    const pageUrl = normalizeCanonicalUrl(url);
    const schema = {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: 'en',
        isPartOf: {
            '@id': `${SITE_URL}/#website`
        },
        about: {
            '@id': `${SITE_URL}/#organization`
        },
        primaryImageOfPage: {
            '@type': 'ImageObject',
            url: image || LOGO_URL
        }
    };

    if (breadcrumbId) {
        schema.breadcrumb = { '@id': breadcrumbId };
    }
    if (mainEntityId) {
        schema.mainEntity = { '@id': mainEntityId };
    }
    if (datePublished) {
        schema.datePublished = datePublished;
    }
    if (dateModified) {
        schema.dateModified = dateModified;
    }

    return schema;
}

/**
 * 5. Article Schema strictly for genuine blog articles
 * Returns null if required genuine article fields (headline, datePublished) are absent.
 */
export function buildArticleSchema(article = {}) {
    if (!article || typeof article !== 'object') return null;
    const headline = typeof article.headline === 'string' ? article.headline.trim() : '';
    const datePublished = typeof article.datePublished === 'string' ? article.datePublished.trim() : '';

    if (!headline || !datePublished) {
        return null;
    }

    const pageUrl = normalizeCanonicalUrl(article.url || article.canonicalPath || '/');
    const schema = {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        mainEntityOfPage: {
            '@id': `${pageUrl}#webpage`
        },
        headline,
        description: article.description || headline,
        image: Array.isArray(article.image) ? article.image : [article.image || LOGO_URL],
        datePublished,
        author: article.authorName
            ? {
                  '@type': article.authorType || 'Person',
                  name: article.authorName
              }
            : {
                  '@id': `${SITE_URL}/#organization`
              },
        publisher: {
            '@id': `${SITE_URL}/#organization`
        },
        inLanguage: 'en'
    };

    if (article.dateModified) {
        schema.dateModified = article.dateModified;
    }
    if (article.articleSection) {
        schema.articleSection = article.articleSection;
    }
    if (article.articleBody) {
        schema.articleBody = article.articleBody;
    }

    return schema;
}

/**
 * 6. SoftwareApplication Schema for the HangBug application (or an individual HangBug game module),
 * using only accurate, verifiable information and zero fabricated ratings, reviews, prices, or awards.
 */
export function buildSoftwareApplicationSchema(options = {}) {
    if (options && options.slug) {
        const gameUrl = normalizeCanonicalUrl(`/games/${options.slug}`);
        const gameTitle = options.name || options.title || 'Developer Game Challenge';
        return {
            '@type': 'SoftwareApplication',
            '@id': `${gameUrl}#application`,
            name: `${gameTitle} — HangBug`,
            url: gameUrl,
            description:
                options.description ||
                'Interactive browser-based coding and typing challenge for software developers on HangBug.',
            applicationCategory: 'EducationalApplication',
            applicationSubCategory: options.category || 'Coding & Typing Games',
            operatingSystem: options.operatingSystem || 'Web Browser',
            inLanguage: 'en',
            image: LOGO_URL,
            isPartOf: {
                '@id': `${SITE_URL}/#application`
            },
            author: {
                '@id': `${SITE_URL}/#organization`
            },
            publisher: {
                '@id': `${SITE_URL}/#organization`
            }
        };
    }

    return {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#application`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAME,
        url: SITE_HOME_URL,
        description:
            'HangBug is an interactive web development quiz, coding & typing games, and skill verification platform where software engineers practice quizzes, earn verified certificates, and compete on global leaderboards.',
        applicationCategory: 'EducationalApplication',
        applicationSubCategory: 'Web Development Quiz & Skill Verification Platform',
        operatingSystem: 'Web, Android, iOS',
        softwareVersion: APP_VERSION,
        identifier: ANDROID_PACKAGE_NAME,
        inLanguage: 'en',
        image: LOGO_URL,
        featureList: [
            'Interactive web development quizzes across multiple technology tracks',
            'Browser-based coding and typing games for developers',
            'Verifiable completion certificates with unique ID and QR code',
            'Session-based skill progression and performance analytics',
            'Global developer leaderboards'
        ],
        author: {
            '@id': `${SITE_URL}/#organization`
        },
        publisher: {
            '@id': `${SITE_URL}/#organization`
        }
    };
}

/**
 * 7. ProfilePage Schema only where appropriate (e.g., Developer Profile page)
 */
export function buildProfilePageSchema({
    url = `${SITE_URL}/dashboard/profile`,
    title = 'Developer Profile — HangBug',
    description = 'Manage your personal information and view your developer quiz activity and skill mastery on HangBug.',
    breadcrumbId,
    profile = {}
} = {}) {
    const pageUrl = normalizeCanonicalUrl(url);
    const personEntity = {
        '@type': 'Person',
        '@id': `${pageUrl}#person`,
        name: profile.name || 'HangBug Developer',
        memberOf: {
            '@id': `${SITE_URL}/#organization`
        }
    };

    if (profile.role) {
        personEntity.jobTitle = profile.role;
    }
    if (profile.description) {
        personEntity.description = profile.description;
    }
    if (Array.isArray(profile.knowsAbout) && profile.knowsAbout.length > 0) {
        personEntity.knowsAbout = profile.knowsAbout;
    }

    const schema = {
        '@type': 'ProfilePage',
        '@id': `${pageUrl}#profilepage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: 'en',
        isPartOf: {
            '@id': `${SITE_URL}/#website`
        },
        mainEntity: personEntity
    };

    if (breadcrumbId) {
        schema.breadcrumb = { '@id': breadcrumbId };
    }
    if (profile.dateCreated) {
        schema.dateCreated = profile.dateCreated;
    }

    return schema;
}

/**
 * ItemList Schema for visible collection pages (e.g., Technologies list, Games catalog)
 */
export function buildItemListSchema({ url = SITE_HOME_URL, name, description, items = [] } = {}) {
    if (!Array.isArray(items) || items.length === 0) return null;
    const pageUrl = normalizeCanonicalUrl(url);
    const validItems = items.filter(item => item && typeof item.name === 'string' && item.name.trim());
    if (validItems.length === 0) return null;

    return {
        '@type': 'ItemList',
        '@id': `${pageUrl}#itemlist`,
        name: name || 'HangBug Collection',
        ...(description ? { description } : {}),
        numberOfItems: validItems.length,
        itemListElement: validItems.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.name.trim(),
            url: normalizeCanonicalUrl(item.url || pageUrl),
            ...(item.description ? { description: item.description } : {})
        }))
    };
}

/**
 * EducationalOccupationalCredential Schema for visible verified certificate pages
 */
export function buildCredentialSchema({ url = `${SITE_URL}/certificate/view`, credential = {} } = {}) {
    if (!credential || !credential.name) return null;
    const pageUrl = normalizeCanonicalUrl(url);
    return {
        '@type': 'EducationalOccupationalCredential',
        '@id': `${pageUrl}#credential`,
        name: credential.name,
        credentialCategory: credential.credentialCategory || 'Certificate of Completion',
        ...(credential.identifier ? { identifier: credential.identifier } : {}),
        ...(credential.description ? { description: credential.description } : {}),
        recognizedBy: {
            '@id': `${SITE_URL}/#organization`
        }
    };
}

/**
 * Assembles a deduplicated JSON-LD @graph for a page configuration.
 */
export function buildPageStructuredData({
    title,
    description,
    canonicalPath = '/',
    ogImage = LOGO_URL,
    schemaType = 'WebPage',
    breadcrumbs,
    includeApplicationSchema = false,
    softwareApplication = null,
    article = null,
    profile = null,
    itemList = null,
    credential = null,
    datePublished,
    dateModified,
    disableStructuredData = false
} = {}) {
    if (disableStructuredData) {
        return null;
    }

    const pageUrl = normalizeCanonicalUrl(canonicalPath);
    const resolvedTitle = title || 'HangBug — Debug Your Knowledge. Build Your Future.';
    const resolvedDescription =
        description ||
        'HangBug is a modern web development quiz & certification platform. Practice quizzes, earn verified certificates, and compete on global leaderboards.';

    const graph = [];

    // 1. Organization Schema
    graph.push(buildOrganizationSchema());

    // 2. WebSite Schema
    graph.push(buildWebSiteSchema());

    // 4. BreadcrumbList Schema
    const resolvedBreadcrumbs =
        Array.isArray(breadcrumbs) && breadcrumbs.length > 0
            ? breadcrumbs
            : deriveDefaultBreadcrumbs(canonicalPath, resolvedTitle);
    const breadcrumbSchema = buildBreadcrumbListSchema(resolvedBreadcrumbs, pageUrl);
    graph.push(breadcrumbSchema);

    // Optional primary entities
    let mainEntityId;

    // 6. SoftwareApplication Schema (platform-level or game-specific)
    if (includeApplicationSchema || canonicalPath === '/') {
        const appSchema = buildSoftwareApplicationSchema();
        graph.push(appSchema);
        mainEntityId = appSchema['@id'];
    }

    if (softwareApplication && typeof softwareApplication === 'object') {
        if (!graph.some(n => n['@id'] === `${SITE_URL}/#application`)) {
            graph.push(buildSoftwareApplicationSchema());
        }
        const gameAppSchema = buildSoftwareApplicationSchema(softwareApplication);
        graph.push(gameAppSchema);
        mainEntityId = gameAppSchema['@id'];
    }

    // Collection ItemList if present on page
    if (itemList && Array.isArray(itemList.items) && itemList.items.length > 0) {
        const itemListNode = buildItemListSchema({
            url: pageUrl,
            name: itemList.name || resolvedTitle,
            description: itemList.description || resolvedDescription,
            items: itemList.items
        });
        if (itemListNode) {
            graph.push(itemListNode);
            if (!mainEntityId) {
                mainEntityId = itemListNode['@id'];
            }
        }
    }

    // Verified Certificate Credential if present on page
    if (credential && typeof credential === 'object' && credential.name) {
        const credentialNode = buildCredentialSchema({ url: pageUrl, credential });
        if (credentialNode) {
            graph.push(credentialNode);
            mainEntityId = credentialNode['@id'];
        }
    }

    // 5. Article Schema strictly for genuine blog articles
    if ((schemaType === 'Article' || article) && article) {
        const articleNode = buildArticleSchema({
            ...article,
            url: pageUrl,
            description: article.description || resolvedDescription,
            image: article.image || ogImage || LOGO_URL
        });
        if (articleNode) {
            mainEntityId = articleNode['@id'];
            graph.push(
                buildWebPageSchema({
                    url: pageUrl,
                    title: resolvedTitle,
                    description: resolvedDescription,
                    image: ogImage || LOGO_URL,
                    breadcrumbId: breadcrumbSchema['@id'],
                    mainEntityId,
                    datePublished: article.datePublished || datePublished,
                    dateModified: article.dateModified || dateModified
                })
            );
            graph.push(articleNode);
        }
    } else if (schemaType === 'ProfilePage' || profile) {
        // 7. ProfilePage Schema where appropriate
        graph.push(
            buildProfilePageSchema({
                url: pageUrl,
                title: resolvedTitle,
                description: resolvedDescription,
                breadcrumbId: breadcrumbSchema['@id'],
                profile: profile || {}
            })
        );
    } else {
        // 3. WebPage Schema for important pages
        graph.push(
            buildWebPageSchema({
                url: pageUrl,
                title: resolvedTitle,
                description: resolvedDescription,
                image: ogImage || LOGO_URL,
                breadcrumbId: breadcrumbSchema['@id'],
                mainEntityId,
                datePublished,
                dateModified
            })
        );
    }

    // Deduplicate nodes by @id to prevent any duplicate schema markup
    const seenIds = new Set();
    const deduplicatedGraph = [];
    for (const node of graph) {
        if (!node || typeof node !== 'object') continue;
        const id = node['@id'];
        if (id) {
            if (seenIds.has(id)) continue;
            seenIds.add(id);
        }
        deduplicatedGraph.push(node);
    }

    return {
        '@context': 'https://schema.org',
        '@graph': deduplicatedGraph
    };
}

/**
 * Recursively checks an object for forbidden fabricated keys (ratings, reviews, prices, awards).
 */
function findForbiddenKeys(obj, path = '') {
    const violations = [];
    if (!obj || typeof obj !== 'object') return violations;

    if (Array.isArray(obj)) {
        obj.forEach((item, idx) => {
            violations.push(...findForbiddenKeys(item, `${path}[${idx}]`));
        });
        return violations;
    }

    for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (FORBIDDEN_FABRICATED_KEYS.has(key)) {
            violations.push(currentPath);
        }
        if (value && typeof value === 'object') {
            violations.push(...findForbiddenKeys(value, currentPath));
        }
    }
    return violations;
}

/**
 * Validates a JSON-LD structured data payload before injection or deployment.
 * @param {object} jsonLd
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateStructuredData(jsonLd) {
    const errors = [];

    if (!jsonLd || typeof jsonLd !== 'object') {
        return { valid: false, errors: ['Structured data payload must be a non-null object.'] };
    }

    try {
        const serialized = JSON.stringify(jsonLd);
        JSON.parse(serialized);
    } catch (err) {
        errors.push(`Invalid JSON serialization: ${err.message}`);
    }

    if (jsonLd['@context'] !== 'https://schema.org') {
        errors.push(`Invalid @context: expected "https://schema.org", received "${jsonLd['@context']}".`);
    }

    if (!Array.isArray(jsonLd['@graph']) || jsonLd['@graph'].length === 0) {
        errors.push('@graph must be a non-empty array of Schema.org entities.');
        return { valid: false, errors };
    }

    const ids = new Set();
    for (const node of jsonLd['@graph']) {
        if (!node || typeof node !== 'object') {
            errors.push('Every @graph entry must be an object.');
            continue;
        }
        if (!node['@type'] || typeof node['@type'] !== 'string') {
            errors.push(`Graph node missing valid string @type: ${JSON.stringify(node)}`);
        }
        if (!node['@id'] || typeof node['@id'] !== 'string') {
            errors.push(`Graph node (${node['@type']}) missing valid string @id.`);
        } else {
            if (ids.has(node['@id'])) {
                errors.push(`Duplicate @id detected in @graph: ${node['@id']}`);
            }
            ids.add(node['@id']);
        }

        if (node['@type'] === 'Organization') {
            if (node.url !== SITE_HOME_URL) {
                errors.push(`Organization url must be ${SITE_HOME_URL}`);
            }
            const logoUrl = typeof node.logo === 'string' ? node.logo : node.logo?.url;
            if (logoUrl !== LOGO_URL) {
                errors.push(`Organization logo url must be ${LOGO_URL}`);
            }
        }

        if (node['@type'] === 'WebSite') {
            if (node.url !== SITE_HOME_URL) {
                errors.push(`WebSite url must be ${SITE_HOME_URL}`);
            }
        }

        if (node['@type'] === 'BreadcrumbList') {
            if (!Array.isArray(node.itemListElement) || node.itemListElement.length === 0) {
                errors.push('BreadcrumbList must contain non-empty itemListElement array.');
            } else {
                node.itemListElement.forEach((item, idx) => {
                    if (item['@type'] !== 'ListItem' || item.position !== idx + 1 || !item.name || !item.item) {
                        errors.push(`Invalid BreadcrumbList ListItem at index ${idx}.`);
                    }
                });
            }
        }

        if (node['@type'] === 'Article') {
            if (!node.headline || !node.datePublished) {
                errors.push('Article schema requires headline and datePublished.');
            }
        }

        if (node['@type'] === 'ProfilePage') {
            if (!node.mainEntity || node.mainEntity['@type'] !== 'Person' || !node.mainEntity.name) {
                errors.push('ProfilePage schema requires a Person mainEntity with a name.');
            }
        }
    }

    const forbidden = findForbiddenKeys(jsonLd);
    if (forbidden.length > 0) {
        errors.push(`Forbidden fabricated schema fields found: ${forbidden.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Injects or updates the single JSON-LD script element in document.head,
 * removing any duplicate application/ld+json script elements.
 */
export function injectStructuredData(jsonLd) {
    if (typeof document === 'undefined' || !document.head) return false;

    const allScripts = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'));
    let targetScript = document.getElementById(JSONLD_SCRIPT_ID);

    // Remove any duplicate or unmanaged JSON-LD script tags
    for (const script of allScripts) {
        if (script !== targetScript) {
            script.parentNode?.removeChild(script);
        }
    }

    if (!jsonLd) {
        if (targetScript) {
            targetScript.parentNode?.removeChild(targetScript);
        }
        return false;
    }

    const validation = validateStructuredData(jsonLd);
    if (!validation.valid) {
        console.warn('[HangBug SEO] Structured data validation failed:', validation.errors);
        return false;
    }

    if (!targetScript) {
        targetScript = document.createElement('script');
        targetScript.setAttribute('id', JSONLD_SCRIPT_ID);
        targetScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(targetScript);
    }

    targetScript.textContent = JSON.stringify(jsonLd);
    return true;
}
