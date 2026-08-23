import { useState, useRef, useEffect } from 'react';
import { Disc3 } from 'lucide-react';

export default function DjScratch() {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const discRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !discRef.current) return;
      
      const rect = discRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const degree = (angle * 180) / Math.PI;
      
      setRotation(degree);
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

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-inner flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-4 self-start">
          <Disc3 className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-zinc-200">DJ Scratch</h3>
      </div>
      <div 
        ref={discRef}
        onMouseDown={() => setIsDragging(true)}
        className="w-48 h-48 rounded-full border-4 border-zinc-800 bg-zinc-900 flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden group touch-none"
      >
          <div className="absolute inset-2 rounded-full border border-zinc-800/50 pointer-events-none" />
          <div className="absolute inset-4 rounded-full border border-zinc-800/50 pointer-events-none" />
          <div className="absolute inset-6 rounded-full border border-zinc-800/50 pointer-events-none" />
          
          <div 
            className="w-full h-full rounded-full flex items-center justify-center pointer-events-none"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
             <div className="w-12 h-12 bg-zinc-800 rounded-full border-2 border-zinc-700 flex items-center justify-center shadow-lg relative">
                <div className="w-3 h-3 bg-zinc-600 rounded-full absolute top-1" />
             </div>
          </div>
      </div>
    </div>
  );
}
