const fs = require('fs');
const path = require('path');
const Question = require('../api/_models/questionModel');
const Attempt = require('../api/_models/attemptModel');

const CATEGORY_NAME = 'React.js';
const EXPECTED_COUNTS = {
    1: 52,
    2: 48,
    3: 47,
    4: 51,
    5: 52,
    6: 50,
    7: 49,
    8: 50
};

function escapeCsv(val) {
    const str = String(val ?? '');
    if (/[",\r\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function parseRawFile() {
    const rawPath = path.resolve(__dirname, 'raw_reactjs_mcqs.txt');
    const lines = fs.readFileSync(rawPath, 'utf8').split(/\r?\n/);

    const sessions = new Map();
    let currentSession = null;
    let currentQ = null;

    const flushQuestion = () => {
        if (!currentQ) return;
        if (currentQ.options.length !== 4) {
            throw new Error(`Session ${currentQ.session} Q${currentQ.qNum} has ${currentQ.options.length} options: "${currentQ.questionText}"`);
        }
        if (!currentQ.answerLetter || !/^[A-D]$/.test(currentQ.answerLetter)) {
            throw new Error(`Session ${currentQ.session} Q${currentQ.qNum} missing valid Answer: "${currentQ.questionText}"`);
        }
        const ansIdx = currentQ.answerLetter.charCodeAt(0) - 65;
        const correctAnswer = currentQ.options[ansIdx];
        if (!correctAnswer) {
            throw new Error(`Session ${currentQ.session} Q${currentQ.qNum} invalid answer index ${ansIdx}`);
        }
        sessions.get(currentQ.session).questions.push({
            qNum: currentQ.qNum,
            questionText: currentQ.questionText,
            options: currentQ.options,
            correctAnswer,
            explanation: `Correct answer is ${currentQ.answerLetter}) ${correctAnswer}.`
        });
        currentQ = null;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const sessionMatch = line.match(/^Session\s+(\d+)\s*:\s*(.+)$/i);
        if (sessionMatch) {
            flushQuestion();
            const sNum = parseInt(sessionMatch[1], 10);
            const title = `Session ${sNum}: ${sessionMatch[2].trim()}`;
            currentSession = sNum;
            if (sessions.has(sNum)) {
                throw new Error(`Duplicate session header: ${sNum}`);
            }
            sessions.set(sNum, {
                session: sNum,
                title,
                questions: []
            });
            continue;
        }

        const qMatch = line.match(/^Q(\d+)\.\s*(.+)$/);
        if (qMatch && currentSession !== null) {
            flushQuestion();
            const qNum = parseInt(qMatch[1], 10);
            currentQ = {
                session: currentSession,
                qNum,
                questionText: qMatch[2].trim(),
                options: [],
                answerLetter: ''
            };
            continue;
        }

        const optMatch = line.match(/^([A-D])\.\s*(.+)$/);
        if (optMatch && currentQ && !currentQ.answerLetter) {
            const expectedLetter = String.fromCharCode(65 + currentQ.options.length);
            const actualLetter = optMatch[1].toUpperCase();
            if (actualLetter !== expectedLetter) {
                throw new Error(`Session ${currentQ.session} Q${currentQ.qNum}: expected option ${expectedLetter}, got ${actualLetter} on line ${i + 1}`);
            }
            currentQ.options.push(optMatch[2].trim());
            continue;
        }

        const ansMatch = line.match(/^Answer:\s*([A-D])$/i);
        if (ansMatch && currentQ) {
            currentQ.answerLetter = ansMatch[1].toUpperCase();
            continue;
        }

        throw new Error(`Unexpected line ${i + 1}: "${line}"`);
    }
    flushQuestion();

    if (sessions.size !== 8) {
        throw new Error(`Expected 8 sessions, found ${sessions.size}`);
    }

    const seenTexts = new Map();
    const duplicates = [];
    let total = 0;

    for (let s = 1; s <= 8; s++) {
        const sess = sessions.get(s);
        if (!sess) throw new Error(`Missing session ${s}`);
        if (sess.questions.length !== EXPECTED_COUNTS[s]) {
            throw new Error(`Session ${s} count mismatch: expected ${EXPECTED_COUNTS[s]}, got ${sess.questions.length}`);
        }
        sess.questions.forEach((q, idx) => {
            if (q.qNum !== idx + 1) {
                throw new Error(`Session ${s} numbering gap at index ${idx}: got Q${q.qNum}`);
            }
            // Validate grading uniqueness
            const correctIdx = Attempt.getQuestionCorrectIndex({
                options: q.options,
                correctAnswer: q.correctAnswer
            });
            if (correctIdx !== q.options.indexOf(q.correctAnswer)) {
                throw new Error(`Grading mismatch in Session ${s} Q${q.qNum}: ${q.questionText}`);
            }
            for (let optIdx = 0; optIdx < 4; optIdx++) {
                const expectedEval = optIdx === correctIdx;
                const actualEval = Attempt.evaluateAnswerCorrectness(optIdx, {
                    options: q.options,
                    correctAnswer: q.correctAnswer
                });
                if (actualEval !== expectedEval) {
                    throw new Error(`Evaluation collision in Session ${s} Q${q.qNum} option ${optIdx}: "${q.options[optIdx]}"`);
                }
            }

            const norm = Question.normalizeQuestionText(q.questionText);
            if (seenTexts.has(norm)) {
                duplicates.push({
                    first: seenTexts.get(norm),
                    second: `Session ${s} Q${q.qNum}`,
                    questionText: q.questionText
                });
            } else {
                seenTexts.set(norm, `Session ${s} Q${q.qNum}`);
            }
        });
        total += sess.questions.length;
    }

    console.log(`Parsed ${total} questions across ${sessions.size} sessions successfully.`);
    if (duplicates.length > 0) {
        console.warn(`⚠️ Found ${duplicates.length} duplicate(s) across/within sessions:`);
        duplicates.forEach(d => console.warn(`  - ${d.first} vs ${d.second}: "${d.questionText}"`));
    } else {
        console.log('✅ Zero duplicates found across or within all 8 sessions!');
    }

    // Write JSON and CSV files
    for (let s = 1; s <= 8; s++) {
        const sess = sessions.get(s);
        const cleanQuestions = sess.questions.map(({ qNum, ...rest }) => rest);
        const jsonPayload = {
            category: CATEGORY_NAME,
            session: s,
            title: sess.title,
            totalQuestions: cleanQuestions.length,
            questions: cleanQuestions
        };
        const jsonPath = path.resolve(__dirname, `reactjs_session${s}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(jsonPayload, null, 2) + '\n', 'utf8');

        const csvLines = [
            'category,session,question_text,option1,option2,option3,option4,correct_answer',
            ...cleanQuestions.map(q => [
                escapeCsv(CATEGORY_NAME),
                escapeCsv(s),
                escapeCsv(q.questionText),
                escapeCsv(q.options[0]),
                escapeCsv(q.options[1]),
                escapeCsv(q.options[2]),
                escapeCsv(q.options[3]),
                escapeCsv(q.correctAnswer)
            ].join(','))
        ];
        const csvPath = path.resolve(__dirname, `reactjs_session${s}.csv`);
        fs.writeFileSync(csvPath, csvLines.join('\n') + '\n', 'utf8');
    }

    console.log('✅ Generated reactjs_session1..8.json and reactjs_session1..8.csv');
}

parseRawFile();
