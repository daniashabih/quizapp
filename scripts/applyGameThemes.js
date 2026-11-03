const fs = require('fs');
const path = require('path');

const ENGINES_DIR = path.join(__dirname, '..', 'src', 'pages', 'games', 'engines');

function updateFile(filePath, transforms) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [target, replacement] of transforms) {
        if (typeof target === 'string') {
            if (!content.includes(target)) {
                console.warn(`[WARN] Target not found in ${path.basename(filePath)}:\n${target.substring(0, 60)}...`);
            } else {
                content = content.replaceAll(target, replacement);
            }
        } else if (target instanceof RegExp) {
            content = content.replace(target, replacement);
        }
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
}

// 1. CodeScrambleEngine.jsx
updateFile(path.join(ENGINES_DIR, 'CodeScrambleEngine.jsx'), [
    [
        `bg-emerald-950/40 border-emerald-500/60 text-emerald-200`,
        `bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/60 text-emerald-800 dark:text-emerald-200`
    ],
    [
        `bg-rose-950/30 border-rose-500/50 text-rose-200`,
        `bg-rose-50 dark:bg-rose-950/30 border-rose-500/50 text-rose-800 dark:text-rose-200`
    ],
    [
        `bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground)]'`,
        `bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:border-indigo-500/40'`
    ],
    [
        `hover:bg-cyan-500/20 text-[var(--foreground-muted)] hover:text-cyan-400`,
        `hover:bg-indigo-500/15 text-[var(--foreground-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 border border-[var(--card-border)]`
    ],
    [
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-400`,
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300`
    ],
    [
        `<p className="font-black text-sm">Sequence Reconstructed! (+220 pts)</p>`,
        `<p className="font-black text-sm text-emerald-900 dark:text-emerald-200">Sequence Reconstructed! (+220 pts)</p>`
    ],
    [
        `<p className="text-xs text-emerald-300/80 mt-0.5">{challenge.explanation}</p>`,
        `<p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">{challenge.explanation}</p>`
    ],
    [
        `bg-rose-500/15 border border-rose-500/40 text-rose-400`,
        `bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300`
    ],
    [
        `<p className="font-black text-sm">Incorrect Sequence.</p>`,
        `<p className="font-black text-sm text-rose-900 dark:text-rose-200">Incorrect Sequence.</p>`
    ],
    [
        `<p className="text-xs text-rose-300/80 mt-0.5">Trace the inputs, conditional branches, and return points.</p>`,
        `<p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">Trace the inputs, conditional branches, and return points.</p>`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"`,
        `className="game-btn-secondary"`
    ],
    [
        `className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"`,
        `className="game-btn-primary"`
    ]
]);

// 2. MissingCodeEngine.jsx
updateFile(path.join(ENGINES_DIR, 'MissingCodeEngine.jsx'), [
    [
        `px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30`,
        `game-tech-badge`
    ],
    [
        `text-emerald-400">{score} pts</span>`,
        `text-emerald-600 dark:text-emerald-400 font-black">{score} pts</span>`
    ],
    [
        `rounded-2xl overflow-hidden border border-[var(--card-border)] bg-slate-950 font-mono text-xs sm:text-sm p-4 text-slate-200 leading-relaxed shadow-inner`,
        `rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--muted-bg)] font-mono text-xs sm:text-sm p-4 text-[var(--foreground)] leading-relaxed shadow-xs`
    ],
    [
        `bg-emerald-500/30 border-emerald-400 text-emerald-300`,
        `bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold`
    ],
    [
        `bg-rose-500/30 border-rose-400 text-rose-300`,
        `bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300 font-bold`
    ],
    [
        `bg-emerald-500/20 border-emerald-400/60 text-emerald-300`,
        `bg-indigo-500/20 border-indigo-500 text-indigo-800 dark:text-indigo-200 font-bold`
    ],
    [
        `bg-emerald-400/20 border-emerald-400/40 text-emerald-300 border-dashed animate-pulse`,
        `bg-indigo-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 border-dashed animate-pulse font-bold`
    ],
    [
        `bg-emerald-950/60 border-emerald-500 text-emerald-300`,
        `bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold`
    ],
    [
        `bg-rose-950/60 border-rose-500 text-rose-300`,
        `bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200`
    ],
    [
        `bg-emerald-500/20 border-emerald-500 text-emerald-300`,
        `bg-indigo-500/20 border-indigo-500 text-indigo-800 dark:text-indigo-200 font-bold`
    ],
    [
        `hover:border-emerald-500/30`,
        `hover:border-indigo-500/40`
    ],
    [
        `bg-emerald-950/30 border-emerald-500/40 text-emerald-300`,
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300`
    ],
    [
        `bg-rose-950/30 border-rose-500/40 text-rose-300`,
        `bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300`
    ],
    [
        `text-slate-300`,
        `text-[var(--foreground-secondary)]`
    ],
    [
        `className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"`,
        `className="game-btn-primary"`
    ],
    [
        `className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer"`,
        `className="game-btn-primary"`
    ]
]);

