const fs = require('fs');
const path = require('path');
const { buildSitemapXml, buildRobotsTxt } = require('../api/_controllers/seoController');
const {
    fetchPublishedBlogPostsFromSource,
    isMongoUriConfigured
} = require('../api/_utils/blogSeoRenderer');

const ROOT_DIR = path.resolve(__dirname, '..');
const publicDir = path.join(ROOT_DIR, 'public');
const distDir = path.join(ROOT_DIR, 'dist');

async function main() {
    let blogSlugsOverride = null;
    let extraGameSlugs = [];

    try {
        const result = await fetchPublishedBlogPostsFromSource({ allowRemoteApiFallback: true });
        if ((result.source === 'mongodb' || result.source === 'api') && Array.isArray(result.articles)) {
            blogSlugsOverride = result.articles.map(a => a.slug).filter(Boolean);
            extraGameSlugs = Array.isArray(result.gameSlugs) ? result.gameSlugs : [];
            console.log(`✓ Sitemap loaded ${blogSlugsOverride.length} published blog article(s) from ${result.source}`);
        } else {
            console.log(`ℹ Sitemap using fallback static blog list (${result.articles.length} articles)`);
        }
    } catch (err) {
        console.warn('⚠ Could not fetch dynamic blog slugs for sitemap, using static fallback:', err.message);
    }

    const sitemapXml = buildSitemapXml(extraGameSlugs, [], { blogSlugsOverride });
    const robotsTxt = buildRobotsTxt();

    // 1. Sync public/sitemap.xml
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
    console.log('✓ Successfully generated public/sitemap.xml');

    // 2. Sync public/robots.txt
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');
    console.log('✓ Successfully generated public/robots.txt');

    // 3. Sync dist/sitemap.xml, dist/robots.txt, dist/llms.txt, and dist/llms-full.txt if dist directory exists
    if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
        fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8');
        const llmsTxt = path.join(publicDir, 'llms.txt');
        const llmsFullTxt = path.join(publicDir, 'llms-full.txt');
        if (fs.existsSync(llmsTxt)) {
            fs.copyFileSync(llmsTxt, path.join(distDir, 'llms.txt'));
        }
        if (fs.existsSync(llmsFullTxt)) {
            fs.copyFileSync(llmsFullTxt, path.join(distDir, 'llms-full.txt'));
        }
        console.log('✓ Successfully synchronized dist/sitemap.xml, dist/robots.txt, and dist/llms.txt');
    }

    if (isMongoUriConfigured(process.env.MONGODB_URI)) {
        try {
            const prisma = require('../api/_config/prisma');
            await prisma.$disconnect();
        } catch {
            // ignore disconnect errors
        }
    }
}

main().catch((err) => {
    console.error('❌ generateSitemap failed:', err);
    process.exit(1);
});
