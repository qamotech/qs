import { useState, useEffect, useCallback, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';

export const DEFAULT_GRID = Array(4).fill(null).map(() => Array(16).fill(false));

export interface ProjectData {
  activePack: string;
  bpm: number;
  volume: number;
  swing: number;
  reverb: number;
  delay: number;
  trackMutes: boolean[];
  trackSolos: boolean[];
  trackVolumes: number[];
  trackSounds: string[];
  filterType: 'lowpass' | 'highpass' | 'bandpass';
  sequencerGrid: boolean[][];
  synthParams: {
    cutoff: number;
    resonance: number;
    envMod: number;
    decay: number;
  };
  eqLevels: number[];
  pannerPosition: { x: number; y: number };
}

const DEFAULT_PROJECT: ProjectData = {
  activePack: 'classic-hiphop',
  bpm: 100,
  volume: 80,
  swing: 0,
  reverb: 0,
  delay: 0,
  trackMutes: [false, false, false, false],
  trackSolos: [false, false, false, false],
  trackVolumes: [80, 80, 80, 80],
  trackSounds: ['classic-kick', 'classic-snare', 'classic-hihat', 'saw-bass'],
  filterType: 'lowpass',
  sequencerGrid: DEFAULT_GRID,
  synthParams: { cutoff: 70, resonance: 30, envMod: 50, decay: 40 },
  eqLevels: [50, 60, 40, 70, 50],
  pannerPosition: { x: 50, y: 50 }
};

const MAX_HISTORY = 50;

// EQ UI uses 0–100 with 50 = 0 dB (see AudioEngine.setEqLevels)
const dbToEqLevel = (db: number) => Math.max(0, Math.min(100, 50 + (db / 12) * 50));

export function useProject() {
  const [project, setProject] = useState<ProjectData>(DEFAULT_PROJECT);
  const [isPlaying, setIsPlaying] = useState(false);

  const historyRef = useRef<ProjectData[]>([DEFAULT_PROJECT]);
  const historyIndexRef = useRef<number>(0);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateHistoryState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('qamelot-project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProject({ ...DEFAULT_PROJECT, ...parsed });
        historyRef.current = [{ ...DEFAULT_PROJECT, ...parsed }];
        historyIndexRef.current = 0;
        updateHistoryState();
      } catch (e) {
        console.error('Failed to load project', e);
      }
    }
  }, [updateHistoryState]);

  const saveToHistory = useCallback((newState: ProjectData) => {
    const nextIndex = historyIndexRef.current + 1;
    const newHistory = historyRef.current.slice(0, nextIndex);
    newHistory.push(newState);
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    updateHistoryState();
  }, [updateHistoryState]);

  const setProjectWithHistory = useCallback((updater: (prev: ProjectData) => ProjectData) => {
    setProject(prev => {
      const next = updater(prev);
      saveToHistory(next);
      return next;
    });
  }, [saveToHistory]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      setProject(historyRef.current[historyIndexRef.current]);
      updateHistoryState();
    }
  }, [updateHistoryState]);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      setProject(historyRef.current[historyIndexRef.current]);
      updateHistoryState();
    }
  }, [updateHistoryState]);

  const saveProject = useCallback(() => {
    localStorage.setItem('qamelot-project', JSON.stringify(project));
  }, [project]);
  
  const resetProject = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the project? All unsaved changes will be lost.')) {
      setProject(DEFAULT_PROJECT);
      historyRef.current = [DEFAULT_PROJECT];
      historyIndexRef.current = 0;
      updateHistoryState();
      localStorage.removeItem('qamelot-project');
    }
  }, [updateHistoryState]);

  const updateActivePack = useCallback((packId: string) => {
    setProjectWithHistory(p => {
      let newSounds = [...p.trackSounds];
      switch(packId) {
        case 'classic-hiphop':
          newSounds = ['classic-kick', 'classic-snare', 'classic-hihat', 'classic-perc'];
          break;
        case 'lofi-nights':
          newSounds = ['lo-fi-kick', 'lo-fi-snare', 'lo-fi-hihat', 'saw-bass'];
          break;
        case 'rnb-grooves':
          newSounds = ['deep-kick', 'rim-snare', 'soft-hihat', 'square-bass']; // Will use fallback if not found
          break;
        case 'trap-essentials':
          newSounds = ['hard-kick', 'trap-snare', 'trap-hihat', '808-bass'];
          break;
        case 'modern-trap':
          newSounds = ['massive-kick', 'snap-snare', 'crisp-hihat', 'sub-bass'];
          break;
        case 'drill-essential':
          newSounds = ['punchy-kick', 'tight-snare', 'sharp-hihat', 'acid'];
          break;
        case 'pop-anthem':
          newSounds = ['boom-kick', 'clap-snare', 'open-hihat', 'saw-lead'];
          break;
        case 'future-bass':
          newSounds = ['zap-kick', 'electronic-snare', 'sizzle-hihat', 'pad'];
          break;
      }
      // Fill the rest if there are more tracks
      while(newSounds.length < p.trackSounds.length) {
        newSounds.push(p.trackSounds[newSounds.length] || 'classic-perc');
      }
      return { ...p, activePack: packId, trackSounds: newSounds.slice(0, p.trackSounds.length) };
    });
  }, [setProjectWithHistory]);

  const updateBpm = useCallback((bpm: number) => {
    setProjectWithHistory(p => ({ ...p, bpm }));
  }, [setProjectWithHistory]);

  const updateVolume = useCallback((volume: number) => {
    setProjectWithHistory(p => ({ ...p, volume }));
  }, [setProjectWithHistory]);

  const updateSwing = useCallback((swing: number) => {
    setProjectWithHistory(p => ({ ...p, swing }));
  }, [setProjectWithHistory]);

  const updateReverb = useCallback((reverb: number) => {
    setProjectWithHistory(p => ({ ...p, reverb }));
  }, [setProjectWithHistory]);

  const updateDelay = useCallback((delay: number) => {
    setProjectWithHistory(p => ({ ...p, delay }));
  }, [setProjectWithHistory]);

  const toggleTrackMute = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newMutes = [...p.trackMutes];
      newMutes[trackIdx] = !newMutes[trackIdx];
      return { ...p, trackMutes: newMutes };
    });
  }, [setProjectWithHistory]);

  const toggleTrackSolo = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newSolos = [...p.trackSolos];
      newSolos[trackIdx] = !newSolos[trackIdx];
      return { ...p, trackSolos: newSolos };
    });
  }, [setProjectWithHistory]);

  const updateTrackSound = useCallback((trackIdx: number, soundId: string) => {
    setProjectWithHistory(p => {
      const newSounds = [...p.trackSounds];
      newSounds[trackIdx] = soundId;
      return { ...p, trackSounds: newSounds };
    });
  }, [setProjectWithHistory]);

  const addTrack = useCallback(() => {
    setProjectWithHistory(p => {
      const newMutes = [...p.trackMutes, false];
      const newSolos = [...p.trackSolos, false];
      const newVolumes = [...(p.trackVolumes || []), 80];
      const newSounds = [...p.trackSounds, 'classic-perc'];
      const newGrid = [...p.sequencerGrid, Array(16).fill(false)];
      return { ...p, trackMutes: newMutes, trackSolos: newSolos, trackVolumes: newVolumes, trackSounds: newSounds, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const removeTrack = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      if (p.trackSounds.length <= 1) return p; // prevent removing last track
      const newMutes = p.trackMutes.filter((_, i) => i !== trackIdx);
      const newSolos = p.trackSolos.filter((_, i) => i !== trackIdx);
      const newVolumes = (p.trackVolumes || []).filter((_, i) => i !== trackIdx);
      const newSounds = p.trackSounds.filter((_, i) => i !== trackIdx);
      const newGrid = p.sequencerGrid.filter((_, i) => i !== trackIdx);
      return { ...p, trackMutes: newMutes, trackSolos: newSolos, trackVolumes: newVolumes, trackSounds: newSounds, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const copyTrack = useCallback((trackIdx: number) => {
    // Store in a module-level variable or clipboard, simplest is local state or local storage.
    // For simplicity, let's use a ref or just keep it in memory
    const trackData = {
      sound: project.trackSounds[trackIdx],
      grid: project.sequencerGrid[trackIdx]
    };
    localStorage.setItem('qamelot-copied-track', JSON.stringify(trackData));
  }, [project]);

  const pasteTrack = useCallback((trackIdx: number) => {
    try {
      const data = JSON.parse(localStorage.getItem('qamelot-copied-track') || 'null');
      if (data) {
        setProjectWithHistory(p => {
          const newGrid = [...p.sequencerGrid];
          newGrid[trackIdx] = [...data.grid];
          const newSounds = [...p.trackSounds];
          newSounds[trackIdx] = data.sound;
          return { ...p, sequencerGrid: newGrid, trackSounds: newSounds };
        });
      }
    } catch (e) {}
  }, [setProjectWithHistory]);

  const clearTrack = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      newGrid[trackIdx] = Array(16).fill(false);
      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const randomizeTrack = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      newGrid[trackIdx] = Array(16).fill(false).map(() => Math.random() > 0.7);
      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const shiftTrackLeft = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      const pattern = newGrid[trackIdx];
      newGrid[trackIdx] = [...pattern.slice(1), pattern[0]];
      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const shiftTrackRight = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      const pattern = newGrid[trackIdx];
      newGrid[trackIdx] = [pattern[pattern.length - 1], ...pattern.slice(0, pattern.length - 1)];
      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const invertTrack = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      newGrid[trackIdx] = newGrid[trackIdx].map(x => !x);
      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const fillEveryFourth = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      newGrid[trackIdx] = Array(16).fill(false).map((_, i) => i % 4 === 0);
      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const updateTrackVolume = useCallback((trackIdx: number, volume: number) => {
    setProjectWithHistory(p => {
      const newVolumes = [...(p.trackVolumes || [])];
      newVolumes[trackIdx] = volume;
      return { ...p, trackVolumes: newVolumes };
    });
  }, [setProjectWithHistory]);

  const applyChord = useCallback((trackIdx: number, notes: string[]) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      const newSounds = [...p.trackSounds];
      const newMutes = [...p.trackMutes];
      const newSolos = [...p.trackSolos];
      const newVolumes = [...(p.trackVolumes || [])];
      
      const originalPattern = [...newGrid[trackIdx]];
      
      // Create additional tracks for remaining chord notes
      notes.forEach((_note, i) => {
        if (i === 0) {
          newSounds[trackIdx] = 'pad';
          newGrid[trackIdx] = originalPattern;
        } else {
          newMutes.push(false);
          newSolos.push(false);
          newVolumes.push(80);
          newSounds.push('pad');
          newGrid.push([...originalPattern]);
        }
      });

      return { 
        ...p, 
        sequencerGrid: newGrid, 
        trackSounds: newSounds,
        trackMutes: newMutes,
        trackSolos: newSolos,
        trackVolumes: newVolumes
      };
    });
  }, [setProjectWithHistory]);

  const updateFilterType = useCallback((filterType: 'lowpass' | 'highpass' | 'bandpass') => {
    setProjectWithHistory(p => ({ ...p, filterType }));
  }, [setProjectWithHistory]);

  const updateSequencerGrid = useCallback((grid: boolean[][]) => {
    setProjectWithHistory(p => ({ ...p, sequencerGrid: grid }));
  }, [setProjectWithHistory]);

  const updateSynthParams = useCallback((key: keyof ProjectData['synthParams'], value: number) => {
    setProjectWithHistory(p => ({
      ...p,
      synthParams: { ...p.synthParams, [key]: value }
    }));
  }, [setProjectWithHistory]);

  const updateEqLevels = useCallback((levels: number[]) => {
    setProjectWithHistory(p => ({ ...p, eqLevels: levels }));
  }, [setProjectWithHistory]);

  const updatePannerPosition = useCallback((pos: { x: number; y: number }) => {
    setProjectWithHistory(p => ({ ...p, pannerPosition: pos }));
  }, [setProjectWithHistory]);

  const applyMasterPreset = useCallback((preset: string) => {
    setProjectWithHistory(p => {
      let bpm = 120;
      let reverb = 0;
      let delay = 0;
      // Always 5 bands matching MasterEq / AudioEngine
      let eqLevels = [50, 50, 50, 50, 50];
      let filterType: 'lowpass' | 'highpass' | 'bandpass' = 'lowpass';
      
      switch (preset) {
        case 'Techno':
          bpm = 135;
          reverb = 15;
          delay = 10;
          eqLevels = [4, 2, -2, -1, 3].map(dbToEqLevel);
          break;
        case 'Hip Hop':
          bpm = 90;
          reverb = 10;
          delay = 5;
          eqLevels = [6, 4, -1, 0, 2].map(dbToEqLevel);
          break;
        case 'Ambient':
          bpm = 70;
          reverb = 80;
          delay = 60;
          eqLevels = [-2, 0, 2, 4, 5].map(dbToEqLevel);
          filterType = 'highpass';
          break;
        case 'House':
          bpm = 125;
          reverb = 20;
          delay = 15;
          eqLevels = [3, 1, 0, 1, 2].map(dbToEqLevel);
          break;
        default:
          bpm = 120;
          reverb = 0;
          delay = 0;
          eqLevels = [50, 50, 50, 50, 50];
      }

      return {
        ...p,
        bpm,
        reverb,
        delay,
        eqLevels,
        filterType
      };
    });
  }, [setProjectWithHistory]);

  const generateRandomPattern = useCallback(() => {
    setProjectWithHistory(p => {
      const newGrid = p.sequencerGrid.map(track => track.map(() => false));
      if (newGrid.length > 0) {
        // Kick: 4 on the floor + some variations
        for(let i=0; i<16; i+=4) newGrid[0][i] = true;
        if (Math.random() > 0.5) newGrid[0][10] = true;
        if (Math.random() > 0.7) newGrid[0][14] = true;
      }

      if (newGrid.length > 1) {
        // Snare: 2 and 4
        newGrid[1][4] = true;
        newGrid[1][12] = true;
        if (Math.random() > 0.8) newGrid[1][15] = true;
      }

      if (newGrid.length > 2) {
        // Hihat: continuous or sparse
        const hhDensity = Math.random();
        for(let i=0; i<16; i++) {
            if (hhDensity > 0.6) newGrid[2][i] = Math.random() > 0.2;
            else if (i % 2 === 0) newGrid[2][i] = true;
        }
      }

      if (newGrid.length > 3) {
        // Perc: random flavor
        for(let i=0; i<16; i++) {
            if (Math.random() > 0.85) newGrid[3][i] = true;
        }
      }

      // Any additional tracks
      for (let t=4; t<newGrid.length; t++) {
        for(let i=0; i<16; i++) {
            if (Math.random() > 0.85) newGrid[t][i] = true;
        }
      }

      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const togglePlay = useCallback(() => {
    audioEngine.init();
    setIsPlaying(prev => !prev);
  }, []);

  return {
    project,
    isPlaying,
    togglePlay,
    saveProject,
    resetProject,
    updateActivePack,
    updateBpm,
    updateVolume,
    updateSwing,
    updateReverb,
    updateDelay,
    toggleTrackMute,
    toggleTrackSolo,
    updateTrackVolume,
    updateTrackSound,
    updateFilterType,
    updateSequencerGrid,
    updateSynthParams,
    updateEqLevels,
    updatePannerPosition,
    applyMasterPreset,
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
    shiftTrackLeft,
    shiftTrackRight,
    invertTrack,
    fillEveryFourth,
    applyChord
  };
}
