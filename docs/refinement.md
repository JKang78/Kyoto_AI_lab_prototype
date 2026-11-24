# Showcase UI Refinement Audit (`docs/refinement.md`)

> **Goal:** Remove clunky `"demo"`, `"not real data"`, `"draft"`, `"fictional"`, `"not redeemable"`, `"sample"`, and `"double check"` UI badges, banners, and disclaimer copy so the one-time demo feels like a polished Kyoto walking app — **without changing the UI layout or breaking Demo Mode controls**.  
> **Scope:** Presentation-layer cleanup only. Keep underlying data structures (`isDemo`, `status: "draft"`, `communityInputStatus: "not-consulted"`) intact in TypeScript so existing safety/data contracts remain easy to restore later.

---

## 1. Visual Clutter Components to Remove (Screen by Screen)

Removing these JSX elements eliminates the red `.demo-badge` pills, grey `.demo-strip` disclosure bars, and repetitive caveat captions while keeping every card, sheet, and button layout intact.

### Home (`src/components/home-screen.tsx`)
- **Line 147:** Remove `<p className="home-demo-caption">{t("celebrateDemo")}</p>` (`"Demo points · no cash value"` under the hero points readout).

### Explore Map & List (`src/components/map/kyoto-map.tsx`, `src/components/walk-controls.tsx`, `src/components/place-media.tsx`)
- **`kyoto-map.tsx:755`:** Remove `<small>{t("crowdSampleNote")}</small>` (`"Demo sample · not observed data"` inside the crowd strip).
- **`kyoto-map.tsx:884`:** Remove `<small>{t("crowdProvenance")}</small>` (`"Demo sample levels · no source or timestamp · not live data"`).
- **`kyoto-map.tsx:784` & `909`:** Replace `<p className="sheet-intro">{t(results.fallback ? "routesSearchFallback" : "routesMapChecked")}</p>` with `{results.fallback && <p className="sheet-intro">{t("routesSearchFallback")}</p>}` so the clunky `"map-checked pedestrian ways"` intro disappears while search fallback messaging still works when needed.
- **`kyoto-map.tsx:955`:** Remove `<p className="route-community-status">{t("routesCommunityNotConsulted")}</p>` (`"Community representatives have not reviewed this place entry. Respect current signs and local access rules."`).
- **`kyoto-map.tsx:133`:** For walks with `mappedSteps === false`, omit the `"Step-free: unknown"` (`walkStepFreeUnknown`) chip instead of printing `"unknown"` on every flat walk (keep `"Mapped stairs"` when `mappedSteps === true`).
- **`walk-controls.tsx:113`:** Remove `<small>{t("etiquetteDemo")}</small>` (`"Example etiquette zone (demo)"`) from the etiquette toast so only the clean Kyoto etiquette reminder shows.
- **`walk-controls.tsx:119`:** Remove `{demo && <p className="demo-badge follow-demo-badge">{t("followDemoBadge")}</p>}` (`"DEMO MODE · simulated location, not GPS"`).
- **`walk-controls.tsx:128`:** Remove `<small className="receipt-verification">...</small>` (`"Simulated check-in · not GPS-verified"` / `"GPS check-in · shows you were near this stop, not how you travelled"`).
- **`place-media.tsx:43`:** Remove `<p className="demo-badge">{t("storyDraft")}</p>` (`"DRAFT · awaiting local review"`) next to the fox avatar in the Place Story card.

### Missions & Stamp Book (`src/components/missions-screen.tsx`)
- **`missions-screen.tsx:96`:** Remove `<small className="demo-badge">{t("trailNote")}</small>` (`"Demo · no deadline · no extra reward"`).
- **`missions-screen.tsx:133`:** Simplify `<p className="quest-eligibility">...</p>` — remove `· {t("missionNoDeadline")}` (`"Open-ended demo mission · no deadline"`) and drop `"(demo points)"` from `missionEligibility`.

