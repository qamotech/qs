export type SoundCategory = 'Kick' | 'Snare' | 'HiHat' | 'Perc' | 'Synth' | 'Strings' | 'Brass' | 'FX';

export interface SoundPreset {
  id: string;
  name: string;
  category: SoundCategory;
  type: 'osc' | 'noise' | 'fm' | 'buffer';
  oscType?: OscillatorType;
  baseFreq: number; // Hz
  note: number; // MIDI note
  decay: number;
  sweep?: number; // frequency multiplier for envelope
  fmFreqRatio?: number;
  fmModIndex?: number;
  filterType?: BiquadFilterType;
  filterFreq?: number;
  filterQ?: number;
  noiseColor?: 'white' | 'pink' | 'brown';
  attack?: number;
  sustain?: number;
  release?: number;
  punch?: number;
  unison?: number;
  detune?: number;
}

export const SOUND_LIBRARY: SoundPreset[] = [];

const addPreset = (preset: SoundPreset) => {
    SOUND_LIBRARY.push({ ...preset, id: preset.name.toLowerCase().replace(/\s/g, '-') });
};

export const getSoundPreset = (id: string) => SOUND_LIBRARY.find(s => s.id === id) || SOUND_LIBRARY[0];

const createSound = (name: string, category: SoundCategory, type: SoundPreset['type'], baseFreq: number, decay: number, note: number = 60, props: Partial<SoundPreset> = {}): SoundPreset => ({
    id: name.toLowerCase().replace(/\s/g, '-'),
    name,
    category,
    type,
    baseFreq,
    note,
    decay,
    ...props
});

// Kick
addPreset(createSound('Deep 808 Kick', 'Kick', 'osc', 50, 0.5, 36, { oscType: 'sine' }));
addPreset(createSound('808 Glide Bass', 'Kick', 'osc', 40, 1.2, 36, { oscType: 'triangle', punch: 2, attack: 0.05, sustain: 0.8, release: 0.5 }));
addPreset(createSound('Punchy Kick', 'Kick', 'osc', 60, 0.3, 36, { oscType: 'sine', sweep: 0.1, punch: 5 }));
addPreset(createSound('Hard Dist Kick', 'Kick', 'osc', 55, 0.4, 36, { oscType: 'sawtooth', filterType: 'lowpass', filterFreq: 400 }));
addPreset(createSound('Short Tight Kick', 'Kick', 'osc', 70, 0.2, 36, { oscType: 'sine' }));
addPreset(createSound('Boom Kick', 'Kick', 'osc', 40, 0.7, 36, { oscType: 'sine' }));
addPreset(createSound('Clicky Kick', 'Kick', 'osc', 80, 0.2, 36, { oscType: 'triangle', sweep: 0.5 }));
addPreset(createSound('Sub Kick', 'Kick', 'osc', 45, 0.6, 36, { oscType: 'sine' }));
addPreset(createSound('Garage Kick', 'Kick', 'osc', 55, 0.4, 36, { oscType: 'sine', sweep: 0.2 }));
addPreset(createSound('Soft Kick', 'Kick', 'osc', 65, 0.4, 36, { oscType: 'triangle' }));
addPreset(createSound('Techno Kick', 'Kick', 'osc', 50, 0.3, 36, { oscType: 'sawtooth', filterType: 'lowpass', filterFreq: 200 }));
addPreset(createSound('Thump Kick', 'Kick', 'osc', 48, 0.4, 36, { oscType: 'sine' }));
addPreset(createSound('Layered Kick', 'Kick', 'osc', 52, 0.5, 36, { oscType: 'sine', sweep: 0.1 }));

