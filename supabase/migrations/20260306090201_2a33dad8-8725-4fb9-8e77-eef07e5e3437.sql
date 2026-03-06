
-- Fix overly permissive INSERT on referral_events
DROP POLICY IF EXISTS "System inserts events" ON public.referral_events;
CREATE POLICY "Auth users insert own events" ON public.referral_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin(auth.uid()));
