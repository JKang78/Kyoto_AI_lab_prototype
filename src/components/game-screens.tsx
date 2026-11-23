"use client";
import { ArrowUpRight, BookOpen, Check, ChevronRight, CupSoda, Mail, Landmark, Trees, Waves } from "lucide-react";
import { COUPONS, GAME } from "@/config/game";
import { CURATED_WALKS } from "@/data/kyoto-walks";
import { activeRun, balance, placeById, walkStatus, type Game } from "@/lib/game";
import { act } from "@/lib/game-store";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import { Button, Card, Pill } from "./ui";

type Props = { game: Game; locale: Locale };
export function Wallet({ game, locale }: Props) {
  return <Pill>{translate(locale, "gameBalance", { coins: String(balance(game)) })}</Pill>;
}

export function Missions({ game, locale, onWalk }: Props & { onWalk: (id: string) => void }) {
  const active = activeRun(game);
  const statusKeys: Record<ReturnType<typeof walkStatus>["status"], MessageKey> = {
    active: "gameActive",
    completed: "gameCompleted",
    stopped: "gameStopped",
    available: "gameAvailable",
  };
  return <div className="content-screen game-screen">
    <h1>{translate(locale, "navMissions")}</h1>
    <p>{translate(locale, "gameBonus", { coins: String(GAME.completionCoins) })}</p>
    {[...CURATED_WALKS].sort((a, b) => Number(b.id === active?.walkId) - Number(a.id === active?.walkId)).map(walk => {
      const { status, stamps } = walkStatus(game, walk.id);
      const Icon = { culture: Landmark, riverside: Waves, park: Trees }[walk.theme];
      return <Card key={walk.id}>
        <Icon aria-hidden="true" size={24} />
        <h2>{walk.name[locale]}</h2><p>{walk.description[locale]}</p>
        <Pill>{translate(locale, statusKeys[status])}</Pill>
        <ol className="stamp-book">{walk.placeIds.map((id, index) =>
          <li key={id}><span>{index < stamps ? "✓" : "○"}</span> {placeById(id)?.name[locale]}</li>)}</ol>
        <Button variant={active?.walkId === walk.id ? "primary" : "secondary"} onClick={() => onWalk(walk.id)}>{translate(locale, "gameViewMap")}</Button>
      </Card>;
    })}
  </div>;
}
export function Rewards({ game, locale }: Props) {
  const coins = balance(game);
  return <div className="content-screen game-screen">
    <h1>{translate(locale, "navRewards")}</h1><Wallet game={game} locale={locale} />
    <p>{translate(locale, "gameDisclosure")}</p>
    {COUPONS.map(coupon => {
      const claimed = game.claims.some(c => c.id === coupon.id);
      const claimable = !claimed && coins >= coupon.cost;
      const Icon = { postcard: Mail, tea: CupSoda, journal: BookOpen }[coupon.id];
      return <Card key={coupon.id} className="reward-row"><Icon aria-hidden="true" /><h2>{coupon[locale]}</h2>
        <p>{translate(locale, "gamePrice", { coins: String(coupon.cost) })}</p>
        {claimable && <Button onClick={() => void act({ type: "claim", id: coupon.id })}>{translate(locale, "gameClaim")}</Button>}
        {claimed && <span className="coupon-owned" data-coupon-state="claimed"><Check size={16} aria-hidden="true" />{translate(locale, "gameClaimed")}</span>}
        {!claimed && !claimable && <p className="coupon-shortfall" data-coupon-state="locked">{translate(locale, "gameNeed", { coins: String(coupon.cost - coins) })}</p>}
      </Card>;
    })}
    <h2>{translate(locale, "gameHistory")}</h2>
    {game.claims.length ? <ol>{game.claims.map(claim => <li key={claim.id}>{COUPONS.find(c => c.id === claim.id)?.[locale]} · −{claim.cost}</li>)}</ol> : <p>{translate(locale, "gameNoClaims")}</p>}
  </div>;
}

export function WalkingHome({ game, locale, name, onWalk }: Props & { name: string; onWalk: (id: string) => void }) {
  const run = activeRun(game);
  const walk = CURATED_WALKS.find(item => item.id === (run?.walkId ?? "kamo-riverside")) ?? CURATED_WALKS[0];
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const next = run && placeById(walk.placeIds[run.stamps.length]);
  return <div className="content-screen home-screen">
    <section className="featured-walk">
      <p>{run ? t("gameActive") : t("featuredWalk")}</p>
      <h1>{walk.name[locale]}</h1>
      <p>{next ? t("homeNext", { place: next.name[locale] }) : walk.description[locale]}</p>
      <ol className="home-itinerary">{walk.placeIds.map((id, i) =>
        <li key={id} data-earned={i < (run?.stamps.length ?? 0)}><span>{i < (run?.stamps.length ?? 0) ? "✓" : i + 1}</span>{placeById(id)?.name[locale]}</li>
      )}</ol>
      <Button onClick={() => onWalk(walk.id)}>{t(run ? "gameResume" : "gameViewMap")}<ArrowUpRight size={18} aria-hidden="true" /></Button>
      <small>{t("walkMinutes", { minutes: String(walk.estimatedMinutes) })}</small>
    </section>
    <h2>{t("otherWalks")}</h2>
    {CURATED_WALKS.filter(item => item.id !== walk.id).map(item =>
      <button className="other-walk" key={item.id} onClick={() => onWalk(item.id)}>
        <span>{item.name[locale]}</span><small>{t("walkMinutes", { minutes: String(item.estimatedMinutes) })}</small><ChevronRight size={17} aria-hidden="true" />
      </button>)}
    <h2>{name ? t("namedProgress", { name }) : t("gameProgress")}</h2>
    <Wallet game={game} locale={locale} />
    <p>{t("gameSummary", { stamps: String(game.runs.reduce((n, r) => n + r.stamps.length, 0)), walks: String(game.runs.filter(r => r.complete).length) })}</p>
  </div>;
}
