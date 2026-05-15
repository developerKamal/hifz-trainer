# Hifz Trainer

Progressive Web App for memorizing Quran using incremental rehearsal.  
Content: Surah Ar-Ra'd (13), ayaat 36–43.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.  
On mobile: visit the URL in Safari/Chrome and "Add to Home Screen" for the PWA experience.

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect the repo in the Vercel dashboard — it auto-detects Next.js.

## How it works

1. **Setup screen** — pick ayah range, repetitions per ayah, session duration, and input mode.
2. **Session screen** — the app walks you through each ayah N times, then combined recitations of all learned ayaat (3×).  
   - **Tap mode**: press "Klaar" after each recitation.  
   - **Voice mode**: the microphone detects when you speak (≥3 s) and then go silent (≥2 s), and advances automatically. A manual "Klaar" button is always available as fallback.
3. **Done screen** — see how many ayaat you completed and your total time.

Your session is saved to `localStorage` after each step. If you close and reopen the tab, you'll be offered to resume.

## Notes

- Surah Ar-Ra'd has 43 ayaat; the hardcoded range covers 36–43 (8 ayaat).  
  The guide referenced "36–44" but the surah ends at 43.
- No data leaves your device — there is no backend.
- PWA icons at 192 × 192 and 512 × 512 px are referenced in the manifest  
  (`/icon-192.png`, `/icon-512.png`). The repo ships only the SVG placeholder;  
  generate PNGs with any SVG-to-PNG tool if needed for full installability on Android.
