// Provisional showcase settings. All points, merchants and vouchers are fictional demo content.
export const GAME = {
  checkpointPoints: 10,
  completionPoints: 30,
  radiusMeters: 75,
  maxAccuracyMeters: 50,
  maxFixAgeMs: 30_000,
  maxClockSkewMs: 5_000,
  demoLegMs: 2400,
  redeemWindowMs: 5 * 60_000,
};

/**
 * The two incentive concepts the PRD keeps separate (PRODUCT_REQUIREMENTS §9):
 * - bus_relief: choose a walk instead of a congested bus during a crowded period.
 * - quiet_hour: visit a destination outside its busy hours.
 * There is no real bus or crowd data, so neither runs on a schedule. Each is a
 * hypothetical scenario a presenter switches on in Me → Demo controls, and it
 * applies only to the walks listed here.
 */
export type CampaignKind = "bus_relief" | "quiet_hour";
export const DEMO_SCENARIOS: readonly { kind: CampaignKind; walkIds: readonly string[]; multiplier: number }[] = [
  { kind: "bus_relief", walkIds: ["shijo-yasaka", "station-umekoji"], multiplier: 2 },
  { kind: "quiet_hour", walkIds: ["yasaka-maruyama", "philosophers-path", "arashiyama-riverside"], multiplier: 2 },
];

/**
 * Seasonal trail (docs/visuals.md M4). A demo collection goal only: no deadline, no extra
 * reward. A real trail needs a campaign with an owner, dates and data (PRODUCT_REQUIREMENTS §9).
 */
export const DEMO_TRAIL = { goal: 5 } as const;

type Text = { en: string; ja: string };
export type CouponCategory = "cafe" | "experience" | "shop";
export type CouponDefinition = {
  id: string;
  /** Always true in this prototype. Real offers require the R1 server path; see src/config/environment.ts. */
  isDemo: true;
  category: CouponCategory;
  cost: number;
  /** Offer expiry in UTC ms (displayed in Kyoto JST, independent of the 5-minute redemption preview timer). */
  expiresAt: number;
  merchant: Text;
  offer: Text;
  terms: Text;
  hours: Text;
};

// Demo offer validity horizon: 2027-03-31 23:59:59 JST.
const DEMO_OFFER_EXPIRES_AT = Date.parse("2027-03-31T23:59:59+09:00");

export const COUPONS: readonly CouponDefinition[] = [
  {
    id: "matcha",
    isDemo: true,
    category: "cafe",
    cost: 60,
    expiresAt: DEMO_OFFER_EXPIRES_AT,
    merchant: { en: "Hanami Tea Stand", ja: "はなみ茶房" },
    offer: { en: "¥150 off a matcha latte", ja: "抹茶ラテ 150円引き" },
    terms: { en: "Min. spend ¥500 · 1 per visit", ja: "500円以上のご利用で · 1回につき1枚" },
    hours: { en: "10:00–17:00", ja: "10:00〜17:00" },
  },
  {
    id: "sento",
    isDemo: true,
    category: "experience",
    cost: 90,
    expiresAt: DEMO_OFFER_EXPIRES_AT,
    merchant: { en: "Kawa-no-yu Bathhouse", ja: "川の湯" },
    offer: { en: "Free sake-lees soap with entry", ja: "入浴で酒粕石けんプレゼント" },
    terms: { en: "With paid entry · 1 per person", ja: "入浴料のお支払い時 · お一人様1個" },
    hours: { en: "15:00–22:00", ja: "15:00〜22:00" },
  },
  {
    id: "postcards",
    isDemo: true,
    category: "shop",
    cost: 120,
    expiresAt: DEMO_OFFER_EXPIRES_AT,
    merchant: { en: "Kamo Paper Shop", ja: "鴨川紙店" },
    offer: { en: "Free set of three washi postcards", ja: "和紙ポストカード3枚セット進呈" },
    terms: { en: "1 set per person", ja: "お一人様1セット" },
    hours: { en: "11:00–18:00", ja: "11:00〜18:00" },
  },
  {
    id: "tea-latte", isDemo: true, category: "cafe", cost: 75, expiresAt: DEMO_OFFER_EXPIRES_AT,
    merchant: { en: "Komorebi Café", ja: "こもれびカフェ" },
    offer: { en: "¥200 off a tea latte", ja: "ティーラテ 200円引き" },
    terms: { en: "Min. spend ¥500 · 1 per visit", ja: "500円以上のご利用で · 1回につき1枚" },
    hours: { en: "10:00–17:00", ja: "10:00〜17:00" },
  },
  {
    id: "mochi", isDemo: true, category: "cafe", cost: 80, expiresAt: DEMO_OFFER_EXPIRES_AT,
    merchant: { en: "Nishiki Snack Shop", ja: "錦のおやつ屋" },
    offer: { en: "Free mochi with a drink", ja: "ドリンクと一緒におもちをプレゼント" },
    terms: { en: "With any drink · 1 per visit", ja: "ドリンクのご注文で · 1回につき1個" },
    hours: { en: "11:00–18:00", ja: "11:00〜18:00" },
  },
  {
    id: "stationery", isDemo: true, category: "shop", cost: 100, expiresAt: DEMO_OFFER_EXPIRES_AT,
    merchant: { en: "Sora Stationery", ja: "そら文具" },
    offer: { en: "¥300 off handmade stationery", ja: "手作り文具 300円引き" },
    terms: { en: "Min. spend ¥1,000 · 1 per visit", ja: "1,000円以上のご利用で · 1回につき1枚" },
    hours: { en: "11:00–18:00", ja: "11:00〜18:00" },
  },
  {
    id: "craft", isDemo: true, category: "experience", cost: 110, expiresAt: DEMO_OFFER_EXPIRES_AT,
    merchant: { en: "Kyoto Craft Studio", ja: "京都クラフト工房" },
    offer: { en: "Free mini print with workshop", ja: "ワークショップでミニ版画をプレゼント" },
    terms: { en: "With paid workshop · 1 per person", ja: "有料ワークショップ参加時 · お一人様1枚" },
    hours: { en: "10:00–17:00", ja: "10:00〜17:00" },
  },
];
