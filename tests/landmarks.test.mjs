import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CURATED_PLACES, CURATED_WALKS } from "../src/data/kyoto-walks.ts";
import { KYOTO_LANDMARKS } from "../src/data/kyoto-landmarks.ts";
import {
  LANDMARK_ICON_SVGS,
  landmarkImageId,
  landmarkSvgDataUrl,
} from "../src/lib/landmark-icons.ts";

describe("KYOTO_LANDMARKS", () => {
  it("contains 15 unique landmarks with valid Kyoto coordinates, OSM URLs, and bilingual copy", () => {
    assert.equal(KYOTO_LANDMARKS.length, 15);
    const ids = new Set();
    for (const landmark of KYOTO_LANDMARKS) {
      assert.ok(!ids.has(landmark.id), `Duplicate landmark id: ${landmark.id}`);
      ids.add(landmark.id);

      const [lng, lat] = landmark.location;
      assert.ok(lng >= 135.65 && lng <= 135.85, `Longitude out of Kyoto range for ${landmark.id}: ${lng}`);
      assert.ok(lat >= 34.93 && lat <= 35.12, `Latitude out of Kyoto range for ${landmark.id}: ${lat}`);
      assert.ok(landmark.osmFeatureUrl.startsWith("https://www.openstreetmap.org/"), `Invalid OSM URL for ${landmark.id}`);
      assert.ok(landmark.name.en.trim().length > 0);
      assert.ok(landmark.name.ja.trim().length > 0);
      assert.ok(landmark.summary.en.trim().length > 10);
      assert.ok(landmark.summary.ja.trim().length > 10);

      if (landmark.linkedPlaceId) {
        assert.ok(
          CURATED_PLACES.some((place) => place.id === landmark.linkedPlaceId),
          `Unknown linkedPlaceId ${landmark.linkedPlaceId} on ${landmark.id}`,
        );
      }
      for (const walkId of landmark.nearbyWalkIds) {
        assert.ok(
          CURATED_WALKS.some((walk) => walk.id === walkId),
          `Unknown nearbyWalkId ${walkId} on ${landmark.id}`,
        );
      }
    }
  });

  it("maps every landmark iconId to a valid Kyoto Ink & Washi SVG medallion", () => {
    for (const landmark of KYOTO_LANDMARKS) {
      const svg = LANDMARK_ICON_SVGS[landmark.iconId];
      assert.ok(svg && svg.startsWith("<svg ") && svg.endsWith("</svg>"), `Missing SVG for ${landmark.iconId}`);
      assert.ok(landmarkSvgDataUrl(landmark.iconId).startsWith("data:image/svg+xml;charset=utf-8,"));
      assert.equal(landmarkImageId(landmark.iconId), `landmark-${landmark.iconId}`);
    }
  });
});
