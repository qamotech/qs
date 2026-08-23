import { useState, useRef, useEffect } from 'react';
import { Settings2 } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';

export default function MasterPitchWheel() {
  const [pitch, setPitch] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startPitch = useRef(0);

  const applyPitch = (val: number) => {
    setPitch(val);
    // map 0..100 to -12..12 semitones
    const semitones = ((val - 50) / 50) * 12;
    audioEngine.setMasterPitch(semitones);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      // Spring back to center
      applyPitch(50);
    };
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startY.current - e.clientY;
      const newValue = Math.max(0, Math.min(100, startPitch.current + deltaY));
      applyPitch(newValue);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startPitch.current = pitch;
  };

  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:shadow-orange-500/10">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-5 h-5 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
        <h3 className="font-semibold text-zinc-200">Pitch Wheel</h3>
      </div>
      
      <div className="flex justify-center items-center h-32 relative">
        <div className="absolute left-[30%] h-full flex flex-col justify-between text-[10px] text-zinc-600 font-bold py-2 pointer-events-none">
          <span>+</span>
          <span>-</span>
        </div>
        
        <div 
          ref={wheelRef}
          onPointerDown={handlePointerDown}
          className="w-16 h-full bg-gradient-to-b from-zinc-800 via-zinc-600 to-zinc-800 border-x-4 border-y-2 border-zinc-900 rounded-lg relative cursor-ns-resize shadow-[inset_0_20px_20px_rgba(0,0,0,0.8),inset_0_-20px_20px_rgba(0,0,0,0.8),0_5px_15px_rgba(0,0,0,0.5)] overflow-hidden touch-none"
        >
          {/* Ridges */}
          <div className="absolute inset-0 flex flex-col justify-between py-1 px-2 pointer-events-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-full h-[1px] bg-black/80 shadow-[0_1px_0_rgba(255,255,255,0.1)] rounded-full" />
            ))}
          </div>

          {/* Indicator Glow (Simulated Center Track) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

          {/* Indicator Line */}
          <div 
            className="w-[120%] -left-[10%] h-[3px] bg-orange-500 absolute shadow-[0_0_15px_rgba(249,115,22,1)] pointer-events-none transition-all duration-75 rounded-full"
            style={{ bottom: `calc(${pitch}% - 1.5px)` }}
          />
        </div>
      </div>
    </div>
  );
}
