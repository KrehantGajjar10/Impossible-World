export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  // Drone nodes
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private voidOsc: OscillatorNode | null = null;
  private voidGain: GainNode | null = null;
  
  // Resonance nodes
  private resonanceOsc: OscillatorNode | null = null;
  private resonanceGain: GainNode | null = null;

  public isMuted = true;
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0; // Muted initially
    this.isMuted = false;

    // Base drone (Progress 0 -> 0.5)
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.value = 55; // Low A
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.5;
    this.droneOsc.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    this.droneOsc.start();

    // Void drone (Progress 0.5 -> 1.0)
    this.voidOsc = this.ctx.createOscillator();
    this.voidOsc.type = 'triangle';
    this.voidOsc.frequency.value = 41.2; // Low E
    this.voidGain = this.ctx.createGain();
    this.voidGain.gain.value = 0;
    this.voidOsc.connect(this.voidGain);
    this.voidGain.connect(this.masterGain);
    this.voidOsc.start();

    // Gateway Resonance (ImpossibleLandmark influence)
    this.resonanceOsc = this.ctx.createOscillator();
    this.resonanceOsc.type = 'sine';
    this.resonanceOsc.frequency.value = 110; // A2
    this.resonanceGain = this.ctx.createGain();
    this.resonanceGain.gain.value = 0;
    this.resonanceOsc.connect(this.resonanceGain);
    this.resonanceGain.connect(this.masterGain);
    this.resonanceOsc.start();

    this.isInitialized = true;
    
    // Fade in gently
    this.masterGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 1.0);
  }

  public toggleMute() {
    if (!this.isInitialized) {
      this.init();
      return false; // Returns new mute state
    }

    if (!this.ctx || !this.masterGain) return this.isMuted;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    const target = this.isMuted ? 0 : 1.0;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.5);
    return this.isMuted;
  }

  public updateAtmosphere(progress: number) {
    if (!this.isInitialized || !this.ctx || !this.droneGain || !this.voidGain) return;

    // Progress 0.0 -> 0.5: Drone is 0.5 -> 0.2
    // Progress 0.5 -> 1.0: Drone is 0.2 -> 0.0
    const droneTarget = Math.max(0, 0.5 - (progress * 0.5));
    
    // Progress 0.0 -> 0.5: Void is 0.0 -> 0.0
    // Progress 0.5 -> 1.0: Void is 0.0 -> 0.4
    const voidTarget = progress > 0.5 ? (progress - 0.5) * 0.8 : 0.0;

    const time = this.ctx.currentTime;
    this.droneGain.gain.setTargetAtTime(droneTarget, time, 0.2);
    this.voidGain.gain.setTargetAtTime(voidTarget, time, 0.2);
  }

  public updateGatewayResonance(influence: number) {
    if (!this.isInitialized || !this.ctx || !this.resonanceGain || !this.resonanceOsc) return;

    // Influence is 0 to 1
    const targetGain = influence * 0.15;
    // Slight detune based on influence
    const targetFreq = 110 + (influence * 5);

    const time = this.ctx.currentTime;
    this.resonanceGain.gain.setTargetAtTime(targetGain, time, 0.1);
    this.resonanceOsc.frequency.setTargetAtTime(targetFreq, time, 0.1);
  }

  public playArtifactPing() {
    if (!this.isInitialized || !this.ctx || !this.masterGain || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const pingOsc = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();

    pingOsc.type = 'sine';
    pingOsc.frequency.value = 880; // A5
    pingOsc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.5);

    pingGain.gain.value = 0.3;
    pingGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.0);

    pingOsc.connect(pingGain);
    pingGain.connect(this.masterGain);

    pingOsc.start();
    pingOsc.stop(this.ctx.currentTime + 1.0);
  }
}

export const audioEngine = new AudioEngine();
