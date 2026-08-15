-- Search demand logging. Records what buyers search for — especially searches
-- that return ZERO results — so you know which categories/provinces to seed next.
-- Safe to run multiple times. Run on BOTH production and UAT.

create table if not exists search_logs (
  id           uuid primary key default gen_random_uuid(),
  q            text,                       -- service query (what they typed in "Service Type")
  where_info   text,                       -- "additional info" (client / place / province)
  province     text,                       -- province filter, if any
  result_count integer not null default 0, -- how many providers the search returned
  lang         text,
  created_at   timestamptz not null default now()
);
create index if not exists search_logs_created_idx  ON search_logs (created_at);
create index if not exists search_logs_noresult_idx ON search_logs (result_count);

-- Writes go through the service role (server route); reads are admin-only via the
-- service role too. Enable RLS with no public policies so the anon key can't touch it.
alter table search_logs enable row level security;
