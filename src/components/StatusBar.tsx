export default function StatusBar({ 
  status, 
  undo, 
  redo, 
  canUndo, 
  canRedo, 
  onOpenHistory 
}: { 
  status: string, 
  undo: () => void, 
  redo: () => void, 
  canUndo: boolean, 
  canRedo: boolean,
  onOpenHistory: () => void
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-2 text-xs text-zinc-500 z-[200] flex justify-between items-center">
      <div>{status || 'Ready'}</div>
      <div className="flex gap-2">
        <button onClick={undo} disabled={!canUndo} className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30">Undo</button>
        <button onClick={redo} disabled={!canRedo} className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30">Redo</button>
        <button onClick={onOpenHistory} className="p-1 hover:bg-zinc-800 rounded">History</button>
      </div>
    </div>
  );
}
