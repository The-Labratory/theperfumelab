
-- Partner applications table (publicly submittable, no auth required)
CREATE TABLE public.partner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  business_type TEXT,
  estimated_volume TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a partner application
CREATE POLICY "Anyone can submit partner application"
ON public.partner_applications
FOR INSERT
WITH CHECK (true);

-- Only the submitter can read (we don't expose to public reads for now)
-- Admin access would be via service role key in edge functions
CREATE POLICY "No public reads on partner applications"
ON public.partner_applications
FOR SELECT
USING (false);

-- Saved blends table (anyone can save a blend, no auth required)
CREATE TABLE public.saved_blends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blend_number SERIAL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT,
  scent_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  concentration TEXT NOT NULL,
  volume INTEGER NOT NULL,
  story_text TEXT,
  harmony_score INTEGER,
  total_price NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_blends ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a blend
CREATE POLICY "Anyone can save a blend"
ON public.saved_blends
FOR INSERT
WITH CHECK (true);

-- Anyone can read blends (for blend certificates / sharing)
CREATE POLICY "Anyone can read blends"
ON public.saved_blends
FOR SELECT
USING (true);
