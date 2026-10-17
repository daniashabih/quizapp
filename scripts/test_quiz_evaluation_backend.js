const assert = require('assert');
const quizController = require('../api/_controllers/quizController');
const Attempt = require('../api/_models/attemptModel');

console.log('--- RUNNING BACKEND REGRESSION TESTS ---');

const evalFn = quizController.evaluateAnswerCorrectness;

// Fixture 1: Standard Question with exact answer string
const qStandard = {
    id: 'q1',
    questionText: 'What is a StatelessWidget in Flutter?',
    options: ['Mutable widget', 'Immutable widget', 'A database', 'A compiler'],
    correctAnswer: 'Immutable widget'
};

// Fixture 2: Question with letter correct answer 'B'
const qLetter = {
    id: 'q2',
    questionText: 'Which keyword defines a constant in Dart?',
    options: ['var', 'const', 'let', 'val'],
    correctAnswer: 'B' // index 1
};

// Fixture 3: Shuffled options with database text answer
const qShuffled = {
    id: 'q3',
    questionText: 'What manages state in Riverpod?',
    options: ['HttpSession', 'Cookie', 'GlobalVar', 'StateNotifier'],
    correctAnswer: 'StateNotifier' // mapped to index 3 in shuffled options
};

// Fixture 4: Question with missing/invalid correct answer in database
const qInvalid = {
    id: 'q4',
    questionText: 'Corrupted database question?',
    options: ['Option 1', 'Option 2'],
    correctAnswer: 'NonExistentOption'
};

const qEmptyCorrect = {
    id: 'q5',
    questionText: 'Empty correct answer question?',
    options: ['Option 1', 'Option 2'],
    correctAnswer: ''
};

// Test 1: Selecting the correct option by index (number)
assert.strictEqual(evalFn(1, qStandard), true, 'Test 1 Failed: Correct option index should evaluate to true');

// Test 2: Selecting each incorrect option by index (number)
assert.strictEqual(evalFn(0, qStandard), false, 'Test 2a Failed: Option 0 is wrong');
assert.strictEqual(evalFn(2, qStandard), false, 'Test 2b Failed: Option 2 is wrong');
assert.strictEqual(evalFn(3, qStandard), false, 'Test 2c Failed: Option 3 is wrong');

// Test 3: Letter match in database
assert.strictEqual(evalFn(1, qLetter), true, 'Test 3 Failed: Letter B should map to index 1');
assert.strictEqual(evalFn(0, qLetter), false, 'Test 3b Failed: Letter B does not match index 0');

// Test 4: Shuffled options correctly map to database answer
assert.strictEqual(evalFn(3, qShuffled), true, 'Test 4 Failed: StateNotifier at index 3 in shuffled options should be true');
assert.strictEqual(evalFn(0, qShuffled), false, 'Test 4b Failed: Option 0 in shuffled options is wrong');

// Test 5: Missing or invalid correct-answer data in database fails safely
assert.strictEqual(evalFn(0, qInvalid), false, 'Test 5a Failed: Invalid answer must fail safely');
assert.strictEqual(evalFn(1, qInvalid), false, 'Test 5b Failed: Invalid answer must fail safely');
assert.strictEqual(evalFn(0, qEmptyCorrect), false, 'Test 5c Failed: Empty correct answer must fail safely');

// Test 6: Fabricated correctness values / object injection
assert.strictEqual(evalFn({ isCorrect: true, score: 100, selectedIndex: 0 }, qStandard), false, 'Test 6 Failed: Injected isCorrect: true must be ignored when selection is wrong');
assert.strictEqual(evalFn({ isCorrect: false, score: 0, selectedIndex: 1 }, qStandard), true, 'Test 6b Failed: Legitimate correct selection is verified independently');

// Test 7: Selection as text string
assert.strictEqual(evalFn('Immutable widget', qStandard), true, 'Test 7 Failed: Text match should be true');
assert.strictEqual(evalFn('Mutable widget', qStandard), false, 'Test 7b Failed: Wrong text match should be false');

// Test 8: Numeric string index ('1')
assert.strictEqual(evalFn('1', qStandard), true, 'Test 8 Failed: Numeric string "1" should match index 1');
assert.strictEqual(evalFn('0', qStandard), false, 'Test 8b Failed: Numeric string "0" should be false');

console.log('✅ ALL BACKEND REGRESSION TESTS PASSED (8/8 checks)');
