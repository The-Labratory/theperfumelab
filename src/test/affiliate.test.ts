import { describe, it, expect } from "vitest";
import { calculateLevel, getEarnedBadges, BADGE_DEFINITIONS, ONBOARDING_STEPS, type GamificationStats } from "@/lib/gamification";
import { buildReferralLink } from "@/lib/affiliates";

describe("gamification", () => {
  describe("calculateLevel", () => {
    it("returns Newcomer for 0 points", () => {
      const result = calculateLevel(0);
      expect(result.level).toBe(0);
      expect(result.title).toBe("Newcomer");
    });

    it("returns Explorer at 50 points", () => {
      const result = calculateLevel(50);
      expect(result.level).toBe(1);
      expect(result.title).toBe("Explorer");
    });

    it("returns Legend at 5000+ points", () => {
      const result = calculateLevel(9999);
      expect(result.level).toBe(6);
      expect(result.title).toBe("Legend");
      expect(result.progress).toBe(100);
    });

    it("calculates progress correctly mid-level", () => {
      const result = calculateLevel(100); // between 50 (Explorer) and 150 (Hustler)
      expect(result.level).toBe(1);
      expect(result.progress).toBe(50);
    });
  });

  describe("getEarnedBadges", () => {
    it("returns empty for fresh user", () => {
      const stats: GamificationStats = { points: 0, totalSales: 0, totalReferrals: 0, campaignsCreated: 0, onboardingCompleted: false, profileCompleted: false };
      expect(getEarnedBadges(stats)).toHaveLength(0);
    });

    it("returns First Steps when onboarding completed", () => {
      const stats: GamificationStats = { points: 50, totalSales: 0, totalReferrals: 0, campaignsCreated: 0, onboardingCompleted: true, profileCompleted: false };
      const badges = getEarnedBadges(stats);
      expect(badges.some((b) => b.id === "first_steps")).toBe(true);
    });

    it("returns multiple badges for advanced user", () => {
      const stats: GamificationStats = { points: 500, totalSales: 30, totalReferrals: 5, campaignsCreated: 3, onboardingCompleted: true, profileCompleted: true };
      const badges = getEarnedBadges(stats);
      expect(badges.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("ONBOARDING_STEPS", () => {
    it("has 6 steps with positive points", () => {
      expect(ONBOARDING_STEPS).toHaveLength(6);
      ONBOARDING_STEPS.forEach((s) => expect(s.points).toBeGreaterThan(0));
    });
  });
});

describe("affiliates", () => {
  describe("buildReferralLink", () => {
    it("builds basic referral link", () => {
      const link = buildReferralLink("john-doe");
      expect(link).toContain("/r/john-doe");
    });

    it("appends campaign slug", () => {
      const link = buildReferralLink("john-doe", "instagram-bio");
      expect(link).toContain("/r/john-doe/instagram-bio");
    });
  });
});
