"use client";

import { FoxAvatar } from "@/components/ui";
import { balance, placeById, type Game } from "@/lib/game";
import { translate, type Locale } from "@/lib/i18n";

export function HomeScreen({ game, locale, name, onExplore, onRewards }: {
  game: Game; locale: Locale; name: string; hasNotice: boolean;
  onExplore: () => void; onRewards: () => void; onMissions: () => void; onMe: () => void;
}) {
  const points = balance(game);
  const checkIns = game.runs.flatMap(run => run.stamps.map(stamp => stamp))
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
  return <div className="figma-home">
    <header className="figma-home-heading">
      <h1>{translate(locale, "navHome")}</h1>
      {/* The only moving fox on Home: the dock fox stays still. Reduced motion shows the static sprite. */}
      <FoxAvatar state="idle" size={64} animated framed={false} />
    </header>
    <p className="figma-home-hello">{locale === "ja" ? `こんにちは、${name || "ゲスト"}` : `Hi, ${name || "Guest"}`}</p>
    <p className="figma-home-subtitle">{locale === "ja" ? "また京都を歩く準備はできましたか？" : "Ready for another Kyoto walk?"}</p>

    <section className="figma-home-points">
      <p>{locale === "ja" ? "あなたのポイント" : "Your points"}</p>
      <strong>{points} <span>pts</span></strong>
      <small>{locale === "ja" ? `${checkIns.length}回のチェックインで獲得` : `Earned from ${checkIns.length} check-ins`}</small>
      <div className="figma-home-points-footer">
        <span>{locale === "ja" ? "ポイントを使う" : "Spend your points"}</span>
        <small>{locale === "ja" ? "好きな特典を選びましょう。" : "Choose a reward you like."}</small>
        <button type="button" onClick={onRewards}>{locale === "ja" ? "特典を見る  ›" : "Browse rewards  ›"}</button>
      </div>
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
          <span>{placeById(stamp.placeId)?.name[locale] ?? stamp.placeId} {locale === "ja" ? "チェックイン" : "check-in"}</span>
          <strong>+{stamp.points} pts</strong>
        </div>) : <p>{locale === "ja" ? "散歩に出かけて最初のチェックインをしましょう。" : "Take a walk to make your first check-in."}</p>}
      </div>
      <button type="button" className="figma-home-activity-link" onClick={onRewards}>{locale === "ja" ? "すべてのアクティビティを見る  ›" : "See all activity  ›"}</button>
    </section>
  </div>;
}
