
-- Add slug column to affiliate_partners
ALTER TABLE public.affiliate_partners
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS landing_headline TEXT,
  ADD COLUMN IF NOT EXISTS landing_tagline TEXT;

-- Create affiliate_point_events table for gamification history
CREATE TABLE IF NOT EXISTS public.affiliate_point_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_point_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own point events"
  ON public.affiliate_point_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert point events"
  ON public.affiliate_point_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create affiliate_campaigns table for marketing toolkit
CREATE TABLE IF NOT EXISTS public.affiliate_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  channel TEXT DEFAULT 'general',
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(affiliate_id, slug)
);

ALTER TABLE public.affiliate_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaigns"
  ON public.affiliate_campaigns FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION public.generate_affiliate_slug(_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _base_slug TEXT;
  _slug TEXT;
  _suffix TEXT;
  _exists BOOLEAN;
BEGIN
  -- Slugify: lowercase, replace spaces/special chars with hyphens, trim
  _base_slug := lower(regexp_replace(trim(_name), '[^a-z0-9]+', '-', 'gi'));
  _base_slug := trim(both '-' from _base_slug);
  
  -- Try base slug first
  _slug := _base_slug;
  SELECT EXISTS(SELECT 1 FROM public.affiliate_partners WHERE slug = _slug) INTO _exists;
  
  IF NOT _exists THEN
    RETURN _slug;
  END IF;
  
  -- Append short random suffix
  _suffix := substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  _slug := _base_slug || '-' || _suffix;
  
  RETURN _slug;
END;
$$;

-- Trigger to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION public.auto_generate_affiliate_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_affiliate_slug(NEW.display_name);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_affiliate_slug ON public.affiliate_partners;
CREATE TRIGGER trg_auto_affiliate_slug
  BEFORE INSERT ON public.affiliate_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_affiliate_slug();

-- Backfill existing affiliates with slugs
UPDATE public.affiliate_partners
SET slug = public.generate_affiliate_slug(display_name)
WHERE slug IS NULL;
