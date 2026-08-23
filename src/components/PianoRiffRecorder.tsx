import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Piano, Play, RotateCcw, Settings2, Square, Wand2 } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { SOUND_LIBRARY } from '../audio/SoundLibrary';

interface RecordedNote { semitone: number; time: number; duration: number; velocity: number }
interface HeldNote { started: number; velocity: number }

const STORAGE_KEY = 'qamelot-piano-riffs-v2';
const KEYBOARD_MAP = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j'];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]);
const SCALES: Record<string, number[]> = { Major: [0, 2, 4, 5, 7, 9, 11], Minor: [0, 2, 3, 5, 7, 8, 10], Pentatonic: [0, 3, 5, 7, 10], Dorian: [0, 2, 3, 5, 7, 9, 10] };

export default function PianoRiffRecorder() {
  const synthSounds = SOUND_LIBRARY.filter(sound => sound.category === 'Synth');
  const [soundId, setSoundId] = useState('dream-pluck');
  const [octave, setOctave] = useState(4);
  const [sustain, setSustain] = useState(true);
  const [recording, setRecording] = useState(false);
  const [riff, setRiff] = useState<RecordedNote[]>([]);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [heldNotes, setHeldNotes] = useState<Set<number>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [midiStatus, setMidiStatus] = useState('MIDI: off');
  const [keyRoot, setKeyRoot] = useState(0);
  const [scale, setScale] = useState('Minor');
  const [quantize, setQuantize] = useState(0);
  const [arpeggiator, setArpeggiator] = useState(false);
  const [arpRate, setArpRate] = useState(160);
  const startedAt = useRef(0);
  const heldKeys = useRef(new Set<string>());
  const pressedAt = useRef(new Map<number, HeldNote>());
  const arpTimer = useRef<number | null>(null);

  const quantizeTime = (time: number) => quantize ? Math.round(time / quantize) * quantize : time;
  const scaleNotes = useMemo(() => new Set(SCALES[scale].map(note => (note + keyRoot) % 12)), [keyRoot, scale]);
  const absoluteOffset = (semitone: number) => semitone + (octave - 4) * 12;

  useEffect(() => { try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) setRiff(JSON.parse(stored)); } catch { /* Ignore invalid saved data. */ } }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(riff)); }, [riff]);

  const triggerNote = (semitone: number, velocity = 100, captureStart = true) => {
    audioEngine.init();
    audioEngine.playSound(30, soundId, absoluteOffset(semitone), velocity / 127);
    setActiveNotes(notes => [...new Set([...notes, semitone])]);
    if (captureStart) pressedAt.current.set(semitone, { started: performance.now(), velocity });
    window.setTimeout(() => setActiveNotes(notes => notes.filter(note => note !== semitone)), sustain ? 520 : 180);
  };
  const releaseNote = (semitone: number) => {
    const held = pressedAt.current.get(semitone);
    pressedAt.current.delete(semitone);
    if (recording && held) setRiff(notes => [...notes, { semitone, velocity: held.velocity, time: quantizeTime(held.started - startedAt.current), duration: Math.max(80, quantizeTime(performance.now() - held.started)) }]);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
      const key = event.key.toLowerCase(); const semitone = KEYBOARD_MAP.indexOf(key);
      if (semitone === -1 || heldKeys.current.has(key)) return;
      event.preventDefault(); heldKeys.current.add(key); setHeldNotes(current => new Set(current).add(semitone)); triggerNote(semitone);
    };
    const onKeyUp = (event: KeyboardEvent) => { const key = event.key.toLowerCase(); const semitone = KEYBOARD_MAP.indexOf(key); heldKeys.current.delete(key); if (semitone >= 0) { setHeldNotes(current => { const next = new Set(current); next.delete(semitone); return next; }); releaseNote(semitone); } };
    window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [octave, recording, soundId, sustain, quantize]);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) { setMidiStatus('MIDI: unavailable'); return; }
    let access: MIDIAccess | null = null;
    navigator.requestMIDIAccess().then(result => {
      access = result; setMidiStatus(result.inputs.size ? `MIDI: ${result.inputs.size} device${result.inputs.size === 1 ? '' : 's'}` : 'MIDI: connect a keyboard');
      for (const input of result.inputs.values()) input.onmidimessage = event => {
        if (!event.data) return;
        const [status, note, velocity] = event.data; const command = status & 0xf0;
        if (command === 0x90 && velocity > 0) { const semitone = note % 12; setHeldNotes(current => new Set(current).add(semitone)); triggerNote(semitone, velocity); }
        else if (command === 0x80 || (command === 0x90 && velocity === 0)) { const semitone = note % 12; setHeldNotes(current => { const next = new Set(current); next.delete(semitone); return next; }); releaseNote(semitone); }
        else if (command === 0xb0 && note === 64) setSustain(velocity >= 64);
      };
    }).catch(() => setMidiStatus('MIDI: permission denied'));
    return () => { if (access) for (const input of access.inputs.values()) input.onmidimessage = null; };
  }, [octave, recording, soundId, sustain, quantize]);

  useEffect(() => {
    if (!arpeggiator || !heldNotes.size) { if (arpTimer.current) window.clearInterval(arpTimer.current); arpTimer.current = null; return; }
    const notes = [...heldNotes].sort((a, b) => a - b); let index = 0;
    arpTimer.current = window.setInterval(() => { triggerNote(notes[index % notes.length], 92, false); index += 1; }, arpRate);
    return () => { if (arpTimer.current) window.clearInterval(arpTimer.current); };
  }, [arpeggiator, heldNotes, arpRate, octave, soundId]);

  const toggleRecord = () => { if (!recording) { setRiff([]); startedAt.current = performance.now(); } setRecording(value => !value); };
  const playRiff = () => riff.forEach(note => window.setTimeout(() => audioEngine.playSound(30, soundId, absoluteOffset(note.semitone), note.velocity / 127), note.time));
  const transpose = (amount: number) => setRiff(notes => notes.map(note => ({
    ...note,
    semitone: Math.max(0, Math.min(11, note.semitone + amount)),
  })));
  const exportRiff = () => { const blob = new Blob([JSON.stringify({ soundId, octave, sustain, keyRoot, scale, notes: riff }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'qamelot-piano-riff.json'; anchor.click(); URL.revokeObjectURL(url); };
  const dragRiff = (event: React.DragEvent) => event.dataTransfer.setData('application/json', JSON.stringify({ type: 'piano-riff', notes: riff }));

  return <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl space-y-4">
    <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Piano className="w-5 h-5 text-cyan-400" /><div><h3 className="font-semibold text-zinc-200">Piano Riff Recorder</h3><p className="text-[10px] text-zinc-500 uppercase tracking-wider">A–J keys · MIDI · drag riff to a track</p></div></div><button onClick={() => setShowSettings(value => !value)} className="p-2 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800"><Settings2 className="w-4 h-4" /></button></div>
    {showSettings && <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800"><label className="text-xs text-zinc-400">Instrument<select value={soundId} onChange={event => setSoundId(event.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-zinc-100">{synthSounds.map(sound => <option key={sound.id} value={sound.id}>{sound.name}</option>)}</select></label><label className="text-xs text-zinc-400">Octave<select value={octave} onChange={event => setOctave(Number(event.target.value))} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-zinc-100">{[2, 3, 4, 5, 6].map(value => <option key={value} value={value}>C{value}</option>)}</select></label><label className="text-xs text-zinc-400">Key<select value={keyRoot} onChange={event => setKeyRoot(Number(event.target.value))} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-zinc-100">{NOTE_NAMES.map((note, i) => <option key={note} value={i}>{note}</option>)}</select></label><label className="text-xs text-zinc-400">Scale<select value={scale} onChange={event => setScale(event.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-zinc-100">{Object.keys(SCALES).map(value => <option key={value}>{value}</option>)}</select></label><label className="text-xs text-zinc-400">Quantize<select value={quantize} onChange={event => setQuantize(Number(event.target.value))} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-zinc-100"><option value="0">Off</option><option value="125">1/32</option><option value="250">1/16</option><option value="500">1/8</option></select></label><label className="text-xs text-zinc-400">Arp rate<select value={arpRate} onChange={event => setArpRate(Number(event.target.value))} className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-zinc-100"><option value="100">Fast</option><option value="160">1/16</option><option value="250">1/8</option></select></label><label className="col-span-2 flex items-center gap-4 text-xs text-zinc-300"><span><input type="checkbox" checked={sustain} onChange={event => setSustain(event.target.checked)} className="accent-cyan-500" /> Sustain pedal</span><span><input type="checkbox" checked={arpeggiator} onChange={event => setArpeggiator(event.target.checked)} className="accent-fuchsia-500" /> Arpeggiator</span></label></div>}
    <div className="relative h-28 select-none rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 flex">{NOTE_NAMES.map((name, semitone) => !BLACK_KEYS.has(semitone) && <button key={name} onPointerDown={() => { setHeldNotes(current => new Set(current).add(semitone)); triggerNote(semitone); }} onPointerUp={() => { setHeldNotes(current => { const next = new Set(current); next.delete(semitone); return next; }); releaseNote(semitone); }} className={`relative flex-1 border-r border-zinc-400 last:border-r-0 text-zinc-900 font-bold text-xs pt-20 transition-colors ${scaleNotes.has(semitone) ? 'bg-cyan-50' : 'bg-zinc-100'} ${activeNotes.includes(semitone) ? 'bg-cyan-300' : ''}`}>{name}{octave}</button>)}{NOTE_NAMES.map((name, semitone) => BLACK_KEYS.has(semitone) && <button key={name} onPointerDown={() => { setHeldNotes(current => new Set(current).add(semitone)); triggerNote(semitone); }} onPointerUp={() => { setHeldNotes(current => { const next = new Set(current); next.delete(semitone); return next; }); releaseNote(semitone); }} className={`absolute z-10 top-0 h-16 w-[8%] rounded-b bg-zinc-950 border border-zinc-700 text-[8px] text-zinc-400 ${scaleNotes.has(semitone) ? 'ring-1 ring-cyan-400' : ''} ${activeNotes.includes(semitone) ? 'bg-cyan-500' : ''}`} style={{ left: `${[9, 23, 51, 65, 79][[1, 3, 6, 8, 10].indexOf(semitone)]}%` }}>{name}</button>)}</div>
    <div className="h-14 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-px px-2 overflow-hidden">{riff.length ? riff.map((note, index) => <span key={`${note.time}-${index}`} className="h-8 bg-fuchsia-500/70 rounded-sm" style={{ width: `${Math.max(5, Math.min(36, note.duration / 24))}px`, marginLeft: index ? `${Math.min(12, Math.max(1, (note.time - riff[index - 1].time) / 70))}px` : 0 }} title={`${NOTE_NAMES[note.semitone]} · ${note.duration}ms`} />) : <span className="text-[10px] text-zinc-600 mx-auto">Piano roll — recorded notes and durations appear here</span>}</div>
    <div className="flex items-center gap-2"><button onClick={toggleRecord} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-red-500/15 border border-red-500/40 text-red-300'}`}>{recording ? <Square className="w-4 h-4 fill-current" /> : <span className="w-3 h-3 rounded-full bg-current" />}{recording ? 'Stop Recording' : 'Record Riff'}</button><button onClick={playRiff} disabled={!riff.length} className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 disabled:opacity-40"><Play className="w-4 h-4 fill-current" /></button><button onClick={() => transpose(-1)} disabled={!riff.length} className="p-2 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-40" title="Transpose down">−</button><button onClick={() => transpose(1)} disabled={!riff.length} className="p-2 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-40" title="Transpose up">+</button><button onClick={() => setRiff([])} disabled={!riff.length} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 disabled:opacity-40"><RotateCcw className="w-4 h-4" /></button><button onClick={exportRiff} disabled={!riff.length} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 disabled:opacity-40"><Download className="w-4 h-4" /></button></div>
    <div className="flex items-center justify-between"><span className="text-[10px] text-zinc-500">{midiStatus} · {riff.length} recorded notes</span>{riff.length > 0 && <button draggable onDragStart={dragRiff} className="text-[10px] text-fuchsia-300 hover:text-fuchsia-100 flex items-center gap-1"><Wand2 className="w-3 h-3" /> Drag riff to sequencer</button>}</div>
  </div>;
}