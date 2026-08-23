import { getSoundPreset, SoundPreset } from './SoundLibrary';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private eqBands: BiquadFilterNode[] = [];
  private pannerNode: StereoPannerNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private activePack: string = 'classic-hiphop';
  private masterPitch: number = 0; // -12 to +12 semitones

  private masterVolume: number = 0.5; // -6dB headroom
  private pannerVolume: number = 0.5;

  private globalFilterNode: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;

  private saturationCurve: Float32Array;

  constructor() {
    this.saturationCurve = new Float32Array(44100);
    for (let i = 0; i < 44100; i++) {
        const x = (i * 2) / 44100 - 1;
        // Reduced saturation aggressiveness to prevent harsh clipping
        this.saturationCurve[i] = (2 + 10) * x * 10 * (Math.PI / 180) / (Math.PI + 10 * Math.abs(x));
    }
  }

  private noiseBuffer: AudioBuffer | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a 5 second noise buffer
      const bufferSize = this.ctx.sampleRate * 5;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }

      this.masterGain = this.ctx.createGain();
      this.updateTotalVolume();

      this.globalFilterNode = this.ctx.createBiquadFilter();
      this.globalFilterNode.type = 'lowpass';
      this.globalFilterNode.frequency.value = 20000; 

      this.delayNode = this.ctx.createDelay(1.0);
      this.delayNode.delayTime.value = 0.3; 
      this.delayGain = this.ctx.createGain();
      this.delayGain.gain.value = 0;
      
      const feedbackGain = this.ctx.createGain();
      feedbackGain.gain.value = 0.4;
      this.delayNode.connect(feedbackGain);
      feedbackGain.connect(this.delayNode);

      this.delayNode.connect(this.delayGain);
      this.delayGain.connect(this.globalFilterNode);

      this.reverbNode = this.ctx.createConvolver();
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.value = 0;
      
      const irLen = this.ctx.sampleRate * 2;
      const irBuffer = this.ctx.createBuffer(2, irLen, this.ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = irBuffer.getChannelData(ch);
        for (let i = 0; i < irLen; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2);
        }
      }
      this.reverbNode.buffer = irBuffer;
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.globalFilterNode);

      this.masterGain.connect(this.delayNode);
      this.masterGain.connect(this.reverbNode);
      this.masterGain.connect(this.globalFilterNode);

      let prevNode: AudioNode = this.globalFilterNode;

      // Stereo Panner
      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
        this.pannerNode.pan.value = 0;
        prevNode.connect(this.pannerNode);
        prevNode = this.pannerNode;
      } else {
        // Fallback for older browsers
      }

      // 5-band EQ: 60Hz, 250Hz, 1kHz, 4kHz, 12kHz
      const freqs = [60, 250, 1000, 4000, 12000];
      const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf'];

      freqs.forEach((freq, idx) => {
          const filter = this.ctx!.createBiquadFilter();
          filter.type = types[idx];
          filter.frequency.value = freq;
          filter.gain.value = 0; // 0dB initially
          prevNode.connect(filter);
          prevNode = filter;
          this.eqBands.push(filter);
      });

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      prevNode.connect(this.analyser);
      
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.value = -3;
      this.limiter.knee.value = 5;
      this.limiter.ratio.value = 20;
      this.limiter.attack.value = 0.005; // Fast attack to catch peaks
      this.limiter.release.value = 0.05; // Fast release to avoid pumping

      this.analyser.connect(this.limiter);
      this.limiter.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getAudioData(dataArray: Uint8Array) {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(dataArray);
    }
  }

  private updateTotalVolume() {
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume * this.pannerVolume;
    }
  }

  setPannerPosition(pos: { x: number, y: number }) {
    if (this.pannerNode) {
      // x: 0 to 100 -> pan: -1 to 1
      this.pannerNode.pan.value = (pos.x - 50) / 50;
    }
    // y: 0 to 100 -> volume: drop volume as we go back (y -> 100)
    const distance = 1 - (pos.y / 100);
    this.pannerVolume = 0.2 + 0.8 * distance;
    this.updateTotalVolume();
  }

  setEqLevels(levels: number[]) {
    // levels are 0-100, 50 is 0dB. Map to -12dB to +12dB
    if (this.eqBands.length !== 5) return;
    levels.forEach((val, idx) => {
        const db = ((val - 50) / 50) * 12;
        this.eqBands[idx].gain.value = db;
    });
  }

  setEffects(reverb: number, delay: number, filterType: 'lowpass' | 'highpass' | 'bandpass') {
    if (this.reverbGain) {
      this.reverbGain.gain.value = reverb / 100;
    }
    if (this.delayGain) {
      this.delayGain.gain.value = delay / 100;
    }
    if (this.masterGain) {
      this.masterGain.gain.value = (this.masterVolume * this.pannerVolume);
    }
    if (this.globalFilterNode) {
      this.globalFilterNode.type = filterType;
      if (filterType === 'lowpass') {
        this.globalFilterNode.frequency.value = 20000;
      } else if (filterType === 'highpass') {
        this.globalFilterNode.frequency.value = 100;
      } else if (filterType === 'bandpass') {
        this.globalFilterNode.frequency.value = 1500;
        this.globalFilterNode.Q.value = 1;
      }
    }
  }

  private synthParams = { cutoff: 70, resonance: 30, envMod: 50, decay: 40 };

  setSynthParams(params: { cutoff: number; resonance: number; envMod: number; decay: number }) {
    this.synthParams = params;
  }

  setVolume(vol: number) {
    this.masterVolume = vol;
    this.updateTotalVolume();
  }

  setMasterPitch(pitch: number) {
    this.masterPitch = pitch;
  }

  private applyPitch(freq: number) {
    return freq * Math.pow(2, this.masterPitch / 12);
  }

  setSamplePack(pack: string) {
    this.activePack = pack;
  }

  playSound(trackIdx: number, soundId?: string) {
    if (this.ctx?.state !== 'running' || !this.masterGain) return;
    
    // Fallback logic if no soundId provided (legacy support)
    if (!soundId) {
      switch(trackIdx) {
        case 0: soundId = 'classic-kick'; break;
        case 1: soundId = 'classic-snare'; break;
        case 2: soundId = 'classic-hihat'; break;
        case 3: soundId = 'classic-perc'; break;
        default: soundId = 'classic-kick';
      }
    }
    
    const preset = getSoundPreset(soundId);
    
    // Apply Synth Params
    const decayMod = (0.2 + (this.synthParams.decay / 100) * 2);
    const pitchMod = this.synthParams.envMod / 50;
    const globalCutoff = 200 + (this.synthParams.cutoff / 100) * 15000;
    const globalQ = (this.synthParams.resonance / 100) * 20;

    let decay = preset.decay * decayMod;
    let baseFreq = this.applyPitch(preset.baseFreq * pitchMod);
    const attack = preset.attack || 0.005;

    const gain = this.ctx.createGain();
    const globalFilter = this.ctx.createBiquadFilter();
    const saturator = this.ctx.createWaveShaper();

    saturator.curve = this.saturationCurve;
    saturator.oversample = '4x';
    
    globalFilter.type = 'lowpass';
    globalFilter.frequency.value = globalCutoff;
    globalFilter.Q.value = globalQ;
    
    gain.connect(saturator);
    saturator.connect(globalFilter);
    globalFilter.connect(this.masterGain);

    if (preset.type === 'osc') {
      const osc = this.ctx.createOscillator();
      osc.type = preset.oscType || 'sine';
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = preset.filterType || 'lowpass';
      filter.frequency.value = preset.filterFreq || 20000;
      filter.Q.value = preset.filterQ || 1;
      
      osc.connect(filter);
      filter.connect(gain);
      
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      if (preset.sweep && preset.sweep !== 1) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, baseFreq * preset.sweep), this.ctx.currentTime + decay);
      }
      
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.4, this.ctx.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + attack + decay);
      
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + attack + decay);
      
      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
        saturator.disconnect();
        globalFilter.disconnect();
      };
      
    } else if (preset.type === 'noise') {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = preset.filterType || 'highpass';
      filter.frequency.value = this.applyPitch((preset.filterFreq || 1000) * pitchMod);
      filter.Q.value = preset.filterQ || 1;
      
      noise.connect(filter);
      filter.connect(gain);
      
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, this.ctx.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + attack + decay);
      
      noise.start(this.ctx.currentTime, 0, decay + attack);
      
      let snapOsc: OscillatorNode | null = null;
      let snapGain: GainNode | null = null;
      // Snare snap addition
      if (preset.category === 'Snare') {
        snapOsc = this.ctx.createOscillator();
        snapGain = this.ctx.createGain();
        snapOsc.type = 'triangle';
        snapOsc.connect(snapGain);
        snapGain.connect(globalFilter);
        
        snapOsc.frequency.setValueAtTime(this.applyPitch(baseFreq), this.ctx.currentTime);
        snapGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        snapGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + attack + (decay * 0.5));
        
        snapOsc.start(this.ctx.currentTime);
        snapOsc.stop(this.ctx.currentTime + attack + decay);
      }
      
      // We can't rely on `onended` of noise buffer if it's longer than decay+attack, but wait, noise.start specifies duration
      noise.onended = () => {
        noise.disconnect();
        filter.disconnect();
        gain.disconnect();
        saturator.disconnect();
        globalFilter.disconnect();
        if (snapOsc && snapGain) {
          snapOsc.disconnect();
          snapGain.disconnect();
        }
      };
    }
  }

  playMetronomeClick() {
    if (this.ctx?.state !== 'running' || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  setParam(uiId: string, value: number) {
    // Map 0-127 MIDI value to appropriate range for the parameter
    const normalized = value / 127 * 100;
    
    if (uiId.startsWith('synth-')) {
       const param = uiId.split('-')[1] as keyof typeof this.synthParams;
       this.synthParams[param] = normalized;
    } else if (uiId === 'master-volume') {
       this.setVolume(normalized / 100);
    }
  }
}

export const audioEngine = new AudioEngine();
