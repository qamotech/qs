import React from 'react';
import { SOUND_LIBRARY } from '../audio/SoundLibrary';
import { VolumeX, Headphones, X, Shuffle } from 'lucide-react';
import SequencerStep from './SequencerStep';

interface SequencerTrackProps {
  trackIdx: number;
  steps: boolean[];
  currentStep: number;
  trackMute: boolean;
  trackSolo: boolean;
  trackSustain: boolean;
  trackSound: string;
  onToggleCell: (stepIdx: number) => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onClear: () => void;
  onRandomize: () => void;
  onTrackEdit: () => void;
  onSetStepEditor: (stepIdx: number, e: React.MouseEvent) => void;
  onTrackContextMenu: (e: React.MouseEvent) => void;
}

const SequencerTrack = React.memo(({
  trackIdx,
  steps,
  currentStep,
  trackMute,
  trackSolo,
  trackSustain,
  trackSound,
  onToggleCell,
  onToggleMute,
  onToggleSolo,
  onClear,
  onRandomize,
  onTrackEdit,
  onSetStepEditor,
  onTrackContextMenu,
  onDragEnter,
  onDragLeave
}: SequencerTrackProps & { onDragEnter: () => void, onDragLeave: () => void }) => {
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  return (
    <div 
        className="flex items-center gap-2 md:gap-4 p-1 rounded"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onContextMenu={onTrackContextMenu}
    >
      <div 
        className="w-24 flex items-center justify-between cursor-pointer hover:bg-zinc-900/50 p-1.5 rounded-lg border border-transparent hover:border-zinc-800 transition-all"
        onClick={onTrackEdit}
      >
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest truncate w-full" title={SOUND_LIBRARY.find(s => s.id === trackSound)?.name || 'Sound'}>
          {SOUND_LIBRARY.find(s => s.id === trackSound)?.name || 'Sound'}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <div className="w-1.5 h-6 bg-zinc-950 rounded-sm overflow-hidden flex flex-col-reverse border border-zinc-800">
            <div 
              id={`peak-meter-${trackIdx}`}
              className="bg-gradient-to-t from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
              style={{ height: '0%' }}
            />
        </div>
        <button 
          onClick={onToggleMute}
          className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all ${trackMute ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_12px_rgba(220,38,38,0.4)]' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-red-400/70 hover:border-red-900/50'}`}
          title="Mute"
        >
          <span className="text-[9px] font-bold tracking-tighter">M</span>
        </button>
        <button 
          onClick={onToggleSolo}
          className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all ${trackSolo ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-amber-400/70 hover:border-amber-900/50'}`}
          title="Solo"
        >
          <span className="text-[9px] font-bold tracking-tighter">S</span>
        </button>
        <button 
          onClick={onClear}
          className="w-6 h-6 flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
          title="Clear"
        >
          <span className="text-[9px] font-bold tracking-tighter">C</span>
        </button>
        <button 
          onClick={onRandomize}
          className="w-6 h-6 flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
          title="Randomize"
        >
          <span className="text-[9px] font-bold tracking-tighter">R</span>
        </button>
      </div>
      <div 
        className="flex-1 grid grid-cols-[16] gap-1" 
        style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
        onMouseLeave={() => setIsMouseDown(false)}
        onTouchStart={() => setIsMouseDown(true)}
        onTouchEnd={() => setIsMouseDown(false)}
        onTouchCancel={() => setIsMouseDown(false)}
        onTouchMove={(e) => {
          if (!isMouseDown) return;
          const touch = e.touches[0];
          const el = document.elementFromPoint(touch.clientX, touch.clientY);
          if (el && el.hasAttribute('data-step')) {
            const stepIdx = parseInt(el.getAttribute('data-step') || '0', 10);
            const isActive = el.getAttribute('data-isactive') === 'true';
            if (!isActive) {
               onToggleCell(stepIdx);
            }
          }
        }}
      >
        {steps.map((isActive, stepIdx) => (
          <SequencerStep
            key={stepIdx}
            stepIdx={stepIdx}
            isActive={isActive}
            isCurrent={currentStep === stepIdx}
            sustain={trackSustain}
            onClick={() => onToggleCell(stepIdx)}
            onContextMenu={(e) => onSetStepEditor(stepIdx, e)}
            onMouseEnter={() => {
                if (isMouseDown && !isActive) {
                    onToggleCell(stepIdx);
                }
            }}
          />
        ))}
      </div>
    </div>
  );
});


SequencerTrack.displayName = 'SequencerTrack';

export default SequencerTrack;
