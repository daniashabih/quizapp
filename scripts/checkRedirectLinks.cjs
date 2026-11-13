const fs = require('fs');
const path = require('path');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const redirectSources = new Set(vercel.redirects.map(r => r.source));

function walk(dir) {
    let results = [];
    for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) results = results.concat(walk(p));
        else if (p.endsWith('.jsx') || p.endsWith('.js')) results.push(p);
    }
    return results;
}

const files = walk('src');
const hits = [];
for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const src of redirectSources) {
        const regex = new RegExp('(?:to|href)=["\']' + src.replace(/\//g, '\\/') + '["\']', 'g');
        if (regex.test(content)) {
            hits.push({ file, src });
        }
    }
}
console.log('Redirecting link hits:', hits);
