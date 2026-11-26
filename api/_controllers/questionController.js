const Question = require('../_models/questionModel');
const Category = require('../_models/categoryModel');
const prisma = require('../_config/prisma');
const {
    HIGH_DEMAND_TECH_NAMES,
    getHighDemandPackName,
    getHighDemandPack
} = require('../_models/techQuestions');
const {
    normalizeCategoryKey,
    resolveCategoryQuestionStats
} = require('../_utils/categoryMatching');

const fs = require('fs');
const { Readable } = require('stream');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, HeadingLevel, AlignmentType, ShadingType } = require('docx');
const mammoth = require('mammoth');

async function ensureCategoryExists(categoryName) {
    if (!categoryName || !String(categoryName).trim()) return;
    const clean = String(categoryName).trim();
    try {
        const existing = await Category.findByName(clean);
        if (!existing || /^(mem_)?cat_/.test(String(existing.id || ''))) {
            await Category.create(clean);
            console.log(`[Category Auto-Sync] Added new category '${clean}' to categories table.`);
        }
    } catch (err) {
        if (!/unique|duplicate|already exists|P2002/i.test(String(err?.message || ''))) {
            console.warn(`[Category Auto-Sync Warning] Could not ensure category '${clean}':`, err.message);
        }
    }
}

function parseQuestionsFromHtml(html) {
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

    const rows = [];
    let trMatch;
    while ((trMatch = trRegex.exec(html)) !== null) {
        const rowHtml = trMatch[1];
        const cells = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
            let text = cellMatch[1].replace(/<[^>]+>/g, '').trim();
            text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            cells.push(text);
        }
        if (cells.length > 0) {
            rows.push(cells);
        }
    }

    if (rows.length >= 2) {
        const headers = rows[0].map(h => h.toLowerCase().trim());
        const getIndex = (possibleNames) => {
            for (const name of possibleNames) {
                const idx = headers.findIndex(h => h.includes(name.toLowerCase()));
                if (idx !== -1) return idx;
            }
            return -1;
        };

        const catIdx = getIndex(['category']);
        const sessIdx = getIndex(['session', 'session no', 'session_no', 'sessionno']);
        const qIdx = getIndex(['question']);
        const opt1Idx = getIndex(['option1', 'option 1', 'opt1']);
        const opt2Idx = getIndex(['option2', 'option 2', 'opt2']);
        const opt3Idx = getIndex(['option3', 'option 3', 'opt3']);
        const opt4Idx = getIndex(['option4', 'option 4', 'opt4']);
        const ansIdx = getIndex(['correct_answer', 'correctanswer', 'answer', 'correct answer']);

        const questions = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length === 0) continue;

            const category = catIdx !== -1 ? row[catIdx] : (row[0] || '');
            const session = sessIdx !== -1 ? (parseInt(row[sessIdx], 10) || 1) : 1;
            const question_text = qIdx !== -1 ? row[qIdx] : (row[1] || '');
            const option1 = opt1Idx !== -1 ? row[opt1Idx] : (row[2] || '');
            const option2 = opt2Idx !== -1 ? row[opt2Idx] : (row[3] || '');
            const option3 = opt3Idx !== -1 ? row[opt3Idx] : (row[4] || '');
            const option4 = opt4Idx !== -1 ? row[opt4Idx] : (row[5] || '');
            const correct_answer = ansIdx !== -1 ? row[ansIdx] : (row[6] || '');

            questions.push({
                category,
                session,
                question_text,
                option1,
                option2,
                option3,
                option4,
                correct_answer
            });
        }
        return questions;
    }

    // Fallback parsing for line-by-line structured text
    const textLines = html.replace(/<[^>]+>/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);
    const questions = [];
    let currentQ = {};

    for (const line of textLines) {
        const lower = line.toLowerCase();
        if (lower.startsWith('category:')) {
            if (currentQ.question_text && currentQ.category) {
                questions.push(currentQ);
                currentQ = {};
            }
            currentQ.category = line.split(':').slice(1).join(':').trim();
        } else if (lower.startsWith('session:') || lower.startsWith('session no:')) {
            currentQ.session = parseInt(line.split(':').slice(1).join(':').trim(), 10) || 1;
        } else if (lower.startsWith('question:')) {
            currentQ.question_text = line.split(':').slice(1).join(':').trim();
        } else if (lower.startsWith('option 1:') || lower.startsWith('option1:')) {
            currentQ.option1 = line.split(':').slice(1).join(':').trim();
        } else if (lower.startsWith('option 2:') || lower.startsWith('option2:')) {
            currentQ.option2 = line.split(':').slice(1).join(':').trim();
        } else if (lower.startsWith('option 3:') || lower.startsWith('option3:')) {
            currentQ.option3 = line.split(':').slice(1).join(':').trim();
        } else if (lower.startsWith('option 4:') || lower.startsWith('option4:')) {
            currentQ.option4 = line.split(':').slice(1).join(':').trim();
        } else if (lower.startsWith('correct answer:') || lower.startsWith('answer:')) {
            currentQ.correct_answer = line.split(':').slice(1).join(':').trim();
        }
    }

    if (currentQ.question_text && currentQ.category) {
        questions.push(currentQ);
    }

    return questions;
}

