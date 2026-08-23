import { useState, useRef, useEffect } from 'react';

interface RotaryKnobProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  color?: string;
}

export default function RotaryKnob({ label, value, onChange, color = 'text-cyan-400' }: RotaryKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startY.current - e.clientY;
      const newValue = Math.max(0, Math.min(100, startValue.current + deltaY));
      onChange(newValue);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, onChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
  };

  // 270 degrees sweep (from -135 to 135)
  const rotation = -135 + (value / 100) * 270;

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-zinc-700 relative cursor-ns-resize shadow-inner flex items-center justify-center touch-none"
        onPointerDown={handlePointerDown}
      >
        <div 
          className="w-full h-full rounded-full absolute"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className={`w-1.5 h-3 bg-current ${color.replace('text-', 'bg-')} mx-auto mt-1 rounded-full`} />
        </div>
      </div>
      <span className="text-[10px] font-semibold text-zinc-400">{label}</span>
    </div>
  );
}
