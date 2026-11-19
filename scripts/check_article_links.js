const { INITIAL_BLOG_ARTICLES } = require('../src/services/blogArticles.js');

for (const a of INITIAL_BLOG_ARTICLES) {
    console.log(`\n========================================`);
    console.log(`ARTICLE: ${a.slug} (${a.title})`);
    console.log(`Category: ${a.category} | Quiz: ${a.relatedQuizCategory} | Game: ${a.relatedGameSlug}`);
    const links = [...a.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    console.log(`Found ${links.length} markdown links in content:`);
    links.forEach(l => console.log(`  - [${l[1]}] -> ${l[2]}`));
}
