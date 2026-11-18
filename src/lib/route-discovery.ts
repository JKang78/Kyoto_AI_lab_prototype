import type { CuratedPlace, CuratedWalk } from "@/types/routes";

export type RouteFilter = CuratedWalk["theme"] | "nature" | "cafes" | "bike" | "hidden" | "luggage" | "seasonal" | null;
export type MatchReason = "place" | "theme" | "time" | "available" | null;
export type RouteSuggestion = Readonly<{ walk: CuratedWalk; reason: MatchReason }>;
export type RouteDiscovery = Readonly<{ suggestions: readonly RouteSuggestion[]; fallback: boolean }>;

const themeTerms: Record<CuratedWalk["theme"], RegExp> = {
  culture: /\b(?:culture|cultural|history|historic|heritage|shrine|temple)\b|文化|歴史|神社|寺院|八坂|知恩院/iu,
  riverside: /\b(?:river|riverside|kamo|bridge|waterfront)\b|川沿い|鴨川|川端|大橋|橋/iu,
  park: /\b(?:park|garden|cherry|blossom|nature|green|maruyama)\b|公園|円山|桜|自然/iu,
};

// These interests have no verified fixture metadata. Never turn sample congestion into a "quiet" claim.
const unverifiedTerms = /\b(?:cafes?|coffee|shops?|stores?|bikes?|cycling|scooters?|luggage|quiet|uncrowded|hidden|seasonal|busy|crowded|crowds?|congestion|traffic|accessible|wheelchair|stroller|step-free|safe|blooming|flowering)\b|カフェ|喫茶|珈琲|ショップ|店|自転車|スクーター|荷物|静か|穴場|季節|混雑|空いて|すいて|車いす|車椅子|ベビーカー|段差なし|安全|開花|花見/iu;
const ignoredWords = new Set(["a", "about", "along", "an", "and", "around", "at", "can", "find", "for", "from", "give", "i", "in", "is", "less", "like", "looking", "max", "maximum", "me", "min", "mins", "minute", "minutes", "near", "of", "or", "please", "route", "search", "show", "than", "the", "through", "to", "under", "up", "walk", "walking", "want", "with", "within", "would", "you", "kyoto"]);

function normalize(value: string): string {
  return value.normalize("NFKD").replace(/(\p{Script=Latin})\p{M}+/gu, "$1").normalize("NFC").toLocaleLowerCase().trim();
}

function requestedMinutes(query: string): number | null {
  const english = query.match(/\b(?:under|within|up to|less than|max(?:imum)?)\s*(\d{1,3})\s*(?:min(?:ute)?s?)?\b/i)
    ?? query.match(/\b(\d{1,3})\s*[- ]?min(?:ute)?s?\b/i);
  const japanese = query.match(/(\d{1,3})\s*分(?:以内|以下|未満)?/);
  const value = Number((english ?? japanese)?.[1]);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function themeMatches(walk: CuratedWalk, filter: RouteFilter): boolean {
  return !filter || walk.theme === filter || (filter === "nature" && (walk.theme === "riverside" || walk.theme === "park"));
}

export function discoverRoutes(query: string, filter: RouteFilter, walks: readonly CuratedWalk[], places: readonly CuratedPlace[]): RouteDiscovery {
  const eligible = walks.filter((walk) => themeMatches(walk, filter));
  if (!eligible.length) return { suggestions: [], fallback: false };
  const term = normalize(query);
  if (!term) return { suggestions: eligible.map((walk) => ({ walk, reason: filter ? "theme" : null })), fallback: false };

  const themes = (Object.keys(themeTerms) as CuratedWalk["theme"][]).filter((theme) => themeTerms[theme].test(term));
  const minutes = requestedMinutes(term);
  const words = (term.match(/[a-z]+/g) ?? []).filter((word) => word.length >= 3 && !ignoredWords.has(word));
  const fixtureText = normalize([...walks.flatMap((walk) => [walk.name.en, walk.name.ja, walk.description.en, walk.description.ja]), ...places.flatMap((place) => [place.name.en, place.name.ja, place.description.en, place.description.ja])].join(" "));
  const unknownWords = words.some((word) => !Object.values(themeTerms).some((pattern) => pattern.test(word)) && !fixtureText.includes(word));
  const scored = eligible.map((walk, index) => {
    const namedPlaces = walk.placeIds.flatMap((id) => places.filter((place) => place.id === id));
    const names = [walk.name.en, walk.name.ja, ...namedPlaces.flatMap((place) => [place.name.en, place.name.ja])].map(normalize);
    const placeMatch = names.some((name) => name.includes(term) || (term.length >= 3 && term.includes(name)));
    const text = normalize([walk.name.en, walk.name.ja, walk.description.en, walk.description.ja, ...namedPlaces.flatMap((place) => [place.name.en, place.name.ja, place.description.en, place.description.ja])].join(" "));
    const wordMatches = words.filter((word) => text.includes(word)).length;
    const themeMatch = themes.includes(walk.theme);
    const timeMatch = minutes !== null && walk.estimatedMinutes <= minutes;
    const relevant = (themes.length ? themeMatch || placeMatch : placeMatch || wordMatches > 0 || timeMatch)
      && (minutes === null || timeMatch);
    const score = (placeMatch ? 8 : 0) + (themeMatch ? 5 : 0) + wordMatches * 2 + (timeMatch ? 1 : 0);
    const reason: MatchReason = placeMatch ? "place" : themeMatch ? "theme" : timeMatch ? "time" : null;
    return { walk, index, relevant, score, reason };
  }).sort((a, b) => b.score - a.score || a.index - b.index);

  const fallback = unverifiedTerms.test(term) || unknownWords || !scored.some((item) => item.relevant);
  const suggestions = fallback ? scored.map(({ walk }) => ({ walk, reason: "available" as const }))
    : scored.filter((item) => item.relevant).map(({ walk, reason }) => ({ walk, reason }));
  return { suggestions, fallback };
}
