/**
 * EXPERIMENT (uncommitted): a pixel-texture variant of the Illustrated map look.
 * Enabled only with `?look=pixel` in preview/dev builds (see kyoto-map.tsx). It recolours the
 * base style to the washi palette and adds 16 × 16 pixel patterns to parks, water and the paper
 * background. Routes, pins, labels and the fox are untouched.
 */
import type { Map as MapLibreMap } from "maplibre-gl";

type RGBA = readonly [number, number, number];
type Pixel = readonly [x: number, y: number, color: RGBA];

const TILE = 16;

function makeTile(base: RGBA | null, pixels: readonly Pixel[]) {
  const data = new Uint8ClampedArray(TILE * TILE * 4);
  if (base) for (let i = 0; i < data.length; i += 4) { data[i] = base[0]; data[i + 1] = base[1]; data[i + 2] = base[2]; data[i + 3] = 255; }
  for (const [x, y, [r, g, b]] of pixels) {
    const i = (y * TILE + x) * 4;
    data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
  }
  return { width: TILE, height: TILE, data };
}

// Pattern tiles replace the fill colour, so each tile carries its own base colour (kept in step with PIXEL_PAINTS).
const PARK_BASE: RGBA = [0xc2, 0xcf, 0xa6];
const WATER_BASE: RGBA = [0x93, 0xb2, 0xc9];
const SAGE_DOT: RGBA = [0x8f, 0xa5, 0x7a];
const WATER_RIPPLE: RGBA = [0xd2, 0xe2, 0xee];
const PAPER_GRAIN: RGBA = [0xd6, 0xc7, 0xad];

const PATTERNS: Record<string, { base: RGBA | null; pixels: readonly Pixel[] }> = {
  "pixel-park": {
    base: PARK_BASE,
    pixels: [
      [2, 2, SAGE_DOT], [3, 2, SAGE_DOT], [10, 6, SAGE_DOT], [11, 6, SAGE_DOT],
      [6, 11, SAGE_DOT], [7, 11, SAGE_DOT], [14, 13, SAGE_DOT], [14, 14, SAGE_DOT],
    ],
  },
  "pixel-water": {
    base: WATER_BASE,
    pixels: [
      [1, 4, WATER_RIPPLE], [2, 4, WATER_RIPPLE], [3, 4, WATER_RIPPLE], [9, 4, WATER_RIPPLE], [10, 4, WATER_RIPPLE], [11, 4, WATER_RIPPLE],
      [5, 11, WATER_RIPPLE], [6, 11, WATER_RIPPLE], [7, 11, WATER_RIPPLE], [13, 11, WATER_RIPPLE], [14, 11, WATER_RIPPLE], [15, 11, WATER_RIPPLE],
    ],
  },
  "pixel-paper": {
    base: null,
    pixels: [[4, 3, PAPER_GRAIN], [5, 3, PAPER_GRAIN], [4, 4, PAPER_GRAIN], [12, 1, PAPER_GRAIN], [13, 1, PAPER_GRAIN], [8, 8, PAPER_GRAIN], [9, 8, PAPER_GRAIN], [1, 12, PAPER_GRAIN], [2, 12, PAPER_GRAIN], [13, 10, PAPER_GRAIN], [14, 10, PAPER_GRAIN]],
  },
};

/** Paint values for the pixel look. Only layers the OpenFreeMap liberty style already has. */
const PIXEL_PAINTS: readonly (readonly [layer: string, property: string, value: string])[] = [
    ["background", "background-color", "#efe4d2"],
    ["background", "background-pattern", "pixel-paper"],
    ["water", "fill-color", "#93b2c9"],
    ["water", "fill-pattern", "pixel-water"],
    ["park", "fill-color", "#c2cfa6"],
    ["park", "fill-pattern", "pixel-park"],
    ["landuse_residential", "fill-color", "#f4f0e8"],
    ["building", "fill-color", "#e2d5bf"],
    ["building", "fill-outline-color", "#b9aa92"],
  ];

const PATTERN_PAINT_PROPERTIES = ["background-pattern", "fill-pattern"] as const;

/**
 * Adds the pixel patterns once, then applies the palette. Idempotent: it only writes properties that differ,
 * so calling it from `idle` can't cause a repaint loop.
 */
export function applyPixelLook(map: MapLibreMap) {
  for (const [id, { base, pixels }] of Object.entries(PATTERNS)) {
    if (!map.hasImage(id)) map.addImage(id, makeTile(base, pixels));
  }
  for (const [layer, property, value] of PIXEL_PAINTS) {
    if (!map.getLayer(layer)) continue;
    if (map.getPaintProperty(layer, property as never) !== value) map.setPaintProperty(layer, property as never, value as never);
  }
}

/** Removes the pattern paints so the Standard look shows the provider's own colours and textures. */
export function clearPixelPatterns(map: MapLibreMap) {
  for (const layer of ["background", "water", "park"]) {
    if (!map.getLayer(layer)) continue;
    for (const property of PATTERN_PAINT_PROPERTIES) {
      if (map.getPaintProperty(layer, property as never) !== undefined) map.setPaintProperty(layer, property as never, null as never);
    }
  }
}

/** The look is requested with `?look=pixel`. Read on the client only; a dev or preview build must opt in. */
export function pixelLookRequested(search: string, previewControls: boolean) {
  return previewControls && new URLSearchParams(search).get("look") === "pixel";
}
