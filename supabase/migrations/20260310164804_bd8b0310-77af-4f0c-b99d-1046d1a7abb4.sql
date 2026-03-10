
-- ============================================================
-- 1. Growth Credits / Vault System
-- ============================================================
CREATE TABLE public.growth_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  credit_type text NOT NULL DEFAULT 'conversion', -- conversion, auction_purchase, bonus
  source_commission_id uuid REFERENCES public.commission_ledger(id),
  cash_amount numeric NOT NULL DEFAULT 0, -- original cash amount converted
  multiplier numeric NOT NULL DEFAULT 1.2,
  created_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE public.growth_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own credits" ON public.growth_credits
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_super_admin(auth.uid()));

CREATE POLICY "Users insert own credits" ON public.growth_credits
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND amount > 0 AND cash_amount > 0);

CREATE POLICY "Admin manages credits" ON public.growth_credits
  FOR ALL TO authenticated USING (is_super_admin(auth.uid())) WITH CHECK (is_super_admin(auth.uid()));

-- ============================================================
-- 2. Scent-Station QR Nodes (Physical Locations)
-- ============================================================
CREATE TABLE public.scent_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliate_partners(id),
  user_id uuid NOT NULL,
  business_name text NOT NULL,
  business_type text NOT NULL DEFAULT 'retail', -- gym, barbershop, salon, office, retail
  address text,
  qr_code_data text NOT NULL DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
  commission_split_pct numeric NOT NULL DEFAULT 10, -- % given to host business
  total_scans integer NOT NULL DEFAULT 0,
  total_conversions integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scent_stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own stations" ON public.scent_stations
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE POLICY "Users insert own stations" ON public.scent_stations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND length(business_name) <= 200);

CREATE POLICY "Users update own stations" ON public.scent_stations
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin deletes stations" ON public.scent_stations
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

-- ============================================================
-- 3. Session Fingerprinting
-- ============================================================
CREATE TABLE public.session_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ip_address text,
  user_agent text,
  fingerprint_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System inserts fingerprints" ON public.session_fingerprints
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin reads fingerprints" ON public.session_fingerprints
  FOR SELECT TO authenticated USING (is_super_admin(auth.uid()) OR has_role(auth.uid(), 'admin'));

-- ============================================================
-- 4. Affiliate Compliance Tracking
-- ============================================================
CREATE TABLE public.affiliate_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliate_partners(id),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  sales_count integer NOT NULL DEFAULT 0,
  is_compliant boolean NOT NULL DEFAULT false,
  commission_voided boolean NOT NULL DEFAULT false,
  voided_amount numeric NOT NULL DEFAULT 0,
  checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(affiliate_id, week_start)
);

ALTER TABLE public.affiliate_compliance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own compliance" ON public.affiliate_compliance
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE POLICY "Admin manages compliance" ON public.affiliate_compliance
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid())) WITH CHECK (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

-- ============================================================
-- 5. Sub-Affiliate Margin Management
-- ============================================================
CREATE TABLE public.sub_affiliate_margins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_user_id uuid NOT NULL,
  sub_affiliate_id uuid NOT NULL REFERENCES public.affiliate_partners(id),
  margin_pct numeric NOT NULL DEFAULT 30 CHECK (margin_pct >= 30 AND margin_pct <= 40),
  manager_spread_pct numeric GENERATED ALWAYS AS (50 - margin_pct) STORED,
  promoted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(manager_user_id, sub_affiliate_id)
);

ALTER TABLE public.sub_affiliate_margins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers read own margins" ON public.sub_affiliate_margins
  FOR SELECT TO authenticated USING (manager_user_id = auth.uid() OR is_super_admin(auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers insert margins" ON public.sub_affiliate_margins
  FOR INSERT TO authenticated WITH CHECK (manager_user_id = auth.uid());

CREATE POLICY "Managers update margins" ON public.sub_affiliate_margins
  FOR UPDATE TO authenticated USING (manager_user_id = auth.uid() OR is_super_admin(auth.uid()));

-- ============================================================
-- 6. Inactivity Auction / Portfolio Liquidation
-- ============================================================
CREATE TABLE public.portfolio_auctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_affiliate_id uuid NOT NULL REFERENCES public.affiliate_partners(id),
  client_count integer NOT NULL DEFAULT 0,
  total_portfolio_value numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'listed', -- listed, claimed, liquidated
  claimed_by_user_id uuid,
  credit_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.portfolio_auctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users read auctions" ON public.portfolio_auctions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manages auctions" ON public.portfolio_auctions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid())) WITH CHECK (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

-- ============================================================
-- 7. Add last_active_at to affiliate_partners for orphaning
-- ============================================================
ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();
ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS is_compliant boolean DEFAULT true;
ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS withdrawals_locked boolean DEFAULT false;
ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS compliance_streak_days integer DEFAULT 0;

-- Add identity cloaking flag to client_connections
ALTER TABLE public.client_connections ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE public.client_connections ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.client_connections ADD COLUMN IF NOT EXISTS is_contact_cloaked boolean DEFAULT true;
