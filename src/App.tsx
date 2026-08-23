import { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, AudioWaveform, Save, RotateCcw, Undo2, Redo2, Volume2, Loader2, Sparkles, Sword, Play, Square, Trash2, Mic, Shield, Maximize2, HelpCircle } from 'lucide-react';
import { useAudioIntensity } from './hooks/useAudioIntensity';

import Stars from './components/Stars';
import StartScreen from './components/StartScreen';
import StatusBar from './components/StatusBar';
import Tooltip from './components/Tooltip';
import HistoryModal from './components/HistoryModal';
import HelpModal from './components/HelpModal';
import Modal from './components/Modal';
import ThemeSwitcher from './components/ThemeSwitcher';
import { useProject } from './hooks/useProject';
import { MidiProvider } from './hooks/useMidi';
import { audioEngine } from './audio/AudioEngine';
import { SpectralAnalyzer, MasterLimiter, TapeSaturation, MultiBandCompressor, LfoModulator, ReverbChamber, ChordGenerator, Arpeggiator, EnhancementsRack } from './components/NewFeatures';
import PerformancePadsSettings from './components/PerformancePadsSettings';
import StepSequencerSettings from './components/StepSequencerSettings';

const StepSequencer = lazy(() => import('./components/StepSequencer'));
const PerformancePads = lazy(() => import('./components/PerformancePads'));
const Oscilloscope = lazy(() => import('./components/Oscilloscope'));
const MasterEq = lazy(() => import('./components/MasterEq'));
import AiBeatbox from './components/AiBeatbox';
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
  const intensity = useAudioIntensity();
  const [started, setStarted] = useState(false);
  const [isPadsModalOpen, setPadsModalOpen] = useState(false);
  const [isSequencerModalOpen, setSequencerModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [theme, setTheme] = useState<'midnight' | 'qamelot'>('midnight');
  const [status, setStatus] = useState('');
  const { 
    project, 
    isPlaying,
    activeUsers,
    cursors,
    broadcastCursor,
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
    updateReverbAutomation,
    updateDelay,
    updateDelayAutomation,
    updateMasterAutomation,
    toggleTrackMute,
    toggleTrackSolo,
    updateTrackSound,
    updateFilterType,
    generateRandomPattern,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    currentIndex,
    jumpTo,
    addTrack,
    removeTrack,
    reorderTracks,
    copyTrack,
    pasteTrack,
    clearTrack,
    randomizeTrack,
    reverseTrack,
    invertTrack,
    shiftTrackLeft,
    shiftTrackRight,
    generateRiff,
    applyChord,
    duplicateTrack,
    randomizeVelocities,
    humanizeTiming,
    deleteAllNotes,
    updateSnapToGrid,
    toggleTrackCutSelf,
    toggleTrackSustain
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

      if (e.key === '?') {
        e.preventDefault();
        setHelpModalOpen(prev => !prev);
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

  const handleGenerateSkeleton = (skeleton: { grid: boolean[][], sounds: string[] }) => {
    updateSequencerGrid(skeleton.grid);
    skeleton.sounds.forEach((sound, i) => {
      updateTrackSound(i, sound);
    });
    setStatus('AI Song Skeleton generated successfully!');
  };

  return (
    <MidiProvider>
      <AnimatePresence>
        {!started && <StartScreen onStart={() => setStarted(true)} />}
      </AnimatePresence>
      <div className={`h-screen w-screen font-mono flex flex-col items-center justify-center relative overflow-hidden film-grain ${theme === 'qamelot' ? 'theme-qamelot' : 'theme-midnight'} bg-app text-app`}>
        
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
            <Stars />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.15)_0%,rgba(0,0,0,1)_50%)] animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex flex-col items-center justify-center max-w-lg w-full bg-zinc-950/80 backdrop-blur-3xl border border-zinc-800 p-16 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10"
            >
              {/* Logo Area */}
              <div className="mb-10 relative">
                <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="relative p-6 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(0,0,0,0.5)]">
                  <Shield className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                </div>
              </div>
              
              {/* Branding */}
              <h1 className="text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 mb-4 text-center tracking-tight [text-shadow:2px_2px_0px_rgba(0,0,0,0.5)]">Qamelot Studio</h1>
              <p className="text-zinc-400 text-center mb-12 text-sm font-light tracking-[0.2em] uppercase max-w-sm">
                Premastered Audio Production Workstation
              </p>

              {/* Start Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStarted(true)}
                className="group relative w-full max-w-xs py-5 bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-600 hover:border-cyan-500 text-zinc-100 rounded-2xl font-bold text-lg uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Sword className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                  Initialize Engine
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <>
            <motion.div
              key="main-studio"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                boxShadow: `0 0 ${intensity * 40}px rgba(6, 182, 212, ${intensity * 0.2})` 
              }}
              transition={{ duration: 0.5 }}
              className="w-full h-full flex flex-col bg-app-gradient overflow-hidden relative electricity-border"
              onMouseMove={(e) => broadcastCursor(e.clientX, e.clientY)}
            >
              {/* Remote Cursors */}
              {Object.entries(cursors).map(([id, cursor]) => (
                <div 
                  key={id}
                  className="pointer-events-none fixed z-50 flex flex-col items-center"
                  style={{ 
                    left: cursor.x, 
                    top: cursor.y,
                    transform: 'translate(-50%, -10px)'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}>
                    <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L5.5 3.21z" fill={cursor.color} stroke="white" strokeWidth="1.5"/>
                  </svg>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm mt-1" style={{ backgroundColor: cursor.color }}>
                    {id}
                  </span>
                </div>
              ))}
              {/* Header / Top Bar */}
              <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md z-20 relative shadow-md">
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <AudioWaveform className="text-cyan-400 w-6 h-6 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-black text-transparent bg-gradient-to-r from-zinc-200 to-zinc-500 bg-clip-text hidden lg:block tracking-widest">Qamelot</h2>
                  
                  {/* Collaboration Presence */}
                  <div className="hidden md:flex items-center gap-1 ml-4 border-l border-zinc-800 pl-4">
                    {activeUsers.map(user => (
                      <div 
                        key={user.id} 
                        className="w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shadow-inner"
                        style={{ backgroundColor: user.color }}
                        title={user.id}
                      >
                        {user.id.charAt(0)}
                      </div>
                    ))}
                    <div className="text-xs text-zinc-500 ml-2 font-mono">{activeUsers.length} Online</div>
                  </div>
                </div>
                
                {/* Transport Controls (Always Visible) */}
                <div className="flex items-center justify-center gap-2 md:gap-4 flex-1 px-4">
                  <div className="flex items-center gap-1 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800 shadow-inner focus-within:ring-1 focus-within:ring-emerald-500/50">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hidden md:inline">Swing</span>
                    <input 
                      type="number" 
                      value={project.swing}
                      onChange={(e) => updateSwing(Number(e.target.value))}
                      className="w-10 bg-transparent text-xs md:text-sm text-zinc-300 font-bold text-center outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800 shadow-inner focus-within:ring-1 focus-within:ring-emerald-500/50">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hidden md:inline">BPM</span>
                    <input 
                      type="number" 
                      value={project.bpm}
                      onChange={(e) => updateBpm(Number(e.target.value))}
                      className="w-10 md:w-12 bg-transparent text-xs md:text-sm text-zinc-300 font-bold text-center outline-none"
                      min="40"
                      max="300"
                    />
                  </div>
                  
                  <div className="w-px h-6 bg-zinc-800 mx-1 md:mx-2" />
                  
                  <Tooltip text={isPlaying ? 'Stop Playback' : 'Start Playback'} shortcut="Space">
                  <button 
                    onClick={togglePlay}
                    className={`p-2 px-3 md:px-6 rounded-full flex items-center justify-center transition-all duration-300 gap-2 font-bold text-xs uppercase tracking-widest ${isPlaying ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700 shadow-sm'}`}
                  >
                    {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span className="hidden md:inline">{isPlaying ? 'STOP' : 'PLAY'}</span>
                  </button>
                </Tooltip>

                  {isPlaying && (
                    <button 
                      onClick={() => {
                        // Reset logic: Stop playback and reset step
                        togglePlay(); // This will stop playback if already playing
                        // Note: StepSequencer component manages currentStep, so triggering reset from here requires a ref or context update.
                        // For now, let's just trigger stop and hope the UI updates.
                      }}
                      className="p-2 px-3 rounded-lg flex items-center justify-center transition-all duration-300 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  <button className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors electric-record" title="Record">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                  </button>
                  <button className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 transition-colors" title="Metronome">
                    <span className="text-[10px] font-bold">METRO</span>
                  </button>
                  <Tooltip text="Keyboard Shortcuts" shortcut="?">
                    <button onClick={() => setHelpModalOpen(true)} className="p-2 text-zinc-400 hover:text-cyan-400 transition-colors">
                      <HelpCircle className="w-5 h-5" />
                    </button>
                  </Tooltip>
                  <ThemeSwitcher theme={theme} onChange={setTheme} />
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
                    <motion.input
                      animate={{
                        boxShadow: `0 0 ${intensity * 10}px rgba(6, 182, 212, ${intensity * 0.5})`
                      }}
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
                      reverbAutomation={project.reverbAutomation}
                      onReverbAutomationChange={updateReverbAutomation}
                      delayAutomation={project.delayAutomation}
                      onDelayAutomationChange={updateDelayAutomation}
                      snapToGrid={project.snapToGrid}
                      onSnapToGridChange={updateSnapToGrid}
                      filterType={project.filterType}
                      trackMutes={project.trackMutes}
                      onToggleMute={toggleTrackMute}
                      trackSolos={project.trackSolos}
                      onToggleSolo={toggleTrackSolo}
                      trackCutSelf={project.trackCutSelf}
                      onToggleCutSelf={toggleTrackCutSelf}
                      trackSustain={project.trackSustain}
                      onToggleSustain={toggleTrackSustain}
                      trackSounds={project.trackSounds}
                      onTrackSoundChange={updateTrackSound}
                      onClearGrid={() => updateSequencerGrid(project.sequencerGrid.map(row => row.map(() => false)))}
                      addTrack={addTrack}
                      removeTrack={removeTrack}
                      copyTrack={copyTrack}
                      pasteTrack={pasteTrack}
                      clearTrack={clearTrack}
                      randomizeTrack={randomizeTrack}
                      reverseTrack={reverseTrack}
                      invertTrack={invertTrack}
                      shiftTrackLeft={shiftTrackLeft}
                      shiftTrackRight={shiftTrackRight}
                      generateRiff={generateRiff}
                      applyChord={applyChord}
                      duplicateTrack={duplicateTrack}
                      randomizeVelocities={randomizeVelocities}
                      humanizeTiming={humanizeTiming}
                      deleteAllNotes={deleteAllNotes}
                      setStatus={setStatus}
                      onMaximize={() => setSequencerModalOpen(true)}
                      onReorderTracks={reorderTracks}
                    />
                    
                    {/* PerformancePads expanded */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <PerformancePads onMaximize={() => setPadsModalOpen(true)} />
                    </motion.div>
  
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
                    <EnhancementsRack setStatus={setStatus} />
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
                    <AiBeatbox onGenerate={generateRandomPattern} onGenerateSkeleton={handleGenerateSkeleton} />

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
            <StatusBar 
              status={status} 
              undo={undo} 
              redo={redo} 
              canUndo={canUndo} 
              canRedo={canRedo} 
              onOpenHistory={() => setHistoryModalOpen(true)}
            />
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isHistoryModalOpen && (
          <HistoryModal 
            onClose={() => setHistoryModalOpen(false)} 
            history={history} 
            currentIndex={currentIndex}
            onJumpTo={(index) => {
              jumpTo(index);
              setHistoryModalOpen(false);
            }}
          />
        )}
        {isHelpModalOpen && (
          <HelpModal onClose={() => setHelpModalOpen(false)} />
        )}
        {isPadsModalOpen && (
          <Modal onClose={() => setPadsModalOpen(false)} title="Performance Pads" fullscreen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PerformancePads />
              <EnhancementsRack />
            </div>
          </Modal>
        )}
        {isSequencerModalOpen && (
          <Modal onClose={() => setSequencerModalOpen(false)} title="Step Sequencer" fullscreen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StepSequencer 
                grid={project.sequencerGrid} 
                onGridChange={updateSequencerGrid} 
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                bpm={project.bpm}
                onBpmChange={updateBpm}
                swing={project.swing}
                onSwingChange={updateSwing}
                reverbAutomation={project.reverbAutomation}
                onReverbAutomationChange={updateReverbAutomation}
                delayAutomation={project.delayAutomation}
                onDelayAutomationChange={updateDelayAutomation}
                snapToGrid={project.snapToGrid}
                onSnapToGridChange={updateSnapToGrid}
                filterType={project.filterType}
                trackMutes={project.trackMutes}
                onToggleMute={toggleTrackMute}
                trackSolos={project.trackSolos}
                onToggleSolo={toggleTrackSolo}
                trackCutSelf={project.trackCutSelf}
                onToggleCutSelf={toggleTrackCutSelf}
                trackSustain={project.trackSustain}
                onToggleSustain={toggleTrackSustain}
                trackSounds={project.trackSounds}
                onTrackSoundChange={updateTrackSound}
                onClearGrid={() => updateSequencerGrid(project.sequencerGrid.map(row => row.map(() => false)))}
                addTrack={addTrack}
                removeTrack={removeTrack}
                copyTrack={copyTrack}
                pasteTrack={pasteTrack}
                clearTrack={clearTrack}
                randomizeTrack={randomizeTrack}
                reverseTrack={reverseTrack}
                invertTrack={invertTrack}
                shiftTrackLeft={shiftTrackLeft}
                shiftTrackRight={shiftTrackRight}
                generateRiff={generateRiff}
                applyChord={applyChord}
                duplicateTrack={duplicateTrack}
                randomizeVelocities={randomizeVelocities}
                humanizeTiming={humanizeTiming}
                deleteAllNotes={deleteAllNotes}
                setStatus={setStatus}
                onReorderTracks={reorderTracks}
              />
              <EnhancementsRack setStatus={setStatus} />
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  </MidiProvider>
  );
}