const createQuestion = async (req, res) => {
    try {
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
        } = req.body;

        // Basic validation
        if (!category || !question_text || !options || !correct_answer) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingDuplicate = await Question.findDuplicate({ category, question_text });
        if (existingDuplicate) {
            return res.status(409).json({
                message: `Duplicate question already exists in "${existingDuplicate.category || category}" (Session ${existingDuplicate.session || 1}).`,
                duplicate: true,
                existingId: existingDuplicate.id,
                existingSession: existingDuplicate.session || 1
            });
        }

        await ensureCategoryExists(category);

        const sessionNum = parseInt(session, 10) || 1;
        const id = await Question.create({
            category,
            session: sessionNum,
            session_title: session_title ?? sessionTitle,
            topic,
            difficulty,
            source_page: source_page ?? sourcePage,
            source_book: source_book ?? sourceBook,
            question_text,
            options,
            correct_answer,
            explanation
        });
        res.status(201).json({ message: 'Question created', id });
    } catch (error) {
        console.error('Create Question Error:', error);
        res.status(500).json({ message: error.message || 'Server error creating question' });
    }
};

const importQuestions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileExt = (req.file.originalname || '').split('.').pop().toLowerCase();
        let questions = [];

        if (fileExt === 'csv') {
            const results = [];
            const inputStream = req.file.buffer 
                ? Readable.from(req.file.buffer)
                : fs.createReadStream(filePath);

            await new Promise((resolve, reject) => {
                inputStream
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', (err) => reject(err));
            });
            questions = results;
        } else if (fileExt === 'xlsx' || fileExt === 'xls') {
            const workbook = req.file.buffer 
                ? xlsx.read(req.file.buffer, { type: 'buffer' })
                : xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            questions = xlsx.utils.sheet_to_json(worksheet);
        } else if (fileExt === 'docx' || fileExt === 'doc') {
            const fileBuffer = req.file.buffer
                ? req.file.buffer
                : (filePath && fs.existsSync(filePath) ? fs.readFileSync(filePath) : null);

            if (!fileBuffer) {
                if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return res.status(400).json({ message: 'Could not read DOCX file buffer' });
            }

            const result = await mammoth.convertToHtml({ buffer: fileBuffer });
            const html = result.value || '';
            questions = parseQuestionsFromHtml(html);
        } else {
            if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).json({ message: 'Unsupported file format' });
        }

        // Process questions (with cross-session duplicate prevention)
        const results = { success: 0, skipped: 0, failed: 0, errors: [] };
        const seenByCategory = new Map();

        for (const q of questions) {
            try {
                // Map fields (handle variations in column names)
                const category = q.category || q.Category;
                const rawSession = q.session || q.Session || q.session_no || q.sessionNo || q.session_number;
                const session = rawSession ? (parseInt(rawSession, 10) || 1) : 1;
                const question_text = q.question || q.question_text || q.Question;
                const correct_answer = q.correct_answer || q.CorrectAnswer || q.Answer;
                
                // Collect options
                const options = [
                    q.option1 || q.Option1,
                    q.option2 || q.Option2,
                    q.option3 || q.Option3,
                    q.option4 || q.Option4
                ].filter(opt => opt !== undefined && opt !== null && opt !== '');

                if (category && question_text && options.length >= 2 && correct_answer) {
                    const catKey = String(category).trim().toLowerCase();
                    if (!seenByCategory.has(catKey)) {
                        const existingInCat = await Question.getFiltered({ category });
                        seenByCategory.set(
                            catKey,
                            new Set(existingInCat.map(item => Question.normalizeQuestionText(item.question_text || item.questionText)))
                        );
                    }

                    const seenSet = seenByCategory.get(catKey);
                    const normText = Question.normalizeQuestionText(question_text);
                    if (seenSet.has(normText)) {
                        results.skipped++;
                        results.errors.push(`Skipped duplicate in "${category}": ${String(question_text).substring(0, 60)}`);
                        continue;
                    }

                    await ensureCategoryExists(category);

                    const explanation = q.explanation || q.Explanation || '';
                    const difficulty = q.difficulty || q.Difficulty || '';
                    const topic = q.topic || q.Topic || '';
                    const sessionTitle = q.session_title || q.sessionTitle || q.SessionTitle || '';

                    await Question.create({ 
                        category, 
                        session,
                        session_title: sessionTitle,
                        topic,
                        difficulty,
                        question_text, 
                        options, 
                        correct_answer,
                        explanation
                    });
                    seenSet.add(normText);
                    results.success++;
                } else {
                    results.failed++;
                    results.errors.push(`Missing required fields in row: ${JSON.stringify(q)}`);
                }
            } catch (err) {
                results.failed++;
                results.errors.push(`Error in row: ${err.message}`);
            }
        }

        // Delete temp file if disk storage was used
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({
            message: `Import completed. Success: ${results.success}, Skipped duplicates: ${results.skipped}, Failed: ${results.failed}`,
            success: results.success,
            skipped: results.skipped,
            failed: results.failed,
            details: results.errors
        });
    } catch (error) {
        console.error('Import error:', error);
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Failed to import questions' });
    }
};

