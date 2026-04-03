export class SoundManager {
  private ctx: AudioContext | null = null;
  public isEnabled: boolean = false;
  public isBgmPlaying: boolean = false;
  public bgmAudio: HTMLAudioElement | null = null;
  public sfxVolume: number = 1.0;
  public bgmVolume: number = 0.3;

  constructor() {
    this.init();
  }

  public init() {
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.isEnabled = true;
      } catch (e) {
        console.log("Web Audio API not supported");
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public enable() {
    this.init();
    if (!this.isBgmPlaying) {
        this.startBGM();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1, slideFreq?: number) {
    if (!this.ctx || !this.isEnabled) return;
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = type;
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
    }
    
    // Apply SFX global volume
    const finalVol = vol * this.sfxVolume * 2;
    gainNode.gain.setValueAtTime(finalVol, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playMelee() {
    this.playTone(400, 'triangle', 0.1, 0.1, 100);
  }

  public playLaserCharge() {
    this.playTone(300, 'sine', 0.3, 0.05, 1200); // More dramatic charge
  }

  public playLaserFire() {
    if (!this.ctx || !this.isEnabled) return;
    const ctx = this.ctx;
    
    // Laser Layer 1: High sweeping sawtooth
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(1200, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain1.gain.setValueAtTime(0.2 * this.sfxVolume * 2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    // Laser Layer 2: Lower sweeping square for crunch
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(600, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    gain2.gain.setValueAtTime(0.15 * this.sfxVolume * 2, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc1.connect(gain1).connect(ctx.destination);
    osc2.connect(gain2).connect(ctx.destination);
    
    osc1.start(); osc2.start();
    osc1.stop(ctx.currentTime + 0.3); osc2.stop(ctx.currentTime + 0.3);
  }

  public playManaCharge() {
    // A soft, rising hum for charging mana
    this.playTone(150, 'sine', 0.2, 0.05, 300);
  }

  public playEnemyHit() {
    this.playTone(150, 'square', 0.1, 0.05, 50);
  }

  public playPlayerHurt() {
    this.playTone(300, 'sawtooth', 0.2, 0.15, 100);
  }

  public playMenuClick() {
    this.playTone(600, 'sine', 0.1, 0.05, 800);
  }

  public playLevelUp() {
    if (!this.ctx || !this.isEnabled) return;
    const ctx = this.ctx;
    const notes = [440, 554, 659, 880]; // A maj arpeggio
    let time = ctx.currentTime;
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'square';
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.05 * this.sfxVolume * 2, time + idx * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.1 + 0.2);
      
      osc.start(time + idx * 0.1);
      osc.stop(time + idx * 0.1 + 0.2);
    });
  }

  public startBGM() {
    this.isBgmPlaying = true;
    if (!this.bgmAudio) {
      // Load user added custom track
      this.bgmAudio = new Audio('assets/BackgroundMusic/AdhesiveWombat - Night Shade.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.bgmVolume;
    }
    this.bgmAudio.play().catch(e => console.log('BGM playback prevented:', e));
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  public updateVolumes() {
    if (this.bgmAudio) {
        this.bgmAudio.volume = this.bgmVolume;
    }
  }
}
