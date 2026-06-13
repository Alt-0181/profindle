create table if not exists companies (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,
  name                text not null,
  name_th             text,
  description         text,
  description_th      text,
  province            text,
  services            text[] default '{}',
  industry            text,
  verified            boolean default false,
  premium             boolean default false,
  views               integer default 0,
  logo_initial        text,
  website             text,
  phone               text,
  email               text,
  address             text,
  team_size           text,
  founded_year        integer,
  dbd_certificate_url text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

alter table companies enable row level security;

create policy "Public read access"
  on companies for select
  using (true);

create policy "Authenticated users can insert their own company"
  on companies for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own company"
  on companies for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own company"
  on companies for delete
  to authenticated
  using (user_id = auth.uid());

insert into companies (
  name, name_th, description, description_th,
  province, services, verified, premium, views, logo_initial
) values
(
  'Digital Bridge Agency',
  'ดิจิทัล บริดจ์ เอเจนซี่',
  'Full-service digital marketing agency specializing in B2B growth.',
  'เอเจนซี่การตลาดดิจิทัลครบวงจร เชี่ยวชาญด้านการเติบโต B2B',
  'Bangkok',
  array['Digital Marketing', 'Social Media', 'SEO/SEM'],
  true, true, 124, 'DB'
),
(
  'CodeCraft Studio',
  'โค้ดคราฟต์ สตูดิโอ',
  'Award-winning web and mobile development studio.',
  'สตูดิโอพัฒนาเว็บและแอปที่ได้รับรางวัล',
  'Chiang Mai',
  array['Web Development', 'Mobile App', 'UI/UX Design'],
  true, false, 89, 'CC'
),
(
  'Legal Nexus Thailand',
  'ลีกัล เน็กซัส ไทยแลนด์',
  'Boutique law firm focused on technology and commercial law.',
  'สำนักงานกฎหมายเฉพาะทางด้านเทคโนโลยีและกฎหมายพาณิชย์',
  'Bangkok',
  array['Corporate Law', 'Contract Review', 'IP & Trademark'],
  true, true, 203, 'LN'
);
