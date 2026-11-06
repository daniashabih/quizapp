/**
 * Frontend Engineering & Interview Preparation Articles
 * Topics:
 * 1. 50 HTML Interview Questions and Answers
 * 2. 50 CSS Interview Questions and Answers
 * 3. JavaScript MCQs for Beginners
 */

const frontendArticles = [
    {
        id: 'blog_html_50_interview_qa',
        slug: '50-html-interview-questions-and-answers',
        title: '50 HTML Interview Questions and Answers (Beginner to Senior Frontend Guide)',
        excerpt: 'Master 50 essential HTML5 interview questions covering semantic markup, DOM rendering, accessibility (WAI-ARIA), form validation, resource hints, Web APIs, and SEO with production-ready code examples.',
        category: 'Frontend Development',
        tags: ['HTML5', 'Frontend Interview', 'Web Accessibility', 'Semantic HTML', 'DOM', 'Technical SEO'],
        difficulty: 'All Levels',
        readingTimeMinutes: 18,
        authorName: 'Aarav Mehta',
        authorRole: 'Principal Frontend Architect & W3C Accessibility Contributor',
        authorBio: 'Aarav has 11+ years of experience building accessible, high-performance web applications and conducting over 300 frontend technical interviews.',
        authorAvatar: 'AM',
        coverGradient: 'gradient-amber',
        seoTitle: '50 HTML Interview Questions and Answers (2026 Developer Guide) — HangBug',
        seoDescription: 'Prepare for your frontend interview with 50 real-world HTML and HTML5 questions and answers. Includes semantic markup, async vs defer, ARIA accessibility, forms, and DOM examples.',
        seoKeywords: ['50 html interview questions and answers', 'html5 interview questions', 'semantic html questions', 'frontend interview preparation', 'html accessibility questions'],
        canonicalUrl: 'https://www.hangbug.com/blog/50-html-interview-questions-and-answers',
        relatedQuizCategory: 'HTML',
        relatedGameSlug: 'code-puzzle',
        isPublished: true,
        isFeatured: true,
        viewsCount: 4820,
        order: 1,
        publishedAt: '2026-09-15T09:00:00.000Z',
        updatedAt: '2026-11-01T14:30:00.000Z',
        keyTakeaways: [
            'Understand how the browser HTML parser handles DOCTYPE, standards mode vs quirks mode, and script execution lifecycles (normal vs async vs defer).',
            'Use semantic HTML5 elements (<main>, <article>, <section>, <nav>, <aside>, <figure>) to build an accurate Accessibility Tree and improve search engine crawlability.',
            'Leverage native HTML5 constraint validation (required, pattern, minlength, inputmode) before reaching for heavy JavaScript validation libraries.',
            'Optimize Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) using responsive images (srcset, sizes, <picture>), width/height attributes, and fetchpriority="high".'
        ],
        content: `## Why HTML Mastery Still Decides Frontend Interviews

Many developers treat HTML as an afterthought and jump straight into React or Vue hooks. Yet in real technical interviews, engineering managers use HTML questions to quickly distinguish developers who understand **how browsers actually parse, render, and expose documents to assistive technologies** from those who only copy-paste ` + '`<div>`' + ` tags.

Below are **50 carefully curated HTML interview questions and answers**, organized from foundational parsing concepts to advanced browser APIs and performance optimization.

---

## Part 1: Core HTML5 Foundations & Document Parsing (Questions 1–10)

### 1. What does \`<!DOCTYPE html>\` actually do, and what happens if you omit it?
The \`<!DOCTYPE html>\` declaration is an instruction to the browser's HTML parser indicating that the document conforms to the HTML5 specification. It is **not** an HTML tag; it is a preamble that forces the browser to render the page in **Standards Mode**.

If you omit \`<!DOCTYPE html>\`, browsers fall back to **Quirks Mode** (or Almost Standards Mode) to maintain backward compatibility with 1990s web pages. In Quirks Mode, the CSS box model behaves inconsistently (emulating Internet Explorer 5 where \`width\` included padding and borders) and table cell font inheritance breaks.

### 2. What is the difference between HTML elements, tags, and attributes?
- **Tag:** The literal syntactic markup delimited by angle brackets, such as the opening tag \`<a href="https://www.hangbug.com">\` and closing tag \`</a>\`.
- **Element:** The complete DOM node created in memory, encompassing the opening tag, attributes, child text/elements, and the closing tag.
- **Attribute:** Key-value metadata supplied inside the opening tag (e.g., \`href\`, \`target\`, \`aria-label\`) that configures the element's behavior or semantics.

### 3. What are void (self-closing) elements in HTML5?
Void elements are elements that **cannot have any child nodes** (neither text nor nested elements) and therefore must not have a closing tag. Common void elements include:
\`<area>\`, \`<base>\`, \`<br>\`, \`<col>\`, \`<embed>\`, \`<hr>\`, \`<img>\`, \`<input>\`, \`<link>\`, \`<meta>\`, \`<source>\`, \`<track>\`, and \`<wbr>\`.

\`\`\`html
<!-- Valid HTML5 Void Elements -->
<meta charset="UTF-8">
<img src="/logo.png" alt="HangBug Logo" width="160" height="48">
<input type="email" name="user_email" required>
\`\`\`

### 4. Explain the difference between \`<script>\`, \`<script async>\`, and \`<script defer>\`.
When the HTML parser encounters a standard \`<script src="app.js">\`, it **halts DOM construction**, downloads the script, executes it immediately, and only then resumes parsing HTML.

- **\`async\`:** Downloads the script in parallel while HTML parsing continues. As soon as the download finishes, HTML parsing **pauses** to execute the script. Execution order is **not guaranteed** (whichever script finishes downloading first runs first). Ideal for independent third-party analytics scripts.
- **\`defer\`:** Downloads the script in parallel while HTML parsing continues, but **waits to execute until the HTML document has been completely parsed** (right before the \`DOMContentLoaded\` event fires). Multiple deferred scripts execute in the exact order they appear in the document. Ideal for application bundles.

\`\`\`html
<!-- Blocks HTML parser immediately -->
<script src="/legacy- blocker.js"></script>

<!-- Downloads in parallel, executes in order after HTML is parsed -->
<script defer src="/vendor.js"></script>
<script defer src="/app.js"></script>

<!-- Downloads in parallel, executes as soon as ready (order not guaranteed) -->
<script async src="https://analytics.example.com/pixel.js"></script>
\`\`\`

### 5. What is the difference between Block-level and Inline elements?
- **Block-level elements** (\`<div>\`, \`<p>\`, \`<h1>\`–\`<h6>\`, \`<section>\`, \`<article>\`, \`<ul>\`) always start on a new line, stretch to fill 100% of their parent container's inline width by default, and respect all box-model properties (\`width\`, \`height\`, vertical \`margin\`, and \`padding\`).
- **Inline elements** (\`<span>\`, \`<a>\`, \`<strong>\`, \`<em>\`, \`<code>\`, \`<label>\`) flow within a line of text, only occupy as much width as their content requires, and **ignore \`width\`, \`height\`, \`margin-top\`, and \`margin-bottom\`** unless their \`display\` property is changed.

### 6. What is the difference between \`<strong>\` vs \`<b>\` and \`<em>\` vs \`<i>\`?
- \`<strong>\` conveys **strong semantic importance, urgency, or seriousness**. Screen readers can announce it with vocal emphasis. \`<b>\` is purely stylistic ("bring attention to") without adding semantic importance (e.g., product keywords in a summary).
- \`<em>\` conveys **stressed emphasis** that changes the nuance of a sentence (e.g., *"I *never* said he stole the code"*). \`<i>\` represents text in an alternate voice or mood, such as taxonomic names, technical terms, or foreign phrases.

### 7. What is the purpose of the \`<meta name="viewport">\` tag?
Without a viewport meta tag, mobile browsers render pages inside a virtual desktop layout viewport (typically \`980px\` wide) and shrink the page down, forcing users to pinch-to-zoom.

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
\`\`\`
Setting \`width=device-width\` instructs the browser to match the layout viewport width to the device's CSS pixel width, enabling responsive media queries to work as intended. Never set \`user-scalable=no\` or \`maximum-scale=1\`, as doing so violates WCAG accessibility guidelines by preventing visually impaired users from zooming.

### 8. How do custom data attributes (\`data-*\`) work and how do you read them in JavaScript?
Any attribute prefixed with \`data-\` (such as \`data-quiz-id="42"\` or \`data-user-role="admin"\`) stores private custom metadata directly on an HTML element without violating HTML validation rules. In JavaScript, the \`HTMLElement.dataset\` API automatically converts kebab-case attribute names into camelCase properties:

\`\`\`html
<button id="quizBtn" data-quiz-category="javascript" data-session-level="2">
  Start Quiz
</button>

<script>
  const btn = document.getElementById('quizBtn');
  console.log(btn.dataset.quizCategory); // "javascript"
  console.log(btn.dataset.sessionLevel); // "2"
</script>
\`\`\`

### 9. What are HTML entities and why are they necessary?
HTML entities are escape sequences starting with \`&\` and ending with \`;\` used to display reserved HTML characters (which would otherwise be interpreted as markup tags) or invisible characters like non-breaking spaces.
- \`&lt;\` renders \`<\`
- \`&gt;\` renders \`>\`
- \`&amp;\` renders \`&\`
- \`&quot;\` renders \`"\`
- \`&nbsp;\` renders a non-breaking space that prevents an automatic line break between two words.

### 10. What is the difference between \`lang\` attribute on \`<html>\` and \`charset="UTF-8"\`?
- \`<meta charset="UTF-8">\` declares the character encoding so the browser converts byte streams into valid Unicode characters (must appear within the first 1024 bytes of the document).
- \`<html lang="en">\` declares the natural human language of the document. Screen readers rely on \`lang\` to select the correct pronunciation voice profile, and browsers use it for spell-checking, hyphenation, and translation prompts.

---

## Part 2: Semantic HTML5, Accessibility (WAI-ARIA) & SEO (Questions 11–20)

### 11. What is Semantic HTML and why does it matter for SEO and Accessibility?
Semantic HTML uses tags that describe the **meaning and role** of the content rather than its visual appearance. When a browser parses HTML, it builds both the **DOM Tree** and the **Accessibility Tree** (used by screen readers like NVDA, JAWS, and VoiceOver). Semantic landmarks (\`<header>\`, \`<nav>\`, \`<main>\`, \`<aside>\`, \`<footer>\`) allow assistive technology users to jump directly to the main content or navigation via keyboard shortcuts, and help search engine crawlers distinguish primary article content from boilerplate chrome.

### 12. When should you use \`<article>\` vs \`<section>\` vs \`<div>\`?
- **\`<article>\`:** Use for a **self-contained, independently distributable** piece of content that would still make complete sense if syndicated in an RSS feed on its own (e.g., a blog post, a news story, a forum comment, or an interactive product card).
- **\`<section>\`:** Use for a **thematic grouping of content** inside a document or article, which should almost always have its own heading (\`<h2>\`–\`<h6>\`).
- **\`<div>\`:** Use strictly as a **non-semantic layout or styling wrapper** when no semantic relationship exists.

\`\`\`html
<main>
  <article>
    <h1>Understanding Closures in JavaScript</h1>
    <section aria-labelledby="lexical-scope">
      <h2 id="lexical-scope">1. Lexical Scoping Rules</h2>
      <p>Closures capture variables from their outer lexical environment...</p>
    </section>
  </article>
</main>
\`\`\`

### 13. Can a page have multiple \`<header>\` and \`<footer>\` elements, or multiple \`<main>\` elements?
- **\`<header>\` and \`<footer>\`:** Yes, a page can have multiple \`<header>\` and \`<footer>\` elements. When placed at the top level of \`<body>\`, they act as the site-wide banner and contentinfo landmarks. When nested inside an \`<article>\` or \`<section>\`, they scope metadata (like author bylines or tags) to that specific section.
- **\`<main>\`:** A document must have **at most one visible \`<main>\` element** at any time (unless additional \`<main>\` elements carry the \`hidden\` attribute during SPA view transitions).

### 14. What is the first rule of ARIA (Accessible Rich Internet Applications)?
The **First Rule of ARIA** defined by the W3C is: *"If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so."*

For example, always use a native \`<button>\` instead of \`<div role="button" tabindex="0">\`, because a native \`<button>\` automatically provides keyboard focus, \`Enter\` and \`Space\` key activation, and disabled state handling without custom JavaScript.

### 15. What is the difference between \`aria-label\`, \`aria-labelledby\`, and \`aria-describedby\`?
- **\`aria-label\`:** Provides a direct string label when no visible text label exists on screen (e.g., an icon-only close button: \`<button aria-label="Close modal">\`).
- **\`aria-labelledby\`:** References the \`id\` (or space-separated IDs) of another visible element on the page whose text should serve as this element's accessible name.
- **\`aria-describedby\`:** References the \`id\` of an element that provides supplementary descriptive text (such as password requirements or an error message below an input). Screen readers announce the label first, followed by a brief pause, then the description.

### 16. How does \`tabindex\` work with values \`0\`, \`-1\`, and positive numbers?
- **\`tabindex="0"\`:** Inserts an element into the natural sequential keyboard tab order based on its position in the DOM.
- **\`tabindex="-1"\`:** Removes the element from the sequential \`Tab\` key order, but allows it to receive focus **programmatically** via \`element.focus()\` (commonly used for managing focus inside modals or error summaries).
- **\`tabindex="1+"\` (Positive integers):** Forces the element to the front of the tab order before all \`tabindex="0"\` elements. **Avoid positive \`tabindex\` values**, as they create confusing, unpredictable keyboard navigation paths.

### 17. How do \`<figure>\` and \`<figcaption>\` improve content semantics?
\`<figure>\` encapsulates self-contained media—such as diagrams, code snippets, illustrations, or charts—that are referenced from the main prose. \`<figcaption>\` provides an explicit accessible caption linked to that figure.

### 18. How do native \`<details>\` and \`<summary>\` elements work?
\`<details>\` creates a native disclosure widget (accordion) that toggles between open and closed states without requiring any JavaScript. The child \`<summary>\` element acts as the interactive toggle button. You can listen to the \`toggle\` event or check \`detailsElement.open\` in JavaScript.

### 19. How does the native \`<dialog>\` element differ from a custom \`<div>\` modal?
The HTML5.2+ \`<dialog>\` element provides built-in modal behavior when opened via \`dialog.showModal()\`:
1. It automatically traps keyboard focus inside the dialog and renders the background page \`inert\`.
2. It renders in the browser's **Top Layer**, eliminating \`z-index\` stacking context wars.
3. Pressing the \`Escape\` key automatically closes the modal and fires a \`cancel\` and \`close\` event.
4. It exposes a customizable \`::backdrop\` pseudo-element in CSS.

### 20. What makes an \`<img>\` \`alt\` attribute effective, and when should \`alt=""\` be empty?
- **Informative images:** The \`alt\` text should concisely convey the information or function of the image (e.g., \`alt="Bar chart showing 42% latency reduction after enabling Redis cache"\`).
- **Decorative images:** If an image is purely decorative (e.g., a background flourish or an icon right next to text that already says the same thing), you **must** include an empty \`alt=""\` attribute. Omitting \`alt\` entirely causes screen readers to read the raw image filename aloud!

---

## Part 3: HTML5 Forms, Validation & Input UX (Questions 21–30)

### 21. Why must every form input have an associated \`<label>\`, and what are the two ways to link them?
Linking a \`<label>\` to an \`<input>\` gives screen readers an accessible name for the control and **expands the clickable/tappable hit area** (clicking the label text focuses or toggles the input/checkbox).
1. **Explicit association (Recommended):** Match the label's \`for\` attribute to the input's \`id\`:
   \`<label for="user-email">Email</label><input id="user-email" type="email">\`
2. **Implicit association:** Wrap the input directly inside the label:
   \`<label>Email <input type="email"></label>\`

### 22. What is the difference between \`type="text"\` with \`inputmode="numeric"\` vs \`type="number"\`?
\`<input type="number">\` is meant for quantities (like item counts or age). It adds increment/decrement spinner arrows, allows scientific notation (\`e\`), and strips leading zeros—making it terrible for credit card numbers, OTP codes, or postal codes.
For numeric strings like 6-digit verification codes, use:
\`\`\`html
<input type="text" inputmode="numeric" pattern="[0-9]{6}" autocomplete="one-time-code">
\`\`\`
This triggers the numeric keypad on iOS and Android while preserving leading zeros.

### 23. How does the HTML5 Constraint Validation API work?
HTML5 provides attributes like \`required\`, \`minlength\`, \`maxlength\`, \`min\`, \`max\`, \`step\`, \`type="email"\`, and \`pattern\`. In JavaScript, you can inspect \`input.validity\` (a \`ValidityState\` object with flags like \`valueMissing\`, \`typeMismatch\`, \`patternMismatch\`), call \`form.checkValidity()\`, or set custom error messages via \`input.setCustomValidity("Username is already taken")\`.

### 24. What is the purpose of \`<fieldset>\` and \`<legend>\`?
\`<fieldset>\` groups related form controls (such as a group of radio buttons or a shipping address block), and \`<legend>\` provides the group's caption. When a screen reader user tabs into a radio button inside a \`<fieldset>\`, the screen reader announces both the \`<legend>\` question and the individual radio button's \`<label>\`.

### 25. What is the difference between \`<datalist>\` and \`<select>\`?
- **\`<select>\`:** Restricts the user to choosing **only** from the predefined list of \`<option>\` items.
- **\`<datalist>\`:** Pairs with an \`<input list="browsers">\` to provide **autocomplete suggestions** while still allowing the user to type a free-form custom value not present in the list.

### 26. What is the difference between \`readonly\` and \`disabled\` on form inputs?
| Behavior | \`readonly\` | \`disabled\` |
| :--- | :--- | :--- |
| Can user edit value? | No | No |
| Can element receive keyboard focus (\`Tab\`)? | **Yes** | **No** |
| Submitted in form payload (\`FormData\`)? | **Yes** | **No** |
| Applies to \`<select>\` / \`<button>\`? | No (text inputs only) | Yes |

### 27. What does the \`novalidate\` attribute on a \`<form>\` do?
Adding \`novalidate\` to \`<form novalidate>\` disables the browser's default native validation tooltips on submit, allowing your JavaScript code to run \`form.checkValidity()\` and render custom, accessible inline error messages styled to match your design system.

### 28. When should you use \`<output>\`, \`<progress>\`, and \`<meter>\`?
- **\`<output>\`:** Represents the live result of a calculation or user interaction (implicitly carries \`aria-live\` semantics).
- **\`<progress value="70" max="100">\`:** Indicates the completion progress of a task (such as file upload or quiz completion).
- **\`<meter value="0.85" min="0" max="1" low="0.3" high="0.8" optimum="0.9">\`:** Represents a scalar measurement within a known range (such as disk usage or password strength), **not** task progress.

### 29. What happens when a \`<button>\` inside a \`<form>\` has no \`type\` attribute?
By specification, the default \`type\` of a \`<button>\` inside a \`<form>\` is **\`type="submit"\`**. If you create a button intended to toggle password visibility or open a modal inside a form without explicitly setting \`type="button"\`, clicking it will accidentally submit the form!

### 30. How does \`enctype="multipart/form-data"\` work and when is it required?
By default, forms use \`application/x-www-form-urlencoded\`, which serializes key-value pairs as URL-encoded strings. When a form includes \`<input type="file">\`, you must set \`enctype="multipart/form-data"\` so binary file payloads are transmitted as separate MIME parts separated by boundary strings.

---

## Part 4: Multimedia, Responsive Images & Resource Loading (Questions 31–40)

### 31. How do \`srcset\` and \`sizes\` on \`<img>\` differ from the \`<picture>\` element?
- **\`<img srcset="..." sizes="...">\` (Resolution & Viewport Switching):** Gives the browser a list of different-sized versions of the **same image crop**, letting the browser automatically pick the optimal file based on viewport width and device pixel ratio (DPR).
- **\`<picture>\` (Art Direction & Format Switching):** Gives the developer explicit rules—forcing a different image crop on mobile vs desktop via \`media\` attributes, or serving modern formats (\`image/avif\`, \`image/webp\`) with a JPEG fallback.

\`\`\`html
<picture>
  <source srcset="/hero.avif" type="image/avif">
  <source srcset="/hero.webp" type="image/webp">
  <img src="/hero.jpg" alt="Developer solving coding challenge" width="1200" height="630" fetchpriority="high">
</picture>
\`\`\`

### 32. Why should you always specify \`width\` and \`height\` attributes on \`<img>\` even in responsive layouts?
Modern browsers use the HTML \`width\` and \`height\` attributes to compute the image's **intrinsic aspect ratio** (\`aspect-ratio: attr(width) / attr(height)\`) **before** the image file finishes downloading. When paired with CSS \`img { max-width: 100%; height: auto; }\`, the browser reserves the exact vertical space immediately, preventing **Cumulative Layout Shift (CLS)**.

### 33. How does native lazy loading (\`loading="lazy"\`) work and when should you avoid it?
\`loading="lazy"\` defers downloading off-screen images and iframes until the user scrolls near them. **Never put \`loading="lazy"\` on above-the-fold Hero / LCP images**, as it delays the browser from discovering and fetching the most critical visual element on the page. Instead, use \`fetchpriority="high"\` on your LCP image.

### 34. What is the difference between \`preload\`, \`prefetch\`, \`preconnect\`, and \`dns-prefetch\`?
- **\`rel="preload"\`:** Forces the browser to download a critical resource needed for the **current page** immediately with high priority (e.g., primary web fonts or hero image).
- **\`rel="prefetch"\`:** Low-priority hint to fetch resources the user is likely to need on the **next navigation** during browser idle time.
- **\`rel="preconnect"\`:** Performs DNS lookup, TCP handshake, and TLS negotiation ahead of time for a critical cross-origin domain (e.g., \`https://fonts.gstatic.com\`).
- **\`rel="dns-prefetch"\`:** Only resolves the domain name to an IP address in advance (lightweight fallback for third-party origins).

### 35. What is the difference between \`<canvas>\` and \`<svg>\`?
| Feature | \`<svg>\` (Vector Graphics) | \`<canvas>\` (Bitmap Raster) |
| :--- | :--- | :--- |
| Resolution | Resolution-independent (infinite zoom) | Pixel-dependent (blurry if scaled without DPI scaling) |
| DOM Nodes | Every shape (\`<path>\`, \`<circle>\`) is a DOM node | Single \`<canvas>\` element; pixels are drawn via JS |
| Event Handling | Attach listeners directly to individual shapes | Manual coordinate hit-testing required |
| Best Use Case | Logos, icons, interactive charts (< 1,000 nodes) | 60fps arcade games, particle systems, pixel manipulation |

### 36. Why is \`autoplay\` often blocked on \`<video>\` elements, and how do you enable it reliably?
Modern mobile and desktop browsers block unmuted video autoplay to save bandwidth and prevent jarring user experiences. To autoplay a background or looping product demo video reliably across iOS Safari and Chrome, you must include \`muted\` and \`playsinline\`:
\`\`\`html
<video autoplay muted loop playsinline poster="/preview.jpg">
  <source src="/demo.mp4" type="video/mp4">
</video>
\`\`\`

### 37. What is the purpose of the \`<track>\` element inside \`<video>\` and \`<audio>\`?
\`<track>\` attaches timed text tracks in **WebVTT (\`.vtt\`)** format to media elements. Depending on the \`kind\` attribute (\`captions\`, \`subtitles\`, \`descriptions\`, \`chapters\`), it provides closed captions for deaf/hard-of-hearing users and translated subtitles.

### 38. How does the HTML \`<template>\` tag work?
Content inside a \`<template>\` tag is parsed by the browser into a \`DocumentFragment\` (\`template.content\`), but it is **inert**: it is not rendered on screen, images inside it do not download, and scripts inside it do not run until you clone and append it to the live DOM via \`document.importNode(template.content, true)\`.

### 39. What does \`rel="noopener noreferrer"\` do on \`<a target="_blank">\` links?
Historically, opening an external link with \`target="_blank"\` gave the newly opened page access to \`window.opener\`, allowing a malicious site to redirect your original tab to a phishing page (**reverse tabnabbing**).
- \`noopener\` severs the \`window.opener\` reference (modern browsers now apply \`noopener\` implicitly to \`target="_blank"\`, but explicit declaration remains best practice).
- \`noreferrer\` additionally strips the \`Referer\` HTTP header so the destination site cannot see the exact URL the user clicked from.

### 40. How does the \`download\` attribute on \`<a>\` tags work, and what is its security limitation?
Adding \`<a href="/reports/scorecard.pdf" download="HangBug-Scorecard.pdf">\` instructs the browser to download the linked resource rather than navigating to it. For security reasons, the \`download\` attribute **only works for same-origin URLs** (plus \`blob:\` and \`data:\` URLs).

---

## Part 5: Advanced Browser APIs, Security, Iframes & Performance (Questions 41–50)

### 41. Compare \`localStorage\`, \`sessionStorage\`, and HTTP Cookies.
- **\`localStorage\`:** Stores ~5–10 MB of string data per origin indefinitely (persists across browser restarts). Accessible via JavaScript on the same origin.
- **\`sessionStorage\`:** Stores ~5 MB of string data scoped to a **single browser tab session**. Closing the tab clears \`sessionStorage\`.
- **Cookies:** Small (~4 KB) key-value data sent automatically with every matching HTTP request header. Only cookies with the \`HttpOnly\` flag are immune to XSS JavaScript theft.

### 42. How does the \`sandbox\` attribute secure \`<iframe>\` embeds?
Adding \`sandbox\` with an empty value (\`<iframe src="..." sandbox>\`) applies maximum restrictions: the embedded document is treated as coming from a unique opaque origin, cannot run scripts, cannot submit forms, cannot open popups, and cannot navigate the parent window. You can selectively lift only required permissions, such as \`sandbox="allow-scripts allow-forms"\` (never combine \`allow-scripts\` and \`allow-same-origin\` on untrusted content, or the iframe can remove its own sandbox attribute!).

### 43. What is Subresource Integrity (SRI) on \`<script>\` and \`<link>\` tags?
SRI allows the browser to verify that a file fetched from a third-party CDN has not been tampered with. You provide a cryptographic hash in the \`integrity\` attribute; if the downloaded file's hash does not match, the browser refuses to execute it:
\`\`\`html
<script
  src="https://cdn.example.com/library.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
></script>
\`\`\`

### 44. What is the Shadow DOM and how does it relate to Custom Elements (Web Components)?
Web Components rely on three HTML/DOM specifications: **Custom Elements** (\`customElements.define\`), **HTML Templates** (\`<template>\` and \`<slot>\`), and **Shadow DOM** (\`element.attachShadow({ mode: 'open' })\`). Shadow DOM attaches an encapsulated DOM subtree to an element where CSS styles and IDs do not leak out to the global document, and global styles do not accidentally break the component.

### 45. What is the difference between the \`hidden\` attribute, \`display: none\`, \`visibility: hidden\`, and \`inert\`?
- **\`hidden\` attribute / \`display: none\`:** Removes the element from visual layout AND hides it from screen readers.
- **\`visibility: hidden\`:** Hides the element visually and from screen readers, but **preserves its physical layout space** in the box model.
- **\`inert\` attribute:** Keeps the element visually rendered on screen, but disables all user interactions (clicks, text selection, keyboard focus) and hides it from assistive technologies.

### 46. How does \`contenteditable\` work, and what is \`plaintext-only\`?
Setting \`contenteditable="true"\` turns any HTML element into a rich-text editor. However, pasting content from external websites injects messy inline HTML styles. Modern browsers support \`contenteditable="plaintext-only"\`, which allows editing while automatically stripping rich formatting on paste.

### 47. What is the difference between the \`DOMContentLoaded\` event and the \`load\` event?
- **\`DOMContentLoaded\`:** Fires on \`document\` as soon as the HTML document has been completely parsed and all \`defer\` scripts have executed—**without** waiting for stylesheets, images, or subframes to finish downloading.
- **\`load\`:** Fires on \`window\` only after the entire page, including all dependent stylesheets, images, and iframes, has fully loaded.

### 48. Why are Canonical URLs (\`<link rel="canonical">\`) critical for Technical SEO?
If the same content is reachable via multiple URLs (e.g., \`/blog/html-guide\`, \`/blog/html-guide?utm_source=newsletter\`, or trailing slash variations), search engines may split ranking authority across duplicate URLs. A canonical tag tells Googlebot which single URL is the authoritative master version to index.

### 49. How do Open Graph (\`og:*\`) and JSON-LD (\`application/ld+json\`) tags work in the \`<head>\`?
- **Open Graph (\`<meta property="og:title">\`, \`og:image\`):** Controls how links render as rich preview cards when shared on LinkedIn, X/Twitter, Slack, WhatsApp, and Discord.
- **JSON-LD (\`<script type="application/ld+json">\`):** Provides machine-readable Schema.org structured data (such as \`Article\`, \`FAQPage\`, or \`BreadcrumbList\`) so search engines and AI search engines can extract verified entities, publication dates, and authorship.

### 50. How do you audit and debug HTML semantics and accessibility in Chrome DevTools?
1. Open the **Elements** panel in Chrome DevTools and switch to the **Accessibility** sub-tab to inspect the live Accessibility Tree, computed Accessible Name, ARIA role, and keyboard focusability of any node.
2. Run a **Lighthouse** Accessibility & SEO audit to catch missing form labels, duplicate IDs, skipped heading levels (\`<h1>\` jumping to \`<h4>\`), and missing \`alt\` attributes.
3. Navigate your entire page using only \`Tab\`, \`Shift + Tab\`, \`Enter\`, \`Space\`, and \`Escape\` to verify logical focus order.
`
    },

    {
        id: 'blog_css_50_interview_qa',
        slug: '50-css-interview-questions-and-answers',
        title: '50 CSS Interview Questions and Answers: Flexbox, Grid, Specificity & Modern Layout',
        excerpt: 'Prepare for frontend interviews with 50 in-depth CSS questions and answers. Covers cascade layers, specificity calculation, Flexbox vs Grid, stacking contexts, container queries, and rendering performance.',
        category: 'Frontend Development',
        tags: ['CSS3', 'Flexbox', 'CSS Grid', 'Frontend Interview', 'Responsive Design', 'Web Performance'],
        difficulty: 'All Levels',
        readingTimeMinutes: 19,
        authorName: 'Maya Lin',
        authorRole: 'Staff UI/UX Engineer & Design Systems Lead',
        authorBio: 'Maya leads design systems architecture for large-scale SaaS platforms and teaches modern CSS layout engineering.',
        authorAvatar: 'ML',
        coverGradient: 'gradient-indigo',
        seoTitle: '50 CSS Interview Questions and Answers (Flexbox, Grid & Modern CSS) — HangBug',
        seoDescription: 'Ace your CSS technical interview with 50 comprehensive questions and answers covering Box Model, Specificity, Flexbox, CSS Grid, z-index Stacking Contexts, Container Queries, and :has().',
        seoKeywords: ['50 css interview questions and answers', 'css interview questions', 'flexbox vs grid interview', 'css specificity questions', 'frontend css test'],
        canonicalUrl: 'https://www.hangbug.com/blog/50-css-interview-questions-and-answers',
        relatedQuizCategory: 'CSS',
        relatedGameSlug: 'find-the-bug',
        isPublished: true,
        isFeatured: true,
        viewsCount: 4390,
        order: 2,
        publishedAt: '2026-09-18T10:00:00.000Z',
        updatedAt: '2026-11-02T11:20:00.000Z',
        keyTakeaways: [
            'Calculate CSS specificity accurately using the (Inline, ID, Class/Pseudo-class/Attribute, Element/Pseudo-element) 4-column tuple, plus :is(), :where(), and @layer rules.',
            'Know exactly when to reach for 1D content-driven layout (Flexbox) versus 2D layout-driven grids (CSS Grid with auto-fit, minmax, and subgrid).',
            'Debug elusive z-index bugs by identifying what creates a new Stacking Context (transform, opacity < 1, filter, isolation: isolate).',
            'Achieve 60fps animations by animating only composite-layer properties (transform and opacity) rather than layout-triggering properties (width, top, left).'
        ],
        content: `## Mastering Modern CSS for Technical Interviews

CSS has evolved dramatically over the past few years. Modern interviews test not only classic fundamentals like the Box Model, specificity, and \`z-index\` stacking contexts, but also modern layout primitives like **CSS Grid \`subgrid\`**, **Container Queries**, **\`:has()\`**, **Custom Properties**, and **Cascade Layers (\`@layer\`)**.

Here are **50 essential CSS interview questions and answers** with practical code examples.

---

## Part 1: Box Model, Cascade, Specificity & Inheritance (Questions 1–10)

### 1. Explain the CSS Box Model and the difference between \`content-box\` and \`border-box\`.
Every element in CSS is represented as a rectangular box composed of four concentric layers from inside out: **Content**, **Padding**, **Border**, and **Margin**.
- **\`box-sizing: content-box\` (Default):** Setting \`width: 300px; padding: 20px; border: 2px solid;\` results in a rendered box width of \`300 + 40 + 4 = 344px\`.
- **\`box-sizing: border-box\`:** Setting \`width: 300px\` includes the content, padding, and border inside the \`300px\` total width (the content area shrinks to \`256px\`). This makes responsive grid math predictable:

\`\`\`css
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`

### 2. How is CSS Specificity calculated?
Specificity is scored as a 3-column (or 4-column with inline styles) weight vector \`(ID, Class, Type)\`:
- **\`(1, 0, 0, 0)\`:** Inline \`style="..."\` attribute.
- **\`(0, 1, 0, 0)\`:** ID selectors (e.g., \`#navbar\`).
- **\`(0, 0, 1, 0)\`:** Classes (\`.card\`), attribute selectors (\`[type="email"]\`), and pseudo-classes (\`:hover\`, \`:focus\`, \`:nth-child()\`).
- **\`(0, 0, 0, 1)\`:** Element type selectors (\`div\`, \`h1\`) and pseudo-elements (\`::before\`, \`::after\`).
- **\`(0, 0, 0, 0)\`:** Universal selector (\`*\`), combinators (\`>\`, \`+\`, \`~\`), and \`:where()\`.

Note: One ID \`(1, 0, 0)\` always beats 100 classes \`(0, 100, 0)\`—columns never carry over!

### 3. What is the difference between \`:is()\`, \`:where()\`, and \`:not()\` regarding specificity?
- **\`:where(.card, #hero)\`:** Always has **zero specificity \`(0, 0, 0)\`**, making it ideal for CSS reset libraries and base component defaults that should be easy to override.
- **\`:is(.card, #hero)\` and \`:not(.card, #hero)\`:** Take the specificity of their **most specific argument** (in this case, \`#hero\` -> \`(1, 0, 0)\`).

### 4. What is Margin Collapsing and when does it happen?
When the **vertical** (\`margin-top\` and \`margin-bottom\`) margins of two block-level elements touch, they do not add together; instead, they collapse into a single margin equal to the **larger** of the two margins (or sum if one is negative).
Margin collapsing **never** happens on horizontal margins, nor does it happen inside **Flexbox**, **CSS Grid**, or containers that establish a **Block Formatting Context (BFC)** (such as \`overflow: auto\` or \`display: flow-root\`).

### 5. What is a Block Formatting Context (BFC) and how do you create one?
A BFC is an isolated mini-layout region where internal floats do not leak outside and parent/child vertical margins do not collapse across the boundary. The cleanest modern way to create a BFC without side effects is:
\`\`\`css
.container {
  display: flow-root;
}
\`\`\`

### 6. Which CSS properties are inherited by default and which are not?
- **Inherited by default:** Typography and text-related properties (\`color\`, \`font-family\`, \`font-size\`, \`font-weight\`, \`line-height\`, \`text-align\`, \`visibility\`, \`cursor\`, and CSS Custom Properties \`--*\`).
- **Not inherited:** Box-model and layout properties (\`width\`, \`height\`, \`margin\`, \`padding\`, \`border\`, \`background\`, \`display\`, \`position\`, \`z-index\`). Note: \`<input>\` and \`<button>\` elements do not inherit \`font\` properties from \`body\` unless you set \`font: inherit;\`.

### 7. Explain the difference between \`inherit\`, \`initial\`, \`unset\`, and \`revert\`.
- **\`inherit\`:** Forces a property to take the computed value of its parent element.
- **\`initial\`:** Resets a property to its W3C specification initial value (e.g., \`initial\` on \`display\` is ALWAYS \`inline\`, even on a \`<div>\`!).
- **\`unset\`:** Acts as \`inherit\` if the property is naturally inherited (like \`color\`), or \`initial\` if it is not naturally inherited (like \`border\`).
- **\`revert\`:** Rolls back the property to the browser's default user-agent stylesheet value (so \`display: revert\` on a \`<div>\` restores \`block\`).

### 8. How do CSS Cascade Layers (\`@layer\`) work?
\`@layer\` gives authors explicit control over the cascade **before** selector specificity is evaluated. A rule in a higher-priority layer beats a rule in a lower-priority layer **regardless of selector specificity**:
\`\`\`css
@layer reset, base, components, utilities;

@layer components {
  #main-nav .btn.primary { background: blue; } /* Specificity (1, 2, 0) */
}
@layer utilities {
  .bg-emerald { background: #193D35; } /* Wins because utilities layer comes after components! */
}
\`\`\`

### 9. What is the difference between pseudo-classes (\`:\`) and pseudo-elements (\`::\`)?
- **Pseudo-classes (\`:hover\`, \`:focus-visible\`, \`:nth-child(2n)\`, \`:checked\`):** Select existing DOM elements when they are in a specific state or structural position.
- **Pseudo-elements (\`::before\`, \`::after\`, \`::placeholder\`, \`::selection\`, \`::backdrop\`):** Create virtual sub-elements or target specific parts of an element that are not separate nodes in the DOM tree.

### 10. Why do \`::before\` and \`::after\` require the \`content\` property?
By specification, the initial value of \`content\` is \`normal\`, which computes to \`none\` on \`::before\` and \`::after\`. When \`content: none\`, the browser does not generate the pseudo-element box at all. Even for decorative shapes, you must declare \`content: ""\`.

---

## Part 2: Flexbox & CSS Grid Layout Systems (Questions 11–20)

### 11. What is the core architectural difference between Flexbox and CSS Grid?
- **Flexbox (\`display: flex\`):** A **1-dimensional** layout model (either a row OR a column at a time). It is **content-first**—child items size themselves based on their content and distribute remaining space along the main axis.
- **CSS Grid (\`display: grid\`):** A **2-dimensional** layout model (rows AND columns simultaneously). It is **layout-first**—the parent grid container defines strict tracks, and children are placed into those cells.

### 12. What does \`flex: 1\` actually expand to?
\`flex\` is a shorthand for \`flex-grow\`, \`flex-shrink\`, and \`flex-basis\`.
Writing \`flex: 1\` expands to:
\`\`\`css
flex-grow: 1;
flex-shrink: 1;
flex-basis: 0%;
\`\`\`
By contrast, \`flex: auto\` expands to \`1 1 auto\`, and \`flex: none\` expands to \`0 0 auto\`. Because \`flex: 1\` sets \`flex-basis: 0%\`, sibling items with \`flex: 1\` divide the container into equal widths regardless of their intrinsic text length.

### 13. Why does \`text-overflow: ellipsis\` often fail inside a Flexbox child, and how do you fix it?
By default, flex items have \`min-width: auto\`, which prevents a flex item from shrinking smaller than its longest unbreakable child content. As a result, the flex item expands past its parent instead of truncating text.
**The fix:** Add \`min-width: 0\` (or \`overflow: hidden\`) to the flex child container!

\`\`\`css
.flex-child {
  min-width: 0; /* Allows flex item to shrink below content size */
}
.flex-child p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
\`\`\`

### 14. What is the difference between \`justify-content\`, \`align-items\`, and \`align-content\`?
- **\`justify-content\`:** Aligns and distributes items along the **main axis** (horizontal in \`flex-direction: row\`).
- **\`align-items\`:** Aligns items along the **cross axis** within their current line.
- **\`align-content\`:** Distributes space **between multiple wrapped lines** along the cross axis (has no effect unless \`flex-wrap: wrap\` is active and items wrap onto 2+ lines).

### 15. How do you build a responsive card grid without a single media query using CSS Grid?
Combine \`repeat()\`, \`auto-fit\` (or \`auto-fill\`), and \`minmax()\`:
\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 1.5rem;
}
\`\`\`
Wrapping \`min(100%, 280px)\` inside \`minmax()\` prevents horizontal overflow on narrow screens smaller than \`280px\`.

### 16. What is the difference between \`auto-fill\` and \`auto-fit\` in CSS Grid?
When there are fewer items than can fit across a wide viewport:
- **\`auto-fill\`:** Keeps empty ghost column tracks open, so existing items stay at their minimum track width on the left.
- **\`auto-fit\`:** Collapses any empty tracks to \`0px\`, allowing the existing items with \`1fr\` max size to stretch and fill the entire row width.

### 17. What problem does CSS Grid \`subgrid\` solve?
When cards are placed in a grid, each card's internal title, description, and footer have varying text lengths, causing buttons across adjacent cards in the same row to misalign vertically. Setting \`grid-template-rows: subgrid; grid-row: span 3;\` on the child `.card` allows the card's grandchildren to align directly onto the parent grid's shared row tracks!

### 18. How does the \`fr\` unit differ from percentages (\`%\`) in CSS Grid?
Percentages calculate against the total container width **before** subtracting \`gap\` gutters (so \`50% + 50%\` plus a \`20px\` gap causes overflow!). The \`fr\` (fractional) unit distributes **available free space after** all fixed tracks and \`gap\` gutters have been subtracted.

### 19. How does \`margin: auto\` behave differently inside a Flex or Grid container?
In standard block flow, \`margin: 0 auto\` only centers horizontally. Inside a Flex or Grid container, \`margin: auto\` absorbs available free space in **both axes**—for example, \`margin-left: auto\` pushes a navbar action group all the way to the right, and \`margin-top: auto\` pins a card footer to the bottom of a card.

### 20. What is \`place-items: center\`?
\`place-items\` is the shorthand for \`align-items\` and \`justify-items\`. Setting \`display: grid; place-items: center;\` centers children both vertically and horizontally in two lines of code.

---

## Part 3: Positioning, Stacking Contexts (\`z-index\`) & Overflow (Questions 21–30)

### 21. Compare \`static\`, \`relative\`, \`absolute\`, \`fixed\`, and \`sticky\` positioning.
- **\`static\` (Default):** Follows normal document flow; \`top\`/\`left\`/\`z-index\` have no effect.
- **\`relative\`:** Remains in normal flow (original space is preserved), offset visually relative to itself. Establishes a containing block for \`absolute\` children.
- **\`absolute\`:** Removed from normal flow; positioned relative to its nearest **positioned ancestor** (any ancestor with \`position\` other than \`static\`, or with a \`transform\`/\`filter\`).
- **\`fixed\`:** Removed from normal flow; positioned relative to the viewport (except when an ancestor has \`transform\`, \`perspective\`, or \`filter\`, which captures it!).
- **\`sticky\`:** Hybrid of \`relative\` and \`fixed\`. Scrolls normally until it crosses a specified threshold (e.g., \`top: 0\`), then sticks within its parent scrolling container until the parent scrolls out of view.

### 22. Why does \`position: sticky\` sometimes stop working?
There are three classic culprits why \`position: sticky\` fails:
1. You forgot to specify a threshold offset like \`top: 0\`.
2. Any ancestor element has \`overflow: hidden\`, \`overflow: auto\`, or \`overflow: scroll\` set (which becomes the scroll container and traps the sticky element).
3. The sticky element's height already equals the height of its parent container (e.g., a flex/grid item stretching to \`align-items: stretch\` instead of \`align-self: start\`), leaving it zero room to slide.

### 23. Why is an element with \`z-index: 9999\` appearing behind an element with \`z-index: 2\`?
Because \`z-index\` values are **only compared within the same Stacking Context**. If the \`z-index: 9999\` element is nested inside a parent container whose stacking context sits at \`z-index: 1\`, it can never rise above a sibling container at \`z-index: 2\`.

### 24. Which CSS properties create a new Stacking Context besides \`position\` + \`z-index\`?
Many developers are surprised to learn that a new Stacking Context is created automatically by:
- \`opacity\` less than \`1\` (e.g., \`opacity: 0.99\`)
- \`transform\` other than \`none\`
- \`filter\` or \`backdrop-filter\` other than \`none\`
- \`isolation: isolate\`
- Flex or Grid children with a \`z-index\` value other than \`auto\` (even with \`position: static\`!)
- \`will-change: transform, opacity\`

### 25. What does \`isolation: isolate\` do and when is it useful?
\`isolation: isolate\` creates a brand-new stacking context on an element **without** needing \`position: relative; z-index: 0;\` or a dummy \`transform\`. It guarantees that internal \`z-index\` values (or \`mix-blend-mode\` effects) inside a reusable component never leak out or collide with outside page elements.

### 26. Why does \`position: fixed\` break when a parent has \`transform: translateZ(0)\`?
According to the CSS Transforms specification, any element with a \`transform\`, \`filter\`, or \`perspective\` value other than \`none\` becomes the **containing block for all descendants, including \`position: fixed\` descendants**. Thus, a fixed modal inside a transformed card will only cover the card instead of the viewport. (Use React Portals or the native \`<dialog>\` top layer to avoid this.)

### 27. What is the difference between \`overflow: hidden\` and \`overflow: clip\`?
- **\`overflow: hidden\`:** Clips overflowing content visually, **creates a programmatic scroll container** (JavaScript can still call \`element.scrollTo()\`), and prevents \`position: sticky\` on descendants from referencing the outer viewport.
- **\`overflow: clip\`:** Purely clips overflowing paint at the \`overflow-clip-margin\` boundary **without** creating a scroll container, so \`position: sticky\` inside descendants continues to work against the page viewport!

### 28. What is the \`inset\` property?
\`inset\` is the logical shorthand for \`top\`, \`right\`, \`bottom\`, and \`left\`. Writing \`position: absolute; inset: 0;\` stretches an overlay across all four edges of its containing block.

### 29. How does \`aspect-ratio\` work in CSS?
Setting \`aspect-ratio: 16 / 9;\` automatically computes the omitted dimension (\`height\` if \`width\` is known) to maintain that exact ratio. If content inside overflows the ratio height, the box will still grow to fit the content unless you also set \`min-height: 0\` or \`overflow: hidden\`.

### 30. What are CSS Logical Properties (\`margin-inline\`, \`padding-block\`)?
Physical properties (\`margin-left\`, \`padding-top\`) assume Left-to-Right (LTR) horizontal text. Logical properties adapt automatically to the document's \`dir="rtl"\` (Arabic, Hebrew) and \`writing-mode\`:
- \`margin-inline: auto\` replaces \`margin-left: auto; margin-right: auto;\`
- \`padding-block: 1rem\` replaces \`padding-top: 1rem; padding-bottom: 1rem;\`
- \`inline-size\` replaces \`width\`; \`block-size\` replaces \`height\`.

---

## Part 4: Responsive Design, Units, Fluid Typography & Container Queries (Questions 31–40)

### 31. Compare \`px\`, \`em\`, \`rem\`, \`ch\`, \`vw\`, and \`dvh\`.
- **\`px\`:** Absolute CSS pixel unit (ideal for \`1px\` borders and shadows).
- **\`rem\` (Root EM):** Relative to the root \`<html>\` element's font size (default \`16px\`). Respects the user's browser font-size accessibility settings.
- **\`em\`:** Relative to the current element's font size (for padding/margin) or parent's font size (for \`font-size\`). Useful for button padding that scales proportionally with button text.
- **\`ch\`:** Width of the \`0\` glyph in the current font. Setting \`max-width: 65ch\` on article paragraphs guarantees optimal reading line length (60–75 characters per line).
- **\`dvh\` / \`svh\` / \`lvh\`:** Dynamic, Small, and Large Viewport Height units that account for mobile browser address bars expanding and retracting (solving the classic mobile \`100vh\` cutoff bug).

### 32. How do you implement fluid typography using \`clamp()\`?
\`clamp(MIN, PREFERRED, MAX)\` interpolates smoothly between a minimum and maximum size without media query jumps:
\`\`\`css
h1 {
  /* Minimum 1.875rem (30px), scales fluidly with viewport + rem, max 3rem (48px) */
  font-size: clamp(1.875rem, 1.2rem + 2.5vw, 3rem);
}
\`\`\`
Always combine \`rem\` with \`vw\` in the preferred middle parameter (\`1.2rem + 2.5vw\`) so browser zoom (which scales \`rem\` but not \`vw\`) still enlarges text for accessibility!

### 33. How do CSS Container Queries (\`@container\`) differ from Media Queries (\`@media\`)?
- **\`@media (min-width: 768px)\`:** Queries the global **browser viewport width**.
- **\`@container (min-width: 420px)\`:** Queries the width of a specific **parent container** (\`container-type: inline-size\`). This allows the exact same component to render as a compact vertical card in a narrow sidebar and a horizontal banner in the main column on the same screen.

\`\`\`css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 480px) {
  .card-inner {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
}
\`\`\`

### 34. What is the difference between Mobile-First (\`min-width\`) and Desktop-First (\`max-width\`) media queries?
In **Mobile-First** CSS, base styles outside any media query target the simplest single-column mobile layout, and \`@media (min-width: 640px)\`, \`768px\`, \`1024px\` progressively enhance the layout for larger screens. This results in cleaner CSS because mobile devices don't have to download and override complex desktop grid rules.

### 35. How do user preference media queries (\`prefers-color-scheme\`, \`prefers-reduced-motion\`) work?
They detect OS-level accessibility and theme preferences:
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
\`\`\`

### 36. Why should you use \`@media (hover: hover) and (pointer: fine)\` for hover effects?
On touchscreens, tapping an element often triggers sticky \`:hover\` states that remain stuck until the user taps elsewhere. Scoping hover transforms inside \`@media (hover: hover) and (pointer: fine)\` ensures hover animations only apply on devices with a real mouse/trackpad cursor.

### 37. How does \`object-fit: cover\` vs \`object-fit: contain\` work on \`<img>\` and \`<video>\`?
- **\`object-fit: cover\`:** Fills the entire target width and height while preserving aspect ratio, cropping excess edges rather than stretching or squishing the image.
- **\`object-fit: contain\`:** Letterboxes the entire image inside the box without cropping any pixels.

### 38. What is the difference between \`:focus\` and \`:focus-visible\`?
- **\`:focus\`:** Matches whenever an element receives focus, whether by mouse click or keyboard \`Tab\`.
- **\`:focus-visible\`:** Matches only when the browser determines the user is navigating via keyboard (or on inputs that accept text), letting you display high-contrast focus rings for keyboard users without showing outlines on mouse button clicks.

### 39. How do you style a screen-reader-only (\`.sr-only\`) utility class?
You cannot use \`display: none\` or \`visibility: hidden\` because screen readers ignore them. Instead, visually clip the element to a 1x1 pixel box:
\`\`\`css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
\`\`\`

### 40. How do \`calc()\`, \`min()\`, and \`max()\` work together for container sizing?
Instead of writing both \`width: 92%\` and \`max-width: 1200px\`, you can write a single declaration:
\`\`\`css
.wrapper {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
}
\`\`\`

---

## Part 5: Custom Properties, \`:has()\`, Animations & Browser Rendering Pipeline (Questions 41–50)

### 41. How do CSS Custom Properties (\`--variables\`) differ from Sass/SCSS variables (\`$variables\`)?
- **Sass variables (\`$primary\`):** Compiled away at build time into static values. Cannot be changed at runtime in the browser or scoped dynamically to DOM subtrees.
- **CSS Custom Properties (\`--primary\`):** Live in the browser DOM, inherit down the cascade ( enabling instant Light/Dark mode switching by toggling a `.dark` class on \`<html>\`), and can be read or updated dynamically via JavaScript (\`element.style.setProperty('--x', '40px')\`).

### 42. Why is the \`:has()\` relational pseudo-class called the "Parent Selector"?
Historically, CSS could only select downward (children) or forward (next siblings). \`:has()\` allows you to style a parent element (or preceding sibling) based on what exists inside or after it:
\`\`\`css
/* Highlight form group border when its child input is focused or invalid */
.input-group:has(input:focus-visible) {
  border-color: #193D35;
}
.input-group:has(input:user-invalid) {
  border-color: #EF4444;
}
\`\`\`

### 43. What is the difference between \`:invalid\` and \`:user-invalid\`?
\`:invalid\` matches a \`required\` empty input **immediately when the page loads**, turning the form red before the user has even touched a key! \`:user-invalid\` waits until after the user has actually interacted with the field (typed and blurred, or attempted to submit), providing a much better UX without JavaScript state tracking.

### 44. Explain the Browser Rendering Pipeline (Layout, Paint, Composite) and how it affects CSS animations.
When CSS changes on screen, the browser runs up to three stages:
1. **Layout (Reflow):** Calculates geometry (widths, heights, positions). Triggered by changing \`width\`, \`height\`, \`top\`, \`left\`, \`margin\`, \`padding\`, \`font-size\`. Expensive!
2. **Paint (Repaint):** Fills in pixels (colors, shadows, borders). Triggered by \`background-color\`, \`color\`, \`box-shadow\`.
3. **Composite:** GPU stitches painted layers together.

To guarantee silky **60fps / 120fps animations**, only animate **\`transform\`** (\`translate\`, \`scale\`, \`rotate\`) and **\`opacity\`**, which skip Layout and Paint entirely and run on the GPU Compositor thread!

### 45. What is the difference between CSS \`transition\` and \`@keyframes animation\`?
- **\`transition\`:** Requires a state change trigger (such as \`:hover\` or adding a class) to interpolate from state A to state B. Only has a start and end state.
- **\`@keyframes\`:** Can run automatically on load without a trigger, loop infinitely (\`animation-iteration-count: infinite\`), pause/resume (\`animation-play-state\`), and define multi-step intermediate waypoints (\`0%\`, \`35%\`, \`70%\`, \`100%\`).

### 46. How and when should you use \`will-change\`?
\`will-change: transform\` hints to the browser to promote an element to its own GPU composite layer ahead of time. However, overusing \`will-change\` on dozens of elements wastes massive amounts of GPU VRAM and can crash mobile browsers. Use it sparingly only when profiling reveals paint jank.

### 47. What does \`content-visibility: auto\` do for page rendering performance?
Setting \`content-visibility: auto; contain-intrinsic-size: auto 500px;\` on off-screen article sections or long lists tells the browser to **skip Layout and Paint work** for those sections until the user scrolls near them, often cutting initial rendering time on long pages by 50%+.

### 48. What is the difference between \`currentColor\` and \`transparent\`?
\`currentColor\` resolves to the computed value of the element's \`color\` property. Setting \`fill: currentColor\` or \`border-color: currentColor\` on an SVG icon inside a button makes the icon automatically match the button's text color across hover and dark-mode states.

### 49. How does \`pointer-events: none\` work, and does it block keyboard focus?
\`pointer-events: none\` makes an element ignore mouse clicks and touch events (clicks pass right through to the element underneath). **Crucial interview trap:** \`pointer-events: none\` does **not** prevent a user from reaching a button or link via the keyboard \`Tab\` key! To fully disable a button or link, use the \`disabled\` or \`inert\` attribute.

### 50. What is CSS Nesting and how is it supported natively today?
All modern evergreen browsers now support native CSS nesting without Sass/PostCSS:
\`\`\`css
.blog-card {
  padding: 1.5rem;
  border: 1px solid var(--card-border);

  &:hover {
    border-color: #193D35;
  }

  & .blog-title {
    font-weight: 700;
  }
}
\`\`\`
`
    },

    {
        id: 'blog_js_mcqs_beginners',
        slug: 'javascript-mcqs-for-beginners',
        title: 'JavaScript MCQs for Beginners: 30 Essential Questions with Code Output Explanations',
        excerpt: 'Test and sharpen your JavaScript fundamentals with 30 carefully explained Multiple-Choice Questions (MCQs) covering let vs var, type coercion, closures, arrays, objects, promises, and event loop execution.',
        category: 'Interview Prep',
        tags: ['JavaScript', 'MCQs', 'Output Prediction', 'Beginner Friendly', 'ES6+', 'Quiz Prep'],
        difficulty: 'Beginner',
        readingTimeMinutes: 16,
        authorName: 'Rohan Kulkarni',
        authorRole: 'Senior Full-Stack JavaScript Engineer',
        authorBio: 'Rohan has mentored over 2,000 junior developers in JavaScript, TypeScript, and Node.js and designs HangBug’s Output Predictor challenges.',
        authorAvatar: 'RK',
        coverGradient: 'gradient-emerald',
        seoTitle: 'JavaScript MCQs for Beginners (30 Questions & Output Explanations) — HangBug',
        seoDescription: 'Practice 30 essential JavaScript MCQs for beginners with detailed code snippets, answers, and step-by-step execution traces covering hoisting, closures, arrays, and async/await.',
        seoKeywords: ['javascript mcqs for beginners', 'javascript multiple choice questions with answers', 'js output prediction questions', 'javascript quiz questions'],
        canonicalUrl: 'https://www.hangbug.com/blog/javascript-mcqs-for-beginners',
        relatedQuizCategory: 'JavaScript',
        relatedGameSlug: 'output-predictor',
        isPublished: true,
        isFeatured: true,
        viewsCount: 5640,
        order: 3,
        publishedAt: '2026-09-21T08:00:00.000Z',
        updatedAt: '2026-11-03T16:10:00.000Z',
        keyTakeaways: [
            'Trace JavaScript execution step-by-step: understand Temporal Dead Zone (TDZ) for let/const versus function-scoped hoisting for var.',
            'Master IEEE-754 number quirks, typeof operator edge cases (typeof null === "object", typeof NaN === "number"), and strict equality (===).',
            'Differentiate mutating array methods (push, splice, sort, reverse) from non-mutating methods (map, filter, slice, toSorted).',
            'Understand how the JavaScript Event Loop prioritizes synchronous code, then Microtasks (Promises), and finally Macrotasks (setTimeout).'
        ],
        content: `## How to Practice JavaScript Multiple-Choice Questions Effectively

The fastest way to master JavaScript is **mental execution tracing**: reading a short snippet of code, predicting the exact console output before running it, and understanding *why* the JavaScript engine behaves that way.

Work through the **30 JavaScript MCQs** below. Try to predict the answer before reading the explanation, then jump into HangBug's interactive **Output Predictor** game to test your speed!

---

## Section 1: Variables, Scoping & Hoisting (MCQs 1–6)

### MCQ 1: What is logged to the console?
\`\`\`javascript
console.log(score);
var score = 100;
\`\`\`
- **A)** \`100\`
- **B)** \`undefined\`
- **C)** \`ReferenceError: Cannot access 'score' before initialization\`
- **D)** \`null\`

**Correct Answer: B (\`undefined\`)**
**Explanation:** Variables declared with \`var\` have their declaration hoisted to the top of their enclosing function or global scope and initialized with \`undefined\`. The assignment \`score = 100\` remains in place, so logging \`score\` before line 2 outputs \`undefined\`.

---

### MCQ 2: What happens when using \`let\` before declaration?
\`\`\`javascript
console.log(username);
let username = "HangBug";
\`\`\`
- **A)** \`undefined\`
- **B)** \`"HangBug"\`
- **C)** \`ReferenceError\`
- **D)** \`SyntaxError\`

**Correct Answer: C (\`ReferenceError\`)**
**Explanation:** While \`let\` and \`const\` declarations are known to the engine during scope creation, they remain in the **Temporal Dead Zone (TDZ)** from the start of the block until the declaration line is evaluated. Accessing them in the TDZ throws a \`ReferenceError\`.

---

### MCQ 3: Block Scope with \`var\` vs \`let\`
\`\`\`javascript
if (true) {
  var a = 10;
  let b = 20;
}
console.log(typeof a, typeof b);
\`\`\`
- **A)** \`"number" "number"\`
- **B)** \`"undefined" "undefined"\`
- **C)** \`"number" "undefined"\`
- **D)** \`ReferenceError\`

**Correct Answer: C (\`"number" "undefined"\`)**
**Explanation:** \`var a\` ignores \`if\` block boundaries and attaches to the surrounding function/global scope, so \`typeof a\` is \`"number"\`. \`let b\` is strictly block-scoped to the \`if\` block and does not exist outside it; however, the \`typeof\` operator safely returns \`"undefined"\` for undeclared identifiers outside their scope.

---

### MCQ 4: Mutating a \`const\` Object
\`\`\`javascript
const user = { name: "Sara", points: 50 };
user.points = 80;
console.log(user.points);
\`\`\`
- **A)** \`50\`
- **B)** \`80\`
- **C)** \`TypeError: Assignment to constant variable\`
- **D)** \`undefined\`

**Correct Answer: B (\`80\`)**
**Explanation:** \`const\` prevents **reassigning the variable binding** (\`user = {}\` would throw a \`TypeError\`), but it does **not** make the object itself immutable! Modifying properties of the object referenced by \`user\` is completely valid. (To freeze properties, use \`Object.freeze(user)\`).

---

### MCQ 5: Loop Closures with \`let\`
\`\`\`javascript
const funcs = [];
for (let i = 0; i < 3; i++) {
  funcs.push(() => i);
}
console.log(funcs[0](), funcs[1](), funcs[2]());
\`\`\`
- **A)** \`3 3 3\`
- **B)** \`0 1 2\`
- **C)** \`2 2 2\`
- **D)** \`undefined undefined undefined\`

**Correct Answer: B (\`0 1 2\`)**
**Explanation:** Using \`let\` in a \`for\` loop header creates a **fresh lexical binding for \`i\` on every iteration**. Each arrow function closes over its own iteration's \`i\`, returning \`0\`, \`1\`, and \`2\`. (Had \`var i\` been used, all three would print \`3\`).

---

### MCQ 6: Function Hoisting vs Function Expression
\`\`\`javascript
console.log(add(2, 3));
function add(x, y) {
  return x + y;
}
\`\`\`
- **A)** \`5\`
- **B)** \`ReferenceError\`
- **C)** \`TypeError: add is not a function\`
- **D)** \`undefined\`

**Correct Answer: A (\`5\`)**
**Explanation:** Standard **function declarations** (\`function add() {}\`) are hoisted completely—both their name and their function body—so they can be called before their definition line in the file.

---

## Section 2: Data Types, Coercion & Operators (MCQs 7–14)

### MCQ 7: Classic \`typeof\` Quirks
\`\`\`javascript
console.log(typeof null, typeof NaN, typeof []);
\`\`\`
- **A)** \`"null" "NaN" "array"\`
- **B)** \`"object" "number" "object"\`
- **C)** \`"object" "NaN" "array"\`
- **D)** \`"null" "number" "object"\`

**Correct Answer: B (\`"object" "number" "object"\`)**
**Explanation:**
1. \`typeof null === "object"\` is a famous bug from the very first 1995 implementation of JavaScript that was kept for web compatibility.
2. \`NaN\` ("Not-a-Number") is a special numeric value in the IEEE-754 floating-point specification, so \`typeof NaN === "number"\`.
3. Arrays are exotic objects in JavaScript; use \`Array.isArray([])\` to check for arrays specifically.

---

### MCQ 8: String & Numeric Operator Coercion
\`\`\`javascript
console.log("10" + 5 - 3);
\`\`\`
- **A)** \`12\`
- **B)** \`102\`
- **C)** \`"102"\`
- **D)** \`NaN\`

**Correct Answer: B (\`102\`, as a number)**
**Explanation:** Expressions evaluate left-to-right:
1. \`"10" + 5\`: Since one operand of \`+\` is a string, \`5\` is coerced to \`"5"\` and concatenated into \`"105"\`.
2. \`"105" - 3\`: The \`-\` operator **only** performs numeric subtraction, so \`"105"\` is converted to the number \`105\`, and \`105 - 3\` yields the number \`102\`.

---

### MCQ 9: Loose vs Strict Equality
\`\`\`javascript
console.log(0 == false, 0 === false, "" == false);
\`\`\`
- **A)** \`true false true\`
- **B)** \`true true true\`
- **C)** \`false false false\`
- **D)** \`true false false\`

**Correct Answer: A (\`true false true\`)**
**Explanation:** Loose equality (\`==\`) converts \`false\` to the number \`0\`, and converts \`""\` to \`0\`, so \`0 == false\` and \`"" == false\` are both \`true\`. Strict equality (\`===\`) checks both type and value without coercion, so \`0 === false\` is \`false\`. Always prefer \`===\` in production code!

---

### MCQ 10: Nullish Coalescing (\`??\`) vs Logical OR (\`||\`)
\`\`\`javascript
const count = 0;
console.log(count || 42, count ?? 42);
\`\`\`
- **A)** \`0 0\`
- **B)** \`42 42\`
- **C)** \`42 0\`
- **D)** \`0 42\`

**Correct Answer: C (\`42 0\`)**
**Explanation:**
- The logical OR operator (\`||\`) falls back whenever the left operand is **any falsy value** (\`0\`, \`""\`, \`false\`, \`NaN\`, \`null\`, \`undefined\`). Because \`0\` is falsy, \`0 || 42\` evaluates to \`42\`.
- The nullish coalescing operator (\`??\`) **only** falls back when the left operand is \`null\` or \`undefined\`. Since \`0\` is a valid number, \`0 ?? 42\` preserves \`0\`!

---

### MCQ 11: Short-Circuit Return Value of \`&&\` and \`||\`
\`\`\`javascript
console.log("React" && "Node", "" || "Fallback");
\`\`\`
- **A)** \`true true\`
- **B)** \`"Node" "Fallback"\`
- **C)** \`"React" "Fallback"\`
- **D)** \`"Node" ""\`

**Correct Answer: B (\`"Node" "Fallback"\`)**
**Explanation:** \`&&\` and \`||\` do not return booleans—they return the **actual value of the operand** that stopped evaluation!
- \`"React" && "Node"\`: Since \`"React"\` is truthy, \`&&\` evaluates and returns the right operand \`"Node"\`.
- \`"" || "Fallback"\`: Since \`""\` is falsy, \`||\` evaluates and returns \`"Fallback"\`.

---

### MCQ 12: Checking for \`NaN\` Properly
\`\`\`javascript
console.log(NaN === NaN, Number.isNaN(NaN), Number.isNaN("hello"));
\`\`\`
- **A)** \`true true true\`
- **B)** \`false true false\`
- **C)** \`false true true\`
- **D)** \`true false false\`

**Correct Answer: B (\`false true false\`)**
**Explanation:** \`NaN\` is the only value in JavaScript not equal to itself (\`NaN === NaN\` is \`false\`). \`Number.isNaN(x)\` returns \`true\` **only** if \`x\` is of type \`number\` and its value is \`NaN\` (unlike the legacy global \`isNaN("hello")\`, which coerced strings first).

---

### MCQ 13: Optional Chaining (\`?.\`)
\`\`\`javascript
const profile = { user: null };
console.log(profile.user?.address?.city);
\`\`\`
- **A)** \`null\`
- **B)** \`undefined\`
- **C)** \`TypeError: Cannot read properties of null\`
- **D)** \`""\`

**Correct Answer: B (\`undefined\`)**
**Explanation:** When optional chaining (\`?.\`) encounters \`null\` or \`undefined\` on the left side, it immediately short-circuits the entire expression and returns \`undefined\` instead of throwing a \`TypeError\`.

---

### MCQ 14: Reference Equality of Objects and Arrays
\`\`\`javascript
console.log([1, 2] === [1, 2], {} === {});
\`\`\`
- **A)** \`true true\`
- **B)** \`false false\`
- **C)** \`true false\`
- **D)** \`SyntaxError\`

**Correct Answer: B (\`false false\`)**
**Explanation:** Objects and arrays are compared by **memory reference**, not by structural content. Each array or object literal creates a distinct instance at a new memory address.

---

## Section 3: Arrays, Objects & Functions (MCQs 15–24)

### MCQ 15: Default \`Array.prototype.sort()\` Behavior
\`\`\`javascript
const nums = [10, 2, 30, 5];
nums.sort();
console.log(nums);
\`\`\`
- **A)** \`[2, 5, 10, 30]\`
- **B)** \`[10, 2, 30, 5]\`
- **C)** \`[10, 2, 30, 5]\` sorted as strings -> \`[10, 2, 30, 5]\`
- **D)** \`[10, 2, 30, 5]\` -> \`[10, 2, 30, 5]\`? Wait: \`"10", "2", "30", "5"\` -> \`[10, 2, 30, 5]\`

Let's trace UTF-16 code units of \`"10"\`, \`"2"\`, \`"30"\`, \`"5"\`:
\`"10"\` starts with \`"1"\`, \`"2"\` starts with \`"2"\`, \`"30"\` starts with \`"3"\`, \`"5"\` starts with \`"5"\`!
So \`[10, 2, 30, 5].sort()\` produces **\`[10, 2, 30, 5]\`** instead of \`[2, 5, 10, 30]\`!
**Correct Answer:** \`[10, 2, 30, 5]\` (Lexicographical string sort!)
**Explanation:** Without a comparator function, \`.sort()\` converts every element to a string and compares UTF-16 code units (\`"10"\` comes before \`"2"\`). For numeric sorting, always pass a comparator: \`nums.sort((a, b) => a - b)\`.

---

### MCQ 16: \`map()\` vs \`filter()\` Return Values
\`\`\`javascript
const res = [1, 2, 3, 4].map(n => n % 2 === 0);
console.log(res);
\`\`\`
- **A)** \`[2, 4]\`
- **B)** \`[false, true, false, true]\`
- **C)** \`[1, 3]\`
- **D)** \`true\`

**Correct Answer: B (\`[false, true, false, true]\`)**
**Explanation:** \`.map()\` transforms every element into whatever the callback returns, always returning an array of the **exact same length**. Since \`n % 2 === 0\` evaluates to a boolean, \`map\` returns an array of booleans. To select matching items, use \`.filter()\`.

---

### MCQ 17: \`Array.prototype.reduce()\` with Initial Value
\`\`\`javascript
const total = [10, 20, 30].reduce((acc, curr) => acc + curr, 5);
console.log(total);
\`\`\`
- **A)** \`60\`
- **B)** \`65\`
- **C)** \`"5102030"\`
- **D)** \`35\`

**Correct Answer: B (\`65\`)**
**Explanation:** The second argument to \`reduce\` (\`5\`) sets the initial value of the accumulator \`acc\`. Thus \`5 + 10 + 20 + 30 = 65\`.

---

### MCQ 18: Object Key Overwriting & Spread Order
\`\`\`javascript
const defaults = { theme: "light", sound: true };
const custom = { theme: "dark" };
const settings = { ...defaults, ...custom, sound: false };
console.log(settings);
\`\`\`
- **A)** \`{ theme: "light", sound: true }\`
- **B)** \`{ theme: "dark", sound: true }\`
- **C)** \`{ theme: "dark", sound: false }\`
- **D)** \`{ theme: "light", sound: false }\`

**Correct Answer: C (\`{ theme: "dark", sound: false }\`)**
**Explanation:** In object literals with spread properties, properties defined **later** overwrite earlier properties with the same key.

---

### MCQ 19: Arrow Function Implicit Object Return
\`\`\`javascript
const makeUser = (name) => { name: name };
console.log(makeUser("Ali"));
\`\`\`
- **A)** \`{ name: "Ali" }\`
- **B)** \`undefined\`
- **C)** \`"Ali"\`
- **D)** \`ReferenceError\`

**Correct Answer: B (\`undefined\`)**
**Explanation:** In an arrow function, curly braces \`{ ... }\` immediately after \`=>\` are parsed as a **function statement block**, not an object literal! Inside that block, \`name: name\` is parsed as a labeled statement with no \`return\`, returning \`undefined\`. To implicitly return an object literal, wrap it in parentheses: \`const makeUser = (name) => ({ name });\`.

---

### MCQ 20: Default Parameters Evaluation
\`\`\`javascript
function greet(name = "Guest") {
  return \`Hello, \${name}!\`;
}
console.log(greet(undefined), greet(null));
\`\`\`
- **A)** \`"Hello, Guest!" "Hello, Guest!"\`
- **B)** \`"Hello, Guest!" "Hello, null!"\`
- **C)** \`"Hello, undefined!" "Hello, null!"\`
- **D)** \`"Hello, Guest!" ""\`

**Correct Answer: B (\`"Hello, Guest!" "Hello, null!"\`)**
**Explanation:** Default function parameters are triggered **only** when the argument is omitted or explicitly \`undefined\`. Passing \`null\` counts as a defined value, so \`name\` becomes \`null\`.

---

### MCQ 21: Array Destructuring with Rest Elements
\`\`\`javascript
const [first, , third, ...rest] = [10, 20, 30, 40, 50];
console.log(third, rest);
\`\`\`
- **A)** \`20 [30, 40, 50]\`
- **B)** \`30 [40, 50]\`
- **C)** \`30 40\`
- **D)** \`20 [40, 50]\`

**Correct Answer: B (\`30 [40, 50]\`)**
**Explanation:** The empty comma \`, ,\` skips the second element (\`20\`). \`third\` binds to \`30\`, and \`...rest\` collects all remaining elements into a new array \`[40, 50]\`.

---

### MCQ 22: \`slice()\` vs \`splice()\`
\`\`\`javascript
const items = ["a", "b", "c", "d"];
const sub = items.slice(1, 3);
console.log(sub, items.length);
\`\`\`
- **A)** \`["b", "c"] 4\`
- **B)** \`["b", "c", "d"] 4\`
- **C)** \`["b", "c"] 2\`
- **D)** \`["a", "b"] 2\`

**Correct Answer: A (\`["b", "c"] 4\`)**
**Explanation:** \`slice(start, end)\` extracts elements from index \`1\` up to (**but not including**) index \`3\`, and **does not mutate** the original \`items\` array, so \`items.length\` remains \`4\`.

---

### MCQ 23: Lexical \`this\` in Arrow Functions
\`\`\`javascript
const timer = {
  seconds: 10,
  getSeconds: function () {
    return this.seconds;
  },
  getArrow: () => this.seconds
};
console.log(timer.getSeconds(), timer.getArrow());
\`\`\`
- **A)** \`10 10\`
- **B)** \`10 undefined\`
- **C)** \`undefined 10\`
- **D)** \`undefined undefined\`

**Correct Answer: B (\`10 undefined\`)**
**Explanation:** Regular methods bind \`this\` to the object before the dot (\`timer\`). Arrow functions do **not** have their own \`this\`; they inherit \`this\` from the outer lexical scope (module/window), where \`.seconds\` is \`undefined\`.

---

### MCQ 24: \`Set\` Deduplication
\`\`\`javascript
const unique = [...new Set([1, 2, 2, 3, 1, 4])];
console.log(unique.length);
\`\`\`
- **A)** \`6\`
- **B)** \`4\`
- **C)** \`3\`
- **D)** \`1\`

**Correct Answer: B (\`4\`)**
**Explanation:** A \`Set\` stores only unique values (\`1, 2, 3, 4\`). Spreading it back into an array \`[...new Set(...)]\` produces a deduplicated 4-element array.

---

## Section 4: Promises, Async/Await & Event Loop (MCQs 25–30)

### MCQ 25: Event Loop Execution Order (Sync vs Microtask vs Macrotask)
\`\`\`javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
\`\`\`
- **A)** \`1 2 3 4\`
- **B)** \`1 4 2 3\`
- **C)** \`1 4 3 2\`
- **D)** \`1 3 4 2\`

**Correct Answer: C (\`1 4 3 2\`)**
**Explanation:**
1. Synchronous code runs first on the Call Stack: logs \`"1"\`, schedules \`setTimeout\` (Macrotask queue), schedules \`Promise.then\` (Microtask queue), and logs \`"4"\`.
2. When the Call Stack empties, the Event Loop drains the entire **Microtask Queue** first: logs \`"3"\`.
3. Finally, it picks the next task from the **Macrotask Queue**: logs \`"2"\`.

---

### MCQ 26: Return Value of an \`async\` Function
\`\`\`javascript
async function getScore() {
  return 95;
}
console.log(getScore());
\`\`\`
- **A)** \`95\`
- **B)** \`Promise { <fulfilled>: 95 }\`
- **C)** \`undefined\`
- **D)** \`Function\`

**Correct Answer: B (\`Promise { <fulfilled>: 95 }\`)**
**Explanation:** Every \`async\` function **always returns a Promise**. Returning a non-promise value automatically wraps it in \`Promise.resolve(95)\`. To extract \`95\`, use \`await getScore()\` or \`getScore().then(console.log)\`.

---

### MCQ 27: \`Promise.all\` Fail-Fast Behavior
\`\`\`javascript
Promise.all([
  Promise.resolve("A"),
  Promise.reject("Error B"),
  Promise.resolve("C")
])
  .then(res => console.log("Success:", res))
  .catch(err => console.log("Caught:", err));
\`\`\`
- **A)** \`Success: ["A", "Error B", "C"]\`
- **B)** \`Caught: Error B\`
- **C)** \`Success: ["A", "C"]\`
- **D)** \`Uncaught Error\`

**Correct Answer: B (\`Caught: Error B\`)**
**Explanation:** \`Promise.all\` is **fail-fast**: if any single promise rejects, the entire \`Promise.all\` immediately rejects with that error. (If you want all results regardless of individual failures, use \`Promise.allSettled()\`).

---

### MCQ 28: Promise Chaining Return Values
\`\`\`javascript
Promise.resolve(2)
  .then(n => n * 3)
  .then(n => n + 4)
  .then(n => console.log(n));
\`\`\`
- **A)** \`2\`
- **B)** \`6\`
- **C)** \`10\`
- **D)** \`undefined\`

**Correct Answer: C (\`10\`)**
**Explanation:** Each \`.then()\` handler passes its return value to the next \`.then()\` in the chain: \`2 * 3 = 6\`, then \`6 + 4 = 10\`.

---

### MCQ 29: \`try...catch...finally\` Execution
\`\`\`javascript
function test() {
  try {
    return "from try";
  } finally {
    console.log("finally ran");
  }
}
console.log(test());
\`\`\`
- **A)** \`"from try"\` (and \`"finally ran"\` is skipped)
- **B)** \`"finally ran"\` then \`"from try"\`
- **C)** \`"from try"\` then \`"finally ran"\`
- **D)** \`undefined\`

**Correct Answer: B (\`"finally ran"\` then \`"from try"\`)**
**Explanation:** The \`finally\` block **always executes before** the function actually hands control back to the caller, even when a \`return\` statement is reached inside \`try\`.

---

### MCQ 30: \`JSON.stringify()\` Omitted Properties
\`\`\`javascript
const data = {
  id: 1,
  fn: () => {},
  empty: undefined,
  valid: null
};
console.log(JSON.stringify(data));
\`\`\`
- **A)** \`'{"id":1,"fn":null,"empty":null,"valid":null}'\`
- **B)** \`'{"id":1,"valid":null}'\`
- **C)** \`'{"id":1,"empty":undefined,"valid":null}'\`
- **D)** \`TypeError\`

**Correct Answer: B (\`'{"id":1,"valid":null}'\`)**
**Explanation:** Functions, \`undefined\`, and \`Symbol\` values are not valid JSON types. When \`JSON.stringify()\` serializes an object, it silently omits properties whose values are functions, \`undefined\`, or symbols, while keeping \`null\`.
`
    }
];

module.exports = frontendArticles;
