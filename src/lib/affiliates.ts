import { supabase } from "@/integrations/supabase/client";

export interface AffiliateProfile {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  email: string;
  referral_code: string;
  bio: string | null;
  avatar_url: string | null;
  social_links: Record<string, string>;
  landing_headline: string | null;
  landing_tagline: string | null;
  tier: string;
  commission_rate: number;
  total_sales: number;
  total_earnings: number;
  total_referrals: number;
  points: number;
  badges: string[];
  onboarding_completed: boolean;
  created_at: string;
}

export async function getAffiliateBySlug(slug: string): Promise<AffiliateProfile | null> {
  const { data, error } = await supabase
    .from("affiliate_partners")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as AffiliateProfile;
}

export async function getMyAffiliate(): Promise<AffiliateProfile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  const { data, error } = await supabase
    .from("affiliate_partners")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as AffiliateProfile;
}

export async function updateAffiliateProfile(
  id: string,
  updates: Partial<Pick<AffiliateProfile, "bio" | "avatar_url" | "social_links" | "landing_headline" | "landing_tagline">>
) {
  const { data, error } = await supabase
    .from("affiliate_partners")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completeOnboarding(affiliateId: string) {
  const { error } = await supabase
    .from("affiliate_partners")
    .update({ onboarding_completed: true } as any)
    .eq("id", affiliateId);
  if (error) throw error;
}

export async function getCampaigns(affiliateId: string) {
  const { data, error } = await supabase
    .from("affiliate_campaigns")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createCampaign(affiliateId: string, name: string, channel: string = "general") {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const { data, error } = await supabase
    .from("affiliate_campaigns")
    .insert({ affiliate_id: affiliateId, user_id: session.user.id, name, slug, channel })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function buildReferralLink(affiliateSlug: string, campaignSlug?: string) {
  const base = `${window.location.origin}/r/${affiliateSlug}`;
  return campaignSlug ? `${base}/${campaignSlug}` : base;
}
