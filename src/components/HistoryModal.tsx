import Modal from './Modal';
import { ProjectData } from '../hooks/useProject';

export default function HistoryModal({ 
  onClose, 
  history, 
  currentIndex, 
  onJumpTo 
}: { 
  onClose: () => void, 
  history: ProjectData[], 
  currentIndex: number, 
  onJumpTo: (index: number) => void 
}) {
  return (
    <Modal onClose={onClose} title="Edit History">
      <div className="space-y-2">
        {history.map((_, index) => (
          <button
            key={index}
            onClick={() => onJumpTo(index)}
            className={`w-full p-3 rounded-lg text-left flex justify-between items-center ${
              index === currentIndex 
                ? 'bg-purple-600/30 border border-purple-500' 
                : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            <span>Edit State {index + 1}</span>
            {index === currentIndex && <span className="text-xs text-purple-300">Current</span>}
          </button>
        ))}
      </div>
    </Modal>
  );
}
