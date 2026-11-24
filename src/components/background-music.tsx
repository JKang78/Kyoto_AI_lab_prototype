"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { BGM_SRC, getMusicPrefsSnapshot, parseMusicPrefs, readMusicPrefs, subscribeMusicPrefs } from "@/lib/music-prefs";

const DEFAULT_VOLUME = 0.35;

/**
 * Headless looping background music controller (docs/music.md).
 * Mounted once in RootLayout so playback continues seamlessly across all tabs.
 */
export function BackgroundMusic() {
  const snapshot = useSyncExternalStore(subscribeMusicPrefs, getMusicPrefsSnapshot, () => null);
  const { muted } = parseMusicPrefs(snapshot);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(BGM_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = DEFAULT_VOLUME;
    audioRef.current = audio;

    const tryPlay = () => {
      if (readMusicPrefs().muted || document.hidden) return;
      audio.muted = false;
      const promise = audio.play();
      if (promise) {
        promise.then(() => {
          unlockedRef.current = true;
        }).catch(() => {
          // Autoplay blocked or file unavailable; retry on first user gesture.
        });
      }
    };

    const onFirstGesture = () => {
      unlockedRef.current = true;
      tryPlay();
      window.removeEventListener("pointerdown", onFirstGesture, true);
      window.removeEventListener("keydown", onFirstGesture, true);
    };

    const onVisibility = () => {
      if (document.hidden) {
        audio.pause();
      } else if (!readMusicPrefs().muted && unlockedRef.current) {
        tryPlay();
      }
    };

    window.addEventListener("pointerdown", onFirstGesture, { capture: true, passive: true });
    window.addEventListener("keydown", onFirstGesture, { capture: true, passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    tryPlay();

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture, true);
      window.removeEventListener("keydown", onFirstGesture, true);
      document.removeEventListener("visibilitychange", onVisibility);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    if (muted) {
      audio.pause();
    } else if (!document.hidden) {
      audio.play().then(() => {
        unlockedRef.current = true;
      }).catch(() => {
        // Will start on the next user gesture if not unlocked yet.
      });
    }
  }, [muted]);

  return null;
}
