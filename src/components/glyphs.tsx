import type { CuratedWalk } from "@/types/routes";

export type PlaceTheme = CuratedWalk["theme"];

/** Visual theme per stop: drives pin colour and the glyph inside its seal. */
export const PLACE_THEMES: Record<string, PlaceTheme> = {
  "shijo-kawaramachi": "culture", "shijo-ohashi": "riverside", "yasaka-west-view": "culture",
  "kawabata-riverside": "riverside", "sanjo-ohashi": "riverside",
  "maruyama-cherry-path": "park", "chionin-south-gate-path": "park",
};
export const placeTheme = (placeId: string): PlaceTheme => PLACE_THEMES[placeId] ?? "culture";

/** 1.5 px line glyphs (24 × 24): torii, river waves, leaf. Static strings only, safe for innerHTML. */
export const THEME_GLYPH_PATHS: Record<PlaceTheme, string> = {
  culture: '<path d="M5 7h14M7 7v11M17 7v11M6 10.5h12M4.5 5.5c2.5.8 12.5.8 15 0"/>',
  riverside: '<path d="M4 9c2.7-2 5.3 2 8 0s5.3 2 8 0M4 14c2.7-2 5.3 2 8 0s5.3 2 8 0"/>',
  park: '<path d="M12 19V10M12 10c0-3.5 2.5-5.5 6-5.5 0 3.6-2.4 5.5-6 5.5ZM12 13c0-2.6-2-4.2-5-4.2 0 2.7 2 4.2 5 4.2Z"/>',
};

export function glyphSvg(theme: PlaceTheme, size: number, strokeWidth = 1.5) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${THEME_GLYPH_PATHS[theme]}</svg>`;
}

export type Season = "momiji" | "sakura" | "sparkle";
/** Seasonal sprite by Kyoto calendar month: maple Oct–Dec, cherry Mar–Apr, neutral sparkle otherwise. */
export function kyotoSeason(timestamp: number): Season {
  const month = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", month: "numeric" }).format(timestamp));
  return month >= 10 ? "momiji" : month === 3 || month === 4 ? "sakura" : "sparkle";
}

const SPRITE_PATHS: Record<Season, string> = {
  // Five-lobed maple leaf, cherry petal with a notch, four-point sparkle.
  momiji: "M12 2l1.6 4.4 3.9-2.2-1.2 4.6 4.7-.4-3.3 3.3 3.8 2.6-4.6.9.9 4.3-4-2.4L12 22l-1.8-4.9-4 2.4.9-4.3-4.6-.9 3.8-2.6L3 8.4l4.7.4-1.2-4.6 3.9 2.2Z",
  sakura: "M12 3c3.5 2.6 5.5 6 5.5 9.4A5.5 5.5 0 0 1 12 18a5.5 5.5 0 0 1-5.5-5.6C6.5 9 8.5 5.6 12 3Zm0 0-1.3 2.3h2.6Z",
  sparkle: "M12 2c.7 5 3 7.3 8 8-5 .7-7.3 3-8 8-.7-5-3-7.3-8-8 5-.7 7.3-3 8-8Z",
};
export function SeasonSprite({ season, size = 18 }: { season: Season; size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><path d={SPRITE_PATHS[season]} /></svg>;
}

/**
 * One seal drawing per stop (visuals.md M2), same 24 × 24 grid and line weight as the pins.
 * Placeholder art drawn in code; replace with designer seals when supplied.
 */
export const PLACE_SEAL_PATHS: Record<string, string> = {
  // Crossroads between four city blocks.
  "shijo-kawaramachi": '<path d="M3 12h18M12 3v18M5 5h4v4H5zM15 5h4v4h-4zM5 15h4v4H5zM15 15h4v4h-4z"/>',
  // Girder bridge on two piers over the river.
  "shijo-ohashi": '<path d="M3 9h18M3 12h18M8 12v5M16 12v5M3 19.5c1.8-1.2 3.6 1.2 5.4 0s3.6 1.2 5.4 0 3.6 1.2 5.4 0"/>',
  // Two-storey tower gate.
  "yasaka-west-view": '<path d="M5 8.5 12 4.5l7 4M7 8.5V12M17 8.5V12M3.5 13.5 12 10l8.5 3.5M6 13.5V20M18 13.5V20M10 20v-4h4v4"/>',
  // River with stepping stones and the bank path.
  "kawabata-riverside": '<path d="M3 7c3 2 6 2 9 0s6-2 9 0M6 12.5h2.5M10.75 12.5h2.5M15.5 12.5H18M3 18h18"/>',
  // Wooden bridge with giboshi-capped posts.
  "sanjo-ohashi": '<path d="M3 11h18M3 14h18M6 11V8.5M12 11V8.5M18 11V8.5M6 14v5M12 14v5M18 14v5"/><circle cx="6" cy="7.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="18" cy="7.5" r="1"/>',
  // Weeping cherry.
  "maruyama-cherry-path": '<path d="M12 21V8M12 8c-3 0-6 2.5-7 8M12 8c3 0 6 2.5 7 8M12 5.5c-2 0-4.5 1.5-5 5M12 5.5c2 0 4.5 1.5 5 5M10 3.5h4"/>',
  // Temple gate on the path.
  "chionin-south-gate-path": '<path d="M3 9.5 12 5l9 4.5M5 9.5h14M7 9.5V19M17 9.5V19M3 19h18M10 19v-5h4v5"/>',
};

export function placeSealSvg(placeId: string, size: number, strokeWidth = 1.5) {
  const paths = PLACE_SEAL_PATHS[placeId] ?? THEME_GLYPH_PATHS[placeTheme(placeId)];
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

export function PlaceSeal({ placeId, size = 20, strokeWidth = 1.75 }: { placeId: string; size?: number; strokeWidth?: number }) {
  const paths = PLACE_SEAL_PATHS[placeId] ?? THEME_GLYPH_PATHS[placeTheme(placeId)];
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: paths }} />;
}
