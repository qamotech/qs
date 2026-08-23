import { useState } from 'react';
import { Activity } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';

const PAD_SOUNDS = [
  { id: 'classic-kick', name: 'Bass' },
  { id: 'classic-snare', name: 'Snare' },
  { id: 'classic-hihat', name: 'Hat' },
  { id: 'classic-perc', name: 'Hit' },
  { id: 'lo-fi-kick', name: 'LoFi Bass' },
  { id: 'lo-fi-snare', name: 'LoFi Snare' },
  { id: 'trap-hihat', name: 'Trap Hat' },
  { id: '808-bass', name: '808' },
  { id: 'random-1', name: 'FX 1', isRandom: true },
  { id: 'random-2', name: 'FX 2', isRandom: true },
  { id: 'random-3', name: 'FX 3', isRandom: true },
  { id: 'random-4', name: 'FX 4', isRandom: true },
];

export default function PerformancePads() {
  const [activePad, setActivePad] = useState<number | null>(null);

  const triggerPad = (i: number) => {
    audioEngine.init();
    setActivePad(i);
    
    let soundId = PAD_SOUNDS[i].id;
    if (PAD_SOUNDS[i].isRandom) {
       const randomSounds = ['zap-kick', 'classic-hihat', 'chiff', 'bell', 'trap-hihat', 'square-bass'];
       soundId = randomSounds[Math.floor(Math.random() * randomSounds.length)];
    }
    audioEngine.playSound(20 + i, soundId);
  };

  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:shadow-purple-500/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          <h3 className="font-semibold text-zinc-200">Performance Pads</h3>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {PAD_SOUNDS.map((pad, i) => (
          <div 
            key={i} 
            onPointerDown={() => triggerPad(i)}
            onPointerUp={() => setActivePad(null)}
            onPointerLeave={() => setActivePad(null)}
            className={`
              aspect-square rounded-xl transition-all cursor-pointer relative overflow-hidden flex items-center justify-center
              ${activePad === i 
                ? 'bg-purple-500 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.6)] translate-y-1' 
                : 'bg-gradient-to-b from-zinc-700 to-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_6px_rgba(0,0,0,0.5)] border border-zinc-600/50 hover:brightness-110'}
            `} 
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            <span className={`text-[10px] font-bold text-center uppercase tracking-widest transition-all duration-75 ${activePad === i ? 'text-white scale-110 animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'text-white/50'}`}>
              {pad.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
