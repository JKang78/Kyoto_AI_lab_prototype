"use client";

import Image from "next/image";
import { FoxAvatar } from "@/components/ui";
import { COUPONS } from "@/config/game";
import { CURATED_WALKS } from "@/data/kyoto-walks";
import { activeRun, balance, placeById, walkById, type Game } from "@/lib/game";
import type { Locale } from "@/lib/i18n";

export function HomeScreen({ game, locale, name, onExplore, onRewards, onMissions, onMe }: {
  game: Game; locale: Locale; name: string; hasNotice: boolean;
  onExplore: () => void; onRewards: () => void; onMissions: () => void; onMe: () => void;
}) {
  const points = balance(game);
  const checkIns = game.runs.flatMap(run => run.stamps.map(stamp => ({ ...stamp, walk: walkById(run.walkId) })))
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
  const active = activeRun(game);
  const suggested = CURATED_WALKS.find(walk => !game.runs.some(run => run.walkId === walk.id && run.complete)) ?? CURATED_WALKS[0];
  const quest = active ? walkById(active.walkId) ?? suggested : suggested;
  const visited = active?.stamps.length ?? 0;
  const totalStops = quest.placeIds.length;
  const nextStopId = active && quest.placeIds.find(id => !active.stamps.some(stamp => stamp.placeId === id));
  const seals = new Set(game.runs.flatMap(run => run.stamps.map(stamp => stamp.placeId))).size;
  const completed = game.runs.filter(run => run.complete).length;
  const nextReward = COUPONS.filter(coupon => !game.claims.some(claim => claim.id === coupon.id))
    .reduce((cost, coupon) => Math.min(cost, coupon.cost), Infinity);

  return <div className="figma-home">
    <section className="figma-home-hero">
      <p className="home-eyebrow">KYOTO WALK QUEST</p>
      <h1 className="figma-home-hello">{locale === "ja" ? `こんにちは、${name || "ゲスト"}` : `Hi, ${name || "Guest"}`}</h1>
      <p className="figma-home-subtitle">{locale === "ja" ? "今日も京都を冒険しよう。" : "Your Kyoto adventure continues."}</p>
      <div className="home-game-world" aria-hidden="true">
        <span className="home-world-cloud home-world-cloud--one" />
        <span className="home-world-cloud home-world-cloud--two" />
        <Image className="home-tree home-tree--left" src="/assets/pixel/tree.svg" width={64} height={80} alt="" />
        <Image className="home-tree home-tree--right" src="/assets/pixel/tree.svg" width={64} height={80} alt="" />
        <Image className="home-grass home-grass--one" src="/assets/pixel/grass.svg" width={28} height={20} alt="" />
        <Image className="home-grass home-grass--two" src="/assets/pixel/grass.svg" width={28} height={20} alt="" />
        <Image className="home-grass home-grass--three" src="/assets/pixel/grass.svg" width={28} height={20} alt="" />
        <Image className="home-flower" src="/assets/pixel/flower.svg" width={20} height={20} alt="" />
        <FoxAvatar state="idle" size={112} animated framed={false} />
        <span className="home-world-path" />
      </div>
      <div className="home-points-panel">
        <span>{locale === "ja" ? "あなたのポイント" : "YOUR POINTS"}</span>
        <strong>{points}<small> pts</small></strong>
        <small>{locale === "ja" ? `${checkIns.length}回のチェックインで獲得` : `Earned from ${checkIns.length} check-ins`}</small>
      </div>
    </section>

    <section className="figma-home-section home-quest-section">
      <div className="home-section-heading"><h2>{active ? locale === "ja" ? "冒険のつづき" : "Continue your quest" : locale === "ja" ? "次の冒険" : "Your next quest"}</h2><span aria-hidden="true">✦</span></div>
      <div className="figma-home-walk-card">
        <div className="home-quest-topline"><span>{active ? locale === "ja" ? "進行中" : "IN PROGRESS" : locale === "ja" ? "おすすめの散歩" : "SUGGESTED WALK"}</span><span>{visited}/{totalStops} {locale === "ja" ? "立ち寄り先" : "stops"}</span></div>
        <strong>{quest.name[locale]}</strong>
        <p>{active && nextStopId
          ? locale === "ja" ? `次の立ち寄り先：${placeById(nextStopId)?.name.ja ?? nextStopId}` : `Next stop: ${placeById(nextStopId)?.name.en ?? nextStopId}`
          : locale === "ja" ? `${totalStops}か所をめぐる、約${quest.estimatedMinutes}分の散歩` : `${totalStops} stops · about ${quest.estimatedMinutes} min`}</p>
        <div className="home-quest-progress" role="progressbar" aria-label={locale === "ja" ? "散歩の進捗" : "Walk progress"} aria-valuenow={visited} aria-valuemin={0} aria-valuemax={totalStops}><span style={{ width: `${totalStops ? visited / totalStops * 100 : 0}%` }} /></div>
        <button type="button" onClick={onExplore}>{active ? locale === "ja" ? "散歩を続ける  ›" : "Continue walk  ›" : locale === "ja" ? "散歩を探す  ›" : "Explore walks  ›"}</button>
      </div>
    </section>

    <div className="home-progress-links" aria-label={locale === "ja" ? "冒険の記録" : "Adventure progress"}>
      <button type="button" onClick={onMissions}><strong>{seals}</strong><span>{locale === "ja" ? "スタンプ" : "Seals"}</span></button>
      <button type="button" onClick={onMe}><strong>{completed}</strong><span>{locale === "ja" ? "完了した散歩" : "Walks done"}</span></button>
      <button type="button" onClick={onRewards}><strong>{game.claims.length}</strong><span>{locale === "ja" ? "バウチャー" : "Vouchers"}</span></button>
    </div>

    <section className="figma-home-rewards">
      <div><Image src="/assets/pixel/star.svg" width={30} height={30} alt="" /><div><h2>{locale === "ja" ? "ポイントを使おう" : "Spend your points"}</h2><p>{Number.isFinite(nextReward)
        ? points >= nextReward ? locale === "ja" ? "特典を受け取れます！" : "A reward is ready to unlock!"
          : locale === "ja" ? `次の特典まであと${nextReward - points} pts` : `${nextReward - points} pts to your next reward`
        : locale === "ja" ? "すべての特典を集めました" : "All rewards collected"}</p></div></div>
      <button type="button" onClick={onRewards}>{locale === "ja" ? "特典を見る  ›" : "Browse rewards  ›"}</button>
    </section>

    <section className="figma-home-section">
      <h2>{locale === "ja" ? "最近のアクティビティ" : "Recent activity"}</h2>
      <div className="figma-home-activity">
        {checkIns.length ? checkIns.slice(0, 2).map((stamp, index) => <div key={`${stamp.placeId}-${index}`}>
          <span><span>{placeById(stamp.placeId)?.name[locale] ?? stamp.placeId} {locale === "ja" ? "チェックイン" : "check-in"}</span><small>{stamp.walk?.name[locale]}</small></span>
          <strong>+{stamp.points} pts</strong>
        </div>) : <p>{locale === "ja" ? "最初の散歩に出かけてスタンプを集めよう。" : "Start a walk to collect your first seal."}</p>}
      </div>
      <button type="button" className="figma-home-activity-link" onClick={onRewards}>{locale === "ja" ? "すべてのアクティビティを見る  ›" : "See all activity  ›"}</button>
    </section>
  </div>;
}