// 3. LogicBuilderEngine.jsx
updateFile(path.join(ENGINES_DIR, 'LogicBuilderEngine.jsx'), [
    [
        `px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30`,
        `game-tech-badge`
    ],
    [
        `text-purple-400">{score} pts</span>`,
        `text-emerald-600 dark:text-emerald-400 font-black">{score} pts</span>`
    ],
    [
        `p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-purple-100 flex flex-col gap-2 shadow-inner`,
        `p-5 rounded-2xl bg-[var(--game-hint-bg)] border border-[var(--game-hint-border)] text-[var(--game-hint-text)] flex flex-col gap-2 shadow-xs`
    ],
    [
        `<span className="text-[11px] font-mono text-purple-300 uppercase tracking-wider font-bold">Logic Problem:</span>\n                <p className="text-base sm:text-lg font-mono font-bold text-white">{problem.prompt}</p>`,
        `<span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[var(--game-hint-text)]">Logic Problem:</span>\n                <p className="text-base sm:text-lg font-mono font-bold text-[var(--foreground)]">{problem.prompt}</p>`
    ],
    [
        `text-purple-400 hover:text-purple-300`,
        `text-[var(--game-hint-btn)] hover:opacity-80`
    ],
    [
        `bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs`,
        `bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs`
    ],
    [
        `bg-emerald-950/60 border-emerald-500 text-emerald-300`,
        `bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold`
    ],
    [
        `bg-rose-950/60 border-rose-500 text-rose-300`,
        `bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200`
    ],
    [
        `bg-purple-500/20 border-purple-500 text-purple-300`,
        `bg-indigo-500/20 border-indigo-500 text-indigo-800 dark:text-indigo-200 font-bold`
    ],
    [
        `hover:border-purple-500/30`,
        `hover:border-indigo-500/40`
    ],
    [
        `bg-emerald-950/30 border-emerald-500/40 text-emerald-300`,
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300`
    ],
    [
        `bg-rose-950/30 border-rose-500/40 text-rose-300`,
        `bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300`
    ],
    [
        `text-slate-300`,
        `text-[var(--foreground-secondary)]`
    ],
    [
        `className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"`,
        `className="game-btn-primary"`
    ],
    [
        `className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer"`,
        `className="game-btn-primary"`
    ]
]);

// 4. SqlChallengeEngine.jsx
updateFile(path.join(ENGINES_DIR, 'SqlChallengeEngine.jsx'), [
    [
        `px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30`,
        `game-tech-badge`
    ],
    [
        `text-teal-400">{score} pts</span>`,
        `text-emerald-600 dark:text-emerald-400 font-black">{score} pts</span>`
    ],
    [
        `p-3 rounded-2xl bg-slate-950/80 border border-white/10 text-xs text-slate-300 font-mono`,
        `p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] font-mono shadow-xs`
    ],
    [
        `border-b border-white/10 text-[11px] text-teal-400 font-bold`,
        `border-b border-[var(--card-border)] text-[11px] text-indigo-700 dark:text-indigo-400 font-bold`
    ],
    [
        `text-amber-400 hover:text-amber-300`,
        `text-amber-600 dark:text-amber-400 hover:opacity-80`
    ],
    [
        `text-slate-400`,
        `text-[var(--foreground-secondary)]`
    ],
    [
        `text-teal-300 flex items-center justify-between`,
        `text-[var(--foreground)] font-bold flex items-center justify-between`
    ],
    [
        `border border-teal-500/30 bg-slate-950 shadow-inner`,
        `border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs focus-within:border-indigo-500`
    ],
    [
        `text-emerald-300 font-mono text-xs sm:text-sm focus:outline-hidden leading-relaxed resize-none`,
        `text-[var(--foreground)] font-mono text-xs sm:text-sm focus:outline-hidden leading-relaxed resize-none`
    ],
    [
        `border-b border-white/5 text-[11px] text-slate-300`,
        `border-b border-[var(--card-border)]/50 text-[11px] text-[var(--foreground)]`
    ],
    [
        `bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-teal-500/30 active:scale-98 transition-all cursor-pointer`,
        `game-btn-primary`
    ],
    [
        `bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer`,
        `game-btn-primary`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"`,
        `className="game-btn-secondary"`
    ]
]);

