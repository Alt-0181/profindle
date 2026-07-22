-- Banner: optional separate mobile image + Facebook-style reposition.
--
-- banner_url_mobile : if the provider ticks "use a different image for mobile"
--                     and uploads one, its URL is stored here; otherwise NULL
--                     and the public profile shows the desktop banner on mobile.
-- banner_focus_*     : reposition focal point (0-100 %) chosen by dragging the
--                     image inside its cover frame — separately for desktop and
--                     mobile. Default 50/50 = centered.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_url_mobile text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_x integer DEFAULT 50;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_y integer DEFAULT 50;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_mobile_x integer DEFAULT 50;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_mobile_y integer DEFAULT 50;