### Rewards, Vouchers & Redemption (`src/components/rewards-screen.tsx`, `src/components/redeem-sheet.tsx`, `src/components/celebration.tsx`, `src/components/prototype-app.tsx`)
- **`rewards-screen.tsx:25`:** Remove `${stamp.mode === "demo" ? \` · \${t("logDemo")}\` : ""}` so Activity log rows don't append `" · simulated"`.
- **`rewards-screen.tsx:46`:** Remove `<p className="demo-badge">{t("demoNotRedeemable")}</p>` (`"DEMO — NOT REDEEMABLE"`) on every voucher ticket card.
- **`rewards-screen.tsx:42, 47, 49` (Single-language Rewards — EN-only on English, JA-only on Japanese):**
  - Remove `<small lang={other}>{coupon.merchant[other]}</small>` from line 47 (`<p className="ticket-merchant">{coupon.merchant[locale]}</p>`).
  - Remove `<p className="ticket-offer-alt" lang={other}>{coupon.offer[other]}</p>` on line 49.
  - Remove the now-unused `const other = locale === "en" ? "ja" : "en";` on line 42 so `npm run lint` passes.
  - Result: English mode shows only English store & product names (e.g., `Hanami Tea Stand` / `¥150 off a matcha latte`), and switching to Japanese shows only the Japanese names (`はなみ茶房` / `抹茶ラテ 150円引き`).
- **`rewards-screen.tsx:114`:** Remove `<p className="demo-strip"><strong>{t("demoNotRedeemable")}</strong> · {t("rewardsDisclosure")}</p>` at the top of the Rewards screen.
- **`redeem-sheet.tsx:17, 35, 37–39, 41, 43, 48`:**
  - Remove line 35 `<p className="demo-strip redeem-demo">...</p>` (the bilingual `"DEMO — NOT REDEEMABLE / Fictional voucher..."` banner). *(Keep line 36 `redeemOfflineNote` so offline state still explains itself.)*
  - Match the single-language Rewards rule inside the redemption sheet as well: render `coupon.merchant[locale]`, `coupon.offer[locale]`, `coupon.terms[locale]`, `t("redeemVerified")`, and `SlideToConfirm` without `sublabel` (and remove the unused `const other` variable on line 17).
- **`celebration.tsx:56`:** Remove `<small>{t("celebrateDemo")}</small>` (`"Demo points · no cash value"`).
- **`prototype-app.tsx:417`:** Remove `· {translate(locale, "demoNotRedeemable")}` from the voucher unlock toast so it simply shows the unlocked offer.

### Help Sheet & Me (`src/components/help-sheet.tsx`, `src/components/prototype-app.tsx`)
- **`help-sheet.tsx:8-10`:** Rewrite or trim the 4 disclaimer sections (`helpTitle`, `helpIntro`, `helpCheckinsBody`, `helpScenariosBody`, `helpVouchersBody`, `helpCrowdBody`) into a short, friendly *"How Kyoto Flow works"* guide instead of a list of things the prototype can't do.
- **`prototype-app.tsx:209` (`aboutBody`):** Replace the long disclaimer paragraph (`"Routes await field review, step-free access is unverified, crowd levels and bonus scenarios are demo samples, and all points, shops and vouchers are fictional and not redeemable."`) with a clean 1-sentence app description.

---

## 2. Copy Polish (`src/locales/en.json`, `src/locales/ja.json`, `src/config/game.ts`)

Update the remaining visible strings (in **both** `en.json` and `ja.json`) so no `"Demo"`, `"(fictional)"`, `"Sample:"`, `"not real data"`, or `"draft"` wording leaks into the UI:

### `src/config/game.ts` (Merchant names & example terms)
| Coupon ID | Current `merchant.en` / `merchant.ja` | Refined |
|---|---|---|
| `matcha` | `Hanami Tea Stand (fictional)` / `はなみ茶房（架空）` | `Hanami Tea Stand` / `はなみ茶房` |
| `sento` | `Kawa-no-yu Bathhouse (fictional)` / `川の湯（架空）` | `Kawa-no-yu Bathhouse` / `川の湯` |
| `postcards` | `Kamo Paper Shop (fictional)` / `鴨川紙店（架空）` | `Kamo Paper Shop` / `鴨川紙店` |
- Also strip `"Example terms · "` / `"条件の例 · "` and `"Example hours "` / `"時間の例 "` prefixes from `terms` and `hours` on all 3 coupons.

### `src/locales/en.json` & `src/locales/ja.json` (Key-by-Key Cleanup)