// 5. CodingMemoryMatchEngine.jsx
updateFile(path.join(ENGINES_DIR, 'CodingMemoryMatchEngine.jsx'), [
    [
        `px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30`,
        `game-tech-badge`
    ],
    [
        `text-sm font-black text-blue-400`,
        `text-sm font-black text-[var(--foreground)]`
    ],
    [
        `text-sm font-black text-emerald-400`,
        `text-sm font-black text-emerald-600 dark:text-emerald-400`
    ],
    [
        `bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-md scale-98`,
        `bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/60 text-emerald-800 dark:text-emerald-200 font-bold shadow-md scale-98`
    ],
    [
        `bg-indigo-950/60 border-indigo-500/60 text-indigo-200 shadow-md scale-102`,
        `bg-[var(--game-badge-bg)] border border-[var(--game-badge-border)] text-[var(--game-badge-text)] font-bold shadow-md scale-102`
    ],
    [
        `bg-[var(--muted-bg)] border-[var(--card-border)] text-transparent hover:border-blue-500/40 hover:scale-102`,
        `bg-[var(--muted-bg)] border border-[var(--card-border)] text-transparent hover:border-indigo-500/40 hover:scale-102`
    ],
    [
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3`,
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3`
    ],
    [
        `text-emerald-300/80`,
        `text-emerald-800/80 dark:text-emerald-300/80`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-emerald-400 cursor-pointer"`,
        `className="game-btn-primary"`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"`,
        `className="game-btn-secondary"`
    ]
]);

// 6. SpeedTypingEngine.jsx
updateFile(path.join(ENGINES_DIR, 'SpeedTypingEngine.jsx'), [
    [
        `px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30`,
        `game-tech-badge`
    ],
    [
        `text-base font-black text-emerald-400">{wpm} WPM</span>`,
        `text-base font-black text-emerald-600 dark:text-emerald-400">{wpm} WPM</span>`
    ],
    [
        `text-base font-black text-cyan-400">{accuracy}%</span>`,
        `text-base font-black text-amber-600 dark:text-amber-400">{accuracy}%</span>`
    ],
    [
        `relative p-5 rounded-2xl bg-slate-950 font-mono text-sm sm:text-base leading-relaxed tracking-wide select-none cursor-text border border-white/10 min-h-[140px] shadow-inner`,
        `relative p-5 rounded-2xl bg-[var(--muted-bg)] font-mono text-sm sm:text-base leading-relaxed tracking-wide select-none cursor-text border border-[var(--card-border)] min-h-[140px] shadow-xs`
    ],
    [
        `let color = 'text-slate-500';`,
        `let color = 'text-stone-400 dark:text-stone-500';`
    ],
    [
        `color = typed[i] === char ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/60 font-bold';`,
        `color = typed[i] === char ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 font-semibold' : 'text-rose-700 dark:text-rose-400 bg-rose-500/20 font-bold underline';`
    ],
    [
        `border-b-2 border-emerald-400 animate-pulse`,
        `border-b-2 border-indigo-500 animate-pulse`
    ],
    [
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-300`,
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300`
    ],
    [
        `text-emerald-300/80`,
        `text-emerald-800/80 dark:text-emerald-300/80`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-emerald-400 cursor-pointer"`,
        `className="game-btn-primary"`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"`,
        `className="game-btn-secondary"`
    ]
]);

