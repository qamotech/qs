# Qamelot Media Studio

Premastered HipHop, Pop & RnB audio production workstation featuring a step sequencer, sample packs, 5-band EQ, spatial panner, master effects, and an OLED-style oscilloscope.

Originally built with [Google AI Studio](https://ai.studio/apps/38175002-35cb-4ce5-83e5-e855bfa39b84).

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Framer Motion + Lucide icons
- Web Audio API (client-side synthesis, no backend required)

## Run locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `.env.example` to `.env.local` if you add Gemini-powered features later.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript only |

## Controls

- **Space** — play / stop
- **Ctrl/Cmd+S** — save project (localStorage)
- **Ctrl/Cmd+Z** — undo
- **Ctrl/Cmd+Y** or **Ctrl/Cmd+Shift+Z** — redo
- **Ctrl/Cmd+Shift+R** — reset project
