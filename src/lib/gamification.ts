import { supabase } from "@/integrations/supabase/client";

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (stats: GamificationStats) => boolean;
}

export interface GamificationStats {
  points: number;
  totalSales: number;
  totalReferrals: number;
  campaignsCreated: number;
  onboardingCompleted: boolean;
  profileCompleted: boolean;
}

export const BADGE_DEFINITIONS: BadgeDef[] = [
  { id: "first_steps", name: "First Steps", icon: "🚀", description: "Complete onboarding", condition: (s) => s.onboardingCompleted },
  { id: "profile_pro", name: "Profile Pro", icon: "✨", description: "Complete your profile", condition: (s) => s.profileCompleted },
  { id: "first_sale", name: "First Sale", icon: "💰", description: "Make your first sale", condition: (s) => s.totalSales >= 1 },
  { id: "five_sales", name: "Rising Star", icon: "⭐", description: "Reach 5 sales", condition: (s) => s.totalSales >= 5 },
  { id: "recruiter", name: "Recruiter", icon: "🤝", description: "Refer your first partner", condition: (s) => s.totalReferrals >= 1 },
  { id: "campaign_creator", name: "Campaign Creator", icon: "📣", description: "Create your first campaign", condition: (s) => s.campaignsCreated >= 1 },
  { id: "twenty_five_sales", name: "Sales Machine", icon: "🔥", description: "Reach 25 sales", condition: (s) => s.totalSales >= 25 },
  { id: "hundred_sales", name: "Legend", icon: "👑", description: "Reach 100 sales", condition: (s) => s.totalSales >= 100 },
];

export const ONBOARDING_STEPS = [
  { id: "profile_photo", label: "Upload profile photo", points: 10 },
  { id: "bio", label: "Write your bio", points: 10 },
  { id: "social_links", label: "Add social links", points: 10 },
  { id: "first_campaign", label: "Create your first campaign", points: 20 },
  { id: "share_link", label: "Share your referral link", points: 15 },
  { id: "customize_landing", label: "Customize your landing page", points: 15 },
];

export function calculateLevel(points: number): { level: number; title: string; nextLevelPoints: number; progress: number } {
  const levels = [
    { threshold: 0, title: "Newcomer" },
    { threshold: 50, title: "Explorer" },
    { threshold: 150, title: "Hustler" },
    { threshold: 400, title: "Influencer" },
    { threshold: 1000, title: "Ambassador" },
    { threshold: 2500, title: "Elite" },
    { threshold: 5000, title: "Legend" },
  ];
  
  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].threshold) { currentLevel = i; break; }
  }
  
  const nextLevel = Math.min(currentLevel + 1, levels.length - 1);
  const currentThreshold = levels[currentLevel].threshold;
  const nextThreshold = levels[nextLevel].threshold;
  const progress = nextLevel === currentLevel ? 100 : Math.round(((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  
  return { level: currentLevel, title: levels[currentLevel].title, nextLevelPoints: nextThreshold, progress };
}

export async function awardPoints(affiliateId: string, action: string, points: number, metadata: Record<string, unknown> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;
  
  await supabase.from("affiliate_point_events").insert({
    affiliate_id: affiliateId,
    user_id: session.user.id,
    action,
    points,
    metadata,
  } as any);
  
  // Update total points on partner
  await supabase.rpc("increment_affiliate_points" as any, { _affiliate_id: affiliateId, _points: points });
}

export function getEarnedBadges(stats: GamificationStats): BadgeDef[] {
  return BADGE_DEFINITIONS.filter((b) => b.condition(stats));
}
