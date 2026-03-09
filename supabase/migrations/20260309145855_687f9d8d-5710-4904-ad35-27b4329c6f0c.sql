
-- Fix remaining critical errors

-- 1. FORMULA_INGREDIENTS: Add ownership check to INSERT
DROP POLICY IF EXISTS "Validated formula ingredient creation" ON public.formula_ingredients;
CREATE POLICY "Validated formula ingredient creation"
  ON public.formula_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (concentration_pct > 0) AND (concentration_pct <= 100)
    AND ((layer_override IS NULL) OR (layer_override = ANY (ARRAY['top','heart','base'])))
    AND EXISTS (
      SELECT 1 FROM formulas f
      WHERE f.id = formula_ingredients.formula_id
      AND ((f.user_id IS NULL) OR (f.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
    )
  );
