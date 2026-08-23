import { useState } from 'react';
import { Sliders } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAudioIntensity } from '../hooks/useAudioIntensity';

const FREQUENCIES = ['60', '250', '1K', '4K', '12K'];
const BAND_COLORS = [
  'from-blue-600 to-blue-400',
  'from-cyan-600 to-cyan-400',
  'from-emerald-600 to-emerald-400',
  'from-yellow-600 to-yellow-400',
  'from-red-600 to-red-400'
];

export default function MasterEq({ levels, onChange }: { levels: number[], onChange: (levels: number[]) => void }) {
  const intensity = useAudioIntensity();

  const handleDrag = (index: number, e: React.MouseEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>) => {
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    
    const updateLevel = (clientY: number) => {
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      const percentage = 100 - (y / rect.height) * 100;
      
      const next = [...levels];
      next[index] = percentage;
      onChange(next);
    };

    updateLevel(e.clientY);

    const handlePointerMove = (ev: PointerEvent) => {
      updateLevel(ev.clientY);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl flex-1 flex flex-col gap-4 transition-all duration-300 hover:shadow-cyan-500/10">
      <div className="flex items-center gap-2 mb-2">
        <Sliders className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
        <h3 className="font-semibold text-zinc-200">5-Band Master EQ</h3>
      </div>
      
      <div className="flex-1 flex justify-between px-4 pb-2">
        {FREQUENCIES.map((freq, i) => (
          <div key={freq} className="flex flex-col items-center gap-3">
            <div 
              className="w-4 h-32 bg-zinc-900 rounded-full relative cursor-ns-resize group border border-zinc-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              onPointerDown={(e) => handleDrag(i, e)}
              style={{ touchAction: 'none' }}
            >
              <motion.div 
                animate={{ 
                  boxShadow: `0 0 ${10 + intensity * 20}px ${intensity * 5}px rgba(34, 211, 238, ${intensity * 0.5})` 
                }}
                className={`absolute bottom-0 w-full bg-gradient-to-t ${BAND_COLORS[i]} rounded-full pointer-events-none transition-all duration-75`}
                style={{ height: `${levels[i]}%` }}
              />
              <div 
                className="w-6 h-6 bg-zinc-200 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.8)] absolute left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform pointer-events-none border border-zinc-400"
                style={{ bottom: `calc(${levels[i]}% - 12px)` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-bold">{freq}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
