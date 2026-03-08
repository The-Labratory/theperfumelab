-- Allow admins to SELECT partner applications
DROP POLICY IF EXISTS "No public reads on partner applications" ON public.partner_applications;
CREATE POLICY "Admins can read partner applications"
  ON public.partner_applications
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to UPDATE partner applications (status changes)
CREATE POLICY "Admins can update partner applications"
  ON public.partner_applications
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
