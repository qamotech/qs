import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Maximize2 } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { SOUND_LIBRARY } from '../audio/SoundLibrary';

const PAD_SOUNDS = [
  { id: 'kick-1', name: 'Punch' },
  { id: 'snare-1', name: 'Crack' },
  { id: 'hat-1', name: 'Crisp' },
  { id: 'perc-1', name: 'Clave' },
  { id: 'kick-2', name: 'Boom' },
  { id: 'snare-2', name: 'Clap' },
  { id: 'hat-2', name: 'Open' },
  { id: 'synth-1', name: 'Bass' },
  { id: 'synth-2', name: 'Lead' },
  { id: 'synth-3', name: 'Pluck' },
  { id: 'synth-4', name: 'Pad' },
  { id: 'synth-5', name: 'Bell' },
];

export default function PerformancePads({ onMaximize }: { onMaximize?: () => void }) {
  const [activePad, setActivePad] = useState<number | null>(null);
  const [explosions, setExplosions] = useState<{ id: number, x: number, y: number }[]>([]);

  const triggerPad = (i: number, e: React.PointerEvent) => {
    audioEngine.init();
    setActivePad(i);
    
    // Create explosion effect
    const explosion = { id: Date.now(), x: e.clientX, y: e.clientY };
    setExplosions(prev => [...prev, explosion]);
    setTimeout(() => setExplosions(prev => prev.filter(exp => exp.id !== explosion.id)), 500);

    const soundId = PAD_SOUNDS[i].id;
    if (soundId !== 'empty') {
      audioEngine.playSound(20 + i, soundId);
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-700 rounded-2xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          <h3 className="font-semibold text-zinc-200 tracking-wider uppercase text-sm">Performance Pads</h3>
        </div>
        {onMaximize && (
          <button onClick={onMaximize} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {PAD_SOUNDS.map((pad, i) => (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            key={i} 
            onPointerDown={(e) => triggerPad(i, e)}
            onPointerUp={() => setActivePad(null)}
            onPointerLeave={() => setActivePad(null)}
            className={`
              aspect-square rounded-xl transition-all cursor-pointer relative overflow-hidden flex items-center justify-center border
              ${activePad === i 
                ? 'bg-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.8)] border-cyan-400' 
                : 'bg-zinc-900 border-zinc-700 hover:border-cyan-500/50 shadow-[0_4px_6px_rgba(0,0,0,0.4)]'}
            `} 
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <span className="text-[10px] font-bold text-zinc-300 text-center uppercase tracking-widest">{pad.name}</span>
          </motion.div>
        ))}
        {explosions.map(exp => (
          <div 
            key={exp.id} 
            className="fixed w-4 h-4 bg-cyan-500 rounded-full animate-ping pointer-events-none"
            style={{ left: exp.x - 8, top: exp.y - 8 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
