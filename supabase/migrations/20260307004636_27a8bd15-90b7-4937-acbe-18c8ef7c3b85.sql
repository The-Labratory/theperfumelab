-- Fix 1: Leaderboard functions - add is_public = true filter
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard(_limit integer DEFAULT 10)
RETURNS TABLE (blend_number integer, blend_name text, harmony_score integer, concentration text, note_count integer, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT sb.blend_number, sb.name, sb.harmony_score, sb.concentration,
    jsonb_array_length(sb.scent_notes)::integer, sb.created_at
  FROM public.saved_blends sb
  WHERE sb.created_at >= date_trunc('week', now())
    AND sb.harmony_score IS NOT NULL
    AND sb.is_public = true
  ORDER BY sb.harmony_score DESC, sb.created_at ASC
  LIMIT LEAST(_limit, 100);
$$;

CREATE OR REPLACE FUNCTION public.get_alltime_leaderboard(_limit integer DEFAULT 10)
RETURNS TABLE (blend_number integer, blend_name text, harmony_score integer, concentration text, note_count integer, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT sb.blend_number, sb.name, sb.harmony_score, sb.concentration,
    jsonb_array_length(sb.scent_notes)::integer, sb.created_at
  FROM public.saved_blends sb
  WHERE sb.harmony_score IS NOT NULL
    AND sb.is_public = true
  ORDER BY sb.harmony_score DESC, sb.created_at ASC
  LIMIT LEAST(_limit, 100);
$$;

-- Fix 2: Notifications - restrict INSERT to own user_id or admin
DROP POLICY IF EXISTS "Authenticated can create notifications" ON public.notifications;

CREATE POLICY "Users create own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND length(title) <= 200
    AND length(message) <= 2000
  );

CREATE POLICY "Admins can create any notification"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND length(title) <= 200
    AND length(message) <= 2000
  );