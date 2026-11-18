import en from "@/locales/en.json";
import ja from "@/locales/ja.json";

export type Locale = "en" | "ja";
export type MessageKey = keyof typeof en;
const dictionaries = { en, ja };

export function translate(locale: Locale, key: MessageKey, values?: Record<string, string>): string {
  const template = dictionaries[locale][key];
  return values ? template.replace(/\{(\w+)\}/g, (match, token: string) => values[token] ?? match) : template;
}
