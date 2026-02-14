
-- Fix 1: Add explicit UPDATE/DELETE deny policies on saved_blends for clarity
CREATE POLICY "No public updates on blends"
  ON saved_blends FOR UPDATE
  USING (false);

CREATE POLICY "No public deletes on blends"
  ON saved_blends FOR DELETE
  USING (false);

-- Fix 2: Replace open INSERT on partner_applications with rate-limited + validated policy
DROP POLICY "Anyone can submit partner application" ON partner_applications;

CREATE POLICY "Rate limited partner applications"
  ON partner_applications FOR INSERT
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(company_name) <= 200
    AND length(contact_name) <= 200
    AND length(email) <= 255
    AND (phone IS NULL OR length(phone) <= 50)
    AND (website IS NULL OR length(website) <= 500)
    AND (message IS NULL OR length(message) <= 2000)
    AND (SELECT COUNT(*) FROM partner_applications
         WHERE created_at > NOW() - INTERVAL '1 hour'
         AND partner_applications.email = email) < 3
  );
