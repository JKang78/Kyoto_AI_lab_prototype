import type { Map as MapLibreMap } from "maplibre-gl";
import type { MapPrefs } from "@/lib/map-prefs";

/**
 * Helpers for the personal map look (src/lib/map-prefs.ts). Pure where possible so they can be unit-tested
 * without a browser. Layer names come from the OpenFreeMap "liberty" style; landmark classes are an assumption
 * that must be checked against the live style (see docs/visuals.md, map personalisation).
 */

export type SeasonName = "momiji" | "sakura" | "sparkle";

/** Park fill for the seasonal colours. Neutral months keep the Illustrated park colour. */
export const ILLUSTRATED_PARK = "#dde4cf";
export const SEASON_PARK: Readonly<Record<SeasonName, string | null>> = {
  sakura: "#efdbe0",
  momiji: "#e6cc9c",
  sparkle: null,
};

export const LARGER_LABEL_FACTOR = 1.25;

/** OpenMapTiles point-of-interest classes that count as landmarks for culture walks. */
export const LANDMARK_CLASSES = ["place_of_worship", "museum", "castle", "monument", "viewpoint"] as const;

type Expression = unknown[];

/**
 * Scales a MapLibre `text-size` value. Handles plain numbers and the common `interpolate` / `step` zoom
 * expressions; anything else is returned unchanged so labels never break.
 */
export function scaleTextSize(value: unknown, factor: number): unknown {
  if (typeof value === "number") return value * factor;
  if (!Array.isArray(value)) return value;
  const expression = value as Expression;
  const [operator] = expression;
  if (operator === "interpolate") {
    // ["interpolate", interpolation, input, stop, output, stop, output, ...]: outputs sit at even indices from 4.
    return expression.map((item, index) => (index >= 4 && index % 2 === 0 ? scaleTextSize(item, factor) : item));
  }
  if (operator === "step") {
    // ["step", input, base, stop, output, ...]: base is index 2, outputs at even indices from 4.
    return expression.map((item, index) => (index === 2 || (index >= 4 && index % 2 === 0) ? scaleTextSize(item, factor) : item));
  }
  return value;
}

export function seasonParkColour(season: SeasonName, enabled: boolean): string {
  if (!enabled) return ILLUSTRATED_PARK;
  return SEASON_PARK[season] ?? ILLUSTRATED_PARK;
}

/** Keeps the layer's own filter and adds the landmark classes. A missing original filter means "everything". */
export function landmarkFilter(originalFilter: unknown): unknown[] {
  const landmarks = ["in", ["get", "class"], ["literal", [...LANDMARK_CLASSES]]];
  return originalFilter ? ["all", originalFilter, landmarks] : ["all", ["has", "class"], landmarks];
}

/** Symbol layers whose text the landmark option keeps: points of interest and places. Other labels are hidden. */
export function keepsLandmarkLabels(sourceLayer: string | undefined): boolean {
  return sourceLayer === "poi" || sourceLayer === "place";
}

export type SymbolOriginal = { sourceLayer: string | undefined; textSize: unknown; filter: unknown; visibility: unknown };

/** Records each symbol layer's original settings once, so every preference can be reversed exactly. */
export function captureSymbolOriginals(map: MapLibreMap): Map<string, SymbolOriginal> {
  const originals = new Map<string, SymbolOriginal>();
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type !== "symbol") continue;
    originals.set(layer.id, {
      sourceLayer: (layer as { "source-layer"?: string })["source-layer"],
      textSize: map.getLayoutProperty(layer.id, "text-size"),
      filter: map.getFilter(layer.id),
      visibility: map.getLayoutProperty(layer.id, "visibility") ?? "visible",
    });
  }
  return originals;
}

export type MapLookContext = { season: SeasonName; pixelLook: boolean; mapStyle: "illustrated" | "standard" };

/** Applies the personal look on top of the current style. Writes only changed values, so it is safe to repeat. */
export function applyMapPrefs(map: MapLibreMap, prefs: MapPrefs, originals: Map<string, SymbolOriginal>, context: MapLookContext) {
  for (const [id, original] of originals) {
    if (!map.getLayer(id)) continue;
    const textSize = prefs.largerLabels ? scaleTextSize(original.textSize, LARGER_LABEL_FACTOR) : original.textSize;
    if (textSize !== undefined && map.getLayoutProperty(id, "text-size") !== textSize) map.setLayoutProperty(id, "text-size", textSize as never);

    if (prefs.landmarkLabelsOnly) {
      const keep = keepsLandmarkLabels(original.sourceLayer);
      const filter = keep ? landmarkFilter(original.filter) : original.filter;
      if (JSON.stringify(map.getFilter(id)) !== JSON.stringify(filter)) map.setFilter(id, (filter ?? null) as never);
      const visibility = keep ? "visible" : "none";
      if (map.getLayoutProperty(id, "visibility") !== visibility) map.setLayoutProperty(id, "visibility", visibility);
    } else {
      if (JSON.stringify(map.getFilter(id)) !== JSON.stringify(original.filter)) map.setFilter(id, (original.filter ?? null) as never);
      if (map.getLayoutProperty(id, "visibility") !== original.visibility) map.setLayoutProperty(id, "visibility", original.visibility as never);
    }
  }

  // Seasonal colour only applies to the Illustrated look; the pixel look owns its own park fill.
  if (context.mapStyle === "illustrated" && !context.pixelLook && map.getLayer("park")) {
    const park = seasonParkColour(context.season, prefs.seasonalColours);
    if (map.getPaintProperty("park", "fill-color") !== park) map.setPaintProperty("park", "fill-color", park);
  }

  // Flat map: no tilt, no rotation. Turning it off restores the defaults the map was created with.
  if (prefs.flatMap) {
    map.setMaxPitch(0);
    map.setPitch(0);
    map.setBearing(0);
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.touchPitch.disable();
  } else {
    map.setMaxPitch(60);
    map.dragRotate.enable();
    map.touchZoomRotate.enableRotation();
    map.touchPitch.enable();
  }
}
