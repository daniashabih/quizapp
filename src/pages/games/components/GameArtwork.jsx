import React from 'react';

/**
 * High-quality vector game artworks tailored for each arcade game.
 * Uses high-contrast, colorful gradients and crisp geometric vector shapes.
 */
export const GameArtwork = ({ slug, className = "w-full h-full object-cover", title = "" }) => {
    switch (slug) {
        case '2048':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-500 flex items-center justify-center ${className}`}>
                    {/* Glowing background circles */}
                    <div className="absolute -top-10 -left-10 w-36 h-36 bg-yellow-300/30 rounded-full blur-xl" />
                    <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-orange-700/40 rounded-full blur-xl" />

                    {/* Geometric mini 2048 board representation */}
                    <div className="relative z-10 grid grid-cols-2 gap-2 p-3 bg-black/25 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                        <div className="w-11 h-11 sm:w-14 sm:h-14 bg-amber-200/90 rounded-xl flex items-center justify-center font-black text-amber-950 text-sm sm:text-base shadow-md">
                            2
                        </div>
                        <div className="w-11 h-11 sm:w-14 sm:h-14 bg-orange-400 rounded-xl flex items-center justify-center font-black text-white text-sm sm:text-base shadow-md">
                            64
                        </div>
                        <div className="w-11 h-11 sm:w-14 sm:h-14 bg-amber-500 rounded-xl flex items-center justify-center font-black text-white text-sm sm:text-base shadow-md">
                            512
                        </div>
                        <div className="w-11 h-11 sm:w-14 sm:h-14 bg-yellow-300 rounded-xl flex items-center justify-center font-black text-amber-950 text-xs sm:text-sm font-extrabold shadow-lg animate-pulse">
                            2048
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[11px] font-black uppercase tracking-wider text-white/80 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Slide & Merge
                    </span>
                </div>
            );

        case 'snake':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-green-900 flex items-center justify-center ${className}`}>
                    {/* Retro Grid Background */}
                    <div
                        className="absolute inset-0 opacity-15"
                        style={{
                            backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
                            backgroundSize: '16px 16px'
                        }}
                    />
                    <div className="relative z-10 flex items-center justify-center">
                        {/* Winding Snake Body */}
                        <div className="flex items-center gap-1.5 p-3 bg-black/30 backdrop-blur-md rounded-2xl border border-emerald-400/30 shadow-xl group-hover:scale-105 transition-transform duration-300">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-300 border-2 border-emerald-100 flex items-center justify-center shadow-lg relative">
                                <div className="w-1.5 h-1.5 bg-black rounded-full absolute top-1.5 left-1.5" />
                                <div className="w-1.5 h-1.5 bg-black rounded-full absolute bottom-1.5 left-1.5" />
                            </div>
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-400" />
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500" />
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-emerald-600" />
                            {/* Glowing Red Apple */}
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-500 ml-3 shadow-lg shadow-red-500/50 flex items-center justify-center animate-bounce">
                                <div className="w-1 h-1.5 bg-green-300 -top-1 relative rounded-xs" />
                            </div>
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[11px] font-black uppercase tracking-wider text-emerald-200 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Retro Classic
                    </span>
                </div>
            );

        case 'brick-breaker':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-900 flex items-center justify-center ${className}`}>
                    {/* Bricks Grid */}
                    <div className="relative z-10 w-4/5 max-w-[200px] flex flex-col gap-1.5 p-3 bg-black/30 backdrop-blur-md rounded-2xl border border-indigo-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <div className="grid grid-cols-4 gap-1.5">
                            <div className="h-3 rounded-xs bg-red-500 shadow-xs shadow-red-500/50" />
                            <div className="h-3 rounded-xs bg-orange-500 shadow-xs shadow-orange-500/50" />
                            <div className="h-3 rounded-xs bg-yellow-400 shadow-xs shadow-yellow-400/50" />
                            <div className="h-3 rounded-xs bg-emerald-400 shadow-xs shadow-emerald-400/50" />
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                            <div className="h-3 rounded-xs bg-cyan-400 shadow-xs shadow-cyan-400/50" />
                            <div className="h-3 rounded-xs bg-blue-500 shadow-xs shadow-blue-500/50" />
                            <div className="h-3 rounded-xs bg-purple-400 shadow-xs shadow-purple-400/50" />
                            <div className="h-3 rounded-xs bg-pink-500 shadow-xs shadow-pink-500/50" />
                        </div>
                        {/* Ball */}
                        <div className="my-2 flex justify-center relative">
                            <div className="w-4 h-4 rounded-full bg-white shadow-lg shadow-white/80 ring-2 ring-indigo-300 animate-ping absolute" />
                            <div className="w-4 h-4 rounded-full bg-white shadow-lg shadow-white/80 relative z-10" />
                        </div>
                        {/* Paddle */}
                        <div className="flex justify-center">
                            <div className="w-20 h-3 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-300 to-cyan-400 shadow-lg shadow-cyan-400/40" />
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[11px] font-black uppercase tracking-wider text-indigo-200 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Arcade Smash
                    </span>
                </div>
            );

        case 'tic-tac-toe':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-900 flex items-center justify-center ${className}`}>
                    <div className="relative z-10 p-3 bg-black/30 backdrop-blur-md rounded-2xl border border-cyan-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <div className="grid grid-cols-3 gap-1.5 w-28 h-28 sm:w-32 sm:h-32">
                            <div className="bg-white/10 rounded-lg flex items-center justify-center text-cyan-300 font-black text-xl shadow-inner">✕</div>
                            <div className="bg-white/10 rounded-lg flex items-center justify-center text-rose-400 font-black text-xl shadow-inner">◯</div>
                            <div className="bg-white/10 rounded-lg flex items-center justify-center text-cyan-300 font-black text-xl shadow-inner">✕</div>

                            <div className="bg-white/10 rounded-lg flex items-center justify-center text-rose-400 font-black text-xl shadow-inner">◯</div>
                            <div className="bg-cyan-400/30 rounded-lg flex items-center justify-center text-cyan-200 font-black text-2xl shadow-lg ring-1 ring-cyan-300">✕</div>
                            <div className="bg-white/10 rounded-lg"></div>

                            <div className="bg-white/10 rounded-lg flex items-center justify-center text-rose-400 font-black text-xl shadow-inner">◯</div>
                            <div className="bg-white/10 rounded-lg"></div>
                            <div className="bg-cyan-400/30 rounded-lg flex items-center justify-center text-cyan-200 font-black text-2xl shadow-lg ring-1 ring-cyan-300">✕</div>
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[11px] font-black uppercase tracking-wider text-cyan-200 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        AI Duel
                    </span>
                </div>
            );

        case 'memory-match':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-purple-600 via-fuchsia-700 to-pink-800 flex items-center justify-center ${className}`}>
                    <div className="relative z-10 p-3 bg-black/30 backdrop-blur-md rounded-2xl border border-purple-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <div className="grid grid-cols-3 gap-2 w-32 h-24 sm:w-36 sm:h-28">
                            <div className="bg-purple-300 rounded-xl flex items-center justify-center text-lg shadow-md shadow-purple-500/30">💎</div>
                            <div className="bg-purple-300 rounded-xl flex items-center justify-center text-lg shadow-md shadow-purple-500/30">💎</div>
                            <div className="bg-gradient-to-br from-purple-800 to-fuchsia-900 rounded-xl flex items-center justify-center text-sm font-bold text-purple-300 border border-purple-400/30">?</div>

                            <div className="bg-gradient-to-br from-purple-800 to-fuchsia-900 rounded-xl flex items-center justify-center text-sm font-bold text-purple-300 border border-purple-400/30">?</div>
                            <div className="bg-fuchsia-300 rounded-xl flex items-center justify-center text-lg shadow-md shadow-fuchsia-500/30">🚀</div>
                            <div className="bg-fuchsia-300 rounded-xl flex items-center justify-center text-lg shadow-md shadow-fuchsia-500/30">🚀</div>
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[11px] font-black uppercase tracking-wider text-purple-200 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Brain Boost
                    </span>
                </div>
            );

        case 'flappy-bug':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-sky-500 via-teal-600 to-emerald-700 flex items-center justify-center ${className}`}>
                    {/* Clouds */}
                    <div className="absolute top-3 left-6 w-16 h-6 bg-white/40 rounded-full blur-xs" />
                    <div className="absolute top-8 right-8 w-20 h-7 bg-white/30 rounded-full blur-xs" />

                    <div className="relative z-10 flex items-center gap-6">
                        {/* Flapping Bug Mascot */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-200 shadow-xl border-2 border-white flex items-center justify-center text-2xl animate-bounce">
                            🐞
                        </div>
                        {/* Pipes */}
                        <div className="flex flex-col gap-10">
                            <div className="w-8 h-12 bg-gradient-to-r from-green-500 to-emerald-700 rounded-b-lg border-2 border-emerald-900 shadow-md" />
                            <div className="w-8 h-12 bg-gradient-to-r from-green-500 to-emerald-700 rounded-t-lg border-2 border-emerald-900 shadow-md" />
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[11px] font-black uppercase tracking-wider text-sky-200 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Tap To Fly
                    </span>
                </div>
            );

        case 'color-match':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-600 to-amber-600 flex items-center justify-center ${className}`}>
                    <div className="relative z-10 p-3 bg-black/30 backdrop-blur-md rounded-2xl border border-rose-300/30 shadow-2xl flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-400 shadow-md" />
                            <div className="w-6 h-6 rounded-full bg-amber-400 shadow-md" />
                            <div className="w-6 h-6 rounded-full bg-sky-400 shadow-md" />
                            <div className="w-6 h-6 rounded-full bg-rose-400 shadow-md" />
                        </div>
                        <span className="text-sm font-black tracking-wider text-cyan-300 bg-black/40 px-3 py-1 rounded-lg">
                            BLUE
                        </span>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[11px] font-black uppercase tracking-wider text-rose-200 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Reflex Speed
                    </span>
                </div>
            );

        case 'number-puzzle':
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-blue-600 via-slate-700 to-indigo-900 flex items-center justify-center ${className}`}>
                    <div className="relative z-10 p-2.5 bg-black/30 backdrop-blur-md rounded-2xl border border-blue-400/30 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <div className="grid grid-cols-3 gap-1.5 w-24 h-24 sm:w-28 sm:h-28">
                            <div className="bg-slate-200 rounded-md flex items-center justify-center font-black text-slate-800 text-xs sm:text-sm">1</div>
                            <div className="bg-slate-200 rounded-md flex items-center justify-center font-black text-slate-800 text-xs sm:text-sm">2</div>
                            <div className="bg-slate-200 rounded-md flex items-center justify-center font-black text-slate-800 text-xs sm:text-sm">3</div>
                            <div className="bg-slate-200 rounded-md flex items-center justify-center font-black text-slate-800 text-xs sm:text-sm">4</div>
                            <div className="bg-slate-200 rounded-md flex items-center justify-center font-black text-slate-800 text-xs sm:text-sm">5</div>
                            <div className="bg-slate-200 rounded-md flex items-center justify-center font-black text-slate-800 text-xs sm:text-sm">6</div>
                            <div className="bg-slate-200 rounded-md flex items-center justify-center font-black text-slate-800 text-xs sm:text-sm">7</div>
                            <div className="bg-slate-200 rounded-md flex items-center justify-center font-black text-slate-800 text-xs sm:text-sm">8</div>
                            <div className="bg-slate-800/40 border border-dashed border-white/40 rounded-md"></div>
                        </div>
                    </div>
                    <span className="absolute bottom-2.5 right-3 text-[11px] font-black uppercase tracking-wider text-blue-200 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Sliding Tiles
                    </span>
                </div>
            );

        default:
            return (
                <div className={`relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 flex items-center justify-center ${className}`}>
                    <div className="text-center p-4">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl mb-2 shadow-lg">
                            🎮
                        </div>
                        <p className="font-bold text-white text-sm">{title || 'Mini Game'}</p>
                    </div>
                </div>
            );
    }
};

export default GameArtwork;
