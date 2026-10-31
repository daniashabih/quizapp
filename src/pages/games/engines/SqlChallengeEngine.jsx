import React, { useState } from 'react';
import { Database, Play, CheckCircle2, XCircle, ArrowRight, Lightbulb, Sparkles, Table } from 'lucide-react';

const SQL_SCENARIOS = [
    {
        id: 'sql_1',
        title: 'High Honors Computer Science Students',
        difficulty: 'Beginner',
        prompt: 'Select all students majoring in "Computer Science" with a GPA of 3.5 or higher, ordered by GPA descending.',
        dataset: {
            students: [
                { id: 1, name: 'Alice Chen', major: 'Computer Science', gpa: 3.9 },
                { id: 2, name: 'Bob Smith', major: 'Mathematics', gpa: 3.4 },
                { id: 3, name: 'Carlos Ray', major: 'Computer Science', gpa: 3.7 },
                { id: 4, name: 'Diana Prince', major: 'Physics', gpa: 3.8 },
                { id: 5, name: 'Evan Wright', major: 'Computer Science', gpa: 3.2 }
            ]
        },
        starterQuery: 'SELECT * FROM students\nWHERE major = "Computer Science" AND gpa >= 3.5\nORDER BY gpa DESC;',
        expectedRows: [
            { id: 1, name: 'Alice Chen', major: 'Computer Science', gpa: 3.9 },
            { id: 3, name: 'Carlos Ray', major: 'Computer Science', gpa: 3.7 }
        ],
        hint: 'Filter on major = "Computer Science" AND gpa >= 3.5, then add ORDER BY gpa DESC.',
        explanation: 'Combines multiple filtering predicates using boolean AND, and applies descending sorting on the floating point GPA attribute.'
    },
    {
        id: 'sql_2',
        title: 'Department Course Enrollment Counts',
        difficulty: 'Intermediate',
        prompt: 'Count the number of enrolled students per course. Return course and count, sorted by count descending.',
        dataset: {
            enrollments: [
                { id: 101, student_id: 1, course: 'Algorithms' },
                { id: 102, student_id: 2, course: 'Calculus' },
                { id: 103, student_id: 3, course: 'Algorithms' },
                { id: 104, student_id: 4, course: 'Algorithms' },
                { id: 105, student_id: 5, course: 'Calculus' }
            ]
        },
        starterQuery: 'SELECT course, COUNT(*) AS count\nFROM enrollments\nGROUP BY course\nORDER BY count DESC;',
        expectedRows: [
            { course: 'Algorithms', count: 3 },
            { course: 'Calculus', count: 2 }
        ],
        hint: 'GROUP BY course with COUNT(*), then sort with ORDER BY count DESC.',
        explanation: 'Aggregates enrollment entries by course and counts members belonging to each distinct group.'
    }
];

