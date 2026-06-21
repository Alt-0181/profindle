-- Add plan fields to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' CHECK (plan IN ('free', 'vip', 'premium'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- Example: manually set a user to VIP until 31 Dec 2027
-- UPDATE companies SET plan = 'vip', plan_expires_at = '2027-12-31' WHERE user_id = '<user-uuid>';
