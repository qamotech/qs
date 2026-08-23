import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import MusicGenerator from './MusicGenerator';
import SongSkeletonGenerator from './SongSkeletonGenerator';

export default function AiBeatbox({ onGenerate, onGenerateSkeleton }: { onGenerate: () => void, onGenerateSkeleton: (skeleton: { grid: boolean[][], sounds: string[] }) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBeat = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onGenerate();
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group transition-all duration-300 hover:shadow-cyan-900/20">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 animate-shimmer" />
      <div className="absolute inset-0 bg-cyan-950/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
          <h3 className="font-semibold text-zinc-100 leading-none">AI Pattern Generator</h3>
        </div>
      </div>

      <div className="flex flex-col gap-4 relative z-10">
        <p className="text-zinc-400 text-sm">
          Instantly generate a musical pattern based on current styles.
        </p>

        <button 
          onClick={generateBeat}
          disabled={isGenerating}
          className={`
            w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden
            ${isGenerating 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-cyan-400 hover:scale-[1.02]'}
          `}
        >
          {!isGenerating && (
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] bg-[length:200%_100%] animate-shimmer pointer-events-none" />
          )}
          <Wand2 className={`w-5 h-5 relative z-10 ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="relative z-10">{isGenerating ? 'Generating pattern...' : 'Generate Beat'}</span>
        </button>
        <MusicGenerator />
        <SongSkeletonGenerator onGenerate={onGenerateSkeleton} />
      </div>
    </div>
  );
}
