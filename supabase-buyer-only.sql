-- "Find services only" flag. When true, the company is a buyer (here to hire),
-- so it is excluded from LINE broadcast notifications meant for providers
-- looking for leads.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS buyer_only boolean DEFAULT false;