// Snare
addPreset(createSound('Classic Snare', 'Snare', 'noise', 200, 0.2, 38, { noiseColor: 'white', filterType: 'highpass', filterFreq: 1000 }));
addPreset(createSound('909 Analog Clap', 'Snare', 'noise', 0, 0.3, 38, { noiseColor: 'white', filterType: 'bandpass', filterFreq: 1500, attack: 0.01, release: 0.2 }));
addPreset(createSound('Tight Snare', 'Snare', 'noise', 250, 0.1, 38, { noiseColor: 'white', filterType: 'highpass', filterFreq: 1500 }));
addPreset(createSound('Deep Snare', 'Snare', 'noise', 150, 0.3, 38, { noiseColor: 'pink', filterType: 'highpass', filterFreq: 500 }));
addPreset(createSound('Rim Snare', 'Snare', 'osc', 400, 0.1, 38, { oscType: 'triangle' }));
addPreset(createSound('Clap Snare', 'Snare', 'noise', 300, 0.15, 38, { noiseColor: 'white', filterType: 'bandpass', filterFreq: 2000 }));
addPreset(createSound('LoFi Snare', 'Snare', 'noise', 180, 0.25, 38, { noiseColor: 'brown', filterType: 'highpass', filterFreq: 300 }));
addPreset(createSound('Pop Snare', 'Snare', 'noise', 220, 0.2, 38, { noiseColor: 'white', filterType: 'highpass', filterFreq: 800 }));
addPreset(createSound('Dry Snare', 'Snare', 'noise', 200, 0.1, 38, { noiseColor: 'white', filterType: 'highpass', filterFreq: 1200 }));
addPreset(createSound('Punchy Snare', 'Snare', 'noise', 210, 0.2, 38, { noiseColor: 'white', filterType: 'highpass', filterFreq: 900 }));
addPreset(createSound('Soft Snare', 'Snare', 'noise', 190, 0.25, 38, { noiseColor: 'pink', filterType: 'highpass', filterFreq: 700 }));
addPreset(createSound('Sharp Snare', 'Snare', 'noise', 240, 0.12, 38, { noiseColor: 'white', filterType: 'highpass', filterFreq: 1800 }));
addPreset(createSound('Heavy Snare', 'Snare', 'noise', 160, 0.35, 38, { noiseColor: 'brown', filterType: 'highpass', filterFreq: 400 }));

// HiHat
addPreset(createSound('Closed Hat', 'HiHat', 'noise', 0, 0.05, 42, { noiseColor: 'white', filterType: 'bandpass', filterFreq: 8000 }));
addPreset(createSound('Open Hat', 'HiHat', 'noise', 0, 0.3, 44, { noiseColor: 'white', filterType: 'bandpass', filterFreq: 7000 }));
addPreset(createSound('Bright Hat', 'HiHat', 'noise', 0, 0.04, 42, { noiseColor: 'white', filterType: 'highpass', filterFreq: 10000 }));
addPreset(createSound('Dark Hat', 'HiHat', 'noise', 0, 0.06, 42, { noiseColor: 'brown', filterType: 'bandpass', filterFreq: 5000 }));
addPreset(createSound('Tight Hat', 'HiHat', 'noise', 0, 0.03, 42, { noiseColor: 'white', filterType: 'highpass', filterFreq: 12000 }));
addPreset(createSound('Shaker Hat', 'HiHat', 'noise', 0, 0.08, 42, { noiseColor: 'pink', filterType: 'bandpass', filterFreq: 6000 }));
addPreset(createSound('Crisp Hat', 'HiHat', 'noise', 0, 0.05, 42, { noiseColor: 'white', filterType: 'bandpass', filterFreq: 9000 }));
addPreset(createSound('Long Hat', 'HiHat', 'noise', 0, 0.5, 44, { noiseColor: 'white', filterType: 'bandpass', filterFreq: 6000 }));
addPreset(createSound('Soft Hat', 'HiHat', 'noise', 0, 0.07, 42, { noiseColor: 'pink', filterType: 'bandpass', filterFreq: 4000 }));
addPreset(createSound('Metallic Hat', 'HiHat', 'noise', 0, 0.05, 42, { noiseColor: 'white', filterType: 'bandpass', filterFreq: 10000, filterQ: 10 }));
addPreset(createSound('Reverse Hat', 'HiHat', 'noise', 0, 0.2, 44, { noiseColor: 'white', filterType: 'bandpass', filterFreq: 5000 }));
addPreset(createSound('Clean Hat', 'HiHat', 'noise', 0, 0.05, 42, { noiseColor: 'white', filterType: 'bandpass', filterFreq: 8500 }));

// Perc
addPreset(createSound('Wood Block', 'Perc', 'osc', 800, 0.1, 72, { oscType: 'triangle' }));
addPreset(createSound('Cowbell', 'Perc', 'osc', 400, 0.15, 67, { oscType: 'square' }));
addPreset(createSound('Clave', 'Perc', 'osc', 1000, 0.05, 74, { oscType: 'triangle' }));
addPreset(createSound('Conga High', 'Perc', 'osc', 300, 0.2, 64, { oscType: 'sine' }));
addPreset(createSound('Conga Low', 'Perc', 'osc', 200, 0.25, 62, { oscType: 'sine' }));
addPreset(createSound('Tom High', 'Perc', 'osc', 250, 0.3, 60, { oscType: 'triangle' }));
addPreset(createSound('Tom Low', 'Perc', 'osc', 150, 0.4, 55, { oscType: 'triangle' }));
addPreset(createSound('Rim Shot', 'Perc', 'osc', 500, 0.1, 67, { oscType: 'sine' }));
addPreset(createSound('Maraca', 'Perc', 'noise', 0, 0.05, 70, { noiseColor: 'white', filterType: 'highpass', filterFreq: 8000 }));
addPreset(createSound('Shaker', 'Perc', 'noise', 0, 0.08, 70, { noiseColor: 'pink', filterType: 'bandpass', filterFreq: 5000 }));
addPreset(createSound('Triangle', 'Perc', 'osc', 2000, 0.4, 80, { oscType: 'sine' }));
addPreset(createSound('Guiro', 'Perc', 'osc', 600, 0.1, 72, { oscType: 'sawtooth' }));

