const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(fullPath);
        }
    }
    return results;
}

const files = walk(path.join(__dirname, '..', 'src'));
const regex = /(?:to|href)=['"](\/[^'"#?]*)/g;

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(content)) !== null) {
        if (match[1] === '/certificates' || match[1] === '/settings') {
            console.log(`Found ${match[1]} in ${file}`);
        }
    }
}
