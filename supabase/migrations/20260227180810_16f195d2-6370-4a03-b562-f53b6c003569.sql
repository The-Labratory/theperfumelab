
-- Tighten INSERT policies with input validation

-- Formulas: validate input lengths
DROP POLICY "Anyone can create formulas" ON public.formulas;
CREATE POLICY "Validated formula creation" ON public.formulas
  FOR INSERT WITH CHECK (
    length(name) <= 200
    AND (description IS NULL OR length(description) <= 2000)
    AND concentration_type IN ('EDT', 'EDP', 'Parfum', 'Cologne')
    AND status = 'draft'
    AND compliance_status = 'pending'
  );

-- Formula ingredients: validate concentration
DROP POLICY "Anyone can add formula ingredients" ON public.formula_ingredients;
CREATE POLICY "Validated formula ingredient creation" ON public.formula_ingredients
  FOR INSERT WITH CHECK (
    concentration_pct > 0 AND concentration_pct <= 100
    AND (layer_override IS NULL OR layer_override IN ('top', 'heart', 'base'))
  );

-- Audit logs: restrict to authenticated users
DROP POLICY "System can create audit logs" ON public.admin_audit_logs;
CREATE POLICY "Authenticated users can create audit logs" ON public.admin_audit_logs
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND length(action) <= 50
    AND length(entity_type) <= 50
  );
