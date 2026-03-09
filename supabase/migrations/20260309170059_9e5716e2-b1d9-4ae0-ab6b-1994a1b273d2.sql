
-- ============================================================
-- 1. FIX: gifts UPDATE policy — restrict to reaction columns only
-- The restrict_gift_updates trigger is a second layer, but RLS should also prevent this.
-- ============================================================
DROP POLICY IF EXISTS "Anyone can add reactions only" ON public.gifts;
CREATE POLICY "Anyone can add reactions only" ON public.gifts
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (
    -- Only reaction_emoji and reaction_message may differ from old values.
    -- All other columns must remain unchanged. Since RLS WITH CHECK cannot
    -- reference OLD, we rely on the existing restrict_gift_updates trigger.
    -- Tighten by requiring reaction fields have sane lengths.
    ((reaction_emoji IS NULL) OR (length(reaction_emoji) <= 10))
    AND ((reaction_message IS NULL) OR (length(reaction_message) <= 500))
    -- Prevent nullifying core fields (attacker trick)
    AND personality IS NOT NULL
    AND occasion IS NOT NULL
    AND mood IS NOT NULL
    AND share_code IS NOT NULL
  );

-- ============================================================
-- 2. FIX: get_referral_tree — add caller authorization check
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_referral_tree(_root_user_id uuid, _max_depth integer DEFAULT 5)
RETURNS TABLE(
  user_id uuid,
  parent_user_id uuid,
  depth integer,
  display_name text,
  referral_code text,
  referee_email text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only the root user or an admin/super_admin can view the tree
  IF _root_user_id <> auth.uid()
     AND NOT public.has_role(auth.uid(), 'admin')
     AND NOT public.is_super_admin(auth.uid())
  THEN
    RAISE EXCEPTION 'Forbidden: you can only view your own referral tree';
  END IF;

  RETURN QUERY
  WITH RECURSIVE tree AS (
    SELECT rr.user_id, rr.parent_user_id, 0 AS relative_depth
    FROM public.referral_relationships rr
    WHERE rr.parent_user_id = _root_user_id AND rr.status = 'confirmed'
    UNION ALL
    SELECT rr.user_id, rr.parent_user_id, t.relative_depth + 1
    FROM public.referral_relationships rr
    JOIN tree t ON rr.parent_user_id = t.user_id
    WHERE rr.status = 'confirmed' AND t.relative_depth < _max_depth
  )
  SELECT t.user_id, t.parent_user_id, t.relative_depth,
         p.display_name, p.referral_code,
         -- Only expose email to admins
         CASE WHEN public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid())
              THEN (SELECT email FROM auth.users WHERE id = t.user_id)
              ELSE NULL
         END AS referee_email
  FROM tree t
  LEFT JOIN public.profiles p ON p.user_id = t.user_id;
END;
$$;

-- ============================================================
-- 3. FIX: Drop stale referral_events INSERT policy with CHECK (true)
-- ============================================================
DROP POLICY IF EXISTS "System inserts events" ON public.referral_events;

-- ============================================================
-- 4. FIX: Employee PII exposure — drop broad SELECT policy, create safe view
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can read active employee profiles" ON public.employees;

-- Create a restricted public view with only safe fields
CREATE OR REPLACE VIEW public.employee_public_profiles AS
  SELECT id, full_name, job_title, department_id, manager_id, avatar_url, bio, hierarchy_level, sort_order, is_active
  FROM public.employees
  WHERE is_active = true;

GRANT SELECT ON public.employee_public_profiles TO authenticated;
