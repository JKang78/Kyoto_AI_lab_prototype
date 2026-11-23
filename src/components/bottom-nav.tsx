"use client";

import { Compass, Stamp, Ticket, type LucideIcon } from "lucide-react";
import type { Locale, MessageKey } from "@/lib/i18n";
import { translate } from "@/lib/i18n";
import { FoxAvatar, haptic, ICON_STROKE } from "./ui";

export type Tab = "explore" | "missions" | "rewards" | "me";
const items: { id: Tab; label: MessageKey; icon: LucideIcon | null }[] = [
  { id: "explore", label: "navExplore", icon: Compass },
  { id: "missions", label: "navMissions", icon: Stamp },
  { id: "rewards", label: "navRewards", icon: Ticket },
  { id: "me", label: "navMe", icon: null }, // The fox stands in for "me" (visuals.md Me1).
];

export function BottomNav({ active, locale, onSelect, dots = {} }: { active: Tab; locale: Locale; onSelect: (tab: Tab) => void; dots?: Partial<Record<Tab, boolean>> }) {
  return <nav className="dock" aria-label={translate(locale, "navLabel")}>
    {items.map(({ id, label, icon: Icon }) => <button type="button" key={id} className="dock-item" aria-current={active === id ? "page" : undefined}
      aria-describedby={dots[id] ? `dock-new-${id}` : undefined}
      onClick={() => { if (active !== id) haptic(); onSelect(id); }}>
      {Icon ? <Icon size={22} strokeWidth={ICON_STROKE} aria-hidden="true" /> : <FoxAvatar state="idle" size={26} />}
      <span>{translate(locale, label)}</span>
      {dots[id] && <span className="dock-dot" data-tab-dot={id} aria-hidden="true" />}
      {dots[id] && <span id={`dock-new-${id}`} hidden>{translate(locale, "navNew")}</span>}
    </button>)}
  </nav>;
}
