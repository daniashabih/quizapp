const fs = require('fs');
const path = require('path');
const Question = require('../api/_models/questionModel');
const Attempt = require('../api/_models/attemptModel');

const CATEGORY_NAME = 'Azure';
const TOTAL_SESSIONS = 15;
const EXPECTED_SESSIONS = {
    1: { title: 'Session 1: Introduction to Azure Cloud Computing', shortTitle: 'Introduction to Azure Cloud Computing', rawCount: 55, count: 55 },
    2: { title: 'Session 2: Understanding Microsoft Azure Cloud Services', shortTitle: 'Understanding Microsoft Azure Cloud Services', rawCount: 54, count: 54 },
    3: { title: 'Session 3: Data Access Technologies in Azure', shortTitle: 'Data Access Technologies in Azure', rawCount: 55, count: 54 },
    4: { title: 'Session 4: Data Access Using ADO.NET', shortTitle: 'Data Access Using ADO.NET', rawCount: 54, count: 54 },
    5: { title: 'Session 5: Data Access Using Entity Framework', shortTitle: 'Data Access Using Entity Framework', rawCount: 55, count: 55 },
    6: { title: 'Session 6: Data Access Using Third-party Databases and Azure Storage Services', shortTitle: 'Data Access Using Third-party Databases and Azure Storage Services', rawCount: 51, count: 51 },
    7: { title: 'Session 7: Design and Implementation of Web API', shortTitle: 'Design and Implementation of Web API', rawCount: 55, count: 55 },
    8: { title: 'Session 8: Security in Web API', shortTitle: 'Security in Web API', rawCount: 55, count: 55 },
    9: { title: 'Session 9: Hosting and Consuming Web API', shortTitle: 'Hosting and Consuming Web API', rawCount: 52, count: 52 },
    10: { title: 'Session 10: Introduction to WCF Services', shortTitle: 'Introduction to WCF Services', rawCount: 55, count: 55 },
    11: { title: 'Session 11: Implementing Azure Serverless Web Services and API Management', shortTitle: 'Implementing Azure Serverless Web Services and API Management', rawCount: 55, count: 55 },
    12: { title: 'Session 12: Traffic Management and Monitoring Strategies for Web Services', shortTitle: 'Traffic Management and Monitoring Strategies for Web Services', rawCount: 52, count: 52 },
    13: { title: 'Session 13: Configuring Web Applications for Deployment', shortTitle: 'Configuring Web Applications for Deployment', rawCount: 55, count: 55 },
    14: { title: 'Session 14: Deploying Web Applications and Services', shortTitle: 'Deploying Web Applications and Services', rawCount: 55, count: 55 },
    15: { title: 'Session 15: Working with Shared Assemblies', shortTitle: 'Working with Shared Assemblies', rawCount: 55, count: 55 }
};

