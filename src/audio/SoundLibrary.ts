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

const toSoundId = (name: string) => name.toLowerCase().replace(/\s/g, '-');

const addKick = (name: string, freq: number, decay: number, sweep: number, osc: OscillatorType = 'sine') => {
  SOUND_LIBRARY.push({ id: toSoundId(name), name, category: 'Kick', type: 'osc', oscType: osc, baseFreq: freq, decay, sweep, attack: 0.005 });
};
const addSnare = (name: string, freq: number, decay: number, filterFreq: number) => {
  SOUND_LIBRARY.push({ id: toSoundId(name), name, category: 'Snare', type: 'noise', noiseColor: 'white', baseFreq: freq, decay, filterType: 'highpass', filterFreq, filterQ: 1, attack: 0.005 });
};
const addHiHat = (name: string, decay: number, filterFreq: number) => {
  SOUND_LIBRARY.push({ id: toSoundId(name), name, category: 'HiHat', type: 'noise', noiseColor: 'white', baseFreq: 0, decay, filterType: 'bandpass', filterFreq, filterQ: 5, attack: 0.005 });
};
const addPerc = (name: string, freq: number, decay: number, osc: OscillatorType = 'triangle', sweep: number = 1) => {
  SOUND_LIBRARY.push({ id: toSoundId(name), name, category: 'Perc', type: 'osc', oscType: osc, baseFreq: freq, decay, sweep, attack: 0.005 });
};
const addSynth = (name: string, freq: number, decay: number, osc: OscillatorType = 'sawtooth', filterFreq: number = 2000) => {
  SOUND_LIBRARY.push({ id: toSoundId(name), name, category: 'Synth', type: 'osc', oscType: osc, baseFreq: freq, decay, sweep: 1, filterType: 'lowpass', filterFreq, filterQ: 5, attack: 0.05 });
};
const addClap = (name: string, decay: number, filterFreq: number) => {
  SOUND_LIBRARY.push({ id: toSoundId(name), name, category: 'Clap', type: 'noise', noiseColor: 'white', baseFreq: 220, decay, filterType: 'bandpass', filterFreq, filterQ: 1.5, attack: 0.005 });
};
const addTom = (name: string, freq: number, decay: number, sweep: number = 0.55) => {
  SOUND_LIBRARY.push({ id: toSoundId(name), name, category: 'Tom', type: 'osc', oscType: 'triangle', baseFreq: freq, decay, sweep, attack: 0.005 });
};
const addCymbal = (name: string, decay: number, filterFreq: number) => {
  SOUND_LIBRARY.push({ id: toSoundId(name), name, category: 'Cymbal', type: 'noise', noiseColor: 'white', baseFreq: 0, decay, filterType: 'highpass', filterFreq, filterQ: 2, attack: 0.005 });
};
const addFx = (name: string, freq: number, decay: number, sweep: number, osc: OscillatorType = 'sine') => {
  SOUND_LIBRARY.push({ id: toSoundId(name), name, category: 'FX', type: 'osc', oscType: osc, baseFreq: freq, decay, sweep, attack: 0.01 });
};
const addNoiseFx = (name: string, decay: number, filterType: BiquadFilterType, filterFreq: number, noiseColor: NonNullable<SoundPreset['noiseColor']>) => {
  SOUND_LIBRARY.push({ id: toSoundId(name), name, category: 'FX', type: 'noise', noiseColor, baseFreq: 0, decay, filterType, filterFreq, filterQ: 1.2, attack: 0.01 });
};

