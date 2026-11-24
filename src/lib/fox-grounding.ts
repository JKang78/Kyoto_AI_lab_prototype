import { COUPONS, DEMO_TRAIL, GAME } from "../config/game.ts";
import { CURATED_PLACES, CURATED_WALKS, ROUTE_SOURCES } from "../data/kyoto-walks.ts";
import { PLACE_STORIES, type PlaceStory } from "../data/place-stories.ts";
import { ETIQUETTE_ZONES, etiquetteZoneAt, type EtiquetteZone } from "./etiquette.ts";
import type { CuratedPlace, CuratedWalk, LocalizedText } from "../types/routes";

export type FoxGroundingKind =
  | "verified_fixture"
  | "hybrid_general_ai"
  | "offline_fixture";

export interface FoxCitation {
  readonly title: string;
  readonly url: string;
}

export interface FoxAnswer {
  readonly answer: string;
  readonly grounding: FoxGroundingKind;
  readonly citations: readonly FoxCitation[];
  readonly safetyNote?: string;
}

export interface FoxGroundingPacket {
  readonly place: {
    readonly id: string;
    readonly name: LocalizedText;
    readonly description: LocalizedText;
    readonly accessNotes: LocalizedText;
    readonly accessibilityNotes: LocalizedText;
    readonly communityInputStatus: CuratedPlace["communityInputStatus"];
    readonly osmFeatureUrl: string;
  } | null;
  readonly story: {
    readonly text: LocalizedText;
    readonly sources: readonly FoxCitation[];
    readonly status: PlaceStory["status"];
    readonly checkedOn: string;
  } | null;
  readonly selectedWalk: {
    readonly id: string;
    readonly name: LocalizedText;
    readonly description: LocalizedText;
    readonly theme: CuratedWalk["theme"];
    readonly estimatedMeters: number;
    readonly estimatedMinutes: number;
    readonly mappedSteps: boolean;
    readonly accessibilityNotes: LocalizedText;
    readonly residentNotes: LocalizedText;
    readonly stops: readonly LocalizedText[];
  } | null;
  readonly connectedWalks: readonly {
    readonly id: string;
    readonly name: LocalizedText;
    readonly description: LocalizedText;
    readonly theme: CuratedWalk["theme"];
    readonly estimatedMeters: number;
    readonly estimatedMinutes: number;
    readonly mappedSteps: boolean;
    readonly accessibilityNotes: LocalizedText;
    readonly residentNotes: LocalizedText;
  }[];
  readonly etiquette: {
    readonly matchedZones: readonly {
      readonly id: string;
      readonly placeId: string;
      readonly message: LocalizedText;
    }[];
    readonly generalRules: readonly LocalizedText[];
  };
  readonly gameRules: {
    readonly checkpointPoints: number;
    readonly completionPoints: number;
    readonly trailGoal: number;
    readonly rewardsAreDemoOnly: true;
    readonly coupons: readonly {
      readonly id: string;
      readonly cost: number;
      readonly merchant: LocalizedText;
      readonly offer: LocalizedText;
    }[];
  };
  readonly allowedCitations: readonly FoxCitation[];
}

export const GENERAL_KYOTO_ETIQUETTE: readonly LocalizedText[] = [
  {
    en: "Keep sidewalks, bridges, and shop or shrine entrances clear when pausing.",
    ja: "立ち止まるときは歩道や橋、店舗や神社の入口を塞がないようにしましょう。",
  },
  {
    en: "Stay on open public paths and respect private alleys and residential lanes.",
    ja: "開放された公道や園路を歩き、私道や住宅街の路地への配慮を忘れずに。",
  },
  {
    en: "Avoid intrusive photography and follow posted shrine, temple, and local signs.",
    ja: "周囲の迷惑になる撮影は控え、神社仏閣や現地の案内表示に従いましょう。",
  },
];

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function sourceById(id: string) {
  return ROUTE_SOURCES.find((source) => source.id === id);
}

function addCitation(map: Map<string, FoxCitation>, title: string, url: string) {
  const cleanUrl = url.trim();
  const cleanTitle = title.trim();
  if (!cleanTitle || !isHttpsUrl(cleanUrl) || map.has(cleanUrl)) return;
  map.set(cleanUrl, { title: cleanTitle, url: cleanUrl });
}

