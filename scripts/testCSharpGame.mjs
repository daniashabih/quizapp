// scripts/testCSharpGame.mjs
import { CSHARP_COMPLETE_THE_CODE_QUESTIONS } from '../api/_models/csharpQuestionsData.js';
import GameModel from '../api/_models/gameModel.js';
import TechnologyModel from '../api/_models/technologyModel.js';

console.log('--- Testing C# Complete the Code Questions and Model Integration ---');

// 1. Check questions count and schema
console.log(`Total C# Questions: ${CSHARP_COMPLETE_THE_CODE_QUESTIONS.length}`);
if (CSHARP_COMPLETE_THE_CODE_QUESTIONS.length !== 105) {
  throw new Error(`Expected 105 questions, got ${CSHARP_COMPLETE_THE_CODE_QUESTIONS.length}`);
}

const beginner = CSHARP_COMPLETE_THE_CODE_QUESTIONS.filter(q => q.difficulty.toLowerCase() === 'beginner');
const intermediate = CSHARP_COMPLETE_THE_CODE_QUESTIONS.filter(q => q.difficulty.toLowerCase() === 'intermediate');
const advanced = CSHARP_COMPLETE_THE_CODE_QUESTIONS.filter(q => q.difficulty.toLowerCase() === 'advanced');

console.log(`- Beginner: ${beginner.length}`);
console.log(`- Intermediate: ${intermediate.length}`);
console.log(`- Advanced: ${advanced.length}`);

if (beginner.length !== 35 || intermediate.length !== 35 || advanced.length !== 35) {
  throw new Error('Difficulty distribution mismatch! Expected 35 per difficulty level.');
}

// Check question integrity
for (const q of CSHARP_COMPLETE_THE_CODE_QUESTIONS) {
  const ans = q.solution || q.blank;
  if (!q.id || !q.title || !ans || !q.options || !q.explanation) {
    throw new Error(`Question ${q.id} missing required fields!`);
  }
  const code = q.code || `${q.codeBefore}___${q.codeAfter}`;
  if (!code.includes('___') && !code.includes('_____')) {
    throw new Error(`Question ${q.id} code snippet does not contain interactive blank '___'!`);
  }
  if (!q.options.includes(ans)) {
    throw new Error(`Question ${q.id} answer "${ans}" is not in options: ${JSON.stringify(q.options)}`);
  }
}
console.log('✓ All 105 questions passed validation integrity checks.');

// 2. Check TechnologyModel
const technologies = await TechnologyModel.getAllTechnologies();
const csharpTech = technologies.find(t => t.slug === 'csharp' || t.id === 'tech_csharp');
if (!csharpTech) {
  throw new Error('C# technology not found in TechnologyModel!');
}
console.log(`✓ Found C# technology: ${csharpTech.name}`);
console.log(`  Supported Games: ${JSON.stringify(csharpTech.supportedGames)}`);
if (!csharpTech.supportedGames.includes('complete-the-code')) {
  throw new Error('C# does not list complete-the-code in supportedGames!');
}

// 3. Check GameModel.findBySlug
const game1 = await GameModel.findBySlug('complete-the-code');
const game2 = await GameModel.findBySlug('csharp-complete-the-code');
if (!game1 || !game2) {
  throw new Error('Failed to find complete-the-code game by slug or alias!');
}
console.log(`✓ Found game: ${game1.title} (${game1.slug})`);

// 4. Check getChallenges
const allChallenges = await GameModel.getChallenges('complete-the-code');
console.log(`✓ GameModel.getChallenges('complete-the-code') returned: ${allChallenges.length} challenges`);
if (allChallenges.length < 105) {
  throw new Error(`Expected at least 105 challenges, got ${allChallenges.length}`);
}

const beginnerChallenges = await GameModel.getChallenges('complete-the-code', { difficulty: 'beginner' });
console.log(`✓ Beginner challenges returned: ${beginnerChallenges.length}`);
if (beginnerChallenges.length !== 35) {
  throw new Error(`Expected 35 beginner challenges, got ${beginnerChallenges.length}`);
}

const intermediateChallenges = await GameModel.getChallenges('complete-the-code', { difficulty: 'intermediate' });
console.log(`✓ Intermediate challenges returned: ${intermediateChallenges.length}`);
if (intermediateChallenges.length !== 35) {
  throw new Error(`Expected 35 intermediate challenges, got ${intermediateChallenges.length}`);
}

const advancedChallenges = await GameModel.getChallenges('complete-the-code', { difficulty: 'advanced' });
console.log(`✓ Advanced challenges returned: ${advancedChallenges.length}`);
if (advancedChallenges.length !== 35) {
  throw new Error(`Expected 35 advanced challenges, got ${advancedChallenges.length}`);
}

// 5. Test Answer Verification (Correct - String and Object)
const sample = CSHARP_COMPLETE_THE_CODE_QUESTIONS[0];
const sampleAnswer = sample.solution || sample.blank;
const verifyCorrectStr = await GameModel.verifyChallenge('complete-the-code', sample.id, sampleAnswer);
console.log(`✓ Verification with correct string answer "${sampleAnswer}":`, verifyCorrectStr);
if (!verifyCorrectStr.isCorrect) {
  throw new Error(`Expected verification to be true for correct answer! Result: ${JSON.stringify(verifyCorrectStr)}`);
}

const verifyCorrectObj = await GameModel.verifyChallenge('complete-the-code', sample.id, { answer: sampleAnswer });
console.log(`✓ Verification with correct object answer:`, verifyCorrectObj);
if (!verifyCorrectObj.isCorrect) {
  throw new Error(`Expected verification to be true for correct object answer! Result: ${JSON.stringify(verifyCorrectObj)}`);
}

// 6. Test Answer Verification (Incorrect)
const verifyWrong = await GameModel.verifyChallenge('complete-the-code', sample.id, 'definitely_wrong_token');
console.log(`✓ Verification with wrong answer:`, verifyWrong);
if (verifyWrong.isCorrect || !verifyWrong.explanation) {
  throw new Error(`Expected verification to be false with explanation! Result: ${JSON.stringify(verifyWrong)}`);
}

// 7. Test Game Session Progress Save and Resume
const testUser = 'user_test_verify_csharp';
await GameModel.saveActiveProgress(testUser, 'complete-the-code', {
  currentIdx: 5,
  score: 650,
  streak: 5,
  difficulty: 'Beginner'
});
const retrievedProgress = await GameModel.getActiveProgress(testUser, 'complete-the-code');
console.log('✓ Retrieved saved progress:', retrievedProgress);
if (!retrievedProgress || retrievedProgress.currentIdx !== 5 || retrievedProgress.score !== 650) {
  throw new Error('Active progress save/retrieve failed!');
}
await GameModel.clearActiveProgress(testUser, 'complete-the-code');
const clearedProgress = await GameModel.getActiveProgress(testUser, 'complete-the-code');
if (clearedProgress !== null) {
  throw new Error('Active progress clear failed!');
}
console.log('✓ Progress clear verified.');

console.log('--- ALL BACKEND CHECKS PASSED PERFECTLY ---');
process.exit(0);
