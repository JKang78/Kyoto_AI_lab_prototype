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
  { kind: "bus_relief", walkIds: ["shijo-yasaka"], multiplier: 2 },
  { kind: "quiet_hour", walkIds: ["yasaka-maruyama"], multiplier: 2 },
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
  merchant: Text;
  offer: Text;
  terms: Text;
  hours: Text;
};

export const COUPONS: readonly CouponDefinition[] = [
  {
    id: "matcha",
    isDemo: true,
    category: "cafe",
    cost: 60,
    merchant: { en: "Hanami Tea Stand (fictional)", ja: "はなみ茶房（架空）" },
    offer: { en: "¥150 off a matcha latte", ja: "抹茶ラテ 150円引き" },
    terms: { en: "Example terms · min. spend ¥500 · 1 per visit", ja: "条件の例 · 500円以上のご利用で · 1回につき1枚" },
    hours: { en: "Example hours 10:00–17:00", ja: "時間の例 10:00〜17:00" },
  },
  {
    id: "sento",
    isDemo: true,
    category: "experience",
    cost: 90,
    merchant: { en: "Kawa-no-yu Bathhouse (fictional)", ja: "川の湯（架空）" },
    offer: { en: "Free sake-lees soap with entry", ja: "入浴で酒粕石けんプレゼント" },
    terms: { en: "Example terms · with paid entry · 1 per person", ja: "条件の例 · 入浴料のお支払い時 · お一人様1個" },
    hours: { en: "Example hours 15:00–22:00", ja: "時間の例 15:00〜22:00" },
  },
  {
    id: "postcards",
    isDemo: true,
    category: "shop",
    cost: 120,
    merchant: { en: "Kamo Paper Shop (fictional)", ja: "鴨川紙店（架空）" },
    offer: { en: "Free set of three washi postcards", ja: "和紙ポストカード3枚セット進呈" },
    terms: { en: "Example terms · 1 set per person", ja: "条件の例 · お一人様1セット" },
    hours: { en: "Example hours 11:00–18:00", ja: "時間の例 11:00〜18:00" },
  },
];
