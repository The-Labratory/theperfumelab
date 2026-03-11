
-- Function to atomically increment affiliate points
CREATE OR REPLACE FUNCTION public.increment_affiliate_points(_affiliate_id UUID, _points INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.affiliate_partners
  SET points = COALESCE(points, 0) + _points
  WHERE id = _affiliate_id;
END;
$$;

-- Public read policy for affiliate landing pages (read slug, display_name, bio, etc.)
CREATE POLICY "Public can read affiliate landing data"
  ON public.affiliate_partners FOR SELECT
  TO anon
  USING (status = 'active');
