-- Optional separate mobile banner. When a provider ticks "use a different
-- image for mobile" and uploads one, its URL is stored here; otherwise this
-- stays NULL and the public profile shows the desktop banner on mobile too.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_url_mobile text;
