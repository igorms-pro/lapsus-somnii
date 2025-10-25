// Lapsus Somnii - Audio System
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.volume = 0.7;
        this.musicVolume = 0.5;
        this.isMuted = false;
        
        // Audio context for Web Audio API
        this.audioContext = null;
        this.gainNode = null;
        this.musicGainNode = null;
        
        this.init();
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.musicGainNode = this.audioContext.createGain();
            
            this.gainNode.connect(this.audioContext.destination);
            this.musicGainNode.connect(this.audioContext.destination);
            
            this.gainNode.gain.value = this.volume;
            this.musicGainNode.gain.value = this.musicVolume;
            
            this.createSounds();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    createSounds() {
        // Create procedural sounds using Web Audio API
        this.sounds = {
            collect: this.createCollectSound(),
            collision: this.createCollisionSound(),
            powerUp: this.createPowerUpSound(),
            dream: this.createDreamSound(),
            ambient: this.createAmbientSound()
        };
    }
    
    createCollectSound() {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            // Bell-like sound
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }
    
    createCollisionSound() {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            // Impact sound
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }
    
    createPowerUpSound() {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            // Magical sound
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.15);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.3);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            filter.Q.setValueAtTime(10, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.4);
        };
    }
    
    createDreamSound() {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            // Create multiple oscillators for a dreamy effect
            for (let i = 0; i < 3; i++) {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.gainNode);
                
                const frequency = 300 + (i * 100);
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.audioContext.currentTime + 0.5);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1500, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
            }
        };
    }
    
    createAmbientSound() {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            // Create ambient drone
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.musicGainNode);
            
            oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
            
            oscillator.start(this.audioContext.currentTime);
            
            // Return stop function
            return () => {
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
                oscillator.stop(this.audioContext.currentTime + 1);
            };
        };
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    playMusic() {
        if (this.music) {
            this.music();
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = this.musicVolume;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.gainNode) {
            this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
        }
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = this.isMuted ? 0 : this.musicVolume;
        }
    }
    
    // Resume audio context (required for some browsers)
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Initialize audio manager
window.audioManager = new AudioManager();
