-- Early Bird claim requests: a persistent record each time a company clicks
-- "Claim Early Bird", so the super admin has a reliable queue instead of
-- relying on catching a notification email.

CREATE TABLE IF NOT EXISTS early_bird_claims (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id   uuid REFERENCES companies(id) ON DELETE SET NULL,
  company_name text,
  user_email   text,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'dismissed')),
  created_at   timestamptz DEFAULT now(),
  resolved_at  timestamptz
);

-- A user can only have ONE open (pending) claim at a time.
CREATE UNIQUE INDEX IF NOT EXISTS early_bird_one_pending
  ON early_bird_claims (user_id) WHERE status = 'pending';

-- Handy index for the admin list (newest pending first).
CREATE INDEX IF NOT EXISTS early_bird_status_created
  ON early_bird_claims (status, created_at DESC);

ALTER TABLE early_bird_claims ENABLE ROW LEVEL SECURITY;
-- No public policies: only the service-role key (admin API / server routes)
-- reads or writes this table. RLS with no policies = deny all by default.
