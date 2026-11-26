# Hangbug Technical SEO Audit

Audit date: 2026-11-26  
Canonical site: https://www.hangbug.com/  
Scope: 39 production sitemap URLs, 14 additional routes discovered through internal links, 10 additional configured technology routes, five additional utility/auth route cases, and mobile-browser checks at 375 x 812 (68 distinct production URL/route cases total).

## Executive summary

- The sitemap exposed 39 indexable URLs. All returned HTTP 200, had one HTTPS `www` self-canonical, an indexable robots directive, one H1, unique title and description values, and parseable JSON-LD.
- A further 20 routes (14 technology pages and six game pages) returned HTTP 200 and were indexable but were not listed in the sitemap. The repository's sitemap policy/tests intentionally restrict technology entries to populated categories and game entries to database-listed games; this audit records the mismatch without changing that policy.
- No duplicate titles or descriptions were found among those URLs. The 63 distinct internal links checked returned successfully; none were broken.
- Unknown technology, game, blog, and arbitrary paths returned HTTP 404 with `noindex, nofollow`; no soft 404s or redirect loops were observed.
- HTTPS and `www` are consistently enforced. `http://hangbug.com/` takes two permanent redirects (`http` to HTTPS apex, then apex to `www`); the other tested host/scheme variants take one redirect.
- Thirteen production meta descriptions exceeded 160 characters across the sitemap and additional routes. Source changes now cap search/social descriptions at 160 characters and align the home title and game metadata across prerendered and hydrated output. These changes still require a Vercel build/deployment before they affect production.
- At 375 px wide, `/games` had a 382 px document width. The filter row now wraps within the mobile viewport; a browser-side simulation of the updated classes reduced the width to 370 px.

## URL-by-URL crawl

All rows below were observed on production before deploying the local metadata fixes. “Self” means the canonical was exactly `https://www.hangbug.com` plus the listed path (with `/` for the home page). Title lengths are characters. The description column is the production character count before the change.

