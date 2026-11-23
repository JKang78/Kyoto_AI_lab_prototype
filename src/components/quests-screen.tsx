"use client";
import { useState } from "react";
import { Landmark, Trees, Waves } from "lucide-react";
import { OFF_PEAK } from "@/config/game";
import { CURATED_WALKS } from "@/data/kyoto-walks";
import { offPeakWindow, placeById, walkReward, walkStatus, type Game, type Stamp } from "@/lib/game";
import { formatKyotoDateTime, formatKyotoTime, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { Button, ICON_STROKE, Segmented, useNow } from "./ui";

type Segment = "available" | "active" | "completed";
const themeIcons = { culture: Landmark, riverside: Waves, park: Trees };
const segmentOf = (status: ReturnType<typeof walkStatus>["status"]): Segment => status === "active" ? "active" : status === "completed" ? "completed" : "available";

function SurgeCard({ game, locale }: { game: Game; locale: Locale }) {
  const now = useNow(1000);
  const window_ = offPeakWindow(game, now);
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const remaining = Math.max(0, window_.changesAt - now);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor(remaining / 60_000) % 60;
  const span = (OFF_PEAK.endHour - OFF_PEAK.startHour) * 3_600_000;
  const progress = window_.active && !window_.simulated ? Math.min(1, remaining / span) : 0;
  return <section className="surge-card" data-active={window_.active}>
    <p className="surge-rate"><strong>{window_.multiplier.toFixed(1)}×</strong><span>{t(window_.active ? (window_.simulated ? "surgeSimulated" : "surgeActive") : "surgeStandard")}</span></p>
    {!window_.simulated && <>
      <p className="surge-countdown">{t(window_.active ? "surgeEndsIn" : "surgeStartsIn", { hours: String(hours), minutes: String(minutes).padStart(2, "0"), time: formatKyotoTime(window_.changesAt) })}</p>
      {window_.active && <div className="surge-bar" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>}
    </>}
    <p className="surge-why">{t("surgeWhy", { start: String(OFF_PEAK.startHour).padStart(2, "0"), end: String(OFF_PEAK.endHour).padStart(2, "0") })}</p>
    <small>{t("offPeakSource")}</small>
  </section>;
}

function GoshuinBook({ game, locale }: { game: Game; locale: Locale }) {
  const collected = new Map<string, Stamp>();
  for (const run of game.runs) for (const stamp of run.stamps) if (!collected.has(stamp.placeId)) collected.set(stamp.placeId, stamp);
  return <section className="goshuin-book" aria-labelledby="goshuin-title">
    <h2 id="goshuin-title">{translate(locale, "goshuinTitle")}</h2>
    <p>{translate(locale, "goshuinBody")}</p>
    {CURATED_WALKS.map(walk => <div key={walk.id} className="goshuin-page">
      <h3>{walk.name[locale]}</h3>
      <ol>{walk.placeIds.map(id => {
        const place = placeById(id);
        const stamp = collected.get(id);
        return <li key={id} data-collected={Boolean(stamp)}>
          <span className="goshuin-seal" aria-hidden="true">{stamp ? "印" : ""}</span>
          <span className="goshuin-name">{place?.name[locale]}</span>
          <small>{stamp ? stamp.at ? formatKyotoDateTime(locale, stamp.at) : translate(locale, "goshuinCollected") : translate(locale, "goshuinEmpty")}</small>
        </li>;
      })}</ol>
    </div>)}
  </section>;
}

export function Quests({ game, locale, onWalk }: { game: Game; locale: Locale; onWalk: (id: string) => void }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const walks = CURATED_WALKS.map(walk => ({ walk, status: walkStatus(game, walk.id) }));
  const [segment, setSegment] = useState<Segment>(() => walks.some(item => item.status.status === "active") ? "active" : "available");
  const { multiplier } = offPeakWindow(game, useNow(30_000));
  const shown = walks.filter(item => segmentOf(item.status.status) === segment);
  const count = (id: Segment) => walks.filter(item => segmentOf(item.status.status) === id).length;
  return <div className="content-screen">
    <h1>{t("navQuests")}</h1>
    <SurgeCard game={game} locale={locale} />
    <Segmented label={t("questsFilterLabel")} value={segment} onChange={setSegment} options={[
      { id: "available", label: t("questsAvailable", { count: String(count("available")) }) },
      { id: "active", label: t("questsActive", { count: String(count("active")) }) },
      { id: "completed", label: t("questsCompleted", { count: String(count("completed")) }) },
    ]} />
    <div className="quest-list">
      {shown.length ? shown.map(({ walk, status }) => {
        const Icon = themeIcons[walk.theme];
        const total = walk.placeIds.length;
        const reward = walkReward(walk.id, multiplier);
        return <article key={walk.id} className={`quest-card route-card--${walk.theme}`}>
          <header><span className="route-card-icon" aria-hidden="true"><Icon size={18} strokeWidth={ICON_STROKE} /></span><h2>{walk.name[locale]}</h2></header>
          <p>{walk.description[locale]}</p>
          <div className="quest-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={status.stamps} aria-label={t("questProgress", { stamps: String(status.stamps), total: String(total) })}>
            <span style={{ transform: `scaleX(${status.stamps / total})` }} />
          </div>
          <p className="quest-meta"><span>{t("questProgress", { stamps: String(status.stamps), total: String(total) })}</span><span>{t("routeRewardNow", { points: String(reward.now) })}</span></p>
          {status.status === "stopped" && <small className="quest-note">{t("gameStopped")}</small>}
          {status.completedCount > 0 && <small className="quest-note">{t("questCompletedCount", { count: String(status.completedCount) })}</small>}
          <Button variant={status.status === "active" ? "primary" : "secondary"} onClick={() => onWalk(walk.id)}>{t("gameViewMap")}</Button>
        </article>;
      }) : <p className="empty-note">{t(segment === "active" ? "questsEmptyActive" : segment === "completed" ? "questsEmptyCompleted" : "questsEmptyAvailable")}</p>}
    </div>
    <GoshuinBook game={game} locale={locale} />
  </div>;
}
