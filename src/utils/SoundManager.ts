class SoundManager {
    private ctx: AudioContext | null = null;
    private enabled: boolean = true;
    private musicVolume: number = 0.3;
    private bgmOscillators: OscillatorNode[] = [];
    private bgmGain: GainNode | null = null;
    private isPlayingBGM: boolean = false;

    constructor() {
        try {
            // Initialize AudioContext on first user interaction usually, but we define it here.
            // We'll lazy load it to respect browser autoplay policies.
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    public setMusicVolume(vol: number) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        if (this.bgmGain && this.ctx) {
            this.bgmGain.gain.setTargetAtTime(this.musicVolume * 0.1, this.ctx.currentTime, 0.1);
        }
    }

    public playBGM() {
        if (this.isPlayingBGM || !this.enabled) return;
        this.isPlayingBGM = true;
        this.startProceduralBGM();
    }

    public stopBGM() {
        this.isPlayingBGM = false;
        this.bgmOscillators.forEach(osc => {
            try { osc.stop(); } catch (e) { }
        });
        this.bgmOscillators = [];
        if (this.bgmGain) {
            try { this.bgmGain.disconnect(); } catch (e) { }
            this.bgmGain = null;
        }
    }

    private startProceduralBGM() {
        if (!this.ctx) return;
        this.ensureContext();

        // Simple ambient loop using two sine waves with LFO modulation
        const now = this.ctx.currentTime;
        const masterGain = this.ctx.createGain();
        masterGain.gain.value = this.musicVolume * 0.1; // Low volume background
        masterGain.connect(this.ctx.destination);
        this.bgmGain = masterGain;

        const fund = 110; // A2 (Lower, smoother)

        // Create a nice major 7th chord texture
        [1, 1.25, 1.5, 1.875].forEach((ratio, i) => { // Root, Major 3rd, 5th, Major 7th
            const osc = this.ctx!.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = fund * ratio;

            // LFO for movement
            const lfo = this.ctx!.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.05 + (i * 0.02); // Very slow modulation

            const lfoGain = this.ctx!.createGain();
            lfoGain.gain.value = 2; // Slight vibrato

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            lfo.start(now);
            osc.connect(masterGain);
            osc.start(now);

            this.bgmOscillators.push(osc);
            this.bgmOscillators.push(lfo);
        });
    }

    private ensureContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) this.ctx = new AudioContextClass();
        }
    }

    playPop() {
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
    }

    playSuccess() {
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const t = this.ctx.currentTime;

        // Arpeggio: C5 E5 G5 C6
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const startTime = t + (i * 0.08);

            osc.type = 'triangle';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }

    playTick() {
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);

        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
    }

    playTurnStart() {
        // Whistle Slide up
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(1000, t + 0.4);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
    }

    playGameEnd() {
        // Chord
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        [261.63, 329.63, 392.00, 523.25].forEach(freq => { // C Major
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(t);
            osc.stop(t + 1.5);
        });
    }

    toggle(enabled: boolean) {
        this.enabled = enabled;
    }
}

export const soundManager = new SoundManager();
