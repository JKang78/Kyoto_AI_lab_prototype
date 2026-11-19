"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import { Bike, ChevronLeft, ChevronRight, Coffee, Ellipsis, Flower2, Landmark, List, LocateFixed, MapPinned, Navigation, Search, Ticket, Trees, Waves, X, type LucideIcon } from "lucide-react";
import { BottomSheet, Button, MarkerPlaceholder, Pill } from "@/components/ui";
import { CURATED_PLACES, CURATED_WALKS } from "@/data/kyoto-walks";
import { SAMPLE_CONGESTION_CUES, type SampleCongestionCue } from "@/data/sample-congestion";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import { classifyFix, DEMO_POSITION, locationModeText, locationStatusText, type LocationFix, type LocationState } from "@/lib/location";
import { discoverRoutes, type MatchReason, type RouteFilter } from "@/lib/route-discovery";
import type { CuratedPlace, CuratedWalk } from "@/types/routes";

const KYOTO_CENTER: [number, number] = [135.7677, 35.0034];
const MAP_ZOOM = 13.9;
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

type RoutePanel = "results" | "details" | "stops" | "place" | "more" | null;
const categories: { label: MessageKey; icon: LucideIcon; filter: RouteFilter }[] = [
  { label: "mapCategoryCulture", icon: Landmark, filter: "culture" },
  { label: "mapCategoryRiverside", icon: Waves, filter: "riverside" },
  { label: "mapCategoryPark", icon: Trees, filter: "park" },
  { label: "mapCategoryCafes", icon: Coffee, filter: "cafes" },
  { label: "mapCategoryBike", icon: Bike, filter: "bike" },
];
const moreCategories: { label: MessageKey; filter: RouteFilter }[] = [
  { label: "mapCategoryHistory", filter: "culture" },
  { label: "mapCategoryNature", filter: "nature" },
  { label: "mapCategoryHidden", filter: "hidden" },
  { label: "mapCategoryLuggage", filter: "luggage" },
  { label: "mapCategorySeasonal", filter: "seasonal" },
];
const routeColors: Record<CuratedWalk["theme"], string> = { culture: "#a2477e", riverside: "#387d94", park: "#668153" };
const reasonKeys: Record<Exclude<MatchReason, null>, MessageKey> = { place: "routesReasonPlace", theme: "routesReasonTheme", time: "routesReasonTime", available: "routesReasonAvailable" };
const placeThemes: Record<string, CuratedWalk["theme"]> = {
  "shijo-kawaramachi": "culture", "shijo-ohashi": "riverside", "yasaka-west-view": "culture",
  "kawabata-riverside": "riverside", "sanjo-ohashi": "riverside",
  "maruyama-cherry-path": "park", "chionin-south-gate-path": "park",
};

function WalkOption({ walk, locale, reason, onSelect }: { walk: CuratedWalk; locale: Locale; reason?: MatchReason; onSelect: () => void }) {
  return <button type="button" className={`map-route-option map-route-option--${walk.theme}`} onClick={onSelect}>
    <span className="map-route-option-icon" aria-hidden="true">{walk.theme === "culture" ? <Landmark size={20} /> : walk.theme === "riverside" ? <Waves size={20} /> : <Trees size={20} />}</span>
    <span className="map-route-option-copy"><strong>{walk.name[locale]}</strong><small>{walk.description[locale]}</small>{reason && <span className="map-route-option-reason">{translate(locale, reasonKeys[reason])}</span>}<em>{translate(locale, "routesDemoEstimate", { minutes: String(walk.estimatedMinutes), meters: String(walk.estimatedMeters) })}</em></span>
    <ChevronRight size={18} aria-hidden="true" />
  </button>;
}

function RouteDataCredit({ locale }: { locale: Locale }) {
  return <p className="route-data-credit">{translate(locale, "routesDataCredit")} <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap / ODbL</a> · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">{translate(locale, "routesFixMap")}</a></p>;
}

type KyotoMapProps = {
  selectedWalkId: string | null;
  setSelectedWalkId: (id: string | null) => void;
  locale: Locale;
  location: LocationState;
  onLocationChange: Dispatch<SetStateAction<LocationState>>;
  settingsRecenterRequest: boolean;
  onSettingsRecenterHandled: () => void;
  onRewards: () => void;
};

