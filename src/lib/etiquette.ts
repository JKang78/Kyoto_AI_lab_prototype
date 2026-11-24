import { CURATED_PLACES } from "../data/kyoto-walks.ts";
import type { LngLat, LocalizedText } from "../types/routes";

/**
 * Example etiquette zones for the demo (design_system §6.1, PRODUCT_REQUIREMENTS FR-17).
 * Each message restates the resident note already stored on its walk; none is an official
 * designation. Shown as a non-blocking toast at most once per zone per Kyoto day.
 */
export type EtiquetteZone = Readonly<{ id: string; placeId: string; radiusMeters: number; message: LocalizedText }>;

export const ETIQUETTE_ZONES: readonly EtiquetteZone[] = [
  {
    id: "yasaka-gate", placeId: "yasaka-west-view", radiusMeters: 90,
    message: {
      en: "Shrine gate ahead: keep the Shijō corridor clear and don't block shop entrances or the gate.",
      ja: "この先は神社の門です。四条通の通行を妨げず、店舗の入口や門の前を塞がないでください。",
    },
  },
  {
    id: "maruyama-paths", placeId: "maruyama-cherry-path", radiusMeters: 110,
    message: {
      en: "Park and shrine paths ahead: stay on open paths, keep voices low, and leave room for worship and park work.",
      ja: "この先は公園と境内の道です。開放された道を歩き、静かに過ごし、参拝や公園の作業を妨げないでください。",
    },
  },
  {
    id: "kawabata-sidewalk", placeId: "kawabata-riverside", radiusMeters: 90,
    message: {
      en: "Riverside sidewalk: leave space for residents, commuters and cyclists.",
      ja: "川沿いの歩道です。住民、通勤者、自転車の通行スペースを空けてください。",
    },
  },
];

function distanceMeters([lng, lat]: LngLat, [lng2, lat2]: LngLat) {
  const rad = Math.PI / 180;
  const a = Math.sin((lat - lat2) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(lat2 * rad) * Math.sin((lng - lng2) * rad / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(a));
}

/** The first zone whose stop lies within its radius of the given point, if any. */
export function etiquetteZoneAt(point: LngLat | null, zones: readonly EtiquetteZone[] = ETIQUETTE_ZONES) {
  if (!point) return undefined;
  return zones.find(zone => {
    const place = CURATED_PLACES.find(item => item.id === zone.placeId);
    return place ? distanceMeters(point, place.location) <= zone.radiusMeters : false;
  });
}

/** Calendar day in Kyoto (YYYY-MM-DD), independent of the device time zone. */
export function kyotoDay(timestamp: number) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(timestamp);
}

export type EtiquetteSeen = Record<string, string>;
export const shouldShowEtiquette = (zoneId: string, seen: EtiquetteSeen, today: string) => seen[zoneId] !== today;

const STORAGE_KEY = "kyoto-flow.etiquette.v1";
export function readEtiquetteSeen(): EtiquetteSeen {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value as EtiquetteSeen : {};
  } catch { return {}; }
}
export function markEtiquetteSeen(zoneId: string, today: string) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readEtiquetteSeen(), [zoneId]: today })); }
  catch { /* Private mode: the toast may repeat, which is harmless. */ }
}
