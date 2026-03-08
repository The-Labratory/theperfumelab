
-- =============================================
-- TIER 1: INGREDIENT & REGULATORY ENGINE
-- =============================================

-- Enhance ingredients table with business-critical fields
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS allergen_flags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS supplier_name text,
  ADD COLUMN IF NOT EXISTS supplier_code text,
  ADD COLUMN IF NOT EXISTS cost_per_kg numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_currency text DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS origin_country text,
  ADD COLUMN IF NOT EXISTS shelf_life_months integer DEFAULT 24,
  ADD COLUMN IF NOT EXISTS storage_conditions text DEFAULT 'cool_dry',
  ADD COLUMN IF NOT EXISTS min_order_qty_kg numeric DEFAULT 0.1,
  ADD COLUMN IF NOT EXISTS regulatory_notes text;

-- Create index for allergen lookups
CREATE INDEX IF NOT EXISTS idx_ingredients_allergen_flags ON public.ingredients USING GIN(allergen_flags);

-- =============================================
-- FORMULA VERSIONING SYSTEM
-- =============================================

-- Add version tracking to formulas
ALTER TABLE public.formulas
  ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS locked_by uuid,
  ADD COLUMN IF NOT EXISTS parent_formula_id uuid REFERENCES public.formulas(id),
  ADD COLUMN IF NOT EXISTS batch_size_ml numeric DEFAULT 100,
  ADD COLUMN IF NOT EXISTS estimated_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_margin_pct numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS production_notes text;

-- Immutable formula snapshots for reproducibility
CREATE TABLE IF NOT EXISTS public.formula_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id uuid NOT NULL REFERENCES public.formulas(id) ON DELETE CASCADE,
  version integer NOT NULL,
  snapshot_data jsonb NOT NULL,
  ingredient_snapshot jsonb NOT NULL,
  total_concentration numeric NOT NULL,
  harmony_score numeric,
  stability_score numeric,
  estimated_cost numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE(formula_id, version)
);

ALTER TABLE public.formula_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own formula snapshots"
  ON public.formula_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.formulas f
      WHERE f.id = formula_snapshots.formula_id
        AND (f.user_id IS NULL OR f.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

CREATE POLICY "Users can create snapshots for own formulas"
  ON public.formula_snapshots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.formulas f
      WHERE f.id = formula_snapshots.formula_id
        AND (f.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- =============================================
-- USER PROFILES
-- =============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  favorite_families text[] DEFAULT '{}',
  scent_personality text,
  experience_level text DEFAULT 'beginner',
  blends_created integer DEFAULT 0,
  total_likes_received integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (is_public = true OR user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (display_name IS NULL OR length(display_name) <= 100)
    AND (bio IS NULL OR length(bio) <= 1000)
    AND (avatar_url IS NULL OR length(avatar_url) <= 500)
  );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profile timestamp trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SOCIAL FEATURES
-- =============================================

-- Blend likes
CREATE TABLE IF NOT EXISTS public.blend_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  blend_id uuid NOT NULL REFERENCES public.saved_blends(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, blend_id)
);

ALTER TABLE public.blend_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see likes"
  ON public.blend_likes FOR SELECT USING (true);

CREATE POLICY "Auth users can like"
  ON public.blend_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike"
  ON public.blend_likes FOR DELETE
  USING (user_id = auth.uid());

-- Blend comments
CREATE TABLE IF NOT EXISTS public.blend_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  blend_id uuid NOT NULL REFERENCES public.saved_blends(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blend_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON public.blend_comments FOR SELECT USING (true);

CREATE POLICY "Auth users can comment"
  ON public.blend_comments FOR INSERT
  WITH CHECK (user_id = auth.uid() AND length(content) <= 1000 AND length(content) > 0);

CREATE POLICY "Users can update own comments"
  ON public.blend_comments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND length(content) <= 1000 AND length(content) > 0);

CREATE POLICY "Users can delete own comments"
  ON public.blend_comments FOR DELETE
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.blend_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User follows
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see follows"
  ON public.user_follows FOR SELECT USING (true);

CREATE POLICY "Auth users can follow"
  ON public.user_follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE
  USING (follower_id = auth.uid());

-- =============================================
-- COST & MARGIN ENGINE
-- =============================================

-- Formula cost breakdown
CREATE TABLE IF NOT EXISTS public.formula_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id uuid NOT NULL REFERENCES public.formulas(id) ON DELETE CASCADE,
  raw_material_cost numeric NOT NULL DEFAULT 0,
  bottle_cost numeric NOT NULL DEFAULT 0,
  packaging_cost numeric NOT NULL DEFAULT 0,
  labor_cost numeric NOT NULL DEFAULT 0,
  overhead_cost numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  recommended_price numeric,
  margin_pct numeric,
  currency text DEFAULT 'EUR',
  batch_size_ml numeric DEFAULT 100,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(formula_id)
);

