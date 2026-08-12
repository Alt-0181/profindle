-- Portfolio (project) view tracking, deduped per viewer per day per project.
-- Safe to run multiple times. Run on BOTH production and UAT.
--
-- Mirrors profile_views: one row per (project, viewer, day). viewer_hash is a
-- SALTED HASH of IP + user-agent — never the raw IP (PDPA-friendly). The PK
-- makes a same-day repeat by the same viewer a no-op, so reopening a project
-- does not inflate its count.

-- 1. Per-project all-time view counter (read directly by the dashboard/reports).
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

-- 2. Deduped view-event log.
CREATE TABLE IF NOT EXISTS portfolio_views (
  project_id  uuid NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  company_id  uuid REFERENCES companies(id) ON DELETE CASCADE,
  viewer_hash text NOT NULL,
  viewed_on   date NOT NULL DEFAULT current_date,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, viewer_hash, viewed_on)
);
CREATE INDEX IF NOT EXISTS portfolio_views_project_idx ON portfolio_views (project_id);
CREATE INDEX IF NOT EXISTS portfolio_views_company_idx ON portfolio_views (company_id);
ALTER TABLE portfolio_views ENABLE ROW LEVEL SECURITY;  -- writes go through the service role only

-- 3. Bump portfolio_projects.views only when a NEW (deduped) row is inserted.
CREATE OR REPLACE FUNCTION bump_portfolio_views() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE portfolio_projects SET views = COALESCE(views, 0) + 1 WHERE id = NEW.project_id;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS portfolio_views_bump ON portfolio_views;
CREATE TRIGGER portfolio_views_bump AFTER INSERT ON portfolio_views
  FOR EACH ROW EXECUTE FUNCTION bump_portfolio_views();
