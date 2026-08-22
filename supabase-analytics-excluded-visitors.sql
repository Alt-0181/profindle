-- Devices/networks excluded from first-party analytics (e.g. the founder's own
-- test visits). Populated from Admin → Traffic → "Stop counting my visits".
-- The visitor_hash is the same salted IP+UA hash used by page_views, so the
-- same device counts as excluded in a normal AND an incognito window.
-- Run on BOTH the Production (main) and UAT (staging) Supabase projects.

CREATE TABLE IF NOT EXISTS analytics_excluded_visitors (
  visitor_hash text PRIMARY KEY,
  label        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Writes go through the service role only (the admin API).
ALTER TABLE analytics_excluded_visitors ENABLE ROW LEVEL SECURITY;
