const fs = require('fs');
const path = require('path');
const { getAllHighDemandQuestions } = require('../api/_models/techQuestions');

function csvEscape(val) {
    const str = String(val ?? '');
    return `"${str.replace(/"/g, '""')}"`;
}

function generateCsv() {
    const questions = getAllHighDemandQuestions();
    const headers = [
        'category',
        'session',
        'session_title',
        'topic',
        'question',
        'option1',
        'option2',
        'option3',
        'option4',
        'correct_answer',
        'explanation',
        'difficulty'
    ];

    const lines = [
        headers.join(','),
        ...questions.map(q => {
            const opts = Array.isArray(q.options) ? q.options : [];
            return [
                q.category,
                q.session || 1,
                q.sessionTitle || '',
                q.topic || '',
                q.questionText,
                opts[0] || '',
                opts[1] || '',
                opts[2] || '',
                opts[3] || '',
                q.correctAnswer,
                q.explanation || '',
                q.difficulty || 'beginner'
            ].map(csvEscape).join(',');
        })
    ];

    const outPath = path.resolve(__dirname, 'high_demand_technologies_questions.csv');
    fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
    console.log(`✅ Generated ${questions.length} questions at ${outPath}`);
}

generateCsv();