// Synth
addPreset(createSound('Saw Lead', 'Synth', 'osc', 440, 0.5, 60, { oscType: 'sawtooth' }));
addPreset(createSound('Reese Bass', 'Synth', 'osc', 55, 0.8, 24, { oscType: 'sawtooth', unison: 3, detune: 15, filterType: 'lowpass', filterFreq: 600, filterQ: 2 }));
addPreset(createSound('FM Glass Bell', 'Synth', 'fm', 800, 0.8, 72, { fmFreqRatio: 3.5, fmModIndex: 5, attack: 0.01, release: 1.0 }));
addPreset(createSound('Square Bass', 'Synth', 'osc', 110, 0.6, 36, { oscType: 'square', filterType: 'lowpass', filterFreq: 800 }));
addPreset(createSound('Pluck Synth', 'Synth', 'osc', 330, 0.2, 60, { oscType: 'triangle', filterType: 'lowpass', filterFreq: 1000 }));
addPreset(createSound('Soft Pad', 'Synth', 'osc', 220, 1.0, 60, { oscType: 'sine', attack: 0.5 }));
addPreset(createSound('Acid Synth', 'Synth', 'osc', 300, 0.3, 48, { oscType: 'sawtooth', filterType: 'lowpass', filterFreq: 200, filterQ: 15 }));
addPreset(createSound('Bright Lead', 'Synth', 'osc', 880, 0.4, 72, { oscType: 'sawtooth', filterType: 'lowpass', filterFreq: 3000 }));
addPreset(createSound('Deep Bass', 'Synth', 'osc', 55, 0.8, 24, { oscType: 'square', filterType: 'lowpass', filterFreq: 400 }));
addPreset(createSound('Bell Synth', 'Synth', 'osc', 500, 0.5, 72, { oscType: 'sine', sweep: 0.1 }));
addPreset(createSound('Organ Synth', 'Synth', 'osc', 220, 0.4, 60, { oscType: 'triangle' }));
addPreset(createSound('Glitch Synth', 'Synth', 'osc', 400, 0.2, 60, { oscType: 'sawtooth', filterType: 'bandpass', filterFreq: 1500 }));
addPreset(createSound('Sub Bass', 'Synth', 'osc', 40, 0.8, 24, { oscType: 'sine' }));
addPreset(createSound('Wobble Synth', 'Synth', 'osc', 150, 0.5, 36, { oscType: 'sawtooth', filterType: 'lowpass', filterFreq: 300, sweep: 2 }));

// Strings
addPreset(createSound('Violin Legato', 'Strings', 'osc', 440, 1.0, 72, { oscType: 'sawtooth', attack: 0.2 }));
addPreset(createSound('Cello Deep', 'Strings', 'osc', 110, 1.5, 36, { oscType: 'sawtooth', attack: 0.3 }));
addPreset(createSound('Viola Solo', 'Strings', 'osc', 330, 1.2, 67, { oscType: 'sawtooth', attack: 0.25 }));
addPreset(createSound('Double Bass', 'Strings', 'osc', 80, 2.0, 24, { oscType: 'sawtooth', attack: 0.4 }));
addPreset(createSound('Strings Ensemble', 'Strings', 'osc', 220, 1.0, 60, { oscType: 'sawtooth', attack: 0.3 }));
addPreset(createSound('Pizzicato', 'Strings', 'osc', 440, 0.2, 72, { oscType: 'triangle', attack: 0.01 }));
addPreset(createSound('Violin High', 'Strings', 'osc', 880, 0.8, 84, { oscType: 'sawtooth', attack: 0.1 }));
addPreset(createSound('Cello Warm', 'Strings', 'osc', 130, 1.2, 40, { oscType: 'sawtooth', attack: 0.2 }));
addPreset(createSound('Staccato Strings', 'Strings', 'osc', 300, 0.1, 60, { oscType: 'sawtooth', attack: 0.01 }));
addPreset(createSound('Soft Strings', 'Strings', 'osc', 250, 1.5, 60, { oscType: 'sine', attack: 0.5 }));
addPreset(createSound('String Octaves', 'Strings', 'osc', 220, 1.0, 60, { oscType: 'sawtooth', attack: 0.2 }));
addPreset(createSound('Cinematic Strings', 'Strings', 'osc', 150, 2.0, 48, { oscType: 'sawtooth', attack: 0.5 }));

