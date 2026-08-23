import { useState, useEffect, useCallback, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';

export const DEFAULT_GRID = Array(4).fill(null).map(() => Array(16).fill(false));

export interface ProjectData {
  activePack: string;
  bpm: number;
  volume: number;
  swing: number;
  reverb: number;
  reverbAutomation: number[];
  delay: number;
  delayAutomation: number[];
  masterAutomation: number[];
  trackMutes: boolean[];
  trackSolos: boolean[];
  trackSounds: string[];
  trackCutSelf: boolean[];
  trackSustain: boolean[];
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
  midiMappings: Record<string, number>;
  snapToGrid: boolean;
}

const DEFAULT_PROJECT: ProjectData = {
  activePack: 'classic-hiphop',
  bpm: 120,
  volume: 80,
  swing: 20,
  reverb: 30,
  reverbAutomation: Array(16).fill(30),
  delay: 15,
  delayAutomation: Array(16).fill(15),
  masterAutomation: Array(16).fill(80),
  trackMutes: [false, false, false, false, false, false, false, false],
  trackSolos: [false, false, false, false, false, false, false, false],
  trackSounds: ['deep-kick', 'classic-snare', 'closed-hat', 'open-hat', 'violin-legato', 'cello-deep', 'trumpet-bright', 'tuba-low'],
  trackCutSelf: [true, true, true, true, true, true, true, true],
  trackSustain: [false, false, false, false, false, false, false, false],
  filterType: 'lowpass',
  sequencerGrid: [
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // Closed Hat
    [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true], // Open Hat
    [true, false, false, true, false, true, false, false, true, false, true, false, true, false, false, false], // Violin (Melody)
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Cello (Bass)
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Trumpet
    [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], // Tuba
  ],
  synthParams: { cutoff: 60, resonance: 30, envMod: 50, decay: 70 },
  eqLevels: [70, 50, 40, 60, 80],
  pannerPosition: { x: 50, y: 50 },
  midiMappings: {},
  snapToGrid: true
};

const MAX_HISTORY = 50;

export function useProject() {
  const [project, setProject] = useState<ProjectData>(DEFAULT_PROJECT);
  const [isPlaying, setIsPlaying] = useState(false);

  const historyRef = useRef<ProjectData[]>([DEFAULT_PROJECT]);
  const historyIndexRef = useRef<number>(0);

  const [history, setHistory] = useState<ProjectData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const updateHistoryState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    setHistory([...historyRef.current]);
    setCurrentIndex(historyIndexRef.current);
  }, []);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to WebSocket server for collaboration');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'update' && data.payload) {
          setProject(data.payload);
          // Optional: Add to history or just update the view
          historyRef.current = [data.payload];
          historyIndexRef.current = 0;
          updateHistoryState();
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };
    
    wsRef.current = ws;
    
    return () => {
      ws.close();
    };
  }, [updateHistoryState]);

  useEffect(() => {
    const saved = localStorage.getItem('qamelot-project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mergedProject = { ...DEFAULT_PROJECT, ...parsed };
        // Ensure essential arrays are initialized
        mergedProject.sequencerGrid = parsed.sequencerGrid || DEFAULT_PROJECT.sequencerGrid;
        mergedProject.trackCutSelf = parsed.trackCutSelf || DEFAULT_PROJECT.trackCutSelf;
        mergedProject.trackSustain = parsed.trackSustain || DEFAULT_PROJECT.trackSustain;
        
        setProject(mergedProject);
        historyRef.current = [mergedProject];
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
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'update', payload: next }));
      }
      
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

  const jumpTo = useCallback((index: number) => {
    if (index >= 0 && index < historyRef.current.length) {
      historyIndexRef.current = index;
      setProject(historyRef.current[index]);
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

  const updateReverbAutomation = useCallback((reverbAutomation: number[]) => {
    setProjectWithHistory(p => ({ ...p, reverbAutomation }));
  }, [setProjectWithHistory]);

  const updateDelay = useCallback((delay: number) => {
    setProjectWithHistory(p => ({ ...p, delay }));
  }, [setProjectWithHistory]);

  const updateDelayAutomation = useCallback((delayAutomation: number[]) => {
    setProjectWithHistory(p => ({ ...p, delayAutomation }));
  }, [setProjectWithHistory]);

  const updateMasterAutomation = useCallback((masterAutomation: number[]) => {
    setProjectWithHistory(p => ({ ...p, masterAutomation }));
  }, [setProjectWithHistory]);

  const toggleTrackMute = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newMutes = [...p.trackMutes];
      newMutes[trackIdx] = !newMutes[trackIdx];
      return { ...p, trackMutes: newMutes };
    });
  }, [setProjectWithHistory]);

  const toggleTrackCutSelf = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newCutSelf = [...p.trackCutSelf];
      newCutSelf[trackIdx] = !newCutSelf[trackIdx];
      return { ...p, trackCutSelf: newCutSelf };
    });
  }, [setProjectWithHistory]);

  const toggleTrackSustain = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newSustain = [...p.trackSustain];
      newSustain[trackIdx] = !newSustain[trackIdx];
      return { ...p, trackSustain: newSustain };
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
      const newSounds = [...p.trackSounds, 'classic-perc'];
      const newCutSelf = [...p.trackCutSelf, false];
      const newSustain = [...p.trackSustain, false];
      const newGrid = [...p.sequencerGrid, Array(16).fill(false)];
      return { ...p, trackMutes: newMutes, trackSolos: newSolos, trackSounds: newSounds, trackCutSelf: newCutSelf, trackSustain: newSustain, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const removeTrack = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      if (p.trackSounds.length <= 1) return p; // prevent removing last track
      const newMutes = p.trackMutes.filter((_, i) => i !== trackIdx);
      const newSolos = p.trackSolos.filter((_, i) => i !== trackIdx);
      const newSounds = p.trackSounds.filter((_, i) => i !== trackIdx);
      const newCutSelf = p.trackCutSelf.filter((_, i) => i !== trackIdx);
      const newSustain = p.trackSustain.filter((_, i) => i !== trackIdx);
      const newGrid = p.sequencerGrid.filter((_, i) => i !== trackIdx);
      return { ...p, trackMutes: newMutes, trackSolos: newSolos, trackSounds: newSounds, trackCutSelf: newCutSelf, trackSustain: newSustain, sequencerGrid: newGrid };
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

  const generateRiff = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      const pattern = Array(16).fill(false);
      // Rhythmic base
      for(let i=0; i<16; i+=4) pattern[i] = true;
      // Random extras
      for(let i=0; i<16; i++) {
        if (!pattern[i] && Math.random() > 0.7) pattern[i] = true;
      }
      newGrid[trackIdx] = pattern;
      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const reverseTrack = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      newGrid[trackIdx] = [...newGrid[trackIdx]].reverse();
      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const invertTrack = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      newGrid[trackIdx] = newGrid[trackIdx].map(cell => !cell);
      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const shiftTrackLeft = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      const track = [...newGrid[trackIdx]];
      track.push(track.shift()!);
      newGrid[trackIdx] = track;
      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const shiftTrackRight = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      const track = [...newGrid[trackIdx]];
      track.unshift(track.pop()!);
      newGrid[trackIdx] = track;
      return { ...p, sequencerGrid: newGrid };
    });
  }, [setProjectWithHistory]);

  const duplicateTrack = useCallback((trackIdx: number) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      const newSounds = [...p.trackSounds];
      const newMutes = [...p.trackMutes];
      const newSolos = [...p.trackSolos];
      const newCutSelf = [...p.trackCutSelf];
      const newSustain = [...p.trackSustain];
      
      newGrid.splice(trackIdx + 1, 0, [...newGrid[trackIdx]]);
      newSounds.splice(trackIdx + 1, 0, newSounds[trackIdx]);
      newMutes.splice(trackIdx + 1, 0, newMutes[trackIdx]);
      newSolos.splice(trackIdx + 1, 0, newSolos[trackIdx]);
      newCutSelf.splice(trackIdx + 1, 0, newCutSelf[trackIdx]);
      newSustain.splice(trackIdx + 1, 0, newSustain[trackIdx]);
      
      return { ...p, sequencerGrid: newGrid, trackSounds: newSounds, trackMutes: newMutes, trackSolos: newSolos, trackCutSelf: newCutSelf, trackSustain: newSustain };
    });
  }, [setProjectWithHistory]);

  const randomizeVelocities = useCallback((trackIdx: number) => {
    // Placeholder - would need velocity data structure
    console.log('Randomize Velocities for track', trackIdx);
  }, []);

  const humanizeTiming = useCallback((trackIdx: number) => {
    // Placeholder - would need timing offset data structure
    console.log('Humanize Timing for track', trackIdx);
  }, []);

  const deleteAllNotes = useCallback((trackIdx: number) => {
    clearTrack(trackIdx);
  }, [clearTrack]);

  const applyChord = useCallback((trackIdx: number, notes: string[]) => {
    setProjectWithHistory(p => {
      const newGrid = [...p.sequencerGrid];
      const newSounds = [...p.trackSounds];
      const newMutes = [...p.trackMutes];
      const newSolos = [...p.trackSolos];
      
      const originalPattern = [...newGrid[trackIdx]];
      
      // We will create new tracks for the remaining notes
      notes.forEach((note, i) => {
        if (i === 0) {
          // Update the first track
          newSounds[trackIdx] = 'pad';
          newGrid[trackIdx] = originalPattern;
        } else {
          // Add a new track for this note
          newMutes.push(false);
          newSolos.push(false);
          newSounds.push('pad');
          newGrid.push(originalPattern);
        }
      });

      return { 
        ...p, 
        sequencerGrid: newGrid, 
        trackSounds: newSounds,
        trackMutes: newMutes,
        trackSolos: newSolos
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

  const updateMidiMapping = useCallback((uiId: string, ccNumber: number) => {
    setProjectWithHistory(p => ({ 
      ...p, 
      midiMappings: { ...p.midiMappings, [uiId]: ccNumber } 
    }));
  }, [setProjectWithHistory]);

  const updateSnapToGrid = useCallback((snapToGrid: boolean) => {
    setProjectWithHistory(p => ({ ...p, snapToGrid }));
  }, [setProjectWithHistory]);

  const generateRandomPattern = useCallback(() => {
    const newGrid = DEFAULT_GRID.map(track => track.map(() => false));
    // Kick: 4 on the floor + some variations
    for(let i=0; i<16; i+=4) newGrid[0][i] = true;
    if (Math.random() > 0.5) newGrid[0][10] = true;
    if (Math.random() > 0.7) newGrid[0][14] = true;

    // Snare: 2 and 4
    newGrid[1][4] = true;
    newGrid[1][12] = true;
    if (Math.random() > 0.8) newGrid[1][15] = true;

    // Hihat: continuous or sparse
    const hhDensity = Math.random();
    for(let i=0; i<16; i++) {
        if (hhDensity > 0.6) newGrid[2][i] = Math.random() > 0.2;
        else if (i % 2 === 0) newGrid[2][i] = true;
    }

    // Perc: random flavor
    for(let i=0; i<16; i++) {
        if (Math.random() > 0.85) newGrid[3][i] = true;
    }

    setProjectWithHistory(p => ({ ...p, sequencerGrid: newGrid }));
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
    updateReverbAutomation,
    updateDelay,
    updateDelayAutomation,
    updateMasterAutomation,
    toggleTrackMute,
    toggleTrackSolo,
    toggleTrackCutSelf,
    toggleTrackSustain,
    updateTrackSound,
    updateFilterType,
    updateSequencerGrid,
    updateSynthParams,
    updateEqLevels,
    updatePannerPosition,
    updateMidiMapping,
    updateSnapToGrid,
    generateRandomPattern,
    history,
    currentIndex,
    jumpTo,
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
    reverseTrack,
    invertTrack,
    shiftTrackLeft,
    shiftTrackRight,
    generateRiff,
    applyChord,
    duplicateTrack,
    randomizeVelocities,
    humanizeTiming,
    deleteAllNotes
  };
}
