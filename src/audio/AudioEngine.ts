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

  private pinkNoiseBuffer: AudioBuffer | null = null;
  private brownNoiseBuffer: AudioBuffer | null = null;
  private bitcrusherNode: WaveShaperNode | null = null;
  private dcBlocker: BiquadFilterNode | null = null;

  constructor() {
    this.saturationCurve = new Float32Array(44100);
    // Upgrade 1: Smooth Tanh Saturation for Analog Warmth
    for (let i = 0; i < 44100; i++) {
        const x = (i * 2) / 44100 - 1;
        this.saturationCurve[i] = Math.tanh(x * 1.5);
    }
  }

  private noiseBuffer: AudioBuffer | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const bufferSize = this.ctx.sampleRate * 5;
      
      // Upgrade 2: True White Noise
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      let data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      // Upgrade 3: True Pink Noise
      this.pinkNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      let pData = this.pinkNoiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
          let white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          pData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          pData[i] *= 0.11;
          b6 = white * 0.115926;
      }

      // Upgrade 4: True Brown Noise
      this.brownNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      let brData = this.brownNoiseBuffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
          let white = Math.random() * 2 - 1;
          brData[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = brData[i];
          brData[i] *= 3.5; 
      }

      this.masterGain = this.ctx.createGain();
      this.updateTotalVolume();

      this.globalFilterNode = this.ctx.createBiquadFilter();
      this.globalFilterNode.type = 'lowpass';
      this.globalFilterNode.frequency.value = 20000; 

      // Upgrade 5: Ping-Pong Delay setup
      this.delayGain = this.ctx.createGain();
      this.delayGain.gain.value = 0;
      
      const leftDelay = this.ctx.createDelay(1.0);
      const rightDelay = this.ctx.createDelay(1.0);
      leftDelay.delayTime.value = 0.3;
      rightDelay.delayTime.value = 0.45;
      
      const leftFeedback = this.ctx.createGain();
      const rightFeedback = this.ctx.createGain();
      leftFeedback.gain.value = 0.3;
      rightFeedback.gain.value = 0.3;
      
      const merger = this.ctx.createChannelMerger(2);
      leftDelay.connect(rightFeedback);
      rightFeedback.connect(rightDelay);
      rightDelay.connect(leftFeedback);
      leftFeedback.connect(leftDelay);
      
      leftDelay.connect(merger, 0, 0);
      rightDelay.connect(merger, 0, 1);
      
      this.masterGain.connect(leftDelay);
      merger.connect(this.delayGain);
      this.delayGain.connect(this.globalFilterNode);

      // Upgrade 6: Filtered IR Reverb
      this.reverbNode = this.ctx.createConvolver();
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.value = 0;
      
      const irLen = this.ctx.sampleRate * 2;
      const irBuffer = this.ctx.createBuffer(2, irLen, this.ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = irBuffer.getChannelData(ch);
        let filterState = 0;
        for (let i = 0; i < irLen; i++) {
          // Noise burst exponentially decaying, passed through a simple lowpass to muffle the tail
          let raw = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 3);
          filterState += (raw - filterState) * 0.1;
          d[i] = filterState;
        }
      }
      this.reverbNode.buffer = irBuffer;
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.globalFilterNode);

      this.masterGain.connect(this.reverbNode);
      this.masterGain.connect(this.globalFilterNode);

      let prevNode: AudioNode = this.globalFilterNode;

      // Upgrade 7: Bitcrusher (Pre-EQ)
      this.bitcrusherNode = this.ctx.createWaveShaper();
      const bits = 8; // 8-bit crunch available
      const step = Math.pow(1/2, bits);
      const bcCurve = new Float32Array(44100);
      for (let i=0; i<44100; i++) {
         let x = (i * 2) / 44100 - 1;
         bcCurve[i] = Math.round(x / step) * step;
      }
      // Bitcrusher starts bypassed (linear curve) by default, we'll assign it to an effect parameter if needed, or leave it linear.
      // Actually, we'll keep it bypassed unless explicitly enabled.
      // prevNode.connect(this.bitcrusherNode);
      // prevNode = this.bitcrusherNode;

      // Stereo Panner
      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
        this.pannerNode.pan.value = 0;
        prevNode.connect(this.pannerNode);
        prevNode = this.pannerNode;
      }

      // 5-band EQ: 60Hz, 250Hz, 1kHz, 4kHz, 12kHz
      const freqs = [60, 250, 1000, 4000, 12000];
      const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf'];

      freqs.forEach((freq, idx) => {
          const filter = this.ctx!.createBiquadFilter();
          filter.type = types[idx];
          filter.frequency.value = freq;
          filter.gain.value = 0;
          // Upgrade 8: Master Polish (Air boost, mud cut)
          if (freq === 12000) filter.gain.value = 2.0; 
          if (freq === 250) filter.gain.value = -1.5;

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
      this.limiter.attack.value = 0.005;
      this.limiter.release.value = 0.05;

      this.analyser.connect(this.limiter);
      
      // Upgrade 9: Master DC Blocker
      this.dcBlocker = this.ctx.createBiquadFilter();
      this.dcBlocker.type = 'highpass';
      this.dcBlocker.frequency.value = 20;
      this.limiter.connect(this.dcBlocker);
      
      this.dcBlocker.connect(this.ctx.destination);
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

  playSound(trackIdx: number, soundId?: string, velocity: number = 1.0) {
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
    
    // Upgrade 10: Sidechain Ducking Simulation on Master when Kick plays
    if (preset.category === 'Kick') {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime((this.masterVolume * this.pannerVolume) * 0.3, now);
      this.masterGain.gain.exponentialRampToValueAtTime(this.masterVolume * this.pannerVolume, now + 0.15);
    }
    
    // Apply Synth Params
    const decayMod = (0.2 + (this.synthParams.decay / 100) * 2);
    const pitchMod = this.synthParams.envMod / 50;
    const globalCutoff = 200 + (this.synthParams.cutoff / 100) * 15000;
    const globalQ = (this.synthParams.resonance / 100) * 20;

    // Upgrade 11: ADSR calculations
    const attack = preset.attack || 0.005;
    let decay = preset.decay * decayMod;
    const sustain = preset.sustain || 0.01;
    const release = preset.release || 0.1;
    const totalDuration = attack + decay + release;
    
    let baseFreq = this.applyPitch(preset.baseFreq * pitchMod);

    const gain = this.ctx.createGain();
    const globalFilter = this.ctx.createBiquadFilter();
    const saturator = this.ctx.createWaveShaper();

    saturator.curve = this.saturationCurve;
    saturator.oversample = '4x';
    
    globalFilter.type = 'lowpass';
    globalFilter.frequency.value = globalCutoff;
    globalFilter.Q.value = globalQ;
    
    // Upgrade 12: Stereo Pan Humanization for HiHats/Percussion
    let panner: StereoPannerNode | null = null;
    if (this.ctx.createStereoPanner && (preset.category === 'HiHat' || preset.category === 'Perc')) {
       panner = this.ctx.createStereoPanner();
       panner.pan.value = (Math.random() * 0.2) - 0.1; // Slight stereo spread
       gain.connect(panner);
       panner.connect(saturator);
    } else {
       gain.connect(saturator);
    }

    saturator.connect(globalFilter);
    globalFilter.connect(this.masterGain);

    // Upgrade 13: Velocity Mapping
    const peakGain = 0.4 * velocity;

    const applyEnvelope = (param: AudioParam, t: number) => {
      param.setValueAtTime(0.001, t);
      param.exponentialRampToValueAtTime(Math.max(peakGain, 0.001), t + attack);
      param.exponentialRampToValueAtTime(Math.max(peakGain * sustain, 0.001), t + attack + decay);
      param.exponentialRampToValueAtTime(0.001, t + totalDuration);
    };

    let oscillators: OscillatorNode[] = [];
    const filter = this.ctx.createBiquadFilter();
    filter.type = preset.filterType || 'lowpass';
    filter.frequency.value = preset.filterFreq || 20000;
    filter.Q.value = preset.filterQ || 1;
    filter.connect(gain);

    if (preset.type === 'osc') {
      // Upgrade 14: Unison (Supersaw) implementation
      const unisonCount = preset.unison || 1;
      const detuneAmt = preset.detune || 0;
      
      for (let i=0; i<unisonCount; i++) {
        const osc = this.ctx.createOscillator();
        osc.type = preset.oscType || 'sine';
        osc.connect(filter);
        
        let freq = baseFreq;
        if (unisonCount > 1) {
           const detuneFactor = (i / (unisonCount - 1)) - 0.5; // -0.5 to 0.5
           freq = baseFreq * Math.pow(2, (detuneFactor * detuneAmt) / 1200);
        }
        
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        // Upgrade 15: Pitch Envelope (Punch)
        if (preset.punch) {
           osc.frequency.setValueAtTime(freq * preset.punch, this.ctx.currentTime);
           osc.frequency.exponentialRampToValueAtTime(freq, this.ctx.currentTime + attack + 0.1);
        } else if (preset.sweep && preset.sweep !== 1) {
           osc.frequency.exponentialRampToValueAtTime(Math.max(10, freq * preset.sweep), this.ctx.currentTime + totalDuration);
        }
        
        oscillators.push(osc);
      }

      // Upgrade 16: Sub-bass Harmonics Generation
      if (preset.category === 'Kick' && preset.oscType === 'sine') {
         const subOsc = this.ctx.createOscillator();
         subOsc.type = 'triangle';
         subOsc.frequency.setValueAtTime(baseFreq * 2, this.ctx.currentTime); // Octave up
         const subGain = this.ctx.createGain();
         applyEnvelope(subGain.gain, this.ctx.currentTime);
         subGain.gain.value *= 0.3; // Lower volume for harmonic
         subOsc.connect(subGain);
         subGain.connect(filter);
         oscillators.push(subOsc);
      }

      applyEnvelope(gain.gain, this.ctx.currentTime);
      
      oscillators.forEach(o => {
        o.start(this.ctx.currentTime);
        o.stop(this.ctx.currentTime + totalDuration);
      });
      
      oscillators[0].onended = () => {
        oscillators.forEach(o => o.disconnect());
        filter.disconnect();
        gain.disconnect();
        saturator.disconnect();
        globalFilter.disconnect();
        if (panner) panner.disconnect();
      };
      
    } else if (preset.type === 'fm') {
      // Upgrade 17: FM Synthesis Routing
      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      
      carrier.type = 'sine';
      modulator.type = 'sine';
      
      carrier.frequency.value = baseFreq;
      modulator.frequency.value = baseFreq * (preset.fmFreqRatio || 2);
      
      modGain.gain.value = baseFreq * (preset.fmModIndex || 2);
      
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(filter);
      
      applyEnvelope(gain.gain, this.ctx.currentTime);
      
      carrier.start(this.ctx.currentTime);
      modulator.start(this.ctx.currentTime);
      carrier.stop(this.ctx.currentTime + totalDuration);
      modulator.stop(this.ctx.currentTime + totalDuration);
      
      carrier.onended = () => {
        carrier.disconnect();
        modulator.disconnect();
        modGain.disconnect();
        filter.disconnect();
        gain.disconnect();
        saturator.disconnect();
        globalFilter.disconnect();
        if (panner) panner.disconnect();
      };

    } else if (preset.type === 'noise') {
      // Upgrade 18: Selectable Colored Noise
      let sourceBuffer = this.noiseBuffer;
      if (preset.noiseColor === 'pink' && this.pinkNoiseBuffer) sourceBuffer = this.pinkNoiseBuffer;
      if (preset.noiseColor === 'brown' && this.brownNoiseBuffer) sourceBuffer = this.brownNoiseBuffer;
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = sourceBuffer;
      
      filter.frequency.value = this.applyPitch((preset.filterFreq || 1000) * pitchMod);
      noise.connect(filter);
      
      applyEnvelope(gain.gain, this.ctx.currentTime);
      
      // Upgrade 19: 909 Analog Clap Synthesized (staggered noise bursts)
      if (soundId === '909-analog-clap') {
         // Create staggered amplitude envelops for the clap
         gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
         gain.gain.exponentialRampToValueAtTime(peakGain, this.ctx.currentTime + 0.01);
         gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
         gain.gain.exponentialRampToValueAtTime(peakGain * 0.8, this.ctx.currentTime + 0.03);
         gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
         gain.gain.exponentialRampToValueAtTime(peakGain * 0.6, this.ctx.currentTime + 0.05);
         gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      }
      
      noise.start(this.ctx.currentTime, 0, totalDuration);
      
      let snapOsc: OscillatorNode | null = null;
      let snapGain: GainNode | null = null;
      if (preset.category === 'Snare' && soundId !== '909-analog-clap') {
        snapOsc = this.ctx.createOscillator();
        snapGain = this.ctx.createGain();
        snapOsc.type = 'triangle';
        snapOsc.connect(snapGain);
        snapGain.connect(globalFilter);
        
        snapOsc.frequency.setValueAtTime(this.applyPitch(baseFreq), this.ctx.currentTime);
        snapGain.gain.setValueAtTime(peakGain * 0.6, this.ctx.currentTime);
        snapGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + attack + (decay * 0.5));
        
        snapOsc.start(this.ctx.currentTime);
        snapOsc.stop(this.ctx.currentTime + totalDuration);
      }
      
      noise.onended = () => {
        noise.disconnect();
        filter.disconnect();
        gain.disconnect();
        saturator.disconnect();
        globalFilter.disconnect();
        if (panner) panner.disconnect();
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
