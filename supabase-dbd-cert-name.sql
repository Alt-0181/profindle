-- DBD certificate: store the original uploaded filename.
--
-- The my-company form writes `dbd_certificate_name` (the original PDF filename,
-- shown back to the provider) alongside the existing `dbd_certificate_url`.
-- The code has written this column since 2026-06-21 (commit c2f01b8) but the
-- column was never created, so saving *with a certificate attached* failed with
-- "Could not find the 'dbd_certificate_name' column of 'companies'" (HTTP 400).
--
-- Run this on every environment's database (UAT and production).
ALTER TABLE companies ADD COLUMN IF NOT EXISTS dbd_certificate_name text;
