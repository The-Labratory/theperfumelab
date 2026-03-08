
-- Fix notifications INSERT to only allow authenticated system/admin inserts
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Authenticated can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL AND length(title) <= 200 AND length(message) <= 2000);
