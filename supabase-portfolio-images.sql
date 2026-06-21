-- 1. Add images array to portfolio_projects
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- 2. Storage policies for portfolio-images bucket
--    (create the bucket first in Supabase Dashboard → Storage → New bucket, name: "portfolio-images", Public: ON)

CREATE POLICY "Portfolio images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

CREATE POLICY "Authenticated users can upload portfolio images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio-images' AND name LIKE (auth.uid()::text || '%'));

CREATE POLICY "Users can update their own portfolio images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio-images' AND name LIKE (auth.uid()::text || '%'));

CREATE POLICY "Users can delete their own portfolio images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio-images' AND name LIKE (auth.uid()::text || '%'));
