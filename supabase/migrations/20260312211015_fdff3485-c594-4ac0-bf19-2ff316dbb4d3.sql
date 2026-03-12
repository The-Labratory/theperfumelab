
-- Fix: Remove permissive INSERT policy on growth_credits that allows self-issuance
DROP POLICY IF EXISTS "Users insert own credits" ON public.growth_credits;

-- Only admins can insert credits directly; edge functions use service role which bypasses RLS
CREATE POLICY "Admins manage credits" ON public.growth_credits
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
