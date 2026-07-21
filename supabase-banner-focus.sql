-- Banner focal point (0-100 %). Lets a provider mark the key area of their
-- banner that should stay in view when the image is cropped to different frames
-- (e.g. the near-square banner on mobile). Default 50/50 = center.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_x integer DEFAULT 50;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_y integer DEFAULT 50;
