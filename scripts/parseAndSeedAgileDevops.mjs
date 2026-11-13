// scripts/parseAndSeedAgileDevops.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawPath = path.join(__dirname, 'raw_agile_devops_mcqs.txt');
const rawText = fs.readFileSync(rawPath, 'utf-8');

console.log('--- Parsing Agile & DevOps MCQs ---');

const lines = rawText.split(/\r?\n/);
let currentSession = null;
let currentSessionTitle = '';
const sessionTitles = {
  1: 'Software Characteristics',
  2: 'Software Development Life Cycle',
  3: 'Linear Process Models',
  4: 'Iterative Process Models',
  5: 'Specialized Process Models',
  6: 'Agile Software Development - I',
  7: 'Agile Software Development - II',
  8: 'Extreme Programming',
  9: 'Scrum',
  10: 'Agile Process Models - I',
  11: 'Agile Process Models - II',
  12: 'Comparing Agile with Traditional Models',
  13: 'Introduction to DevOps and Configuration Management',
  14: 'Continuous Integration and Delivery',
  15: 'Continuous Deployment and Monitoring',
  16: 'DevOps Tools'
};

const questions = [];
let currentQ = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const sessionMatch = line.match(/^Session\s+(\d+)\s*:\s*(.+)$/i);
  if (sessionMatch) {
    currentSession = parseInt(sessionMatch[1], 10);
    currentSessionTitle = sessionMatch[2].trim();
    continue;
  }

  if (line.match(/^\d+\s+questions$/i)) {
    continue;
  }

  const qMatch = line.match(/^Q(\d+)\.\s*(.+)$/i);
  if (qMatch) {
    if (currentQ) {
      questions.push(currentQ);
    }
    currentQ = {
      id: `agile_devops_s${String(currentSession).padStart(2, '0')}_q${String(qMatch[1]).padStart(3, '0')}`,
      session: currentSession,
      sessionTitle: currentSessionTitle || sessionTitles[currentSession] || `Session ${currentSession}`,
      qNum: parseInt(qMatch[1], 10),
      questionText: qMatch[2].trim(),
      options: [],
      correctLetter: '',
      correctAnswer: '',
      explanation: ''
    };
    continue;
  }

  const optMatch = line.match(/^([A-D])\)\s*(.+)$/);
  if (optMatch && currentQ) {
    const letter = optMatch[1].toUpperCase();
    const optText = optMatch[2].trim();
    currentQ.options.push(optText);
    continue;
  }

  const ansMatch = line.match(/^Answer:\s*([A-D])(?:\)\s*(.*))?$/i);
  if (ansMatch && currentQ) {
    const letter = ansMatch[1].toUpperCase();
    const restText = (ansMatch[2] || '').trim();
    currentQ.correctLetter = letter;
    const letterIdx = letter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
    if (currentQ.options[letterIdx]) {
      currentQ.correctAnswer = currentQ.options[letterIdx];
    } else if (restText) {
      currentQ.correctAnswer = restText;
    } else {
      currentQ.correctAnswer = letter;
    }
    currentQ.explanation = `The correct answer is ${letter}) ${currentQ.correctAnswer}. (${currentQ.sessionTitle})`;
    continue;
  }
}

if (currentQ) {
  questions.push(currentQ);
}

console.log(`Total questions parsed: ${questions.length}`);

// Group by session and verify counts
const bySession = {};
for (let s = 1; s <= 16; s++) {
  bySession[s] = questions.filter(q => q.session === s);
  console.log(`Session ${s} (${sessionTitles[s]}): ${bySession[s].length} questions`);
}

// Integrity checks
for (const q of questions) {
  if (!q.session || q.session < 1 || q.session > 16) {
    throw new Error(`Invalid session for question: ${JSON.stringify(q)}`);
  }
  if (!q.questionText) {
    throw new Error(`Missing questionText for ${q.id}`);
  }
  if (q.options.length !== 4) {
    throw new Error(`Question ${q.id} (Session ${q.session} Q${q.qNum}) does not have 4 options: ${JSON.stringify(q.options)}`);
  }
  if (!q.correctAnswer) {
    throw new Error(`Missing correctAnswer for ${q.id}`);
  }
  if (!q.options.includes(q.correctAnswer)) {
    throw new Error(`Question ${q.id} correctAnswer "${q.correctAnswer}" not in options: ${JSON.stringify(q.options)}`);
  }
}

console.log('✓ All integrity checks passed!');

// Write to api/_models/agileDevopsQuestionsData.js
const cleanQuestions = questions.map(q => ({
  id: q.id,
  category: 'Agile and DevOps',
  session: q.session,
  sessionTitle: q.sessionTitle,
  questionText: q.questionText,
  options: q.options,
  correctAnswer: q.correctAnswer,
  explanation: q.explanation
}));

const fileContent = `/**
 * Comprehensive Question Bank for Agile & DevOps (16 Sessions, 939 Questions)
 * Category: Agile and DevOps
 */

const AGILE_DEVOPS_SESSIONS = ${JSON.stringify(sessionTitles, null, 2)};

const AGILE_DEVOPS_QUESTIONS = ${JSON.stringify(cleanQuestions, null, 2)};

module.exports = {
    AGILE_DEVOPS_SESSIONS,
    AGILE_DEVOPS_QUESTIONS
};
module.exports.default = AGILE_DEVOPS_QUESTIONS;
`;

const outputPath = path.join(__dirname, '..', 'api', '_models', 'agileDevopsQuestionsData.js');
fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log(`✓ Successfully generated ${outputPath}`);

// Check file size
const stats = fs.statSync(outputPath);
console.log(`  File size: ${(stats.size / 1024).toFixed(2)} KB`);