const getQuestions = async (req, res) => {
    try {
        const category = req.query.category?.trim();
        const rawSession = req.query.session;
        const session = (rawSession !== undefined && rawSession !== '' && rawSession !== 'all')
            ? (parseInt(rawSession, 10) || undefined)
            : undefined;

        const questions = await Question.getFiltered({ category, session });
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCategorySessions = async (req, res) => {
    try {
        const category = req.query.category?.trim();
        const sessions = await Question.getSessionsByCategory(category);
        res.json(sessions);
    } catch (error) {
        console.error('Get Sessions Error:', error);
        res.status(500).json({ message: 'Server error fetching sessions' });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await Question.delete(id);
        res.json({ message: 'Question deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, question_text } = req.body || {};
        if (category && question_text) {
            const existingDuplicate = await Question.findDuplicate({
                category,
                question_text,
                excludeId: id
            });
            if (existingDuplicate) {
                return res.status(409).json({
                    message: `Duplicate question already exists in "${existingDuplicate.category || category}" (Session ${existingDuplicate.session || 1}).`,
                    duplicate: true,
                    existingId: existingDuplicate.id,
                    existingSession: existingDuplicate.session || 1
                });
            }
        }
        await Question.update(id, req.body);
        res.json({ message: 'Question updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const checkNewQuestions = async (req, res) => {
    try {
        const count = await Question.getRecentCount(3);
        res.json({ hasNew: count > 0, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const exportQuestions = async (req, res) => {
    try {
        const { format } = req.query; // 'csv', 'xlsx', or 'docx'
        console.log(`📤 Exporting questions in ${format} format...`);
        const questions = await Question.getAll();

        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions to export' });
        }

        // Prepare data for export
        const data = questions.map(q => {
            let options = q.options;
            if (typeof options === 'string') {
                try { options = JSON.parse(options); } catch { options = []; }
            }
            return {
                Category: q.category,
                Session: q.session || 1,
                Question: q.question_text,
                Option1: options[0] || '',
                Option2: options[1] || '',
                Option3: options[2] || '',
                Option4: options[3] || '',
                CorrectAnswer: q.correct_answer
            };
        });

        if (format === 'csv') {
            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=questions_export.csv');
            return res.send(csvRows);
        } else if (format === 'docx' || format === 'doc') {
            const tableHeaderTitles = ['Category', 'Session', 'Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Correct Answer'];

            const headerRow = new TableRow({
                tableHeader: true,
                children: tableHeaderTitles.map(title => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: title, bold: true, color: "FFFFFF" })],
                        alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "1E293B", type: ShadingType.CLEAR, color: "auto" },
                    width: { size: 100 / tableHeaderTitles.length, type: WidthType.PERCENTAGE }
                }))
            });

            const dataRows = data.map(row => {
                const cellValues = [
                    row.Category || '',
                    row.Session || 1,
                    row.Question || '',
                    row.Option1 || '',
                    row.Option2 || '',
                    row.Option3 || '',
                    row.Option4 || '',
                    row.CorrectAnswer || ''
                ];
                return new TableRow({
                    children: cellValues.map(val => new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text: String(val) })]
                        })],
                        width: { size: 100 / tableHeaderTitles.length, type: WidthType.PERCENTAGE }
                    }))
                });
            });

            const table = new Table({
                rows: [headerRow, ...dataRows],
                width: { size: 100, type: WidthType.PERCENTAGE }
            });

            const doc = new Document({
                sections: [{
                    children: [
                        new Paragraph({
                            text: "Quiz Questions Export",
                            heading: HeadingLevel.HEADING_1,
                            spacing: { after: 300 }
                        }),
                        table
                    ]
                }]
            });

            const docxBuffer = await Packer.toBuffer(doc);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', 'attachment; filename=questions_export.docx');
            return res.send(docxBuffer);
        } else {
            // Default to XLSX
            const worksheet = xlsx.utils.json_to_sheet(data);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Questions");
            
            const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=questions_export.xlsx');
            return res.send(buffer);
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ message: 'Failed to export questions' });
    }
};

