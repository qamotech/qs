import { getSoundPreset } from './SoundLibrary';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private eqBands: BiquadFilterNode[] = [];
  private pannerNode: StereoPannerNode | null = null;
  private analyser: AnalyserNode | null = null;
  
   // private activePack: string = 'classic-hiphop';
  private masterPitch: number = 0; // -12 to +12 semitones

  private masterVolume: number = 0.8;
  private pannerVolume: number = 0.5;

  private globalFilterNode: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        console.error('Web Audio API is not supported in this browser');
        return;
      }
      this.ctx = new AudioCtx();
      
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
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getAudioData(dataArray: Uint8Array) {
    if (this.analyser) {
      // Web Audio typings expect a generic Uint8Array buffer view
      this.analyser.getByteTimeDomainData(dataArray as Uint8Array<ArrayBuffer>);
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

  private trackVolumes: number[] = [];

  setTrackVolumes(volumes: number[]) {
    this.trackVolumes = volumes;
  }

  private applyPitch(freq: number) {
    return freq * Math.pow(2, this.masterPitch / 12);
  }

  setSamplePack(_pack: string) {
    // this.activePack = pack;
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

    const trackVol = this.trackVolumes[trackIdx] !== undefined ? this.trackVolumes[trackIdx] / 100 : 0.8;
    const baseVol = 0.8 * trackVol;

    const gain = this.ctx.createGain();
    const globalFilter = this.ctx.createBiquadFilter();
    
    globalFilter.type = 'lowpass';
    globalFilter.frequency.value = globalCutoff;
    globalFilter.Q.value = globalQ;
    
    gain.connect(globalFilter);
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
      
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(baseVol, this.ctx.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + attack + decay);
      
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + attack + decay);
      
    } else if (preset.type === 'noise') {
      const bufferSize = this.ctx.sampleRate * Math.max(decay + attack, 0.5);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = preset.filterType || 'highpass';
      filter.frequency.value = this.applyPitch((preset.filterFreq || 1000) * pitchMod);
      filter.Q.value = preset.filterQ || 1;
      
      noise.connect(filter);
      filter.connect(gain);
      
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(baseVol * 0.5, this.ctx.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + attack + decay);
      
      noise.start(this.ctx.currentTime);
      
      // Snare snap addition
      if (preset.category === 'Snare') {
        const snapOsc = this.ctx.createOscillator();
        const snapGain = this.ctx.createGain();
        snapOsc.type = 'triangle';
        snapOsc.connect(snapGain);
        snapGain.connect(globalFilter);
        
        snapOsc.frequency.setValueAtTime(this.applyPitch(baseFreq), this.ctx.currentTime);
        snapGain.gain.setValueAtTime(baseVol * 0.5, this.ctx.currentTime);
        snapGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + attack + (decay * 0.5));
        
        snapOsc.start(this.ctx.currentTime);
        snapOsc.stop(this.ctx.currentTime + attack + decay);
      }
    }
  }
}

export const audioEngine = new AudioEngine();
