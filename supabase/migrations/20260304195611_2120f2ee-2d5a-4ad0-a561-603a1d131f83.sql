CREATE TABLE public.affiliate_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pyramid_node_id uuid NOT NULL REFERENCES public.affiliate_pyramid(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sales"
  ON public.affiliate_sales FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can register own sales"
  ON public.affiliate_sales FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM affiliate_pyramid ap
      JOIN affiliate_partners p ON p.id = ap.affiliate_partner_id
      WHERE ap.id = pyramid_node_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage sales"
  ON public.affiliate_sales FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.increment_pyramid_sales()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.affiliate_pyramid
  SET total_transactions = total_transactions + 1
  WHERE id = NEW.pyramid_node_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_affiliate_sale_insert
  AFTER INSERT ON public.affiliate_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_pyramid_sales();