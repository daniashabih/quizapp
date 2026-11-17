// scripts/parseAndSeedCSharp.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawPath = path.join(__dirname, 'raw_csharp_mcqs.txt');
const rawText = fs.readFileSync(rawPath, 'utf-8');

console.log('--- Parsing C# Session-Wise MCQs (Sessions 1-15) ---');

const lines = rawText.split(/\r?\n/);

const sessionTitles = {};
const questionsBySession = new Map();
const answerKeysBySession = new Map();

let currentSession = null;
let currentSessionTitle = '';
let inAnswerKey = false;
let currentQ = null;

const flushCurrentQuestion = () => {
    if (currentQ) {
        if (!questionsBySession.has(currentQ.session)) {
            questionsBySession.set(currentQ.session, []);
        }
        questionsBySession.get(currentQ.session).push(currentQ);
        currentQ = null;
    }
};

for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    // Session Header: "Session 1: Getting Started with C#"
    const sessionMatch = line.match(/^Session\s+(\d+)\s*:\s*(.+)$/i);
    if (sessionMatch) {
        flushCurrentQuestion();
        currentSession = parseInt(sessionMatch[1], 10);
        currentSessionTitle = sessionMatch[2].trim();
        sessionTitles[currentSession] = currentSessionTitle;
        inAnswerKey = false;
        if (!answerKeysBySession.has(currentSession)) {
            answerKeysBySession.set(currentSession, new Map());
        }
        continue;
    }

    // Answer Key Header: "Session 1 Answer Key"
    const keyHeaderMatch = line.match(/^Session\s+(\d+)\s+Answer\s+Key$/i);
    if (keyHeaderMatch) {
        flushCurrentQuestion();
        const keySession = parseInt(keyHeaderMatch[1], 10);
        if (keySession !== currentSession) {
            throw new Error(`Answer Key session ${keySession} does not match current session ${currentSession}`);
        }
        inAnswerKey = true;
        continue;
    }

    if (line === 'Choose the one correct option for each question.') {
        continue;
    }

    if (inAnswerKey) {
        // Skip header row "Q\tAnswer\tQ\tAnswer"
        if (/^Q\s+Answer/i.test(line)) {
            continue;
        }
        const cols = rawLine.split('\t').map(c => c.trim());
        // Process pairs of (qNum, ansStr) at indices (0,1), (2,3), etc.
        for (let c = 0; c + 1 < cols.length; c += 2) {
            const qNumStr = cols[c];
            const ansStr = cols[c + 1];
            if (!qNumStr && !ansStr) continue;
            if (!/^\d+$/.test(qNumStr)) {
                throw new Error(`Unexpected answer key Q number "${qNumStr}" on line ${i + 1}: ${line}`);
            }
            const qNum = parseInt(qNumStr, 10);
            const ansMatch = ansStr.match(/^([A-D])\)\s*(.+)$/);
            if (!ansMatch) {
                throw new Error(`Unexpected answer key value "${ansStr}" for Session ${currentSession} Q${qNum} on line ${i + 1}`);
            }
            const letter = ansMatch[1].toUpperCase();
            const text = ansMatch[2].trim();
            answerKeysBySession.get(currentSession).set(qNum, { letter, text });
        }
        continue;
    }

    // Question Line: "Q1. ..."
    const qMatch = line.match(/^Q(\d+)\.\s*(.+)$/);
    if (qMatch) {
        flushCurrentQuestion();
        const qNum = parseInt(qMatch[1], 10);
        currentQ = {
            id: `csharp_s${String(currentSession).padStart(2, '0')}_q${String(qNum).padStart(3, '0')}`,
            category: 'C#',
            session: currentSession,
            sessionTitle: currentSessionTitle,
            qNum,
            questionText: qMatch[2].trim(),
            options: [],
            correctAnswer: '',
            explanation: ''
        };
        continue;
    }

    // Option Line: "A) ..."
    const optMatch = line.match(/^([A-D])\)\s*(.+)$/);
    if (optMatch && currentQ) {
        const expectedLetter = String.fromCharCode(65 + currentQ.options.length);
        const actualLetter = optMatch[1].toUpperCase();
        if (actualLetter !== expectedLetter) {
            throw new Error(
                `Session ${currentQ.session} Q${currentQ.qNum}: expected option ${expectedLetter}, got ${actualLetter} on line ${i + 1}`
            );
        }
        currentQ.options.push(optMatch[2].trim());
        continue;
    }

    throw new Error(`Unrecognized line ${i + 1} in Session ${currentSession}: ${line}`);
}

