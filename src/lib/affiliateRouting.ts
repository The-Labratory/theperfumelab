import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * After authentication, checks the affiliate's onboarding status
 * and redirects accordingly:
 *   - No affiliate row → /affiliate-signup
 *   - onboarding_completed = false → /affiliate/onboard
 *   - onboarding_completed = true → /affiliate/{slug}/dashboard
 */
export async function redirectAfterAuth(navigate: NavigateFunction): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  const { data: affiliate } = await supabase
    .from("affiliate_partners")
    .select("id, slug, onboarding_completed")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!affiliate) {
    // No affiliate profile yet — send to signup
    navigate("/affiliate-signup", { replace: true });
    return;
  }

  if (!affiliate.onboarding_completed) {
    navigate("/affiliate/onboard", { replace: true });
    return;
  }

  navigate(`/affiliate/${affiliate.slug}/dashboard`, { replace: true });
}

/**
 * Checks if user has completed onboarding. Returns true if yes.
 * Used as a route guard.
 */
export async function checkOnboardingGate(): Promise<{ completed: boolean; slug: string | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { completed: false, slug: null };

  const { data } = await supabase
    .from("affiliate_partners")
    .select("slug, onboarding_completed")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!data) return { completed: false, slug: null };
  return { completed: !!data.onboarding_completed, slug: data.slug };
}
