/**
 * Shared business constants for commission calculations.
 * These values mirror the constraints enforced in the database schema.
 */

/** Fixed wholesale discount applied to all B2B Corporate orders. */
export const B2B_WHOLESALE_DISCOUNT = 0.4; // 40%

/** Flat B2C retail commission rate. */
export const B2C_COMMISSION_PCT = 0.5; // 50%

/** Tier 2 override commission for the parent referrer (capped at 1 level). */
export const TIER2_COMMISSION_PCT = 0.05; // 5%

/** B2B commission tiers based on wholesale order total (post-discount). */
export const B2B_COMMISSION_TIERS = [
  { minAmount: 500, pct: 20 },
  { minAmount: 200, pct: 15 },
  { minAmount: 0,   pct: 10 },
] as const;

/** Resolve the B2B commission percentage for a given wholesale order total. */
export function getB2BCommissionPct(wholesaleTotal: number): number {
  for (const tier of B2B_COMMISSION_TIERS) {
    if (wholesaleTotal >= tier.minAmount) return tier.pct;
  }
  return 10;
}
