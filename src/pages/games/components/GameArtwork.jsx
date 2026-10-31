import React from 'react';
import {
    Code2, Bug, Terminal, Shuffle, HelpCircle, Cpu, Database,
    Layers, Keyboard, Gauge, Timer, ShieldCheck, Hash, CloudRain
} from 'lucide-react';

/**
 * High-quality vector game artworks tailored for each Coding & Typing game.
 * Uses modern gradients, tech motifs, glowing accents, and high-contrast typography.
 */
export const GameArtwork = ({ slug, className = "w-full h-full object-cover", title = "" }) => {
    switch (slug) {
        // --- 8 CODING GAMES ---
        case 'code-puzzle':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-900 flex items-center justify-center ${className}`}>
                    <div className="absolute -top-10 -left-10 w-36 h-36 bg-violet-400/20 rounded-full blur-xl" />
                    <div className="relative z-10 flex flex-col gap-1.5 p-3.5 bg-black/40 backdrop-blur-md rounded-2xl border border-violet-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                            <span className="text-[10px] font-mono text-violet-300 flex items-center gap-1">
                                <Code2 className="w-3 h-3 text-violet-400" /> puzzle.js
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="bg-violet-900/60 border border-violet-500/40 px-2 py-1 rounded font-mono text-[11px] text-violet-200">
                            1. const evens = arr.filter()
                        </div>
                        <div className="bg-purple-900/60 border border-purple-500/40 px-2 py-1 rounded font-mono text-[11px] text-purple-200">
                            2. const squared = evens.map()
                        </div>
                        <div className="bg-fuchsia-900/60 border border-fuchsia-500/40 px-2 py-1 rounded font-mono text-[11px] text-fuchsia-200">
                            3. return squared;
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-violet-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Order Blocks
                    </span>
                </div>
            );

        case 'find-the-bug':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-rose-600 via-pink-700 to-red-900 flex items-center justify-center ${className}`}>
                    <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-red-400/20 rounded-full blur-xl" />
                    <div className="relative z-10 flex flex-col gap-1.5 p-3.5 bg-black/40 backdrop-blur-md rounded-2xl border border-rose-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                            <span className="text-[10px] font-mono text-rose-300 flex items-center gap-1">
                                <Bug className="w-3 h-3 text-rose-400" /> debug.py
                            </span>
                            <span className="text-[10px] bg-rose-500/30 text-rose-300 px-1.5 py-0.2 rounded font-mono">1 Error</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-300 pl-1">
                            L1: def calculate(x):
                        </div>
                        <div className="font-mono text-[11px] text-red-200 bg-red-500/30 border border-red-500/60 px-1.5 py-0.5 rounded font-bold flex items-center justify-between">
                            <span>L2: return x / 0</span>
                            <span className="text-[9px] text-red-300 bg-black/40 px-1 rounded">Bug</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-300 pl-1">
                            L3: print(calculate(10))
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-rose-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Spot The Flaw
                    </span>
                </div>
            );

        case 'output-predictor':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600 flex items-center justify-center ${className}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl" />
                    <div className="relative z-10 flex flex-col gap-2 p-3.5 bg-black/50 backdrop-blur-md rounded-2xl border border-amber-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-white/10">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-mono text-amber-200 ml-1">Terminal</span>
                        </div>
                        <div className="font-mono text-[11px] text-amber-200">
                            &gt; console.log([] + {})
                        </div>
                        <div className="font-mono text-[12px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-1 rounded">
                            Output: "[object Object]"
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-amber-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Predict Output
                    </span>
                </div>
            );

        case 'code-scramble':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-cyan-600 via-teal-700 to-blue-900 flex items-center justify-center ${className}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                    <div className="relative z-10 flex flex-col gap-1.5 p-3.5 bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                            <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                                <Shuffle className="w-3 h-3 text-cyan-400" /> unscramble.ts
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded font-mono text-[11px] text-cyan-200">
                            <span className="text-cyan-400 font-bold">&#8597;</span> if (!res.ok) throw...
                        </div>
                        <div className="flex items-center gap-2 bg-teal-950/60 border border-teal-500/30 px-2 py-1 rounded font-mono text-[11px] text-teal-200">
                            <span className="text-teal-400 font-bold">&#8597;</span> const res = await fetch
                        </div>
                        <div className="flex items-center gap-2 bg-sky-950/60 border border-sky-500/30 px-2 py-1 rounded font-mono text-[11px] text-sky-200">
                            <span className="text-sky-400 font-bold">&#8597;</span> return res.json();
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-cyan-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Sequence Flow
                    </span>
                </div>
            );

        case 'missing-code':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-700 to-teal-900 flex items-center justify-center ${className}`}>
                    <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-400/20 rounded-full blur-xl" />
                    <div className="relative z-10 flex flex-col gap-2 p-3.5 bg-black/40 backdrop-blur-md rounded-2xl border border-emerald-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                            <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                                <HelpCircle className="w-3 h-3 text-emerald-400" /> Fill Token
                            </span>
                        </div>
                        <div className="font-mono text-[11px] text-emerald-100 leading-relaxed">
                            const data = <span className="bg-emerald-400/30 border border-emerald-400 text-emerald-300 font-bold px-1.5 py-0.5 rounded animate-pulse">await</span> fetch(url);
                        </div>
                        <div className="flex gap-1.5 pt-1">
                            <span className="text-[10px] bg-emerald-950 border border-emerald-600/40 text-emerald-300 px-2 py-0.5 rounded font-mono">await</span>
                            <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded font-mono">async</span>
                            <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded font-mono">yield</span>
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-emerald-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Fill In Blanks
                    </span>
                </div>
            );

        case 'logic-builder':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-purple-700 via-fuchsia-800 to-indigo-950 flex items-center justify-center ${className}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
                    <div className="relative z-10 flex flex-col gap-2 p-3.5 bg-black/40 backdrop-blur-md rounded-2xl border border-purple-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                            <span className="text-[10px] font-mono text-purple-300 flex items-center gap-1">
                                <Cpu className="w-3 h-3 text-purple-400" /> Logic Gates
                            </span>
                        </div>
                        <div className="flex items-center justify-around py-1 font-mono text-[11px]">
                            <div className="px-2 py-1 bg-purple-900/80 border border-purple-400/40 rounded text-purple-200 font-bold">A: TRUE</div>
                            <span className="text-fuchsia-400 font-bold">AND</span>
                            <div className="px-2 py-1 bg-fuchsia-900/80 border border-fuchsia-400/40 rounded text-fuchsia-200 font-bold">B: TRUE</div>
                        </div>
                        <div className="text-center font-mono text-[11px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 py-0.5 rounded font-bold">
                            RESULT &#8594; TRUE
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-purple-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Algorithms
                    </span>
                </div>
            );

        case 'sql-challenge':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-teal-700 via-emerald-800 to-slate-950 flex items-center justify-center ${className}`}>
                    <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-teal-400/20 rounded-full blur-xl" />
                    <div className="relative z-10 flex flex-col gap-1.5 p-3.5 bg-black/40 backdrop-blur-md rounded-2xl border border-teal-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                            <span className="text-[10px] font-mono text-teal-300 flex items-center gap-1">
                                <Database className="w-3 h-3 text-teal-400" /> schema.sql
                            </span>
                        </div>
                        <div className="font-mono text-[11px] text-teal-200">
                            <span className="text-teal-400 font-bold">SELECT</span> id, name, gpa
                        </div>
                        <div className="font-mono text-[11px] text-teal-200">
                            <span className="text-teal-400 font-bold">FROM</span> students
                        </div>
                        <div className="font-mono text-[11px] text-emerald-300 font-bold">
                            <span className="text-teal-400">WHERE</span> gpa &gt;= 3.5;
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-teal-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Query Master
                    </span>
                </div>
            );

        case 'memory-match':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 flex items-center justify-center ${className}`}>
                    <div className="relative z-10 grid grid-cols-2 gap-2 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-blue-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <div className="w-16 h-12 bg-blue-500/30 border border-blue-400/50 rounded-xl flex items-center justify-center font-mono text-[10px] text-blue-200 font-bold text-center px-1">
                            Closure
                        </div>
                        <div className="w-16 h-12 bg-indigo-500/30 border border-indigo-400/50 rounded-xl flex items-center justify-center font-mono text-[9px] text-indigo-200 text-center px-1">
                            Lexical Scope
                        </div>
                        <div className="w-16 h-12 bg-cyan-500/30 border border-cyan-400/50 rounded-xl flex items-center justify-center font-mono text-[10px] text-cyan-200 font-bold text-center px-1">
                            Promise
                        </div>
                        <div className="w-16 h-12 bg-sky-500/30 border border-sky-400/50 rounded-xl flex items-center justify-center font-mono text-[9px] text-sky-200 text-center px-1">
                            Async Result
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-blue-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Match Concepts
                    </span>
                </div>
            );

        // --- 6 TYPING GAMES ---
        case 'speed-typing':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-900 flex items-center justify-center ${className}`}>
                    <div className="absolute top-0 left-0 w-36 h-36 bg-emerald-400/20 rounded-full blur-xl" />
                    <div className="relative z-10 flex flex-col gap-2 p-3.5 bg-black/40 backdrop-blur-md rounded-2xl border border-emerald-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                            <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                                <Gauge className="w-3.5 h-3.5 text-emerald-400" /> Speed Meter
                            </span>
                            <span className="text-[12px] font-black text-emerald-300">84 WPM</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-300 leading-snug">
                            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-0.5 rounded">Clean code is</span>
                            <span className="border-l-2 border-emerald-400 animate-pulse ml-0.5"> </span>
                            <span className="text-slate-500">readable, direct prose...</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-emerald-200/80 pt-0.5">
                            <span>Accuracy: 99%</span>
                            <span>CPM: 420</span>
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-emerald-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Real-time WPM
                    </span>
                </div>
            );

        case 'code-typing':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-950 flex items-center justify-center ${className}`}>
                    <div className="absolute -top-10 -left-10 w-36 h-36 bg-indigo-400/20 rounded-full blur-xl" />
                    <div className="relative z-10 flex flex-col gap-1.5 p-3.5 bg-black/50 backdrop-blur-md rounded-2xl border border-indigo-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                            <span className="text-[10px] font-mono text-indigo-300 flex items-center gap-1">
                                <Keyboard className="w-3.5 h-3.5 text-indigo-400" /> syntax.jsx
                            </span>
                            <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 rounded font-mono">React</span>
                        </div>
                        <div className="font-mono text-[11px] text-indigo-200">
                            <span className="text-emerald-400">const</span> [count, setCount]
                        </div>
                        <div className="font-mono text-[11px] text-indigo-200">
                            = <span className="text-yellow-400">useState</span>(0);
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-indigo-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Code Muscle
                    </span>
                </div>
            );

        case 'sixty-second-challenge':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-rose-600 via-red-700 to-amber-900 flex items-center justify-center ${className}`}>
                    <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-400/20 rounded-full blur-xl" />
                    <div className="relative z-10 flex flex-col items-center gap-1 p-3.5 bg-black/40 backdrop-blur-md rounded-2xl border border-rose-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="flex items-center gap-1.5 text-amber-300 font-mono text-[12px] font-black">
                            <Timer className="w-4 h-4 text-amber-400 animate-spin" /> 00:59
                        </div>
                        <div className="font-mono text-[14px] font-black text-white bg-rose-500/30 px-3 py-1 rounded-lg border border-rose-400/40">
                            polymorphism
                        </div>
                        <span className="text-[10px] font-mono text-rose-200">Words typed: 38</span>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-rose-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        60s Sprint
                    </span>
                </div>
            );

        case 'error-free-typing':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-700 to-stone-900 flex items-center justify-center ${className}`}>
                    <div className="relative z-10 flex flex-col items-center gap-1.5 p-3.5 bg-black/40 backdrop-blur-md rounded-2xl border border-amber-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg">
                            <ShieldCheck className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="font-mono text-[12px] font-black text-amber-200">
                            100% Accuracy Required
                        </div>
                        <span className="text-[10px] font-mono text-stone-300 text-center">
                            Zero typos allowed
                        </span>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-amber-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Zero Error
                    </span>
                </div>
            );

        case 'syntax-typing':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-950 flex items-center justify-center ${className}`}>
                    <div className="relative z-10 flex flex-wrap justify-center gap-1.5 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 max-w-[210px]">
                        <div className="w-9 h-8 rounded bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center font-mono text-[13px] font-black text-cyan-300">
                            {'{ }'}
                        </div>
                        <div className="w-9 h-8 rounded bg-blue-950/80 border border-blue-400/40 flex items-center justify-center font-mono text-[13px] font-black text-blue-300">
                            {'[ ]'}
                        </div>
                        <div className="w-9 h-8 rounded bg-indigo-950/80 border border-indigo-400/40 flex items-center justify-center font-mono text-[13px] font-black text-indigo-300">
                            {'=>'}
                        </div>
                        <div className="w-9 h-8 rounded bg-sky-950/80 border border-sky-400/40 flex items-center justify-center font-mono text-[13px] font-black text-sky-300">
                            {'&&'}
                        </div>
                        <div className="w-9 h-8 rounded bg-teal-950/80 border border-teal-400/40 flex items-center justify-center font-mono text-[13px] font-black text-teal-300">
                            {';'}
                        </div>
                        <div className="w-9 h-8 rounded bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center font-mono text-[13px] font-black text-cyan-300">
                            {'!=='}
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-cyan-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Symbol Drills
                    </span>
                </div>
            );

        case 'word-rain':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-purple-800 via-violet-900 to-black flex items-center justify-center ${className}`}>
                    <div className="relative z-10 flex flex-col gap-1.5 p-3.5 bg-black/50 backdrop-blur-md rounded-2xl border border-purple-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300 w-4/5 max-w-[210px]">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                            <span className="text-[10px] font-mono text-purple-300 flex items-center gap-1">
                                <CloudRain className="w-3.5 h-3.5 text-purple-400" /> Falling Words
                            </span>
                            <span className="text-[10px] text-purple-300 font-mono">&#10084;&#65039; &#10084;&#65039; &#10084;&#65039;</span>
                        </div>
                        <div className="text-right font-mono text-[11px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded">
                            async
                        </div>
                        <div className="text-left font-mono text-[11px] text-fuchsia-300 bg-fuchsia-950/60 px-2 py-0.5 rounded">
                            function
                        </div>
                        <div className="text-center font-mono text-[11px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded font-bold">
                            &gt; promise
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-black uppercase tracking-wider text-purple-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Type Before Drop
                    </span>
                </div>
            );

        default:
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center ${className}`}>
                    <Code2 className="w-12 h-12 text-slate-400/60" />
                    <span className="absolute bottom-2.5 right-3 text-[10px] font-bold text-white/70 bg-black/40 px-2 py-0.5 rounded">
                        {title || 'Coding Game'}
                    </span>
                </div>
            );
    }
};

export default GameArtwork;
