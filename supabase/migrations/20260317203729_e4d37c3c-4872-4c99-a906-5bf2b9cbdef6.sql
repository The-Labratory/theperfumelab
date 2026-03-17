
-- 1. Create a safe public view with only display-safe columns
CREATE OR REPLACE VIEW public.affiliate_partners_public AS
  SELECT
    id,
    display_name,
    bio,
    slug,
    tier,
    avatar_url,
    landing_headline,
    landing_tagline,
    company_name,
    social_links,
    badges,
    status
  FROM public.affiliate_partners
  WHERE status = 'active';

-- 2. Drop the overly permissive anonymous SELECT policy on affiliate_partners
DROP POLICY IF EXISTS "Public can read affiliate landing data" ON public.affiliate_partners;

-- 3. Replace with a policy that only allows authenticated users to read their own record (or admins to read all)
CREATE POLICY "Authenticated read own affiliate profile"
  ON public.affiliate_partners
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'admin')
    OR is_super_admin(auth.uid())
  );

-- 4. Drop the overly permissive user UPDATE policy
DROP POLICY IF EXISTS "Users can update own affiliate profile" ON public.affiliate_partners;

-- 5. Create a restricted UPDATE policy that only allows safe display field changes
-- We use WITH CHECK to ensure sensitive fields haven't been tampered with
CREATE POLICY "Users can update own affiliate display fields"
  ON public.affiliate_partners
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    -- Ensure these sensitive fields remain unchanged (compared via subquery)
    AND status = (SELECT ap.status FROM public.affiliate_partners ap WHERE ap.id = affiliate_partners.id)
    AND commission_rate = (SELECT ap.commission_rate FROM public.affiliate_partners ap WHERE ap.id = affiliate_partners.id)
    AND tier = (SELECT ap.tier FROM public.affiliate_partners ap WHERE ap.id = affiliate_partners.id)
    AND total_earnings = (SELECT ap.total_earnings FROM public.affiliate_partners ap WHERE ap.id = affiliate_partners.id)
    AND total_sales = (SELECT ap.total_sales FROM public.affiliate_partners ap WHERE ap.id = affiliate_partners.id)
    AND total_referrals = (SELECT ap.total_referrals FROM public.affiliate_partners ap WHERE ap.id = affiliate_partners.id)
    AND is_compliant IS NOT DISTINCT FROM (SELECT ap.is_compliant FROM public.affiliate_partners ap WHERE ap.id = affiliate_partners.id)
    AND withdrawals_locked IS NOT DISTINCT FROM (SELECT ap.withdrawals_locked FROM public.affiliate_partners ap WHERE ap.id = affiliate_partners.id)
    AND points IS NOT DISTINCT FROM (SELECT ap.points FROM public.affiliate_partners ap WHERE ap.id = affiliate_partners.id)
    AND referral_code = (SELECT ap.referral_code FROM public.affiliate_partners ap WHERE ap.id = affiliate_partners.id)
    AND email = (SELECT ap.email FROM public.affiliate_partners ap WHERE ap.id = affiliate_partners.id)
  );

-- 6. Ensure admin UPDATE policy exists for full access
DROP POLICY IF EXISTS "Admins can manage affiliate partners" ON public.affiliate_partners;
CREATE POLICY "Admins can manage affiliate partners"
  ON public.affiliate_partners
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));
