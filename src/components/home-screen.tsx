"use client";

import { Bell, Check, ChevronsRight, Lock, Plus, Ticket } from "lucide-react";
import { COUPONS, DEMO_TRAIL } from "@/config/game";
import { activeRun, balance, walkById, type Game } from "@/lib/game";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import { FoxAvatar, haptic, ICON_STROKE, type FoxState } from "./ui";

function walkedMeters(game: Game): number {
  let meters = 0;
  for (const run of game.runs) {
    const walk = walkById(run.walkId);
    if (!walk) continue;
    if (run.complete) meters += walk.estimatedMeters;
    else if (run.stamps.length > 0) meters += Math.round((walk.estimatedMeters * run.stamps.length) / walk.placeIds.length);
  }
  return meters;
}

export function HomeScreen({
  game,
  locale,
  name,
  hasNotice,
  onExplore,
  onRewards,
  onMissions,
  onMe,
}: {
  game: Game;
  locale: Locale;
  name: string;
  hasNotice: boolean;
  onExplore: () => void;
  onRewards: () => void;
  onMissions: () => void;
  onMe: () => void;
}) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const points = balance(game);
  const run = activeRun(game);
  const activeWalk = run ? walkById(run.walkId) : undefined;
  const seals = new Set(game.runs.flatMap((item) => item.stamps.map((stamp) => stamp.placeId))).size;
  const meters = walkedMeters(game);
  const sortedCoupons = [...COUPONS].sort((a, b) => a.cost - b.cost);
  const maxCost = sortedCoupons.at(-1)?.cost ?? 120;
  const nextCoupon = sortedCoupons.find((coupon) => !game.claims.some((claim) => claim.id === coupon.id));
  const affordable = Boolean(nextCoupon && points >= nextCoupon.cost);
  const pct = Math.min(1, Math.max(0, points / maxCost)) * 100;

  const foxState: FoxState = run ? "walking" : affordable ? "reward" : "idle";
  const statusText = run
    ? t("homeStatusActive")
    : affordable
      ? t("homeStatusReady")
      : seals > 0
        ? t("homeStatusExploring")
        : t("homeStatusIdle");
  const badgeText = run && activeWalk
    ? t("homeBadgeActive", { current: String(run.stamps.length), total: String(activeWalk.placeIds.length) })
    : seals > 0
      ? t("homeBadgeSeals", { count: String(seals), goal: String(DEMO_TRAIL.goal) })
      : t("homeBadgeIdle");

  const distanceText = meters >= 1000
    ? t("homeStatKm", { km: (meters / 1000).toFixed(1) })
    : t("homeStatMeters", { meters: String(meters) });

  const ctaMode = run ? "continue" : affordable ? "unlock" : "explore";
  const ctaLabel = ctaMode === "continue"
    ? t("homeCtaContinue")
    : ctaMode === "unlock"
      ? t("homeCtaUnlock")
      : t("homeCtaExplore");
  const handleCta = () => {
    haptic();
    if (ctaMode === "unlock") onRewards();
    else onExplore();
  };

  return (
    <div className="home-screen">
      <header className="home-top">
        <button
          type="button"
          className="home-points-pill"
          aria-label={t("homePointsPillLabel", { points: String(points) })}
          onClick={() => { haptic(); onRewards(); }}
        >
          <span className="home-points-pill-value">{points}</span>
          <span className="home-coin-mark" aria-hidden="true">京</span>
        </button>

        <div className="home-top-actions">
          <button
            type="button"
            className="home-icon-btn"
            aria-label={t("homeBellLabel")}
            onClick={() => { haptic(); if (affordable) onRewards(); else onMissions(); }}
          >
            <Bell size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />
            {(affordable || hasNotice) && <span className="home-bell-dot" aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="home-avatar-btn"
            aria-label={t("homeAvatarLabel")}
            onClick={() => { haptic(); onMe(); }}
          >
            <FoxAvatar state="idle" size={38} />
          </button>
        </div>
      </header>

      <section className="home-greeting" aria-label={t("navHome")}>
        <p className="home-hello">{t("homeGreeting", { name })}</p>
        <div className="home-status-row">
          <span className="home-status-copy">{statusText}</span>
          <span className="home-status-badge" data-active={Boolean(run || affordable)}>{badgeText}</span>
        </div>
      </section>

      <section className="home-hero" aria-label={t("gameProgress")}>
        <div className="home-hero-main">
          <div className="home-hero-number">
            <strong data-home-points>{points}</strong>
            <span>{t("homePointsUnit")}</span>
          </div>
          <div className="home-hero-fox">
            <FoxAvatar state={foxState} size={74} />
          </div>
        </div>

        <div className="home-stat-chips">
          <span className="home-stat-chip">{distanceText}</span>
          <span className="home-stat-chip">{t("homeStatSeals", { count: String(seals) })}</span>
          <button
            type="button"
            className="home-stat-plus"
            aria-label={t("homeQuickWalk")}
            onClick={() => { haptic(); onExplore(); }}
          >
            <Plus size={20} strokeWidth={ICON_STROKE + 0.5} aria-hidden="true" />
          </button>
        </div>

        <p className="home-demo-caption">{t("celebrateDemo")}</p>
      </section>

      <section className="home-milestone" aria-label={t("rewardsTrackLabel")}>
        <div className="home-track" role="group" aria-label={t("rewardsTrackLabel")}>
          <div className="home-track-rail" aria-hidden="true">
            <span className="home-track-fill" style={{ width: `${pct}%` }} />
          </div>

          <span className="home-track-origin" aria-hidden="true">0</span>

          <span
            className="home-track-cursor"
            style={{ left: `${pct}%` }}
            role="img"
            aria-label={t("rewardsTrackYou", { points: String(points) })}
          >
            <span className="home-track-halo" aria-hidden="true" />
            <span className="home-track-thumb" aria-hidden="true" />
          </span>

          {sortedCoupons.map((coupon) => {
            const left = `${Math.min(1, Math.max(0, coupon.cost / maxCost)) * 100}%`;
            const claimed = game.claims.some((claim) => claim.id === coupon.id);
            const state = claimed ? "done" : points >= coupon.cost ? "ready" : "locked";
            const Icon = state === "done" ? Check : state === "ready" ? Ticket : Lock;
            return (
              <span
                key={coupon.id}
                className="home-track-node"
                data-state={state}
                style={{ left }}
                role="img"
                aria-label={`${coupon.offer[locale]} · ${t("pointsValue", { points: String(coupon.cost) })}`}
              >
                <span className="home-track-badge" aria-hidden="true">
                  <Icon size={12} strokeWidth={ICON_STROKE + 0.5} />
                  <span>{coupon.cost}</span>
                </span>
                <span className="home-track-dot" aria-hidden="true" />
                <small className="home-track-label">{coupon.cost}</small>
              </span>
            );
          })}
        </div>

        <p className="home-milestone-note">
          {nextCoupon
            ? points >= nextCoupon.cost
              ? t("rewardsReady", { offer: nextCoupon.offer[locale] })
              : t("rewardsNext", { points: String(nextCoupon.cost - points), offer: nextCoupon.offer[locale] })
            : t("rewardsAllUnlocked")}
        </p>
      </section>

      <div className="home-cta-wrap">
        <button type="button" className="home-cta" onClick={handleCta}>
          <span className="home-cta-emblem" aria-hidden="true">
            <FoxAvatar state={foxState} size={42} />
          </span>
          <ChevronsRight className="home-cta-chevrons" size={20} strokeWidth={ICON_STROKE + 0.5} aria-hidden="true" />
          <span className="home-cta-label">{ctaLabel}</span>
        </button>

        {ctaMode === "unlock" && (
          <button
            type="button"
            className="home-secondary-link"
            onClick={() => { haptic(); onExplore(); }}
          >
            {t("homeSecondaryExplore")}
          </button>
        )}
      </div>
    </div>
  );
}
