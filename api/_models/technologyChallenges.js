/**
 * Comprehensive technology-specific challenges across all 23 technologies
 * Categorized by gameSlug, technology, and difficulty (Beginner, Intermediate, Advanced)
 */

const TECHNOLOGY_CHALLENGES = [
    // ==========================================
    // 1. HTML
    // ==========================================
    {
        id: 'html_cp_beg_1',
        gameSlug: 'code-puzzle',
        technology: 'html',
        technologyName: 'HTML',
        title: 'HTML Semantic Article Card',
        difficulty: 'Beginner',
        language: 'html',
        description: 'Arrange HTML elements into a semantic blog article card.',
        content: JSON.stringify({
            blocks: [
                '  </header>',
                '  <p>Learn how to write clean, semantic HTML5.</p>',
                '<article class="card">',
                '  <header>',
                '    <h2>Semantic Web</h2>',
                '</article>'
            ]
        }),
        solution: JSON.stringify([
            '<article class="card">',
            '  <header>',
            '    <h2>Semantic Web</h2>',
            '  </header>',
            '  <p>Learn how to write clean, semantic HTML5.</p>',
            '</article>'
        ]),
        hints: 'Open <article>, nest the header with heading, follow with paragraph, then close </article>.',
        explanation: 'Semantic HTML requires opening wrapper containers, nesting child headings, and closing parent elements.',
        points: 100,
        order: 1
    },
    {
        id: 'html_cp_int_1',
        gameSlug: 'code-puzzle',
        technology: 'html',
        technologyName: 'HTML',
        title: 'Accessible Form Field Layout',
        difficulty: 'Intermediate',
        language: 'html',
        description: 'Order markup for an accessible email input with label and helper text.',
        content: JSON.stringify({
            blocks: [
                '    aria-describedby="email-hint" required />',
                '<div class="form-group">',
                '  <label for="user-email">Email Address</label>',
                '  <input type="email" id="user-email" name="email"',
                '  <small id="email-hint">We will never share your email.</small>',
                '</div>'
            ]
        }),
        solution: JSON.stringify([
            '<div class="form-group">',
            '  <label for="user-email">Email Address</label>',
            '  <input type="email" id="user-email" name="email"',
            '    aria-describedby="email-hint" required />',
            '  <small id="email-hint">We will never share your email.</small>',
            '</div>'
        ]),
        hints: 'Container opens first, followed by <label>, then the multiline <input>, and finally helper text.',
        explanation: 'Accessible forms pair <label for="id"> with <input id="..."> and aria-describedby for helper copy.',
        points: 150,
        order: 2
    },
    {
        id: 'html_cp_adv_1',
        gameSlug: 'code-puzzle',
        technology: 'html',
        technologyName: 'HTML',
        title: 'Responsive Picture Element with WebP',
        difficulty: 'Advanced',
        language: 'html',
        description: 'Construct a responsive <picture> with media queries and fallback img.',
        content: JSON.stringify({
            blocks: [
                '  <img src="banner-fallback.jpg" alt="Dev Conference" loading="lazy">',
                '  <source media="(min-width: 1024px)" srcset="banner-large.webp" type="image/webp">',
                '<picture>',
                '  <source media="(min-width: 640px)" srcset="banner-medium.webp" type="image/webp">',
                '</picture>'
            ]
        }),
        solution: JSON.stringify([
            '<picture>',
            '  <source media="(min-width: 1024px)" srcset="banner-large.webp" type="image/webp">',
            '  <source media="(min-width: 640px)" srcset="banner-medium.webp" type="image/webp">',
            '  <img src="banner-fallback.jpg" alt="Dev Conference" loading="lazy">',
            '</picture>'
        ]),
        hints: 'Order media queries from largest to smallest, followed by fallback <img> before </picture>.',
        explanation: 'Browsers evaluate <source> tags top-to-bottom. Largest breakpoints go first before fallback <img>.',
        points: 200,
        order: 3
    },
    {
        id: 'html_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'html',
        technologyName: 'HTML',
        title: 'Unclosed Void Tag or Attribute Error',
        difficulty: 'Beginner',
        language: 'html',
        description: 'Click the buggy line where invalid HTML syntax breaks rendering.',
        content: '1: <!DOCTYPE html>\n2: <html lang="en">\n3:   <body>\n4:     <a href="https://hangbug.com" target="_blank">\n5:       <img src="logo.png" alt="Logo" </a >\n6:     </a>\n7:   </body>\n8: </html>',
        solution: '5',
        hints: 'Look at line 5: check the closing angle bracket on the <img> tag.',
        explanation: 'Line 5 fails to close the <img> tag before prematurely starting </a >.',
        points: 100,
        order: 1
    },
    {
        id: 'html_bug_int_1',
        gameSlug: 'find-the-bug',
        technology: 'html',
        technologyName: 'HTML',
        title: 'Invalid Button Form Attribute',
        difficulty: 'Intermediate',
        language: 'html',
        description: 'Locate the invalid attribute that prevents form submission.',
        content: '1: <form id="quiz-form" action="/submit" method="POST">\n2:   <label for="ans">Your Answer:</label>\n3:   <input type="text" id="ans" name="answer" required />\n4:   <button type="submit" formmethod="GETS">Submit Answer</button>\n5: </form>',
        solution: '4',
        hints: 'Inspect formmethod values on line 4.',
        explanation: 'formmethod must be GET, POST, or dialog. "GETS" is an invalid HTTP method attribute.',
        points: 150,
        order: 2
    },
    {
        id: 'html_bug_adv_1',
        gameSlug: 'find-the-bug',
        technology: 'html',
        technologyName: 'HTML',
        title: 'Malformed Meta Viewport Tag',
        difficulty: 'Advanced',
        language: 'html',
        description: 'Spot the incorrect viewport configuration directive.',
        content: '1: <head>\n2:   <meta charset="UTF-8">\n3:   <meta name="viewport" content="width=device-width; initial-scale=1.0">\n4:   <title>HangBug Arcade</title>\n5: </head>',
        solution: '3',
        hints: 'Viewport directives must be separated by commas, not semicolons.',
        explanation: 'In <meta name="viewport">, directives must be comma-delimited. Semicolons break parsing in WebKit and Blink.',
        points: 200,
        order: 3
    },
    {
        id: 'html_mc_beg_1',
        gameSlug: 'missing-code',
        technology: 'html',
        technologyName: 'HTML',
        title: 'Missing HTML5 Anchor Target',
        difficulty: 'Beginner',
        language: 'html',
        description: 'Fill in the blank to open the link in a fresh browser tab.',
        content: '<a href="https://hangbug.com" target="_____">Open Games</a>',
        solution: '_blank',
        options: ['_blank', '_self', '_parent', '_top'],
        hints: 'The standard keyword starts with an underscore.',
        explanation: 'target="_blank" instructs the browser to open linked resources in a new browsing context.',
        points: 100,
        order: 1
    },
    {
        id: 'html_type_beg_1',
        gameSlug: 'code-typing',
        technology: 'html',
        technologyName: 'HTML',
        title: 'HTML5 Semantic Navigation',
        difficulty: 'Beginner',
        language: 'html',
        description: 'Type out semantic HTML5 navbar markup.',
        content: '<nav class="site-nav">\n  <ul class="nav-links">\n    <li><a href="/home">Home</a></li>\n    <li><a href="/games">Games</a></li>\n  </ul>\n</nav>',
        solution: '<nav class="site-nav">\n  <ul class="nav-links">\n    <li><a href="/home">Home</a></li>\n    <li><a href="/games">Games</a></li>\n  </ul>\n</nav>',
        hints: 'Watch quotes and indentation.',
        explanation: 'Semantic HTML markup creates accessible document structure.',
        points: 100,
        order: 1
    },

    // ==========================================
    // 2. CSS
    // ==========================================
    {
        id: 'css_cp_beg_1',
        gameSlug: 'code-puzzle',
        technology: 'css',
        technologyName: 'CSS',
        title: 'Flexbox Perfect Centering',
        difficulty: 'Beginner',
        language: 'css',
        description: 'Order the CSS rules to center content both vertically and horizontally.',
        content: JSON.stringify({
            blocks: [
                '  min-height: 100vh;',
                '  justify-content: center;',
                '.hero-container {',
                '  align-items: center;',
                '  display: flex;',
                '}'
            ]
        }),
        solution: JSON.stringify([
            '.hero-container {',
            '  display: flex;',
            '  justify-content: center;',
            '  align-items: center;',
            '  min-height: 100vh;',
            '}'
        ]),
        hints: 'Declare display: flex first, then justify-content, align-items, and height.',
        explanation: 'Flexbox centering requires display: flex followed by axis alignments.',
        points: 100,
        order: 1
    },
    {
        id: 'css_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'css',
        technologyName: 'CSS',
        title: 'Typo in CSS Grid Template Columns',
        difficulty: 'Beginner',
        language: 'css',
        description: 'Click the buggy CSS declaration.',
        content: '1: .dashboard-grid {\n2:   display: grid;\n3:   grid-template-colums: repeat(3, 1fr);\n4:   gap: 1.5rem;\n5: }',
        solution: '3',
        hints: 'Check the spelling of columns on line 3.',
        explanation: 'Line 3 has a typo: "grid-template-colums" instead of "grid-template-columns".',
        points: 100,
        order: 1
    },
    {
        id: 'css_pred_beg_1',
        gameSlug: 'output-predictor',
        technology: 'css',
        technologyName: 'CSS',
        title: 'CSS Specificity Calculation',
        difficulty: 'Intermediate',
        language: 'css',
        description: 'Which color will the button have?',
        content: '/* Given styles: */\n#main .btn { color: red; }\nbody button.btn { color: blue; }\nbutton[type="submit"] { color: green; }\n\n<div id="main">\n  <button class="btn" type="submit">Play</button>\n</div>',
        solution: 'red',
        options: ['red', 'blue', 'green', 'black'],
        hints: 'An ID selector (1-0-0) beats multiple classes or element selectors.',
        explanation: '#main .btn has specificity (1, 1, 0), blue is (0, 1, 2), green is (0, 1, 1). Red wins!',
        points: 150,
        order: 1
    },

    // ==========================================
    // 3. JAVASCRIPT
    // ==========================================
    {
        id: 'js_cp_beg_1',
        gameSlug: 'code-puzzle',
        technology: 'javascript',
        technologyName: 'JavaScript',
        title: 'Array Filter and Map Pipeline',
        difficulty: 'Beginner',
        language: 'javascript',
        description: 'Arrange blocks to filter even numbers and calculate their squares.',
        content: JSON.stringify({
            blocks: [
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
        hints: 'Variables must be initialized before they can be referenced in filter and map.',
        explanation: 'Initialize numbers, filter for evens, map each to n * n, then return.',
        points: 100,
        order: 1
    },
    {
        id: 'js_pred_int_1',
        gameSlug: 'output-predictor',
        technology: 'javascript',
        technologyName: 'JavaScript',
        title: 'Event Loop & Promises Order',
        difficulty: 'Intermediate',
        language: 'javascript',
        description: 'Predict the console output order for microtasks and macrotasks.',
        content: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");',
        solution: 'A D C B',
        options: ['A D C B', 'A B C D', 'A C D B', 'A D B C'],
        hints: 'Synchronous runs first (A, D), then microtask queue (Promise C), then macrotask queue (setTimeout B).',
        explanation: 'Synchronous code runs first (A, D). Microtasks execute before macrotasks (C before B).',
        points: 150,
        order: 1
    },
    {
        id: 'js_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'javascript',
        technologyName: 'JavaScript',
        title: 'Const Reassignment Error',
        difficulty: 'Beginner',
        language: 'javascript',
        description: 'Click the line throwing a TypeError at runtime.',
        content: '1: function computeTotal(items) {\n2:   const total = 0;\n3:   for (const item of items) {\n4:     total += item.price;\n5:   }\n6:   return total;\n7: }',
        solution: '4',
        hints: 'Look at line 2: total is declared with const.',
        explanation: 'Line 4 attempts to reassign `total`, which was declared with `const` on line 2. Should use `let`.',
        points: 100,
        order: 1
    },
    {
        id: 'js_scramble_int_1',
        gameSlug: 'code-scramble',
        technology: 'javascript',
        technologyName: 'JavaScript',
        title: 'Async Fetch with Error Handling',
        difficulty: 'Intermediate',
        language: 'javascript',
        description: 'Rearrange statements to create a robust async API fetcher.',
        content: JSON.stringify({
            blocks: [
                '  } catch (err) {',
                'async function loadGames() {',
                '    const res = await fetch("/api/games");',
                '    return await res.json();',
                '    console.error("Fetch failed:", err);',
                '  try {',
                '  }',
                '}'
            ]
        }),
        solution: JSON.stringify([
            'async function loadGames() {',
            '  try {',
            '    const res = await fetch("/api/games");',
            '    return await res.json();',
            '  } catch (err) {',
            '    console.error("Fetch failed:", err);',
            '  }',
            '}'
        ]),
        hints: 'Function declaration -> try block -> fetch + parse -> catch block -> end.',
        explanation: 'Standard async/await error boundary wraps fetch operations in try/catch.',
        points: 150,
        order: 1
    },

    // ==========================================
    // 4. BOOTSTRAP
    // ==========================================
    {
        id: 'bs_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'bootstrap',
        technologyName: 'Bootstrap',
        title: 'Invalid Grid Column Class',
        difficulty: 'Beginner',
        language: 'html',
        description: 'Click the line containing an invalid Bootstrap 5 class name.',
        content: '1: <div class="container">\n2:   <div class="row g-3">\n3:     <div class="col-md-7">\n4:       <div class="card p-3">Left</div>\n5:     </div>\n6:     <div class="col-md-7">\n7:       <div class="card p-3">Right</div>\n8:     </div>\n9:   </div>\n10: </div>',
        solution: '6',
        hints: 'Bootstrap 12-column grid: 7 + 7 = 14, exceeding the 12 column limit.',
        explanation: 'In Bootstrap, row columns sum to 12. Having col-md-7 twice forces an unintended wrap.',
        points: 100,
        order: 1
    },
    {
        id: 'bs_mc_beg_1',
        gameSlug: 'missing-code',
        technology: 'bootstrap',
        technologyName: 'Bootstrap',
        title: 'Bootstrap Flex Centering Utility',
        difficulty: 'Beginner',
        language: 'html',
        description: 'Fill in the class to center text in Bootstrap.',
        content: '<div class="alert alert-success _____">\n  Congratulations on passing the quiz!\n</div>',
        solution: 'text-center',
        options: ['text-center', 'align-center', 'content-center', 'text-middle'],
        hints: 'Bootstrap typography alignment uses text-{alignment}.',
        explanation: 'text-center is the official Bootstrap utility class for centering text.',
        points: 100,
        order: 1
    },

    // ==========================================
    // 5. JQUERY
    // ==========================================
    {
        id: 'jq_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'jquery',
        technologyName: 'jQuery',
        title: 'Missing ID Hash in Selector',
        difficulty: 'Beginner',
        language: 'javascript',
        description: 'Click the line where the selector fails to target the element by ID.',
        content: '1: $(document).ready(function() {\n2:   $("submit-btn").on("click", function(e) {\n3:     e.preventDefault();\n4:     $("#result").fadeIn();\n5:   });\n6: });',
        solution: '2',
        hints: 'Line 2 targets an element name instead of an ID selector #.',
        explanation: 'Line 2 uses $("submit-btn") instead of $("#submit-btn"). An ID selector requires the # prefix.',
        points: 100,
        order: 1
    },

    // ==========================================
    // 6. REACT.JS
    // ==========================================
    {
        id: 'react_cp_int_1',
        gameSlug: 'code-puzzle',
        technology: 'react',
        technologyName: 'React.js',
        title: 'Custom Fetch Hook with useEffect',
        difficulty: 'Intermediate',
        language: 'javascript',
        description: 'Order lines to create a clean useFetch custom React hook.',
        content: JSON.stringify({
            blocks: [
                '  return { data, loading };',
                '  useEffect(() => {',
                'const useFetch = (url) => {',
                '  const [data, setData] = useState(null);',
                '  const [loading, setLoading] = useState(true);',
                '    fetch(url).then(r => r.json()).then(d => { setData(d); setLoading(false); });',
                '  }, [url]);',
                '};'
            ]
        }),
        solution: JSON.stringify([
            'const useFetch = (url) => {',
            '  const [data, setData] = useState(null);',
            '  const [loading, setLoading] = useState(true);',
            '  useEffect(() => {',
            '    fetch(url).then(r => r.json()).then(d => { setData(d); setLoading(false); });',
            '  }, [url]);',
            '  return { data, loading };',
            '};'
        ]),
        hints: 'Define state variables before using them inside useEffect, return at the end.',
        explanation: 'Custom hooks initialize state, run side effects via useEffect, and return an object.',
        points: 150,
        order: 1
    },
    {
        id: 'react_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'react',
        technologyName: 'React.js',
        title: 'Direct State Mutation Anti-pattern',
        difficulty: 'Beginner',
        language: 'javascript',
        description: 'Click the line that directly mutates React state.',
        content: '1: function Counter() {\n2:   const [count, setCount] = useState(0);\n3:   const handleIncrement = () => {\n4:     count = count + 1;\n5:   };\n6:   return <button onClick={handleIncrement}>{count}</button>;\n7: }',
        solution: '4',
        hints: 'Look at line 4: how is count being updated?',
        explanation: 'Line 4 mutates `count` directly. React state is immutable; update via `setCount(prev => prev + 1)`.',
        points: 100,
        order: 1
    },
    {
        id: 'react_pred_adv_1',
        gameSlug: 'output-predictor',
        technology: 'react',
        technologyName: 'React.js',
        title: 'Batching and Functional State Updates',
        difficulty: 'Advanced',
        language: 'javascript',
        description: 'What value is rendered after one click?',
        content: 'function Score() {\n  const [val, setVal] = useState(0);\n  function click() {\n    setVal(val + 1);\n    setVal(v => v + 2);\n    setVal(val + 1);\n  }\n  return <div>{val}</div>;\n}',
        solution: '1',
        options: ['1', '2', '3', '4'],
        hints: 'The final setVal(val + 1) overwrites earlier updates because val is 0 in the closure.',
        explanation: 'val is 0. First setVal(1), second functional setVal(1+2=3), but third setVal(0+1) overrides to 1!',
        points: 200,
        order: 1
    },

    // ==========================================
    // 7. PHP
    // ==========================================
    {
        id: 'php_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'php',
        technologyName: 'PHP',
        title: 'Missing Dollar Sign on Variable',
        difficulty: 'Beginner',
        language: 'php',
        description: 'Click the line with a PHP syntax error.',
        content: '1: <?php\n2: $greeting = "Hello";\n3: $name = "Developer";\n4: message = $greeting . " " . $name;\n5: echo $message;\n6: ?>',
        solution: '4',
        hints: 'All PHP variables must begin with a dollar sign $.',
        explanation: 'Line 4 writes `message` instead of `$message`. PHP variables must begin with `$`.',
        points: 100,
        order: 1
    },
    {
        id: 'php_cp_beg_1',
        gameSlug: 'code-puzzle',
        technology: 'php',
        technologyName: 'PHP',
        title: 'PHP PDO Prepared Statement',
        difficulty: 'Beginner',
        language: 'php',
        description: 'Arrange lines to safely query users by email with PDO.',
        content: JSON.stringify({
            blocks: [
                '  $stmt->execute(["email" => $email]);',
                '  $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");',
                'function findUserByEmail($pdo, $email) {',
                '  return $stmt->fetch(PDO::FETCH_ASSOC);',
                '}'
            ]
        }),
        solution: JSON.stringify([
            'function findUserByEmail($pdo, $email) {',
            '  $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");',
            '  $stmt->execute(["email" => $email]);',
            '  return $stmt->fetch(PDO::FETCH_ASSOC);',
            '}'
        ]),
        hints: 'Function declaration -> prepare SQL -> execute with params -> fetch result.',
        explanation: 'PDO prepared statements separate query compilation from bound parameters.',
        points: 100,
        order: 1
    },
    {
        id: 'php_pred_int_1',
        gameSlug: 'output-predictor',
        technology: 'php',
        technologyName: 'PHP',
        title: 'PHP String Concatenation and Addition',
        difficulty: 'Intermediate',
        language: 'php',
        description: 'What will be output by this PHP 8+ snippet?',
        content: '<?php\n$a = "5";\n$b = 10;\necho $a . $b;\n?>',
        solution: '510',
        options: ['510', '15', 'Fatal Error', '0'],
        hints: 'The dot (.) operator concatenates strings in PHP.',
        explanation: 'In PHP, "." is string concatenation, producing "5" . 10 = "510".',
        points: 150,
        order: 1
    },

    // ==========================================
    // 8. LARAVEL
    // ==========================================
    {
        id: 'laravel_cp_beg_1',
        gameSlug: 'code-puzzle',
        technology: 'laravel',
        technologyName: 'Laravel',
        title: 'RESTful Route and Controller Binding',
        difficulty: 'Beginner',
        language: 'php',
        description: 'Arrange lines for a Laravel API resource route definition.',
        content: JSON.stringify({
            blocks: [
                '    ->name("games.show");',
                'use App\\Http\\Controllers\\GameController;',
                'Route::get("/games/{slug}", [GameController::class, "show"])',
                '    ->middleware("auth:sanctum")'
            ]
        }),
        solution: JSON.stringify([
            'use App\\Http\\Controllers\\GameController;',
            'Route::get("/games/{slug}", [GameController::class, "show"])',
            '    ->middleware("auth:sanctum")',
            '    ->name("games.show");'
        ]),
        hints: 'Import controller first, then route declaration, middleware, and named route.',
        explanation: 'Laravel routes follow fluid chained methods on Route facade instances.',
        points: 100,
        order: 1
    },
    {
        id: 'laravel_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'laravel',
        technologyName: 'Laravel',
        title: 'Missing Return on Eloquent Relationship',
        difficulty: 'Beginner',
        language: 'php',
        description: 'Spot the bug in this Eloquent model relation method.',
        content: '1: class User extends Authenticatable {\n2:   public function scores(): HasMany {\n3:     $this->hasMany(GameScore::class);\n4:   }\n5: }',
        solution: '3',
        hints: 'Eloquent relation methods must return the relationship instance.',
        explanation: 'Line 3 forgets the `return` keyword! Should be `return $this->hasMany(GameScore::class);`.',
        points: 100,
        order: 1
    },

    // ==========================================
    // 9. NODE.JS & EXPRESS.JS
    // ==========================================
    {
        id: 'node_pred_int_1',
        gameSlug: 'output-predictor',
        technology: 'nodejs',
        technologyName: 'Node.js',
        title: 'process.nextTick vs setImmediate',
        difficulty: 'Intermediate',
        language: 'javascript',
        description: 'Predict the console output of Node event loop phases.',
        content: 'setImmediate(() => console.log("1"));\nprocess.nextTick(() => console.log("2"));\nconsole.log("3");',
        solution: '3 2 1',
        options: ['3 2 1', '3 1 2', '1 2 3', '2 3 1'],
        hints: 'Synchronous runs first (3), nextTick queue empties next (2), setImmediate is in check phase (1).',
        explanation: 'Synchronous execution -> nextTick queue -> check phase (setImmediate).',
        points: 150,
        order: 1
    },
    {
        id: 'express_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'express',
        technologyName: 'Express.js',
        title: 'Missing next() in Express Middleware',
        difficulty: 'Beginner',
        language: 'javascript',
        description: 'Click the line causing requests to hang indefinitely.',
        content: '1: const authMiddleware = (req, res, next) => {\n2:   const token = req.headers["authorization"];\n3:   if (!token) {\n4:     return res.status(401).json({ error: "Unauthorized" });\n5:   }\n6:   req.user = verifyToken(token);\n7: };',
        solution: '7',
        hints: 'Middleware must call next() when request is valid to pass control.',
        explanation: 'Line 7 finishes without calling `next()`. The HTTP request hangs because Express is never told to proceed.',
        points: 100,
        order: 1
    },

    // ==========================================
    // 10. PYTHON
    // ==========================================
    {
        id: 'py_cp_beg_1',
        gameSlug: 'code-puzzle',
        technology: 'python',
        technologyName: 'Python',
        title: 'List Comprehension with Conditional',
        difficulty: 'Beginner',
        language: 'python',
        description: 'Arrange blocks to calculate the squares of odd numbers from 1 to 10.',
        content: JSON.stringify({
            blocks: [
                'odds_squared = [',
                '    x ** 2',
                '    for x in range(1, 11)',
                '    if x % 2 != 0',
                ']'
            ]
        }),
        solution: JSON.stringify([
            'odds_squared = [',
            '    x ** 2',
            '    for x in range(1, 11)',
            '    if x % 2 != 0',
            ']'
        ]),
        hints: 'Expression first (x ** 2), then loop (for x in ...), then filter condition (if ...).',
        explanation: 'Python list comprehensions take the form [expression for item in iterable if condition].',
        points: 100,
        order: 1
    },
    {
        id: 'py_pred_int_1',
        gameSlug: 'output-predictor',
        technology: 'python',
        technologyName: 'Python',
        title: 'Mutable Default Argument Pitfall',
        difficulty: 'Intermediate',
        language: 'python',
        description: 'Predict the output of repeated function calls with default list argument.',
        content: 'def append_to(num, target=[]):\n    target.append(num)\n    return target\n\nprint(append_to(1))\nprint(append_to(2))',
        solution: '[1] [1, 2]',
        options: ['[1] [1, 2]', '[1] [2]', '[1] [2, 1]', 'Error'],
        hints: 'Default arguments in Python are evaluated once at function definition time, not call time.',
        explanation: 'The list `target` is created once when the function is defined. The second call appends to the same list.',
        points: 150,
        order: 1
    },

    // ==========================================
    // 11. MYSQL & SQL
    // ==========================================
    {
        id: 'sql_ch_beg_1',
        gameSlug: 'sql-challenge',
        technology: 'mysql',
        technologyName: 'MySQL',
        title: 'High Scoring Quiz Candidates',
        difficulty: 'Beginner',
        language: 'sql',
        description: 'Select name, score, and category for all attempts scoring 80% or higher, sorted by score descending.',
        content: '-- Table: quiz_results (id, name, score, category, created_at)\nSELECT name, score, category FROM quiz_results WHERE score >= 80 ORDER BY score DESC;',
        solution: 'SELECT name, score, category FROM quiz_results WHERE score >= 80 ORDER BY score DESC;',
        hints: 'Use WHERE score >= 80 and ORDER BY score DESC.',
        explanation: 'Filters matching records with WHERE and sorts highest to lowest with DESC.',
        points: 100,
        order: 1
    },
    {
        id: 'sql_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'sql',
        technologyName: 'SQL',
        title: 'WHERE vs HAVING Clause Confusion',
        difficulty: 'Beginner',
        language: 'sql',
        description: 'Click the line attempting to filter aggregated values using WHERE.',
        content: '1: SELECT department, COUNT(*) AS total_emps\n2: FROM employees\n3: WHERE COUNT(*) > 5\n4: GROUP BY department;',
        solution: '3',
        hints: 'Aggregated functions like COUNT(*) must be filtered with HAVING, not WHERE.',
        explanation: 'Line 3 attempts to filter `COUNT(*) > 5` in WHERE. Aggregated conditions belong in HAVING.',
        points: 100,
        order: 1
    },

    // ==========================================
    // 12. MONGODB
    // ==========================================
    {
        id: 'mongo_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'mongodb',
        technologyName: 'MongoDB',
        title: 'Missing Dollar Sign on Update Operator',
        difficulty: 'Beginner',
        language: 'javascript',
        description: 'Click the line with the incorrect MongoDB update operator syntax.',
        content: '1: await db.collection("users").updateOne(\n2:   { _id: userId },\n3:   { set: { highScore: 850 } }\n4: );',
        solution: '3',
        hints: 'MongoDB update operators require a leading dollar sign (e.g. $set).',
        explanation: 'Line 3 uses `set` instead of `$set`. MongoDB requires the `$` prefix for update operators.',
        points: 100,
        order: 1
    },

    // ==========================================
    // 13. FLUTTER & DART
    // ==========================================
    {
        id: 'flutter_cp_beg_1',
        gameSlug: 'code-puzzle',
        technology: 'flutter',
        technologyName: 'Flutter',
        title: 'StatelessWidget Scaffold Construction',
        difficulty: 'Beginner',
        language: 'dart',
        description: 'Arrange Dart blocks to build a clean Flutter screen widget.',
        content: JSON.stringify({
            blocks: [
                '    return Scaffold(',
                'class GamesScreen extends StatelessWidget {',
                '  const GamesScreen({super.key});',
                '  Widget build(BuildContext context) {',
                '      appBar: AppBar(title: const Text("Games")),',
                '      body: const Center(child: Text("Ready to Play!")),',
                '    );',
                '  }',
                '}'
            ]
        }),
        solution: JSON.stringify([
            'class GamesScreen extends StatelessWidget {',
            '  const GamesScreen({super.key});',
            '  Widget build(BuildContext context) {',
            '    return Scaffold(',
            '      appBar: AppBar(title: const Text("Games")),',
            '      body: const Center(child: Text("Ready to Play!")),',
            '    );',
            '  }',
            '}'
        ]),
        hints: 'Class declaration -> const constructor -> build method override -> Scaffold return.',
        explanation: 'A Flutter StatelessWidget overrides build(BuildContext context) to return its widget tree.',
        points: 100,
        order: 1
    },
    {
        id: 'flutter_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'flutter',
        technologyName: 'Flutter',
        title: 'Calling setState() Directly inside build()',
        difficulty: 'Beginner',
        language: 'dart',
        description: 'Click the line triggering infinite re-render loop error.',
        content: '1: @override\n2: Widget build(BuildContext context) {\n3:   setState(() { _loaded = true; });\n4:   return Scaffold(body: Text("Loading..."));\n5: }',
        solution: '3',
        hints: 'setState() must never be called synchronously inside a widget build method.',
        explanation: 'Line 3 calls `setState()` during `build()`. This triggers an immediate infinite build loop in Flutter.',
        points: 100,
        order: 1
    },
    {
        id: 'dart_pred_beg_1',
        gameSlug: 'output-predictor',
        technology: 'dart',
        technologyName: 'Dart',
        title: 'Dart Null-Coalescing Operator',
        difficulty: 'Beginner',
        language: 'dart',
        description: 'What will be printed to debug console?',
        content: 'void main() {\n  String? user;\n  String displayName = user ?? "Guest Player";\n  print(displayName);\n}',
        solution: 'Guest Player',
        options: ['Guest Player', 'null', 'user', 'Error'],
        hints: 'The ?? operator returns the right-hand operand if the left operand is null.',
        explanation: '`user` is null, so `user ?? "Guest Player"` evaluates to "Guest Player".',
        points: 100,
        order: 1
    },
    {
        id: 'dart_cp_beg_1',
        gameSlug: 'code-puzzle',
        technology: 'dart',
        technologyName: 'Dart',
        title: 'Dart Class with Named Constructor & Initializer',
        difficulty: 'Intermediate',
        language: 'dart',
        description: 'Arrange lines to define an immutable Dart GameScore record class.',
        content: JSON.stringify({
            blocks: [
                '  final int score;',
                '  const GameScore({',
                'class GameScore {',
                '  final String gameSlug;',
                '    required this.gameSlug,',
                '    required this.score,',
                '  });',
                '}'
            ]
        }),
        solution: JSON.stringify([
            'class GameScore {',
            '  final String gameSlug;',
            '  final int score;',
            '  const GameScore({',
            '    required this.gameSlug,',
            '    required this.score,',
            '  });',
            '}'
        ]),
        hints: 'Class definition -> final fields -> const constructor with required parameters.',
        explanation: 'Dart immutable models declare final fields and const constructors for compile-time safety.',
        points: 150,
        order: 1
    },

    // ==========================================
    // 14. ANDROID DEVELOPMENT
    // ==========================================
    {
        id: 'android_bug_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'android-development',
        technologyName: 'Android Development',
        title: 'Network on Main Thread Exception',
        difficulty: 'Beginner',
        language: 'kotlin',
        description: 'Spot the fatal Android architecture violation.',
        content: '1: override fun onCreate(savedInstanceState: Bundle?) {\n2:   super.onCreate(savedInstanceState)\n3:   setContentView(R.layout.activity_main)\n4:   val data = URL("https://api.hangbug.com/games").readText()\n5:   textView.text = data\n6: }',
        solution: '4',
        hints: 'Android strictly prohibits synchronous HTTP network operations on the main UI thread.',
        explanation: 'Line 4 executes a synchronous network call on the main thread, throwing NetworkOnMainThreadException.',
        points: 100,
        order: 1
    },

    // ==========================================
    // 15. PROGRAMMING FUNDAMENTALS & LOGIC & OOP & DSA
    // ==========================================
    {
        id: 'logic_lb_beg_1',
        gameSlug: 'logic-builder',
        technology: 'programming-logic',
        technologyName: 'Programming Logic',
        title: 'Safe Numeric Range Clamping',
        difficulty: 'Beginner',
        language: 'javascript',
        description: 'Implement clamping logic: keep value between min and max inclusive.',
        content: 'function clamp(value, min, max) {\n  // Return min if value < min, max if value > max, otherwise value\n  return Math.min(Math.max(value, min), max);\n}',
        solution: 'Math.min(Math.max(value, min), max)',
        hints: 'Use Math.max to enforce min bound, then Math.min to enforce max bound.',
        explanation: 'Clamping restricts numbers within [min, max] range.',
        points: 100,
        order: 1
    },
    {
        id: 'oop_pred_beg_1',
        gameSlug: 'output-predictor',
        technology: 'oop',
        technologyName: 'Object-Oriented Programming (OOP)',
        title: 'Polymorphic Method Overriding',
        difficulty: 'Beginner',
        language: 'javascript',
        description: 'What is logged when dog.speak() is invoked?',
        content: 'class Animal {\n  speak() { return "Sound"; }\n}\nclass Dog extends Animal {\n  speak() { return "Woof!"; }\n}\nconst pet = new Dog();\nconsole.log(pet.speak());',
        solution: 'Woof!',
        options: ['Woof!', 'Sound', 'undefined', 'Error'],
        hints: 'Subclass method overrides parent class implementation.',
        explanation: 'Dog overrides speak(). Calling pet.speak() outputs "Woof!".',
        points: 100,
        order: 1
    },
    {
        id: 'dsa_scramble_int_1',
        gameSlug: 'code-scramble',
        technology: 'dsa',
        technologyName: 'Data Structures & Algorithms',
        title: 'Binary Search Algorithm Steps',
        difficulty: 'Intermediate',
        language: 'javascript',
        description: 'Order statements to implement efficient O(log n) binary search.',
        content: JSON.stringify({
            blocks: [
                '    const mid = Math.floor((low + high) / 2);',
                '  while (low <= high) {',
                'function binarySearch(arr, target) {',
                '  let low = 0, high = arr.length - 1;',
                '    if (arr[mid] === target) return mid;',
                '    else if (arr[mid] < target) low = mid + 1;',
                '    else high = mid - 1;',
                '  }',
                '  return -1;',
                '}'
            ]
        }),
        solution: JSON.stringify([
            'function binarySearch(arr, target) {',
            '  let low = 0, high = arr.length - 1;',
            '  while (low <= high) {',
            '    const mid = Math.floor((low + high) / 2);',
            '    if (arr[mid] === target) return mid;',
            '    else if (arr[mid] < target) low = mid + 1;',
            '    else high = mid - 1;',
            '  }',
            '  return -1;',
            '}'
        ]),
        hints: 'Initialize pointers -> while low <= high -> calculate mid -> check equal, less, or greater.',
        explanation: 'Binary search continuously halves search space by comparing target with mid element.',
        points: 150,
        order: 1
    },

    // ==========================================
    // 16. WEB DEVELOPMENT & FULL STACK
    // ==========================================
    {
        id: 'web_pred_beg_1',
        gameSlug: 'output-predictor',
        technology: 'web-fundamentals',
        technologyName: 'Web Development Fundamentals',
        title: 'HTTP Status Code Meaning',
        difficulty: 'Beginner',
        language: 'general',
        description: 'Which status code indicates a successful resource creation?',
        content: 'HTTP/1.1 ___ Created\nContent-Type: application/json\nLocation: /api/games/10',
        solution: '201',
        options: ['201', '200', '204', '301'],
        hints: '200 is OK, while 201 indicates a new resource was created.',
        explanation: 'HTTP 201 Created is the standard status code indicating successful resource persistence.',
        points: 100,
        order: 1
    },
    {
        id: 'fullstack_cp_int_1',
        gameSlug: 'code-puzzle',
        technology: 'full-stack',
        technologyName: 'Full Stack Development',
        title: 'Full Stack API Controller to DB Pipeline',
        difficulty: 'Intermediate',
        language: 'javascript',
        description: 'Order statements for an API controller saving scores and returning JSON.',
        content: JSON.stringify({
            blocks: [
                '    return res.json({ success: true, record });',
                '  try {',
                'const saveGameScore = async (req, res) => {',
                '    const { score, gameSlug } = req.body;',
                '    const record = await prisma.gameScore.create({ data: { score, gameSlug } });',
                '  } catch (err) {',
                '    return res.status(500).json({ error: err.message });',
                '  }',
                '};'
            ]
        }),
        solution: JSON.stringify([
            'const saveGameScore = async (req, res) => {',
            '  try {',
            '    const { score, gameSlug } = req.body;',
            '    const record = await prisma.gameScore.create({ data: { score, gameSlug } });',
            '    return res.json({ success: true, record });',
            '  } catch (err) {',
            '    return res.status(500).json({ error: err.message });',
            '  }',
            '};'
        ]),
        hints: 'Async handler -> try block -> destructure body -> database call -> json response.',
        explanation: 'Controller handles HTTP payload, communicates with database layer, and returns formatted JSON.',
        points: 150,
        order: 1
    },

    // ==========================================
    // C# (C-SHARP) DEDICATED CHALLENGES
    // ==========================================

    // --- C# Code Puzzle ---
    {
        id: 'csharp_cp_beg_1',
        gameSlug: 'code-puzzle',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'C# User Greeting and Interpolation',
        difficulty: 'Beginner',
        language: 'csharp',
        description: 'Arrange C# statements in the correct execution order to calculate retirement years.',
        content: JSON.stringify({
            blocks: [
                'int retirementAge = 65;',
                'string name = "Jordan";',
                'Console.WriteLine($"Hello {name}, you have {yearsLeft} years until retirement.");',
                'int currentAge = 25;',
                'int yearsLeft = retirementAge - currentAge;'
            ]
        }),
        solution: JSON.stringify([
            'string name = "Jordan";',
            'int currentAge = 25;',
            'int retirementAge = 65;',
            'int yearsLeft = retirementAge - currentAge;',
            'Console.WriteLine($"Hello {name}, you have {yearsLeft} years until retirement.");'
        ]),
        hints: 'Declare variables first, perform subtraction, and finally print with string interpolation.',
        explanation: 'Variables must be initialized before they can be used in arithmetic operations and output formatting.',
        points: 100,
        order: 1
    },
    {
        id: 'csharp_cp_int_1',
        gameSlug: 'code-puzzle',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'C# Encapsulated BankAccount Class',
        difficulty: 'Intermediate',
        language: 'csharp',
        description: 'Order C# class members with constructor, encapsulation, and deposit method.',
        content: JSON.stringify({
            blocks: [
                '    public void Deposit(decimal amount) => Balance += amount;',
                'public class BankAccount',
                '{',
                '    public decimal Balance { get; private set; }',
                '    public BankAccount(decimal opening) => Balance = opening;',
                '}'
            ]
        }),
        solution: JSON.stringify([
            'public class BankAccount',
            '{',
            '    public decimal Balance { get; private set; }',
            '    public BankAccount(decimal opening) => Balance = opening;',
            '    public void Deposit(decimal amount) => Balance += amount;',
            '}'
        ]),
        hints: 'Class declaration opens first, followed by properties, constructor, methods, and closing brace.',
        explanation: 'Standard C# class convention defines state properties first, constructor initializers, then public domain methods.',
        points: 150,
        order: 2
    },
    {
        id: 'csharp_cp_adv_1',
        gameSlug: 'code-puzzle',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'C# Async Generic Web Downloader',
        difficulty: 'Advanced',
        language: 'csharp',
        description: 'Assemble an asynchronous generic HTTP pipeline with type constraint.',
        content: JSON.stringify({
            blocks: [
                '    return JsonSerializer.Deserialize<T>(json);',
                'public async Task<T?> FetchDataAsync<T>(string url) where T : class',
                '{',
                '    using var client = new HttpClient();',
                '    var response = await client.GetAsync(url);',
                '    response.EnsureSuccessStatusCode();',
                '    var json = await response.Content.ReadAsStringAsync();',
                '}'
            ]
        }),
        solution: JSON.stringify([
            'public async Task<T?> FetchDataAsync<T>(string url) where T : class',
            '{',
            '    using var client = new HttpClient();',
            '    var response = await client.GetAsync(url);',
            '    response.EnsureSuccessStatusCode();',
            '    var json = await response.Content.ReadAsStringAsync();',
            '    return JsonSerializer.Deserialize<T>(json);',
            '}'
        ]),
        hints: 'Signature with where constraint -> HttpClient -> GetAsync -> EnsureSuccessStatusCode -> ReadAsStringAsync -> Deserialize.',
        explanation: 'Asynchronous HTTP operations require awaiting the network response, validating the status code, reading content stream, and deserializing.',
        points: 200,
        order: 3
    },

    // --- Find the Bug – C# ---
    {
        id: 'csharp_ftb_beg_1',
        gameSlug: 'find-the-bug',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Integer Division Truncation in Average',
        difficulty: 'Beginner',
        language: 'csharp',
        category: 'Arithmetic Bug',
        description: 'Identify syntax, logical, and runtime errors in C# code.',
        content: JSON.stringify({
            lines: [
                'public double CalculateAverage(int[] scores)',
                '{',
                '    int sum = 0;',
                '    for (int i = 0; i < scores.Length; i++) sum += scores[i];',
                '    double average = sum / scores.Length;',
                '    return average;',
                '}'
            ],
            bugLine: 5,
            fix: '    double average = (double)sum / scores.Length;'
        }),
        solution: '5',
        hints: 'Dividing two integer operands performs integer truncation before converting to double.',
        explanation: 'Line 5 performs integer division because both `sum` and `scores.Length` are integers. Cast at least one operand to `double` or `(double)sum / scores.Length`.',
        points: 100,
        order: 1
    },
    {
        id: 'csharp_ftb_int_1',
        gameSlug: 'find-the-bug',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Missing Override Keyword in Derived Class',
        difficulty: 'Intermediate',
        language: 'csharp',
        category: 'Polymorphism Bug',
        description: 'Spot the polymorphism defect causing base method invocation.',
        content: JSON.stringify({
            lines: [
                'public class Employee {',
                '    public virtual decimal GetBonus() => 1000m;',
                '}',
                'public class Manager : Employee {',
                '    public decimal GetBonus() => 5000m;',
                '}',
                'Employee staff = new Manager();'
            ],
            bugLine: 5,
            fix: '    public override decimal GetBonus() => 5000m;'
        }),
        solution: '5',
        hints: 'In C#, omitting `override` hides the base virtual method instead of overriding it.',
        explanation: 'Line 5 lacks the `override` modifier. Without `override`, `Manager.GetBonus` hides `Employee.GetBonus` (CS0114), so calling `staff.GetBonus()` yields 1000m instead of 5000m.',
        points: 150,
        order: 2
    },
    {
        id: 'csharp_ftb_adv_1',
        gameSlug: 'find-the-bug',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Async Void Exception Swallowing Bug',
        difficulty: 'Advanced',
        language: 'csharp',
        category: 'Asynchronous Bug',
        description: 'Find the unhandled async task defect in service method.',
        content: JSON.stringify({
            lines: [
                'public class PaymentService {',
                '    public async void ProcessTransactionAsync(string orderId)',
                '    {',
                '        await Task.Delay(100);',
                '        throw new InvalidOperationException("Gateway timeout");',
                '    }',
                '}'
            ],
            bugLine: 2,
            fix: '    public async Task ProcessTransactionAsync(string orderId)'
        }),
        solution: '2',
        hints: 'Async methods that perform background work should return Task, not void.',
        explanation: 'Line 2 declares `async void`. Unhandled exceptions thrown by `async void` methods cannot be caught by callers and will crash the process or terminate the SynchronizationContext.',
        points: 200,
        order: 3
    },

    // --- C# Output Predictor ---
    {
        id: 'csharp_op_beg_1',
        gameSlug: 'output-predictor',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Primitive Type Pass-by-Value Parameter',
        difficulty: 'Beginner',
        language: 'csharp',
        description: 'Predict the output of C# programs.',
        content: JSON.stringify({
            code: 'int number = 15;\nvoid DoubleIt(int x) { x *= 2; }\nDoubleIt(number);\nConsole.WriteLine(number);',
            options: ['15', '30', '0', 'Compilation Error']
        }),
        solution: '15',
        hints: 'In C#, value types like int are passed by value unless ref or out keywords are specified.',
        explanation: 'In C#, `int` is a value type. The `DoubleIt` method receives a copy of `number`. Modifying `x` inside the method does not alter the caller original variable.',
        points: 100,
        order: 1
    },
    {
        id: 'csharp_op_int_1',
        gameSlug: 'output-predictor',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Virtual Override vs New Method Hiding',
        difficulty: 'Intermediate',
        language: 'csharp',
        description: 'Predict the console output of polymorphic dispatch.',
        content: JSON.stringify({
            code: 'class Parent { public virtual void Show() => Console.Write("P "); }\nclass Child : Parent { public new void Show() => Console.Write("C "); }\nParent item = new Child();\nitem.Show();',
            options: ['P ', 'C ', 'P C ', 'Runtime Exception']
        }),
        solution: 'P ',
        hints: 'Method hiding with the new keyword relies on the compile-time variable reference type.',
        explanation: 'Because `Child` declares `Show` using `new` rather than `override`, virtual dispatch is disabled. The variable `item` is typed as `Parent`, so `Parent.Show()` is executed.',
        points: 150,
        order: 2
    },
    {
        id: 'csharp_op_adv_1',
        gameSlug: 'output-predictor',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'LINQ Deferred Execution with Mutation',
        difficulty: 'Advanced',
        language: 'csharp',
        description: 'Trace deferred execution of LINQ query when underlying list mutates.',
        content: JSON.stringify({
            code: 'var list = new List<int> { 1, 2, 3 };\nint factor = 2;\nvar query = list.Select(x => x * factor);\nfactor = 10;\nlist.Add(4);\nConsole.WriteLine(string.Join(", ", query));',
            options: ['10, 20, 30, 40', '2, 4, 6', '2, 4, 6, 8', '10, 20, 30']
        }),
        solution: '10, 20, 30, 40',
        hints: 'LINQ Select is deferred and executes only when enumerated by string.Join.',
        explanation: 'LINQ queries are lazily evaluated. When `string.Join` forces evaluation, `factor` has been updated to 10 and `list` contains 4 elements: [1*10, 2*10, 3*10, 4*10].',
        points: 200,
        order: 3
    },

    // --- C# Code Scramble ---
    {
        id: 'csharp_cs_beg_1',
        gameSlug: 'code-scramble',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Array Accumulator For Loop',
        difficulty: 'Beginner',
        language: 'csharp',
        description: 'Rearrange scrambled C# code into a working program.',
        content: JSON.stringify({
            statements: [
                'int[] grades = { 80, 90, 100 };',
                'int sum = 0;',
                'for (int i = 0; i < grades.Length; i++)',
                '{ sum += grades[i]; }',
                'Console.WriteLine($"Total: {sum}");'
            ]
        }),
        solution: JSON.stringify([
            'int[] grades = { 80, 90, 100 };',
            'int sum = 0;',
            'for (int i = 0; i < grades.Length; i++)',
            '{ sum += grades[i]; }',
            'Console.WriteLine($"Total: {sum}");'
        ]),
        hints: 'Initialize array and accumulator, loop through elements, then print total.',
        explanation: 'Loop iteration accumulates each array value into `sum` before printing.',
        points: 100,
        order: 1
    },
    {
        id: 'csharp_cs_int_1',
        gameSlug: 'code-scramble',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Dictionary Frequency Counter',
        difficulty: 'Intermediate',
        language: 'csharp',
        description: 'Rearrange statements to count string token occurrences.',
        content: JSON.stringify({
            statements: [
                'var counts = new Dictionary<string, int>();',
                'string[] tags = { "csharp", "dotnet", "csharp" };',
                'foreach (var tag in tags)',
                '{',
                '    if (!counts.TryAdd(tag, 1))',
                '        counts[tag]++;',
                '}',
                'Console.WriteLine(counts["csharp"]);'
            ]
        }),
        solution: JSON.stringify([
            'var counts = new Dictionary<string, int>();',
            'string[] tags = { "csharp", "dotnet", "csharp" };',
            'foreach (var tag in tags)',
            '{',
            '    if (!counts.TryAdd(tag, 1))',
            '        counts[tag]++;',
            '}',
            'Console.WriteLine(counts["csharp"]);'
        ]),
        hints: 'Instantiate Dictionary, define tags array, loop to TryAdd or increment, print count.',
        explanation: 'Dictionary.TryAdd safely adds new keys or returns false so existing values can be incremented.',
        points: 150,
        order: 2
    },
    {
        id: 'csharp_cs_adv_1',
        gameSlug: 'code-scramble',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Parallel Async Task Pipeline',
        difficulty: 'Advanced',
        language: 'csharp',
        description: 'Order statements to spawn concurrent tasks and await combined results.',
        content: JSON.stringify({
            statements: [
                'var taskA = Task.Run(() => 100 * 2);',
                'var taskB = Task.Run(() => 50 * 4);',
                'var results = await Task.WhenAll(taskA, taskB);',
                'int combined = results[0] + results[1];',
                'Console.WriteLine($"Result: {combined}");'
            ]
        }),
        solution: JSON.stringify([
            'var taskA = Task.Run(() => 100 * 2);',
            'var taskB = Task.Run(() => 50 * 4);',
            'var results = await Task.WhenAll(taskA, taskB);',
            'int combined = results[0] + results[1];',
            'Console.WriteLine($"Result: {combined}");'
        ]),
        hints: 'Start background tasks, await Task.WhenAll, sum outcomes, and log to console.',
        explanation: 'Task.WhenAll coordinates parallel asynchronous operations and returns an array of completed results.',
        points: 200,
        order: 3
    },

    // --- Missing Code – C# ---
    {
        id: 'csharp_mc_beg_1',
        gameSlug: 'missing-code',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Pattern Matching Switch Discard Pattern',
        difficulty: 'Beginner',
        language: 'csharp',
        description: 'Fill in missing keywords, statements, methods, and expressions.',
        content: JSON.stringify({
            codeBefore: 'object val = 42;\nstring desc = val switch\n{\n    int n => $"Integer: {n}",\n    string s => $"String: {s}",\n    ',
            blank: '_',
            codeAfter: ' => "Unknown"\n};\nConsole.WriteLine(desc);',
            options: ['_', 'default', '*', 'else']
        }),
        solution: '_',
        hints: 'In C# switch expressions, what character is the discard pattern for all other values?',
        explanation: 'C# switch expressions use the discard pattern `_` to match any unhandled input, equivalent to the default case in switch statements.',
        points: 100,
        order: 1
    },
    {
        id: 'csharp_mc_int_1',
        gameSlug: 'missing-code',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'C# Interface Implementation Syntax',
        difficulty: 'Intermediate',
        language: 'csharp',
        description: 'Complete the class declaration implementing an interface contract.',
        content: JSON.stringify({
            codeBefore: 'public interface ICalculator { int Add(int a, int b); }\n\npublic class SimpleCalculator ',
            blank: ':',
            codeAfter: ' ICalculator\n{\n    public int Add(int a, int b) => a + b;\n}',
            options: [':', 'implements', 'extends', 'with']
        }),
        solution: ':',
        hints: 'C# uses a colon syntax for both class inheritance and interface implementation.',
        explanation: 'Unlike Java (implements) or TypeScript (implements), C# uses a single colon `:` symbol for both class derivation and interface contracts.',
        points: 150,
        order: 2
    },
    {
        id: 'csharp_mc_adv_1',
        gameSlug: 'missing-code',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Generic Type Parameter Constraint Clause',
        difficulty: 'Advanced',
        language: 'csharp',
        description: 'Complete the generic factory method constraint clause.',
        content: JSON.stringify({
            codeBefore: 'public class Factory<T> ',
            blank: 'where',
            codeAfter: ' T : class, new()\n{\n    public T Create() => new T();\n}',
            options: ['where', 'having', 'when', 'requires']
        }),
        solution: 'where',
        hints: 'Which C# keyword introduces generic type constraints?',
        explanation: 'The `where` keyword introduces generic type constraints, ensuring `T` is a reference type with a parameterless constructor (`class, new()`).',
        points: 200,
        order: 3
    },

    // --- C# Logic Builder ---
    {
        id: 'csharp_lb_beg_1',
        gameSlug: 'logic-builder',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Bitwise Parity Calculation',
        difficulty: 'Beginner',
        language: 'csharp',
        description: 'Solve programming logic challenges using C#.',
        content: JSON.stringify({
            prompt: 'In C#, given byte value = 0b00110101 (decimal 53), how many 1-bits are present, and is the count even or odd?',
            options: ['4 bits (even)', '5 bits (odd)', '3 bits (odd)', '6 bits (even)']
        }),
        solution: '4 bits (even)',
        hints: 'Count the number of 1s in 00110101.',
        explanation: '0b00110101 has 1s at positions 0, 2, 4, 5 (four set bits). Since 4 % 2 == 0, the parity count is even.',
        points: 100,
        order: 1
    },
    {
        id: 'csharp_lb_int_1',
        gameSlug: 'logic-builder',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Two-Pointer Palindrome Validation',
        difficulty: 'Intermediate',
        language: 'csharp',
        description: 'Evaluate string symmetry using two-pointer traversal.',
        content: JSON.stringify({
            prompt: 'Given string s = "racecar", if left pointer starts at 0 and right at 6, how many character comparisons are performed before pointers meet?',
            options: ['3 comparisons', '4 comparisons', '7 comparisons', '6 comparisons']
        }),
        solution: '3 comparisons',
        hints: 'Compare indices: (0, 6), (1, 5), (2, 4). At index 3, both pointers meet.',
        explanation: 'Three comparisons are made: (r, r), (a, a), (c, c). At index 3 (e), left == right and the loop terminates with true.',
        points: 150,
        order: 2
    },
    {
        id: 'csharp_lb_adv_1',
        gameSlug: 'logic-builder',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Sliding Window Maximum Sum',
        difficulty: 'Advanced',
        language: 'csharp',
        description: 'Calculate max subarray sum with window size k = 3.',
        content: JSON.stringify({
            prompt: 'Given array int[] arr = { 2, 1, 5, 1, 3, 2 } and window size k = 3, what is the maximum window sum?',
            options: ['9', '8', '7', '11']
        }),
        solution: '9',
        hints: 'Windows: [2,1,5]=8, [1,5,1]=7, [5,1,3]=9, [1,3,2]=6.',
        explanation: 'The subarray [5, 1, 3] produces the maximum sum: 5 + 1 + 3 = 9.',
        points: 200,
        order: 3
    },

    // --- C# OOP Challenge ---
    {
        id: 'csharp_oop_beg_1',
        gameSlug: 'csharp-oop-challenge',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Encapsulation with Auto-Properties',
        difficulty: 'Beginner',
        language: 'csharp',
        description: 'Practice classes, objects, inheritance, polymorphism, and encapsulation.',
        content: JSON.stringify({
            code: 'public class Student\n{\n    public string Name { get; set; }\n    public int Grade { get; private set; }\n    public Student(string name, int grade) { Name = name; Grade = grade; }\n}\nStudent s = new Student("Taylor", 95);\n// What happens if we run: s.Grade = 100;',
            options: ['Compile-time error: The property cannot be used in this context because the set accessor is inaccessible', 'Grade updates successfully to 100', 'Runtime NullReferenceException', 'Throws SecurityException']
        }),
        solution: 'Compile-time error: The property cannot be used in this context because the set accessor is inaccessible',
        hints: 'Look at the access modifier on the setter: private set.',
        explanation: 'Declaring `private set` encapsulates the property so only code inside `Student` can mutate `Grade`. External assignments fail at compile-time.',
        points: 100,
        order: 1
    },
    {
        id: 'csharp_oop_int_1',
        gameSlug: 'csharp-oop-challenge',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Polymorphic Base Class Contract',
        difficulty: 'Intermediate',
        language: 'csharp',
        description: 'Evaluate polymorphic area computation across Shape hierarchy.',
        content: JSON.stringify({
            code: 'public abstract class Shape { public abstract double GetArea(); }\npublic class Circle : Shape {\n    public double Radius { get; set; } = 2;\n    public override double GetArea() => Math.PI * Radius * Radius;\n}\nShape s = new Circle();\nConsole.WriteLine((int)s.GetArea());',
            options: ['12', '4', '0', 'Compilation Error: Cannot instantiate abstract class']
        }),
        solution: '12',
        hints: 'Radius is 2, area is PI * 4 = ~12.566. Truncated to int is 12.',
        explanation: '`Circle` correctly overrides `GetArea()`. Invoking through the `Shape` base reference triggers dynamic dispatch, yielding ~12.566, cast to 12.',
        points: 150,
        order: 2
    },
    {
        id: 'csharp_oop_adv_1',
        gameSlug: 'csharp-oop-challenge',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Dependency Injection Service Lifetimes',
        difficulty: 'Advanced',
        language: 'csharp',
        description: 'Determine behavior difference between AddScoped and AddSingleton.',
        content: JSON.stringify({
            code: '// ASP.NET Core DI Registration:\nservices.AddScoped<IOrderService, OrderService>();\nservices.AddSingleton<ICacheService, CacheService>();\n// Across two concurrent HTTP requests, how many instances are created?',
            options: ['2 OrderService instances, 1 CacheService instance', '1 OrderService instance, 1 CacheService instance', '2 OrderService instances, 2 CacheService instances', 'A new instance of each per injected class constructor']
        }),
        solution: '2 OrderService instances, 1 CacheService instance',
        hints: 'Scoped creates one instance per client HTTP request; Singleton creates one instance application-wide.',
        explanation: '`AddScoped` creates a unique instance per HTTP request scope (2 requests = 2 instances), while `AddSingleton` creates a single shared instance for the lifetime of the application.',
        points: 200,
        order: 3
    },

    // --- C# Collections Challenge ---
    {
        id: 'csharp_col_beg_1',
        gameSlug: 'csharp-collections-challenge',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'List<T> Capacity Scaling',
        difficulty: 'Beginner',
        language: 'csharp',
        description: 'Solve challenges using arrays, lists, dictionaries, and collections.',
        content: JSON.stringify({
            code: 'var list = new List<int>();\n// Initial list capacity is 0.\nlist.Add(1);\n// When the 5th element is added (exceeding initial default capacity of 4), what does list.Capacity become?',
            options: ['8', '5', '10', '16']
        }),
        solution: '8',
        hints: 'In C# .NET, List<T> doubles its internal backing array whenever capacity is exceeded.',
        explanation: 'When adding the first element, `List<T>` allocates capacity 4. When the 5th element is added, the CLR doubles the capacity from 4 to 8 to maintain O(1) amortized addition.',
        points: 100,
        order: 1
    },
    {
        id: 'csharp_col_int_1',
        gameSlug: 'csharp-collections-challenge',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Dictionary Safe Lookup with TryGetValue',
        difficulty: 'Intermediate',
        language: 'csharp',
        description: 'Safe key retrieval avoiding KeyNotFoundException.',
        content: JSON.stringify({
            code: 'var scores = new Dictionary<string, int> { ["Alice"] = 90 };\nif (scores.TryGetValue("Bob", out int score))\n    Console.WriteLine(score);\nelse\n    Console.WriteLine(score); // What is default value of score?',
            options: ['0', 'KeyNotFoundException', 'null', 'Compilation Error']
        }),
        solution: '0',
        hints: 'When TryGetValue fails, the out parameter receives the default value of the value type (int).',
        explanation: 'When `TryGetValue` returns false, the `out` parameter is assigned the default value of its type (`0` for `int`, `null` for reference types), avoiding exceptions.',
        points: 150,
        order: 2
    },
    {
        id: 'csharp_col_adv_1',
        gameSlug: 'csharp-collections-challenge',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'ConcurrentDictionary Atomic AddOrUpdate',
        difficulty: 'Advanced',
        language: 'csharp',
        description: 'Thread-safe lock-free mutations in multithreaded systems.',
        content: JSON.stringify({
            code: 'var counts = new ConcurrentDictionary<string, int>();\ncounts.AddOrUpdate("visits", 1, (key, current) => current + 1);\ncounts.AddOrUpdate("visits", 1, (key, current) => current + 1);\nConsole.WriteLine(counts["visits"]);',
            options: ['2', '1', 'ConcurrencyException', '0']
        }),
        solution: '2',
        hints: 'First call inserts 1. Second call executes the update factory delegate (1 + 1).',
        explanation: '`AddOrUpdate` atomically adds value 1 if the key does not exist, or executes the update delegate `(key, current) => current + 1` if it exists. Result is 2.',
        points: 200,
        order: 3
    },

    // --- C# LINQ Challenge ---
    {
        id: 'csharp_linq_beg_1',
        gameSlug: 'csharp-linq-challenge',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'LINQ Where Filter & Select Projection',
        difficulty: 'Beginner',
        language: 'csharp',
        description: 'Practice Where, Select, OrderBy, GroupBy, and other LINQ operations.',
        content: JSON.stringify({
            code: 'var names = new[] { "Ana", "Charlie", "Bob", "Danielle" };\nvar result = names.Where(n => n.Length > 3).Select(n => n.ToUpper());\nConsole.WriteLine(string.Join(", ", result));',
            options: ['CHARLIE, DANIELLE', 'Ana, Bob', 'CHARLIE, BOB, DANIELLE', 'Ana, Charlie, Danielle']
        }),
        solution: 'CHARLIE, DANIELLE',
        hints: 'Filter for names with strictly more than 3 letters and project to uppercase.',
        explanation: '"Charlie" (7) and "Danielle" (8) have length > 3. `Select` projects them to "CHARLIE" and "DANIELLE".',
        points: 100,
        order: 1
    },
    {
        id: 'csharp_linq_int_1',
        gameSlug: 'csharp-linq-challenge',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'LINQ GroupBy Aggregation',
        difficulty: 'Intermediate',
        language: 'csharp',
        description: 'Group items by category and compute group counts.',
        content: JSON.stringify({
            code: 'var items = new[] {\n    new { Cat = "Tech", Price = 100 },\n    new { Cat = "Book", Price = 20 },\n    new { Cat = "Tech", Price = 200 }\n};\nvar techCount = items.GroupBy(x => x.Cat).First(g => g.Key == "Tech").Count();\nConsole.WriteLine(techCount);',
            options: ['2', '1', '3', '300']
        }),
        solution: '2',
        hints: 'How many items have Cat == "Tech"?',
        explanation: '`GroupBy(x => x.Cat)` partitions elements into "Tech" and "Book". The "Tech" group contains 2 elements.',
        points: 150,
        order: 2
    },
    {
        id: 'csharp_linq_adv_1',
        gameSlug: 'csharp-linq-challenge',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Flattening Collections with SelectMany',
        difficulty: 'Advanced',
        language: 'csharp',
        description: 'Flatten multidimensional sequences into single IEnumerable.',
        content: JSON.stringify({
            code: 'var teams = new List<List<string>> {\n    new() { "Alice", "Bob" },\n    new() { "Charlie" },\n    new() { "Dave", "Eve" }\n};\nvar allMembers = teams.SelectMany(t => t);\nConsole.WriteLine(allMembers.Count());',
            options: ['5', '3', '1', 'Compilation Error']
        }),
        solution: '5',
        hints: 'SelectMany flattens nested lists into a single continuous sequence.',
        explanation: '`SelectMany` projects each inner list into the stream and flattens all elements: 2 + 1 + 2 = 5 total members.',
        points: 200,
        order: 3
    },

    // --- C# Exception Handling ---
    {
        id: 'csharp_ex_beg_1',
        gameSlug: 'csharp-exception-handling',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Try-Catch-Finally Execution Guarantee',
        difficulty: 'Beginner',
        language: 'csharp',
        description: 'Identify and implement try, catch, finally, and custom exceptions.',
        content: JSON.stringify({
            code: 'int Compute()\n{\n    try {\n        return 10;\n    }\n    finally {\n        Console.Write("Cleanup ");\n    }\n}\nint result = Compute();\nConsole.Write(result);',
            options: ['Cleanup 10', '10 Cleanup', '10', 'Cleanup']
        }),
        solution: 'Cleanup 10',
        hints: 'Finally blocks execute before the calling code receives the returned value.',
        explanation: 'In C#, `finally` is guaranteed to execute whenever control leaves a `try` block, printing "Cleanup " before the caller receives `10`.',
        points: 100,
        order: 1
    },
    {
        id: 'csharp_ex_int_1',
        gameSlug: 'csharp-exception-handling',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Exception Filters with When Clause',
        difficulty: 'Intermediate',
        language: 'csharp',
        description: 'Conditional exception catch blocks without stack unwinding.',
        content: JSON.stringify({
            code: 'try {\n    throw new HttpRequestException("Not Found", null, System.Net.HttpStatusCode.NotFound);\n}\ncatch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound) {\n    Console.WriteLine("Handled 404");\n}\ncatch (HttpRequestException) {\n    Console.WriteLine("Generic HTTP Error");\n}',
            options: ['Handled 404', 'Generic HTTP Error', 'Unhandled Exception', 'Compilation Error']
        }),
        solution: 'Handled 404',
        hints: 'The when clause filters matching exceptions based on the boolean condition.',
        explanation: 'C# exception filters `catch (...) when (condition)` inspect exception state before unwinding the stack. The 404 condition matches and handles the error.',
        points: 150,
        order: 2
    },
    {
        id: 'csharp_ex_adv_1',
        gameSlug: 'csharp-exception-handling',
        technology: 'csharp',
        technologyName: 'C#',
        title: 'Rethrowing Exceptions: throw vs throw ex',
        difficulty: 'Advanced',
        language: 'csharp',
        description: 'Preserving original stack trace versus stack reset.',
        content: JSON.stringify({
            code: 'try {\n    DoWork();\n}\ncatch (Exception ex) {\n    // Which statement preserves the original call stack trace?\n    // Option A: throw;\n    // Option B: throw ex;\n}',
            options: ['throw; preserves the original call stack', 'throw ex; preserves the original call stack', 'Both statements preserve the exact same stack trace', 'Neither; exceptions must be wrapped in new Exception(ex)']
        }),
        solution: 'throw; preserves the original call stack',
        hints: 'throw ex resets the stack trace to the catch block, while bare throw preserves original origin point.',
        explanation: '`throw;` re-throws the existing exception and maintains the full original call stack trace. `throw ex;` resets the stack trace origin to the current catch line.',
        points: 200,
        order: 3
    }
];

module.exports = {
    TECHNOLOGY_CHALLENGES
};
