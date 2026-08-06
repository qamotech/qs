import { useEffect, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';

export default function Oscilloscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const dataArray = new Uint8Array(1024);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.fillStyle = 'rgba(24, 24, 27, 0.2)'; // fade effect
      ctx.fillRect(0, 0, width, height);
      
      audioEngine.getAudioData(dataArray);

      ctx.beginPath();
      
      const sliceWidth = width * 1.0 / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0; // 0 to 2, 1 is center
        const y = v * height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.strokeStyle = '#22d3ee'; // cyan-400
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#22d3ee';
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl h-48 relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-cyan-500/10">
      <div className="flex items-center gap-2 z-10 mb-2 relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        <h3 className="font-semibold text-zinc-200 leading-none">OLED Oscilloscope</h3>
      </div>
      <div className="flex-1 w-full relative rounded-lg overflow-hidden border border-zinc-700/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
        <canvas 
          ref={canvasRef}
          width={300}
          height={120}
          className="w-full h-full object-cover bg-zinc-950"
        />
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen"
          style={{
            backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>
    </div>
  );
}
