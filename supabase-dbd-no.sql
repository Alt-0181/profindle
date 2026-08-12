-- DBD juristic-person registration number (13 digits).
-- Safe to run multiple times. Run on BOTH production and UAT.
--
-- Used as a strong dedup key and a verification/provenance signal. Optional on
-- the provider profile form (usually auto-filled from the website), and accepted
-- in the admin seed importer.

ALTER TABLE companies ADD COLUMN IF NOT EXISTS dbd_no text;

-- Fast dedup / lookups by registration number (nulls allowed, not unique — a
-- seeded and a claimed record may briefly coexist before a merge).
CREATE INDEX IF NOT EXISTS companies_dbd_no_idx ON companies (dbd_no) WHERE dbd_no IS NOT NULL;
