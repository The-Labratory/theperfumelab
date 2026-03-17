
-- Fix 1: scent_stations INSERT policy - validate affiliate_id ownership + commission_split bounds
DROP POLICY "Users insert own stations" ON public.scent_stations;
CREATE POLICY "Users insert own stations"
  ON public.scent_stations FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND length(business_name) <= 200
    AND commission_split_pct >= 5
    AND commission_split_pct <= 25
    AND EXISTS (
      SELECT 1 FROM public.affiliate_partners
      WHERE id = scent_stations.affiliate_id
        AND user_id = auth.uid()
    )
  );

-- Fix 2: formula_snapshots - drop overly permissive public SELECT, keep authenticated one
DROP POLICY "Users can read own formula snapshots" ON public.formula_snapshots;
