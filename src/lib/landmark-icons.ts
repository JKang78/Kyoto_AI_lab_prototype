import type { LandmarkIconId } from "../data/kyoto-landmarks.ts";

const MEDALLION_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="80" height="80">' +
  '<circle cx="20" cy="20" r="18" fill="#faf8f4" stroke="#782459" stroke-width="2"/>' +
  '<circle cx="20" cy="20" r="15.5" fill="none" stroke="#c69c4d" stroke-width="0.9" stroke-opacity="0.55"/>';

const MEDALLION_CLOSE = "</svg>";

/**
 * Multi-tone Kyoto Ink & Washi SVG medallions for the `?landmarkUi=svg` prototype
 * and as an automatic fallback when pixel-art PNGs are unavailable.
 */
export const LANDMARK_ICON_SVGS: Readonly<Record<LandmarkIconId, string>> = {
  castle:
    MEDALLION_OPEN +
    '<path d="M10 30h20l-2-5H12z" fill="#a8a29e" stroke="#1c1917" stroke-width="1.3" stroke-linejoin="round"/>' +
    '<rect x="13" y="20" width="14" height="5" fill="#ffffff" stroke="#1c1917" stroke-width="1.3"/>' +
    '<path d="M10 20l10-3 10 3z" fill="#44403c" stroke="#1c1917" stroke-width="1.2" stroke-linejoin="round"/>' +
    '<rect x="15" y="14" width="10" height="4" fill="#ffffff" stroke="#1c1917" stroke-width="1.3"/>' +
    '<path d="M12 14l8-3.5L28 14z" fill="#44403c" stroke="#1c1917" stroke-width="1.2" stroke-linejoin="round"/>' +
    '<circle cx="16" cy="9.5" r="1.2" fill="#c69c4d"/><circle cx="24" cy="9.5" r="1.2" fill="#c69c4d"/>' +
    MEDALLION_CLOSE,

  "temple-stage":
    MEDALLION_OPEN +
    '<path d="M10 28c4-3 16-3 20 0" stroke="#5d7a3e" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M13 21v7M17 21v7M23 21v7M27 21v7M12 24h16" stroke="#7c4f2b" stroke-width="1.4" stroke-linecap="round"/>' +
    '<rect x="11" y="18.5" width="18" height="2.5" fill="#c83e37" stroke="#1c1917" stroke-width="1.1"/>' +
    '<rect x="14" y="14.5" width="12" height="4" fill="#ffffff" stroke="#1c1917" stroke-width="1.2"/>' +
    '<path d="M10 15l10-5 10 5z" fill="#44403c" stroke="#1c1917" stroke-width="1.3" stroke-linejoin="round"/>' +
    MEDALLION_CLOSE,

  "golden-pavilion":
    MEDALLION_OPEN +
    '<path d="M10 29h20" stroke="#3d5f86" stroke-width="2.5" stroke-linecap="round"/>' +
    '<rect x="13" y="22" width="14" height="5" fill="#ffffff" stroke="#1c1917" stroke-width="1.2"/>' +
    '<path d="M11 22l9-2.5 9 2.5z" fill="#44403c"/>' +
    '<rect x="14" y="16" width="12" height="4.5" fill="#d4a648" stroke="#1c1917" stroke-width="1.2"/>' +
    '<path d="M12 16l8-2.5 8 2.5z" fill="#44403c"/>' +
    '<rect x="16" y="11.5" width="8" height="3" fill="#d4a648" stroke="#1c1917" stroke-width="1.1"/>' +
    '<path d="M14 11.5L20 8.5l6 3z" fill="#44403c"/>' +
    '<circle cx="20" cy="7.5" r="1.4" fill="#c69c4d"/>' +
    MEDALLION_CLOSE,

  "torii-tunnel":
    MEDALLION_OPEN +
    '<path d="M15 29v-9M25 29v-9M13 20h14" stroke="#982823" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M13 29V14M27 29V14M11 17h18" stroke="#c83e37" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M9.5 13c3.5 1.2 17.5 1.2 21 0" stroke="#1c1917" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M10.5 14.4c3.2 1 15.8 1 19 0" stroke="#c83e37" stroke-width="1.8" stroke-linecap="round"/>' +
    '<rect x="18.8" y="14.5" width="2.4" height="2.6" fill="#c69c4d"/>' +
    MEDALLION_CLOSE,

  "imperial-palace":
    MEDALLION_OPEN +
    '<rect x="9" y="21" width="22" height="7" fill="#ffffff" stroke="#1c1917" stroke-width="1.2"/>' +
    '<rect x="15" y="18" width="10" height="10" fill="#7c4f2b" stroke="#1c1917" stroke-width="1.2"/>' +
    '<path d="M9 18l11-6 11 6z" fill="#44403c" stroke="#1c1917" stroke-width="1.3" stroke-linejoin="round"/>' +
    '<path d="M15 12h10" stroke="#c69c4d" stroke-width="1.8" stroke-linecap="round"/>' +
    MEDALLION_CLOSE,

  "grand-torii":
    MEDALLION_OPEN +
    '<path d="M13.5 14v15M26.5 14v15" stroke="#c83e37" stroke-width="2.6" stroke-linecap="round"/>' +
    '<path d="M10.5 18h19" stroke="#c83e37" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M8.5 12.5c4 1.4 19 1.4 23 0" stroke="#1c1917" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M9.5 14c3.5 1.1 17.5 1.1 21 0" stroke="#c83e37" stroke-width="2" stroke-linecap="round"/>' +
    '<rect x="18.5" y="14.5" width="3" height="3.2" fill="#c69c4d"/>' +
    MEDALLION_CLOSE,

  "tower-gate":
    MEDALLION_OPEN +
    '<rect x="12" y="21" width="16" height="8" fill="#c83e37" stroke="#1c1917" stroke-width="1.2"/>' +
    '<rect x="17" y="23" width="6" height="6" fill="#1c1917"/>' +
    '<path d="M9.5 21L20 17.5 30.5 21z" fill="#44403c" stroke="#1c1917" stroke-width="1.2"/>' +
    '<rect x="14" y="14" width="12" height="4" fill="#c83e37" stroke="#1c1917" stroke-width="1.2"/>' +
    '<path d="M11 14l9-4.5 9 4.5z" fill="#44403c" stroke="#1c1917" stroke-width="1.2" stroke-linejoin="round"/>' +
    MEDALLION_CLOSE,

  "bridge-moon":
    MEDALLION_OPEN +
    '<path d="M9 22c3-5 7-7 11-7 3 0 6 2 8 7z" fill="#5d7a3e"/>' +
    '<circle cx="26.5" cy="12" r="2.6" fill="#c69c4d"/>' +
    '<path d="M9 27c2.5-1.2 5 1.2 7.5 0s5 1.2 7.5 0 5 1.2 7 0" stroke="#3d5f86" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<path d="M8 22h24M12 22v5M17.5 22v5M22.5 22v5M28 22v5" stroke="#7c4f2b" stroke-width="1.8" stroke-linecap="round"/>' +
    MEDALLION_CLOSE,

  tower:
    MEDALLION_OPEN +
    '<rect x="11" y="25" width="18" height="4" fill="#a8a29e" stroke="#1c1917" stroke-width="1.2"/>' +
    '<rect x="17" y="22.5" width="6" height="2.5" fill="#c83e37"/>' +
    '<rect x="18" y="15" width="4" height="7.5" fill="#ffffff" stroke="#1c1917" stroke-width="1.2"/>' +
    '<rect x="16" y="12.5" width="8" height="3" rx="1" fill="#ffffff" stroke="#1c1917" stroke-width="1.2"/>' +
    '<path d="M20 7.5v5" stroke="#1c1917" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="20" cy="7.5" r="1.2" fill="#c83e37"/>' +
    MEDALLION_CLOSE,

  pagoda:
    MEDALLION_OPEN +
    '<path d="M20 7v4" stroke="#c69c4d" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M15 11h10M14 15h12M13 19h14M12 23h16M11 27h18" stroke="#44403c" stroke-width="2.1" stroke-linecap="round"/>' +
    '<rect x="16.5" y="11.5" width="7" height="15.5" fill="#7c4f2b" stroke="#1c1917" stroke-width="1"/>' +
    '<path d="M11 29h18" stroke="#1c1917" stroke-width="1.4" stroke-linecap="round"/>' +
    MEDALLION_CLOSE,

  "silver-pavilion":
    MEDALLION_OPEN +
    '<path d="M24 27l3-6 3 6z" fill="#e7e5e4" stroke="#1c1917" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<rect x="11" y="21" width="12" height="6" fill="#7c4f2b" stroke="#1c1917" stroke-width="1.2"/>' +
    '<path d="M9.5 21L17 18l7.5 3z" fill="#44403c"/>' +
    '<rect x="12.5" y="15" width="9" height="3.5" fill="#ffffff" stroke="#1c1917" stroke-width="1.1"/>' +
    '<path d="M10.5 15L17 11.5 23.5 15z" fill="#44403c"/>' +
    '<circle cx="17" cy="10.5" r="1.2" fill="#c69c4d"/>' +
    MEDALLION_CLOSE,

  "sanmon-gate":
    MEDALLION_OPEN +
    '<rect x="11" y="20" width="18" height="9" fill="#7c4f2b" stroke="#1c1917" stroke-width="1.2"/>' +
    '<rect x="17.5" y="22.5" width="5" height="6.5" fill="#1c1917"/>' +
    '<path d="M9 20l11-3 11 3z" fill="#44403c" stroke="#1c1917" stroke-width="1.2"/>' +
    '<rect x="13" y="13.5" width="14" height="4" fill="#ffffff" stroke="#1c1917" stroke-width="1.2"/>' +
    '<path d="M10 13.5L20 9l10 4.5z" fill="#44403c" stroke="#1c1917" stroke-width="1.2" stroke-linejoin="round"/>' +
    MEDALLION_CLOSE,

  "forest-shrine":
    MEDALLION_OPEN +
    '<circle cx="11.5" cy="19" r="4" fill="#5d7a3e"/><circle cx="28.5" cy="19" r="4" fill="#5d7a3e"/>' +
    '<path d="M11.5 23v6M28.5 23v6" stroke="#7c4f2b" stroke-width="1.6"/>' +
    '<rect x="14.5" y="19" width="11" height="10" fill="#c83e37" stroke="#1c1917" stroke-width="1.2"/>' +
    '<rect x="18" y="23" width="4" height="6" fill="#1c1917"/>' +
    '<path d="M12.5 19l7.5-4 7.5 4z" fill="#44403c" stroke="#1c1917" stroke-width="1.2"/>' +
    '<path d="M13.5 14l6.5-3.5 6.5 3.5z" fill="#44403c"/>' +
    MEDALLION_CLOSE,

  "market-lantern":
    MEDALLION_OPEN +
    '<rect x="10" y="10" width="20" height="4" rx="1" fill="#c83e37" stroke="#1c1917" stroke-width="1.2"/>' +
    '<path d="M14 10v4M20 10v4M26 10v4" stroke="#c69c4d" stroke-width="1.8"/>' +
    '<ellipse cx="20" cy="21" rx="5.5" ry="6.5" fill="#c83e37" stroke="#1c1917" stroke-width="1.3"/>' +
    '<ellipse cx="20" cy="21" rx="3.2" ry="4.5" fill="#d4a648"/>' +
    '<path d="M17 15h6M17 27h6M20 14v1M20 27.5v2.5" stroke="#1c1917" stroke-width="1.4" stroke-linecap="round"/>' +
    MEDALLION_CLOSE,

  "temple-hall":
    MEDALLION_OPEN +
    '<rect x="10" y="20" width="16" height="8" fill="#ffffff" stroke="#1c1917" stroke-width="1.2"/>' +
    '<rect x="16" y="22" width="4" height="6" fill="#7c4f2b"/>' +
    '<path d="M8.5 20L18 13l9.5 7z" fill="#44403c" stroke="#1c1917" stroke-width="1.3" stroke-linejoin="round"/>' +
    '<circle cx="28" cy="19" r="3.8" fill="#d4a648" stroke="#1c1917" stroke-width="1.1"/>' +
    '<path d="M28 22.8V28" stroke="#7c4f2b" stroke-width="1.6"/>' +
    MEDALLION_CLOSE,
};

export function landmarkSvgDataUrl(iconId: LandmarkIconId): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LANDMARK_ICON_SVGS[iconId])}`;
}

export function landmarkImageId(iconId: LandmarkIconId): string {
  return `landmark-${iconId}`;
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Registers all Kyoto Ink & Washi SVG landmark medallions into a MapLibre map instance.
 */
export async function loadLandmarkMapImages(
  map: { hasImage(id: string): boolean; addImage(id: string, image: HTMLImageElement, options?: { pixelRatio?: number }): void },
  iconIds: readonly LandmarkIconId[],
): Promise<void> {
  const unique = [...new Set(iconIds)];
  await Promise.all(
    unique.map(async (iconId) => {
      const id = landmarkImageId(iconId);
      if (map.hasImage(id)) return;
      try {
        const svgImg = await loadHtmlImage(landmarkSvgDataUrl(iconId));
        if (!map.hasImage(id)) map.addImage(id, svgImg, { pixelRatio: 2 });
      } catch {
        // Ignore individual image failures so the map stays resilient.
      }
    }),
  );
}
