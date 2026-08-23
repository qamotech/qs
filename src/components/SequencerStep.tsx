import React from 'react';
import { motion } from 'framer-motion';

interface SequencerStepProps {
  isActive: boolean;
  isCurrent: boolean;
  sustain: boolean;
  stepIdx: number;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
}

const SequencerStep = React.memo(({ isActive, isCurrent, sustain, stepIdx, onClick, onContextMenu, onMouseEnter }: SequencerStepProps) => {
  return (
    <motion.div
      data-step={stepIdx}
      data-isactive={isActive}
      onMouseDown={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      animate={{
        scale: isCurrent ? (isActive ? 1.15 : 1.1) : (isActive ? 1.05 : 1),
      }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={`
        aspect-[4/5] rounded cursor-pointer transition-colors relative overflow-hidden
        ${isActive ? 'bg-emerald-500 border-t border-emerald-300 border-b-2 border-b-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2)]' : 'bg-zinc-900 border-t border-zinc-700 border-b-2 border-b-black hover:bg-zinc-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(0,0,0,0.4)]'}
      `}
    >
      {isCurrent && (
        <motion.div 
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute inset-0 bg-white pointer-events-none shadow-[inset_0_0_15px_rgba(255,255,255,0.6)]" 
        />
      )}
      {isActive && sustain && (
        <motion.div
          animate={{
            scaleY: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-full h-1/2 bg-emerald-300 origin-bottom"
        />
      )}
    </motion.div>
  );
});

SequencerStep.displayName = 'SequencerStep';

export default SequencerStep;
