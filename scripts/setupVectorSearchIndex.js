/**
 * Provision MongoDB Atlas Vector Search Index on `knowledge_book_chunks`.
 * Usage: node scripts/setupVectorSearchIndex.js
 */
require('dotenv').config();
const prisma = require('../api/_config/prisma');
const { ensureAtlasVectorSearchIndex, getAtlasVectorIndexDefinition } = require('../api/_services/vectorSearchService');

async function main() {
    console.log('=== Hangbug MongoDB Atlas Vector Search Index Setup ===');
    const result = await ensureAtlasVectorSearchIndex();
    if (result.success) {
        console.log(`Vector Search index "${result.indexName}" created/verified successfully!`);
        console.log(JSON.stringify(result.response, null, 2));
    } else {
        console.warn(`Automatic creation notice: ${result.message}`);
        console.log('\nYou can also create this index manually in MongoDB Atlas UI:');
        console.log('Collection: knowledge_book_chunks');
        console.log(`Index Name: ${result.indexName}`);
        console.log('Definition JSON:');
        console.log(JSON.stringify(getAtlasVectorIndexDefinition().definition, null, 2));
    }
}

main()
    .catch(err => {
        console.error('Setup failed:', err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect().catch(() => {});
    });
