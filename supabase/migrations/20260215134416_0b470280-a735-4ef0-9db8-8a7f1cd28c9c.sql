
-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function (created before policies that use it)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS policies on user_roles
CREATE POLICY "Admins can read roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "No public insert on roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "No public update on roles" ON public.user_roles FOR UPDATE TO authenticated USING (false);
CREATE POLICY "No public delete on roles" ON public.user_roles FOR DELETE TO authenticated USING (false);

-- 5. Weekly leaderboard function
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard(_limit integer DEFAULT 10)
RETURNS TABLE (blend_number integer, blend_name text, harmony_score integer, concentration text, note_count integer, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT sb.blend_number, sb.name, sb.harmony_score, sb.concentration,
    jsonb_array_length(sb.scent_notes)::integer, sb.created_at
  FROM public.saved_blends sb
  WHERE sb.created_at >= date_trunc('week', now()) AND sb.harmony_score IS NOT NULL
  ORDER BY sb.harmony_score DESC, sb.created_at ASC
  LIMIT _limit
$$;

-- 6. All-time leaderboard function
CREATE OR REPLACE FUNCTION public.get_alltime_leaderboard(_limit integer DEFAULT 10)
RETURNS TABLE (blend_number integer, blend_name text, harmony_score integer, concentration text, note_count integer, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT sb.blend_number, sb.name, sb.harmony_score, sb.concentration,
    jsonb_array_length(sb.scent_notes)::integer, sb.created_at
  FROM public.saved_blends sb
  WHERE sb.harmony_score IS NOT NULL
  ORDER BY sb.harmony_score DESC, sb.created_at ASC
  LIMIT _limit
$$;

-- 7. Enable realtime on saved_blends
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_blends;
