-- Add portfolio_projects table
create table if not exists portfolio_projects (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references companies(id) on delete cascade not null,
  title        text not null,
  client       text,
  confidential boolean default false,
  year         integer,
  duration     integer,
  budget       text,
  category     text,
  description  text,
  description_th text,
  results      text,
  results_th   text,
  cover_color  text default '#0F6F73',
  sort_order   integer default 0,
  created_at   timestamptz default now()
);

alter table portfolio_projects enable row level security;

create policy "Portfolio projects are publicly readable"
  on portfolio_projects for select using (true);

create policy "Users can manage their own portfolio"
  on portfolio_projects for all
  to authenticated
  using ((select user_id from companies where id = company_id) = auth.uid())
  with check ((select user_id from companies where id = company_id) = auth.uid());

-- Insert mock portfolio data (using subqueries to get company IDs)
insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'B2B Lead Generation Campaign', 'SCG Packaging', 2024, '500K–1M ฿', 'Digital Marketing',
  'Full-funnel B2B demand generation across LinkedIn and Google, targeting procurement managers and C-suite decision makers.',
  '340% increase in qualified leads, 28% reduction in cost-per-acquisition over 6 months.',
  '#0F6F73', 1
from companies where name = 'Digital Bridge Agency';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'SEO Overhaul & Content Strategy', 'Kasikorn Bank', 2023, '200K–500K ฿', 'SEO / Content',
  'Rebuilt site architecture, keyword strategy, and content calendar for a major Thai bank''s corporate blog.',
  '180% increase in organic traffic, 3 target keywords ranked #1 on Google.co.th within 6 months.',
  '#F77F00', 2
from companies where name = 'Digital Bridge Agency';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id, 'Social Media Brand Launch', null, true, 2024, '100K–200K ฿', 'Social Media',
  'Launched brand presence across LINE, Facebook, and Instagram for a new F&B chain entering the Thai market.',
  'Reached 50K followers in 90 days. LINE OA open rate 38% above industry average.',
  '#1A9DA3', 3
from companies where name = 'Digital Bridge Agency';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'Enterprise Procurement Platform', 'PTT Global Chemical', 2024, '2M–5M ฿', 'Web Development',
  'Custom web platform handling 10,000+ SKUs, multi-vendor approvals, role-based access control, and real-time inventory sync with SAP.',
  'Reduced procurement cycle time by 60%. Onboarded 200+ vendors in first quarter.',
  '#0F6F73', 1
from companies where name = 'CodeCraft Studio';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'LINE OA Chatbot Integration', 'Central Retail', 2023, '500K–1M ฿', 'Chatbot / Automation',
  'Built and deployed a LINE OA chatbot for customer service automation with NLP intent classification and CRM integration.',
  'Handles 50,000+ monthly interactions. Deflected 45% of support tickets from human agents.',
  '#F77F00', 2
from companies where name = 'CodeCraft Studio';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id, 'Series A Investment Documentation', null, true, 2024, '200K–500K ฿', 'Corporate Law',
  'Full legal due diligence, shareholders'' agreement, and investment documentation for a ฿120M Series A fundraising round.',
  'Deal closed successfully. Zero post-closing disputes. Client secured lead investor from Japan.',
  '#0F6F73', 1
from companies where name = 'Legal Nexus Thailand';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id, 'ASEAN IP Portfolio Protection', null, true, 2023, '100K–200K ฿', 'IP & Trademark',
  'Registered 14 trademarks across Thailand, Vietnam, Malaysia, and Singapore. Successfully defended against 2 infringement cases.',
  'All 14 trademarks granted. Both infringement cases resolved in client''s favour without litigation.',
  '#F77F00', 2
from companies where name = 'Legal Nexus Thailand';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id, 'FinTech Startup Legal Setup', null, true, 2024, '50K–100K ฿', 'Startup Law',
  'Company formation, BOI promotion application, PDPA compliance framework, and SaaS customer agreement templates for a payment startup.',
  'BOI promotion granted (Smart Service category). PDPA audit passed. Product launched on schedule.',
  '#1A9DA3', 3
from companies where name = 'Legal Nexus Thailand';
