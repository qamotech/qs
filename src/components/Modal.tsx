import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ onClose, title, children, fullscreen }: { onClose: () => void, title: string, children: React.ReactNode, fullscreen?: boolean }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200, ease: 'easeOut' }}
          className={`bg-zinc-950 border border-zinc-800 ${fullscreen ? 'rounded-none h-full w-full' : 'rounded-3xl w-full max-w-2xl'} p-6 shadow-2xl relative`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className={`${fullscreen ? 'h-[calc(100%-4rem)] overflow-auto' : ''}`}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
