-- Early Bird premium expiry.
-- Records the date until which an early-bird company keeps its free Premium.
-- Early-bird grants set this to 2027-03-31 (see /api/admin/early-bird).
-- Run on BOTH the UAT (Preview/staging) and Production (main) Supabase projects.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS premium_until timestamptz;

-- Backfill: any company already flagged premium via an early-bird grant that
-- has no expiry yet gets the 31 Mar 2027 (Bangkok end-of-day) deadline.
UPDATE companies
  SET premium_until = '2027-03-31T23:59:59+07:00'
  WHERE premium = true AND premium_until IS NULL;
