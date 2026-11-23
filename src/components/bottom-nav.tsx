"use client";

import { Compass, Stamp, Ticket, UserRound, type LucideIcon } from "lucide-react";
import type { Locale, MessageKey } from "@/lib/i18n";
import { translate } from "@/lib/i18n";
import { haptic, ICON_STROKE } from "./ui";

export type Tab = "explore" | "missions" | "rewards" | "me";
const items: { id: Tab; label: MessageKey; icon: LucideIcon }[] = [
  { id: "explore", label: "navExplore", icon: Compass },
  { id: "missions", label: "navMissions", icon: Stamp },
  { id: "rewards", label: "navRewards", icon: Ticket },
  { id: "me", label: "navMe", icon: UserRound },
];

export function BottomNav({ active, locale, onSelect }: { active: Tab; locale: Locale; onSelect: (tab: Tab) => void }) {
  return <nav className="dock" aria-label={translate(locale, "navLabel")}>
    {items.map(({ id, label, icon: Icon }) => <button type="button" key={id} className="dock-item" aria-current={active === id ? "page" : undefined}
      onClick={() => { if (active !== id) haptic(); onSelect(id); }}>
      <Icon size={22} strokeWidth={ICON_STROKE} aria-hidden="true" />
      <span>{translate(locale, label)}</span>
    </button>)}
  </nav>;
}
