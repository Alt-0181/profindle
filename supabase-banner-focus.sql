-- Banner framing: focal point (0-100 %) and zoom (%), set separately for
-- desktop (wide) and mobile (near-square). The provider drags to position and
-- slides to zoom in the editor; each device shows the framing they chose.
-- Defaults: focus 50/50 = center, zoom 100 = fit (cover).
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_x integer DEFAULT 50;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_y integer DEFAULT 50;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_mobile_x integer DEFAULT 50;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_focus_mobile_y integer DEFAULT 50;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_zoom integer DEFAULT 100;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS banner_zoom_mobile integer DEFAULT 100;
