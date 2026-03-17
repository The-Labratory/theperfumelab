
-- Affiliate onboarding progress table
CREATE TABLE public.affiliate_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  affiliate_id uuid REFERENCES public.affiliate_partners(id) ON DELETE CASCADE NOT NULL,
  
  -- Step completion tracking
  current_step integer NOT NULL DEFAULT 0,
  steps_completed jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  -- Quiz & training
  quiz_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  quiz_passed boolean NOT NULL DEFAULT false,
  roleplay_passed boolean NOT NULL DEFAULT false,
  
  -- Starter pack
  starter_pack_claimed boolean NOT NULL DEFAULT false,
  starter_pack_data jsonb DEFAULT NULL,
  
  -- Pledge
  pledge_signed boolean NOT NULL DEFAULT false,
  pledge_text text DEFAULT NULL,
  
  -- Payout
  payout_details_saved boolean NOT NULL DEFAULT false,
  terms_accepted boolean NOT NULL DEFAULT false,
  buyback_terms_accepted boolean NOT NULL DEFAULT false,
  
  -- Identity
  chosen_partner_level text DEFAULT NULL,
  
  -- Tasks
  microtasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  -- Completion
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone DEFAULT NULL,
  started_at timestamp with time zone DEFAULT now(),
  
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(user_id),
  UNIQUE(affiliate_id)
);

-- Enable RLS
ALTER TABLE public.affiliate_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Users can read their own progress
CREATE POLICY "Users can read own onboarding progress"
  ON public.affiliate_onboarding_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own progress
CREATE POLICY "Users can insert own onboarding progress"
  ON public.affiliate_onboarding_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own progress
CREATE POLICY "Users can update own onboarding progress"
  ON public.affiliate_onboarding_progress
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can read all for reporting
CREATE POLICY "Admins can read all onboarding progress"
  ON public.affiliate_onboarding_progress
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Onboarding events table for tracking
CREATE TABLE public.affiliate_onboarding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  affiliate_id uuid REFERENCES public.affiliate_partners(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_onboarding_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own onboarding events"
  ON public.affiliate_onboarding_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own onboarding events"
  ON public.affiliate_onboarding_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all onboarding events"
  ON public.affiliate_onboarding_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
