import { translate, type Locale, type MessageKey } from "@/lib/i18n";

export type LocationMode = "unselected" | "live" | "demo";
export type GpsStatus = "off" | "requesting" | "active" | "lowAccuracy" | "outsideKyoto" | "denied" | "timeout" | "unavailable" | "paused";
export type LocationFix = { latitude: number; longitude: number; timestamp: number; accuracy: number };
export type LocationState = { mode: LocationMode; gpsStatus: GpsStatus; fix: LocationFix | null };

export const INITIAL_LOCATION_STATE: LocationState = { mode: "unselected", gpsStatus: "off", fix: null };
export const DEMO_POSITION: [number, number] = [135.7662, 35.0003];
export const MAX_WALKING_ACCURACY_METERS = 100;

// A broad prototype demo area, not an administrative boundary or geofence.
export function isInKyotoDemoArea(fix: LocationFix): boolean {
  return fix.latitude >= 34.93 && fix.latitude <= 35.12 && fix.longitude >= 135.67 && fix.longitude <= 135.84;
}

export function classifyFix(fix: LocationFix): GpsStatus {
  if (fix.accuracy > MAX_WALKING_ACCURACY_METERS) return "lowAccuracy";
  return isInKyotoDemoArea(fix) ? "active" : "outsideKyoto";
}

export function locationModeText(locale: Locale, mode: LocationMode): string {
  const key: Record<LocationMode, MessageKey> = { unselected: "locationModeUnselected", live: "locationModeLive", demo: "locationModeDemo" };
  return translate(locale, key[mode]);
}

export function locationStatusText(locale: Locale, location: LocationState): string {
  if (location.mode === "demo") return translate(locale, "locationStatusDemo");
  if (location.mode === "unselected") return translate(locale, "locationStatusOff");
  if (location.gpsStatus === "lowAccuracy" && location.fix && !isInKyotoDemoArea(location.fix)) {
    return translate(locale, "locationStatusLowAccuracyOutside", { accuracy: String(Math.round(location.fix.accuracy)) });
  }
  const key: Record<GpsStatus, MessageKey> = {
    off: "locationStatusOff", requesting: "locationStatusRequesting", active: "locationStatusActive",
    lowAccuracy: "locationStatusLowAccuracy", outsideKyoto: "locationStatusOutsideKyoto",
    denied: "locationStatusDenied", timeout: "locationStatusTimeout",
    unavailable: "locationStatusUnavailable", paused: "locationStatusPaused",
  };
  return translate(locale, key[location.gpsStatus], { accuracy: String(Math.round(location.fix?.accuracy ?? 0)) });
}
