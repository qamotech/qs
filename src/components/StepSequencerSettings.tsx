export default function StepSequencerSettings() {
  return (
    <div className="text-zinc-400 p-4">
      <h3 className="text-sm font-bold uppercase mb-4">Sequencer Config</h3>
      <div className="flex gap-4 mb-4">
        <label>Octave: <input type="number" defaultValue={3} className="bg-zinc-900 border border-zinc-700 w-16 p-1"/></label>
        <label>Note: <input type="text" defaultValue="C" className="bg-zinc-900 border border-zinc-700 w-16 p-1"/></label>
      </div>
    </div>
  );
}
