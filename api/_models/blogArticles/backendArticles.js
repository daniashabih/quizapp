/**
 * Backend & Database Engineering Articles
 * Topics:
 * 4. PHP Interview Questions
 * 5. Laravel Interview Questions
 * 6. MySQL Practice Questions
 */

const backendArticles = [
    {
        id: 'blog_php_interview_questions',
        slug: 'php-interview-questions',
        title: 'PHP Interview Questions and Answers: Modern PHP 8.x, OOP, Security & Performance',
        excerpt: 'Prepare for backend PHP interviews with 25+ in-depth questions covering PHP 8.x features (Union Types, Match, Constructor Promotion, Enums, Fibers), OOP architecture, PDO security, and OPcache internals.',
        category: 'Backend & Databases',
        tags: ['PHP', 'PHP 8', 'Backend Interview', 'OOP', 'PDO Security', 'Web Security'],
        difficulty: 'Intermediate',
        readingTimeMinutes: 15,
        authorName: 'Zainab Tariq',
        authorRole: 'Lead Backend Engineer & PHP Core Contributor',
        authorBio: 'Zainab architects high-throughput PHP and Laravel microservices and leads backend engineering hiring panels.',
        authorAvatar: 'ZT',
        coverGradient: 'gradient-purple',
        seoTitle: 'PHP Interview Questions and Answers (Modern PHP 8+ Guide) — HangBug',
        seoDescription: 'Master 25+ essential PHP interview questions and answers for beginners and experienced backend developers. Covers PHP 8.x, OOP, Traits, PDO Prepared Statements, Composer, and OPcache.',
        seoKeywords: ['php interview questions', 'php 8 interview questions and answers', 'php oop interview questions', 'backend php developer interview'],
        canonicalUrl: 'https://www.hangbug.com/blog/php-interview-questions',
        relatedQuizCategory: 'PHP',
        relatedGameSlug: 'missing-code',
        isPublished: true,
        isFeatured: false,
        viewsCount: 3410,
        order: 4,
        publishedAt: '2026-09-24T09:30:00.000Z',
        updatedAt: '2026-11-02T15:00:00.000Z',
        keyTakeaways: [
            'Enable declare(strict_types=1); at the top of every PHP file to enforce strict scalar type checking rather than silent type juggling.',
            'Leverage modern PHP 8+ syntax including Constructor Property Promotion, readonly classes, Backed Enums, Named Arguments, and strict match() expressions.',
            'Understand the architectural differences between Interfaces, Abstract Classes, and Traits, as well as Late Static Binding (static:: vs self::).',
            'Eliminate SQL injection and XSS vulnerabilities using PDO Prepared Statements with emulated prepares disabled and contextual htmlspecialchars() escaping.'
        ],
        content: `## Modern PHP Is Not the PHP of 2012

If you walk into a PHP interview today expecting questions only about \`mysql_connect()\` or basic \`echo\` statements, you will be caught off guard. Modern PHP (PHP 8.1, 8.2, 8.3+) is a strictly typed, high-performance, object-oriented language with JIT compilation, native Enums, Fibers, and static analysis tooling.

Below are the **25 most important PHP interview questions and answers** tested in junior, mid-level, and senior backend interviews.

---

## Part 1: Modern PHP 8.x Language Features (Questions 1–8)

### 1. What does \`declare(strict_types=1);\` do in PHP?
By default, PHP uses **coercive (weak) typing** for scalar type declarations—passing the string \`"42"\` into a function expecting \`int $id\` silently converts it to \`42\`.
Placing \`declare(strict_types=1);\` as the very first statement in a PHP file instructs the Zend Engine to throw a \`TypeError\` if a caller in that file passes a value whose type does not strictly match the parameter or return type declaration (with the sole exception that an \`int\` may still be passed to a \`float\` parameter).

\`\`\`php
<?php
declare(strict_types=1);

function calculateTax(float $amount, int $ratePercent): float {
    return $amount * ($ratePercent / 100);
}

// calculateTax("100.50", "15"); // Throws TypeError in strict_types=1!
echo calculateTax(100.50, 15);   // 15.075
\`\`\`

### 2. How does the PHP 8 \`match\` expression differ from \`switch\`?
1. **Strict comparison (\`===\`):** \`switch\` uses loose comparison (\`==\`), which can cause bugs when \`"0"\` matches \`false\`. \`match\` uses strict identity comparison (\`===\`).
2. **Returns a value directly:** \`match\` is an expression whose result can be assigned to a variable or returned.
3. **No fall-through bugs:** Each arm of a \`match\` expression returns immediately without needing \`break;\`.
4. **Exhaustiveness:** If no arm matches and there is no \`default\` arm, \`match\` throws an \`UnhandledMatchError\`.

\`\`\`php
$statusText = match ($httpCode) {
    200, 201 => 'Success',
    400      => 'Bad Request',
    401, 403 => 'Unauthorized',
    404      => 'Not Found',
    default  => 'Server Error',
};
\`\`\`

### 3. What is Constructor Property Promotion and \`readonly\` properties?
Introduced in PHP 8.0 (and enhanced with \`readonly\` in PHP 8.1/8.2), Constructor Property Promotion lets you declare visibility (\`public\`, \`protected\`, \`private\`), type, and property assignment directly in the constructor signature—eliminating repetitive boilerplate:

\`\`\`php
final readonly class PaymentIntent {
    public function __construct(
        public string $id,
        public int $amountCents,
        public string $currency = 'USD',
    ) {}
}
\`\`\`
Marking a property or class \`readonly\` guarantees it can only be initialized once inside the constructor and cannot be mutated afterward.

### 4. What are Native Enums (Pure vs Backed Enums) in PHP 8.1+?
Enums allow you to define a closed set of allowed states as a first-class type instead of fragile class constants. **Backed Enums** associate each case with a scalar \`string\` or \`int\` for database serialization and can define methods and implement interfaces:

\`\`\`php
enum QuizStatus: string {
    case InProgress = 'in_progress';
    case Completed  = 'completed';
    case Expired    = 'expired';

    public function isEditable(): bool {
        return $this === self::InProgress;
    }
}

$status = QuizStatus::from('completed'); // Returns QuizStatus::Completed
$safe   = QuizStatus::tryFrom('invalid'); // Returns null instead of ValueError
\`\`\`

### 5. Explain Union Types, Intersection Types, and Nullable Types.
- **Nullable Type (\`?User\`):** Equivalent to \`User|null\`.
- **Union Type (\`int|float\`):** Value must satisfy **at least one** of the listed types.
- **Intersection Type (\`Countable&Iterator\`):** Value must satisfy **all** of the listed interface/class contracts simultaneously.

### 6. How do the Nullsafe Operator (\`?->\`) and Null Coalescing Assignment (\`??=\`) work?
- **\`$country = $user?->getProfile()?->getAddress()?->country;\`** short-circuits the entire chain to \`null\` if any intermediate method or property evaluates to \`null\`.
- **\`$config['timeout'] ??= 30;\`** assigns \`30\` to \`$config['timeout']\` only if it is currently unset or \`null\`.

### 7. What are Attributes (\`#[...]\`) in PHP 8?
Attributes replace unstructured PHPDoc annotations (\`@Route\`) with native, reflection-accessible metadata classes validated by the PHP parser at compile time:
\`\`\`php
#[Route('/api/quizzes', methods: ['GET'])]
public function index(): JsonResponse { /* ... */ }
\`\`\`

### 8. What are Fibers in PHP 8.1+?
Fibers are full-stack, interruptible coroutines (green threads) that allow asynchronous frameworks (like Revolt, Amp, and ReactPHP) to pause and resume execution blocks transparently without cluttering application code with promise chains.

---

## Part 2: Object-Oriented Programming (OOP) & Architecture (Questions 9–16)

### 9. What is the difference between an \`interface\`, an \`abstract class\`, and a \`trait\`?
- **\`interface\`:** A pure contract of public method signatures (and constants). A class can \`implement\` **multiple** interfaces, enabling polymorphism and dependency inversion. Cannot hold state/properties.
- **\`abstract class\`:** A base class that cannot be instantiated directly and can contain both abstract method signatures and shared concrete methods/state. A class can \`extend\` **only one** parent class.
- **\`trait\`:** Horizontal code reuse mechanism (\`use LogsActivity;\`) that compiler-pastes methods and properties into independent classes without using inheritance.

### 10. Explain Late Static Binding: \`self::\` vs \`static::\`.
- **\`self::\`** is resolved at **compile time** to the exact class where the method was physically defined.
- **\`static::\`** is resolved at **runtime** to the class that was actually called (including child subclasses).

\`\`\`php
class BaseModel {
    protected static string $table = 'base';
    public static function getTableSelf(): string { return self::$table; }
    public static function getTableStatic(): string { return static::$table; }
}

class UserModel extends BaseModel {
    protected static string $table = 'users';
}

echo UserModel::getTableSelf();   // "base"
echo UserModel::getTableStatic(); // "users" (Late Static Binding!)
\`\`\`

### 11. How do PHP Magic Methods work, and which ones should you use carefully?
- **\`__construct()\` / \`__destruct()\`:** Object initialization and cleanup.
- **\`__invoke()\`:** Allows an object instance to be called like a function (\`$handler($request)\`), commonly used for Single-Action Controllers.
- **\`__serialize()\` / \`__unserialize()\`:** Controls which properties are persisted when an object is serialized for queues or cache.
- **\`__get()\` / \`__set()\` / \`__call()\`:** Intercept access to inaccessible properties/methods (used by ORMs like Eloquent, though overusing them hurts IDE autocomplete and static analysis).

### 12. How does Composer Autoloading (PSR-4) work under the hood?
PSR-4 maps a vendor namespace prefix (e.g., \`App\\Controllers\\\`) directly to a filesystem directory (\`src/Controllers/\`). When your code references \`new App\\Controllers\\QuizController()\`, PHP triggers the registered \`spl_autoload_register()\` callback generated by Composer, which resolves \`src/Controllers/QuizController.php\` and requires it on demand. In production, running \`composer dump-autoload --optimize --classmap-authoritative\` prebuilds an O(1) hash map of all classes to eliminate disk \`stat()\` calls.

### 13. What is the difference between \`==\` and \`===\` when comparing Objects in PHP?
- **\`$obj1 == $obj2\`:** Returns \`true\` if both objects are instances of the **same class** and have the **same property values**.
- **\`$obj1 === $obj2\`:** Returns \`true\` **only** if both variables point to the **exact same object instance** in memory.

### 14. How does Object Cloning (\`clone\`) work and why is \`__clone()\` needed?
\`$copy = clone $original;\` performs a **shallow copy**: scalar properties are duplicated, but any property holding a nested object reference still points to the *same* child object. Implementing \`public function __clone()\` allows you to explicitly clone nested objects for a deep copy.

### 15. How do Generators (\`yield\`) save memory when processing large datasets?
Loading 500,000 rows into an array at once can exhaust PHP's \`memory_limit\`. A generator function using \`yield\` returns a \`Generator\` iterator that pauses after yielding each single item, keeping memory consumption near **O(1)** (a few kilobytes) regardless of file or table size:

\`\`\`php
function readCsvRows(string $filePath): Generator {
    $handle = fopen($filePath, 'rb');
    try {
        while (($row = fgetcsv($handle)) !== false) {
            yield $row;
        }
    } finally {
        fclose($handle);
    }
}
\`\`\`

### 16. What is the difference between \`Exception\` and \`Error\` in PHP's \`Throwable\` hierarchy?
Both implement the root \`Throwable\` interface:
- **\`Exception\`:** Application-level or runtime exceptions (e.g., \`InvalidArgumentException\`, \`PDOException\`).
- **\`Error\`:** Internal engine errors that used to be uncatchable fatal errors in PHP 5 (e.g., \`TypeError\`, \`ParseError\`, \`DivisionByZeroError\`). Catching \`Throwable\` at the top-level error handler logs both cleanly.

---

## Part 3: Security, PDO Databases, Sessions & Performance (Questions 17–25)

### 17. How do PDO Prepared Statements prevent SQL Injection, and why should \`ATTR_EMULATED_PREPARES\` be \`false\`?
When using real prepared statements, the database server compiles the SQL query structure **first**, and user parameters are sent separately—making it mathematically impossible for user input to alter the SQL AST.
By default, MySQL PDO enables emulated prepares (string-interpolating locally in PHP). Always configure PDO with:
\`\`\`php
$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATED_PREPARES  => false,
]);

$stmt = $pdo->prepare('SELECT id, name, email FROM users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $userInputEmail]);
$user = $stmt->fetch();
\`\`\`

### 18. How should passwords be hashed and verified in PHP?
Never use \`md5()\` or \`sha1()\`. Always use PHP's native \`password_hash()\` and \`password_verify()\`, which automatically generate a cryptographically secure random salt and use **Bcrypt** or **Argon2id**:
\`\`\`php
$hash = password_hash($plainPassword, PASSWORD_ARGON2ID);

if (password_verify($loginAttempt, $hash)) {
    if (password_needs_rehash($hash, PASSWORD_ARGON2ID)) {
        // Re-hash and update DB with upgraded cost parameters
    }
}
\`\`\`

### 19. How do you prevent Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) in PHP?
- **XSS Prevention:** Escape all untrusted output rendered into HTML using \`htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')\` (or use a templating engine like Blade/Twig that auto-escapes \`{{ $var }}\` by default).
- **CSRF Prevention:** Issue a cryptographically random per-session token (\`bin2hex(random_bytes(32))\`), verify it on state-changing \`POST\`/\`PUT\`/\`DELETE\` requests using timing-safe \`hash_equals($sessionToken, $requestToken)\`, and set session cookies with \`SameSite=Lax\` (or \`Strict\`), \`HttpOnly\`, and \`Secure\`.

### 20. What is the difference between \`include\`, \`include_once\`, \`require\`, and \`require_once\`?
- **\`include\`:** Emits a non-fatal \`E_WARNING\` if the file is missing and continues script execution.
- **\`require\`:** Emits a fatal \`E_COMPILE_ERROR\` and halts execution immediately if the file is missing.
- **\`_once\` suffix:** Checks whether the file has already been included during the current request to prevent redeclaration errors.

### 21. How does PHP OPcache improve performance in production?
Normally, PHP reads `.php` source files from disk, tokenizes them, parses them into an Abstract Syntax Tree (AST), and compiles them into Zend opcodes on **every single HTTP request**.
**OPcache** stores the precompiled bytecode in shared RAM so subsequent requests skip disk I/O, lexing, and parsing altogether—typically increasing throughput by **3x to 5x**.

### 22. How does PHP Garbage Collection handle Reference Cycles?
PHP uses **reference counting** (\`refcount\`) in its \`zval\` containers: when a variable's reference count drops to \`0\`, its memory is freed immediately. However, if Object A references Object B and Object B references Object A (a circular reference), their \`refcount\` stays at \`1\` even after they go out of scope. PHP's synchronous cycle collector periodically scans root buffers to detect and free these isolated reference islands.

### 23. What is the difference between \`isset()\`, \`empty()\`, and \`array_key_exists()\`?
Suppose \`$data = ['score' => 0, 'bio' => null];\`:
- \`isset($data['bio'])\` returns **\`false\`** (because the value is \`null\`).
- \`array_key_exists('bio', $data)\` returns **\`true\`** (because the key \`'bio'\` exists in the array even though its value is \`null\`).
- \`empty($data['score'])\` returns **\`true\`** (because \`0\`, \`"0"\`, \`""\`, \`false\`, \`null\`, and \`[]\` are all considered empty!). Be very careful using \`empty()\` when \`0\` or \`"0"\` is valid user input.

### 24. How does PHP-FPM work behind Nginx?
Nginx handles static assets and TLS termination, then forwards dynamic PHP requests over a FastCGI socket to **PHP-FPM (FastCGI Process Manager)**. PHP-FPM maintains a pool of persistent worker processes (\`pm.max_children\`), each handling one request at a time in shared-nothing isolation, preventing memory leaks in one request from corrupting another user's session.

### 25. What are the core PSR standards every PHP developer should know?
- **PSR-1 & PSR-12 (PER Coding Style):** Standardizes code formatting and namespaces.
- **PSR-3:** Common \`LoggerInterface\` (implemented by Monolog).
- **PSR-4:** Composer class autoloading specification.
- **PSR-7 & PSR-15:** HTTP Message interfaces (\`ServerRequestInterface\`, \`ResponseInterface\`) and HTTP Server Middleware.
- **PSR-11:** Dependency Injection \`ContainerInterface\`.
`
    },

    {
        id: 'blog_laravel_interview_questions',
        slug: 'laravel-interview-questions',
        title: 'Laravel Interview Questions and Answers: Eloquent ORM, Service Container, Queues & Architecture',
        excerpt: 'Ace your Laravel backend interview with 25+ practical questions and answers covering the Service Container, Dependency Injection, solving Eloquent N+1 queries, Middleware, Sanctum, Queues, and Testing.',
        category: 'Backend & Databases',
        tags: ['Laravel', 'PHP', 'Eloquent ORM', 'Backend Interview', 'REST API', 'System Design'],
        difficulty: 'Intermediate',
        readingTimeMinutes: 17,
        authorName: 'Zainab Tariq',
        authorRole: 'Lead Backend Engineer & PHP Core Contributor',
        authorBio: 'Zainab architects high-throughput PHP and Laravel microservices and leads backend engineering hiring panels.',
        authorAvatar: 'ZT',
        coverGradient: 'gradient-rose',
        seoTitle: 'Laravel Interview Questions and Answers (Eloquent, Queues & DI) — HangBug',
        seoDescription: 'Prepare for your Laravel developer interview with 25+ real-world questions and answers. Master the Service Container, Eloquent N+1 optimization, Queues, Jobs, Sanctum, and Laravel architecture.',
        seoKeywords: ['laravel interview questions', 'laravel interview questions and answers', 'eloquent orm interview questions', 'senior laravel developer interview'],
        canonicalUrl: 'https://www.hangbug.com/blog/laravel-interview-questions',
        relatedQuizCategory: 'Laravel',
        relatedGameSlug: 'find-the-bug',
        isPublished: true,
        isFeatured: false,
        viewsCount: 3890,
        order: 5,
        publishedAt: '2026-09-27T11:00:00.000Z',
        updatedAt: '2026-11-03T10:15:00.000Z',
        keyTakeaways: [
            'Understand how the Laravel Request Lifecycle flows from public/index.php through HTTP Kernel, Middleware pipelines, Service Providers, Router, Controller, and Response.',
            'Eliminate the Eloquent N+1 Query Problem using Eager Loading (with(), load()) and enforce Model::preventLazyLoading(!app()->isProduction()) during development.',
            'Master the Service Container: know when to bind interfaces via bind(), singleton(), and scoped() inside Service Providers.',
            'Offload slow I/O work (emails, webhooks, PDF generation) to background Queues with idempotent Jobs and database transactions (afterCommit).'
        ],
        content: `## What Hiring Managers Look For in a Laravel Interview

Anyone can scaffold a CRUD controller in Laravel. In technical interviews, senior engineers test whether you understand **what happens beneath Laravel's expressive syntax**: how the IoC Service Container resolves dependencies, how Eloquent translates relationships into SQL queries, and how to keep production apps fast and resilient under load.

Here are **25 high-impact Laravel interview questions and answers** with production code examples.

---

## Part 1: Request Lifecycle, Service Container & Providers (Questions 1–7)

### 1. Walk through the Laravel Request Lifecycle from \`public/index.php\` to the HTTP Response.
1. **\`public/index.php\`:** Loads the Composer autoloader and bootstraps the application instance from \`bootstrap/app.php\`.
2. **HTTP Kernel:** The incoming request is passed to the HTTP Kernel, which defines global middleware (CORS, maintenance mode check, session/cookie handling, CSRF verification).
3. **Service Providers:** Laravel calls the \`register()\` method on all configured Service Providers first (to bind services into the Container), and then calls \`boot()\` on all providers (where providers can safely depend on other bound services).
4. **Routing & Route Middleware:** The Router matches the URL and HTTP verb, runs route-specific middleware (like \`auth:sanctum\` or \`throttle\`), resolves controller dependencies via the Service Container, and invokes the Controller action.
5. **Response:** The returned response bubbles back out through the middleware pipeline in reverse order and is sent to the client.

### 2. What is the Laravel Service Container and how does Automatic Dependency Injection work?
The Service Container is a powerful Inversion of Control (IoC) container that manages class dependencies. When you type-hint a class or interface in a Controller constructor, method, Event Listener, or Job \`handle()\` method, Laravel uses PHP's **Reflection API** to inspect the type-hints, recursively resolve all sub-dependencies, and inject the instantiated object automatically.

\`\`\`php
// Inside AppServiceProvider::register()
$this->app->singleton(PaymentGatewayInterface::class, StripePaymentGateway::class);

// Inside CheckoutController
public function store(CheckoutRequest $request, PaymentGatewayInterface $gateway): JsonResponse
{
    $charge = $gateway->charge($request->validated('amount'));
    return response()->json(['charge_id' => $charge->id], 201);
}
\`\`\`

### 3. What is the difference between \`bind()\`, \`singleton()\`, and \`scoped()\` in the Service Container?
- **\`bind()\`:** Creates a **brand-new instance** every time the class is resolved from the container.
- **\`singleton()\`:** Resolves the class once and returns the **same shared instance** for the remainder of the process lifecycle.
- **\`scoped()\`:** Shares a single instance within a single HTTP request or queue job lifecycle, but flushes and recreates it between requests in long-running servers like **Laravel Octane**.

### 4. What is the difference between \`register()\` and \`boot()\` in a Service Provider?
- **\`register()\`:** Used **strictly to bind things into the Service Container**. Never attempt to resolve another service, register event listeners, or query the database inside \`register()\`, because other Service Providers may not have registered yet!
- **\`boot()\`:** Runs **after all Service Providers have been registered**. Here you can safely resolve any container binding, register route model bindings, define authorization Gates/Policies, or register Eloquent model observers.

### 5. How do Laravel Facades work under the hood, and are they really static methods?
Facades (like \`Cache::get('key')\` or \`Log::info()\`) provide a static-like syntax to classes registered in the Service Container. When you call a static method on a Facade, PHP triggers \`Facade::__callStatic()\`, which resolves the underlying service instance from the container using the key returned by \`getFacadeAccessor()\`, and forwards the call to that concrete object. Because they resolve through the container, Laravel Facades are **fully mockable in tests** (\`Cache::shouldReceive('get')->once()\`)!

### 6. How does Route Model Binding (Implicit vs Custom Key) work?
When a route parameter name \`{post}\` matches a type-hinted Eloquent model \`Post $post\` in the controller method, Laravel automatically queries the database by primary key (or throws a \`404 ModelNotFoundException\`).
To resolve by \`slug\` instead of \`id\`, specify \`{post:slug}\` directly in the route definition:
\`\`\`php
Route::get('/blog/{post:slug}', [BlogController::class, 'show']);
\`\`\`

### 7. How do Middleware work (Before vs After vs Terminable Middleware)?
Middleware act as onion layers around your application:
\`\`\`php
public function handle(Request $request, Closure $next): Response
{
    // 1. "Before" logic (runs before controller)
    if (! $request->user()?->isVerified()) {
        abort(403, 'Account not verified.');
    }

    $response = $next($request);

    // 2. "After" logic (modifies response headers before sending to browser)
    $response->headers->set('X-Frame-Options', 'DENY');
    return $response;
}
\`\`\`
A **Terminable Middleware** defines a \`terminate($request, $response)\` method that executes *after* the HTTP response has already been flushed to the client browser.

---

## Part 2: Eloquent ORM, Relationships & Database Optimization (Questions 8–16)

### 8. Explain the N+1 Query Problem in Eloquent and how to solve it.
The **N+1 problem** happens when your code executes \`1\` query to fetch \`N\` parent records, and then executes \`N\` additional queries inside a loop to lazy-load a related model for each parent:

\`\`\`php
// BAD: Executes 1 query for 50 posts + 50 separate queries for each author = 51 queries!
$posts = Post::latest()->take(50)->get();
foreach ($posts as $post) {
    echo $post->author->name;
}

// GOOD: Eager loading with with() executes only 2 queries total!
// Query 1: SELECT * FROM posts ORDER BY created_at DESC LIMIT 50
// Query 2: SELECT * FROM users WHERE id IN (1, 2, 3, ...)
$posts = Post::with(['author:id,name,avatar', 'category:id,name'])
    ->latest()
    ->take(50)
    ->get();
\`\`\`
In \`AppServiceProvider::boot()\`, call \`Model::preventLazyLoading(! $this->app->isProduction());\` to immediately catch accidental N+1 queries during local development and testing!

### 9. What is the difference between \`with()\`, \`load()\`, \`has()\`, and \`whereHas()\`?
- **\`Post::with('comments')->get()\`:** Eager-loads the related \`comments\` when building the initial query.
- **\`$post->load('comments')\`:** Lazy-eager-loads the relationship on a model collection that has already been retrieved.
- **\`Post::has('comments')->get()\`:** Filters the parent \`Post\` query to return only posts that have **at least one** comment (using \`WHERE EXISTS\`), without necessarily loading the comments themselves.
- **\`Post::whereHas('comments', fn ($q) => $q->where('is_approved', true))->get()\`:** Filters parent posts based on custom conditions on the related table.

### 10. Explain Polymorphic Relationships (\`morphTo\`, \`morphMany\`) with a practical example.
Instead of creating separate \`post_comments\`, \`video_comments\`, and \`quiz_comments\` tables, a polymorphic \`comments\` table uses two columns—\`commentable_id\` and \`commentable_type\`—to attach comments to any model class:

\`\`\`php
class Comment extends Model {
    public function commentable(): MorphTo {
        return $this->morphTo();
    }
}

class Post extends Model {
    public function comments(): MorphMany {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
\`\`\`

### 11. What is Mass Assignment Vulnerability, and how do \`$fillable\` and \`$guarded\` protect against it?
If you pass \`Model::create($request->all())\` directly without protection, a malicious user can inject \`"is_admin": true\` or \`"role": "admin"\` into the request payload.
- **\`protected $fillable = ['title', 'slug', 'content'];\`** defines an explicit **allow-list** of attributes safe for mass assignment.
- Even better: always pass only validated fields via \`Post::create($request->validated())\` from a dedicated \`FormRequest\`!

### 12. How do Eloquent Local Scopes and Global Scopes differ?
- **Local Scope (\`scopePublished(Builder $query)\`):** Reusable query constraint invoked explicitly via \`Post::published()->latest()->get()\`.
- **Global Scope:** Applied **automatically to every query** on a model (for example, Laravel's \`SoftDeletes\` trait automatically appends \`WHERE deleted_at IS NULL\`, or a multi-tenant scope appends \`WHERE tenant_id = ?\`).

### 13. Compare \`chunk()\`, \`chunkById()\`, and \`cursor()\` for processing large Eloquent tables.
- **\`chunk(1000, ...)\`:** Uses \`LIMIT\` and \`OFFSET\`. Warning: if your callback updates the very column you are filtering on, \`OFFSET\` will skip rows!
- **\`chunkById(1000, ...)\`:** Filters by \`WHERE id > $lastId LIMIT 1000\`. Much faster on large tables and safe when updating filtered columns inside the loop!
- **\`cursor()\`:** Executes a single SQL query and uses a PHP Generator to hydrate only **one Eloquent model in memory at a time**.

### 14. How do Database Transactions work in Laravel, and why does \`afterCommit()\` matter for Queued Jobs?
\`\`\`php
DB::transaction(function () use ($orderData) {
    $order = Order::create($orderData);
    Inventory::decrementStock($order->items);

    SendOrderConfirmationJob::dispatch($order)->afterCommit();
});
\`\`\`
If you dispatch a Queue Job inside a transaction *without* \`->afterCommit()\`, a fast Redis queue worker might pick up the job **milliseconds before the database transaction finishes committing**, resulting in a \`ModelNotFoundException\` inside the worker!

### 15. How do modern Accessors and Mutators (\`Attribute::make\`) work in Laravel?
\`\`\`php
use Illuminate\Database\Eloquent\Casts\Attribute;

protected function title(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => ucfirst($value),
        set: fn (string $value) => trim($value),
    );
}
\`\`\`

### 16. What is the difference between Eloquent ORM and the \`DB::table()\` Query Builder?
- **Eloquent ORM:** Hydrates full PHP Model objects with relationships, casts, events, and accessors. Ideal for domain logic and CRUD operations.
- **Query Builder (\`DB::table()\`):** Returns lightweight \`stdClass\` objects without model hydration overhead. Ideal for complex analytical reporting, bulk aggregations, and high-speed exports.

---

## Part 3: Security, APIs, Queues, Caching & Testing (Questions 17–25)

### 17. Compare Laravel Sanctum vs Laravel Passport.
- **Laravel Sanctum:** Lightweight authentication system ideal for **SPAs (React/Vue)** using first-party cookie sessions, **mobile apps** (Flutter/React Native), and simple **API tokens** with ability scopes.
- **Laravel Passport:** Full **OAuth2 server** implementation. Only needed when third-party external developers need "Sign in with YourApp" OAuth authorization code flows.

### 18. Why should you use Form Request Validation classes instead of validating inside Controllers?
\`FormRequest\` classes (\`php artisan make:request StoreArticleRequest\`) encapsulate both **authorization** (\`authorize()\`) and **validation rules** (\`rules()\`, \`messages()\`, \`prepareForValidation()\`) outside the controller. If validation fails, Laravel automatically returns a standardized \`422 Unprocessable Entity\` JSON response before the controller method is even called.

### 19. What are Eloquent API Resources (\`JsonResource\`)?
API Resources act as a transformation layer between your database models and the JSON responses returned to clients. They prevent accidentally leaking internal database columns and support conditional relationship loading via \`$this->whenLoaded('author')\` (which prevents N+1 queries inside JSON serialization!).

### 20. How do Authorization Gates and Policies differ?
- **Gates:** Closure-based authorization checks defined for actions not tied to a specific model (e.g., \`Gate::define('view-admin-dashboard', ...)\`).
- **Policies:** Dedicated classes that organize authorization logic around a specific Eloquent model (\`PostPolicy::update(User $user, Post $post)\`).

### 21. How do Queues, Failed Jobs, and Job Retries work in Laravel?
In a queued Job class:
- \`public int $tries = 3;\` defines maximum attempts.
- \`public function backoff(): array { return [10, 60, 180]; }\` configures exponential backoff in seconds.
- \`public function failed(Throwable $e): void\` runs when all retries are exhausted, letting you alert the engineering team or refund a user. Failed jobs are stored in the \`failed_jobs\` table and can be replayed via \`php artisan queue:retry\`.

### 22. What is the difference between Events/Listeners and Jobs?
- **Jobs** represent a **command** ("Do this specific task in the background": \`GenerateCertificatePdf::dispatch($result)\`).
- **Events** represent a **fact that just happened** (\`QuizCompleted::dispatch($user, $result)\`), allowing multiple decoupled **Listeners** (UpdateLeaderboard, AwardBadge, SendCongratulationsEmail) to react independently.

### 23. How does \`Cache::remember()\` work, and how does \`Cache::flexible()\` prevent Cache Stampedes?
\`\`\`php
$leaderboard = Cache::remember('global_leaderboard', now()->addMinutes(10), function () {
    return QuizResult::computeTopRankings();
});
\`\`\`
\`Cache::flexible('key', [300, 900], fn () => ...)\` implements **stale-while-revalidate**: during the first 300 seconds, cached data is fresh; between 300 and 900 seconds, callers immediately receive the cached value with zero latency while Laravel refreshes the cache in the background after the response is sent!

### 24. Why must you never call \`env()\` outside of \`config/*.php\` files?
In production, running \`php artisan config:cache\` compiles all \`config/*.php\` files into a single cached file and **stops loading the \`.env\` file** for speed. Any direct call to \`env('STRIPE_KEY')\` inside a Controller or Service will return \`null\` once config caching is enabled! Always read values via \`config('services.stripe.key')\`.

### 25. How do you write fast, isolated Feature Tests in Laravel?
Use the \`RefreshDatabase\` trait, Model Factories (\`User::factory()->create()\`), and facade fakes (\`Queue::fake()\`, \`Mail::fake()\`, \`Http::fake()\`) to verify HTTP status codes, JSON structure, and database assertions (\`$this->assertDatabaseHas('posts', ['slug' => 'my-post'])\`).
`
    },

    {
        id: 'blog_mysql_practice_questions',
        slug: 'mysql-practice-questions',
        title: 'MySQL Practice Questions with Solutions: Joins, Aggregations, Window Functions & Indexing',
        excerpt: 'Sharpen your SQL problem-solving skills with 25 hands-on MySQL practice questions and verified solutions. Covers INNER/LEFT JOINs, GROUP BY & HAVING, CTEs, Window Functions (ROW_NUMBER, RANK, LAG), and EXPLAIN indexing.',
        category: 'Backend & Databases',
        tags: ['MySQL', 'SQL', 'Database Queries', 'Window Functions', 'Indexing', 'Practice Problems'],
        difficulty: 'All Levels',
        readingTimeMinutes: 17,
        authorName: 'Vikram Nair',
        authorRole: 'Principal Database Reliability Engineer',
        authorBio: 'Vikram specializes in MySQL 8 and PostgreSQL query optimization, high-availability sharding, and relational data modeling.',
        authorAvatar: 'VN',
        coverGradient: 'gradient-teal',
        seoTitle: 'MySQL Practice Questions with Solutions (Joins, Window Functions & SQL) — HangBug',
        seoDescription: 'Practice 25 real-world MySQL queries with schemas, solutions, and explanations. Master JOINs, GROUP BY, HAVING, Subqueries, CTEs, Window Functions, and B-Tree Indexing.',
        seoKeywords: ['mysql practice questions', 'sql practice queries with answers', 'mysql interview queries', 'sql joins and window functions practice'],
        canonicalUrl: 'https://www.hangbug.com/blog/mysql-practice-questions',
        relatedQuizCategory: 'SQL Server',
        relatedGameSlug: 'sql-challenge',
        isPublished: true,
        isFeatured: true,
        viewsCount: 4970,
        order: 6,
        publishedAt: '2026-10-01T09:00:00.000Z',
        updatedAt: '2026-11-04T12:00:00.000Z',
        keyTakeaways: [
            'Memorize the logical SQL execution order: FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT.',
            'Use LEFT JOIN ... WHERE right_table.id IS NULL (Anti-Join) to efficiently find records with no matching child rows.',
            'Master MySQL 8+ Window Functions (ROW_NUMBER(), DENSE_RANK(), LAG(), SUM() OVER) to solve top-N-per-group and running-total queries without self-joins.',
            'Design composite B-Tree indexes following the Leftmost Prefix Rule and verify query execution plans using EXPLAIN ANALYZE.'
        ],
        content: `## Practice Schema for All 25 MySQL Exercises

The best way to learn SQL is to write queries against a realistic relational schema. All 25 practice exercises in this guide use the following four tables:

\`\`\`sql
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    department_id INT,
    manager_id INT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    hired_at DATE NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') NOT NULL,
    placed_at DATETIME NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
\`\`\`

> **Pro Tip:** After practicing these queries, launch HangBug's interactive **[SQL Challenge Game](/games/sql-challenge)** to write and run live SQL queries right in your browser!

---

## Level 1: Filtering, Sorting & Aggregations (Questions 1–8)

### 1. Find all employees earning between $70,000 and $110,000 hired in or after 2024, sorted by salary descending.
\`\`\`sql
SELECT id, name, salary, hired_at
FROM employees
WHERE salary BETWEEN 70000 AND 110000
  AND hired_at >= '2024-01-01'
ORDER BY salary DESC;
\`\`\`
**Why this matters:** Using \`hired_at >= '2024-01-01'\` instead of \`YEAR(hired_at) >= 2024\` makes the predicate **SARGable** (Search Argument Able), allowing MySQL to use an index on \`hired_at\` rather than scanning every row!

### 2. Why can't you use a \`SELECT\` column alias inside a \`WHERE\` clause?
Because of **SQL's Logical Order of Execution**:
1. \`FROM\` & \`JOIN\`
2. \`WHERE\`
3. \`GROUP BY\`
4. \`HAVING\`
5. \`SELECT\` (Aliases are created here!)
6. \`DISTINCT\`
7. \`ORDER BY\`
8. \`LIMIT\` / \`OFFSET\`

Because \`WHERE\` executes at Step 2 and \`SELECT\` executes at Step 5, column aliases do not exist yet when \`WHERE\` is evaluated. However, \`ORDER BY\` (Step 7) *can* reference \`SELECT\` aliases!

### 3. Count the number of employees and average salary per department, showing only departments with at least 5 employees and an average salary over $80,000.
\`\`\`sql
SELECT
    department_id,
    COUNT(*) AS employee_count,
    ROUND(AVG(salary), 2) AS avg_salary
FROM employees
GROUP BY department_id
HAVING COUNT(*) >= 5
   AND AVG(salary) > 80000
ORDER BY avg_salary DESC;
\`\`\`
**Explanation:** \`WHERE\` filters individual rows *before* grouping; \`HAVING\` filters aggregated groups *after* \`GROUP BY\`.

### 4. Find duplicate email addresses in a legacy \`contacts\` table.
\`\`\`sql
SELECT email, COUNT(*) AS occurrences
FROM contacts
GROUP BY email
HAVING COUNT(*) > 1;
\`\`\`

### 5. Calculate total revenue, paid revenue, and cancelled order count in a single table scan using conditional aggregation.
\`\`\`sql
SELECT
    COUNT(*) AS total_orders,
    SUM(CASE WHEN status = 'paid' THEN order_total ELSE 0 END) AS paid_revenue,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders
FROM orders;
\`\`\`
**Why this matters:** Conditional aggregation (\`SUM(CASE WHEN ...)\`) computes multiple filtered metrics in **one pass** over the \`orders\` table instead of running three separate queries.

### 6. Retrieve the second-highest distinct salary in the \`employees\` table using \`LIMIT\` and \`OFFSET\`.
\`\`\`sql
SELECT DISTINCT salary AS second_highest_salary
FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 1;
\`\`\`
**Note:** \`DISTINCT\` is critical here—if two employees tie for the top salary of $150,000, omitting \`DISTINCT\` would return $150,000 as the second row!

### 7. Handle \`NULL\` values safely when computing total compensation (\`salary + bonus\`).
In SQL, any arithmetic with \`NULL\` evaluates to \`NULL\` (\`80000 + NULL = NULL\`). Use \`COALESCE()\` to replace \`NULL\` with \`0\`:
\`\`\`sql
SELECT name, salary + COALESCE(bonus, 0) AS total_compensation
FROM employees;
\`\`\`

### 8. Find customers whose email domain is \`@gmail.com\` without breaking index usage where possible.
\`\`\`sql
SELECT id, name, email
FROM employees
WHERE email LIKE '%@gmail.com';
\`\`\`
*(Note: A leading wildcard \`%...\` cannot use a standard left-to-right B-Tree index. If you frequently query by email domain at scale, add a generated column \`email_domain VARCHAR(100) GENERATED ALWAYS AS (SUBSTRING_INDEX(email, '@', -1)) STORED\` and index that column!)*

---

## Level 2: Multi-Table JOINs & Subqueries (Questions 9–16)

### 9. List every department name along with its employee count, including departments that currently have 0 employees.
\`\`\`sql
SELECT
    d.id,
    d.name AS department_name,
    COUNT(e.id) AS headcount
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
GROUP BY d.id, d.name
ORDER BY headcount DESC;
\`\`\`
**Crucial Interview Trap:** Notice we used \`COUNT(e.id)\` and **not** \`COUNT(*)\`! For a department with 0 employees, \`LEFT JOIN\` produces 1 row where \`e.id\` is \`NULL\`. \`COUNT(*)\` would return \`1\`, whereas \`COUNT(e.id)\` ignores \`NULL\`s and accurately returns \`0\`!

### 10. Find all customers who have NEVER placed an order (The Left Anti-Join Pattern).
\`\`\`sql
SELECT c.id, c.name, c.country
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
\`\`\`
Or equivalently using \`NOT EXISTS\`:
\`\`\`sql
SELECT c.id, c.name, c.country
FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id
);
\`\`\`
*(Warning: Avoid \`WHERE id NOT IN (SELECT customer_id FROM orders)\` if \`customer_id\` can ever be \`NULL\`, because \`NOT IN\` with a single \`NULL\` in the set returns 0 rows!)*

### 11. Self-Join: List every employee alongside their direct manager's name.
\`\`\`sql
SELECT
    e.name AS employee_name,
    e.salary AS employee_salary,
    COALESCE(m.name, 'Top Executive (No Manager)') AS manager_name
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
\`\`\`

### 12. Find all employees who earn MORE than their direct manager.
\`\`\`sql
SELECT
    e.name AS employee_name,
    e.salary AS employee_salary,
    m.name AS manager_name,
    m.salary AS manager_salary
FROM employees e
INNER JOIN employees m ON e.manager_id = m.id
WHERE e.salary > m.salary;
\`\`\`

### 13. Find all employees who earn more than the average salary of their own department (Correlated Subquery vs JOIN).
\`\`\`sql
SELECT e.name, e.department_id, e.salary, dept_avg.avg_sal
FROM employees e
INNER JOIN (
    SELECT department_id, AVG(salary) AS avg_sal
    FROM employees
    GROUP BY department_id
) dept_avg ON e.department_id = dept_avg.department_id
WHERE e.salary > dept_avg.avg_sal;
\`\`\`

### 14. Delete duplicate rows from a table while keeping the row with the lowest \`id\`.
\`\`\`sql
DELETE c1
FROM contacts c1
INNER JOIN contacts c2
  ON c1.email = c2.email
 AND c1.id > c2.id;
\`\`\`

### 15. What is the difference between \`UNION\` and \`UNION ALL\`?
- **\`UNION\`:** Concatenates two result sets and performs an expensive sort/hash pass to **remove duplicate rows**.
- **\`UNION ALL\`:** Concatenates all rows directly without deduplicating. Always use \`UNION ALL\` unless you explicitly need duplicate removal!

### 16. How do you perform an Upsert (\`INSERT ... ON DUPLICATE KEY UPDATE\`) in MySQL 8?
\`\`\`sql
INSERT INTO daily_metrics (metric_date, page_views)
VALUES ('2026-11-06', 1)
ON DUPLICATE KEY UPDATE
    page_views = page_views + VALUES(page_views);
\`\`\`

---

## Level 3: CTEs, Window Functions & Query Optimization (Questions 17–25)

### 17. Compare \`ROW_NUMBER()\`, \`RANK()\`, and \`DENSE_RANK()\`.
Suppose three employees in a department have salaries of **$120k, $120k, and $100k**:
- **\`ROW_NUMBER()\`:** Assigns \`1, 2, 3\` (unique sequential integers; ties are broken arbitrarily unless a secondary \`ORDER BY\` column is given).
- **\`RANK()\`:** Assigns \`1, 1, 3\` (ties share rank 1, and rank 2 is skipped!).
- **\`DENSE_RANK()\`:** Assigns \`1, 1, 2\` (ties share rank 1, and the next distinct value gets rank 2 with no gaps).

### 18. Top-N Per Group: Find the top 3 highest-paid employees in EACH department.
\`\`\`sql
WITH ranked_employees AS (
    SELECT
        e.id,
        e.name,
        d.name AS department_name,
        e.salary,
        DENSE_RANK() OVER (
            PARTITION BY e.department_id
            ORDER BY e.salary DESC
        ) AS salary_rank
    FROM employees e
    INNER JOIN departments d ON e.department_id = d.id
)
SELECT id, name, department_name, salary, salary_rank
FROM ranked_employees
WHERE salary_rank <= 3
ORDER BY department_name, salary_rank;
\`\`\`

### 19. Compute a Running Total of monthly paid revenue using \`SUM() OVER()\`.
\`\`\`sql
WITH monthly_sales AS (
    SELECT
        DATE_FORMAT(placed_at, '%Y-%m') AS sales_month,
        SUM(order_total) AS monthly_revenue
    FROM orders
    WHERE status = 'paid'
    GROUP BY DATE_FORMAT(placed_at, '%Y-%m')
)
SELECT
    sales_month,
    monthly_revenue,
    SUM(monthly_revenue) OVER (ORDER BY sales_month) AS cumulative_revenue
FROM monthly_sales;
\`\`\`

### 20. Calculate Month-over-Month (MoM) revenue growth percentage using \`LAG()\`.
\`\`\`sql
WITH monthly_sales AS (
    SELECT
        DATE_FORMAT(placed_at, '%Y-%m') AS sales_month,
        SUM(order_total) AS revenue
    FROM orders
    WHERE status = 'paid'
    GROUP BY DATE_FORMAT(placed_at, '%Y-%m')
),
with_previous AS (
    SELECT
        sales_month,
        revenue,
        LAG(revenue, 1) OVER (ORDER BY sales_month) AS prev_month_revenue
    FROM monthly_sales
)
SELECT
    sales_month,
    revenue,
    prev_month_revenue,
    ROUND(((revenue - prev_month_revenue) / prev_month_revenue) * 100, 2) AS mom_growth_pct
FROM with_previous;
\`\`\`

### 21. Traverse an organizational hierarchy using a Recursive CTE (\`WITH RECURSIVE\`).
\`\`\`sql
WITH RECURSIVE org_chart AS (
    -- Anchor member: Top-level CEO (no manager)
    SELECT id, name, manager_id, 1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive member: Direct reports
    SELECT e.id, e.name, e.manager_id, oc.level + 1
    FROM employees e
    INNER JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT id, name, manager_id, level
FROM org_chart
ORDER BY level, name;
\`\`\`

### 22. Explain the Leftmost Prefix Rule for Composite B-Tree Indexes.
Suppose you create a composite index:
\`\`\`sql
CREATE INDEX idx_orders_cust_status_date ON orders (customer_id, status, placed_at);
\`\`\`
A B-Tree index sorts keys first by \`customer_id\`, then by \`status\`, then by \`placed_at\`. Therefore, this single index can accelerate queries filtering on:
1. \`(customer_id)\`
2. \`(customer_id, status)\`
3. \`(customer_id, status, placed_at)\`

However, it **cannot** be used efficiently for a query that filters *only* on \`WHERE status = 'paid'\` or \`WHERE placed_at >= '2026-01-01'\` because the leading column (\`customer_id\`) is omitted! Furthermore, if you place a range condition (\`>\`, \`<\`, \`BETWEEN\`) on an earlier column, the index cannot use subsequent columns for tree lookup. **Rule of thumb:** Put equality (\`=\`) columns first in a composite index, and range (\`>\`, \`<\`) or \`ORDER BY\` columns last.

### 23. What is a Covering Index?
In InnoDB, the primary key is a **Clustered Index** (the leaf nodes store the entire table row), while secondary indexes store only the indexed columns plus the primary key pointer.
If a secondary index contains **every column requested by your query** (across \`SELECT\`, \`WHERE\`, and \`ORDER BY\`), MySQL satisfies the query purely from the secondary index tree without performing random disk lookups back to the clustered table! In \`EXPLAIN\`, this shows up as \`Using index\` in the \`Extra\` column.

### 24. How do you read MySQL \`EXPLAIN\` output to diagnose a slow query?
Check these four fields in \`EXPLAIN\` (or \`EXPLAIN ANALYZE\`):
- **\`type\` (Access type from best to worst):** \`const\` / \`eq_ref\` -> \`ref\` -> \`range\` -> \`index\` -> **\`ALL\` (Full Table Scan — danger on large tables!)**.
- **\`key\`:** Which index MySQL actually chose (if \`NULL\`, no index was used).
- **\`rows\`:** Estimated number of rows MySQL must inspect.
- **\`Extra\`:** Watch out for \`Using filesort\` (expensive unindexed sorting) and \`Using temporary\` (creating a temporary table for \`GROUP BY\` or \`DISTINCT\`).

### 25. What are the 4 ACID properties and InnoDB Transaction Isolation Levels?
- **Atomicity, Consistency, Isolation, Durability.**
- **Isolation Levels (from lowest to highest):** \`READ UNCOMMITTED\` (allows dirty reads), \`READ COMMITTED\`, **\`REPEATABLE READ\` (MySQL InnoDB's default, using MVCC snapshots and Next-Key Locks)**, and \`SERIALIZABLE\`.
`
    }
];

module.exports = backendArticles;
