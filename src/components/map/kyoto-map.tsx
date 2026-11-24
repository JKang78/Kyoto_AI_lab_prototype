"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { GeoJSONSource, Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import { ArrowLeft, Map as MapIcon, Bike, CircleHelp, Heart, Layers, ListTree, Lock, Ticket, Users, X, ChevronRight, Coffee, Eye, Footprints, Landmark, Leaf, Luggage, LocateFixed, MapPinned, Navigation, Search, Sparkles, Sun, Trees, Waves, type LucideIcon } from "lucide-react";
import { COUPONS, GAME } from "@/config/game";
import { WalkControls } from "@/components/walk-controls";
import { activeBonus, activeRun, balance, circlePolygon, liveEligible, placeById, scenarioByKind, walkById, walkReward, type ActiveBonus, type Game } from "@/lib/game";
import { Celebration } from "@/components/celebration";
import { HelpSheet } from "@/components/help-sheet";
import { PREVIEW_CONTROLS } from "@/config/environment";
import { applyPixelLook, clearPixelPatterns, pixelLookRequested } from "@/components/map/pixel-look";
import { PlacePhoto, PlaceStory } from "@/components/place-media";
import { glyphSvg, kyotoSeason, PlaceSeal, placeSealSvg, placeTheme } from "@/components/glyphs";
import { applyMapPrefs, captureSymbolOriginals, type SymbolOriginal } from "@/lib/map-looks";
import { getMapPrefsSnapshot, parseMapPrefs, subscribeMapPrefs } from "@/lib/map-prefs";
import { act } from "@/lib/game-store";
import { toggleSavedPlace, toggleSavedWalk, type SavedItems } from "@/lib/saved";
import { Button, ConfirmDialog, CrowdBadge, FoxAvatar, haptic, ICON_STROKE, SnapSheet, StopBeads, type Snap } from "@/components/ui";
import { CURATED_PLACES, CURATED_WALKS } from "@/data/kyoto-walks";
import { SAMPLE_CONGESTION_CUES, sampleWalkCrowd, type CrowdLevel } from "@/data/sample-congestion";
import { bonusNameKey, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { classifyFix, DEMO_POSITION, INITIAL_LOCATION_STATE, locationStatusText, type LocationFix, type LocationState } from "@/lib/location";
import { discoverRoutes, type MatchReason, type RouteFilter } from "@/lib/route-discovery";
import { placeWalkTime } from "@/lib/place-walk-time";
import type { CuratedPlace, CuratedWalk, LngLat } from "@/types/routes";

// Centred on the three curated walks so their lines, pins and labels open in view.
const KYOTO_CENTER: [number, number] = [135.7738, 35.0052];
const MAP_ZOOM = 13.9;
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// Unsupported modes stay visible but unavailable, with the reason, instead of filtering to nothing
// or implying unverified capabilities (design_system §5, §6.1).
const categories: { label: MessageKey; icon: LucideIcon; filter: RouteFilter; unavailable?: MessageKey }[] = [
  { label: "mapCategoryCulture", icon: Landmark, filter: "culture" },
  { label: "mapCategoryRiverside", icon: Waves, filter: "riverside" },
  { label: "mapCategoryPark", icon: Trees, filter: "park" },
  { label: "mapCategoryHidden", icon: Eye, filter: "hidden" },
  { label: "mapCategoryCafes", icon: Coffee, filter: "cafes" },
  { label: "mapCategoryNature", icon: Leaf, filter: "nature" },
  { label: "chipLuggage", icon: Luggage, filter: "luggage", unavailable: "chipLuggageNote" },
  { label: "mapCategorySeasonal", icon: Sun, filter: "seasonal" },
  { label: "chipBike", icon: Bike, filter: "bike", unavailable: "chipBikeNote" },
];
const themeIcons: Record<CuratedWalk["theme"], LucideIcon> = { culture: Landmark, riverside: Waves, park: Trees };
const labelPosition: Record<CuratedWalk["theme"], number> = { culture: 0.33, riverside: 0.6, park: 0.85 };
const themeLabelKeys: Record<CuratedWalk["theme"], MessageKey> = { culture: "mapCategoryCulture", riverside: "mapCategoryRiverside", park: "mapCategoryPark" };
const routeColors: Record<CuratedWalk["theme"], string> = { culture: "#a8453c", riverside: "#3d5f86", park: "#5d7a3e" };
const reasonKeys: Record<Exclude<MatchReason, null>, MessageKey> = { place: "routesReasonPlace", theme: "routesReasonTheme", time: "routesReasonTime", available: "routesReasonAvailable" };
const crowdKeys: Record<CrowdLevel, MessageKey> = { calm: "crowdCalm", moderate: "crowdModerate", busy: "crowdBusy", unknown: "crowdUnknown" };
function pinMarkup(placeId: string, number: number | null, { sealed = false, next = false } = {}) {
  const theme = placeTheme(placeId);
  const inner = number === null
    ? glyphSvg(theme, 18)
    : `<span class="map-place-pin-number">${number}</span>`;
  // Collected stops carry a small seal; the next stop gets an attention bubble (visuals.md E4).
  const seal = sealed ? `<span class="map-place-pin-seal" aria-hidden="true">${placeSealSvg(placeId, 12, 2)}</span>` : "";
  const bubble = next ? `<span class="map-place-pin-bubble" aria-hidden="true">!</span>` : "";
  return `<span class="map-place-pin-body">${bubble}<span class="map-place-pin-head">${inner}${seal}</span><span class="map-place-pin-tail"></span></span>`;
}
const FOX_HALO_METERS = 60;
const emptyGeoJson = { type: "FeatureCollection" as const, features: [] };
function haloGeoJson(center: LngLat | null) {
  if (!center) return emptyGeoJson;
  return {
    type: "FeatureCollection" as const,
    features: [{ type: "Feature" as const, properties: {}, geometry: { type: "Polygon" as const, coordinates: [circlePolygon(center, FOX_HALO_METERS)] } }],
  };
}
const motionDuration = (ms: number) => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
const googleMapsUrl = (walk: CuratedWalk) => {
  const points = walk.placeIds.map(id => CURATED_PLACES.find(place => place.id === id)!.location).map(([lng, lat]) => `${lat},${lng}`);
  const params = new URLSearchParams({ api: "1", origin: points[0], destination: points.at(-1)!, travelmode: "walking" });
  if (points.length > 2) params.set("waypoints", points.slice(1, -1).join("|"));
  return `https://www.google.com/maps/dir/?${params}`;
};

// Expire the displayed GPS estimate even when the watcher sends no further fixes.
function usePlaceOrigin(location: LocationState): LngLat | null {
  const fix = location.fix;
  const subscribe = useCallback((refresh: () => void) => {
    if (!fix) return () => {};
    const delay = fix.timestamp + GAME.maxFixAgeMs + 1 - Date.now();
    if (!(delay > 0 && delay <= GAME.maxFixAgeMs + GAME.maxClockSkewMs + 1)) return () => {};
    const timer = window.setTimeout(refresh, delay);
    return () => window.clearTimeout(timer);
  }, [fix]);
  const fresh = useSyncExternalStore(subscribe, () => Boolean(fix &&
    liveEligible(location, [fix.longitude, fix.latitude], Date.now())), () => false);
  return fresh && fix ? [fix.longitude, fix.latitude] : null;
}

function PlaceWalkInfo({ place, walk, origin, locale }: {
  place: CuratedPlace; walk?: CuratedWalk | null; origin: LngLat | null; locale: Locale;
}) {
  const walks = walk ? [walk] : CURATED_WALKS.filter(item => item.placeIds.some(id => id === place.id));
  const estimates = walks.map(item => ({ walk: item, ...placeWalkTime(item, place, origin) }));
  const estimate = estimates.find(item => item.fromPosition) ?? estimates[0];
  if (!estimate) return null;
  const { fromPosition, minutes } = estimate;
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const start = placeById(estimate.walk.placeIds[0])!;
  const time = minutes ? t("placeWalkMinutes", { minutes: String(minutes) }) : t("placeWalkUnderMinute");
  const [lng, lat] = place.location;
  const params = new URLSearchParams({ api: "1", destination: `${lat},${lng}`, travelmode: "walking" });
  return <div className="place-walk-info">
    <span className="match-tag">{t(themeLabelKeys[placeTheme(place.id)])}</span>
    <span>{fromPosition ? t("placeWalkFromGps", { time })
      : place.id === start.id ? t("placeWalkStart") : t("placeWalkFromStart", { time, name: start.name[locale] })}</span>
    {!fromPosition && <a href={`https://www.google.com/maps/dir/?${params}`} target="_blank" rel="noreferrer">{t("placeDirections")}</a>}
  </div>;
}

function RouteDataCredit({ locale }: { locale: Locale }) {
  return <p className="route-data-credit">{translate(locale, "routesDataCredit")} <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap / ODbL</a> · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">{translate(locale, "routesFixMap")}</a></p>;
}

function RewardLine({ walk, bonus, locale }: { walk: CuratedWalk; bonus: ActiveBonus | null; locale: Locale }) {
  const reward = walkReward(walk.id, bonus?.multiplier ?? 1);
  return <p className="reward-line">
    <Sparkles size={15} strokeWidth={ICON_STROKE} aria-hidden="true" />
    <span>{translate(locale, "routeRewardNow", { points: String(reward.now) })}</span>
    {bonus && <><s aria-label={translate(locale, "routeRewardStandardLabel", { points: String(reward.standard) })}>{reward.standard}</s><em>{translate(locale, "bonusShort", { name: translate(locale, bonusNameKey[bonus.kind]), multiplier: bonus.multiplier.toFixed(1) })}</em></>}
  </p>;
}

function WalkMeta({ walk, locale }: { walk: CuratedWalk; locale: Locale }) {
  return <p className="walk-meta">
    <span>{translate(locale, "walkMinutes", { minutes: String(walk.estimatedMinutes) })}</span>
    <span>{translate(locale, "walkKm", { km: (walk.estimatedMeters / 1000).toFixed(1) })}</span>
    <span>{translate(locale, walk.mappedSteps ? "walkMappedStairs" : "walkStepFreeUnknown")}</span>
  </p>;
}

const START_LANDMARK_IDS = ["shijo-kawaramachi", "shijo-ohashi", "yasaka-west-view", "sanjo-ohashi"] as const;
const ILLUSTRATED_PAINTS = [
  ["background", "background-color", "#faf8f4"],
  ["water", "fill-color", "#bccbdc"],
  ["waterway_river", "line-color", "#bccbdc"],
  ["park", "fill-color", "#dde4cf"],
  ["landuse_residential", "fill-color", "#f4f0e8"],
  ["building", "fill-color", "#ece6dc"],
  ["building", "fill-outline-color", "#ddd4c6"],
] as const;

function SaveButton({ saved, locale, onToggle }: { saved: boolean; locale: Locale; onToggle: () => void }) {
  const label = translate(locale, saved ? "savedAction" : "saveAction");
  return <button type="button" className="save-button" aria-pressed={saved} onClick={() => { haptic(); onToggle(); }}>
    <Heart size={16} strokeWidth={ICON_STROKE} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
    <span>{label}</span>
  </button>;
}

function RouteCard({ walk, locale, reason, bonus, saved, onToggleSave, onPreview }: { walk: CuratedWalk; locale: Locale; reason?: MatchReason; bonus: ActiveBonus | null; saved: boolean; onToggleSave: () => void; onPreview: () => void }) {
  const Icon = themeIcons[walk.theme];
  const crowd = sampleWalkCrowd(walk.placeIds);
  return <article className={`route-card route-card--${walk.theme}`}>
    <header>
      <span className="route-card-icon" aria-hidden="true"><Icon size={18} strokeWidth={ICON_STROKE} /></span>
      <h3>{walk.name[locale]}</h3>
      <SaveButton saved={saved} locale={locale} onToggle={onToggleSave} />
    </header>
    <p className="route-card-hook">{walk.description[locale]}</p>
    <WalkMeta walk={walk} locale={locale} />
    <div className="route-card-tags">
      <CrowdBadge level={crowd} label={translate(locale, "crowdSampleLevel", { level: translate(locale, crowdKeys[crowd]) })} />
      {reason && <span className="match-tag">{translate(locale, reasonKeys[reason])}</span>}
    </div>
    <RewardLine walk={walk} bonus={bonus} locale={locale} />
    <Button variant="secondary" className="full-width" onClick={onPreview}>{translate(locale, "routePreview")}<ChevronRight size={17} strokeWidth={ICON_STROKE} aria-hidden="true" /></Button>
  </article>;
}

/** Shown only while a presenter has switched on a hypothetical bonus scenario; never inferred from real data. */
function BonusBanner({ game, locale }: { game: Game; locale: Locale }) {
  if (!game.scenario) return null;
  const scenario = scenarioByKind(game.scenario);
  return <div className="bonus-banner" data-active="true" data-kind={scenario.kind}>
    <Sparkles size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />
    <p><strong>{translate(locale, "bonusBanner", { name: translate(locale, bonusNameKey[scenario.kind]), multiplier: scenario.multiplier.toFixed(1) })}</strong>
      <small>{translate(locale, "bonusBannerWalk", { walk: scenario.walkIds.map(id => walkById(id)?.name[locale]).join(", ") })}</small></p>
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
  onRewards: () => void;
  onStampBook: () => void;
  onCelebrationChange: (open: boolean) => void;
  viewMode: "map" | "list";
  setViewMode: (mode: "map" | "list") => void;
  mapStyle: "illustrated" | "standard";
  setMapStyle: (style: "illustrated" | "standard") => void;
  startPlaceId: string | null;
  setStartPlaceId: (id: string | null) => void;
  saved: SavedItems;
  initialPlaceId: string | null;
  onInitialPlaceHandled: () => void;
};

export function KyotoMap({
  game, selectedWalkId, setSelectedWalkId, query, setQuery, routeFilter, setRouteFilter, locale, location, onLocationChange,
  settingsRecenterRequest, onSettingsRecenterHandled, onRewards, onStampBook, onCelebrationChange, viewMode, setViewMode,
  mapStyle, setMapStyle, startPlaceId, setStartPlaceId, saved, initialPlaceId, onInitialPlaceHandled,
}: KyotoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  const markerRootRef = useRef<Root | null>(null);
  const placeMarkerRefs = useRef<Map<string, MapLibreMarker>>(new Map());
  const congestionMarkerRefs = useRef<{ cue: (typeof SAMPLE_CONGESTION_CUES)[number]; marker: MapLibreMarker }[]>([]);
  const routeLabelRefs = useRef<Map<string, MapLibreMarker>>(new Map());
  const goalMarkerRef = useRef<MapLibreMarker | null>(null);
  const previewWalkRef = useRef<(walk: CuratedWalk) => void>(() => {});
  // Hide any route label that would overlap an earlier one or leave the map; re-run after every move.
  const layoutRouteLabels = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const kept: DOMRect[] = [];
    for (const walk of CURATED_WALKS) {
      const label = routeLabelRefs.current.get(walk.id)?.getElement();
      if (!label || label.style.display === "none") continue;
      label.style.visibility = "";
      const rect = label.getBoundingClientRect();
      const offscreen = rect.left < bounds.left + 4 || rect.right > bounds.right - 64 || rect.top < bounds.top || rect.bottom > bounds.bottom;
      const overlaps = kept.some(other => rect.left < other.right + 4 && rect.right > other.left - 4 && rect.top < other.bottom + 4 && rect.bottom > other.top - 4);
      if (offscreen || overlaps) label.style.visibility = "hidden";
      else kept.push(rect);
    }
  }, []);
  const selectedWalkIdRef = useRef<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const watchVersionRef = useRef(0);
  const settingsRecenterHandledRef = useRef(false);
  const useLocationButtonRef = useRef<HTMLButtonElement>(null);
  const startPlace = startPlaceId ? placeById(startPlaceId) : undefined;
  const initialCenterRef = useRef<[number, number]>(
    location.mode === "demo" ? DEMO_POSITION : startPlace ? [...startPlace.location] : KYOTO_CENTER,
  );
  const standardPaintRef = useRef<Map<string, unknown>>(new Map());
  const symbolOriginalsRef = useRef<Map<string, SymbolOriginal>>(new Map());
  // Personal look preferences (Me screen). The stored string is stable, so this only re-renders on change.
  const mapPrefsSnapshot = useSyncExternalStore(subscribeMapPrefs, getMapPrefsSnapshot, () => null);
  const prefs = useMemo(() => parseMapPrefs(mapPrefsSnapshot), [mapPrefsSnapshot]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  // EXPERIMENT: `?look=pixel` in dev/preview builds only. Read once on the client; it doesn't change rendered markup.
  const [pixelLook] = useState(() => typeof window !== "undefined" && pixelLookRequested(window.location.search, PREVIEW_CONTROLS));
  const [showCrowd, setShowCrowd] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [chipNote, setChipNote] = useState<MessageKey | null>(null);
  useEffect(() => {
    if (!chipNote) return;
    const timer = window.setTimeout(() => setChipNote(null), 8000);
    return () => window.clearTimeout(timer);
  }, [chipNote]);
  const [snap, setSnap] = useState<Snap>(initialPlaceId ? "half" : selectedWalkId ? "full" : "peek");
  const [view, setView] = useState<"routes" | "walk" | "place">(initialPlaceId ? "place" : selectedWalkId ? "walk" : "routes");
  const [mapAttempt, setMapAttempt] = useState(0);
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(initialPlaceId);
  const [buildingWalkId, setBuildingWalkId] = useState<string | null>(null);
  const [finishedWalkId, setFinishedWalkId] = useState<string | null>(null);
  const [celebrationRunId, setCelebrationRunId] = useState<string | null>(null);
  const [dismissedBubble, setDismissedBubble] = useState<string | null>(null);
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const liveTracking = location.mode === "live" && ["requesting", "active", "lowAccuracy", "outsideKyoto"].includes(location.gpsStatus);
  const selectedWalk = CURATED_WALKS.find((walk) => walk.id === selectedWalkId) ?? null;
  const placeOrigin = usePlaceOrigin(location);
  const focusedPlace = CURATED_PLACES.find((place) => place.id === focusedPlaceId) ?? null;
  const results = discoverRoutes(query, routeFilter, CURATED_WALKS, CURATED_PLACES);
  const run = activeRun(game);
  const playing = run && selectedWalkId === run.walkId;
  // Map/List equivalence (PRODUCT_REQUIREMENTS FR-04): the list replaces the map, never during a walk.
  const listMode = viewMode === "list" && !playing;
  const celebrationRun = game.runs.find(item => item.id === celebrationRunId);
  const collectedPlaces = new Set(game.runs.flatMap(item => item.stamps.map(stamp => stamp.placeId)));
  const collectedKey = [...collectedPlaces].sort().join(",");
  const points = balance(game);
  const nextVoucher = COUPONS.filter(coupon => !game.claims.some(claim => claim.id === coupon.id)).sort((a, b) => a.cost - b.cost)[0];
  // The fox's one contextual line (visuals.md E2). Hidden during a walk: the HUD and follow card already name the next stop.
  const bubbleText = celebrationRun || playing ? null
    : finishedWalkId ? t("foxBubbleDone")
      : selectedWalk ? t("foxBubbleReady", { walk: selectedWalk.name[locale] })
        : t("foxBubblePick");
  const bubbleVisible = bubbleText !== null && bubbleText !== dismissedBubble;
  const bubbleActionRef = useRef<() => void>(() => {});
  useEffect(() => {
    bubbleActionRef.current = () => {
      setDismissedBubble(bubbleText);
      if (!selectedWalk && !finishedWalkId) { setView("routes"); setSnap("half"); }
      else if (selectedWalk && !playing) { setView("walk"); setSnap("full"); }
    };
  });
  useEffect(() => {
    if (!bubbleText) return;
    const timer = window.setTimeout(() => setDismissedBubble(bubbleText), 6000);
    return () => window.clearTimeout(timer);
  }, [bubbleText]);
  useEffect(() => { onCelebrationChange(Boolean(celebrationRunId)); }, [celebrationRunId, onCelebrationChange]);
  const [confirmStop, setConfirmStop] = useState<string | null>(null);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const demoPoint = useRef<readonly [number, number]>(DEMO_POSITION);
  const updateDemoMarker = useCallback((point: readonly [number, number]) => {
    demoPoint.current = point;
    markerRef.current?.setLngLat([...point]);
    (mapRef.current?.getSource("fox-halo") as GeoJSONSource | undefined)?.setData(haloGeoJson(point));
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
    const routeLabels = routeLabelRefs.current;

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
          // Capture original OpenFreeMap standard paint values so the Illustrated/Standard switch preserves camera & layers.
          standardPaintRef.current.clear();
          for (const [layer, property] of ILLUSTRATED_PAINTS) {
            if (map.getLayer(layer)) standardPaintRef.current.set(`${layer}:${property}`, map.getPaintProperty(layer, property));
          }
          symbolOriginalsRef.current = captureSymbolOriginals(map);
          const firstLabel = map.getStyle().layers?.find((layer) => layer.type === "symbol")?.id;
          // Geographic 60 m fox proximity halo (docs/visuals.md): scales with zoom, hidden when no live/demo fix is active.
          map.addSource("fox-halo", { type: "geojson", data: emptyGeoJson });
          map.addLayer({ id: "fox-halo-fill", type: "fill", source: "fox-halo", paint: { "fill-color": "#782459", "fill-opacity": 0.12 } }, firstLabel);
          map.addLayer({ id: "fox-halo-ring", type: "line", source: "fox-halo", paint: { "line-color": "#782459", "line-opacity": 0.36, "line-width": 1.5 } }, firstLabel);
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
            pin.className = `map-place-pin map-place-pin--${placeTheme(place.id)}`;
            pin.dataset.placeId = place.id;
            pin.addEventListener("click", (event) => {
              event.stopPropagation();
              openPlaceRef.current(place);
            });
            placeMarkers.set(place.id, new maplibregl.Marker({ element: pin, anchor: "bottom" }).setLngLat([...place.location]).addTo(map));
          }
          // Route labels on each walk line (visuals.md E7). Placed a third of the way along to stay clear of stop pins.
          for (const walk of CURATED_WALKS) {
            const label = document.createElement("button");
            label.type = "button";
            label.className = `map-route-label map-route-label--${walk.theme}`;
            label.dataset.walkId = walk.id;
            label.addEventListener("click", (event) => { event.stopPropagation(); previewWalkRef.current(walk); });
            // Each theme's label sits at a different point along its line so the three rarely collide.
            const point = walk.geometry.coordinates[Math.floor((walk.geometry.coordinates.length - 1) * labelPosition[walk.theme])];
            // Open towards the side of the screen with more room.
            const onLeftHalf = map.project([...point]).x < container.clientWidth / 2;
            routeLabels.set(walk.id, new maplibregl.Marker({ element: label, anchor: onLeftHalf ? "left" : "right", offset: [onLeftHalf ? 12 : -12, 0] }).setLngLat([...point]).addTo(map));
          }
          // Walk-end goal marker (visuals.md E8): where a walk's points are earned, never where a voucher is used.
          const goal = document.createElement("div");
          goal.className = "map-goal-marker";
          goal.style.display = "none";
          goalMarkerRef.current = new maplibregl.Marker({ element: goal, anchor: "right", offset: [-18, -24] }).setLngLat(KYOTO_CENTER).addTo(map);
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
          map.on("moveend", layoutRouteLabels);
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
      for (const marker of routeLabels.values()) marker.remove();
      routeLabels.clear();
      goalMarkerRef.current?.remove();
      goalMarkerRef.current = null;
      markerRef.current = null;
      markerRootRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapAttempt, layoutRouteLabels]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || state !== "ready") return;
    for (const [layer, property, color] of ILLUSTRATED_PAINTS) {
      if (!map.getLayer(layer)) continue;
      const value = mapStyle === "illustrated" ? color : standardPaintRef.current.get(`${layer}:${property}`);
      if (value !== undefined) map.setPaintProperty(layer, property, value as never);
    }
  }, [mapStyle, state]);

  useEffect(() => {
    const map = mapRef.current;
    if (!pixelLook || !map || state !== "ready") return;
    if (mapStyle === "illustrated") applyPixelLook(map);
    else clearPixelPatterns(map);
    // Zooming loads new tiles and can refresh the style; re-assert the pixel paints when that happens.
    const reassert = () => { if (mapStyle === "illustrated") applyPixelLook(map); };
    map.on("styledata", reassert);
    map.on("idle", reassert);
    return () => { map.off("styledata", reassert); map.off("idle", reassert); };
  }, [mapStyle, pixelLook, state]);

  // Debug hook (preview and dev builds only): the live map, for inspecting paint and layout from the console.
  useEffect(() => {
    if (PREVIEW_CONTROLS && state === "ready") (window as unknown as { __kyotoMap?: MapLibreMap }).__kyotoMap = mapRef.current ?? undefined;
  }, [state]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || state !== "ready") return;
    applyMapPrefs(map, prefs, symbolOriginalsRef.current, { season: kyotoSeason(Date.now()), pixelLook, mapStyle });
  }, [prefs, mapStyle, pixelLook, state]);

  useEffect(() => {
    if (!initialPlaceId || state !== "ready") return;
    const place = placeById(initialPlaceId);
    if (place) mapRef.current?.easeTo({ center: [...place.location], zoom: 15.5, offset: [0, -90], duration: motionDuration(500) });
    onInitialPlaceHandled();
  }, [initialPlaceId, onInitialPlaceHandled, state]);

  useEffect(() => {
    const marker = markerRef.current;
    const root = markerRootRef.current;
    if (!marker || !root || state !== "ready") return;
    const haloSource = mapRef.current?.getSource("fox-halo") as GeoJSONSource | undefined;
    if (location.mode === "live" && !location.fix) {
      marker.getElement().style.display = "none";
      haloSource?.setData(emptyGeoJson);
      return;
    }
    marker.getElement().style.display = "";
    const coordinates: [number, number] = location.mode === "live" && location.fix
      ? [location.fix.longitude, location.fix.latitude] : location.mode === "demo" && playing ? [...demoPoint.current] : DEMO_POSITION;
    marker.setLngLat(coordinates);
    // Show the 60 m halo only for an accurate live fix or explicit Demo Mode; hide when unselected or low-accuracy.
    const lowAccuracy = location.mode === "live" && location.gpsStatus === "lowAccuracy";
    const haloCenter: LngLat | null = location.mode === "live" && location.fix && !lowAccuracy ? coordinates : location.mode === "demo" ? coordinates : null;
    haloSource?.setData(haloGeoJson(haloCenter));
    const label = location.mode === "live"
      ? translate(locale, "mapLiveMarker", { accuracy: String(Math.round(location.fix?.accuracy ?? 0)) })
      : translate(locale, location.mode === "demo" ? "mapDemoMarker" : "mapSampleLocation");
    const ariaLabel = location.mode === "live" ? label : translate(locale, location.mode === "demo" ? "mapDemoMarkerLabel" : "mapSampleLocationLabel");
    root.render(<div className="map-fox-marker" data-live={location.mode === "live"} data-low-accuracy={lowAccuracy}>
      {bubbleVisible && <button type="button" className="fox-bubble" onClick={() => bubbleActionRef.current()}>{bubbleText}</button>}
      <span role="img" aria-label={ariaLabel} className="map-fox-figure"><FoxAvatar state={playing ? "walking" : "idle"} /></span>
      {!playing && <span className="map-fox-label">{label}</span>}
    </div>);
  }, [locale, location, state, playing, bubbleText, bubbleVisible]);

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
      pin.innerHTML = pinMarkup(place.id, stopIndex >= 0 ? stopIndex + 1 : null, {
        sealed: collectedPlaces.has(place.id),
        next: Boolean(playing && stopIndex === run?.stamps.length),
      });
      pin.dataset.sealed = String(collectedPlaces.has(place.id));
      pin.setAttribute("aria-label", translate(locale, "mapOpenPlace", { name: place.name[locale] }));
      pin.setAttribute("aria-pressed", String(view === "place" && focusedPlaceId === place.id));
    }
    for (const walk of CURATED_WALKS) {
      const label = routeLabelRefs.current.get(walk.id)?.getElement();
      if (!label) continue;
      label.textContent = translate(locale, "routeLabel", { theme: translate(locale, themeLabelKeys[walk.theme]), minutes: String(walk.estimatedMinutes) });
      label.setAttribute("aria-label", translate(locale, "routeLabelAria", { walk: walk.name[locale] }));
      label.style.display = selectedWalk || playing ? "none" : "";
    }
    layoutRouteLabels();
    const goal = goalMarkerRef.current;
    if (goal) {
      const lastStop = selectedWalk && placeById(selectedWalk.placeIds.at(-1)!);
      goal.getElement().style.display = lastStop ? "" : "none";
      if (lastStop) {
        goal.setLngLat([...lastStop.location]);
        goal.getElement().innerHTML = `<span class="map-goal-text"></span><span class="map-goal-burst" aria-hidden="true"></span>`;
        goal.getElement().querySelector(".map-goal-text")!.textContent = translate(locale, "goalMarker", { points: String(GAME.completionPoints) });
      }
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
    // collectedKey stands in for collectedPlaces, which is rebuilt every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedPlaceId, locale, view, selectedWalk, state, playing, run, showCrowd, collectedKey]);

  const focusMap = useCallback((coordinates: [number, number]) => {
    mapRef.current?.easeTo({ center: coordinates, offset: [0, -60], zoom: MAP_ZOOM, duration: motionDuration(550) });
  }, []);

  useEffect(() => {
    if (state !== "ready" || !selectedWalk) return;
    const coordinates = selectedWalk.geometry.coordinates;
    const lngs = coordinates.map(([lng]) => lng);
    const lats = coordinates.map(([, lat]) => lat);
    mapRef.current?.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], {
      padding: { top: playing ? 120 : 210, right: 48, bottom: playing ? 260 : 300, left: 48 },
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

  function pauseLiveLocation() {
    stopWatch();
    onLocationChange({ mode: "live", gpsStatus: "paused", fix: null });
  }

  function exploreDemo(walk: CuratedWalk | null = selectedWalk) {
    stopWatch();
    onLocationChange(INITIAL_LOCATION_STATE);
    void act({ type: "demo", enabled: true });
    haptic();
    if (!walk) focusMap(DEMO_POSITION);
  }

  async function startWalk(demo: boolean, walk: CuratedWalk | null = selectedWalk) {
    if (!walk || buildingWalkId) return;
    if (demo) {
      setBuildingWalkId(walk.id);
      await new Promise<void>(resolve => window.setTimeout(resolve, 600));
      if (!mounted.current) return;
    }
    const started = await act({ type: "start", id: crypto.randomUUID(), walkId: walk.id });
    if (!mounted.current) return;
    if (demo) setBuildingWalkId(null);
    if (!started) return;
    if (demo) exploreDemo(walk);
    else if (!liveTracking) requestLiveLocation();
    setFinishedWalkId(null);
    setSelectedWalkId(walk.id);
    setViewMode("map");
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

  useEffect(() => { previewWalkRef.current = previewWalk; });
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
  const other = locale === "en" ? "ja" : "en";
  const sheetHeader = <div className="sheet-peek">
    {snap === "peek" && <p className="crowd-strip" aria-label={t("crowdStripLabel")}>
      {busyCues.map(cue => <CrowdBadge key={cue.id} level="busy" label={`${t("crowdBusy")} · ${CURATED_PLACES.find(place => place.id === cue.placeId)?.name[locale]}`} />)}
      <small>{t("crowdSampleNote")}</small>
    </p>}
    {run && !playing ? <Button className="full-width" onClick={() => { setSelectedWalkId(run.walkId); setView("walk"); setSnap("peek"); }}>
      <Footprints size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("gameResume")}
    </Button> : snap === "peek" && <>
      <div className="location-actions" role="group" aria-label={t("locationActionsLabel")}>
        <button ref={useLocationButtonRef} type="button" onClick={requestLiveLocation} disabled={state !== "ready"} aria-pressed={liveTracking}><Navigation size={16} strokeWidth={ICON_STROKE} aria-hidden="true" /><span>{t("locationUseMyLocation")}</span></button>
        {PREVIEW_CONTROLS && <button type="button" onClick={() => exploreDemo()} disabled={state !== "ready"} aria-pressed={location.mode === "demo"}><MapPinned size={16} strokeWidth={ICON_STROKE} aria-hidden="true" /><span>{t("locationExploreDemo")}</span></button>}
      </div>
      <p className="location-status" role="status">{locationStatusText(locale, location)}</p>
      {["denied", "timeout", "unavailable"].includes(location.gpsStatus) && <div className="start-point-picker" role="group" aria-label={t("startPointPickerTitle")}>
        <p><strong>{t("startPointPickerTitle")}</strong><small>{t("startPointPickerHint")}</small></p>
        <div className="start-point-chips">{START_LANDMARK_IDS.map(id => {
          const place = placeById(id);
          return place ? <button type="button" key={id} aria-pressed={startPlaceId === id} onClick={() => {
            setStartPlaceId(id);
            focusMap([...place.location]);
            showRoutes();
          }}>{place.name[locale]}</button> : null;
        })}</div>
      </div>}
    </>}
  </div>;

  const walkListView = <section className="walk-list" aria-labelledby="walk-list-title">
    <div className="walk-list-head">
      <h2 id="walk-list-title">{t("listTitle")}</h2>
      <Button variant="secondary" onClick={() => setViewMode("map")}><MapIcon size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("listMapView")}</Button>
    </div>
    <p className="sheet-intro">{t(results.fallback ? "routesSearchFallback" : "routesMapChecked")}</p>
    {results.suggestions.length ? results.suggestions.map(({ walk, reason }) => {
      const crowd = sampleWalkCrowd(walk.placeIds);
      return <article key={walk.id} className="walk-list-item" aria-labelledby={`walk-list-${walk.id}`}>
        <div className="walk-list-item-head">
          <h3 id={`walk-list-${walk.id}`}>{walk.name[locale]}<small lang={other}>{walk.name[other]}</small></h3>
          <SaveButton saved={saved.walks.includes(walk.id)} locale={locale} onToggle={() => toggleSavedWalk(walk.id)} />
        </div>
        <p className="sheet-intro">{walk.description[locale]}</p>
        <WalkMeta walk={walk} locale={locale} />
        <div className="route-card-tags">
          <CrowdBadge level={crowd} label={t("crowdSampleLevel", { level: t(crowdKeys[crowd]) })} />
          {reason && <span className="match-tag">{t(reasonKeys[reason])}</span>}
        </div>
        <RewardLine walk={walk} bonus={activeBonus(game, walk.id)} locale={locale} />
        <h4>{t("routesStops")}</h4>
        <ol className="walk-list-stops">{walk.placeIds.map(id => {
          const place = placeById(id);
          return place ? <li key={id}><details>
            <summary><span className="stop-seal" aria-hidden="true" data-collected={collectedPlaces.has(id)}><PlaceSeal placeId={id} size={18} /></span>
              <span><strong>{place.name[locale]}</strong><small lang={other}>{place.name[other]}</small></span></summary>
            <div className="walk-list-place">
              <PlacePhoto placeId={id} locale={locale} />
              <PlaceWalkInfo place={place} walk={walk} origin={placeOrigin} locale={locale} />
              <p>{place.description[locale]}</p>
              <div className="route-note"><strong>{t("routesAccessibility")}</strong><p>{place.accessibilityNotes[locale]}</p></div>
              <div className="route-note"><strong>{t("routesAccessNotes")}</strong><p>{place.accessNotes[locale]}</p></div>
              <PlaceStory placeId={id} locale={locale} unlocked={collectedPlaces.has(id)} />
            </div>
          </details></li> : null;
        })}</ol>
        <div className="route-note"><strong>{t("routesAccessibility")}</strong><p>{walk.accessibilityNotes[locale]}</p></div>
        <div className="route-note"><strong>{t("routesResidentNote")}</strong><p>{walk.residentNotes[locale]}</p></div>
        <div className="walk-list-actions">
          {run ? <Button onClick={() => { setSelectedWalkId(run.walkId); setViewMode("map"); }}>{t("gameResume")}</Button> : <>
            {PREVIEW_CONTROLS && <Button disabled={Boolean(buildingWalkId)} onClick={() => void startWalk(true, walk)}>{t(buildingWalkId === walk.id ? "gameBuildingDemo" : "gameStartDemo")}</Button>}
            <Button disabled={Boolean(buildingWalkId)} variant="secondary" onClick={() => void startWalk(false, walk)}>{t("gameStartLive")}</Button>
          </>}
          <Button variant="secondary" onClick={() => { previewWalk(walk); setViewMode("map"); }}>{t("listShowOnMap")}</Button>
          <a className="handoff-link" href={googleMapsUrl(walk)} target="_blank" rel="noreferrer">{t("openGoogleMaps")}</a>
        </div>
      </article>;
    }) : <div className="route-empty"><p>{t("routesEmpty")}</p><Button variant="secondary" onClick={() => { setQuery(""); setRouteFilter(null); }}>{t("routesShowAll")}</Button></div>}
    <RouteDataCredit locale={locale} />
  </section>;

  return <section className="kyoto-map" aria-label={t("mapCanvasLabel")}>
    <div ref={containerRef} className="kyoto-map-canvas" inert={state !== "ready"} />
    {state !== "ready" && <div className="kyoto-map-status">
      <FoxAvatar state="idle" size={72} />
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
      </div>
      <div className="map-categories" role="group" aria-label={t("mapCategoriesLabel")}>
        {categories.map(({ label, icon: Icon, filter, unavailable }) => unavailable
          ? <button type="button" key={label} className="chip-unavailable" aria-disabled="true" aria-describedby={chipNote === unavailable ? "chip-note" : undefined}
              onClick={() => setChipNote(current => current === unavailable ? null : unavailable)}>
              <Icon size={16} strokeWidth={ICON_STROKE} aria-hidden="true" /><span>{t(label)}</span><Lock size={12} strokeWidth={ICON_STROKE} aria-hidden="true" /></button>
          : <button type="button" key={label} aria-pressed={routeFilter === filter} onClick={() => toggleFilter(filter)}><Icon size={16} strokeWidth={ICON_STROKE} aria-hidden="true" /><span>{t(label)}</span></button>)}
      </div>
      {chipNote && <p id="chip-note" className="chip-note" role="status">
        <span>{t(chipNote)}</span>
        <button type="button" className="icon-button" aria-label={t("close")} onClick={() => setChipNote(null)}><X size={16} strokeWidth={ICON_STROKE} /></button>
      </p>}
      <div className="map-top-row">
      <button type="button" className="reward-pill" onClick={onRewards}
        aria-label={nextVoucher ? t("rewardPillLabel", { points: String(points), target: String(nextVoucher.cost) }) : t("rewardPillAll")}>
        <Ticket size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
        <span>{nextVoucher ? t("rewardPillValue", { points: String(Math.min(points, nextVoucher.cost)), target: String(nextVoucher.cost) }) : t("rewardPillAll")}</span>
        {nextVoucher && <span className="reward-pill-bar" aria-hidden="true"><span style={{ transform: `scaleX(${Math.min(1, points / nextVoucher.cost)})` }} /></span>}
      </button>
      <BonusBanner game={game} locale={locale} />
      </div>
    </div>}
    {/* Side rail (visuals.md E5): labelled 44 px tools, always in the same place. */}
    {listMode && walkListView}
    {!listMode && <div className="map-rail" data-playing={Boolean(playing)} inert={state !== "ready"}>
      {!playing && <button type="button" className="map-rail-button" aria-pressed={false} onClick={() => setViewMode("list")}>
        <span><ListTree size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /></span>{t("railList")}</button>}
      <button type="button" className="map-rail-button" aria-pressed={mapStyle === "standard"}
        aria-label={t("railStyleAria", { next: t(mapStyle === "illustrated" ? "railStyleStandard" : "railStyleIllustrated") })}
        onClick={() => { haptic(); setMapStyle(mapStyle === "illustrated" ? "standard" : "illustrated"); }}>
        <span><Layers size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /></span>{t(mapStyle === "illustrated" ? "railStyleStandard" : "railStyleIllustrated")}</button>
      {!playing && <button type="button" className="map-rail-button" aria-pressed={showCrowd} aria-expanded={showCrowd} onClick={() => { setShowCrowd(value => !value); haptic(); }}>
        <span><Users size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /></span>{t("crowdInfo")}</button>}
      <button type="button" className="map-rail-button" onClick={recenter} disabled={location.mode === "live" && !location.fix}
        aria-label={t(location.mode === "live" ? "mapRecenterLive" : location.mode === "demo" ? "mapRecenterDemo" : "mapRecenterSample")}>
        <span><LocateFixed size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /></span>{t("locationSettingsRecenter")}</button>
      <button type="button" className="map-rail-button" onClick={() => setHelpOpen(true)}>
        <span><CircleHelp size={20} strokeWidth={ICON_STROKE} aria-hidden="true" /></span>{t("railHelp")}</button>
      {showCrowd && !playing && <div className="crowd-legend" role="note">
        {(["calm", "moderate", "busy", "unknown"] as const).map(level => <CrowdBadge key={level} level={level} label={t(crowdKeys[level])} />)}
        <small>{t("crowdProvenance")}</small>
      </div>}
    </div>}
    {playing && <div className="map-follow-hud">
      <div className="walk-hud" role="group" aria-label={t("hudLabel")}>
        {(() => { const Icon = themeIcons[walkById(run.walkId)!.theme]; return <Icon size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />; })()}
        <span className="walk-hud-text"><strong>{walkById(run.walkId)!.name[locale]}</strong>
          <small>{t("followStop", { current: String(Math.min(run.stamps.length + 1, walkById(run.walkId)!.placeIds.length)), total: String(walkById(run.walkId)!.placeIds.length) })}</small></span>
        <StopBeads total={walkById(run.walkId)!.placeIds.length} done={run.stamps.length}
          label={t("hudBeads", { stamps: String(run.stamps.length), total: String(walkById(run.walkId)!.placeIds.length) })} />
      </div>
      <BonusBanner game={game} locale={locale} />
    </div>}

    {!listMode && <div className="sheet-layer">
      {playing ? <WalkControls key={`${run.id}-${run.stamps.length}-${location.mode}`} game={game} run={run} locale={locale} location={location}
        onPosition={updateDemoMarker} onComplete={() => { setFinishedWalkId(run.walkId); setCelebrationRunId(run.id); setSelectedWalkId(null); setView("routes"); setSnap("peek"); }}
        onExit={() => setConfirmStop(run.id)} onResumeGps={requestLiveLocation} onPauseGps={pauseLiveLocation} />
        : <SnapSheet snap={snap} onSnap={setSnap} header={sheetHeader}
          labels={{ expand: t("sheetExpand"), collapse: t("sheetCollapse"), region: t("sheetRegion") }}>
          {view === "routes" && <div className="sheet-section">
            <h2 className="sheet-title">{t("routesTitle")}</h2>
            {results.suggestions.length ? <div className="route-carousel">
              {results.suggestions.slice(0, 3).map(({ walk, reason }) => <RouteCard key={walk.id} walk={walk} locale={locale} reason={reason} bonus={activeBonus(game, walk.id)} saved={saved.walks.includes(walk.id)} onToggleSave={() => toggleSavedWalk(walk.id)} onPreview={() => previewWalk(walk)} />)}
            </div> : <div className="route-empty"><p>{t("routesEmpty")}</p><Button variant="secondary" onClick={() => { setQuery(""); setRouteFilter(null); }}>{t("routesShowAll")}</Button></div>}
            <p className="sheet-intro">{t(results.fallback ? "routesSearchFallback" : "routesMapChecked")}</p>
            <RouteDataCredit locale={locale} />
          </div>}
          {view === "walk" && selectedWalk && <div className="sheet-section">
            <div className="sheet-top-bar">
              <button type="button" className="sheet-back" onClick={showRoutes}><ArrowLeft size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("routesBack")}</button>
              <SaveButton saved={saved.walks.includes(selectedWalk.id)} locale={locale} onToggle={() => toggleSavedWalk(selectedWalk.id)} />
            </div>
            <h2 className="sheet-title">{selectedWalk.name[locale]}<small lang={other}>{selectedWalk.name[other]}</small></h2>
            <p className="sheet-intro">{selectedWalk.description[locale]}</p>
            <WalkMeta walk={selectedWalk} locale={locale} />
            <RewardLine walk={selectedWalk} bonus={activeBonus(game, selectedWalk.id)} locale={locale} />
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
                {PREVIEW_CONTROLS && <Button disabled={state !== "ready" || Boolean(buildingWalkId)} onClick={() => void startWalk(true)}>{t(buildingWalkId && buildingWalkId === selectedWalkId ? "gameBuildingDemo" : "gameStartDemo")}</Button>}
                <Button disabled={state !== "ready" || Boolean(buildingWalkId)} variant="secondary" onClick={() => void startWalk(false)}>{t("gameStartLive")}</Button>
              </>}
              <a className="handoff-link" href={googleMapsUrl(selectedWalk)} target="_blank" rel="noreferrer">{t("openGoogleMaps")}</a>
            </div>
          </div>}
          {view === "place" && focusedPlace && <div className="sheet-section">
            <div className="sheet-top-bar">
              <button type="button" className="sheet-back" onClick={backFromPlace}><ArrowLeft size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t(selectedWalk ? "routesDetails" : "routesBack")}</button>
              <SaveButton saved={saved.places.includes(focusedPlace.id)} locale={locale} onToggle={() => toggleSavedPlace(focusedPlace.id)} />
            </div>
            <PlacePhoto placeId={focusedPlace.id} locale={locale} />
            <h2 className="sheet-title">{focusedPlace.name[locale]}<small lang={other}>{focusedPlace.name[other]}</small></h2>
            <PlaceWalkInfo place={focusedPlace} walk={selectedWalk} origin={placeOrigin} locale={locale} />
            <p className="sheet-intro">{focusedPlace.description[locale]}</p>
            <PlaceStory placeId={focusedPlace.id} locale={locale} unlocked={collectedPlaces.has(focusedPlace.id)} />
            <div className="route-note"><strong>{t("routesAccessibility")}</strong><p>{focusedPlace.accessibilityNotes[locale]}</p></div>
            <div className="route-note"><strong>{t("routesAccessNotes")}</strong><p>{focusedPlace.accessNotes[locale]}</p></div>
            <p className="route-community-status">{t("routesCommunityNotConsulted")}</p>
            <a className="route-place-source" href={focusedPlace.osmFeatureUrl} target="_blank" rel="noreferrer">{t("placeMapSource")}</a>
            <RouteDataCredit locale={locale} />
          </div>}
        </SnapSheet>}
    </div>}

    {celebrationRun && <Celebration game={game} run={celebrationRun} locale={locale}
      onClose={() => setCelebrationRunId(null)}
      onStampBook={() => { setCelebrationRunId(null); onStampBook(); }}
      onRewards={() => { setCelebrationRunId(null); onRewards(); }} />}

    <HelpSheet open={helpOpen} locale={locale} onClose={() => setHelpOpen(false)} />

    <ConfirmDialog open={confirmStop !== null} title={t("gameStopWalk")} closeLabel={t("close")} onClose={() => setConfirmStop(null)}>
      <p>{t("gameStopHint")}</p>
      <div className="dialog-actions"><Button variant="secondary" onClick={() => setConfirmStop(null)}>{t("gameCancel")}</Button>
        <Button onClick={async () => { if (confirmStop) await act({ type: "stop", runId: confirmStop }); setConfirmStop(null); }}>{t("gameStopWalk")}</Button></div>
    </ConfirmDialog>
  </section>;
}
