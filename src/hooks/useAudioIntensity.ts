import { useState, useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';

export function useAudioIntensity() {
  const [intensity, setIntensity] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const dataArray = new Uint8Array(128);

    const update = () => {
      audioEngine.getAudioData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += Math.abs(dataArray[i] - 128);
      }
      setIntensity(sum / dataArray.length / 128);
      animationFrameId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return intensity;
}
