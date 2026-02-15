
-- Fix: gifts SELECT should only allow reading by share_code, not browsing all
DROP POLICY IF EXISTS "Anyone can read gifts by share code" ON public.gifts;

CREATE POLICY "Read gifts by share code only"
ON public.gifts
FOR SELECT
USING (true);
-- Note: We keep USING(true) but will enforce share_code filtering via RPC below

-- Actually, we can't restrict by share_code in RLS alone since the client needs to query by it.
-- Instead, create a secure function that returns gift by share_code only
CREATE OR REPLACE FUNCTION public.get_gift_by_share_code(_share_code text)
RETURNS SETOF public.gifts
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.gifts WHERE share_code = _share_code LIMIT 1;
$$;

-- Now restrict the SELECT policy to block direct table browsing
DROP POLICY IF EXISTS "Read gifts by share code only" ON public.gifts;

CREATE POLICY "No direct gift reads"
ON public.gifts
FOR SELECT
USING (false);

-- Add rate limiting to waitlist inserts (max 5 per hour per email)
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;

CREATE POLICY "Rate limited waitlist signups"
ON public.waitlist
FOR INSERT
WITH CHECK (
  length(email) <= 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (name IS NULL OR length(name) <= 200)
  AND (reason IS NULL OR length(reason) <= 1000)
  AND (
    (SELECT count(*) FROM public.waitlist w
     WHERE w.email = email
     AND w.created_at > (now() - interval '1 hour')
    ) < 5
  )
);
