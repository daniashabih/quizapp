# Google AdSense Technical Integration Audit

**Site:** https://www.hangbug.com/  
**Audit date:** 2026-11-26  
**Scope:** Public website integration, live HTTP responses, crawler directives, selected rendered routes, and related repository configuration.  
**Disposition:** **Not ready to treat as safely production-enabled until AdSense account approval and consent handling are confirmed.**

## Executive summary

The website's AdSense publisher ID is internally consistent: the live homepage, source meta tag and loader, and live `ads.txt` all use publisher `ca-pub-2412757543318629`. The live `ads.txt` returns HTTP 200 with the expected Google seller declaration. The site's default robots policy allows public crawling and disallows private/account paths; the sitemap and sampled public pages are reachable.

There are material launch risks:

1. The AdSense loader is in the global HTML shell. It loads on login, signup, password-reset, admin, and dashboard routes. A dynamically inserted, zero-size AdSense node was observed on these routes; no visible ad rendered in the unauthenticated sample. This does **not** prove those paths are excluded from Auto ads for all users or regions.
2. The browser made a Google ad request on the homepage. No visible ad was confirmed, and the site's AdSense account/Auto ads settings and approval state are not accessible to this audit. **Do not assume production ads are off.**
3. No first-party consent-management platform or TCF consent integration was found. The privacy policy itself says Hangbug has no separate cookie-preference panel. This needs resolution before personalized ads are served to applicable regional traffic.

No publisher ID was changed, no ad was enabled, and the existing Google Analytics integration was left unchanged.

## Findings

