"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import { ArrowLeft, Bike, ChevronRight, Coffee, Eye, Footprints, Landmark, Leaf, Luggage, LocateFixed, MapPinned, Navigation, Search, Sparkles, Sun, Trees, Waves, X, type LucideIcon } from "lucide-react";
import { GAME } from "@/config/game";
import { WalkControls } from "@/components/walk-controls";
import { activeRun, offPeakWindow, walkReward, type Game } from "@/lib/game";
import { act } from "@/lib/game-store";
import { Button, ConfirmDialog, CrowdBadge, FoxAvatar, haptic, ICON_STROKE, SnapSheet, useNow, type Snap } from "@/components/ui";
import { CURATED_PLACES, CURATED_WALKS } from "@/data/kyoto-walks";
import { SAMPLE_CONGESTION_CUES, sampleWalkCrowd, type CrowdLevel } from "@/data/sample-congestion";
import { formatKyotoTime, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { classifyFix, DEMO_POSITION, INITIAL_LOCATION_STATE, locationStatusText, type LocationFix, type LocationState } from "@/lib/location";
import { discoverRoutes, type MatchReason, type RouteFilter } from "@/lib/route-discovery";
import type { CuratedPlace, CuratedWalk } from "@/types/routes";

const KYOTO_CENTER: [number, number] = [135.7677, 35.0034];
const MAP_ZOOM = 13.9;
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

const categories: { label: MessageKey; icon: LucideIcon; filter: RouteFilter }[] = [
  { label: "mapCategoryCulture", icon: Landmark, filter: "culture" },
  { label: "mapCategoryRiverside", icon: Waves, filter: "riverside" },
  { label: "mapCategoryPark", icon: Trees, filter: "park" },
  { label: "mapCategoryHidden", icon: Eye, filter: "hidden" },
  { label: "mapCategoryCafes", icon: Coffee, filter: "cafes" },
  { label: "mapCategoryNature", icon: Leaf, filter: "nature" },
  { label: "mapCategoryLuggage", icon: Luggage, filter: "luggage" },
  { label: "mapCategorySeasonal", icon: Sun, filter: "seasonal" },
  { label: "mapCategoryBike", icon: Bike, filter: "bike" },
];
const themeIcons: Record<CuratedWalk["theme"], LucideIcon> = { culture: Landmark, riverside: Waves, park: Trees };
const routeColors: Record<CuratedWalk["theme"], string> = { culture: "#a8453c", riverside: "#3d5f86", park: "#5d7a3e" };
const reasonKeys: Record<Exclude<MatchReason, null>, MessageKey> = { place: "routesReasonPlace", theme: "routesReasonTheme", time: "routesReasonTime", available: "routesReasonAvailable" };
const crowdKeys: Record<CrowdLevel, MessageKey> = { calm: "crowdCalm", moderate: "crowdModerate", busy: "crowdBusy" };
const placeThemes: Record<string, CuratedWalk["theme"]> = {
  "shijo-kawaramachi": "culture", "shijo-ohashi": "riverside", "yasaka-west-view": "culture",
  "kawabata-riverside": "riverside", "sanjo-ohashi": "riverside",
  "maruyama-cherry-path": "park", "chionin-south-gate-path": "park",
};
// 1.5px-stroke glyphs drawn inside each pin. Static strings only.
const pinGlyphs: Record<CuratedWalk["theme"], string> = {
  culture: '<path d="M5 7h14M7 7v11M17 7v11M6 10.5h12M4.5 5.5c2.5.8 12.5.8 15 0"/>',
  riverside: '<path d="M4 9c2.7-2 5.3 2 8 0s5.3 2 8 0M4 14c2.7-2 5.3 2 8 0s5.3 2 8 0"/>',
  park: '<path d="M12 19V10M12 10c0-3.5 2.5-5.5 6-5.5 0 3.6-2.4 5.5-6 5.5ZM12 13c0-2.6-2-4.2-5-4.2 0 2.7 2 4.2 5 4.2Z"/>',
};
function pinMarkup(theme: CuratedWalk["theme"], number: number | null) {
  const inner = number === null
    ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${pinGlyphs[theme]}</svg>`
    : `<span class="map-place-pin-number">${number}</span>`;
  return `<span class="map-place-pin-head">${inner}</span><span class="map-place-pin-tail"></span>`;
}
const motionDuration = (ms: number) => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
const googleMapsUrl = (walk: CuratedWalk) => {
  const points = walk.placeIds.map(id => CURATED_PLACES.find(place => place.id === id)!.location).map(([lng, lat]) => `${lat},${lng}`);
  const params = new URLSearchParams({ api: "1", origin: points[0], destination: points.at(-1)!, travelmode: "walking" });
  if (points.length > 2) params.set("waypoints", points.slice(1, -1).join("|"));
  return `https://www.google.com/maps/dir/?${params}`;
};

function RouteDataCredit({ locale }: { locale: Locale }) {
  return <p className="route-data-credit">{translate(locale, "routesDataCredit")} <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap / ODbL</a> · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">{translate(locale, "routesFixMap")}</a></p>;
}

function RewardLine({ walk, multiplier, locale }: { walk: CuratedWalk; multiplier: number; locale: Locale }) {
  const reward = walkReward(walk.id, multiplier);
  return <p className="reward-line">
    <Sparkles size={15} strokeWidth={ICON_STROKE} aria-hidden="true" />
    <span>{translate(locale, "routeRewardNow", { points: String(reward.now) })}</span>
    {multiplier > 1 && <><s aria-label={translate(locale, "routeRewardStandardLabel", { points: String(reward.standard) })}>{reward.standard}</s><em>{translate(locale, "offPeakShort", { multiplier: multiplier.toFixed(1) })}</em></>}
  </p>;
}

function WalkMeta({ walk, locale }: { walk: CuratedWalk; locale: Locale }) {
  return <p className="walk-meta">
    <span>{translate(locale, "walkMinutes", { minutes: String(walk.estimatedMinutes) })}</span>
    <span>{translate(locale, "walkKm", { km: (walk.estimatedMeters / 1000).toFixed(1) })}</span>
    <span>{translate(locale, walk.mappedSteps ? "walkMappedStairs" : "walkNoMappedSteps")}</span>
  </p>;
}

function RouteCard({ walk, locale, reason, multiplier, onPreview }: { walk: CuratedWalk; locale: Locale; reason?: MatchReason; multiplier: number; onPreview: () => void }) {
  const Icon = themeIcons[walk.theme];
  const crowd = sampleWalkCrowd(walk.placeIds);
  return <article className={`route-card route-card--${walk.theme}`}>
    <header>
      <span className="route-card-icon" aria-hidden="true"><Icon size={18} strokeWidth={ICON_STROKE} /></span>
      <h3>{walk.name[locale]}</h3>
    </header>
    <p className="route-card-hook">{walk.description[locale]}</p>
    <WalkMeta walk={walk} locale={locale} />
    <div className="route-card-tags">
      <CrowdBadge level={crowd} label={translate(locale, "crowdSampleLevel", { level: translate(locale, crowdKeys[crowd]) })} />
      {reason && <span className="match-tag">{translate(locale, reasonKeys[reason])}</span>}
    </div>
    <RewardLine walk={walk} multiplier={multiplier} locale={locale} />
    <Button variant="secondary" className="full-width" onClick={onPreview}>{translate(locale, "routePreview")}<ChevronRight size={17} strokeWidth={ICON_STROKE} aria-hidden="true" /></Button>
  </article>;
}

export function OffPeakBanner({ game, locale }: { game: Game; locale: Locale }) {
  const now = useNow(30_000);
  const window_ = offPeakWindow(game, now);
  const time = formatKyotoTime(window_.changesAt);
  return <div className="offpeak-banner" data-active={window_.active}>
    <Sparkles size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />
    <p><strong>{window_.active ? translate(locale, window_.simulated ? "offPeakSimulated" : "offPeakActive", { multiplier: window_.multiplier.toFixed(1), time }) : translate(locale, "offPeakInactive", { time })}</strong>
      <small>{translate(locale, "offPeakSource")}</small></p>
  </div>;
}

type KyotoMapProps = {
  game: Game;
  selectedWalkId: string | null;
  setSelectedWalkId: (id: string | null) => void;
  query: string;
  setQuery: (query: string) => void;
  routeFilter: RouteFilter;
  setRouteFilter: (filter: RouteFilter) => void;
  locale: Locale;
  location: LocationState;
  onLocationChange: Dispatch<SetStateAction<LocationState>>;
  settingsRecenterRequest: boolean;
  onSettingsRecenterHandled: () => void;
  onWallet: () => void;
};

export function KyotoMap({
  game, selectedWalkId, setSelectedWalkId, query, setQuery, routeFilter, setRouteFilter, locale, location, onLocationChange,
  settingsRecenterRequest, onSettingsRecenterHandled, onWallet,
}: KyotoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  const markerRootRef = useRef<Root | null>(null);
  const placeMarkerRefs = useRef<Map<string, MapLibreMarker>>(new Map());
  const congestionMarkerRefs = useRef<{ cue: (typeof SAMPLE_CONGESTION_CUES)[number]; marker: MapLibreMarker }[]>([]);
  const selectedWalkIdRef = useRef<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const watchVersionRef = useRef(0);
  const settingsRecenterHandledRef = useRef(false);
  const useLocationButtonRef = useRef<HTMLButtonElement>(null);
  const initialCenterRef = useRef(location.mode === "demo" ? DEMO_POSITION : KYOTO_CENTER);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [showCrowd, setShowCrowd] = useState(false);
  const [snap, setSnap] = useState<Snap>(selectedWalkId ? "full" : "peek");
  const [view, setView] = useState<"routes" | "walk" | "place">(selectedWalkId ? "walk" : "routes");
  const [mapAttempt, setMapAttempt] = useState(0);
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null);
  const [finishedWalkId, setFinishedWalkId] = useState<string | null>(null);
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const liveTracking = location.mode === "live" && ["requesting", "active", "lowAccuracy", "outsideKyoto"].includes(location.gpsStatus);
  const selectedWalk = CURATED_WALKS.find((walk) => walk.id === selectedWalkId) ?? null;
  const focusedPlace = CURATED_PLACES.find((place) => place.id === focusedPlaceId) ?? null;
  const results = discoverRoutes(query, routeFilter, CURATED_WALKS, CURATED_PLACES);
  const run = activeRun(game);
  const playing = run && selectedWalkId === run.walkId;
  const now = useNow(30_000);
  const { multiplier } = offPeakWindow(game, now);
  const [confirmStop, setConfirmStop] = useState<string | null>(null);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const demoPoint = useRef<readonly [number, number]>(DEMO_POSITION);
  const updateDemoMarker = useCallback((point: readonly [number, number]) => {
    demoPoint.current = point;
    markerRef.current?.setLngLat([...point]);
  }, []);

  const stopWatch = useCallback(() => {
    watchVersionRef.current += 1;
    if (watchIdRef.current !== null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => () => stopWatch(), [stopWatch]);

  const prevDemoRef = useRef(game.demo);
  useEffect(() => {
    if (!prevDemoRef.current && game.demo) stopWatch();
    prevDemoRef.current = game.demo;
  }, [game.demo, stopWatch]);

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

  const openPlace = useCallback((place: CuratedPlace) => {
    setFocusedPlaceId(place.id);
    setView("place");
    setSnap("half");
    mapRef.current?.easeTo({ center: [...place.location], zoom: 15.5, offset: [0, -90], duration: motionDuration(500) });
  }, []);
  const openPlaceRef = useRef(openPlace);

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

        const markerElement = document.createElement("div");
        markerElement.style.pointerEvents = "none";
        markerRootRef.current = createRoot(markerElement);
        markerRef.current = new maplibregl.Marker({ element: markerElement, anchor: "center" }).setLngLat(DEMO_POSITION).addTo(map);

        map.once("load", () => {
          if (disposed) return;
          // Washi-toned basemap that keeps OpenFreeMap's real roads and labels.
          const colors = [
            ["background", "background-color", "#faf8f4"],
            ["water", "fill-color", "#bccbdc"],
            ["waterway_river", "line-color", "#bccbdc"],
            ["park", "fill-color", "#dde4cf"],
            ["landuse_residential", "fill-color", "#f4f0e8"],
            ["building", "fill-color", "#ece6dc"],
            ["building", "fill-outline-color", "#ddd4c6"],
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
            pin.addEventListener("click", (event) => {
              event.stopPropagation();
              openPlaceRef.current(place);
            });
            placeMarkers.set(place.id, new maplibregl.Marker({ element: pin, anchor: "bottom" }).setLngLat([...place.location]).addTo(map));
          }
          for (const cue of SAMPLE_CONGESTION_CUES) {
            const place = CURATED_PLACES.find((item) => item.id === cue.placeId);
            if (!place) continue;
            const label = document.createElement("div");
            label.className = `map-congestion-cue crowd-badge crowd-badge--${cue.level}`;
            label.setAttribute("role", "img");
            const offset: [number, number] = cue.level === "moderate" ? [-100, 8] : [0, -46];
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
      // The map unmounts during a React render (tab switch); unmount the marker root afterwards.
      const markerRoot = markerRootRef.current;
      window.setTimeout(() => markerRoot?.unmount(), 0);
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
      ? [location.fix.longitude, location.fix.latitude] : location.mode === "demo" && playing ? [...demoPoint.current] : DEMO_POSITION;
    marker.setLngLat(coordinates);
    const label = location.mode === "live"
      ? translate(locale, "mapLiveMarker", { accuracy: String(Math.round(location.fix?.accuracy ?? 0)) })
      : translate(locale, location.mode === "demo" ? "mapDemoMarker" : "mapSampleLocation");
    const ariaLabel = location.mode === "live" ? label : translate(locale, location.mode === "demo" ? "mapDemoMarkerLabel" : "mapSampleLocationLabel");
    root.render(<div className="map-fox-marker" role="img" aria-label={ariaLabel} data-live={location.mode === "live"}>
      <FoxAvatar state={playing ? "walking" : "idle"} />{!playing && <span>{label}</span>}
    </div>);
  }, [locale, location, state, playing]);

  useEffect(() => {
    selectedWalkIdRef.current = selectedWalkId;
    const map = mapRef.current;
    if (!map || state !== "ready") return;
    for (const walk of CURATED_WALKS) {
      const layer = `walk-line-${walk.id}`;
      if (!map.getLayer(layer)) continue;
      map.setPaintProperty(layer, "line-color", selectedWalkId === walk.id ? "#782459" : routeColors[walk.theme]);
      map.setPaintProperty(layer, "line-width", selectedWalkId === walk.id ? 6 : 4);
      map.setPaintProperty(layer, "line-opacity", selectedWalkId && selectedWalkId !== walk.id ? 0.22 : 0.85);
    }
  }, [selectedWalkId, state]);

  useEffect(() => {
    if (state !== "ready") return;
    for (const place of CURATED_PLACES) {
      const pin = placeMarkerRefs.current.get(place.id)?.getElement();
      if (!pin) continue;
      const stopIndex = selectedWalk?.placeIds.indexOf(place.id) ?? -1;
      pin.style.display = selectedWalk && stopIndex === -1 ? "none" : "";
      pin.classList.toggle("map-next-stop", Boolean(playing && stopIndex === run?.stamps.length));
      pin.innerHTML = pinMarkup(placeThemes[place.id] ?? "culture", stopIndex >= 0 ? stopIndex + 1 : null);
      pin.setAttribute("aria-label", translate(locale, "mapOpenPlace", { name: place.name[locale] }));
      pin.setAttribute("aria-pressed", String(view === "place" && focusedPlaceId === place.id));
    }
    for (const { cue, marker } of congestionMarkerRefs.current) {
      const place = CURATED_PLACES.find((item) => item.id === cue.placeId);
      const label = marker.getElement();
      const level = translate(locale, crowdKeys[cue.level]);
      label.innerHTML = `<span aria-hidden="true">${cue.level === "busy" ? "■" : "▲"}</span>`;
      label.append(translate(locale, "crowdSampleLevel", { level }));
      label.style.display = !showCrowd || playing || selectedWalk && !selectedWalk.placeIds.includes(cue.placeId) ? "none" : "";
      if (place) label.setAttribute("aria-label", translate(locale, "mapSampleCongestionAt", { level, place: place.name[locale] }));
    }
  }, [focusedPlaceId, locale, view, selectedWalk, state, playing, run, showCrowd]);

  const focusMap = useCallback((coordinates: [number, number]) => {
    mapRef.current?.easeTo({ center: coordinates, offset: [0, -60], zoom: MAP_ZOOM, duration: motionDuration(550) });
  }, []);

  useEffect(() => {
    if (state !== "ready" || !selectedWalk) return;
    const coordinates = selectedWalk.geometry.coordinates;
    const lngs = coordinates.map(([lng]) => lng);
    const lats = coordinates.map(([, lat]) => lat);
    mapRef.current?.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], {
      padding: { top: playing ? 70 : 150, right: 48, bottom: playing ? 260 : 300, left: 48 },
      maxZoom: 16.5,
      duration: motionDuration(650),
    });
  }, [selectedWalk, state, playing]);

  useEffect(() => {
    if (state !== "ready" || !settingsRecenterRequest || settingsRecenterHandledRef.current) return;
    settingsRecenterHandledRef.current = true;
    if (location.mode === "live" && !location.fix) useLocationButtonRef.current?.focus();
    else focusMap(location.mode === "live" && location.fix ? [location.fix.longitude, location.fix.latitude] : location.mode === "demo" ? playing ? [...demoPoint.current] : DEMO_POSITION : KYOTO_CENTER);
    onSettingsRecenterHandled();
  }, [focusMap, location, onSettingsRecenterHandled, settingsRecenterRequest, state, playing]);

  function requestLiveLocation() {
    void act({ type: "demo", enabled: false });
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
        const fix: LocationFix = { timestamp: position.timestamp, latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy };
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
    stopWatch();
    onLocationChange(INITIAL_LOCATION_STATE);
    void act({ type: "demo", enabled: true });
    haptic();
    if (!selectedWalk) focusMap(DEMO_POSITION);
  }

  async function startWalk(demo: boolean) {
    if (!selectedWalk) return;
    const started = await act({ type: "start", id: crypto.randomUUID(), walkId: selectedWalk.id });
    if (!started || !mounted.current) return;
    if (demo) exploreDemo();
    else if (!liveTracking) requestLiveLocation();
    setFinishedWalkId(null);
    setSelectedWalkId(selectedWalk.id);
  }

  function showRoutes() {
    setSelectedWalkId(null);
    setFocusedPlaceId(null);
    setView("routes");
    setSnap("half");
  }

  function toggleFilter(filter: RouteFilter) {
    setQuery("");
    setRouteFilter(routeFilter === filter ? null : filter);
    showRoutes();
  }

  function previewWalk(walk: CuratedWalk) {
    setSelectedWalkId(walk.id);
    setFocusedPlaceId(null);
    setView("walk");
    setSnap("full");
  }

  function backFromPlace() {
    setFocusedPlaceId(null);
    setView(selectedWalk ? "walk" : "routes");
  }

  function recenter() {
    if (location.mode === "live") {
      if (location.fix) focusMap([location.fix.longitude, location.fix.latitude]);
    } else focusMap(location.mode === "demo" ? playing ? [...demoPoint.current] : DEMO_POSITION : KYOTO_CENTER);
  }

  const busyCues = SAMPLE_CONGESTION_CUES.filter(cue => cue.level === "busy");
  const calmWalks = CURATED_WALKS.filter(walk => sampleWalkCrowd(walk.placeIds) === "calm");
  const finishedWalk = CURATED_WALKS.find(walk => walk.id === finishedWalkId);
  const other = locale === "en" ? "ja" : "en";
  const sheetHeader = <div className="sheet-peek">
    <OffPeakBanner game={game} locale={locale} />
    {snap === "peek" && <p className="crowd-strip" aria-label={t("crowdStripLabel")}>
      {busyCues.map(cue => <CrowdBadge key={cue.id} level="busy" label={`${t("crowdBusy")} · ${CURATED_PLACES.find(place => place.id === cue.placeId)?.name[locale]}`} />)}
      {calmWalks.map(walk => <CrowdBadge key={walk.id} level="calm" label={`${t("crowdCalm")} · ${walk.name[locale]}`} />)}
      <small>{t("crowdSampleNote")}</small>
    </p>}
    {finishedWalk ? <div className="completion-receipt" role="status">
      <FoxAvatar state="reward" size={36} />
      <p><strong>{t("gameFinished")}</strong><small>{t("gameEarned", { points: String(GAME.completionPoints), walk: finishedWalk.name[locale] })}</small></p>
      <Button onClick={onWallet}>{t("navWallet")}</Button>
      <button type="button" className="icon-button" aria-label={t("close")} onClick={() => setFinishedWalkId(null)}><X size={18} strokeWidth={ICON_STROKE} /></button>
    </div> : run && !playing ? <Button className="full-width" onClick={() => { setSelectedWalkId(run.walkId); setView("walk"); setSnap("peek"); }}>
      <Footprints size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("gameResume")}
    </Button> : snap === "peek" && <>
      <div className="location-actions" role="group" aria-label={t("locationActionsLabel")}>
        <button ref={useLocationButtonRef} type="button" onClick={requestLiveLocation} disabled={state !== "ready"} aria-pressed={liveTracking}><Navigation size={16} strokeWidth={ICON_STROKE} aria-hidden="true" /><span>{t("locationUseMyLocation")}</span></button>
        <button type="button" onClick={exploreDemo} disabled={state !== "ready"} aria-pressed={location.mode === "demo"}><MapPinned size={16} strokeWidth={ICON_STROKE} aria-hidden="true" /><span>{t("locationExploreDemo")}</span></button>
      </div>
      <p className="location-status" role="status">{locationStatusText(locale, location)}</p>
    </>}
  </div>;

  return <section className="kyoto-map" aria-label={t("mapCanvasLabel")}>
    <div ref={containerRef} className="kyoto-map-canvas" inert={state !== "ready"} />
    {state !== "ready" && <div className="kyoto-map-status">
      <p role="status">{t(state === "loading" ? "mapLoading" : "mapLoadError")}</p>
      {state === "error" && <Button onClick={() => { setState("loading"); setMapAttempt((attempt) => attempt + 1); }}>{t("mapRetry")}</Button>}
      <Button variant="secondary" onClick={showRoutes}>{t("mapStoredWalks")}</Button>
    </div>}
    {!playing && <div className="map-top-ui" inert={state !== "ready"}>
      <div className="map-search-bar">
        <Search size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />
        <input type="search" aria-label={t("mapSearchLabel")} placeholder={t("mapSearchPlaceholder")} value={query}
          onChange={(event) => { setQuery(event.target.value); setRouteFilter(null); showRoutes(); }}
          onKeyDown={(event) => { if (event.key === "Enter" && results.suggestions[0]) previewWalk(results.suggestions[0].walk); }} />
        <button type="button" className="map-recenter" onClick={recenter} disabled={state !== "ready" || (location.mode === "live" && !location.fix)} aria-label={t(location.mode === "live" ? "mapRecenterLive" : location.mode === "demo" ? "mapRecenterDemo" : "mapRecenterSample")}><LocateFixed size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /></button>
      </div>
      <div className="map-categories" role="group" aria-label={t("mapCategoriesLabel")}>
        {categories.map(({ label, icon: Icon, filter }) => <button type="button" key={label} aria-pressed={routeFilter === filter} onClick={() => toggleFilter(filter)}><Icon size={16} strokeWidth={ICON_STROKE} aria-hidden="true" /><span>{t(label)}</span></button>)}
      </div>
      <div className="crowd-legend-wrap">
        <button type="button" className="crowd-legend-pill" aria-pressed={showCrowd} aria-expanded={showCrowd} onClick={() => { setShowCrowd(value => !value); haptic(); }}>{t("crowdInfo")}</button>
        {showCrowd && <div className="crowd-legend" role="note">
          {(["calm", "moderate", "busy"] as const).map(level => <CrowdBadge key={level} level={level} label={t(crowdKeys[level])} />)}
          <small>{t("crowdProvenance")}</small>
        </div>}
      </div>
    </div>}

    <div className="sheet-layer">
      {playing ? <WalkControls key={`${run.id}-${run.stamps.length}-${location.mode}`} run={run} locale={locale} location={location}
        onPosition={updateDemoMarker} onComplete={() => { setFinishedWalkId(run.walkId); setSelectedWalkId(null); setView("routes"); setSnap("peek"); }}
        onExit={() => setConfirmStop(run.id)} onResumeGps={requestLiveLocation} />
        : <SnapSheet snap={snap} onSnap={setSnap} header={sheetHeader}
          labels={{ expand: t("sheetExpand"), collapse: t("sheetCollapse"), region: t("sheetRegion") }}>
          {view === "routes" && <div className="sheet-section">
            <h2 className="sheet-title">{t("routesTitle")}</h2>
            {results.suggestions.length ? <div className="route-carousel">
              {results.suggestions.slice(0, 3).map(({ walk, reason }) => <RouteCard key={walk.id} walk={walk} locale={locale} reason={reason} multiplier={multiplier} onPreview={() => previewWalk(walk)} />)}
            </div> : <div className="route-empty"><p>{t("routesEmpty")}</p><Button variant="secondary" onClick={() => { setQuery(""); setRouteFilter(null); }}>{t("routesShowAll")}</Button></div>}
            <p className="sheet-intro">{t(results.fallback ? "routesSearchFallback" : "routesMapChecked")}</p>
            <RouteDataCredit locale={locale} />
          </div>}
          {view === "walk" && selectedWalk && <div className="sheet-section">
            <button type="button" className="sheet-back" onClick={showRoutes}><ArrowLeft size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("routesBack")}</button>
            <h2 className="sheet-title">{selectedWalk.name[locale]}<small lang={other}>{selectedWalk.name[other]}</small></h2>
            <p className="sheet-intro">{selectedWalk.description[locale]}</p>
            <WalkMeta walk={selectedWalk} locale={locale} />
            <RewardLine walk={selectedWalk} multiplier={multiplier} locale={locale} />
            <h3 className="sheet-subtitle">{t("routesStops")}</h3>
            <ol className="stop-timeline">{selectedWalk.placeIds.map((id, index) => {
              const place = CURATED_PLACES.find((item) => item.id === id);
              return place ? <li key={id}>
                <span className="stop-number" aria-hidden="true">{index + 1}</span>
                <button type="button" onClick={() => openPlace(place)} aria-label={t("mapOpenPlace", { name: place.name[locale] })}>
                  <strong>{place.name[locale]}</strong><small lang={other}>{place.name[other]}</small>
                  <span>{place.description[locale]}</span>
                </button>
              </li> : null;
            })}</ol>
            <div className="route-note"><strong>{t("routesAccessibility")}</strong><p>{selectedWalk.accessibilityNotes[locale]}</p></div>
            <div className="route-note"><strong>{t("routesResidentNote")}</strong><p>{selectedWalk.residentNotes[locale]}</p></div>
            <RouteDataCredit locale={locale} />
            <div className="sheet-sticky-actions">
              {run ? <Button onClick={() => { setSelectedWalkId(run.walkId); setSnap("peek"); }}>{t("gameResume")}</Button> : <>
                <Button disabled={state !== "ready"} onClick={() => void startWalk(true)}>{t("gameStartDemo")}</Button>
                <Button disabled={state !== "ready"} variant="secondary" onClick={() => void startWalk(false)}>{t("gameStartLive")}</Button>
              </>}
              <a className="handoff-link" href={googleMapsUrl(selectedWalk)} target="_blank" rel="noreferrer">{t("openGoogleMaps")}</a>
            </div>
          </div>}
          {view === "place" && focusedPlace && <div className="sheet-section">
            <button type="button" className="sheet-back" onClick={backFromPlace}><ArrowLeft size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t(selectedWalk ? "routesDetails" : "routesBack")}</button>
            <h2 className="sheet-title">{focusedPlace.name[locale]}<small lang={other}>{focusedPlace.name[other]}</small></h2>
            <p className="sheet-intro">{focusedPlace.description[locale]}</p>
            <div className="route-note"><strong>{t("routesAccessibility")}</strong><p>{focusedPlace.accessibilityNotes[locale]}</p></div>
            <div className="route-note"><strong>{t("routesAccessNotes")}</strong><p>{focusedPlace.accessNotes[locale]}</p></div>
            <p className="route-community-status">{t("routesCommunityNotConsulted")}</p>
            <a className="route-place-source" href={focusedPlace.osmFeatureUrl} target="_blank" rel="noreferrer">{t("placeMapSource")}</a>
            <RouteDataCredit locale={locale} />
          </div>}
        </SnapSheet>}
    </div>

    <ConfirmDialog open={confirmStop !== null} title={t("gameStopWalk")} closeLabel={t("close")} onClose={() => setConfirmStop(null)}>
      <p>{t("gameStopHint")}</p>
      <div className="dialog-actions"><Button variant="secondary" onClick={() => setConfirmStop(null)}>{t("gameCancel")}</Button>
        <Button onClick={async () => { if (confirmStop) await act({ type: "stop", runId: confirmStop }); setConfirmStop(null); }}>{t("gameStopWalk")}</Button></div>
    </ConfirmDialog>
  </section>;
}
