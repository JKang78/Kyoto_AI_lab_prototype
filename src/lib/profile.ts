import type { Locale } from "@/lib/i18n";

export type Profile = { nickname: string; locale: Locale };
const STORAGE_KEY = "kyoto-ai-lab.profile.v1";
const PROFILE_EVENT = "kyoto-ai-lab-profile-updated";
let memorySnapshot: string | null = null;

export function getProfileSnapshot(): string | null {
  try { return window.localStorage.getItem(STORAGE_KEY) ?? memorySnapshot; } catch { return memorySnapshot; }
}

export function subscribeProfile(callback: () => void): () => void {
  window.addEventListener(PROFILE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(PROFILE_EVENT, callback); window.removeEventListener("storage", callback); };
}

export function readProfile(): Profile | null {
  try {
    const raw = getProfileSnapshot();
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const record = value as Record<string, unknown>;
    if (typeof record.nickname !== "string" || (record.locale !== "en" && record.locale !== "ja")) return null;
    return { nickname: record.nickname.slice(0, 40), locale: record.locale };
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  memorySnapshot = JSON.stringify(profile);
  try {
    window.localStorage.setItem(STORAGE_KEY, memorySnapshot);
  } catch {
    // The interface remains usable if private browsing blocks local storage.
  }
  window.dispatchEvent(new Event(PROFILE_EVENT));
}
