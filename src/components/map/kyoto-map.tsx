"use client";

import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import { Bike, ChevronRight, Coffee, Ellipsis, Flower2, Landmark, List, LocateFixed, Search, Ticket, X, type LucideIcon } from "lucide-react";
import { BottomSheet, MarkerPlaceholder, Pill } from "@/components/ui";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";

const KYOTO_CENTER: [number, number] = [135.7677, 35.0034];
const SAMPLE_MARKER: [number, number] = [135.7662, 35.0003];
const MAP_ZOOM = 13.9;
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

type Preview = "category" | "more" | "route" | "list" | null;
const categories: { label: MessageKey; icon: LucideIcon }[] = [
  { label: "mapCategoryCulture", icon: Landmark },
  { label: "mapCategoryCafes", icon: Coffee },
  { label: "mapCategoryBike", icon: Bike },
];
const moreCategories: MessageKey[] = ["mapCategoryHistory", "mapCategoryNature", "mapCategoryHidden", "mapCategoryLuggage", "mapCategorySeasonal"];

export function KyotoMap({ locale, onRewards }: { locale: Locale; onRewards: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<Preview>(null);
  const [category, setCategory] = useState<MessageKey>("mapCategoryCulture");
  const t = (key: MessageKey) => translate(locale, key);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;
    let marker: MapLibreMarker | undefined;
    let markerRoot: Root | undefined;

    async function start() {
      try {
        const maplibregl = await import("maplibre-gl");
        if (disposed || !container) return;
        maplibregl.setWorkerUrl("/vendor/maplibre-gl-worker-6.19.0.mjs");

        const map = new maplibregl.Map({
          container,
          style: STYLE_URL,
          center: KYOTO_CENTER,
          zoom: MAP_ZOOM,
          minZoom: 11,
          maxZoom: 18,
          attributionControl: false,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
        map.addControl(new maplibregl.AttributionControl({ compact: false }), "bottom-left");

        // A fixed sample point provides an avatar slot without claiming device GPS.
        const markerElement = document.createElement("div");
        markerElement.style.pointerEvents = "none";
        markerRoot = createRoot(markerElement);
        markerRoot.render(<div className="map-sample-marker" role="img" aria-label={translate(locale, "mapSampleLocationLabel")}>
          <MarkerPlaceholder />
          <span>{translate(locale, "mapSampleLocation")}</span>
        </div>);
        marker = new maplibregl.Marker({ element: markerElement, anchor: "bottom" }).setLngLat(SAMPLE_MARKER).addTo(map);

        map.once("load", () => {
          if (disposed) return;
          // A few restrained color changes keep the geographic basemap close to
          // the warm reference while retaining OpenFreeMap's roads and labels.
          const colors = [
            ["background", "background-color", "#fff8f1"],
            ["water", "fill-color", "#bddae8"],
            ["waterway_river", "line-color", "#bddae8"],
            ["park", "fill-color", "#dce9cf"],
            ["landuse_residential", "fill-color", "#f5eee7"],
            ["building", "fill-color", "#eee7df"],
            ["building", "fill-outline-color", "#e2d6cf"],
          ] as const;
          for (const [layer, property, color] of colors) {
            if (map.getLayer(layer)) map.setPaintProperty(layer, property, color);
          }
          setState("ready");
        });
        map.on("error", () => {
          if (!disposed && !map.isStyleLoaded()) setState("error");
        });

        resizeObserver = new ResizeObserver(() => map.resize());
        resizeObserver.observe(container);
      } catch {
        if (!disposed) setState("error");
      }
    }

    void start();
    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      marker?.remove();
      markerRoot?.unmount();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [locale]);

  function openPreview(next: Exclude<Preview, null>, selected?: MessageKey) {
    setSearchOpen(false);
    if (selected) setCategory(selected);
    setPreview(next);
  }

  function recenter() {
    setSearchOpen(false);
    mapRef.current?.easeTo({ center: KYOTO_CENTER, zoom: MAP_ZOOM, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 550 });
  }

  const sheetTitle = preview === "category" ? t(category) : preview === "more" ? t("mapCategoryMore") : preview === "route" ? t("mapRecommendedTitle") : t("mapListTitle");
  return <section className="kyoto-map" aria-label={t("mapCanvasLabel")}>
    <div ref={containerRef} className="kyoto-map-canvas" />

    <div className="map-top-ui">
      <button type="button" className="map-progress" onClick={onRewards} aria-label={t("mapProgressAction")}>
        <Flower2 className="map-progress-flower" size={28} aria-hidden="true" />
        <span className="map-progress-meter"><span>{t("mapSampleProgress")}</span><span className="map-progress-track"><span /></span></span>
        <span className="map-progress-divider" aria-hidden="true" />
        <Ticket className="map-progress-ticket" size={27} aria-hidden="true" />
        <span className="map-progress-next">{t("mapNextRewardPreview")}</span>
      </button>

      <div className="map-search-wrap">
        <div className="map-search-bar">
          <Search size={21} aria-hidden="true" />
          <input type="search" aria-label={t("mapSearchLabel")} placeholder={t("mapSearchPlaceholder")} value={query} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); }} />
          <button type="button" className="map-recenter" onClick={recenter} disabled={state !== "ready"} aria-label={t("mapRecenterSample")}><LocateFixed size={20} aria-hidden="true" /></button>
        </div>
        {searchOpen && <div className="map-search-preview" role="region" aria-label={t("mapSearchPreviewTitle")}>
          <div><strong>{t("mapSearchPreviewTitle")}</strong><button type="button" onClick={() => setSearchOpen(false)} aria-label={t("close")}><X size={18} /></button></div>
          <p>{query ? t("mapSearchNoResults") : t("mapSearchPreviewBody")}</p>
        </div>}
      </div>

      <div className="map-categories" role="group" aria-label={t("mapCategoriesLabel")}>
        {categories.map(({ label, icon: Icon }) => <button type="button" key={label} onClick={() => openPreview("category", label)}><Icon size={18} aria-hidden="true" /><span>{t(label)}</span><ChevronRight size={14} aria-hidden="true" /></button>)}
        <button type="button" onClick={() => openPreview("more")}><Ellipsis size={19} aria-hidden="true" /><span>{t("mapCategoryMore")}</span></button>
      </div>
    </div>

    <div className="map-intro-callout"><Flower2 size={19} aria-hidden="true" /><strong>{t("mapIntroTitle")}</strong><p>{t("mapIntroBody")}</p></div>

    <div className="map-bottom-ui">
      <button type="button" className="map-recommended" onClick={() => openPreview("route")}>
        <span className="map-recommended-icon"><Coffee size={22} aria-hidden="true" /></span>
        <span><small>{t("mapRecommendedEyebrow")}</small><strong>{t("mapRecommendedTitle")}</strong></span>
        <ChevronRight size={19} aria-hidden="true" />
      </button>
      <button type="button" className="map-list-button" onClick={() => openPreview("list")}><List size={22} aria-hidden="true" /><span>{t("mapListButton")}</span></button>
    </div>

    {state !== "ready" && <div className="kyoto-map-status" role="status">{state === "loading" ? t("mapLoading") : t("mapLoadError")}</div>}

    <BottomSheet open={preview !== null} onClose={() => setPreview(null)} title={sheetTitle} closeLabel={t("close")}>
      {preview === "more" ? <><p>{t("mapCategoryPreviewBody")}</p><div className="map-more-pills">{moreCategories.map((key) => <Pill key={key}>{t(key)}</Pill>)}</div></>
        : <p>{t(preview === "category" ? "mapCategoryPreviewBody" : preview === "route" ? "mapRoutePreviewBody" : "mapListPreviewBody")}</p>}
    </BottomSheet>
  </section>;
}
