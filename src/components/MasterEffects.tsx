import { Sliders, Activity } from 'lucide-react';

export default function MasterEffects({
  reverb,
  onReverbChange,
  delay,
  onDelayChange,
  filterType,
  onFilterTypeChange
}: {
  reverb: number;
  onReverbChange: (val: number) => void;
  delay: number;
  onDelayChange: (val: number) => void;
  filterType: 'lowpass' | 'highpass' | 'bandpass';
  onFilterTypeChange: (val: 'lowpass' | 'highpass' | 'bandpass') => void;
}) {
  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 transition-all duration-300 hover:shadow-cyan-500/10">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
        <h3 className="font-semibold text-zinc-200">Master Effects</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-zinc-400">Reverb Send</span>
            <span className="text-sm text-cyan-400 font-bold drop-shadow-[0_0_5px_currentColor]">{reverb}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={reverb} 
            onChange={(e) => onReverbChange(Number(e.target.value))}
            className="w-full" 
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-zinc-400">Delay Send</span>
            <span className="text-sm text-cyan-400 font-bold drop-shadow-[0_0_5px_currentColor]">{delay}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={delay} 
            onChange={(e) => onDelayChange(Number(e.target.value))}
            className="w-full" 
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-zinc-400">Global Filter Type</span>
          </div>
          <div className="flex gap-2">
            {['lowpass', 'highpass', 'bandpass'].map(type => (
              <button
                key={type}
                onClick={() => onFilterTypeChange(type as any)}
                className={`flex-1 py-1.5 rounded text-xs font-bold tracking-wider transition-all duration-300 ${filterType === type ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)] border border-cyan-400' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
