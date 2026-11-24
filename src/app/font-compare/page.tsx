"use client";

import { useEffect, useRef, useState } from "react";
import {
  FONT_PRESETS,
  GOOGLE_PREVIEW_FONTS_URL,
  presetById,
  type FontPreset,
  type FontPresetId,
} from "@/lib/font-presets";

type Mode = "live" | "specimen";
type CompareTab = "Home" | "Explore" | "Missions" | "Rewards" | "Me";

const TABS: CompareTab[] = ["Home", "Explore", "Missions", "Rewards", "Me"];
const TAB_INDEX: Record<CompareTab, number> = {
  Home: 0,
  Explore: 1,
  Missions: 2,
  Rewards: 3,
  Me: 4,
};

function frameUrl(presetId: FontPresetId, pixelMap: boolean): string {
  const params = new URLSearchParams({ route: "kamo-riverside" });
  if (presetId !== "default") params.set("font", presetId);
  if (pixelMap) params.set("look", "pixel");
  return `/?${params.toString()}`;
}

function SpecimenCard({ preset }: { preset: FontPreset }) {
  const accent = preset.pixelAccentFont ?? preset.titleFont;
  const heroWeight = preset.id === "default" ? 700 : 400;

  return (
    <section
      style={{
        background: "var(--bg-washi)",
        border: "1px solid var(--border-hairline)",
        borderRadius: 18,
        padding: 20,
        display: "grid",
        alignContent: "start",
        gap: 14,
        fontFamily: preset.bodyFont,
        fontSynthesisWeight: preset.id === "rpg-pixel" ? "none" : "auto",
      }}
    >
      <header style={{ borderBottom: "1px solid var(--border-hairline)", paddingBottom: 10, display: "grid", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--kyoto-purple)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {preset.shortLabel}
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 99,
              background: "var(--bg-stone)",
              color: "var(--ink-slate)",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {preset.category}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-slate)", lineHeight: 1.45 }}>{preset.summary}</div>
      </header>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: accent,
              fontSize: preset.pixelAccentFont ? 60 : 48,
              fontWeight: heroWeight,
              lineHeight: 1,
              color: "var(--ink-sumi)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            120
          </span>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ink-slate)" }}>pts</span>
          <span
            style={{
              marginLeft: "auto",
              padding: "3px 10px",
              borderRadius: 99,
              background: "var(--kyoto-purple)",
              color: "#fff",
              fontFamily: accent,
              fontSize: preset.pixelAccentFont ? 16 : 13,
              fontWeight: heroWeight,
            }}
          >
            2.0× BONUS
          </span>
        </div>

        <div style={{ fontFamily: preset.titleFont, fontSize: 24, fontWeight: preset.id === "rpg-pixel" ? 400 : 700, lineHeight: 1.2, color: "var(--ink-sumi)" }}>
          Walk the quiet side of Kyoto
        </div>
        <div style={{ fontFamily: preset.titleFont, fontSize: 17, fontWeight: preset.id === "rpg-pixel" ? 400 : 700, lineHeight: 1.25, color: "var(--ink-sumi)" }}>
          Kamo Riverside · Saved Walks
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--ink-slate)" }}>
        Follow the shaded willow path along the Kamo River, collect 3 goshuin stamps, and unlock a neighborhood tea voucher.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span
          style={{
            padding: "5px 11px",
            borderRadius: 99,
            background: "var(--bg-ivory)",
            border: "1px solid var(--border-hairline)",
            borderLeft: "4px solid var(--indigo)",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Kamo Riverside · 2.4 km
        </span>
        <span
          style={{
            padding: "5px 12px",
            borderRadius: 99,
            background: "var(--ink-sumi)",
            color: "#fff",
            fontFamily: preset.pixelAccentFont ?? preset.bodyFont,
            fontSize: preset.pixelAccentFont ? 15 : 12,
            fontWeight: preset.pixelAccentFont ? 400 : 700,
          }}
        >
          3 / 4 SEALS
        </span>
      </div>

      <div style={{ display: "grid", gap: 4, paddingTop: 8, borderTop: "1px solid var(--border-hairline)" }} lang="ja">
        <div
          style={{
            fontFamily: preset.jaTitleFont,
            fontSize: 18,
            fontWeight: preset.id === "rpg-pixel" ? 400 : 700,
            color: "var(--ink-sumi)",
          }}
        >
          鴨川リバーサイド散歩 · 120 pt
        </div>
        <div style={{ fontFamily: preset.jaBodyFont, fontSize: 12, fontWeight: 500, color: "var(--ink-slate)", lineHeight: 1.5 }}>
          静かな京都の路地や川沿いを歩いてスタンプを集めましょう。
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <a
          href={frameUrl(preset.id, false)}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, fontWeight: 700 }}
        >
          Open full app ↗
        </a>
      </div>
    </section>
  );
}

