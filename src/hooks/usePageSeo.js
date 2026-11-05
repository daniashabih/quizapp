import { useEffect } from 'react';

const BASE_URL = 'https://www.hangbug.com';
const DEFAULT_IMAGE = 'https://www.hangbug.com/branding/hangbug-logo-full.png';
const DEFAULT_SITE_NAME = 'HangBug';

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
 * Open Graph metadata, Twitter card metadata, and robots directives.
 * @param {{
 *   title: string,
 *   description?: string,
 *   canonicalPath?: string,
 *   noindex?: boolean,
 *   ogType?: string,
 *   ogImage?: string,
 *   ogImageAlt?: string,
 *   twitterCard?: string,
 *   twitterImage?: string
 * }} config
 */
export function usePageSeo({
    title,
    description,
    canonicalPath,
    noindex = false,
    ogType = 'website',
    ogImage = DEFAULT_IMAGE,
    ogImageAlt = 'HangBug Developer Platform',
    twitterCard = 'summary_large_image',
    twitterImage
}) {
    useEffect(() => {
        if (typeof document === 'undefined') return;

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
        if (description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', description);

            let ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', description);
            else setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);

            let twitterDesc = document.querySelector('meta[name="twitter:description"]');
            if (twitterDesc) twitterDesc.setAttribute('content', description);
            else setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
        }

        // 3. Route-specific Canonical URL
        if (canonicalPath !== undefined && canonicalPath !== null) {
            const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
            const canonicalHref = `${BASE_URL}${cleanPath === '/' ? '/' : cleanPath.replace(/\/$/, '')}`;

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
        }

        // 4. Open Graph Type & Site Name
        setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
        setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', DEFAULT_SITE_NAME);

        // 5. Open Graph & Twitter Image
        const imageToUse = ogImage || DEFAULT_IMAGE;
        setMetaTag('meta[property="og:image"]', 'property', 'og:image', imageToUse);
        setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', ogImageAlt);

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
    }, [title, description, canonicalPath, noindex, ogType, ogImage, ogImageAlt, twitterCard, twitterImage]);
}

export default usePageSeo;