| URL | HTTP | Canonical | Title | Title chars | Description chars | H1 / JSON-LD |
|---|---:|---|---|---:|---:|---|
| https://www.hangbug.com/ | 200 | Self | Free Interactive Coding Quiz Practice & Certificates | 52 | 147 | 1 / valid |
| https://www.hangbug.com/technologies | 200 | Self | Free Interactive Tech Quiz Practice & Certificates \| Hangbug | 60 | 151 | 1 / valid |
| https://www.hangbug.com/games | 200 | Self | Free Interactive Coding Games & Typing Practice \| Hangbug | 57 | 179 | 1 / valid |
| https://www.hangbug.com/leaderboard | 200 | Self | Global Developer Leaderboard & Rankings - Hangbug | 51 | 132 | 1 / valid |
| https://www.hangbug.com/about | 200 | Self | About Hangbug: Free Interactive Quizzes & Certificates | 54 | 172 | 1 / valid |
| https://www.hangbug.com/contact | 200 | Self | Contact Support & Inquiries - Hangbug Coding Quiz Platform | 60 | 140 | 1 / valid |
| https://www.hangbug.com/privacy-policy | 200 | Self | Privacy Policy - Hangbug Data Protection & Cookie Policy | 58 | 138 | 1 / valid |
| https://www.hangbug.com/terms | 200 | Self | Terms of Service - Hangbug Platform Terms & Conditions | 56 | 148 | 1 / valid |
| https://www.hangbug.com/blog | 200 | Self | Free Coding Tutorials & Interactive Quiz Practice \| Hangbug | 59 | 158 | 1 / valid |
| https://www.hangbug.com/technologies/html | 200 | Self | Free HTML Quiz: Interactive Practice & Certificate \| Hangbug | 60 | 157 | 1 / valid |
| https://www.hangbug.com/technologies/javascript | 200 | Self | Free JavaScript Quiz: Interactive Practice & Certificate | 56 | 159 | 1 / valid |
| https://www.hangbug.com/technologies/react | 200 | Self | Free React.js Quiz: Interactive Practice & Certificate | 54 | 159 | 1 / valid |
| https://www.hangbug.com/technologies/php | 200 | Self | Free PHP Quiz: Interactive Practice & Certificate \| Hangbug | 59 | 156 | 1 / valid |
| https://www.hangbug.com/technologies/laravel | 200 | Self | Free Laravel Quiz: Interactive Practice & Certificate | 53 | 156 | 1 / valid |
| https://www.hangbug.com/technologies/mysql | 200 | Self | Free MySQL Quiz: Interactive Practice & Certificate | 51 | 158 | 1 / valid |
| https://www.hangbug.com/technologies/mongodb | 200 | Self | Free MongoDB Quiz: Interactive Practice & Certificate | 53 | 207 | 1 / valid |
| https://www.hangbug.com/technologies/dart | 200 | Self | Free Dart Quiz: Interactive Practice & Certificate \| Hangbug | 60 | 159 | 1 / valid |
| https://www.hangbug.com/technologies/python | 200 | Self | Free Python Quiz: Interactive Practice & Certificate | 52 | 158 | 1 / valid |
| https://www.hangbug.com/technologies/sql | 200 | Self | Free SQL Quiz: Interactive Practice & Certificate \| Hangbug | 59 | 154 | 1 / valid |
| https://www.hangbug.com/games/code-puzzle | 200 | Self | Code Puzzle - Interactive Coding Game \| Hangbug | 49 | 167 | 1 / valid |
| https://www.hangbug.com/games/find-the-bug | 200 | Self | Find The Bug - Interactive Coding Game \| Hangbug | 50 | 165 | 1 / valid |
| https://www.hangbug.com/games/output-predictor | 200 | Self | Output Predictor - Interactive Coding Game \| Hangbug | 54 | 151 | 1 / valid |
| https://www.hangbug.com/games/code-scramble | 200 | Self | Code Scramble - Interactive Coding Game \| Hangbug | 51 | 147 | 1 / valid |
| https://www.hangbug.com/games/missing-code | 200 | Self | Missing Code - Interactive Coding Game \| Hangbug | 50 | 146 | 1 / valid |
| https://www.hangbug.com/games/logic-builder | 200 | Self | Logic Builder - Interactive Coding Game \| Hangbug | 51 | 155 | 1 / valid |
| https://www.hangbug.com/games/sql-challenge | 200 | Self | SQL Challenge - Interactive Coding Game \| Hangbug | 51 | 163 | 1 / valid |
| https://www.hangbug.com/games/memory-match | 200 | Self | Memory Match - Interactive Coding Game \| Hangbug | 50 | 152 | 1 / valid |
| https://www.hangbug.com/games/speed-typing | 200 | Self | Speed Typing - Developer Typing Challenge \| Hangbug | 53 | 149 | 1 / valid |
| https://www.hangbug.com/games/code-typing | 200 | Self | Code Typing - Developer Typing Challenge \| Hangbug | 52 | 156 | 1 / valid |
| https://www.hangbug.com/games/sixty-second-challenge | 200 | Self | 60-Second Challenge - Developer Typing Challenge \| Hangbug | 60 | 136 | 1 / valid |
| https://www.hangbug.com/games/error-free-typing | 200 | Self | Error-Free Typing - Developer Typing Challenge \| Hangbug | 58 | 144 | 1 / valid |
| https://www.hangbug.com/games/syntax-typing | 200 | Self | Syntax Typing - Developer Typing Challenge \| Hangbug | 54 | 135 | 1 / valid |
| https://www.hangbug.com/games/word-rain | 200 | Self | Word Rain - Developer Typing Challenge \| Hangbug | 50 | 165 | 1 / valid |
| https://www.hangbug.com/blog/html-tutorial-for-beginners | 200 | Self | HTML Tutorial for Beginners: Learn HTML5 Step by \| Hangbug | 58 | 161 | 1 / valid |
| https://www.hangbug.com/blog/css-basics-beginners-guide | 200 | Self | CSS Basics: Beginner's Guide to Website Styling \| Hangbug | 57 | 164 | 1 / valid |
| https://www.hangbug.com/blog/javascript-fundamentals-beginners-guide | 200 | Self | JavaScript Fundamentals Every Beginner Should Know \| Hangbug | 60 | 156 | 1 / valid |
| https://www.hangbug.com/blog/php-programming-beginners-guide | 200 | Self | PHP Programming: Complete Beginner's Guide \| Hangbug | 54 | 162 | 1 / valid |
| https://www.hangbug.com/blog/laravel-basics-mvc-architecture | 200 | Self | Laravel Basics: Understanding MVC Architecture \| Hangbug | 56 | 152 | 1 / valid |
| https://www.hangbug.com/blog/flutter-dart-mobile-app-development | 200 | Self | Flutter and Dart: Mobile App Development Guide \| Hangbug | 56 | 148 | 1 / valid |

## Additional routes outside the sitemap

These production URLs were discovered through internal links or the configured technology-page set. The 20 indexable routes below returned HTTP 200, used HTTPS `www` self-canonicals, and declared `index, follow`, but were not in the sitemap:

| URL | Page title | HTTP | Canonical | Robots | Description chars after hydration |
|---|---|---:|---|---|---:|
| https://www.hangbug.com/technologies/css | Free CSS Quiz: Interactive Practice & Certificate \| Hangbug | 200 | Self | index, follow | 160 |
| https://www.hangbug.com/technologies/django | Free Django Quiz: Interactive Practice & Certificate | 200 | Self | index, follow | 156 |
| https://www.hangbug.com/technologies/flutter | Free Flutter Quiz: Interactive Practice & Certificate | 200 | Self | index, follow | 160 |
| https://www.hangbug.com/technologies/programming-fundamentals | Free Interactive Programming Fundamentals Quiz & Certificate | 200 | Self | index, follow | 158 |
| https://www.hangbug.com/technologies/typescript | Free TypeScript Quiz: Interactive Practice & Certificate | 200 | Self | index, follow | 148 |
| https://www.hangbug.com/technologies/nextjs | Free Next.js Quiz: Interactive Practice & Certificate | 200 | Self | index, follow | 149 |
| https://www.hangbug.com/technologies/docker | Free Docker Quiz: Interactive Practice & Certificate | 200 | Self | index, follow | 150 |
| https://www.hangbug.com/technologies/tailwindcss | Free Tailwind CSS Quiz: Interactive Practice & Certificate | 200 | Self | index, follow | 150 |
| https://www.hangbug.com/technologies/git | Free Git Quiz: Interactive Practice & Certificate \| Hangbug | 200 | Self | index, follow | 158 |
| https://www.hangbug.com/technologies/github | Free GitHub Quiz: Interactive Practice & Certificate | 200 | Self | index, follow | 150 |
| https://www.hangbug.com/technologies/angular | Free Angular Quiz: Interactive Practice & Certificate | 200 | Self | index, follow | 162 |
| https://www.hangbug.com/technologies/vue | Free Vue.js Quiz: Interactive Practice & Certificate | 200 | Self | index, follow | 153 |
| https://www.hangbug.com/technologies/bootstrap | Free Bootstrap 5 Quiz: Interactive Practice & Certificate | 200 | Self | index, follow | 156 |
| https://www.hangbug.com/technologies/wordpress | Free WordPress Quiz: Interactive Practice & Certificate | 200 | Self | index, follow | 159 |
| https://www.hangbug.com/games/csharp-oop-challenge | C# OOP Challenge — Interactive Coding Game \| Hangbug | 200 | Self | index, follow | 146 |
| https://www.hangbug.com/games/csharp-collections-challenge | C# Collections Challenge — Interactive Coding Game \| Hangbug | 200 | Self | index, follow | 145 |
| https://www.hangbug.com/games/csharp-linq-challenge | C# LINQ Challenge — Interactive Coding Game \| Hangbug | 200 | Self | index, follow | 139 |
| https://www.hangbug.com/games/csharp-exception-handling | C# Exception Handling — Interactive Coding Game \| Hangbug | 200 | Self | index, follow | 151 |
| https://www.hangbug.com/games/complete-the-code | Complete the Code — Interactive Coding Game \| Hangbug | 200 | Self | index, follow | 160 |
| https://www.hangbug.com/games/csharp-quiz-challenge | C# Quiz Challenge — Interactive Coding Game \| Hangbug | 200 | Self | index, follow | 157 |

The rendered-browser check confirmed one H1, Open Graph title/description/image, Twitter card metadata, and one JSON-LD block on each of these 20 routes. The two game pages had longer prerendered descriptions in the original crawl (OOP: 164 characters; Collections: 162) but hydrated to 146 and 145 characters respectively. This prerender/client mismatch is addressed by the local metadata normalization changes; Angular remained 162 characters after hydration and is covered by the same cap.

All 20 were intentionally left out of the sitemap change because existing code/tests encode a narrower sitemap policy; either include these routes in the sitemap or make truly unpublished pages `noindex`, but avoid leaving an undocumented split between sitemap eligibility and indexability.

The following four internally linked utility/auth pages returned HTTP 200 and correctly used `noindex, nofollow` without a canonical:

| URL | HTTP | Robots | Canonical |
|---|---:|---|---|
| https://www.hangbug.com/certificate/view | 200 | noindex, nofollow | None |
| https://www.hangbug.com/delete-account | 200 | noindex, nofollow | None |
| https://www.hangbug.com/login | 200 | noindex, nofollow | None |
| https://www.hangbug.com/register | 200 | noindex, nofollow | None |

Five additional direct route checks also returned HTTP 200 with `noindex, nofollow` and no canonical: `/leaderboard/full`, `/signup`, `/forgot-password`, `/reset-password`, and `/reset-password/<token>`. These are functional utility/auth routes, not soft 404s. `/register` and `/signup` expose overlapping registration entry points, but both are excluded from indexing.