// Kicks (24)
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
addKick('808 Bass', 55, 1.3, 0.35, 'sine');
addKick('808 Glide', 65, 1.1, 0.18, 'sine');
addKick('Vinyl Kick', 105, 0.7, 0.04, 'triangle');
addKick('Warehouse Kick', 95, 0.9, 0.025, 'sawtooth');
addKick('Rumble Kick', 75, 1.4, 0.015, 'sine');
addKick('Digital Kick', 210, 0.28, 0.03, 'square');
addKick('Boom Bap Kick', 115, 0.75, 0.02, 'triangle');
addKick('Neon Kick', 185, 0.36, 0.025, 'square');
addKick('Tape Kick', 98, 0.82, 0.018, 'triangle');
addKick('Festival Kick', 88, 1.05, 0.012, 'sawtooth');
addKick('Minimal Kick', 145, 0.32, 0.04, 'sine');
addKick('Concrete Kick', 125, 0.66, 0.015, 'square');
addKick('Thunder Kick', 62, 1.7, 0.01, 'sine');

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
addSnare('Brush Snare', 180, 0.45, 700);
addSnare('Crack Snare', 420, 0.18, 4200);
addSnare('Neon Snare', 320, 0.25, 2800);
addSnare('Dusty Snare', 170, 0.5, 650);
addSnare('Arena Snare', 260, 0.65, 1200);
addSnare('Rim Snare', 520, 0.09, 5000);
addSnare('Trap Snap', 380, 0.12, 3800);
addSnare('Tape Snare', 210, 0.42, 900);
addSnare('Concrete Snare', 290, 0.3, 1900);
addSnare('Glass Snare', 470, 0.14, 5200);
addSnare('Boom Bap Snare', 195, 0.48, 850);
addSnare('Electro Crack', 410, 0.2, 4600);
addSnare('Ghost Snare', 155, 0.22, 750);

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
addHiHat('808 Closed Hat', 0.055, 14500);
addHiHat('808 Open Hat', 0.65, 10500);
addHiHat('Dust Hat', 0.18, 3500);
addHiHat('Needle Hat', 0.035, 16000);
addHiHat('Vinyl Hat', 0.22, 5500);
addHiHat('Air Hat', 0.35, 9000);
addHiHat('Crunch Hat', 0.09, 6500);
addHiHat('Micro Hat', 0.025, 17000);
addHiHat('House Hat', 0.11, 11200);
addHiHat('Tech Hat', 0.07, 13800);
addHiHat('Dusty Open Hat', 0.72, 4200);
addHiHat('Silk Hat', 0.16, 7800);
addHiHat('Noise Hat', 0.28, 3100);

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
addPerc('Classic Perc', 700, 0.18, 'triangle', 0.7);
addPerc('Rim Click', 1800, 0.06, 'square', 0.8);
addPerc('Block Low', 420, 0.16, 'triangle', 0.85);
addPerc('Block High', 1300, 0.1, 'triangle', 0.9);
addPerc('Metal Hit', 2400, 0.35, 'square', 0.65);
addPerc('Clave Double', 2100, 0.08, 'sine', 0.95);
addPerc('Cabasa', 6200, 0.16, 'square', 0.9);
addPerc('Maraca', 4800, 0.12, 'triangle', 0.95);
addPerc('Finger Snap', 1900, 0.07, 'square', 0.75);
addPerc('Click Stick', 3200, 0.05, 'sine', 0.8);
addPerc('Bongo Pop', 520, 0.22, 'triangle', 0.62);
addPerc('Conga Slap', 760, 0.18, 'triangle', 0.5);
addPerc('Tabla', 290, 0.4, 'sine', 0.72);
addPerc('Cowbell Low', 430, 0.34, 'square', 0.98);

// Claps (8)
addClap('Classic Clap', 0.22, 1800);
addClap('Wide Clap', 0.48, 1500);
addClap('Tight Clap', 0.12, 2600);
addClap('Dust Clap', 0.3, 900);
addClap('Stadium Clap', 0.7, 1200);
addClap('Digital Clap', 0.16, 3200);
addClap('Trap Clap', 0.2, 2200);
addClap('Vinyl Clap', 0.38, 800);
addClap('Soul Clap', 0.34, 1100);
addClap('House Clap', 0.26, 2000);
addClap('Hand Clap', 0.18, 1600);
addClap('Layered Clap', 0.55, 1750);
addClap('Club Clap', 0.42, 2400);
addClap('Soft Clap', 0.28, 650);
addClap('Bright Clap', 0.15, 4000);
addClap('Lo-Fi Clap', 0.44, 720);

// Toms (8)
addTom('Floor Tom', 85, 0.8, 0.48);
addTom('Deep Tom', 110, 0.7, 0.42);
addTom('Rack Tom', 180, 0.48, 0.55);
addTom('High Tom', 280, 0.32, 0.62);
addTom('Tribal Tom', 145, 0.65, 0.5);
addTom('Electro Tom', 240, 0.38, 0.25);
addTom('Laser Tom', 360, 0.28, 0.08);
addTom('Muted Tom', 160, 0.2, 0.7);
addTom('Sub Tom', 62, 1.1, 0.35);
addTom('Arena Tom', 125, 1.0, 0.45);
addTom('Conga Tom', 205, 0.4, 0.65);
addTom('Wood Tom', 250, 0.26, 0.7);
addTom('Synth Tom', 310, 0.32, 0.15);
addTom('Tuned Tom C', 131, 0.55, 0.58);
addTom('Tuned Tom G', 196, 0.45, 0.58);
addTom('Tuned Tom D', 294, 0.35, 0.58);

// Cymbals (8)
addCymbal('Crash Cymbal', 1.6, 5500);
addCymbal('Ride Cymbal', 1.1, 4800);
addCymbal('Splash Cymbal', 0.65, 7000);
addCymbal('China Cymbal', 1.3, 3800);
addCymbal('Dark Crash', 1.8, 2800);
addCymbal('Bright Crash', 1.25, 8500);
addCymbal('Reverse Crash', 1.4, 4500);
addCymbal('Noise Wash', 2.2, 2400);
addCymbal('Open Ride', 1.7, 6200);
addCymbal('Tight Ride', 0.72, 7000);
addCymbal('Bell Ride', 0.55, 9000);
addCymbal('Trash Crash', 1.05, 3200);
addCymbal('Air Crash', 2.4, 9600);
addCymbal('Short Splash', 0.35, 10500);
addCymbal('Industrial Crash', 1.5, 2600);
addCymbal('Shimmer Wash', 2.8, 7600);

