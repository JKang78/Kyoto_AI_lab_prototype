"use client";

import { useRef, useState } from "react";

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

function SpecimenCard({
  title,
  subtitle,
  macadam,
}: {
  title: string;
  subtitle: string;
  macadam: boolean;
}) {
  const fontUi = macadam ? '"Macadam Satoshi"' : '"Plus Jakarta Sans"';
  const fontDisplay = macadam ? '"Macadam Yalla"' : '"Shippori Mincho"';
  const fontBody = `${fontUi}, "Noto Sans JP", sans-serif`;
  const fontTitle = macadam
    ? `${fontDisplay}, "Noto Sans JP", sans-serif`
    : `${fontDisplay}, "Hiragino Mincho ProN", serif`;

  return (
    <section
      style={{
        background: "var(--bg-washi)",
        border: "1px solid var(--border-hairline)",
        borderRadius: 18,
        padding: 20,
        display: "grid",
        gap: 16,
        fontFamily: fontBody,
        fontSynthesisWeight: macadam ? "none" : "auto",
      }}
    >
      <header style={{ borderBottom: "1px solid var(--border-hairline)", paddingBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--kyoto-purple)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-slate)", marginTop: 2 }}>{subtitle}</div>
      </header>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" }}>
          Hero &amp; Screen Headings (--font-title)
        </span>
        <div style={{ fontFamily: fontTitle, fontSize: 52, fontWeight: 700, lineHeight: 1, color: "var(--ink-sumi)", fontVariantNumeric: "tabular-nums" }}>
          120 <span style={{ fontFamily: fontBody, fontSize: 18, fontWeight: 600, color: "var(--ink-slate)" }}>pt</span>
        </div>
        <div style={{ fontFamily: fontTitle, fontSize: 32, fontWeight: 700, lineHeight: 1.12, color: "var(--ink-sumi)" }}>
          Walk the quiet side of Kyoto
        </div>
        <div style={{ fontFamily: fontTitle, fontSize: 20, fontWeight: 700, lineHeight: 1.25, color: "var(--ink-sumi)" }}>
          Kamo Riverside · Saved Walks · Rewards
        </div>
        <div style={{ fontFamily: fontTitle, fontSize: 16, fontWeight: 700, lineHeight: 1.3, color: "var(--ink-sumi)" }}>
          Section Heading (Settings / Stops / Card Title)
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" }}>
          UI &amp; Body Weights (--font-body)
        </span>
        {[400, 500, 600, 700, 800].map((weight) => (
          <div
            key={weight}
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              padding: "6px 10px",
              borderRadius: 10,
              background: "var(--bg-ivory)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            <span style={{ fontWeight: weight, fontSize: 14, color: "var(--ink-sumi)" }}>
              Kamo Riverside · 2.4 km · 35 min · 3 stops
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}>
              {weight}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" }}>
          Map Overlays &amp; Controls
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              background: "var(--bg-ivory)",
              border: "1px solid var(--border-hairline)",
              borderLeft: "4px solid var(--indigo)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Kamo Riverside
          </span>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 99,
              background: "var(--kyoto-purple)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Start walk
          </span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 99,
              background: "var(--ink-sumi)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            120 pt
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 4 }} lang="ja">
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" }}>
          Japanese Fallback (Noto Sans JP)
        </span>
        <div
          style={{
            fontFamily: macadam ? '"Noto Sans JP", "Macadam Yalla", sans-serif' : '"Shippori Mincho", "Noto Sans JP", serif',
            fontSize: 20,
            fontWeight: 700,
            color: "var(--ink-sumi)",
          }}
        >
          鴨川リバーサイド散歩 · 120 pt
        </div>
        <div style={{ fontFamily: `"Noto Sans JP", ${fontUi}, sans-serif`, fontSize: 13, fontWeight: 500, color: "var(--ink-slate)" }}>
          静かな京都の路地や川沿いを歩いてスタンプを集めましょう。
        </div>
      </div>
    </section>
  );
}

export default function FontComparePage() {
  const [mode, setMode] = useState<Mode>("live");
  const [activeTab, setActiveTab] = useState<CompareTab>("Home");
  const leftRef = useRef<HTMLIFrameElement>(null);
  const rightRef = useRef<HTMLIFrameElement>(null);

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

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "20px 24px 36px",
        background: "var(--bg-stone)",
        color: "var(--ink-sumi)",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 18 }}>
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
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Typography Comparison</h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--ink-slate)" }}>
              Current (Plus Jakarta Sans + Shippori Mincho) vs Macadam (Satoshi Variable 300–900 + Yalla)
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <div className="segmented" role="group" aria-label="Comparison mode">
              <button type="button" aria-pressed={mode === "live"} onClick={() => setMode("live")}>
                Side-by-side app
              </button>
              <button type="button" aria-pressed={mode === "specimen"} onClick={() => setMode("specimen")}>
                Type specimen
              </button>
            </div>
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
                  Sync both panes:
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
              <div style={{ display: "flex", gap: 14, fontSize: 12, fontWeight: 700 }}>
                <a href="/?route=kamo-riverside" target="_blank" rel="noreferrer">
                  Open Current ↗
                </a>
                <a href="/?route=kamo-riverside&font=macadam" target="_blank" rel="noreferrer">
                  Open Macadam ↗
                </a>
              </div>
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
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink-slate)" }}>
                  Current — Plus Jakarta Sans + Shippori Mincho
                </div>
                <iframe
                  ref={leftRef}
                  title="Current fonts preview"
                  src="/?route=kamo-riverside"
                  style={{
                    width: 390,
                    height: 800,
                    border: "1px solid var(--border-hairline)",
                    borderRadius: 28,
                    background: "var(--bg-washi)",
                    boxShadow: "var(--shadow-float)",
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: 8, justifyItems: "center", width: "100%", maxWidth: 410 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--kyoto-purple)" }}>
                  Macadam — Satoshi Variable (300–900) + Yalla
                </div>
                <iframe
                  ref={rightRef}
                  title="Macadam fonts preview"
                  src="/?route=kamo-riverside&font=macadam"
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
            </div>
          </>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 20,
            }}
          >
            <SpecimenCard
              title="Current Fonts"
              subtitle="Plus Jakarta Sans (UI) + Shippori Mincho (Display) + Noto Sans JP"
              macadam={false}
            />
            <SpecimenCard
              title="Macadam Preview"
              subtitle="Satoshi Variable 300–900 (UI) + Yalla (Display) + Noto Sans JP"
              macadam={true}
            />
          </div>
        )}
      </div>
    </main>
  );
}
