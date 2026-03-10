CREATE POLICY "Public can read active affiliates for leaderboard"
ON public.affiliate_partners
FOR SELECT
TO anon
USING (status = 'active');