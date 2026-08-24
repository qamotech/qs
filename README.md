# Qamelot Studio

Qamelot Studio is a React and Web Audio API production workstation for browser and Capacitor Android use. It combines a 16-step sequencer, live performance pads, piano riff recording, sound design, mixing, and local project management.

## Current capabilities

- **Sequencer Pro:** 16-step patterns, probability, ratchets, per-step pitch/velocity, track length, swing, named patterns, scenes, and arrangement sections.
- **Performance:** customizable trap pads, piano riff recorder, computer keyboard input, Web MIDI input where supported, sustain pedal, scales, quantization, arpeggiation, and riff-to-sequencer drag/drop.
- **Sound design:** ADSR, waveform selection, unison, detune, filter envelope, glide, drive, modulation, width, pump, and local one-shot preview.
- **Mixing:** 5-band master EQ, track mixer controls, track groups, master meter, limiter ceiling/release, and mastering starting points.
- **Projects:** autosave, undo/redo, named local slots, and versioned project-document migration.
- **Android:** Capacitor wrapper and custom Qamelot launcher assets.

## Stack

- React 19, TypeScript, Vite 8, Tailwind CSS 4
- Web Audio API
- Capacitor Android
- Vitest and Testing Library tooling

## Requirements and browser support

- Node.js 20+ for CI parity (Node.js 18+ remains suitable for local development).
- Chromium desktop is the primary supported browser.
- Web MIDI, microphone recording, and `StereoPannerNode` are feature-detected and may be unavailable in some browsers.
- Audio must be enabled from a user gesture due to browser autoplay policy.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

## Production status

Qamelot Studio is feature-rich but still in active production hardening. The next release-critical tasks are:

1. Move event consumption into an AudioWorklet and retain the look-ahead scheduler as the transport source.
2. Complete explicit track/bus/master routing and a true peak limiter.
3. Expand unit/browser/device test coverage and automated Android build verification.

See [`docs/PRODUCTION_ARCHITECTURE.md`](docs/PRODUCTION_ARCHITECTURE.md) for routing, persistence, performance, QA, and release guidance.

## Controls

| Action | Shortcut |
| --- | --- |
| Play / Stop | `Space` |
| Save project | `Ctrl/Cmd + S` |
| Undo | `Ctrl/Cmd + Z` |
| Redo | `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z` |
| Reset project | `Ctrl/Cmd + Shift + R` |

## License

MIT