async function computeQuestionCoverageSummary() {
    const [categories, questionStats] = await Promise.all([
        prisma.category.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
        prisma.question.groupBy({
            by: ['category'],
            _count: { _all: true },
            _max: { createdAt: true }
        }).catch(() => [])
    ]);

    const enriched = resolveCategoryQuestionStats(categories, questionStats).map(item => {
        const packName = getHighDemandPackName(item.name);
        const packQuestions = packName ? getHighDemandPack(packName) : [];
        return {
            ...item,
            hasStarterPack: Boolean(packName),
            starterPackName: packName,
            starterPackCount: packQuestions.length
        };
    });

    const existingNormSet = new Set(enriched.map(c => normalizeCategoryKey(c.name)));
    for (const packName of HIGH_DEMAND_TECH_NAMES) {
        if (!existingNormSet.has(normalizeCategoryKey(packName))) {
            const packQuestions = getHighDemandPack(packName);
            enriched.push({
                id: `pack_${normalizeCategoryKey(packName).replace(/[^a-z0-9]/g, '_')}`,
                name: packName,
                isEnabled: true,
                directQuestionCount: 0,
                questionCount: 0,
                coveredByAlias: null,
                latestQuestionAt: null,
                hasStarterPack: true,
                starterPackName: packName,
                starterPackCount: packQuestions.length,
                missingCategoryRecord: true
            });
        }
    }

    const enabled = enriched.filter(c => c.isEnabled !== false);
    const emptyCategories = enabled.filter(c => c.questionCount === 0);
    const lowCoverageCategories = enabled.filter(c => c.questionCount > 0 && c.questionCount < 15);
    const populatedCategories = enabled.filter(c => c.questionCount > 0);
    const aliasCoveredCategories = enabled.filter(c => Boolean(c.coveredByAlias));

    return {
        totalCategories: enabled.length,
        populatedCount: populatedCategories.length,
        emptyCount: emptyCategories.length,
        lowCoverageCount: lowCoverageCategories.length,
        aliasCoveredCount: aliasCoveredCategories.length,
        availableStarterPacks: HIGH_DEMAND_TECH_NAMES,
        emptyCategories,
        lowCoverageCategories,
        categories: enriched
    };
}

const getQuestionCoverage = async (req, res) => {
    try {
        const coverage = await computeQuestionCoverageSummary();
        res.json({ success: true, ...coverage });
    } catch (error) {
        console.error('Question Coverage Error:', error);
        res.status(500).json({ success: false, message: 'Failed to inspect question coverage' });
    }
};

