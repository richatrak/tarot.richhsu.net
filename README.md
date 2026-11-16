# 靜心塔羅 (Tarot reflection PWA)

Traditional-Chinese, beginner-friendly tarot **reflection** web app. Installable, works offline, no login,
no tracking. Built with Vite + Preact + TypeScript + vite-plugin-pwa (Workbox, injectManifest).

## Features (v0.1)
- Spreads: single card · 3-card Past/Present/Future · 3-card Situation/Action/Outcome · Two-choice (5) · Celtic Cross (10) · **free draw of any 1–78 cards**.
- Standard 78-card deck, RWS ordering (Strength 8, Justice 11), suits 權杖/聖杯/寶劍/**金幣**.
- Draws: Web Crypto `getRandomValues` + rejection sampling (no modulo bias) + Fisher–Yates; no repeats within a reading. Each card keeps draw order, position, upright/reversed.
- Reversals: on by default, 50% per card, toggle on home & settings.
- Every card: zh-TW name, English name, keywords, upright/reversed meaning, reflection tip. Content marked `draft` until human-reviewed (shown in UI).
- 「你想問什麼？」 question box, saved with the reading; one-tap clear.
- 今日一牌 (daily card): drawn once per local day, stable across reloads.
- History in localStorage (max 100), per-item delete, clear all, JSON export/import; option to disable saving.
- PWA: manifest, icons, precache of everything (~116 KB incl. all 78 faces & meanings), offline-readiness indicator that **re-verifies the cache on every launch**, retry button, update prompt when a new version is deployed.
- Responsive phone/tablet/desktop, portrait/landscape; numbered badges + text labels so order and reversal are never lost; screen-reader labels; reduced-motion support.

## Run locally
```bash
npm ci
npm run dev        # http://localhost:5173 (service worker is disabled in dev)
npm test           # unit tests (vitest)
npm run build && npm run preview   # production build at http://localhost:4173 (SW enabled)
npm run test:e2e   # browser checks against the build (needs Chromium + Playwright installed globally)
```
To test on a phone on the same Wi-Fi: `npm run build && npx vite preview --host`. Note service workers
require HTTPS except on `localhost`, so offline mode won't work over plain `http://192.168.x.x` — use the
deployed HTTPS site for real offline testing.

## Deploy (GitHub Pages)
`.github/workflows/deploy.yml` builds, tests and deploys on every push to `main`.
1. Create a GitHub repo and push this project.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Site appears at `https://<user>.github.io/<repo>/`. The workflow sets `BASE_PATH=/<repo>/`.
   For a custom domain or a `<user>.github.io` repo, change `BASE_PATH` to `/`.

Making the repo/site public = public release; agree on it first.

### Updating the PWA
Push to `main`. Open apps detect the new service worker (on launch and hourly) and show
「有新版本可用 → 立即更新」. Choosing 「稍後」 keeps the old version until all tabs/app windows close.
Bump `version` in `package.json` so the About page shows it. Old precaches are cleaned automatically.

## Offline behaviour & limits
- Ready only after **one complete online load**; the header pill shows 「離線資源已就緒 (n/n)」.
- If the browser evicts the cache (low storage, iOS after long non-use), the pill shows not-ready; open once online to recover (or tap 重新下載離線資源).
- **iOS:** the Home-Screen app has **separate storage** from Safari tabs: after 「加入主畫面」, launch it from the icon once while online. Its history is also separate from Safari's.
- localStorage data is lost when site data is cleared, in private mode, or on another device/browser. Use Export.

## Future: wrap with Capacitor (iOS/Android) — not done, not tested
```bash
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init 靜心塔羅 com.example.tarot --web-dir dist
npm run build && npx cap add ios && npx cap add android
npx cap sync && npx cap open ios   # needs macOS + Xcode; Android Studio for android
```
Notes: inside Capacitor files are already local, so skip service-worker registration there
(guard `initPWA()` with `Capacitor.isNativePlatform()`); use `BASE_PATH=/`. App-store review
(Apple guideline 4.3 lists fortune-telling as a saturated category; 4.2 minimum functionality) was explicitly deferred.

## Verification status (2026-11-16)
| Check | Result |
|---|---|
| Unit tests (20): deck integrity, RWS numbering, no-repeat draws for every spread, position/order mapping, 1–78 free draw, rejection sampling, χ² uniformity, ~50% reversal rate, storage/clear/export/import | ✅ pass |
| E2E (104 checks), **Chromium only**: every spread + free draw 7/78, card order ↔ meaning list ↔ upright/reversed label ↔ visual rotation, question shown & saved, redraw, reversals-off, history, daily card persistence, clear question, clear all data | ✅ pass |
| Offline in Chromium: readiness indicator → offline reload → Celtic Cross draw → deep-link fallback | ✅ pass |
| Layout at 320, 375, 852×393 landscape, 820 tablet, 1366 desktop: no horizontal scroll, all cards on screen, touch targets ≥ 32px | ✅ pass (Chromium emulation) |
| Basic a11y: spoken card labels, focus to results, keyboard jump card→meaning | ✅ pass (automated; no real screen-reader session) |
| **iPhone Safari / Add to Home Screen / offline relaunch** | ⏳ **not tested — no device / WebKit in this environment** |
| **Real Android device, Firefox, Safari macOS** | ⏳ not tested |
| VoiceOver / TalkBack manual run | ⏳ not tested |

## Open items
- Human review of all 78 cards' text (`status: 'draft'` → `'reviewed'`).
- Card faces are schematic SVG placeholders; illustrated faces not started.
- Real-device testing (see table). Suggested iPhone script: open site online → wait for 已就緒 → 分享 → 加入主畫面 → open from icon online, wait for 已就緒 → Airplane mode → force-quit → reopen → draw Celtic Cross with reversals on → check meanings.
- No analytics by design.