// 7. CodeTypingEngine.jsx
updateFile(path.join(ENGINES_DIR, 'CodeTypingEngine.jsx'), [
    [
        `px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30`,
        `game-tech-badge`
    ],
    [
        `text-base font-black text-indigo-400">{wpm} WPM</span>`,
        `text-base font-black text-emerald-600 dark:text-emerald-400">{wpm} WPM</span>`
    ],
    [
        `text-base font-black text-emerald-400">{accuracy}%</span>`,
        `text-base font-black text-amber-600 dark:text-amber-400">{accuracy}%</span>`
    ],
    [
        `relative p-5 rounded-2xl bg-slate-950 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto select-none cursor-text border border-white/10 min-h-[160px] shadow-inner`,
        `relative p-5 rounded-2xl bg-[var(--muted-bg)] font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto select-none cursor-text border border-[var(--card-border)] min-h-[160px] shadow-xs`
    ],
    [
        `let color = 'text-slate-500';`,
        `let color = 'text-stone-400 dark:text-stone-500';`
    ],
    [
        `color = typed[i] === char ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/60 font-bold';`,
        `color = typed[i] === char ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 font-semibold' : 'text-rose-700 dark:text-rose-400 bg-rose-500/20 font-bold';`
    ],
    [
        `className="w-full px-4 py-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500 transition-all resize-none"`,
        `className="w-full px-4 py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500 transition-all resize-none shadow-xs"`
    ],
    [
        `bg-indigo-500/15 border border-indigo-500/40 text-indigo-300`,
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300`
    ],
    [
        `text-indigo-400 shrink-0`,
        `text-emerald-600 dark:text-emerald-400 shrink-0`
    ],
    [
        `text-indigo-300/80`,
        `text-emerald-800/80 dark:text-emerald-300/80`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-xs font-black uppercase tracking-wider hover:bg-indigo-400 cursor-pointer"`,
        `className="game-btn-primary"`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"`,
        `className="game-btn-secondary"`
    ]
]);

// 8. SyntaxTypingEngine.jsx
updateFile(path.join(ENGINES_DIR, 'SyntaxTypingEngine.jsx'), [
    [
        `px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30`,
        `game-tech-badge`
    ],
    [
        `text-base font-black text-cyan-400">{score} pts</span>`,
        `text-base font-black text-emerald-600 dark:text-emerald-400">{score} pts</span>`
    ],
    [
        `relative p-5 rounded-2xl bg-slate-950 font-mono text-sm sm:text-base leading-relaxed tracking-wider select-none cursor-text border border-white/10 min-h-[100px] shadow-inner`,
        `relative p-5 rounded-2xl bg-[var(--muted-bg)] font-mono text-sm sm:text-base leading-relaxed tracking-wider select-none cursor-text border border-[var(--card-border)] min-h-[100px] shadow-xs`
    ],
    [
        `let color = 'text-slate-500';`,
        `let color = 'text-stone-400 dark:text-stone-500';`
    ],
    [
        `color = typed[i] === char ? 'text-cyan-400 bg-cyan-950/40' : 'text-rose-400 bg-rose-950/60 font-bold';`,
        `color = typed[i] === char ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 font-semibold' : 'text-rose-700 dark:text-rose-400 bg-rose-500/20 font-bold';`
    ],
    [
        `border-b-2 border-cyan-400 animate-pulse`,
        `border-b-2 border-indigo-500 animate-pulse`
    ],
    [
        `className="w-full px-4 py-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-cyan-500 transition-all"`,
        `className="w-full px-4 py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500 transition-all shadow-xs"`
    ],
    [
        `bg-cyan-500/15 border border-cyan-500/40 text-cyan-300`,
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300`
    ],
    [
        `text-cyan-400 shrink-0`,
        `text-emerald-600 dark:text-emerald-400 shrink-0`
    ],
    [
        `text-cyan-300/80`,
        `text-emerald-800/80 dark:text-emerald-300/80`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-cyan-400 cursor-pointer flex items-center gap-1"`,
        `className="game-btn-primary"`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"`,
        `className="game-btn-secondary"`
    ]
]);

