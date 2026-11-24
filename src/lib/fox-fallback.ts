import { COUPONS, DEMO_TRAIL, GAME } from "../config/game.ts";
import { CURATED_PLACES, CURATED_WALKS } from "../data/kyoto-walks.ts";
import { PLACE_STORIES } from "../data/place-stories.ts";
import {
  buildFoxGroundingPacket,
  GENERAL_KYOTO_ETIQUETTE,
  type FoxAnswer,
  type FoxCitation,
} from "./fox-grounding.ts";
import type { FoxQuestionChipId } from "./fox-context.ts";

export interface OfflineFoxAnswerInput {
  readonly question: string;
  readonly questionId?: string;
  readonly locale: "en" | "ja";
  readonly placeId: string | null;
  readonly walkId: string | null;
}

function pickCitations(
  preferred: readonly FoxCitation[],
  fallback: readonly FoxCitation[],
  limit = 2,
): FoxCitation[] {
  const seen = new Set<string>();
  const picked: FoxCitation[] = [];
  for (const list of [preferred, fallback]) {
    for (const item of list) {
      if (seen.has(item.url)) continue;
      seen.add(item.url);
      picked.push(item);
      if (picked.length >= limit) return picked;
    }
  }
  return picked;
}

function formatWalkList(
  walks: readonly (typeof CURATED_WALKS)[number][],
  locale: "en" | "ja",
): string {
  const sep = locale === "ja" ? "、" : "; ";
  return walks
    .map((walk) =>
      locale === "ja"
        ? `「${walk.name.ja}」（徒歩約${walk.estimatedMinutes}分・${(walk.estimatedMeters / 1000).toFixed(1)} km）`
        : `${walk.name.en} (~${walk.estimatedMinutes} min, ${(walk.estimatedMeters / 1000).toFixed(1)} km)`,
    )
    .join(sep);
}

function detectKeywordTopic(
  question: string,
  placeId: string | null,
  walkId: string | null,
):
  | "refuse_crowd"
  | "refuse_stepfree"
  | "refuse_shop"
  | "refuse_directions"
  | FoxQuestionChipId
  | null {
  const q = question.toLowerCase();

  if (/(crowd|busy|quiet|congestion|bus |buses|混雑|混んで|空いて|すいて|バス)/.test(q)) {
    return "refuse_crowd";
  }
  if (/(wheelchair|stroller|step-free|step free|accessible|accessibility|stairs|steps|車椅子|車いす|ベビーカー|バリアフリー|段差|階段)/.test(q)) {
    return "refuse_stepfree";
  }
  if (/(opening hour|open now|hours|price|cost|ticket|admission|redeem at|営業時間|開いて|料金|値段|入場料|実店舗)/.test(q)) {
    return "refuse_shop";
  }
  if (/(direction|turn-by-turn|turn by turn|how do i get|navigate|道順|行き方|ナビ)/.test(q)) {
    return "refuse_directions";
  }

  if (/(etiquette|manner|rule|photo|respect|マナー|ルール|撮影|写真|注意)/.test(q)) {
    if (placeId) return "etiquette_access";
    if (walkId) return "walk_access";
    return "kyoto_etiquette";
  }
  if (/(point|seal|stamp|reward|voucher|coupon|goshuin|ポイント|スタンプ|御朱印|特典|バウチャー)/.test(q)) {
    return walkId ? "walk_rewards" : "how_seals_work";
  }
  if (/(story|history|trivia|fact|secret|miss|highlight|歴史|由来|ストーリー|知られていない|見どころ)/.test(q)) {
    if (placeId) return "hidden_detail";
    if (walkId) return "walk_highlights";
    return null;
  }
  if (/(walk|route|stroll|trail|nearby|minute|散歩|ルート|コース|近く|分)/.test(q)) {
    if (placeId) return "connected_walks";
    if (walkId) return "walk_highlights";
    return "start_walk";
  }

  return null;
}

/**
 * Deterministic offline / no-key answer builder backed strictly by curated
 * Kyoto fixtures. Safe to call on both server and client.
 */
