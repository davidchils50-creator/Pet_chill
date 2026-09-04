/* ===================================
   SOUND-MANAGER.JS - Sound Effects Manager
   Menggunakan Web Audio API untuk generate procedural sounds
   Referensi: https://www.kenney.nl/assets (public domain)
   =================================== */

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.initAudioContext();
        this.soundEnabled = true;
    }

    initAudioContext() {
        const audioContext = window.AudioContext || window.webkitAudioContext;
        if (audioContext) {
            this.audioContext = new audioContext();
        }
    }

    /**
     * Play footstep sound - suara langkah
     */
    playFootstep() {
        if (!this.audioContext || !this.soundEnabled) return;

        try {
            const now = this.audioContext.currentTime;
            
            // Gunakan noise untuk footstep
            const bufferSize = this.audioContext.sampleRate * 0.08;
            const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = noiseBuffer;

            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, now);

            gain.gain.setValueAtTime(this.masterVolume * 0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

            source.start(now);
            source.stop(now + 0.08);
        } catch (e) {
            console.warn('Footstep sound error:', e);
        }
    }

    /**
     * Play blink sound - suara mata berkedip (high-pitched beep)
     */
    playBlink() {
        if (!this.audioContext || !this.soundEnabled) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.exponentialRampToValueAtTime(1000, now + 0.05);

            gain.gain.setValueAtTime(this.masterVolume * 0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {
            console.warn('Blink sound error:', e);
        }
    }

    /**
     * Play collision sound - suara nabrak tembok
     */
    playCollision() {
        if (!this.audioContext || !this.soundEnabled) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            // Pitch drop untuk collision
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(250, now + 0.12);

            gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {
            console.warn('Collision sound error:', e);
        }
    }

    /**
     * Play happy/chirp sound - suara senang
     */
    playHappy() {
        if (!this.audioContext || !this.soundEnabled) return;

        try {
            const now = this.audioContext.currentTime;
            
            // Dua nota untuk chirp yang lebih menarik
            this.playNote(800, 0.15, now, 0.2);
            this.playNote(1000, 0.15, now + 0.1, 0.2);
        } catch (e) {
            console.warn('Happy sound error:', e);
        }
    }

    /**
     * Play idle sound - suara santai/tidur
     */
    playIdle() {
        if (!this.audioContext || !this.soundEnabled) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            // Suara rendah yang rileks
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(350, now + 0.3);

            gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            osc.start(now);
            osc.stop(now + 0.3);
        } catch (e) {
            console.warn('Idle sound error:', e);
        }
    }

    /**
     * Helper: Play single note
     */
    playNote(frequency, duration, startTime, attackTime) {
        if (!this.audioContext) return;

        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(frequency, startTime);
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.2, startTime + attackTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            osc.start(startTime);
            osc.stop(startTime + duration);
        } catch (e) {
            console.warn('Note playback error:', e);
        }
    }

    /**
     * Toggle sound on/off
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        console.log(this.soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF');
        return this.soundEnabled;
    }

    /**
     * Set master volume (0-1)
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}
