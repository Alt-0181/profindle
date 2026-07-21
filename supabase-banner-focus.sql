-- Banner focal point (0-100 %). Lets a provider frame their banner separately
-- for desktop (wide) and mobile (near-square) — the key area they drag into
-- view in the editor stays visible when the image is cropped to each frame.
-- Default 50/50 = center.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_x integer DEFAULT 50;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_y integer DEFAULT 50;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_mobile_x integer DEFAULT 50;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_mobile_y integer DEFAULT 50;
