const prisma = require('../_config/prisma');

const INITIAL_GAMES = [
    // --- 8 CODING GAMES ---
    {
        id: 'game_code_puzzle',
        slug: 'code-puzzle',
        title: 'Code Puzzle',
        category: 'Coding Games',
        badge: 'Popular',
        cardSize: 'large',
        difficulty: 'Intermediate',
        rating: 4.9,
        playsCount: 3840,
        order: 1,
        isPublished: true,
        isFeatured: true,
        thumbnail: 'gradient-indigo',
        description: 'Arrange shuffled programming code blocks in the correct logical order to complete working snippets.',
        instructions: 'Drag, reorder, or click the code blocks to arrange them from top to bottom into a valid, working program. Switch between HTML, CSS, JavaScript, PHP, Python, and SQL!'
    },
    {
        id: 'game_find_the_bug',
        slug: 'find-the-bug',
        title: 'Find the Bug',
        category: 'Coding Games',
        badge: 'Hot',
        cardSize: 'tall',
        difficulty: 'Beginner',
        rating: 4.9,
        playsCount: 4210,
        order: 2,
        isPublished: true,
        isFeatured: true,
        thumbnail: 'gradient-rose',
        description: 'Spot syntax, logic, and type errors hidden in real code snippets and click the buggy line.',
        instructions: 'Inspect the code snippet carefully with line numbers. Click or tap the exact line where the defect exists, then read the explanation and fix!'
    },
    {
        id: 'game_output_predictor',
        slug: 'output-predictor',
        title: 'Output Predictor',
        category: 'Coding Games',
        badge: 'Brain Boost',
        cardSize: 'medium',
        difficulty: 'Intermediate',
        rating: 4.8,
        playsCount: 3120,
        order: 3,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-amber',
        description: 'Trace loops, closures, scope, and operations to predict the exact terminal output before code runs.',
        instructions: 'Read the snippet and predict what will be logged to console or returned. Choose from multiple options or type your prediction, then review step-by-step evaluation.'
    },
    {
        id: 'game_code_scramble',
        slug: 'code-scramble',
        title: 'Code Scramble',
        category: 'Coding Games',
        badge: 'Challenge',
        cardSize: 'medium',
        difficulty: 'Intermediate',
        rating: 4.7,
        playsCount: 2650,
        order: 4,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-cyan',
        description: 'Rearrange scrambled programming statements into the correct executable sequence.',
        instructions: 'Move scrambled statements up and down until they form a coherent, executable algorithm. Test your understanding of program flow.'
    },
    {
        id: 'game_missing_code',
        slug: 'missing-code',
        title: 'Missing Code',
        category: 'Coding Games',
        badge: 'Featured',
        cardSize: 'large',
        difficulty: 'Beginner',
        rating: 4.9,
        playsCount: 3590,
        order: 5,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-emerald',
        description: 'Fill in missing keywords, expressions, and syntax tokens to complete defective code structures.',
        instructions: 'Locate the blank spaces (_____) in the code editor. Select the correct syntax keyword or token from the choices to restore functionality.'
    },
    {
        id: 'game_logic_builder',
        slug: 'logic-builder',
        title: 'Logic Builder',
        category: 'Coding Games',
        badge: 'Mental Gym',
        cardSize: 'medium',
        difficulty: 'Advanced',
        rating: 4.8,
        playsCount: 2890,
        order: 6,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-purple',
        description: 'Solve programmatic logic puzzles involving sequences, truth tables, loop bounds, and array transforms.',
        instructions: 'Analyze problem requirements and configure inputs, conditional branches, or loop steps to satisfy the algorithmic test cases.'
    },
    {
        id: 'game_sql_challenge',
        slug: 'sql-challenge',
        title: 'SQL Challenge',
        category: 'Coding Games',
        badge: 'Database Pro',
        cardSize: 'wide',
        difficulty: 'Intermediate',
        rating: 4.9,
        playsCount: 3780,
        order: 7,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-teal',
        description: 'Write SQL queries (SELECT, WHERE, JOIN, GROUP BY) against practice schemas to retrieve target datasets.',
        instructions: 'Review the sample relational tables (Students, Courses, Orders). Write queries in the safe interactive SQL editor and execute against isolated client-side test data. Never touches production!'
    },
    {
        id: 'game_memory_match',
        slug: 'memory-match',
        title: 'Memory Match',
        category: 'Coding Games',
        badge: 'Quick Mind',
        cardSize: 'medium',
        difficulty: 'Beginner',
        rating: 4.8,
        playsCount: 4500,
        order: 8,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-blue',
        description: 'Match programming concepts and syntax with their correct definitions and code outputs.',
        instructions: 'Flip cards two at a time to pair programming terms (like Closure, Polymorphism, Foreign Key, Flexbox) with their accurate definitions or code output pairs.'
    },

    // --- 6 TYPING GAMES ---
    {
        id: 'game_speed_typing',
        slug: 'speed-typing',
        title: 'Speed Typing',
        category: 'Typing Games',
        badge: 'High Speed',
        cardSize: 'large',
        difficulty: 'All Levels',
        rating: 4.9,
        playsCount: 5210,
        order: 9,
        isPublished: true,
        isFeatured: true,
        thumbnail: 'gradient-emerald',
        description: 'Type developer articles, documentation, and technical passages with live WPM and accuracy tracking.',
        instructions: 'Start typing the displayed text. Monitor your live Words Per Minute (WPM), accuracy percentage, and Characters Per Minute (CPM) in real time.'
    },
    {
        id: 'game_code_typing',
        slug: 'code-typing',
        title: 'Code Typing',
        category: 'Typing Games',
        badge: 'Dev Stamina',
        cardSize: 'tall',
        difficulty: 'Intermediate',
        rating: 4.9,
        playsCount: 4890,
        order: 10,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-indigo',
        description: 'Practice typing authentic syntax and code snippets across JavaScript, Python, PHP, HTML, CSS, and SQL.',
        instructions: 'Type out indented, syntax-highlighted code character-by-character. Trains muscle memory for camelCase, indentation, and syntax structures.'
    },
    {
        id: 'game_sixty_second',
        slug: 'sixty-second-challenge',
        title: '60-Second Challenge',
        category: 'Typing Games',
        badge: 'Sprint',
        cardSize: 'medium',
        difficulty: 'All Levels',
        rating: 4.8,
        playsCount: 4100,
        order: 11,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-rose',
        description: 'A rapid 60-second typing sprint to type as many programming words and statements as humanly possible.',
        instructions: 'Timer starts the instant you press your first key! Type as many words accurately as you can before the 60-second buzzer sounds.'
    },
    {
        id: 'game_error_free_typing',
        slug: 'error-free-typing',
        title: 'Error-Free Typing',
        category: 'Typing Games',
        badge: 'Precision',
        cardSize: 'medium',
        difficulty: 'Advanced',
        rating: 4.7,
        playsCount: 3200,
        order: 12,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-amber',
        description: 'Perfectionist typing mode: zero mistakes allowed! Typos block progress until corrected.',
        instructions: 'Type the passage flawlessly. If you strike an incorrect key, progress halts and errors turn red until backspaced. Maintain 100% accuracy!'
    },
    {
        id: 'game_syntax_typing',
        slug: 'syntax-typing',
        title: 'Syntax Typing',
        category: 'Typing Games',
        badge: 'Symbol Drill',
        cardSize: 'medium',
        difficulty: 'Intermediate',
        rating: 4.8,
        playsCount: 3670,
        order: 13,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-cyan',
        description: 'Drill tricky programming symbols: curly braces, brackets, semicolons, arrows =>, and logical operators.',
        instructions: 'Master difficult programming punctuation: {}, [], (), ;, :, =>, &&, ||, !==. Build lightning-fast keyboard muscle memory for special keys.'
    },
    {
        id: 'game_word_rain',
        slug: 'word-rain',
        title: 'Word Rain',
        category: 'Typing Games',
        badge: 'Arcade Rush',
        cardSize: 'large',
        difficulty: 'All Levels',
        rating: 4.9,
        playsCount: 6100,
        order: 14,
        isPublished: true,
        isFeatured: false,
        thumbnail: 'gradient-purple',
        description: 'Programming keywords and identifiers fall from the sky! Type them rapidly before they hit the ground.',
        instructions: 'Watch words drop from the top of the canvas. Type the letters of the lowest word to destroy it before it hits the bottom. You have 3 lives—stay alert!'
    }
];

