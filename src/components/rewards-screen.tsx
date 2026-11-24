"use client";
import { useState } from "react";
import Image from "next/image";
import { Check, Ticket } from "lucide-react";
import { COUPONS, type CouponCategory, type CouponDefinition } from "@/config/game";

const categoryArtwork: Record<CouponCategory, string> = { cafe: "/assets/figma/coupon-coffee.svg", experience: "/assets/figma/coupon-bath.svg", shop: "/assets/figma/coupon-mail.svg" };
import { balance, isCouponExpired, walkById, placeById, type Game } from "@/lib/game";
import { act } from "@/lib/game-store";
import { bonusNameKey, formatKyotoDateTime, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { RedeemSheet } from "./redeem-sheet";
import { Button, EmptyState, FoxAvatar, haptic, ICON_STROKE, Segmented } from "./ui";

type Filter = "available" | "mine" | "used";
type CategoryFilter = "all" | CouponCategory;
const catalogOrder = ["matcha", "sento", "postcards", "tea-latte", "mochi", "craft", "stationery"];
const catalogPosition = (id: string) => {
  const index = catalogOrder.indexOf(id);
  return index < 0 ? catalogOrder.length : index;
};
type LogEntry = { key: string; at?: number; points: number; title: string; detail: string };

function activity(game: Game, locale: Locale, t: (key: MessageKey, values?: Record<string, string>) => string): LogEntry[] {
  const entries: LogEntry[] = [];
  for (const run of game.runs) {
    const walk = walkById(run.walkId);
    run.stamps.forEach((stamp, index) => entries.push({
      key: `${run.id}-${index}`, at: stamp.at, points: stamp.points,
      title: placeById(stamp.placeId)?.name[locale] ?? "",
      detail: `${stamp.campaign ? t("logBonus", { name: t(bonusNameKey[stamp.campaign]), multiplier: stamp.multiplier.toFixed(1) }) : stamp.multiplier > 1 ? `×${stamp.multiplier.toFixed(1)}` : t("logStandard")} · ${walk?.name[locale] ?? ""}`,
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

function TicketCard({ coupon, game, locale, points, now, onRedeem }: { coupon: CouponDefinition; game: Game; locale: Locale; points: number; now: number; onRedeem: () => void }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const [expanded, setExpanded] = useState(false);
  const claim = game.claims.find(c => c.id === coupon.id);
  const expired = isCouponExpired(coupon, now);
  const state = claim ? claim.redeemedAt !== undefined ? "redeemed" : expired ? "expired" : "unlocked" : expired ? "expired" : "locked";
  const merchant = coupon.merchant[locale];
  return <article className="ticket-card coupon-ticket" data-state={state} data-expanded={expanded}>
    <button type="button" className="coupon-summary" aria-expanded={expanded} aria-controls={`coupon-details-${coupon.id}`} onClick={() => setExpanded(value => !value)}>
      <span className="coupon-summary-main"><span className="coupon-merchant">{merchant}</span><span className="coupon-offer">{coupon.offer[locale]}</span></span>
      <span className="coupon-summary-stub">
        <Image className="coupon-perforation" src="/assets/figma/coupon-perforation.svg" width={2} height={112} alt="" />
        <span className="ticket-art" aria-hidden="true"><Image src={coupon.id === "craft" ? "/assets/figma/coupon-craft-brush.svg" : coupon.id === "mochi" ? "/assets/figma/coupon-mail.svg" : categoryArtwork[coupon.category]} width={22} height={22} alt="" /></span>
        <span className="ticket-cost">{claim ? "" : locale === "ja" ? "必要 " : "Cost "}{coupon.cost} pts</span>
        {claim?.redeemedAt !== undefined && <span className="coupon-spent">{locale === "ja" ? "使用済み" : "Spent"}</span>}
      </span>
    </button>
    {expanded && <div className="coupon-details" id={`coupon-details-${coupon.id}`}>
      <p className="ticket-terms">{coupon.terms[locale]} · {coupon.hours[locale]}</p>
      <p className="ticket-expiry" data-expired={expired}>{expired ? t("voucherExpired") : t("voucherValidUntil", { date: formatKyotoDateTime(locale, coupon.expiresAt) })}</p>
      {!claim && (expired
        ? <small className="ticket-shortfall" data-coupon-state="expired">{t("voucherExpired")}</small>
        : points >= coupon.cost
          ? <Button onClick={() => { void act({ type: "unlock", id: coupon.id }); haptic(); }}>{t("rewardsUnlock")}</Button>
          : <small className="ticket-shortfall" data-coupon-state="locked">{t("rewardsNeed", { points: String(coupon.cost - points) })}</small>)}
      {claim && claim.redeemedAt === undefined && (expired
        ? <small className="ticket-shortfall" data-coupon-state="expired">{t("voucherExpired")}</small>
        : <Button onClick={onRedeem}><Ticket size={17} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("rewardsRedeem")}</Button>)}
      {claim?.redeemedAt !== undefined && <span className="ticket-redeemed" data-coupon-state="redeemed"><Check size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("rewardsUsedOn", { date: formatKyotoDateTime(locale, claim.redeemedAt) })}</span>}
    </div>}
  </article>;
}

export function Rewards({ game, locale }: { game: Game; locale: Locale }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const points = balance(game);
  const claimOf = (coupon: CouponDefinition) => game.claims.find(claim => claim.id === coupon.id);
  const mine = COUPONS.filter(coupon => { const claim = claimOf(coupon); return claim && claim.redeemedAt === undefined; });
  const used = COUPONS.filter(coupon => claimOf(coupon)?.redeemedAt !== undefined);
  const [filter, setFilter] = useState<Filter>("available");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const shown = (filter === "available" ? COUPONS.filter(coupon => !claimOf(coupon)) : filter === "mine" ? mine : used)
    .filter(coupon => category === "all" || filter !== "available" || coupon.category === category)
    .sort((a, b) => catalogPosition(a.id) - catalogPosition(b.id));
  const log = activity(game, locale, t);
  const nextCost = COUPONS.filter(coupon => !claimOf(coupon)).reduce((cost, coupon) => Math.min(cost, coupon.cost), Infinity);
  const pointsNeeded = Number.isFinite(nextCost) ? Math.max(0, nextCost - points) : 0;
  const redeemCoupon = COUPONS.find(coupon => coupon.id === redeeming);
  const redeemClaim = game.claims.find(claim => claim.id === redeeming);
  return <div className={`content-screen figma-rewards${catalogOpen ? " figma-rewards-catalog" : ""}`}>
    {catalogOpen ? <>
    <button className="figma-back" type="button" onClick={() => setCatalogOpen(false)}>{locale === "ja" ? "特典に戻る" : "Back to Rewards"}</button>
    <div className="figma-title-fox"><h1>{locale === "ja" ? "すべての特典" : "All rewards"}</h1><Image src="/assets/figma/fox-waving.png" width={52} height={52} alt="" /></div>
    <p className="figma-catalog-intro">{locale === "ja" ? "ポイントを使って特典を受け取れます。" : "Spend points to redeem a voucher."}</p>
    <Segmented label={t("rewardsFilterLabel")} value={filter} onChange={setFilter} options={[
      { id: "available", label: t("rewardsAvailable") },
      { id: "mine", label: t("rewardsMine", { count: String(mine.length) }) },
      { id: "used", label: t("rewardsUsed") },
    ]} />
    {filter === "available" && <div className="figma-reward-categories" role="group" aria-label={locale === "ja" ? "カテゴリー" : "Categories"}>
      {(["all", "cafe", "shop", "experience"] as const).map(id => <button key={id} type="button" aria-pressed={category === id} onClick={() => setCategory(id)}>{locale === "ja" ? ({ all: "すべて", cafe: "飲食", shop: "買い物", experience: "体験" } as const)[id] : ({ all: "All", cafe: "Food & drink", shop: "Shopping", experience: "Experiences" } as const)[id]}</button>)}
    </div>}
    {filter === "mine" && !shown.length ? <div className="figma-empty-vouchers">
      <section><h2>{locale === "ja" ? "クーポンとは？" : "What is a voucher?"}</h2><p>{locale === "ja" ? "散歩でポイントを貯め、特典と交換しましょう。使うまでここに表示されます。" : "Earn points on walks, then spend them to redeem a reward. Your voucher appears here until you use it."}</p></section>
      <section><h2>{locale === "ja" ? "クーポンはまだありません" : "No vouchers yet"}</h2><p>{pointsNeeded > 0 ? locale === "ja" ? `${points} ptsあります。次のクーポンまであと${pointsNeeded} pts。` : `You have ${points} pts. Earn ${pointsNeeded} more to redeem your first voucher.` : locale === "ja" ? `${points} ptsあります。好きな特典を選びましょう。` : `You have ${points} pts. Choose a reward to redeem.`}</p></section>
      <button type="button" onClick={() => setFilter("available")}>{locale === "ja" ? "特典を見る" : "Browse rewards"}</button>
    </div> : <div className="ticket-list">
      {shown.length ? shown.map(coupon => <TicketCard key={coupon.id} coupon={coupon} game={game} locale={locale} points={points} now={now} onRedeem={() => setRedeeming(coupon.id)} />)
        : <EmptyState>{t(filter === "used" ? "rewardsEmptyUsed" : "rewardsEmptyAvailable")}</EmptyState>}
    </div>}
    </> : <>
    <h1>{t("navRewards")}</h1>
    <section className="figma-rewards-balance"><span>{locale === "ja" ? "あなたのポイント" : "Your points"}</span><strong>{points} <small>pts</small></strong><p>{locale === "ja" ? "散歩してポイントを貯めましょう" : "Earn points on walks, then spend them on rewards."}</p></section>
    <section className="figma-rewards-preview"><h2>{locale === "ja" ? "利用できる特典" : "Available rewards"}</h2><div>{COUPONS.slice(0, 3).map(coupon => <p key={coupon.id}><span>{coupon.offer[locale]}</span><span>{coupon.cost} pts</span></p>)}</div><button type="button" onClick={() => { setFilter("available"); setCatalogOpen(true); }}>{locale === "ja" ? "すべての特典を見る  ›" : "Browse all rewards  ›"}</button></section>
    <section className="activity-log" aria-labelledby="activity-title">
      <h2 id="activity-title">{t("rewardsActivity")}</h2>
      {log.length ? <ol>{log.map(entry => <li key={entry.key}>
        <FoxAvatar state="idle" size={40} /><span><strong>{entry.title}</strong><small>{entry.detail}{entry.at !== undefined && ` · ${formatKyotoDateTime(locale, entry.at)}`}</small></span>
        {entry.points !== 0 && <span className="log-points" data-sign={entry.points > 0 ? "plus" : "minus"}>{entry.points > 0 ? "+" : "−"}{Math.abs(entry.points)}</span>}
      </li>)}</ol> : <EmptyState>{t("rewardsNoActivity")}</EmptyState>}
    </section>
    </>}
    {redeemCoupon && redeemClaim && <RedeemSheet coupon={redeemCoupon} claim={redeemClaim} locale={locale} onClose={() => setRedeeming(null)} />}
  </div>;
}
