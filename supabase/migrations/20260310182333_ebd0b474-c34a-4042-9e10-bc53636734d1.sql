
-- ============================================================
-- 1. FIX: Affiliate PII exposed to anon users
--    Replace broad anon SELECT with a safe public view
-- ============================================================

-- Drop the overly-permissive anon policy
DROP POLICY IF EXISTS "Public can read active affiliates for leaderboard" ON public.affiliate_partners;

-- Create a safe public view with ONLY leaderboard-safe columns
CREATE OR REPLACE VIEW public.affiliate_leaderboard AS
  SELECT id, display_name, tier, total_sales, total_referrals
  FROM public.affiliate_partners
  WHERE status = 'active';

-- Grant anon and authenticated access to the safe view only
GRANT SELECT ON public.affiliate_leaderboard TO anon, authenticated;

-- ============================================================
-- 2. FIX: Growth credits self-insert privilege escalation
--    Remove the user INSERT policy; credits must be created
--    via service-role (edge functions) only
-- ============================================================

DROP POLICY IF EXISTS "Users insert own credits" ON public.growth_credits;

-- ============================================================
-- 3. FIX: partner_leads RLS disabled
-- ============================================================

ALTER TABLE public.partner_leads ENABLE ROW LEVEL SECURITY;

-- Partners can read their own leads
CREATE POLICY "Partners read own leads"
  ON public.partner_leads FOR SELECT TO authenticated
  USING (partner_id IN (
    SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()
  ));

-- Partners can insert their own leads
CREATE POLICY "Partners insert own leads"
  ON public.partner_leads FOR INSERT TO authenticated
  WITH CHECK (partner_id IN (
    SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()
  ));

-- Partners can update their own leads
CREATE POLICY "Partners update own leads"
  ON public.partner_leads FOR UPDATE TO authenticated
  USING (partner_id IN (
    SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()
  ));

-- Admins have full access
CREATE POLICY "Admins manage all leads"
  ON public.partner_leads FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 4. FIX: assign-admin-role config - set verify_jwt = false
--    (handled in config.toml update, not SQL)
-- ============================================================
