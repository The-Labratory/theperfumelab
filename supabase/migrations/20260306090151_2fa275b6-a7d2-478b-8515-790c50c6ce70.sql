
-- ============================================================
-- REFERRAL TREE SYSTEM - Full Schema
-- ============================================================

-- 1. Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
UPDATE public.profiles SET referral_code = substr(replace(gen_random_uuid()::text, '-', ''), 1, 10) WHERE referral_code IS NULL;

-- 2. Referral Relationships
CREATE TABLE public.referral_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  parent_user_id uuid,
  depth integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_referral CHECK (user_id != parent_user_id)
);
ALTER TABLE public.referral_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own relationship" ON public.referral_relationships FOR SELECT TO authenticated USING (user_id = auth.uid() OR parent_user_id = auth.uid() OR public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert relationships" ON public.referral_relationships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'confirmed');
CREATE POLICY "Only super_admin can update relationships" ON public.referral_relationships FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Only super_admin can delete relationships" ON public.referral_relationships FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE INDEX idx_referral_parent ON public.referral_relationships(parent_user_id);
CREATE INDEX idx_referral_user ON public.referral_relationships(user_id);

-- 3. Referral Invites
CREATE TABLE public.referral_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code text NOT NULL UNIQUE DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  inviter_user_id uuid NOT NULL,
  invited_email text,
  invited_user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '90 days'),
  ip_address text,
  user_agent text,
  CONSTRAINT no_self_invite CHECK (inviter_user_id != invited_user_id)
);
ALTER TABLE public.referral_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own invites" ON public.referral_invites FOR SELECT TO authenticated USING (inviter_user_id = auth.uid() OR invited_user_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "Auth users create invites" ON public.referral_invites FOR INSERT TO authenticated WITH CHECK (inviter_user_id = auth.uid() AND status = 'pending' AND length(COALESCE(invited_email, '')) <= 255);
CREATE POLICY "Super admin manages invites" ON public.referral_invites FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE INDEX idx_invite_code ON public.referral_invites(invite_code);
CREATE INDEX idx_invite_inviter ON public.referral_invites(inviter_user_id);

-- 4. Referral Events
CREATE TABLE public.referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own events" ON public.referral_events FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "System inserts events" ON public.referral_events FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Commission Rules
CREATE TABLE public.commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  commission_pct numeric NOT NULL DEFAULT 0,
  min_qualified_referrals integer DEFAULT 0,
  min_personal_sales numeric DEFAULT 0,
  min_team_volume numeric DEFAULT 0,
  max_depth integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active rules" ON public.commission_rules FOR SELECT TO authenticated USING (is_active = true OR public.is_super_admin(auth.uid()));
CREATE POLICY "Super admin manages rules" ON public.commission_rules FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
INSERT INTO public.commission_rules (rule_name, level, commission_pct, min_qualified_referrals) VALUES ('Direct Referral', 1, 10, 0), ('Level 2 Override', 2, 5, 3), ('Level 3 Override', 3, 2.5, 5);

-- 6. Commission Ledger
CREATE TABLE public.commission_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_user_id uuid,
  source_order_id uuid,
  level integer NOT NULL DEFAULT 1,
  sale_amount numeric NOT NULL DEFAULT 0,
  commission_pct numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  rule_id uuid REFERENCES public.commission_rules(id)
);
ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own commissions" ON public.commission_ledger FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "Super admin manages ledger" ON public.commission_ledger FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- 7. Rank Rules
CREATE TABLE public.rank_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rank_name text NOT NULL UNIQUE,
  rank_level integer NOT NULL DEFAULT 0,
  min_direct_referrals integer DEFAULT 0,
  min_team_sales numeric DEFAULT 0,
  min_personal_sales numeric DEFAULT 0,
  min_qualified_downline integer DEFAULT 0,
  badge_color text DEFAULT '#6366f1',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rank_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active ranks" ON public.rank_rules FOR SELECT TO authenticated USING (is_active = true OR public.is_super_admin(auth.uid()));
CREATE POLICY "Super admin manages ranks" ON public.rank_rules FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
INSERT INTO public.rank_rules (rank_name, rank_level, min_direct_referrals, min_team_sales, badge_color) VALUES ('Starter', 0, 0, 0, '#94a3b8'), ('Sales', 10, 3, 100, '#22c55e'), ('Team Leader', 20, 10, 500, '#3b82f6'), ('Manager', 30, 25, 2000, '#8b5cf6'), ('Director', 40, 50, 5000, '#f59e0b'), ('Platinum', 50, 100, 15000, '#06b6d4');

