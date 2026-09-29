# 🎹🎛️ Qamelot Studio

**React and Web Audio production workstation with sequencing, performance pads, piano riffs, sound design, mixing, local projects, and a Capacitor Android wrapper.**

🏷️ Maintained in [qamotech/qs](https://github.com/qamotech/qs) · 🌐 Public repository

## ✨ What is here

- 🥁 Sequencer patterns, scenes, probability, ratchets, and track controls.
- 🎹 Performance pads, piano riff recording, keyboard and optional MIDI input.
- 🎛️ Synthesis, sound design, track mixing, EQ, and master controls.
- 💾 Local project management with Android wrapper files and test tooling.

## 🧭 Try the project

Enable audio with a user gesture, build a short pattern, adjust a sound, record a riff, and save a local project before exploring arrangement and mixing.

## 🚀 Local setup

```sh
git clone https://github.com/qamotech/qs.git
cd qs
```

Use Node.js and npm compatible with the versions in `package.json`. Install dependencies locally, then launch the declared development command:

```sh
npm install
npm run dev
```

Open the address printed by the development server. The manifest is the source of truth for commands:

| Command | Declared operation |
|---|---|
| `npm run dev` | `vite --host 0.0.0.0 --port 3000` |
| `npm run build` | `tsc --noEmit && vite build` |
| `npm run preview` | `vite preview --host 0.0.0.0 --port 3000` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | `vitest run` |
| `npm run test:watch` | `vitest` |

Install/build scripts can execute code. Inspect project configuration and keep secrets in local configuration excluded from Git. No dependency installation or application build was performed for this documentation update.

## 🗂️ Source map

- 📄 [`capacitor.config.ts`](capacitor.config.ts)
- 📄 [`index.html`](index.html)
- 📄 [`metadata.json`](metadata.json)
- 📄 [`package-lock.json`](package-lock.json)
- 📄 [`package.json`](package.json)
- 📄 [`server.ts`](server.ts)
- 📄 [`tsconfig.json`](tsconfig.json)
- 📄 [`tsconfig.node.json`](tsconfig.node.json)
- 📄 [`vite.config.d.ts`](vite.config.d.ts)
- 📄 [`vite.config.ts`](vite.config.ts)
- 📄 [`src`](src) — source directory
- 📄 [`android`](android) — source directory
- 📄 [`assets`](assets) — source directory

## ⚙️ Configuration & data

Existing production-hardening notes remain relevant. Audio latency and MIDI/microphone support depend on the device and browser. Existing README and package manifest disagree on licensing; this update does not resolve ownership or licensing.

Keep credentials, private exports, customer records, and personal information out of commits and screenshots. A local browser demo is not evidence of account security, reliable persistence, or connected external services. Preserve exports before changing storage keys or resetting an application.

## 🧪 Verification checklist

- 🔎 Confirm the entry file and asset paths above exist in your checkout.
- ▶️ Start the documented runtime and inspect browser or terminal errors.
- 🧭 Exercise the project-specific workflow described above using sample data.
- 📱 Check narrow and wide layouts when the project has a browser interface.
- 💾 Verify save/export and recovery behavior before trusting important work to it.
- 📝 Record the exact command, browser, operating system, and outcome of your checks.

This guide was prepared from repository files and manifests. It does not claim a fresh build, deployment, security audit, or full functional test of this project.

## 🤝 Contributions & useful reports

Keep changes focused and explain the user-visible result. Preserve existing assets and configuration unless a change requires updating them. Include reproduction steps, expected and actual behavior, and relevant screenshots with personal information removed. For UI work, include the viewport and browser; for runtime issues, include the command and error text.

## 🛠️ Maintenance priorities

- 📚 Keep this guide aligned with implemented behavior and current entry points.
- 🧪 Add or maintain checks for the core workflow before expanding features.
- ♿ Review labels, keyboard navigation, contrast, and responsive layout.
- 📦 Document external services, asset rights, and deployment prerequisites.

## 📜 Licensing & attribution

This documentation update does not grant a new software or asset license. Consult existing license files, source headers, package metadata, and original asset terms; resolve inconsistencies with the owner before redistribution. Third-party names and resources retain their own terms.

---

## 📚 Preserved earlier documentation

The material below is retained verbatim for history and project-specific context. Template instructions and older claims may differ from the source inventory above.

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