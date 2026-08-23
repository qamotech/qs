import { useEffect, useMemo, useState } from 'react';
import { Clipboard, Copy, Layers3, Music2, Plus, Save, Shuffle } from 'lucide-react';

type StepData = { velocity: number; pitch: number; chance: number; ratchet: number };
type Snapshot = { name: string; grid: boolean[][] };
type Section = { name: string; pattern: string };

const STORAGE_KEY = 'qamelot-sequencer-pro';
const cloneGrid = (grid: boolean[][]) => grid.map(track => [...track]);
const defaultStep = (): StepData => ({ velocity: 100, pitch: 0, chance: 100, ratchet: 1 });

export default function SequencerProTools({ grid, onGridChange, trackNames }: { grid: boolean[][]; onGridChange: (grid: boolean[][]) => void; trackNames: string[] }) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [sections, setSections] = useState<Section[]>([
    { name: 'Intro', pattern: 'Island Main' }, { name: 'Verse', pattern: 'Island Main' }, { name: 'Hook', pattern: 'Island Main' }, { name: 'Outro', pattern: 'Island Main' },
  ]);
  const [selectedPattern, setSelectedPattern] = useState('Island Main');
  const [clipboard, setClipboard] = useState<boolean[][] | null>(null);
  const [trackLengths, setTrackLengths] = useState<number[]>(() => grid.map(() => 16));
  const [trackSwing, setTrackSwing] = useState<number[]>(() => grid.map(() => 0));
  const [stepData, setStepData] = useState<StepData[][]>(() => grid.map(track => track.map(defaultStep)));
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [selectedStep, setSelectedStep] = useState(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.snapshots) setSnapshots(saved.snapshots);
      if (saved?.sections) setSections(saved.sections);
      if (saved?.trackLengths) setTrackLengths(saved.trackLengths);
      if (saved?.trackSwing) setTrackSwing(saved.trackSwing);
      if (saved?.stepData) setStepData(saved.stepData);
    } catch { /* Defaults are usable when storage is unavailable. */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ snapshots, sections, trackLengths, trackSwing, stepData }));
    window.dispatchEvent(new Event('qamelot-sequencer-pro-change'));
  }, [snapshots, sections, trackLengths, trackSwing, stepData]);

  useEffect(() => {
    setTrackLengths(current => grid.map((_, i) => current[i] ?? 16));
    setTrackSwing(current => grid.map((_, i) => current[i] ?? 0));
    setStepData(current => grid.map((track, i) => track.map((_, j) => current[i]?.[j] ?? defaultStep())));
  }, [grid.length]);

  const currentStep = useMemo(() => stepData[selectedTrack]?.[selectedStep] ?? defaultStep(), [stepData, selectedTrack, selectedStep]);
  const updateStep = (key: keyof StepData, value: number) => setStepData(current => current.map((track, trackIndex) => trackIndex !== selectedTrack ? track : track.map((step, stepIndex) => stepIndex !== selectedStep ? step : { ...step, [key]: value })));
  const saveSnapshot = () => {
    const name = window.prompt('Pattern name', `Pattern ${snapshots.length + 1}`)?.trim();
    if (!name) return;
    setSnapshots(current => [...current.filter(snapshot => snapshot.name !== name), { name, grid: cloneGrid(grid) }]);
    setSelectedPattern(name);
  };
  const launchPattern = (name: string) => {
    const snapshot = snapshots.find(item => item.name === name);
    if (snapshot) onGridChange(cloneGrid(snapshot.grid));
    setSelectedPattern(name);
  };
  const updateTrackSetting = (setter: React.Dispatch<React.SetStateAction<number[]>>, value: number) => setter(current => current.map((item, index) => index === selectedTrack ? value : item));

  return <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl space-y-4">
    <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Layers3 className="w-5 h-5 text-fuchsia-400" /><div><h3 className="font-semibold text-zinc-200">Sequencer Pro</h3><p className="text-[10px] text-zinc-500 uppercase tracking-wider">Patterns · scenes · arrangement · step performance</p></div></div><span className="text-xs text-fuchsia-300">Active: {selectedPattern}</span></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2"><button onClick={saveSnapshot} className="p-2 rounded bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-200 text-xs font-bold flex justify-center gap-1"><Save className="w-4 h-4" /> Save Pattern</button><button onClick={() => setClipboard(cloneGrid(grid))} className="p-2 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex justify-center gap-1"><Copy className="w-4 h-4" /> Copy Full</button><button disabled={!clipboard} onClick={() => clipboard && onGridChange(cloneGrid(clipboard))} className="p-2 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 disabled:opacity-40 text-xs font-bold flex justify-center gap-1"><Clipboard className="w-4 h-4" /> Paste Full</button><button onClick={() => setSections(current => [...current, { name: `Section ${current.length + 1}`, pattern: selectedPattern }])} className="p-2 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex justify-center gap-1"><Plus className="w-4 h-4" /> Section</button></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><div className="space-y-2"><h4 className="text-xs font-bold text-zinc-400 uppercase">Scene launcher / pattern browser</h4><div className="flex flex-wrap gap-2"><button onClick={() => { onGridChange(cloneGrid(grid)); setSelectedPattern('Island Main'); }} className="px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs">Island Main</button>{snapshots.map(snapshot => <button key={snapshot.name} onClick={() => launchPattern(snapshot.name)} className={`px-2 py-1 rounded border text-xs ${selectedPattern === snapshot.name ? 'bg-fuchsia-500/25 border-fuchsia-400 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}>{snapshot.name}</button>)}</div><h4 className="pt-2 text-xs font-bold text-zinc-400 uppercase">Arrangement timeline</h4><div className="flex gap-2 overflow-x-auto pb-1">{sections.map((section, index) => <button key={`${section.name}-${index}`} onClick={() => launchPattern(section.pattern)} className="min-w-24 p-2 rounded border border-zinc-700 bg-zinc-900 text-left"><span className="block text-xs font-bold text-zinc-100">{section.name}</span><span className="block text-[10px] text-zinc-500 truncate">{section.pattern}</span></button>)}</div></div>
      <div className="space-y-2 rounded-xl bg-zinc-900/70 border border-zinc-800 p-3"><div className="flex items-center justify-between"><h4 className="text-xs font-bold text-zinc-400 uppercase">Step editor</h4><Music2 className="w-4 h-4 text-cyan-400" /></div><div className="grid grid-cols-2 gap-2"><label className="text-[10px] text-zinc-500">Track<select value={selectedTrack} onChange={e => setSelectedTrack(Number(e.target.value))} className="mt-1 w-full bg-zinc-800 rounded p-1.5 text-xs text-zinc-100">{trackNames.map((name, i) => <option key={i} value={i}>{name || `Track ${i + 1}`}</option>)}</select></label><label className="text-[10px] text-zinc-500">Step<select value={selectedStep} onChange={e => setSelectedStep(Number(e.target.value))} className="mt-1 w-full bg-zinc-800 rounded p-1.5 text-xs text-zinc-100">{Array.from({ length: 16 }, (_, i) => <option key={i} value={i}>{i + 1}</option>)}</select></label></div><div className="grid grid-cols-2 gap-2">{([{ key: 'velocity', label: 'Velocity', min: 1, max: 127 }, { key: 'pitch', label: 'Pitch', min: -12, max: 12 }, { key: 'chance', label: 'Chance', min: 0, max: 100 }, { key: 'ratchet', label: 'Ratchet', min: 1, max: 4 }] as const).map(control => <label key={control.key} className="text-[10px] text-zinc-500">{control.label}: {currentStep[control.key]}<input type="range" min={control.min} max={control.max} value={currentStep[control.key]} onChange={e => updateStep(control.key, Number(e.target.value))} className="w-full accent-fuchsia-500" /></label>)}</div><div className="grid grid-cols-2 gap-2"><label className="text-[10px] text-zinc-500">Pattern length: {trackLengths[selectedTrack] ?? 16}<input type="range" min="1" max="16" value={trackLengths[selectedTrack] ?? 16} onChange={e => updateTrackSetting(setTrackLengths, Number(e.target.value))} className="w-full accent-cyan-500" /></label><label className="text-[10px] text-zinc-500">Track swing: {trackSwing[selectedTrack] ?? 0}%<input type="range" min="-40" max="40" value={trackSwing[selectedTrack] ?? 0} onChange={e => updateTrackSetting(setTrackSwing, Number(e.target.value))} className="w-full accent-cyan-500" /></label></div><button onClick={() => updateStep('chance', Math.floor(Math.random() * 41) + 60)} className="w-full p-1.5 rounded bg-cyan-500/15 text-cyan-200 text-xs flex items-center justify-center gap-1"><Shuffle className="w-3 h-3" /> Humanize selected step</button></div></div>
  </div>;
}