| Key | Current (EN) | Suggested Clean Copy (EN) |
|---|---|---|
| `appName` | `Kyoto AI Lab prototype` | `Kyoto Flow` |
| `crowdSampleLevel` | `Sample: {level}` | `{level}` |
| `crowdStripLabel` | `Sample crowd snapshot` | `Crowd snapshot` |
| `mapSampleLocation` | `Sample point · GPS off` | `Kyoto view · GPS off` |
| `mapDemoMarker` | `Demo point · GPS off` | `Kyoto · simulated` (or `Walk preview`) |
| `routesSearchFallback` | `No verified walk matches every part of that request. These are the available map-checked walks; check their details before choosing.` | `No exact match for that search — here are our curated Kyoto walks.` |
| `routesEmpty` | `No validated walk matches this search or theme yet.` | `No walk matches this search or theme yet.` |
| `routesReasonTime` | `Within time budget · map estimate` | `Within your time` |
| `routesReasonAvailable` | `Available mapped walk` | `Curated walk` |
| `goalMarker` | `Finish here · +{points} demo pts` | `Finish here · +{points} pts` |
| `homeCtaUnlock` | `Unlock demo voucher` | `Unlock voucher` |
| `celebrateVoucher` | `Demo voucher ready: {offer}` | `Voucher ready: {offer}` |
| `unlockToast` | `Demo voucher ready` | `Voucher ready` |
| `rewardsTrackLabel` | `Points toward demo vouchers` | `Points toward vouchers` |
| `rewardPillAll` | `All demo vouchers unlocked` | `All vouchers unlocked` |
| `redeemTitle` | `Demo redemption preview` | `Redeem voucher` |
| `redeemCodeLabel` | `Demo code {code}` | `Voucher code {code}` |
| `redeemExpires` | `Demo code · {time}` | `Valid for {time}` |
| `redeemStaffHold` | `Demo: slide to mark as used` | `Slide to mark as used` |
| `redeemVerified` | `Marked as used (demo)` | `Voucher redeemed` |
| `rewardsUsedOn` | `Marked used (demo) · {date}` | `Used · {date}` |
| `rewardsEmptyUsed` | `Vouchers you mark as used in the demo appear here.` | `Used vouchers appear here.` |
| `passportLine` | `Seals {seals} · Walks completed {walks} · Vouchers used {used} (demo)` | `Seals {seals} · Walks {walks} · Vouchers used {used}` |
| `trailTitleAutumn` / `Spring` / `Kyoto` | `Autumn trail (demo)` / `Spring trail (demo)` / `Kyoto trail (demo)` | `Autumn trail` / `Spring trail` / `Kyoto trail` |
| `bonusBusScenario` | `Demo scenario: buses along Shijō-dōri are assumed to be crowded right now. This is not real bus data.` | `Buses along Shijō-dōri are busy right now — walk to earn 2× points.` |
| `bonusQuietScenario` | `Demo scenario: Yasaka Shrine and Maruyama Park are assumed to be outside their busy hours right now. This is not real crowd data.` | `Visit Yasaka Shrine and Maruyama Park during quieter hours for 2× points.` |
| `bonusBanner` | `{name} ×{multiplier} · demo scenario` | `{name} ×{multiplier}` |
| `bonusBannerWalk` | `{walk} only · simulated, not real data` | `{walk} only` |
| `bonusShort` | `{name} ×{multiplier} (demo)` | `{name} ×{multiplier}` |
| `missionsBonusTitle` | `Bonus scenarios (demo)` | `Active bonuses` |
| `missionsBonusBody` / `missionsBonusBodyPublic` | `Kyoto Flow keeps two incentives apart... Neither uses real data yet. A presenter can switch on one hypothetical scenario in Me.` | `Earn 2× points on bus-relief walks or quiet-hour visits when an active bonus is on.` |
| `missionsVerifyNote` | `Check-ins confirm a visit near each stop, not how you travelled.` | `Check in near each stop to collect your stamp and points.` |
| `missionEligibility` | `Eligibility: check in at all {total} stops (demo points)` | `Check in at all {total} stops to complete` |
| `receiptBonus` | `Why: base {base} × {multiplier} · {name} (demo scenario)` | `Base {base} × {multiplier} · {name}` |
| `logBonus` | `{name} ×{multiplier} (demo scenario)` | `{name} ×{multiplier}` |
| `photoPlaceholder` | `No licensed photo of this spot yet · illustration` | `Illustrated view` |
| `chipBike` / `chipLuggage` | `Bike · pilot planned` / `Luggage · not surveyed` | Consider hiding unavailable chips during the demo, or shortening to `Bike (soon)` / `Luggage (soon)` |
| `reportIssueTitle` / `reportIssueSaved` | `Report a path issue (draft)` / `Draft report prepared locally (not sent online in this prototype).` | `Report a path issue` / `Report saved on this device.` |

