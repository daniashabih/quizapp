import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Gauge, CheckCircle2, RotateCcw, Sparkles, Timer, Trophy } from 'lucide-react';

const ALL_PASSAGES = [
    {
        id: 'pass_gen_1',
        technology: 'general',
        technologyName: 'General',
        difficulty: 'Beginner',
        text: "Clean code is simple, direct, and reads like well-crafted prose. Meaningful naming conventions and small single-responsibility functions make complex software architectures effortless to debug and maintain over time."
    },
    {
        id: 'pass_js_1',
        technology: 'javascript',
        technologyName: 'JavaScript',
        difficulty: 'Intermediate',
        text: "JavaScript manages asynchronous operations with a single-threaded event loop. Non-blocking I/O delegates network requests and timers to the browser background, processing resolved microtasks on the call stack."
    },
    {
        id: 'pass_react_1',
        technology: 'react',
        technologyName: 'React.js',
        difficulty: 'Beginner',
        text: "React builds user interfaces using declarative, reusable components. When state changes, React reconciles virtual DOM trees with fine-grained batching, updating only the minimal DOM nodes required."
    },
    {
        id: 'pass_html_1',
        technology: 'html',
        technologyName: 'HTML',
        difficulty: 'Beginner',
        text: "Semantic HTML provides structural meaning to web content beyond visual presentation. Using header, nav, main, article, and section landmarks enhances screen reader accessibility and search engine indexing."
    },
    {
        id: 'pass_css_1',
        technology: 'css',
        technologyName: 'CSS',
        difficulty: 'Beginner',
        text: "Modern CSS layout models like Flexbox and CSS Grid provide responsive, two-dimensional control over page alignment. CSS custom properties enable dynamic runtime theming without JavaScript dependencies."
    },
    {
        id: 'pass_py_1',
        technology: 'python',
        technologyName: 'Python',
        difficulty: 'Intermediate',
        text: "Python emphasizes readability and developer productivity through expressive syntax. List comprehensions, generators, and context managers allow concise data manipulation while adhering to PEP 8 standards."
    },
    {
        id: 'pass_php_1',
        technology: 'php',
        technologyName: 'PHP',
        difficulty: 'Intermediate',
        text: "PHP powers dynamic web applications with robust server-side processing. Modern PHP 8 introduces typed properties, match expressions, attributes, and JIT compilation for high performance web backends."
    },
    {
        id: 'pass_laravel_1',
        technology: 'laravel',
        technologyName: 'Laravel',
        difficulty: 'Intermediate',
        text: "Laravel provides an elegant MVC framework with expressive Eloquent ORM, database migrations, Blade templating, and Artisan CLI commands, streamlining web development from prototype to production scale."
    },
    {
        id: 'pass_sql_1',
        technology: 'sql',
        technologyName: 'SQL',
        difficulty: 'Beginner',
        text: "Structured Query Language forms the bedrock of relational databases. Declarative SELECT queries with INNER JOINs, GROUP BY aggregations, and indexed indexes efficiently extract insights from massive datasets."
    },
    {
        id: 'pass_mysql_1',
        technology: 'mysql',
        technologyName: 'MySQL',
        difficulty: 'Intermediate',
        text: "MySQL delivers ACID-compliant transactions through its InnoDB storage engine. Foreign key constraints, B-tree indexes, and connection pooling ensure data integrity under concurrent production workloads."
    },
    {
        id: 'pass_mongo_1',
        technology: 'mongodb',
        technologyName: 'MongoDB',
        difficulty: 'Intermediate',
        text: "MongoDB stores semi-structured documents in flexible BSON format. Rich aggregation pipelines match, group, project, and sort documents across distributed replica sets with horizontal sharding."
    },
    {
        id: 'pass_flutter_1',
        technology: 'flutter',
        technologyName: 'Flutter',
        difficulty: 'Beginner',
        text: "Flutter compiles directly to native ARM and x86 machine code using Google's Dart language. Its layered widget tree controls every pixel on screen, delivering identical 120 FPS animations across mobile and web."
    },
    {
        id: 'pass_dart_1',
        technology: 'dart',
        technologyName: 'Dart',
        difficulty: 'Intermediate',
        text: "Dart features sound null safety, pattern matching, async-await futures, and isolates for concurrency. Its ahead-of-time compiler generates optimized native code while JIT compilation powers instant hot reload."
    },
    {
        id: 'pass_dsa_1',
        technology: 'dsa',
        technologyName: 'Data Structures & Algorithms',
        difficulty: 'Advanced',
        text: "Algorithmic time complexity measures asymptotic growth rates using Big-O notation. Selecting balanced search trees, heaps, or hash tables optimizes critical path lookups from quadratic to logarithmic time."
    },
    // C# (C-Sharp)
    {
        id: 'pass_csharp_1',
        technology: 'csharp',
        technologyName: 'C#',
        difficulty: 'Beginner',
        text: "C# is a modern, object-oriented, type-safe programming language developed by Microsoft for .NET. Strongly typed variables, memory safety via garbage collection, and expressive string interpolation empower developers to build performant desktop and cloud applications."
    },
    {
        id: 'pass_csharp_2',
        technology: 'csharp',
        technologyName: 'C#',
        difficulty: 'Intermediate',
        text: "In C#, encapsulation and polymorphism govern clean domain design. Auto-implemented properties with private setters protect internal object state, while interfaces define testable contracts that decouple service implementations from client controllers."
    },
    {
        id: 'pass_csharp_3',
        technology: 'csharp',
        technologyName: 'C#',
        difficulty: 'Advanced',
        text: "Asynchronous programming in C# utilizes the Task-based Asynchronous Pattern with async and await. Non-blocking I/O operations release thread pool workers back to the runtime, maximizing throughput in high-concurrency web APIs and microservices."
    }
];

