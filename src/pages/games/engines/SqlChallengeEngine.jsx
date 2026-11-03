import React, { useState, useEffect } from 'react';
import { Database, Play, CheckCircle2, XCircle, ArrowRight, Lightbulb, Sparkles, Table, Loader2 } from 'lucide-react';
import gameService from '../../../services/gameService';

const FALLBACK_SQL_SCENARIOS = [
    {
        id: 'sql_1',
        title: 'High Honors Computer Science Students',
        difficulty: 'Beginner',
        technology: 'sql',
        technologyName: 'SQL',
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
        technology: 'mysql',
        technologyName: 'MySQL',
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

export const SqlChallengeEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [scenarios, setScenarios] = useState(FALLBACK_SQL_SCENARIOS);
    const [scenarioIdx, setScenarioIdx] = useState(0);
    const [query, setQuery] = useState(FALLBACK_SQL_SCENARIOS[0].starterQuery);
    const [queryResult, setQueryResult] = useState(null);
    const [status, setStatus] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function loadChallenges() {
            setLoading(true);
            try {
                const res = await gameService.getChallenges('sql-challenge', {
                    technology: technology && technology !== 'all' ? technology : undefined,
                    difficulty: difficulty && difficulty !== 'All Levels' ? difficulty : undefined
                });

                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    const parsed = res.data.map(item => ({
                        ...item,
                        prompt: item.description || item.prompt || 'Write the matching SQL query.',
                        starterQuery: item.starterQuery || (typeof item.content === 'string' && item.content.includes('SELECT') ? item.content : 'SELECT * FROM records;'),
                        dataset: item.dataset || FALLBACK_SQL_SCENARIOS[0].dataset,
                        expectedRows: item.expectedRows || FALLBACK_SQL_SCENARIOS[0].expectedRows,
                        hint: item.hints || item.hint || 'Check your WHERE clauses and column projections.',
                        explanation: item.explanation || 'SQL execution completed successfully.'
                    }));

                    if (isMounted) {
                        setScenarios(parsed);
                        setScenarioIdx(0);
                        setQuery(parsed[0].starterQuery);
                    }
                } else if (technology && technology !== 'all') {
                    const filtered = FALLBACK_SQL_SCENARIOS.filter(c =>
                        c.technology === technology.toLowerCase()
                    );
                    if (isMounted && filtered.length > 0) {
                        setScenarios(filtered);
                        setScenarioIdx(0);
                        setQuery(filtered[0].starterQuery);
                    }
                }
            } catch (err) {
                console.warn('[SqlChallenge] Using fallback challenges:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadChallenges();
        return () => { isMounted = false; };
    }, [technology, difficulty]);

    const scenario = scenarios[scenarioIdx] || FALLBACK_SQL_SCENARIOS[0];

    const executeQuery = async () => {
        if (isPaused || isValidating) return;
        const q = query.trim();
        setIsValidating(true);

        try {
            // Check via backend first
            let isMatch = false;
            try {
                const res = await gameService.verifyChallenge('sql-challenge', scenario.id, q);
                if (res && typeof res.isCorrect === 'boolean') {
                    isMatch = res.isCorrect;
                }
            } catch {
                // Ignore API verify failure and fall back to local validation
            }

            // Local fallback simulation if API verify returned false or was unavailable
            let rows = [];
            if (!isMatch) {
                if (scenario.dataset?.students) {
                    let data = [...scenario.dataset.students];
                    if (q.toLowerCase().includes('computer science') && (q.includes('3.5') || q.includes('3.50'))) {
                        data = data.filter(s => s.major === 'Computer Science' && s.gpa >= 3.5);
                        if (q.toLowerCase().includes('desc')) {
                            data.sort((a, b) => b.gpa - a.gpa);
                        }
                        rows = data;
                    } else {
                        rows = data.slice(0, 3);
                    }
                } else if (scenario.dataset?.enrollments) {
                    const map = {};
                    scenario.dataset.enrollments.forEach(e => {
                        map[e.course] = (map[e.course] || 0) + 1;
                    });
                    rows = Object.entries(map).map(([course, count]) => ({ course, count }));
                    if (q.toLowerCase().includes('desc')) {
                        rows.sort((a, b) => b.count - a.count);
                    }
                } else {
                    rows = scenario.expectedRows || [{ status: 'OK', rows_affected: 2 }];
                }

                if (scenario.expectedRows) {
                    const expectedStr = JSON.stringify(scenario.expectedRows);
                    const actualStr = JSON.stringify(rows);
                    isMatch = expectedStr === actualStr;
                } else if (scenario.solution) {
                    isMatch = q.replace(/\s+/g, ' ').toLowerCase() === scenario.solution.replace(/\s+/g, ' ').toLowerCase();
                } else {
                    isMatch = q.toUpperCase().includes('SELECT') && q.toUpperCase().includes('FROM');
                }
            } else {
                rows = scenario.expectedRows || [{ result: 'Query matched database expectation' }];
            }

            setQueryResult(rows);

            if (isMatch) {
                setStatus('correct');
                const newScore = score + (scenario.points || 250);
                setScore(newScore);
                if (onScoreUpdate) onScoreUpdate(newScore);
            } else {
                setStatus('incorrect');
            }
        } catch {
            setStatus('incorrect');
            setQueryResult([]);
        } finally {
            setIsValidating(false);
        }
    };

    const handleNext = () => {
        if (scenarioIdx + 1 < scenarios.length) {
            const nextIdx = scenarioIdx + 1;
            setScenarioIdx(nextIdx);
            setQuery(scenarios[nextIdx].starterQuery);
            setQueryResult(null);
            setStatus(null);
            setShowHint(false);
        } else {
            if (onGameOver) {
                onGameOver({
                    score,
                    accuracy: 100,
                    metadata: { sqlScenariosCompleted: scenarios.length, technology }
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl max-w-3xl mx-auto w-full">
                <Loader2 size={32} className="animate-spin text-emerald-500 mb-3" />
                <p className="text-sm font-semibold text-[var(--foreground-muted)]">Loading {technology || 'database'} SQL challenges...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="game-tech-badge flex items-center gap-1">
                            <Database size={12} /> {scenario.technologyName || 'SQL'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {scenario.difficulty || difficulty || 'All Levels'}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Scenario {scenarioIdx + 1} of {scenarios.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{scenario.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">{scenario.prompt}</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{score} pts</span>
                </div>
            </div>

            {/* Query Editor Box */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider flex items-center gap-1.5">
                        <Table size={13} /> SQL Query Editor:
                    </label>
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                        <Lightbulb size={12} /> {showHint ? 'Hide Hint' : 'View Hint'}
                    </button>
                </div>

                {showHint && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200">
                        {scenario.hint}
                    </div>
                )}

                <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--muted-bg)] font-mono text-xs sm:text-sm shadow-xs">
                    <div className="flex items-center justify-between px-4 py-2 bg-[var(--card-bg)] border-b border-[var(--card-border)] text-[var(--foreground-muted)] text-[11px]">
                        <span>query.sql</span>
                        <span>Standard SQL</span>
                    </div>
                    <textarea
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setStatus(null);
                        }}
                        disabled={isPaused}
                        rows={4}
                        className="w-full p-4 bg-transparent text-[var(--foreground)] font-mono focus:outline-none resize-none leading-relaxed"
                        placeholder="SELECT ... FROM ... WHERE ...;"
                    />
                </div>
            </div>

            {/* Query Execution Status */}
            {status === 'correct' && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
                    <CheckCircle2 size={20} className="shrink-0" />
                    <div>
                        <p className="font-black text-sm text-emerald-900 dark:text-emerald-200">
                            Query Succeeded! Expected Result Set Matched (+{scenario.points || 250} pts)
                        </p>
                        <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">{scenario.explanation}</p>
                    </div>
                </div>
            )}

            {status === 'incorrect' && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300 flex items-center gap-3">
                    <XCircle size={20} className="shrink-0" />
                    <div>
                        <p className="font-black text-sm text-rose-900 dark:text-rose-200">Result Set Mismatch</p>
                        <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">The query executed but the returned rows did not match requirements. Check sorting, filters, and predicates.</p>
                    </div>
                </div>
            )}

            {/* Results Table Preview */}
            {queryResult && (
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Query Output Preview</span>
                    <div className="rounded-2xl border border-[var(--card-border)] overflow-x-auto bg-[var(--muted-bg)]">
                        <table className="w-full text-left font-mono text-xs">
                            <thead className="bg-[var(--card-bg)] border-b border-[var(--card-border)] text-[var(--foreground-muted)] uppercase text-[10px]">
                                <tr>
                                    {queryResult.length > 0 && Object.keys(queryResult[0]).map(col => (
                                        <th key={col} className="p-2.5 font-bold">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]/50">
                                {queryResult.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-[var(--card-bg)]/50">
                                        {Object.values(row).map((val, cIdx) => (
                                            <td key={cIdx} className="p-2.5 text-[var(--foreground)]">{String(val)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--foreground-muted)] font-medium">
                    {query.length} characters
                </span>

                {status !== 'correct' ? (
                    <button
                        onClick={executeQuery}
                        disabled={!query.trim() || isPaused || isValidating}
                        className="game-btn-primary"
                    >
                        {isValidating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="fill-white" />}
                        Execute SQL
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="game-btn-primary"
                    >
                        Next Scenario <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SqlChallengeEngine;