export function KyotoMap({
  selectedWalkId, setSelectedWalkId, locale, location, onLocationChange,
  settingsRecenterRequest, onSettingsRecenterHandled, onRewards,
}: KyotoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  const markerRootRef = useRef<Root | null>(null);
  const placeMarkerRefs = useRef<Map<string, MapLibreMarker>>(new Map());
  const congestionMarkerRefs = useRef<{ cue: SampleCongestionCue; marker: MapLibreMarker }[]>([]);
  const initialLocaleRef = useRef(locale);
  const selectedWalkIdRef = useRef<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const watchVersionRef = useRef(0);
  const settingsRecenterHandledRef = useRef(false);
  const useLocationButtonRef = useRef<HTMLButtonElement>(null);
  const initialCenterRef = useRef(location.mode === "demo" ? DEMO_POSITION : KYOTO_CENTER);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<RoutePanel>(null);
  const [routeFilter, setRouteFilter] = useState<RouteFilter>(null);
  const [mapAttempt, setMapAttempt] = useState(0);
  const listButtonRef = useRef<HTMLButtonElement>(null);
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null);
  const [placeReturnPanel, setPlaceReturnPanel] = useState<"results" | "details" | "stops">("results");
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const liveTracking = location.mode === "live" && ["requesting", "active", "lowAccuracy", "outsideKyoto"].includes(location.gpsStatus);
  const selectedWalk = CURATED_WALKS.find((walk) => walk.id === selectedWalkId) ?? null;
  const focusedPlace = CURATED_PLACES.find((place) => place.id === focusedPlaceId) ?? null;
  const results = discoverRoutes(query, routeFilter, CURATED_WALKS, CURATED_PLACES);
  const searchResults = discoverRoutes(query, null, CURATED_WALKS, CURATED_PLACES);

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
    const placeMarkers = placeMarkerRefs.current;
    const congestionMarkers = congestionMarkerRefs.current;

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
          const firstLabel = map.getStyle().layers?.find((layer) => layer.type === "symbol")?.id;
          for (const walk of CURATED_WALKS) {
            // Only the reviewed fixture geometry is passed to MapLibre. No endpoints are joined at runtime.
            map.addSource(`walk-${walk.id}`, {
              type: "geojson",
              data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: walk.geometry.coordinates.map(([lng, lat]) => [lng, lat]) } },
            });
            map.addLayer({
              id: `walk-line-${walk.id}`,
              type: "line",
              source: `walk-${walk.id}`,
              layout: { "line-cap": "round", "line-join": "round" },
              paint: { "line-color": routeColors[walk.theme], "line-width": 4, "line-opacity": 0.78, "line-dasharray": [0.2, 1.8] },
            }, firstLabel);
          }
          for (const place of CURATED_PLACES) {
            const pin = document.createElement("button");
            pin.type = "button";
            pin.className = `map-place-pin map-place-pin--${placeThemes[place.id] ?? "culture"}`;
            pin.dataset.placeId = place.id;
            pin.textContent = "✦";
            pin.setAttribute("aria-label", translate(initialLocaleRef.current, "mapOpenPlace", { name: place.name[initialLocaleRef.current] }));
            pin.addEventListener("click", (event) => {
              event.stopPropagation();
              setSearchOpen(false);
              setFocusedPlaceId(place.id);
              setPlaceReturnPanel(selectedWalkIdRef.current ? "details" : "results");
              setPanel("place");
              map.easeTo({ center: [...place.location], zoom: 15.5, offset: [0, 90], duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500 });
            });
            placeMarkers.set(place.id, new maplibregl.Marker({ element: pin, anchor: "bottom" }).setLngLat([...place.location]).addTo(map));
          }
          for (const cue of SAMPLE_CONGESTION_CUES) {
            const place = CURATED_PLACES.find((item) => item.id === cue.placeId);
            if (!place) continue;
            const label = document.createElement("div");
            label.className = `map-congestion-cue map-congestion-cue--${cue.level}`;
            const level = translate(initialLocaleRef.current, cue.level === "busy" ? "mapSampleBusy" : "mapSampleModerate");
            label.textContent = level;
            label.setAttribute("role", "img");
            label.setAttribute("aria-label", translate(initialLocaleRef.current, "mapSampleCongestionAt", { level, place: place.name[initialLocaleRef.current] }));
            const offset: [number, number] = cue.level === "moderate" ? [-100, 8] : [0, -37];
            const marker = new maplibregl.Marker({ element: label, anchor: "bottom", offset }).setLngLat([...place.location]).addTo(map);
            congestionMarkers.push({ cue, marker });
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
      for (const marker of placeMarkers.values()) marker.remove();
      placeMarkers.clear();
      for (const { marker } of congestionMarkers) marker.remove();
      congestionMarkers.length = 0;
      markerRef.current = null;
      markerRootRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapAttempt]);

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

  useEffect(() => {
    selectedWalkIdRef.current = selectedWalkId;
    const map = mapRef.current;
    if (!map || state !== "ready") return;
    for (const walk of CURATED_WALKS) {
      const layer = `walk-line-${walk.id}`;
      if (!map.getLayer(layer)) continue;
      map.setPaintProperty(layer, "line-color", selectedWalkId === walk.id ? "#d34d8c" : routeColors[walk.theme]);
      map.setPaintProperty(layer, "line-width", selectedWalkId === walk.id ? 6 : 4);
      map.setPaintProperty(layer, "line-opacity", selectedWalkId && selectedWalkId !== walk.id ? 0.22 : 0.82);
    }
  }, [selectedWalkId, state]);

  useEffect(() => {
    if (state !== "ready") return;
    for (const place of CURATED_PLACES) {
      const pin = placeMarkerRefs.current.get(place.id)?.getElement();
      if (!pin) continue;
      const stopIndex = selectedWalk?.placeIds.indexOf(place.id) ?? -1;
      pin.style.display = selectedWalk && stopIndex === -1 ? "none" : "";
      pin.textContent = stopIndex >= 0 ? String(stopIndex + 1) : "✦";
      pin.setAttribute("aria-label", translate(locale, "mapOpenPlace", { name: place.name[locale] }));
      pin.setAttribute("aria-pressed", String(panel === "place" && focusedPlaceId === place.id));
    }
    for (const { cue, marker } of congestionMarkerRefs.current) {
      const place = CURATED_PLACES.find((item) => item.id === cue.placeId);
      const label = marker.getElement();
      const level = translate(locale, cue.level === "busy" ? "mapSampleBusy" : "mapSampleModerate");
      label.textContent = level;
      label.style.display = selectedWalk && !selectedWalk.placeIds.includes(cue.placeId) ? "none" : "";
      if (place) label.setAttribute("aria-label", translate(locale, "mapSampleCongestionAt", { level, place: place.name[locale] }));
    }
  }, [focusedPlaceId, locale, panel, selectedWalk, state]);

  const focusMap = useCallback((coordinates: [number, number]) => {
    mapRef.current?.easeTo({ center: coordinates, offset: [0, 115], zoom: MAP_ZOOM, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 550 });
  }, []);

  useEffect(() => {
    if (state !== "ready" || !selectedWalk) return;
    const coordinates = selectedWalk.geometry.coordinates;
    const lngs = coordinates.map(([lng]) => lng);
    const lats = coordinates.map(([, lat]) => lat);
    mapRef.current?.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], {
      padding: { top: 175, right: 36, bottom: 205, left: 36 },
      maxZoom: 16.5,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650,
    });
  }, [selectedWalk, state]);

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

  function showResults(filter: RouteFilter = null) {
    setSearchOpen(false);
    setQuery("");
    setRouteFilter(filter);
    setSelectedWalkId(null);
    setPanel("results");
  }

  function selectWalk(walk: CuratedWalk) {
    setSelectedWalkId(walk.id);
    setSearchOpen(false);
    setPanel("details");
  }

  function openPlace(place: CuratedPlace, returnPanel: "results" | "details" | "stops") {
    setFocusedPlaceId(place.id);
    setPlaceReturnPanel(returnPanel);
    setSearchOpen(false);
    setPanel("place");
    mapRef.current?.easeTo({ center: [...place.location], zoom: 15.5, offset: [0, 90], duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500 });
  }

  function backFromPlace() {
    setFocusedPlaceId(null);
    setPanel(placeReturnPanel);
  }

  function backToResults() {
    setSelectedWalkId(null);
    setPanel("results");
  }

  function recenter() {
    setSearchOpen(false);
    if (location.mode === "live") {
      if (location.fix) focusMap([location.fix.longitude, location.fix.latitude]);
    } else focusMap(location.mode === "demo" ? DEMO_POSITION : KYOTO_CENTER);
  }

  const sheetTitle = panel === "details" && selectedWalk ? selectedWalk.name[locale]
    : panel === "stops" ? t("routesStops")
      : panel === "place" && focusedPlace ? focusedPlace.name[locale]
      : panel === "more" ? t("mapCategoryMore") : t("routesTitle");
  return <section className="kyoto-map" aria-label={t("mapCanvasLabel")}>
    <div inert={state !== "ready"}>
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
          <input type="search" aria-label={t("mapSearchLabel")} placeholder={t("mapSearchPlaceholder")} value={query} onChange={(event) => { setQuery(event.target.value); setRouteFilter(null); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); if (event.key === "Enter" && searchResults.suggestions[0]) selectWalk(searchResults.suggestions[0].walk); }} />
          <button type="button" className="map-recenter" onClick={recenter} disabled={state !== "ready" || (location.mode === "live" && !location.fix)} aria-label={t(location.mode === "live" ? "mapRecenterLive" : location.mode === "demo" ? "mapRecenterDemo" : "mapRecenterSample")}><LocateFixed size={20} aria-hidden="true" /></button>
        </div>
        {searchOpen && <div className="map-search-preview" role="region" aria-label={t("mapSearchPreviewTitle")}>
          <div className="map-search-heading"><strong>{t("mapSearchPreviewTitle")}</strong><button type="button" onClick={() => setSearchOpen(false)} aria-label={t("close")}><X size={18} /></button></div>
          <p className="map-search-hint">{t(!query.trim() ? "routesSearchHint" : searchResults.fallback ? "routesSearchFallback" : "routesSearchMatched")}</p>
          <div className="map-search-results">{searchResults.suggestions.map(({ walk, reason }) => <WalkOption key={walk.id} walk={walk} locale={locale} reason={reason} onSelect={() => selectWalk(walk)} />)}</div>
        </div>}
      </div>

      <div className="map-categories" role="group" aria-label={t("mapCategoriesLabel")}>
        {categories.map(({ label, icon: Icon, filter }) => <button type="button" key={label} aria-pressed={routeFilter === filter && panel === "results"} onClick={() => showResults(filter)}><Icon size={18} aria-hidden="true" /><span>{t(label)}</span><ChevronRight size={14} aria-hidden="true" /></button>)}
        <button type="button" onClick={() => { setSearchOpen(false); setPanel("more"); }}><Ellipsis size={19} aria-hidden="true" /><span>{t("mapCategoryMore")}</span></button>
      </div>
    </div>

    {selectedWalk ? <div className="map-intro-callout map-selected-callout" role="status"><Flower2 size={19} aria-hidden="true" /><strong>{selectedWalk.name[locale]}</strong><p>{t("routesDemoEstimate", { minutes: String(selectedWalk.estimatedMinutes), meters: String(selectedWalk.estimatedMeters) })}</p><p className="map-selected-location">{locationStatusText(locale, location)}</p><button type="button" onClick={backToResults} aria-label={t("routesBack")} title={t("routesBack")}><ChevronLeft size={18} aria-hidden="true" /></button></div>
      : <div className="map-intro-callout" role="status"><Flower2 size={19} aria-hidden="true" /><strong>{location.mode === "unselected" ? t("mapIntroTitle") : locationModeText(locale, location.mode)}</strong><p>{locationStatusText(locale, location)}</p></div>}

    <div className="map-location-actions" role="group" aria-label={t("locationActionsLabel")}>
      <button ref={useLocationButtonRef} type="button" onClick={useMyLocation} disabled={state !== "ready"} aria-pressed={liveTracking} className={liveTracking ? "selected" : ""}><Navigation size={17} aria-hidden="true" /><span>{t("locationUseMyLocation")}</span></button>
      <button type="button" onClick={exploreDemo} disabled={state !== "ready"} aria-pressed={location.mode === "demo"} className={location.mode === "demo" ? "selected" : ""}><MapPinned size={17} aria-hidden="true" /><span>{t("locationExploreDemo")}</span></button>
    </div>

    {state === "ready" && <div className="map-congestion-legend" role="note">{t("mapSampleCongestionLegend")}</div>}

    <div className="map-bottom-ui">
      <button type="button" className="map-recommended" onClick={() => selectedWalk ? setPanel("details") : showResults()}>
        <span className="map-recommended-icon">{selectedWalk ? <Landmark size={22} aria-hidden="true" /> : <Waves size={22} aria-hidden="true" />}</span>
        <span><small>{t(selectedWalk ? "routesDetails" : "mapRecommendedEyebrow")}</small><strong>{selectedWalk ? selectedWalk.name[locale] : t("mapRecommendedTitle")}</strong></span>
        <ChevronRight size={19} aria-hidden="true" />
      </button>
      <button type="button" ref={listButtonRef} className="map-list-button" onClick={() => selectedWalk ? setPanel("stops") : showResults()}><List size={22} aria-hidden="true" /><span>{t("mapListButton")}</span></button>
    </div>

    </div>
    {state !== "ready" && (
      <div className="kyoto-map-status">
        <p role="status">{t(state === "loading" ? "mapLoading" : "mapLoadError")}</p>
        {state === "error" && (
          <Button onClick={() => {
            setState("loading");
            setMapAttempt((attempt) => attempt + 1);
          }}>{t("mapRetry")}</Button>
        )}
        <Button variant="secondary" onClick={() => showResults()}>{t("mapStoredWalks")}</Button>
      </div>
    )}

    <BottomSheet fallbackFocusRef={listButtonRef} open={panel !== null} onClose={() => { setPanel(null); setFocusedPlaceId(null); }} title={sheetTitle} closeLabel={t("close")}>
      {panel === "results" && <div className="route-sheet-content"><p className="route-sheet-intro">{t(results.fallback ? "routesSearchFallback" : "routesMapChecked")}</p>{results.suggestions.length ? <div className="route-sheet-options">{results.suggestions.map(({ walk, reason }) => <WalkOption key={walk.id} walk={walk} locale={locale} reason={reason} onSelect={() => selectWalk(walk)} />)}</div> : <div className="route-empty"><p>{t("routesEmpty")}</p><button type="button" onClick={() => showResults()}>{t("routesShowAll")}</button></div>}<RouteDataCredit locale={locale} /></div>}
      {panel === "details" && selectedWalk && <div className="route-sheet-content"><p className="route-sheet-intro">{selectedWalk.description[locale]}</p><Pill>{t("routesDemoEstimate", { minutes: String(selectedWalk.estimatedMinutes), meters: String(selectedWalk.estimatedMeters) })}</Pill><h3>{t("routesStops")}</h3><ol className="route-stop-list">{selectedWalk.placeIds.map((id) => { const place = CURATED_PLACES.find((item) => item.id === id); return place ? <li key={id}>{place.name[locale]}</li> : null; })}</ol><div className="route-note"><strong>{t("routesAccessibility")}</strong><p>{selectedWalk.accessibilityNotes[locale]}</p></div><div className="route-note"><strong>{t("routesResidentNote")}</strong><p>{selectedWalk.residentNotes[locale]}</p></div><div className="route-sheet-actions"><button type="button" onClick={() => setPanel("stops")}>{t("routesSeeStops")}</button><button type="button" onClick={backToResults}>{t("routesBack")}</button></div><RouteDataCredit locale={locale} /></div>}
      {panel === "stops" && selectedWalk && <div className="route-sheet-content"><div className="route-place-list">{selectedWalk.placeIds.map((id, index) => { const place = CURATED_PLACES.find((item) => item.id === id); return place ? <button type="button" className="route-place-card" key={id} onClick={() => openPlace(place, "stops")} aria-label={t("mapOpenPlace", { name: place.name[locale] })}><span>{index + 1}</span><div><h3>{place.name[locale]}</h3><p>{place.description[locale]}</p><small>{place.accessNotes[locale]}</small></div><ChevronRight size={18} aria-hidden="true" /></button> : null; })}</div><div className="route-sheet-actions"><button type="button" onClick={() => setPanel("details")}>{t("routesDetails")}</button><button type="button" onClick={backToResults}>{t("routesBack")}</button></div><RouteDataCredit locale={locale} /></div>}
      {panel === "place" && focusedPlace && <div className="route-sheet-content"><p className="route-sheet-intro">{focusedPlace.description[locale]}</p><div className="route-note"><strong>{t("routesAccessibility")}</strong><p>{focusedPlace.accessibilityNotes[locale]}</p></div><div className="route-note"><strong>{t("routesAccessNotes")}</strong><p>{focusedPlace.accessNotes[locale]}</p></div><p className="route-community-status">{t("routesCommunityNotConsulted")}</p><a className="route-place-source" href={focusedPlace.osmFeatureUrl} target="_blank" rel="noreferrer">{t("placeMapSource")}</a><div className="route-sheet-actions"><button type="button" onClick={backFromPlace}>{t(placeReturnPanel === "stops" ? "placeBackToStops" : placeReturnPanel === "details" ? "routesDetails" : "routesBack")}</button></div><RouteDataCredit locale={locale} /></div>}
      {panel === "more" && <div className="route-sheet-content"><p className="route-sheet-intro">{t("mapCategoryPreviewBody")}</p><div className="map-more-pills">{moreCategories.map(({ label, filter }) => <button type="button" key={label} onClick={() => showResults(filter)}>{t(label)}</button>)}</div></div>}
    </BottomSheet>
  </section>;
}
