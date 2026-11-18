/** Illustrative UI cues only. Positions come from curated place coordinates. */
export type SampleCongestionCue = Readonly<{
  id: string;
  placeId: string;
  level: "busy" | "moderate";
  sampleOnly: true;
}>;

export const SAMPLE_CONGESTION_CUES = [
  { id: "shijo-bridge-sample", placeId: "shijo-ohashi", level: "busy", sampleOnly: true },
  { id: "yasaka-approach-sample", placeId: "yasaka-west-view", level: "moderate", sampleOnly: true },
] as const satisfies readonly SampleCongestionCue[];
