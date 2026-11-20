const { sanitizeExtractedContent } = require('./bookExtractorService');

const ROMAN_VALUES = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };

function parseSessionNumberToken(rawToken) {
    const token = String(rawToken || '').trim();
    if (!token) return null;
    if (/^\d+$/.test(token)) {
        const n = parseInt(token, 10);
        return n >= 1 && n <= 200 ? n : null;
    }
    const lower = token.toLowerCase();
    if (!/^[ivxlcdm]+$/.test(lower)) return null;
    let total = 0;
    let prev = 0;
    for (let i = lower.length - 1; i >= 0; i--) {
        const val = ROMAN_VALUES[lower[i]] || 0;
        if (val < prev) total -= val;
        else {
            total += val;
            prev = val;
        }
    }
    return total >= 1 && total <= 100 ? total : null;
}

function isBoilerplateLine(line) {
    const clean = String(line || '').trim();
    if (!clean) return true;
    if (/^©/.test(clean) || /^copyright\b/i.test(clean)) return true;
    if (/^aptech\s+limited$/i.test(clean)) return true;
    if (/^\d{1,4}$/.test(clean)) return true;
    if (/^https?:\/\//i.test(clean)) return true;
    if (/^(the|this)\s+(session|chapter|unit|module|lesson)\s+(explains|describes|covers|introduces|discusses|outlines|defines|presents)\b/i.test(clean)) {
        return true;
    }
    if (/^the\s+session\s+explains\s*[.…]+$/i.test(clean)) return true;
    if (/^(learning\s+objectives|in\s+this\s+(session|chapter|unit)|table\s+of\s+contents|contents|sessions|chapters|units)$/i.test(clean)) {
        return true;
    }
    return false;
}

function isSummaryOrBoxProse(line) {
    const clean = String(line || '').trim();
    if (!clean) return false;
    if (/^(the|this|in\s+this)\s+(session|chapter|unit|module|lesson)\s+(explains|describes|covers|introduces|discusses|outlines|defines|presents|focuses|students)/i.test(clean)) {
        return true;
    }
    if (/^(learning\s+objectives|overview|introduction|\d+\.\d+\s+)/i.test(clean)) {
        return true;
    }
    if (clean.length > 90 && /[.!?]$/.test(clean)) return true;
    return false;
}

function cleanTitleText(raw) {
    return String(raw || '')
        .replace(/\.{2,}\s*\d*\s*$/, '')
        .replace(/\s+\d{1,4}$/, '')
        .replace(/\s+/g, ' ')
        .replace(/^[:.\-–—\s]+|[:.\-–—\s]+$/g, '')
        .trim()
        .slice(0, 140);
}

/**
 * Identify Table of Contents pages and parse numbered session/chapter titles.
 */
function extractTableOfContents(pages) {
    const tocPages = new Set();
    const tocMap = new Map();
    const maxScanPages = Math.min(pages.length, Math.max(12, Math.ceil(pages.length * 0.2)));

    for (let i = 0; i < maxScanPages; i++) {
        const page = pages[i];
        const lines = String(page.text || '')
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);

        const joinedHead = lines.slice(0, 15).join(' ').toLowerCase();
        const hasTocHeader = /\b(table\s+of\s+contents|contents)\b/i.test(joinedHead);

        const numberedEntries = [];
        for (let idx = 0; idx < lines.length; idx++) {
            const line = lines[idx];
            // Match "1. Title .... 12" or "Session 1: Title" or "1 Title"
            const m = line.match(/^(?:(?:session|chapter|unit|module|lesson|part)\s+)?(\d{1,2})[.):\-–—]?\s+([A-Za-z][^\n]{2,120})$/i);
            if (m) {
                const num = parseInt(m[1], 10);
                // Avoid decimal headings like "1.1 Overview"
                if (!/^\d+\.\d+/.test(line) && num >= 1 && num <= 80) {
                    const title = cleanTitleText(m[2]);
                    if (title.length >= 3) {
                        numberedEntries.push({ num, title });
                    }
                }
            }
        }

        const isSequentialList = numberedEntries.length >= 3 &&
            numberedEntries.some(e => e.num === 1) &&
            numberedEntries.some(e => e.num === 2);

        if (hasTocHeader || isSequentialList) {
            tocPages.add(page.pageNumber);
            for (const entry of numberedEntries) {
                if (!tocMap.has(entry.num)) {
                    tocMap.set(entry.num, entry.title);
                }
            }
        }
    }

    return { tocPages, tocMap };
}

