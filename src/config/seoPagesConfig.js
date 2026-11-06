/**
 * Centralized SEO Metadata, Keyword Strategy, Heading Hierarchy, Introductory Content,
 * Internal Linking, and Image Alt Text Configuration for HangBug Public Pages.
 */

export const SEO_PAGES_CONFIG = {
    home: {
        id: 'home',
        path: '/',
        title: 'HangBug — Test & Master Web Development Skills | Coding Quizzes & Games',
        description: 'Practice interactive coding quizzes, play developer typing and debugging games, track your programming accuracy, and earn verifiable completion certificates.',
        primaryKeyword: 'coding quizzes',
        secondaryKeywords: [
            'programming practice online',
            'web development quizzes',
            'developer coding games',
            'programming skill assessment',
            'coding completion certificates'
        ],
        h1: 'Test & Master Your Web Development & Programming Skills',
        h2s: [
            'Interactive Assessment & Platform Highlights',
            'Explore Popular Programming & Technology Quiz Tracks',
            'Practice With Interactive Coding & Typing Games',
            'How HangBug Skill Verification Works'
        ],
        h3s: [
            'Session-Based Coding Quizzes',
            'Verifiable Completion Certificates',
            'Real-Time Performance Analytics',
            'Global Developer Leaderboards'
        ],
        introContent: 'HangBug is an interactive coding quiz and programming practice platform built for software developers, computer science students, and self-taught engineers. Benchmark your knowledge across frontend, backend, database, and mobile technologies through session-based quizzes and hands-on browser coding games.',
        imageAlt: 'HangBug interactive coding quizzes, programming games, and developer skill assessment platform dashboard',
        internalLinks: [
            { label: 'Explore All Technology Quizzes', to: '/technologies' },
            { label: 'Play Coding & Typing Games', to: '/games' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'React.js Quizzes', to: '/technologies/react' },
            { label: 'Python Quizzes', to: '/technologies/python' },
            { label: 'Certificate Verification & Info', to: '/certificate/view' },
            { label: 'Learning Resources & Study Guides', to: '/resources' },
            { label: 'Global Leaderboard', to: '/leaderboard' }
        ]
    },

    technologies: {
        id: 'technologies',
        path: '/technologies',
        title: 'Choose Your Tech Stack — Programming & Framework Quizzes | HangBug',
        description: 'Browse HangBug technology quizzes and programming practice tracks across HTML, CSS, JavaScript, React.js, PHP, Laravel, Python, SQL, Flutter, and Dart.',
        primaryKeyword: 'technology quizzes',
        secondaryKeywords: [
            'programming quizzes by topic',
            'full stack developer quiz tracks',
            'frontend and backend coding tests',
            'software engineering practice sessions',
            'web technology skill tests'
        ],
        h1: 'Choose Your Tech Stack — Programming & Technology Quizzes',
        h2s: [
            'Saved In-Progress Quizzes',
            'Featured Programming & Web Development Tracks',
            'Active Multi-Session Assessment Categories',
            'How Session-Based Technology Practice Works'
        ],
        h3s: [
            'Frontend Web Technologies',
            'Backend Frameworks & Languages',
            'Relational & NoSQL Databases',
            'Mobile & Core Programming Fundamentals'
        ],
        introContent: 'Select a programming language, framework, or database track to begin practicing. Each active technology track organizes questions into focused sessions with instant answer verification, score tracking, and progress saving so you can practice at your own pace.',
        imageAlt: 'Grid of programming language and web framework quiz tracks on HangBug',
        internalLinks: [
            { label: 'HTML Quizzes', to: '/technologies/html' },
            { label: 'CSS Quizzes', to: '/technologies/css' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'React.js Quizzes', to: '/technologies/react' },
            { label: 'PHP Quizzes', to: '/technologies/php' },
            { label: 'Laravel Quizzes', to: '/technologies/laravel' },
            { label: 'MySQL Quizzes', to: '/technologies/mysql' },
            { label: 'MongoDB Quizzes', to: '/technologies/mongodb' },
            { label: 'Flutter Quizzes', to: '/technologies/flutter' },
            { label: 'Dart Quizzes', to: '/technologies/dart' },
            { label: 'Python Quizzes', to: '/technologies/python' },
            { label: 'Programming Fundamentals', to: '/technologies/programming-fundamentals' },
            { label: 'Interactive Coding Games', to: '/games' },
            { label: 'Certificate Information', to: '/certificate/view' }
        ]
    },

    html: {
        id: 'html',
        slug: 'html',
        name: 'HTML',
        categoryLabel: 'Frontend Development',
        categoryMatcher: ['HTML', 'HTML & CSS'],
        path: '/technologies/html',
        title: 'HTML Quizzes & Markup Practice — Semantic Web & HTML5 Challenges | HangBug',
        description: 'Practice HTML5 semantic elements, web forms, accessibility attributes, and document structure with interactive HTML quizzes and coding challenges on HangBug.',
        primaryKeyword: 'HTML quizzes',
        secondaryKeywords: [
            'HTML5 practice test',
            'semantic HTML quiz questions',
            'web markup coding practice',
            'HTML forms and accessibility quiz',
            'frontend HTML assessment'
        ],
        h1: 'HTML Quizzes & Interactive HTML5 Markup Practice',
        h2s: [
            'What You Will Practice in the HTML Track',
            'Available HTML Quiz Sessions & Assessments',
            'Interactive HTML Coding & Debugging Games',
            'Related Frontend & Web Development Tracks'
        ],
        h3s: [
            'Semantic HTML5 Document Structure',
            'Accessible Forms, Inputs & Validation',
            'DOM Elements, Attributes & Media Tags'
        ],
        introContent: 'Strengthen your foundation in modern web markup with HangBug HTML quizzes and interactive syntax challenges. Test your understanding of semantic HTML5 tags, accessible form controls, SEO-friendly heading hierarchies, and document structure through guided practice sessions and bug-spotting games.',
        imageAlt: 'HTML5 semantic markup quiz and frontend coding practice emblem on HangBug',
        internalLinks: [
            { label: 'CSS Quizzes', to: '/technologies/css' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'React.js Quizzes', to: '/technologies/react' },
            { label: 'Play HTML Find the Bug Game', to: '/games/find-the-bug?tech=html' },
            { label: 'All Technology Quizzes', to: '/technologies' },
            { label: 'Certificate Information', to: '/certificate/view' }
        ]
    },

    css: {
        id: 'css',
        slug: 'css',
        name: 'CSS',
        categoryLabel: 'Frontend Development',
        categoryMatcher: ['CSS', 'HTML & CSS'],
        path: '/technologies/css',
        title: 'CSS Quizzes & Styling Practice — Flexbox, Grid & Responsive Design | HangBug',
        description: 'Test your CSS skills with interactive quizzes and coding games covering selector specificity, Flexbox, CSS Grid, positioning, and responsive layouts on HangBug.',
        primaryKeyword: 'CSS quizzes',
        secondaryKeywords: [
            'CSS Flexbox and Grid quiz',
            'CSS specificity practice test',
            'responsive web design quiz',
            'frontend styling coding challenges',
            'CSS3 online practice'
        ],
        h1: 'CSS Quizzes & Modern Layout Styling Practice',
        h2s: [
            'Core CSS Topics Covered in Practice',
            'Available CSS Quiz Sessions & Assessments',
            'Interactive CSS Coding & Layout Games',
            'Continue Your Frontend Learning Path'
        ],
        h3s: [
            'Selector Specificity & Cascade Rules',
            'Flexbox & CSS Grid Layout Systems',
            'Responsive Media Queries & Custom Properties'
        ],
        introContent: 'Master stylesheet architecture and responsive layout engineering with HangBug CSS quizzes and interactive coding games. Practice evaluating selector specificity, aligning elements with Flexbox and CSS Grid, and debugging common box-model and positioning issues.',
        imageAlt: 'CSS3 stylesheet layout, Flexbox, and Grid quiz badge on HangBug',
        internalLinks: [
            { label: 'HTML Quizzes', to: '/technologies/html' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'React.js Quizzes', to: '/technologies/react' },
            { label: 'Play CSS Code Puzzle Game', to: '/games/code-puzzle?tech=css' },
            { label: 'All Technology Quizzes', to: '/technologies' }
        ]
    },

    javascript: {
        id: 'javascript',
        slug: 'javascript',
        name: 'JavaScript',
        categoryLabel: 'Frontend & Full-Stack Development',
        categoryMatcher: ['JavaScript', 'PHP, XML JSON, Laravel, MySQL, JavaScript'],
        path: '/technologies/javascript',
        title: 'JavaScript Quizzes & ES6+ Coding Practice — Async, Closures & DOM | HangBug',
        description: 'Sharpen your JavaScript skills with session-based ES6+ quizzes and interactive coding games covering closures, Promises, async/await, and event loop execution.',
        primaryKeyword: 'JavaScript quizzes',
        secondaryKeywords: [
            'ES6 JavaScript practice test',
            'JavaScript interview quiz questions',
            'async await and promises quiz',
            'JavaScript output prediction challenges',
            'learn JavaScript online quiz'
        ],
        h1: 'JavaScript Quizzes & ES6+ Programming Practice',
        h2s: [
            'Key JavaScript Concepts You Will Practice',
            'Live JavaScript Quiz Sessions',
            'Interactive JavaScript Coding & Typing Games',
            'Related Full-Stack Technology Tracks'
        ],
        h3s: [
            'Scope, Closures & Lexical Environments',
            'Asynchronous JavaScript, Promises & Event Loop',
            'Arrays, Objects, Type Coercion & ES6+ Syntax'
        ],
        introContent: 'Evaluate and refine your core scripting expertise with HangBug JavaScript quizzes and browser-based coding games. Work through session-calibrated questions on variable scoping, lexical closures, Promise resolution, microtask queues, and modern ES6+ syntax.',
        imageAlt: 'JavaScript ES6+ programming quiz and code output predictor icon on HangBug',
        internalLinks: [
            { label: 'React.js Quizzes', to: '/technologies/react' },
            { label: 'HTML Quizzes', to: '/technologies/html' },
            { label: 'CSS Quizzes', to: '/technologies/css' },
            { label: 'Play JS Output Predictor', to: '/games/output-predictor?tech=javascript' },
            { label: 'All Technology Quizzes', to: '/technologies' },
            { label: 'Certificate Information', to: '/certificate/view' }
        ]
    },

    react: {
        id: 'react',
        slug: 'react',
        name: 'React.js',
        categoryLabel: 'Frontend Development',
        categoryMatcher: ['React.js', 'React'],
        path: '/technologies/react',
        title: 'React.js Quizzes & Component Practice — Hooks, State & Virtual DOM | HangBug',
        description: 'Practice React.js with interactive quizzes and coding games covering useState, useEffect, custom hooks, component lifecycle, props, and rendering optimization.',
        primaryKeyword: 'React.js quizzes',
        secondaryKeywords: [
            'React hooks quiz',
            'React developer practice test',
            'JSX and Virtual DOM quiz',
            'frontend React coding challenges',
            'React state management assessment'
        ],
        h1: 'React.js Quizzes & Modern Component Practice',
        h2s: [
            'React.js Skills & Patterns Covered',
            'Live React.js Quiz Sessions',
            'Interactive React Coding & Syntax Games',
            'Related Frontend & JavaScript Tracks'
        ],
        h3s: [
            'JSX, Props & Component Composition',
            'State Management With useState, useEffect & useMemo',
            'Concurrent Rendering & Performance Optimization'
        ],
        introContent: 'Test your practical knowledge of component-driven user interfaces with HangBug React.js quizzes and interactive code challenges. Practice identifying hook dependency pitfalls, tracing component re-renders, managing state immutably, and writing clean JSX.',
        imageAlt: 'React.js component hooks and Virtual DOM quiz emblem on HangBug',
        internalLinks: [
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'HTML Quizzes', to: '/technologies/html' },
            { label: 'CSS Quizzes', to: '/technologies/css' },
            { label: 'Play React Code Puzzle', to: '/games/code-puzzle?tech=react' },
            { label: 'All Technology Quizzes', to: '/technologies' },
            { label: 'Certificate Information', to: '/certificate/view' }
        ]
    },

    php: {
        id: 'php',
        slug: 'php',
        name: 'PHP',
        categoryLabel: 'Backend Development',
        categoryMatcher: ['PHP', 'PHP, XML JSON, Laravel, MySQL, JavaScript'],
        path: '/technologies/php',
        title: 'PHP Quizzes & Server-Side Coding Practice — Backend Web Development | HangBug',
        description: 'Practice server-side PHP programming with interactive quizzes and coding games covering arrays, OOP, superglobals, form handling, and PDO database security.',
        primaryKeyword: 'PHP quizzes',
        secondaryKeywords: [
            'PHP programming practice test',
            'server-side PHP coding quiz',
            'PHP OOP and arrays assessment',
            'backend web development quiz',
            'PHP debugging challenges'
        ],
        h1: 'PHP Quizzes & Server-Side Programming Practice',
        h2s: [
            'Core Backend PHP Topics Covered',
            'Live PHP Quiz Sessions & Assessments',
            'Interactive PHP Debugging & Coding Games',
            'Related Backend & Database Tracks'
        ],
        h3s: [
            'PHP Syntax, Types, Arrays & Superglobals',
            'Object-Oriented PHP, Namespaces & Interfaces',
            'Secure Request Handling, Sessions & PDO'
        ],
        introContent: 'Sharpen your backend web development skills with HangBug PHP quizzes and interactive debugging challenges. Practice core language syntax, associative array manipulation, session management, object-oriented PHP patterns, and secure database querying.',
        imageAlt: 'PHP backend server-side scripting quiz and coding challenge icon on HangBug',
        internalLinks: [
            { label: 'Laravel Quizzes', to: '/technologies/laravel' },
            { label: 'MySQL Quizzes', to: '/technologies/mysql' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'Play PHP Find the Bug Game', to: '/games/find-the-bug?tech=php' },
            { label: 'All Technology Quizzes', to: '/technologies' }
        ]
    },

    laravel: {
        id: 'laravel',
        slug: 'laravel',
        name: 'Laravel',
        categoryLabel: 'Backend Development',
        categoryMatcher: ['Laravel', 'PHP, XML JSON, Laravel, MySQL, JavaScript'],
        path: '/technologies/laravel',
        title: 'Laravel Quizzes & MVC Framework Practice — Eloquent, Routing & Blade | HangBug',
        description: 'Test your Laravel framework skills with interactive practice covering MVC routing, middleware, Eloquent ORM relationships, Blade templates, and Artisan CLI.',
        primaryKeyword: 'Laravel quizzes',
        secondaryKeywords: [
            'Laravel MVC practice test',
            'Eloquent ORM quiz questions',
            'PHP Laravel framework coding challenges',
            'Laravel routing and middleware quiz',
            'backend Laravel skill practice'
        ],
        h1: 'Laravel Quizzes & PHP MVC Framework Practice',
        h2s: [
            'Laravel Architecture Topics You Will Practice',
            'Available Laravel Quiz Sessions & Combined Tracks',
            'Interactive Laravel Coding & Logic Games',
            'Related PHP & Database Practice Tracks'
        ],
        h3s: [
            'Routing, Controllers & Middleware Pipelines',
            'Eloquent ORM Models, Migrations & Relationships',
            'Blade Templating, Validation & Service Container'
        ],
        introContent: 'Build confidence with modern PHP application architecture through HangBug Laravel practice and interactive coding games. Explore routing conventions, controller validation, Eloquent ORM queries, database migrations, and Blade component structuring.',
        imageAlt: 'Laravel MVC framework and Eloquent ORM quiz badge on HangBug',
        internalLinks: [
            { label: 'PHP Quizzes', to: '/technologies/php' },
            { label: 'MySQL Quizzes', to: '/technologies/mysql' },
            { label: 'Play Laravel Code Puzzle', to: '/games/code-puzzle?tech=laravel' },
            { label: 'All Technology Quizzes', to: '/technologies' },
            { label: 'Coding Games Hub', to: '/games' }
        ]
    },

    mysql: {
        id: 'mysql',
        slug: 'mysql',
        name: 'MySQL',
        categoryLabel: 'Database Engineering',
        categoryMatcher: ['MySQL', 'SQL', 'SQL Server', 'PHP, XML JSON, Laravel, MySQL, JavaScript'],
        path: '/technologies/mysql',
        title: 'MySQL Quizzes & SQL Query Practice — Joins, Indexing & Relational DBs | HangBug',
        description: 'Practice MySQL and relational database queries with interactive quizzes and SQL coding challenges covering SELECT, JOINs, GROUP BY aggregations, and indexing.',
        primaryKeyword: 'MySQL quizzes',
        secondaryKeywords: [
            'SQL query practice online',
            'relational database quiz',
            'MySQL joins and indexing test',
            'interactive SQL coding challenge',
            'database normalization quiz'
        ],
        h1: 'MySQL Quizzes & Relational SQL Query Practice',
        h2s: [
            'Relational Database & SQL Topics Covered',
            'Available Database Quiz Sessions',
            'Interactive MySQL & SQL Query Games',
            'Related Backend & NoSQL Database Tracks'
        ],
        h3s: [
            'SELECT Filtering, Sorting & Aggregations',
            'INNER, LEFT & Multi-Table JOIN Queries',
            'Primary Keys, Foreign Keys & Index Optimization'
        ],
        introContent: 'Practice writing and analyzing relational database queries with HangBug MySQL quizzes and the interactive SQL Challenge game. Test your grasp of table schemas, relational joins, aggregate functions, constraints, and query execution order.',
        imageAlt: 'MySQL relational database and SQL query challenge icon on HangBug',
        internalLinks: [
            { label: 'Play Interactive SQL Challenge', to: '/games/sql-challenge?tech=mysql' },
            { label: 'MongoDB Quizzes', to: '/technologies/mongodb' },
            { label: 'PHP Quizzes', to: '/technologies/php' },
            { label: 'Laravel Quizzes', to: '/technologies/laravel' },
            { label: 'All Technology Quizzes', to: '/technologies' }
        ]
    },

    mongodb: {
        id: 'mongodb',
        slug: 'mongodb',
        name: 'MongoDB',
        categoryLabel: 'Database Engineering',
        categoryMatcher: ['MongoDB'],
        path: '/technologies/mongodb',
        title: 'MongoDB Quizzes & NoSQL Practice — Document Schemas & Aggregations | HangBug',
        description: 'Practice MongoDB and NoSQL database concepts on HangBug with interactive coding challenges covering BSON documents, CRUD queries, indexing, and aggregations.',
        primaryKeyword: 'MongoDB quizzes',
        secondaryKeywords: [
            'NoSQL database practice test',
            'MongoDB CRUD and aggregation quiz',
            'document database coding challenges',
            'MongoDB query operators practice',
            'full stack NoSQL skill practice'
        ],
        h1: 'MongoDB Quizzes & NoSQL Document Database Practice',
        h2s: [
            'NoSQL & MongoDB Concepts You Will Practice',
            'MongoDB Assessment & Practice Availability',
            'Interactive MongoDB Coding & Query Games',
            'Related Database & Backend Tracks'
        ],
        h3s: [
            'BSON Document Modeling & Schema Design',
            'CRUD Operations & Query Comparison Operators',
            'Aggregation Pipelines ($match, $group, $project) & Indexes'
        ],
        introContent: 'Explore document-oriented data modeling and NoSQL query patterns with HangBug MongoDB practice and interactive coding games. Sharpen your understanding of BSON document structures, filter operators, update modifiers, and multi-stage aggregation pipelines.',
        imageAlt: 'MongoDB NoSQL document database and aggregation pipeline badge on HangBug',
        internalLinks: [
            { label: 'MySQL Quizzes', to: '/technologies/mysql' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'Python Quizzes', to: '/technologies/python' },
            { label: 'Play MongoDB Coding Games', to: '/games?tech=mongodb' },
            { label: 'All Technology Quizzes', to: '/technologies' }
        ]
    },

    flutter: {
        id: 'flutter',
        slug: 'flutter',
        name: 'Flutter',
        categoryLabel: 'Mobile Development',
        categoryMatcher: ['Flutter'],
        path: '/technologies/flutter',
        title: 'Flutter Quizzes & Mobile UI Practice — Widgets, State & Layouts | HangBug',
        description: 'Practice cross-platform mobile development with HangBug Flutter quizzes and coding games covering StatelessWidget, StatefulWidget, layout trees, and navigation.',
        primaryKeyword: 'Flutter quizzes',
        secondaryKeywords: [
            'Flutter widget tree practice',
            'cross-platform mobile development quiz',
            'Flutter state management challenges',
            'Flutter and Dart coding games',
            'mobile app developer practice'
        ],
        h1: 'Flutter Quizzes & Cross-Platform Mobile UI Practice',
        h2s: [
            'Core Flutter Topics Covered in Practice',
            'Flutter Quiz & Interactive Practice Status',
            'Interactive Flutter Coding & Syntax Games',
            'Related Mobile & Programming Tracks'
        ],
        h3s: [
            'Stateless vs. Stateful Widget Lifecycles',
            'Declarative UI Layouts (Row, Column, Stack & Flex)',
            'Navigation, Routing & Reactive State Updates'
        ],
        introContent: 'Practice building declarative, cross-platform user interfaces with HangBug Flutter coding challenges and quiz tracks. Test your understanding of widget composition, build contexts, layout constraints, state lifecycle methods, and asynchronous UI rendering.',
        imageAlt: 'Flutter cross-platform mobile widget tree practice icon on HangBug',
        internalLinks: [
            { label: 'Dart Quizzes', to: '/technologies/dart' },
            { label: 'Programming Fundamentals', to: '/technologies/programming-fundamentals' },
            { label: 'Play Flutter Code Puzzle', to: '/games/code-puzzle?tech=flutter' },
            { label: 'All Technology Quizzes', to: '/technologies' },
            { label: 'Coding Games Hub', to: '/games' }
        ]
    },

    dart: {
        id: 'dart',
        slug: 'dart',
        name: 'Dart',
        categoryLabel: 'Mobile & Language Development',
        categoryMatcher: ['Dart'],
        path: '/technologies/dart',
        title: 'Dart Quizzes & Programming Practice — Null Safety, Async & OOP | HangBug',
        description: 'Sharpen your Dart programming skills with interactive coding games and practice covering sound null safety, Futures, Streams, classes, mixins, and collections.',
        primaryKeyword: 'Dart quizzes',
        secondaryKeywords: [
            'Dart programming language practice',
            'Dart null safety and async quiz',
            'Dart OOP and mixins challenges',
            'Dart coding games for Flutter developers',
            'learn Dart syntax online'
        ],
        h1: 'Dart Quizzes & Sound Null-Safe Programming Practice',
        h2s: [
            'Essential Dart Language Features Covered',
            'Dart Quiz & Interactive Challenge Status',
            'Interactive Dart Coding & Typing Games',
            'Related Mobile & Core Programming Tracks'
        ],
        h3s: [
            'Sound Null Safety, Late Variables & Type Inference',
            'Asynchronous Programming With Futures & Streams',
            'Classes, Constructors, Mixins & Typed Collections'
        ],
        introContent: 'Build fluency in the client-optimized language powering Flutter with HangBug Dart practice and interactive coding games. Work through real Dart snippets involving null-aware operators, Future and Stream pipelines, object-oriented mixins, and collection transformations.',
        imageAlt: 'Dart programming language and null-safe async coding badge on HangBug',
        internalLinks: [
            { label: 'Flutter Quizzes', to: '/technologies/flutter' },
            { label: 'Programming Fundamentals', to: '/technologies/programming-fundamentals' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'Play Dart Output Predictor', to: '/games/output-predictor?tech=dart' },
            { label: 'All Technology Quizzes', to: '/technologies' }
        ]
    },

    python: {
        id: 'python',
        slug: 'python',
        name: 'Python',
        categoryLabel: 'Backend & General Programming',
        categoryMatcher: ['Python'],
        path: '/technologies/python',
        title: 'Python Quizzes & Coding Practice — Data Structures, OOP & Syntax | HangBug',
        description: 'Test your Python programming skills with multi-session quizzes and interactive coding games covering lists, dictionaries, generators, OOP, and Pythonic logic.',
        primaryKeyword: 'Python quizzes',
        secondaryKeywords: [
            'Python coding practice online',
            'Python data structures quiz',
            'Python generators and OOP test',
            'interactive Python debugging games',
            'Python skill assessment certificate'
        ],
        h1: 'Python Quizzes & Interactive Programming Practice',
        h2s: [
            'Core Python Topics Covered in Practice',
            'Live Python Quiz Sessions',
            'Interactive Python Coding, Debugging & Typing Games',
            'Related Backend & Fundamentals Tracks'
        ],
        h3s: [
            'Python Data Structures (Lists, Tuples, Sets & Dicts)',
            'Functions, List Comprehensions, Generators & Decorators',
            'Object-Oriented Python, Concurrency & Runtime Internals'
        ],
        introContent: 'Master clean, Pythonic problem-solving with HangBug Python quizzes and interactive coding challenges. Practice multi-session assessments covering mutable vs. immutable data types, generator functions, list comprehensions, object-oriented design, and execution behavior.',
        imageAlt: 'Python programming quiz and algorithm practice emblem on HangBug',
        internalLinks: [
            { label: 'Programming Fundamentals', to: '/technologies/programming-fundamentals' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'MySQL Quizzes', to: '/technologies/mysql' },
            { label: 'Play Python Find the Bug', to: '/games/find-the-bug?tech=python' },
            { label: 'All Technology Quizzes', to: '/technologies' },
            { label: 'Certificate Information', to: '/certificate/view' }
        ]
    },

    'programming-fundamentals': {
        id: 'programming-fundamentals',
        slug: 'programming-fundamentals',
        name: 'Programming Fundamentals',
        categoryLabel: 'Computer Science Foundations',
        categoryMatcher: ['Programming Fundamentals', 'Programming Logic', 'OOP', 'DSA'],
        path: '/technologies/programming-fundamentals',
        title: 'Programming Fundamentals Quizzes — Logic, OOP & Data Structures | HangBug',
        description: 'Build strong computer science foundations with interactive practice in programming logic, Object-Oriented Programming (OOP), and Data Structures & Algorithms.',
        primaryKeyword: 'programming fundamentals quiz',
        secondaryKeywords: [
            'coding logic and algorithms practice',
            'object-oriented programming quiz',
            'data structures and algorithms challenges',
            'beginner programming practice online',
            'computer science fundamentals test'
        ],
        h1: 'Programming Fundamentals: Logic, OOP & Algorithms Practice',
        h2s: [
            'Three Pillars of Programming Fundamentals on HangBug',
            'Core Computer Science Concepts You Will Practice',
            'Interactive Logic, OOP & Algorithm Coding Games',
            'Apply Your Fundamentals to Language Tracks'
        ],
        h3s: [
            'Programming Logic, Booleans & Control Flow',
            'Object-Oriented Programming (Encapsulation, Inheritance & Polymorphism)',
            'Data Structures, Searching, Sorting & Big-O Complexity'
        ],
        introContent: 'Every great software engineer relies on language-agnostic problem-solving skills. HangBug’s Programming Fundamentals track combines Programming Logic, Object-Oriented Programming (OOP), and Data Structures & Algorithms (DSA) into interactive browser challenges that sharpen how you trace code and design solutions.',
        imageAlt: 'Programming fundamentals icon representing algorithmic logic, OOP, and data structures on HangBug',
        internalLinks: [
            { label: 'Play Logic Builder Game', to: '/games/logic-builder?tech=programming-logic' },
            { label: 'Play Coding Memory Match', to: '/games/memory-match?tech=oop' },
            { label: 'Python Quizzes', to: '/technologies/python' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'Dart Quizzes', to: '/technologies/dart' },
            { label: 'All Technology Quizzes', to: '/technologies' }
        ]
    },

    games: {
        id: 'games',
        path: '/games',
        title: 'Coding & Typing Games for Developers — HangBug Games Hub',
        description: 'Play 18 interactive coding and developer typing games in your browser. Solve Code Puzzles, Find the Bug, predict outputs, write SQL queries, and boost code WPM.',
        primaryKeyword: 'coding games',
        secondaryKeywords: [
            'programming games for developers',
            'developer typing speed games',
            'interactive debugging games online',
            'SQL query game',
            'code puzzle and syntax typing practice'
        ],
        h1: 'Coding & Typing Games for Developers',
        h2s: [
            'Sharpen Logic & Developer Keyboard Speed',
            'Choose Your Technology Track',
            'Browse Interactive Coding & Typing Challenges',
            'Why Practice Programming Through Interactive Games'
        ],
        h3s: [
            'Algorithmic Code Puzzles & Bug Detection',
            'Interactive SQL & C# Specialty Challenges',
            'Real-Time Developer WPM & Syntax Typing Drills'
        ],
        introContent: 'Turn daily programming practice into an engaging arcade challenge. HangBug’s Games Hub features browser-based coding games and developer typing drills across 24 technology tracks—helping you spot syntax bugs faster, trace program output accurately, and build muscle memory for brackets, operators, and keywords.',
        imageAlt: 'HangBug Arcade coding games and developer typing challenge showcase banner',
        internalLinks: [
            { label: 'Code Puzzle Game', to: '/games/code-puzzle' },
            { label: 'Find the Bug Game', to: '/games/find-the-bug' },
            { label: 'Output Predictor Game', to: '/games/output-predictor' },
            { label: 'SQL Challenge Game', to: '/games/sql-challenge' },
            { label: 'Code Typing Game', to: '/games/code-typing' },
            { label: 'Explore Technology Quizzes', to: '/technologies' },
            { label: 'Global Leaderboard', to: '/leaderboard' }
        ]
    },

    certificateInfo: {
        id: 'certificateInfo',
        path: '/certificate/view',
        title: 'Verify Developer Certificate — HangBug Programming Certificates & Info',
        description: 'Learn how to earn, view, and verify HangBug programming completion certificates. Score 80% or higher on technology quizzes to unlock shareable QR credentials.',
        primaryKeyword: 'programming certificates',
        secondaryKeywords: [
            'coding quiz certificate of completion',
            'verify developer skill certificate',
            'online programming assessment credential',
            'shareable coding certificate QR code',
            'HangBug certificate verification'
        ],
        h1: 'HangBug Programming Certificates & Credential Verification',
        h2s: [
            'Sample & Verified Certificate of Completion',
            'How to Earn a HangBug Certificate of Completion',
            'Online Certificate ID & QR Verification',
            'Important Transparency Note on Certificate Scope'
        ],
        h3s: [
            'Complete a Technology Quiz With 80% or Higher',
            'Unique Verification ID & Instant Lookup',
            'Non-Accredited Platform Skill Assessment Credential'
        ],
        introContent: 'HangBug awards digital Certificates of Completion to learners who pass technology quiz assessments with a score of 80% or higher. Each certificate includes your score percentage, completion date, and a unique verification ID so peers and hiring managers can confirm your quiz performance online. Note: HangBug certificates represent platform-based quiz completion and self-assessment milestones; they are not accredited academic degrees or government-accredited certifications.',
        imageAlt: 'Official HangBug Certificate of Completion preview with QR verification code and score details',
        internalLinks: [
            { label: 'Browse Technology Quizzes', to: '/technologies' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'React.js Quizzes', to: '/technologies/react' },
            { label: 'Python Quizzes', to: '/technologies/python' },
            { label: 'Practice Coding Games', to: '/games' },
            { label: 'About HangBug', to: '/about' }
        ]
    },

    about: {
        id: 'about',
        path: '/about',
        title: 'About Us — HangBug Developer Skill Verification Platform & Coding Quizzes',
        description: 'Discover how HangBug helps developers and students practice coding quizzes, play interactive programming games, and earn verifiable completion certificates.',
        primaryKeyword: 'interactive coding quiz platform',
        secondaryKeywords: [
            'about HangBug developer platform',
            'online programming practice platform',
            'software engineering self-assessment tool',
            'coding quiz and game learning platform'
        ],
        h1: 'About HangBug — Interactive Coding Quizzes & Programming Practice',
        h2s: [
            'Core Platform Pillars',
            'Our Mission for Developer Self-Assessment',
            'What You Can Practice on HangBug'
        ],
        h3s: [
            'Comprehensive Stack Coverage',
            'Verifiable Completion Certificates',
            'Session-Based Progression & Coding Games'
        ],
        introContent: 'HangBug is an interactive coding quiz and developer practice platform designed to make technical self-assessment active, measurable, and engaging. Whether you are preparing for software engineering interviews, reviewing university coursework, or learning a new stack, HangBug provides instant feedback across quizzes and coding games.',
        imageAlt: 'HangBug developer skill verification and coding quiz platform brand emblem',
        internalLinks: [
            { label: 'Explore Technology Quizzes', to: '/technologies' },
            { label: 'Play Coding & Typing Games', to: '/games' },
            { label: 'Certificate Information', to: '/certificate/view' },
            { label: 'Learning Resources', to: '/resources' },
            { label: 'Contact Support', to: '/contact' }
        ]
    },

    contact: {
        id: 'contact',
        path: '/contact',
        title: 'Contact Support & Inquiries — HangBug Coding Quiz Platform',
        description: 'Contact the HangBug support team for help with coding quizzes, account access, certificate verification, bug reports, or educational partnership inquiries.',
        primaryKeyword: 'contact HangBug support',
        secondaryKeywords: [
            'HangBug help and customer support',
            'coding quiz feedback and bug report',
            'certificate verification assistance',
            'developer platform inquiries'
        ],
        h1: 'Contact HangBug Support & Platform Inquiries',
        h2s: [
            'Direct Support Channels',
            'Send Us a Message',
            'Quick Links & Platform Help'
        ],
        h3s: [
            'Frequently Asked Questions',
            'How Completion Certificates Work',
            'Retaking Quiz Sessions & Saving Progress'
        ],
        introContent: 'Have a question about a quiz question, need help verifying a completion certificate, or want to report a technical issue? Reach out to the HangBug team using the contact form or direct support email below, or explore our quick answers to common platform questions.',
        imageAlt: 'HangBug customer support and developer inquiry contact illustration',
        internalLinks: [
            { label: 'Browse Technology Quizzes', to: '/technologies' },
            { label: 'Play Coding Games', to: '/games' },
            { label: 'Verify a Certificate', to: '/certificate/view' },
            { label: 'About HangBug', to: '/about' },
            { label: 'Privacy Policy', to: '/privacy-policy' }
        ]
    },

    resources: {
        id: 'resources',
        path: '/resources',
        title: 'Developer Blog & Learning Resources — Coding Practice Guides | HangBug',
        description: 'Explore HangBug learning resources, structured programming study paths, interview preparation strategies, and direct links to coding quizzes and games.',
        primaryKeyword: 'programming learning resources',
        secondaryKeywords: [
            'coding practice study guides',
            'web development learning roadmap',
            'how to prepare for coding quizzes',
            'frontend and backend practice guide',
            'developer skill building resources'
        ],
        h1: 'Blog & Learning Resources for Programming Practice',
        h2s: [
            'Structured Programming Study Roadmaps',
            'How to Combine Coding Quizzes With Interactive Games',
            'Practice Guides by Technology Domain',
            'Understanding HangBug Completion Certificates'
        ],
        h3s: [
            'Frontend Web Development Path (HTML, CSS, JavaScript & React.js)',
            'Backend & Database Engineering Path (PHP, Laravel, Python, MySQL & MongoDB)',
            'Mobile & Computer Science Foundations (Flutter, Dart & Programming Fundamentals)'
        ],
        introContent: 'Welcome to the HangBug Learning Resources hub. Use these structured study roadmaps and practice guides to organize your coding review, pair conceptual quizzes with hands-on debugging games, and systematically strengthen your software engineering fundamentals.',
        imageAlt: 'HangBug developer learning resources and structured coding study roadmap banner',
        internalLinks: [
            { label: 'All Technology Quizzes', to: '/technologies' },
            { label: 'HTML Quizzes', to: '/technologies/html' },
            { label: 'CSS Quizzes', to: '/technologies/css' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'React.js Quizzes', to: '/technologies/react' },
            { label: 'PHP Quizzes', to: '/technologies/php' },
            { label: 'Laravel Quizzes', to: '/technologies/laravel' },
            { label: 'MySQL Quizzes', to: '/technologies/mysql' },
            { label: 'MongoDB Quizzes', to: '/technologies/mongodb' },
            { label: 'Flutter Quizzes', to: '/technologies/flutter' },
            { label: 'Dart Quizzes', to: '/technologies/dart' },
            { label: 'Python Quizzes', to: '/technologies/python' },
            { label: 'Programming Fundamentals', to: '/technologies/programming-fundamentals' },
            { label: 'Coding & Typing Games', to: '/games' },
            { label: 'Certificate Information', to: '/certificate/view' }
        ]
    }
};

export const TECHNOLOGY_SEO_SLUGS = [
    'html',
    'css',
    'javascript',
    'react',
    'php',
    'laravel',
    'mysql',
    'mongodb',
    'flutter',
    'dart',
    'python',
    'programming-fundamentals'
];

export function getTechnologySeoBySlug(slug) {
    if (!slug) return null;
    const clean = String(slug).toLowerCase().trim();
    const aliasMap = {
        'react.js': 'react',
        'reactjs': 'react',
        'js': 'javascript',
        'html5': 'html',
        'css3': 'css',
        'fundamentals': 'programming-fundamentals',
        'programming-logic': 'programming-fundamentals'
    };
    const key = aliasMap[clean] || clean;
    return TECHNOLOGY_SEO_SLUGS.includes(key) ? SEO_PAGES_CONFIG[key] : null;
}

export default SEO_PAGES_CONFIG;
