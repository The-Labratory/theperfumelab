
-- Drop the old permissive SELECT policy
DROP POLICY "Users can read own or public blends" ON public.saved_blends;

-- New policy: only owners and admins can read blends
CREATE POLICY "Users can read own blends"
ON public.saved_blends
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
