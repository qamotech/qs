import { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, AudioWaveform, Save, RotateCcw, Undo2, Redo2, Volume2, Loader2, Sparkles, Wand2, Play, Square, Trash2, Mic } from 'lucide-react';

import { useProject } from './hooks/useProject';
import { audioEngine } from './audio/AudioEngine';
import { SpectralAnalyzer, MasterLimiter, TapeSaturation, MultiBandCompressor, LfoModulator, ReverbChamber, ChordGenerator, Arpeggiator, EnhancementsRack } from './components/NewFeatures';

const StepSequencer = lazy(() => import('./components/StepSequencer'));
const PerformancePads = lazy(() => import('./components/PerformancePads'));
const DjScratch = lazy(() => import('./components/DjScratch'));
const Oscilloscope = lazy(() => import('./components/Oscilloscope'));
const MasterEq = lazy(() => import('./components/MasterEq'));
const AiBeatbox = lazy(() => import('./components/AiBeatbox'));
const SpatialPanner = lazy(() => import('./components/SpatialPanner'));
const SynthTweaker = lazy(() => import('./components/SynthTweaker'));
const MasterPitchWheel = lazy(() => import('./components/MasterPitchWheel'));
const MasterEffects = lazy(() => import('./components/MasterEffects'));
const SamplePacks = lazy(() => import('./components/SamplePacks'));

function Loader() {
  return (
    <div className="flex items-center justify-center h-48 w-full">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-500/50" />
    </div>
  );
}

