-- Collaborators / team members ────────────────────────────────────────────────
-- Let a company owner invite others to help manage the company info and/or the
-- portfolio, with per-member permissions the owner chooses. Ownership transfer
-- is intentionally NOT self-serve (handled manually by the platform admin).
--
-- Run on UAT first.

create table if not exists company_members (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references companies(id) on delete cascade,
  user_id            uuid references auth.users(id) on delete cascade,  -- filled in on accept
  invited_email      text not null,
  role               text not null default 'collaborator',              -- 'collaborator' (owner stays on companies.user_id)
  can_edit_company   boolean not null default true,
  can_edit_portfolio boolean not null default true,
  status             text not null default 'pending',                   -- 'pending' | 'active' | 'revoked'
  invited_by         uuid references auth.users(id) on delete set null,
  created_at         timestamptz default now(),
  accepted_at        timestamptz,
  unique (company_id, invited_email)
);

create index if not exists company_members_user_idx    on company_members(user_id) where user_id is not null;
create index if not exists company_members_email_idx   on company_members(lower(invited_email));
create index if not exists company_members_company_idx on company_members(company_id);

alter table company_members enable row level security;

-- ── Access helpers ────────────────────────────────────────────────────────────
-- SECURITY DEFINER so the membership lookup itself isn't subject to RLS (avoids
-- recursion). Each returns true for the company owner OR an active member with
-- the relevant permission.
create or replace function can_edit_company_fn(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from companies c where c.id = cid and c.user_id = auth.uid())
      or exists (select 1 from company_members m
                 where m.company_id = cid and m.user_id = auth.uid()
                   and m.status = 'active' and m.can_edit_company);
$$;

create or replace function can_edit_portfolio_fn(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from companies c where c.id = cid and c.user_id = auth.uid())
      or exists (select 1 from company_members m
                 where m.company_id = cid and m.user_id = auth.uid()
                   and m.status = 'active' and m.can_edit_portfolio);
$$;

-- ── RLS on company_members ────────────────────────────────────────────────────
-- The company owner manages the member list; a user can read their own rows.
create policy "Owner manages members"
  on company_members for all to authenticated
  using  ((select user_id from companies where id = company_id) = auth.uid())
  with check ((select user_id from companies where id = company_id) = auth.uid());

create policy "Members read own membership"
  on company_members for select to authenticated
  using (user_id = auth.uid());

-- ── Widen company / portfolio write access to include editors ─────────────────
-- Company: owners + members with can_edit_company may UPDATE. Insert/delete stay
-- owner-only (a collaborator can't create or delete the company).
drop policy if exists "Users can update their own company" on companies;
create policy "Owners and editors can update company"
  on companies for update to authenticated
  using  (can_edit_company_fn(id))
  with check (can_edit_company_fn(id));

-- Portfolio: owners + members with can_edit_portfolio may do everything.
drop policy if exists "Users can manage their own portfolio" on portfolio_projects;
create policy "Owners and portfolio editors manage portfolio"
  on portfolio_projects for all to authenticated
  using  (can_edit_portfolio_fn(company_id))
  with check (can_edit_portfolio_fn(company_id));
