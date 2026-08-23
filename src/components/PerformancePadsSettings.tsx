export default function PerformancePadsSettings() {
  return (
    <div className="text-zinc-400 p-4">
      <h3 className="text-sm font-bold uppercase mb-4">Pad Effects</h3>
      <div className="grid grid-cols-2 gap-4">
        {['Bitcrush', 'Reverb', 'Delay', 'Filter'].map((fx) => (
          <button key={fx} className="p-2 bg-zinc-900 rounded border border-zinc-700 hover:border-cyan-500">
            {fx}
          </button>
        ))}
      </div>
    </div>
  );
}
