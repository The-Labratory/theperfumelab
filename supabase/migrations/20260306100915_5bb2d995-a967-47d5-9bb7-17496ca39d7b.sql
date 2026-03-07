
DROP POLICY "Anyone can read pyramid" ON public.affiliate_pyramid;

CREATE POLICY "Authenticated can read pyramid"
  ON public.affiliate_pyramid FOR SELECT
  TO authenticated
  USING (true);
