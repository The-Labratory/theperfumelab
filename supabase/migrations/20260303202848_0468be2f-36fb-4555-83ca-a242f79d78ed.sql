
-- Function to check if a user owns a pyramid node (or is an ancestor of it)
CREATE OR REPLACE FUNCTION public.owns_pyramid_node(_user_id uuid, _node_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE ancestors AS (
    SELECT id, parent_id, affiliate_partner_id
    FROM public.affiliate_pyramid
    WHERE id = _node_id
    UNION ALL
    SELECT ap.id, ap.parent_id, ap.affiliate_partner_id
    FROM public.affiliate_pyramid ap
    JOIN ancestors a ON ap.id = a.parent_id
  )
  SELECT EXISTS (
    SELECT 1 FROM ancestors a
    JOIN public.affiliate_partners p ON p.id = a.affiliate_partner_id
    WHERE p.user_id = _user_id
  )
$$;

-- Allow affiliates to insert nodes under their own sub-tree
CREATE POLICY "Affiliates can insert under own node"
ON public.affiliate_pyramid
FOR INSERT
TO authenticated
WITH CHECK (
  parent_id IS NOT NULL
  AND public.owns_pyramid_node(auth.uid(), parent_id)
);

-- Allow affiliates to update nodes they own (under their sub-tree)
CREATE POLICY "Affiliates can update own sub-tree"
ON public.affiliate_pyramid
FOR UPDATE
TO authenticated
USING (
  public.owns_pyramid_node(auth.uid(), id)
)
WITH CHECK (
  public.owns_pyramid_node(auth.uid(), id)
);

-- Allow affiliates to delete placeholder nodes from own sub-tree
CREATE POLICY "Affiliates can delete from own sub-tree"
ON public.affiliate_pyramid
FOR DELETE
TO authenticated
USING (
  parent_id IS NOT NULL
  AND public.owns_pyramid_node(auth.uid(), id)
);
