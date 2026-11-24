"use client";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { COUPONS } from "@/config/game";
import { balance, placeById, walkById, type Game, type Run } from "@/lib/game";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import { Button, FoxAvatar, ICON_STROKE, SPRING } from "./ui";
import { PlaceSeal } from "./glyphs";

/**
 * Walk-complete moment (visuals.md C1). Covers the map, not the dock, and never traps focus:
 * Escape, the close button or either action dismisses it. The whole sequence stays under 800 ms
 * and is skipped under reduced motion. Points are labelled as demo points.
 */
export function Celebration({ game, run, locale, onClose, onStampBook, onRewards }: {
  game: Game; run: Run; locale: Locale; onClose: () => void; onStampBook: () => void; onRewards: () => void;
}) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const reduced = useReducedMotion();
  const walk = walkById(run.walkId)!;
  const checkInPoints = run.stamps.reduce((sum, stamp) => sum + stamp.points, 0);
  const total = run.bonus + checkInPoints;
  const [shown, setShown] = useState(reduced ? total : 0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const points = balance(game);
  const ready = COUPONS.filter(coupon => !game.claims.some(claim => claim.id === coupon.id) && points >= coupon.cost)[0];
  useEffect(() => {
    headingRef.current?.focus();
    if (reduced) return;
    const counter = animate(0, total, { duration: 0.6, ease: "easeOut", onUpdate: value => setShown(Math.round(value)) });
    return () => counter.stop();
  }, [reduced, total]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const other: Locale = locale === "en" ? "ja" : "en";
  return <motion.section className="celebration" role="dialog" aria-modal="false" aria-labelledby="celebration-title"
    drag={reduced ? false : "y"} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0.05, bottom: 0.35 }}
    onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 500) onClose(); }}>
    <span className="celebration-handle" aria-hidden="true" />
    <button type="button" className="icon-button celebration-close" aria-label={t("close")} onClick={onClose}><X size={20} strokeWidth={ICON_STROKE} /></button>
    <motion.div className="celebration-fox" initial={reduced ? false : { y: 24, scale: 0.8, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={SPRING}>
      <FoxAvatar state="reward" size={132} />
    </motion.div>
    <h2 id="celebration-title" ref={headingRef} tabIndex={-1}>{t("celebrateTitle")}</h2>
    <p className="celebration-walk">{walk.name[locale]}<small lang={other}>{walk.name[other]}</small></p>
    <ol className="celebration-seals" aria-label={t("celebrateSealsLabel")}>
      {run.stamps.map((stamp, index) => <li key={stamp.placeId}>
        <motion.span className="stamp-seal" aria-hidden="true"
          initial={reduced ? false : { scale: 1.8, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: -6, opacity: 1 }}
          transition={{ ...SPRING, delay: reduced ? 0 : 0.12 + index * 0.12 }}><PlaceSeal placeId={stamp.placeId} size={26} /></motion.span>
        <small>{placeById(stamp.placeId)?.name[locale]}</small>
      </li>)}
    </ol>
    <p className="celebration-points" aria-label={t("celebratePoints", { points: String(total) })}>
      <strong>{t("celebratePoints", { points: String(shown) })}</strong>
      {run.bonus > 0 && <small>{locale === "ja" ? `チェックイン ${checkInPoints} pt + 完走ボーナス ${run.bonus} pt` : `${checkInPoints} pts check-ins + ${run.bonus} pts completion bonus`}</small>}
    </p>
    <div className="celebration-tip">
      <FoxAvatar state="idle" size={40} />
      <p>{t("celebrateSeals", { count: String(run.stamps.length) })}
        {ready && <strong>{t("celebrateVoucher", { offer: ready.offer[locale] })}</strong>}</p>
    </div>
    <div className="celebration-actions">
      <Button variant="secondary" onClick={onStampBook}>{t("celebrateStampBook")}</Button>
      <Button onClick={onRewards}>{t("navRewards")}</Button>
    </div>
  </motion.section>;
}