function summarizeWalk(walk: CuratedWalk) {
  return {
    id: walk.id,
    name: walk.name,
    description: walk.description,
    theme: walk.theme,
    estimatedMeters: walk.estimatedMeters,
    estimatedMinutes: walk.estimatedMinutes,
    mappedSteps: walk.mappedSteps,
    accessibilityNotes: walk.accessibilityNotes,
    residentNotes: walk.residentNotes,
  };
}

export function buildFoxGroundingPacket({
  placeId,
  walkId,
  locale,
}: {
  placeId: string | null;
  walkId: string | null;
  locale: "en" | "ja";
}): FoxGroundingPacket {
  const place = placeId ? CURATED_PLACES.find((item) => item.id === placeId) ?? null : null;
  const story = place ? PLACE_STORIES[place.id] ?? null : null;
  const selectedWalk = walkId ? CURATED_WALKS.find((item) => item.id === walkId) ?? null : null;

  const connectedWalkObjects = place
    ? CURATED_WALKS.filter((walk) => walk.placeIds.includes(place.id))
    : selectedWalk
      ? [selectedWalk]
      : [...CURATED_WALKS];

  const matchedZoneMap = new Map<string, EtiquetteZone>();
  if (place) {
    const atPlace = etiquetteZoneAt(place.location);
    if (atPlace) matchedZoneMap.set(atPlace.id, atPlace);
    for (const zone of ETIQUETTE_ZONES) {
      if (zone.placeId === place.id) matchedZoneMap.set(zone.id, zone);
    }
  }
  if (selectedWalk) {
    for (const zone of ETIQUETTE_ZONES) {
      if (selectedWalk.placeIds.includes(zone.placeId)) {
        matchedZoneMap.set(zone.id, zone);
      }
    }
  }
  if (!place && !selectedWalk) {
    for (const zone of ETIQUETTE_ZONES) {
      matchedZoneMap.set(zone.id, zone);
    }
  }

  const allowedMap = new Map<string, FoxCitation>();
  if (story) {
    for (const source of story.sources) {
      addCitation(allowedMap, source.title, source.url);
    }
  }
  if (place) {
    addCitation(
      allowedMap,
      locale === "ja"
        ? `OpenStreetMap — ${place.name.ja}`
        : `OpenStreetMap — ${place.name.en}`,
      place.osmFeatureUrl,
    );
    for (const id of place.sourceIds) {
      const src = sourceById(id);
      if (src) addCitation(allowedMap, src.title, src.url);
    }
  }
  for (const walk of connectedWalkObjects) {
    for (const id of walk.sourceIds) {
      const src = sourceById(id);
      if (src) addCitation(allowedMap, src.title, src.url);
    }
  }
  if (allowedMap.size === 0) {
    for (const src of ROUTE_SOURCES.slice(0, 4)) {
      addCitation(allowedMap, src.title, src.url);
    }
  }

  const selectedWalkStops = selectedWalk
    ? selectedWalk.placeIds
        .map((id) => CURATED_PLACES.find((item) => item.id === id)?.name)
        .filter((name): name is LocalizedText => Boolean(name))
    : [];

  return {
    place: place
      ? {
          id: place.id,
          name: place.name,
          description: place.description,
          accessNotes: place.accessNotes,
          accessibilityNotes: place.accessibilityNotes,
          communityInputStatus: place.communityInputStatus,
          osmFeatureUrl: place.osmFeatureUrl,
        }
      : null,
    story: story
      ? {
          text: story.text,
          sources: story.sources,
          status: story.status,
          checkedOn: story.checkedOn,
        }
      : null,
    selectedWalk: selectedWalk
      ? {
          ...summarizeWalk(selectedWalk),
          stops: selectedWalkStops,
        }
      : null,
    connectedWalks: connectedWalkObjects.map(summarizeWalk),
    etiquette: {
      matchedZones: [...matchedZoneMap.values()].map((zone) => ({
        id: zone.id,
        placeId: zone.placeId,
        message: zone.message,
      })),
      generalRules: GENERAL_KYOTO_ETIQUETTE,
    },
    gameRules: {
      checkpointPoints: GAME.checkpointPoints,
      completionPoints: GAME.completionPoints,
      trailGoal: DEMO_TRAIL.goal,
      rewardsAreDemoOnly: true,
      coupons: COUPONS.map((coupon) => ({
        id: coupon.id,
        cost: coupon.cost,
        merchant: coupon.merchant,
        offer: coupon.offer,
      })),
    },
    allowedCitations: [...allowedMap.values()],
  };
}