export const SpeedTypingEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [passageIdx, setPassageIdx] = useState(0);
    const [typed, setTyped] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [cpm, setCpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);

    const inputRef = useRef(null);

    const filteredPassages = useMemo(() => {
        if (!technology || technology === 'all') {
            return ALL_PASSAGES;
        }
        const matched = ALL_PASSAGES.filter(p =>
            p.technology.toLowerCase() === technology.toLowerCase() &&
            (!difficulty || difficulty === 'All Levels' || p.difficulty.toLowerCase() === difficulty.toLowerCase())
        );
        if (matched.length > 0) return matched;
        const techOnly = ALL_PASSAGES.filter(p => p.technology.toLowerCase() === technology.toLowerCase());
        return techOnly.length > 0 ? techOnly : ALL_PASSAGES;
    }, [technology, difficulty]);

    const currentItem = filteredPassages[passageIdx] || filteredPassages[0] || ALL_PASSAGES[0];
    const passage = currentItem.text;

    useEffect(() => {
        setTyped('');
        setStartTime(null);
        setWpm(0);
        setCpm(0);
        setAccuracy(100);
        setIsFinished(false);
        if (inputRef.current) inputRef.current.focus();
    }, [passageIdx, technology, difficulty]);

    // Live WPM calculation timer
    useEffect(() => {
        if (!startTime || isFinished || isPaused) return;

        const interval = setInterval(() => {
            const elapsedMins = (Date.now() - startTime) / 60000;
            if (elapsedMins > 0) {
                const wordsTyped = typed.trim().split(/\s+/).filter(Boolean).length;
                const currentWpm = Math.round(wordsTyped / elapsedMins);
                const currentCpm = Math.round(typed.length / elapsedMins);
                setWpm(currentWpm);
                setCpm(currentCpm);
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

        // Calculate accuracy
        let correctChars = 0;
        for (let i = 0; i < val.length; i++) {
            if (val[i] === passage[i]) correctChars++;
        }
        const acc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
        setAccuracy(acc);

        // Check completion
        if (val.length >= passage.length) {
            setIsFinished(true);
            const elapsedMins = (Date.now() - (startTime || Date.now())) / 60000;
            const wordsCount = passage.split(/\s+/).length;
            const finalWpm = Math.max(1, Math.round(wordsCount / (elapsedMins || 0.01)));
            const finalScore = Math.round(finalWpm * 10 * (acc / 100));

            setWpm(finalWpm);
            if (onScoreUpdate) onScoreUpdate(finalScore);
            if (onGameOver) {
                onGameOver({
                    score: finalScore,
                    wpm: finalWpm,
                    accuracy: acc,
                    metadata: {
                        technology: currentItem.technology,
                        cpm: Math.round(passage.length / elapsedMins),
                        durationSeconds: Math.round(elapsedMins * 60)
                    }
                });
            }
        }
    };

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="game-tech-badge flex items-center gap-1">
                            <Gauge size={12} /> {currentItem.technologyName || 'Tech'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {currentItem.difficulty || difficulty || 'All Levels'}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Passage {passageIdx + 1} of {filteredPassages.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">Speed Typing Challenge</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Type the displayed text accurately to benchmark your developer WPM.</p>
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

            {/* Target Passage with real-time character highlights */}
            <div
                onClick={() => inputRef.current?.focus()}
                className="relative p-5 rounded-2xl bg-[var(--muted-bg)] font-mono text-sm sm:text-base leading-relaxed tracking-wide select-none cursor-text border border-[var(--card-border)] min-h-[140px] shadow-xs"
            >
                {passage.split('').map((char, i) => {
                    let color = 'text-stone-400 dark:text-stone-500';
                    let isCurrent = i === typed.length;

                    if (i < typed.length) {
                        color = typed[i] === char ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 font-semibold' : 'text-rose-700 dark:text-rose-400 bg-rose-500/20 font-bold underline';
                    }

                    return (
                        <span key={i} className={`relative ${color} ${isCurrent ? 'border-b-2 border-indigo-500 animate-pulse' : ''}`}>
                            {char}
                        </span>
                    );
                })}
            </div>

            {/* Hidden Input Layer */}
            <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={handleChange}
                disabled={isFinished || isPaused}
                placeholder="Click the text above and start typing..."
                className="w-full px-4 py-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-emerald-500 transition-all"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
            />

            {/* Completion Result */}
            {isFinished && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                        <div>
                            <p className="font-black text-sm">Passage Completed!</p>
                            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                                Final Speed: <strong>{wpm} WPM</strong> | Accuracy: <strong>{accuracy}%</strong> | CPM: <strong>{cpm}</strong>
                            </p>
                        </div>
                    </div>
                    {passageIdx + 1 < filteredPassages.length && (
                        <button
                            onClick={() => setPassageIdx(prev => prev + 1)}
                            className="game-btn-primary"
                        >
                            Next Passage
                        </button>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Progress: {typed.length} / {passage.length} characters
                </span>
                <button
                    onClick={() => {
                        setTyped('');
                        setStartTime(null);
                        setWpm(0);
                        inputRef.current?.focus();
                    }}
                    className="game-btn-secondary"
                >
                    <RotateCcw size={14} /> Restart Passage
                </button>
            </div>
        </div>
    );
};

export default SpeedTypingEngine;
