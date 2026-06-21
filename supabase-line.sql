-- LINE integration schema additions

-- 1. Add LINE user ID to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS line_user_id text;

-- 2. Broadcasts table
CREATE TABLE IF NOT EXISTS broadcasts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  category        text NOT NULL,
  description_en  text NOT NULL,
  description_th  text,
  budget_band     text,
  timeline        text,
  location_pref   text,
  status          text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired')),
  created_at      timestamptz DEFAULT now(),
  expires_at      timestamptz DEFAULT (now() + interval '14 days')
);

ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create broadcasts"
  ON broadcasts FOR INSERT TO authenticated
  WITH CHECK (buyer_user_id = auth.uid());

CREATE POLICY "Users can view their own broadcasts"
  ON broadcasts FOR SELECT TO authenticated
  USING (buyer_user_id = auth.uid());

-- 3. Broadcast matches table
CREATE TABLE IF NOT EXISTS broadcast_matches (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id        uuid REFERENCES broadcasts(id) ON DELETE CASCADE NOT NULL,
  provider_company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  matched_at          timestamptz DEFAULT now(),
  notified_at         timestamptz,
  provider_response   text DEFAULT 'no_reply' CHECK (provider_response IN ('no_reply', 'interested', 'declined')),
  responded_at        timestamptz,
  UNIQUE(broadcast_id, provider_company_id)
);

ALTER TABLE broadcast_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view matches for their broadcasts"
  ON broadcast_matches FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM broadcasts b WHERE b.id = broadcast_id AND b.buyer_user_id = auth.uid()
  ));

CREATE POLICY "Providers can view their own matches"
  ON broadcast_matches FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies c WHERE c.id = provider_company_id AND c.user_id = auth.uid()
  ));
