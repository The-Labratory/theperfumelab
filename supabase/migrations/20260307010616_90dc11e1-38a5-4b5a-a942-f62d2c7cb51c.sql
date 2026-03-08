CREATE OR REPLACE FUNCTION public.assign_admin_if_allowed()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  IF _email IS NULL THEN
    RETURN false;
  END IF;
  -- Only hariri@lenzohariri.com gets admin + super_admin
  IF lower(trim(_email)) = 'hariri@lenzohariri.com' THEN
    INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'admin') ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'super_admin') ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  END IF;
  -- loranshariri@gmail.com gets admin only, never super_admin
  IF lower(trim(_email)) = 'loranshariri@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'admin') ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  END IF;
  RETURN false;
END;
$$;