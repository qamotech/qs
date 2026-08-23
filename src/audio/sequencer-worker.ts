// src/audio/sequencer-worker.ts

let timeout: any;
let bpm: number = 120;
let swing: number = 0;
let step = 0;

self.onmessage = (e) => {
  if (e.data.type === 'start') {
    bpm = e.data.bpm;
    swing = e.data.swing;
    step = e.data.step;
    schedule();
  } else if (e.data.type === 'stop') {
    clearTimeout(timeout);
  } else if (e.data.type === 'update') {
    bpm = e.data.bpm;
    swing = e.data.swing;
  }
};

function schedule() {
  self.postMessage({ type: 'tick', step });
  
  const baseDelay = 60000 / (bpm * 4); // 16th note in ms
  let delay = baseDelay;
  
  // Swing logic
  const swingFactor = swing / 100;
  const maxSwing = baseDelay * 0.6;
  
  if (step % 2 === 1) { // next step is odd
    delay += swingFactor * maxSwing;
  } else { // next step is even
    delay -= swingFactor * maxSwing;
  }
  
  step = (step + 1) % 16;
  
  timeout = setTimeout(schedule, delay);
}
