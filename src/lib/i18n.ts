import en from "@/locales/en.json";
import ja from "@/locales/ja.json";
import type { CampaignKind } from "@/config/game";

export type Locale = "en" | "ja";
export type MessageKey = keyof typeof en;
const dictionaries = { en, ja };

export function translate(locale: Locale, key: MessageKey, values?: Record<string, string>): string {
  const template = dictionaries[locale][key];
  return values ? template.replace(/\{(\w+)\}/g, (match, token: string) => values[token] ?? match) : template;
}

/** Short date and time in Kyoto time for logs and stamps. */
export function formatKyotoDateTime(locale: Locale, timestamp: number): string {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-GB", { timeZone: "Asia/Tokyo", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(timestamp);
}

/** Display names and scenario descriptions for the two separate incentive concepts. */
export const bonusNameKey = { bus_relief: "bonusBusName", quiet_hour: "bonusQuietName" } as const satisfies Record<CampaignKind, MessageKey>;
export const bonusScenarioKey = { bus_relief: "bonusBusScenario", quiet_hour: "bonusQuietScenario" } as const satisfies Record<CampaignKind, MessageKey>;
