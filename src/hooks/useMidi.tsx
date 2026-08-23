import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { useProject } from './useProject';

interface MidiContextType {
  isLearning: boolean;
  startLearning: (uiId: string) => void;
  stopLearning: () => void;
}

const MidiContext = createContext<MidiContextType>({
  isLearning: false,
  startLearning: () => {},
  stopLearning: () => {},
});

export const MidiProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLearning, setIsLearning] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { project, updateMidiMapping } = useProject();

  const startLearning = (uiId: string) => {
    setIsLearning(true);
    setPendingId(uiId);
  };

  const stopLearning = () => {
    setIsLearning(false);
    setPendingId(null);
  };

  useEffect(() => {
    const onMidiMessage = (event: any) => {
      const [status, data1, data2] = event.data;
      
      if (isLearning && pendingId) {
        // Control Change message is 176-191
        if (status >= 176 && status <= 191) {
          updateMidiMapping(pendingId, data1);
          stopLearning();
        }
      } else {
        // Handle mapped messages
        if (status >= 176 && status <= 191) {
          const uiId = Object.keys(project.midiMappings).find(key => project.midiMappings[key] === data1);
          if (uiId) {
            audioEngine.setParam(uiId, data2);
          }
        }
      }
    };

    (navigator as any).requestMIDIAccess().then((access: any) => {
      for (const input of access.inputs.values()) {
        input.onmidimessage = onMidiMessage;
      }
    });
  }, [isLearning, pendingId, updateMidiMapping]);

  return (
    <MidiContext.Provider value={{ isLearning, startLearning, stopLearning }}>
      {children}
    </MidiContext.Provider>
  );
};

export const useMidi = () => useContext(MidiContext);