export function buildOfflineFoxAnswer({
  question,
  questionId,
  locale,
  placeId,
  walkId,
}: OfflineFoxAnswerInput): FoxAnswer {
  const packet = buildFoxGroundingPacket({ placeId, walkId, locale });
  const place = placeId ? CURATED_PLACES.find((item) => item.id === placeId) ?? null : null;
  const story = place ? PLACE_STORIES[place.id] ?? null : null;
  const walk = walkId ? CURATED_WALKS.find((item) => item.id === walkId) ?? null : null;

  const topic =
    (questionId as FoxQuestionChipId | undefined) ??
    detectKeywordTopic(question, place?.id ?? null, walk?.id ?? null);

  const cheapestCoupon = [...COUPONS].sort((a, b) => a.cost - b.cost)[0];

  switch (topic) {
    case "refuse_crowd": {
      const answer =
        locale === "ja"
          ? "リアルタイムの混雑状況やバスの運行・混み具合はここでは確認できません。静かな時間帯を狙う場合でも、現地の標識や周囲の状況を見ながら安全にお歩きください。"
          : "I can't check live crowd levels, quiet streets right now, or bus congestion. Please check on-site conditions and local signs as you walk.";
      return {
        answer,
        grounding: "offline_fixture",
        citations: pickCitations([], packet.allowedCitations, 1),
        safetyNote:
          locale === "ja"
            ? "ライブ混雑データには未対応です。"
            : "Live crowd and transit feeds are not available.",
      };
    }

    case "refuse_stepfree": {
      const accessLine = place
        ? place.accessibilityNotes[locale]
        : walk
          ? walk.accessibilityNotes[locale]
          : locale === "ja"
            ? "どの散歩ルートも階段・縁石・路面の現地調査は完了していません。"
            : "Curated walks have not been field-audited for curbs, surfaces, or step-free continuity.";
      const answer =
        locale === "ja"
          ? `${accessLine} 車椅子やベビーカーでの段差のない通行は保証できないため、現地で状況をご確認ください。`
          : `${accessLine} Step-free wheelchair or stroller access is not certified and always requires an on-site check.`;
      return {
        answer,
        grounding: "offline_fixture",
        citations: pickCitations([], packet.allowedCitations, 2),
        safetyNote:
          locale === "ja"
            ? "バリアフリー・段差の有無は必ず現地でご確認ください。"
            : "Always verify steps, curb ramps, and surfaces on-site.",
      };
    }

    case "refuse_shop": {
      const answer =
        locale === "ja"
          ? "実際のお店の営業時間や料金、拝観料はここでは案内していません。最新情報は公式案内や現地でご確認ください。なお、アプリ内のバウチャーはデモ用で実店舗では使えません。"
          : "I don't track live shop hours, menu prices, or temple admission fees—please check official signage or listings on-site. In-app reward vouchers are demo previews and cannot be redeemed at real stores.";
      return {
        answer,
        grounding: "offline_fixture",
        citations: pickCitations([], packet.allowedCitations, 1),
      };
    }

    case "refuse_directions": {
      const answer =
        locale === "ja"
          ? "ここでは曲がり角ごとの道順は作成していません。地図上の厳選ルートをプレビューするか、ルート詳細の「Googleマップで開く」から徒歩経路をご確認ください。"
          : "I don't generate street-by-street walking directions. Preview a curated route on the map or use the route card's Open in Google Maps link for navigation.";
      return {
        answer,
        grounding: "offline_fixture",
        citations: pickCitations([], packet.allowedCitations, 1),
      };
    }

    case "hidden_detail": {
      if (place && story) {
        return {
          answer: story.text[locale],
          grounding: "offline_fixture",
          citations: pickCitations(story.sources, packet.allowedCitations, 2),
        };
      }
      if (place) {
        return {
          answer: `${place.name[locale]}: ${place.description[locale]}`,
          grounding: "offline_fixture",
          citations: pickCitations([], packet.allowedCitations, 2),
        };
      }
      break;
    }

    case "etiquette_access": {
      if (place) {
        const zoneNote = packet.etiquette.matchedZones[0]?.message[locale];
        const parts = [place.accessNotes[locale], place.accessibilityNotes[locale]];
        if (zoneNote) parts.push(zoneNote);
        return {
          answer: parts.join(" "),
          grounding: "offline_fixture",
          citations: pickCitations([], packet.allowedCitations, 2),
          safetyNote:
            locale === "ja"
              ? "段差や路面状況は現地での確認が必要です。"
              : "Steps, curbs, and surface conditions require an on-site check.",
        };
      }
      break;
    }

    case "connected_walks": {
      if (place) {
        const matching = CURATED_WALKS.filter((item) => item.placeIds.includes(place.id));
        if (matching.length > 0) {
          const list = formatWalkList(matching, locale);
          const answer =
            locale === "ja"
              ? `${place.name.ja}を通るおすすめ散歩ルートは ${list} です。地図上のルートから詳細をプレビューできます。`
              : `Curated walks passing through ${place.name.en}: ${list}. Tap a route on the map to preview its stops.`;
          return {
            answer,
            grounding: "offline_fixture",
            citations: pickCitations([], packet.allowedCitations, 2),
          };
        }
      }
      break;
    }

    case "walk_highlights": {
      if (walk) {
        const stopNames = walk.placeIds
          .map((id) => CURATED_PLACES.find((item) => item.id === id)?.name[locale])
          .filter((name): name is string => Boolean(name));
        const joinedStops = stopNames.join(locale === "ja" ? " → " : " → ");
        const answer =
          locale === "ja"
            ? `${walk.name.ja}（徒歩約${walk.estimatedMinutes}分）は、${walk.description.ja} 立ち寄り先は ${joinedStops} です。`
            : `${walk.name.en} (~${walk.estimatedMinutes} min): ${walk.description.en} Stops along the way: ${joinedStops}.`;
        return {
          answer,
          grounding: "offline_fixture",
          citations: pickCitations([], packet.allowedCitations, 2),
        };
      }
      break;
    }

    case "walk_access": {
      if (walk) {
        const stairsText = walk.mappedSteps
          ? locale === "ja"
            ? "地図上で階段が含まれます。"
            : "This route includes mapped stairs."
          : locale === "ja"
            ? "地図上に階段は記録されていませんが、段差は現地確認が必要です。"
            : "No stairs are mapped on this line, though curbs and surfaces still need an on-site check.";
        const answer = `${stairsText} ${walk.accessibilityNotes[locale]} ${walk.residentNotes[locale]}`;
        return {
          answer,
          grounding: "offline_fixture",
          citations: pickCitations([], packet.allowedCitations, 2),
          safetyNote:
            locale === "ja"
              ? "段差のない経路は未確認のため、現地の標識と路面をご確認ください。"
              : "Step-free access is unverified; check signs and surfaces on-site.",
        };
      }
      break;
    }

    case "walk_rewards": {
      if (walk) {
        const stopCount = walk.placeIds.length;
        const standardPoints = stopCount * GAME.checkpointPoints + GAME.completionPoints;
        const answer =
          locale === "ja"
            ? `「${walk.name.ja}」では全${stopCount}か所の御朱印スタンプを集められ、通常レートで合計${standardPoints}ポイント（各地点${GAME.checkpointPoints}pt＋完走ボーナス${GAME.completionPoints}pt）を獲得できます。${cheapestCoupon ? `特典は${cheapestCoupon.cost}ポイントから交換できます（デモ用バウチャー）。` : ""}`
            : `On ${walk.name.en}, you can collect ${stopCount} Goshuin stop seals and earn ${standardPoints} pts at the standard rate (${GAME.checkpointPoints} pts per stop + ${GAME.completionPoints} pts completion bonus).${cheapestCoupon ? ` Demo rewards start at ${cheapestCoupon.cost} pts (not redeemable at real stores).` : ""}`;
        return {
          answer,
          grounding: "offline_fixture",
          citations: pickCitations([], packet.allowedCitations, 1),
        };
      }
      break;
    }

    case "kyoto_etiquette": {
      const rules = GENERAL_KYOTO_ETIQUETTE.map((item) => item[locale]).join(" ");
      return {
        answer: rules,
        grounding: "offline_fixture",
        citations: pickCitations([], packet.allowedCitations, 2),
      };
    }

    case "start_walk": {
      const quickWalks = [...CURATED_WALKS]
        .sort((a, b) => a.estimatedMinutes - b.estimatedMinutes)
        .slice(0, 3);
      const list = formatWalkList(quickWalks, locale);
      const answer =
        locale === "ja"
          ? `10分前後で歩けるおすすめルートは ${list} です。探索画面のルートカードから立ち寄り先や注意点を確認できます。`
          : `Great quick strolls around 10 minutes include ${list}. Open any route card on Explore to check its stops and access notes.`;
      return {
        answer,
        grounding: "offline_fixture",
        citations: pickCitations([], packet.allowedCitations, 2),
      };
    }

    case "how_seals_work": {
      const answer =
        locale === "ja"
          ? `各立ち寄り先でチェックインすると御朱印スタンプと${GAME.checkpointPoints}ポイントを獲得でき、ルート完走でさらに${GAME.completionPoints}ポイントのボーナスがつきます。異なる印を${DEMO_TRAIL.goal}個集めるとトレイル達成となり、貯まったポイントで${cheapestCoupon ? `${cheapestCoupon.cost}ポイントから` : ""}デモ特典を解放できます（実店舗では使用できません）。`
          : `Checking in at each stop earns a Goshuin seal and ${GAME.checkpointPoints} pts, plus a ${GAME.completionPoints} pt completion bonus when you finish a walk. Collect ${DEMO_TRAIL.goal} unique seals for the trail goal and spend points${cheapestCoupon ? ` starting at ${cheapestCoupon.cost} pts` : ""} on demo vouchers (preview only, not redeemable at real shops).`;
      return {
        answer,
        grounding: "offline_fixture",
        citations: pickCitations([], packet.allowedCitations, 1),
      };
    }

    default:
      break;
  }

  if (place && story) {
    const answer =
      locale === "ja"
        ? `オフラインガイドでは「${place.name.ja}」の保存済み情報をご案内できます。${story.text.ja} そのほかの自由な質問にはオンライン接続が必要です。`
        : `In offline guide mode, here is what I have saved for ${place.name.en}: ${story.text.en} Broader custom questions require an online connection.`;
    return {
      answer,
      grounding: "offline_fixture",
      citations: pickCitations(story.sources, packet.allowedCitations, 2),
    };
  }

  if (walk) {
    const answer =
      locale === "ja"
        ? `オフラインガイドでは「${walk.name.ja}」（徒歩約${walk.estimatedMinutes}分）の情報をご案内できます。${walk.description.ja} 見どころやマナー、ポイントについては上の質問チップからも聞けます。`
        : `In offline guide mode, I can share saved details for ${walk.name.en} (~${walk.estimatedMinutes} min): ${walk.description.en} Try one of the suggested chips above for highlights, access notes, or rewards.`;
    return {
      answer,
      grounding: "offline_fixture",
      citations: pickCitations([], packet.allowedCitations, 2),
    };
  }

  const answer =
    locale === "ja"
      ? `オフラインガイドでは、京都の散歩マナーやおすすめルート、御朱印スタンプの仕組みをご案内できます。「${question.slice(0, 40)}」のような自由な質問にはオンライン接続が必要です。`
      : `In offline guide mode, I can help with Kyoto walking etiquette, curated routes, and how Goshuin seals work. Custom questions beyond our saved Kyoto guide require an online connection.`;
  return {
    answer,
    grounding: "offline_fixture",
    citations: pickCitations([], packet.allowedCitations, 1),
  };
}
