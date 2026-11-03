import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Timer, CheckCircle2, RotateCcw, Flame, Trophy } from 'lucide-react';

const TECH_WORD_BANKS = {
    react: [
        'component', 'usestate', 'useeffect', 'usememo', 'usecallback',
        'useref', 'usecontext', 'fragment', 'suspense', 'portal',
        'props', 'state', 'render', 'reconciliation', 'hydrate',
        'lifecycle', 'synthetic', 'strictmode', 'memo', 'dispatch',
        'reducer', 'payload', 'provider', 'consumer', 'children'
    ],
    javascript: [
        'function', 'variable', 'constant', 'boolean', 'integer',
        'closure', 'hoisting', 'prototype', 'promise', 'async',
        'await', 'callback', 'eventloop', 'destructure', 'generator',
        'microtask', 'symbol', 'spread', 'rest', 'currying',
        'immutable', 'debounce', 'throttle', 'module', 'transpile'
    ],
    python: [
        'def', 'lambda', 'generator', 'decorator', 'comprehension',
        'tuple', 'dictionary', 'dunder', 'inherit', 'polymorphism',
        'yield', 'import', 'package', 'virtualenv', 'docstring',
        'mutable', 'immutable', 'iteration', 'recursion', 'assertion',
        'exception', 'finally', 'with', 'contextmanager', 'slice'
    ],
    php: [
        'artisan', 'eloquent', 'migration', 'blade', 'controller',
        'middleware', 'facade', 'provider', 'composer', 'namespace',
        'request', 'response', 'session', 'cookie', 'validation',
        'trait', 'interface', 'abstract', 'constructor', 'property',
        'typed', 'match', 'nullsafe', 'attribute', 'autoload'
    ],
    laravel: [
        'artisan', 'eloquent', 'migration', 'blade', 'controller',
        'middleware', 'facade', 'provider', 'composer', 'namespace',
        'routing', 'resource', 'service', 'singleton', 'pipeline',
        'collection', 'eagerloading', 'hasmany', 'belongsto', 'morph'
    ],
    sql: [
        'select', 'insert', 'update', 'delete', 'where',
        'groupby', 'orderby', 'having', 'innerjoin', 'leftjoin',
        'primarykey', 'foreignkey', 'cascade', 'index', 'unique',
        'database', 'schema', 'table', 'column', 'aggregate',
        'count', 'average', 'maximum', 'minimum', 'distinct'
    ],
    mysql: [
        'select', 'insert', 'update', 'delete', 'where',
        'groupby', 'orderby', 'having', 'innerjoin', 'leftjoin',
        'innodb', 'autoincrement', 'transaction', 'commit', 'rollback',
        'isolation', 'btree', 'collation', 'foreignkey', 'procedure'
    ],
    mongodb: [
        'document', 'collection', 'database', 'aggregate', 'pipeline',
        'match', 'group', 'project', 'unwind', 'lookup',
        'findone', 'insertmany', 'updateone', 'deleteone', 'objectid',
        'bson', 'schema', 'sharding', 'replicaset', 'index'
    ],
    flutter: [
        'widget', 'stateless', 'stateful', 'buildcontext', 'setstate',
        'scaffold', 'appbar', 'listview', 'column', 'row',
        'container', 'futurebuilder', 'streambuilder', 'navigator', 'route',
        'inherited', 'renderobject', 'animatedcontainer', 'hero', 'gesture'
    ],
    dart: [
        'widget', 'stateless', 'stateful', 'future', 'stream',
        'nullsafety', 'pattern', 'records', 'extension', 'mixin',
        'isolate', 'async', 'await', 'cascade', 'typedef',
        'duration', 'iterable', 'pubspec', 'analyze', 'compile'
    ],
    html: [
        'doctype', 'article', 'section', 'nav', 'header',
        'footer', 'canvas', 'iframe', 'button', 'input',
        'textarea', 'select', 'option', 'form', 'label',
        'table', 'thead', 'tbody', 'anchor', 'paragraph'
    ],
    css: [
        'flexbox', 'grid', 'margin', 'padding', 'border',
        'display', 'position', 'absolute', 'relative', 'fixed',
        'zindex', 'opacity', 'transition', 'animation', 'transform',
        'rem', 'em', 'vh', 'vw', 'mediaquery'
    ]
};

const DEFAULT_WORD_BANK = [
    'function', 'variable', 'constant', 'boolean', 'integer',
    'string', 'array', 'object', 'closure', 'promise',
    'async', 'await', 'return', 'import', 'export',
    'class', 'interface', 'extends', 'implements', 'override',
    'private', 'protected', 'public', 'static', 'readonly',
    'database', 'schema', 'migration', 'endpoint', 'request',
    'response', 'header', 'status', 'payload', 'token',
    'encrypt', 'decrypt', 'session', 'cookie', 'storage',
    'testing', 'assertion', 'mocking', 'deploy', 'pipeline',
    'iteration', 'recursion', 'algorithm', 'complexity', 'lambda'
];

