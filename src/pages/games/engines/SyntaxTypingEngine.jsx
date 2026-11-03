import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Hash, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

const ALL_SYMBOL_DRILLS = [
    // JavaScript
    {
        id: 'stx_js_1',
        technology: 'javascript',
        technologyName: 'JavaScript',
        difficulty: 'Beginner',
        title: 'Arrow Function & Return',
        syntax: 'const add = (a, b) => { return a + b; };'
    },
    {
        id: 'stx_js_2',
        technology: 'javascript',
        technologyName: 'JavaScript',
        difficulty: 'Intermediate',
        title: 'Logical Nullish Coalescing',
        syntax: 'const { id, tags = [] } = response?.data ?? {};'
    },
    // React
    {
        id: 'stx_react_1',
        technology: 'react',
        technologyName: 'React.js',
        difficulty: 'Beginner',
        title: 'React Destructured Props & State',
        syntax: 'const [state, setState] = useState<User | null>(null);'
    },
    {
        id: 'stx_react_2',
        technology: 'react',
        technologyName: 'React.js',
        difficulty: 'Intermediate',
        title: 'React Fragment & Dynamic Callback',
        syntax: '<>{items.map(({ id, name }) => <Card key={id} onClick={() => fn(id)} />)}</>'
    },
    // Python
    {
        id: 'stx_py_1',
        technology: 'python',
        technologyName: 'Python',
        difficulty: 'Beginner',
        title: 'Python Slicing & Comprehension',
        syntax: 'evens = [x**2 for x in data[::2] if x is not None]'
    },
    {
        id: 'stx_py_2',
        technology: 'python',
        technologyName: 'Python',
        difficulty: 'Intermediate',
        title: 'Type Hinted Lambda & Dict Unpacking',
        syntax: 'merge = lambda a, b: {**a, **b, "ts": time.time()}'
    },
    // PHP
    {
        id: 'stx_php_1',
        technology: 'php',
        technologyName: 'PHP',
        difficulty: 'Beginner',
        title: 'PHP Array & Arrow Operator',
        syntax: '$user = $request->user()?->only(["id", "name"]);'
    },
    {
        id: 'stx_php_2',
        technology: 'php',
        technologyName: 'PHP',
        difficulty: 'Intermediate',
        title: 'Nullsafe Operator & Match Expression',
        syntax: '$status = match ($code) { 200, 201 => "OK", 404 => "NOT_FOUND", default => "ERR" };'
    },
    // SQL / MySQL
    {
        id: 'stx_sql_1',
        technology: 'sql',
        technologyName: 'SQL',
        difficulty: 'Beginner',
        title: 'SQL Relational Filtering Syntax',
        syntax: 'SELECT * FROM users WHERE (age >= 18 AND status != "banned") LIMIT 10;'
    },
    {
        id: 'stx_sql_2',
        technology: 'mysql',
        technologyName: 'MySQL',
        difficulty: 'Intermediate',
        title: 'MySQL Conditional Aggregate',
        syntax: 'COUNT(CASE WHEN is_verified = 1 THEN 1 END) AS verified_total'
    },
    // Flutter / Dart
    {
        id: 'stx_dart_1',
        technology: 'dart',
        technologyName: 'Dart',
        difficulty: 'Beginner',
        title: 'Dart Cascades & Named Parameters',
        syntax: 'final paint = Paint()..color = Colors.emerald..strokeWidth = 2.5;'
    },
    {
        id: 'stx_dart_2',
        technology: 'flutter',
        technologyName: 'Flutter',
        difficulty: 'Intermediate',
        title: 'Flutter Builder Pattern & Collection If',
        syntax: 'children: [if (isLoading) const CircularProgressIndicator() else const View()]'
    },
    // HTML / CSS
    {
        id: 'stx_html_1',
        technology: 'html',
        technologyName: 'HTML',
        difficulty: 'Beginner',
        title: 'HTML Tag & Data Attributes',
        syntax: '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
    },
    {
        id: 'stx_css_1',
        technology: 'css',
        technologyName: 'CSS',
        difficulty: 'Beginner',
        title: 'CSS Calc & Custom Properties',
        syntax: 'width: calc(100% - var(--sidebar-width, 240px));'
    },
    // C# (C-Sharp)
    {
        id: 'stx_csharp_1',
        technology: 'csharp',
        technologyName: 'C#',
        difficulty: 'Beginner',
        title: 'C# Record & Primary Constructor',
        syntax: 'public record UserDto(int Id, string Username, string Email);'
    },
    {
        id: 'stx_csharp_2',
        technology: 'csharp',
        technologyName: 'C#',
        difficulty: 'Intermediate',
        title: 'C# Pattern Matching Switch Expression',
        syntax: 'string status = code switch { 200 => "OK", 404 => "Not Found", _ => "Error" };'
    },
    {
        id: 'stx_csharp_3',
        technology: 'csharp',
        technologyName: 'C#',
        difficulty: 'Advanced',
        title: 'C# Async Generic Method with CancellationToken',
        syntax: 'public async Task<IReadOnlyList<T>> GetAsync<T>(CancellationToken ct = default);'
    }
];

