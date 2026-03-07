
-- Affiliate pyramid hierarchy table
CREATE TABLE public.affiliate_pyramid (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  avatar_url text,
  level integer NOT NULL DEFAULT 0,
  position integer NOT NULL DEFAULT 0,
  parent_id uuid REFERENCES public.affiliate_pyramid(id) ON DELETE SET NULL,
  affiliate_partner_id uuid REFERENCES public.affiliate_partners(id) ON DELETE SET NULL,
  earnings numeric NOT NULL DEFAULT 0,
  total_transactions integer NOT NULL DEFAULT 0,
  is_placeholder boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_pyramid ENABLE ROW LEVEL SECURITY;

-- Everyone can read the pyramid
CREATE POLICY "Anyone can read pyramid"
  ON public.affiliate_pyramid FOR SELECT
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage pyramid"
  ON public.affiliate_pyramid FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed top of pyramid
INSERT INTO public.affiliate_pyramid (id, name, title, level, position, is_placeholder)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'LAW', 'Founder & CEO', 0, 0, false);

INSERT INTO public.affiliate_pyramid (id, name, title, level, position, parent_id, is_placeholder)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'Maher Alia', 'Regional Director', 1, 0, '00000000-0000-0000-0000-000000000001', false);

-- Add empty placeholder slots under Maher Alia (level 2)
INSERT INTO public.affiliate_pyramid (name, title, level, position, parent_id, is_placeholder)
VALUES 
  ('Empty Slot', null, 2, 0, '00000000-0000-0000-0000-000000000002', true),
  ('Empty Slot', null, 2, 1, '00000000-0000-0000-0000-000000000002', true),
  ('Empty Slot', null, 2, 2, '00000000-0000-0000-0000-000000000002', true);

-- Add empty placeholder slot next to Maher (level 1)
INSERT INTO public.affiliate_pyramid (name, title, level, position, parent_id, is_placeholder)
VALUES 
  ('Empty Slot', null, 1, 1, '00000000-0000-0000-0000-000000000001', true),
  ('Empty Slot', null, 1, 2, '00000000-0000-0000-0000-000000000001', true);
