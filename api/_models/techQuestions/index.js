/**
 * Curated, Verified High-Demand Technology Starter Question Packs (375 MCQs total).
 * Covers all 15 high-demand empty technology tracks across Sessions 1, 2, and 3 (25 questions each).
 */

const { FRONTEND_STYLING_PACKS } = require('./frontendStylingPack');
const { JS_FRAMEWORKS_PACKS } = require('./jsFrameworksPack');
const { BACKEND_CMS_PACKS } = require('./backendCmsPack');
const { MOBILE_DEVOPS_DATA_PACKS } = require('./mobileDevopsDataPack');
const { normalizeCategoryKey } = require('../../_utils/categoryMatching');

const HIGH_DEMAND_TECH_PACKS = {
    ...FRONTEND_STYLING_PACKS,
    ...JS_FRAMEWORKS_PACKS,
    ...BACKEND_CMS_PACKS,
    ...MOBILE_DEVOPS_DATA_PACKS
};

const HIGH_DEMAND_TECH_NAMES = Object.keys(HIGH_DEMAND_TECH_PACKS);

const PACK_BY_NORM_NAME = new Map(
    HIGH_DEMAND_TECH_NAMES.map(name => [normalizeCategoryKey(name), name])
);

function getHighDemandPackName(categoryName) {
    if (!categoryName) return null;
    const norm = normalizeCategoryKey(categoryName);
    return PACK_BY_NORM_NAME.get(norm) || null;
}

function getHighDemandPack(categoryName) {
    const canonical = getHighDemandPackName(categoryName);
    return canonical ? HIGH_DEMAND_TECH_PACKS[canonical] : [];
}

function getAllHighDemandQuestions() {
    return HIGH_DEMAND_TECH_NAMES.flatMap(name => HIGH_DEMAND_TECH_PACKS[name]);
}

module.exports = {
    HIGH_DEMAND_TECH_PACKS,
    HIGH_DEMAND_TECH_NAMES,
    getHighDemandPackName,
    getHighDemandPack,
    getAllHighDemandQuestions
};
