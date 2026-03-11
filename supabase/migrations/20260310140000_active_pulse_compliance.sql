-- ============================================================
-- MODULE B: "Active Pulse" Compliance Monitor
-- ============================================================

-- affiliate_metrics: weekly rolling sales counter per affiliate
CREATE TABLE public.affiliate_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  weekly_sales INTEGER NOT NULL DEFAULT 0,
  weekly_revenue NUMERIC NOT NULL DEFAULT 0,
  lapsed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(affiliate_id, week_start)
);

ALTER TABLE public.affiliate_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates read own metrics"
  ON public.affiliate_metrics FOR SELECT TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR is_super_admin(auth.uid())
  );

CREATE POLICY "System can upsert metrics"
  ON public.affiliate_metrics FOR INSERT TO authenticated
  WITH CHECK (is_super_admin(auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can update metrics"
  ON public.affiliate_metrics FOR UPDATE TO authenticated
  USING (is_super_admin(auth.uid()) OR has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER update_affiliate_metrics_updated_at
  BEFORE UPDATE ON public.affiliate_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- fn_orphan_customers: reassign lapsed affiliate's clients to HOUSE account
-- ============================================================

-- The HOUSE_UID is the company account that receives orphaned clients.
-- In production, set this to the actual company affiliate_partners.id.
-- It is stored as a DB constant via a helper function so it can be updated.
CREATE OR REPLACE FUNCTION public.get_house_affiliate_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id
  FROM public.affiliate_partners
  WHERE status = 'active'
  ORDER BY created_at ASC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.fn_orphan_customers(_affiliate_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _house_id UUID;
  _rows_updated INTEGER;
BEGIN
  _house_id := public.get_house_affiliate_id();

  -- If the affiliate IS the house account, skip to avoid self-assignment loops
  IF _house_id IS NULL OR _house_id = _affiliate_id THEN
    RETURN 0;
  END IF;

  UPDATE public.client_connections
  SET original_affiliate_id = _house_id,
      updated_at = now()
  WHERE original_affiliate_id = _affiliate_id;

  GET DIAGNOSTICS _rows_updated = ROW_COUNT;

  -- Audit the reassignment
  INSERT INTO public.admin_audit_logs (
    user_id, entity_type, action, new_values
  ) VALUES (
    NULL,
    'client_connections',
    'orphan_reassignment',
    jsonb_build_object(
      'from_affiliate_id', _affiliate_id,
      'to_house_id', _house_id,
      'clients_reassigned', _rows_updated
    )
  );

  RETURN _rows_updated;
END;
$$;

-- ============================================================
-- Weekly compliance evaluation function (called by cron or edge function)
-- ============================================================
CREATE OR REPLACE FUNCTION public.run_weekly_compliance_check()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _rec RECORD;
  _week_start DATE;
  _lapsed_count INTEGER := 0;
  _orphaned_count INTEGER := 0;
  _orphaned_rows INTEGER;
BEGIN
  _week_start := date_trunc('week', now())::DATE;

  -- Evaluate each active b2c_affiliate
  FOR _rec IN
    SELECT ap.id, ap.status, am.weekly_sales, am.lapsed_at
    FROM public.affiliate_partners ap
    LEFT JOIN public.affiliate_metrics am
      ON am.affiliate_id = ap.id AND am.week_start = _week_start
    WHERE ap.status IN ('active', 'Lapsed')
      AND ap.account_type = 'b2c_affiliate'
  LOOP
    -- Rule 1: weekly_sales < 5 → mark Lapsed
    -- Minimum 5 sales/week is the compliance threshold for b2c_affiliate accounts
    IF COALESCE(_rec.weekly_sales, 0) < 5 AND _rec.status = 'active' THEN
      UPDATE public.affiliate_partners
      SET status = 'Lapsed', updated_at = now()
      WHERE id = _rec.id;

      -- Record when this affiliate first lapsed
      INSERT INTO public.affiliate_metrics (affiliate_id, week_start, weekly_sales, lapsed_at)
      VALUES (_rec.id, _week_start, COALESCE(_rec.weekly_sales, 0), now())
      ON CONFLICT (affiliate_id, week_start)
      DO UPDATE SET lapsed_at = COALESCE(affiliate_metrics.lapsed_at, now()), updated_at = now();

      _lapsed_count := _lapsed_count + 1;
    END IF;

    -- Rule 2: Lapsed for > 30 days (grace period) → orphan their clients
    -- After the 30-day grace period, clients are reassigned to the HOUSE account
    IF _rec.status = 'Lapsed'
       AND _rec.lapsed_at IS NOT NULL
       AND _rec.lapsed_at < now() - INTERVAL '30 days' THEN
      _orphaned_rows := public.fn_orphan_customers(_rec.id);
      _orphaned_count := _orphaned_count + _orphaned_rows;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'run_at', now(),
    'week_start', _week_start,
    'lapsed_this_week', _lapsed_count,
    'orphaned_clients', _orphaned_count
  );
END;
$$;

-- ============================================================
-- Increment weekly metric whenever an affiliate referral is recorded
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_affiliate_weekly_sales()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _week_start DATE;
BEGIN
  _week_start := date_trunc('week', now())::DATE;

  INSERT INTO public.affiliate_metrics (affiliate_id, week_start, weekly_sales, weekly_revenue)
  VALUES (NEW.affiliate_id, _week_start, 1, COALESCE(NEW.commission_amount, 0) * 2)
  -- weekly_revenue approximates order total: commission_amount is 50% of order for B2C,
  -- so multiplying by 2 recovers the retail price. For B2B the approximation is less precise
  -- but sufficient for compliance threshold monitoring purposes.
  ON CONFLICT (affiliate_id, week_start)
  DO UPDATE SET
    weekly_sales = affiliate_metrics.weekly_sales + 1,
    weekly_revenue = affiliate_metrics.weekly_revenue + COALESCE(NEW.commission_amount, 0) * 2,
    updated_at = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_increment_weekly_sales
  AFTER INSERT ON public.affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_affiliate_weekly_sales();
