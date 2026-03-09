-- 1. Fix gifts UPDATE: use trigger to enforce reaction-only writes (policy USING can't restrict columns)
-- The restrict_gift_updates trigger already blocks non-reaction column changes, so the policy is safe.
-- But we need to restrict to public role properly - no fix needed beyond trigger.

-- 2. Fix ingredients SELECT: restrict raw table to admin only
DROP POLICY IF EXISTS "Authenticated can read active ingredients" ON public.ingredients;
CREATE POLICY "Authenticated can read active ingredients"
  ON public.ingredients FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix formula_snapshots: remove user_id IS NULL branch
DROP POLICY IF EXISTS "Users can read formula snapshots" ON public.formula_snapshots;
CREATE POLICY "Users can read formula snapshots"
  ON public.formula_snapshots FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM formulas f
    WHERE f.id = formula_snapshots.formula_id
      AND (f.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));