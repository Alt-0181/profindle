-- Per-project services: which catalog services a portfolio project delivered.
-- Powers the "Services Delivered" chips and the filter on the public profile.
-- Safe to run multiple times. Run on BOTH the production and UAT projects.

ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS services text[] DEFAULT '{}';
