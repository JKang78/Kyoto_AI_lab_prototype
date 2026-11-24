"use client";

import Image from "next/image";
import type { Locale, MessageKey } from "@/lib/i18n";
import { translate } from "@/lib/i18n";
import { FoxAvatar, haptic } from "./ui";

export type Tab = "home" | "explore" | "missions" | "rewards" | "me";
const items: { id: Tab; label: MessageKey; icon?: string; activeIcon?: string }[] = [
  { id: "home", label: "navHome", icon: "/assets/figma/house-icon-inactive.svg", activeIcon: "/assets/figma/house-icon.svg" },
  { id: "explore", label: "navExplore", icon: "/assets/figma/compass-icon.svg", activeIcon: "/assets/figma/compass-icon-active.svg" },
  { id: "missions", label: "navMissions", icon: "/assets/figma/stamp-icon.svg", activeIcon: "/assets/figma/stamp-icon-active.svg" },
  { id: "rewards", label: "navRewards", icon: "/assets/figma/ticket-icon.svg", activeIcon: "/assets/figma/ticket-icon-active.svg" },
  { id: "me", label: "navMe" },
];

export function BottomNav({ active, locale, onSelect, dots = {} }: { active: Tab; locale: Locale; onSelect: (tab: Tab) => void; dots?: Partial<Record<Tab, boolean>> }) {
  return <nav className="dock" aria-label={translate(locale, "navLabel")}>
    {items.map(({ id, label, icon, activeIcon }) => <button type="button" key={id} className="dock-item" aria-current={active === id ? "page" : undefined}
      aria-describedby={dots[id] ? `dock-new-${id}` : undefined}
      onClick={() => { if (active !== id) haptic(); onSelect(id); }}>
      {icon ? <Image src={active === id ? activeIcon ?? icon : icon} width={22} height={22} alt="" aria-hidden="true" /> : <FoxAvatar state="idle" size={26} still />}
      <span>{translate(locale, label)}</span>
      {dots[id] && <span className="dock-dot" data-tab-dot={id} aria-hidden="true" />}
      {dots[id] && <span id={`dock-new-${id}`} hidden>{translate(locale, "navNew")}</span>}
    </button>)}
  </nav>;
}
