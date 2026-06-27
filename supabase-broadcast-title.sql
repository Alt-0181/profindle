-- Make description_en nullable (Thai is now the primary required field)
ALTER TABLE broadcasts ALTER COLUMN description_en DROP NOT NULL;

-- Optional: add a title column for project name
ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS title text;
