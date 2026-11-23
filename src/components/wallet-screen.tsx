"use client";
import { useState } from "react";
import { Check, Ticket } from "lucide-react";
import { COUPONS, type CouponDefinition } from "@/config/game";
import { balance, walkById, placeById, type Game } from "@/lib/game";
import { act } from "@/lib/game-store";
import { formatKyotoDateTime, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { RedeemSheet } from "./redeem-sheet";
import { Button, haptic, ICON_STROKE, Segmented } from "./ui";

type Filter = "available" | "mine" | "transit";
type LogEntry = { key: string; at?: number; points: number; title: string; detail: string };

function activity(game: Game, locale: Locale, t: (key: MessageKey, values?: Record<string, string>) => string): LogEntry[] {
  const entries: LogEntry[] = [];
  for (const run of game.runs) {
    const walk = walkById(run.walkId);
    run.stamps.forEach((stamp, index) => entries.push({
      key: `${run.id}-${index}`, at: stamp.at, points: stamp.points,
      title: placeById(stamp.placeId)?.name[locale] ?? "",
      detail: `${stamp.multiplier > 1 ? t("logOffPeak", { multiplier: stamp.multiplier.toFixed(1) }) : t("logStandard")} · ${walk?.name[locale] ?? ""}${stamp.mode === "demo" ? ` · ${t("logDemo")}` : ""}`,
    }));
    if (run.bonus) entries.push({ key: `${run.id}-bonus`, at: run.stamps.at(-1)?.at, points: run.bonus, title: t("logCompletion"), detail: walk?.name[locale] ?? "" });
  }
  for (const claim of game.claims) {
    const coupon = COUPONS.find(c => c.id === claim.id);
    if (!coupon) continue;
    entries.push({ key: `${claim.id}-unlock`, at: claim.at, points: -claim.cost, title: t("logUnlocked"), detail: coupon.offer[locale] });
    if (claim.redeemedAt !== undefined) entries.push({ key: `${claim.id}-redeem`, at: claim.redeemedAt, points: 0, title: t("logRedeemed"), detail: coupon.offer[locale] });
  }
  return entries.sort((a, b) => (b.at ?? -1) - (a.at ?? -1));
}

function TicketCard({ coupon, game, locale, points, onRedeem }: { coupon: CouponDefinition; game: Game; locale: Locale; points: number; onRedeem: () => void }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const claim = game.claims.find(c => c.id === coupon.id);
  const other = locale === "en" ? "ja" : "en";
  return <article className="ticket-card" data-state={claim ? claim.redeemedAt !== undefined ? "redeemed" : "unlocked" : "locked"}>
    <div className="ticket-main">
      <p className="ticket-merchant">{coupon.merchant[locale]}<small lang={other}>{coupon.merchant[other]}</small></p>
      <h3>{coupon.offer[locale]}</h3>
      <p className="ticket-offer-alt" lang={other}>{coupon.offer[other]}</p>
      <p className="ticket-terms">{coupon.terms[locale]} · {coupon.hours[locale]}</p>
    </div>
    <div className="ticket-stub">
      {!claim && <>
        <span className="ticket-cost">{t("pointsValue", { points: String(coupon.cost) })}</span>
        {points >= coupon.cost
          ? <Button onClick={() => { void act({ type: "unlock", id: coupon.id }); haptic(); }}>{t("walletUnlock")}</Button>
          : <small className="ticket-shortfall" data-coupon-state="locked">{t("walletNeed", { points: String(coupon.cost - points) })}</small>}
      </>}
      {claim && claim.redeemedAt === undefined && <Button onClick={onRedeem}><Ticket size={17} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("walletRedeem")}</Button>}
      {claim?.redeemedAt !== undefined && <span className="ticket-redeemed" data-coupon-state="redeemed"><Check size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("walletRedeemedOn", { date: formatKyotoDateTime(locale, claim.redeemedAt) })}</span>}
    </div>
  </article>;
}

export function Wallet({ game, locale }: { game: Game; locale: Locale }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const points = balance(game);
  const mine = COUPONS.filter(coupon => game.claims.some(claim => claim.id === coupon.id));
  const [filter, setFilter] = useState<Filter>("available");
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const next = COUPONS.filter(coupon => !game.claims.some(claim => claim.id === coupon.id)).sort((a, b) => a.cost - b.cost)[0];
  const ratio = next ? Math.min(1, points / next.cost) : 1;
  const shown = filter === "available" ? COUPONS.filter(coupon => !mine.includes(coupon))
    : filter === "mine" ? mine : COUPONS.filter(coupon => coupon.category === "transit");
  const log = activity(game, locale, t);
  const redeemCoupon = COUPONS.find(coupon => coupon.id === redeeming);
  const redeemClaim = game.claims.find(claim => claim.id === redeeming);
  return <div className="content-screen">
    <h1>{t("navWallet")}</h1>
    <section className="wallet-summary">
      <svg className="progress-arc" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="27" pathLength={100} />
        <circle cx="32" cy="32" r="27" pathLength={100} strokeDasharray={`${ratio * 100} 100`} />
      </svg>
      <div>
        <p className="wallet-points">{t("pointsValue", { points: String(points) })}</p>
        <p>{next ? points >= next.cost ? t("walletReady", { offer: next.offer[locale] }) : t("walletNext", { points: String(next.cost - points), offer: next.offer[locale] }) : t("walletAllUnlocked")}</p>
      </div>
    </section>
    <p className="demo-strip">{t("walletDisclosure")}</p>
    <Segmented label={t("walletFilterLabel")} value={filter} onChange={setFilter} options={[
      { id: "available", label: t("walletAvailable") },
      { id: "mine", label: t("walletMine", { count: String(mine.length) }) },
      { id: "transit", label: t("walletTransit") },
    ]} />
    <div className="ticket-list">
      {shown.length ? shown.map(coupon => <TicketCard key={coupon.id} coupon={coupon} game={game} locale={locale} points={points} onRedeem={() => setRedeeming(coupon.id)} />)
        : <p className="empty-note">{t(filter === "mine" ? "walletEmptyMine" : "walletEmptyAvailable")}</p>}
    </div>
    <section className="activity-log" aria-labelledby="activity-title">
      <h2 id="activity-title">{t("walletActivity")}</h2>
      {log.length ? <ol>{log.map(entry => <li key={entry.key}>
        <span><strong>{entry.title}</strong><small>{entry.detail}{entry.at !== undefined && ` · ${formatKyotoDateTime(locale, entry.at)}`}</small></span>
        {entry.points !== 0 && <span className="log-points" data-sign={entry.points > 0 ? "plus" : "minus"}>{entry.points > 0 ? "+" : "−"}{Math.abs(entry.points)}</span>}
      </li>)}</ol> : <p className="empty-note">{t("walletNoActivity")}</p>}
    </section>
    {redeemCoupon && redeemClaim && <RedeemSheet coupon={redeemCoupon} claim={redeemClaim} locale={locale} onClose={() => setRedeeming(null)} />}
  </div>;
}
