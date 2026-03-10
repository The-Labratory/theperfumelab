
-- Client Connections: Persistent attribution engine
CREATE TABLE public.client_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  original_affiliate_id UUID REFERENCES public.affiliate_partners(id) ON DELETE SET NULL,
  acquisition_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  account_type TEXT NOT NULL DEFAULT 'B2C' CHECK (account_type IN ('B2C', 'B2B_Corporate')),
  company_name TEXT,
  expected_volume TEXT,
  discount_pct NUMERIC DEFAULT 0 CHECK (discount_pct >= 0 AND discount_pct <= 40),
  checkout_link_code TEXT UNIQUE DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
  last_order_at TIMESTAMP WITH TIME ZONE,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_email)
);

ALTER TABLE public.client_connections ENABLE ROW LEVEL SECURITY;

-- RLS: affiliates see only their own clients, admins see all
CREATE POLICY "Affiliates read own clients"
  ON public.client_connections FOR SELECT TO authenticated
  USING (
    original_affiliate_id IN (
      SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR is_super_admin(auth.uid())
  );

CREATE POLICY "Affiliates insert own clients"
  ON public.client_connections FOR INSERT TO authenticated
  WITH CHECK (
    original_affiliate_id IN (
      SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()
    )
    AND length(client_email) <= 255
  );

CREATE POLICY "Affiliates update own clients"
  ON public.client_connections FOR UPDATE TO authenticated
  USING (
    original_affiliate_id IN (
      SELECT id FROM public.affiliate_partners WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete client connections"
  ON public.client_connections FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

-- Trigger: auto-attribute orders to affiliates via client_connections
CREATE OR REPLACE FUNCTION public.auto_attribute_order_to_affiliate()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  _connection RECORD;
BEGIN
  IF NEW.customer_email IS NOT NULL THEN
    SELECT * INTO _connection
    FROM public.client_connections
    WHERE client_email = lower(trim(NEW.customer_email))
    LIMIT 1;

    IF FOUND AND _connection.original_affiliate_id IS NOT NULL THEN
      -- Create affiliate referral for this order
      INSERT INTO public.affiliate_referrals (
        affiliate_id, order_id, referred_email, referral_type, status, commission_amount
      ) VALUES (
        _connection.original_affiliate_id,
        NEW.id,
        NEW.customer_email,
        CASE WHEN _connection.account_type = 'B2B_Corporate' THEN 'b2b_order' ELSE 'b2c_order' END,
        'pending',
        CASE
          WHEN _connection.account_type = 'B2B_Corporate' THEN NEW.total * 0.15
          ELSE NEW.total * 0.50
        END
      );

      -- Update client connection stats
      UPDATE public.client_connections
      SET last_order_at = now(),
          total_orders = total_orders + 1,
          total_spent = total_spent + NEW.total,
          updated_at = now()
      WHERE id = _connection.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_attribute_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_attribute_order_to_affiliate();

-- Updated_at trigger
CREATE TRIGGER update_client_connections_updated_at
  BEFORE UPDATE ON public.client_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
