import { motion } from 'framer-motion';
import React from 'react';

const AutomationLane = React.memo(({ 
  label, 
  values, 
  onChange 
}: { 
  label: string, 
  values: number[], 
  onChange: (values: number[]) => void 
}) => {
  const updateValue = (index: number, newValue: number) => {
    const next = [...values];
    next[index] = newValue;
    onChange(next);
  };

  return (
    <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{label}</h4>
      <div className="flex gap-1 h-16 items-end">
        {values.map((val, i) => (
          <div 
            key={i} 
            className="flex-1 flex flex-col items-center group cursor-pointer"
            onMouseMove={(e) => {
              if (e.buttons === 1) {
                const rect = e.currentTarget.getBoundingClientRect();
                const newVal = Math.max(0, Math.min(100, Math.round(((rect.bottom - e.clientY) / rect.height) * 100)));
                updateValue(i, newVal);
              }
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const newVal = Math.max(0, Math.min(100, Math.round(((rect.bottom - e.clientY) / rect.height) * 100)));
              updateValue(i, newVal);
            }}
          >
            <div className="w-full bg-zinc-800 rounded-sm relative h-full flex items-end">
              <motion.div 
                className="w-full bg-cyan-500/50 group-hover:bg-cyan-400 rounded-sm"
                animate={{ height: `${val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

AutomationLane.displayName = 'AutomationLane';

export default AutomationLane;
