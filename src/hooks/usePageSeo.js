import { useEffect } from 'react';
import {
    buildPageStructuredData,
    injectStructuredData
} from '../utils/structuredData';

const BASE_URL = 'https://www.hangbug.com';
const DEFAULT_IMAGE = 'https://www.hangbug.com/branding/hangbug-logo-full.png';
const DEFAULT_SITE_NAME = 'Hangbug';

function truncateAtWordBoundary(value, maxLength = 160) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    const sliced = text.slice(0, maxLength - 3);
    const lastSpace = sliced.lastIndexOf(' ');
    return `${(lastSpace > maxLength / 2 ? sliced.slice(0, lastSpace) : sliced).trim()}...`;
}

function setMetaTag(selector, attributeName, attributeValue, content) {
    if (typeof document === 'undefined') return;
    let el = document.querySelector(selector);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attributeName, attributeValue);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

/**
 * Custom hook to manage route-specific title, meta description, canonical URL,
 * Open Graph metadata, Twitter card metadata, robots directives, and Schema.org JSON-LD.
 * @param {{
 *   title: string,
 *   description?: string,
 *   canonicalPath?: string,
 *   noindex?: boolean,
 *   ogType?: string,
 *   ogImage?: string,
 *   ogImageAlt?: string,
 *   twitterCard?: string,
 *   twitterImage?: string,
 *   schemaType?: 'WebPage' | 'ProfilePage' | 'Article',
 *   breadcrumbs?: Array<{ name: string, path?: string, url?: string }>,
 *   includeApplicationSchema?: boolean,
 *   softwareApplication?: object,
 *   article?: object,
 *   profile?: object,
 *   itemList?: object,
 *   credential?: object,
 *   datePublished?: string,
 *   dateModified?: string,
 *   disableStructuredData?: boolean
 * }} config
 */