// Rich, curated challenges for Coding and Typing games
const INITIAL_CHALLENGES = {
    'code-puzzle': [
        {
            id: 'cp_js_1',
            gameSlug: 'code-puzzle',
            title: 'Filter & Map Even Squares',
            difficulty: 'Beginner',
            language: 'javascript',
            description: 'Arrange code blocks to filter even numbers and square them.',
            content: JSON.stringify({
                shuffledBlocks: [
                    'return squared;',
                    'const numbers = [1, 2, 3, 4, 5, 6];',
                    'const squared = evens.map(n => n * n);',
                    'const evens = numbers.filter(n => n % 2 === 0);'
                ]
            }),
            solution: JSON.stringify([
                'const numbers = [1, 2, 3, 4, 5, 6];',
                'const evens = numbers.filter(n => n % 2 === 0);',
                'const squared = evens.map(n => n * n);',
                'return squared;'
            ]),
            hints: 'First define the array, then filter even numbers, square them, and finally return the result.',
            explanation: 'The pipeline must first have access to `numbers`, filter it into `evens`, compute `squared`, and return.',
            order: 1
        },
        {
            id: 'cp_py_1',
            gameSlug: 'code-puzzle',
            title: 'Python Fibonacci Generator',
            difficulty: 'Intermediate',
            language: 'python',
            description: 'Order statements to produce a Fibonacci list of length n.',
            content: JSON.stringify({
                shuffledBlocks: [
                    'return fib',
                    'def get_fib(n):',
                    '    for _ in range(2, n):',
                    '        fib.append(fib[-1] + fib[-2])',
                    '    fib = [0, 1]'
                ]
            }),
            solution: JSON.stringify([
                'def get_fib(n):',
                '    fib = [0, 1]',
                '    for _ in range(2, n):',
                '        fib.append(fib[-1] + fib[-2])',
                '    return fib'
            ]),
            hints: 'Function declaration comes first, initialize the seed list [0, 1], run loop, return result.',
            explanation: 'Standard iterative Fibonacci generation initializing seed values before appending sums.',
            order: 2
        },
        {
            id: 'cp_sql_1',
            gameSlug: 'code-puzzle',
            title: 'Top Departments by Salary',
            difficulty: 'Advanced',
            language: 'sql',
            description: 'Arrange clauses to aggregate average department salaries above 50k.',
            content: JSON.stringify({
                shuffledBlocks: [
                    'LIMIT 5;',
                    'SELECT department, AVG(salary) AS avg_sal',
                    'HAVING AVG(salary) > 50000',
                    'FROM employees',
                    'ORDER BY avg_sal DESC',
                    'GROUP BY department'
                ]
            }),
            solution: JSON.stringify([
                'SELECT department, AVG(salary) AS avg_sal',
                'FROM employees',
                'GROUP BY department',
                'HAVING AVG(salary) > 50000',
                'ORDER BY avg_sal DESC',
                'LIMIT 5;'
            ]),
            hints: 'Standard SQL execution order: SELECT -> FROM -> GROUP BY -> HAVING -> ORDER BY -> LIMIT.',
            explanation: 'SQL grammar requires SELECT first, then FROM, followed by GROUP BY, HAVING filter, ORDER BY, and LIMIT.',
            order: 3
        }
    ],

    'find-the-bug': [
        {
            id: 'ftb_js_1',
            gameSlug: 'find-the-bug',
            title: 'Off-By-One Array Traversal',
            difficulty: 'Beginner',
            language: 'javascript',
            description: 'Locate the line that triggers an index out of bounds error.',
            content: JSON.stringify({
                lines: [
                    'function sumArray(numbers) {',
                    '    let total = 0;',
                    '    for (let i = 0; i <= numbers.length; i++) {',
                    '        total += numbers[i];',
                    '    }',
                    '    return total;',
                    '}'
                ]
            }),
            solution: '3', // 1-based line number: line 3
            hints: 'Check the loop termination condition against array indices.',
            explanation: 'Line 3 uses `i <= numbers.length`. Since array indices are 0-indexed, `numbers[numbers.length]` evaluates to `undefined`, resulting in NaN when added to total. Use `i < numbers.length`.',
            order: 1
        },
        {
            id: 'ftb_py_1',
            gameSlug: 'find-the-bug',
            title: 'Mutable Default Argument',
            difficulty: 'Intermediate',
            language: 'python',
            description: 'Find the dangerous anti-pattern that causes shared state across calls.',
            content: JSON.stringify({
                lines: [
                    'def register_user(username, roles=[]):',
                    '    roles.append("member")',
                    '    return {"user": username, "roles": roles}',
                    '',
                    'u1 = register_user("alice")',
                    'u2 = register_user("bob")'
                ]
            }),
            solution: '1',
            hints: 'What happens when a mutable container is defined as a default argument in Python?',
            explanation: 'Line 1 uses `roles=[]` as a default argument. In Python, default arguments are evaluated once at function definition, meaning all invocations share the exact same list instance.',
            order: 2
        },
        {
            id: 'ftb_sql_1',
            gameSlug: 'find-the-bug',
            title: 'Missing Group By Attribute',
            difficulty: 'Intermediate',
            language: 'sql',
            description: 'Identify the SQL query error when combining non-aggregated columns with aggregate functions.',
            content: JSON.stringify({
                lines: [
                    'SELECT department, role, COUNT(*)',
                    'FROM staff',
                    'WHERE is_active = true',
                    'GROUP BY department;',
                    ''
                ]
            }),
            solution: '4',
            hints: 'Every non-aggregated column in the SELECT list must appear in GROUP BY.',
            explanation: 'Line 4 only groups by `department`, but `role` is also selected without an aggregate function. `role` must be included in `GROUP BY department, role;`.',
            order: 3
        }
    ],

    'output-predictor': [
        {
            id: 'op_js_1',
            gameSlug: 'output-predictor',
            title: 'Closure & Let vs Var',
            difficulty: 'Intermediate',
            language: 'javascript',
            description: 'What will be printed to console?',
            content: JSON.stringify({
                snippet: `for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 10);
}`,
                options: ['0, 1, 2', '3, 3, 3', 'undefined', '0, 0, 0']
            }),
            solution: '3, 3, 3',
            hints: 'Notice `var` is function-scoped, not block-scoped.',
            explanation: 'Because `var` is function-scoped, all timeouts share the single variable `i`. By the time the async callbacks execute, the loop has completed and `i` equals 3.',
            order: 1
        },
        {
            id: 'op_py_1',
            gameSlug: 'output-predictor',
            title: 'List Mutation Reference',
            difficulty: 'Beginner',
            language: 'python',
            description: 'Determine the output of list reference assignment.',
            content: JSON.stringify({
                snippet: `a = [1, 2, 3]
b = a
b.append(4)
print(len(a))`,
                options: ['3', '4', 'TypeError', 'None']
            }),
            solution: '4',
            hints: 'In Python, variables holding objects store references, not copies.',
            explanation: '`b = a` assigns the reference of list `a` to `b`. Calling `b.append(4)` mutates the shared underlying list in memory, so `len(a)` is 4.',
            order: 2
        },
        {
            id: 'op_js_2',
            gameSlug: 'output-predictor',
            title: 'Type Coercion Arithmetic',
            difficulty: 'Beginner',
            language: 'javascript',
            description: 'What is logged by mixed string and numeric operations?',
            content: JSON.stringify({
                snippet: `console.log("5" - 2 + "3");`,
                options: ['"33"', '6', '"523"', 'NaN']
            }),
            solution: '"33"',
            hints: 'Subtraction converts strings to numbers, but addition with a string concatenates.',
            explanation: '"5" - 2 coerces "5" into the number 5, resulting in 3. Then 3 + "3" coerces 3 into a string and concatenates, producing "33".',
            order: 3
        }
    ],

    'code-scramble': [
        {
            id: 'cs_1',
            gameSlug: 'code-scramble',
            title: 'JavaScript Async Fetch Pipeline',
            difficulty: 'Beginner',
            language: 'javascript',
            description: 'Rearrange these statements into an async data fetching routine.',
            content: JSON.stringify({
                statements: [
                    'return data;',
                    'const res = await fetch("/api/data");',
                    'const data = await res.json();',
                    'if (!res.ok) throw new Error("HTTP " + res.status);'
                ]
            }),
            solution: JSON.stringify([
                'const res = await fetch("/api/data");',
                'if (!res.ok) throw new Error("HTTP " + res.status);',
                'const data = await res.json();',
                'return data;'
            ]),
            hints: 'Fetch request first, check status response, parse JSON, then return.',
            explanation: 'Modern async network patterns check response headers before consuming and parsing the body stream.',
            order: 1
        },
        {
            id: 'cs_2',
            gameSlug: 'code-scramble',
            title: 'Python Safe File Context',
            difficulty: 'Intermediate',
            language: 'python',
            description: 'Sequence statements to read and process log lines safely.',
            content: JSON.stringify({
                statements: [
                    'lines = file.readlines()',
                    'print(f"Processed {len(clean)} entries")',
                    'with open("audit.log", "r") as file:',
                    'clean = [l.strip() for l in lines]'
                ]
            }),
            solution: JSON.stringify([
                'with open("audit.log", "r") as file:',
                'lines = file.readlines()',
                'clean = [l.strip() for l in lines]',
                'print(f"Processed {len(clean)} entries")'
            ]),
            hints: 'Open context manager first, read file, clean lines with comprehension, log output.',
            explanation: 'The context manager safely opens and closes the file handle.',
            order: 2
        }
    ],

    'missing-code': [
        {
            id: 'mc_js_1',
            gameSlug: 'missing-code',
            title: 'Promise All Settlement',
            difficulty: 'Beginner',
            language: 'javascript',
            description: 'Fill in the missing keyword to wait for all asynchronous operations.',
            content: JSON.stringify({
                code: `async function loadDashboard() {
    const results = await Promise.____([
        fetchUsers(),
        fetchStats()
    ]);
    return results;
}`,
                options: ['all', 'race', 'resolve', 'any'],
                blankToken: 'all'
            }),
            solution: 'all',
            hints: 'Which Promise method waits for every promise in an array to resolve?',
            explanation: '`Promise.all` takes an iterable of promises and returns a single Promise that resolves to an array of the results.',
            order: 1
        },
        {
            id: 'mc_py_1',
            gameSlug: 'missing-code',
            title: 'Python List Comprehension Filtering',
            difficulty: 'Beginner',
            language: 'python',
            description: 'Supply the missing conditional keyword in this list comprehension.',
            content: JSON.stringify({
                code: `primes = [x for x in candidates _____ is_prime(x)]`,
                options: ['if', 'where', 'filter', 'when'],
                blankToken: 'if'
            }),
            solution: 'if',
            hints: 'Python list comprehensions use this keyword for conditional filtering at the end.',
            explanation: '`[expr for item in iterable if condition]` is Python\'s standard list comprehension filter syntax.',
            order: 2
        },
        {
            id: 'mc_sql_1',
            gameSlug: 'missing-code',
            title: 'SQL Aggregate Filtering',
            difficulty: 'Intermediate',
            language: 'sql',
            description: 'Which clause filters aggregated group results?',
            content: JSON.stringify({
                code: `SELECT city, COUNT(*)
FROM customers
GROUP BY city
_______ COUNT(*) >= 10;`,
                options: ['HAVING', 'WHERE', 'FILTER', 'LIMIT'],
                blankToken: 'HAVING'
            }),
            solution: 'HAVING',
            hints: 'WHERE filters rows before aggregation; this clause filters groups after aggregation.',
            explanation: '`HAVING` is specifically designed to filter groups formed by the `GROUP BY` clause.',
            order: 3
        }
    ],

    'logic-builder': [
        {
            id: 'lb_1',
            gameSlug: 'logic-builder',
            title: 'Next Number in Alternating Sequence',
            difficulty: 'Easy',
            language: 'general',
            description: 'Identify the algorithmic rule and deduce the next integer.',
            content: JSON.stringify({
                sequence: [2, 4, 8, 10, 20, 22, 44],
                question: 'What is the next number in this sequence?'
            }),
            solution: '46',
            hints: 'Look at the pattern of operations: +2, *2, +2, *2...',
            explanation: 'The pattern alternates between multiplying by 2 and adding 2: 2 (*2)=4, 4 (+2)=6... Here: 2(+2)=4, 4(*2)=8, 8(+2)=10, 10(*2)=20, 20(+2)=22, 22(*2)=44, 44(+2)=46.',
            order: 1
        },
        {
            id: 'lb_2',
            gameSlug: 'logic-builder',
            title: 'Boolean Logic Simplification',
            difficulty: 'Medium',
            language: 'general',
            description: 'Evaluate the logical statement for A=true, B=false, C=true.',
            content: JSON.stringify({
                expression: '(A && !B) || (B && C)',
                inputs: { A: true, B: false, C: true },
                question: 'What does this boolean expression evaluate to?'
            }),
            solution: 'true',
            hints: 'Substitute values: (!B) is true, so (A && !B) is (true && true) = true.',
            explanation: 'Since the left side `(true && !false)` is `true && true` = true, the entire OR statement immediately short-circuits to `true`.',
            order: 2
        }
    ],

    'sql-challenge': [
        {
            id: 'sql_ch_1',
            gameSlug: 'sql-challenge',
            title: 'High Honors Computer Science Students',
            difficulty: 'Beginner',
            language: 'sql',
            description: 'Find all Computer Science students with a GPA of 3.5 or higher, ordered by GPA descending.',
            content: JSON.stringify({
                schema: {
                    students: [
                        { id: 1, name: 'Alice Chen', major: 'Computer Science', gpa: 3.9 },
                        { id: 2, name: 'Bob Smith', major: 'Mathematics', gpa: 3.4 },
                        { id: 3, name: 'Carlos Ray', major: 'Computer Science', gpa: 3.7 },
                        { id: 4, name: 'Diana Prince', major: 'Physics', gpa: 3.8 },
                        { id: 5, name: 'Evan Wright', major: 'Computer Science', gpa: 3.2 }
                    ]
                },
                expectedColumns: ['id', 'name', 'major', 'gpa'],
                prompt: 'Write a SQL query to select all fields for students where major is "Computer Science" and gpa >= 3.5, sorted by gpa DESC.'
            }),
            solution: 'SELECT * FROM students WHERE major = "Computer Science" AND gpa >= 3.5 ORDER BY gpa DESC;',
            hints: 'Use SELECT * FROM students WHERE major = \'Computer Science\' AND gpa >= 3.5 ORDER BY gpa DESC;',
            explanation: 'Combines boolean condition `major = ... AND gpa >= 3.5` with sorting `ORDER BY gpa DESC`.',
            order: 1
        },
        {
            id: 'sql_ch_2',
            gameSlug: 'sql-challenge',
            title: 'Course Enrollment Count',
            difficulty: 'Intermediate',
            language: 'sql',
            description: 'Count how many students are enrolled in each course.',
            content: JSON.stringify({
                schema: {
                    enrollments: [
                        { id: 101, student_id: 1, course: 'Algorithms' },
                        { id: 102, student_id: 2, course: 'Calculus' },
                        { id: 103, student_id: 3, course: 'Algorithms' },
                        { id: 104, student_id: 4, course: 'Quantum Physics' },
                        { id: 105, student_id: 5, course: 'Algorithms' }
                    ]
                },
                expectedColumns: ['course', 'count'],
                prompt: 'Write a query to return course and count of enrolled students as count, grouped by course.'
            }),
            solution: 'SELECT course, COUNT(*) AS count FROM enrollments GROUP BY course;',
            hints: 'Use GROUP BY course with aggregate COUNT(*).',
            explanation: 'Groups records by distinct course values and calculates count for each group.',
            order: 2
        }
    ],

    'memory-match': [
        {
            id: 'mm_1',
            gameSlug: 'memory-match',
            title: 'Core Programming Concepts & Terminology',
            difficulty: 'Beginner',
            language: 'general',
            description: 'Match fundamental programming concepts with their accurate definitions.',
            content: JSON.stringify({
                pairs: [
                    { id: 'p1', term: 'Closure', match: 'Function bundled with lexical environment' },
                    { id: 'p2', term: 'Polymorphism', match: 'Objects responding to same method call' },
                    { id: 'p3', term: 'Promise', match: 'Represents eventual async completion' },
                    { id: 'p4', term: 'Primary Key', match: 'Unique identifier for a database row' },
                    { id: 'p5', term: 'Virtual DOM', match: 'Lightweight in-memory UI tree representation' },
                    { id: 'p6', term: 'Recursion', match: 'Function calling itself with a base case' },
                    { id: 'p7', term: 'Hoisting', match: 'Declarations moved to top of scope' },
                    { id: 'p8', term: 'Idempotence', match: 'Same outcome regardless of repeat calls' }
                ]
            }),
            solution: 'pairs_matching',
            hints: 'Review essential computer science paradigms and database definitions.',
            explanation: 'Solidifies memory of software architecture and language runtime terms.',
            order: 1
        }
    ],

    // Typing games challenges
    'speed-typing': [
        {
            id: 'st_1',
            gameSlug: 'speed-typing',
            title: 'Clean Code Principles',
            difficulty: 'All Levels',
            language: 'general',
            description: 'Practice typing a paragraph on writing readable, maintainable software.',
            content: JSON.stringify({
                text: 'Clean code is simple, direct, and reads like well-crafted prose. Meaningful naming conventions and small single-responsibility functions make complex architectures effortless to debug and maintain over time.'
            }),
            solution: '',
            order: 1
        },
        {
            id: 'st_2',
            gameSlug: 'speed-typing',
            title: 'The Event Loop & Concurrency',
            difficulty: 'All Levels',
            language: 'general',
            description: 'Typing drill explaining single-threaded event-driven execution.',
            content: JSON.stringify({
                text: 'JavaScript manages asynchronous operations with a single-threaded event loop. Non-blocking I/O delegates network requests and timers to the browser background, processing resolved microtasks on the call stack.'
            }),
            solution: '',
            order: 2
        }
    ],

    'code-typing': [
        {
            id: 'ct_js_1',
            gameSlug: 'code-typing',
            title: 'JavaScript Binary Search',
            difficulty: 'Intermediate',
            language: 'javascript',
            description: 'Type out a clean binary search algorithm in JavaScript.',
            content: JSON.stringify({
                code: `function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
            }),
            solution: '',
            order: 1
        },
        {
            id: 'ct_py_1',
            gameSlug: 'code-typing',
            title: 'Python Decorator Pattern',
            difficulty: 'Intermediate',
            language: 'python',
            description: 'Type an execution timer decorator in Python.',
            content: JSON.stringify({
                code: `import time
from functools import wraps

def time_it(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        print(f"{func.__name__} took {duration:.4f}s")
        return result
    return wrapper`
            }),
            solution: '',
            order: 2
        }
    ],

    'sixty-second-challenge': [
        {
            id: 'ssc_1',
            gameSlug: 'sixty-second-challenge',
            title: 'Fast Developer Keywords Sprint',
            difficulty: 'All Levels',
            language: 'general',
            description: 'Rapid 60-second typing sprint through common programming vocabulary.',
            content: JSON.stringify({
                words: [
                    'function', 'variable', 'constant', 'boolean', 'integer',
                    'string', 'array', 'object', 'closure', 'promise',
                    'async', 'await', 'return', 'import', 'export',
                    'class', 'interface', 'extends', 'implements', 'override',
                    'private', 'protected', 'public', 'static', 'readonly',
                    'database', 'schema', 'migration', 'endpoint', 'request',
                    'response', 'header', 'status', 'payload', 'token',
                    'encrypt', 'decrypt', 'session', 'cookie', 'storage',
                    'testing', 'assertion', 'mocking', 'deploy', 'pipeline'
                ]
            }),
            solution: '',
            order: 1
        }
    ],

    'error-free-typing': [
        {
            id: 'eft_1',
            gameSlug: 'error-free-typing',
            title: 'Zero-Tolerance Software Precision',
            difficulty: 'Advanced',
            language: 'general',
            description: 'Type this passage with 100% precision—errors will halt progression.',
            content: JSON.stringify({
                text: 'In mission-critical systems, every keystroke must be deliberate. Strong type systems, automated unit tests, and rigorous static analysis prevent regressions before deployment.'
            }),
            solution: '',
            order: 1
        }
    ],

    'syntax-typing': [
        {
            id: 'stx_1',
            gameSlug: 'syntax-typing',
            title: 'Punctuation & Syntax Symbols Drill',
            difficulty: 'Intermediate',
            language: 'javascript',
            description: 'Master keyboard muscle memory for tricky programming symbols.',
            content: JSON.stringify({
                drills: [
                    'const add = (x, y) => x + y;',
                    'if (item !== null && (a[0] || b[1])) { return true; }',
                    'const { id, tags = [] } = response?.data ?? {};',
                    'for (let idx = 0; idx < list.length; idx++) { arr[idx] = idx * 2; }',
                    'export const config = { port: 3000, ssl: false, env: "dev" };'
                ]
            }),
            solution: '',
            order: 1
        }
    ],

    'word-rain': [
        {
            id: 'wr_1',
            gameSlug: 'word-rain',
            title: 'Keyword Arcade Rain',
            difficulty: 'All Levels',
            language: 'general',
            description: 'Type programming keywords to destroy falling blocks before they reach bottom.',
            content: JSON.stringify({
                words: [
                    'async', 'await', 'const', 'let', 'var', 'class',
                    'import', 'export', 'return', 'yield', 'lambda',
                    'boolean', 'number', 'string', 'symbol', 'bigint',
                    'promise', 'resolve', 'reject', 'closure', 'hoist',
                    'prototype', 'iterator', 'generator', 'mutation',
                    'function', 'callback', 'handler', 'listener', 'stream',
                    'database', 'primary', 'foreign', 'relation', 'index',
                    'backend', 'frontend', 'express', 'router', 'schema',
                    'package', 'runtime', 'compiler', 'bundle', 'minify'
                ]
            }),
            solution: '',
            order: 1
        }
    ]
};

// In-memory fallback state for dev / offline / test environments
let memGames = JSON.parse(JSON.stringify(INITIAL_GAMES));
let memChallenges = JSON.parse(JSON.stringify(INITIAL_CHALLENGES));
let memScores = [];
let memProgress = {}; // key: `${userId}_${gameSlug}`
let memFavorites = {}; // key: `${userId}_${gameSlug}`

const GameModel = {
    INITIAL_GAMES,
    INITIAL_CHALLENGES,

    /**
     * Get all games with optional filtering
     */
    getAll: async ({ category, search, difficulty, isPublished, isFeatured, userId } = {}) => {
        try {
            const where = {};
            if (isPublished !== undefined) {
                where.isPublished = Boolean(isPublished);
            }
            if (isFeatured !== undefined) {
                where.isFeatured = Boolean(isFeatured);
            }
            if (category && category !== 'All Games' && category !== 'All') {
                where.category = { equals: category, mode: 'insensitive' };
            }
            if (difficulty && difficulty !== 'All Levels') {
                where.difficulty = { equals: difficulty, mode: 'insensitive' };
            }

            let games = await prisma.game.findMany({
                where,
                orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
            });

            // If DB is empty, auto-seed with initial games
            if (!games || games.length === 0) {
                try {
                    await prisma.game.createMany({
                        data: INITIAL_GAMES.map(g => ({
                            slug: g.slug,
                            title: g.title,
                            category: g.category,
                            difficulty: g.difficulty || 'All Levels',
                            badge: g.badge,
                            cardSize: g.cardSize,
                            rating: g.rating,
                            playsCount: g.playsCount,
                            order: g.order,
                            isPublished: g.isPublished,
                            isFeatured: g.isFeatured,
                            thumbnail: g.thumbnail,
                            description: g.description,
                            instructions: g.instructions
                        }))
                    });
                    games = await prisma.game.findMany({
                        where,
                        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
                    });
                } catch {
                    games = null;
                }
            }

            if (games && games.length > 0) {
                if (userId) {
                    const [userProgress, userFavs] = await Promise.all([
                        prisma.userGameProgress.findMany({ where: { userId: String(userId) } }).catch(() => []),
                        prisma.userGameFavorite.findMany({ where: { userId: String(userId) } }).catch(() => [])
                    ]);
                    const progressMap = {};
                    userProgress.forEach(p => { progressMap[p.gameSlug] = p; });
                    const favSet = new Set(userFavs.map(f => f.gameSlug));

                    games = games.map(g => ({
                        ...g,
                        userHighScore: progressMap[g.slug]?.highScore || 0,
                        userBestWpm: progressMap[g.slug]?.bestWpm || 0,
                        userBestAccuracy: progressMap[g.slug]?.bestAccuracy || 0,
                        userTotalPlays: progressMap[g.slug]?.totalPlays || 0,
                        isFavorite: favSet.has(g.slug)
                    }));
                }

                if (search) {
                    const q = search.toLowerCase();
                    games = games.filter(g =>
                        g.title.toLowerCase().includes(q) ||
                        g.description.toLowerCase().includes(q) ||
                        g.category.toLowerCase().includes(q)
                    );
                }

                return games;
            }
        } catch {
            // DB fallback
        }

        // Memory fallback
        let games = memGames.slice();
        if (isPublished !== undefined) {
            games = games.filter(g => Boolean(g.isPublished) === Boolean(isPublished));
        }
        if (isFeatured !== undefined) {
            games = games.filter(g => Boolean(g.isFeatured) === Boolean(isFeatured));
        }
        if (category && category !== 'All Games' && category !== 'All') {
            const catNorm = category.toLowerCase().replace(' games', '');
            games = games.filter(g => g.category.toLowerCase().includes(catNorm));
        }
        if (difficulty && difficulty !== 'All Levels') {
            games = games.filter(g => (g.difficulty || '').toLowerCase() === difficulty.toLowerCase());
        }
        if (search) {
            const q = search.toLowerCase();
            games = games.filter(g =>
                g.title.toLowerCase().includes(q) ||
                g.description.toLowerCase().includes(q) ||
                g.category.toLowerCase().includes(q)
            );
        }

        if (userId) {
            games = games.map(g => {
                const progKey = `${userId}_${g.slug}`;
                const prog = memProgress[progKey];
                return {
                    ...g,
                    userHighScore: prog?.highScore || 0,
                    userBestWpm: prog?.bestWpm || 0,
                    userBestAccuracy: prog?.bestAccuracy || 0,
                    userTotalPlays: prog?.totalPlays || 0,
                    isFavorite: Boolean(memFavorites[progKey])
                };
            });
        }

        return games;
    },

    /**
     * Find single game by slug
     */
    findBySlug: async (slug, userId = null) => {
        const cleanSlug = String(slug || '').toLowerCase().trim();
        try {
            const game = await prisma.game.findUnique({
                where: { slug: cleanSlug }
            });

            if (game) {
                let userHighScore = 0;
                let userBestWpm = 0;
                let userBestAccuracy = 0;
                let userTotalPlays = 0;
                let isFavorite = false;

                if (userId) {
                    const [prog, fav] = await Promise.all([
                        prisma.userGameProgress.findUnique({
                            where: { userId_gameSlug: { userId: String(userId), gameSlug: cleanSlug } }
                        }).catch(() => null),
                        prisma.userGameFavorite.findUnique({
                            where: { userId_gameSlug: { userId: String(userId), gameSlug: cleanSlug } }
                        }).catch(() => null)
                    ]);
                    if (prog) {
                        userHighScore = prog.highScore || 0;
                        userBestWpm = prog.bestWpm || 0;
                        userBestAccuracy = prog.bestAccuracy || 0;
                        userTotalPlays = prog.totalPlays || 0;
                    }
                    isFavorite = Boolean(fav);
                }

                return {
                    ...game,
                    userHighScore,
                    userBestWpm,
                    userBestAccuracy,
                    userTotalPlays,
                    isFavorite
                };
            }
        } catch {
            // DB fallback
        }

        const game = memGames.find(g => g.slug === cleanSlug);
        if (!game) return null;

        let userHighScore = 0;
        let userBestWpm = 0;
        let userBestAccuracy = 0;
        let userTotalPlays = 0;
        let isFavorite = false;

        if (userId) {
            const progKey = `${userId}_${cleanSlug}`;
            const prog = memProgress[progKey];
            userHighScore = prog?.highScore || 0;
            userBestWpm = prog?.bestWpm || 0;
            userBestAccuracy = prog?.bestAccuracy || 0;
            userTotalPlays = prog?.totalPlays || 0;
            isFavorite = Boolean(memFavorites[progKey]);
        }

        return {
            ...game,
            userHighScore,
            userBestWpm,
            userBestAccuracy,
            userTotalPlays,
            isFavorite
        };
    },

    /**
     * Get challenges for a game (sanitized for client play - solutions withheld)
     */
    getChallenges: async (gameSlug, { difficulty, language } = {}) => {
        try {
            const where = { gameSlug };
            if (difficulty && difficulty !== 'All Levels') {
                where.difficulty = difficulty;
            }
            if (language && language !== 'all') {
                where.language = language;
            }

            const dbChallenges = await prisma.gameChallenge.findMany({
                where,
                orderBy: { order: 'asc' }
            });

            if (dbChallenges && dbChallenges.length > 0) {
                // Sanitize: do not send raw solution to client
                return dbChallenges.map(c => ({
                    id: c.id,
                    gameSlug: c.gameSlug,
                    title: c.title,
                    difficulty: c.difficulty,
                    language: c.language,
                    description: c.description,
                    content: c.content,
                    hints: c.hints,
                    order: c.order
                }));
            }
        } catch {
            // DB fallback
        }

        const list = memChallenges[gameSlug] || [];
        return list.map(c => ({
            id: c.id,
            gameSlug: c.gameSlug,
            title: c.title,
            difficulty: c.difficulty,
            language: c.language,
            description: c.description,
            content: c.content,
            hints: c.hints,
            order: c.order
        }));
    },

    /**
     * Verify a challenge submission securely on the backend
     */
    verifyChallenge: async (gameSlug, challengeId, submission) => {
        let challenge = null;

        try {
            challenge = await prisma.gameChallenge.findUnique({
                where: { id: challengeId }
            });
        } catch {
            // DB fallback
        }

        if (!challenge) {
            const list = memChallenges[gameSlug] || [];
            challenge = list.find(c => c.id === challengeId);
        }

        if (!challenge) {
            return {
                isCorrect: false,
                message: 'Challenge not found',
                points: 0
            };
        }

        const expected = String(challenge.solution || '').trim();
        let userSub = '';

        if (typeof submission === 'object') {
            userSub = JSON.stringify(submission);
        } else {
            userSub = String(submission || '').trim();
        }

        let isCorrect = false;

        // Custom verification strategies
        if (expected.startsWith('[') && expected.endsWith(']')) {
            // Array comparison (e.g. Code Puzzle order)
            try {
                const expArr = JSON.parse(expected);
                const subArr = Array.isArray(submission) ? submission : JSON.parse(userSub);
                isCorrect = expArr.length === subArr.length && expArr.every((v, i) => v.trim() === subArr[i].trim());
            } catch {
                isCorrect = false;
            }
        } else if (gameSlug === 'find-the-bug') {
            // Line number match
            isCorrect = String(userSub).trim() === expected;
        } else {
            // Textual / token normalization
            isCorrect = userSub.toLowerCase().replace(/\s+/g, ' ') === expected.toLowerCase().replace(/\s+/g, ' ');
        }

        const basePoints = challenge.difficulty === 'Advanced' ? 300 : challenge.difficulty === 'Intermediate' ? 200 : 100;
        const points = isCorrect ? basePoints : 0;

        return {
            isCorrect,
            points,
            explanation: challenge.explanation,
            solution: isCorrect ? null : challenge.solution
        };
    },

    /**
     * Get Daily Featured Game Challenge
     */
    getDailyChallenge: async () => {
        const today = new Date().toISOString().slice(0, 10);
        // Deterministic index from date string hash
        let hash = 0;
        for (let i = 0; i < today.length; i++) {
            hash = (hash << 5) - hash + today.charCodeAt(i);
            hash |= 0;
        }
        const gameIndex = Math.abs(hash) % INITIAL_GAMES.length;
        const dailyGame = INITIAL_GAMES[gameIndex];

        return {
            date: today,
            game: dailyGame,
            bonusMultiplier: 1.5,
            message: `Today's Daily Quest: Master ${dailyGame.title} for 1.5x bonus score!`
        };
    },

    /**
     * Get Leaderboard for a game or overall
     */
    getLeaderboard: async (gameSlug, limit = 10) => {
        try {
            const where = {};
            if (gameSlug && gameSlug !== 'all') {
                where.gameSlug = gameSlug;
            }

            const topScores = await prisma.gameScore.findMany({
                where,
                orderBy: { score: 'desc' },
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            });

            return topScores.map((s, idx) => ({
                rank: idx + 1,
                username: s.user?.username || s.user?.name || 'Player',
                score: s.score,
                wpm: s.wpm,
                accuracy: s.accuracy,
                gameSlug: s.gameSlug,
                createdAt: s.createdAt
            }));
        } catch {
            // DB fallback
        }

        let filtered = memScores.slice();
        if (gameSlug && gameSlug !== 'all') {
            filtered = filtered.filter(s => s.gameSlug === gameSlug);
        }
        filtered.sort((a, b) => b.score - a.score);

        return filtered.slice(0, limit).map((s, idx) => ({
            rank: idx + 1,
            username: `Player_${String(s.userId || 'Guest').slice(0, 6)}`,
            score: s.score,
            wpm: s.wpm || 0,
            accuracy: s.accuracy || 100,
            gameSlug: s.gameSlug,
            createdAt: s.createdAt
        }));
    },

    /**
     * Create a new game (Admin)
     */
    create: async (data) => {
        const slug = String(data.slug || data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const payload = {
            slug,
            title: String(data.title || '').trim(),
            description: String(data.description || '').trim(),
            instructions: String(data.instructions || '').trim(),
            category: String(data.category || 'Coding Games').trim(),
            difficulty: String(data.difficulty || 'All Levels').trim(),
            thumbnail: data.thumbnail || 'gradient-indigo',
            badge: data.badge || '',
            cardSize: data.cardSize || 'medium',
            aspectRatio: data.aspectRatio || '16/9',
            order: Number(data.order || 0),
            isPublished: data.isPublished !== false,
            isFeatured: Boolean(data.isFeatured),
            rating: Number(data.rating || 4.9),
            playsCount: Number(data.playsCount || 0)
        };

        try {
            const created = await prisma.game.create({ data: payload });
            return created;
        } catch {
            const newMem = {
                id: `mem_game_${Date.now()}`,
                ...payload,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            memGames.push(newMem);
            return newMem;
        }
    },

    /**
     * Update game by ID or slug (Admin)
     */
    update: async (idOrSlug, data) => {
        const payload = { ...data };
        delete payload.id;
        if (payload.order !== undefined) payload.order = Number(payload.order);
        if (payload.rating !== undefined) payload.rating = Number(payload.rating);
        if (payload.playsCount !== undefined) payload.playsCount = Number(payload.playsCount);

        try {
            let updated;
            try {
                updated = await prisma.game.update({
                    where: { id: String(idOrSlug) },
                    data: payload
                });
            } catch {
                updated = await prisma.game.update({
                    where: { slug: String(idOrSlug) },
                    data: payload
                });
            }
            return updated;
        } catch {
            const idx = memGames.findIndex(g => g.id === idOrSlug || g.slug === idOrSlug);
            if (idx !== -1) {
                memGames[idx] = { ...memGames[idx], ...payload, updatedAt: new Date() };
                return memGames[idx];
            }
            return null;
        }
    },

    /**
     * Delete game by ID or slug (Admin)
     */
    delete: async (idOrSlug) => {
        try {
            try {
                await prisma.game.delete({ where: { id: String(idOrSlug) } });
            } catch {
                await prisma.game.delete({ where: { slug: String(idOrSlug) } });
            }
            return true;
        } catch {
            const before = memGames.length;
            memGames = memGames.filter(g => g.id !== idOrSlug && g.slug !== idOrSlug);
            return memGames.length < before;
        }
    },

    /**
     * Record a user's game score
     */
    recordScore: async ({ userId, gameSlug, score, durationSeconds = 0, accuracy = 100, wpm = 0, difficulty = 'All Levels', metadata = {} }) => {
        const numericScore = Math.max(0, parseInt(score, 10) || 0);
        const duration = Math.max(0, parseInt(durationSeconds, 10) || 0);
        const numericAccuracy = Math.max(0, Math.min(100, parseFloat(accuracy) || 100));
        const numericWpm = Math.max(0, parseFloat(wpm) || 0);
        const metaStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

        let isNewHighScore = false;
        let userHighScore = numericScore;
        let totalPlays = 1;
        let bestWpm = numericWpm;
        let bestAccuracy = numericAccuracy;

        try {
            const game = await prisma.game.findUnique({
                where: { slug: gameSlug }
            });

            if (game && userId) {
                const existingProg = await prisma.userGameProgress.findUnique({
                    where: { userId_gameSlug: { userId: String(userId), gameSlug } }
                });

                if (existingProg) {
                    isNewHighScore = numericScore > existingProg.highScore;
                    userHighScore = Math.max(numericScore, existingProg.highScore);
                    bestWpm = Math.max(numericWpm, existingProg.bestWpm || 0);
                    bestAccuracy = Math.max(numericAccuracy, existingProg.bestAccuracy || 0);
                    totalPlays = existingProg.totalPlays + 1;

                    await prisma.userGameProgress.update({
                        where: { id: existingProg.id },
                        data: {
                            highScore: userHighScore,
                            bestWpm,
                            bestAccuracy,
                            totalPlays,
                            lastPlayedAt: new Date()
                        }
                    });
                } else {
                    isNewHighScore = true;
                    userHighScore = numericScore;
                    bestWpm = numericWpm;
                    bestAccuracy = numericAccuracy;
                    totalPlays = 1;

                    await prisma.userGameProgress.create({
                        data: {
                            userId: String(userId),
                            gameSlug,
                            highScore: userHighScore,
                            bestWpm,
                            bestAccuracy,
                            totalPlays: 1,
                            lastPlayedAt: new Date()
                        }
                    });
                }

                await prisma.game.update({
                    where: { id: game.id },
                    data: { playsCount: { increment: 1 } }
                }).catch(() => {});

                await prisma.gameScore.create({
                    data: {
                        userId: String(userId),
                        gameId: game.id,
                        gameSlug,
                        score: numericScore,
                        highScore: userHighScore,
                        wpm: numericWpm,
                        accuracy: numericAccuracy,
                        difficulty,
                        durationSeconds: duration,
                        metadata: metaStr
                    }
                }).catch(() => {});

                return {
                    success: true,
                    isNewHighScore,
                    highScore: userHighScore,
                    score: numericScore,
                    wpm: numericWpm,
                    accuracy: numericAccuracy,
                    totalPlays
                };
            }
        } catch {
            // DB fallback
        }

        // Memory fallback
        const progKey = `${userId}_${gameSlug}`;
        const existing = memProgress[progKey];
        if (existing) {
            isNewHighScore = numericScore > existing.highScore;
            userHighScore = Math.max(numericScore, existing.highScore);
            bestWpm = Math.max(numericWpm, existing.bestWpm || 0);
            bestAccuracy = Math.max(numericAccuracy, existing.bestAccuracy || 0);
            totalPlays = existing.totalPlays + 1;
            memProgress[progKey] = {
                highScore: userHighScore,
                bestWpm,
                bestAccuracy,
                totalPlays,
                lastPlayedAt: new Date()
            };
        } else {
            isNewHighScore = true;
            userHighScore = numericScore;
            bestWpm = numericWpm;
            bestAccuracy = numericAccuracy;
            totalPlays = 1;
            memProgress[progKey] = {
                highScore: userHighScore,
                bestWpm,
                bestAccuracy,
                totalPlays: 1,
                lastPlayedAt: new Date()
            };
        }

        const gIdx = memGames.findIndex(g => g.slug === gameSlug);
        if (gIdx !== -1) {
            memGames[gIdx].playsCount = (memGames[gIdx].playsCount || 0) + 1;
        }

        memScores.push({
            id: `score_${Date.now()}`,
            userId,
            gameSlug,
            score: numericScore,
            highScore: userHighScore,
            wpm: numericWpm,
            accuracy: numericAccuracy,
            difficulty,
            durationSeconds: duration,
            metadata: metaStr,
            createdAt: new Date()
        });

        return {
            success: true,
            isNewHighScore,
            highScore: userHighScore,
            score: numericScore,
            wpm: numericWpm,
            accuracy: numericAccuracy,
            totalPlays
        };
    },

    /**
     * Toggle favorite game for a user
     */
    toggleFavorite: async (userId, gameSlug) => {
        if (!userId) return false;
        try {
            const game = await prisma.game.findUnique({ where: { slug: gameSlug } });
            if (game) {
                const existing = await prisma.userGameFavorite.findUnique({
                    where: { userId_gameSlug: { userId: String(userId), gameSlug } }
                });
                if (existing) {
                    await prisma.userGameFavorite.delete({ where: { id: existing.id } });
                    return false;
                } else {
                    await prisma.userGameFavorite.create({
                        data: {
                            userId: String(userId),
                            gameId: game.id,
                            gameSlug
                        }
                    });
                    return true;
                }
            }
        } catch {
            // DB fallback
        }

        const progKey = `${userId}_${gameSlug}`;
        if (memFavorites[progKey]) {
            delete memFavorites[progKey];
            return false;
        } else {
            memFavorites[progKey] = true;
            return true;
        }
    },

    /**
     * Get aggregate game stats for a user
     */
    getUserStats: async (userId) => {
        if (!userId) {
            return {
                totalPlayed: 0,
                highScores: {},
                bestWpm: {},
                bestAccuracy: {},
                favorites: [],
                recentGames: [],
                history: []
            };
        }

        try {
            const [progressList, favorites, history] = await Promise.all([
                prisma.userGameProgress.findMany({
                    where: { userId: String(userId) },
                    orderBy: { lastPlayedAt: 'desc' }
                }),
                prisma.userGameFavorite.findMany({
                    where: { userId: String(userId) }
                }),
                prisma.gameScore.findMany({
                    where: { userId: String(userId) },
                    orderBy: { createdAt: 'desc' },
                    take: 20
                })
            ]);

            const highScores = {};
            const bestWpm = {};
            const bestAccuracy = {};
            let totalPlayed = 0;
            progressList.forEach(p => {
                highScores[p.gameSlug] = p.highScore;
                bestWpm[p.gameSlug] = p.bestWpm || 0;
                bestAccuracy[p.gameSlug] = p.bestAccuracy || 0;
                totalPlayed += p.totalPlays;
            });

            return {
                totalPlayed,
                highScores,
                bestWpm,
                bestAccuracy,
                favorites: favorites.map(f => f.gameSlug),
                recentGames: progressList.map(p => ({
                    slug: p.gameSlug,
                    highScore: p.highScore,
                    bestWpm: p.bestWpm || 0,
                    bestAccuracy: p.bestAccuracy || 0,
                    totalPlays: p.totalPlays,
                    lastPlayedAt: p.lastPlayedAt
                })),
                history
            };
        } catch {
            // DB fallback
        }

        const highScores = {};
        const bestWpm = {};
        const bestAccuracy = {};
        let totalPlayed = 0;
        const recentGames = [];

        Object.keys(memProgress).forEach(key => {
            if (key.startsWith(`${userId}_`)) {
                const slug = key.replace(`${userId}_`, '');
                const p = memProgress[key];
                highScores[slug] = p.highScore;
                bestWpm[slug] = p.bestWpm || 0;
                bestAccuracy[slug] = p.bestAccuracy || 0;
                totalPlayed += p.totalPlays;
                recentGames.push({
                    slug,
                    highScore: p.highScore,
                    bestWpm: p.bestWpm || 0,
                    bestAccuracy: p.bestAccuracy || 0,
                    totalPlays: p.totalPlays,
                    lastPlayedAt: p.lastPlayedAt
                });
            }
        });

        const userFavs = Object.keys(memFavorites)
            .filter(k => k.startsWith(`${userId}_`))
            .map(k => k.replace(`${userId}_`, ''));

        const history = memScores
            .filter(s => s.userId === userId)
            .slice(-20)
            .reverse();

        return {
            totalPlayed,
            highScores,
            bestWpm,
            bestAccuracy,
            favorites: userFavs,
            recentGames,
            history
        };
    },

    /**
     * Reset default games in memory
     */
    resetSeed: () => {
        memGames = JSON.parse(JSON.stringify(INITIAL_GAMES));
        memChallenges = JSON.parse(JSON.stringify(INITIAL_CHALLENGES));
        return memGames;
    }
};

module.exports = GameModel;
