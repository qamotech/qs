import { useRef } from 'react';
import { Target } from 'lucide-react';

export default function SpatialPanner({ position, onChange }: { position: { x: number, y: number }, onChange: (pos: { x: number, y: number }) => void }) {
  const padRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 || !padRef.current) return;
    
    const rect = padRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    onChange({ x, y });
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-inner">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-zinc-200">3D Spatial Panner</h3>
      </div>
      
      <div 
        ref={padRef}
        onPointerDown={handlePointerMove}
        onPointerMove={handlePointerMove}
        className="w-full aspect-square bg-zinc-900 border border-zinc-800 rounded-xl relative cursor-crosshair touch-none overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.1) 0%, transparent 70%)'
        }}
      >
        {/* Grid Lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-full h-[1px] bg-cyan-500" />
          <div className="h-full w-[1px] bg-cyan-500 absolute" />
          <div className="w-[70%] h-[70%] border border-cyan-500 rounded-full absolute" />
          <div className="w-[35%] h-[35%] border border-cyan-500 rounded-full absolute" />
        </div>
        
        {/* Panner Node */}
        <div 
          className="w-6 h-6 bg-cyan-400 rounded-full absolute -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(34,211,238,0.6)] flex items-center justify-center pointer-events-none transition-transform duration-75"
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
        >
          <div className="w-2 h-2 bg-zinc-900 rounded-full" />
        </div>
        
        {/* Values Overlay */}
        <div className="absolute bottom-2 right-3 text-[10px] text-cyan-500/50 font-mono pointer-events-none">
          L/R: {Math.round(position.x - 50)} F/B: {Math.round(50 - position.y)}
        </div>
      </div>
    </div>
  );
}
