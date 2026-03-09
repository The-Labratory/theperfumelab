
-- ============================================================
-- SECURITY HARDENING MIGRATION
-- Fix: profiles table public SELECT → authenticated only
-- Fix: Several tables using {public} role → {authenticated}
-- Fix: Tighten policies on sensitive tables
-- ============================================================

-- 1. PROFILES TABLE: Restrict public SELECT to authenticated
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (is_public = true) OR (user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- 2. EMPLOYEES: Change public read to authenticated
DROP POLICY IF EXISTS "Anyone can read active employees" ON public.employees;
CREATE POLICY "Authenticated can read active employees"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Also fix the admin ALL policy from public to authenticated
DROP POLICY IF EXISTS "Admins can manage employees" ON public.employees;
CREATE POLICY "Admins can manage employees"
  ON public.employees
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. DEPARTMENTS: Change public read to authenticated
DROP POLICY IF EXISTS "Anyone can read departments" ON public.departments;
CREATE POLICY "Authenticated can read departments"
  ON public.departments
  FOR SELECT
  TO authenticated
  USING (true);

-- Also fix admin ALL policy
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
CREATE POLICY "Admins can manage departments"
  ON public.departments
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. INGREDIENTS: Keep public read for active (needed for public lab page)
-- This is intentional - ingredients are reference data shown on public pages

-- 5. INGREDIENT_INTERACTIONS: Change public read to authenticated
DROP POLICY IF EXISTS "Public can read interactions" ON public.ingredient_interactions;
CREATE POLICY "Authenticated can read interactions"
  ON public.ingredient_interactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix admin ALL
DROP POLICY IF EXISTS "Admins can manage interactions" ON public.ingredient_interactions;
CREATE POLICY "Admins can manage interactions"
  ON public.ingredient_interactions
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. FORMULAS: Change public policies to authenticated
DROP POLICY IF EXISTS "Users can read own formulas" ON public.formulas;
CREATE POLICY "Users can read own formulas"
  ON public.formulas
  FOR SELECT
  TO authenticated
  USING ((user_id IS NULL) OR (user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update own formulas" ON public.formulas;
CREATE POLICY "Users can update own formulas"
  ON public.formulas
  FOR UPDATE
  TO authenticated
  USING ((user_id IS NULL) OR (user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Validated formula creation" ON public.formulas;
CREATE POLICY "Validated formula creation"
  ON public.formulas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (length(name) <= 200)
    AND ((description IS NULL) OR (length(description) <= 2000))
    AND (concentration_type = ANY (ARRAY['EDT','EDP','Parfum','Cologne']))
    AND (status = 'draft')
    AND (compliance_status = 'pending')
  );

DROP POLICY IF EXISTS "Admins can delete formulas" ON public.formulas;
CREATE POLICY "Admins can delete formulas"
  ON public.formulas
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. FORMULA_INGREDIENTS: Change public to authenticated
DROP POLICY IF EXISTS "Users can read formula ingredients" ON public.formula_ingredients;
CREATE POLICY "Users can read formula ingredients"
  ON public.formula_ingredients
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM formulas f
    WHERE f.id = formula_ingredients.formula_id
    AND ((f.user_id IS NULL) OR (f.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  ));

DROP POLICY IF EXISTS "Users can update formula ingredients" ON public.formula_ingredients;
CREATE POLICY "Users can update formula ingredients"
  ON public.formula_ingredients
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM formulas f
    WHERE f.id = formula_ingredients.formula_id
    AND ((f.user_id IS NULL) OR (f.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  ));

DROP POLICY IF EXISTS "Users can remove formula ingredients" ON public.formula_ingredients;
CREATE POLICY "Users can remove formula ingredients"
  ON public.formula_ingredients
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM formulas f
    WHERE f.id = formula_ingredients.formula_id
    AND ((f.user_id IS NULL) OR (f.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  ));

DROP POLICY IF EXISTS "Validated formula ingredient creation" ON public.formula_ingredients;
CREATE POLICY "Validated formula ingredient creation"
  ON public.formula_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (concentration_pct > 0) AND (concentration_pct <= 100)
    AND ((layer_override IS NULL) OR (layer_override = ANY (ARRAY['top','heart','base'])))
  );

-- 8. PRODUCTION_ORDERS: Change public to authenticated
DROP POLICY IF EXISTS "Users can read own production orders" ON public.production_orders;
CREATE POLICY "Users can read own production orders"
  ON public.production_orders
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Auth users can create production orders" ON public.production_orders;
CREATE POLICY "Auth users can create production orders"
  ON public.production_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update production orders" ON public.production_orders;
CREATE POLICY "Admins can update production orders"
  ON public.production_orders
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete production orders" ON public.production_orders;
CREATE POLICY "Admins can delete production orders"
  ON public.production_orders
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 9. AFFILIATE_PARTNERS: Change public to authenticated
DROP POLICY IF EXISTS "Users can read own affiliate profile" ON public.affiliate_partners;
CREATE POLICY "Users can read own affiliate profile"
  ON public.affiliate_partners
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Auth users can apply as affiliate" ON public.affiliate_partners;
CREATE POLICY "Auth users can apply as affiliate"
  ON public.affiliate_partners
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid())
    AND (length(display_name) <= 200)
    AND (length(email) <= 255)
    AND (status = 'pending')
  );

DROP POLICY IF EXISTS "Users can update own affiliate profile" ON public.affiliate_partners;
CREATE POLICY "Users can update own affiliate profile"
  ON public.affiliate_partners
  FOR UPDATE
  TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- 10. AFFILIATE_SALES: Change public to authenticated
DROP POLICY IF EXISTS "Admins can manage sales" ON public.affiliate_sales;
CREATE POLICY "Admins can manage sales"
  ON public.affiliate_sales
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can read own sales" ON public.affiliate_sales;
CREATE POLICY "Users can read own sales"
  ON public.affiliate_sales
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can register own sales" ON public.affiliate_sales;
CREATE POLICY "Users can register own sales"
  ON public.affiliate_sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM affiliate_pyramid ap
      JOIN affiliate_partners p ON p.id = ap.affiliate_partner_id
      WHERE ap.id = affiliate_sales.pyramid_node_id AND p.user_id = auth.uid()
    )
  );

