/**
 * Company Branding Migration
 *
 * Run this SQL in your Supabase Dashboard → SQL Editor:
 *
 * ─────────────────────────────────────────────────────────────
 *
 * ALTER TABLE companies
 *   ADD COLUMN IF NOT EXISTS logo_url TEXT,
 *   ADD COLUMN IF NOT EXISTS banner_url TEXT;
 *
 * ─────────────────────────────────────────────────────────────
 *
 * The company-assets storage bucket is created automatically on
 * first upload via /api/company-upload (uses the service role key
 * from environment variables).
 *
 * After applying the migration, the Profile Branding section in
 * My Company will let providers upload their logo and banner.
 */

console.log(`
Run this SQL in Supabase Dashboard → SQL Editor:

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_url TEXT;

The storage bucket is created automatically on first upload.
`);
