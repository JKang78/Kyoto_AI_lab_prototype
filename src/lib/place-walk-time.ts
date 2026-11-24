import { distanceMeters } from "./game.ts";
import type { CuratedPlace, CuratedWalk, LngLat } from "../types/routes";

// Use the saved foot-router duration in proportion to distance along its path.
// A point beyond this corridor needs directions from a routing provider.
const MAX_PATH_OFFSET_METERS = 20;

function positionOnPath(point: LngLat, line: readonly LngLat[]) {
  const longitudeScale = Math.cos(point[1] * Math.PI / 180);
  let offset = Infinity;
  let along = 0;
  let length = 0;
  for (let i = 1; i < line.length; i++) {
    const start = line[i - 1];
    const end = line[i];
    const dx = (end[0] - start[0]) * longitudeScale;
    const dy = end[1] - start[1];
    const squaredLength = dx * dx + dy * dy;
    if (squaredLength === 0) continue;
    const projection = ((point[0] - start[0]) * longitudeScale * dx + (point[1] - start[1]) * dy) / squaredLength;
    const fraction = Math.max(0, Math.min(1, projection));
    const projected: LngLat = [start[0] + fraction * (end[0] - start[0]), start[1] + fraction * dy];
    const gap = distanceMeters(point, projected);
    const segmentLength = distanceMeters(start, end);
    if (gap < offset) {
      offset = gap;
      along = length + fraction * segmentLength;
    }
    length += segmentLength;
  }
  return { offset, along, length };
}

export function placeWalkTime(walk: CuratedWalk, place: CuratedPlace, origin: LngLat | null) {
  const stop = positionOnPath(place.location, walk.geometry.coordinates);
  const start = origin && positionOnPath(origin, walk.geometry.coordinates);
  const originAlong = start && start.offset <= MAX_PATH_OFFSET_METERS ? start.along : null;
  const meters = Math.abs(stop.along - (originAlong ?? 0));
  return { fromPosition: originAlong !== null, minutes: Math.ceil(meters / stop.length * walk.estimatedMinutes) };
}
