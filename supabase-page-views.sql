-- Site-wide page-view logging (first-party, cookieless, PDPA-friendly).
-- Every page navigation writes one row. We store only a SALTED HASH of the
-- visitor's IP + user-agent (never the raw IP), the path, the external referrer
-- host, and the country. This is the permanent, self-owned archive of traffic
-- that complements Vercel Analytics' rolling 30-day window.
-- Run on BOTH the Production (main) and UAT (staging) Supabase projects.

CREATE TABLE IF NOT EXISTS page_views (
  id            bigserial PRIMARY KEY,
  path          text NOT NULL,
  referrer_host text,
  country       text,
  visitor_hash  text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_created_idx ON page_views (created_at);
CREATE INDEX IF NOT EXISTS page_views_path_idx     ON page_views (path);

-- Writes go through the service role only (the API route); no public access.
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
