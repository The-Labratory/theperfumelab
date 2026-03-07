
-- Affiliate partners table
CREATE TABLE public.affiliate_partners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  display_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text,
  tier text NOT NULL DEFAULT 'bronze',
  commission_rate numeric NOT NULL DEFAULT 10,
  total_earnings numeric NOT NULL DEFAULT 0,
  total_referrals integer NOT NULL DEFAULT 0,
  total_sales numeric NOT NULL DEFAULT 0,
  payout_method text DEFAULT 'bank_transfer',
  payout_details jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'suspended', 'rejected'))
);

-- Referral tracking table
CREATE TABLE public.affiliate_referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id uuid NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  referred_email text,
  referred_user_id uuid,
  referral_type text NOT NULL DEFAULT 'signup',
  status text NOT NULL DEFAULT 'pending',
  order_id uuid REFERENCES public.orders(id),
  commission_amount numeric DEFAULT 0,
  commission_paid boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  converted_at timestamp with time zone,
  CONSTRAINT valid_referral_type CHECK (referral_type IN ('signup', 'purchase', 'partner')),
  CONSTRAINT valid_referral_status CHECK (status IN ('pending', 'converted', 'expired'))
);

-- Payout history
CREATE TABLE public.affiliate_payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id uuid NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending',
  payout_method text,
  reference text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  CONSTRAINT valid_payout_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Enable RLS
ALTER TABLE public.affiliate_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Affiliate partners policies
CREATE POLICY "Users can read own affiliate profile"
ON public.affiliate_partners FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Auth users can apply as affiliate"
ON public.affiliate_partners FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND length(display_name) <= 200
  AND length(email) <= 255
  AND status = 'pending'
);

CREATE POLICY "Users can update own affiliate profile"
ON public.affiliate_partners FOR UPDATE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Referrals policies
CREATE POLICY "Affiliates can read own referrals"
ON public.affiliate_referrals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.affiliate_partners ap
    WHERE ap.id = affiliate_referrals.affiliate_id
    AND (ap.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "System can create referrals"
ON public.affiliate_referrals FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.affiliate_partners ap
    WHERE ap.id = affiliate_referrals.affiliate_id
    AND ap.status = 'active'
  )
);

-- Payouts policies
CREATE POLICY "Affiliates can read own payouts"
ON public.affiliate_payouts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.affiliate_partners ap
    WHERE ap.id = affiliate_payouts.affiliate_id
    AND (ap.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Admins can manage payouts"
ON public.affiliate_payouts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_affiliate_partners_updated_at
BEFORE UPDATE ON public.affiliate_partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
