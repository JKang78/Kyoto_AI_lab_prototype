import { CURATED_PLACES, CURATED_WALKS } from "../data/kyoto-walks.ts";
import { distanceMeters, walkById, type Run } from "./game.ts";
import type { LngLat, LocalizedText } from "../types/routes";

export const FOX_PLACE_RADIUS_METERS = 250;
const ACTIVE_RUN_TIE_METERS = 15;

export type FoxLocationSource = "live" | "demo" | "sample";

export type FoxQuestionChipId =
  | "hidden_detail"
  | "etiquette_access"
  | "connected_walks"
  | "walk_highlights"
  | "walk_access"
  | "walk_rewards"
  | "kyoto_etiquette"
  | "start_walk"
  | "how_seals_work";

export interface FoxRecommendedQuestion {
  readonly id: FoxQuestionChipId;
  readonly en: string;
  readonly ja: string;
}

export interface FoxContext {
  readonly locationSource: FoxLocationSource;
  readonly placeId: string | null;
  readonly placeDistanceMeters: number | null;
  readonly walkId: string | null;
  readonly contextLabel: LocalizedText;
  readonly recommendedQuestions: readonly FoxRecommendedQuestion[];
}

export interface ResolveFoxContextInput {
  readonly position: LngLat | null;
  readonly mode: "unselected" | "live" | "demo" | "sample";
  readonly selectedWalkId: string | null;
  readonly activeRun?: Run | null;
  readonly locale?: "en" | "ja";
}

const PLACE_QUESTIONS: readonly FoxRecommendedQuestion[] = [
  {
    id: "hidden_detail",
    en: "What is something most people don't know about this place?",
    ja: "この場所について、あまり知られていないことは？",
  },
  {
    id: "etiquette_access",
    en: "What local etiquette or access notes should I know here?",
    ja: "ここで気をつけたいマナーや通行の注意点は？",
  },
  {
    id: "connected_walks",
    en: "Which curated walks pass through or near here?",
    ja: "ここを通るおすすめ散歩ルートは？",
  },
];

const WALK_QUESTIONS: readonly FoxRecommendedQuestion[] = [
  {
    id: "walk_highlights",
    en: "What are the highlights along this walk?",
    ja: "この散歩ルートの見どころは？",
  },
  {
    id: "walk_access",
    en: "Are there stairs, crossings, or etiquette notes on this route?",
    ja: "階段やマナーなど、歩く前の注意点は？",
  },
  {
    id: "walk_rewards",
    en: "How many seals and points can I earn on this walk?",
    ja: "このルートでスタンプやポイントはどのくらい貯まる？",
  },
];

const GENERAL_QUESTIONS: readonly FoxRecommendedQuestion[] = [
  {
    id: "kyoto_etiquette",
    en: "What are the most important Kyoto walking etiquette tips?",
    ja: "京都を歩くときに大切なマナーは？",
  },
  {
    id: "start_walk",
    en: "Which curated walk is best for a quick 10-minute stroll?",
    ja: "10分くらいで歩けるおすすめルートは？",
  },
  {
    id: "how_seals_work",
    en: "How do Goshuin seals and rewards work?",
    ja: "御朱印スタンプと特典の仕組みは？",
  },
];

function normalizeLocationSource(mode: ResolveFoxContextInput["mode"]): FoxLocationSource {
  if (mode === "live") return "live";
  if (mode === "demo") return "demo";
  return "sample";
}

/**
 * Resolves the fox's local Kyoto context strictly on-device from the current
 * coordinate, location mode, selected walk, and active run. Raw coordinates
 * are never returned in FoxContext or sent to any API.
 */
export function resolveFoxContext({
  position,
  mode,
  selectedWalkId,
  activeRun = null,
}: ResolveFoxContextInput): FoxContext {
  const locationSource = normalizeLocationSource(mode);
  const runWalk = activeRun ? walkById(activeRun.walkId) ?? null : null;
  const nextStopId = runWalk
    ? runWalk.placeIds[activeRun!.stamps.length] ?? runWalk.placeIds.at(-1) ?? null
    : null;
  const validSelectedWalk = selectedWalkId ? walkById(selectedWalkId) ?? null : null;

  if (position) {
    const nearby = CURATED_PLACES.map((place) => ({
      place,
      distance: distanceMeters(position, place.location),
    }))
      .filter((entry) => entry.distance <= FOX_PLACE_RADIUS_METERS)
      .sort((a, b) => {
        if (runWalk && Math.abs(a.distance - b.distance) <= ACTIVE_RUN_TIE_METERS) {
          const aIsNext = a.place.id === nextStopId ? 1 : 0;
          const bIsNext = b.place.id === nextStopId ? 1 : 0;
          if (aIsNext !== bIsNext) return bIsNext - aIsNext;

          const aOnRun = runWalk.placeIds.includes(a.place.id) ? 1 : 0;
          const bOnRun = runWalk.placeIds.includes(b.place.id) ? 1 : 0;
          if (aOnRun !== bOnRun) return bOnRun - aOnRun;
        }
        return a.distance - b.distance;
      });

    if (nearby.length > 0) {
      const winner = nearby[0];
      const roundedMeters = Math.round(winner.distance);
      const resolvedWalkId = runWalk?.id ?? validSelectedWalk?.id ?? null;
      const contextLabel: LocalizedText =
        locationSource === "live"
          ? {
              en: `Near ${winner.place.name.en} · ${roundedMeters} m`,
              ja: `${winner.place.name.ja}の近く · ${roundedMeters} m`,
            }
          : {
              en: `Near ${winner.place.name.en}`,
              ja: `${winner.place.name.ja}の近く`,
            };

      return {
        locationSource,
        placeId: winner.place.id,
        placeDistanceMeters: roundedMeters,
        walkId: resolvedWalkId,
        contextLabel,
        recommendedQuestions: PLACE_QUESTIONS,
      };
    }
  }

  const fallbackWalk = runWalk ?? validSelectedWalk;
  if (fallbackWalk) {
    return {
      locationSource,
      placeId: null,
      placeDistanceMeters: null,
      walkId: fallbackWalk.id,
      contextLabel: {
        en: fallbackWalk.name.en,
        ja: fallbackWalk.name.ja,
      },
      recommendedQuestions: WALK_QUESTIONS,
    };
  }

  return {
    locationSource,
    placeId: null,
    placeDistanceMeters: null,
    walkId: null,
    contextLabel: {
      en: "Kyoto Walk Guide",
      ja: "京都おさんぽガイド",
    },
    recommendedQuestions: GENERAL_QUESTIONS,
  };
}

export function getRecommendedQuestionLabel(
  question: FoxRecommendedQuestion,
  locale: "en" | "ja",
): string {
  return question[locale];
}

export function listAllFoxWalkSummaries() {
  return CURATED_WALKS.map((walk) => ({
    id: walk.id,
    name: walk.name,
    estimatedMinutes: walk.estimatedMinutes,
    estimatedMeters: walk.estimatedMeters,
  }));
}
