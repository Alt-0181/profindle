CREATE TABLE IF NOT EXISTS platform_services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL UNIQUE,
  industry text NOT NULL,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS line_message_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  content text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO line_message_templates (id, name, content) VALUES
  ('welcome', 'Welcome Message', '🎉 Welcome to Profindle! Your LINE account is now connected. You''ll receive instant notifications for broadcast requests.'),
  ('verified', 'Verification Status Update', '✅ Your company {{company_name}} has been verified! Your profile now shows the Verified badge.'),
  ('broadcast', 'New Broadcast Request', '📢 New request: {{service_category}} | Budget: {{budget}} | Timeline: {{timeline}}')
ON CONFLICT (id) DO NOTHING;
