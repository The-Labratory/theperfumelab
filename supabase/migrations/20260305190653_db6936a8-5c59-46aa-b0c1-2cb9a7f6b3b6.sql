
-- Pyramid chart configs table
CREATE TABLE public.pyramid_chart_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  data_source_mode text NOT NULL DEFAULT 'manual',
  config jsonb NOT NULL DEFAULT '{"levels": []}'::jsonb,
  colors jsonb DEFAULT '{"background": "#1a1a2e", "text": "#ffffff"}'::jsonb,
  visibility_rules jsonb DEFAULT '{"roles": ["super_admin"]}'::jsonb,
  is_active boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pyramid chart config versions (append-only history)
CREATE TABLE public.pyramid_chart_config_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid REFERENCES public.pyramid_chart_configs(id) ON DELETE CASCADE NOT NULL,
  version integer NOT NULL,
  config_snapshot jsonb NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid,
  notes text,
  UNIQUE(config_id, version)
);

-- Partner sales reports table - allows ANY affiliate partner to log sales
CREATE TABLE public.partner_sales_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_partner_id uuid REFERENCES public.affiliate_partners(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  sale_amount numeric NOT NULL DEFAULT 0,
  customer_name text,
  customer_email text,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pyramid_chart_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pyramid_chart_config_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_sales_reports ENABLE ROW LEVEL SECURITY;

-- Pyramid configs: super admin only
CREATE POLICY "Super admin manages pyramid configs"
  ON public.pyramid_chart_configs FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Pyramid config versions: super admin only  
CREATE POLICY "Super admin manages pyramid config versions"
  ON public.pyramid_chart_config_versions FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Active config readable by authenticated users
CREATE POLICY "Authenticated can read active pyramid configs"
  ON public.pyramid_chart_configs FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- Partner sales reports: affiliates can insert/read own, admins can manage all
CREATE POLICY "Affiliates can create own sales reports"
  ON public.partner_sales_reports FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.affiliate_partners ap
      WHERE ap.id = partner_sales_reports.affiliate_partner_id
      AND ap.user_id = auth.uid()
    )
  );

CREATE POLICY "Affiliates can read own sales reports"
  ON public.partner_sales_reports FOR SELECT
  USING (
    user_id = auth.uid() OR
    has_role(auth.uid(), 'admin'::app_role) OR
    is_super_admin(auth.uid())
  );

CREATE POLICY "Admins can manage all sales reports"
  ON public.partner_sales_reports FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Updated_at trigger for pyramid configs
CREATE TRIGGER update_pyramid_chart_configs_updated_at
  BEFORE UPDATE ON public.pyramid_chart_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
