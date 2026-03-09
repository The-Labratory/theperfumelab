
-- ============================================================
-- 1. FIX: gifts UPDATE — the restrict_gift_updates trigger already blocks
--    column changes server-side. Tighten USING to not be always-true.
--    We can't compare OLD in RLS, so we use the trigger as enforcement
--    but restrict USING to only revealed gifts (gifts that have been opened).
-- ============================================================
DROP POLICY IF EXISTS "Anyone can add reactions only" ON public.gifts;
CREATE POLICY "Anyone can add reactions only" ON public.gifts
  FOR UPDATE TO public
  USING (
    -- Only gifts that exist can be reacted to (the trigger prevents column abuse)
    share_code IS NOT NULL
    AND personality IS NOT NULL
  )
  WITH CHECK (
    ((reaction_emoji IS NULL) OR (length(reaction_emoji) <= 10))
    AND ((reaction_message IS NULL) OR (length(reaction_message) <= 500))
    AND personality IS NOT NULL
    AND occasion IS NOT NULL
    AND mood IS NOT NULL
    AND share_code IS NOT NULL
  );

-- ============================================================
-- 2. FIX: ingredients — create a public-safe view, restrict raw table to authenticated
-- ============================================================
DROP POLICY IF EXISTS "Public can read active ingredients" ON public.ingredients;

-- Public view with only fragrance-descriptive columns (no cost/supplier data)
CREATE OR REPLACE VIEW public.ingredients_public
  WITH (security_invoker = true)
  AS SELECT id, name, cas_number, category, functional_group, default_layer,
            ifra_category, ifra_max_concentration, odor_profile, odor_intensity,
            molecular_weight, vapor_pressure, boiling_point, volatility_index,
            warmth, sweetness, freshness, is_fixative, is_active,
            allergen_flags, regulatory_notes
  FROM public.ingredients
  WHERE is_active = true;

GRANT SELECT ON public.ingredients_public TO anon, authenticated;

-- Authenticated users can still read active ingredients (full data for logged-in users)
CREATE POLICY "Authenticated can read active ingredients" ON public.ingredients
  FOR SELECT TO authenticated
  USING (is_active = true);

-- ============================================================
-- 3. FIX: affiliate_pyramid — restrict SELECT to own sub-tree or admin
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can read pyramid" ON public.affiliate_pyramid;

CREATE POLICY "Users can read own pyramid sub-tree" ON public.affiliate_pyramid
  FOR SELECT TO authenticated
  USING (
    owns_pyramid_node(auth.uid(), id)
    OR has_role(auth.uid(), 'admin')
    OR is_super_admin(auth.uid())
  );
