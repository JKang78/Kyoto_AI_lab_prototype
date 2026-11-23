// Provisional showcase settings. All points, merchants and vouchers are fictional.
export const GAME = {
  checkpointPoints: 10,
  completionPoints: 30,
  radiusMeters: 75,
  maxAccuracyMeters: 50,
  maxFixAgeMs: 30_000,
  maxClockSkewMs: 5_000,
  demoLegMs: 2400,
  redeemWindowMs: 5 * 60_000,
  staffHoldMs: 1200,
};

/** Sample off-peak schedule in Kyoto time (JST). Not an official city programme. */
export const OFF_PEAK = { startHour: 6, endHour: 10, multiplier: 2 } as const;

type Text = { en: string; ja: string };
export type CouponCategory = "cafe" | "experience" | "transit";
export type CouponDefinition = {
  id: string;
  category: CouponCategory;
  cost: number;
  merchant: Text;
  offer: Text;
  terms: Text;
  hours: Text;
};

export const COUPONS: readonly CouponDefinition[] = [
  {
    id: "matcha",
    category: "cafe",
    cost: 60,
    merchant: { en: "Hanami Tea Stand (fictional)", ja: "はなみ茶房（架空）" },
    offer: { en: "¥150 off a matcha latte", ja: "抹茶ラテ 150円引き" },
    terms: { en: "Min. spend ¥500 · 1 per visit", ja: "500円以上のご利用で · 1回につき1枚" },
    hours: { en: "Valid 10:00–17:00", ja: "有効時間 10:00〜17:00" },
  },
  {
    id: "sento",
    category: "experience",
    cost: 90,
    merchant: { en: "Kawa-no-yu Bathhouse (fictional)", ja: "川の湯（架空）" },
    offer: { en: "Free sake-lees soap with entry", ja: "入浴で酒粕石けんプレゼント" },
    terms: { en: "With paid entry · 1 per person", ja: "入浴料のお支払い時 · お一人様1個" },
    hours: { en: "Valid 15:00–22:00", ja: "有効時間 15:00〜22:00" },
  },
  {
    id: "transit",
    category: "transit",
    cost: 120,
    merchant: { en: "Sample transit voucher", ja: "交通バウチャー（見本）" },
    offer: { en: "One rail ride instead of a crowded bus", ja: "混雑したバスの代わりに電車1回分" },
    terms: { en: "Single ride · not valid on any real network", ja: "1回限り · 実際の路線では使えません" },
    hours: { en: "Valid all day", ja: "終日有効" },
  },
];