*(Apply matching natural Japanese translations in `src/locales/ja.json` for every key above.)*

---

## 3. What to Keep Untouched

1. **Presenter Demo Controls in `Me` (`src/components/prototype-app.tsx`):** Keep the `Kyoto Demo Mode` toggle, `Bonus scenario` switcher (`None / Bus relief / Quiet hour`), `Reset progress`, and `Start demo walk` / `Simulate check-in` actions working so you can drive the live demo effortlessly.
2. **Genuine map & photo credits:** Keep MapLibre / OpenStreetMap attribution and Wikimedia Commons photo author/license credits — these are lightweight, unobtrusive, and legally required.
3. **Useful real-world notes:** Keep `Mapped stairs` (for Maruyama Park) and brief `Respect the neighbourhood` etiquette notes, since they add to the authentic Kyoto guidebook feel.
4. **Unused CSS cleanup (optional):** Once all `.demo-badge`, `.demo-strip`, `.redeem-demo`, `.follow-demo-badge`, and `.home-demo-caption` references are removed (except `.demo-strip` if kept for `redeemOfflineNote`), those unused CSS classes in `src/app/globals.css` can be left alone or removed in a clean pass.

---

## 4. Tests That Will Need Updating When Implementing

Several automated tests explicitly assert the old disclaimer strings and will fail until updated alongside this refinement:

| Test File | Assertions to Update |
|---|---|
| `tests/game.test.mjs` | **Line 68:** `assert.ok(COUPONS.every(coupon => /fictional/i.test(coupon.merchant.en) && /架空/.test(coupon.merchant.ja)))` — remove or relax this check when dropping `(fictional)` / `（架空）`. |
| `tests/browser/game.mjs` | **Lines 89, 113–115, 125, 475, 627, 635, 674:** Assertions waiting for `copy.celebrateDemo`, `copy.demoNotRedeemable`, `copy.redeemDemoBody`, `.ticket-card .demo-badge`, `copy.storyDraft`, and `copy.etiquetteDemo`. Update them to assert the clean offer/story/etiquette content instead. |
| `tests/browser/discovery.mjs` | **Line 78:** Check if any crowd-sample wording assertion needs updating to match the cleaned `crowdSampleLevel`. |
| `tests/place-content.test.mjs` | **Line 15:** Checks `story.status === 'draft'` in data — **this continues to pass** as long as we only remove the UI badge in `place-media.tsx` and keep `status: "draft"` in `place-stories.ts`. |

---

## 5. Implementation Gotchas & Verification Checklist

### Gotchas for the Implementing AI
- **Keep `en.json` / `ja.json` keys in place (rewrite values, don't delete keys):** Several browser tests read keys directly from `src/locales/en.json`, and `MessageKey` is inferred from `en.json`. Editing values in place avoids breaking TypeScript or unrelated test lookups.
- **Clean up unused locals/imports:** Removing `<small lang={other}>` in `rewards-screen.tsx` and `redeem-sheet.tsx` makes `const other` unused — delete those declarations so `npm run lint` passes with zero warnings.
- **Keep data flags intact:** Do not remove `isDemo: true`, `status: "draft"`, or `communityInputStatus: "not-consulted"` from `src/config/game.ts`, `src/data/place-stories.ts`, or `src/data/kyoto-walks.ts`; only remove their cluttered UI badges so `tests/place-content.test.mjs` and `tests/game.test.mjs` stay green.

### Verification Checklist (When Implementing)
- [ ] Run `npm run typecheck && npm run lint && npm test` (all passing after updating `tests/game.test.mjs`).
- [ ] Inspect all 5 tabs (**Home, Explore [Map + List], Missions, Rewards [+ Redeem sheet], Me [+ Help sheet]**) at `390 × 800` in both **EN** and **JA**.
- [ ] Confirm Rewards & Redemption show **English-only** store/product names in EN mode and **Japanese-only** names in JA mode (no bilingual subtitle underneath).
- [ ] Confirm zero occurrences of `"DEMO — NOT REDEEMABLE"`, `"DRAFT · awaiting local review"`, `"(fictional)"`, `"not real data"`, `"not observed data"`, `"· simulated"`, or `"not GPS-verified"` appear in the rendered UI.
- [ ] Confirm Demo Mode walking, bonus scenario switching, voucher unlocking/redemption, and celebration flow still work identically end-to-end.
