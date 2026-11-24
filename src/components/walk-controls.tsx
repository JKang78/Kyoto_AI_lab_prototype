"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ListTree, Navigation, Pause, X } from "lucide-react";
import { GAME } from "@/config/game";
import { distanceMeters, liveEligible, placeById, walkById, type Game, type Run } from "@/lib/game";
import { act } from "@/lib/game-store";
import { bonusNameKey, translate, type Locale, type MessageKey } from "@/lib/i18n";
import type { LocationState } from "@/lib/location";
import type { LngLat } from "@/types/routes";
import { Button, FoxAvatar, haptic, ICON_STROKE, SPRING, StopBeads } from "./ui";
import { CheckpointVoucherTrack } from "./voucher-progress";
import { kyotoSeason, PlaceSeal, SeasonSprite } from "./glyphs";
import { StoryDialog } from "./place-media";
import { ETIQUETTE_ZONES, etiquetteZoneAt, kyotoDay, markEtiquetteSeen, readEtiquetteSeen, shouldShowEtiquette, type EtiquetteZone } from "@/lib/etiquette";

// The caller keys this component by run, leg and mode. A remount resumes
// from the last stamp with movement paused, including after leaving Explore.
export function WalkControls({ game, run, location, locale, onPosition, onComplete, onExit, onResumeGps, onPauseGps }: {
  game: Game; run: Run; location: LocationState; locale: Locale;
  onPosition: (point: LngLat) => void; onComplete: () => void; onExit: () => void; onResumeGps: () => void; onPauseGps: () => void;
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
  // This card remounts after each stamp, so a stamp younger than ~2 s means one was just accepted (visuals.md F2).
  const [celebrating, setCelebrating] = useState(() => Boolean(last?.at && Date.now() - last.at < 2000));
  // Seasonal sprites by Kyoto month (visuals.md E10): maple Oct–Dec, cherry Mar–Apr, sparkle otherwise.
  const [season] = useState(() => kyotoSeason(Date.now()));
  const [storyPlace, setStoryPlace] = useState<string | null>(null);
  const [etiquette, setEtiquette] = useState<EtiquetteZone | null>(null);
  const [showItinerary, setShowItinerary] = useState(false);
  useEffect(() => {
    if (!celebrating) return;
    const timer = window.setTimeout(() => setCelebrating(false), 900);
    return () => window.clearTimeout(timer);
  }, [celebrating]);
  // Non-blocking etiquette toast (design_system §6.1, FR-17): once per zone per Kyoto day, auto-hides after 6 s.
  const zone = etiquetteZoneAt(here);
  const zoneId = zone?.id;
  useEffect(() => {
    if (!zoneId) return;
    const today = kyotoDay(Date.now());
    if (!shouldShowEtiquette(zoneId, readEtiquetteSeen(), today)) return;
    // Mark the zone seen only once the toast is really shown (dev Strict Mode runs effects twice).
    const show = window.setTimeout(() => {
      markEtiquetteSeen(zoneId, today);
      setEtiquette(ETIQUETTE_ZONES.find(item => item.id === zoneId) ?? null);
    }, 0);
    return () => window.clearTimeout(show);
  }, [zoneId]);
  useEffect(() => {
    if (!etiquette) return;
    const timer = window.setTimeout(() => setEtiquette(null), 6000);
    return () => window.clearTimeout(timer);
  }, [etiquette]);
  const gpsActive = location.mode === "live" && ["requesting", "active", "lowAccuracy", "outsideKyoto"].includes(location.gpsStatus);
  const gpsIdle = location.mode === "live" && !gpsActive;
  const other = locale === "en" ? "ja" : "en";
  return <div className="follow-card" data-demo={demo}>
    {etiquette && <div className="etiquette-toast" role="status" aria-label={t("etiquetteLabel")}>
      <FoxAvatar state="warning" size={40} />
      <p><span>{etiquette.message[locale]}</span><small>{t("etiquetteDemo")}</small></p>
      <button type="button" className="icon-button" aria-label={t("close")} onClick={() => setEtiquette(null)}><X size={18} strokeWidth={ICON_STROKE} /></button>
    </div>}
    {celebrating && !reduced && <span className="season-burst" data-season={season} aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => <span key={index} style={{ "--i": index } as CSSProperties}><SeasonSprite season={season} /></span>)}
    </span>}
    {demo && <p className="demo-badge follow-demo-badge">{t("followDemoBadge")}</p>}
    {last && <motion.p role="status" className="stamp-receipt" initial={reduced ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING}>
      <span className="stamp-slam" data-fresh={celebrating}>
        <motion.span className="stamp-seal" aria-hidden="true" initial={reduced || !celebrating ? false : { y: -28, scale: 1.7, rotate: -22, opacity: 0 }}
          animate={{ y: 0, scale: 1, rotate: -6, opacity: 1 }} transition={SPRING}><PlaceSeal placeId={last.placeId} size={22} /></motion.span>
        {celebrating && !reduced && <span className="ink-ring" aria-hidden="true" />}
      </span>
      <span className="receipt-text"><strong>{t("receiptEarned", { points: String(last.points) })}</strong>
        <small>{last.campaign ? t("receiptBonus", { base: String(GAME.checkpointPoints), multiplier: last.multiplier.toFixed(1), name: t(bonusNameKey[last.campaign]) }) : t("receiptStandard", { base: String(GAME.checkpointPoints) })}</small>
        <small className="receipt-verification">{t(last.mode === "demo" ? "receiptSimulated" : "receiptGps")}</small></span>
      <button type="button" className="receipt-story" onClick={() => setStoryPlace(last.placeId)}>{t("storyRead")}</button>
    </motion.p>}
    {storyPlace && <StoryDialog placeId={storyPlace} locale={locale} onClose={() => setStoryPlace(null)} />}
    <div className="follow-head">
      <FoxAvatar state={celebrating ? "reward" : eligible ? "arrived" : moving ? "walking" : "idle"} size={40} />
      <div>
        <div className="follow-step">
          <small className="follow-progress">{t("followStop", { current: String(step + 1), total: String(walk.placeIds.length) })}{remaining !== null && ` · ${t("followRemaining", { meters: String(remaining) })}`}</small>
          <StopBeads total={walk.placeIds.length} done={step} label={t("hudBeads", { stamps: String(step), total: String(walk.placeIds.length) })} />
        </div>
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
      {gpsActive && <button type="button" className="follow-secondary" onClick={onPauseGps}><Pause size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("gpsPause")}</button>}
      {gpsIdle && <button type="button" className="follow-secondary" onClick={onResumeGps}><Navigation size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("gpsResume")}</button>}
      <button type="button" className="follow-secondary" aria-expanded={showItinerary} onClick={() => setShowItinerary(value => !value)}>
        <ListTree size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("walkItineraryToggle")}
      </button>
      <Button type="button" className="follow-check" data-ready={eligible} disabled={!eligible} onClick={async () => {
        const awarded = await act({ type: "collect", runId: run.id, placeId: target.id, location });
        if (!awarded) return;
        haptic();
        if (step + 1 === walk.placeIds.length) onComplete();
      }}>{t(demo ? "gameSimulate" : "gameCheck")}</Button>
    </div>
    {showItinerary && <div className="follow-itinerary" role="region" aria-label={t("walkItineraryTitle")}>
      <ol>{walk.placeIds.map((id, index) => {
        const place = placeById(id);
        const state = index < step ? "done" : index === step ? "next" : "upcoming";
        return place ? <li key={id} data-state={state}>
          <span className="follow-itinerary-index">{index + 1}</span>
          <span><strong>{place.name[locale]}</strong><small>{place.accessNotes[locale]}</small></span>
          <span className="follow-itinerary-badge">{t(state === "done" ? "walkItineraryDone" : state === "next" ? "walkItineraryNext" : "walkItineraryUpcoming")}</span>
        </li> : null;
      })}</ol>
    </div>}
    <CheckpointVoucherTrack game={game} locale={locale} compact />
    {!demo && !eligible && <small className="follow-hint">{t("gameGpsHint", { radius: String(GAME.radiusMeters), accuracy: String(GAME.maxAccuracyMeters) })}</small>}
  </div>;
}
