import { useState, useEffect, useRef } from 'react';
import { ListMusic, Play, Square, Trash2, VolumeX, Headphones, Search } from 'lucide-react';
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
  trackMutes,
  onToggleMute,
  trackSolos,
  onToggleSolo,
  trackSounds,
  onTrackSoundChange,
  onClearGrid,
  addTrack,
  removeTrack,
  copyTrack,
  pasteTrack,
  clearTrack,
  randomizeTrack
}: { 
  grid: boolean[][], 
  onGridChange: (grid: boolean[][]) => void,
  isPlaying: boolean,
  onTogglePlay: () => void,
  bpm: number,
  onBpmChange: (bpm: number) => void,
  swing: number,
  onSwingChange: (swing: number) => void,
  trackMutes: boolean[],
  onToggleMute: (idx: number) => void,
  trackSolos: boolean[],
  onToggleSolo: (idx: number) => void,
  trackSounds: string[],
  onTrackSoundChange: (idx: number, soundId: string) => void,
  onClearGrid: () => void,
  addTrack: () => void,
  removeTrack: (idx: number) => void,
  copyTrack: (idx: number) => void,
  pasteTrack: (idx: number) => void,
  clearTrack: (idx: number) => void,
  randomizeTrack: (idx: number) => void,
  applyChord: (idx: number, notes: string[]) => void,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const timeoutRef = useRef<number | null>(null);
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

  useEffect(() => {
    if (isPlaying) {
      audioEngine.init();
      
      let step = currentStep;
      
      const scheduleNextStep = () => {
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
            }
          }
        });

        const nextStep = (step + 1) % 16;
        setCurrentStep(nextStep);
        step = nextStep;
        
        const baseDelay = 60000 / (bpm * 4); // 16th note in ms
        let delay = baseDelay;
        
        // Swing logic: if the next step is an off-beat (odd number), delay it. If it's an on-beat, shorten the previous delay.
        // Actually, it's easier to just adjust the delay to the next step.
        // If current step is even, the delay to the next step (odd) is lengthened.
        // If current step is odd, the delay to the next step (even) is shortened.
        const swingFactor = swing / 100; // 0 to 1
        const maxSwing = baseDelay * 0.6; // max delay added
        
        if (step % 2 === 1) { // next step is odd
          delay += swingFactor * maxSwing;
        } else { // next step is even
          delay -= swingFactor * maxSwing;
        }

        timeoutRef.current = window.setTimeout(scheduleNextStep, delay);
      };

      // Start immediately
      scheduleNextStep();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, grid, bpm, swing, trackMutes, trackSolos]);

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
      }
    }
    
    onGridChange(newGrid);
  };

  return (
    <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:shadow-cyan-500/10 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <ListMusic className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-zinc-200">Step Sequencer</h3>
      </div>

      <div className="flex flex-col gap-2 relative">
        {grid.map((_, trackIdx) => (
          <div key={trackIdx} className="flex flex-col gap-1 relative">
            <div 
              className={`flex items-center gap-2 md:gap-4 p-1 rounded transition-colors ${dragOverTrack === trackIdx ? 'bg-cyan-500/20 border border-cyan-500' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverTrack(trackIdx);
              }}
              onDragLeave={() => setDragOverTrack(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverTrack(null);
                try {
                  const data = JSON.parse(e.dataTransfer.getData('application/json'));
                  if (data.type === 'chord' && data.notes) {
                    applyChord(trackIdx, data.notes);
                  }
                } catch (err) {}
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ trackIdx, x: e.clientX, y: e.clientY });
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                timeoutRef.current = window.setTimeout(() => {
                  setContextMenu({ trackIdx, x: touch.clientX, y: touch.clientY });
                }, 500);
              }}
              onTouchEnd={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
              }}
              onTouchMove={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
              }}
            >
              <div 
                className="w-24 flex items-center justify-between cursor-pointer hover:bg-zinc-800 p-1 rounded transition-colors"
                onClick={() => {
                  if (editingTrack === trackIdx) setEditingTrack(null);
                  else {
                    setEditingTrack(trackIdx);
                    setSearchQuery('');
                  }
                }}
              >
                <span className="text-[10px] font-bold text-zinc-300 truncate w-full" title={SOUND_LIBRARY.find(s => s.id === trackSounds[trackIdx])?.name || 'Sound'}>
                  {SOUND_LIBRARY.find(s => s.id === trackSounds[trackIdx])?.name || 'Sound'}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => onToggleMute(trackIdx)}
                  className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all ${trackMutes[trackIdx] ? 'bg-red-500 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                  title="Mute"
                >
                  <span className="text-[10px] font-bold tracking-tighter">M</span>
                </button>
                <button 
                  onClick={() => onToggleSolo(trackIdx)}
                  className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all ${trackSolos[trackIdx] ? 'bg-yellow-500 border-yellow-400 text-zinc-900 shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                  title="Solo"
                >
                  <span className="text-[10px] font-bold tracking-tighter">S</span>
                </button>
              </div>
              <div className="flex-1 grid grid-cols-[16] gap-1" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                {grid[trackIdx].map((isActive, stepIdx) => (
                  <div
                    key={stepIdx}
                    onClick={() => toggleCell(trackIdx, stepIdx)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isActive) {
                        setStepEditor({ trackIdx, stepIdx, x: e.clientX, y: e.clientY });
                      }
                    }}
                    className={`
                      aspect-[4/5] rounded bg-zinc-900 border cursor-pointer transition-all relative overflow-hidden
                      ${isActive ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-[1.05]' : 'border-zinc-800 hover:bg-zinc-800'}
                      ${stepIdx % 4 === 0 && !isActive ? 'bg-zinc-800/80' : ''}
                    `}
                  >
                    {currentStep === stepIdx && (
                      <div className="absolute inset-0 bg-white/30 rounded border border-white/50 pointer-events-none shadow-[inset_0_0_15px_rgba(255,255,255,0.4)]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {editingTrack === trackIdx && (
              <div className="absolute left-24 top-full mt-2 p-3 bg-zinc-800 border border-zinc-600 rounded-lg shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 w-[300px] md:w-[400px]">
                <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded border border-zinc-700 mb-2">
                  <Search className="w-4 h-4 text-zinc-500" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search sounds..."
                    className="bg-transparent text-sm text-zinc-200 outline-none w-full"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {SOUND_LIBRARY.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase())).map(sound => (
                    <button
                      key={sound.id}
                      onClick={() => {
                        audioEngine.init();
                        onTrackSoundChange(trackIdx, sound.id);
                        audioEngine.playSound(trackIdx, sound.id);
                        setEditingTrack(null);
                      }}
                      className={`text-left px-2 py-1.5 rounded text-xs transition-colors truncate ${trackSounds[trackIdx] === sound.id ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/50' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                      title={sound.name}
                    >
                      {sound.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
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
          <button onClick={() => { copyTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded">Copy Track</button>
          <button onClick={() => { pasteTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded">Paste Track</button>
          <button onClick={() => { clearTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded">Clear Pattern</button>
          <button onClick={() => { randomizeTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded">Randomize</button>
          <button onClick={() => { onToggleMute(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded">{trackMutes[contextMenu.trackIdx] ? 'Unmute' : 'Mute'} Track</button>
          <button onClick={() => { onToggleSolo(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded">{trackSolos[contextMenu.trackIdx] ? 'Unsolo' : 'Solo'} Track</button>
          <div className="h-px bg-zinc-800 my-1" />
          <button onClick={() => { removeTrack(contextMenu.trackIdx); setContextMenu(null); }} className="w-full text-left px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded">Remove Track</button>
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
