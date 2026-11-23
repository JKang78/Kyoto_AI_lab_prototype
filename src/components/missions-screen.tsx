"use client";
import { useState } from "react";
import { Landmark, Trees, Waves } from "lucide-react";
import { CURATED_WALKS } from "@/data/kyoto-walks";
import { activeBonus, placeById, scenarioByKind, walkById, walkReward, walkStatus, type Game, type Stamp } from "@/lib/game";
import { bonusNameKey, bonusScenarioKey, formatKyotoDateTime, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { Button, ICON_STROKE, Segmented } from "./ui";

type Segment = "available" | "active" | "completed";
const themeIcons = { culture: Landmark, riverside: Waves, park: Trees };
const segmentOf = (status: ReturnType<typeof walkStatus>["status"]): Segment => status === "active" ? "active" : status === "completed" ? "completed" : "available";

/** Explains the two incentives separately and shows which hypothetical scenario, if any, is on. */
function BonusCard({ game, locale }: { game: Game; locale: Locale }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const scenario = game.scenario ? scenarioByKind(game.scenario) : null;
  return <section className="surge-card" data-active={Boolean(scenario)}>
    <p className="surge-rate"><strong>{(scenario?.multiplier ?? 1).toFixed(1)}×</strong><span>{t("missionsBonusTitle")}</span></p>
    <p className="surge-countdown">{scenario ? t("missionsBonusOn", {
      name: t(bonusNameKey[scenario.kind]), multiplier: scenario.multiplier.toFixed(1),
      walk: scenario.walkIds.map(id => walkById(id)?.name[locale]).join(", "),
    }) : t("missionsBonusNone")}</p>
    {scenario && <p className="surge-why">{t(bonusScenarioKey[scenario.kind])}</p>}
    <p className="surge-why">{t("missionsBonusBody")}</p>
    <small>{t("missionsVerifyNote")}</small>
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

export function Missions({ game, locale, onWalk }: { game: Game; locale: Locale; onWalk: (id: string) => void }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const walks = CURATED_WALKS.map(walk => ({ walk, status: walkStatus(game, walk.id) }));
  const [segment, setSegment] = useState<Segment>(() => walks.some(item => item.status.status === "active") ? "active" : "available");
  const shown = walks.filter(item => segmentOf(item.status.status) === segment);
  const count = (id: Segment) => walks.filter(item => segmentOf(item.status.status) === id).length;
  return <div className="content-screen">
    <h1>{t("navMissions")}</h1>
    <BonusCard game={game} locale={locale} />
    <Segmented label={t("missionsFilterLabel")} value={segment} onChange={setSegment} options={[
      { id: "available", label: t("missionsAvailable", { count: String(count("available")) }) },
      { id: "active", label: t("missionsActive", { count: String(count("active")) }) },
      { id: "completed", label: t("missionsCompleted", { count: String(count("completed")) }) },
    ]} />
    <div className="quest-list">
      {shown.length ? shown.map(({ walk, status }) => {
        const Icon = themeIcons[walk.theme];
        const total = walk.placeIds.length;
        const bonus = activeBonus(game, walk.id);
        const reward = walkReward(walk.id, bonus?.multiplier ?? 1);
        return <article key={walk.id} className={`quest-card route-card--${walk.theme}`}>
          <header><span className="route-card-icon" aria-hidden="true"><Icon size={18} strokeWidth={ICON_STROKE} /></span><h2>{walk.name[locale]}</h2></header>
          <p>{walk.description[locale]}</p>
          <div className="quest-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={status.stamps} aria-label={t("missionProgress", { stamps: String(status.stamps), total: String(total) })}>
            <span style={{ transform: `scaleX(${status.stamps / total})` }} />
          </div>
          <p className="quest-meta"><span>{t("missionProgress", { stamps: String(status.stamps), total: String(total) })}</span><span>{t("routeRewardNow", { points: String(reward.now) })}{bonus && ` · ${t("bonusShort", { name: t(bonusNameKey[bonus.kind]), multiplier: bonus.multiplier.toFixed(1) })}`}</span></p>
          {status.status === "stopped" && <small className="quest-note">{t("gameStopped")}</small>}
          {status.completedCount > 0 && <small className="quest-note">{t("missionCompletedCount", { count: String(status.completedCount) })}</small>}
          <Button variant={status.status === "active" ? "primary" : "secondary"} onClick={() => onWalk(walk.id)}>{t("gameViewMap")}</Button>
        </article>;
      }) : <p className="empty-note">{t(segment === "active" ? "missionsEmptyActive" : segment === "completed" ? "missionsEmptyCompleted" : "missionsEmptyAvailable")}</p>}
    </div>
    <GoshuinBook game={game} locale={locale} />
  </div>;
}
