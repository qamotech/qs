import { useState } from 'react';
import { Sparkles, Dices, Music, Wand2 } from 'lucide-react';

export default function RiffGenerator({ onGenerate }: { onGenerate?: () => void }) {
  const [generating, setGenerating] = useState(false);

  const generateRiff = () => {
    setGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setGenerating(false);
      if (onGenerate) onGenerate();
    }, 1000);
  };

  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:shadow-cyan-500/10 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
          <h3 className="font-semibold text-zinc-200">AI Riff Generator</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">Beta</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 relative z-10 py-6">
        <div className={`w-20 h-20 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900/50 transition-all duration-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] ${generating ? 'shadow-[0_0_30px_rgba(6,182,212,0.3)] border-cyan-500/50 scale-110' : ''}`}>
          <Music className={`w-8 h-8 ${generating ? 'text-cyan-400 animate-bounce' : 'text-zinc-600'}`} />
          {generating && (
             <svg className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="48" fill="none" stroke="url(#cyan-grad)" strokeWidth="2" strokeDasharray="60 40" strokeLinecap="round" />
               <defs>
                 <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                   <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                 </linearGradient>
               </defs>
             </svg>
          )}
        </div>
        <div className="text-center">
          <p className="text-zinc-400 text-sm font-medium">Generate rhythmic patterns</p>
          <p className="text-zinc-500 text-xs mt-1">Select style and complexity</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 relative z-10">
        <select className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded p-2 outline-none hover:border-cyan-500/50 focus:border-cyan-500 transition-colors">
          <option>Trap Melody</option>
          <option>House Chords</option>
          <option>Techno Arp</option>
          <option>LoFi Keys</option>
        </select>
        <button 
          onClick={generateRiff}
          disabled={generating}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded p-2 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] border border-cyan-400"
        >
          {generating ? (
             <Sparkles className="w-4 h-4 animate-pulse" />
          ) : (
             <Dices className="w-4 h-4" />
          )}
          <span>{generating ? 'Generating...' : 'Roll Riff'}</span>
        </button>
      </div>
    </div>
  );
}
