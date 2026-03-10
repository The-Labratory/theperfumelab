
-- Fix security definer view by setting security_invoker
ALTER VIEW public.affiliate_leaderboard SET (security_invoker = on);