/**
 * Extract the best clean title from lines immediately following a Session/Chapter heading.
 */
function extractTitleFromCoverLines(lines, startLineIdx, inlineTitle, tocTitle) {
    const cleanInline = cleanTitleText(inlineTitle);
    if (cleanInline && !isBoilerplateLine(cleanInline) && cleanInline.length >= 3) {
        return cleanInline;
    }

    const parts = [];
    for (let i = startLineIdx + 1; i < Math.min(lines.length, startLineIdx + 10); i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (isSummaryOrBoxProse(line)) {
            if (parts.length > 0) break;
            continue;
        }
        if (isBoilerplateLine(line)) {
            if (parts.length > 0) break;
            continue;
        }
        // Stop if we hit a sentence that looks like description prose after already capturing title words
        if (parts.length > 0 && (parts.join(' ').length + line.length > 95 || /[.!?]$/.test(line))) {
            break;
        }
        parts.push(line);
        if (parts.length >= 3) break;
    }

    const coverTitle = cleanTitleText(parts.join(' '));

    if (tocTitle) {
        if (!coverTitle || coverTitle.length < 3) return tocTitle;
        const coverLower = coverTitle.toLowerCase();
        const tocLower = tocTitle.toLowerCase();
        // Prefer fuller cover title if it expands or directly matches the TOC entry
        if (coverLower.includes(tocLower) && coverTitle.length <= 100) {
            return coverTitle;
        }
        if (tocLower.includes(coverLower) && tocTitle.length >= coverTitle.length) {
            return tocTitle;
        }
        const tocWords = tocLower.split(/\W+/).filter(w => w.length > 2);
        const overlapCount = tocWords.filter(w => coverLower.includes(w)).length;
        if (coverTitle.length <= 95 && overlapCount >= Math.max(1, Math.floor(tocWords.length / 2))) {
            return coverTitle;
        }
        return tocTitle;
    }

    return coverTitle;
}

/**
 * Extract ordered unique sub-topics within a session's pages.
 */
function extractSessionTopics(sessionPages, sessionNumber) {
    const topics = [];
    const seen = new Set();
    const skipTopicRe = /^(summary|check\s+your\s+progress|answers?\s+for\s+check\s+your\s+progress|try\s+it\s+yourself|learning\s+objectives|aptech\s+limited|table\s+of\s+contents)$/i;

    const addTopic = (raw) => {
        const clean = String(raw || '')
            .replace(/\s+/g, ' ')
            .replace(/^[\s\-–—•]+|[\s\-–—:]+$/g, '')
            .trim();
        if (!clean || clean.length < 3 || clean.length > 120) return;
        const withoutNum = clean.replace(/^\d+(?:\.\d+){1,2}\s+/, '').trim();
        if (!withoutNum || skipTopicRe.test(withoutNum)) return;
        if (/^(figure|table|code\s+snippet)\s+\d/i.test(clean)) return;
        const key = withoutNum.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        topics.push(clean);
    };

    for (const page of sessionPages) {
        const lines = String(page.text || '')
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);

        for (const line of lines) {
            if (isBoilerplateLine(line)) continue;

            // Numbered section / subsection headings like "1.1 Overview of CMS", "2.1.3 Web Server Setup"
            const secMatch = line.match(/^(\d+)(?:\.(\d+))(?:\.(\d+))?\s+([A-Za-z][^\n]{2,110})$/);
            if (secMatch) {
                const major = parseInt(secMatch[1], 10);
                if (!sessionNumber || major === sessionNumber) {
                    addTopic(`${secMatch[1]}.${secMatch[2]}${secMatch[3] ? `.${secMatch[3]}` : ''} ${secMatch[4].trim()}`);
                }
                continue;
            }

            // Markdown headings if extracted from DOCX/formatted text
            const mdMatch = line.match(/^#{1,4}\s+(.+)$/);
            if (mdMatch) {
                addTopic(mdMatch[1]);
            }
        }
    }

    return topics.slice(0, 35);
}