/**
 * Strips any citation URL that is not an https:// URL present in the packet's
 * verified allowedCitations set, preventing hallucinated or unsafe links.
 */
export function sanitizeCitations(
  citations: unknown,
  allowedCitations: readonly FoxCitation[],
): FoxCitation[] {
  if (!Array.isArray(citations)) return [];
  const allowedByUrl = new Map(
    allowedCitations
      .filter((item) => isHttpsUrl(item.url))
      .map((item) => [item.url.trim(), item]),
  );
  const seen = new Set<string>();
  const result: FoxCitation[] = [];

  for (const item of citations) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    if (!isHttpsUrl(record.url)) continue;
    const url = record.url.trim();
    const allowed = allowedByUrl.get(url);
    if (!allowed || seen.has(url)) continue;
    seen.add(url);
    const rawTitle = typeof record.title === "string" ? record.title.trim() : "";
    result.push({
      title: rawTitle || allowed.title,
      url: allowed.url,
    });
  }

  return result;
}

const MODEL_GROUNDING_KINDS = new Set<FoxGroundingKind>([
  "verified_fixture",
  "hybrid_general_ai",
]);

export function validateFoxAnswer(
  raw: unknown,
  packet: FoxGroundingPacket,
  allowOfflineKind = false,
): FoxAnswer | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;

  if (typeof record.answer !== "string") return null;
  const answer = record.answer.trim();
  if (answer.length === 0 || answer.length > 1200) return null;

  const grounding = record.grounding;
  const validGrounding =
    typeof grounding === "string" &&
    (MODEL_GROUNDING_KINDS.has(grounding as FoxGroundingKind) ||
      (allowOfflineKind && grounding === "offline_fixture"));
  if (!validGrounding) return null;

  const sanitizedCitations = sanitizeCitations(record.citations, packet.allowedCitations);
  const citations = grounding === "hybrid_general_ai" ? [] : sanitizedCitations;

  const safetyNote =
    typeof record.safetyNote === "string" && record.safetyNote.trim().length > 0
      ? record.safetyNote.trim().slice(0, 300)
      : undefined;

  return safetyNote
    ? { answer, grounding: grounding as FoxGroundingKind, citations, safetyNote }
    : { answer, grounding: grounding as FoxGroundingKind, citations };
}

export function buildFoxSystemPrompt(
  packet: FoxGroundingPacket,
  locale: "en" | "ja",
): string {
  const languageInstruction =
    locale === "ja"
      ? "Respond in natural, polite Japanese (2 to 4 concise sentences)."
      : "Respond in warm, concise English (2 to 4 concise sentences).";

  return [
    "You are the Kyoto Flow guide fox answering a walker's question on the Explore map.",
    languageInstruction,
    "",
    "GROUNDING & SAFETY RULES (STRICT):",
    "1. Answer from the Grounding Packet JSON below first.",
    "2. If the Grounding Packet answers the question, set grounding to \"verified_fixture\" and include relevant citations copied verbatim from allowedCitations. Never invent or modify URLs.",
    "3. If the question asks broader Kyoto cultural or historical trivia not covered by the Grounding Packet, you may answer concisely from general knowledge, MUST set grounding to \"hybrid_general_ai\", and MUST return citations as [].",
    "4. HARD REFUSALS (never violate):",
    "   - Never invent walking routes, street-by-street directions, or coordinates.",
    "   - Never claim live crowd levels, quiet streets right now, or bus congestion status.",
    "   - Never certify wheelchair or stroller step-free access; always note that steps, curbs, and surfaces require an on-site check.",
    "   - Never invent real shop opening hours, prices, or claim demo vouchers are redeemable at real stores.",
    "5. Output plain text only (no HTML or markdown links inside answer). Return valid JSON matching the response schema.",
    "",
    "GROUNDING PACKET JSON:",
    JSON.stringify(packet),
  ].join("\n");
}
