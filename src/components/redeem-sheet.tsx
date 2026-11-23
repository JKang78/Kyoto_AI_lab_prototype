"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck } from "lucide-react";
import { GAME, type CouponDefinition } from "@/config/game";
import { redemptionCode, type Claim } from "@/lib/game";
import { act } from "@/lib/game-store";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import { Button, ConfirmDialog, haptic, ICON_STROKE, SPRING } from "./ui";

/**
 * Demo redemption preview. Nothing here is verified: the code is never checked and "mark as used" only
 * updates this browser. Real redemption needs a staff-authenticated server (ENGINEERING_SPEC §7).
 */
export function RedeemSheet({ coupon, claim, locale, onClose }: { coupon: CouponDefinition; claim: Claim; locale: Locale; onClose: () => void }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const other: Locale = locale === "en" ? "ja" : "en";
  const reduced = useReducedMotion();
  const [openedAt, setOpenedAt] = useState(() => Date.now());
  const [now, setNow] = useState(openedAt);
  const [hold, setHold] = useState(0);
  const holdStart = useRef<number | null>(null);
  const frame = useRef(0);
  const redeemed = claim.redeemedAt !== undefined;
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const left = Math.max(0, GAME.redeemWindowMs - (now - openedAt));
  const expired = left === 0;
  const clock = `${Math.floor(left / 60_000)}:${String(Math.floor(left / 1000) % 60).padStart(2, "0")}`;
  const code = redemptionCode(claim);

  function beginHold() {
    if (redeemed || expired || holdStart.current !== null) return;
    holdStart.current = performance.now();
    const tick = () => {
      if (holdStart.current === null) return;
      const progress = Math.min(1, (performance.now() - holdStart.current) / GAME.staffHoldMs);
      setHold(progress);
      if (progress < 1) { frame.current = requestAnimationFrame(tick); return; }
      holdStart.current = null;
      haptic();
      void act({ type: "redeem", id: claim.id });
    };
    frame.current = requestAnimationFrame(tick);
  }
  function endHold() {
    if (holdStart.current === null) return;
    holdStart.current = null;
    cancelAnimationFrame(frame.current);
    setHold(0);
  }

  return <ConfirmDialog open onClose={onClose} title={t("redeemTitle")} closeLabel={t("close")} className="redeem-dialog">
    <div className="redeem-live" data-motion={!reduced && !redeemed}>
      <p className="demo-strip redeem-demo"><strong>{t("demoNotRedeemable")}</strong><span lang={other}>{translate(other, "demoNotRedeemable")}</span><small>{t("redeemDemoBody")}</small></p>
      <p className="redeem-merchant">{coupon.merchant.ja}<small>{coupon.merchant.en}</small></p>
      <p className="redeem-offer" lang="ja">{coupon.offer.ja}</p>
      <p className="redeem-offer-en" lang="en">{coupon.offer.en}</p>
      <p className="redeem-code" aria-label={t("redeemCodeLabel", { code: code.split("").join(" ") })}>{code.slice(0, 3)}<span aria-hidden="true"> </span>{code.slice(3)}</p>
      <p className="redeem-terms">{coupon.terms.ja}<br />{coupon.terms.en}</p>
      {redeemed ? <motion.p className="redeem-verified" role="status" initial={reduced ? false : { scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={SPRING}>
        <BadgeCheck size={28} strokeWidth={ICON_STROKE} aria-hidden="true" /><span>{t("redeemVerified")}<small lang={other}>{translate(other, "redeemVerified")}</small></span>
      </motion.p> : <>
        <p className="redeem-clock" aria-live="off" data-expired={expired}>{expired ? t("redeemExpired") : t("redeemExpires", { time: clock })}</p>
        {expired ? <Button className="full-width" onClick={() => { const fresh = Date.now(); setOpenedAt(fresh); setNow(fresh); }}>{t("redeemRefresh")}</Button> :
          <button type="button" className="staff-hold" style={{ "--hold": hold } as CSSProperties}
            onPointerDown={beginHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
            onKeyDown={(event) => { if ((event.key === " " || event.key === "Enter") && !event.repeat) { event.preventDefault(); beginHold(); } }}
            onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") endHold(); }}
            onContextMenu={(event) => event.preventDefault()}>
            <span>{t("redeemStaffHold")}</span><small lang={other}>{translate(other, "redeemStaffHold")}</small>
          </button>}
      </>}
    </div>
    <Button variant="secondary" className="full-width" onClick={onClose}>{t("close")}</Button>
  </ConfirmDialog>;
}