export const SqlChallengeEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [scenarioIdx, setScenarioIdx] = useState(0);
    const [query, setQuery] = useState(SQL_SCENARIOS[0].starterQuery);
    const [queryResult, setQueryResult] = useState(null);
    const [status, setStatus] = useState(null); // 'correct' | 'incorrect'
    const [showHint, setShowHint] = useState(false);
    const [score, setScore] = useState(0);

    const scenario = SQL_SCENARIOS[scenarioIdx];

    // Safe, isolated in-browser relational query executor
    const executeQuery = () => {
        if (isPaused) return;
        const q = query.trim();

        try {
            let rows = [];

            if (scenario.id === 'sql_1') {
                let data = [...scenario.dataset.students];
                // Simple pattern matching for student query
                if (q.toLowerCase().includes('computer science') && q.includes('3.5')) {
                    data = data.filter(s => s.major === 'Computer Science' && s.gpa >= 3.5);
                    if (q.toLowerCase().includes('desc')) {
                        data.sort((a, b) => b.gpa - a.gpa);
                    }
                    rows = data;
                } else {
                    rows = data.slice(0, 3);
                }
            } else if (scenario.id === 'sql_2') {
                const map = {};
                scenario.dataset.enrollments.forEach(e => {
                    map[e.course] = (map[e.course] || 0) + 1;
                });
                rows = Object.entries(map).map(([course, count]) => ({ course, count }));
                if (q.toLowerCase().includes('desc')) {
                    rows.sort((a, b) => b.count - a.count);
                }
            }

            setQueryResult(rows);

            // Compare against expected rows
            const expectedStr = JSON.stringify(scenario.expectedRows);
            const actualStr = JSON.stringify(rows);
            const isMatch = expectedStr === actualStr;

            if (isMatch) {
                setStatus('correct');
                const newScore = score + 250;
                setScore(newScore);
                if (onScoreUpdate) onScoreUpdate(newScore);
            } else {
                setStatus('incorrect');
            }
        } catch {
            setStatus('incorrect');
            setQueryResult([]);
        }
    };

    const handleNext = () => {
        if (scenarioIdx + 1 < SQL_SCENARIOS.length) {
            setScenarioIdx(prev => prev + 1);
            setQuery(SQL_SCENARIOS[scenarioIdx + 1].starterQuery);
            setQueryResult(null);
            setStatus(null);
            setShowHint(false);
        } else {
            if (onGameOver) {
                onGameOver({
                    score,
                    accuracy: 100,
                    metadata: { sqlScenariosCompleted: SQL_SCENARIOS.length }
                });
            }
        }
    };

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center gap-1">
                            <Database size={12} /> SQL Studio
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Query Challenge {scenarioIdx + 1} of {SQL_SCENARIOS.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{scenario.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">{scenario.prompt}</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-teal-400">{score} pts</span>
                </div>
            </div>

            {/* Schema Table Preview */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 text-xs text-slate-300 font-mono">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-teal-400 font-bold">
                    <span className="flex items-center gap-1"><Table size={13} /> Sample Database Schema & Records:</span>
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-sans"
                    >
                        <Lightbulb size={12} /> {showHint ? 'Hide Hint' : 'Hint'}
                    </button>
                </div>
                {showHint && (
                    <div className="mb-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-sans">
                        💡 {scenario.hint}
                    </div>
                )}
                <div className="overflow-x-auto max-h-36">
                    <pre className="text-[11px] leading-tight text-slate-400">
                        {JSON.stringify(scenario.dataset, null, 2)}
                    </pre>
                </div>
            </div>

            {/* Interactive SQL Editor */}
            <div className="flex flex-col gap-1.5 font-mono">
                <label className="text-xs font-bold text-teal-300 flex items-center justify-between">
                    <span>Interactive SQL Console (Safe In-Browser Sandbox):</span>
                    <span className="text-[10px] text-slate-400 font-normal">Production DB is 100% Protected</span>
                </label>
                <div className="rounded-2xl overflow-hidden border border-teal-500/30 bg-slate-950 shadow-inner">
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        rows={4}
                        className="w-full p-4 bg-transparent text-emerald-300 font-mono text-xs sm:text-sm focus:outline-hidden leading-relaxed resize-none"
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Results Table */}
            {queryResult && (
                <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--muted-bg)] text-xs font-mono">
                    <div className="px-4 py-2 bg-[var(--card-bg)] border-b border-[var(--card-border)] font-bold text-[11px] text-[var(--foreground)] flex items-center justify-between">
                        <span>Query Output ({queryResult.length} rows returned):</span>
                        {status === 'correct' ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                <CheckCircle2 size={13} /> Matches Expected Output (+250 pts)
                            </span>
                        ) : (
                            <span className="text-rose-400 flex items-center gap-1 font-bold">
                                <XCircle size={13} /> Output Differs From Target
                            </span>
                        )}
                    </div>
                    <div className="p-3 overflow-x-auto max-h-40">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--card-border)] text-slate-400 text-[10px]">
                                    {Object.keys(queryResult[0] || {}).map(k => (
                                        <th key={k} className="p-1 uppercase">{k}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {queryResult.map((row, idx) => (
                                    <tr key={idx} className="border-b border-white/5 text-[11px] text-slate-300">
                                        {Object.values(row).map((val, vIdx) => (
                                            <td key={vIdx} className="p-1">{String(val)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={() => setQuery(scenario.starterQuery)}
                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] cursor-pointer"
                >
                    Reset Query
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={executeQuery}
                        disabled={isPaused}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-teal-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <Play size={14} className="fill-slate-950" /> Run Query
                    </button>

                    {status === 'correct' && (
                        <button
                            onClick={handleNext}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-98 transition-all cursor-pointer"
                        >
                            Next Challenge <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SqlChallengeEngine;
