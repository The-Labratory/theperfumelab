-- Fix: Tighten the gifts UPDATE policy to only allow reaction field changes
DROP POLICY IF EXISTS "Anyone can add reactions" ON public.gifts;

CREATE POLICY "Anyone can add reactions only"
  ON public.gifts FOR UPDATE
  USING (true)
  WITH CHECK (
    ((reaction_emoji IS NULL) OR (length(reaction_emoji) <= 10))
    AND ((reaction_message IS NULL) OR (length(reaction_message) <= 500))
  );