## Findings and changes

### Canonicals, duplicates, redirects, and indexability

- Every sitemap URL used HTTPS, `www`, and a self-referencing canonical. Query strings were not included in canonical URLs.
- The sitemap contained no duplicate URLs, redirected aliases, or duplicate page titles/descriptions.
- Tested legacy routes (`/privacy`, `/resources`) and trailing-slash URLs resolved in one permanent redirect. No loops were found.
- The HTTP apex chain is `http://hangbug.com/` -> `https://hangbug.com/` -> `https://www.hangbug.com/`. This is consistent but could be reduced to one hop only through the Vercel domain/redirect configuration; it was not changed in application routing.
- `robots.txt` and `sitemap.xml` both returned HTTP 200. Robots rules allow public content, block API/account/admin areas, and reference the canonical sitemap. The sitemap listed 39 indexable URLs, while 20 other tested public routes remained indexable but absent from it. Existing tests encode these exclusions; align indexability and sitemap eligibility after deciding whether empty-quiz routes should be discoverable.
- Invalid arbitrary, technology, game, and blog paths returned HTTP 404 and `noindex, nofollow`; no soft 404s were observed.

### On-page metadata and structured data

- All 39 sitemap pages had a unique title (49-60 characters) and description. Thirteen production descriptions exceeded 160 characters across the sitemap and additional route checks: `/games`, `/about`, `/technologies/mongodb`, `/games/code-puzzle`, `/games/find-the-bug`, `/games/sql-challenge`, `/games/word-rain`, `/blog/html-tutorial-for-beginners`, `/blog/css-basics-beginners-guide`, `/blog/php-programming-beginners-guide`, `/technologies/angular`, `/games/csharp-collections-challenge`, and `/games/csharp-oop-challenge`.
- Local changes cap meta, Open Graph, and Twitter descriptions at 160 characters. Home title and the games/about descriptions were aligned between prerendered and client-rendered SEO metadata. Deploy and rerun the production crawl to confirm.
- Open Graph and Twitter/X title, description, URL, image, and card metadata were present on all 59 indexable sitemap and additional routes. The shared logo image returned HTTP 200.
- Each of those 59 indexable routes contained one parseable JSON-LD block. Page, organization/site, breadcrumb, article, and application schemas were present where appropriate; no malformed JSON-LD was found. JSON-LD was not separately assessed on noindex utility/auth routes.

### Headings, links, and mobile loading

- All 39 sitemap pages and the 20 additional indexable routes had exactly one H1; no skipped heading levels were found in the static crawl of the sitemap pages.
- 63 distinct internal links were checked; none returned a failing status.
- Home, technologies, games, and blog loaded with HTTP 200 at a 375 x 812 viewport; no failed images were found. The games page's difficulty controls caused horizontal overflow (382 px document width); responsive wrapping was added and the equivalent browser-side layout test measured 370 px afterward.
- The games page populated its game links after client loading; after a five-second wait, the page showed 35 internal game links and no zero-game loading label.
- No production Lighthouse/Core Web Vitals run or Google Search Console access was available in this audit. Browser checks do not substitute for field performance data.

## Validation and deployment status

- The production crawl and rendered-browser checks verify the current deployed behavior, including the expanded 20-route crawl above.
- Local source changes are not deployed, so the production site does not yet include the description cap, homepage title alignment, or mobile filter fix.
- Automated tests and builds were not run because Node.js, npm, and Flutter tooling were unavailable in the environment. The focused regression test was added but still needs to run in CI or a development environment with the project dependencies installed.
- No database schema, API contract, application route, or canonical URL was changed. The 2-hop HTTP-apex redirect can only be shortened through Vercel domain/redirect configuration.

## Files changed

- `src/hooks/usePageSeo.js` - bounded search/social descriptions and use the same normalized text in JSON-LD.
- `api/_utils/blogSeoRenderer.js` - bounded prerendered and blog descriptions.
- `api/_controllers/seoController.js` - aligned fallback game descriptions with hydrated output.
- `src/config/seoPagesConfig.js`, `src/pages/games/GamePlayer.jsx`, `src/pages/legal/AboutUs.jsx` - aligned page metadata.
- `src/pages/games/GamesHub.jsx` - aligned page metadata and wrapped mobile filters.
- `tests/technicalSeoAudit.test.cjs` - regression test for matching, bounded search/social descriptions.
- `TECHNICAL_SEO_AUDIT.md` - URL-by-URL findings and remediation status.

The Flutter Android/iOS app is not served at the audited canonical website and does not expose crawlable web pages; no native mobile SEO changes were applicable. The mobile browser experience was included in the responsive checks above.
