import { useState, createContext, useContext } from 'react';

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
  const [, setPendingId] = useState<string | null>(null);

  const startLearning = (uiId: string) => {
    setIsLearning(true);
    setPendingId(uiId);
  };

  const stopLearning = () => {
    setIsLearning(false);
    setPendingId(null);
  };

  // MIDI implementation disabled due to missing ProjectData/AudioEngine support
  /*
  useEffect(() => {
    const onMidiMessage = (event: any) => {
      const [status, data1, data2] = event.data;
      // ...
    };
    (navigator as any).requestMIDIAccess().then((access: any) => {
      for (const input of access.inputs.values()) {
        input.onmidimessage = onMidiMessage;
      }
    });
  }, []);
  */

  return (
    <MidiContext.Provider value={{ isLearning, startLearning, stopLearning }}>
      {children}
    </MidiContext.Provider>
  );
};

export const useMidi = () => useContext(MidiContext);
