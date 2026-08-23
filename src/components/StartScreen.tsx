import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">
          SEQUENCER<span className="text-cyan-500">.</span>
        </h1>
        <button
          onClick={onStart}
          className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-cyan-400 transition-colors"
        >
          <Play className="w-5 h-5 fill-current" />
          ENTER STUDIO
        </button>
      </motion.div>
    </motion.div>
  );
}
