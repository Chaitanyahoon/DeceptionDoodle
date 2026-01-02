class SoundManager {
    private ctx: AudioContext | null = null;
    private enabled: boolean = true;
    private musicVolume: number = 0.3;
    private sfxVolume: number = 0.4;
    private bgmNodes: AudioNode[] = [];
    private isPlayingBGM: boolean = false;
    private nextNoteTime: number = 0;
    private bgmTimer: number | null = null;
    private measure: number = 0;

    constructor() {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    // --- Core Audio Helpers ---

    private ensureContext() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) this.ctx = new AudioContextClass();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // ADSR Envelope Tone (Unused)
    // private _playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, volume: number = 1) { ... }

    // White/Pink Noise for Percussion
    private createNoiseBuffer() {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // --- BGM System (Lo-fi Procedural) ---

    public setMusicVolume(vol: number) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        // If we had a master gain for BGM, update it here. 
        // For this procedural system, volume is applied per note, so changes stick on next note.
    }

    public playBGM() {
        if (this.isPlayingBGM || !this.enabled) return;
        this.ensureContext();
        this.isPlayingBGM = true;
        this.nextNoteTime = this.ctx!.currentTime;
        this.measure = 0;
        this.scheduler();
    }

    public stopBGM() {
        this.isPlayingBGM = false;
        if (this.bgmTimer) window.clearTimeout(this.bgmTimer);
        this.bgmNodes.forEach(node => {
            try { node.disconnect(); } catch (e) { }
        });
        this.bgmNodes = [];
    }

    private scheduler() {
        if (!this.isPlayingBGM || !this.ctx) return;

        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.scheduleNote(this.nextNoteTime);
            this.advanceNote();
        }
        this.bgmTimer = window.setTimeout(() => this.scheduler(), 25);
    }

    private advanceNote() {
        const tempo = 80; // BPM
        const secondsPerBeat = 60.0 / tempo;
        this.nextNoteTime += secondsPerBeat * 0.25; // 16th notes
        this.measure++;
    }

    private scheduleNote(time: number) {
        if (!this.ctx) return;

        const beat = this.measure % 16;

        // 1. Kick (Soft) - Beats 0, 10
        if (beat === 0 || beat === 10) {
            this.playKick(time);
        }

        // 2. Snare/Clap (Filtered Noise) - Beat 4, 12
        if (beat === 4 || beat === 12) {
            this.playSnare(time);
        }

        // 3. Hi-Hat (Closed) - Every odd beat
        if (beat % 2 !== 0) {
            this.playHiHat(time);
        }

        // 4. Chords (Rhodes-ish) - Change every 16 beats (1 bar)
        if (beat === 0) {
            // Chord Progression: CMaj7 -> Am7 -> Dm7 -> G7
            const chords = [
                [261.63, 329.63, 392.00, 493.88], // CMaj7
                [220.00, 261.63, 329.63, 392.00], // Am7
                [293.66, 349.23, 440.00, 523.25], // Dm7
                [196.00, 246.94, 293.66, 349.23], // G7
            ];
            const chordIdx = Math.floor(this.measure / 16) % 4;
            this.playChord(chords[chordIdx], time);
        }
    }

    private playKick(time: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(0.5 * this.musicVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.5);
        this.bgmNodes.push(gain); // Track for stopping
    }

    private playSnare(time: number) {
        if (!this.ctx) return;
        const noise = this.createNoiseBuffer();
        if (!noise) return;
        const src = this.ctx.createBufferSource();
        src.buffer = noise;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3 * this.musicVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        src.start(time);
        src.stop(time + 0.2);
        this.bgmNodes.push(gain);
    }

    private playHiHat(time: number) {
        if (!this.ctx) return;
        const noise = this.createNoiseBuffer();
        if (!noise) return;
        const src = this.ctx.createBufferSource();
        src.buffer = noise;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15 * this.musicVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        src.start(time);
        src.stop(time + 0.05);
        this.bgmNodes.push(gain);
    }

    private playChord(freqs: number[], time: number) {
        if (!this.ctx) return;
        freqs.forEach(f => {
            const osc = this.ctx!.createOscillator();
            osc.type = 'triangle'; // Softer
            osc.frequency.value = f;
            const filter = this.ctx!.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800; // Warm sound
            const gain = this.ctx!.createGain();
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.05 * this.musicVolume, time + 0.1);
            gain.gain.linearRampToValueAtTime(0, time + 2); // Long sustain
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(time);
            osc.stop(time + 2.5);
            this.bgmNodes.push(gain);
        });
    }


    // --- SFX Implementations ---

    public playPop() {
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Bubble sound: Sine sweep with lowpass resonance
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, t);
        filter.Q.value = 5; // Resonant

        gain.gain.setValueAtTime(0.5 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    public playSuccess() {
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Magical Arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C Major scale upwards rapidly
        notes.forEach((freq, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const st = t + (i * 0.05);

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.2 * this.sfxVolume, st);
            gain.gain.exponentialRampToValueAtTime(0.01, st + 0.5); // Bell-like decay

            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(st);
            osc.stop(st + 0.6);
        });
    }

    public playTick() {
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Woodblock: Filtered Square/Triangle with high pitch and short decay
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, t);

        gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
    }

    public playTurnStart() {
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Swell Chord
        const freqs = [440, 554.37, 659.25]; // A Major
        freqs.forEach(f => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = 'sine';
            osc.frequency.value = f;

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2 * this.sfxVolume, t + 0.2); // Swell in
            gain.gain.linearRampToValueAtTime(0, t + 1.0); // Fade out

            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(t);
            osc.stop(t + 1.0);
        });
    }

    public playJoin() {
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Ding Dong (High-Low)
        const notes = [880, 659.25]; // A5 -> E5
        notes.forEach((f, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const st = t + (i * 0.2);

            osc.type = 'sine';
            osc.frequency.value = f;

            gain.gain.setValueAtTime(0.3 * this.sfxVolume, st);
            gain.gain.exponentialRampToValueAtTime(0.01, st + 0.6);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(st);
            osc.stop(st + 0.7);
        });
    }

    public playMessage() {
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Soft Pluck
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, t);

        gain.gain.setValueAtTime(0.1 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
    }

    toggle(enabled: boolean) {
        this.enabled = enabled;
        if (!enabled) this.stopBGM();
        else this.playBGM();
    }
}

export const soundManager = new SoundManager();
