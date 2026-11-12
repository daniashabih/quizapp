const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT_DIR = path.resolve(__dirname, '..');

async function loadTechLogosModule() {
    const fileUrl = pathToFileURL(path.join(ROOT_DIR, 'src', 'utils', 'techLogos.js')).href;
    return import(fileUrl);
}

const SEEDED_AND_PROMPT_CATEGORIES = [
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Angular',
    'Vue',
    'Node.js',
    'Express.js',
    'MongoDB',
    'SQL',
    'SQL Server',
    'PHP',
    'Laravel',
    'Python',
    'Django',
    'Flutter',
    'Dart',
    'Git',
    'GitHub',
    'Tailwind CSS',
    'Bootstrap',
    'WordPress',
    'Docker',
    'Agile and DevOps',
    'Agile & DevOps',
    'Agile Characteristics',
    'Azure',
    'SEO',
    'Express JS and Node JS',
    'Power BI',
    'Excel',
    'PHP, XML JSON, Laravel, MySQL, JavaScript',
    'C#',
    'HTML & CSS',
];

test('1. All catalog SVG assets exist on both Web and Flutter with clean inline SVG geometry', () => {
    return loadTechLogosModule().then(({ TECH_LOGO_CATALOG }) => {
        const entries = Object.values(TECH_LOGO_CATALOG);
        assert.ok(entries.length >= 49, 'Catalog should contain at least 49 logos');

        for (const entry of entries) {
            const webSvgPath = path.join(ROOT_DIR, 'public', 'assets', 'tech-logos', entry.file);
            const mobileSvgPath = path.join(ROOT_DIR, 'mobile', 'assets', 'tech_logos', entry.file);

            assert.ok(fs.existsSync(webSvgPath), `Missing Web SVG: ${entry.file}`);
            assert.ok(fs.existsSync(mobileSvgPath), `Missing Mobile SVG: ${entry.file}`);

            const svgContent = fs.readFileSync(webSvgPath, 'utf8');
            assert.ok(/<svg[\s>]/i.test(svgContent), `${entry.file} must contain <svg>`);
            assert.ok(/viewBox=/i.test(svgContent), `${entry.file} must define viewBox`);
            assert.ok(!/<style[\s>]/i.test(svgContent), `${entry.file} must not contain <style> for Flutter compatibility`);
            assert.ok(!/<text[\s>]/i.test(svgContent), `${entry.file} must not contain <text> elements`);
        }
    });
});

test('2. Every seeded and multi-tech Hangbug category resolves to official brand logos', async () => {
    const { resolveTechLogos } = await loadTechLogosModule();

    for (const categoryName of SEEDED_AND_PROMPT_CATEGORIES) {
        const logos = resolveTechLogos(categoryName);
        assert.ok(logos.length >= 1, `Expected at least 1 logo for "${categoryName}"`);
    }

    assert.deepEqual(
        resolveTechLogos('HTML').map((l) => l.id),
        ['html5']
    );
    assert.deepEqual(
        resolveTechLogos('HTML & CSS').map((l) => l.id),
        ['html5', 'css3']
    );
    assert.deepEqual(
        resolveTechLogos('Express JS and Node JS').map((l) => l.id),
        ['express', 'nodejs']
    );
    assert.deepEqual(
        resolveTechLogos('PHP, XML JSON, Laravel, MySQL, JavaScript').map((l) => l.id),
        ['php', 'xml', 'json', 'laravel', 'mysql', 'javascript']
    );
    assert.deepEqual(
        resolveTechLogos('Microsoft Azure').map((l) => l.id),
        ['azure']
    );
    assert.deepEqual(
        resolveTechLogos('Power BI').map((l) => l.id),
        ['powerbi']
    );
    assert.deepEqual(
        resolveTechLogos('Excel').map((l) => l.id),
        ['excel']
    );
    assert.deepEqual(
        resolveTechLogos('Unknown Custom Category XYZ'),
        []
    );
});

test('3. Web Technologies page renders TechLogo instead of alphabet letter placeholders', () => {
    const pageSource = fs.readFileSync(
        path.join(ROOT_DIR, 'src', 'pages', 'quiz', 'Technologies.jsx'),
        'utf8'
    );
    assert.ok(pageSource.includes("import TechLogo from '../../components/TechLogo'"));
    assert.ok(pageSource.includes('<TechLogo'));
    assert.ok(!pageSource.includes('.charAt(0)'), 'Alphabet placeholder .charAt(0) should be removed from Technologies.jsx');
});
