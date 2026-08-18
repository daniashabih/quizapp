const prisma = require('../api/_config/prisma');

const sampleQuestions = [
    // --- REACT.JS (Beginner) ---
    {
        category: 'React.js',
        questionText: 'What hook is used to manage local component state in functional React components?',
        options: ['useMemo', 'useState', 'useEffect', 'useReducer'],
        correctAnswer: 'useState',
        difficulty: 'beginner'
    },
    {
        category: 'React.js',
        questionText: 'What is JSX in React?',
        options: ['A database query language', 'A JavaScript syntax extension allowing HTML-like code', 'A server-side routing engine', 'A CSS styling framework'],
        correctAnswer: 'A JavaScript syntax extension allowing HTML-like code',
        difficulty: 'beginner'
    },
    {
        category: 'React.js',
        questionText: 'How are read-only properties passed from a parent to a child component in React?',
        options: ['State', 'Props', 'Redux Store', 'Context'],
        correctAnswer: 'Props',
        difficulty: 'beginner'
    },
    // --- REACT.JS (Intermediate) ---
    {
        category: 'React.js',
        questionText: 'What is the primary purpose of the useEffect dependency array?',
        options: ['To configure CSS classes', 'To specify values that trigger effect re-execution when changed', 'To define component prop types', 'To bind component event listeners globally'],
        correctAnswer: 'To specify values that trigger effect re-execution when changed',
        difficulty: 'intermediate'
    },
    {
        category: 'React.js',
        questionText: 'Which React API is used to memoize expensive function calculations across renders?',
        options: ['useCallback', 'useMemo', 'useRef', 'useImperativeHandle'],
        correctAnswer: 'useMemo',
        difficulty: 'intermediate'
    },
    // --- REACT.JS (Expert) ---
    {
        category: 'React.js',
        questionText: 'In React 18 Concurrent Mode, how does useTransition differ from useDeferredValue?',
        options: [
            'useTransition wraps state updates to mark them as non-urgent, while useDeferredValue defers a specific value',
            'useTransition only works with Promises, while useDeferredValue works with numbers',
            'useTransition operates synchronously on the main thread',
            'There is no functional difference between them'
        ],
        correctAnswer: 'useTransition wraps state updates to mark them as non-urgent, while useDeferredValue defers a specific value',
        difficulty: 'expert'
    },

    // --- JAVASCRIPT (Beginner) ---
    {
        category: 'JavaScript',
        questionText: 'What will typeof NaN evaluate to in JavaScript?',
        options: ['undefined', 'number', 'nan', 'object'],
        correctAnswer: 'number',
        difficulty: 'beginner'
    },
    {
        category: 'JavaScript',
        questionText: 'Which keyword declares a block-scoped variable that can be reassigned?',
        options: ['const', 'var', 'let', 'static'],
        correctAnswer: 'let',
        difficulty: 'beginner'
    },
    {
        category: 'JavaScript',
        questionText: 'What method converts a JavaScript object into a JSON string?',
        options: ['JSON.parse()', 'JSON.stringify()', 'Object.toString()', 'JSON.encode()'],
        correctAnswer: 'JSON.stringify()',
        difficulty: 'beginner'
    },
    // --- JAVASCRIPT (Intermediate) ---
    {
        category: 'JavaScript',
        questionText: 'What is a Closure in JavaScript?',
        options: [
            'A method to close browser windows',
            'A function bundled together with references to its surrounding lexical environment',
            'A syntax error caused by missing braces',
            'A way to terminate asynchronous workers'
        ],
        correctAnswer: 'A function bundled together with references to its surrounding lexical environment',
        difficulty: 'intermediate'
    },
    {
        category: 'JavaScript',
        questionText: 'What does the Promise.allSettled() method return when all promises finish?',
        options: [
            'Only the first resolved promise',
            'An array of objects describing the outcome (fulfilled or rejected) of each promise',
            'It rejects immediately if any single promise fails',
            'A single merged object with values'
        ],
        correctAnswer: 'An array of objects describing the outcome (fulfilled or rejected) of each promise',
        difficulty: 'intermediate'
    },
    // --- JAVASCRIPT (Expert) ---
    {
        category: 'JavaScript',
        questionText: 'How does the JavaScript Event Loop handle microtasks compared to macrotasks (task queue)?',
        options: [
            'Microtasks and macrotasks are processed in random order',
            'Microtasks are executed immediately after the current synchronous script and before the next macrotask',
            'Macrotasks always take priority over microtasks',
            'Microtasks run on a separate background thread in parallel'
        ],
        correctAnswer: 'Microtasks are executed immediately after the current synchronous script and before the next macrotask',
        difficulty: 'expert'
    },

    // --- PYTHON (Beginner) ---
    {
        category: 'Python',
        questionText: 'Which keyword is used to define a function in Python?',
        options: ['function', 'func', 'def', 'define'],
        correctAnswer: 'def',
        difficulty: 'beginner'
    },
    {
        category: 'Python',
        questionText: 'Which data structure in Python is immutable?',
        options: ['List', 'Dictionary', 'Set', 'Tuple'],
        correctAnswer: 'Tuple',
        difficulty: 'beginner'
    },
    // --- PYTHON (Intermediate) ---
    {
        category: 'Python',
        questionText: 'What is the purpose of the yield keyword in Python?',
        options: [
            'To immediately stop execution of the program',
            'To turn a function into a generator that produces a sequence of values lazily',
            'To declare a class attribute',
            'To import external modules concurrently'
        ],
        correctAnswer: 'To turn a function into a generator that produces a sequence of values lazily',
        difficulty: 'intermediate'
    },
    // --- PYTHON (Expert) ---
    {
        category: 'Python',
        questionText: 'How does Python Global Interpreter Lock (GIL) affect multithreaded CPU-bound programs?',
        options: [
            'It accelerates CPU execution across all cores automatically',
            'It prevents multiple native threads from executing Python bytecodes simultaneously on multiple CPU cores',
            'It completely disables multithreading in Python',
            'It only affects asynchronous I/O operations'
        ],
        correctAnswer: 'It prevents multiple native threads from executing Python bytecodes simultaneously on multiple CPU cores',
        difficulty: 'expert'
    },

    // --- NODE.JS (Beginner) ---
    {
        category: 'Node.js',
        questionText: 'Which global object provides information about the current Node.js execution environment and variables?',
        options: ['window', 'document', 'process', 'globalThis.env'],
        correctAnswer: 'process',
        difficulty: 'beginner'
    },
    // --- NODE.JS (Intermediate) ---
    {
        category: 'Node.js',
        questionText: 'What is the primary benefit of Streams in Node.js?',
        options: [
            'Handling reading/writing data chunk by chunk without loading the entire payload into memory',
            'Encrypting HTTP headers automatically',
            'Replacing the database query layer',
            'Creating multi-core cluster workers'
        ],
        correctAnswer: 'Handling reading/writing data chunk by chunk without loading the entire payload into memory',
        difficulty: 'intermediate'
    },
    // --- NODE.JS (Expert) ---
    {
        category: 'Node.js',
        questionText: 'In libuv event loop architecture, in which phase are process.nextTick() callbacks processed?',
        options: [
            'Only inside the Poll phase',
            'Immediately after the current operation finishes, before the event loop continues to the next phase',
            'At the very end of the Check phase',
            'Inside the Timers phase only'
        ],
        correctAnswer: 'Immediately after the current operation finishes, before the event loop continues to the next phase',
        difficulty: 'expert'
    },

    // --- HTML & CSS (Beginner) ---
    {
        category: 'HTML & CSS',
        questionText: 'Which HTML element is the correct semantic tag for the highest-priority page heading?',
        options: ['<head>', '<h1>', '<header>', '<title>'],
        correctAnswer: '<h1>',
        difficulty: 'beginner'
    },
    // --- HTML & CSS (Intermediate) ---
    {
        category: 'HTML & CSS',
        questionText: 'In CSS Flexbox, which property aligns flex items along the cross-axis?',
        options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
        correctAnswer: 'align-items',
        difficulty: 'intermediate'
    },
    // --- HTML & CSS (Expert) ---
    {
        category: 'HTML & CSS',
        questionText: 'What is CSS Specificity hierarchy from highest to lowest?',
        options: [
            'Inline styles > IDs > Classes/Attributes/Pseudo-classes > Elements/Pseudo-elements',
            'IDs > Inline styles > Classes > Elements',
            'Elements > Classes > IDs > Inline styles',
            'Classes > IDs > Inline styles > Elements'
        ],
        correctAnswer: 'Inline styles > IDs > Classes/Attributes/Pseudo-classes > Elements/Pseudo-elements',
        difficulty: 'expert'
    }
];

