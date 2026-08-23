export type SoundCategory = 'Kick' | 'Snare' | 'HiHat' | 'Perc' | 'Tom' | 'Clap' | 'Cymbal' | 'FX' | 'Synth';

export interface SoundPreset {
  id: string;
  name: string;
  category: SoundCategory;
  type: 'osc' | 'noise' | 'fm' | 'buffer';
  oscType?: OscillatorType;
  baseFreq: number;
  decay: number;
  sweep?: number; // frequency multiplier for envelope
  fmFreqRatio?: number;
  fmModIndex?: number;
  filterType?: BiquadFilterType;
  filterFreq?: number;
  filterQ?: number;
  noiseColor?: 'white' | 'pink' | 'brown';
  attack?: number;
}

export const SOUND_LIBRARY: SoundPreset[] = [];

// Generate 80 instruments
const addKick = (name: string, freq: number, decay: number, sweep: number, osc: OscillatorType = 'sine') => {
  SOUND_LIBRARY.push({ id: name.toLowerCase().replace(/\s/g, '-'), name, category: 'Kick', type: 'osc', oscType: osc, baseFreq: freq, decay, sweep, attack: 0.005 });
};
const addSnare = (name: string, freq: number, decay: number, filterFreq: number) => {
  SOUND_LIBRARY.push({ id: name.toLowerCase().replace(/\s/g, '-'), name, category: 'Snare', type: 'noise', noiseColor: 'white', baseFreq: freq, decay, filterType: 'highpass', filterFreq, filterQ: 1, attack: 0.005 });
};
const addHiHat = (name: string, decay: number, filterFreq: number) => {
  SOUND_LIBRARY.push({ id: name.toLowerCase().replace(/\s/g, '-'), name, category: 'HiHat', type: 'noise', noiseColor: 'white', baseFreq: 0, decay, filterType: 'bandpass', filterFreq, filterQ: 5, attack: 0.005 });
};
const addPerc = (name: string, freq: number, decay: number, osc: OscillatorType = 'triangle', sweep: number = 1) => {
  SOUND_LIBRARY.push({ id: name.toLowerCase().replace(/\s/g, '-'), name, category: 'Perc', type: 'osc', oscType: osc, baseFreq: freq, decay, sweep, attack: 0.005 });
};
const addSynth = (name: string, freq: number, decay: number, osc: OscillatorType = 'sawtooth', filterFreq: number = 2000) => {
  SOUND_LIBRARY.push({ id: name.toLowerCase().replace(/\s/g, '-'), name, category: 'Synth', type: 'osc', oscType: osc, baseFreq: freq, decay, sweep: 1, filterType: 'lowpass', filterFreq, filterQ: 5, attack: 0.05 });
};
// Kicks (80)
addKick('Classic Kick', 150, 0.5, 0.01);
addKick('Deep Kick', 100, 0.8, 0.01);
addKick('Punchy Kick', 200, 0.4, 0.05);
addKick('Thump Kick', 120, 0.6, 0.02);
addKick('Sub Kick', 80, 1.0, 0.01, 'triangle');
addKick('Hard Kick', 160, 0.5, 0.01, 'square');
addKick('Zap Kick', 300, 0.3, 0.01, 'sine');
addKick('Lo-Fi Kick', 130, 0.4, 0.05, 'triangle');
addKick('Acoustic Kick', 110, 0.5, 0.03);
addKick('Tight Kick', 180, 0.3, 0.02);
addKick('Boom Kick', 90, 1.2, 0.01);
addKick('Click Kick', 250, 0.4, 0.01);
addKick('Grit Kick', 140, 0.6, 0.01, 'sawtooth');
addKick('Hollow Kick', 120, 0.5, 0.02, 'triangle');
addKick('Round Kick', 140, 0.6, 0.01, 'sine');
addKick('Massive Kick', 70, 1.5, 0.01, 'sine');

