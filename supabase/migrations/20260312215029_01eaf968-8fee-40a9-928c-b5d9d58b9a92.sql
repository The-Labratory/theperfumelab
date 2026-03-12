-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  perfume_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, perfume_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'favorites' AND policyname = 'Users can read own favorites'
  ) THEN
    CREATE POLICY "Users can read own favorites"
    ON public.favorites
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'favorites' AND policyname = 'Users can add own favorites'
  ) THEN
    CREATE POLICY "Users can add own favorites"
    ON public.favorites
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'favorites' AND policyname = 'Users can remove own favorites'
  ) THEN
    CREATE POLICY "Users can remove own favorites"
    ON public.favorites
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_perfume_id ON public.favorites(perfume_id);

-- Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL,
  referred_email TEXT,
  referred_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  credits_awarded NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_referred_user_unique
ON public.referrals(referred_user_id)
WHERE referred_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_user_id ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_email ON public.referrals(referred_email);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'referrals' AND policyname = 'Users can read own referrals'
  ) THEN
    CREATE POLICY "Users can read own referrals"
    ON public.referrals
    FOR SELECT
    TO authenticated
    USING (
      referrer_user_id = auth.uid()
      OR referred_user_id = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR is_super_admin(auth.uid())
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'referrals' AND policyname = 'Users can create own referrals'
  ) THEN
    CREATE POLICY "Users can create own referrals"
    ON public.referrals
    FOR INSERT
    TO authenticated
    WITH CHECK (
      referrer_user_id = auth.uid()
      AND (referred_email IS NULL OR length(referred_email) <= 255)
      AND status IN ('pending', 'completed')
      AND credits_awarded >= 0
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'referrals' AND policyname = 'Admins can update referrals'
  ) THEN
    CREATE POLICY "Admins can update referrals"
    ON public.referrals
    FOR UPDATE
    TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));
  END IF;
END $$;

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  perfume_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reviews_perfume_id ON public.reviews(perfume_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_perfume_unique ON public.reviews(user_id, perfume_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Anyone can read reviews'
  ) THEN
    CREATE POLICY "Anyone can read reviews"
    ON public.reviews
    FOR SELECT
    TO public
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Users can create own reviews'
  ) THEN
    CREATE POLICY "Users can create own reviews"
    ON public.reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (
      user_id = auth.uid()
      AND (review_text IS NULL OR length(review_text) <= 2000)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Users can update own reviews'
  ) THEN
    CREATE POLICY "Users can update own reviews"
    ON public.reviews
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (
      user_id = auth.uid()
      AND (review_text IS NULL OR length(review_text) <= 2000)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Users can delete own reviews'
  ) THEN
    CREATE POLICY "Users can delete own reviews"
    ON public.reviews
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Credit awards utility (controlled, one-time where required)
CREATE OR REPLACE FUNCTION public.award_growth_credit(_credit_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _amount NUMERIC := 0;
  _notes TEXT := NULL;
  _already_awarded BOOLEAN := FALSE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF _credit_type = 'welcome_bonus' THEN
    _amount := 25;
    _notes := 'Welcome bonus';
    SELECT EXISTS(
      SELECT 1 FROM public.growth_credits
      WHERE user_id = _uid AND credit_type = 'welcome_bonus'
    ) INTO _already_awarded;
  ELSIF _credit_type = 'scent_quiz_complete' THEN
    _amount := 15;
    _notes := 'Scent quiz completion bonus';
    SELECT EXISTS(
      SELECT 1 FROM public.growth_credits
      WHERE user_id = _uid AND credit_type = 'scent_quiz_complete'
    ) INTO _already_awarded;
  ELSIF _credit_type = 'review_bonus' THEN
    _amount := 5;
    _notes := 'Review contribution bonus';
    _already_awarded := FALSE;
  ELSE
    RAISE EXCEPTION 'Unsupported credit type';
  END IF;

  IF _already_awarded THEN
    RETURN;
  END IF;

  INSERT INTO public.growth_credits (user_id, amount, cash_amount, multiplier, credit_type, notes)
  VALUES (_uid, _amount, 0, 1.0, _credit_type, _notes);
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_growth_credit(TEXT) TO authenticated;

-- Link signup referral code to referrals table + award credits to referrer
CREATE OR REPLACE FUNCTION public.apply_referral_signup(
  _new_user_id UUID,
  _referral_code TEXT,
  _referred_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _referrer_user_id UUID;
  _referral_id UUID;
BEGIN
  IF _new_user_id IS NULL OR _referral_code IS NULL OR length(trim(_referral_code)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_input');
  END IF;

  SELECT p.user_id INTO _referrer_user_id
  FROM public.profiles p
  WHERE p.referral_code = _referral_code
  LIMIT 1;

  IF _referrer_user_id IS NULL OR _referrer_user_id = _new_user_id THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_referrer');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.referrals r
    WHERE r.referred_user_id = _new_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_processed');
  END IF;

  INSERT INTO public.referrals (
    referrer_user_id,
    referred_email,
    referred_user_id,
    status,
    credits_awarded
  )
  VALUES (
    _referrer_user_id,
    _referred_email,
    _new_user_id,
    'completed',
    20
  )
  RETURNING id INTO _referral_id;

  INSERT INTO public.growth_credits (user_id, amount, cash_amount, multiplier, credit_type, notes)
  VALUES (
    _referrer_user_id,
    20,
    0,
    1.0,
    'referral_bonus',
    'Referral signup bonus #' || _referral_id::text
  );

  RETURN jsonb_build_object('success', true, 'referral_id', _referral_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_referral_signup(UUID, TEXT, TEXT) TO authenticated;