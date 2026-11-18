"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { Locale } from "@/lib/i18n";
import { translate } from "@/lib/i18n";

const KYOTO_CENTER: [number, number] = [135.7677, 35.0034];
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export function KyotoMap({ locale }: { locale: Locale }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;

    async function start() {
      try {
        const maplibregl = await import("maplibre-gl");
        if (disposed || !container) return;
        maplibregl.setWorkerUrl("/vendor/maplibre-gl-worker-6.19.0.mjs");

        const map = new maplibregl.Map({
          container,
          style: STYLE_URL,
          center: KYOTO_CENTER,
          zoom: 13.9,
          minZoom: 11,
          maxZoom: 18,
          attributionControl: false,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
        map.addControl(new maplibregl.AttributionControl({ compact: false }), "bottom-left");

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
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return <section className="kyoto-map" aria-label={t("mapCanvasLabel")}>
    <div ref={containerRef} className="kyoto-map-canvas" />
    <div className="kyoto-map-heading">
      <span className="kyoto-map-kicker">{t("mapFoundationBadge")}</span>
      <h1>{t("mapTitle")}</h1>
      <p>{t("mapExploreHint")}</p>
    </div>
    {state !== "ready" && <div className="kyoto-map-status" role="status">
      {state === "loading" ? t("mapLoading") : t("mapLoadError")}
    </div>}
  </section>;
}
