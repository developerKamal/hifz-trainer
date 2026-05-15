# Project: Quran Memorization Trainer (PWA)

## Goal
Build a Progressive Web App that walks a user through a 25-minute Quran memorization session using the **incremental rehearsal** method. The app enforces the method by structuring the session — it does NOT teach recitation, correct pronunciation, or store user data in the cloud.

## Core method
Incremental rehearsal means: learn ayah 1 (repeat N times) → learn ayah 2 (repeat N times) → recite 1+2 together → learn ayah 3 (repeat N times) → recite 1+2+3 together → and so on, until the session ends or the selected range is complete.

## Stack
- Next.js 14+ (App Router), TypeScript, Tailwind CSS
- PWA (manifest + service worker so it installs on mobile and works offline)
- No backend, no database, no auth. All state in React + localStorage for resuming a session.
- Deploy target: Vercel

## Hardcoded content for v1
Use **Surah Ar-Ra'd (13), ayaat 36-44** as the only available content. Hardcode the Arabic text in a TypeScript array. Don't fetch from any API. Don't build a surah-picker. Just one surah, one range, working end-to-end.

## Two input modes (both must work in v1)
The user picks the mode before starting a session:

### Tap mode
After reciting an ayah, the user taps a big button labeled "Klaar" to advance.

### Voice mode  
The app uses the Web Audio API to detect when the user has finished reciting:
- Use `getUserMedia` + `AudioContext` + an `AnalyserNode` to monitor microphone input volume.
- An ayah counts as "complete" when:
  1. The user has been speaking (volume above threshold) for at least 3 seconds, AND
  2. There has been silence (volume below threshold) for 2 continuous seconds afterwards.
- Show a live visual indicator of mic input (simple bar or pulsing circle) so the user knows the mic is working.
- Voice mode requires explicit user permission for mic access; handle the denial case gracefully and fall back to tap mode.

**Important:** Build the session engine so the input mode is decoupled. The engine emits "waiting for user to finish current step" and accepts a `markComplete()` call from whichever input source is active. Do not bake tap-specific or voice-specific logic into the rehearsal flow.

## Session flow
User configures before starting:
- Ayah range (default 1-3, max 1-10)
- Repetitions per ayah (default 5)
- Session duration in minutes (default 25)
- Input mode (tap or voice)

Then the session runs:
1. Show ayah 1. Prompt: "Lees ayah 1 — herhaling 1 van 5". Wait for `markComplete()`. Increment counter. Repeat until 5/5.
2. Move to ayah 2. Same loop.
3. After ayah 2 is done 5x: show "Lees ayah 1 en 2 samen — 3 keer". Run 3 combined repetitions (each combined recitation is one `markComplete()` cycle covering both ayaat).
4. Move to ayah 3. Same.
5. After ayah 3 done: combined recitation of 1+2+3, 3 times.
6. Continue until either: all ayaat in range are learned + final combined recitation done, OR session duration expires.

When session time expires mid-step, finish the current step and then end. Don't cut off mid-ayah.

## UI
Mobile-first. Minimal, calm, distraction-free.

- **Setup screen:** range slider, repetitions slider, duration slider, mode toggle (tap/voice), big "Start sessie" button.
- **Session screen:** 
  - Large Arabic text of the current ayah (or current combined ayaat). Use a proper Arabic font — `Amiri Quran` from Google Fonts works well. Right-to-left layout.
  - Above the ayah: small status line in Dutch — e.g. "Ayah 3 — herhaling 2 van 5" or "Samen: ayah 1, 2, 3 — 1 van 3".
  - Below the ayah: in tap mode, a big "Klaar" button. In voice mode, the mic indicator + a manual "Klaar" fallback button.
  - Bottom: session timer counting down. Pause button.
- **Done screen:** how many ayaat completed, total time, "Nieuwe sessie" button.

Use Tailwind. Don't use a component library. Keep it under ~5 components total.

## Persistence
- Save current session state to localStorage every step. If the user closes the tab and reopens within the same session, offer to resume.
- No history, no progress tracking across sessions in v1. Just resume-in-progress.

## PWA requirements
- `manifest.json` with name "Hifz Trainer", standalone display mode.
- Service worker that caches the app shell so it works offline after first load.
- App icon (use a simple placeholder for now — a green square with white "ح" is fine).

## Out of scope — do NOT build
- Multiple surahs or a surah picker
- Account system, login, user profiles  
- Cloud sync, backend, database
- Audio recitation playback (the user reads from a physical Quran or app of their choice)
- Speech-to-text or pronunciation validation
- Teacher/parent dashboards or linking
- Wearable integration
- Analytics

## Deliverable
A working Next.js project that I can `npm install && npm run dev` and use on my phone in PWA mode. Include a brief README explaining how to run it and how to deploy to Vercel.

## Approach
Start with the session engine (the rehearsal logic) and unit test it mentally with a few scenarios before writing UI. Then build tap mode. Then build voice mode. Then PWA-ify. Don't over-engineer — this is a weekend prototype, not production code.