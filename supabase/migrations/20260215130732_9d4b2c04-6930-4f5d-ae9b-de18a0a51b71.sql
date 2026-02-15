
-- Waitlist / founding creator applications
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  position INTEGER GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can apply
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist FOR INSERT
WITH CHECK (true);

-- Nobody can read others' data
CREATE POLICY "Users cannot read waitlist"
ON public.waitlist FOR SELECT
USING (false);

-- Count function for displaying spots remaining (no user data exposed)
CREATE OR REPLACE FUNCTION public.get_waitlist_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.waitlist;
$$;