// 9. ErrorFreeTypingEngine.jsx (Accuracy Challenge)
updateFile(path.join(ENGINES_DIR, 'ErrorFreeTypingEngine.jsx'), [
    [
        `px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30`,
        `game-tech-badge`
    ],
    [
        `text-base font-black text-amber-400">{mistakesAllowed - totalErrors} / {mistakesAllowed}</span>`,
        `text-base font-black text-emerald-600 dark:text-emerald-400">{mistakesAllowed - totalErrors} / {mistakesAllowed}</span>`
    ],
    [
        `relative p-5 rounded-2xl bg-slate-950 font-mono text-sm sm:text-base leading-relaxed tracking-wide select-none cursor-text border transition-all min-h-[140px] shadow-inner \${
                    hasError ? 'border-rose-500/60 ring-2 ring-rose-500/30' : 'border-white/10'
                }`,
        `relative p-5 rounded-2xl bg-[var(--muted-bg)] font-mono text-sm sm:text-base leading-relaxed tracking-wide select-none cursor-text border transition-all min-h-[140px] shadow-xs \${
                    hasError ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-[var(--card-border)]'
                }`
    ],
    [
        `let color = 'text-slate-500';`,
        `let color = 'text-stone-400 dark:text-stone-500';`
    ],
    [
        `color = typed[i] === char ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/60 font-bold';`,
        `color = typed[i] === char ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 font-semibold' : 'text-rose-700 dark:text-rose-400 bg-rose-500/20 font-bold underline';`
    ],
    [
        `bg-rose-500/15 border border-rose-500/40 text-rose-300`,
        `bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300`
    ],
    [
        `className="w-full px-4 py-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-amber-500 transition-all"`,
        `className="w-full px-4 py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500 transition-all shadow-xs"`
    ],
    [
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-300`,
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300`
    ],
    [
        `text-emerald-300/80`,
        `text-emerald-800/80 dark:text-emerald-300/80`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-emerald-400 cursor-pointer"`,
        `className="game-btn-primary"`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"`,
        `className="game-btn-secondary"`
    ]
]);

// 10. SixtySecondChallengeEngine.jsx
updateFile(path.join(ENGINES_DIR, 'SixtySecondChallengeEngine.jsx'), [
    [
        `px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30`,
        `game-tech-badge`
    ],
    [
        `p-6 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center gap-4 select-none overflow-hidden shadow-inner`,
        `p-6 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-center gap-4 select-none overflow-hidden shadow-xs`
    ],
    [
        `text-emerald-400 px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40`,
        `text-indigo-900 dark:text-indigo-200 px-4 py-1.5 rounded-xl bg-[var(--game-badge-bg)] border border-[var(--game-badge-border)]`
    ],
    [
        `text-slate-500 hidden sm:inline opacity-60`,
        `text-[var(--foreground-muted)] hidden sm:inline opacity-60`
    ],
    [
        `className="w-full px-5 py-4 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-base font-mono text-center text-[var(--foreground)] focus:outline-hidden focus:border-rose-500 transition-all shadow-inner"`,
        `className="w-full px-5 py-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-base font-mono text-center text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500 transition-all shadow-xs"`
    ],
    [
        `bg-rose-500/15 border border-rose-500/40 text-rose-300`,
        `bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300`
    ],
    [
        `text-rose-300/80`,
        `text-emerald-800/80 dark:text-emerald-300/80`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-wider hover:bg-rose-400 cursor-pointer"`,
        `className="game-btn-primary"`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"`,
        `className="game-btn-secondary"`
    ]
]);

// 11. WordRainEngine.jsx
updateFile(path.join(ENGINES_DIR, 'WordRainEngine.jsx'), [
    [
        `px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30`,
        `game-tech-badge`
    ],
    [
        `text-base font-black text-purple-400">{score}</span>`,
        `text-base font-black text-emerald-600 dark:text-emerald-400">{score}</span>`
    ],
    [
        `className="w-full px-5 py-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-center text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-purple-500 transition-all"`,
        `className="w-full px-5 py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-center text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500 transition-all shadow-xs"`
    ],
    [
        `className="px-6 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-purple-400 cursor-pointer"`,
        `className="game-btn-primary"`
    ],
    [
        `className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"`,
        `className="game-btn-secondary"`
    ]
]);

console.log('All Web Engines updated successfully.');
