
-- Fix 1: Referrals INSERT policy - restrict to pending status and zero credits only
DROP POLICY IF EXISTS "Users can create own referrals" ON public.referrals;
CREATE POLICY "Users can create own referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (
    referrer_user_id = auth.uid()
    AND status = 'pending'
    AND credits_awarded = 0
    AND (referred_email IS NULL OR length(referred_email) <= 255)
  );

-- Fix 2: affiliate_point_events INSERT - validate affiliate_id ownership + restrict points
DROP POLICY IF EXISTS "System can insert point events" ON public.affiliate_point_events;
CREATE POLICY "Users insert own affiliate point events"
  ON public.affiliate_point_events FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND points >= 0
    AND points <= 100
    AND EXISTS (
      SELECT 1 FROM public.affiliate_partners ap
      WHERE ap.id = affiliate_point_events.affiliate_id
      AND ap.user_id = auth.uid()
    )
  );

-- Fix 3: affiliate_pyramid UPDATE - restrict to display fields only, block financial columns
-- Replace the unconstrained UPDATE policy with one that prevents financial manipulation
DROP POLICY IF EXISTS "Affiliates can update own nodes" ON public.affiliate_pyramid;
CREATE POLICY "Affiliates can update own display fields"
  ON public.affiliate_pyramid FOR UPDATE TO authenticated
  USING (public.owns_pyramid_node(auth.uid(), id))
  WITH CHECK (
    public.owns_pyramid_node(auth.uid(), id)
    -- Block changes to financial and structural columns
    AND earnings = (SELECT earnings FROM public.affiliate_pyramid WHERE id = affiliate_pyramid.id)
    AND total_transactions = (SELECT total_transactions FROM public.affiliate_pyramid WHERE id = affiliate_pyramid.id)
    AND affiliate_partner_id IS NOT DISTINCT FROM (SELECT affiliate_partner_id FROM public.affiliate_pyramid WHERE id = affiliate_pyramid.id)
  );
