export type FontPresetId = "default" | "rpg-pixel" | "pixel-numbers";

export const APP_FONT_PRESET = "rpg-pixel";

export interface FontPreset {
  id: FontPresetId;
  shortLabel: string;
  label: string;
  category: "Baseline" | "Pixel";
  summary: string;
  titleFont: string;
  bodyFont: string;
  jaTitleFont: string;
  jaBodyFont: string;
  pixelAccentFont?: string;
  usesGooglePreview?: boolean;
}

export const GOOGLE_PREVIEW_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Jersey+15",
    "family=Kaisei+Decol:wght@500;700",
    "family=Zen+Kaku+Gothic+New:wght@400;500;700",
  ].join("&") +
  "&display=swap";

export const FONT_PRESETS: readonly FontPreset[] = [
  {
    id: "rpg-pixel",
    shortLabel: "1. Cozy RPG Pixel",
    label: "1. Cozy Kyoto RPG — DotGothic16 + Zen Maru Gothic",
    category: "Pixel",
    summary: "16×16 Japanese pixel display across headings, chrome, pills & controls + soft Zen Maru Gothic body.",
    titleFont: '"DotGothic16", "Noto Sans JP", monospace',
    bodyFont: '"Zen Maru Gothic", "Noto Sans JP", sans-serif',
    jaTitleFont: '"DotGothic16", "Noto Sans JP", monospace',
    jaBodyFont: '"Zen Maru Gothic", "Noto Sans JP", sans-serif',
  },
  {
    id: "pixel-numbers",
    shortLabel: "3. Pixel Numbers",
    label: "3. Pixel Numbers & Badges — Jersey 15 + Kaisei Decol + Zen Kaku",
    category: "Pixel",
    summary: "Kaisei Decol craft headings + Jersey 15 pixel numbers, badges, pills & HUD + Zen Kaku body.",
    titleFont: '"Kaisei Decol", "Shippori Mincho", serif',
    bodyFont: '"Zen Kaku Gothic New", "Noto Sans JP", sans-serif',
    jaTitleFont: '"Kaisei Decol", "Shippori Mincho", serif',
    jaBodyFont: '"Zen Kaku Gothic New", "Noto Sans JP", sans-serif',
    pixelAccentFont: '"Jersey 15", "DotGothic16", monospace',
    usesGooglePreview: true,
  },
  {
    id: "default",
    shortLabel: "Original",
    label: "Original — Shippori Mincho + Plus Jakarta Sans",
    category: "Baseline",
    summary: "Original Kyoto Ink & Washi editorial serif + geometric UI sans.",
    titleFont: '"Shippori Mincho", "Hiragino Mincho ProN", serif',
    bodyFont: '"Plus Jakarta Sans", "Noto Sans JP", sans-serif',
    jaTitleFont: '"Shippori Mincho", "Hiragino Mincho ProN", serif',
    jaBodyFont: '"Noto Sans JP", "Plus Jakarta Sans", sans-serif',
  },
] as const;

export const VALID_PREVIEW_IDS = new Set<string>(
  FONT_PRESETS.filter((p) => p.id !== "default").map((p) => p.id),
);

export function presetById(id: string | null): FontPreset {
  return FONT_PRESETS.find((p) => p.id === id) ?? FONT_PRESETS[2];
}
