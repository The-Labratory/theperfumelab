
-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Now create all tables
CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  cas_number TEXT,
  category TEXT NOT NULL DEFAULT 'synthetic',
  functional_group TEXT NOT NULL DEFAULT 'other',
  molecular_weight NUMERIC NOT NULL DEFAULT 0,
  vapor_pressure NUMERIC NOT NULL DEFAULT 0,
  boiling_point NUMERIC NOT NULL DEFAULT 0,
  volatility_index NUMERIC NOT NULL DEFAULT 50,
  ifra_category TEXT NOT NULL DEFAULT 'unrestricted',
  ifra_max_concentration NUMERIC DEFAULT 100,
  odor_profile TEXT,
  odor_intensity NUMERIC NOT NULL DEFAULT 50,
  default_layer TEXT NOT NULL DEFAULT 'heart',
  is_fixative BOOLEAN NOT NULL DEFAULT false,
  warmth NUMERIC NOT NULL DEFAULT 50,
  sweetness NUMERIC NOT NULL DEFAULT 50,
  freshness NUMERIC NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ingredient_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_a_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  ingredient_b_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL DEFAULT 'neutral',
  interaction_strength NUMERIC NOT NULL DEFAULT 50,
  accord_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ingredient_a_id, ingredient_b_id)
);

CREATE TABLE public.formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID,
  formula_number SERIAL,
  concentration_type TEXT NOT NULL DEFAULT 'EDP',
  total_concentration NUMERIC NOT NULL DEFAULT 0,
  stability_score NUMERIC DEFAULT 0,
  harmony_score NUMERIC DEFAULT 0,
  compliance_status TEXT NOT NULL DEFAULT 'pending',
  compliance_notes TEXT,
  evolution_summary TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.formula_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id UUID NOT NULL REFERENCES public.formulas(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  concentration_pct NUMERIC NOT NULL DEFAULT 1,
  layer_override TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(formula_id, ingredient_id)
);

CREATE TABLE public.ifra_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  product_category TEXT NOT NULL DEFAULT 'fine_fragrance',
  max_concentration NUMERIC NOT NULL,
  amendment_number TEXT,
  effective_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ingredient_id, product_category)
);

CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ingredients_category ON public.ingredients(category);
CREATE INDEX idx_ingredients_functional_group ON public.ingredients(functional_group);
CREATE INDEX idx_ingredients_default_layer ON public.ingredients(default_layer);
CREATE INDEX idx_ingredient_interactions_a ON public.ingredient_interactions(ingredient_a_id);
CREATE INDEX idx_ingredient_interactions_b ON public.ingredient_interactions(ingredient_b_id);
CREATE INDEX idx_formulas_user ON public.formulas(user_id);
CREATE INDEX idx_formulas_status ON public.formulas(status);
CREATE INDEX idx_formula_ingredients_formula ON public.formula_ingredients(formula_id);
CREATE INDEX idx_audit_logs_user ON public.admin_audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.admin_audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ifra_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- INGREDIENTS
CREATE POLICY "Public can read active ingredients" ON public.ingredients FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage ingredients" ON public.ingredients FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- INTERACTIONS
CREATE POLICY "Public can read interactions" ON public.ingredient_interactions FOR SELECT USING (true);
CREATE POLICY "Admins can manage interactions" ON public.ingredient_interactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FORMULAS
CREATE POLICY "Users can read own formulas" ON public.formulas FOR SELECT USING (user_id IS NULL OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create formulas" ON public.formulas FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own formulas" ON public.formulas FOR UPDATE USING (user_id IS NULL OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete formulas" ON public.formulas FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- FORMULA INGREDIENTS
CREATE POLICY "Users can read formula ingredients" ON public.formula_ingredients FOR SELECT USING (EXISTS (SELECT 1 FROM public.formulas f WHERE f.id = formula_id AND (f.user_id IS NULL OR f.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Anyone can add formula ingredients" ON public.formula_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update formula ingredients" ON public.formula_ingredients FOR UPDATE USING (EXISTS (SELECT 1 FROM public.formulas f WHERE f.id = formula_id AND (f.user_id IS NULL OR f.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Users can remove formula ingredients" ON public.formula_ingredients FOR DELETE USING (EXISTS (SELECT 1 FROM public.formulas f WHERE f.id = formula_id AND (f.user_id IS NULL OR f.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- IFRA RESTRICTIONS
CREATE POLICY "Public can read IFRA restrictions" ON public.ifra_restrictions FOR SELECT USING (true);
CREATE POLICY "Admins can manage IFRA restrictions" ON public.ifra_restrictions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- AUDIT LOGS
CREATE POLICY "Admins can read audit logs" ON public.admin_audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can create audit logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (true);

-- Triggers
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_formulas_updated_at BEFORE UPDATE ON public.formulas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