/**
 * Build page-tagged session text so AI prompts can cite exact source pages.
 */
function buildSessionContentWithPageMarkers(sessionPages) {
    const blocks = [];
    for (const page of sessionPages) {
        const cleaned = sanitizeExtractedContent(page.text || '')
            .replace(/^©\s*aptech\s+limited\s*$/gim, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        if (!cleaned || cleaned.length < 15) continue;

        const firstLines = cleaned.split('\n').slice(0, 5).join(' ').toLowerCase();
        const isExerciseOrAnswerKey =
            /\banswers\s+for\s+check\s+your\s+progress\b/i.test(firstLines) ||
            /\bcheck\s+your\s+progress\b/i.test(firstLines) ||
            /\btry\s+it\s+yourself\b/i.test(firstLines);

        const tag = isExerciseOrAnswerKey
            ? `[PAGE ${page.pageNumber} - EXERCISE_REFERENCE]`
            : `[PAGE ${page.pageNumber}]`;
        blocks.push(`${tag}\n${cleaned}`);
    }
    return blocks.join('\n\n');
}

/**
 * Automatically detect sessions, chapters, units, or fallback segments from extracted PDF pages.
 * Preserves original session/chapter order, titles, page ranges, topics, and page-tagged text.
 */
function detectBookSessions(rawPages, { bookTitle = '' } = {}) {
    const pages = (Array.isArray(rawPages) ? rawPages : [])
        .map((p, idx) => ({
            pageNumber: Number(p?.pageNumber) || idx + 1,
            text: sanitizeExtractedContent(p?.text || '')
        }))
        .filter(p => p.text.length >= 10)
        .sort((a, b) => a.pageNumber - b.pageNumber);

    if (pages.length === 0) {
        return [];
    }

    const { tocPages, tocMap } = extractTableOfContents(pages);
    const explicitHeadingRe = /^(session|chapter|unit|module|lesson|part)\s+([0-9]{1,2}|[ivxlcdm]{1,6})(?:\s*[:.\-–—]\s*(.*))?$/i;

    // Priority 1: Explicit Session / Chapter / Unit / Module / Lesson / Part dividers
    const starts = [];
    const seenSessionNumbers = new Set();

    for (let idx = 0; idx < pages.length; idx++) {
        const page = pages[idx];
        if (tocPages.has(page.pageNumber)) continue;

        const lines = page.text
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);

        // Check top 15 lines of the page for a standalone section divider
        for (let lineIdx = 0; lineIdx < Math.min(lines.length, 15); lineIdx++) {
            const line = lines[lineIdx];
            if (line.length > 120) continue;

            const match = line.match(explicitHeadingRe);
            if (!match) continue;

            const labelKind = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
            const num = parseSessionNumberToken(match[2]);
            if (!num || seenSessionNumbers.has(num)) continue;

            // Verify this is an actual session/chapter start rather than an inline prose mention
            const inlineRest = String(match[3] || '').trim();
            if (inlineRest && /^(explains|describes|covers|introduces|discusses|shows|lists)\b/i.test(inlineRest)) {
                continue;
            }

            seenSessionNumbers.add(num);
            const tocTitle = tocMap.get(num) || '';
            const resolvedTitle = extractTitleFromCoverLines(lines, lineIdx, inlineRest, tocTitle)
                || `${labelKind} ${num}`;

            starts.push({
                sessionNumber: num,
                labelKind,
                title: resolvedTitle,
                startPageIndex: idx,
                startPage: page.pageNumber
            });
            break;
        }
    }

    let boundaries = [];

    if (starts.length >= 2 || (starts.length === 1 && pages.length <= 45)) {
        starts.sort((a, b) => a.startPageIndex - b.startPageIndex);

        // Exclude trailing Appendix / Glossary / Index divider pages from the last numbered session
        let lastBodyPageIndex = pages.length - 1;
        if (starts.length >= 2) {
            const lastStartIdx = starts[starts.length - 1].startPageIndex;
            for (let i = lastStartIdx + 1; i < pages.length; i++) {
                const topLines = pages[i].text
                    .split('\n')
                    .map(l => l.trim())
                    .filter(Boolean)
                    .slice(0, 4);
                const firstNonBoilerplate = topLines.find(l => !isBoilerplateLine(l)) || '';
                if (/^(appendix|appendices|glossary|bibliography|index)\b/i.test(firstNonBoilerplate) && firstNonBoilerplate.length <= 40) {
                    lastBodyPageIndex = i - 1;
                    break;
                }
            }
        }

        boundaries = starts.map((s, i) => {
            const endIdx = i + 1 < starts.length
                ? starts[i + 1].startPageIndex - 1
                : Math.max(s.startPageIndex, lastBodyPageIndex);
            return {
                sessionNumber: s.sessionNumber,
                title: s.title,
                startPageIndex: s.startPageIndex,
                endPageIndex: endIdx
            };
        });
    } else {
        // Priority 2: Decimal subsection grouping ("1.1 ...", "2.1 ...", ...)
        const majorStarts = [];
        const seenMajors = new Set();
        for (let idx = 0; idx < pages.length; idx++) {
            const page = pages[idx];
            if (tocPages.has(page.pageNumber)) continue;
            const lines = page.text.split('\n').map(l => l.trim()).filter(Boolean);
            for (const line of lines.slice(0, 15)) {
                const decMatch = line.match(/^(\d{1,2})\.1(?:\.1)?\s+([A-Z][^\n]{2,100})$/);
                if (decMatch) {
                    const major = parseInt(decMatch[1], 10);
                    if (major >= 1 && major <= 50 && !seenMajors.has(major)) {
                        seenMajors.add(major);
                        majorStarts.push({
                            sessionNumber: major,
                            title: tocMap.get(major) || cleanTitleText(decMatch[2]) || `Session ${major}`,
                            startPageIndex: idx
                        });
                        break;
                    }
                }
            }
        }

        if (majorStarts.length >= 2) {
            majorStarts.sort((a, b) => a.startPageIndex - b.startPageIndex);
            boundaries = majorStarts.map((s, i) => ({
                sessionNumber: s.sessionNumber,
                title: s.title,
                startPageIndex: s.startPageIndex,
                endPageIndex: i + 1 < majorStarts.length ? majorStarts[i + 1].startPageIndex - 1 : pages.length - 1
            }));
        } else {
            // Priority 3: Chunked page-range fallback for flat PDFs without explicit chapters
            const chunkSize = pages.length <= 22 ? pages.length : 18;
            let num = 1;
            for (let startIdx = 0; startIdx < pages.length; startIdx += chunkSize) {
                const endIdx = Math.min(pages.length - 1, startIdx + chunkSize - 1);
                const firstLines = pages[startIdx].text.split('\n').map(l => l.trim()).filter(Boolean);
                const heading = firstLines.find(l => !isBoilerplateLine(l) && l.length >= 4 && l.length <= 90) || '';
                const title = tocMap.get(num) || cleanTitleText(heading) || (bookTitle ? `${bookTitle} — Section ${num}` : `Section ${num}`);
                boundaries.push({
                    sessionNumber: num,
                    title,
                    startPageIndex: startIdx,
                    endPageIndex: endIdx
                });
                num++;
            }
        }
    }

    return boundaries.map((b, idx) => {
        const slice = pages.slice(b.startPageIndex, b.endPageIndex + 1);
        const startPage = slice[0]?.pageNumber || 1;
        const endPage = slice[slice.length - 1]?.pageNumber || startPage;
        const sessionNumber = Number(b.sessionNumber) || (idx + 1);
        const topics = extractSessionTopics(slice, sessionNumber);
        const contentText = buildSessionContentWithPageMarkers(slice);

        return {
            sessionNumber,
            title: b.title || `Session ${sessionNumber}`,
            startPage,
            endPage,
            topics,
            contentText,
            contentCharCount: contentText.length
        };
    }).filter(s => s.contentCharCount > 0);
}

module.exports = {
    detectBookSessions,
    extractSessionTopics,
    buildSessionContentWithPageMarkers,
    extractTableOfContents,
    parseSessionNumberToken
};