function escapeCsv(val) {
    const str = String(val ?? '');
    if (/[",\r\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function parseRawFile() {
    const rawPath = path.resolve(__dirname, 'raw_azure_mcqs.txt');
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
        const line = lines[i].trim();
        if (!line) continue;

        const keyHeaderMatch = line.match(/^Answer Key\s*[–-]\s*Session\s+(\d+)$/i);
        if (keyHeaderMatch) {
            flushQuestion();
            const keySession = parseInt(keyHeaderMatch[1], 10);
            if (keySession !== currentSession) {
                throw new Error(`Answer Key session ${keySession} does not match current session ${currentSession}`);
            }
            inAnswerKey = true;
            continue;
        }

        const sessionMatch = line.match(/^Session\s+(\d+)\s*:\s*(.+)$/i);
        if (sessionMatch) {
            flushQuestion();
            const sNum = parseInt(sessionMatch[1], 10);
            const shortTitle = sessionMatch[2].trim();
            const title = `Session ${sNum}: ${shortTitle}`;
            currentSession = sNum;
            inAnswerKey = false;
            if (sessions.has(sNum)) {
                throw new Error(`Duplicate session header: ${sNum}`);
            }
            sessions.set(sNum, { session: sNum, title, shortTitle, questions: [] });
            answerKeys.set(sNum, new Map());
            continue;
        }

        if (/^Choose the correct answer for each question\.?$/i.test(line)) {
            continue;
        }

        if (inAnswerKey) {
            if (!line.startsWith('|')) {
                throw new Error(`Unexpected non-table line in Answer Key of Session ${currentSession} at line ${i + 1}: "${line}"`);
            }
            const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            if (cells.length === 0 || /^No\.?$/i.test(cells[0]) || /^-+$/.test(cells[0])) {
                continue;
            }
            if (cells.length < 3) {
                throw new Error(`Invalid answer key row in Session ${currentSession} on line ${i + 1}: "${line}"`);
            }
            const qNumStr = cells[0];
            const ansLetter = cells[1].toUpperCase();
            const ansText = cells.slice(2).join(' | ').trim();
            if (!/^\d+$/.test(qNumStr) || !/^[A-D]$/.test(ansLetter) || !ansText) {
                throw new Error(`Invalid answer key entry in Session ${currentSession} on line ${i + 1}: "${line}"`);
            }
            answerKeys.get(currentSession).set(parseInt(qNumStr, 10), { ansLetter, ansText });
            continue;
        }

        const optMatch = line.match(/^([A-D])\.\s+(.+)$/);
        if (optMatch && currentQ) {
            const expectedLetter = String.fromCharCode(65 + currentQ.options.length);
            const actualLetter = optMatch[1].toUpperCase();
            if (actualLetter !== expectedLetter) {
                throw new Error(`Session ${currentQ.session} Q${currentQ.qNum}: expected option ${expectedLetter}, got ${actualLetter} on line ${i + 1}`);
            }
            currentQ.options.push(optMatch[2].trim());
            continue;
        }

        const qMatch = line.match(/^(\d+)\.\s+(.+)$/);
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

        throw new Error(`Unexpected line ${i + 1}: "${line}"`);
    }
    flushQuestion();

    if (sessions.size !== TOTAL_SESSIONS) {
        throw new Error(`Expected ${TOTAL_SESSIONS} sessions, found ${sessions.size}`);
    }

    const seenTexts = new Map();
    const skippedDuplicates = [];
    let total = 0;

    for (let s = 1; s <= TOTAL_SESSIONS; s++) {
        const sess = sessions.get(s);
        const keyMap = answerKeys.get(s);
        if (!sess || !keyMap) throw new Error(`Missing session ${s} data`);
        if (sess.title !== EXPECTED_SESSIONS[s].title) {
            throw new Error(`Session ${s} title mismatch: expected "${EXPECTED_SESSIONS[s].title}", got "${sess.title}"`);
        }
        if (sess.questions.length !== EXPECTED_SESSIONS[s].rawCount) {
            throw new Error(`Session ${s} raw question count mismatch: expected ${EXPECTED_SESSIONS[s].rawCount}, got ${sess.questions.length}`);
        }
        if (keyMap.size !== EXPECTED_SESSIONS[s].rawCount) {
            throw new Error(`Session ${s} answer key count mismatch: expected ${EXPECTED_SESSIONS[s].rawCount}, got ${keyMap.size}`);
        }

        const formattedQuestions = [];

        sess.questions.forEach((q, idx) => {
            if (q.qNum !== idx + 1) {
                throw new Error(`Session ${s} numbering gap at index ${idx}: got ${q.qNum}`);
            }
            const keyEntry = keyMap.get(q.qNum);
            if (!keyEntry) {
                throw new Error(`Missing answer key entry for Session ${s} Q${q.qNum}`);
            }
            const { ansLetter, ansText } = keyEntry;
            const ansIdx = ansLetter.charCodeAt(0) - 65;
            const correctAnswer = q.options[ansIdx];
            if (!correctAnswer) {
                throw new Error(`Invalid option index ${ansIdx} for Session ${s} Q${q.qNum}`);
            }
            if (correctAnswer.trim() !== ansText.trim()) {
                throw new Error(
                    `Answer key text mismatch in Session ${s} Q${q.qNum}: letter ${ansLetter} points to "${correctAnswer}", but key says "${ansText}"`
                );
            }

            // Ensure all 4 options within the question are distinct
            const distinctOpts = new Set(q.options.map(o => o.trim().toLowerCase()));
            if (distinctOpts.size !== 4) {
                throw new Error(`Duplicate option detected in Session ${s} Q${q.qNum}: ${JSON.stringify(q.options)}`);
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
                skippedDuplicates.push({
                    first: seenTexts.get(norm),
                    skipped: `Session ${s} Q${q.qNum}`,
                    questionText: q.questionText
                });
                return;
            }
            seenTexts.set(norm, `Session ${s} Q${q.qNum}`);

            formattedQuestions.push({
                questionText: q.questionText,
                options: q.options,
                correctAnswer,
                explanation: `Correct answer is ${ansLetter}) ${correctAnswer}.`
            });
        });

        if (formattedQuestions.length !== EXPECTED_SESSIONS[s].count) {
            throw new Error(`Session ${s} unique question count mismatch: expected ${EXPECTED_SESSIONS[s].count}, got ${formattedQuestions.length}`);
        }

        total += formattedQuestions.length;

        const jsonPayload = {
            category: CATEGORY_NAME,
            session: s,
            title: sess.title,
            totalQuestions: formattedQuestions.length,
            questions: formattedQuestions
        };
        fs.writeFileSync(
            path.resolve(__dirname, `azure_session${s}.json`),
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
            path.resolve(__dirname, `azure_session${s}.csv`),
            csvLines.join('\n') + '\n',
            'utf8'
        );
    }

    console.log(`Parsed ${total} unique questions across ${sessions.size} sessions successfully.`);
    if (skippedDuplicates.length > 0) {
        console.log(`ℹ️ Deduplicated ${skippedDuplicates.length} cross-session duplicate(s):`);
        skippedDuplicates.forEach(d => console.log(`  - Kept ${d.first}, skipped ${d.skipped}: "${d.questionText}"`));
    }
    console.log('✅ Zero duplicates remain across or within all 15 sessions!');
    console.log('✅ Generated azure_session1..15.json and azure_session1..15.csv');
}

parseRawFile();
