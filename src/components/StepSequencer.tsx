import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ListMusic, Play, Square, Trash2, VolumeX, Headphones, Search, Maximize2, Copy, Clipboard, X, Shuffle, RotateCcw, FlipVertical, ArrowLeft, ArrowRight, Sparkles, Zap, User } from 'lucide-react';
import AutomationLane from './AutomationLane';
import Tooltip from './Tooltip';
import SequencerTrack from './SequencerTrack';
import { audioEngine } from '../audio/AudioEngine';
import { SOUND_LIBRARY, SoundCategory } from '../audio/SoundLibrary';

export default function StepSequencer({ 
  grid, 
  onGridChange,
  isPlaying,
  onTogglePlay,
  bpm,
  onBpmChange,
  swing,
  onSwingChange,
  reverbAutomation,
  onReverbAutomationChange,
  delayAutomation,
  onDelayAutomationChange,
  snapToGrid,
  onSnapToGridChange,
  filterType,
  trackMutes,
  onToggleMute,
  trackSolos,
  onToggleSolo,
  trackCutSelf,
  onToggleCutSelf,
  trackSustain,
  onToggleSustain,
  trackSounds,
  onTrackSoundChange,
  onClearGrid,
  addTrack,
  removeTrack,
  copyTrack,
  pasteTrack,
  clearTrack,
  randomizeTrack,
  randomizeVelocities,
  humanizeTiming,
  deleteAllNotes,
  setStatus,
  onMaximize
}: { 
  grid: boolean[][], 
  onGridChange: (grid: boolean[][]) => void,
  isPlaying: boolean,
  onTogglePlay: () => void,
  bpm: number,
  onBpmChange: (bpm: number) => void,
  swing: number,
  onSwingChange: (swing: number) => void,
  reverbAutomation: number[],
  onReverbAutomationChange: (val: number[]) => void,
  delayAutomation: number[],
  onDelayAutomationChange: (val: number[]) => void,
  snapToGrid: boolean,
  onSnapToGridChange: (snap: boolean) => void,
  filterType: 'lowpass' | 'highpass' | 'bandpass',
  trackMutes: boolean[],
  onToggleMute: (idx: number) => void,
  trackSolos: boolean[],
  onToggleSolo: (idx: number) => void,
  trackCutSelf: boolean[],
  onToggleCutSelf: (idx: number) => void,
  trackSustain: boolean[],
  onToggleSustain: (idx: number) => void,
  trackSounds: string[],
  onTrackSoundChange: (idx: number, soundId: string) => void,
  onClearGrid: () => void,
  addTrack: () => void,
  removeTrack: (idx: number) => void,
  copyTrack: (idx: number) => void,
  pasteTrack: (idx: number) => void,
  clearTrack: (idx: number) => void,
  randomizeTrack: (idx: number) => void,
  reverseTrack: (idx: number) => void,
  invertTrack: (idx: number) => void,
  shiftTrackLeft: (idx: number) => void,
  shiftTrackRight: (idx: number) => void,
  generateRiff: (idx: number) => void,
  applyChord: (idx: number, notes: string[]) => void,
  duplicateTrack: (idx: number) => void,
  randomizeVelocities: (idx: number) => void,
  humanizeTiming: (idx: number) => void,
  deleteAllNotes: (idx: number) => void,
  setStatus: (status: string) => void,
  onMaximize?: () => void
}) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const workerRef = useRef<Worker | null>(null);
  const decayRef = useRef<number | null>(null);
  
  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../audio/sequencer-worker.ts', import.meta.url));
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'tick') {
        const step = e.data.step;
        setCurrentStep(step);
        
        const anySolo = trackSolos.some(s => s);
        
        // Play sounds for the current step
        grid.forEach((track, trackIdx) => {
          if (track[step]) {
            const isMuted = trackMutes[trackIdx];
            const isSoloed = trackSolos[trackIdx];
            
            let shouldPlay = true;
            if (anySolo) {
              shouldPlay = isSoloed;
            } else if (isMuted) {
              shouldPlay = false;
            }

            if (shouldPlay) {
              audioEngine.playSound(trackIdx, trackSounds[trackIdx]);
              triggerPeak(trackIdx);
            }
          }
        });
        
        audioEngine.setEffects(reverbAutomation[step], delayAutomation[step], filterType);
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Sync worker with state
  useEffect(() => {
    if (isPlaying) {
      audioEngine.init();
      workerRef.current?.postMessage({ type: 'start', bpm, swing, step: currentStep });
    } else {
      workerRef.current?.postMessage({ type: 'stop' });
    }
  }, [isPlaying, bpm, swing]);
  
  // Decay peak levels
  useEffect(() => {
    let activePeaks = new Array(8).fill(0);
    const decay = () => {
      let needsUpdate = false;
      for (let i = 0; i < 8; i++) {
        if (activePeaks[i] > 0) {
          activePeaks[i] = Math.max(0, activePeaks[i] - 0.1);
          needsUpdate = true;
          const el = document.getElementById(`peak-meter-${i}`);
          if (el) el.style.height = `${activePeaks[i] * 100}%`;
        }
      }
      decayRef.current = requestAnimationFrame(decay);
    };
    decayRef.current = requestAnimationFrame(decay);
    
    // Assign global peak trigger
    (window as any).__triggerPeak = (idx: number) => {
      activePeaks[idx] = 1;
      const el = document.getElementById(`peak-meter-${idx}`);
      if (el) el.style.height = '100%';
    };

    return () => {
      if (decayRef.current) cancelAnimationFrame(decayRef.current);
      delete (window as any).__triggerPeak;
    };
  }, []);

  const triggerPeak = (trackIdx: number) => {
    if ((window as any).__triggerPeak) {
      (window as any).__triggerPeak(trackIdx);
    }
  };

  const [editingTrack, setEditingTrack] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOverTrack, setDragOverTrack] = useState<number | null>(null);

  const [contextMenu, setContextMenu] = useState<{ trackIdx: number, x: number, y: number } | null>(null);
  const [stepEditor, setStepEditor] = useState<{ trackIdx: number, stepIdx: number, x: number, y: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setStepEditor(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleCell = (trackIdx: number, stepIdx: number) => {
    audioEngine.init();
    const newGrid = [...grid];
    newGrid[trackIdx] = [...newGrid[trackIdx]];
    newGrid[trackIdx][stepIdx] = !newGrid[trackIdx][stepIdx];
    
    if (newGrid[trackIdx][stepIdx]) {
      const anySolo = trackSolos.some(s => s);
      const isMuted = trackMutes[trackIdx];
      const isSoloed = trackSolos[trackIdx];
      let shouldPlay = true;
      if (anySolo) shouldPlay = isSoloed;
      else if (isMuted) shouldPlay = false;
      
      if (shouldPlay) {
        audioEngine.playSound(trackIdx, trackSounds[trackIdx]);
        triggerPeak(trackIdx);
      }
    }
    
    onGridChange(newGrid);
  };

  return (
    <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl transition-all duration-300 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-zinc-200">Step Sequencer</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onSnapToGridChange(!snapToGrid)}
            className={`px-2 py-1 rounded text-[10px] font-bold ${snapToGrid ? 'bg-cyan-900 text-cyan-300' : 'bg-zinc-800 text-zinc-500'}`}
          >
            SNAP: {snapToGrid ? 'ON' : 'OFF'}
          </button>
          {onMaximize && (
            <button onClick={onMaximize} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 relative bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
        {grid.map((track, trackIdx) => (
          <div key={trackIdx} className="relative">
            <SequencerTrack
                trackIdx={trackIdx}
                steps={track}
                currentStep={currentStep}
                trackMute={trackMutes[trackIdx]}
                trackSolo={trackSolos[trackIdx]}
                trackSustain={trackSustain[trackIdx]}
                trackSound={trackSounds[trackIdx]}
                onToggleCell={(stepIdx) => toggleCell(trackIdx, stepIdx)}
                onToggleMute={() => onToggleMute(trackIdx)}
                onToggleSolo={() => onToggleSolo(trackIdx)}
                onClear={() => clearTrack(trackIdx)}
                onRandomize={() => randomizeTrack(trackIdx)}
                onTrackEdit={() => {
                    if (editingTrack === trackIdx) setEditingTrack(null);
                    else {
                        setEditingTrack(trackIdx);
                        setSearchQuery('');
                    }
                }}
                onSetStepEditor={(stepIdx, e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (grid[trackIdx][stepIdx]) {
                        setStepEditor({ trackIdx, stepIdx, x: e.clientX, y: e.clientY });
                    }
                }}
                onTrackContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ trackIdx, x: e.clientX, y: e.clientY });
                }}
                onDragEnter={() => setDragOverTrack(trackIdx)}
                onDragLeave={() => setDragOverTrack(null)}
            />

            {editingTrack === trackIdx && (
              <div className="absolute left-24 top-full mt-2 p-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[101] animate-in fade-in zoom-in-95 w-[300px] md:w-[400px]">
                <div className="flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 mb-3 shadow-inner focus-within:border-emerald-500/50 transition-colors">
                  <Search className="w-4 h-4 text-emerald-500" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search sounds..."
                    className="bg-transparent text-sm text-zinc-200 outline-none w-full placeholder:text-zinc-600"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto pr-1">
                  {[...SOUND_LIBRARY]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(sound => (
                    <div key={sound.id} className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          audioEngine.playSound(trackIdx, sound.id);
                        }}
                        onMouseEnter={() => setStatus(`Preview: ${sound.name}`)}
                        onMouseLeave={() => setStatus('')}
                        className="p-1.5 rounded bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Preview"
                      >
                        <Headphones className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          audioEngine.init();
                          onTrackSoundChange(trackIdx, sound.id);
                          audioEngine.playSound(trackIdx, sound.id);
                          setEditingTrack(null);
                        }}
                        onMouseEnter={() => setStatus(`Select: ${sound.name}`)}
                        onMouseLeave={() => setStatus('')}
                        className={`flex-1 text-left px-2 py-1.5 rounded text-xs transition-colors truncate ${trackSounds[trackIdx] === sound.id ? 'bg-purple-900/40 text-purple-300 font-bold border border-purple-900' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                        title={sound.name}
                      >
                        {sound.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex flex-col gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Reverb Wet Level</div>
          <div className="flex gap-1 h-12 items-end">
            {reverbAutomation.map((val, stepIdx) => (
              <div key={stepIdx} className={`flex-1 bg-zinc-800 rounded-sm relative group ${currentStep === stepIdx ? 'ring-1 ring-cyan-500' : ''}`} style={{ height: '100%' }}>
                  <input type="range" min="0" max="100" value={val} onChange={(e) => {
                    const newAuto = [...reverbAutomation];
                    newAuto[stepIdx] = parseInt(e.target.value);
                    onReverbAutomationChange(newAuto);
                  }} className="absolute inset-0 opacity-0 cursor-ns-resize" />
                  <div className={`absolute bottom-0 left-0 right-0 ${currentStep === stepIdx ? 'bg-purple-400' : 'bg-purple-500'} rounded-sm transition-all`} style={{ height: `${val}%` }} />
              </div>
            ))}
          </div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2">Delay Wet Level</div>
          <div className="flex gap-1 h-12 items-end">
            {delayAutomation.map((val, stepIdx) => (
              <div key={stepIdx} className={`flex-1 bg-zinc-800 rounded-sm relative group ${currentStep === stepIdx ? 'ring-1 ring-cyan-500' : ''}`} style={{ height: '100%' }}>
                  <input type="range" min="0" max="100" value={val} onChange={(e) => {
                    const newAuto = [...delayAutomation];
                    newAuto[stepIdx] = parseInt(e.target.value);
                    onDelayAutomationChange(newAuto);
                  }} className="absolute inset-0 opacity-0 cursor-ns-resize" />
                  <div className={`absolute bottom-0 left-0 right-0 ${currentStep === stepIdx ? 'bg-cyan-400' : 'bg-cyan-500'} rounded-sm transition-all`} style={{ height: `${val}%` }} />
              </div>
            ))}
          </div>
      </div>
      
      <button 
        onClick={addTrack}
        className="mt-4 w-full py-2 border border-dashed border-zinc-700 text-zinc-500 rounded hover:border-cyan-500 hover:text-cyan-400 transition-colors text-sm font-bold flex items-center justify-center gap-2"
      >
        <span>+ Add Track</span>
      </button>

      {contextMenu && (
        <div 
          className="fixed z-[100] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-1 w-48 flex flex-col gap-1"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 mb-1">
            Track Options
          </div>
          <button onClick={() => { copyTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><Copy className="w-3.5 h-3.5" />Copy Track</button>
          <button onClick={() => { pasteTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><Clipboard className="w-3.5 h-3.5" />Paste Track</button>
          <button onClick={() => { clearTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><X className="w-3.5 h-3.5" />Clear Pattern</button>
          <button onClick={() => { randomizeTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><Shuffle className="w-3.5 h-3.5" />Randomize</button>
          <button onClick={() => { reverseTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" />Reverse</button>
          <button onClick={() => { invertTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><FlipVertical className="w-3.5 h-3.5" />Invert</button>
          <button onClick={() => { shiftTrackLeft(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><ArrowLeft className="w-3.5 h-3.5" />Shift Left</button>
          <button onClick={() => { shiftTrackRight(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5" />Shift Right</button>
          <button onClick={() => { generateRiff(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-cyan-400 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" />Generate Riff</button>
          <button onClick={() => { duplicateTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><Copy className="w-3.5 h-3.5" />Duplicate Track</button>
          <button onClick={() => { randomizeVelocities(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><Zap className="w-3.5 h-3.5" />Randomize Velocities</button>
          <button onClick={() => { humanizeTiming(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><User className="w-3.5 h-3.5" />Humanize Timing</button>
          <button onClick={() => { deleteAllNotes(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 rounded flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" />Delete All Notes</button>
          <button onClick={() => { onToggleMute(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><VolumeX className="w-3.5 h-3.5" />{trackMutes[contextMenu.trackIdx] ? 'Unmute' : 'Mute'} Track</button>
          <button onClick={() => { onToggleSolo(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2"><Headphones className="w-3.5 h-3.5" />{trackSolos[contextMenu.trackIdx] ? 'Unsolo' : 'Solo'} Track</button>
          <button onClick={() => { onToggleCutSelf(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2">Cut Self</button>
          <button onClick={() => { onToggleSustain(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2">Add Sustain</button>
          <div className="h-px bg-zinc-800 my-1" />
          <button onClick={() => { removeTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" />Remove Track</button>
        </div>
      )}
      {stepEditor && (
        <div 
          className="fixed z-[100] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-3 w-48 flex flex-col gap-3"
          style={{ top: stepEditor.y, left: stepEditor.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
            <span>Edit Step</span>
            <span>{stepEditor.stepIdx + 1}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400 font-medium">Velocity</span>
            <input type="range" min="0" max="127" defaultValue="100" className="w-full accent-cyan-500" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400 font-medium">Pitch</span>
            <input type="range" min="-12" max="12" defaultValue="0" className="w-full accent-purple-500" />
          </div>
          <button onClick={() => setStepEditor(null)} className="w-full mt-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm font-semibold transition-colors">
            Done
          </button>
        </div>
      )}
    </div>
  );
}
