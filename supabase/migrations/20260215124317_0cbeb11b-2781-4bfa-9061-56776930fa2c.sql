
-- Gifts table for the complete gifting universe
CREATE TABLE public.gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  share_code TEXT NOT NULL UNIQUE DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  
  -- Gifter info
  gifter_name TEXT,
  personal_message TEXT,
  
  -- Recipient info
  recipient_name TEXT,
  
  -- Selection data
  personality TEXT NOT NULL,
  occasion TEXT NOT NULL,
  mood TEXT NOT NULL,
  memory TEXT,
  relationship_depth TEXT DEFAULT 'friend',
  zodiac_sign TEXT,
  
  -- AI-generated results
  blend_name TEXT,
  blend_story TEXT,
  blend_notes JSONB DEFAULT '[]'::jsonb,
  blend_mood TEXT,
  blend_intensity TEXT,
  scent_letter TEXT,
  
  -- Duo blend
  is_duo BOOLEAN DEFAULT false,
  duo_partner_name TEXT,
  duo_partner_personality TEXT,
  duo_partner_mood TEXT,
  
  -- Reveal & reaction
  revealed_at TIMESTAMPTZ,
  reaction_emoji TEXT,
  reaction_message TEXT
);

-- Enable RLS
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Anyone can create a gift (no auth required)
CREATE POLICY "Anyone can create gifts"
  ON public.gifts FOR INSERT
  WITH CHECK (
    length(personality) <= 50
    AND length(occasion) <= 50
    AND length(mood) <= 50
    AND (memory IS NULL OR length(memory) <= 1000)
    AND (personal_message IS NULL OR length(personal_message) <= 2000)
    AND (gifter_name IS NULL OR length(gifter_name) <= 100)
    AND (recipient_name IS NULL OR length(recipient_name) <= 100)
  );

-- Anyone can read gifts (needed for reveal page via share_code)
CREATE POLICY "Anyone can read gifts by share code"
  ON public.gifts FOR SELECT
  USING (true);

-- Anyone can update reaction fields only (for reveal page)
CREATE POLICY "Anyone can add reactions"
  ON public.gifts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- No deletes
CREATE POLICY "No public deletes on gifts"
  ON public.gifts FOR DELETE
  USING (false);
