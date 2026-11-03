import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, CheckCircle2, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

const ALL_CODE_SNIPPETS = [
    // JavaScript
    {
        id: 'ct_js_1',
        technology: 'javascript',
        technologyName: 'JavaScript',
        difficulty: 'Beginner',
        language: 'javascript',
        title: 'Binary Search Function',
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
    },
    // Python
    {
        id: 'ct_py_1',
        technology: 'python',
        technologyName: 'Python',
        difficulty: 'Intermediate',
        language: 'python',
        title: 'Python Decorator Wrapper',
        code: `import time
from functools import wraps

def time_it(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        print(f"Elapsed: {duration:.4f}s")
        return result
    return wrapper`
    },
    // SQL / MySQL
    {
        id: 'ct_sql_1',
        technology: 'sql',
        technologyName: 'SQL',
        difficulty: 'Intermediate',
        language: 'sql',
        title: 'Aggregated Revenue Query',
        code: `SELECT department, SUM(amount) AS total_revenue
FROM sales
WHERE transaction_date >= '2026-01-01'
GROUP BY department
HAVING SUM(amount) > 10000
ORDER BY total_revenue DESC;`
    },
    {
        id: 'ct_mysql_1',
        technology: 'mysql',
        technologyName: 'MySQL',
        difficulty: 'Beginner',
        language: 'sql',
        title: 'User Authentication Query',
        code: `SELECT id, username, email, role
FROM users
WHERE email = 'dev@hangbug.com'
  AND is_active = 1
LIMIT 1;`
    },
    // React
    {
        id: 'ct_react_1',
        technology: 'react',
        technologyName: 'React.js',
        difficulty: 'Beginner',
        language: 'javascript',
        title: 'React Custom Fetch Hook',
        code: `import { useState, useEffect } from 'react';

export function useFetch(url) {
    const [data, setData] = useState(null);
    useEffect(() => {
        let isMounted = true;
        fetch(url)
            .then(res => res.json())
            .then(json => { if (isMounted) setData(json); });
        return () => { isMounted = false; };
    }, [url]);
    return data;
}`
    },
    // HTML
    {
        id: 'ct_html_1',
        technology: 'html',
        technologyName: 'HTML',
        difficulty: 'Beginner',
        language: 'html',
        title: 'Semantic Article Markup',
        code: `<article class="post-card">
  <header>
    <h2>Mastering Web Dev</h2>
    <time datetime="2026-11-03">Nov 2026</time>
  </header>
  <p>Practice writing semantic accessible HTML5.</p>
</article>`
    },
    // CSS
    {
        id: 'ct_css_1',
        technology: 'css',
        technologyName: 'CSS',
        difficulty: 'Beginner',
        language: 'css',
        title: 'Centering Flexbox Container',
        code: `.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    gap: 1.5rem;
}`
    },
    // PHP
    {
        id: 'ct_php_1',
        technology: 'php',
        technologyName: 'PHP',
        difficulty: 'Beginner',
        language: 'php',
        title: 'PHP PDO Prepared Statement',
        code: `<?php
$stmt = $pdo->prepare('SELECT id, name FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();
if ($user && password_verify($password, $user['password'])) {
    session_start();
}`
    },
    // Laravel
    {
        id: 'ct_laravel_1',
        technology: 'laravel',
        technologyName: 'Laravel',
        difficulty: 'Intermediate',
        language: 'php',
        title: 'Laravel Eloquent Query Scope',
        code: `class User extends Authenticatable
{
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->whereNotNull('email_verified_at');
    }
}`
    },
    // Flutter
    {
        id: 'ct_flutter_1',
        technology: 'flutter',
        technologyName: 'Flutter',
        difficulty: 'Beginner',
        language: 'dart',
        title: 'Flutter Stateless Card Widget',
        code: `class TechBadge extends StatelessWidget {
  final String label;
  const TechBadge({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.emerald,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label),
    );
  }
}`
    },
    // Dart
    {
        id: 'ct_dart_1',
        technology: 'dart',
        technologyName: 'Dart',
        difficulty: 'Intermediate',
        language: 'dart',
        title: 'Dart Stream Transformer',
        code: `Stream<int> countStream(int max) async* {
  for (int i = 1; i <= max; i++) {
    await Future.delayed(const Duration(milliseconds: 100));
    yield i;
  }
}`
    },
    // Node.js
    {
        id: 'ct_node_1',
        technology: 'nodejs',
        technologyName: 'Node.js',
        difficulty: 'Beginner',
        language: 'javascript',
        title: 'Node HTTP Stream Response',
        code: `import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';

const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    createReadStream('file.txt').pipe(res);
});
server.listen(3000);`
    },
    // MongoDB
    {
        id: 'ct_mongo_1',
        technology: 'mongodb',
        technologyName: 'MongoDB',
        difficulty: 'Intermediate',
        language: 'javascript',
        title: 'MongoDB Aggregation Pipeline',
        code: `db.orders.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: '$customerId', totalSpent: { $sum: '$amount' } } },
  { $sort: { totalSpent: -1 } },
  { $limit: 10 }
]);`
    },
    // C# (C-Sharp)
    {
        id: 'ct_csharp_1',
        technology: 'csharp',
        technologyName: 'C#',
        difficulty: 'Beginner',
        language: 'csharp',
        title: 'C# Binary Search Algorithm',
        code: `public static int BinarySearch(int[] arr, int target)
{
    int low = 0, high = arr.Length - 1;
    while (low <= high)
    {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    },
    {
        id: 'ct_csharp_2',
        technology: 'csharp',
        technologyName: 'C#',
        difficulty: 'Intermediate',
        language: 'csharp',
        title: 'C# Generic Thread-Safe Cache',
        code: `public class MemoryCache<TKey, TValue> where TKey : notnull
{
    private readonly Dictionary<TKey, TValue> _store = new();
    private readonly object _lock = new();

    public void Set(TKey key, TValue value)
    {
        lock (_lock) { _store[key] = value; }
    }

    public bool TryGet(TKey key, out TValue? val)
    {
        lock (_lock) { return _store.TryGetValue(key, out val); }
    }
}`
    },
    {
        id: 'ct_csharp_3',
        technology: 'csharp',
        technologyName: 'C#',
        difficulty: 'Advanced',
        language: 'csharp',
        title: 'C# Asynchronous Generic Repository',
        code: `public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>> predicate);
}`
    }
];

export const CodeTypingEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [snippetIdx, setSnippetIdx] = useState(0);
    const [typed, setTyped] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);

    const inputRef = useRef(null);

    // Filter snippets by technology and difficulty if specified
    const filteredSnippets = React.useMemo(() => {
        if (!technology || technology === 'all') {
            return ALL_CODE_SNIPPETS;
        }
        const matched = ALL_CODE_SNIPPETS.filter(s =>
            s.technology.toLowerCase() === technology.toLowerCase() &&
            (!difficulty || difficulty === 'All Levels' || s.difficulty.toLowerCase() === difficulty.toLowerCase())
        );
        if (matched.length > 0) return matched;
        const techOnly = ALL_CODE_SNIPPETS.filter(s => s.technology.toLowerCase() === technology.toLowerCase());
        return techOnly.length > 0 ? techOnly : ALL_CODE_SNIPPETS;
    }, [technology, difficulty]);

    const currentSnippet = filteredSnippets[snippetIdx] || filteredSnippets[0] || ALL_CODE_SNIPPETS[0];
    const targetCode = currentSnippet.code;

    useEffect(() => {
        setTyped('');
        setStartTime(null);
        setWpm(0);
        setAccuracy(100);
        setIsFinished(false);
        if (inputRef.current) inputRef.current.focus();
    }, [snippetIdx, technology, difficulty]);

    useEffect(() => {
        if (!startTime || isFinished || isPaused) return;

        const interval = setInterval(() => {
            const elapsedMins = (Date.now() - startTime) / 60000;
            if (elapsedMins > 0) {
                const wordsTyped = typed.trim().split(/\s+/).filter(Boolean).length;
                setWpm(Math.round(wordsTyped / elapsedMins));
            }
        }, 300);

        return () => clearInterval(interval);
    }, [startTime, typed, isFinished, isPaused]);

    const handleChange = (e) => {
        if (isFinished || isPaused) return;
        const val = e.target.value;

        if (!startTime && val.length > 0) {
            setStartTime(Date.now());
        }

        setTyped(val);

        let correctCount = 0;
        for (let i = 0; i < val.length; i++) {
            if (val[i] === targetCode[i]) correctCount++;
        }
        const acc = val.length > 0 ? Math.round((correctCount / val.length) * 100) : 100;
        setAccuracy(acc);

        if (val.length >= targetCode.length) {
            setIsFinished(true);
            const elapsedMins = (Date.now() - (startTime || Date.now())) / 60000;
            const wordsCount = targetCode.split(/\s+/).length;
            const finalWpm = Math.max(1, Math.round(wordsCount / (elapsedMins || 0.01)));
            const finalScore = Math.round(finalWpm * 15 * (acc / 100));

            setWpm(finalWpm);
            if (onScoreUpdate) onScoreUpdate(finalScore);
            if (onGameOver) {
                onGameOver({
                    score: finalScore,
                    wpm: finalWpm,
                    accuracy: acc,
                    metadata: {
                        technology: currentSnippet.technology,
                        language: currentSnippet.language,
                        characters: targetCode.length
                    }
                });
            }
        }
    };

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="game-tech-badge flex items-center gap-1">
                            <Keyboard size={12} /> {currentSnippet.technologyName || currentSnippet.language}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {currentSnippet.difficulty || difficulty || 'All Levels'}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Snippet {snippetIdx + 1} of {filteredSnippets.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{currentSnippet.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Practice authentic syntax, indentation, and developer muscle memory.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Speed</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{wpm} WPM</span>
                    </div>
                    <div className="text-right pl-3 border-l border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Accuracy</span>
                        <span className="text-base font-black text-amber-600 dark:text-amber-400">{accuracy}%</span>
                    </div>
                </div>
            </div>

            {/* Syntax Reference Code Display with live character highlights */}
            <div
                onClick={() => inputRef.current?.focus()}
                className="game-code-container relative p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto select-none cursor-text min-h-[160px] shadow-xs"
            >
                <pre className="whitespace-pre">
                    {targetCode.split('').map((char, i) => {
                        let color = 'text-stone-400 dark:text-stone-500';
                        let isCurrent = i === typed.length;

                        if (i < typed.length) {
                            color = typed[i] === char
                                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'text-rose-600 dark:text-rose-400 bg-rose-500/20 font-bold underline';
                        }

                        return (
                            <span
                                key={i}
                                className={`${color} ${isCurrent ? 'border-b-2 border-indigo-500 animate-pulse bg-indigo-500/10' : ''}`}
                            >
                                {char}
                            </span>
                        );
                    })}
                </pre>
            </div>

            {/* Invisible native input for keyboard capture */}
            <textarea
                ref={inputRef}
                value={typed}
                onChange={handleChange}
                disabled={isFinished || isPaused}
                rows={1}
                className="opacity-0 absolute -z-10"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
            />

            {/* Completion Banner */}
            {isFinished && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <div>
                            <p className="font-black text-sm text-emerald-900 dark:text-emerald-200">Snippet Completed!</p>
                            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">{wpm} WPM with {accuracy}% accuracy.</p>
                        </div>
                    </div>
                    {snippetIdx + 1 < filteredSnippets.length && (
                        <button
                            onClick={() => setSnippetIdx(prev => prev + 1)}
                            className="game-btn-primary"
                        >
                            Next Snippet <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--foreground-muted)] font-medium">
                    {typed.length} / {targetCode.length} characters
                </span>
                <button
                    onClick={() => {
                        setTyped('');
                        setStartTime(null);
                        setWpm(0);
                        setAccuracy(100);
                        setIsFinished(false);
                        inputRef.current?.focus();
                    }}
                    className="game-btn-secondary"
                >
                    <RotateCcw size={14} /> Reset Snippet
                </button>
            </div>
        </div>
    );
};

export default CodeTypingEngine;