flushCurrentQuestion();

// Validate all 15 sessions and merge answer keys
const sessionNumbers = Array.from(questionsBySession.keys()).sort((a, b) => a - b);
if (sessionNumbers.length !== 15 || sessionNumbers[0] !== 1 || sessionNumbers[14] !== 15) {
    throw new Error(`Expected exactly 15 sessions (1..15), got: ${JSON.stringify(sessionNumbers)}`);
}

const allCleanQuestions = [];

for (const s of sessionNumbers) {
    const qs = questionsBySession.get(s);
    const keyMap = answerKeysBySession.get(s);

    if (!keyMap || keyMap.size !== qs.length) {
        throw new Error(`Session ${s}: question count (${qs.length}) != answer key count (${keyMap ? keyMap.size : 0})`);
    }

    for (let idx = 0; idx < qs.length; idx++) {
        const q = qs[idx];
        const expectedQNum = idx + 1;
        if (q.qNum !== expectedQNum) {
            throw new Error(`Session ${s}: expected Q${expectedQNum}, got Q${q.qNum}`);
        }
        if (q.options.length !== 4) {
            throw new Error(`Session ${s} Q${q.qNum}: expected 4 options, got ${q.options.length}`);
        }

        const keyEntry = keyMap.get(q.qNum);
        if (!keyEntry) {
            throw new Error(`Session ${s} Q${q.qNum}: missing from answer key`);
        }

        const letterIdx = keyEntry.letter.charCodeAt(0) - 65;
        const optionAtLetter = q.options[letterIdx];
        if (!optionAtLetter) {
            throw new Error(`Session ${s} Q${q.qNum}: invalid answer letter ${keyEntry.letter}`);
        }
        if (optionAtLetter !== keyEntry.text) {
            throw new Error(
                `Session ${s} Q${q.qNum}: answer key text "${keyEntry.text}" != option ${keyEntry.letter} "${optionAtLetter}"`
            );
        }

        q.correctAnswer = optionAtLetter;
        q.explanation = `The correct answer is ${keyEntry.letter}) ${optionAtLetter}. (${q.sessionTitle})`;

        allCleanQuestions.push({
            id: q.id,
            category: 'C#',
            session: q.session,
            sessionTitle: q.sessionTitle,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
        });
    }

    console.log(`  Session ${String(s).padStart(2, '0')} (${sessionTitles[s]}): ${qs.length} questions verified`);

    // Write per-session JSON file (matching dart_session*.json / html_session*.json format)
    const sessionJsonPath = path.join(__dirname, `csharp_session${s}.json`);
    const sessionPayload = {
        category: 'C#',
        session: s,
        title: `Session ${s}: ${sessionTitles[s]}`,
        sessionTitle: sessionTitles[s],
        totalQuestions: qs.length,
        questions: qs.map(q => ({
            id: q.id,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
        }))
    };
    fs.writeFileSync(sessionJsonPath, JSON.stringify(sessionPayload, null, 2) + '\n', 'utf-8');
}

console.log(`\n✓ Total verified C# questions across 15 sessions: ${allCleanQuestions.length}`);

// Write api/_models/csharpQuizQuestionsData.js
const modelContent = `/**
 * Comprehensive Session-Wise Question Bank for C# (15 Sessions, ${allCleanQuestions.length} Questions)
 * Category: C#
 */

const CSHARP_QUIZ_SESSIONS = ${JSON.stringify(sessionTitles, null, 4)};

const CSHARP_QUIZ_QUESTIONS = ${JSON.stringify(allCleanQuestions, null, 4)};

module.exports = {
    CSHARP_QUIZ_QUESTIONS,
    CSHARP_QUIZ_SESSIONS
};
module.exports.default = CSHARP_QUIZ_QUESTIONS;
`;

const outputModelPath = path.join(__dirname, '..', 'api', '_models', 'csharpQuizQuestionsData.js');
fs.writeFileSync(outputModelPath, modelContent, 'utf-8');
console.log(`✓ Generated ${outputModelPath}`);
console.log(`✓ Generated csharp_session1.json through csharp_session15.json in scripts/`);