export default function FontComparePage() {
  const [mode, setMode] = useState<Mode>("live");
  const [leftPreset, setLeftPreset] = useState<FontPresetId>("rpg-pixel");
  const [rightPreset, setRightPreset] = useState<FontPresetId>("pixel-numbers");
  const [pixelMap, setPixelMap] = useState(false);
  const [activeTab, setActiveTab] = useState<CompareTab>("Home");
  const leftRef = useRef<HTMLIFrameElement>(null);
  const rightRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const id = "kyoto-font-compare-google-css";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = GOOGLE_PREVIEW_FONTS_URL;
    document.head.appendChild(link);
  }, []);

  function syncTab(tab: CompareTab) {
    setActiveTab(tab);
    const idx = TAB_INDEX[tab];
    for (const ref of [leftRef, rightRef]) {
      try {
        const doc = ref.current?.contentDocument;
        const buttons = doc?.querySelectorAll<HTMLButtonElement>(".dock .dock-item");
        buttons?.[idx]?.click();
      } catch {
        // Ignore if frame hasn't finished loading yet.
      }
    }
  }

  const leftInfo = presetById(leftPreset);
  const rightInfo = presetById(rightPreset);

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "20px 24px 40px",
        background: "var(--bg-stone)",
        color: "var(--ink-sumi)",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 16 }}>
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 18px",
            borderRadius: 16,
            background: "var(--bg-ivory)",
            border: "1px solid var(--border-hairline)",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Option 1 vs Option 3 — Font Compare</h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--ink-slate)" }}>
              1. Cozy Kyoto RPG (DotGothic16 + Zen Maru Gothic) vs 3. Pixel Numbers (Jersey 15 + Kaisei Decol + Zen Kaku)
            </p>
          </div>

          <div className="segmented" role="group" aria-label="Comparison mode">
            <button type="button" aria-pressed={mode === "live"} onClick={() => setMode("live")}>
              Side-by-side app
            </button>
            <button type="button" aria-pressed={mode === "specimen"} onClick={() => setMode("specimen")}>
              Type specimen
            </button>
          </div>
        </header>

        {mode === "live" ? (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 14,
                background: "var(--bg-ivory)",
                border: "1px solid var(--border-hairline)",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", marginRight: 4 }}>
                  Sync tab:
                </span>
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => syncTab(tab)}
                    style={{
                      minHeight: 34,
                      padding: "0 12px",
                      borderRadius: 99,
                      border: "1px solid var(--border-hairline)",
                      background: activeTab === tab ? "var(--kyoto-purple)" : "var(--bg-washi)",
                      color: activeTab === tab ? "#fff" : "var(--ink-sumi)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={pixelMap}
                  onChange={(e) => setPixelMap(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                Enable pixel map (?look=pixel)
              </label>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(390px, 1fr))",
                gap: 24,
                justifyItems: "center",
              }}
            >
              <div style={{ display: "grid", gap: 8, justifyItems: "center", width: "100%", maxWidth: 410 }}>
                <div style={{ width: 390, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <select
                    aria-label="Left pane font preset"
                    value={leftPreset}
                    onChange={(e) => setLeftPreset(e.target.value as FontPresetId)}
                    style={{
                      flex: 1,
                      height: 36,
                      padding: "0 10px",
                      borderRadius: 10,
                      border: "1.5px solid var(--kyoto-purple)",
                      background: "var(--bg-ivory)",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {FONT_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <a href={frameUrl(leftPreset, pixelMap)} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                    Open ↗
                  </a>
                </div>
                <div style={{ width: 390, fontSize: 12, color: "var(--ink-slate)" }}>{leftInfo.summary}</div>
                <iframe
                  key={`left-${leftPreset}-${pixelMap}`}
                  ref={leftRef}
                  title={`Left preview: ${leftInfo.label}`}
                  src={frameUrl(leftPreset, pixelMap)}
                  style={{
                    width: 390,
                    height: 800,
                    border: "2px solid var(--kyoto-purple)",
                    borderRadius: 28,
                    background: "var(--bg-washi)",
                    boxShadow: "var(--shadow-float)",
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: 8, justifyItems: "center", width: "100%", maxWidth: 410 }}>
                <div style={{ width: 390, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <select
                    aria-label="Right pane font preset"
                    value={rightPreset}
                    onChange={(e) => setRightPreset(e.target.value as FontPresetId)}
                    style={{
                      flex: 1,
                      height: 36,
                      padding: "0 10px",
                      borderRadius: 10,
                      border: "1.5px solid var(--antique-gold)",
                      background: "var(--bg-ivory)",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {FONT_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <a href={frameUrl(rightPreset, pixelMap)} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                    Open ↗
                  </a>
                </div>
                <div style={{ width: 390, fontSize: 12, color: "var(--ink-slate)" }}>{rightInfo.summary}</div>
                <iframe
                  key={`right-${rightPreset}-${pixelMap}`}
                  ref={rightRef}
                  title={`Right preview: ${rightInfo.label}`}
                  src={frameUrl(rightPreset, pixelMap)}
                  style={{
                    width: 390,
                    height: 800,
                    border: "2px solid var(--antique-gold)",
                    borderRadius: 28,
                    background: "var(--bg-washi)",
                    boxShadow: "var(--shadow-float)",
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 20,
            }}
          >
            {FONT_PRESETS.filter((p) => p.id !== "default").map((preset) => (
              <SpecimenCard key={preset.id} preset={preset} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