const seedHighDemandQuestions = async (req, res) => {
    try {
        const { categories: requestedCategories, onlyEmpty = true } = req.body || {};
        const coverage = await computeQuestionCoverageSummary();

        let targetPackNames = [];
        if (Array.isArray(requestedCategories) && requestedCategories.length > 0) {
            targetPackNames = Array.from(
                new Set(
                    requestedCategories
                        .map(c => getHighDemandPackName(c))
                        .filter(Boolean)
                )
            );
            if (targetPackNames.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `No curated starter pack matched requested categories. Available packs: ${HIGH_DEMAND_TECH_NAMES.join(', ')}`
                });
            }
        } else if (onlyEmpty) {
            targetPackNames = coverage.emptyCategories
                .filter(c => c.hasStarterPack && c.starterPackName)
                .map(c => c.starterPackName);
            targetPackNames = Array.from(new Set(targetPackNames));
            if (targetPackNames.length === 0) {
                // Fall back to any packs that have < 15 questions if none are at 0
                targetPackNames = Array.from(
                    new Set(
                        coverage.lowCoverageCategories
                            .filter(c => c.hasStarterPack && c.starterPackName)
                            .map(c => c.starterPackName)
                    )
                );
            }
        } else {
            targetPackNames = [...HIGH_DEMAND_TECH_NAMES];
        }

        if (targetPackNames.length === 0) {
            return res.json({
                success: true,
                message: 'All curated high-demand technology tracks already have verified questions.',
                inserted: 0,
                skipped: 0,
                resultsByCategory: []
            });
        }

        let totalInserted = 0;
        let totalSkipped = 0;
        const resultsByCategory = [];

        for (const packName of targetPackNames) {
            const packQuestions = getHighDemandPack(packName);
            if (!packQuestions.length) continue;

            // Reuse existing category casing in DB if present and ensure enabled
            const existingCat = await Category.findByName(packName);
            const targetCategoryName = existingCat && !/^(mem_)?cat_/.test(String(existingCat.id || ''))
                ? existingCat.name
                : packName;

            await ensureCategoryExists(targetCategoryName);
            if (existingCat && existingCat.id && !/^(mem_)?cat_/.test(String(existingCat.id)) && existingCat.isEnabled === false) {
                await Category.update(existingCat.id, { isEnabled: true }).catch(() => {});
            }

            const existingRows = await Question.getFiltered({ category: targetCategoryName });
            const seenNorm = new Set(
                existingRows.map(item => Question.normalizeQuestionText(item.question_text || item.questionText))
            );

            let catInserted = 0;
            let catSkipped = 0;

            for (const q of packQuestions) {
                const normText = Question.normalizeQuestionText(q.questionText);
                if (!normText || seenNorm.has(normText)) {
                    catSkipped++;
                    continue;
                }

                await Question.create({
                    category: targetCategoryName,
                    session: q.session || 1,
                    session_title: q.sessionTitle || '',
                    topic: q.topic || '',
                    difficulty: q.difficulty || 'beginner',
                    question_text: q.questionText,
                    options: q.options,
                    correct_answer: q.correctAnswer,
                    explanation: q.explanation || ''
                });

                seenNorm.add(normText);
                catInserted++;
            }

            totalInserted += catInserted;
            totalSkipped += catSkipped;
            resultsByCategory.push({
                category: targetCategoryName,
                inserted: catInserted,
                skipped: catSkipped,
                totalInPack: packQuestions.length
            });
        }

        res.json({
            success: true,
            message: totalInserted > 0
                ? `Added ${totalInserted} verified questions across ${resultsByCategory.filter(r => r.inserted > 0).length} high-demand track(s)${totalSkipped > 0 ? ` (${totalSkipped} duplicate(s) skipped)` : ''}.`
                : `All ${totalSkipped} questions were already present in MongoDB.`,
            inserted: totalInserted,
            skipped: totalSkipped,
            resultsByCategory
        });
    } catch (error) {
        console.error('Seed High Demand Questions Error:', error);
        res.status(500).json({
            success: false,
            message: error?.message || 'Failed to populate high-demand quiz questions'
        });
    }
};

module.exports = {
    createQuestion,
    importQuestions,
    exportQuestions,
    getQuestions,
    getCategorySessions,
    deleteQuestion,
    updateQuestion,
    checkNewQuestions,
    getQuestionCoverage,
    seedHighDemandQuestions,
    computeQuestionCoverageSummary
};