// Effects (10)
addFx('Laser Rise', 180, 0.7, 8, 'sine');
addFx('Laser Drop', 1800, 0.7, 0.06, 'sine');
addFx('Sci-Fi Sweep', 320, 1.2, 5, 'triangle');
addFx('Game Blip', 880, 0.14, 1.5, 'square');
addFx('Alarm', 520, 0.5, 1.8, 'square');
addFx('Impact Tone', 160, 0.9, 0.04, 'sawtooth');
addFx('Glitch Tone', 1200, 0.18, 0.3, 'square');
addFx('Space Ping', 1480, 1.1, 0.8, 'sine');
addFx('Riser', 90, 1.5, 12, 'sawtooth');
addFx('Fall', 2200, 1.4, 0.03, 'triangle');
addFx('Siren Rise', 260, 1.8, 6, 'square');
addFx('Siren Fall', 1600, 1.8, 0.08, 'square');
addFx('Arcade Coin', 988, 0.32, 1.5, 'square');
addFx('Signal Ping', 1760, 0.75, 1.12, 'sine');
addFx('Robot Chirp', 680, 0.24, 2.6, 'square');
addFx('Deep Drop', 520, 1.25, 0.02, 'sine');
addFx('Tension Rise', 130, 2.4, 16, 'triangle');
addFx('Digital Fall', 2800, 0.9, 0.1, 'square');
addNoiseFx('White Noise Rise', 1.8, 'highpass', 3600, 'white');
addNoiseFx('Pink Noise Wash', 2.6, 'lowpass', 4200, 'pink');
addNoiseFx('Brown Noise Drop', 1.5, 'lowpass', 850, 'brown');
addNoiseFx('Vinyl Dust', 0.5, 'bandpass', 1700, 'pink');
addNoiseFx('Radio Static', 0.7, 'bandpass', 2600, 'white');
addNoiseFx('Wind Down', 2.1, 'lowpass', 1800, 'brown');
addNoiseFx('Noise Impact', 0.32, 'highpass', 1200, 'white');
addNoiseFx('Atmosphere', 3.4, 'lowpass', 1100, 'pink');

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
addSynth('Moog Bass', 49, 0.9, 'sawtooth', 550);
addSynth('Reese Bass', 65, 1.1, 'sawtooth', 700);
addSynth('FM Pluck', 523, 0.24, 'sine', 2200);
addSynth('Glass Pluck', 784, 0.55, 'triangle', 5000);
addSynth('Warm Pad', 330, 2.8, 'sine', 650);
addSynth('Drone Pad', 110, 3.5, 'triangle', 450);
addSynth('Pulse Lead', 660, 0.48, 'square', 3200);
addSynth('Retro Lead', 494, 0.65, 'square', 2400);
addSynth('Organ', 262, 1.4, 'sine', 1800);
addSynth('String Synth', 392, 2.2, 'sawtooth', 1100);
addSynth('Vox Synth', 440, 1.7, 'triangle', 1400);
addSynth('Chiptune Lead', 1047, 0.22, 'square', 6500);
addSynth('808 Sub', 32.7, 1.6, 'sine', 150);
addSynth('Rubber Bass', 73.4, 0.42, 'square', 900);
addSynth('Dirty Bass', 58.3, 0.8, 'sawtooth', 420);
addSynth('Deep House Bass', 49, 0.95, 'sine', 380);
addSynth('Future Bass', 98, 1.25, 'sawtooth', 1250);
addSynth('Dub Bass', 43.7, 1.5, 'triangle', 320);
addSynth('Soft Keys', 523, 0.95, 'sine', 1700);
addSynth('Electric Keys', 659, 0.72, 'triangle', 2600);
addSynth('Dream Pluck', 698, 0.62, 'sine', 3400);
addSynth('Nylon Pluck', 392, 0.48, 'triangle', 1900);
addSynth('Wide Pad', 294, 3.2, 'sawtooth', 780);
addSynth('Ice Pad', 587, 2.6, 'sine', 2800);
addSynth('Dark Pad', 147, 3.8, 'triangle', 340);
addSynth('Analog Lead', 740, 0.58, 'sawtooth', 3600);
addSynth('Rave Lead', 988, 0.38, 'square', 4600);
addSynth('Flute Lead', 523, 0.82, 'sine', 3000);
addSynth('Detroit Bass', 46.2, 1.15, 'sawtooth', 500);
addSynth('Neuro Bass', 82.4, 0.7, 'square', 780);
addSynth('Plasma Bass', 55, 1.3, 'triangle', 620);
addSynth('Velvet Keys', 440, 1.2, 'sine', 1300);
addSynth('Harpsichord', 784, 0.38, 'square', 2800);
addSynth('Ambient Bell', 1175, 2.8, 'sine', 5200);
addSynth('Solar Pad', 220, 4.2, 'sawtooth', 620);
addSynth('Mono Lead', 880, 0.46, 'sawtooth', 4300);

export const getSoundPreset = (id: string) => SOUND_LIBRARY.find(s => s.id === id) || SOUND_LIBRARY[0];
