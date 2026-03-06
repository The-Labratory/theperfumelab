
-- Add authority_level to user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS authority_level integer NOT NULL DEFAULT 10;

-- Update existing roles with authority levels
UPDATE public.user_roles SET authority_level = 100 WHERE role = 'super_admin';
UPDATE public.user_roles SET authority_level = 80 WHERE role = 'admin';
UPDATE public.user_roles SET authority_level = 60 WHERE role = 'team_admin';
UPDATE public.user_roles SET authority_level = 40 WHERE role = 'agent';
UPDATE public.user_roles SET authority_level = 10 WHERE role = 'user';

-- Create system_permissions table
CREATE TABLE public.system_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role, permission)
);

ALTER TABLE public.system_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super_admin can manage permissions"
  ON public.system_permissions FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Authenticated can read own role permissions"
  ON public.system_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = system_permissions.role
    )
    OR public.is_super_admin(auth.uid())
  );

-- Seed default permissions
INSERT INTO public.system_permissions (role, permission, description) VALUES
  ('super_admin', 'system:full_control', 'Full system control'),
  ('super_admin', 'users:manage', 'Create, edit, delete users'),
  ('super_admin', 'roles:assign', 'Assign any role'),
  ('super_admin', 'employees:approve', 'Approve/reject employee requests'),
  ('super_admin', 'database:browse', 'Browse and edit database tables'),
  ('super_admin', 'storage:manage', 'Manage file storage'),
  ('super_admin', 'settings:write', 'Modify system settings'),
  ('super_admin', 'audit:read', 'View audit and security logs'),
  ('admin', 'users:read', 'View user profiles'),
  ('admin', 'users:edit', 'Edit user profiles'),
  ('admin', 'formulas:manage', 'Manage formulas and ingredients'),
  ('admin', 'orders:manage', 'Manage orders'),
  ('admin', 'affiliates:manage', 'Manage affiliate partners'),
  ('admin', 'audit:read', 'View audit logs'),
  ('team_admin', 'employees:request', 'Submit employee onboarding requests'),
  ('team_admin', 'team:manage', 'Manage team members'),
  ('agent', 'sales:create', 'Register sales'),
  ('agent', 'customers:read', 'View customer data'),
  ('user', 'profile:edit', 'Edit own profile'),
  ('user', 'blends:create', 'Create and save blends');

-- Create helper function to get authority level for a user
CREATE OR REPLACE FUNCTION public.get_user_authority_level(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(authority_level), 0)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;
