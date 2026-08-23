import { Package, Check } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { useState } from 'react';

const SAMPLE_PACKS = [
  { id: 'classic-hiphop', name: 'Classic Boom Bap', color: 'bg-orange-500', category: 'Classic Boom Bap' },
  { id: 'lofi-nights', name: 'Lo-Fi Nights', color: 'bg-blue-500', category: 'Modern HipHop' },
  { id: 'rnb-grooves', name: 'RnB Grooves', color: 'bg-pink-500', category: 'Modern HipHop' },
  { id: 'trap-essentials', name: 'Trap Essentials', color: 'bg-cyan-500', category: 'Modern HipHop' },
  { id: 'modern-trap', name: 'Modern Trap', color: 'bg-rose-500', category: 'Modern HipHop' },
  { id: 'drill-essential', name: 'Dark Drill', color: 'bg-emerald-500', category: 'Dark Drill' },
  { id: 'pop-anthem', name: 'Pop Anthem', color: 'bg-yellow-500', category: 'Modern HipHop' },
  { id: 'future-bass', name: 'Future Bass', color: 'bg-violet-500', category: 'Modern HipHop' },
];

const CATEGORIES = ['All', ...Array.from(new Set(SAMPLE_PACKS.map(p => p.category)))];

export default function SamplePacks({ activePack, onChange }: { activePack: string, onChange: (pack: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handlePackChange = (id: string) => {
    audioEngine.setSamplePack(id);
    onChange(id);
  };

  const filteredPacks = selectedCategory === 'All' 
    ? SAMPLE_PACKS 
    : SAMPLE_PACKS.filter(p => p.category === selectedCategory);

  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 transition-all duration-300 hover:shadow-orange-500/10">
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-5 h-5 text-zinc-400 drop-shadow-[0_0_8px_rgba(161,161,170,0.6)]" />
        <h3 className="font-semibold text-zinc-200">Sample Packs</h3>
      </div>
      
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === category 
                ? 'bg-zinc-700 text-white' 
                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filteredPacks.map((pack) => {
          const isActive = activePack === pack.id;
          return (
            <button
              key={pack.id}
              onClick={() => handlePackChange(pack.id)}
              className={`
                relative p-3 rounded-xl border flex flex-col items-start gap-2 transition-all duration-300 overflow-hidden group
                ${isActive 
                  ? `bg-zinc-900 border-zinc-500 shadow-[0_0_15px_rgba(0,0,0,0.5)] scale-[1.02]` 
                  : 'bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5'}
              `}
            >
              {isActive && (
                <div className={`absolute inset-0 opacity-10 ${pack.color}`} />
              )}
              <div className="flex w-full items-center justify-between relative z-10">
                <div className={`w-3 h-3 rounded-full ${pack.color} shadow-[0_0_8px_currentColor]`} />
                {isActive && (
                  <Check className="w-4 h-4 text-zinc-100 drop-shadow-[0_0_5px_currentColor]" />
                )}
              </div>
              <span className={`text-sm font-bold relative z-10 ${isActive ? 'text-zinc-100 drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                {pack.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