export const SyntaxTypingEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [drillIdx, setDrillIdx] = useState(0);
    const [typed, setTyped] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const inputRef = useRef(null);

    const filteredDrills = useMemo(() => {
        if (!technology || technology === 'all') {
            return ALL_SYMBOL_DRILLS;
        }
        const matched = ALL_SYMBOL_DRILLS.filter(d =>
            d.technology.toLowerCase() === technology.toLowerCase() &&
            (!difficulty || difficulty === 'All Levels' || d.difficulty.toLowerCase() === difficulty.toLowerCase())
        );
        if (matched.length > 0) return matched;
        const techOnly = ALL_SYMBOL_DRILLS.filter(d => d.technology.toLowerCase() === technology.toLowerCase());
        return techOnly.length > 0 ? techOnly : ALL_SYMBOL_DRILLS;
    }, [technology, difficulty]);

    const drill = filteredDrills[drillIdx] || filteredDrills[0] || ALL_SYMBOL_DRILLS[0];
    const target = drill.syntax;

    useEffect(() => {
        setTyped('');
        setStartTime(null);
        setIsFinished(false);
        if (inputRef.current) inputRef.current.focus();
    }, [drillIdx, technology, difficulty]);

    const handleChange = (e) => {
        if (isFinished || isPaused) return;
        const val = e.target.value;

        if (!startTime && val.length > 0) {
            setStartTime(Date.now());
        }

        setTyped(val);

        if (val.length >= target.length) {
            setIsFinished(true);
            const elapsedMins = (Date.now() - (startTime || Date.now())) / 60000;
            const points = 150;
            const newScore = score + points;
            setScore(newScore);

            if (onScoreUpdate) onScoreUpdate(newScore);
            if (onGameOver && drillIdx + 1 >= filteredDrills.length) {
                onGameOver({
                    score: newScore,
                    accuracy: 100,
                    metadata: {
                        drillsCompleted: filteredDrills.length,
                        technology: drill.technology
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
                            <Hash size={12} /> {drill.technologyName || 'Syntax Drill'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {drill.difficulty || difficulty || 'All Levels'}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Drill {drillIdx + 1} of {filteredDrills.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{drill.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Master developer symbols: braces, brackets, arrows, and punctuation.</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{score} pts</span>
                </div>
            </div>

            {/* Target Syntax Display with live character highlights */}
            <div
                onClick={() => inputRef.current?.focus()}
                className="relative p-5 rounded-2xl bg-[var(--muted-bg)] font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto select-none cursor-text border border-[var(--card-border)] min-h-[110px] shadow-xs"
            >
                <pre className="whitespace-pre">
                    {target.split('').map((char, i) => {
                        let color = 'text-stone-400 dark:text-stone-500';
                        let isCurrent = i === typed.length;

                        if (i < typed.length) {
                            color = typed[i] === char
                                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 font-semibold'
                                : 'text-rose-700 dark:text-rose-400 bg-rose-500/20 font-bold underline';
                        }

                        return (
                            <span key={i} className={`relative ${color} ${isCurrent ? 'border-b-2 border-indigo-500 animate-pulse' : ''}`}>
                                {char}
                            </span>
                        );
                    })}
                </pre>
            </div>

            {/* Input field */}
            <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={handleChange}
                disabled={isFinished || isPaused}
                placeholder="Type the exact syntax here..."
                className="w-full px-4 py-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-emerald-500 transition-all"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
            />

            {isFinished && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-emerald-400" />
                        <span className="font-bold text-sm">Punctuation & Syntax Perfect! (+150 pts)</span>
                    </div>
                    {drillIdx + 1 < filteredDrills.length && (
                        <button
                            onClick={() => setDrillIdx(prev => prev + 1)}
                            className="game-btn-primary"
                        >
                            Next Drill <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Progress: {typed.length} / {target.length} characters
                </span>
                <button
                    onClick={() => {
                        setTyped('');
                        setStartTime(null);
                        inputRef.current?.focus();
                    }}
                    className="game-btn-secondary"
                >
                    <RotateCcw size={14} /> Reset Drill
                </button>
            </div>
        </div>
    );
};

export default SyntaxTypingEngine;
