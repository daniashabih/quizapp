const fs = require('fs');
const path = require('path');
const Question = require('../api/_models/questionModel');
const Attempt = require('../api/_models/attemptModel');

const CATEGORY_NAME = 'Material UI';
const EXPECTED_SESSIONS = {
    1: { title: 'Session 1: Introduction to UI', count: 50 },
    2: { title: 'Session 2: Introduction to Material Design', count: 50 },
    3: { title: 'Session 3: Creating a Material Design Type and Component System', count: 50 }
};

function escapeCsv(val) {
    const str = String(val ?? '');
    if (/[",\r\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function parseRawFile() {
    const rawPath = path.resolve(__dirname, 'raw_materialui_mcqs.txt');
    const lines = fs.readFileSync(rawPath, 'utf8').split(/\r?\n/);

    const sessions = new Map();
    const answerKeys = new Map();
    let currentSession = null;
    let inAnswerKey = false;
    let currentQ = null;

    const flushQuestion = () => {
        if (!currentQ) return;
        if (currentQ.options.length !== 4) {
            throw new Error(`Session ${currentQ.session} Q${currentQ.qNum} has ${currentQ.options.length} options: "${currentQ.questionText}"`);
        }
        sessions.get(currentQ.session).questions.push(currentQ);
        currentQ = null;
    };

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const line = rawLine.trim();
        if (!line) continue;

        const sessionMatch = line.match(/^Session\s+(\d+)\s*:\s*(.+)$/i);
        if (sessionMatch) {
            flushQuestion();
            const sNum = parseInt(sessionMatch[1], 10);
            const title = `Session ${sNum}: ${sessionMatch[2].trim()}`;
            currentSession = sNum;
            inAnswerKey = false;
            if (sessions.has(sNum)) {
                throw new Error(`Duplicate session header: ${sNum}`);
            }
            sessions.set(sNum, { session: sNum, title, questions: [] });
            answerKeys.set(sNum, new Map());
            continue;
        }

        if (/^\d+\s+multiple-choice questions$/i.test(line)) {
            continue;
        }

        const keyHeaderMatch = line.match(/^Answer Key:\s*Session\s+(\d+)$/i);
        if (keyHeaderMatch) {
            flushQuestion();
            const keySession = parseInt(keyHeaderMatch[1], 10);
            if (keySession !== currentSession) {
                throw new Error(`Answer Key session ${keySession} does not match current session ${currentSession}`);
            }
            inAnswerKey = true;
            continue;
        }

        if (inAnswerKey) {
            if (!line.startsWith('|')) {
                // Subtitle line under "Answer Key: Session N" (e.g. "Introduction to UI")
                continue;
            }
            const cells = line.split('|').map(c => c.trim()).filter(Boolean);
            if (cells.length === 0 || /^Q$/i.test(cells[0])) {
                continue;
            }
            for (let c = 0; c + 1 < cells.length; c += 2) {
                const qNumStr = cells[c];
                const ansLetter = cells[c + 1].toUpperCase();
                if (!/^\d+$/.test(qNumStr) || !/^[A-D]$/.test(ansLetter)) {
                    throw new Error(`Invalid answer key cell in Session ${currentSession} on line ${i + 1}: "${line}"`);
                }
                answerKeys.get(currentSession).set(parseInt(qNumStr, 10), ansLetter);
            }
            continue;
        }

        const qMatch = line.match(/^(\d+)\.\s*(.+)$/);
        if (qMatch && currentSession !== null) {
            flushQuestion();
            const qNum = parseInt(qMatch[1], 10);
            currentQ = {
                session: currentSession,
                qNum,
                questionText: qMatch[2].trim(),
                options: []
            };
            continue;
        }

        const optMatch = line.match(/^([a-d])\.\s*(.+)$/i);
        if (optMatch && currentQ) {
            const expectedLetter = String.fromCharCode(65 + currentQ.options.length);
            const actualLetter = optMatch[1].toUpperCase();
            if (actualLetter !== expectedLetter) {
                throw new Error(`Session ${currentQ.session} Q${currentQ.qNum}: expected option ${expectedLetter}, got ${actualLetter} on line ${i + 1}`);
            }
            currentQ.options.push(optMatch[2].trim());
            continue;
        }

        throw new Error(`Unexpected line ${i + 1}: "${line}"`);
    }
    flushQuestion();

    if (sessions.size !== 3) {
        throw new Error(`Expected 3 sessions, found ${sessions.size}`);
    }

    const seenTexts = new Map();
    const duplicates = [];
    let total = 0;

    for (let s = 1; s <= 3; s++) {
        const sess = sessions.get(s);
        const keyMap = answerKeys.get(s);
        if (!sess || !keyMap) throw new Error(`Missing session ${s} data`);
        if (sess.title !== EXPECTED_SESSIONS[s].title) {
            throw new Error(`Session ${s} title mismatch: expected "${EXPECTED_SESSIONS[s].title}", got "${sess.title}"`);
        }
        if (sess.questions.length !== EXPECTED_SESSIONS[s].count) {
            throw new Error(`Session ${s} question count mismatch: expected ${EXPECTED_SESSIONS[s].count}, got ${sess.questions.length}`);
        }
        if (keyMap.size !== EXPECTED_SESSIONS[s].count) {
            throw new Error(`Session ${s} answer key count mismatch: expected ${EXPECTED_SESSIONS[s].count}, got ${keyMap.size}`);
        }

        const formattedQuestions = sess.questions.map((q, idx) => {
            if (q.qNum !== idx + 1) {
                throw new Error(`Session ${s} numbering gap at index ${idx}: got ${q.qNum}`);
            }
            const ansLetter = keyMap.get(q.qNum);
            if (!ansLetter) {
                throw new Error(`Missing answer key entry for Session ${s} Q${q.qNum}`);
            }
            const ansIdx = ansLetter.charCodeAt(0) - 65;
            const correctAnswer = q.options[ansIdx];
            if (!correctAnswer) {
                throw new Error(`Invalid option index ${ansIdx} for Session ${s} Q${q.qNum}`);
            }

            const resolvedIdx = Attempt.getQuestionCorrectIndex({
                options: q.options,
                correctAnswer
            });
            if (resolvedIdx !== ansIdx) {
                throw new Error(`Grading mismatch in Session ${s} Q${q.qNum}: expected ${ansIdx}, resolved ${resolvedIdx}`);
            }

            for (let optIdx = 0; optIdx < 4; optIdx++) {
                const expectedEval = optIdx === ansIdx;
                const actualEval = Attempt.evaluateAnswerCorrectness(optIdx, {
                    options: q.options,
                    correctAnswer
                });
                if (actualEval !== expectedEval) {
                    throw new Error(`Evaluation collision in Session ${s} Q${q.qNum} option ${optIdx}`);
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

            return {
                questionText: q.questionText,
                options: q.options,
                correctAnswer,
                explanation: `Correct answer is ${ansLetter}) ${correctAnswer}.`
            };
        });

        total += formattedQuestions.length;

        const jsonPayload = {
            category: CATEGORY_NAME,
            session: s,
            title: sess.title,
            totalQuestions: formattedQuestions.length,
            questions: formattedQuestions
        };
        fs.writeFileSync(
            path.resolve(__dirname, `materialui_session${s}.json`),
            JSON.stringify(jsonPayload, null, 2) + '\n',
            'utf8'
        );

        const csvLines = [
            'category,session,question_text,option1,option2,option3,option4,correct_answer',
            ...formattedQuestions.map(q => [
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
        fs.writeFileSync(
            path.resolve(__dirname, `materialui_session${s}.csv`),
            csvLines.join('\n') + '\n',
            'utf8'
        );
    }

    console.log(`Parsed ${total} questions across ${sessions.size} sessions successfully.`);
    if (duplicates.length > 0) {
        console.warn(`⚠️ Found ${duplicates.length} duplicate(s) across/within sessions:`);
        duplicates.forEach(d => console.warn(`  - ${d.first} vs ${d.second}: "${d.questionText}"`));
        process.exit(1);
    } else {
        console.log('✅ Zero duplicates found across or within all 3 sessions!');
    }
    console.log('✅ Generated materialui_session1..3.json and materialui_session1..3.csv');
}

parseRawFile();
