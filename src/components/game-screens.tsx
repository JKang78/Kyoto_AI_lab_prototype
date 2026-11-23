"use client";
import { Check, Flower2, Landmark, Ticket, Trees, Waves } from "lucide-react";
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
    {CURATED_WALKS.map(walk => {
      const { status, stamps } = walkStatus(game, walk.id);
      const Icon = { culture: Landmark, riverside: Waves, park: Trees }[walk.theme];
      return <Card key={walk.id}>
        <Icon aria-hidden="true" size={24} />
        <h2>{walk.name[locale]}</h2><p>{walk.description[locale]}</p>
        <Pill>{translate(locale, statusKeys[status])}</Pill>
        <ol className="stamp-book">{walk.placeIds.map((id, index) =>
          <li key={id}><span>{index < stamps ? "✓" : "○"}</span> {placeById(id)?.name[locale]}</li>)}</ol>
        <p>{translate(locale, "gameBonus", { coins: String(GAME.completionCoins) })}</p>
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
      return <Card key={coupon.id}><Ticket aria-hidden="true" /><h2>{coupon[locale]}</h2>
        <p>{translate(locale, "gamePrice", { coins: String(coupon.cost) })}</p>
        {claimed ? (
          <Button variant="secondary" disabled className="coupon-claimed" data-coupon-state="claimed">
            <Check size={17} aria-hidden="true" />{translate(locale, "gameClaimed")}
          </Button>
        ) : (
          <Button
            variant={claimable ? "primary" : "secondary"}
            disabled={!claimable}
            data-coupon-state={claimable ? "claimable" : "locked"}
            onClick={() => void act({ type: "claim", id: coupon.id })}
          >
            {translate(locale, claimable ? "gameClaim" : "gameNeed", { coins: String(coupon.cost - coins) })}
          </Button>
        )}</Card>;
    })}
    <h2>{translate(locale, "gameHistory")}</h2>
    {game.claims.length ? <ol>{game.claims.map(claim => <li key={claim.id}>{COUPONS.find(c => c.id === claim.id)?.[locale]} · −{claim.cost}</li>)}</ol> : <p>{translate(locale, "gameNoClaims")}</p>}
  </div>;
}

export function HomeProgress({ game, locale }: Props) {
  const run = activeRun(game);
  return <Card><Flower2 aria-hidden="true" /><h2>{translate(locale, "gameProgress")}</h2>
    <Wallet game={game} locale={locale} />
    <p>{translate(locale, "gameSummary", {
      stamps: String(game.runs.reduce((n, r) => n + r.stamps.length, 0)),
      walks: String(game.runs.filter(r => r.complete).length),
    })}</p>
    {run && <p>{CURATED_WALKS.find(w => w.id === run.walkId)?.name[locale]} · {run.stamps.length}/{CURATED_WALKS.find(w => w.id === run.walkId)?.placeIds.length}</p>}
  </Card>;
}
