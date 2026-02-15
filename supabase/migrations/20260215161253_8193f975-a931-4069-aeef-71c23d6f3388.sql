
-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Anyone can add reactions" ON public.gifts;

-- Create a trigger function that restricts updates to reaction fields only
CREATE OR REPLACE FUNCTION public.restrict_gift_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow changes to reaction_emoji, reaction_message, and revealed_at
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
    OR NEW.share_code IS DISTINCT FROM OLD.share_code
    OR NEW.personality IS DISTINCT FROM OLD.personality
    OR NEW.occasion IS DISTINCT FROM OLD.occasion
    OR NEW.mood IS DISTINCT FROM OLD.mood
    OR NEW.memory IS DISTINCT FROM OLD.memory
    OR NEW.is_duo IS DISTINCT FROM OLD.is_duo
    OR NEW.gifter_name IS DISTINCT FROM OLD.gifter_name
    OR NEW.recipient_name IS DISTINCT FROM OLD.recipient_name
    OR NEW.personal_message IS DISTINCT FROM OLD.personal_message
    OR NEW.blend_name IS DISTINCT FROM OLD.blend_name
    OR NEW.blend_story IS DISTINCT FROM OLD.blend_story
    OR NEW.blend_mood IS DISTINCT FROM OLD.blend_mood
    OR NEW.blend_intensity IS DISTINCT FROM OLD.blend_intensity
    OR NEW.blend_notes IS DISTINCT FROM OLD.blend_notes
    OR NEW.scent_letter IS DISTINCT FROM OLD.scent_letter
    OR NEW.duo_partner_name IS DISTINCT FROM OLD.duo_partner_name
    OR NEW.duo_partner_personality IS DISTINCT FROM OLD.duo_partner_personality
    OR NEW.duo_partner_mood IS DISTINCT FROM OLD.duo_partner_mood
    OR NEW.relationship_depth IS DISTINCT FROM OLD.relationship_depth
    OR NEW.zodiac_sign IS DISTINCT FROM OLD.zodiac_sign
  THEN
    RAISE EXCEPTION 'Only reaction fields can be updated on gifts';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Attach the trigger
CREATE TRIGGER enforce_gift_reaction_only_updates
BEFORE UPDATE ON public.gifts
FOR EACH ROW
EXECUTE FUNCTION public.restrict_gift_updates();

-- Re-create the UPDATE policy with input validation on reaction fields
CREATE POLICY "Anyone can add reactions"
ON public.gifts
FOR UPDATE
USING (true)
WITH CHECK (
  (reaction_emoji IS NULL OR length(reaction_emoji) <= 10)
  AND (reaction_message IS NULL OR length(reaction_message) <= 500)
);
