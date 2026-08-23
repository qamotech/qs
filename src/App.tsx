import { useState, useEffect } from 'react';
import { Save, Play, Square } from 'lucide-react';

import { useProject } from './hooks/useProject';
import { audioEngine } from './audio/AudioEngine';
import { SpectralAnalyzer, MasterLimiter, TapeSaturation, MultiBandCompressor, ReverbChamber, ChordGenerator, EnhancementsRack } from './components/NewFeatures';

import StepSequencer from './components/StepSequencer';
import PerformancePads from './components/PerformancePads';
import RiffGenerator from './components/RiffGenerator';
import Oscilloscope from './components/Oscilloscope';
import MasterEq from './components/MasterEq';
import AiBeatbox from './components/AiBeatbox';
import SpatialPanner from './components/SpatialPanner';
import SynthTweaker from './components/SynthTweaker';
import MasterPitchWheel from './components/MasterPitchWheel';
import MasterEffects from './components/MasterEffects';
import SamplePacks from './components/SamplePacks';

import logo from './assets/logo.png';

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
    updateSequencerGrid, 
    updateSynthParams, 
    updateEqLevels, 
    updatePannerPosition,
    updateReverb,
    updateDelay,
    toggleTrackMute,
    toggleTrackSolo,
    updateTrackVolume,
    updateTrackSound,
    updateFilterType,
    generateRandomPattern,
    undo,
    redo,
    addTrack,
    removeTrack,
    copyTrack,
    pasteTrack,
    clearTrack,
    randomizeTrack,
    shiftTrackLeft,
    shiftTrackRight,
    invertTrack,
    fillEveryFourth,
    applyChord
  } = useProject();

  useEffect(() => {
    audioEngine.setSamplePack(project.activePack);
    audioEngine.setEqLevels(project.eqLevels);
    audioEngine.setSynthParams(project.synthParams);
    audioEngine.setPannerPosition(project.pannerPosition);
    audioEngine.setVolume(project.volume / 100);
    audioEngine.setEffects(project.reverb, project.delay, project.filterType);
    audioEngine.setTrackVolumes(project.trackVolumes || []);
  }, [
    project.activePack, 
    project.eqLevels, 
    project.synthParams, 
    project.pannerPosition, 
    project.volume,
    project.reverb,
    project.delay,
    project.filterType,
    project.trackVolumes
  ]);

  useEffect(() => {
    if (!started) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveProject(); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') { e.preventDefault(); resetProject(); }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); redo(); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, togglePlay, saveProject, resetProject, undo, redo]);

  return (
    <div className="fixed inset-0 bg-black text-zinc-300 font-mono flex flex-col relative overflow-hidden box-border">
      {!started ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black">
          <div className="flex flex-col items-center justify-center max-w-lg w-full border border-zinc-800/50 bg-zinc-900/40 p-12 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10">
            <div className="w-64 h-64 mb-8 rounded-2xl flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-cyan-500/20 blur-3xl group-hover:bg-cyan-500/40 transition-colors duration-1000" />
              <img
                src={logo}
                alt="Qamelot Logo"
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-pulse"
                style={{ animationDuration: '4s' }}
              />
            </div>
            <h1 className="text-5xl font-black text-white mb-4 text-center tracking-tighter">Qamelot Studio</h1>
            <p className="text-zinc-400 text-center mb-12 text-lg font-light tracking-wide max-w-sm">
              Audio Production Workstation
            </p>
            <button
              onClick={() => {
                audioEngine.init();
                setStarted(true);
              }}
              className="w-full py-5 bg-zinc-100 hover:bg-white text-black rounded-2xl font-bold text-lg transition-all"
            >
              Initialize Engine
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col bg-[#0a0a0c] overflow-hidden relative">
          <header className="h-16 shrink-0 border-b border-zinc-800/80 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur z-20 relative shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                <img src={logo} className="w-8 h-8 object-contain" />
              </div>
              <h2 className="text-xl font-black text-zinc-100 tracking-tighter hidden lg:block">Qamelot</h2>
            </div>
            <div className="flex items-center justify-center gap-2 md:gap-4 flex-1 px-4">
              <button onClick={togglePlay} className={`p-2 px-3 md:px-6 rounded-lg flex items-center justify-center gap-2 font-bold ${isPlaying ? 'bg-red-500 text-white' : 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/50'}`}>
                {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span className="hidden md:inline">{isPlaying ? 'STOP' : 'PLAY'}</span>
              </button>
              <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1.5 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hidden md:inline">BPM</span>
                <input type="number" value={project.bpm} onChange={(e) => updateBpm(Number(e.target.value))} className="w-10 md:w-12 bg-transparent text-xs md:text-sm text-cyan-400 font-bold text-center outline-none" min="40" max="300" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveProject} className="p-1.5 md:p-2 md:px-4 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-white font-bold"><Save className="w-4 h-4" /></button>
            </div>
          </header>
          <div className="flex-1 p-2 md:p-6 flex flex-col xl:grid xl:grid-cols-12 gap-6 overflow-y-auto relative z-10">
            <div className="xl:col-span-8 flex flex-col gap-6">
              <SamplePacks activePack={project.activePack} onChange={updateActivePack} />
              <StepSequencer
                grid={project.sequencerGrid}
                onGridChange={updateSequencerGrid}
                isPlaying={isPlaying}
                bpm={project.bpm}
                swing={project.swing}
                trackMutes={project.trackMutes}
                onToggleMute={toggleTrackMute}
                trackSolos={project.trackSolos}
                onToggleSolo={toggleTrackSolo}
                trackVolumes={project.trackVolumes || [80, 80, 80, 80]}
                onTrackVolumeChange={updateTrackVolume}
                trackSounds={project.trackSounds}
                onTrackSoundChange={updateTrackSound}
                addTrack={addTrack}
                removeTrack={removeTrack}
                copyTrack={copyTrack}
                pasteTrack={pasteTrack}
                clearTrack={clearTrack}
                randomizeTrack={randomizeTrack}
                shiftTrackLeft={shiftTrackLeft}
                shiftTrackRight={shiftTrackRight}
                invertTrack={invertTrack}
                fillEveryFourth={fillEveryFourth}
                applyChord={applyChord}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PerformancePads />
                <RiffGenerator onGenerate={generateRandomPattern} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SynthTweaker params={project.synthParams} onChange={updateSynthParams} />
                <ChordGenerator />
              </div>
            </div>
            <div className="xl:col-span-4 flex flex-col gap-6 xl:border-l border-zinc-800/50 xl:pl-6">
              <EnhancementsRack />
              <MasterEq levels={project.eqLevels} onChange={updateEqLevels} />
              <MultiBandCompressor />
              <TapeSaturation />
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
              <MasterLimiter />
              <AiBeatbox onGenerate={generateRandomPattern} />
              <Oscilloscope />
              <SpectralAnalyzer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
