export function normalizeCategoryName(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\band\b/g, '&')
        .replace(/\s+/g, ' ');
}

export function hasPublishedCategory(categories, matchNames) {
    const names = new Set(
        (Array.isArray(matchNames) ? matchNames : [matchNames])
            .map(normalizeCategoryName)
            .filter(Boolean)
    );

    return (Array.isArray(categories) ? categories : []).some(category =>
        category &&
        category.isEnabled !== false &&
        Number(category.questionCount || 0) > 0 &&
        names.has(normalizeCategoryName(category.name))
    );
}
