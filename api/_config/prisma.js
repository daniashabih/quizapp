const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

let prismaInstance = null;

if (process.env.DATABASE_URL) {
    try {
        prismaInstance = new PrismaClient();
        console.log('[Database] Real PrismaClient initialized with DATABASE_URL.');
    } catch (err) {
        console.warn('[Database] Failed to initialize PrismaClient:', err.message);
    }
}

// In-memory fallback store for development without an active database connection
const memoryStore = {
    user: [],
    category: [],
    question: [],
    quizResult: [],
};

function createMemoryHandler(modelName) {
    return {
        create: async ({ data }) => {
            const list = memoryStore[modelName] || [];
            const newObj = { id: list.length + 1, ...data, createdAt: new Date() };
            list.push(newObj);
            return newObj;
        },

        findUnique: async ({ where }) => {
            const list = memoryStore[modelName] || [];
            return list.find(item => (where.id !== undefined && item.id === where.id) || (where.email !== undefined && item.email === where.email)) || null;
        },

        findFirst: async ({ where }) => {
            const list = memoryStore[modelName] || [];
            return list.find(item => where.resetToken && item.resetToken === where.resetToken) || null;
        },

        findMany: async ({ where, _orderBy } = {}) => {
            let list = memoryStore[modelName] || [];
            if (where) {
                if (where.userId !== undefined) {
                    list = list.filter(item => item.userId === where.userId);
                }
                if (where.difficulty) {
                    list = list.filter(item => item.difficulty === where.difficulty);
                }
            }
            return list;
        },

        update: async ({ where, data }) => {
            const list = memoryStore[modelName] || [];
            const item = list.find(i => (where.id !== undefined && i.id === where.id) || (where.email !== undefined && i.email === where.email));
            if (item) Object.assign(item, data);
            return item || {};
        },

        delete: async ({ where }) => {
            const list = memoryStore[modelName] || [];
            const idx = list.findIndex(i => i.id === where.id);
            if (idx !== -1) list.splice(idx, 1);
            return { count: 1 };
        },

        count: async ({ _where } = {}) => {
            return (memoryStore[modelName] || []).length;
        },

        groupBy: async ({ _where } = {}) => {
            const list = memoryStore[modelName] || [];
            const grouped = {};
            list.forEach(row => {
                const cat = row.category;
                const pct = parseFloat(row.percentage) || 0;
                if (!grouped[cat]) grouped[cat] = { maxPct: 0, count: 0 };
                grouped[cat].count += 1;
                if (pct > grouped[cat].maxPct) grouped[cat].maxPct = pct;
            });
            return Object.keys(grouped).map(cat => ({
                category: cat,
                _max: { percentage: grouped[cat].maxPct },
                _count: { _all: grouped[cat].count },
            }));
        }
    };
}

const prismaProxy = new Proxy({}, {
    get(_, modelProp) {
        if (prismaInstance && prismaInstance[modelProp]) {
            const targetModel = prismaInstance[modelProp];
            return new Proxy(targetModel, {
                get(target, methodProp) {
                    if (typeof target[methodProp] === 'function') {
                        return async (...args) => {
                            try {
                                return await target[methodProp](...args);
                            } catch (err) {
                                // If database is unreachable (e.g. connection lost), fallback to memory store
                                if (err.code && err.code.startsWith('P1')) {
                                    console.warn(`[Database Warning] Prisma query '${modelProp}.${methodProp}' database connection issue (${err.code}). Using fallback store.`);
                                    const fallback = createMemoryHandler(modelProp);
                                    if (fallback && typeof fallback[methodProp] === 'function') {
                                        return await fallback[methodProp](...args);
                                    }
                                }
                                throw err;
                            }
                        };
                    }
                    return target[methodProp];
                }
            });
        }
        return createMemoryHandler(modelProp);
    }
});

module.exports = prismaProxy;
