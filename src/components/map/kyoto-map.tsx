"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import { Bike, ChevronRight, Coffee, Ellipsis, Flower2, Landmark, List, LocateFixed, MapPinned, Navigation, Search, Ticket, X, type LucideIcon } from "lucide-react";
import { BottomSheet, MarkerPlaceholder, Pill } from "@/components/ui";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import { classifyFix, DEMO_POSITION, locationModeText, locationStatusText, type LocationFix, type LocationState } from "@/lib/location";

const KYOTO_CENTER: [number, number] = [135.7677, 35.0034];
const MAP_ZOOM = 13.9;
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

type Preview = "category" | "more" | "route" | "list" | null;
const categories: { label: MessageKey; icon: LucideIcon }[] = [
  { label: "mapCategoryCulture", icon: Landmark },
  { label: "mapCategoryCafes", icon: Coffee },
  { label: "mapCategoryBike", icon: Bike },
];
const moreCategories: MessageKey[] = ["mapCategoryHistory", "mapCategoryNature", "mapCategoryHidden", "mapCategoryLuggage", "mapCategorySeasonal"];

export function KyotoMap({ locale, location, onLocationChange, settingsRecenterRequest, onSettingsRecenterHandled, onRewards }: { locale: Locale; location: LocationState; onLocationChange: Dispatch<SetStateAction<LocationState>>; settingsRecenterRequest: boolean; onSettingsRecenterHandled: () => void; onRewards: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  const markerRootRef = useRef<Root | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const watchVersionRef = useRef(0);
  const settingsRecenterHandledRef = useRef(false);
  const useLocationButtonRef = useRef<HTMLButtonElement>(null);
  const initialCenterRef = useRef(location.mode === "demo" ? DEMO_POSITION : KYOTO_CENTER);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<Preview>(null);
  const [category, setCategory] = useState<MessageKey>("mapCategoryCulture");
  const t = (key: MessageKey) => translate(locale, key);
  const liveTracking = location.mode === "live" && ["requesting", "active", "lowAccuracy", "outsideKyoto"].includes(location.gpsStatus);

  const stopWatch = useCallback(() => {
    watchVersionRef.current += 1;
    if (watchIdRef.current !== null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => () => stopWatch(), [stopWatch]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) return;
      stopWatch();
      onLocationChange((current) => current.mode === "live" && ["requesting", "active", "lowAccuracy", "outsideKyoto"].includes(current.gpsStatus)
        ? { mode: "live", gpsStatus: "paused", fix: null } : current);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [onLocationChange, stopWatch]);

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
          center: initialCenterRef.current,
          zoom: MAP_ZOOM,
          minZoom: 11,
          maxZoom: 18,
          attributionControl: false,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
        map.addControl(new maplibregl.AttributionControl({ compact: false }), "bottom-left");

        // The same replaceable avatar shell is used for live and simulated fixes.
        const markerElement = document.createElement("div");
        markerElement.style.pointerEvents = "none";
        markerRootRef.current = createRoot(markerElement);
        markerRef.current = new maplibregl.Marker({ element: markerElement, anchor: "bottom" }).setLngLat(DEMO_POSITION).addTo(map);

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
      markerRef.current?.remove();
      markerRootRef.current?.unmount();
      markerRef.current = null;
      markerRootRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const marker = markerRef.current;
    const root = markerRootRef.current;
    if (!marker || !root || state !== "ready") return;
    if (location.mode === "live" && !location.fix) {
      marker.getElement().style.display = "none";
      return;
    }

    marker.getElement().style.display = "";
    const coordinates: [number, number] = location.mode === "live" && location.fix
      ? [location.fix.longitude, location.fix.latitude] : DEMO_POSITION;
    marker.setLngLat(coordinates);
    const label = location.mode === "live"
      ? translate(locale, "mapLiveMarker", { accuracy: String(Math.round(location.fix?.accuracy ?? 0)) })
      : translate(locale, location.mode === "demo" ? "mapDemoMarker" : "mapSampleLocation");
    const ariaLabel = location.mode === "live" ? label : translate(locale, location.mode === "demo" ? "mapDemoMarkerLabel" : "mapSampleLocationLabel");
    root.render(<div className="map-sample-marker" role="img" aria-label={ariaLabel}><MarkerPlaceholder /><span>{label}</span></div>);
  }, [locale, location, state]);

  const focusMap = useCallback((coordinates: [number, number]) => {
    mapRef.current?.easeTo({ center: coordinates, offset: [0, 115], zoom: MAP_ZOOM, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 550 });
  }, []);

  useEffect(() => {
    if (state !== "ready" || !settingsRecenterRequest || settingsRecenterHandledRef.current) return;
    settingsRecenterHandledRef.current = true;
    if (location.mode === "live" && !location.fix) useLocationButtonRef.current?.focus();
    else focusMap(location.mode === "live" && location.fix ? [location.fix.longitude, location.fix.latitude] : location.mode === "demo" ? DEMO_POSITION : KYOTO_CENTER);
    onSettingsRecenterHandled();
  }, [focusMap, location, onSettingsRecenterHandled, settingsRecenterRequest, state]);

  function useMyLocation() {
    setSearchOpen(false);
    stopWatch();
    onLocationChange({ mode: "live", gpsStatus: "requesting", fix: null });
    if (!window.isSecureContext || !navigator.geolocation) {
      onLocationChange({ mode: "live", gpsStatus: "unavailable", fix: null });
      return;
    }

    const version = watchVersionRef.current;
    let firstFix = true;
    try {
      const watchId = navigator.geolocation.watchPosition((position) => {
        if (version !== watchVersionRef.current) return;
        const fix: LocationFix = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy };
        if (![fix.latitude, fix.longitude, fix.accuracy].every(Number.isFinite) || fix.accuracy < 0) {
          stopWatch();
          onLocationChange({ mode: "live", gpsStatus: "unavailable", fix: null });
          return;
        }
        onLocationChange({ mode: "live", gpsStatus: classifyFix(fix), fix });
        if (firstFix) {
          firstFix = false;
          focusMap([fix.longitude, fix.latitude]);
        }
      }, (error) => {
        if (version !== watchVersionRef.current) return;
        const gpsStatus = error.code === 1 ? "denied" : error.code === 3 ? "timeout" : "unavailable";
        stopWatch();
        onLocationChange({ mode: "live", gpsStatus, fix: null });
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
      if (version === watchVersionRef.current) watchIdRef.current = watchId;
      else navigator.geolocation.clearWatch(watchId);
    } catch {
      stopWatch();
      onLocationChange({ mode: "live", gpsStatus: "unavailable", fix: null });
    }
  }

  function exploreDemo() {
    setSearchOpen(false);
    stopWatch();
    onLocationChange({ mode: "demo", gpsStatus: "off", fix: null });
    focusMap(DEMO_POSITION);
  }

  function openPreview(next: Exclude<Preview, null>, selected?: MessageKey) {
    setSearchOpen(false);
    if (selected) setCategory(selected);
    setPreview(next);
  }

  function recenter() {
    setSearchOpen(false);
    if (location.mode === "live") {
      if (location.fix) focusMap([location.fix.longitude, location.fix.latitude]);
    } else focusMap(location.mode === "demo" ? DEMO_POSITION : KYOTO_CENTER);
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
          <button type="button" className="map-recenter" onClick={recenter} disabled={state !== "ready" || (location.mode === "live" && !location.fix)} aria-label={t(location.mode === "live" ? "mapRecenterLive" : location.mode === "demo" ? "mapRecenterDemo" : "mapRecenterSample")}><LocateFixed size={20} aria-hidden="true" /></button>
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

    <div className="map-intro-callout" role="status"><Flower2 size={19} aria-hidden="true" /><strong>{location.mode === "unselected" ? t("mapIntroTitle") : locationModeText(locale, location.mode)}</strong><p>{locationStatusText(locale, location)}</p></div>

    <div className="map-location-actions" role="group" aria-label={t("locationActionsLabel")}>
      <button ref={useLocationButtonRef} type="button" onClick={useMyLocation} disabled={state !== "ready"} aria-pressed={liveTracking} className={liveTracking ? "selected" : ""}><Navigation size={17} aria-hidden="true" /><span>{t("locationUseMyLocation")}</span></button>
      <button type="button" onClick={exploreDemo} disabled={state !== "ready"} aria-pressed={location.mode === "demo"} className={location.mode === "demo" ? "selected" : ""}><MapPinned size={17} aria-hidden="true" /><span>{t("locationExploreDemo")}</span></button>
    </div>

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
