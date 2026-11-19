export const SEO_NAV_ITEMS = [
    { id: 'overview', label: 'Overview' },
    { id: 'search-performance', label: 'Search Performance' },
    { id: 'keywords', label: 'Keyword Research' },
    { id: 'audit', label: 'Website Audit' },
    { id: 'indexing', label: 'Page Indexing' },
    { id: 'content', label: 'Content Analysis' },
    { id: 'technical', label: 'Technical SEO' },
    { id: 'backlinks', label: 'Backlinks' },
    { id: 'ai-visibility', label: 'AI Visibility' },
    { id: 'competitors', label: 'Competitors' },
    { id: 'recommendations', label: 'SEO Recommendations' },
    { id: 'settings', label: 'Settings' }
];

export function getStatusBadgeClasses(status = '') {
    const s = String(status || '').toLowerCase();
    if (s === 'critical') {
        return 'bg-[#FCEEED] text-[#B91C1C] border-[#F8C9C6] dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60';
    }
    if (s === 'needs attention' || s === 'needs improvement' || s === 'warning' || s === 'medium' || s === 'high') {
        return 'bg-[#FEF5E7] text-[#B45309] border-[#F8DFB6] dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60';
    }
    if (s === 'good' || s === 'verified' || s === 'passed') {
        return 'bg-[#E5F2EC] text-[#193D35] border-[#BBE0CE] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60';
    }
    return 'bg-[#F7F8F6] text-[#75817C] border-[#E4EAE6] dark:bg-[#1F2D27] dark:text-[#8FA69C] dark:border-[#2A3832]';
}

export function getPriorityBadgeClasses(priority = '') {
    const p = String(priority || '').toLowerCase();
    if (p === 'critical') {
        return 'bg-[#FCEEED] text-[#B91C1C] border-[#F8C9C6] dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60';
    }
    if (p === 'high') {
        return 'bg-[#FEF2E2] text-[#C2410C] border-[#FED7AA] dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60';
    }
    if (p === 'medium') {
        return 'bg-[#FEF5E7] text-[#B45309] border-[#F8DFB6] dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60';
    }
    return 'bg-[#E5F2EC] text-[#2F806B] border-[#BBE0CE] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60';
}

export function formatSeoTimestamp(isoString) {
    if (!isoString) return 'Not checked yet';
    try {
        const d = new Date(isoString);
        if (Number.isNaN(d.getTime())) return 'Recently';
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    } catch {
        return 'Recently';
    }
}

export function getScoreTierInfo(score = 0) {
    if (score >= 85) {
        return {
            label: 'Strong Health',
            stroke: '#2F806B',
            bgClass: 'bg-[#E5F2EC] text-[#193D35] dark:bg-emerald-950/60 dark:text-emerald-300'
        };
    }
    if (score >= 65) {
        return {
            label: 'Needs Attention',
            stroke: '#D19A45',
            bgClass: 'bg-[#FEF5E7] text-[#B45309] dark:bg-amber-950/60 dark:text-amber-300'
        };
    }
    return {
        label: 'Critical Priority',
        stroke: '#C96155',
        bgClass: 'bg-[#FCEEED] text-[#B91C1C] dark:bg-red-950/60 dark:text-red-300'
    };
}
