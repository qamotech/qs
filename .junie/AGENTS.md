# Qamelot Media Studio — Development Guide

## Build & Run

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server on `0.0.0.0:3000` |
| `npm run build` | TypeScript type-check (`tsc --noEmit`) then Vite production build → `dist/` |
| `npm run preview` | Serve the production build on `0.0.0.0:3000` |
| `npm run typecheck` | Run TypeScript type-checking only |

The project uses **Vite 8**, **React 19**, **TypeScript 7**, and **Tailwind CSS 4** (via `@tailwindcss/vite` plugin). All config lives in `vite.config.ts` and `tsconfig.json`.

### Android (Capacitor 8)

The app is wrapped for Android via Capacitor. Key config: `capacitor.config.ts` (appId: `com.qamelot.media.studio`, webDir: `dist`).

Build flow: `npm run build` → `npx cap sync android` → open `android/` in Android Studio or run `npx cap run android`.

## Testing

### Setup

The project uses **Vitest** with **jsdom** environment. Config is in `vite.config.ts` under the `test` key:

```ts
test: {
  include: ['src/**/*.{test,spec}.{ts,tsx}'],
  environment: 'jsdom',
}
```

Available test dependencies: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`.

### Running Tests

| Command | Purpose |
|---------|---------|
| `npm run test` | Single run (`vitest run`) |
| `npm run test:watch` | Watch mode (`vitest`) |

### Adding Tests

Place test files next to the source they test, using the naming convention `<SourceFile>.test.ts` (or `.test.tsx` for component tests).

**Unit test example** (`src/audio/SoundLibrary.test.ts`):
```ts
import { describe, it, expect } from 'vitest';
import { SOUND_LIBRARY, getSoundPreset } from './SoundLibrary';

describe('SoundLibrary', () => {
  it('should return a preset by id', () => {
    const preset = getSoundPreset('classic-kick');
    expect(preset).toBeDefined();
    expect(preset.name).toBe('Classic Kick');
    expect(preset.category).toBe('Kick');
  });

  it('should fall back to first preset for unknown id', () => {
    const preset = getSoundPreset('nonexistent-sound');
    expect(preset).toBe(SOUND_LIBRARY[0]);
  });
});
```

**Component test example** (using `@testing-library/react`):
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeDefined();
  });
});
```

> **Note:** Components that use Web Audio API (`AudioEngine`) require mocking since jsdom does not implement `AudioContext`. Mock `audioEngine` at the module level with `vi.mock()`.

## Code Style

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for imports and strings
- **Semicolons:** Always used
- **Components:** Functional components with hooks; default exports for page-level components
- **Naming:** PascalCase for components/types/interfaces, camelCase for functions/variables
- **Imports:** React/library imports first, then local imports; no barrel files
- **CSS:** Tailwind utility classes inline (no separate CSS modules); global styles in `src/index.css`
- **TypeScript:** Strict mode enabled (`strict: true`), unused locals/params are errors, no explicit `any` in source

## Architecture Notes

- **Audio engine:** `src/audio/AudioEngine.ts` — singleton class wrapping Web Audio API (oscillators, filters, effects chain, EQ, panner, analyser). Depends on browser `AudioContext`.
- **Sound library:** `src/audio/SoundLibrary.ts` — 80 synthesized instrument presets (kicks, snares, hi-hats, percussion, synths) built from oscillator/noise parameters. Pure data, no browser APIs.
- **State management:** `src/hooks/useProject.ts` — custom hook with undo/redo history, localStorage persistence, and all sequencer state mutations.
- **UI components:** `src/components/` — lazy-loaded via `React.lazy()` + `Suspense` for code splitting. Heavy use of `framer-motion` for animations and `lucide-react` for icons.
- **Capacitor:** Thin wrapper for Android deployment; no native plugins beyond the core bridge.
