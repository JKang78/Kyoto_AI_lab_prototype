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
