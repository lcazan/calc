# Deep Dig — PWA

## Files
- index.html — the game
- manifest.webmanifest — app name, icons, landscape/fullscreen settings
- sw.js — service worker (offline play)
- icons/ — app icons (regular, maskable, Apple touch icon, favicon)

## Deploy
1. Upload the whole folder, keeping the structure, to any static host served over HTTPS
   (GitHub Pages, Netlify, Vercel, Cloudflare Pages, or your own server). Service workers do not run over plain http, except on localhost.
2. Open the URL on your phone once while online.
3. Install it:
   - Android / Chrome: menu, then "Install app" (or "Add to Home screen").
   - iPhone / Safari: Share button, then "Add to Home Screen".
4. After the first visit, it works offline.

## Test locally
    python3 -m http.server 8080
then visit http://localhost:8080

## Updating
After changing index.html, change VERSION in sw.js (e.g. deepdig-v2) so installed copies pick up the new version.

## Notes
- Progress is saved on the device (localStorage). Deleting the app or clearing site data resets it.
- Android honours the landscape lock. iOS ignores it, so the game shows a "turn your phone sideways" screen in portrait.
