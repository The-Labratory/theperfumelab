
-- Partner inventory for stock tracking
CREATE TABLE public.partner_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_partner_id UUID NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own inventory" ON public.partner_inventory
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own inventory" ON public.partner_inventory
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND length(product_name) <= 200);

CREATE POLICY "Users can update own inventory" ON public.partner_inventory
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own inventory" ON public.partner_inventory
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Partner customers CRM
CREATE TABLE public.partner_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_partner_id UUID NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_type TEXT NOT NULL DEFAULT 'b2c',
  total_purchases NUMERIC NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  last_purchase_at TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own customers" ON public.partner_customers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own customers" ON public.partner_customers
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND length(customer_name) <= 200 AND (customer_email IS NULL OR length(customer_email) <= 255));

CREATE POLICY "Users can update own customers" ON public.partner_customers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own customers" ON public.partner_customers
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Partner goals (targets set by admin)
CREATE TABLE public.partner_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_partner_id UUID NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL DEFAULT 'sales',
  target_value NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'monthly',
  period_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE),
  period_end DATE NOT NULL DEFAULT (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date,
  set_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own goals" ON public.partner_goals
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage goals" ON public.partner_goals
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Updated_at triggers
CREATE TRIGGER set_partner_inventory_updated_at BEFORE UPDATE ON public.partner_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_partner_customers_updated_at BEFORE UPDATE ON public.partner_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_partner_goals_updated_at BEFORE UPDATE ON public.partner_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
