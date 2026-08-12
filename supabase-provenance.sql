-- Provenance fields for seeded/crawled listings.
-- Safe to run multiple times. Run on BOTH production and UAT.
--
-- Tracks where a listing came from and whether it's still good, so seeded
-- profiles can be held back from public view without being deleted.

-- Where the listing was sourced from (a website / directory / DBD page).
ALTER TABLE companies ADD COLUMN IF NOT EXISTS source_url text;

-- When the company was first added to Profindle.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS first_seen_at timestamptz NOT NULL DEFAULT now();

-- When someone last confirmed the company is still real / operating (freshness).
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_checked_at timestamptz NOT NULL DEFAULT now();

-- Whether the listing is publicly shown. 'active' = visible; 'hidden' = kept but
-- not shown (stale/under review); 'archived' = retired (e.g. company dissolved).
ALTER TABLE companies ADD COLUMN IF NOT EXISTS listing_status text NOT NULL DEFAULT 'active'
  CHECK (listing_status IN ('active', 'hidden', 'archived'));

-- Backfill first_seen_at from the existing created_at for rows that predate this.
UPDATE companies SET first_seen_at = created_at
  WHERE created_at IS NOT NULL AND first_seen_at > created_at;
