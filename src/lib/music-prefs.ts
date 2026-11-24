/**
 * Background music preferences (local to this browser, no account, no tracking).
 * Defaults to unmuted; playback starts automatically on the first user gesture.
 */
export type MusicPrefs = Readonly<{
  muted: boolean;
}>;

export const DEFAULT_MUSIC_PREFS: MusicPrefs = { muted: false };
export const BGM_SRC = "/audio/kyoto-bgm.mp3";
export const MUSIC_STORAGE_KEY = "kyoto-flow.music.v1";

const EVENT = "kyoto-flow-music-prefs-updated";
let memorySnapshot: string | null = null;

export function parseMusicPrefs(raw: string | null): MusicPrefs {
  if (!raw) return DEFAULT_MUSIC_PREFS;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return DEFAULT_MUSIC_PREFS;
    const record = value as Record<string, unknown>;
    return { muted: typeof record.muted === "boolean" ? record.muted : DEFAULT_MUSIC_PREFS.muted };
  } catch {
    return DEFAULT_MUSIC_PREFS;
  }
}

export function getMusicPrefsSnapshot(): string | null {
  try { return window.localStorage.getItem(MUSIC_STORAGE_KEY) ?? memorySnapshot; } catch { return memorySnapshot; }
}

export function readMusicPrefs(): MusicPrefs {
  return parseMusicPrefs(getMusicPrefsSnapshot());
}

export function subscribeMusicPrefs(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener("storage", callback); };
}

export function saveMusicPrefs(prefs: MusicPrefs): void {
  memorySnapshot = JSON.stringify(prefs);
  try { window.localStorage.setItem(MUSIC_STORAGE_KEY, memorySnapshot); } catch { /* Private mode: the choice lasts this visit only. */ }
  window.dispatchEvent(new Event(EVENT));
}

export function clearMusicPrefs(): void {
  memorySnapshot = null;
  try { window.localStorage.removeItem(MUSIC_STORAGE_KEY); } catch { /* Ignore blocked storage. */ }
  window.dispatchEvent(new Event(EVENT));
}
