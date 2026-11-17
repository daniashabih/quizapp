/**
 * Verification test for C# Technology, Games, and Quiz System
 */
import Category from '../api/_models/categoryModel.js';
import Question from '../api/_models/questionModel.js';
import Attempt from '../api/_models/attemptModel.js';
import TechnologyModel from '../api/_models/technologyModel.js';
import GameModel from '../api/_models/gameModel.js';
import { CSHARP_COMPLETE_THE_CODE_QUESTIONS } from '../api/_models/csharpQuestionsData.js';
import { CSHARP_QUIZ_QUESTIONS, CSHARP_QUIZ_SESSIONS } from '../api/_models/csharpQuizQuestionsData.js';
import { TECHNOLOGY_CHALLENGES } from '../api/_models/technologyChallenges.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

async function runTests() {
    console.log('========================================================');
    console.log('🧪 TESTING C# TECHNOLOGY, GAMES, & VALIDATION');
    console.log('========================================================\n');

    // TEST 1: C# Quiz Category & Question Count
    console.log('TEST 1: Category Model - C# Category Presence & Questions');
    const categories = await Category.getAll();
    const csharpCat = categories.find(c => c.name === 'C#' || c.id === 'cat_csharp');
    assert(!!csharpCat, 'C# category exists in Category.getAll()');
    assert(csharpCat?.isEnabled === true, 'C# category is enabled (isEnabled: true)');
    assert(Number(csharpCat?.questionCount || 0) >= 713, `C# has active questions (Count: ${csharpCat?.questionCount})`);
    assert(Array.isArray(csharpCat?.sessions) && csharpCat.sessions.length === 15, `C# has 15 sessions (Sessions: ${JSON.stringify(csharpCat?.sessions)})`);

    // TEST 2: C# Questions by Session (All 15 Sessions = 713 Questions)
    console.log('\nTEST 2: Question Model - C# Questions Retrieval (15 Sessions)');
    const expectedSessionCounts = {
        1: 50, 2: 50, 3: 49, 4: 49, 5: 46,
        6: 48, 7: 46, 8: 44, 9: 50, 10: 50,
        11: 49, 12: 50, 13: 45, 14: 37, 15: 50
    };
    for (let s = 1; s <= 15; s++) {
        const sQuestions = await Question.getFiltered({ category: 'C#', session: s });
        assert(
            sQuestions.length === expectedSessionCounts[s],
            `Session ${s} (${CSHARP_QUIZ_SESSIONS[s]}) has ${expectedSessionCounts[s]} questions (Found: ${sQuestions.length})`
        );
    }

    const csharpSlugQuestions = await Question.getFiltered({ category: 'csharp' });
    assert(csharpSlugQuestions.length >= 713, `Category query with 'csharp' resolves all 713 C# questions (Found: ${csharpSlugQuestions.length})`);

    const sessions = await Question.getSessionsByCategory('C#');
    assert(sessions.length === 15, `getSessionsByCategory('C#') returns 15 sessions (Found: ${sessions.length})`);
    assert(sessions[0]?.title === 'Getting Started with C#', `Session 1 title: ${sessions[0]?.title}`);
    assert(sessions[14]?.title === 'GUI/Desktop Apps with C#', `Session 15 title: ${sessions[14]?.title}`);

    // Verify Attempt grading on in-memory C# questions
    const s1FirstQ = csharpSlugQuestions[0];
    const correctIdx = Attempt.getQuestionCorrectIndex(s1FirstQ);
    assert(correctIdx === 2, `Session 1 Q1 correct index is 2 (Found: ${correctIdx})`);
    assert(Attempt.evaluateAnswerCorrectness(correctIdx, s1FirstQ) === true, 'Correct C# option evaluates to true');
    assert(Attempt.evaluateAnswerCorrectness((correctIdx + 1) % 4, s1FirstQ) === false, 'Wrong C# option evaluates to false');

    // TEST 3: C# Technology Registration
    console.log('\nTEST 3: Technology Model - C# Technology Definition');
    const allTechs = await TechnologyModel.getAllTechnologies({ isEnabled: null });
    const csharpTech = allTechs.find(t => t.slug === 'csharp');
    assert(!!csharpTech, 'C# technology exists in TechnologyModel');
    assert(csharpTech?.name === 'C#', 'Technology name is "C#"');
    assert(csharpTech?.slug === 'csharp', 'Technology slug is "csharp"');
    assert(csharpTech?.categorySlug === 'backend-development', `Technology categorySlug is "backend-development" (Found: ${csharpTech?.categorySlug})`);
    assert(csharpTech?.icon === 'csharp', 'Technology icon is "csharp"');
    assert(csharpTech?.isEnabled === true, 'Technology is active/enabled');

    const expected7Games = [
        'complete-the-code',
        'find-the-bug',
        'output-predictor',
        'code-scramble',
        'missing-code',
        'logic-builder',
        'csharp-quiz-challenge'
    ];
    for (const gSlug of expected7Games) {
        assert(csharpTech?.supportedGames?.includes(gSlug), `C# supports game: ${gSlug}`);
    }

    // TEST 4: Backend Development Category Filter
    console.log('\nTEST 4: Category Filtering - Backend Development');
    const backendTechs = await TechnologyModel.getAllTechnologies({ categorySlug: 'backend-development' });
    const csharpInBackend = backendTechs.find(t => t.slug === 'csharp');
    assert(!!csharpInBackend, 'C# appears under "Backend Development" category filter');

    // TEST 5: C# Games Catalog
    console.log('\nTEST 5: Game Model - 7 C# Games Availability');
    const csharpGames = await GameModel.getAll({ technology: 'csharp' });
    assert(csharpGames.length >= 7, `C# games query returns at least 7 games (Found: ${csharpGames.length})`);
    for (const gSlug of expected7Games) {
        const found = csharpGames.find(g => g.slug === gSlug);
        assert(!!found, `Game "${gSlug}" is returned in C# games list`);
    }

    // TEST 6: Complete the Code Challenges (≥ 100 questions)
    console.log('\nTEST 6: Complete the Code - Question Bank');
    assert(CSHARP_COMPLETE_THE_CODE_QUESTIONS.length >= 100, `Complete the Code has ≥100 challenges (Total: ${CSHARP_COMPLETE_THE_CODE_QUESTIONS.length})`);
    const ctcChallenges = await GameModel.getChallenges('complete-the-code', { technology: 'csharp' });
    assert(ctcChallenges.length >= 100, `GameModel.getChallenges('complete-the-code') returns ≥100 challenges (Found: ${ctcChallenges.length})`);

    // Verify first challenge structure
    const sample = ctcChallenges[0];
    assert(sample.technology === 'csharp', 'Sample challenge has technology "csharp"');
    assert(sample.code && sample.code.includes('_____'), 'Sample code snippet contains missing blank "_____"');
    assert(Array.isArray(sample.options) && sample.options.length === 4, 'Sample has 4 multiple choice options');
    assert(typeof sample.explanation === 'string' && sample.explanation.length > 0, 'Sample has valid explanation');

    // TEST 7: Answer Validation (Complete the Code)
    console.log('\nTEST 7: Answer Validation - Complete the Code');
    const validAns = await GameModel.verifyChallenge('complete-the-code', sample.id, 'string');
    assert(validAns.isCorrect === true, 'Correct answer validation returns isCorrect: true');
    assert(validAns.points > 0, `Correct answer awards points (Earned: ${validAns.points})`);

    const invalidAns = await GameModel.verifyChallenge('complete-the-code', sample.id, 'INCORRECT_SYNTAX_TOKEN');
    assert(invalidAns.isCorrect === false, 'Wrong answer validation returns isCorrect: false');
    assert(invalidAns.points === 0, 'Wrong answer awards 0 points');
    assert(!!invalidAns.solution, 'Wrong answer reveals solution');
    assert(!!invalidAns.explanation, 'Wrong answer provides explanation');

    // TEST 8: C# Quiz Challenge
    console.log('\nTEST 8: C# Quiz Challenge - Game & Challenges');
    const qcChallenges = await GameModel.getChallenges('csharp-quiz-challenge', { technology: 'csharp' });
    assert(qcChallenges.length >= 15, `C# Quiz Challenge has ≥15 challenges (Found: ${qcChallenges.length})`);

    const sampleQc = qcChallenges[0];
    assert(sampleQc.gameSlug === 'csharp-quiz-challenge', 'Sample gameSlug is "csharp-quiz-challenge"');
    assert(sampleQc.options && sampleQc.options.length === 4, 'Quiz challenge has 4 options');

    const validQc = await GameModel.verifyChallenge('csharp-quiz-challenge', sampleQc.id, sampleQc.options[0]);
    assert(typeof validQc.isCorrect === 'boolean', 'Quiz challenge answer validation executed properly');

    // TEST 9: Search Query Matching
    console.log('\nTEST 9: Search Query Matching');
    const searchCSharp = await GameModel.getAll({ search: 'c#' });
    const searchCSharpSlug = await GameModel.getAll({ search: 'csharp' });
    assert(searchCSharp.length > 0, `Searching 'c#' returns games (Count: ${searchCSharp.length})`);
    assert(searchCSharpSlug.length > 0, `Searching 'csharp' returns games (Count: ${searchCSharpSlug.length})`);

    console.log('\n========================================================');
    console.log(`📊 FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test run error:', err);
    process.exit(1);
});
