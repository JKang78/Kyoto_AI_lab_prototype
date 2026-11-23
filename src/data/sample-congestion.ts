/**
 * Illustrative demo cues only: no source, no observation time, never live.
 * Positions come from curated place coordinates.
 */
export type CrowdLevel = "calm" | "moderate" | "busy" | "unknown";
export type SampleCongestionCue = Readonly<{
  id: string;
  placeId: string;
  level: Exclude<CrowdLevel, "calm" | "unknown">;
  /** Provenance type. Only demo samples exist until an authorised source is integrated. */
  kind: "demo_sample";
  observedAt: null;
}>;

export const SAMPLE_CONGESTION_CUES = [
  { id: "shijo-bridge-sample", placeId: "shijo-ohashi", level: "busy", kind: "demo_sample", observedAt: null },
  { id: "yasaka-approach-sample", placeId: "yasaka-west-view", level: "moderate", kind: "demo_sample", observedAt: null },
] as const satisfies readonly SampleCongestionCue[];

const rank: Record<CrowdLevel, number> = { unknown: -1, calm: 0, moderate: 1, busy: 2 };
/** The busiest sample cue on any stop of a walk. With no data the level is unknown, never calm. */
export function sampleWalkCrowd(placeIds: readonly string[]): CrowdLevel {
  return SAMPLE_CONGESTION_CUES.filter(cue => placeIds.includes(cue.placeId))
    .reduce<CrowdLevel>((level, cue) => rank[cue.level] > rank[level] ? cue.level : level, "unknown");
}
