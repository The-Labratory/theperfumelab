
-- Teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  owner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- System settings (super_admin only)
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'general',
  description text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Security events (append-only)
CREATE TABLE public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'low',
  user_id uuid,
  ip_address text,
  user_agent text,
  endpoint text,
  details jsonb DEFAULT '{}',
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Add team_id to profiles for multi-tenancy
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id);

-- Super admin check function
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Update assign function to also assign super_admin
CREATE OR REPLACE FUNCTION public.assign_admin_if_allowed(_user_id uuid, _email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(trim(_email)) NOT IN ('hariri@lenzohariri.com', 'loranshariri@gmail.com') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'super_admin') ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

-- RLS: Teams
CREATE POLICY "Super admin full access teams" ON public.teams FOR ALL TO authenticated
  USING (is_super_admin(auth.uid())) WITH CHECK (is_super_admin(auth.uid()));
CREATE POLICY "Users read own team" ON public.teams FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

-- RLS: System settings (super_admin only)
CREATE POLICY "Super admin manages settings" ON public.system_settings FOR ALL TO authenticated
  USING (is_super_admin(auth.uid())) WITH CHECK (is_super_admin(auth.uid()));

-- RLS: Security events
CREATE POLICY "Super admin reads security events" ON public.security_events FOR SELECT TO authenticated
  USING (is_super_admin(auth.uid()));
CREATE POLICY "Authenticated can log security events" ON public.security_events FOR INSERT TO authenticated
  WITH CHECK (length(event_type) <= 100);

-- Log forbidden access function
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type text,
  _severity text DEFAULT 'medium',
  _user_id uuid DEFAULT NULL,
  _endpoint text DEFAULT NULL,
  _details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (event_type, severity, user_id, endpoint, details)
  VALUES (_event_type, _severity, _user_id, _endpoint, _details);
END;
$$;