ALTER TABLE public.formula_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own formula costs"
  ON public.formula_costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.formulas f
      WHERE f.id = formula_costs.formula_id
        AND (f.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

CREATE POLICY "System can upsert formula costs"
  ON public.formula_costs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.formulas f
      WHERE f.id = formula_costs.formula_id
        AND (f.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

CREATE POLICY "System can update formula costs"
  ON public.formula_costs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.formulas f
      WHERE f.id = formula_costs.formula_id
        AND (f.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- =============================================
-- PRODUCTION PIPELINE
-- =============================================

CREATE TABLE IF NOT EXISTS public.production_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number serial,
  formula_id uuid NOT NULL REFERENCES public.formulas(id),
  formula_snapshot_id uuid REFERENCES public.formula_snapshots(id),
  user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  batch_id text,
  quantity integer NOT NULL DEFAULT 1,
  volume_ml numeric NOT NULL DEFAULT 50,
  concentration_type text NOT NULL DEFAULT 'EDP',
  mixing_instructions jsonb DEFAULT '{}',
  compliance_doc_url text,
  production_notes text,
  priority text DEFAULT 'normal',
  estimated_completion timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  shipped_at timestamptz,
  shipping_tracking text,
  shipping_weight_g numeric,
  total_cost numeric,
  sale_price numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own production orders"
  ON public.production_orders FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Auth users can create production orders"
  ON public.production_orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update production orders"
  ON public.production_orders FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete production orders"
  ON public.production_orders FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_production_orders_updated_at
  BEFORE UPDATE ON public.production_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ORDERS & CHECKOUT
-- =============================================

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number serial,
  user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  payment_provider text,
  payment_reference text,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric NOT NULL DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'EUR',
  shipping_address jsonb,
  billing_address jsonb,
  customer_email text,
  customer_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Auth users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, is_read) WHERE is_read = false;

-- =============================================
-- ANALYTICS & DATA LEARNING
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log activity"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (length(event_type) <= 100 AND (page_path IS NULL OR length(page_path) <= 500));

CREATE POLICY "Admins can read activity logs"
  ON public.user_activity_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_activity_event_type ON public.user_activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.user_activity_logs(created_at DESC);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Server-side formula validation function
CREATE OR REPLACE FUNCTION public.validate_formula(
  _formula_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result jsonb;
  _total_pct numeric;
  _top_pct numeric;
  _heart_pct numeric;
  _base_pct numeric;
  _violations jsonb[];
  _warnings jsonb[];
  _formula record;
  _ing record;
BEGIN
  SELECT * INTO _formula FROM public.formulas WHERE id = _formula_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Formula not found');
  END IF;

  -- Calculate layer totals
  SELECT
    COALESCE(SUM(fi.concentration_pct), 0),
    COALESCE(SUM(fi.concentration_pct) FILTER (WHERE COALESCE(fi.layer_override, i.default_layer) = 'top'), 0),
    COALESCE(SUM(fi.concentration_pct) FILTER (WHERE COALESCE(fi.layer_override, i.default_layer) = 'heart'), 0),
    COALESCE(SUM(fi.concentration_pct) FILTER (WHERE COALESCE(fi.layer_override, i.default_layer) = 'base'), 0)
  INTO _total_pct, _top_pct, _heart_pct, _base_pct
  FROM public.formula_ingredients fi
  JOIN public.ingredients i ON i.id = fi.ingredient_id
  WHERE fi.formula_id = _formula_id;

  _violations := ARRAY[]::jsonb[];
  _warnings := ARRAY[]::jsonb[];

  -- Total concentration check
  IF _total_pct > 100 THEN
    _violations := array_append(_violations,
      jsonb_build_object('rule', 'total_concentration', 'message', 'Total concentration exceeds 100%', 'value', _total_pct));
  END IF;

  -- IFRA limit checks
  FOR _ing IN
    SELECT i.name, fi.concentration_pct, ir.max_concentration, ir.product_category
    FROM public.formula_ingredients fi
    JOIN public.ingredients i ON i.id = fi.ingredient_id
    LEFT JOIN public.ifra_restrictions ir ON ir.ingredient_id = i.id
      AND ir.product_category = 'fine_fragrance'
    WHERE fi.formula_id = _formula_id
      AND ir.max_concentration IS NOT NULL
      AND fi.concentration_pct > ir.max_concentration
  LOOP
    _violations := array_append(_violations,
      jsonb_build_object('rule', 'ifra_limit', 'ingredient', _ing.name,
        'message', format('%s exceeds IFRA limit: %s%% > %s%%', _ing.name, _ing.concentration_pct, _ing.max_concentration),
        'current', _ing.concentration_pct, 'max', _ing.max_concentration));
  END LOOP;

  -- Allergen threshold warnings
  FOR _ing IN
    SELECT i.name, fi.concentration_pct, i.allergen_flags
    FROM public.formula_ingredients fi
    JOIN public.ingredients i ON i.id = fi.ingredient_id
    WHERE fi.formula_id = _formula_id
      AND i.allergen_flags IS NOT NULL
      AND array_length(i.allergen_flags, 1) > 0
  LOOP
    _warnings := array_append(_warnings,
      jsonb_build_object('rule', 'allergen', 'ingredient', _ing.name,
        'message', format('%s contains allergens: %s', _ing.name, array_to_string(_ing.allergen_flags, ', ')),
        'flags', to_jsonb(_ing.allergen_flags)));
  END LOOP;

  -- Layer balance warnings
  IF _total_pct > 0 THEN
    IF _top_pct / _total_pct > 0.6 THEN
      _warnings := array_append(_warnings,
        jsonb_build_object('rule', 'layer_balance', 'message', 'Top notes dominate (>60%). Consider adding heart/base notes.'));
    END IF;
    IF _base_pct / _total_pct > 0.7 THEN
      _warnings := array_append(_warnings,
        jsonb_build_object('rule', 'layer_balance', 'message', 'Base notes dominate (>70%). Formula may lack freshness.'));
    END IF;
    IF _heart_pct = 0 THEN
      _warnings := array_append(_warnings,
        jsonb_build_object('rule', 'layer_balance', 'message', 'No heart notes. Formula may lack body and depth.'));
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'valid', array_length(_violations, 1) IS NULL,
    'total_concentration', _total_pct,
    'layer_breakdown', jsonb_build_object('top', _top_pct, 'heart', _heart_pct, 'base', _base_pct),
    'violations', COALESCE(to_jsonb(_violations), '[]'::jsonb),
    'warnings', COALESCE(to_jsonb(_warnings), '[]'::jsonb)
  );
END;
$$;

-- Cost calculation function
CREATE OR REPLACE FUNCTION public.calculate_formula_cost(
  _formula_id uuid,
  _batch_size_ml numeric DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _raw_cost numeric := 0;
  _bottle_cost numeric := 8.50;
  _packaging_cost numeric := 4.00;
  _labor_cost numeric := 12.00;
  _overhead_cost numeric := 5.00;
  _total_cost numeric;
  _recommended_price numeric;
  _margin_pct numeric;
  _ing record;
BEGIN
  -- Calculate raw material cost based on ingredient concentrations and costs
  FOR _ing IN
    SELECT i.cost_per_kg, fi.concentration_pct
    FROM public.formula_ingredients fi
    JOIN public.ingredients i ON i.id = fi.ingredient_id
    WHERE fi.formula_id = _formula_id
  LOOP
    -- Convert: cost_per_kg → cost_per_ml (approx density 0.9), then multiply by concentration and batch
    _raw_cost := _raw_cost + ((_ing.cost_per_kg / 1000.0) * 0.9 * (_ing.concentration_pct / 100.0) * _batch_size_ml);
  END LOOP;

  -- Scale bottle/packaging by volume
  IF _batch_size_ml > 50 THEN
    _bottle_cost := _bottle_cost * (_batch_size_ml / 50.0) * 0.8;
    _packaging_cost := _packaging_cost * (_batch_size_ml / 50.0) * 0.7;
  END IF;

  _total_cost := _raw_cost + _bottle_cost + _packaging_cost + _labor_cost + _overhead_cost;
  _recommended_price := ROUND(_total_cost * 4.5, 2); -- 4.5x markup for luxury niche
  _margin_pct := ROUND(((_recommended_price - _total_cost) / _recommended_price) * 100, 1);

  -- Upsert into formula_costs
  INSERT INTO public.formula_costs (formula_id, raw_material_cost, bottle_cost, packaging_cost, labor_cost, overhead_cost, total_cost, recommended_price, margin_pct, batch_size_ml)
  VALUES (_formula_id, ROUND(_raw_cost, 2), _bottle_cost, _packaging_cost, _labor_cost, _overhead_cost, ROUND(_total_cost, 2), _recommended_price, _margin_pct, _batch_size_ml)
  ON CONFLICT (formula_id) DO UPDATE SET
    raw_material_cost = ROUND(_raw_cost, 2),
    bottle_cost = EXCLUDED.bottle_cost,
    packaging_cost = EXCLUDED.packaging_cost,
    labor_cost = EXCLUDED.labor_cost,
    overhead_cost = EXCLUDED.overhead_cost,
    total_cost = ROUND(_total_cost, 2),
    recommended_price = _recommended_price,
    margin_pct = _margin_pct,
    batch_size_ml = _batch_size_ml,
    calculated_at = now();

  RETURN jsonb_build_object(
    'raw_material_cost', ROUND(_raw_cost, 2),
    'bottle_cost', _bottle_cost,
    'packaging_cost', _packaging_cost,
    'labor_cost', _labor_cost,
    'overhead_cost', _overhead_cost,
    'total_cost', ROUND(_total_cost, 2),
    'recommended_price', _recommended_price,
    'margin_pct', _margin_pct,
    'profitable', _margin_pct >= 60
  );
END;
$$;

-- Lock formula and create snapshot
CREATE OR REPLACE FUNCTION public.lock_formula_version(
  _formula_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _formula record;
  _version integer;
  _snapshot_id uuid;
  _ingredients jsonb;
BEGIN
  SELECT * INTO _formula FROM public.formulas WHERE id = _formula_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Formula not found');
  END IF;

  -- Get next version
  SELECT COALESCE(MAX(version), 0) + 1 INTO _version
  FROM public.formula_snapshots WHERE formula_id = _formula_id;

  -- Capture ingredient snapshot
  SELECT jsonb_agg(jsonb_build_object(
    'ingredient_id', fi.ingredient_id,
    'ingredient_name', i.name,
    'concentration_pct', fi.concentration_pct,
    'layer', COALESCE(fi.layer_override, i.default_layer),
    'cas_number', i.cas_number,
    'cost_per_kg', i.cost_per_kg
  )) INTO _ingredients
  FROM public.formula_ingredients fi
  JOIN public.ingredients i ON i.id = fi.ingredient_id
  WHERE fi.formula_id = _formula_id;

  -- Create snapshot
  INSERT INTO public.formula_snapshots (formula_id, version, snapshot_data, ingredient_snapshot, total_concentration, harmony_score, stability_score, estimated_cost, created_by)
  VALUES (
    _formula_id, _version,
    to_jsonb(_formula),
    COALESCE(_ingredients, '[]'::jsonb),
    _formula.total_concentration,
    _formula.harmony_score,
    _formula.stability_score,
    _formula.estimated_cost,
    auth.uid()
  )
  RETURNING id INTO _snapshot_id;

  -- Lock the formula
  UPDATE public.formulas
  SET is_locked = true, locked_at = now(), locked_by = auth.uid(), version = _version, status = 'locked'
  WHERE id = _formula_id;

  RETURN jsonb_build_object('success', true, 'version', _version, 'snapshot_id', _snapshot_id);
END;
$$;

-- Update saved_blends to support social features (make some public)
ALTER TABLE public.saved_blends
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;

-- Allow reading public blends
DROP POLICY IF EXISTS "Users can read own blends" ON public.saved_blends;
CREATE POLICY "Users can read accessible blends"
  ON public.saved_blends FOR SELECT
  USING (is_public = true OR user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Function to increment like count
CREATE OR REPLACE FUNCTION public.update_blend_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.saved_blends SET like_count = like_count + 1 WHERE id = NEW.blend_id;
    -- Update profile stats
    UPDATE public.profiles SET total_likes_received = total_likes_received + 1
    WHERE user_id = (SELECT user_id FROM public.saved_blends WHERE id = NEW.blend_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.saved_blends SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.blend_id;
    UPDATE public.profiles SET total_likes_received = GREATEST(total_likes_received - 1, 0)
    WHERE user_id = (SELECT user_id FROM public.saved_blends WHERE id = OLD.blend_id);
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_blend_like_change
  AFTER INSERT OR DELETE ON public.blend_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_blend_like_count();

-- Function to update comment count
CREATE OR REPLACE FUNCTION public.update_blend_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.saved_blends SET comment_count = comment_count + 1 WHERE id = NEW.blend_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.saved_blends SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.blend_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_blend_comment_change
  AFTER INSERT OR DELETE ON public.blend_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_blend_comment_count();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
