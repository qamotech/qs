import { Activity, Radio, BarChart, HardDrive, Settings2, Sliders, Disc3, Mic2 } from 'lucide-react';

export function SpectralAnalyzer() {
  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden group shrink-0">
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none" />
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-zinc-200 leading-none">Spectral Analyzer</h3>
      </div>
      <div className="h-24 w-full bg-zinc-900 rounded-lg flex items-end justify-between p-2 border border-zinc-800/50">
        {Array.from({length: 16}).map((_, i) => (
          <div key={i} className="w-full mx-0.5 bg-cyan-500/50 rounded-t-sm transition-all duration-75" style={{ height: `${Math.random() * 80 + 10}%` }} />
        ))}
      </div>
    </div>
  );
}

export function MasterLimiter() {
  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden group shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-zinc-200 leading-none">Master Limiter</h3>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-medium">Threshold</span>
            <span className="text-purple-400 font-bold">-0.1 dB</span>
          </div>
          <input type="range" className="w-full accent-purple-500" min="-24" max="0" step="0.1" defaultValue="-0.1" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-medium">Release</span>
            <span className="text-purple-400 font-bold">50 ms</span>
          </div>
          <input type="range" className="w-full accent-purple-500" min="10" max="500" step="1" defaultValue="50" />
        </div>
      </div>
    </div>
  );
}

export function TapeSaturation() {
  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden group shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <Disc3 className="w-5 h-5 text-amber-400" />
        <h3 className="font-semibold text-zinc-200 leading-none">Tape Saturation</h3>
      </div>
      <div className="flex gap-6 items-center">
        <div className="w-16 h-16 rounded-full border-[6px] border-zinc-800 border-t-amber-500 border-l-amber-500 animate-[spin_4s_linear_infinite] shadow-[0_0_15px_rgba(245,158,11,0.2)]" />
        <div className="flex-1 flex flex-col justify-center gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-medium">Drive</span>
            <span className="text-amber-400 font-bold">60%</span>
          </div>
          <input type="range" className="w-full accent-amber-500" min="0" max="100" defaultValue="60" />
        </div>
      </div>
    </div>
  );
}

export function MultiBandCompressor() {
  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden group shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-zinc-200 leading-none">Multiband Comp</h3>
      </div>
      <div className="grid grid-cols-4 gap-3 h-24">
        {[1, 2, 3, 4].map(band => (
          <div key={band} className="bg-zinc-900 rounded-lg relative overflow-hidden flex items-end border border-zinc-800 group-hover:border-zinc-700 transition-colors">
            <div className={`w-full bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-t-sm`} style={{ height: `${Math.random() * 60 + 20}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LfoModulator() {
  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden group shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-zinc-200 leading-none">LFO Modulator</h3>
      </div>
      <div className="h-16 w-full flex items-center">
        <svg className="w-full h-full stroke-emerald-500 stroke-2 fill-none" preserveAspectRatio="none" viewBox="0 0 100 20">
          <path d="M0,10 Q12.5,20 25,10 T50,10 T75,10 T100,10" className="animate-[dash_2s_linear_infinite]" />
        </svg>
      </div>
    </div>
  );
}

export function ReverbChamber() {
  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden group shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <Mic2 className="w-5 h-5 text-violet-400" />
        <h3 className="font-semibold text-zinc-200 leading-none">Reverb Chamber</h3>
      </div>
      <div className="flex gap-4 items-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-lg relative overflow-hidden flex items-center justify-center shrink-0 border border-zinc-800 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-violet-500/20 blur-xl animate-pulse" />
          <div className="w-6 h-6 rounded-full border-2 border-violet-500/50 animate-ping" />
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-500">
              <span>Size</span>
              <span className="text-violet-400">Large</span>
            </div>
            <input type="range" className="w-full accent-violet-500" min="0" max="100" defaultValue="80" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-500">
              <span>Mix</span>
              <span className="text-violet-400">45%</span>
            </div>
            <input type="range" className="w-full accent-violet-500" min="0" max="100" defaultValue="45" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChordGenerator() {
  const chords = [
    { name: 'C Maj', notes: ['C', 'E', 'G'] },
    { name: 'A Min', notes: ['A', 'C', 'E'] },
    { name: 'F Maj', notes: ['F', 'A', 'C'] },
    { name: 'G Maj', notes: ['G', 'B', 'D'] }
  ];

  const handleDragStart = (e: React.DragEvent, chord: { name: string; notes: string[] }) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'chord', ...chord }));
  };

  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden group shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <HardDrive className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-zinc-200 leading-none">Chord Gen</h3>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest text-center">Drag to Sequencer</span>
        <div className="grid grid-cols-2 gap-2">
          {chords.map(chord => (
            <div 
              key={chord.name}
              draggable
              onDragStart={(e) => handleDragStart(e, chord)}
              className="bg-purple-500/10 border border-purple-500/30 rounded p-2 text-center cursor-grab active:cursor-grabbing hover:bg-purple-500/20 transition-colors"
            >
              <div className="text-purple-200 font-bold text-xs">{chord.name}</div>
              <div className="text-[10px] text-purple-400 mt-1">{chord.notes.join(' - ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Arpeggiator() {
  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden group shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="w-5 h-5 text-orange-400" />
        <h3 className="font-semibold text-zinc-200 leading-none">Arpeggiator</h3>
      </div>
      <div className="flex items-end gap-1 h-12 justify-center">
        {[1, 2, 3, 4, 3, 2].map((step, i) => (
          <div key={i} className="w-3 bg-orange-500/50 rounded-t" style={{ height: `${step * 20}%` }} />
        ))}
      </div>
    </div>
  );
}

export function EnhancementsRack() {
  const enhancements = [
    'Tube', 'Crunch', 'Warmth', 'Excite', 'Air', 'Sub', 'Punch', 'Snap', 
    'Grit', 'Fuzz', 'LoFi', 'Tape', 'Vinyl', 'Bitcrush', 'Chorus', 'Flange', 
    'Phase', 'Widener', 'Stereo', 'Mono', 'Gate', 'De-Ess', 'Transient', 'Limit'
  ];
  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-zinc-200 leading-none">24 Enhancements Rack</h3>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {enhancements.map((name, i) => (
          <div key={i} className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className={`w-3 h-3 rounded-full border transition-all ${i % 3 === 0 ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-zinc-900 border-zinc-700 group-hover:border-zinc-500'}`} />
            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter group-hover:text-zinc-300">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