export const SixtySecondChallengeEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [timeLeft, setTimeLeft] = useState(60);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [currentWordIdx, setCurrentWordIdx] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [correctWords, setCorrectWords] = useState(0);
    const [errors, setErrors] = useState(0);

    const inputRef = useRef(null);

    const wordBank = useMemo(() => {
        if (!technology || technology === 'all') {
            return DEFAULT_WORD_BANK;
        }
        return TECH_WORD_BANKS[technology.toLowerCase()] || DEFAULT_WORD_BANK;
    }, [technology]);

    // Countdown timer
    useEffect(() => {
        if (!isActive || isFinished || isPaused) return;

        if (timeLeft <= 0) {
            setIsFinished(true);
            setIsActive(false);

            const finalWpm = correctWords;
            const accuracy = Math.round((correctWords / (correctWords + errors || 1)) * 100);
            const finalScore = finalWpm * 10;

            if (onScoreUpdate) onScoreUpdate(finalScore);
            if (onGameOver) {
                onGameOver({
                    score: finalScore,
                    wpm: finalWpm,
                    accuracy,
                    metadata: { correctWords, errors, technology }
                });
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, timeLeft, isFinished, isPaused, correctWords, errors, onGameOver, onScoreUpdate, technology]);

    const handleKeyDown = (e) => {
        if (isFinished || isPaused) return;

        if (!isActive && e.key.length === 1) {
            setIsActive(true);
        }

        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            const typedWord = inputValue.trim().toLowerCase();
            if (!typedWord) return;

            const targetWord = wordBank[currentWordIdx % wordBank.length].toLowerCase();
            if (typedWord === targetWord) {
                setCorrectWords(c => c + 1);
            } else {
                setErrors(er => er + 1);
            }

            setInputValue('');
            setCurrentWordIdx(prev => prev + 1);
        }
    };

    const handleRestart = () => {
        setTimeLeft(60);
        setIsActive(false);
        setIsFinished(false);
        setCurrentWordIdx(0);
        setInputValue('');
        setCorrectWords(0);
        setErrors(0);
        if (inputRef.current) inputRef.current.focus();
    };

    const currentWord = wordBank[currentWordIdx % wordBank.length];
    const upcomingWords = [
        wordBank[(currentWordIdx + 1) % wordBank.length],
        wordBank[(currentWordIdx + 2) % wordBank.length],
        wordBank[(currentWordIdx + 3) % wordBank.length]
    ];

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="game-tech-badge flex items-center gap-1">
                            <Timer size={12} /> {technology && technology !== 'all' ? technology.toUpperCase() : 'General'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {difficulty || 'All Levels'}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Speed Sprint
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">60-Second Developer Challenge</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Type as many programming keywords as possible before the timer reaches 0.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Time Remaining</span>
                        <span className={`text-xl font-black ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                            {timeLeft}s
                        </span>
                    </div>
                    <div className="text-right pl-3 border-l border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Words</span>
                        <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">{correctWords}</span>
                    </div>
                </div>
            </div>

            {/* Target Word Stream */}
            <div className="game-code-container p-6 flex items-center justify-center gap-4 select-none overflow-hidden shadow-xs">
                <span className="text-2xl sm:text-3xl font-mono font-black text-indigo-900 dark:text-indigo-200 px-4 py-1.5 rounded-xl bg-[var(--game-badge-bg)] border border-[var(--game-badge-border)]">
                    {currentWord}
                </span>
                {upcomingWords.map((w, idx) => (
                    <span key={idx} className="text-lg sm:text-xl font-mono text-[var(--foreground-muted)] hidden sm:inline opacity-60">
                        {w}
                    </span>
                ))}
            </div>

            {/* Input Box */}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isFinished || isPaused}
                placeholder={isActive ? "Type word and press Spacebar..." : "Start typing to begin 60s countdown..."}
                className="w-full px-5 py-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-base font-mono text-center text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500 transition-all shadow-xs"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                autoFocus
            />

            {/* Results */}
            {isFinished && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Trophy size={24} className="text-amber-400 shrink-0" />
                        <div>
                            <p className="font-black text-sm">Sprint Completed! Final: {correctWords} WPM</p>
                            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                                Errors: {errors} | Accuracy: {Math.round((correctWords / (correctWords + errors || 1)) * 100)}%
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRestart}
                        className="game-btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--muted-bg)] border border-[var(--card-border)]">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[var(--muted-bg)] border-[var(--card-border)]">Enter</kbd> to submit word
                </span>
                <button
                    onClick={handleRestart}
                    className="game-btn-secondary"
                >
                    <RotateCcw size={14} /> Reset
                </button>
            </div>
        </div>
    );
};

export default SixtySecondChallengeEngine;
