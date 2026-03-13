CREATE OR REPLACE FUNCTION public.apply_referral_signup(_new_user_id uuid, _referral_code text, _referred_email text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _referrer_user_id UUID;
  _referral_id UUID;
BEGIN
  -- SECURITY: Verify caller identity to prevent spoofing
  IF _new_user_id IS NULL OR _new_user_id <> auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'reason', 'identity_mismatch');
  END IF;

  IF _referral_code IS NULL OR length(trim(_referral_code)) = 0 THEN
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
$function$;