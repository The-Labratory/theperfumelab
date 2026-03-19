
-- Create a direct (non-recursive) ownership check for pyramid nodes
CREATE OR REPLACE FUNCTION public.is_direct_pyramid_owner(_user_id uuid, _node_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.affiliate_pyramid ap
    JOIN public.affiliate_partners p ON p.id = ap.affiliate_partner_id
    WHERE ap.id = _node_id
      AND p.user_id = _user_id
  )
$$;

-- Drop existing UPDATE policies that use the recursive function
DROP POLICY IF EXISTS "Affiliates can update own sub-tree" ON public.affiliate_pyramid;
DROP POLICY IF EXISTS "Affiliates can update own display fields" ON public.affiliate_pyramid;

-- Drop existing DELETE policy
DROP POLICY IF EXISTS "Affiliates can delete from own sub-tree" ON public.affiliate_pyramid;

-- Recreate UPDATE policy using direct ownership only
CREATE POLICY "Affiliates can update own display fields"
  ON public.affiliate_pyramid FOR UPDATE TO authenticated
  USING (public.is_direct_pyramid_owner(auth.uid(), id))
  WITH CHECK (
    public.is_direct_pyramid_owner(auth.uid(), id)
    AND earnings = (SELECT earnings FROM public.affiliate_pyramid WHERE id = affiliate_pyramid.id)
    AND total_transactions = (SELECT total_transactions FROM public.affiliate_pyramid WHERE id = affiliate_pyramid.id)
    AND affiliate_partner_id = (SELECT affiliate_partner_id FROM public.affiliate_pyramid WHERE id = affiliate_pyramid.id)
  );

-- Recreate DELETE policy using direct ownership only
CREATE POLICY "Affiliates can delete own nodes"
  ON public.affiliate_pyramid FOR DELETE TO authenticated
  USING (public.is_direct_pyramid_owner(auth.uid(), id));
