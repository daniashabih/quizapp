const fs = require('fs');
const path = require('path');
const { buildSitemapXml, buildRobotsTxt } = require('../api/_controllers/seoController');

const ROOT_DIR = path.resolve(__dirname, '..');
const publicDir = path.join(ROOT_DIR, 'public');
const distDir = path.join(ROOT_DIR, 'dist');

const sitemapXml = buildSitemapXml();
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