export function usePageSeo({
    title,
    description,
    canonicalPath,
    noindex = false,
    skip = false,
    ogType = 'website',
    ogImage = DEFAULT_IMAGE,
    ogImageAlt = 'Hangbug – Technology Learning, Programming Quizzes & Skill Assessment Platform',
    twitterCard = 'summary_large_image',
    twitterImage,
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
}) {
    const serializedStructuredConfig = JSON.stringify({
        schemaType,
        breadcrumbs,
        includeApplicationSchema,
        softwareApplication,
        article,
        profile,
        itemList,
        credential,
        datePublished,
        dateModified,
        disableStructuredData
    });

    useEffect(() => {
        if (typeof document === 'undefined' || skip) return;
        const resolvedDescription = typeof description === 'string'
            ? truncateAtWordBoundary(description)
            : description;

        // 1. Document Title
        if (title) {
            document.title = title;

            let ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.setAttribute('content', title);
            else setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);

            let twitterTitle = document.querySelector('meta[name="twitter:title"]');
            if (twitterTitle) twitterTitle.setAttribute('content', title);
            else setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
        }

        // 2. Meta Description
        if (resolvedDescription) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', resolvedDescription);

            let ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', resolvedDescription);
            else setMetaTag('meta[property="og:description"]', 'property', 'og:description', resolvedDescription);

            let twitterDesc = document.querySelector('meta[name="twitter:description"]');
            if (twitterDesc) twitterDesc.setAttribute('content', resolvedDescription);
            else setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', resolvedDescription);
        }

        // 3. Route-specific Canonical URL (remove stale canonical on noindex pages)
        const normalizedCanonicalInput = typeof canonicalPath === 'string' ? canonicalPath.trim() : '';
        let resolvedCanonicalPath = '';
        if (normalizedCanonicalInput && !noindex) {
            const stripped = normalizedCanonicalInput.split('?')[0].split('#')[0].replace(/\/{2,}/g, '/');
            const prefixed = stripped.startsWith('/') ? stripped : `/${stripped}`;
            resolvedCanonicalPath = prefixed === '/' ? '/' : (prefixed.replace(/\/+$/, '') || '/');
            const canonicalHref = `${BASE_URL}${resolvedCanonicalPath}`;

            let canonicalLink = document.querySelector('link[rel="canonical"]');
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.setAttribute('rel', 'canonical');
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.setAttribute('href', canonicalHref);

            let ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl) ogUrl.setAttribute('content', canonicalHref);
            else setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalHref);

            let twitterUrl = document.querySelector('meta[name="twitter:url"]');
            if (twitterUrl) twitterUrl.setAttribute('content', canonicalHref);
            else setMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', canonicalHref);
        } else if (noindex) {
            document.querySelector('link[rel="canonical"]')?.remove();
            document.querySelector('meta[property="og:url"]')?.remove();
            document.querySelector('meta[name="twitter:url"]')?.remove();
        }

        // 4. Open Graph Type, Site Name & Article Meta
        setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
        setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', DEFAULT_SITE_NAME);

        // Clean stale article:* tags before setting current article metadata
        document.querySelectorAll('meta[property^="article:"]').forEach((el) => el.remove());
        if (ogType === 'article' && article) {
            if (article.datePublished) {
                setMetaTag('meta[property="article:published_time"]', 'property', 'article:published_time', article.datePublished);
            }
            if (article.dateModified) {
                setMetaTag('meta[property="article:modified_time"]', 'property', 'article:modified_time', article.dateModified);
            }
            if (article.articleSection) {
                setMetaTag('meta[property="article:section"]', 'property', 'article:section', article.articleSection);
            }
        }

        // 5. Open Graph & Twitter Image
        const imageToUse = ogImage || DEFAULT_IMAGE;
        setMetaTag('meta[property="og:image"]', 'property', 'og:image', imageToUse);
        setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', ogImageAlt);
        if (imageToUse !== DEFAULT_IMAGE) {
            document.querySelector('meta[property="og:image:width"]')?.remove();
            document.querySelector('meta[property="og:image:height"]')?.remove();
        } else {
            setMetaTag('meta[property="og:image:width"]', 'property', 'og:image:width', '1024');
            setMetaTag('meta[property="og:image:height"]', 'property', 'og:image:height', '1024');
        }

        setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', twitterCard);
        setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', twitterImage || imageToUse);
        setMetaTag('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', ogImageAlt);

        // 6. Handle Robots Directives
        let robotsMeta = document.querySelector('meta[name="robots"]');
        if (noindex) {
            if (!robotsMeta) {
                robotsMeta = document.createElement('meta');
                robotsMeta.setAttribute('name', 'robots');
                document.head.appendChild(robotsMeta);
            }
            robotsMeta.setAttribute('content', 'noindex, nofollow');
        } else {
            if (robotsMeta) {
                robotsMeta.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
            } else {
                setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
            }
        }

        // 7. Schema.org JSON-LD Structured Data
        const shouldEmitSchema =
            !disableStructuredData &&
            !noindex &&
            (Boolean(resolvedCanonicalPath) || schemaType === 'ProfilePage' || Boolean(article));

        if (shouldEmitSchema) {
            const schemaCanonicalPath =
                resolvedCanonicalPath ||
                (schemaType === 'ProfilePage' ? '/dashboard/profile' : '/');
            const jsonLd = buildPageStructuredData({
                title,
                description: resolvedDescription,
                canonicalPath: schemaCanonicalPath,
                ogImage: imageToUse,
                schemaType,
                breadcrumbs,
                includeApplicationSchema,
                softwareApplication,
                article,
                profile,
                itemList,
                credential,
                datePublished,
                dateModified,
                disableStructuredData
            });
            injectStructuredData(jsonLd);
        } else {
            injectStructuredData(null);
        }
    }, [
        skip,
        title,
        description,
        canonicalPath,
        noindex,
        ogType,
        ogImage,
        ogImageAlt,
        twitterCard,
        twitterImage,
        serializedStructuredConfig
    ]);
}

export default usePageSeo;
