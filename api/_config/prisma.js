const { PrismaClient } = require('@prisma/client');

let realPrisma = null;
try {
    if (process.env.DATABASE_URL) {
        realPrisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        });
    }
} catch (err) {
    console.warn('[Prisma] Could not initialize real PrismaClient:', err.message);
    realPrisma = null;
}

// In-Memory Seed Database Fallback
const memoryStore = {
    categories: [
        { id: 1, name: 'HTML' },
        { id: 2, name: 'CSS' },
        { id: 3, name: 'JavaScript' },
        { id: 4, name: 'React' },
        { id: 5, name: 'Node.js' },
        { id: 6, name: 'Python' },
    ],
    questions: [
        // HTML
        { id: 1, category: 'HTML', questionText: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Text Modern Language', 'Hyperlink Text Mark Language', 'Home Tool Markup Language'], correctAnswer: 'Hyper Text Markup Language', difficulty: 'beginner', createdAt: new Date() },
        { id: 2, category: 'HTML', questionText: 'Which HTML5 element specifies a footer for a document or section?', options: ['<footer>', '<bottom>', '<section>', '<aside>'], correctAnswer: '<footer>', difficulty: 'intermediate', createdAt: new Date() },
        { id: 3, category: 'HTML', questionText: 'Which attribute specifies that an input field must be filled out before submitting?', options: ['required', 'validate', 'must-fill', 'placeholder'], correctAnswer: 'required', difficulty: 'expert', createdAt: new Date() },
        // CSS
        { id: 4, category: 'CSS', questionText: 'Which CSS property changes the text color of an element?', options: ['color', 'font-color', 'text-color', 'fg-color'], correctAnswer: 'color', difficulty: 'beginner', createdAt: new Date() },
        { id: 5, category: 'CSS', questionText: 'What is the default display value for a <div> element?', options: ['block', 'inline', 'flex', 'grid'], correctAnswer: 'block', difficulty: 'intermediate', createdAt: new Date() },
        { id: 6, category: 'CSS', questionText: 'Which CSS module provides a two-dimensional layout system with rows and columns?', options: ['Grid', 'Flexbox', 'Float', 'Position'], correctAnswer: 'Grid', difficulty: 'expert', createdAt: new Date() },
        // JavaScript
        { id: 7, category: 'JavaScript', questionText: 'Which operator is used for strict equality comparison in JavaScript?', options: ['===', '==', '=', '!= ='], correctAnswer: '===', difficulty: 'beginner', createdAt: new Date() },
        { id: 8, category: 'JavaScript', questionText: 'Which method adds one or more elements to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correctAnswer: 'push()', difficulty: 'intermediate', createdAt: new Date() },
        { id: 9, category: 'JavaScript', questionText: 'What is the result of typeof NaN in JavaScript?', options: ['number', 'NaN', 'undefined', 'object'], correctAnswer: 'number', difficulty: 'expert', createdAt: new Date() },
        // React
        { id: 10, category: 'React', questionText: 'Which hook is used to manage local state in functional components?', options: ['useState', 'useEffect', 'useContext', 'useRef'], correctAnswer: 'useState', difficulty: 'beginner', createdAt: new Date() },
        { id: 11, category: 'React', questionText: 'What prop is required when rendering a list of elements in React?', options: ['key', 'id', 'index', 'ref'], correctAnswer: 'key', difficulty: 'intermediate', createdAt: new Date() },
        { id: 12, category: 'React', questionText: 'Which hook allows you to memoize expensive computations in React?', options: ['useMemo', 'useCallback', 'useRef', 'useReducer'], correctAnswer: 'useMemo', difficulty: 'expert', createdAt: new Date() },
        // Node.js
        { id: 13, category: 'Node.js', questionText: 'Which core module is used for creating HTTP servers in Node.js?', options: ['http', 'fs', 'path', 'net'], correctAnswer: 'http', difficulty: 'beginner', createdAt: new Date() },
        { id: 14, category: 'Node.js', questionText: 'Which object provides environment variables in Node.js?', options: ['process.env', 'global.env', 'window.env', 'env'], correctAnswer: 'process.env', difficulty: 'intermediate', createdAt: new Date() },
        { id: 15, category: 'Node.js', questionText: 'What model does Node.js use for asynchronous non-blocking I/O?', options: ['Event Loop', 'Multi-threading', 'Worker Threads', 'Blocking Queue'], correctAnswer: 'Event Loop', difficulty: 'expert', createdAt: new Date() },
        // Python
        { id: 16, category: 'Python', questionText: 'Which keyword is used to define a function in Python?', options: ['def', 'function', 'func', 'define'], correctAnswer: 'def', difficulty: 'beginner', createdAt: new Date() },
        { id: 17, category: 'Python', questionText: 'Which data structure in Python is mutable and ordered?', options: ['List', 'Tuple', 'String', 'FrozenSet'], correctAnswer: 'List', difficulty: 'intermediate', createdAt: new Date() },
        { id: 18, category: 'Python', questionText: 'Which built-in function pairs elements from multiple iterables into tuples?', options: ['zip()', 'map()', 'filter()', 'enumerate()'], correctAnswer: 'zip()', difficulty: 'expert', createdAt: new Date() },
    ],
    users: [
        { id: 1, name: 'Candidate User', email: 'user@example.com', password: '$2a$10$e8T/k.S3mD6pWw9G0487E.G0c5sA1L3xY7E5tN2S1O3.L9K5K3', role: 'candidate', resetToken: null, resetTokenExpiry: null, createdAt: new Date() },
        { id: 2, name: 'Admin User', email: 'admin@example.com', password: '$2a$10$e8T/k.S3mD6pWw9G0487E.G0c5sA1L3xY7E5tN2S1O3.L9K5K3', role: 'admin', resetToken: null, resetTokenExpiry: null, createdAt: new Date() },
    ],
    quizResults: [],
};

function createMockHandler(modelName) {
    return {
        create: async ({ data }) => {
            const list = memoryStore[modelName] || [];
            const newObj = {
                id: list.length + 1,
                ...data,
                createdAt: new Date(),
            };
            list.push(newObj);
            return newObj;
        },
        findUnique: async ({ where }) => {
            const list = memoryStore[modelName] || [];
            return list.find(item => {
                if (where.id !== undefined) return item.id === where.id;
                if (where.email !== undefined) return item.email === where.email;
                return false;
            }) || null;
        },
        findFirst: async ({ where }) => {
            const list = memoryStore[modelName] || [];
            return list.find(item => {
                if (where.resetToken && item.resetToken !== where.resetToken) return false;
                return true;
            }) || null;
        },
        findMany: async ({ where, orderBy } = {}) => {
            let list = memoryStore[modelName] || [];
            if (where) {
                list = list.filter(item => {
                    if (where.category) {
                        const cat = typeof where.category === 'object' ? where.category.equals : where.category;
                        if (cat && item.category?.toLowerCase() !== cat?.toLowerCase()) return false;
                    }
                    if (where.difficulty) {
                        if (item.difficulty?.toLowerCase() !== where.difficulty?.toLowerCase()) return false;
                    }
                    if (where.userId !== undefined && item.userId !== where.userId) return false;
                    return true;
                });
            }
            if (orderBy && orderBy.createdAt === 'desc') {
                list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (orderBy && orderBy.name === 'asc') {
                list = [...list].sort((a, b) => a.name.localeCompare(b.name));
            }
            return list;
        },
        update: async ({ where, data }) => {
            const list = memoryStore[modelName] || [];
            const item = list.find(i => {
                if (where.id !== undefined) return i.id === where.id;
                if (where.email !== undefined) return i.email === where.email;
                return false;
            });
            if (item) Object.assign(item, data);
            return item || {};
        },
        delete: async ({ where }) => {
            const list = memoryStore[modelName] || [];
            const idx = list.findIndex(i => i.id === where.id);
            if (idx !== -1) list.splice(idx, 1);
            return { count: 1 };
        },
        count: async ({ where } = {}) => {
            let list = memoryStore[modelName] || [];
            if (where && where.createdAt && where.createdAt.gte) {
                list = list.filter(i => new Date(i.createdAt) >= new Date(where.createdAt.gte));
            }
            return list.length;
        },
        groupBy: async ({ where }) => {
            let list = memoryStore[modelName] || [];
            if (where && where.userId !== undefined) {
                list = list.filter(i => i.userId === where.userId);
            }
            const grouped = {};
            list.forEach(i => {
                if (!grouped[i.category]) grouped[i.category] = { maxPct: 0, count: 0 };
                grouped[i.category].count += 1;
                if (i.percentage > grouped[i.category].maxPct) grouped[i.category].maxPct = i.percentage;
            });
            return Object.keys(grouped).map(cat => ({
                category: cat,
                _max: { percentage: grouped[cat].maxPct },
                _count: { _all: grouped[cat].count },
            }));
        },
    };
}

const mockPrisma = new Proxy({}, {
    get(_, prop) {
        return createMockHandler(prop);
    }
});

const prismaProxy = new Proxy({}, {
    get(_, modelProp) {
        return new Proxy({}, {
            get(_, methodProp) {
                return async (...args) => {
                    if (realPrisma && realPrisma[modelProp] && typeof realPrisma[modelProp][methodProp] === 'function') {
                        try {
                            return await realPrisma[modelProp][methodProp](...args);
                        } catch (err) {
                            console.warn(`[Prisma DB Query Error on ${modelProp}.${methodProp}]: ${err.message}. Falling back to in-memory store.`);
                        }
                    }
                    // Fallback to mockPrisma
                    return await mockPrisma[modelProp][methodProp](...args);
                };
            }
        });
    }
});

module.exports = prismaProxy;

