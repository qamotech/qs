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

  async playInitializationSfx() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (this.ctx.state !== 'running') return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const output = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.knee.value = 16;
    limiter.ratio.value = 10;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.18;
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(0.28, now + 0.015);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
    output.connect(limiter);
    limiter.connect(this.masterGain);

    const createNoise = (duration: number) => {
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index++) data[index] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      return source;
    };

    // Rising ionization: the charge before the bolt lands.
    const charge = ctx.createOscillator();
    const chargeGain = ctx.createGain();
    const chargeFilter = ctx.createBiquadFilter();
    charge.type = 'sawtooth';
    charge.frequency.setValueAtTime(110, now);
    charge.frequency.exponentialRampToValueAtTime(1850, now + 0.34);
    chargeFilter.type = 'bandpass';
    chargeFilter.frequency.setValueAtTime(380, now);
    chargeFilter.frequency.exponentialRampToValueAtTime(4100, now + 0.34);
    chargeFilter.Q.value = 3.5;
    chargeGain.gain.setValueAtTime(0.0001, now);
    chargeGain.gain.exponentialRampToValueAtTime(0.12, now + 0.12);
    chargeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.37);
    charge.connect(chargeFilter);
    chargeFilter.connect(chargeGain);
    chargeGain.connect(output);
    charge.start(now);
    charge.stop(now + 0.38);

    // Branching arc snaps surround the main strike with sharp, flickering detail.
    [0.19, 0.27, 0.35].forEach((start, index) => {
      const arc = ctx.createOscillator();
      const arcGain = ctx.createGain();
      arc.type = 'square';
      arc.frequency.setValueAtTime(1300 + index * 530, now + start);
      arc.frequency.exponentialRampToValueAtTime(240 + index * 80, now + start + 0.075);
      arcGain.gain.setValueAtTime(0.0001, now + start);
      arcGain.gain.exponentialRampToValueAtTime(0.14, now + start + 0.002);
      arcGain.gain.exponentialRampToValueAtTime(0.0001, now + start + 0.08);
      arc.connect(arcGain);
      arcGain.connect(output);
      arc.start(now + start);
      arc.stop(now + start + 0.09);
    });

    // Main bolt: bright, wide-band crack followed by a decaying high-voltage hiss.
    const bolt = createNoise(0.52);
    const boltFilter = ctx.createBiquadFilter();
    const boltGain = ctx.createGain();
    boltFilter.type = 'highpass';
    boltFilter.frequency.value = 950;
    boltGain.gain.setValueAtTime(0.0001, now + 0.36);
    boltGain.gain.exponentialRampToValueAtTime(0.92, now + 0.363);
    boltGain.gain.exponentialRampToValueAtTime(0.075, now + 0.46);
    boltGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.84);
    bolt.connect(boltFilter);
    boltFilter.connect(boltGain);
    boltGain.connect(output);
    bolt.start(now + 0.36);

    // A low, filtered thunder tail makes the lightning strike feel large rather than digital.
    const thunder = createNoise(0.78);
    const thunderFilter = ctx.createBiquadFilter();
    const thunderGain = ctx.createGain();
    thunderFilter.type = 'lowpass';
    thunderFilter.frequency.setValueAtTime(220, now + 0.4);
    thunderFilter.frequency.exponentialRampToValueAtTime(75, now + 1.1);
    thunderFilter.Q.value = 1.1;
    thunderGain.gain.setValueAtTime(0.0001, now + 0.39);
    thunderGain.gain.exponentialRampToValueAtTime(0.5, now + 0.43);
    thunderGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.14);
    thunder.connect(thunderFilter);
    thunderFilter.connect(thunderGain);
    thunderGain.connect(output);
    thunder.start(now + 0.39);

    // The final electric shimmer signals that the engine is online.
    [1046, 1568].forEach((frequency, index) => {
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      const start = 0.61 + index * 0.06;
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(frequency * 0.72, now + start);
      shimmer.frequency.exponentialRampToValueAtTime(frequency, now + start + 0.09);
      shimmerGain.gain.setValueAtTime(0.0001, now + start);
      shimmerGain.gain.exponentialRampToValueAtTime(0.11, now + start + 0.012);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.05);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(output);
      shimmer.start(now + start);
      shimmer.stop(now + 1.06);
    });
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
  private soundDesign = { attack: 10, decay: 45, sustain: 65, release: 35, waveform: 'preset' as OscillatorType | 'preset', unison: 1, detune: 0, filterEnv: 35, glide: 0, drive: 0, modulation: 'none' as 'none' | 'chorus' | 'phaser' | 'flanger', modulationDepth: 0, width: 0, pump: 0 };
  private importedSamples = new Map<string, AudioBuffer>();
  private trackMix: { eq: [number, number, number]; pan: number; width: number; bus: string }[] = [];
  private limiter = { ceiling: -0.1, release: 50 };
  private masterPeak = 0;

  setSynthParams(params: { cutoff: number; resonance: number; envMod: number; decay: number }) {
    this.synthParams = params;
  }

  setSoundDesign(settings: Partial<typeof this.soundDesign>) {
    this.soundDesign = { ...this.soundDesign, ...settings };
  }

  async importSample(name: string, file: File) {
    this.init();
    if (!this.ctx) throw new Error('Audio engine is unavailable');
    const buffer = await file.arrayBuffer();
    this.importedSamples.set(name, await this.ctx.decodeAudioData(buffer));
  }

  playImportedSample(name: string, velocity = 1) {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.importedSamples.get(name);
    if (!buffer) return;
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    gain.gain.value = Math.max(0.05, Math.min(1, velocity));
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();
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

  setTrackMix(mix: { eq: [number, number, number]; pan: number; width: number; bus: string }[]) {
    this.trackMix = mix;
  }

  setLimiter(ceiling: number, release: number) {
    this.limiter = { ceiling, release };
    if (this.masterGain && this.ctx) {
      const maxGain = Math.pow(10, ceiling / 20);
      this.masterGain.gain.setTargetAtTime(Math.min(this.masterGain.gain.value, maxGain), this.ctx.currentTime, Math.max(0.01, release / 1000));
    }
  }

  getMeter() {
    if (!this.analyser) return { level: 0, peak: this.masterPeak, clipping: false };
    const data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data as Uint8Array<ArrayBuffer>);
    const level = Math.max(...data.map(value => Math.abs(value - 128) / 128));
    this.masterPeak = Math.max(level, this.masterPeak * 0.96);
    return { level, peak: this.masterPeak, clipping: this.masterPeak > 0.98 };
  }

  private applyPitch(freq: number) {
    return freq * Math.pow(2, this.masterPitch / 12);
  }

  setSamplePack(_pack: string) {
    // this.activePack = pack;
  }

  private playIslandVoice(soundId: string, frequency: number, baseVol: number, output: AudioNode) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const connectOscillator = (type: OscillatorType, startFrequency: number, endFrequency: number, peak: number, release: number, destination = output) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(Math.max(10, startFrequency), now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(10, endFrequency), now + release);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + release);
      oscillator.connect(gain);
      gain.connect(destination);
      oscillator.start(now);
      oscillator.stop(now + release + 0.02);
    };
    const connectNoise = (filterType: BiquadFilterType, filterFrequency: number, peak: number, release: number) => {
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * release), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index++) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      source.buffer = buffer;
      filter.type = filterType;
      filter.frequency.value = filterFrequency;
      filter.Q.value = 0.9;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + release);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      source.start(now);
    };

    switch (soundId) {
      case 'island-kick':
        connectOscillator('sine', 155, 48, baseVol * 0.9, 0.48);
        connectOscillator('triangle', 120, 58, baseVol * 0.24, 0.22);
        connectNoise('lowpass', 1800, baseVol * 0.08, 0.035);
        return;
      case 'island-clap':
        [0, 0.028, 0.058].forEach((offset, index) => {
          const delayedOutput = ctx.createGain();
          delayedOutput.gain.value = 1 - index * 0.18;
          delayedOutput.connect(output);
          const originalNow = ctx.currentTime;
          const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.14), ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let sample = 0; sample < data.length; sample++) data[sample] = (Math.random() * 2 - 1) * (1 - sample / data.length);
          const source = ctx.createBufferSource();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();
          source.buffer = buffer;
          filter.type = 'bandpass';
          filter.frequency.value = 1500;
          filter.Q.value = 0.65;
          gain.gain.setValueAtTime(0.0001, originalNow + offset);
          gain.gain.exponentialRampToValueAtTime(baseVol * 0.26, originalNow + offset + 0.004);
          gain.gain.exponentialRampToValueAtTime(0.0001, originalNow + offset + 0.13);
          source.connect(filter);
          filter.connect(gain);
          gain.connect(delayedOutput);
          source.start(originalNow + offset);
        });
        return;
      case 'island-shaker':
        connectNoise('highpass', 5200, baseVol * 0.2, 0.095);
        return;
      case 'island-conga':
        connectOscillator('sine', frequency * 1.45, frequency * 0.82, baseVol * 0.52, 0.3);
        connectOscillator('triangle', frequency * 2.1, frequency * 1.15, baseVol * 0.18, 0.16);
        return;
      case 'island-sub':
        connectOscillator('sine', frequency * 1.08, frequency, baseVol * 0.72, 0.74);
        connectOscillator('triangle', frequency * 1.08, frequency, baseVol * 0.14, 0.44);
        return;
      case 'island-mallet':
        connectOscillator('sine', frequency * 2, frequency * 2, baseVol * 0.32, 0.32);
        connectOscillator('sine', frequency * 3.01, frequency * 3.01, baseVol * 0.16, 0.2);
        connectOscillator('triangle', frequency, frequency * 0.998, baseVol * 0.28, 0.5);
        return;
    }
  }

  playSound(trackIdx: number, soundId?: string, semitoneOffset = 0, velocity = 1) {
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

    let decay = preset.decay * decayMod * (0.4 + this.soundDesign.decay / 100);
    let baseFreq = this.applyPitch(preset.baseFreq * pitchMod) * Math.pow(2, semitoneOffset / 12);
    const attack = Math.max(0.002, (preset.attack || 0.005) + this.soundDesign.attack / 1000);

    const trackVol = this.trackVolumes[trackIdx] !== undefined ? this.trackVolumes[trackIdx] / 100 : 0.8;
    const limiterGain = Math.pow(10, this.limiter.ceiling / 20);
    const baseVol = Math.min(0.8 * trackVol * Math.max(0.05, Math.min(1, velocity)), limiterGain);

    const gain = this.ctx.createGain();
    const globalFilter = this.ctx.createBiquadFilter();
    const mix = this.trackMix[trackIdx];
    
    globalFilter.type = 'lowpass';
    globalFilter.frequency.value = globalCutoff;
    globalFilter.Q.value = globalQ;
    if (mix) {
      globalFilter.frequency.value *= 0.6 + (mix.eq[0] + mix.eq[1] + mix.eq[2]) / 300;
    }
    
    gain.connect(globalFilter);
    let output: AudioNode = globalFilter;
    if (this.soundDesign.drive > 0) {
      const shaper = this.ctx.createWaveShaper();
      const amount = this.soundDesign.drive * 8;
      const curve = new Float32Array(256);
      for (let i = 0; i < curve.length; i++) {
        const x = (i * 2) / (curve.length - 1) - 1;
        curve[i] = Math.tanh(x * (1 + amount));
      }
      shaper.curve = curve;
      globalFilter.connect(shaper);
      output = shaper;
    }
    if (this.soundDesign.modulation !== 'none' && this.soundDesign.modulationDepth > 0) {
      const delay = this.ctx.createDelay(0.05);
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      delay.delayTime.value = this.soundDesign.modulation === 'flanger' ? 0.003 : 0.012;
      lfo.frequency.value = this.soundDesign.modulation === 'phaser' ? 0.35 : 1.2;
      lfoGain.gain.value = this.soundDesign.modulationDepth / 4000;
      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);
      output.connect(delay);
      output = delay;
      lfo.start();
      lfo.stop(this.ctx.currentTime + attack + decay + this.soundDesign.release / 100 + 0.1);
    }
    if (this.ctx.createStereoPanner && this.soundDesign.width > 0) {
      const stereo = this.ctx.createStereoPanner();
      stereo.pan.value = Math.min(1, this.soundDesign.width / 100) * (trackIdx % 2 ? 1 : -1);
      output.connect(stereo);
      output = stereo;
    }
    if (this.ctx.createStereoPanner && mix) {
      const trackPan = this.ctx.createStereoPanner();
      trackPan.pan.value = Math.max(-1, Math.min(1, mix.pan / 100));
      output.connect(trackPan);
      output = trackPan;
    }
    if (this.soundDesign.pump > 0) {
      const pumpGain = this.ctx.createGain();
      const depth = this.soundDesign.pump / 100;
      pumpGain.gain.setValueAtTime(Math.max(0.08, 1 - depth), this.ctx.currentTime);
      pumpGain.gain.exponentialRampToValueAtTime(1, this.ctx.currentTime + 0.12);
      output.connect(pumpGain);
      output = pumpGain;
    }
    output.connect(this.masterGain);

    if (soundId.startsWith('island-')) {
      this.playIslandVoice(soundId, baseFreq, baseVol, gain);
      return;
    }

    if (preset.type === 'osc') {
      const voiceCount = Math.max(1, Math.min(4, this.soundDesign.unison));
      const oscillators: OscillatorNode[] = [];
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = preset.filterType || 'lowpass';
      filter.frequency.value = preset.filterFreq || 20000;
      filter.Q.value = preset.filterQ || 1;
      
      for (let voice = 0; voice < voiceCount; voice++) {
        const osc = this.ctx.createOscillator();
        osc.type = this.soundDesign.waveform === 'preset' ? (preset.oscType || 'sine') : this.soundDesign.waveform;
        osc.detune.value = (voice - (voiceCount - 1) / 2) * this.soundDesign.detune;
        osc.connect(filter);
        const frequency = baseFreq;
        osc.frequency.setValueAtTime(this.soundDesign.glide ? Math.max(10, frequency * 0.7) : frequency, this.ctx.currentTime);
        if (this.soundDesign.glide) osc.frequency.exponentialRampToValueAtTime(frequency, this.ctx.currentTime + this.soundDesign.glide / 100);
        if (preset.sweep && preset.sweep !== 1) osc.frequency.exponentialRampToValueAtTime(Math.max(10, frequency * preset.sweep), this.ctx.currentTime + decay);
        oscillators.push(osc);
      }
      filter.connect(gain);
      filter.frequency.setValueAtTime(Math.max(80, filter.frequency.value * (0.2 + this.soundDesign.filterEnv / 100)), this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(Math.max(80, preset.filterFreq || 20000), this.ctx.currentTime + attack + decay * 0.5);
      
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(baseVol, this.ctx.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, baseVol * (this.soundDesign.sustain / 100)), this.ctx.currentTime + attack + decay * 0.45);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + attack + decay + this.soundDesign.release / 100);
      const stopTime = this.ctx.currentTime + attack + decay + this.soundDesign.release / 100;
      oscillators.forEach(osc => { osc.start(this.ctx!.currentTime); osc.stop(stopTime); });
      
    } else if (preset.type === 'noise') {
      const bufferSize = this.ctx.sampleRate * Math.max(decay + attack, 0.5);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let brownSample = 0;
      let pinkRows = Array.from({ length: 7 }, () => 0);

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;

        if (preset.noiseColor === 'brown') {
          brownSample = (brownSample + 0.02 * white) / 1.02;
          data[i] = brownSample * 3.5;
        } else if (preset.noiseColor === 'pink') {
          const row = Math.floor(Math.random() * pinkRows.length);
          pinkRows[row] = white;
          data[i] = pinkRows.reduce((sum, value) => sum + value, 0) / pinkRows.length;
        } else {
          data[i] = white;
        }
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = preset.filterType || 'highpass';
        filter.frequency.value = this.applyPitch((preset.filterFreq || 1000) * pitchMod) * Math.pow(2, semitoneOffset / 12);
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
