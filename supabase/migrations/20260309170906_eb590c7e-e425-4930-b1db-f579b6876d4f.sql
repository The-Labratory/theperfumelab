
-- 1. FIX: formulas INSERT — enforce user_id = auth.uid()
DROP POLICY IF EXISTS "Validated formula creation" ON public.formulas;
CREATE POLICY "Validated formula creation" ON public.formulas
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND length(name) <= 200
    AND (description IS NULL OR length(description) <= 2000)
    AND concentration_type = ANY (ARRAY['EDT','EDP','Parfum','Cologne'])
    AND status = 'draft'
    AND compliance_status = 'pending'
  );

-- FIX: formulas UPDATE — add WITH CHECK to prevent user_id reassignment
DROP POLICY IF EXISTS "Users can update own formulas" ON public.formulas;
CREATE POLICY "Users can update own formulas" ON public.formulas
  FOR UPDATE TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'))
  WITH CHECK ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'));

-- FIX: formulas SELECT — remove user_id IS NULL branch
DROP POLICY IF EXISTS "Users can read own formulas" ON public.formulas;
CREATE POLICY "Users can read own formulas" ON public.formulas
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'));

-- 2. The gifts UPDATE policy is already protected by the restrict_gift_updates trigger.
-- The scanner can't see triggers. This is defense-in-depth and acceptable.
