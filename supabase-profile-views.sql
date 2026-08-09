-- Profile view counting, deduped per viewer per day.
-- Safe to run multiple times. Run on BOTH production and UAT.

-- One row per (company, viewer, day). viewer_hash is a SALTED HASH of the
-- visitor's IP + user-agent — never the raw IP (PDPA-friendly). The PK makes a
-- second view by the same visitor on the same day a no-op, so refreshing does
-- not inflate the count.
CREATE TABLE IF NOT EXISTS profile_views (
  company_id  uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  viewer_hash text NOT NULL,
  viewed_on   date NOT NULL DEFAULT current_date,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, viewer_hash, viewed_on)
);
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;  -- writes go through the service role only

-- Bump companies.views only when a NEW (deduped) view row is actually inserted.
CREATE OR REPLACE FUNCTION bump_company_views() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE companies SET views = COALESCE(views, 0) + 1 WHERE id = NEW.company_id;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profile_views_bump ON profile_views;
CREATE TRIGGER profile_views_bump AFTER INSERT ON profile_views
  FOR EACH ROW EXECUTE FUNCTION bump_company_views();
