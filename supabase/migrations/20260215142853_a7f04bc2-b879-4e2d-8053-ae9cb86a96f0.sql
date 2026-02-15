
-- Fix Issue 1: saved_blends RLS - restrict reads so only the creator can see their own blends (or public blends with null user_id)
DROP POLICY IF EXISTS "Anyone can read blends" ON public.saved_blends;

CREATE POLICY "Users can read own or public blends"
ON public.saved_blends
FOR SELECT
USING (user_id IS NULL OR user_id = auth.uid());
