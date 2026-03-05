CREATE TABLE public.platinum_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  discount_code text NOT NULL,
  claimed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.platinum_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own rewards"
ON public.platinum_rewards FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert rewards"
ON public.platinum_rewards FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "No updates on rewards"
ON public.platinum_rewards FOR UPDATE
USING (false);

CREATE POLICY "No deletes on rewards"
ON public.platinum_rewards FOR DELETE
USING (false);