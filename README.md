# Qamelot Studio

**Qamelot Studio** is a professional-grade, premastered audio production workstation designed for HipHop, Pop, and RnB. It provides a browser-based, high-performance environment for beat-making, sound design, and master-level processing.

Originally built with [Google AI Studio](https://ai.studio/apps/38175002-35cb-4ce5-83e5-e855bfa39b84).

![Qamelot Studio UI](assets/screenshot.png) *(Note: Add your own screenshot to assets/screenshot.png)*

## 🚀 Key Features

### 🥁 Creative Sequencing
- **16-Step Sequencer**: Precision grid with per-track volume, mute/solo, and customizable sounds.
- **AI Beatbox & Riff Generator**: Generate instant inspiration using intelligent randomization algorithms.
- **Chord Generator**: Drag-and-drop harmonic structures directly into your tracks.
- **Performance Pads**: Real-time triggering for live improvisation.

### 🎛️ Master-Grade Processing
- **5-Band Master EQ**: Shape your final sound with surgical precision.
- **Master Effects**: Integrated Reverb Chamber, Delay, and resonant Filters.
- **Advanced Dynamics**: Multiband Compressor, Master Limiter, and Tape Saturation for that "warm" professional finish.
- **24-Enhancement Rack**: A comprehensive suite of analog-style enhancements (Tube, Crunch, Excite, Air, etc.).

### 🔊 Spatial & Monitoring
- **Spatial Panner**: Position your tracks in a 2D soundstage for wide, immersive mixes.
- **OLED-Style Oscilloscope**: Real-time waveform visualization.
- **Spectral Analyzer**: High-resolution frequency distribution monitoring.

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Audio Engine**: Web Audio API (Client-side synthesis and processing)

## 📦 Getting Started

### Prerequisites
- Node.js 18+

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start producing.

### Production Build
```bash
npm run build
npm run preview
```

## ⌨️ Controls & Shortcuts

| Action | Shortcut |
|--------|----------|
| **Play / Stop** | `Space` |
| **Save Project** | `Ctrl/Cmd + S` |
| **Undo** | `Ctrl/Cmd + Z` |
| **Redo** | `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z` |
| **Reset Project** | `Ctrl/Cmd + Shift + R` |

## 📱 Mobile & Android Support
Qamelot includes a Capacitor-based Android wrapper located in the `android/` directory, allowing for a native-like experience on mobile devices with hardware-accelerated audio.

## 📄 License
MIT
