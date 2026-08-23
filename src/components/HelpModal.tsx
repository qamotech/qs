import Modal from './Modal';

export default function HelpModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: 'Space', description: 'Start/Stop Playback' },
    { key: '?', description: 'Toggle Help Overlay' },
    { key: 'Ctrl/Cmd + S', description: 'Save Project' },
    { key: 'Ctrl/Cmd + Shift + R', description: 'Reset Project' },
    { key: 'Ctrl/Cmd + Z', description: 'Undo' },
    { key: 'Ctrl/Cmd + Y / Shift + Z', description: 'Redo' },
  ];

  return (
    <Modal onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-4">
        {shortcuts.map((s, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
            <span className="font-mono text-cyan-400 bg-cyan-950/50 px-2 py-1 rounded">{s.key}</span>
            <span className="text-zinc-300 text-sm">{s.description}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
