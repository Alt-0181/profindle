-- Claim state + anonymous contact-click tracking.
-- Safe to run multiple times. Run on BOTH production and UAT.

-- 1. Claim state on companies.
--    claimed = true  → a real/registered company (default, keeps current behavior)
--    claimed = false → a seeded/crawled profile not yet claimed by its owner
--    source          → 'signup' (registered) or 'seeded' (crawled/imported)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS claimed boolean NOT NULL DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'signup';

-- 2. Anonymous contact-click log. Records ONLY that a buyer tapped a contact
--    channel — never the buyer's identity (buyers browse anonymously). Providers
--    see an aggregate count, nothing more.
CREATE TABLE IF NOT EXISTS contact_clicks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid REFERENCES companies(id) ON DELETE CASCADE,
  channel     text NOT NULL,   -- 'line' | 'phone' | 'email' | 'website'
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_clicks_company_idx ON contact_clicks (company_id);

-- Writes and aggregate reads happen through the service role (server routes),
-- which bypasses RLS. Enable RLS with no public policies so the anon key can
-- neither read nor write this table directly.
ALTER TABLE contact_clicks ENABLE ROW LEVEL SECURITY;
