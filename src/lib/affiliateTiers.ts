/**
 * Expansion Suite — Affiliate Tier System
 *
 * Tiers are based on weekly sales volume:
 *   Seed   (0–4 sales/week)  – basic referral links only
 *   Growth (5–14 sales/week) – unlocks the QR Engine
 *   Pro    (15+ sales/week)  – unlocks B2B Pitch Builder + Sub-Affiliate portal
 */

export const EXPANSION_TIERS = {
  seed: {
    key: "seed",
    name: "Seed",
    emoji: "🌱",
    minWeeklySales: 0,
    maxWeeklySales: 4,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
    description: "Basic referral links. Hit 5 sales/week to level up.",
  },
  growth: {
    key: "growth",
    name: "Growth",
    emoji: "🚀",
    minWeeklySales: 5,
    maxWeeklySales: 14,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    description: "QR Engine unlocked. Hit 15 sales/week to reach Pro.",
  },
  pro: {
    key: "pro",
    name: "Pro",
    emoji: "👑",
    minWeeklySales: 15,
    maxWeeklySales: Infinity,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
    description: "Full B2B suite + Sub-Affiliate portal unlocked.",
  },
} as const;

export type ExpansionTierKey = keyof typeof EXPANSION_TIERS;

export function getExpansionTier(weeklySales: number): ExpansionTierKey {
  if (weeklySales >= 15) return "pro";
  if (weeklySales >= 5) return "growth";
  return "seed";
}

export function canAccessQREngine(tier: ExpansionTierKey): boolean {
  return tier === "growth" || tier === "pro";
}

export function canAccessB2BSuite(tier: ExpansionTierKey): boolean {
  return tier === "pro";
}

export function canAccessTeamPortal(tier: ExpansionTierKey): boolean {
  return tier === "pro";
}

/** Sales needed to reach the next tier */
export function salesUntilNextTier(weeklySales: number): number {
  if (weeklySales >= 15) return 0;
  if (weeklySales >= 5) return 15 - weeklySales;
  return 5 - weeklySales;
}

export function nextTierName(weeklySales: number): string {
  if (weeklySales >= 15) return "Max tier reached";
  if (weeklySales >= 5) return "Pro";
  return "Growth";
}
