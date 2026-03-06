
-- Create employee_requests table for onboarding workflow
CREATE TABLE public.employee_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  id_document_url text,
  bank_card_url text,
  status text NOT NULL DEFAULT 'pending',
  assigned_role public.app_role DEFAULT 'user',
  assigned_department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  approved_by uuid,
  approved_at timestamptz,
  rejection_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;

-- Storage bucket for sensitive employee documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-documents', 'employee-documents', false);

-- RLS policies for employee_requests

-- Team admins, admins, and super_admins can create requests
CREATE POLICY "Authorized roles can create employee requests"
  ON public.employee_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND (
      public.has_role(auth.uid(), 'team_admin') OR
      public.has_role(auth.uid(), 'admin') OR
      public.is_super_admin(auth.uid())
    )
    AND length(full_name) <= 200
    AND length(email) <= 255
    AND status = 'pending'
  );

-- Requesters can read their own requests, super_admin can read all
CREATE POLICY "Users can read relevant employee requests"
  ON public.employee_requests FOR SELECT
  TO authenticated
  USING (
    requested_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.is_super_admin(auth.uid())
  );

-- Only super_admin (CEO) can update (approve/reject/assign roles)
CREATE POLICY "Only CEO can update employee requests"
  ON public.employee_requests FOR UPDATE
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Only super_admin can delete
CREATE POLICY "Only CEO can delete employee requests"
  ON public.employee_requests FOR DELETE
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Storage policies for employee-documents bucket
CREATE POLICY "Auth users can upload employee documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'employee-documents'
    AND (
      public.has_role(auth.uid(), 'team_admin') OR
      public.has_role(auth.uid(), 'admin') OR
      public.is_super_admin(auth.uid())
    )
  );

CREATE POLICY "Authorized users can read employee documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'employee-documents'
    AND (
      public.has_role(auth.uid(), 'admin') OR
      public.is_super_admin(auth.uid())
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_employee_requests_updated_at
  BEFORE UPDATE ON public.employee_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for employee_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_requests;
