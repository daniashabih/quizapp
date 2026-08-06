const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

let supabase = null;
if (process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY)) {
    try {
        supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY
        );
        console.log('[Database] Supabase client initialized as primary database provider.');
    } catch (err) {
        console.warn('[Database] Failed to initialize Supabase client:', err.message);
    }
}

// Memory fallback store
const memoryStore = {
    categories: [],
    questions: [],
    users: [],
    quizResults: [],
};

// Helper transformers between Prisma conventions and Supabase DB tables
const tableMap = {
    user: 'users',
    category: 'categories',
    question: 'questions',
    quizResult: 'quiz_results',
};

function toSupabasePayload(modelName, data) {
    if (!data) return {};
    const payload = { ...data };
    if (modelName === 'user') {
        if (payload.resetToken !== undefined) { payload.reset_token = payload.resetToken; delete payload.resetToken; }
        if (payload.resetTokenExpiry !== undefined) { payload.reset_token_expiry = payload.resetTokenExpiry; delete payload.resetTokenExpiry; }
        if (payload.createdAt !== undefined) { payload.created_at = payload.createdAt; delete payload.createdAt; }
    } else if (modelName === 'question') {
        if (payload.questionText !== undefined) { payload.question_text = payload.questionText; delete payload.questionText; }
        if (payload.correctAnswer !== undefined) { payload.correct_answer = payload.correctAnswer; delete payload.correctAnswer; }
        if (payload.createdAt !== undefined) { payload.created_at = payload.createdAt; delete payload.createdAt; }
    } else if (modelName === 'quizResult') {
        if (payload.userId !== undefined) { payload.user_id = payload.userId; delete payload.userId; }
        if (payload.createdAt !== undefined) { payload.created_at = payload.createdAt; delete payload.createdAt; }
    }
    return payload;
}

function fromSupabaseRow(modelName, row) {
    if (!row) return null;
    const res = { ...row };
    if (modelName === 'user') {
        if (res.reset_token !== undefined) res.resetToken = res.reset_token;
        if (res.reset_token_expiry !== undefined) res.resetTokenExpiry = res.reset_token_expiry;
        if (res.created_at !== undefined) res.createdAt = new Date(res.created_at);
    } else if (modelName === 'question') {
        if (res.question_text !== undefined) res.questionText = res.question_text;
        if (res.correct_answer !== undefined) res.correctAnswer = res.correct_answer;
        if (res.created_at !== undefined) res.createdAt = new Date(res.created_at);
    } else if (modelName === 'quizResult') {
        if (res.user_id !== undefined) res.userId = res.user_id;
        if (res.created_at !== undefined) res.createdAt = new Date(res.created_at);
    }
    return res;
}

