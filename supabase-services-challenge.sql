-- Add services array to companies (industry is now auto-derived from services)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS services text[];

-- Add challenge fields to portfolio_projects
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS challenge text;
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS challenge_th text;
