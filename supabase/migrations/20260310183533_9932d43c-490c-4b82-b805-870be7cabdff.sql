
-- Remove the permissive INSERT policy that lets any user forge parent relationships
DROP POLICY IF EXISTS "System can insert relationships" ON public.referral_relationships;

-- Only admins/super_admins can insert referral relationships (server-side via edge functions)
CREATE POLICY "Only admins can insert relationships"
  ON public.referral_relationships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid())
  );
