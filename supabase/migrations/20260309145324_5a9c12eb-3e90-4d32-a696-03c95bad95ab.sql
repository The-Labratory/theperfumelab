
-- Fix critical findings from security scan

-- 1. SAVED_BLENDS: Fix INSERT policy to require ownership
DROP POLICY IF EXISTS "Anyone can save blends" ON public.saved_blends;
DROP POLICY IF EXISTS "Public can save blends" ON public.saved_blends;
-- Find and replace the permissive INSERT policy
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'saved_blends' AND schemaname = 'public' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.saved_blends', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Authenticated users can save own blends"
  ON public.saved_blends
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 2. EMPLOYEES: Restrict read to admin only (contains emails/phones)
DROP POLICY IF EXISTS "Authenticated can read active employees" ON public.employees;
CREATE POLICY "Admins can read employees"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. PLATINUM_REWARDS: Remove user INSERT, only allow via SECURITY DEFINER
DROP POLICY IF EXISTS "System can insert rewards" ON public.platinum_rewards;
-- Rewards should only be issued via the claim-platinum-reward edge function

-- 4. USER_ACTIVITY_LOGS: Add user_id ownership check
DROP POLICY IF EXISTS "Authenticated can log activity" ON public.user_activity_logs;
CREATE POLICY "Authenticated can log own activity"
  ON public.user_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ((user_id = auth.uid()) OR (user_id IS NULL))
    AND (length(event_type) <= 100)
    AND ((page_path IS NULL) OR (length(page_path) <= 500))
  );