export default function App() {
  const [started, setStarted] = useState(false);
  const { 
    project, 
    isPlaying,
    togglePlay,
    saveProject, 
    resetProject, 
    updateActivePack,
    updateBpm,
    updateVolume,
    updateSequencerGrid, 
    updateSynthParams, 
    updateEqLevels, 
    updatePannerPosition,
    updateSwing,
    updateReverb,
    updateDelay,
    toggleTrackMute,
    toggleTrackSolo,
    updateTrackSound,
    updateFilterType,
    generateRandomPattern,
    undo,
    redo,
    canUndo,
    canRedo,
    addTrack,
    removeTrack,
    copyTrack,
    pasteTrack,
    clearTrack,
    randomizeTrack,
    applyChord
  } = useProject();

  useEffect(() => {
    audioEngine.setSamplePack(project.activePack);
    audioEngine.setEqLevels(project.eqLevels);
    audioEngine.setSynthParams(project.synthParams);
    audioEngine.setPannerPosition(project.pannerPosition);
    audioEngine.setVolume(project.volume / 100);
    audioEngine.setEffects(project.reverb, project.delay, project.filterType);
  }, [
    project.activePack, 
    project.eqLevels, 
    project.synthParams, 
    project.pannerPosition, 
    project.volume,
    project.reverb,
    project.delay,
    project.filterType
  ]);

  useEffect(() => {
    if (!started) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        resetProject();
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, togglePlay, saveProject, resetProject, undo, redo]);

  return (
    <div className="h-screen w-screen bg-black text-zinc-300 font-mono flex flex-col items-center justify-center relative overflow-hidden">
      
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="start-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black"
          >
            {/* Immersive background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.15)_0%,rgba(0,0,0,1)_50%)] animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex flex-col items-center justify-center max-w-lg w-full border border-zinc-800/50 bg-zinc-900/40 p-12 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-3xl blur opacity-20 animate-pulse" />
              <div className="w-32 h-32 mb-8 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)] relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping" style={{ animationDuration: '3s' }} />
                <AudioWaveform className="w-16 h-16 text-white relative z-10 drop-shadow-lg" />
              </div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 mb-4 text-center tracking-tighter">Qamelot Studio</h1>
              <p className="text-zinc-400 text-center mb-12 text-lg font-light tracking-wide max-w-sm">
                Premastered HipHop, Pop & RnB Audio Production Workstation
              </p>
              <button
                onClick={() => setStarted(true)}
                className="group relative w-full py-5 bg-zinc-100 hover:bg-white text-black rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Initialize Engine
                </span>
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="main-studio"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex flex-col bg-[#0a0a0c] overflow-hidden relative electricity-border"
          >
            {/* Header / Top Bar */}
            <header className="h-16 shrink-0 border-b border-zinc-800/80 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur z-20 relative shadow-md">
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <AudioWaveform className="text-cyan-400 w-6 h-6 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-black text-zinc-100 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 hidden lg:block">Qamelot</h2>
                </div>
                
                {/* Transport Controls (Always Visible) */}
                <div className="flex items-center justify-center gap-2 md:gap-4 flex-1 px-4">
                  <div className="flex items-center gap-1 bg-zinc-900 px-2 md:px-3 py-1.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hidden md:inline">Swing</span>
                    <input 
                      type="number" 
                      value={project.swing}
                      onChange={(e) => updateSwing(Number(e.target.value))}
                      className="w-10 bg-transparent text-xs md:text-sm text-cyan-400 font-bold text-center outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-900 px-2 md:px-3 py-1.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hidden md:inline">BPM</span>
                    <input 
                      type="number" 
                      value={project.bpm}
                      onChange={(e) => updateBpm(Number(e.target.value))}
                      className="w-10 md:w-12 bg-transparent text-xs md:text-sm text-cyan-400 font-bold text-center outline-none"
                      min="40"
                      max="300"
                    />
                  </div>
                  
                  <div className="w-px h-6 bg-zinc-800 mx-1 md:mx-2" />
                  
                  <button 
                    onClick={togglePlay}
                    className={`p-2 px-3 md:px-6 rounded-lg flex items-center justify-center transition-all duration-300 gap-2 font-bold ${isPlaying ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/50 hover:bg-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'}`}
                  >
                    {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span className="hidden md:inline">{isPlaying ? 'STOP' : 'PLAY'}</span>
                  </button>

                  <button className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors electric-record" title="Record">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                  </button>
                  <button className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 transition-colors" title="Metronome">
                    <span className="text-[10px] font-bold">METRO</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex items-center gap-1">
                    <button 
                      onClick={undo}
                      disabled={!canUndo}
                      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${canUndo ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-600 cursor-not-allowed'}`}
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={redo}
                      disabled={!canRedo}
                      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${canRedo ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-600 cursor-not-allowed'}`}
                      title="Redo (Ctrl+Shift+Z)"
                    >
                      <Redo2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="hidden md:block w-px h-6 bg-zinc-800 mx-1" />
                  
                  <button 
                    onClick={saveProject}
                    className="p-1.5 md:p-2 md:px-4 bg-cyan-500 hover:bg-cyan-400 rounded-lg transition-all duration-300 flex items-center gap-2 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] border border-cyan-400"
                    title="Save Project (Ctrl+S)"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-xs md:text-sm font-bold hidden xl:inline">Save</span>
                  </button>
                  
                  <div className="hidden md:flex items-center gap-2 px-2 bg-zinc-900/50 rounded-lg py-1.5 border border-zinc-800 ml-2" title="Master Volume">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={project.volume}
                      onChange={(e) => updateVolume(Number(e.target.value))}
                      className="w-16 md:w-24 accent-cyan-500 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </header>
  
              {/* Main Workspace Grid - Full Height */}
              <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden relative z-10">
                
                {/* Left Column: Sequencer & Synthesis */}
                <div className="col-span-12 xl:col-span-8 flex flex-col gap-6 overflow-y-auto pr-2 pb-24 custom-scrollbar">
                  <Suspense fallback={<Loader />}>
                    <SamplePacks activePack={project.activePack} onChange={updateActivePack} />
                    <StepSequencer 
                      grid={project.sequencerGrid} 
                      onGridChange={updateSequencerGrid} 
                      isPlaying={isPlaying}
                      onTogglePlay={togglePlay}
                      bpm={project.bpm}
                      onBpmChange={updateBpm}
                      swing={project.swing}
                      onSwingChange={updateSwing}
                      trackMutes={project.trackMutes}
                      onToggleMute={toggleTrackMute}
                      trackSolos={project.trackSolos}
                      onToggleSolo={toggleTrackSolo}
                      trackSounds={project.trackSounds}
                      onTrackSoundChange={updateTrackSound}
                      onClearGrid={() => updateSequencerGrid(project.sequencerGrid.map(row => row.map(() => false)))}
                      addTrack={addTrack}
                      removeTrack={removeTrack}
                      copyTrack={copyTrack}
                      pasteTrack={pasteTrack}
                      clearTrack={clearTrack}
                      randomizeTrack={randomizeTrack}
                      applyChord={applyChord}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <PerformancePads />
                      <DjScratch />
                    </div>
  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SynthTweaker params={project.synthParams} onChange={updateSynthParams} />
                      <ChordGenerator />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Arpeggiator />
                      <LfoModulator />
                    </div>
                  </Suspense>
                </div>
  
                {/* Right Column: Mix, Mastering, & Analysis */}
                <div className="col-span-12 xl:col-span-4 flex flex-col gap-6 pb-24 overflow-y-auto pr-2 custom-scrollbar border-l border-zinc-800/50 pl-6">
                  <Suspense fallback={<Loader />}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-zinc-400 font-bold tracking-widest text-xs uppercase">Processing</h3>
                      <div className="h-px bg-zinc-800 flex-1 ml-4" />
                    </div>
                    <EnhancementsRack />
                    <MasterEq levels={project.eqLevels} onChange={updateEqLevels} />
                    <MultiBandCompressor />
                    <TapeSaturation />
                    
                    <div className="flex items-center justify-between mt-4">
                      <h3 className="text-zinc-400 font-bold tracking-widest text-xs uppercase">Spatial & FX</h3>
                      <div className="h-px bg-zinc-800 flex-1 ml-4" />
                    </div>
                    <MasterEffects 
                      reverb={project.reverb}
                      onReverbChange={updateReverb}
                      delay={project.delay}
                      onDelayChange={updateDelay}
                      filterType={project.filterType}
                      onFilterTypeChange={updateFilterType}
                    />
                    <ReverbChamber />
                    <div className="grid grid-cols-2 gap-6">
                      <SpatialPanner position={project.pannerPosition} onChange={updatePannerPosition} />
                      <MasterPitchWheel />
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <h3 className="text-zinc-400 font-bold tracking-widest text-xs uppercase">Mastering</h3>
                      <div className="h-px bg-zinc-800 flex-1 ml-4" />
                    </div>
                    <MasterLimiter />
                    <AiBeatbox onGenerate={generateRandomPattern} />

                    <div className="flex items-center justify-between mt-4">
                      <h3 className="text-zinc-400 font-bold tracking-widest text-xs uppercase">Analysis</h3>
                      <div className="h-px bg-zinc-800 flex-1 ml-4" />
                    </div>
                    <Oscilloscope />
                    <SpectralAnalyzer />
                  </Suspense>
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
