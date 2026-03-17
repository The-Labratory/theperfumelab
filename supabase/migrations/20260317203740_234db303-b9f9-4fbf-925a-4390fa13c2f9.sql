
-- Fix the SECURITY DEFINER view warning by explicitly setting SECURITY INVOKER
CREATE OR REPLACE VIEW public.affiliate_partners_public
WITH (security_invoker = true) AS
  SELECT
    id,
    display_name,
    bio,
    slug,
    tier,
    avatar_url,
    landing_headline,
    landing_tagline,
    company_name,
    social_links,
    badges,
    status
  FROM public.affiliate_partners
  WHERE status = 'active';

-- Grant anonymous users access to the safe view
GRANT SELECT ON public.affiliate_partners_public TO anon;
GRANT SELECT ON public.affiliate_partners_public TO authenticated;
