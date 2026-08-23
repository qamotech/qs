import { Waves } from 'lucide-react';
import RotaryKnob from './RotaryKnob';

interface SynthParams {
  cutoff: number;
  resonance: number;
  envMod: number;
  decay: number;
}

export default function SynthTweaker({ params, onChange }: { params: SynthParams, onChange: (key: keyof SynthParams, val: number) => void }) {
  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:shadow-fuchsia-500/10 mt-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/50 to-fuchsia-500/0" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]" />
          <h3 className="font-semibold text-zinc-200 leading-none">Synth Tweaker</h3>
        </div>
        <div className="flex gap-1">
          {/* Mock VU Meter horizontally */}
          {Array.from({ length: 12 }).map((_, i) => (
             <div 
               key={i} 
               className={`w-1.5 h-4 rounded-sm shadow-[0_0_5px_currentColor] ${i < 8 ? 'bg-emerald-500 text-emerald-500' : i < 10 ? 'bg-amber-400 text-amber-400' : 'bg-red-500 text-red-500'} ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-20'} transition-opacity duration-75`} 
             />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center px-2">
        <RotaryKnob label="CUTOFF" value={params.cutoff} onChange={(v) => onChange('cutoff', v)} color="bg-fuchsia-400" />
        <RotaryKnob label="RESONANCE" value={params.resonance} onChange={(v) => onChange('resonance', v)} color="bg-fuchsia-400" />
        <RotaryKnob label="ENV MOD" value={params.envMod} onChange={(v) => onChange('envMod', v)} color="bg-fuchsia-400" />
        <RotaryKnob label="DECAY" value={params.decay} onChange={(v) => onChange('decay', v)} color="bg-fuchsia-400" />
      </div>
    </div>
  );
}
