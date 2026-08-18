const Question = require('../_models/questionModel');
const Category = require('../_models/categoryModel');

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
        if (!existing) {
            await Category.create(clean);
            console.log(`[Category Auto-Sync] Added new category '${clean}' to categories table.`);
        }
    } catch (err) {
        console.warn(`[Category Auto-Sync Warning] Could not ensure category '${clean}':`, err.message);
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
            const question_text = qIdx !== -1 ? row[qIdx] : (row[1] || '');
            const option1 = opt1Idx !== -1 ? row[opt1Idx] : (row[2] || '');
            const option2 = opt2Idx !== -1 ? row[opt2Idx] : (row[3] || '');
            const option3 = opt3Idx !== -1 ? row[opt3Idx] : (row[4] || '');
            const option4 = opt4Idx !== -1 ? row[opt4Idx] : (row[5] || '');
            const correct_answer = ansIdx !== -1 ? row[ansIdx] : (row[6] || '');

            questions.push({
                category,
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
        const { category, question_text, options, correct_answer } = req.body;

        // Basic validation
        if (!category || !question_text || !options || !correct_answer) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        await ensureCategoryExists(category);

        const id = await Question.create({ category, question_text, options, correct_answer });
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

        // Process questions
        const results = { success: 0, failed: 0, errors: [] };
        
        for (const q of questions) {
            try {
                // Map fields (handle variations in column names)
                const category = q.category || q.Category;
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
                    await ensureCategoryExists(category);

                    await Question.create({ 
                        category, 
                        question_text, 
                        options, 
                        correct_answer
                    });
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
            message: `Import completed. Success: ${results.success}, Failed: ${results.failed}`,
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

        const questions = await Question.getFiltered({ category });
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
            const tableHeaderTitles = ['Category', 'Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Correct Answer'];

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

module.exports = { createQuestion, importQuestions, exportQuestions, getQuestions, deleteQuestion, updateQuestion, checkNewQuestions };