| Area | Result | Evidence / notes |
|---|---|---|
| AdSense script installation | **Present; site-wide** | `index.html` loads `adsbygoogle.js` using the configured web publisher ID. Runtime inspection found one loader on the homepage and on each sampled account/admin route. |
| Web publisher ID | **Consistent; ownership unverified** | `ca-pub-2412757543318629` appears in the source meta tag and script URL, the live homepage, and the live `ads.txt` record. This verifies configuration consistency, not ownership or approval in the AdSense account. |
| Live `ads.txt` | **Pass** | `GET https://www.hangbug.com/ads.txt` returned HTTP 200, `text/plain; charset=utf-8`, and `google.com, pub-2412757543318629, DIRECT, f08c47fec0942fa0`. This matches `public/ads.txt`. |
| Live `app-ads.txt` | **Pass for records observed** | HTTP 200 and `text/plain`. The source includes the website publisher and `pub-1003128718127272`, which corresponds to the distinct Android AdMob app ID/unit configured in the mobile project. Do not treat these separate product IDs as interchangeable. |
| AdSense crawler access | **Robots policy permits it** | Live `robots.txt` returns HTTP 200. Its `User-agent: *` group allows `/`; no `Mediapartners-Google` disallow was found. Public pages, `ads.txt`, and sitemap are reachable. This does not prove a real Google crawler has fetched the site or that AdSense has accepted it. |
| Essential public pages | **Reachable in sampled checks** | Homepage, `/technologies`, `/games`, `/blog`, and `/privacy-policy` returned HTTP 200. Live sitemap returned HTTP 200 as XML and lists public content. |
| Sensitive account paths | **Risk: loader is not excluded** | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/admin`, and `/dashboard` each loaded one AdSense script and had one dynamically created AdSense node in the browser sample. The node was zero-size/hidden and no visible ad was detected in that sample. No production guarantee can be made from one unauthenticated rendering. |
| Duplicate AdSense scripts | **No duplicate found** | Source search found one AdSense loader declaration; browser inspection found one loader per sampled route. The separate Google Analytics `gtag.js` is not a duplicate AdSense loader. |
| Consent management | **Gap** | No CMP, TCF API, or site-level consent flow was found. The privacy policy discloses advertising cookies and says there is no separate preference panel. Google requires a Google-certified CMP integrated with TCF when serving personalized ads to users in the EEA, UK, and Switzerland. Applicable privacy/opt-out requirements elsewhere also need review based on visitor locations and ad behavior. |
| Ad placement / layout | **No visible obstruction observed; configuration risk remains** | No manually authored web ad-unit markup was found. The sampled homepage view showed no visible ad covering navigation or content; the observed AdSense node had zero dimensions. Because the global loader can invoke account-side Auto ads, this limited rendering check cannot establish safe placement on every route, viewport, or account configuration. |
| Invalid placement policy | **No visible violation confirmed; sensitive-page risk** | Google policy prohibits inappropriate placements including non-content pages and pages focused on private communication. Although no visible ad appeared in the sampled sign-in/reset/admin views, the site-wide loader means these routes are not technically isolated from AdSense/Auto ads. |
| Production approval / serving | **Unverified; hold** | AdSense account approval and Auto ads settings are account-side. A Google ad request was observed from the live homepage, but a filled, visible ad and approval status were not verified. Do not activate or expand production ad serving until the account status is confirmed. |

## Live checks performed

- HTTP GET checks returned **200** for `/`, `/ads.txt`, `/robots.txt`, `/sitemap.xml`, `/technologies`, `/games`, `/blog`, `/privacy-policy`, and the sampled auth/account paths.
- `ads.txt` and `robots.txt` returned `text/plain; charset=utf-8`; sitemap returned `application/xml; charset=utf-8`.
- Browser inspection found one AdSense loader and one Analytics loader (`G-BSZBBFZZH0`) on sampled routes. The homepage initiated a request to Google ad-serving infrastructure; an ad was not confirmed visible.
- The browser check of private paths was unauthenticated and is not a substitute for Google crawler logs, the AdSense dashboard, or tests with all account/region/Auto ads configurations.

## Required actions before production ads

1. **Keep production ad serving on hold.** Confirm the AdSense account's site approval and current Auto ads status in the account. Since a live ad request was observed, disable/pause Auto ads there while approval is unconfirmed. Do not add ad units or enable Auto ads as part of this audit.
2. **Exclude sensitive paths from ad delivery.** Ensure login, registration/signup, password recovery/reset, account deletion, admin, dashboard/profile/settings, and private quiz/result pages cannot serve ads. Use both route-level script/slot controls and account-side Auto ads exclusions; `robots.txt` is not an ad-serving control.
3. **Implement and test consent handling** before serving personalized ads in the EEA, UK, and Switzerland: use a Google-certified CMP integrated with IAB TCF, transmit user choices correctly, and provide a usable preference/withdrawal path. Review additional requirements for all regions where the site has users.
4. **Re-test placements** after approval and consent setup on public content pages at phone and desktop sizes. Confirm ads are clearly distinguishable, separated from controls/content, do not overlay or imitate navigation, and do not appear on sensitive/non-content pages.
5. **Validate in AdSense tools** that the site is approved, the crawler can fetch public content, `ads.txt` is recognized, and no policy or consent diagnostics remain.

## Related mobile note (separate AdMob integration)

The Flutter app uses a different AdMob publisher/app ID (`ca-app-pub-1003128718127272~7941454138`) and banner unit (`ca-app-pub-1003128718127272/5647085407`). Its configuration selects production IDs in release builds and test IDs in non-release builds. The AdMob account's approval and consent configuration were not verifiable from this website audit; confirm them separately before relying on production mobile ads. This does not change or replace the website's AdSense publisher ID.

## References

- Live [ads.txt](https://www.hangbug.com/ads.txt), [robots.txt](https://www.hangbug.com/robots.txt), and [sitemap](https://www.hangbug.com/sitemap.xml)
- Source [index.html](./index.html), [public/ads.txt](./public/ads.txt), [public/app-ads.txt](./public/app-ads.txt), [public/robots.txt](./public/robots.txt), and [vercel.json](./vercel.json)
- Source [PrivacyPolicy.jsx](./src/pages/legal/PrivacyPolicy.jsx) and [publicPageSeoRenderer.js](./api/_utils/publicPageSeoRenderer.js)
- Mobile [ad_config.dart](./mobile/lib/core/config/ad_config.dart) and [ad_integration_test.dart](./mobile/test/ad_integration_test.dart)
- Google: [Consent management requirements for the EEA, UK, and Switzerland](https://support.google.com/adsense/answer/13554116?hl=en), [Required privacy policy content](https://support.google.com/adsense/answer/1348695?hl=en), and [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en)
