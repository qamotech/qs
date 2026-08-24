import { useState, useEffect, useCallback, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { createProjectDocument, migrateProjectDocument } from '../project/projectDocument';

const ISLAND_GRID = [
  [true, false, false, true, false, false, true, false, true, false, false, true, false, true, false, false],
  [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
  [true, false, true, true, false, true, false, true, true, false, true, false, false, true, false, true],
  [false, false, true, false, false, true, false, true, false, false, true, false, true, false, true, false],
  [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false],
  [false, false, false, true, false, false, false, false, false, false, true, false, false, false, false, true],
];

export const DEFAULT_GRID = ISLAND_GRID.map(track => [...track]);

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
  trackNames: string[];
  trackColors: string[];
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
  activePack: 'rnb-grooves',
  bpm: 98,
  volume: 78,
  swing: 18,
  reverb: 14,
  delay: 9,
  trackMutes: Array(6).fill(false),
  trackSolos: Array(6).fill(false),
  trackVolumes: [88, 74, 57, 64, 72, 48],
  trackSounds: ['island-kick', 'island-clap', 'island-shaker', 'island-conga', 'island-sub', 'island-mallet'],
  trackNames: ['Island Kick', 'Palm Clap', 'Shaker', 'Conga', 'Sub Bass', 'Tropical Mallet'],
  trackColors: ['#22c55e', '#fb7185', '#facc15', '#f97316', '#8b5cf6', '#38bdf8'],
  filterType: 'lowpass',
  sequencerGrid: DEFAULT_GRID,
  synthParams: { cutoff: 62, resonance: 22, envMod: 44, decay: 58 },
  eqLevels: [72, 59, 48, 56, 61],
  pannerPosition: { x: 56, y: 48 }
};

const MAX_HISTORY = 50;

// EQ UI uses 0–100 with 50 = 0 dB (see AudioEngine.setEqLevels)
const dbToEqLevel = (db: number) => Math.max(0, Math.min(100, 50 + (db / 12) * 50));

const cloneProject = (project: ProjectData): ProjectData => ({
  ...project,
  trackMutes: [...project.trackMutes], trackSolos: [...project.trackSolos],
  trackVolumes: [...project.trackVolumes], trackSounds: [...project.trackSounds],
  trackNames: [...project.trackNames], trackColors: [...project.trackColors],
  sequencerGrid: project.sequencerGrid.map(track => [...track]),
  synthParams: { ...project.synthParams }, eqLevels: [...project.eqLevels],
  pannerPosition: { ...project.pannerPosition },
});

const normalizeProject = (saved: Partial<ProjectData>): ProjectData => {
  const base = cloneProject(DEFAULT_PROJECT);
  const trackCount = Array.isArray(saved.sequencerGrid) && saved.sequencerGrid.length > 0 ? saved.sequencerGrid.length : base.sequencerGrid.length;
  const extend = <T,>(values: T[] | undefined, fallback: T[]) => Array.from({ length: trackCount }, (_, index) => values?.[index] ?? fallback[index % fallback.length]);
  const normalizeGrid = (track: boolean[] | undefined, fallback: boolean[]) => {
    if (!track) return [...fallback];
    return [...track.slice(0, 16), ...Array(Math.max(0, 16 - track.length)).fill(false)];
  };
  return {
    ...base,
    ...saved,
    trackMutes: extend(saved.trackMutes, base.trackMutes), trackSolos: extend(saved.trackSolos, base.trackSolos),
    trackVolumes: extend(saved.trackVolumes, base.trackVolumes), trackSounds: extend(saved.trackSounds, base.trackSounds),
    trackNames: extend(saved.trackNames, base.trackNames), trackColors: extend(saved.trackColors, base.trackColors),
    sequencerGrid: Array.from({ length: trackCount }, (_, index) => normalizeGrid(saved.sequencerGrid?.[index], base.sequencerGrid[index % base.sequencerGrid.length])),
  };
};

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
        const migrated = migrateProjectDocument(parsed);
        if (!migrated) return;
        const restored = normalizeProject(migrated.document.project);
        setProject(restored);
        historyRef.current = [restored];
        historyIndexRef.current = 0;
        updateHistoryState();
        if (migrated.migrated) localStorage.setItem('qamelot-project', JSON.stringify(createProjectDocument(restored)));
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
    const existing = (() => {
      try { return migrateProjectDocument(JSON.parse(localStorage.getItem('qamelot-project') || 'null'))?.document.metadata; } catch { return undefined; }
    })();
    localStorage.setItem('qamelot-project', JSON.stringify(createProjectDocument(project, existing)));
  }, [project]);
  const loadProjectData = useCallback((data: unknown) => {
    const migrated = migrateProjectDocument(data);
    if (migrated) {
      const restored = normalizeProject(migrated.document.project);
      setProject(restored);
      historyRef.current = [restored];
      historyIndexRef.current = 0;
      updateHistoryState();
    }
  }, [updateHistoryState]);
  
  const resetProject = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the project? All unsaved changes will be lost.')) {
      const islandProject = cloneProject(DEFAULT_PROJECT);
      setProject(islandProject);
      historyRef.current = [islandProject];
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

  const updateTrackName = useCallback((trackIdx: number, name: string) => {
    setProjectWithHistory(p => {
      const trackNames = [...p.trackNames];
      trackNames[trackIdx] = name.trim() || `Track ${trackIdx + 1}`;
      return { ...p, trackNames };
    });
  }, [setProjectWithHistory]);

  const updateTrackColor = useCallback((trackIdx: number, color: string) => {
    setProjectWithHistory(p => {
      const trackColors = [...p.trackColors];
      trackColors[trackIdx] = color;
      return { ...p, trackColors };
    });
  }, [setProjectWithHistory]);

  const addTrack = useCallback(() => {
    setProjectWithHistory(p => {
      const newMutes = [...p.trackMutes, false];
      const newSolos = [...p.trackSolos, false];
      const newVolumes = [...(p.trackVolumes || []), 80];
      const newSounds = [...p.trackSounds, 'classic-perc'];
      const newNames = [...p.trackNames, `Track ${p.trackSounds.length + 1}`];
      const newColors = [...p.trackColors, '#22c55e'];
      const newGrid = [...p.sequencerGrid, Array(16).fill(false)];
      return { ...p, trackMutes: newMutes, trackSolos: newSolos, trackVolumes: newVolumes, trackSounds: newSounds, trackNames: newNames, trackColors: newColors, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const removeTrack = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      if (p.trackSounds.length <= 1) return p; // prevent removing last track
      const newMutes = p.trackMutes.filter((_, i) => i !== trackIdx);
      const newSolos = p.trackSolos.filter((_, i) => i !== trackIdx);
      const newVolumes = (p.trackVolumes || []).filter((_, i) => i !== trackIdx);
      const newSounds = p.trackSounds.filter((_, i) => i !== trackIdx);
      const newNames = p.trackNames.filter((_, i) => i !== trackIdx);
      const newColors = p.trackColors.filter((_, i) => i !== trackIdx);
      const newGrid = p.sequencerGrid.filter((_, i) => i !== trackIdx);
      return { ...p, trackMutes: newMutes, trackSolos: newSolos, trackVolumes: newVolumes, trackSounds: newSounds, trackNames: newNames, trackColors: newColors, sequencerGrid: newGrid };
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

  const moveTrack = useCallback((trackIdx: number, direction: -1 | 1) => {
    setProjectWithHistory(p => {
      const destination = trackIdx + direction;
      if (destination < 0 || destination >= p.trackSounds.length) return p;
      const move = <T,>(items: T[]) => {
        const next = [...items];
        [next[trackIdx], next[destination]] = [next[destination], next[trackIdx]];
        return next;
      };
      return {
        ...p,
        sequencerGrid: move(p.sequencerGrid), trackSounds: move(p.trackSounds),
        trackMutes: move(p.trackMutes), trackSolos: move(p.trackSolos),
        trackVolumes: move(p.trackVolumes), trackNames: move(p.trackNames), trackColors: move(p.trackColors),
      };
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

  const loadIslandBeat = useCallback(() => {
    const islandProject = cloneProject(DEFAULT_PROJECT);
    setProjectWithHistory(() => islandProject);
  }, [setProjectWithHistory]);

  const humanizeIslandBeat = useCallback(() => {
    setProjectWithHistory(p => {
      const sequencerGrid = p.sequencerGrid.map(track => [...track]);
      const addGhostNote = (trackIndex: number, candidates: number[]) => {
        if (!sequencerGrid[trackIndex]) return;
        const available = candidates.filter(step => !sequencerGrid[trackIndex][step]);
        if (available.length) sequencerGrid[trackIndex][available[Math.floor(Math.random() * available.length)]] = true;
      };
      addGhostNote(2, [1, 5, 9, 13, 15]);
      addGhostNote(3, [0, 3, 6, 10, 14]);
      if (sequencerGrid[5] && Math.random() > 0.35) addGhostNote(5, [2, 7, 12]);
      return { ...p, sequencerGrid };
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
    loadProjectData,
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
    updateTrackName,
    updateTrackColor,
    moveTrack,
    updateFilterType,
    updateSequencerGrid,
    updateSynthParams,
    updateEqLevels,
    updatePannerPosition,
    applyMasterPreset,
    generateRandomPattern,
    loadIslandBeat,
    humanizeIslandBeat,
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
