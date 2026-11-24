"use client";

import { voucherProjection, type Game } from "@/lib/game";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";

/**
 * Shared segmented checkpoint-to-voucher track (docs/visuals.md).
 * Used in both the active mission follow card and the Rewards header so both views
 * always agree after a stamp, scenario change, claim, reset, or cross-tab update.
 */
export function CheckpointVoucherTrack({
  game,
  locale,
  compact = false,
}: {
  game: Game;
  locale: Locale;
  compact?: boolean;
}) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  const projection = voucherProjection(game);

  const label = (() => {
    if (projection.status === "all_claimed" || !projection.target) return t("trackAllClaimed");
    const offer = projection.target.offer[locale];
    if (projection.status === "ready") return t("rewardsReady", { offer });
    if (projection.status === "reachable_on_walk") {
      return projection.stopsNeeded === 1
        ? t("trackOneStopToUnlock", { offer })
        : t("trackStopsToUnlock", { stops: String(projection.stopsNeeded), offer });
    }
    if (projection.status === "short_after_walk") {
      return t("trackShortAfterWalk", { points: String(projection.shortfall), offer });
    }
    return t("rewardsNext", { points: String(projection.shortfall), offer });
  })();

  const targetCost = projection.target?.cost ?? Math.max(1, projection.points);
  const denom = Math.max(targetCost, projection.segments.at(-1)?.cumulative ?? projection.points, 1);
  const currentPct = Math.min(100, (projection.points / denom) * 100);
  const targetPct = projection.target ? Math.min(100, (projection.target.cost / denom) * 100) : 100;

  return (
    <div className="checkpoint-track" data-compact={compact} data-status={projection.status}>
      <p className="checkpoint-track-label">{label}</p>
      {projection.target && (
        <div className="checkpoint-track-bar" role="group" aria-label={t("rewardsTrackLabel")}>
          <span className="checkpoint-track-spent" style={{ width: `${currentPct}%` }} aria-hidden="true" />
          {projection.segments.map((seg) => {
            const width = Math.max(0, (seg.points / denom) * 100);
            return (
              <span
                key={seg.stopOffset}
                className="checkpoint-track-seg"
                data-unlocks={seg.unlocksTarget}
                data-final={seg.isFinalStop}
                style={{ width: `${width}%` }}
                title={t("trackSegmentLabel", { step: String(seg.stopOffset), points: String(seg.points) })}
              />
            );
          })}
          <span
            className="checkpoint-track-goal"
            style={{ left: `${targetPct}%` }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
