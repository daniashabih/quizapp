const prisma = require('../_config/prisma');
const { AGILE_DEVOPS_QUESTIONS, AGILE_DEVOPS_SESSIONS } = require('./agileDevopsQuestionsData');
const { CSHARP_QUIZ_QUESTIONS, CSHARP_QUIZ_SESSIONS } = require('./csharpQuizQuestionsData');
const {
    getCanonicalAliasGroupKey,
    getCategoryVariations
} = require('../_utils/categoryMatching');

const CSHARP_SESSION_NUMBERS = Object.keys(CSHARP_QUIZ_SESSIONS)
    .map(s => parseInt(s, 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

const isAgileDevOpsCategory = (category) =>
    getCanonicalAliasGroupKey(category) === getCanonicalAliasGroupKey('Agile & DevOps');

const REACTJS_SESSIONS = {
    1: 'Introduction to ReactJS',
    2: 'ReactJS Components',
    3: 'JSX Elements',
    4: 'Event Handling in ReactJS',
    5: 'ReactJS Router',
    6: 'Styling React Elements',
    7: 'ReactJS Component Lifecycle',
    8: 'Creating a CRUD Application Using ReactJS Forms'
};

const isReactJsCategory = (category) => {
    const lower = String(category || '').trim().toLowerCase();
    return lower === 'react.js' || lower === 'react js' || lower === 'reactjs';
};

const MATERIAL_UI_SESSIONS = {
    1: 'Introduction to UI',
    2: 'Introduction to Material Design',
    3: 'Creating a Material Design Type and Component System'
};

const isMaterialUiCategory = (category) => {
    const lower = String(category || '').trim().toLowerCase();
    return (
        lower === 'material ui' ||
        lower === 'material-ui' ||
        lower === 'materialui' ||
        lower === 'mui' ||
        lower === 'mterial ui'
    );
};

const MONGODB_SESSIONS = {
    1: 'Introduction to NoSQL Databases',
    2: 'MongoDB - A Database for the Modern Web',
    3: 'CRUD Operations in MongoDB',
    4: 'Indexing and Aggregation in MongoDB',
    5: 'Replication and Sharding in MongoDB',
    6: 'Developing Java and Node JS Applications with MongoDB',
    7: 'Administration of MongoDB Cluster Operations'
};

const isMongoDbCategory = (category) => {
    const lower = String(category || '').trim().toLowerCase();
    return (
        lower === 'mongodb' ||
        lower === 'mongo db' ||
        lower === 'mongo'
    );
};

const AZURE_SESSIONS = {
    1: 'Introduction to Azure Cloud Computing',
    2: 'Understanding Microsoft Azure Cloud Services',
    3: 'Data Access Technologies in Azure',
    4: 'Data Access Using ADO.NET',
    5: 'Data Access Using Entity Framework',
    6: 'Data Access Using Third-party Databases and Azure Storage Services',
    7: 'Design and Implementation of Web API',
    8: 'Security in Web API',
    9: 'Hosting and Consuming Web API',
    10: 'Introduction to WCF Services',
    11: 'Implementing Azure Serverless Web Services and API Management',
    12: 'Traffic Management and Monitoring Strategies for Web Services',
    13: 'Configuring Web Applications for Deployment',
    14: 'Deploying Web Applications and Services',
    15: 'Working with Shared Assemblies'
};

const isAzureCategory = (category) => {
    const lower = String(category || '').trim().toLowerCase();
    return (
        lower === 'azure' ||
        lower === 'microsoft azure' ||
        lower === 'ms azure' ||
        lower === 'windows azure'
    );
};

const isWordPressCategory = (category) => {
    const lower = String(category || '').trim().toLowerCase();
    return lower === 'wordpress' || lower === 'word press';
};

const parseOptions = (opts) => {
    if (Array.isArray(opts)) return opts;
    if (typeof opts === 'string') {
        try { return JSON.parse(opts); } catch { return []; }
    }
    return [];
};

const normalizeQuestionText = (text) => {
    return String(text || '')
        .trim()
        .toLowerCase()
        .replace(/_+/g, '_')
        .replace(/\s+/g, ' ');
};

const Question = {
    normalizeQuestionText,
    getCategoryVariations,

    findDuplicate: async ({ category, question_text, excludeId } = {}) => {
        const target = normalizeQuestionText(question_text);
        if (!category || !target) return null;

        let rows = [];
        try {
            const variations = getCategoryVariations(category);
            const where = variations.length > 1
                ? { OR: variations.map(v => ({ category: { equals: v, mode: 'insensitive' } })) }
                : { category: { equals: String(category).trim(), mode: 'insensitive' } };

            rows = await prisma.question.findMany({
                where,
                select: {
                    id: true,
                    category: true,
                    session: true,
                    questionText: true
                }
            });
        } catch {
            // DB fallback
        }

        const excludeStr = excludeId ? String(excludeId) : null;
        for (const r of rows) {
            if (excludeStr && String(r.id) === excludeStr) continue;
            if (normalizeQuestionText(r.questionText) === target) {
                return r;
            }
        }

        const catLower = String(category || '').trim().toLowerCase();
        const fallbackList = isAgileDevOpsCategory(category)
            ? AGILE_DEVOPS_QUESTIONS
            : (catLower === 'c#' || catLower === 'csharp' || catLower === 'c sharp')
                ? CSHARP_QUIZ_QUESTIONS
                : [];

        for (const q of fallbackList) {
            if (excludeStr && String(q.id) === excludeStr) continue;
            if (normalizeQuestionText(q.questionText) === target) {
                return q;
            }
        }

        return null;
    },

    create: async (data) => {
        const {
            category,
            session,
            session_title,
            sessionTitle,
            topic,
            difficulty,
            source_page,
            sourcePage,
            source_book,
            sourceBook,
            question_text,
            options,
            correct_answer,
            explanation
        } = data;
        const serializedOptions = typeof options === 'string' ? options : JSON.stringify(Array.isArray(options) ? options : []);
        const sessionNum = parseInt(session, 10) || 1;
        const resolvedSessionTitle = String(session_title ?? sessionTitle ?? '').trim();
        const resolvedTopic = String(topic ?? '').trim();
        const resolvedDifficulty = String(difficulty ?? '').trim();
        const resolvedSourcePage = source_page !== undefined && source_page !== null
            ? String(source_page).trim()
            : (sourcePage !== undefined && sourcePage !== null ? String(sourcePage).trim() : '');
        const resolvedSourceBook = String(source_book ?? sourceBook ?? '').trim();

        const result = await prisma.question.create({
            data: {
                category,
                session: sessionNum,
                sessionTitle: resolvedSessionTitle,
                topic: resolvedTopic,
                difficulty: resolvedDifficulty,
                sourcePage: resolvedSourcePage,
                sourceBook: resolvedSourceBook,
                questionText: question_text,
                options: serializedOptions,
                correctAnswer: correct_answer,
                explanation: explanation || ''
            }
        });
        return result.id;
    },

    getAll: async () => {
        let rows = [];
        try {
            rows = await prisma.question.findMany({
                orderBy: { createdAt: 'desc' }
            });
        } catch {
            // DB fallback
        }

        const existingIds = new Set(rows.map(r => r.id));
        const existingTextKeys = new Set(
            rows.map(r => `${String(r.category || '').trim().toLowerCase()}|${r.session || 1}|${String(r.questionText || '').trim().toLowerCase()}`)
        );
        const merged = rows.map(r => ({
            ...r,
            session: r.session || 1,
            sessionTitle: r.sessionTitle || '',
            topic: r.topic || '',
            difficulty: r.difficulty || '',
            sourcePage: r.sourcePage || '',
            source_page: r.sourcePage || '',
            sourceBook: r.sourceBook || '',
            source_book: r.sourceBook || '',
            options: parseOptions(r.options),
            question_text: r.questionText,
            correct_answer: r.correctAnswer,
            explanation: r.explanation || '',
            created_at: r.createdAt
        }));

        for (const q of AGILE_DEVOPS_QUESTIONS) {
            const key = `${String(q.category || '').trim().toLowerCase()}|${q.session || 1}|${String(q.questionText || '').trim().toLowerCase()}`;
            if (!existingIds.has(q.id) && !existingTextKeys.has(key)) {
                merged.push({
                    id: q.id,
                    category: q.category,
                    session: q.session,
                    sessionTitle: q.sessionTitle,
                    options: parseOptions(q.options),
                    question_text: q.questionText,
                    correct_answer: q.correctAnswer,
                    explanation: q.explanation || '',
                    created_at: new Date()
                });
            }
        }

        for (const q of CSHARP_QUIZ_QUESTIONS) {
            const key = `${String(q.category || '').trim().toLowerCase()}|${q.session || 1}|${String(q.questionText || '').trim().toLowerCase()}`;
            if (!existingIds.has(q.id) && !existingTextKeys.has(key)) {
                merged.push({
                    id: q.id,
                    category: q.category,
                    session: q.session,
                    sessionTitle: CSHARP_QUIZ_SESSIONS[q.session] || `Session ${q.session}`,
                    options: parseOptions(q.options),
                    question_text: q.questionText,
                    correct_answer: q.correctAnswer,
                    explanation: q.explanation || '',
                    created_at: new Date()
                });
            }
        }

        return merged;
    },

    getFiltered: async ({ category, session } = {}) => {
        let rows = [];
        try {
            const where = {};
            if (category) {
                const variations = getCategoryVariations(category);
                if (variations.length > 1) {
                    where.OR = variations.map(v => ({ category: { equals: v, mode: 'insensitive' } }));
                } else {
                    where.category = { equals: category, mode: 'insensitive' };
                }
            }
            if (session !== undefined && session !== null && session !== '' && session !== 'all' && !isNaN(parseInt(session, 10)) && parseInt(session, 10) > 0) {
                where.session = parseInt(session, 10);
            }

            rows = await prisma.question.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });
        } catch {
            // DB fallback
        }

        const isAgileDevOps = isAgileDevOpsCategory(category);

        const isCSharp = category && (
            category.toLowerCase() === 'c#' ||
            category.toLowerCase() === 'csharp' ||
            category.toLowerCase() === 'c sharp'
        );

        if (rows.length === 0 && (isAgileDevOps || isCSharp || !category)) {
            let filtered = isCSharp ? CSHARP_QUIZ_QUESTIONS : AGILE_DEVOPS_QUESTIONS;
            if (session !== undefined && session !== null && session !== '' && session !== 'all' && !isNaN(parseInt(session, 10)) && parseInt(session, 10) > 0) {
                const sNum = parseInt(session, 10);
                filtered = filtered.filter(q => q.session === sNum);
            }
            if (isAgileDevOps || isCSharp) {
                return filtered.map(q => ({
                    id: q.id,
                    category: q.category,
                    session: q.session,
                    sessionTitle: isCSharp ? (CSHARP_QUIZ_SESSIONS[q.session] || `Session ${q.session}`) : q.sessionTitle,
                    options: parseOptions(q.options),
                    question_text: q.questionText,
                    correct_answer: q.correctAnswer,
                    explanation: q.explanation || '',
                    created_at: new Date()
                }));
            }
        }

        return rows.map(r => {
            const sNum = r.session || 1;
            const targetCat = r.category || category;
            let sessionTitle = r.sessionTitle ? String(r.sessionTitle).trim() : '';
            if (!sessionTitle) {
                if (isReactJsCategory(targetCat) && REACTJS_SESSIONS[sNum]) {
                    sessionTitle = REACTJS_SESSIONS[sNum];
                } else if (isMaterialUiCategory(targetCat) && MATERIAL_UI_SESSIONS[sNum]) {
                    sessionTitle = MATERIAL_UI_SESSIONS[sNum];
                } else if (isMongoDbCategory(targetCat) && MONGODB_SESSIONS[sNum]) {
                    sessionTitle = MONGODB_SESSIONS[sNum];
                } else if (isAzureCategory(targetCat) && AZURE_SESSIONS[sNum]) {
                    sessionTitle = AZURE_SESSIONS[sNum];
                }
            }
            return {
                ...r,
                session: sNum,
                ...(sessionTitle ? { sessionTitle } : {}),
                topic: r.topic || '',
                difficulty: r.difficulty || '',
                sourcePage: r.sourcePage || '',
                source_page: r.sourcePage || '',
                sourceBook: r.sourceBook || '',
                source_book: r.sourceBook || '',
                options: parseOptions(r.options),
                question_text: r.questionText,
                correct_answer: r.correctAnswer,
                created_at: r.createdAt
            };
        });
    },

    getSessionsByCategory: async (category) => {
        const isAgileDevOps = isAgileDevOpsCategory(category);

        const isCSharp = category && (
            category.toLowerCase() === 'c#' ||
            category.toLowerCase() === 'csharp' ||
            category.toLowerCase() === 'c sharp'
        );

        const isReactJs = isReactJsCategory(category);
        const isMaterialUi = isMaterialUiCategory(category);
        const isMongoDb = isMongoDbCategory(category);
        const isAzure = isAzureCategory(category);

        let rows = [];
        try {
            const where = {};
            if (category) {
                const variations = getCategoryVariations(category);
                if (variations.length > 1) {
                    where.OR = variations.map(v => ({ category: { equals: v, mode: 'insensitive' } }));
                } else {
                    where.category = { equals: category, mode: 'insensitive' };
                }
            }

            try {
                rows = await prisma.question.findMany({
                    where,
                    select: { session: true, sessionTitle: true }
                });
            } catch {
                rows = await prisma.question.findMany({
                    where,
                    select: { session: true }
                });
            }
        } catch {
            // DB fallback
        }

        const sessionCountMap = {};
        const dbSessionTitleMap = {};
        rows.forEach(r => {
            const s = r.session || 1;
            sessionCountMap[s] = (sessionCountMap[s] || 0) + 1;
            const dbTitle = String(r.sessionTitle || '').trim();
            if (dbTitle && !dbSessionTitleMap[s]) {
                dbSessionTitleMap[s] = dbTitle;
            }
        });

        if (isAgileDevOps && rows.length === 0) {
            for (let s = 1; s <= 16; s++) {
                const count = AGILE_DEVOPS_QUESTIONS.filter(q => q.session === s).length;
                sessionCountMap[s] = Math.max(sessionCountMap[s] || 0, count);
            }
        }

        if (isCSharp && rows.length === 0) {
            for (const s of CSHARP_SESSION_NUMBERS) {
                const count = CSHARP_QUIZ_QUESTIONS.filter(q => q.session === s).length;
                sessionCountMap[s] = Math.max(sessionCountMap[s] || 0, count);
            }
        }

        const sessions = Object.keys(sessionCountMap)
            .map(s => {
                const sNum = parseInt(s, 10);
                let title = dbSessionTitleMap[sNum] || `Session ${sNum}`;
                if (!dbSessionTitleMap[sNum]) {
                    if (isAgileDevOps && AGILE_DEVOPS_SESSIONS[sNum]) {
                        title = AGILE_DEVOPS_SESSIONS[sNum];
                    } else if (isCSharp && CSHARP_QUIZ_SESSIONS[sNum]) {
                        title = CSHARP_QUIZ_SESSIONS[sNum];
                    } else if (isReactJs && REACTJS_SESSIONS[sNum]) {
                        title = REACTJS_SESSIONS[sNum];
                    } else if (isMaterialUi && MATERIAL_UI_SESSIONS[sNum]) {
                        title = MATERIAL_UI_SESSIONS[sNum];
                    } else if (isMongoDb && MONGODB_SESSIONS[sNum]) {
                        title = MONGODB_SESSIONS[sNum];
                    } else if (isAzure && AZURE_SESSIONS[sNum]) {
                        title = AZURE_SESSIONS[sNum];
                    }
                }
                return {
                    session: sNum,
                    title,
                    count: sessionCountMap[s]
                };
            })
            .sort((a, b) => a.session - b.session);

        // If no sessions found yet, return default Session 1 with 0 questions
        if (sessions.length === 0) {
            return [{ session: 1, count: 0 }];
        }

        return sessions;
    },

    delete: async (id) => {
        await prisma.question.delete({
            where: { id: String(id) }
        });
        return 1;
    },

    update: async (id, data) => {
        const {
            category,
            session,
            session_title,
            sessionTitle,
            topic,
            difficulty,
            source_page,
            sourcePage,
            source_book,
            sourceBook,
            question_text,
            options,
            correct_answer,
            explanation
        } = data;
        const serializedOptions = typeof options === 'string' ? options : JSON.stringify(Array.isArray(options) ? options : []);
        const updateData = {
            category,
            questionText: question_text,
            options: serializedOptions,
            correctAnswer: correct_answer,
            ...(explanation !== undefined ? { explanation: explanation || '' } : {}),
            ...(session_title !== undefined || sessionTitle !== undefined
                ? { sessionTitle: String(session_title ?? sessionTitle ?? '').trim() }
                : {}),
            ...(topic !== undefined ? { topic: String(topic || '').trim() } : {}),
            ...(difficulty !== undefined ? { difficulty: String(difficulty || '').trim() } : {}),
            ...(source_page !== undefined || sourcePage !== undefined
                ? { sourcePage: String(source_page ?? sourcePage ?? '').trim() }
                : {}),
            ...(source_book !== undefined || sourceBook !== undefined
                ? { sourceBook: String(source_book ?? sourceBook ?? '').trim() }
                : {})
        };
        if (session !== undefined && session !== null && !isNaN(parseInt(session, 10))) {
            updateData.session = parseInt(session, 10);
        }

        await prisma.question.update({
            where: { id: String(id) },
            data: updateData
        });
        return 1;
    },

    getRecentCount: async (days = 3) => {
        try {
            const date = new Date();
            date.setDate(date.getDate() - days);
            const count = await prisma.question.count({
                where: {
                    createdAt: {
                        gte: date
                    }
                }
            });
            return count;
        } catch (error) {
            console.error('[Question Recent Count Error]:', error.message);
            throw error;
        }
    }
};

module.exports = Question;
