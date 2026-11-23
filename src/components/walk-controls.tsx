"use client";
import { useEffect, useState } from "react";
import { GAME } from "@/config/game";
import { liveEligible, placeById, walkById, type Run } from "@/lib/game";
import { act } from "@/lib/game-store";
import { translate, type Locale } from "@/lib/i18n";
import type { LocationState } from "@/lib/location";
import type { LngLat } from "@/types/routes";

// The caller keys this component by run, leg and mode. A remount resumes
// from the last stamp with movement paused, including after leaving Map.
export function WalkControls({ run, location, locale, onPosition, onComplete }: {
  run: Run; location: LocationState; locale: Locale;
  onPosition: (point: LngLat) => void; onComplete: () => void;
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
  const [motion, setMotion] = useState<"idle" | "moving" | "paused">("idle");
  const moving = motion === "moving";
  const [now, setNow] = useState(Date.now);
  const demo = location.mode === "demo";
  const arrived = start === end || elapsed >= GAME.demoLegMs;
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
    if (!demo) return;
    const index = start + Math.round((end - start) * elapsed / GAME.demoLegMs);
    onPosition(line[index]);
  }, [demo, elapsed, end, line, onPosition, start]);
  useEffect(() => {
    if (location.mode !== "live") return;
    const sync = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(sync);
      window.clearInterval(timer);
    };
  }, [location.mode, location.fix?.timestamp]);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const checkNow = location.fix && location.fix.timestamp > now &&
    location.fix.timestamp - now <= GAME.maxClockSkewMs
    ? location.fix.timestamp : now;
  const eligible = demo ? arrived : liveEligible(location, target.location, checkNow);
  return <div className="walk-controls">
    {step > 0 && <small role="status">{translate(locale, "gameStamped", { coins: String(run.stamps[step - 1].coins) })}</small>}
    <strong>{t("gameStop")} {step + 1}/{walk.placeIds.length} · {target.name[locale]}</strong>
    {demo && !arrived && <button onClick={() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setElapsed(GAME.demoLegMs);
      else setMotion(moving ? "paused" : "moving");
    }}>{t(moving ? "gamePause" : motion === "paused" ? "gameContinue" : "gameMove")}</button>}
    {demo && (motion !== "idle" || elapsed > 0) && <button onClick={() => { setMotion("idle"); setElapsed(0); }}>{t("gameResetLeg")}</button>}
    <button disabled={!eligible} onClick={async () => {
      const awarded = await act({ type: "collect", runId: run.id, placeId: target.id, location });
      if (awarded && step + 1 === walk.placeIds.length) onComplete();
    }}>{t(demo ? "gameSimulate" : "gameCheck")}</button>
    {!demo && !eligible && <small>{translate(locale, "gameGpsHint", {
      radius: String(GAME.radiusMeters), accuracy: String(GAME.maxAccuracyMeters),
    })}</small>}
  </div>;
}