-- 11. AFFILIATE_REFERRALS: Change public to authenticated
DROP POLICY IF EXISTS "Affiliates can read own referrals" ON public.affiliate_referrals;
CREATE POLICY "Affiliates can read own referrals"
  ON public.affiliate_referrals
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM affiliate_partners ap
    WHERE ap.id = affiliate_referrals.affiliate_id
    AND ((ap.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  ));

DROP POLICY IF EXISTS "System can create referrals" ON public.affiliate_referrals;
CREATE POLICY "System can create referrals"
  ON public.affiliate_referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM affiliate_partners ap
    WHERE ap.id = affiliate_referrals.affiliate_id AND ap.status = 'active'
  ));

-- 12. AFFILIATE_PAYOUTS: Change public to authenticated
DROP POLICY IF EXISTS "Admins can manage payouts" ON public.affiliate_payouts;
CREATE POLICY "Admins can manage payouts"
  ON public.affiliate_payouts
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Affiliates can read own payouts" ON public.affiliate_payouts;
CREATE POLICY "Affiliates can read own payouts"
  ON public.affiliate_payouts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM affiliate_partners ap
    WHERE ap.id = affiliate_payouts.affiliate_id
    AND ((ap.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  ));

-- 13. PARTNER_SALES_REPORTS: Change public to authenticated
DROP POLICY IF EXISTS "Admins can manage all sales reports" ON public.partner_sales_reports;
CREATE POLICY "Admins can manage all sales reports"
  ON public.partner_sales_reports
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Affiliates can create own sales reports" ON public.partner_sales_reports;
CREATE POLICY "Affiliates can create own sales reports"
  ON public.partner_sales_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM affiliate_partners ap
      WHERE ap.id = partner_sales_reports.affiliate_partner_id AND ap.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Affiliates can read own sales reports" ON public.partner_sales_reports;
CREATE POLICY "Affiliates can read own sales reports"
  ON public.partner_sales_reports
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- 14. BLEND_LIKES: Change public to authenticated (except SELECT which can stay public for display)
DROP POLICY IF EXISTS "Auth users can like" ON public.blend_likes;
CREATE POLICY "Auth users can like"
  ON public.blend_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can unlike" ON public.blend_likes;
CREATE POLICY "Users can unlike"
  ON public.blend_likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Keep public SELECT for likes count display
-- (already exists: "Anyone can see likes")

-- 15. PROFILES: Change INSERT and UPDATE from public to authenticated
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    (user_id = auth.uid())
    AND ((display_name IS NULL) OR (length(display_name) <= 100))
    AND ((bio IS NULL) OR (length(bio) <= 1000))
    AND ((avatar_url IS NULL) OR (length(avatar_url) <= 500))
  );

-- 16. AFFILIATE_PYRAMID: Fix admin ALL from public to authenticated
DROP POLICY IF EXISTS "Admins can manage pyramid" ON public.affiliate_pyramid;
CREATE POLICY "Admins can manage pyramid"
  ON public.affiliate_pyramid
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 17. IFRA_RESTRICTIONS: Keep public read (reference data), fix admin ALL
DROP POLICY IF EXISTS "Admins can manage IFRA restrictions" ON public.ifra_restrictions;
CREATE POLICY "Admins can manage IFRA restrictions"
  ON public.ifra_restrictions
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 18. USER_ACTIVITY_LOGS: Tighten INSERT to authenticated only
DROP POLICY IF EXISTS "Anyone can log activity" ON public.user_activity_logs;
CREATE POLICY "Authenticated can log activity"
  ON public.user_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((length(event_type) <= 100) AND ((page_path IS NULL) OR (length(page_path) <= 500)));

-- Fix admin SELECT from public to authenticated
DROP POLICY IF EXISTS "Admins can read activity logs" ON public.user_activity_logs;
CREATE POLICY "Admins can read activity logs"
  ON public.user_activity_logs
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