// Brass
addPreset(createSound('Trumpet Bright', 'Brass', 'osc', 220, 0.8, 60, { oscType: 'square', attack: 0.1 }));
addPreset(createSound('Tuba Low', 'Brass', 'osc', 55, 1.0, 24, { oscType: 'triangle', attack: 0.2 }));
addPreset(createSound('Trombone', 'Brass', 'osc', 110, 0.9, 48, { oscType: 'sawtooth', attack: 0.15 }));
addPreset(createSound('French Horn', 'Brass', 'osc', 165, 1.1, 55, { oscType: 'triangle', attack: 0.2 }));
addPreset(createSound('Saxophone', 'Brass', 'osc', 220, 0.7, 60, { oscType: 'sawtooth', attack: 0.1 }));
addPreset(createSound('Muted Trumpet', 'Brass', 'osc', 220, 0.5, 60, { oscType: 'square', attack: 0.1, filterType: 'lowpass', filterFreq: 1000 }));
addPreset(createSound('Brass Ensemble', 'Brass', 'osc', 150, 0.8, 48, { oscType: 'sawtooth', attack: 0.2 }));
addPreset(createSound('Tuba Deep', 'Brass', 'osc', 60, 1.2, 24, { oscType: 'triangle', attack: 0.3 }));
addPreset(createSound('Trumpet Solo', 'Brass', 'osc', 250, 0.6, 62, { oscType: 'sawtooth', attack: 0.1 }));
addPreset(createSound('Trombone Slide', 'Brass', 'osc', 100, 0.8, 45, { oscType: 'triangle', attack: 0.2 }));
addPreset(createSound('French Horn Warm', 'Brass', 'osc', 180, 1.0, 57, { oscType: 'sine', attack: 0.3 }));
addPreset(createSound('Saxophone Smooth', 'Brass', 'osc', 200, 0.9, 60, { oscType: 'sawtooth', attack: 0.2 }));

// FX
addPreset(createSound('White Noise Sweep', 'FX', 'noise', 0, 1.0, 60, { noiseColor: 'white', filterType: 'lowpass', filterFreq: 1000, sweep: 5 }));
addPreset(createSound('LoFi Vinyl Crackle', 'FX', 'noise', 0, 4.0, 60, { noiseColor: 'brown', filterType: 'highpass', filterFreq: 500, attack: 0.5, release: 1.0 }));
addPreset(createSound('Explosion', 'FX', 'noise', 50, 2.0, 36, { noiseColor: 'brown', filterType: 'lowpass', filterFreq: 200 }));
addPreset(createSound('SciFi Zap', 'FX', 'osc', 100, 0.2, 60, { oscType: 'square', sweep: 10 }));
addPreset(createSound('Wind', 'FX', 'noise', 100, 2.0, 60, { noiseColor: 'pink', filterType: 'bandpass', filterFreq: 400 }));
addPreset(createSound('Laser', 'FX', 'osc', 500, 0.1, 72, { oscType: 'sawtooth', sweep: 0.5 }));
addPreset(createSound('Glitch Noise', 'FX', 'noise', 0, 0.1, 60, { noiseColor: 'white', filterType: 'bandpass', filterFreq: 500 }));
addPreset(createSound('Drone', 'FX', 'osc', 100, 3.0, 36, { oscType: 'sawtooth', attack: 1.0 }));
addPreset(createSound('Bubbles', 'FX', 'osc', 200, 0.5, 60, { oscType: 'sine', filterType: 'bandpass', filterFreq: 300, filterQ: 5 }));
addPreset(createSound('Siren', 'FX', 'osc', 400, 1.0, 60, { oscType: 'sawtooth', sweep: 2 }));
addPreset(createSound('Thunder', 'FX', 'noise', 30, 2.5, 36, { noiseColor: 'brown', filterType: 'lowpass', filterFreq: 150 }));
addPreset(createSound('Ping', 'FX', 'osc', 1000, 0.2, 84, { oscType: 'sine' }));
addPreset(createSound('Alarm', 'FX', 'osc', 300, 0.5, 60, { oscType: 'square', sweep: 1 }));
