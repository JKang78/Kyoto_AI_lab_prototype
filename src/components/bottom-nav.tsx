"use client";

import { Compass, Settings2, Stamp, Ticket, type LucideIcon } from "lucide-react";
import type { Locale, MessageKey } from "@/lib/i18n";
import { translate } from "@/lib/i18n";
import { haptic, ICON_STROKE } from "./ui";

export type Tab = "explore" | "quests" | "wallet" | "settings";
const items: { id: Tab; label: MessageKey; icon: LucideIcon }[] = [
  { id: "explore", label: "navExplore", icon: Compass },
  { id: "quests", label: "navQuests", icon: Stamp },
  { id: "wallet", label: "navWallet", icon: Ticket },
  { id: "settings", label: "navSettings", icon: Settings2 },
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