function createSupabaseHandler(modelName) {
    const tableName = tableMap[modelName] || modelName;

    return {
        create: async ({ data }) => {
            if (supabase) {
                const payload = toSupabasePayload(modelName, data);
                const { data: inserted, error } = await supabase.from(tableName).insert([payload]).select().single();
                if (error) {
                    console.error(`[Supabase Error on ${tableName}.insert]:`, error.message);
                    throw error;
                }
                return fromSupabaseRow(modelName, inserted);
            }
            // Memory Fallback
            const list = memoryStore[modelName] || [];
            const newObj = { id: list.length + 1, ...data, createdAt: new Date() };
            list.push(newObj);
            return newObj;
        },

        findUnique: async ({ where }) => {
            if (supabase) {
                let query = supabase.from(tableName).select('*');
                if (where.id !== undefined) query = query.eq('id', where.id);
                else if (where.email !== undefined) query = query.eq('email', where.email);
                
                const { data, error } = await query.maybeSingle();
                if (error) {
                    console.error(`[Supabase Error on ${tableName}.findUnique]:`, error.message);
                    throw error;
                }
                return fromSupabaseRow(modelName, data);
            }
            const list = memoryStore[modelName] || [];
            return list.find(item => (where.id !== undefined && item.id === where.id) || (where.email !== undefined && item.email === where.email)) || null;
        },

        findFirst: async ({ where }) => {
            if (supabase) {
                let query = supabase.from(tableName).select('*');
                if (where.resetToken) query = query.eq('reset_token', where.resetToken);
                if (where.email) query = query.eq('email', where.email);
                
                const { data, error } = await query.limit(1).maybeSingle();
                if (error) {
                    console.error(`[Supabase Error on ${tableName}.findFirst]:`, error.message);
                    throw error;
                }
                return fromSupabaseRow(modelName, data);
            }
            const list = memoryStore[modelName] || [];
            return list.find(item => where.resetToken && item.resetToken === where.resetToken) || null;
        },

        findMany: async ({ where, orderBy } = {}) => {
            if (supabase) {
                let query = supabase.from(tableName).select('*');
                if (where) {
                    if (where.category) {
                        const cat = typeof where.category === 'object' ? (where.category.equals || where.category) : where.category;
                        if (cat) query = query.ilike('category', cat);
                    }
                    if (where.difficulty) {
                        query = query.eq('difficulty', where.difficulty.toLowerCase());
                    }
                    if (where.userId !== undefined) {
                        query = query.eq('user_id', where.userId);
                    }
                }
                if (orderBy) {
                    if (orderBy.createdAt === 'desc') query = query.order('created_at', { ascending: false });
                    else if (orderBy.createdAt === 'asc') query = query.order('created_at', { ascending: true });
                    else if (orderBy.name === 'asc') query = query.order('name', { ascending: true });
                }
                const { data, error } = await query;
                if (error) {
                    console.error(`[Supabase Error on ${tableName}.findMany]:`, error.message);
                    throw error;
                }
                return (data || []).map(row => fromSupabaseRow(modelName, row));
            }
            let list = memoryStore[modelName] || [];
            return list;
        },

        update: async ({ where, data }) => {
            if (supabase) {
                const payload = toSupabasePayload(modelName, data);
                let query = supabase.from(tableName).update(payload);
                if (where.id !== undefined) query = query.eq('id', where.id);
                else if (where.email !== undefined) query = query.eq('email', where.email);

                const { data: updated, error } = await query.select().maybeSingle();
                if (error) {
                    console.error(`[Supabase Error on ${tableName}.update]:`, error.message);
                    throw error;
                }
                return fromSupabaseRow(modelName, updated);
            }
            const list = memoryStore[modelName] || [];
            const item = list.find(i => (where.id !== undefined && i.id === where.id) || (where.email !== undefined && i.email === where.email));
            if (item) Object.assign(item, data);
            return item || {};
        },

        delete: async ({ where }) => {
            if (supabase) {
                let query = supabase.from(tableName).delete();
                if (where.id !== undefined) query = query.eq('id', where.id);
                
                const { error } = await query;
                if (error) {
                    console.error(`[Supabase Error on ${tableName}.delete]:`, error.message);
                    throw error;
                }
                return { count: 1 };
            }
            const list = memoryStore[modelName] || [];
            const idx = list.findIndex(i => i.id === where.id);
            if (idx !== -1) list.splice(idx, 1);
            return { count: 1 };
        },

        count: async ({ where } = {}) => {
            if (supabase) {
                let query = supabase.from(tableName).select('id', { count: 'exact', head: true });
                if (where && where.createdAt && where.createdAt.gte) {
                    query = query.gte('created_at', where.createdAt.gte.toISOString());
                }
                const { count, error } = await query;
                if (error) {
                    console.error(`[Supabase Error on ${tableName}.count]:`, error.message);
                    return 0;
                }
                return count || 0;
            }
            return (memoryStore[modelName] || []).length;
        },

        groupBy: async ({ where }) => {
            if (supabase) {
                let query = supabase.from(tableName).select('category, percentage');
                if (where && where.userId !== undefined) {
                    query = query.eq('user_id', where.userId);
                }
                const { data, error } = await query;
                if (error) {
                    console.error(`[Supabase Error on ${tableName}.groupBy]:`, error.message);
                    return [];
                }
                const grouped = {};
                (data || []).forEach(row => {
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
            return [];
        }
    };
}

const prismaProxy = new Proxy({}, {
    get(_, modelProp) {
        return createSupabaseHandler(modelProp);
    }
});

module.exports = prismaProxy;
