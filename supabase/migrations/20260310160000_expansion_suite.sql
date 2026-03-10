-- Expansion Suite: Affiliate Tier System, QR Engine, B2B Pitch, Sub-Affiliate Portal
-- 2026-03-10

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Extend affiliate_partners with expansion tracking columns
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE affiliate_partners
  ADD COLUMN IF NOT EXISTS expansion_tier           TEXT    DEFAULT 'seed',
  ADD COLUMN IF NOT EXISTS weekly_sales_count       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consecutive_qualifying_weeks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS b2b_suite_unlocked       BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS b2b_suite_unlocked_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lead_affiliate_id        UUID    REFERENCES affiliate_partners(id),
  ADD COLUMN IF NOT EXISTS management_override_pct  NUMERIC(5,4) DEFAULT 0.10,
  ADD COLUMN IF NOT EXISTS last_active_check_at     TIMESTAMPTZ DEFAULT NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. QR Locations – one row per physical door (gym, barbershop, hotel, etc.)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_locations (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id  UUID        NOT NULL REFERENCES affiliate_partners(id) ON DELETE CASCADE,
  location_name TEXT        NOT NULL,
  discount_pct  INTEGER     NOT NULL DEFAULT 20
                            CHECK (discount_pct >= 0 AND discount_pct <= 40),
  referral_url  TEXT        NOT NULL,
  total_scans   INTEGER     NOT NULL DEFAULT 0,
  total_sales   INTEGER     NOT NULL DEFAULT 0,
  total_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE affiliate_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "affiliates_manage_own_locations" ON affiliate_locations;
CREATE POLICY "affiliates_manage_own_locations"
  ON affiliate_locations FOR ALL
  USING (
    affiliate_id IN (
      SELECT id FROM affiliate_partners WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Location Scans – lightweight event log per QR scan
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS location_scans (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id  UUID        NOT NULL REFERENCES affiliate_locations(id) ON DELETE CASCADE,
  scanned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted    BOOLEAN     NOT NULL DEFAULT false,
  order_amount NUMERIC(12,2) NOT NULL DEFAULT 0
);

ALTER TABLE location_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "affiliates_view_own_location_scans" ON location_scans;
CREATE POLICY "affiliates_view_own_location_scans"
  ON location_scans FOR SELECT
  USING (
    location_id IN (
      SELECT al.id
      FROM   affiliate_locations al
      JOIN   affiliate_partners  ap ON ap.id = al.affiliate_id
      WHERE  ap.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Sub-Affiliate Invites – Tier 3 affiliates can sponsor sub-affiliates
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sub_affiliate_invites (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_affiliate_id UUID        NOT NULL REFERENCES affiliate_partners(id) ON DELETE CASCADE,
  invite_code       TEXT        UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  invited_email     TEXT,
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  sub_affiliate_id  UUID        REFERENCES affiliate_partners(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

ALTER TABLE sub_affiliate_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lead_affiliates_manage_own_invites" ON sub_affiliate_invites;
CREATE POLICY "lead_affiliates_manage_own_invites"
  ON sub_affiliate_invites FOR ALL
  USING (
    lead_affiliate_id IN (
      SELECT id FROM affiliate_partners WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Helper: auto-update affiliate_locations.updated_at on row change
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_affiliate_location_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_affiliate_location_updated_at ON affiliate_locations;
CREATE TRIGGER trg_affiliate_location_updated_at
  BEFORE UPDATE ON affiliate_locations
  FOR EACH ROW EXECUTE FUNCTION update_affiliate_location_updated_at();
