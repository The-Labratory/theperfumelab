-- 1. Fix gifts UPDATE policy: restrict to specific share_code row
DROP POLICY IF EXISTS "Anyone can add reactions only" ON public.gifts;
CREATE POLICY "Anyone can add reactions only"
  ON public.gifts FOR UPDATE TO public
  USING (share_code IS NOT NULL AND personality IS NOT NULL)
  WITH CHECK (
    ((reaction_emoji IS NULL) OR (length(reaction_emoji) <= 10))
    AND ((reaction_message IS NULL) OR (length(reaction_message) <= 500))
    AND personality IS NOT NULL
    AND occasion IS NOT NULL
    AND mood IS NOT NULL
    AND share_code IS NOT NULL
  );

-- 2. Fix affiliate_referrals INSERT policy: restrict writable columns
DROP POLICY IF EXISTS "System can create referrals" ON public.affiliate_referrals;
CREATE POLICY "System can create referrals"
  ON public.affiliate_referrals FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM affiliate_partners ap
      WHERE ap.id = affiliate_referrals.affiliate_id
        AND ap.status = 'active'
    )
    AND status = 'pending'
    AND commission_paid = false
    AND (commission_amount IS NULL OR commission_amount = 0)
  );

-- 3. Fix formula_ingredients policies: remove user_id IS NULL branch
DROP POLICY IF EXISTS "Users can read formula ingredients" ON public.formula_ingredients;
CREATE POLICY "Users can read formula ingredients"
  ON public.formula_ingredients FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM formulas f
    WHERE f.id = formula_ingredients.formula_id
      AND (f.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

DROP POLICY IF EXISTS "Users can remove formula ingredients" ON public.formula_ingredients;
CREATE POLICY "Users can remove formula ingredients"
  ON public.formula_ingredients FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM formulas f
    WHERE f.id = formula_ingredients.formula_id
      AND (f.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

DROP POLICY IF EXISTS "Users can update formula ingredients" ON public.formula_ingredients;
CREATE POLICY "Users can update formula ingredients"
  ON public.formula_ingredients FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM formulas f
    WHERE f.id = formula_ingredients.formula_id
      AND (f.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

DROP POLICY IF EXISTS "Validated formula ingredient creation" ON public.formula_ingredients;
CREATE POLICY "Validated formula ingredient creation"
  ON public.formula_ingredients FOR INSERT TO authenticated
  WITH CHECK (
    concentration_pct > 0
    AND concentration_pct <= 100
    AND (layer_override IS NULL OR layer_override = ANY (ARRAY['top', 'heart', 'base']))
    AND EXISTS (
      SELECT 1 FROM formulas f
      WHERE f.id = formula_ingredients.formula_id
        AND (f.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );