// ========================================
// BlackjARK - Sound System
// Web Audio API pour sons cyberpunk générés
// ========================================

class SoundSystem {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.3;
    
    // Lazy init (besoin d'un user gesture)
    this.initialized = false;
  }
  
  init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('🔊 Sound system initialized');
    } catch (e) {
      console.warn('Audio not supported');
    }
  }
  
  // Générer son de card flip
  playCardFlip() {
    if (!this.enabled || !this.initialized) return;
    
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }
  
  // Son de victoire (synth celebration)
  playWin() {
    if (!this.enabled || !this.initialized) return;
    
    const ctx = this.audioContext;
    
    // Chord progression
    const frequencies = [
      [523.25, 659.25, 783.99], // C major
      [587.33, 739.99, 880.00], // D major
      [659.25, 830.61, 987.77]  // E major
    ];
    
    frequencies.forEach((chord, i) => {
      chord.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.value = freq;
        osc.type = 'sine';
        
        const startTime = ctx.currentTime + (i * 0.15);
        gain.gain.setValueAtTime(this.volume * 0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    });
  }
  
  // Son de perte (glitch error)
  playLose() {
    if (!this.enabled || !this.initialized) return;
    
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }
  
  // Son de deal (cyber beep)
  playDeal() {
    if (!this.enabled || !this.initialized) return;
    
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = 1000;
    osc.type = 'square';
    
    gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }
  
  // Son de vTXO reçu (lightning zap)
  playVTXO() {
    if (!this.enabled || !this.initialized) return;
    
    const ctx = this.audioContext;
    
    // White noise burst
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    
    const gain = ctx.createGain();
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(this.volume * 0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.15);
  }
  
  // Son de button click
  playClick() {
    if (!this.enabled || !this.initialized) return;
    
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = 600;
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  }
  
  // Son de blackjack (special)
  playBlackjack() {
    if (!this.enabled || !this.initialized) return;
    
    // Séquence rapide de notes montantes
    const ctx = this.audioContext;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = freq;
      osc.type = 'triangle';
      
      const startTime = ctx.currentTime + (i * 0.08);
      gain.gain.setValueAtTime(this.volume * 0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }
  
  // Son d'achievement unlocked
  playAchievement() {
    if (!this.enabled || !this.initialized) return;
    
    const ctx = this.audioContext;
    
    // Arpeggio
    const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      const startTime = ctx.currentTime + (i * 0.1);
      gain.gain.setValueAtTime(this.volume * 0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }
  
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
  
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}

// Export global
window.soundSystem = new SoundSystem();

// Init on first user interaction
document.addEventListener('click', () => {
  if (!window.soundSystem.initialized) {
    window.soundSystem.init();
  }
}, { once: true });
