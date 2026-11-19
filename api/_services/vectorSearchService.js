const prisma = require('../_config/prisma');
const { getActiveEmbeddingDimensions } = require('./aiProviderService');

const VECTOR_INDEX_NAME = process.env.MONGODB_VECTOR_INDEX || 'book_chunks_vector_index';

function getConfiguredVectorDimensions(explicitDimensions) {
    if (Number.isFinite(Number(explicitDimensions)) && Number(explicitDimensions) > 0) {
        return Number(explicitDimensions);
    }
    return getActiveEmbeddingDimensions();
}

/**
 * Compute cosine similarity between two numeric vectors
 */
function cosineSimilarity(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || a.length !== b.length) {
        return 0;
    }
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
        const av = a[i];
        const bv = b[i];
        dot += av * bv;
        magA += av * av;
        magB += bv * bv;
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom > 0 ? dot / denom : 0;
}

/**
 * MongoDB Atlas Vector Search Index definition for `knowledge_book_chunks`
 */
function getAtlasVectorIndexDefinition(dimensions) {
    const numDimensions = getConfiguredVectorDimensions(dimensions);
    return {
        name: VECTOR_INDEX_NAME,
        type: 'vectorSearch',
        definition: {
            fields: [
                {
                    type: 'vector',
                    path: 'embedding',
                    numDimensions,
                    similarity: 'cosine'
                },
                {
                    type: 'filter',
                    path: 'technologyNormalized'
                },
                {
                    type: 'filter',
                    path: 'isActive'
                },
                {
                    type: 'filter',
                    path: 'bookId'
                }
            ]
        }
    };
}

/**
 * Semantic search over active book chunks for the specified technologies.
 * Uses MongoDB Atlas native `$vectorSearch` first, and gracefully falls back to
 * in-app cosine similarity only if the Atlas Vector Search index has not been created yet.
 */
async function searchRelevantBookChunks({
    queryEmbedding,
    technologiesNormalized,
    limit = 6,
    minScore = parseFloat(process.env.VECTOR_SEARCH_MIN_SCORE || '0.25') || 0.25
}) {
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
        return { chunks: [], searchMode: 'none' };
    }

    const techList = Array.isArray(technologiesNormalized)
        ? technologiesNormalized.filter(Boolean)
        : [technologiesNormalized].filter(Boolean);

    if (techList.length === 0) {
        return { chunks: [], searchMode: 'none' };
    }

    // 1. Primary path: MongoDB Atlas $vectorSearch aggregation pipeline
    if (typeof prisma.knowledgeBookChunk?.aggregateRaw === 'function') {
        try {
            const filter = {
                isActive: true,
                technologyNormalized: techList.length === 1 ? techList[0] : { $in: techList }
            };

            const pipeline = [
                {
                    $vectorSearch: {
                        index: VECTOR_INDEX_NAME,
                        path: 'embedding',
                        queryVector: queryEmbedding,
                        numCandidates: Math.max(limit * 15, 60),
                        limit,
                        filter
                    }
                },
                {
                    $project: {
                        _id: 1,
                        bookId: 1,
                        technology: 1,
                        technologyNormalized: 1,
                        bookTitle: 1,
                        author: 1,
                        edition: 1,
                        chapter: 1,
                        pageNumber: 1,
                        chunkIndex: 1,
                        chunkText: 1,
                        createdAt: 1,
                        score: { $meta: 'vectorSearchScore' }
                    }
                }
            ];

            const rawResults = await prisma.knowledgeBookChunk.aggregateRaw({ pipeline });
            if (Array.isArray(rawResults) && rawResults.length > 0) {
                const formatted = rawResults
                    .map(doc => ({
                        id: doc._id?.$oid || String(doc._id || ''),
                        bookId: doc.bookId?.$oid || String(doc.bookId || ''),
                        technology: doc.technology || '',
                        technologyNormalized: doc.technologyNormalized || '',
                        bookTitle: doc.bookTitle || '',
                        author: doc.author || '',
                        edition: doc.edition || '',
                        chapter: doc.chapter || 'General Reference',
                        pageNumber: Number(doc.pageNumber) || 1,
                        chunkIndex: Number(doc.chunkIndex) || 0,
                        chunkText: doc.chunkText || '',
                        score: typeof doc.score === 'number' ? doc.score : 0
                    }))
                    .filter(item => item.score >= minScore);

                return {
                    chunks: formatted,
                    searchMode: 'atlas_vector_search'
                };
            }

            // If Atlas returned 0 docs, double check if active chunks exist (index may still be building or not yet created)
            const activeCount = await prisma.knowledgeBookChunk.count({
                where: {
                    isActive: true,
                    technologyNormalized: { in: techList }
                }
            });

            if (activeCount === 0) {
                return { chunks: [], searchMode: 'atlas_vector_search' };
            }
            console.warn(
                `[VectorSearch] Atlas index "${VECTOR_INDEX_NAME}" returned 0 results despite ${activeCount} active chunks. Falling back to cosine similarity until Atlas Vector Search index is active.`
            );
        } catch (err) {
            console.warn(
                `[VectorSearch] Atlas $vectorSearch unavailable (${err.message}). Using cosine similarity fallback.`
            );
        }
    }

    // 2. Cosine similarity fallback over active chunks in MongoDB Atlas
    const candidateChunks = await prisma.knowledgeBookChunk.findMany({
        where: {
            isActive: true,
            technologyNormalized: { in: techList }
        },
        select: {
            id: true,
            bookId: true,
            technology: true,
            technologyNormalized: true,
            bookTitle: true,
            author: true,
            edition: true,
            chapter: true,
            pageNumber: true,
            chunkIndex: true,
            chunkText: true,
            embedding: true
        },
        take: 2500
    });

    if (!candidateChunks || candidateChunks.length === 0) {
        return { chunks: [], searchMode: 'cosine_fallback' };
    }

    const scored = candidateChunks
        .map(chunk => ({
            id: String(chunk.id),
            bookId: String(chunk.bookId),
            technology: chunk.technology,
            technologyNormalized: chunk.technologyNormalized,
            bookTitle: chunk.bookTitle,
            author: chunk.author,
            edition: chunk.edition || '',
            chapter: chunk.chapter || 'General Reference',
            pageNumber: Number(chunk.pageNumber) || 1,
            chunkIndex: Number(chunk.chunkIndex) || 0,
            chunkText: chunk.chunkText,
            score: cosineSimilarity(queryEmbedding, chunk.embedding)
        }))
        .filter(item => item.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return {
        chunks: scored,
        searchMode: 'cosine_fallback'
    };
}

