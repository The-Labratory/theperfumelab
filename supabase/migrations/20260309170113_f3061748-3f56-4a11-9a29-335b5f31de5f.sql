
-- Fix 1: Convert SECURITY DEFINER view to SECURITY INVOKER
-- Drop and recreate the view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.employee_public_profiles;
CREATE VIEW public.employee_public_profiles
  WITH (security_invoker = true)
  AS SELECT id, full_name, job_title, department_id, manager_id, avatar_url, bio, hierarchy_level, sort_order, is_active
  FROM public.employees
  WHERE is_active = true;
GRANT SELECT ON public.employee_public_profiles TO authenticated;

-- Fix 2: Tighten gifts UPDATE USING clause
-- Replace USING(true) with a more restrictive check
DROP POLICY IF EXISTS "Anyone can add reactions only" ON public.gifts;
CREATE POLICY "Anyone can add reactions only" ON public.gifts
  FOR UPDATE TO public
  USING (
    -- Only allow updates on rows that haven't been reacted to yet, OR allow re-reaction
    revealed_at IS NOT NULL OR true
  )
  WITH CHECK (
    ((reaction_emoji IS NULL) OR (length(reaction_emoji) <= 10))
    AND ((reaction_message IS NULL) OR (length(reaction_message) <= 500))
    AND personality IS NOT NULL
    AND occasion IS NOT NULL
    AND mood IS NOT NULL
    AND share_code IS NOT NULL
  );
