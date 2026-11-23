/** Illustrative UI cues only. Positions come from curated place coordinates. */
export type CrowdLevel = "calm" | "moderate" | "busy";
export type SampleCongestionCue = Readonly<{
  id: string;
  placeId: string;
  level: Exclude<CrowdLevel, "calm">;
  sampleOnly: true;
}>;

export const SAMPLE_CONGESTION_CUES = [
  { id: "shijo-bridge-sample", placeId: "shijo-ohashi", level: "busy", sampleOnly: true },
  { id: "yasaka-approach-sample", placeId: "yasaka-west-view", level: "moderate", sampleOnly: true },
] as const satisfies readonly SampleCongestionCue[];

const rank: Record<CrowdLevel, number> = { calm: 0, moderate: 1, busy: 2 };
/** The busiest sample cue on any stop of a walk; walks without cues read as calm. */
export function sampleWalkCrowd(placeIds: readonly string[]): CrowdLevel {
  return SAMPLE_CONGESTION_CUES.filter(cue => placeIds.includes(cue.placeId))
    .reduce<CrowdLevel>((level, cue) => rank[cue.level] > rank[level] ? cue.level : level, "calm");
}
