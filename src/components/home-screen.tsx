"use client";

import { FoxAvatar } from "@/components/ui";
import { balance, placeById, walkById, type Game } from "@/lib/game";
import type { Locale } from "@/lib/i18n";

export function HomeScreen({ game, locale, name, onExplore, onRewards }: {
  game: Game; locale: Locale; name: string; hasNotice: boolean;
  onExplore: () => void; onRewards: () => void; onMissions: () => void; onMe: () => void;
}) {
  const points = balance(game);
  const checkIns = game.runs.flatMap(run => run.stamps.map(stamp => ({ ...stamp, walk: walkById(run.walkId) })))
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
  return <div className="figma-home">
    <section className="figma-home-hero">
      <h1 className="figma-home-hello">{locale === "ja" ? `こんにちは、${name || "ゲスト"}` : `Hi, ${name || "Guest"}`}</h1>
      <p className="figma-home-subtitle">{locale === "ja" ? "また京都を歩く準備はできましたか？" : "Ready for another Kyoto walk?"}</p>
      <FoxAvatar state="idle" size={106} animated framed={false} />
      <p className="figma-home-balance">{points} pts</p>
      <p className="figma-home-earned">{locale === "ja" ? `${checkIns.length}回のチェックインで獲得` : `Earned from ${checkIns.length} check-ins`}</p>
    </section>

    <section className="figma-home-rewards">
      <h2>{locale === "ja" ? "ポイントを使う" : "Spend your points"}</h2>
      <p>{locale === "ja" ? "好きな特典を選びましょう。" : "Choose a reward you like."}</p>
      <button type="button" onClick={onRewards}>{locale === "ja" ? "特典を見る  ›" : "Browse rewards  ›"}</button>
    </section>

    <section className="figma-home-section">
      <h2>{locale === "ja" ? "次の散歩を見つける" : "Find your next walk"}</h2>
      <div className="figma-home-walk-card">
        <strong>{locale === "ja" ? "京都の散歩を選ぶ" : "Choose a Kyoto walk"}</strong>
        <p>{locale === "ja" ? "ルートを見て、行き先を選びましょう。" : "Browse routes and pick where to go."}</p>
        <button type="button" onClick={onExplore}>{locale === "ja" ? "散歩を探す  ›" : "Browse walks  ›"}</button>
      </div>
    </section>

    <section className="figma-home-section">
      <h2>{locale === "ja" ? "最近のアクティビティ" : "Recent activity"}</h2>
      <div className="figma-home-activity">
        {checkIns.length ? checkIns.slice(0, 2).map((stamp, index) => <div key={`${stamp.placeId}-${index}`}>
          <span><span>{placeById(stamp.placeId)?.name[locale] ?? stamp.placeId} {locale === "ja" ? "チェックイン" : "check-in"}</span><small>{stamp.walk?.name[locale]}</small></span>
          <strong>+{stamp.points} pts</strong>
        </div>) : <p>{locale === "ja" ? "散歩に出かけて最初のチェックインをしましょう。" : "Take a walk to make your first check-in."}</p>}
      </div>
      <button type="button" className="figma-home-activity-link" onClick={onRewards}>{locale === "ja" ? "すべてのアクティビティを見る  ›" : "See all activity  ›"}</button>
    </section>
  </div>;
}
