"use client";
import { useState } from "react";
import { Bath, Check, Coffee, Lock, Mail, Ticket } from "lucide-react";
import { COUPONS, type CouponCategory, type CouponDefinition } from "@/config/game";

// Line illustrations for each voucher category (visuals.md R2). Generic objects, never merchant logos.
const categoryIcons: Record<CouponCategory, typeof Coffee> = { cafe: Coffee, experience: Bath, shop: Mail };
import { balance, walkById, placeById, type Game } from "@/lib/game";
import { act } from "@/lib/game-store";
import { bonusNameKey, formatKyotoDateTime, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { RedeemSheet } from "./redeem-sheet";
import { Button, EmptyState, FoxAvatar, haptic, ICON_STROKE, Segmented } from "./ui";
import { CheckpointVoucherTrack } from "./voucher-progress";

type Filter = "available" | "mine" | "used";
type LogEntry = { key: string; at?: number; points: number; title: string; detail: string };

function activity(game: Game, locale: Locale, t: (key: MessageKey, values?: Record<string, string>) => string): LogEntry[] {
  const entries: LogEntry[] = [];
  for (const run of game.runs) {
    const walk = walkById(run.walkId);
    run.stamps.forEach((stamp, index) => entries.push({
      key: `${run.id}-${index}`, at: stamp.at, points: stamp.points,
      title: placeById(stamp.placeId)?.name[locale] ?? "",
      detail: `${stamp.campaign ? t("logBonus", { name: t(bonusNameKey[stamp.campaign]), multiplier: stamp.multiplier.toFixed(1) }) : stamp.multiplier > 1 ? `×${stamp.multiplier.toFixed(1)}` : t("logStandard")} · ${walk?.name[locale] ?? ""}${stamp.mode === "demo" ? ` · ${t("logDemo")}` : ""}`,
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
      <p className="demo-badge">{t("demoNotRedeemable")}</p>
      <p className="ticket-merchant">{coupon.merchant[locale]}<small lang={other}>{coupon.merchant[other]}</small></p>
      <h3>{coupon.offer[locale]}</h3>
      <p className="ticket-offer-alt" lang={other}>{coupon.offer[other]}</p>
      <p className="ticket-terms">{coupon.terms[locale]} · {coupon.hours[locale]}</p>
    </div>
    <div className="ticket-stub">
      {(() => { const Icon = categoryIcons[coupon.category]; return <span className="ticket-art" aria-hidden="true"><Icon size={22} strokeWidth={ICON_STROKE} /></span>; })()}
      {!claim && <>
        <span className="ticket-cost">{t("pointsValue", { points: String(coupon.cost) })}</span>
        {points >= coupon.cost
          ? <Button onClick={() => { void act({ type: "unlock", id: coupon.id }); haptic(); }}>{t("rewardsUnlock")}</Button>
          : <small className="ticket-shortfall" data-coupon-state="locked">{t("rewardsNeed", { points: String(coupon.cost - points) })}</small>}
      </>}
      {claim && claim.redeemedAt === undefined && <Button onClick={onRedeem}><Ticket size={17} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("rewardsRedeem")}</Button>}
      {claim?.redeemedAt !== undefined && <span className="ticket-redeemed" data-coupon-state="redeemed"><Check size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("rewardsUsedOn", { date: formatKyotoDateTime(locale, claim.redeemedAt) })}</span>}
    </div>
  </article>;
}

/** Points along a track with a ticket at each voucher price and the fox at the current total (visuals.md R1). */
function VoucherTrack({ game, points, locale }: { game: Game; points: number; locale: Locale }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const sorted = [...COUPONS].sort((a, b) => a.cost - b.cost);
  const max = sorted.at(-1)?.cost ?? 1;
  const at = (value: number) => `${Math.min(1, Math.max(0, value / max)) * 100}%`;
  return <div className="voucher-track" role="group" aria-label={t("rewardsTrackLabel")}>
    <div className="voucher-track-line" aria-hidden="true"><span style={{ width: at(points) }} /></div>
    <span className="voucher-track-fox" style={{ left: at(points) }} aria-label={t("rewardsTrackYou", { points: String(points) })} role="img">
      <FoxAvatar state="idle" size={30} />
    </span>
    {sorted.map(coupon => {
      const state = game.claims.some(claim => claim.id === coupon.id) ? "done" : points >= coupon.cost ? "ready" : "locked";
      const Icon = state === "done" ? Check : state === "ready" ? Ticket : Lock;
      return <span key={coupon.id} className="voucher-track-stop" data-state={state} style={{ left: at(coupon.cost) }}
        role="img" aria-label={`${coupon.offer[locale]} · ${t("pointsValue", { points: String(coupon.cost) })}`}>
        <span className="voucher-track-marker"><Icon size={14} strokeWidth={ICON_STROKE + 0.5} aria-hidden="true" /></span>
        <small>{coupon.cost}</small>
      </span>;
    })}
  </div>;
}

export function Rewards({ game, locale }: { game: Game; locale: Locale }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const points = balance(game);
  const claimOf = (coupon: CouponDefinition) => game.claims.find(claim => claim.id === coupon.id);
  const mine = COUPONS.filter(coupon => { const claim = claimOf(coupon); return claim && claim.redeemedAt === undefined; });
  const used = COUPONS.filter(coupon => claimOf(coupon)?.redeemedAt !== undefined);
  const [filter, setFilter] = useState<Filter>("available");
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const shown = filter === "available" ? COUPONS.filter(coupon => !claimOf(coupon)) : filter === "mine" ? mine : used;
  const log = activity(game, locale, t);
  const redeemCoupon = COUPONS.find(coupon => coupon.id === redeeming);
  const redeemClaim = game.claims.find(claim => claim.id === redeeming);
  return <div className="content-screen">
    <h1>{t("navRewards")}</h1>
    <section className="rewards-summary">
      <p className="rewards-points">{t("pointsValue", { points: String(points) })}</p>
      <CheckpointVoucherTrack game={game} locale={locale} />
      <VoucherTrack game={game} points={points} locale={locale} />
    </section>
    <p className="demo-strip"><strong>{t("demoNotRedeemable")}</strong> · {t("rewardsDisclosure")}</p>
    <Segmented label={t("rewardsFilterLabel")} value={filter} onChange={setFilter} options={[
      { id: "available", label: t("rewardsAvailable") },
      { id: "mine", label: t("rewardsMine", { count: String(mine.length) }) },
      { id: "used", label: t("rewardsUsed") },
    ]} />
    <div className="ticket-list">
      {shown.length ? shown.map(coupon => <TicketCard key={coupon.id} coupon={coupon} game={game} locale={locale} points={points} onRedeem={() => setRedeeming(coupon.id)} />)
        : <EmptyState>{t(filter === "mine" ? "rewardsEmptyMine" : filter === "used" ? "rewardsEmptyUsed" : "rewardsEmptyAvailable")}</EmptyState>}
    </div>
    <section className="activity-log" aria-labelledby="activity-title">
      <h2 id="activity-title">{t("rewardsActivity")}</h2>
      {log.length ? <ol>{log.map(entry => <li key={entry.key}>
        <span><strong>{entry.title}</strong><small>{entry.detail}{entry.at !== undefined && ` · ${formatKyotoDateTime(locale, entry.at)}`}</small></span>
        {entry.points !== 0 && <span className="log-points" data-sign={entry.points > 0 ? "plus" : "minus"}>{entry.points > 0 ? "+" : "−"}{Math.abs(entry.points)}</span>}
      </li>)}</ol> : <EmptyState>{t("rewardsNoActivity")}</EmptyState>}
    </section>
    {redeemCoupon && redeemClaim && <RedeemSheet coupon={redeemCoupon} claim={redeemClaim} locale={locale} onClose={() => setRedeeming(null)} />}
  </div>;
}