async function seedQuestions() {
    try {
        console.log('====================================================');
        console.log('       SEEDING CATEGORIES & QUESTION BANK          ');
        console.log('====================================================\n');

        const uniqueCategories = [...new Set(sampleQuestions.map(q => q.category))];

        console.log(`Ensuring ${uniqueCategories.length} categories exist...`);
        for (const catName of uniqueCategories) {
            const existing = await prisma.category.findFirst({
                where: { name: { equals: catName } }
            });
            if (!existing) {
                const created = await prisma.category.create({ data: { name: catName } });
                console.log(`  ➕ Created category: "${catName}" (ID: ${created.id})`);
            } else {
                console.log(`  ✔ Category already exists: "${catName}" (ID: ${existing.id})`);
            }
        }

        console.log(`\nChecking and inserting ${sampleQuestions.length} questions...`);
        let insertedCount = 0;
        let existingCount = 0;

        for (const q of sampleQuestions) {
            const existing = await prisma.question.findFirst({
                where: {
                    category: { equals: q.category },
                    questionText: { equals: q.questionText }
                }
            });

            if (!existing) {
                await prisma.question.create({
                    data: {
                        category: q.category,
                        questionText: q.questionText,
                        options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer
                    }
                });
                insertedCount++;
            } else {
                existingCount++;
            }
        }

        console.log(`\n====================================================`);
        console.log(`🎉 SEED COMPLETE:`);
        console.log(`   - New questions inserted: ${insertedCount}`);
        console.log(`   - Existing questions kept: ${existingCount}`);
        console.log(`   - Total in questions bank: ${insertedCount + existingCount}`);
        console.log(`====================================================\n`);

    } catch (error) {
        console.error('❌ Failed to seed question bank:', error);
        process.exit(1);
    }
}

seedQuestions();