-- 8. User Rank History
CREATE TABLE public.user_rank_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rank_name text NOT NULL,
  rank_level integer NOT NULL DEFAULT 0,
  achieved_at timestamptz NOT NULL DEFAULT now(),
  qualification_snapshot jsonb DEFAULT '{}'::jsonb
);
ALTER TABLE public.user_rank_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own rank history" ON public.user_rank_history FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));
CREATE POLICY "System inserts rank history" ON public.user_rank_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

-- 9. Fraud Flags
CREATE TABLE public.fraud_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  flag_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  details jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'open',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin manages fraud flags" ON public.fraud_flags FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- 10. Helper functions
CREATE OR REPLACE FUNCTION public.get_downline(_user_id uuid, _max_depth integer DEFAULT 100)
RETURNS TABLE(user_id uuid, parent_user_id uuid, depth integer, display_name text, referral_code text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH RECURSIVE tree AS (
    SELECT rr.user_id, rr.parent_user_id, 0 AS relative_depth
    FROM public.referral_relationships rr
    WHERE rr.parent_user_id = _user_id AND rr.status = 'confirmed'
    UNION ALL
    SELECT rr.user_id, rr.parent_user_id, t.relative_depth + 1
    FROM public.referral_relationships rr
    JOIN tree t ON rr.parent_user_id = t.user_id
    WHERE rr.status = 'confirmed' AND t.relative_depth < _max_depth
  )
  SELECT t.user_id, t.parent_user_id, t.relative_depth, p.display_name, p.referral_code
  FROM tree t
  LEFT JOIN public.profiles p ON p.user_id = t.user_id
$$;

CREATE OR REPLACE FUNCTION public.count_direct_referrals(_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COUNT(*)::integer FROM public.referral_relationships WHERE parent_user_id = _user_id AND status = 'confirmed' $$;

CREATE OR REPLACE FUNCTION public.count_total_downline(_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COUNT(*)::integer FROM public.get_downline(_user_id) $$;

CREATE OR REPLACE FUNCTION public.check_invite_rate_limit(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT (SELECT COUNT(*) FROM public.referral_invites WHERE inviter_user_id = _user_id AND created_at > now() - interval '1 hour') < 20 $$;

CREATE OR REPLACE FUNCTION public.process_referral_signup(_new_user_id uuid, _referral_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _inviter_id uuid;
  _inviter_depth integer;
  _existing record;
  _invite_id uuid;
BEGIN
  SELECT user_id INTO _inviter_id FROM public.profiles WHERE referral_code = _referral_code;
  IF _inviter_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  IF _inviter_id = _new_user_id THEN
    INSERT INTO public.fraud_flags (user_id, flag_type, severity, details) VALUES (_new_user_id, 'self_referral', 'high', jsonb_build_object('referral_code', _referral_code));
    RETURN jsonb_build_object('success', false, 'error', 'Self-referral blocked');
  END IF;

  SELECT * INTO _existing FROM public.referral_relationships WHERE user_id = _new_user_id;
  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already has a referral parent');
  END IF;

  IF EXISTS (SELECT 1 FROM public.get_downline(_new_user_id) d WHERE d.user_id = _inviter_id) THEN
    INSERT INTO public.fraud_flags (user_id, flag_type, severity, details) VALUES (_new_user_id, 'circular_referral', 'critical', jsonb_build_object('inviter', _inviter_id));
    RETURN jsonb_build_object('success', false, 'error', 'Circular referral blocked');
  END IF;

  SELECT COALESCE(depth, 0) INTO _inviter_depth FROM public.referral_relationships WHERE user_id = _inviter_id;

  INSERT INTO public.referral_relationships (user_id, parent_user_id, depth, status, confirmed_at)
  VALUES (_new_user_id, _inviter_id, COALESCE(_inviter_depth, 0) + 1, 'confirmed', now());

  -- Update first matching pending invite (no LIMIT in UPDATE for plpgsql)
  SELECT id INTO _invite_id FROM public.referral_invites
  WHERE inviter_user_id = _inviter_id AND status = 'pending'
    AND (invited_email IS NULL OR invited_email = (SELECT email FROM auth.users WHERE id = _new_user_id))
  ORDER BY created_at ASC LIMIT 1;

  IF _invite_id IS NOT NULL THEN
    UPDATE public.referral_invites SET status = 'accepted', invited_user_id = _new_user_id, accepted_at = now() WHERE id = _invite_id;
  END IF;

  INSERT INTO public.referral_events (user_id, event_type, details)
  VALUES (_new_user_id, 'signup_via_referral', jsonb_build_object('inviter_id', _inviter_id, 'referral_code', _referral_code));

  INSERT INTO public.user_rank_history (user_id, rank_name, rank_level, qualification_snapshot)
  VALUES (_new_user_id, 'Starter', 0, '{}'::jsonb);

  RETURN jsonb_build_object('success', true, 'parent_user_id', _inviter_id);
END;
$$;
