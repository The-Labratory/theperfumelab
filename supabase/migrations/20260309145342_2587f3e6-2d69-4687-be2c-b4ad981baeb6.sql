
-- Allow authenticated users to read basic employee info for the public team page
-- But restrict sensitive fields (email, phone) to admins via application-level filtering
DROP POLICY IF EXISTS "Admins can read employees" ON public.employees;

-- Admins get full access
CREATE POLICY "Admins can manage and read all employees"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can see active employee public info (name, title, avatar, bio, department)
CREATE POLICY "Authenticated users can read active employee profiles"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (is_active = true);
