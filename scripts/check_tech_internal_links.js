const { SEO_PAGES_CONFIG, TECHNOLOGY_SEO_SLUGS } = require('../src/config/seoPagesConfig.js');

for (const slug of TECHNOLOGY_SEO_SLUGS) {
    const config = SEO_PAGES_CONFIG[slug];
    console.log(`\n=== TECHNOLOGY: ${slug} ===`);
    if (!config || !config.internalLinks) {
        console.log('  No config or internalLinks!');
    } else {
        config.internalLinks.forEach(l => console.log(`  [${l.label}] -> ${l.to}`));
    }
}
