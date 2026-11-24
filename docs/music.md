# Background Music & Mute Control (`docs/music.md`)

> **Status:** Ready for implementation (waiting on the audio file to be dropped into `public/audio/`).  
> **Summary:** Play a cozy, looping background music track continuously while the user uses Kyoto Flow (across all 5 tabs: Home, Explore, Missions, Rewards, Me), with a persisted **Mute** switch under the **Me** tab.  
> **Related files:** [map-prefs.ts](../src/lib/map-prefs.ts) (local preference pattern), [prototype-app.tsx](../src/components/prototype-app.tsx) (`Me` settings & `Delete my local data`), [en.json](../src/locales/en.json), [ja.json](../src/locales/ja.json).

---

## 1. Audio Asset & Placement

- **File path:** `public/audio/kyoto-bgm.mp3`
- **Recommended encoding:** Stereo MP3 at `128–160 kbps` (universal native support across iOS Safari, Android Chrome, and Desktop, small enough for quick PWA load).
- **Single source of truth:** Define `export const BGM_SRC = "/audio/kyoto-bgm.mp3";` in `src/lib/music-prefs.ts` (or `src/config/assets.ts`) so swapping the filename later is a 1-line change.
- **Missing-file resilience:** If `public/audio/kyoto-bgm.mp3` is not yet on disk (or fails to load), the player must fail silently without unhandled promise rejections or breaking any page or test.

---

## 2. State & Persistence (`src/lib/music-prefs.ts`)

Follow the exact `localStorage` + `useSyncExternalStore` pattern from `src/lib/map-prefs.ts` so mute state persists across reloads and stays synchronized across tabs:

```ts
export type MusicPrefs = Readonly<{ muted: boolean }>;

export const DEFAULT_MUSIC_PREFS: MusicPrefs = { muted: false };
export const BGM_SRC = "/audio/kyoto-bgm.mp3";
export const MUSIC_STORAGE_KEY = "kyoto-flow.music.v1";

const EVENT = "kyoto-flow-music-prefs-updated";
let memorySnapshot: string | null = null;
```

Export:
- `parseMusicPrefs(raw: string | null): MusicPrefs` — safely parses JSON; falls back to `DEFAULT_MUSIC_PREFS` on null, invalid JSON, or non-boolean `muted`.
- `getMusicPrefsSnapshot(): string | null`
- `readMusicPrefs(): MusicPrefs`
- `subscribeMusicPrefs(callback: () => void): () => void` — listens to `EVENT` and `storage`.
- `saveMusicPrefs(prefs: MusicPrefs): void` — updates `memorySnapshot`, writes `localStorage` inside `try/catch` (handles private browsing), and dispatches `EVENT`.

> **Node test gotcha:** Use only relative `.ts` imports (no `@/` aliases) inside `src/lib/music-prefs.ts` so `node --test tests/music-prefs.test.mjs` runs cleanly under Node 22+ native type stripping.

### Clear on "Delete my local data"
In `src/components/prototype-app.tsx` (`onDeleteAll`), also clear `MUSIC_STORAGE_KEY` (`window.localStorage.removeItem(MUSIC_STORAGE_KEY)` and reset via `saveMusicPrefs(DEFAULT_MUSIC_PREFS)`) so the privacy reset clears music preferences too.

---

## 3. Looping Audio Controller (`src/components/background-music.tsx`)

Create a lightweight `"use client"` component `<BackgroundMusic />` mounted **once** inside `PrototypeApp` (outside the tab switch, at the same persistent level as the bottom dock) so audio **never restarts or cuts out** when navigating between **Home / Explore / Missions / Rewards / Me**.

### Required Behavior
1. **Single `HTMLAudioElement` instance (in a `useRef`):**
   - `audio.src = BGM_SRC`
   - `audio.loop = true`
   - `audio.preload = "auto"`
   - `audio.volume = 0.35` (gentle ambient level so it never overwhelms the user)
   - On unmount: `audio.pause(); audio.src = "";`
2. **Browser Autoplay Unlock (Critical for iOS Safari & Chrome):**
   - Browsers block `audio.play()` before the first user interaction.
   - When `!prefs.muted`, call `audio.play().catch(...)`.
   - If `play()` rejects (e.g., `NotAllowedError`), register a one-time gesture listener on `window` for `pointerdown` and `keydown` (`{ capture: true, passive: true }`).
   - On the user's first tap/keypress (e.g., tapping *"Start exploring"*, a dock tab, or the map), re-check `!readMusicPrefs().muted`, call `audio.play().catch(() => {})`, and remove both unlock listeners.
