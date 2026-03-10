-- ============================================================
-- Commissions table: immutable ledger for attribution payouts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.commissions (
  id                  UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id        UUID        NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  order_id            UUID        REFERENCES public.orders(id) ON DELETE SET NULL,
  -- Source affiliate for Tier 2 override rows
  source_affiliate_id UUID        REFERENCES public.affiliate_partners(id) ON DELETE SET NULL,
  account_type        TEXT        NOT NULL DEFAULT 'B2C'
                        CHECK (account_type IN ('B2C', 'B2B_Corporate')),
  commission_tier     INTEGER     NOT NULL DEFAULT 1
                        CHECK (commission_tier IN (1, 2)),
  order_amount        NUMERIC     NOT NULL DEFAULT 0,
  commission_pct      NUMERIC     NOT NULL DEFAULT 0,
  commission_amount   NUMERIC     NOT NULL DEFAULT 0,
  status              TEXT        NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  approved_at         TIMESTAMPTZ,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates read own commissions"
  ON public.commissions FOR SELECT TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR is_super_admin(auth.uid())
  );

CREATE POLICY "System inserts commissions"
  ON public.commissions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE POLICY "Admins update commissions"
  ON public.commissions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
