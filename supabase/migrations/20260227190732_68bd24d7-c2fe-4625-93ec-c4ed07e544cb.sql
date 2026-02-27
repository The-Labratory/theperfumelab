
-- Create a function that auto-assigns admin role for specific emails
-- This runs as a database function callable by the assign-admin-role edge function
-- Also create a trigger on auth.users is not allowed, so we use the edge function approach

-- Create a helper function to assign admin by email (service role only)
CREATE OR REPLACE FUNCTION public.assign_admin_if_allowed(_user_id uuid, _email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow specific emails
  IF lower(trim(_email)) NOT IN ('hariri@lenzohariri.com', 'loranshariri@gmail.com') THEN
    RETURN false;
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;
