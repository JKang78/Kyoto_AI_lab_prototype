/**
 * Reward boundary for the R0 prototype.
 *
 * Everything this client can award (points, stamps, vouchers, "redeemed" marks) is a demo.
 * It lives in browser localStorage, is decided in the browser, and can be edited by the user.
 * GPS check-ins are demo too: a browser fix shows presence near a stop at best, never the
 * route walked or the transport avoided.
 *
 * Real reward issuance must never be added to this client ledger. It belongs to the future
 * server path in docs/ENGINEERING_SPEC.md §5–7 (server-validated check-ins, quota-safe grants,
 * staff-authenticated single redemption), with DEMO_MODE asserted by the server environment
 * and demo events rejected in production.
 */
export const REWARD_MODE = "demo" as const;

/**
 * Simulation controls (Demo Mode, simulated check-ins, bonus scenarios) exist only in development
 * and in builds explicitly made for presenters with NEXT_PUBLIC_KYOTO_FLOW_PREVIEW=1
 * (ENGINEERING_SPEC §3). A plain production build removes them, so a public URL can't turn them on.
 * This is a product safeguard, not security: real rewards still need the server path above.
 */
export function previewControlsEnabled(nodeEnv: string | undefined, previewFlag: string | undefined) {
  return nodeEnv !== "production" || previewFlag === "1";
}
// Literal process.env references so Next.js inlines them at build time.
export const PREVIEW_CONTROLS = previewControlsEnabled(process.env.NODE_ENV, process.env.NEXT_PUBLIC_KYOTO_FLOW_PREVIEW);
