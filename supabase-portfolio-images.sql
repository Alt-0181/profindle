-- Portfolio images: table column + storage bucket + RLS policies.
-- Safe to run multiple times (idempotent). Run on BOTH the production and UAT
-- Supabase projects. If uploads fail with "Bucket not found", it's because the
-- storage bucket in step 2 was never created — this script creates it.

-- 1. images array on portfolio_projects
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- 2. Create the "portfolio-images" storage bucket.
--    Public is ON to match how images were originally set up; the app ALSO
--    proxies every download through the service role (/api/portfolio-image),
--    so a private bucket would work too — flip `public` to false if preferred.
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 3. Storage RLS policies. Uploads/downloads from the app use the service role
--    (which bypasses RLS), so these matter only for any direct/public access.
--    DROP-then-CREATE keeps this re-runnable.
DROP POLICY IF EXISTS "Portfolio images are publicly readable" ON storage.objects;
CREATE POLICY "Portfolio images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
CREATE POLICY "Authenticated users can upload portfolio images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio-images' AND name LIKE (auth.uid()::text || '%'));

DROP POLICY IF EXISTS "Users can update their own portfolio images" ON storage.objects;
CREATE POLICY "Users can update their own portfolio images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio-images' AND name LIKE (auth.uid()::text || '%'));

DROP POLICY IF EXISTS "Users can delete their own portfolio images" ON storage.objects;
CREATE POLICY "Users can delete their own portfolio images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio-images' AND name LIKE (auth.uid()::text || '%'));
