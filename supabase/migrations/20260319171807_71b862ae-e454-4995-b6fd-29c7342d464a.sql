-- Allow users to update their own blends
DROP POLICY IF EXISTS "No public updates on blends" ON public.saved_blends;
CREATE POLICY "Users can update own blends"
  ON public.saved_blends FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own blends
DROP POLICY IF EXISTS "No public deletes on blends" ON public.saved_blends;
CREATE POLICY "Users can delete own blends"
  ON public.saved_blends FOR DELETE TO authenticated
  USING (user_id = auth.uid());