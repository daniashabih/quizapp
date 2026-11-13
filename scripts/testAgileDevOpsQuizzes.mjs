// scripts/testAgileDevOpsQuizzes.mjs
import Question from '../api/_models/questionModel.js';
import Category from '../api/_models/categoryModel.js';
import Attempt from '../api/_models/attemptModel.js';
import { AGILE_DEVOPS_QUESTIONS, AGILE_DEVOPS_SESSIONS } from '../api/_models/agileDevopsQuestionsData.js';

console.log('--- Testing Agile & DevOps Quizzes & Question Model Integration ---');

// 1. Verify dataset
console.log(`Total questions in AGILE_DEVOPS_QUESTIONS: ${AGILE_DEVOPS_QUESTIONS.length}`);
if (AGILE_DEVOPS_QUESTIONS.length !== 939) {
  throw new Error(`Expected 939 questions, got ${AGILE_DEVOPS_QUESTIONS.length}`);
}

const expectedCounts = {
  1: 59,
  2: 59,
  3: 58,
  4: 60,
  5: 60,
  6: 60,
  7: 60,
  8: 60,
  9: 60,
  10: 60,
  11: 60,
  12: 51,
  13: 60,
  14: 52,
  15: 60,
  16: 60
};

for (let s = 1; s <= 16; s++) {
  const count = AGILE_DEVOPS_QUESTIONS.filter(q => q.session === s).length;
  console.log(`- Session ${s} (${AGILE_DEVOPS_SESSIONS[s]}): ${count} questions (Expected: ${expectedCounts[s]})`);
  if (count !== expectedCounts[s]) {
    throw new Error(`Mismatch in session ${s}! Expected ${expectedCounts[s]}, got ${count}`);
  }
}
console.log('✓ All 16 session question counts match user specifications.');

// 2. Test CategoryModel.getAll()
const allCategories = await Category.getAll();
const agileCat = allCategories.find(c => Category.normalize(c.name) === Category.normalize('Agile & DevOps'));
if (!agileCat) {
  throw new Error('Agile & DevOps category not returned by Category.getAll()!');
}
console.log(`✓ Category.getAll() found "${agileCat.name}":`, {
  questionCount: agileCat.questionCount,
  sessionsCount: agileCat.sessions?.length
});

if (agileCat.questionCount < 939) {
  throw new Error(`Expected at least 939 questions in category, got ${agileCat.questionCount}`);
}
if (!agileCat.sessions || agileCat.sessions.length !== 16) {
  throw new Error(`Expected 16 sessions in category, got ${agileCat.sessions?.length}`);
}

// 3. Test Question.getSessionsByCategory()
const sessionsAgileAnd = await Question.getSessionsByCategory('Agile and DevOps');
const sessionsAgileAmp = await Question.getSessionsByCategory('Agile & DevOps');

console.log(`✓ Question.getSessionsByCategory('Agile and DevOps') returned ${sessionsAgileAnd.length} sessions.`);
console.log(`✓ Question.getSessionsByCategory('Agile & DevOps') returned ${sessionsAgileAmp.length} sessions.`);

if (sessionsAgileAnd.length !== 16 || sessionsAgileAmp.length !== 16) {
  throw new Error('Expected 16 sessions from getSessionsByCategory!');
}

// 4. Test Question.getFiltered()
const s1Questions = await Question.getFiltered({ category: 'Agile & DevOps', session: 1 });
console.log(`✓ Session 1 questions: ${s1Questions.length}`);
if (s1Questions.length !== 59) {
  throw new Error(`Expected 59 questions in session 1, got ${s1Questions.length}`);
}

const s12Questions = await Question.getFiltered({ category: 'Agile & DevOps', session: 12 });
console.log(`✓ Session 12 questions: ${s12Questions.length}`);
if (s12Questions.length !== 51) {
  throw new Error(`Expected 51 questions in session 12, got ${s12Questions.length}`);
}

const s16Questions = await Question.getFiltered({ category: 'Agile and DevOps', session: 16 });
console.log(`✓ Session 16 questions: ${s16Questions.length}`);
if (s16Questions.length !== 60) {
  throw new Error(`Expected 60 questions in session 16, got ${s16Questions.length}`);
}

const allAgileQuestions = await Question.getFiltered({ category: 'Agile & DevOps' });
console.log(`✓ All Agile & DevOps questions: ${allAgileQuestions.length}`);
if (allAgileQuestions.length !== 939) {
  throw new Error(`Expected 939 questions, got ${allAgileQuestions.length}`);
}

// 5. Test Answer Evaluation (Session 1 Question 1)
// Q1: In which decade did electronic computers evolve? Answer: B) 1940s
const q1 = s1Questions.find(q => q.question_text.includes('electronic computers evolve'));
if (!q1) throw new Error('Could not find Q1 in Session 1!');

console.log(`Testing Q1: "${q1.question_text}"`);
console.log(`Options: ${JSON.stringify(q1.options)}`);
console.log(`Correct Answer: "${q1.correct_answer}"`);

const correctIdx = Attempt.getQuestionCorrectIndex(q1);
console.log(`Correct option index for Q1: ${correctIdx} (${q1.options[correctIdx]})`);
if (q1.options[correctIdx] !== '1940s') {
  throw new Error(`Expected correct answer to be '1940s', got '${q1.options[correctIdx]}'`);
}

// Verify correctness evaluation
const evalCorrect = Attempt.evaluateAnswerCorrectness(correctIdx, q1);
const evalWrong = Attempt.evaluateAnswerCorrectness((correctIdx + 1) % 4, q1);
console.log(`Evaluation: Correct index -> ${evalCorrect}, Wrong index -> ${evalWrong}`);

if (!evalCorrect || evalWrong) {
  throw new Error('Evaluation logic mismatch for Q1!');
}

// 6. Test Answer Evaluation (Session 16 Question 60)
// Q60: Chef Automate can be used to publish new cookbooks to: Chef Supermarket (Option C)
const qLast = s16Questions[s16Questions.length - 1];
console.log(`Testing S16 Last Q: "${qLast.question_text}"`);
const correctIdxLast = Attempt.getQuestionCorrectIndex(qLast);
const evalCorrectLast = Attempt.evaluateAnswerCorrectness(correctIdxLast, qLast);
const evalWrongLast = Attempt.evaluateAnswerCorrectness((correctIdxLast + 1) % 4, qLast);
console.log(`Evaluation: Correct index -> ${evalCorrectLast}, Wrong index -> ${evalWrongLast}`);

if (!evalCorrectLast || evalWrongLast) {
  throw new Error('Evaluation logic mismatch for Session 16 Last Question!');
}

console.log('--- ALL AGILE & DEVOPS QUIZ CHECKS PASSED PERFECTLY ---');
process.exit(0);
