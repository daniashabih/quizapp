import { useEffect } from 'react';

const BASE_URL = 'https://www.hangbug.com';

/**
 * Custom hook to manage route-specific title, meta description, and canonical URL
 * @param {{
 *   title: string,
 *   description?: string,
 *   canonicalPath?: string,
 *   noindex?: boolean
 * }} config
 */
export function usePageSeo({ title, description, canonicalPath, noindex = false }) {
    useEffect(() => {
        // 1. Title
        if (title) {
            document.title = title;

            let ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.setAttribute('content', title);

            let twitterTitle = document.querySelector('meta[name="twitter:title"]');
            if (twitterTitle) twitterTitle.setAttribute('content', title);
        }

        // 2. Description
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

            let twitterDesc = document.querySelector('meta[name="twitter:description"]');
            if (twitterDesc) twitterDesc.setAttribute('content', description);
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

            let twitterUrl = document.querySelector('meta[name="twitter:url"]');
            if (twitterUrl) twitterUrl.setAttribute('content', canonicalHref);
        }

        // 4. Handle Robots Noindex (e.g. 404 pages)
        let robotsMeta = document.querySelector('meta[name="robots"]');
        if (noindex) {
            if (!robotsMeta) {
                robotsMeta = document.createElement('meta');
                robotsMeta.setAttribute('name', 'robots');
                document.head.appendChild(robotsMeta);
            }
            robotsMeta.setAttribute('content', 'noindex, nofollow');
        } else if (robotsMeta) {
            robotsMeta.remove();
        }
    }, [title, description, canonicalPath, noindex]);
}

export default usePageSeo;
