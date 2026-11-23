"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Navigation, X } from "lucide-react";
import { GAME } from "@/config/game";
import { distanceMeters, liveEligible, placeById, walkById, type Run } from "@/lib/game";
import { act } from "@/lib/game-store";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import type { LocationState } from "@/lib/location";
import type { LngLat } from "@/types/routes";
import { FoxAvatar, haptic, ICON_STROKE, SPRING } from "./ui";

// The caller keys this component by run, leg and mode. A remount resumes
// from the last stamp with movement paused, including after leaving Explore.
export function WalkControls({ run, location, locale, onPosition, onComplete, onExit, onResumeGps }: {
  run: Run; location: LocationState; locale: Locale;
  onPosition: (point: LngLat) => void; onComplete: () => void; onExit: () => void; onResumeGps: () => void;
}) {
  const walk = walkById(run.walkId)!;
  const step = run.stamps.length;
  const target = placeById(walk.placeIds[step])!;
  const line = walk.geometry.coordinates;
  function nearest(point: LngLat, from: number) {
    const distance = (p: LngLat) => Math.hypot(p[0] - point[0], p[1] - point[1]);
    let best = from;
    for (let i = from; i < line.length; i++) {
      if (distance(line[i]) < distance(line[best])) best = i;
    }
    return best;
  }
  const start = step ? nearest(placeById(walk.placeIds[step - 1])!.location, 0) : 0;
  const end = nearest(target.location, start);
  const [elapsed, setElapsed] = useState(0);
  const [motionState, setMotion] = useState<"idle" | "moving" | "paused">("idle");
  const moving = motionState === "moving";
  const [now, setNow] = useState(Date.now);
  const reduced = useReducedMotion();
  const demo = location.mode === "demo";
  const arrived = start === end || elapsed >= GAME.demoLegMs;
  const demoIndex = start + Math.round((end - start) * elapsed / GAME.demoLegMs);
  useEffect(() => {
    if (!demo || !moving || arrived) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const current = performance.now();
      const delta = current - last;
      last = current;
      setElapsed(value => Math.min(GAME.demoLegMs, value + delta));
    }, 80);
    return () => clearInterval(timer);
  }, [demo, moving, arrived]);
  useEffect(() => {
    if (demo) onPosition(line[demoIndex]);
  }, [demo, demoIndex, line, onPosition]);
  useEffect(() => {
    if (location.mode !== "live") return;
    const sync = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(sync);
      window.clearInterval(timer);
    };
  }, [location.mode, location.fix?.timestamp]);
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const checkNow = location.fix && location.fix.timestamp > now &&
    location.fix.timestamp - now <= GAME.maxClockSkewMs
    ? location.fix.timestamp : now;
  const eligible = demo ? arrived : liveEligible(location, target.location, checkNow);
  const here: LngLat | null = demo ? line[demoIndex] : location.fix ? [location.fix.longitude, location.fix.latitude] : null;
  const remaining = here ? Math.round(distanceMeters(here, target.location) / 10) * 10 : null;
  const last = step > 0 ? run.stamps[step - 1] : null;
  const gpsIdle = location.mode === "live" && !["requesting", "active", "lowAccuracy", "outsideKyoto"].includes(location.gpsStatus);
  const other = locale === "en" ? "ja" : "en";
  return <div className="follow-card">
    {last && <motion.p role="status" className="stamp-receipt" initial={reduced ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING}>
      <span className="stamp-seal" aria-hidden="true">印</span>
      <span><strong>{t("receiptEarned", { points: String(last.points) })}</strong>
        <small>{last.multiplier > 1 ? t("receiptOffPeak", { base: String(GAME.checkpointPoints), multiplier: last.multiplier.toFixed(1) }) : t("receiptStandard", { base: String(GAME.checkpointPoints) })}</small></span>
    </motion.p>}
    <div className="follow-head">
      <FoxAvatar state={eligible ? "arrived" : moving ? "walking" : "idle"} size={40} />
      <div>
        <small className="follow-progress">{t("followStop", { current: String(step + 1), total: String(walk.placeIds.length) })}{remaining !== null && ` · ${t("followRemaining", { meters: String(remaining) })}`}</small>
        <strong className="follow-title">{target.name[locale]}</strong>
        <small lang={other}>{target.name[other]}</small>
      </div>
      <button type="button" className="icon-button" aria-label={t("gameStopWalk")} onClick={onExit}><X size={20} strokeWidth={ICON_STROKE} /></button>
    </div>
    <div className="follow-actions">
      {demo && !arrived && <button type="button" className="follow-secondary" onClick={() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setElapsed(GAME.demoLegMs);
        else setMotion(moving ? "paused" : "moving");
      }}>{t(moving ? "gamePause" : motionState === "paused" ? "gameContinue" : "gameMove")}</button>}
      {demo && (motionState !== "idle" || elapsed > 0) && <button type="button" className="follow-secondary" onClick={() => { setMotion("idle"); setElapsed(0); }}>{t("gameResetLeg")}</button>}
      {gpsIdle && <button type="button" className="follow-secondary" onClick={onResumeGps}><Navigation size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("locationUseMyLocation")}</button>}
      <button type="button" className="follow-check" data-ready={eligible} disabled={!eligible} onClick={async () => {
        const awarded = await act({ type: "collect", runId: run.id, placeId: target.id, location });
        if (!awarded) return;
        haptic();
        if (step + 1 === walk.placeIds.length) onComplete();
      }}>{t(demo ? "gameSimulate" : "gameCheck")}</button>
    </div>
    {!demo && !eligible && <small className="follow-hint">{t("gameGpsHint", { radius: String(GAME.radiusMeters), accuracy: String(GAME.maxAccuracyMeters) })}</small>}
  </div>;
}