3. **Mute / Unmute Reactivity:**
   - Subscribe to `subscribeMusicPrefs` via `useSyncExternalStore`.
   - When `prefs.muted` becomes `true`: immediately call `audio.pause()` (and set `audio.muted = true`).
   - When `prefs.muted` becomes `false`: set `audio.muted = false` and call `audio.play().catch(() => {})` — since toggling the Switch in **Me** is a user gesture, playback starts immediately even if autoplay hadn't unlocked yet!
4. **App Backgrounding (`visibilitychange`):**
   - Listen to `document.addEventListener("visibilitychange", ...)`.
   - When `document.hidden === true` (user locks phone or switches browser tabs): call `audio.pause()` so music doesn't keep playing in the background.
   - When `document.hidden === false`: if `!readMusicPrefs().muted` and playback was already unlocked, call `audio.play().catch(() => {})` to seamlessly resume looping.

---

## 4. Mute Toggle Under the `Me` Tab (`src/components/prototype-app.tsx`)

Add a compact **Sound / Music** section inside `Me` (e.g., right below `Language` or `MapLookSettings`), reusing the existing `.settings-section` and `<Switch>` components so it matches the exact Kyoto Ink & Washi styling with zero new CSS needed:

```tsx
<section className="settings-section">
  <h2>
    {musicPrefs.muted
      ? <VolumeX size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />
      : <Volume2 size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />}
    {t("musicHeading")}
  </h2>
  <Switch
    checked={musicPrefs.muted}
    onChange={(muted) => { haptic(); saveMusicPrefs({ muted }); }}
  >
    {t("musicMuteSwitch")}
  </Switch>
  <p className="settings-hint">{t("musicHint")}</p>
</section>
```

- Uses `Volume2` and `VolumeX` from `lucide-react` (already installed).
- Turning the switch **ON** mutes the background music (`muted: true`); turning it **OFF** unmutes and resumes looping (`muted: false`).

### Bilingual Strings (`src/locales/en.json` & `src/locales/ja.json`)

| Key | `src/locales/en.json` | `src/locales/ja.json` |
|---|---|---|
| `musicHeading` | `"Sound"` | `"サウンド"` |
| `musicMuteSwitch` | `"Mute background music"` | `"BGMをミュート"` |
| `musicHint` | `"Loops softly while you explore Kyoto. Pauses automatically when you leave the app."` | `"散策中にBGMがやさしくループ再生されます。アプリを離れると自動で一時停止します。"` |

---

## 5. Merge-Safe File Map (`prototype-engineering` vs. `main`)

| Action | File | Responsibility |
|---|---|---|
| `[NEW]` | `public/audio/kyoto-bgm.mp3` | Looping background track (added when supplied) |
| `[NEW]` | `src/lib/music-prefs.ts` | `localStorage` persistence + `useSyncExternalStore` subscription |
| `[NEW]` | `src/components/background-music.tsx` | Persistent looping `<audio>` controller with autoplay unlock & `visibilitychange` pause/resume |
| `[NEW]` | `tests/music-prefs.test.mjs` | Unit tests for `parseMusicPrefs` defaults & malformed input handling |
| `[MODIFY]` | `src/components/prototype-app.tsx` | Mount `<BackgroundMusic />` once at app root; add the `Sound` / `Mute background music` section in `Me`; clear `MUSIC_STORAGE_KEY` in `onDeleteAll` |
| `[MODIFY]` | `src/locales/en.json`, `src/locales/ja.json` | Add `musicHeading`, `musicMuteSwitch`, and `musicHint` |

---

## 6. Verification Checklist (When Implementing)

### Automated Tests
```bash
npm run typecheck
npm run lint
npm test
npm run build
```
- `tests/music-prefs.test.mjs`: verifies `parseMusicPrefs(null)` → `{ muted: false }`, valid JSON `{"muted":true}`, invalid JSON, and non-boolean `muted` values.

### Manual & Mobile Browser Checks
- [ ] Open `http://localhost:3000`: tap anywhere (e.g., *Start exploring* or a tab) → music begins playing softly and loops cleanly when the track ends.
- [ ] Switch across all 5 tabs (**Home → Explore → Missions → Rewards → Me**) → music plays continuously without restarting or stuttering.
- [ ] Go to **Me → Sound** and toggle **Mute background music** ON → music pauses immediately; reload the page → stays muted.
- [ ] Toggle **Mute background music** OFF → music resumes immediately.
- [ ] Switch to another browser tab (or lock phone) → music pauses; return to the tab → music resumes if unmuted.
- [ ] Trigger **Me → Delete my local data** → mute preference resets to default (`muted: false`).
- [ ] Verify zero console errors in headless Playwright or if `public/audio/kyoto-bgm.mp3` is absent.
