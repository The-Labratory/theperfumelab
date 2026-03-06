-- ════════════════════════════════════════════════════════════════════════════
-- Migration: Admin infrastructure
--   1. Extend app_role enum with 'superadmin'
--   2. employees table (internal staff records + approval workflow)
--   3. employee_invites table (invite-code-based onboarding)
--   4. referrals table (self-referencing tree: referrer → referee)
--   5. RLS policies for all new tables
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Add 'superadmin' to the existing role enum (idempotent)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';

-- ── 2. employees ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  department      TEXT,
  title           TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected','offboarded')),
  approved_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  rejection_note  TEXT,
  hired_at        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT employees_email_len CHECK (length(email) <= 255),
  CONSTRAINT employees_name_len  CHECK (length(name)  <= 200)
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Admins and superadmins can view all employees
CREATE POLICY "Admins can read employees"
  ON public.employees FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Employees can view their own record
CREATE POLICY "Employees can read own record"
  ON public.employees FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Only superadmins can insert employees
CREATE POLICY "Superadmins can insert employees"
  ON public.employees FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- Admins can approve/reject (update status, approved_by, approved_at, rejection_note)
-- Superadmins can update anything
CREATE POLICY "Admins can update employee status"
  ON public.employees FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Only superadmins can delete employee records
CREATE POLICY "Superadmins can delete employees"
  ON public.employees FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

-- Trigger: auto-set updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. employee_invites ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employee_invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL,
  role         public.app_role NOT NULL DEFAULT 'user',
  invited_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code  TEXT NOT NULL UNIQUE
                 DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','accepted','expired','revoked')),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invites_email_len CHECK (length(email) <= 255)
);

ALTER TABLE public.employee_invites ENABLE ROW LEVEL SECURITY;

-- Admins/superadmins can read all invites
CREATE POLICY "Admins can read invites"
  ON public.employee_invites FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Admins/superadmins can send invites
CREATE POLICY "Admins can send invites"
  ON public.employee_invites FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'))
    AND invited_by = auth.uid()
    AND length(email) <= 255
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

-- Admins/superadmins can revoke invites
CREATE POLICY "Admins can update invites"
  ON public.employee_invites FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- No public deletes
CREATE POLICY "No public deletes on invites"
  ON public.employee_invites FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

-- Function to accept an invite (called by the invitee — must be authenticated)
CREATE OR REPLACE FUNCTION public.accept_employee_invite(_invite_code text, _user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.employee_invites;
BEGIN
  -- Ensure the caller can only accept an invite for themselves
  IF _user_id IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot accept an invite on behalf of another user');
  END IF;

  SELECT * INTO v_invite
  FROM public.employee_invites
  WHERE invite_code = _invite_code
    AND status = 'pending'
    AND expires_at > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invite not found or expired');
  END IF;

  -- Mark invite accepted
  UPDATE public.employee_invites
  SET status = 'accepted', accepted_at = now()
  WHERE id = v_invite.id;

  -- Assign role to the user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, v_invite.role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'role', v_invite.role::text);
END;
$$;

-- ── 4. referrals ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_email    TEXT NOT NULL,
  referee_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code    TEXT NOT NULL UNIQUE
                     DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','registered','converted')),
  -- 'pending'    = invite sent, recipient hasn't signed up yet
  -- 'registered' = recipient signed up via referral link
  -- 'converted'  = recipient completed a purchase / qualifying action
  converted_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT referrals_email_len CHECK (length(referee_email) <= 255),
  UNIQUE (referrer_id, referee_email)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can see their own outbound referrals
CREATE POLICY "Users can read own referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (referrer_id = auth.uid());

-- Users can create referrals for others (rate-limited: max 20 per day per user)
CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (
    referrer_id = auth.uid()
    AND length(referee_email) <= 255
    AND referee_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND (
      SELECT count(*) FROM public.referrals r
      WHERE r.referrer_id = auth.uid()
        AND r.created_at > (now() - interval '24 hours')
    ) < 20
  );

-- No user updates/deletes on referrals (admin-only via service role)
CREATE POLICY "No user updates on referrals"
  ON public.referrals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Admins can view the full referral tree
CREATE POLICY "Admins can read all referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Secure function: register a referral (called when a new user signs up with a referral code)
CREATE OR REPLACE FUNCTION public.register_referral(_referral_code text, _referee_user_id uuid, _referee_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ref public.referrals;
BEGIN
  -- Ensure the caller can only register themselves as a referee
  IF _referee_user_id IS DISTINCT FROM auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot register a referral on behalf of another user');
  END IF;

  SELECT * INTO v_ref
  FROM public.referrals
  WHERE referral_code = _referral_code
    AND status = 'pending'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Referral code not found or already used');
  END IF;

  UPDATE public.referrals
  SET status = 'registered',
      referee_user_id = _referee_user_id,
      referee_email = _referee_email
  WHERE id = v_ref.id;

  RETURN jsonb_build_object('success', true, 'referrer_id', v_ref.referrer_id);
END;
$$;

-- Recursive CTE function to get the full referral tree from a root user
CREATE OR REPLACE FUNCTION public.get_referral_tree(_root_user_id uuid, _max_depth integer DEFAULT 5)
RETURNS TABLE (
  id uuid,
  referrer_id uuid,
  referee_user_id uuid,
  referee_email text,
  referral_code text,
  status text,
  depth integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE tree AS (
    -- Base: direct referrals from the root
    SELECT r.id, r.referrer_id, r.referee_user_id, r.referee_email,
           r.referral_code, r.status, 1 AS depth, r.created_at
    FROM public.referrals r
    WHERE r.referrer_id = _root_user_id

    UNION ALL

    -- Recursive: referrals made by people who were referred
    SELECT r.id, r.referrer_id, r.referee_user_id, r.referee_email,
           r.referral_code, r.status, tree.depth + 1, r.created_at
    FROM public.referrals r
    INNER JOIN tree ON r.referrer_id = tree.referee_user_id
    WHERE tree.depth < _max_depth
      AND tree.referee_user_id IS NOT NULL
  )
  SELECT * FROM tree
  ORDER BY depth, created_at;
$$;
