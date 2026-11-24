"use client";
import { useEffect, useState } from "react";
import { Landmark, Trees, Waves } from "lucide-react";
import { DEMO_TRAIL } from "@/config/game";
import { PREVIEW_CONTROLS } from "@/config/environment";
import { CURATED_WALKS } from "@/data/kyoto-walks";
import { activeBonus, activeRun, placeById, scenarioByKind, walkById, walkReward, walkStatus, type Game, type Stamp } from "@/lib/game";
import { bonusNameKey, bonusScenarioKey, formatKyotoDateTime, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { Button, EmptyState, FoxAvatar, ICON_STROKE, Segmented, StopBeads } from "./ui";
import { kyotoSeason, PlaceSeal, SeasonSprite, type Season } from "./glyphs";
import { StoryDialog } from "./place-media";

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
    <p className="surge-why">{t(PREVIEW_CONTROLS ? "missionsBonusBody" : "missionsBonusBodyPublic")}</p>
    <small>{t("missionsVerifyNote")}</small>
  </section>;
}

function GoshuinBook({ game, locale, onStory }: { game: Game; locale: Locale; onStory: (placeId: string) => void }) {
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
        const body = <>
          <span className="goshuin-seal" aria-hidden="true"><PlaceSeal placeId={id} size={26} /></span>
          <span className="goshuin-name">{place?.name[locale]}</span>
          <small>{stamp ? stamp.at ? formatKyotoDateTime(locale, stamp.at) : translate(locale, "goshuinCollected") : translate(locale, "goshuinEmpty")}</small>
        </>;
        return <li key={id} data-collected={Boolean(stamp)}>
          {stamp ? <button type="button" className="goshuin-open" aria-label={translate(locale, "storyOpen", { place: place?.name[locale] ?? "" })} onClick={() => onStory(id)}>{body}</button> : body}
        </li>;
      })}</ol>
    </div>)}
  </section>;
}

/** The walk in progress leads Missions with its beads, next stop and Resume (visuals.md M1). */
function ActiveHero({ game, locale, onWalk }: { game: Game; locale: Locale; onWalk: (id: string) => void }) {
  const run = activeRun(game);
  const walk = run && walkById(run.walkId);
  if (!run || !walk) return null;
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const next = placeById(walk.placeIds[run.stamps.length]);
  const total = walk.placeIds.length;
  return <section className="mission-hero" aria-labelledby="mission-hero-title">
    <FoxAvatar state="walking" size={56} />
    <div>
      <p className="mission-hero-eyebrow">{t("missionsHeroEyebrow")}</p>
      <h2 id="mission-hero-title">{walk.name[locale]}</h2>
      <StopBeads total={total} done={run.stamps.length} label={t("hudBeads", { stamps: String(run.stamps.length), total: String(total) })} />
      {next && <p className="mission-hero-next">{t("missionsHeroNext", { place: next.name[locale] })}</p>}
    </div>
    <Button onClick={() => onWalk(walk.id)}>{t("gameResume")}</Button>
  </section>;
}

/** Demo seasonal trail: collect a number of different seals on any walks (visuals.md M4). */
function TrailCard({ game, locale }: { game: Game; locale: Locale }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const [season] = useState(() => kyotoSeason(Date.now()));
  const seals = new Set(game.runs.flatMap(run => run.stamps.map(stamp => stamp.placeId))).size;
  const done = Math.min(seals, DEMO_TRAIL.goal);
  const complete = seals >= DEMO_TRAIL.goal;
  const titleKey: Record<Season, MessageKey> = { momiji: "trailTitleAutumn", sakura: "trailTitleSpring", sparkle: "trailTitleKyoto" };
  return <section className="trail-card" data-season={season} data-complete={complete} aria-labelledby="trail-title">
    <div className="trail-head">
      <span className="trail-sprite" aria-hidden="true"><SeasonSprite season={season} size={22} /></span>
      <h2 id="trail-title">{t(titleKey[season])}</h2>
      {complete && <FoxAvatar state="reward" size={40} />}
    </div>
    <p>{complete ? t("trailDone") : t("trailBody", { goal: String(DEMO_TRAIL.goal) })}</p>
    <div className="trail-progress">
      <StopBeads total={DEMO_TRAIL.goal} done={done} label={t("trailProgress", { count: String(done), goal: String(DEMO_TRAIL.goal) })} />
      <span>{t("trailProgress", { count: String(done), goal: String(DEMO_TRAIL.goal) })}</span>
    </div>
  </section>;
}

export function Missions({ game, locale, onWalk, focusStampBook = false }: { game: Game; locale: Locale; onWalk: (id: string) => void; focusStampBook?: boolean }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const walks = CURATED_WALKS.map(walk => ({ walk, status: walkStatus(game, walk.id) }));
  const [storyPlace, setStoryPlace] = useState<string | null>(null);
  const [segment, setSegment] = useState<Segment>("available");
  const shown = walks.filter(item => segmentOf(item.status.status) === segment);
  const count = (id: Segment) => walks.filter(item => segmentOf(item.status.status) === id).length;
  useEffect(() => {
    if (focusStampBook) document.getElementById("goshuin-title")?.scrollIntoView({ block: "start" });
  }, [focusStampBook]);
  return <div className="content-screen figma-missions">
    <h1>{t("navMissions")}</h1>
    <p className="figma-page-intro">{locale === "ja" ? "散歩を選び、3つのスポットでチェックイン。最大60 ptsを獲得できます。" : "Choose a walk, check in at its 3 stops, and earn up to 60 pts."}</p>
    <Segmented label={t("missionsFilterLabel")} value={segment} onChange={setSegment} options={[
      { id: "available", label: t("missionsAvailable", { count: String(count("available")) }) },
      { id: "active", label: t("missionsActive", { count: String(count("active")) }) },
      { id: "completed", label: t("missionsCompleted", { count: String(count("completed")) }) },
    ]} />
    {segment !== "active" && <ActiveHero game={game} locale={locale} onWalk={onWalk} />}
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
          <p className="quest-meta"><span>{status.stamps}/{total} {locale === "ja" ? "スタンプ" : "stamps"}</span><span>{locale === "ja" ? `最大 ${reward.now} pts` : `Earn up to ${reward.now} pts`}{bonus && ` · ${t("bonusShort", { name: t(bonusNameKey[bonus.kind]), multiplier: bonus.multiplier.toFixed(1) })}`}</span></p>
          {status.status === "stopped" && <small className="quest-note">{t("gameStopped")}</small>}
          {status.completedCount > 0 && <small className="quest-note">{t("missionCompletedCount", { count: String(status.completedCount) })}</small>}
          <Button variant={status.status === "active" ? "primary" : "secondary"} onClick={() => onWalk(walk.id)}>{t("gameViewMap")}</Button>
        </article>;
      }) : <EmptyState>{t(segment === "active" ? "missionsEmptyActive" : segment === "completed" ? "missionsEmptyCompleted" : "missionsEmptyAvailable")}</EmptyState>}
    </div>
    <details className="figma-mission-more" open={focusStampBook}><summary>{locale === "ja" ? "スタンプ帳とミッション詳細" : "Stamp book & mission details"}</summary>
      <TrailCard game={game} locale={locale} />
      <BonusCard game={game} locale={locale} />
      <GoshuinBook game={game} locale={locale} onStory={setStoryPlace} />
    </details>
    {storyPlace && <StoryDialog placeId={storyPlace} locale={locale} onClose={() => setStoryPlace(null)} />}
  </div>;
}
