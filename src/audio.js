/* ===================================
   AUDIO.JS - Web Audio API Sound Manager
   Referensi: https://github.com/goldfire/howler.js
   =================================== */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.soundCache = {};
        this.initAudioContext();
    }

    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        const audioContext = window.AudioContext || window.webkitAudioContext;
        if (audioContext) {
            this.audioContext = new audioContext();
        }
    }

    /**
     * Generate simple beep sound untuk mata berkedip
     * Procedural sound generation (no file needed)
     */
    playBlink() {
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            // Frequency: blink sound tinggi
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

            gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }

    /**
     * Generate footstep sound saat pet berjalan
     */
    playFootstep() {
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            
            // Gunakan noise untuk lebih natural
            const bufferSize = this.audioContext.sampleRate * 0.1;
            const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            // Generate white noise
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

            // Low pass filter untuk footstep tone
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1500, now);

            gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

            source.start(now);
            source.stop(now + 0.08);
        } catch (e) {
            console.warn('Footstep sound failed:', e);
        }
    }

    /**
     * Generate collision sound saat menyentuh tembok
     */
    playCollision() {
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            // Collision: frequency turun (pitch drop)
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

            gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {
            console.warn('Collision sound failed:', e);
        }
    }

    /**
     * Generate idle/happy sound
     */
    playHappy() {
        if (!this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            // Happy: ascending frequency
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);

            gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {
            console.warn('Happy sound failed:', e);
        }
    }
}
