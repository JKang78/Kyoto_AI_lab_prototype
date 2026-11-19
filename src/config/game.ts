// Provisional showcase settings. All rewards are fictional.
export const GAME = {
  checkpointCoins: 10,
  completionCoins: 30,
  sampleBonusPercent: 50,
  radiusMeters: 75,
  maxAccuracyMeters: 50,
  maxFixAgeMs: 30_000,
  demoLegMs: 2400,
};

export const COUPONS = [
  { id: "postcard", cost: 60, en: "Kyoto postcard", ja: "京都の絵はがき" },
  { id: "tea", cost: 100, en: "Tea break", ja: "ひと休みのお茶" },
  { id: "journal", cost: 120, en: "Walking journal", ja: "街歩き手帳" },
] as const;
