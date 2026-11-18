/** GeoJSON order: longitude first, latitude second. */
export type LngLat = readonly [longitude: number, latitude: number];
export type LocalizedText = Readonly<{ en: string; ja: string }>;

export type RouteSource = Readonly<{
  id: string;
  title: string;
  url: string;
  accessedOn: string;
  license?: string;
}>;

export type CuratedPlace = Readonly<{
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  /** A mapped pedestrian approach/viewpoint, not necessarily the feature centroid. */
  location: LngLat;
  osmFeatureUrl: string;
  sourceIds: readonly string[];
  accessNotes: LocalizedText;
  accessibilityNotes: LocalizedText;
  communityInputStatus: "not-consulted";
}>;

export type CuratedWalk = Readonly<{
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  theme: "culture" | "riverside" | "park";
  placeIds: readonly string[];
  geometry: Readonly<{ type: "LineString"; coordinates: readonly LngLat[] }>;
  /** OSM foot-router estimates, not a surveyed journey time or distance. */
  estimatedMeters: number;
  estimatedMinutes: number;
  sourceIds: readonly string[];
  routingRequestUrl: string;
  reviewedOn: string;
  mappedSteps: boolean;
  accessibilityNotes: LocalizedText;
  residentNotes: LocalizedText;
  communityInputStatus: "not-consulted";
}>;
