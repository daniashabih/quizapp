/**
 * Shared Zero-Dependency Markdown Parser & Plain-Text Helper for Hangbug Blog
 * Used by both Node SSR/pre-rendering and Vite/React BlogDetail renderer.
 */

const ENTITY_MAP = {
    '&rarr;': '→',
    '&larr;': '←',
    '&harr;': '↔',
    '&mdash;': '—',
    '&ndash;': '–',
    '&copy;': '©',
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
};

export function decodeHtmlEntities(text) {
    if (!text) return '';
    return String(text).replace(
        /&(rarr|larr|harr|mdash|ndash|copy|nbsp|amp|lt|gt|quot|#39);/gi,
        (match) => ENTITY_MAP[match.toLowerCase()] || match
    );
}

export function isSafeLinkUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return false;
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
    try {
        const parsed = new URL(trimmed);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
        return false;
    }
}

export function slugifyHeading(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[`*_~]/g, '')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Tokenizes inline markdown (**bold**, *italic*, `code`, [label](url)).
 */
export function parseInlineTokens(text) {
    if (!text) return [];
    const tokens = [];
    const pattern = /(\[[^\]]+\]\([^)\s]+(?:\s+"[^"]*")?\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+?\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({
                type: 'text',
                value: decodeHtmlEntities(text.slice(lastIndex, match.index))
            });
        }

        const raw = match[0];
        if (raw.startsWith('[') && raw.includes('](')) {
            const linkMatch = raw.match(/^\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)$/);
            if (linkMatch && isSafeLinkUrl(linkMatch[2])) {
                tokens.push({
                    type: 'link',
                    label: decodeHtmlEntities(linkMatch[1].replace(/\*\*/g, '')),
                    href: linkMatch[2].trim(),
                    tokens: parseInlineTokens(linkMatch[1])
                });
            } else {
                tokens.push({ type: 'text', value: decodeHtmlEntities(raw) });
            }
        } else if (raw.startsWith('`') && raw.endsWith('`') && raw.length >= 2) {
            tokens.push({
                type: 'code',
                value: raw.slice(1, -1)
            });
        } else if (raw.startsWith('**') && raw.endsWith('**') && raw.length >= 4) {
            tokens.push({
                type: 'strong',
                tokens: parseInlineTokens(raw.slice(2, -2))
            });
        } else if (raw.startsWith('*') && raw.endsWith('*') && raw.length >= 2) {
            tokens.push({
                type: 'em',
                tokens: parseInlineTokens(raw.slice(1, -1))
            });
        } else {
            tokens.push({ type: 'text', value: decodeHtmlEntities(raw) });
        }

        lastIndex = match.index + raw.length;
    }

    if (lastIndex < text.length) {
        tokens.push({
            type: 'text',
            value: decodeHtmlEntities(text.slice(lastIndex))
        });
    }

    return tokens;
}

function isTableSeparatorLine(line) {
    if (!line || !line.includes('|')) return false;
    const stripped = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    const cells = stripped.split('|').map(c => c.trim());
    return cells.length > 0 && cells.every(c => /^:?-{2,}:?$/.test(c));
}

function splitTableRow(line) {
    const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    const cells = [];
    let current = '';
    for (let i = 0; i < trimmed.length; i++) {
        if (trimmed[i] === '\\' && trimmed[i + 1] === '|') {
            current += '|';
            i++;
        } else if (trimmed[i] === '|') {
            cells.push(current.trim());
            current = '';
        } else {
            current += trimmed[i];
        }
    }
    cells.push(current.trim());
    return cells;
}

function parseTextSegmentToBlocks(segment) {
    const lines = segment.replace(/\r\n/g, '\n').split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const trimmed = lines[i].trim();

        if (!trimmed) {
            i++;
            continue;
        }

        // Horizontal rule
        if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
            blocks.push({ type: 'hr' });
            i++;
            continue;
        }

        // Headings (map # inside article body to h2 to preserve single page H1)
        const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
        if (headingMatch) {
            const rawLevel = headingMatch[1].length;
            const level = rawLevel === 1 ? 2 : rawLevel;
            const text = headingMatch[2].trim();
            blocks.push({
                type: 'heading',
                level,
                text,
                id: slugifyHeading(text)
            });
            i++;
            continue;
        }

        // Pipe Table
        if (trimmed.includes('|') && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1])) {
            const headers = splitTableRow(trimmed);
            const sepCells = splitTableRow(lines[i + 1]);
            const alignments = sepCells.map(cell => {
                if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
                if (cell.endsWith(':')) return 'right';
                return 'left';
            });
            const rows = [];
            i += 2;
            while (i < lines.length) {
                const rowTrimmed = lines[i].trim();
                if (!rowTrimmed || !rowTrimmed.includes('|')) break;
                rows.push(splitTableRow(rowTrimmed));
                i++;
            }
            blocks.push({ type: 'table', headers, alignments, rows });
            continue;
        }

        // Blockquote
        if (trimmed.startsWith('>')) {
            const quoteLines = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) {
                quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
                i++;
            }
            blocks.push({ type: 'blockquote', lines: quoteLines.filter(Boolean) });
            continue;
        }

        // Unordered List
        if (/^[-*]\s+/.test(trimmed)) {
            const items = [];
            while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
                i++;
            }
            blocks.push({ type: 'ul', items });
            continue;
        }

        // Ordered List
        if (/^\d+\.\s+/.test(trimmed)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
                i++;
            }
            blocks.push({ type: 'ol', items });
            continue;
        }

        // Paragraph
        const paraLines = [];
        while (i < lines.length) {
            const curr = lines[i].trim();
            if (
                !curr ||
                /^(-{3,}|\*{3,})$/.test(curr) ||
                /^(#{1,4})\s+/.test(curr) ||
                curr.startsWith('>') ||
                /^[-*]\s+/.test(curr) ||
                /^\d+\.\s+/.test(curr) ||
                (curr.includes('|') && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1]))
            ) {
                break;
            }
            paraLines.push(curr);
            i++;
        }
        if (paraLines.length > 0) {
            blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
        } else {
            i++;
        }
    }

    return blocks;
}

/**
 * Parses full article markdown into structured blocks (code blocks + text blocks).
 */
export function parseMarkdownBlocks(content) {
    if (!content || typeof content !== 'string') return [];

    const normalized = content.replace(/\r\n/g, '\n');
    const blocks = [];
    const codeBlockRegex = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(normalized)) !== null) {
        if (match.index > lastIndex) {
            const textChunk = normalized.slice(lastIndex, match.index);
            blocks.push(...parseTextSegmentToBlocks(textChunk));
        }
        blocks.push({
            type: 'code',
            language: (match[1] || 'text').trim(),
            value: match[2].replace(/\n$/, '')
        });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < normalized.length) {
        blocks.push(...parseTextSegmentToBlocks(normalized.slice(lastIndex)));
    }

    return blocks;
}

export function stripMarkdownToPlainText(markdown) {
    if (!markdown || typeof markdown !== 'string') return '';
    return decodeHtmlEntities(
        markdown
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/^#{1,6}\s+/gm, '')
            .replace(/^>\s?/gm, '')
            .replace(/[*_~|>-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
    );
}

export function countPlainWords(markdownOrText) {
    const plain = stripMarkdownToPlainText(markdownOrText);
    if (!plain) return 0;
    return plain.split(/\s+/).filter(Boolean).length;
}
