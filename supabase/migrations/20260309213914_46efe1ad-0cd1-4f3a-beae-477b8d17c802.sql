-- 1. Fix security_events INSERT policy: require user_id = auth.uid()
DROP POLICY IF EXISTS "Authenticated can log security events" ON public.security_events;
CREATE POLICY "Authenticated can log security events"
  ON public.security_events FOR INSERT TO authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND length(event_type) <= 100
  );

-- 2. Fix waitlist rate limit bug (w.email = w.email -> w.email = waitlist.email)
DROP POLICY IF EXISTS "Rate limited waitlist signups" ON public.waitlist;
CREATE POLICY "Rate limited waitlist signups"
  ON public.waitlist FOR INSERT TO public
  WITH CHECK (
    length(email) <= 255
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND (name IS NULL OR length(name) <= 200)
    AND (reason IS NULL OR length(reason) <= 1000)
    AND (
      SELECT count(*) FROM public.waitlist w
      WHERE w.email = waitlist.email
        AND w.created_at > now() - interval '1 hour'
    ) < 5
  );

-- 3. Fix partner_applications rate limit bug
DROP POLICY IF EXISTS "Rate limited partner applications" ON public.partner_applications;
CREATE POLICY "Rate limited partner applications"
  ON public.partner_applications FOR INSERT TO public
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(company_name) <= 200
    AND length(contact_name) <= 200
    AND length(email) <= 255
    AND (phone IS NULL OR length(phone) <= 50)
    AND (website IS NULL OR length(website) <= 500)
    AND (message IS NULL OR length(message) <= 2000)
    AND (
      SELECT count(*) FROM public.partner_applications pa
      WHERE pa.email = partner_applications.email
        AND pa.created_at > now() - interval '1 hour'
    ) < 3
  );

-- 4. Create admin_whitelist table for admin emails
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  grants_super_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super_admin can manage whitelist"
  ON public.admin_whitelist FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Seed the whitelist
INSERT INTO public.admin_whitelist (email, grants_super_admin) VALUES
  ('hariri@lenzohariri.com', true),
  ('loranshariri@gmail.com', false)
ON CONFLICT (email) DO NOTHING;

-- 5. Update assign_admin_if_allowed to use the whitelist table
CREATE OR REPLACE FUNCTION public.assign_admin_if_allowed()
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  _email text;
  _entry record;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  IF _email IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO _entry FROM public.admin_whitelist
  WHERE email = lower(trim(_email));

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'admin') ON CONFLICT (user_id, role) DO NOTHING;

  IF _entry.grants_super_admin THEN
    INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'super_admin') ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN true;
END;
$function$;

-- Drop the overloaded version that accepts parameters (privilege escalation vector)
DROP FUNCTION IF EXISTS public.assign_admin_if_allowed(uuid, text);