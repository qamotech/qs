import { useEffect, useState } from 'react';
import { Activity, RotateCcw, Settings2, X } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { SOUND_LIBRARY } from '../audio/SoundLibrary';

interface PadSound {
  id: string;
  name: string;
  group: 'Bass' | 'Snare' | 'Hat' | 'FX';
}

const PAD_STORAGE_KEY = 'qamelot-performance-pads';
const DEFAULT_PADS: PadSound[] = [
  { id: '808-sub', name: '808 Sub', group: 'Bass' }, { id: 'deep-house-bass', name: 'Deep Bass', group: 'Bass' }, { id: 'dirty-bass', name: 'Dirty Bass', group: 'Bass' }, { id: 'rubber-bass', name: 'Rubber Bass', group: 'Bass' },
  { id: 'crisp-snare', name: 'Crisp Snare', group: 'Snare' }, { id: 'trap-snap', name: 'Trap Snap', group: 'Snare' }, { id: 'crack-snare', name: 'Crack Snare', group: 'Snare' }, { id: 'classic-clap', name: 'Classic Clap', group: 'Snare' },
  { id: '808-closed-hat', name: 'Quick Hat', group: 'Hat' }, { id: 'trap-hihat', name: 'Trap Hat', group: 'Hat' }, { id: '808-open-hat', name: 'Open Hat', group: 'Hat' }, { id: 'needle-hat', name: 'Needle Hat', group: 'Hat' },
  { id: 'white-noise-rise', name: 'Noise Rise', group: 'FX' }, { id: 'deep-drop', name: 'Deep Drop', group: 'FX' }, { id: 'impact-tone', name: 'Impact', group: 'FX' }, { id: 'digital-fall', name: 'Digital Fall', group: 'FX' },
];

const GROUP_STYLES: Record<PadSound['group'], string> = {
  Bass: 'from-violet-950 to-violet-800 border-violet-500/40 text-violet-200', Snare: 'from-rose-950 to-rose-800 border-rose-500/40 text-rose-200',
  Hat: 'from-cyan-950 to-cyan-800 border-cyan-500/40 text-cyan-200', FX: 'from-amber-950 to-amber-800 border-amber-500/40 text-amber-200',
};

const loadPads = (): PadSound[] => {
  try {
    const saved = localStorage.getItem(PAD_STORAGE_KEY);
    const pads = saved ? JSON.parse(saved) : null;
    return Array.isArray(pads) && pads.length === DEFAULT_PADS.length ? pads : DEFAULT_PADS;
  } catch { return DEFAULT_PADS; }
};

export default function PerformancePads() {
  const [pads, setPads] = useState<PadSound[]>(loadPads);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [editingPad, setEditingPad] = useState<number | null>(null);

  useEffect(() => { localStorage.setItem(PAD_STORAGE_KEY, JSON.stringify(pads)); }, [pads]);

  const triggerPad = (index: number) => {
    audioEngine.init();
    setActivePad(index);
    audioEngine.playSound(20 + index, pads[index].id);
  };
  const updatePad = (index: number, changes: Partial<PadSound>) => setPads(current => current.map((pad, padIndex) => padIndex === index ? { ...pad, ...changes } : pad));
  const selectedPad = editingPad === null ? null : pads[editingPad];

  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:shadow-purple-500/10">
      <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400" /><div><h3 className="font-semibold text-zinc-200">Trap Performance Pads</h3><p className="text-[10px] text-zinc-500 uppercase tracking-wider">Tap to play · click a pad to customize</p></div></div><button onClick={() => { setPads(DEFAULT_PADS.map(pad => ({ ...pad }))); setEditingPad(null); }} className="p-2 text-zinc-500 hover:text-cyan-300 hover:bg-zinc-800 rounded-lg" title="Reset trap pad layout"><RotateCcw className="w-4 h-4" /></button></div>
      <div className="grid grid-cols-4 gap-2">
        {pads.map((pad, index) => <button key={`${pad.id}-${index}`} onPointerDown={() => triggerPad(index)} onPointerUp={() => setActivePad(null)} onPointerLeave={() => setActivePad(null)} onClick={() => setEditingPad(index)} className={`aspect-square min-h-16 rounded-xl transition-all cursor-pointer relative overflow-hidden border bg-gradient-to-b ${GROUP_STYLES[pad.group]} ${activePad === index ? 'scale-95 brightness-150 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),0_0_22px_currentColor]' : 'hover:brightness-125 hover:-translate-y-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_4px_8px_rgba(0,0,0,0.45)]'}`}>
          <span className="absolute top-1 left-1 text-[8px] font-black opacity-60">{index + 1}</span><Settings2 className="absolute top-1 right-1 w-3 h-3 opacity-60" /><span className="absolute top-5 left-1 right-1 text-[7px] uppercase font-bold opacity-60">{pad.group}</span><span className={`absolute inset-x-1 bottom-2 text-[9px] sm:text-[10px] font-black leading-tight uppercase tracking-wide ${activePad === index ? 'scale-105' : ''}`}>{pad.name}</span>
        </button>)}
      </div>
      {selectedPad && editingPad !== null && <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900/95 p-4 space-y-3"><div className="flex items-center justify-between"><h4 className="text-sm font-bold text-zinc-100">Customize Pad {editingPad + 1}</h4><button onClick={() => setEditingPad(null)} className="p-1 text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button></div><label className="block text-xs text-zinc-400">Pad label<input value={selectedPad.name} onChange={(event) => updatePad(editingPad, { name: event.target.value })} className="mt-1 w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100" /></label><label className="block text-xs text-zinc-400">Sound assignment<select value={selectedPad.id} onChange={(event) => { const preset = SOUND_LIBRARY.find(sound => sound.id === event.target.value); updatePad(editingPad, { id: event.target.value, group: preset?.category === 'Synth' ? 'Bass' : preset?.category === 'Snare' || preset?.category === 'Clap' ? 'Snare' : preset?.category === 'HiHat' || preset?.category === 'Cymbal' ? 'Hat' : preset?.category === 'FX' ? 'FX' : selectedPad.group }); }} className="mt-1 w-full rounded bg-zinc-800 border border-zinc-700 p-2 text-zinc-100">{SOUND_LIBRARY.map(sound => <option key={sound.id} value={sound.id}>{sound.category} — {sound.name}</option>)}</select></label><p className="text-[10px] text-zinc-500">Every pad is deterministic and saved locally. No pad uses random FX selection.</p></div>}
    </div>
  );
}