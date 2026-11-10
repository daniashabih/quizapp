const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const docxPath = 'C:\\Users\\dania.shabih\\.gemini\\antigravity\\brain\\3f93f9cf-e544-4a9f-9b10-29825fdf6d3d\\.user_uploaded\\media_1794316290178_b9d5d0f8.docx';

async function parseDocx() {
    const { value: rawText } = await mammoth.extractRawText({ path: docxPath });
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    // Find the Answer Key section header at the end ("Answer Key")
    const answerKeyIdx = lines.findIndex((l, idx) => idx > 100 && /^Answer Key$/i.test(l));
    if (answerKeyIdx === -1) {
        throw new Error('Could not find Answer Key section');
    }

    // Question lines start at index 24 ("Session 1: Introduction to the Web" after "Answer Key (all sessions)")
    const tocEndIdx = lines.findIndex(l => /^Answer Key \(all sessions\)$/i.test(l));
    const questionLines = lines.slice(tocEndIdx + 1, answerKeyIdx);
    const answerKeyLines = lines.slice(answerKeyIdx + 1);

    // Parse Answer Key
    const answerKeysBySession = {};
    let currentKeySession = null;
    for (const line of answerKeyLines) {
        const sessionMatch = line.match(/^Session\s+(\d+)\s*:\s*(.+)$/i);
        if (sessionMatch) {
            currentKeySession = parseInt(sessionMatch[1], 10);
            answerKeysBySession[currentKeySession] = {};
            continue;
        }
        if (currentKeySession) {
            const ansMatch = line.match(/^(\d+)\.\s*([A-D])$/i);
            if (ansMatch) {
                const qNum = parseInt(ansMatch[1], 10);
                const ansLetter = ansMatch[2].toUpperCase();
                answerKeysBySession[currentKeySession][qNum] = ansLetter;
            }
        }
    }

    // Parse Questions per session
    const sessions = {};
    let currentSession = null;
    let currentQuestion = null;

    for (let i = 0; i < questionLines.length; i++) {
        const line = questionLines[i];

        const sessionHeaderMatch = line.match(/^Session\s+(\d+)\s*:\s*(.+)$/i);
        if (sessionHeaderMatch) {
            const sNum = parseInt(sessionHeaderMatch[1], 10);
            const sTitle = sessionHeaderMatch[2].trim();
            currentSession = {
                session: sNum,
                title: `Session ${sNum}: ${sTitle}`,
                questions: []
            };
            sessions[sNum] = currentSession;
            currentQuestion = null;
            continue;
        }

        if (!currentSession) continue;
        if (/^Choose the correct answer\./i.test(line)) continue;

        const qMatch = line.match(/^(\d+)\.\s+(.+)$/);
        if (qMatch) {
            const qNum = parseInt(qMatch[1], 10);
            const qText = qMatch[2].trim();
            currentQuestion = {
                qNum,
                questionText: qText,
                optionsMap: {}
            };
            currentSession.questions.push(currentQuestion);
            continue;
        }

        const optMatch = line.match(/^([A-D])\.\s+(.+)$/);
        if (optMatch && currentQuestion) {
            const optLetter = optMatch[1].toUpperCase();
            const optText = optMatch[2].trim();
            currentQuestion.optionsMap[optLetter] = optText;
            continue;
        }
    }

    let totalQuestions = 0;
    for (let s = 1; s <= 16; s++) {
        const sess = sessions[s];
        if (!sess) {
            throw new Error(`Missing Session ${s}`);
        }
        const keyMap = answerKeysBySession[s] || {};
        console.log(`Session ${s} (${sess.title}): ${sess.questions.length} questions, ${Object.keys(keyMap).length} keys`);

        if (sess.questions.length !== Object.keys(keyMap).length) {
            throw new Error(`Mismatch in Session ${s}: ${sess.questions.length} questions vs ${Object.keys(keyMap).length} keys`);
        }

        const formattedQuestions = sess.questions.map(q => {
            const opts = ['A', 'B', 'C', 'D'].map(letter => q.optionsMap[letter]);
            if (opts.some(o => !o)) {
                throw new Error(`Missing option in Session ${s} Q${q.qNum}: ${JSON.stringify(q.optionsMap)}`);
            }
            const ansLetter = keyMap[q.qNum];
            if (!ansLetter) {
                throw new Error(`Missing answer key for Session ${s} Q${q.qNum}`);
            }
            const correctAnswer = q.optionsMap[ansLetter];
            if (!correctAnswer) {
                throw new Error(`Invalid answer key ${ansLetter} for Session ${s} Q${q.qNum}`);
            }
            return {
                questionText: q.questionText,
                options: opts,
                correctAnswer,
                explanation: `Correct answer is ${ansLetter}) ${correctAnswer}.`
            };
        });

        totalQuestions += formattedQuestions.length;

        // Write JSON
        const jsonOut = {
            category: 'HTML',
            session: s,
            title: sess.title,
            totalQuestions: formattedQuestions.length,
            questions: formattedQuestions
        };
        fs.writeFileSync(
            path.resolve(__dirname, `html_session${s}.json`),
            JSON.stringify(jsonOut, null, 2),
            'utf8'
        );

        // Write CSV
        const escapeCsv = (str) => {
            const sVal = String(str ?? '');
            if (sVal.includes(',') || sVal.includes('"') || sVal.includes('\n')) {
                return `"${sVal.replace(/"/g, '""')}"`;
            }
            return sVal;
        };
        const csvLines = ['category,session,question_text,option1,option2,option3,option4,correct_answer'];
        for (const fq of formattedQuestions) {
            csvLines.push([
                escapeCsv('HTML'),
                s,
                escapeCsv(fq.questionText),
                escapeCsv(fq.options[0]),
                escapeCsv(fq.options[1]),
                escapeCsv(fq.options[2]),
                escapeCsv(fq.options[3]),
                escapeCsv(fq.correctAnswer)
            ].join(','));
        }
        fs.writeFileSync(
            path.resolve(__dirname, `html_session${s}.csv`),
            csvLines.join('\n') + '\n',
            'utf8'
        );
    }

    console.log(`\nSuccessfully parsed and wrote ${totalQuestions} total questions across 16 sessions!`);
}

parseDocx().catch(err => {
    console.error(err);
    process.exit(1);
});
