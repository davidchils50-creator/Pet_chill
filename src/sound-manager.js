/* ===================================
   SOUND-MANAGER.JS - Retro 8-bit Sound FX & Chiptune BGM
   =================================== */

export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.4;
        this.soundEnabled = true;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.bgmNoteIndex = 0;
    }

    initAudioContext() {
        if (!this.audioContext) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.audioContext = new AudioCtx();
            }
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (!this.soundEnabled) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.soundEnabled;
    }

    adjustVolume(delta) {
        this.masterVolume = Math.max(0, Math.min(1, this.masterVolume + delta));
        return Math.round(this.masterVolume * 100);
    }

    playJump() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'square';
            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

            gain.gain.setValueAtTime(this.masterVolume * 0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {
            console.warn('Audio error:', e);
        }
    }

    playAct() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            // Cheerful cat meow / chirp
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'triangle';
            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(520, now);
            osc.frequency.linearRampToValueAtTime(880, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(660, now + 0.22);

            gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {
            console.warn('Audio error:', e);
        }
    }

    playCoin() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            // Classic two-tone coin ping (B5 -> E6)
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator();
            const gain1 = this.audioContext.createGain();
            const gain2 = this.audioContext.createGain();

            osc1.type = 'sine';
            osc2.type = 'sine';

            osc1.connect(gain1);
            gain1.connect(this.audioContext.destination);
            osc2.connect(gain2);
            gain2.connect(this.audioContext.destination);

            osc1.frequency.setValueAtTime(987.77, now); // B5
            gain1.gain.setValueAtTime(this.masterVolume * 0.25, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc1.start(now);
            osc1.stop(now + 0.08);

            osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
            gain2.gain.setValueAtTime(this.masterVolume * 0.28, now + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc2.start(now + 0.08);
            osc2.stop(now + 0.35);
        } catch (e) {
            console.warn('Audio error:', e);
        }
    }

    playFootstep() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            const pitch = 120 + Math.random() * 40;
            osc.frequency.setValueAtTime(pitch, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);

            gain.gain.setValueAtTime(this.masterVolume * 0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.start(now);
            osc.stop(now + 0.04);
        } catch (e) {
            console.warn('Footstep error:', e);
        }
    }

    playFeed() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            // Cute crunchy eating chiptune sound (2 rapid bites)
            [0, 0.09].forEach((delay) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'triangle';
                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.frequency.setValueAtTime(440 + Math.random() * 60, now + delay);
                osc.frequency.exponentialRampToValueAtTime(780, now + delay + 0.07);

                gain.gain.setValueAtTime(this.masterVolume * 0.25, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.07);

                osc.start(now + delay);
                osc.stop(now + delay + 0.07);
            });
        } catch (e) {
            console.warn('Feed sound error:', e);
        }
    }

    playPraise() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            // Warm affectionate purr / happy ascending arpeggio
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'sine';
                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                const t = now + i * 0.07;
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(this.masterVolume * 0.22, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

                osc.start(t);
                osc.stop(t + 0.12);
            });
        } catch (e) {
            console.warn('Praise sound error:', e);
        }
    }

    playScold() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            // Sad / startled low tone
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.type = 'sawtooth';
            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(260, now);
            osc.frequency.linearRampToValueAtTime(140, now + 0.25);

            gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {
            console.warn('Scold sound error:', e);
        }
    }

    playSplash() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            // Cute bubbly water splash sound (FM frequency modulation + sine burst)
            [0, 0.05, 0.1].forEach((delay, idx) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'sine';
                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                const baseFreq = 400 + idx * 180 + Math.random() * 50;
                osc.frequency.setValueAtTime(baseFreq, now + delay);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + delay + 0.06);

                gain.gain.setValueAtTime(this.masterVolume * 0.22, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.08);

                osc.start(now + delay);
                osc.stop(now + delay + 0.08);
            });
        } catch (e) {
            console.warn('Splash sound error:', e);
        }
    }

    playPickup() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            // Cheerful ascending squeak
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(740, now + 0.12);

            gain.gain.setValueAtTime(this.masterVolume * 0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {
            console.warn('Pickup sound error:', e);
        }
    }

    playDrop() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.type = 'triangle';
            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);

            gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {
            console.warn('Drop sound error:', e);
        }
    }

    playGunshot() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const ctx = this.audioContext;
            const now = ctx.currentTime;

            // 1. Transient Explosion Noise Burst (Bubuk mesiu)
            const bufferSize = Math.floor(ctx.sampleRate * 0.35);
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
            }
            const whiteNoise = ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(3600, now);
            noiseFilter.frequency.exponentialRampToValueAtTime(250, now + 0.28);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(this.masterVolume * 0.85, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            whiteNoise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            whiteNoise.start(now);

            // 2. Heavy Sub-Bass Gunshot Punch Kick
            const kickOsc = ctx.createOscillator();
            const kickGain = ctx.createGain();
            kickOsc.type = 'sine';
            kickOsc.frequency.setValueAtTime(260, now);
            kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.22);

            kickGain.gain.setValueAtTime(this.masterVolume * 0.9, now);
            kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            kickOsc.connect(kickGain);
            kickGain.connect(ctx.destination);
            kickOsc.start(now);
            kickOsc.stop(now + 0.26);
        } catch (e) {
            console.warn('Gunshot sound error:', e);
        }
    }

    playFearScreech() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(950, now);
            osc.frequency.linearRampToValueAtTime(1500, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(420, now + 0.35);

            gain.gain.setValueAtTime(this.masterVolume * 0.45, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
        } catch (e) {
            console.warn('Fear screech sound error:', e);
        }
    }

    playBlink() {
        if (!this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);

            gain.gain.setValueAtTime(this.masterVolume * 0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

            osc.start(now);
            osc.stop(now + 0.04);
        } catch (e) {
            console.warn('Blink error:', e);
        }
    }

    startBGM() {
        if (this.bgmPlaying || !this.soundEnabled) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        this.bgmPlaying = true;
        // Cute relaxing retro pentatonic melody
        const notes = [
            261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
            293.66, 369.99, 440.00, 587.33, 440.00, 369.99,
            329.63, 392.00, 493.88, 659.25, 493.88, 392.00,
            261.63, 329.63, 392.00, 523.25, 659.25, 523.25
        ];

        let idx = 0;
        this.bgmTimer = setInterval(() => {
            if (!this.soundEnabled || !this.bgmPlaying) return;
            try {
                const now = this.audioContext.currentTime;
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(notes[idx % notes.length], now);

                gain.gain.setValueAtTime(this.masterVolume * 0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.start(now);
                osc.stop(now + 0.23);
                idx++;
            } catch (e) {
                // Ignore audio context autoplay limitations
            }
        }, 250);
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}