// Snares (16)
addSnare('Classic Snare', 250, 0.3, 1000);
addSnare('Crisp Snare', 300, 0.2, 2000);
addSnare('Fat Snare', 200, 0.4, 800);
addSnare('Tight Snare', 400, 0.15, 3000);
addSnare('Lo-Fi Snare', 150, 0.3, 500);
addSnare('Splash Snare', 250, 0.5, 1200);
addSnare('Piccolo Snare', 500, 0.2, 4000);
addSnare('Deep Snare', 180, 0.4, 600);
addSnare('Acoustic Snare', 280, 0.35, 1500);
addSnare('Electronic Snare', 350, 0.25, 2500);
addSnare('Clap Snare', 200, 0.3, 1000); // will just use noise for now
addSnare('Dry Snare', 300, 0.1, 2000);
addSnare('Room Snare', 250, 0.6, 800);
addSnare('Trash Snare', 150, 0.4, 400);
addSnare('Buzz Snare', 220, 0.3, 1800);
addSnare('Snap Snare', 400, 0.1, 3500);

// HiHats (16)
addHiHat('Classic HiHat', 0.1, 10000);
addHiHat('Open HiHat', 0.5, 10000);
addHiHat('Tight HiHat', 0.05, 12000);
addHiHat('Lo-Fi HiHat', 0.2, 5000);
addHiHat('Sizzle HiHat', 0.3, 8000);
addHiHat('Trap HiHat', 0.08, 15000);
addHiHat('Choke HiHat', 0.03, 10000);
addHiHat('Acoustic HiHat', 0.15, 9000);
addHiHat('Splash HiHat', 0.4, 7000);
addHiHat('Crisp HiHat', 0.12, 11000);
addHiHat('Dark HiHat', 0.2, 4000);
addHiHat('Metallic HiHat', 0.25, 6000);
addHiHat('Soft HiHat', 0.1, 8000);
addHiHat('Sharp HiHat', 0.06, 13000);
addHiHat('Long HiHat', 0.8, 10000);
addHiHat('Fuzz HiHat', 0.15, 4500);

// Percussion (20)
addPerc('Woodblock', 800, 0.1, 'square', 1);
addPerc('Cowbell', 600, 0.3, 'square', 1);
addPerc('Clave', 2500, 0.05, 'sine', 1);
addPerc('Bongo High', 600, 0.2, 'sine', 0.8);
addPerc('Bongo Low', 300, 0.3, 'sine', 0.8);
addPerc('Conga High', 400, 0.3, 'sine', 0.9);
addPerc('Conga Low', 200, 0.4, 'sine', 0.9);
addPerc('Tom High', 300, 0.4, 'triangle', 0.5);
addPerc('Tom Mid', 200, 0.5, 'triangle', 0.5);
addPerc('Tom Low', 100, 0.6, 'triangle', 0.5);
addPerc('Zap', 1500, 0.1, 'sawtooth', 0.01);
addPerc('Laser', 2000, 0.2, 'sine', 0.05);
addPerc('Shaker', 8000, 0.1, 'square', 1); // Mock shaker
addPerc('Tambourine', 7000, 0.2, 'square', 1); // Mock tamb
addPerc('Agogo High', 1200, 0.3, 'triangle', 1);
addPerc('Agogo Low', 800, 0.3, 'triangle', 1);
addPerc('Triangle', 3000, 0.8, 'sine', 1);
addPerc('Vibraslap', 400, 0.5, 'sawtooth', 0.8);
addPerc('Guiro', 1500, 0.2, 'square', 1);
addPerc('Cuica', 350, 0.4, 'sine', 2.0); // pitch sweeps up

// Synths (12)
addSynth('Saw Bass', 55, 0.6, 'sawtooth', 800);
addSynth('Square Bass', 55, 0.6, 'square', 600);
addSynth('Sub Bass', 40, 1.0, 'sine', 200);
addSynth('Pluck', 440, 0.3, 'triangle', 1500);
addSynth('Saw Lead', 880, 0.5, 'sawtooth', 3000);
addSynth('Square Lead', 880, 0.5, 'square', 2500);
addSynth('Sine Lead', 880, 0.6, 'sine', 4000);
addSynth('Brass', 220, 0.7, 'sawtooth', 1200);
addSynth('Pad', 440, 2.0, 'sine', 800);
addSynth('Bell', 1760, 1.5, 'triangle', 4000);
addSynth('Chiff', 1100, 0.4, 'square', 2000);
addSynth('Acid', 110, 0.5, 'sawtooth', 3000);

export const getSoundPreset = (id: string) => SOUND_LIBRARY.find(s => s.id === id) || SOUND_LIBRARY[0];
