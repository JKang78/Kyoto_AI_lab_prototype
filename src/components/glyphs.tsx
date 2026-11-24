import type { CuratedWalk } from "@/types/routes";

export type PlaceTheme = CuratedWalk["theme"];

/** Visual theme per stop: drives pin colour and the glyph inside its seal. */
export const PLACE_THEMES: Record<string, PlaceTheme> = {
  "shijo-kawaramachi": "culture", "shijo-ohashi": "riverside", "yasaka-west-view": "culture",
  "kawabata-riverside": "riverside", "sanjo-ohashi": "riverside",
  "maruyama-cherry-path": "park", "chionin-south-gate-path": "park",
  "sosui-museum-basin": "riverside", "okazaki-canal-promenade": "riverside", "heian-otorii": "culture", "heian-otenmon": "culture",
  "ginkakuji-bridge": "riverside", "honenin-junction": "riverside", "wakaoji-bridge": "riverside", "eikando-gate": "culture", "nanzenji-sanmon-approach": "culture",
  "kawai-bridge": "riverside", "kamogawa-delta": "riverside", "tadasu-south-side": "park", "kawai-shrine-approach": "culture", "shimogamo-romon": "culture",
  "nakanoshima-bridge": "riverside", "togetsukyo-bridge": "riverside", "katsura-north-bank": "riverside", "kameyama-riverside": "park",
  "sakaimachi-gomon": "culture", "kujo-pond": "park", "kenreimon-avenue": "culture", "hamaguri-gomon": "culture",
  "kyoto-station-plaza": "culture", "higashi-honganji-plaza": "culture", "nishi-honganji-gate": "culture", "umekoji-park-east": "park",
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
  // Incline rails with a canal boat.
  "sosui-museum-basin": '<path d="M3 17 18 5M6 20 21 8M9 12h6l-1.5 2.5h-3Z"/>',
  // Straight canal under cherry trees.
  "okazaki-canal-promenade": '<path d="M3 15h18M3 20h18M5 17.5c1.5-1 3 1 4.5 0s3 1 4.5 0 3 1 4.5 0M8 11V8M15 11V7"/><circle cx="8" cy="6.5" r="2.5"/><circle cx="15" cy="5.5" r="2.5"/>',
  // Giant torii over the road.
  "heian-otorii": '<path d="M3 5.5c3 1 15 1 18 0M5 9h14M7.5 6.5V20M16.5 6.5V20M12 6.5V9M3 20h18"/>',
  // Wide gate with three openings.
  "heian-otenmon": '<path d="M2.5 8.5C5.5 7.5 8.5 5 12 5s6.5 2.5 9.5 3.5M4 8.5h16M5 12h14M5 8.5V19M19 8.5V19M9.5 19v-5h5v5M3 19h18"/>',
  // Stone arch bridge over the canal.
  "ginkakuji-bridge": '<path d="M3 11h18M3 14h18M7 14a5 3.5 0 0 1 10 0M4 19c1.6-1 3.2 1 4.8 0s3.2 1 4.8 0 3.2 1 4.8 0"/>',
  // Paving-stone path and a poem stone.
  "honenin-junction": '<path d="M8 21 11 8M16 21 13 8M8.8 17.5h6.4M9.7 13.5h4.6M17 6h3v6h-3zM18.5 7.5v3"/>',
  // Small bridge below a shrine torii.
  "wakaoji-bridge": '<path d="M3 15h18M5 15v4M19 15v4M7.5 6.5h9M9 8.5h6M9.5 6.5V13M14.5 6.5V13M3 21h18"/>',
  // Maple leaf.
  "eikando-gate": '<path d="M12 21v-6M12 15 5 11l3-1-2-4 4 2 2-5 2 5 4-2-2 4 3 1Z"/>',
  // Massive two-storey gate.
  "nanzenji-sanmon-approach": '<path d="M3 7.5 12 4l9 3.5M5 7.5h14M6 7.5v4M18 7.5v4M3 12.5 12 10l9 2.5M5 12.5V20M19 12.5V20M9.5 20v-4.5h5V20M3 20h18"/>',
  // Bridge beneath a willow.
  "kawai-bridge": '<path d="M3 13h18M3 16h18M6 16v4M18 16v4M17 3c-3 0-5 2-5 6M17 3c0 3-1 5-1 7M17 3c1 2 2 4 2 7"/>',
  // Two rivers meeting, with stepping stones.
  "kamogawa-delta": '<path d="M4 3c2 5 5 8 8 10M20 3c-2 5-5 8-8 10M12 13v8"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/>',
  // Forest trees.
  "tadasu-south-side": '<path d="M6 21v-8M6 13c-2.5 0-3.5-2-3.5-4S4 5 6 5s3.5 2 3.5 4-1 4-3.5 4ZM16 21v-9M16 12c-3 0-4.5-2.5-4.5-5S13 2.5 16 2.5s4.5 2 4.5 4.5S19 12 16 12ZM3 21h18"/>',
  // Hand-mirror ema with a face.
  "kawai-shrine-approach": '<circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V21M10 21h4M10 8h.01M14 8h.01M10.5 11c1 .8 2 .8 3 0"/>',
  // Tower gate with a balcony.
  "shimogamo-romon": '<path d="M4 7.5 12 4l8 3.5M6 7.5V10M18 7.5V10M4 10h16M5 10v2h14v-2M3.5 13.5 12 11l8.5 2.5M6 13.5V20M18 13.5V20M10 20v-3.5h4V20"/>',
  // Footbridge to a river island.
  "nakanoshima-bridge": '<ellipse cx="15" cy="15" rx="6" ry="2.5"/><path d="M2 10h8M3 10v4M9 10v4M15 12.5V9M15 9c-2 0-3-1-3-2.5M15 9c2 0 3-1 3-2.5M2 20c3-1.2 6 1.2 9 0s6 1.2 10 0"/>',
  // Long trestle bridge, mountain and moon.
  "togetsukyo-bridge": '<path d="M3 12c3-5 6-7 9-7 2 0 4 2 6 4M2 14h20M5 14v5M10 14v5M14 14v5M19 14v5"/><circle cx="18" cy="5" r="1.8"/>',
  // Roofed river boat on the water.
  "katsura-north-bank": '<path d="M4 14h16l-2 3H6ZM7 14v-3h10v3M7 11l5-3 5 3M3 20c3-1.2 6 1.2 9 0s6 1.2 9 0"/>',
  // Hill with a pine above the river.
  "kameyama-riverside": '<path d="M2 16c4-8 8-11 12-11s6 4 8 11M12 9v6M12 9c-2 0-3.5 1-4 2.5M12 9c2 0 3.5 1 4 2.5M2 20c3-1.2 6 1.2 9 0s6 1.2 11 0"/>',
  // Gate between garden walls.
  "sakaimachi-gomon": '<path d="M5 8h14M4 8c2-1.2 14-1.2 16 0M7 8v12M17 8v12M7 11h10M2 13h5M17 13h5M3 13v7M21 13v7M2 20h20"/>',
  // Pond with an arched bridge.
  "kujo-pond": '<ellipse cx="12" cy="16" rx="9" ry="4"/><path d="M5 12c2-3 12-3 14 0M7 11.2V14M12 10v3M17 11.2V14"/>',
  // Gate at the end of a broad avenue.
  "kenreimon-avenue": '<path d="M8 7h8M7.5 7.5 12 5l4.5 2.5M9 7v4M15 7v4M9 11 4 21M15 11l5 10M8 11h8"/>',
  // Clam shell.
  "hamaguri-gomon": '<path d="M4 15c0-5.5 3.6-9 8-9s8 3.5 8 9ZM12 6v9M8 7.5l2.5 7.5M16 7.5l-2.5 7.5M3 15h18M7 19h10"/>',
  // Tower beside the station building.
  "kyoto-station-plaza": '<path d="M10 21V11h4v10M12 11V5M10.5 5h3M11 3h2M2 21h20M15 21v-6h7M17.5 15v6M2 21v-5h8"/>',
  // Great hall reflected in water.
  "higashi-honganji-plaza": '<path d="M2 9c4-1 7-4 10-4s6 3 10 4M4 9h16M5 9v5M19 9v5M3 14h18M6 18c2 .8 4 .8 6 0s4-.8 6 0M8 21c1.3.6 2.7.6 4 0s2.7-.6 4 0"/>',
  // Temple gate and a ginkgo leaf.
  "nishi-honganji-gate": '<path d="M3 10 10 6.5l7 3.5M4.5 10v10M15.5 10v10M8 20v-5h4v5M2 20h18M19.5 20v-6M19.5 14c-2.5 0-3.5-1.5-2-4.5 1 2 3 2 4 0 1.5 3 .5 4.5-2 4.5Z"/>',
  // Preserved tram car.
  "umekoji-park-east": '<path d="M4 8h16v9H4zM4 12h16M8 8V5h8v3M7 20l1.5-3M17 20l-1.5-3M3 20h18"/>',
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
