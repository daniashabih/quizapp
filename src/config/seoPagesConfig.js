/**
 * Centralized SEO Metadata, Keyword Strategy, Heading Hierarchy, Introductory Content,
 * Internal Linking, and Image Alt Text Configuration for Hangbug Public Pages.
 */

export const SEO_PAGES_CONFIG = {
    home: {
        id: 'home',
        path: '/',
        title: 'Learn Programming & Practice Tech Quizzes Online | Hangbug',
        description: 'Learn programming, practice interactive technology quizzes, play coding games, track your progress, and earn score-based certificates with Hangbug.',
        primaryKeyword: 'programming quizzes',
        secondaryKeywords: [
            'online coding practice',
            'technology learning',
            'web development quizzes',
            'programming challenges',
            'coding games',
            'score-based certificates'
        ],
        h1: 'Learn Programming, Practice Tech Quizzes & Earn Certificates',
        h2s: [
            'What is Hangbug?',
            'Interactive Assessment & Platform Highlights',
            'Technology Quiz Categories Covered',
            'Interactive Coding & Typing Games',
            'How Hangbug Works for Students & Developers',
            'Score-Based Certificates & LinkedIn Sharing'
        ],
        h3s: [
            'Interactive MCQ Tech Quizzes',
            'Score-Based Completion Certificates',
            'Progress & Accuracy Tracking',
            'Coding & Typing Games'
        ],
        introContent: 'Learn programming with online coding practice, interactive programming quizzes, and coding games. Track your progress and earn score-based certificates with Hangbug.',
        imageAlt: 'Hangbug interactive technology quizzes, coding games, and skill assessment platform dashboard',
        internalLinks: [
            { label: 'Explore All Technology Quizzes', to: '/technologies' },
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
            { label: 'Play Coding & Typing Games', to: '/games' },
            { label: 'Blog & Tutorials', to: '/blog' },
            { label: 'HTML Tutorial for Beginners', to: '/blog/html-tutorial-for-beginners' },
            { label: 'CSS Basics Guide', to: '/blog/css-basics-beginners-guide' },
            { label: 'JavaScript Fundamentals Guide', to: '/blog/javascript-fundamentals-beginners-guide' },
            { label: 'PHP Programming Guide', to: '/blog/php-programming-beginners-guide' },
            { label: 'Laravel MVC Architecture Guide', to: '/blog/laravel-basics-mvc-architecture' },
            { label: 'Flutter & Dart Mobile Guide', to: '/blog/flutter-dart-mobile-app-development' },
            { label: 'About Hangbug', to: '/about' },
            { label: 'Contact Support', to: '/contact' },
            { label: 'Certificate Verification & Info', to: '/certificate/view' },
            { label: 'Global Leaderboard', to: '/leaderboard' },
            { label: 'JavaScript Quizzes & Practice', to: '/technologies/javascript' }
        ]
    },

    technologies: {
        id: 'technologies',
        path: '/technologies',
        title: 'Choose Your Tech Stack — Programming & Framework Quizzes | Hangbug',
        description: 'Browse Hangbug technology quizzes and programming practice tracks across HTML, CSS, JavaScript, React.js, PHP, Laravel, Python, SQL, Flutter, and Dart.',
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
        imageAlt: 'Grid of programming language and web framework quiz tracks on Hangbug',
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
        title: 'HTML Quizzes & Markup Practice — Semantic Web & HTML5 Challenges | Hangbug',
        description: 'Practice HTML5 semantic elements, web forms, accessibility attributes, and document structure with interactive HTML quizzes and coding challenges on Hangbug.',
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
        introContent: 'Strengthen your foundation in modern web markup with Hangbug HTML quizzes and interactive syntax challenges. Test your understanding of semantic HTML5 tags, accessible form controls, SEO-friendly heading hierarchies, and document structure through guided practice sessions and bug-spotting games.',
        imageAlt: 'HTML5 semantic markup quiz and frontend coding practice emblem on Hangbug',
        internalLinks: [
            { label: 'HTML Beginners Tutorial', to: '/blog/html-tutorial-for-beginners' },
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
        title: 'CSS Quizzes & Styling Practice — Flexbox, Grid & Responsive Design | Hangbug',
        description: 'Test your CSS skills with interactive quizzes and coding games covering selector specificity, Flexbox, CSS Grid, positioning, and responsive layouts on Hangbug.',
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
        introContent: 'Master stylesheet architecture and responsive layout engineering with Hangbug CSS quizzes and interactive coding games. Practice evaluating selector specificity, aligning elements with Flexbox and CSS Grid, and debugging common box-model and positioning issues.',
        imageAlt: 'CSS3 stylesheet layout, Flexbox, and Grid quiz badge on Hangbug',
        internalLinks: [
            { label: 'CSS Basics Beginners Guide', to: '/blog/css-basics-beginners-guide' },
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
        title: 'JavaScript Quizzes & ES6+ Coding Practice — Async, Closures & DOM | Hangbug',
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
        introContent: 'Evaluate and refine your core scripting expertise with Hangbug JavaScript quizzes and browser-based coding games. Work through session-calibrated questions on variable scoping, lexical closures, Promise resolution, microtask queues, and modern ES6+ syntax.',
        imageAlt: 'JavaScript ES6+ programming quiz and code output predictor icon on Hangbug',
        internalLinks: [
            { label: 'JavaScript Fundamentals Guide', to: '/blog/javascript-fundamentals-beginners-guide' },
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
        title: 'React.js Quizzes & Component Practice — Hooks, State & Virtual DOM | Hangbug',
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
        introContent: 'Test your practical knowledge of component-driven user interfaces with Hangbug React.js quizzes and interactive code challenges. Practice identifying hook dependency pitfalls, tracing component re-renders, managing state immutably, and writing clean JSX.',
        imageAlt: 'React.js component hooks and Virtual DOM quiz emblem on Hangbug',
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
        title: 'PHP Quizzes & Server-Side Coding Practice — Backend Web Development | Hangbug',
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
        introContent: 'Sharpen your backend web development skills with Hangbug PHP quizzes and interactive debugging challenges. Practice core language syntax, associative array manipulation, session management, object-oriented PHP patterns, and secure database querying.',
        imageAlt: 'PHP backend server-side scripting quiz and coding challenge icon on Hangbug',
        internalLinks: [
            { label: 'PHP Programming Guide', to: '/blog/php-programming-beginners-guide' },
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
        title: 'Laravel Quizzes & MVC Framework Practice — Eloquent, Routing & Blade | Hangbug',
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
        introContent: 'Build confidence with modern PHP application architecture through Hangbug Laravel practice and interactive coding games. Explore routing conventions, controller validation, Eloquent ORM queries, database migrations, and Blade component structuring.',
        imageAlt: 'Laravel MVC framework and Eloquent ORM quiz badge on Hangbug',
        internalLinks: [
            { label: 'Laravel MVC Guide', to: '/blog/laravel-basics-mvc-architecture' },
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
        title: 'MySQL Quizzes & SQL Query Practice — Joins, Indexing & Relational DBs | Hangbug',
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
        introContent: 'Practice writing and analyzing relational database queries with Hangbug MySQL quizzes and the interactive SQL Challenge game. Test your grasp of table schemas, relational joins, aggregate functions, constraints, and query execution order.',
        imageAlt: 'MySQL relational database and SQL query challenge icon on Hangbug',
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
        categoryMatcher: ['MongoDB', 'Mongo DB'],
        path: '/technologies/mongodb',
        title: 'MongoDB Quizzes & NoSQL Practice — Document Schemas & Aggregations | Hangbug',
        description: 'Practice MongoDB and NoSQL database concepts on Hangbug with 7 session-wise quizzes and interactive coding challenges covering BSON documents, CRUD queries, indexing, replication, sharding, and aggregations.',
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
            'Live MongoDB Quiz Sessions',
            'Interactive MongoDB Coding & Query Games',
            'Related Database & Backend Tracks'
        ],
        h3s: [
            'BSON Document Modeling & Schema Design',
            'CRUD Operations & Query Comparison Operators',
            'Aggregation Pipelines ($match, $group, $project) & Indexes'
        ],
        introContent: 'Explore document-oriented data modeling and NoSQL query patterns with Hangbug MongoDB practice and interactive coding games. Sharpen your understanding of BSON document structures, filter operators, update modifiers, and multi-stage aggregation pipelines.',
        imageAlt: 'MongoDB NoSQL document database and aggregation pipeline badge on Hangbug',
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
        title: 'Flutter Quizzes & Mobile UI Practice — Widgets, State & Layouts | Hangbug',
        description: 'Practice cross-platform mobile development with Hangbug Flutter quizzes and coding games covering StatelessWidget, StatefulWidget, layout trees, and navigation.',
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
        introContent: 'Practice building declarative, cross-platform user interfaces with Hangbug Flutter coding challenges and quiz tracks. Test your understanding of widget composition, build contexts, layout constraints, state lifecycle methods, and asynchronous UI rendering.',
        imageAlt: 'Flutter cross-platform mobile widget tree practice icon on Hangbug',
        internalLinks: [
            { label: 'Flutter & Dart App Guide', to: '/blog/flutter-dart-mobile-app-development' },
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
        title: 'Dart Quizzes & Programming Practice — Null Safety, Async & OOP | Hangbug',
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
        introContent: 'Build fluency in the client-optimized language powering Flutter with Hangbug Dart practice and interactive coding games. Work through real Dart snippets involving null-aware operators, Future and Stream pipelines, object-oriented mixins, and collection transformations.',
        imageAlt: 'Dart programming language and null-safe async coding badge on Hangbug',
        internalLinks: [
            { label: 'Flutter & Dart App Guide', to: '/blog/flutter-dart-mobile-app-development' },
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
        title: 'Python Quizzes & Coding Practice — Data Structures, OOP & Syntax | Hangbug',
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
        introContent: 'Master clean, Pythonic problem-solving with Hangbug Python quizzes and interactive coding challenges. Practice multi-session assessments covering mutable vs. immutable data types, generator functions, list comprehensions, object-oriented design, and execution behavior.',
        imageAlt: 'Python programming quiz and algorithm practice emblem on Hangbug',
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
        title: 'Programming Fundamentals Quizzes — Logic, OOP & Data Structures | Hangbug',
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
            'Three Pillars of Programming Fundamentals on Hangbug',
            'Core Computer Science Concepts You Will Practice',
            'Interactive Logic, OOP & Algorithm Coding Games',
            'Apply Your Fundamentals to Language Tracks'
        ],
        h3s: [
            'Programming Logic, Booleans & Control Flow',
            'Object-Oriented Programming (Encapsulation, Inheritance & Polymorphism)',
            'Data Structures, Searching, Sorting & Big-O Complexity'
        ],
        introContent: 'Every great software engineer relies on language-agnostic problem-solving skills. Hangbug’s Programming Fundamentals track combines Programming Logic, Object-Oriented Programming (OOP), and Data Structures & Algorithms (DSA) into interactive browser challenges that sharpen how you trace code and design solutions.',
        imageAlt: 'Programming fundamentals icon representing algorithmic logic, OOP, and data structures on Hangbug',
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
        title: 'Coding & Typing Games for Developers — Hangbug Games Hub',
        description: 'Play 20 interactive developer mini-games on Hangbug. Practice algorithm logic, debug code snippets, predict console outputs, write SQL queries, and boost your coding typing speed.',
        primaryKeyword: 'coding games',
        secondaryKeywords: [
            'programming games for developers',
            'developer typing speed games',
            'interactive debugging games online',
            'SQL query game',
            'code puzzle and syntax typing practice'
        ],
        h1: 'Interactive Coding & Typing Games for Developers',
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
        introContent: 'Turn daily programming practice into an engaging arcade challenge. Hangbug’s Games Hub features browser-based coding games and developer typing drills across 24 technology tracks—helping you spot syntax bugs faster, trace program output accurately, and build muscle memory for brackets, operators, and keywords.',
        imageAlt: 'Hangbug Arcade coding games and developer typing challenge showcase banner',
        internalLinks: [
            { label: 'Code Puzzle Game', to: '/games/code-puzzle' },
            { label: 'Find the Bug Game', to: '/games/find-the-bug' },
            { label: 'Output Predictor Game', to: '/games/output-predictor' },
            { label: 'Code Scramble Game', to: '/games/code-scramble' },
            { label: 'Missing Code Game', to: '/games/missing-code' },
            { label: 'Logic Builder Game', to: '/games/logic-builder' },
            { label: 'SQL Challenge Game', to: '/games/sql-challenge' },
            { label: 'Coding Memory Match', to: '/games/memory-match' },
            { label: 'Speed Typing Game', to: '/games/speed-typing' },
            { label: 'Code Typing Game', to: '/games/code-typing' },
            { label: '60-Second Sprint', to: '/games/sixty-second-challenge' },
            { label: 'Error-Free Typing', to: '/games/error-free-typing' },
            { label: 'Syntax Typing Drill', to: '/games/syntax-typing' },
            { label: 'Word Rain Arcade', to: '/games/word-rain' },
            { label: 'C# OOP Challenge', to: '/games/csharp-oop-challenge' },
            { label: 'C# Collections Challenge', to: '/games/csharp-collections-challenge' },
            { label: 'C# LINQ Challenge', to: '/games/csharp-linq-challenge' },
            { label: 'C# Exception Handling', to: '/games/csharp-exception-handling' },
            { label: 'Complete the Code', to: '/games/complete-the-code' },
            { label: 'C# Quiz Challenge', to: '/games/csharp-quiz-challenge' },
            { label: 'Explore Technology Quizzes', to: '/technologies' },
            { label: 'Global Leaderboard', to: '/leaderboard' }
        ]
    },

    certificateInfo: {
        id: 'certificateInfo',
        path: '/certificate/view',
        title: 'Verify Developer Certificate — Hangbug Programming Certificates & Info',
        description: 'Learn how to earn, view, and verify Hangbug programming completion certificates. Score 80% or higher on technology quizzes to unlock shareable QR credentials.',
        primaryKeyword: 'programming certificates',
        secondaryKeywords: [
            'coding quiz certificate of completion',
            'verify developer skill certificate',
            'online programming assessment credential',
            'shareable coding certificate QR code',
            'Hangbug certificate verification'
        ],
        h1: 'Hangbug Programming Certificates & Credential Verification',
        h2s: [
            'Sample & Verified Certificate of Completion',
            'How to Earn a Hangbug Certificate of Completion',
            'Online Certificate ID & QR Verification',
            'Important Transparency Note on Certificate Scope'
        ],
        h3s: [
            'Complete a Technology Quiz With 80% or Higher',
            'Unique Verification ID & Instant Lookup',
            'Non-Accredited Platform Skill Assessment Credential'
        ],
        introContent: 'Hangbug awards digital Certificates of Completion to learners who pass technology quiz assessments with a score of 80% or higher. Each certificate includes your score percentage, completion date, and a unique verification ID so peers and hiring managers can confirm your quiz performance online. Note: Hangbug certificates represent platform-based quiz completion and self-assessment milestones; they are not accredited academic degrees or government-accredited certifications.',
        imageAlt: 'Official Hangbug Certificate of Completion preview with QR verification code and score details',
        internalLinks: [
            { label: 'Browse Technology Quizzes', to: '/technologies' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'React.js Quizzes', to: '/technologies/react' },
            { label: 'Python Quizzes', to: '/technologies/python' },
            { label: 'Practice Coding Games', to: '/games' },
            { label: 'About Hangbug', to: '/about' }
        ]
    },

    about: {
        id: 'about',
        path: '/about',
        title: 'About Hangbug – Technology Learning, Tech Quizzes & Skill Assessment Platform',
        description: 'Test your programming and web development skills with Hangbug. Practice interactive tech quizzes, play coding games, track your progress, and earn score-based certificates.',
        primaryKeyword: 'interactive coding quiz platform',
        secondaryKeywords: [
            'about Hangbug developer platform',
            'online programming practice platform',
            'software engineering self-assessment tool',
            'coding quiz and game learning platform'
        ],
        h1: 'About Hangbug: Interactive Coding Quizzes, Games & Skill Practice',
        h2s: [
            'Core Platform Pillars',
            'Our Mission for Developer Self-Assessment',
            'What You Can Practice on Hangbug'
        ],
        h3s: [
            'Comprehensive Stack Coverage',
            'Verifiable Completion Certificates',
            'Session-Based Progression & Coding Games'
        ],
        introContent: 'Hangbug is an interactive coding quiz and developer practice platform designed to make technical self-assessment active, measurable, and engaging. Whether you are preparing for software engineering interviews, reviewing university coursework, or learning a new stack, Hangbug provides instant feedback across quizzes and coding games.',
        imageAlt: 'Hangbug developer skill verification and coding quiz platform brand emblem',
        internalLinks: [
            { label: 'Explore Technology Quizzes', to: '/technologies' },
            { label: 'Play Coding & Typing Games', to: '/games' },
            { label: 'Certificate Information', to: '/certificate/view' },
            { label: 'Global Leaderboard', to: '/leaderboard' },
            { label: 'Contact Support', to: '/contact' }
        ]
    },

    contact: {
        id: 'contact',
        path: '/contact',
        title: 'Contact Support & Inquiries — Hangbug',
        description: 'Get in touch with the Hangbug team for questions regarding technology quizzes, score-based certificates, coding games, or technical support.',
        primaryKeyword: 'contact Hangbug support',
        secondaryKeywords: [
            'Hangbug help and customer support',
            'coding quiz feedback and bug report',
            'certificate verification assistance',
            'developer platform inquiries'
        ],
        h1: 'Get in Touch with the Hangbug Support Team',
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
        introContent: 'Have a question about a quiz question, need help verifying a completion certificate, or want to report a technical issue? Reach out to the Hangbug team using the contact form or direct support email below, or explore our quick answers to common platform questions.',
        imageAlt: 'Hangbug customer support and developer inquiry contact illustration',
        internalLinks: [
            { label: 'Browse Technology Quizzes', to: '/technologies' },
            { label: 'Play Coding Games', to: '/games' },
            { label: 'Verify a Certificate', to: '/certificate/view' },
            { label: 'About Hangbug', to: '/about' },
            { label: 'Privacy Policy', to: '/privacy-policy' }
        ]
    },

    leaderboard: {
        id: 'leaderboard',
        path: '/leaderboard',
        title: 'Global Developer Leaderboard & Rankings — Hangbug',
        description: 'See top ranked software engineers and learners worldwide. Track XP, accuracy, quiz streaks, and score-based certificates on Hangbug.',
        primaryKeyword: 'developer leaderboard',
        secondaryKeywords: [
            'coding quiz rankings',
            'programming leaderboard',
            'top software developers Hangbug',
            'quiz accuracy scores'
        ],
        h1: 'Global Developer Rankings & Top Quiz Performers',
        h2s: [
            'How Developer Rankings Are Calculated',
            'Scoring Criteria, Accuracy & Speed Multipliers',
            'Weekly & All-Time Developer Standings',
            'Climbing the Leaderboard Through Consistent Practice'
        ],
        h3s: [
            'Quiz Accuracy & Verified Session Completions',
            'Streak Retention & Active Engagement Points',
            'Fair Play & Duplicate Submission Prevention'
        ],
        introContent: 'The Hangbug Leaderboard recognizes top engineering talent worldwide based on quiz accuracy, consecutive practice streaks, and verified technical mastery across frontend, backend, mobile, and database development tracks.',
        imageAlt: 'Hangbug global developer leaderboard rankings and trophy achievements',
        internalLinks: [
            { label: 'HTML Quizzes', to: '/technologies/html' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'Code Puzzle', to: '/games/code-puzzle' },
            { label: 'Developer Blog', to: '/blog' },
            { label: 'Verify Certificate', to: '/certificate/view', rel: 'nofollow' }
        ]
    },

    privacyPolicy: {
        id: 'privacyPolicy',
        path: '/privacy-policy',
        title: 'Privacy Policy — Hangbug Data Protection & Cookie Policy',
        description: 'Understand how Hangbug collects, utilizes, stores, and protects user data, authentication credentials, and advertising cookie disclosures.',
        primaryKeyword: 'Hangbug privacy policy',
        secondaryKeywords: [
            'data protection policy',
            'cookie policy Hangbug',
            'user data deletion rights',
            'Google Identity Services privacy'
        ],
        h1: 'Hangbug Privacy Policy & Personal Data Protection',
        h2s: [
            'Data Collection & Transparent Processing',
            'Authentication Security & Google Sign-In',
            'Cookies, Local Storage & Advertising Compliance',
            'Your Rights: Access, Export & Permanent Account Deletion'
        ],
        h3s: [
            'Personal Information Collected (Email, Display Name, Quiz Scores)',
            'Session Tokens & Anti-Tampering Cookies',
            'Google Identity Services Privacy Assurances',
            'Self-Service Account Deletion within 24 Hours'
        ],
        introContent: 'Hangbug is dedicated to safeguarding your personal data and respecting your privacy rights. This policy transparently explains what data we collect, why we collect it, how your session information is stored, and the strict controls you have over your account information.',
        imageAlt: 'Hangbug data protection and user privacy policy document emblem',
        internalLinks: [
            { label: 'Terms of Service', to: '/terms' },
            { label: 'Delete Account', to: '/delete-account', rel: 'nofollow' },
            { label: 'About Hangbug', to: '/about' },
            { label: 'Contact Support', to: '/contact' }
        ]
    },

    terms: {
        id: 'terms',
        path: '/terms',
        title: 'Terms of Service — Hangbug Platform Terms & Conditions',
        description: 'Review the Hangbug Terms of Service governing platform usage, score-based certificate verification, intellectual property, and community guidelines.',
        primaryKeyword: 'Hangbug terms of service',
        secondaryKeywords: [
            'platform terms and conditions',
            'coding quiz fair play rules',
            'certificate verification terms',
            'Hangbug user agreement'
        ],
        h1: 'Hangbug Platform Terms and Conditions of Service',
        h2s: [
            'Acceptable Use & Academic Integrity',
            'Digital Developer Certificate Authenticity & Verification',
            'Account Security & Authenticated Access',
            'Intellectual Property & Platform Guidelines'
        ],
        h3s: [
            'Fair Assessment Practices & Ban on Automated Solvers',
            'Verifiable Certificate Issuance & LinkedIn Sharing Standards',
            'User Responsibilities for Profile Security',
            'Open Access Learning Philosophy'
        ],
        introContent: 'These Terms of Service govern your access to and use of Hangbug, including our technology quizzes, coding mini-games, leaderboard scoring, and digital developer certificates. By accessing Hangbug, you agree to comply with these terms.',
        imageAlt: 'Hangbug terms of service and platform guidelines document emblem',
        internalLinks: [
            { label: 'Privacy Policy', to: '/privacy-policy' },
            { label: 'Verify Certificates', to: '/certificate/view', rel: 'nofollow' },
            { label: 'About Hangbug', to: '/about' },
            { label: 'Contact Support', to: '/contact' }
        ]
    },

    resources: {
        id: 'blog',
        path: '/blog',
        title: 'Programming & Web Development Blog: Tutorials & Guides | Hangbug',
        description: 'Learn programming step-by-step with practical tutorials, coding guides, and interview prep on HTML, CSS, JavaScript, PHP, Laravel, Flutter, C#, and databases.',
        primaryKeyword: 'programming learning resources',
        secondaryKeywords: [
            'coding practice study guides',
            'web development learning roadmap',
            'how to prepare for coding quizzes',
            'frontend and backend practice guide',
            'developer skill building resources'
        ],
        h1: 'Learn Programming Step by Step — Tutorials & Coding Guides',
        h2s: [
            'Structured Programming Study Roadmaps',
            'How to Combine Coding Quizzes With Interactive Games',
            'Practice Guides by Technology Domain',
            'Understanding Hangbug Completion Certificates'
        ],
        h3s: [
            'Frontend Web Development Path (HTML, CSS, JavaScript & React.js)',
            'Backend & Database Engineering Path (PHP, Laravel, Python, MySQL & MongoDB)',
            'Mobile & Computer Science Foundations (Flutter, Dart & Programming Fundamentals)'
        ],
        introContent: 'Welcome to the Hangbug Learning Resources hub. Use these structured study roadmaps and practice guides to organize your coding review, pair conceptual quizzes with hands-on debugging games, and systematically strengthen your software engineering fundamentals.',
        imageAlt: 'Hangbug developer learning resources and structured coding study roadmap banner',
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
            { label: 'HTML Tutorial for Beginners', to: '/blog/html-tutorial-for-beginners' },
            { label: 'CSS Basics Guide', to: '/blog/css-basics-beginners-guide' },
            { label: 'JavaScript Fundamentals Guide', to: '/blog/javascript-fundamentals-beginners-guide' },
            { label: 'PHP Programming Guide', to: '/blog/php-programming-beginners-guide' },
            { label: 'Laravel MVC Architecture Guide', to: '/blog/laravel-basics-mvc-architecture' },
            { label: 'Flutter & Dart Mobile Guide', to: '/blog/flutter-dart-mobile-app-development' },
            { label: 'Coding & Typing Games', to: '/games' },
            { label: 'Certificate Information', to: '/certificate/view' }
        ]
    },

    leaderboard: {
        id: 'leaderboard',
        path: '/leaderboard',
        title: 'Global Developer Leaderboard & Rankings — Hangbug',
        description: 'View the global Hangbug developer leaderboard. Track top scores, accuracy rankings, completed quiz sessions, and earned technology certificates.',
        primaryKeyword: 'developer quiz leaderboard',
        secondaryKeywords: [
            'global coding rankings',
            'programming quiz top scorers',
            'Hangbug XP and accuracy standings',
            'software developer quiz leaderboard'
        ],
        h1: 'Global Developer Rankings, Quiz Leaderboards & Top Scorers',
        h2s: [
            'How Developer Rankings Are Calculated',
            'Scoring Criteria, Accuracy & Speed Multipliers',
            'Weekly & All-Time Developer Standings',
            'Climbing the Leaderboard Through Consistent Practice'
        ],
        h3s: [
            'Quiz Accuracy & Verified Session Completions',
            'Streak Retention & Active Engagement Points',
            'Fair Play & Duplicate Submission Prevention'
        ],
        introContent: 'The Hangbug Leaderboard recognizes top engineering talent worldwide based on quiz accuracy, consecutive practice streaks, and verified technical mastery across frontend, backend, mobile, and database development tracks.',
        imageAlt: 'Hangbug global developer leaderboard rankings and XP performance board',
        internalLinks: [
            { label: 'HTML Quizzes', to: '/technologies/html' },
            { label: 'JavaScript Quizzes', to: '/technologies/javascript' },
            { label: 'Code Puzzle', to: '/games/code-puzzle' },
            { label: 'Developer Blog', to: '/blog' },
            { label: 'Verify Certificate', to: '/certificate/view', rel: 'nofollow' }
        ]
    },

    privacyPolicy: {
        id: 'privacyPolicy',
        path: '/privacy-policy',
        title: 'Privacy Policy — Hangbug Data Protection & Cookie Policy',
        description: 'Read the official Hangbug Privacy Policy detailing our transparent data collection, cookie usage, account privacy standards, and user data rights.',
        primaryKeyword: 'Hangbug privacy policy',
        secondaryKeywords: [
            'data protection and cookie policy',
            'Hangbug account privacy standards',
            'Google Sign-In data security',
            'self-service account deletion rights'
        ],
        h1: 'Hangbug Privacy Policy & Personal Data Protection',
        h2s: [
            'Data Collection & Transparent Processing',
            'Authentication Security & Google Sign-In',
            'Cookies, Local Storage & Advertising Compliance',
            'Your Rights: Access, Export & Permanent Account Deletion'
        ],
        h3s: [
            'Personal Information Collected (Email, Display Name, Quiz Scores)',
            'Session Tokens & Anti-Tampering Cookies',
            'Google Identity Services Privacy Assurances',
            'Self-Service Account Deletion within 24 Hours'
        ],
        introContent: 'Hangbug is dedicated to safeguarding your personal data and respecting your privacy rights. This policy transparently explains what data we collect, why we collect it, how your session information is stored, and the strict controls you have over your account information.',
        imageAlt: 'Hangbug Privacy Policy and user data protection documentation',
        internalLinks: [
            { label: 'Terms of Service', to: '/terms' },
            { label: 'Delete Account', to: '/delete-account', rel: 'nofollow' },
            { label: 'About Hangbug', to: '/about' },
            { label: 'Contact Support', to: '/contact' }
        ]
    },

    terms: {
        id: 'terms',
        path: '/terms',
        title: 'Terms of Service — Hangbug Platform Terms & Conditions',
        description: 'Review the Hangbug Terms of Service governing quiz taking, developer certificate issuance, community integrity, intellectual property, and platform usage.',
        primaryKeyword: 'Hangbug terms of service',
        secondaryKeywords: [
            'Hangbug platform terms and conditions',
            'developer certificate verification rules',
            'academic integrity and fair play policy',
            'online coding quiz usage terms'
        ],
        h1: 'Hangbug Platform Terms and Conditions of Service',
        h2s: [
            'Acceptable Use & Academic Integrity',
            'Digital Developer Certificate Authenticity & Verification',
            'Account Security & Authenticated Access',
            'Intellectual Property & Platform Guidelines'
        ],
        h3s: [
            'Fair Assessment Practices & Ban on Automated Solvers',
            'Verifiable Certificate Issuance & LinkedIn Sharing Standards',
            'User Responsibilities for Profile Security',
            'Open Access Learning Philosophy'
        ],
        introContent: 'These Terms of Service govern your access to and use of Hangbug, including our technology quizzes, coding mini-games, leaderboard scoring, and digital developer certificates. By accessing Hangbug, you agree to comply with these terms.',
        imageAlt: 'Hangbug Terms of Service and platform usage guidelines',
        internalLinks: [
            { label: 'Privacy Policy', to: '/privacy-policy' },
            { label: 'Verify Certificates', to: '/certificate/view', rel: 'nofollow' },
            { label: 'About Hangbug', to: '/about' },
            { label: 'Contact Support', to: '/contact' }
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

export function resolveGameTechnologyGuide(rawSlug, fallbackName = '') {
    const clean = String(rawSlug || '').trim().toLowerCase();
    if (!clean || clean === 'all') {
        return { to: '/technologies', label: 'All Tech Quizzes', blogTo: '/blog', blogLabel: 'Tutorials & Guides' };
    }

    const mapped = {
        bootstrap: { slug: 'css', label: 'CSS & Styling Quiz', blogTo: '/blog/css-basics-beginners-guide', blogLabel: 'CSS Styling Guide' },
        jquery: { slug: 'javascript', label: 'JavaScript Quiz', blogTo: '/blog/javascript-fundamentals-beginners-guide', blogLabel: 'JavaScript Guide' },
        nodejs: { slug: 'javascript', label: 'JavaScript & Node Quiz', blogTo: '/blog/javascript-fundamentals-beginners-guide', blogLabel: 'JavaScript Guide' },
        express: { slug: 'javascript', label: 'JavaScript & Backend Quiz', blogTo: '/blog/javascript-fundamentals-beginners-guide', blogLabel: 'JavaScript Guide' },
        'full-stack': { slug: 'react', label: 'React & Full-Stack Quiz', blogTo: '/blog/javascript-fundamentals-beginners-guide', blogLabel: 'JavaScript Guide' },
        sql: { slug: 'mysql', label: 'MySQL & SQL Quiz', blogTo: '/blog/laravel-basics-mvc-architecture', blogLabel: 'Laravel & DB Guide' },
        'android-development': { slug: 'dart', label: 'Dart & Mobile Quiz', blogTo: '/blog/flutter-dart-mobile-app-development', blogLabel: 'Flutter & Dart Guide' },
        'programming-logic': { slug: 'programming-fundamentals', label: 'Programming Fundamentals Quiz', blogTo: '/blog/javascript-fundamentals-beginners-guide', blogLabel: 'Programming Guide' },
        oop: { slug: 'programming-fundamentals', label: 'OOP & Fundamentals Quiz', blogTo: '/blog/php-programming-beginners-guide', blogLabel: 'OOP & PHP Guide' },
        dsa: { slug: 'programming-fundamentals', label: 'DSA & Logic Quiz', blogTo: '/blog/javascript-fundamentals-beginners-guide', blogLabel: 'Coding Fundamentals Guide' },
        'html-css': { slug: 'html', label: 'HTML & CSS Quiz', blogTo: '/blog/html-tutorial-for-beginners', blogLabel: 'HTML Tutorial' },
        'web-fundamentals': { slug: 'html', label: 'Web Fundamentals Quiz', blogTo: '/blog/html-tutorial-for-beginners', blogLabel: 'HTML & Web Guide' },
        csharp: { slug: null, label: 'Browse C# & Tech Quizzes', blogTo: '/blog/php-programming-beginners-guide', blogLabel: 'Programming Tutorials' }
    };

    const blogByCanonicalSlug = {
        html: { blogTo: '/blog/html-tutorial-for-beginners', blogLabel: 'HTML Tutorial for Beginners' },
        css: { blogTo: '/blog/css-basics-beginners-guide', blogLabel: 'CSS Basics Guide' },
        javascript: { blogTo: '/blog/javascript-fundamentals-beginners-guide', blogLabel: 'JavaScript Fundamentals Guide' },
        react: { blogTo: '/blog/javascript-fundamentals-beginners-guide', blogLabel: 'JavaScript Fundamentals Guide' },
        php: { blogTo: '/blog/php-programming-beginners-guide', blogLabel: 'PHP Programming Guide' },
        laravel: { blogTo: '/blog/laravel-basics-mvc-architecture', blogLabel: 'Laravel MVC Guide' },
        mysql: { blogTo: '/blog/laravel-basics-mvc-architecture', blogLabel: 'Laravel & MySQL Guide' },
        mongodb: { slug: 'mongodb', blogTo: '/blog/php-programming-beginners-guide', blogLabel: 'Backend Programming Guide' },
        flutter: { blogTo: '/blog/flutter-dart-mobile-app-development', blogLabel: 'Flutter & Dart Guide' },
        dart: { blogTo: '/blog/flutter-dart-mobile-app-development', blogLabel: 'Flutter & Dart Guide' },
        python: { blogTo: '/blog/javascript-fundamentals-beginners-guide', blogLabel: 'Programming Fundamentals' },
        'programming-fundamentals': { blogTo: '/blog/javascript-fundamentals-beginners-guide', blogLabel: 'Programming Logic Guide' }
    };

    const directSeo = getTechnologySeoBySlug(clean);
    if (directSeo) {
        const blogMeta = blogByCanonicalSlug[directSeo.slug] || { blogTo: '/blog', blogLabel: 'Tutorials & Guides' };
        return {
            to: `/technologies/${directSeo.slug}`,
            label: `Take ${fallbackName || directSeo.badge || directSeo.slug.toUpperCase()} Quiz`,
            blogTo: blogMeta.blogTo,
            blogLabel: blogMeta.blogLabel
        };
    }

    const m = mapped[clean];
    if (m) {
        return {
            to: m.slug ? `/technologies/${m.slug}` : '/technologies',
            label: m.label,
            blogTo: m.blogTo,
            blogLabel: m.blogLabel
        };
    }

    return {
        to: '/technologies',
        label: fallbackName ? `Browse ${fallbackName} & All Quizzes` : 'Browse All Tech Quizzes',
        blogTo: '/blog',
        blogLabel: 'Tutorials & Guides'
    };
}

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