/**
 * Attempt to inspect or create/update the MongoDB Atlas Vector Search index via $runCommandRaw
 */
async function ensureAtlasVectorSearchIndex(dimensions) {
    const indexDef = getAtlasVectorIndexDefinition(dimensions);
    try {
        const res = await prisma.$runCommandRaw({
            createSearchIndexes: 'knowledge_book_chunks',
            indexes: [indexDef]
        });
        return {
            success: true,
            indexName: VECTOR_INDEX_NAME,
            dimensions: indexDef.definition.fields[0].numDimensions,
            response: res
        };
    } catch (err) {
        const msg = String(err?.message || '');
        if (/already exists|IndexAlreadyExists/i.test(msg)) {
            try {
                const updateRes = await prisma.$runCommandRaw({
                    updateSearchIndex: 'knowledge_book_chunks',
                    name: VECTOR_INDEX_NAME,
                    definition: indexDef.definition
                });
                return {
                    success: true,
                    updated: true,
                    indexName: VECTOR_INDEX_NAME,
                    dimensions: indexDef.definition.fields[0].numDimensions,
                    response: updateRes
                };
            } catch (updateErr) {
                return {
                    success: false,
                    indexName: VECTOR_INDEX_NAME,
                    dimensions: indexDef.definition.fields[0].numDimensions,
                    message: `${msg} (Update attempt: ${updateErr.message})`,
                    definition: indexDef
                };
            }
        }
        return {
            success: false,
            indexName: VECTOR_INDEX_NAME,
            dimensions: indexDef.definition.fields[0].numDimensions,
            message: msg,
            definition: indexDef
        };
    }
}

module.exports = {
    VECTOR_INDEX_NAME,
    getConfiguredVectorDimensions,
    cosineSimilarity,
    getAtlasVectorIndexDefinition,
    searchRelevantBookChunks,
    ensureAtlasVectorSearchIndex
};
