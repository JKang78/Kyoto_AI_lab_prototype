"use client";

import { Gift, House, MapPin, Settings2, Ticket, type LucideIcon } from "lucide-react";
import type { Locale, MessageKey } from "@/lib/i18n";
import { translate } from "@/lib/i18n";

export type Tab = "home" | "map" | "rewards" | "missions" | "settings";
const items: { id: Tab; label: MessageKey; icon: LucideIcon }[] = [
  { id: "home", label: "navHome", icon: House },
  { id: "map", label: "navMap", icon: MapPin },
  { id: "rewards", label: "navRewards", icon: Gift },
  { id: "missions", label: "navMissions", icon: Ticket },
  { id: "settings", label: "navSettings", icon: Settings2 },
];

export function BottomNav({ active, locale, onSelect }: { active: Tab; locale: Locale; onSelect: (tab: Tab) => void }) {
  return <nav className="bottom-nav" aria-label={locale === "ja" ? "メインナビゲーション" : "Main navigation"}>
    {items.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${active === id ? "nav-item--active" : ""}`} aria-current={active === id ? "page" : undefined} onClick={() => onSelect(id)}>
      <Icon size={24} strokeWidth={active === id ? 2.2 : 1.8} aria-hidden="true" />
      <span>{translate(locale, label)}</span>
    </button>)}
  </nav>;
}
