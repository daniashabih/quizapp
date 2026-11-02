/**
 * Web Audio API synthesizer for Hangbug Game Sound Effects.
 * Fully synthetic: zero external asset dependencies, zero network requests, instant playback.
 */

class GameAudioManager {
    constructor() {
        this.ctx = null;
        this.isMuted = typeof window !== 'undefined' && localStorage.getItem('hangbug_sound_muted') === 'true';
    }

    _getContext() {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    setMuted(muted) {
        this.isMuted = Boolean(muted);
        if (typeof window !== 'undefined') {
            localStorage.setItem('hangbug_sound_muted', this.isMuted ? 'true' : 'false');
        }
    }

    toggleMuted() {
        this.setMuted(!this.isMuted);
        return this.isMuted;
    }

    /**
     * Subtle click/tick when moving blocks
     */
    playMove() {
        if (this.isMuted) return;
        try {
            const ctx = this._getContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.04);

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch {
            // Audio error safety
        }
    }

    /**
     * Bright victory chime for correct solution
     */
    playSuccess() {
        if (this.isMuted) return;
        try {
            const ctx = this._getContext();
            if (!ctx) return;

            // Musical arpeggio notes (C5, E5, G5, C6)
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, i) => {
                const startTime = ctx.currentTime + (i * 0.09);
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.12, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.28);
            });
        } catch {
            // Audio error safety
        }
    }

    /**
     * Gentle buzz for incorrect answer
     */
    playError() {
        if (this.isMuted) return;
        try {
            const ctx = this._getContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.2);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.23);
        } catch {
            // Audio error safety
        }
    }

    /**
     * Game over / all puzzles solved celebration
     */
    playGameOver() {
        if (this.isMuted) return;
        try {
            const ctx = this._getContext();
            if (!ctx) return;

            const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            chords.forEach((freq, idx) => {
                const startTime = ctx.currentTime + (idx * 0.12);
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.15, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.5);
            });
        } catch {
            // Audio error safety
        }
    }
}

export const gameAudio = new GameAudioManager();
export default gameAudio;
