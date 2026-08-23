import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({ 
  children, 
  text, 
  shortcut 
}: { 
  children: React.ReactNode; 
  text: string; 
  shortcut?: string; 
}) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 500);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 px-2 py-1 bg-zinc-800 text-zinc-100 text-xs rounded border border-zinc-700 whitespace-nowrap pointer-events-none -top-8 left-1/2 -translate-x-1/2"
          >
            {text}
            {shortcut && <span className="ml-2 text-zinc-500 font-mono">[{shortcut}]</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
