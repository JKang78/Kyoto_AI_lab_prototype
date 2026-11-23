import en from "@/locales/en.json";
import ja from "@/locales/ja.json";

export type Locale = "en" | "ja";
export type MessageKey = keyof typeof en;
const dictionaries = { en, ja };

export function translate(locale: Locale, key: MessageKey, values?: Record<string, string>): string {
  const template = dictionaries[locale][key];
  return values ? template.replace(/\{(\w+)\}/g, (match, token: string) => values[token] ?? match) : template;
}

/** HH:MM in Kyoto time, independent of the device time zone. */
export function formatKyotoTime(timestamp: number): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hour12: false }).format(timestamp);
}

/** Short date and time in Kyoto time for logs and stamps. */
export function formatKyotoDateTime(locale: Locale, timestamp: number): string {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-GB", { timeZone: "Asia/Tokyo", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(timestamp);
}
