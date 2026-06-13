-- ============================================================
-- 1. Add missing columns to companies
-- ============================================================
alter table companies add column if not exists line_id text;
alter table companies add column if not exists social_facebook text;
alter table companies add column if not exists social_instagram text;

-- ============================================================
-- 2. Update existing 3 companies with full data + social
-- ============================================================
update companies set
  email='hello@digitalbridge.co.th', phone='+66 2 234 5678',
  website='https://www.digitalbridge.co.th', team_size='11–50',
  founded_year=2017, industry='Marketing & Advertising',
  address='32nd Floor, Bhiraj Tower, Asoke, Bangkok 10110',
  line_id='@digitalbridge', social_facebook='facebook.com/digitalbridgeth',
  social_instagram='instagram.com/digitalbridgeth'
where name = 'Digital Bridge Agency';

update companies set
  email='studio@codecraft.co.th', phone='+66 53 123 456',
  website='https://www.codecraft.co.th', team_size='11–50',
  founded_year=2019, industry='Software Development',
  address='199 Nimman Rd, Suthep, Mueang, Chiang Mai 50200',
  line_id='@codecraft'
where name = 'CodeCraft Studio';

update companies set
  email='contact@legalnexus.co.th', phone='+66 2 987 6543',
  website='https://www.legalnexus.co.th', team_size='2–10',
  founded_year=2015, industry='Legal Services',
  address='88 Silom Road, Bangrak, Bangkok 10500',
  line_id='@legalnexusth'
where name = 'Legal Nexus Thailand';

-- ============================================================
-- 3. Insert 5 new companies
-- ============================================================
insert into companies (name, name_th, description, description_th, province, services, industry, verified, premium, views, logo_initial, email, phone, website, team_size, founded_year, address, line_id, social_facebook, social_instagram)
values
(
  'Pixel Forge Studio',
  'พิกเซล ฟอร์จ สตูดิโอ',
  'Award-winning brand identity and UI/UX design studio. We craft visual systems that scale — from early-stage startups to enterprise.',
  'สตูดิโอออกแบบอัตลักษณ์แบรนด์และ UI/UX ที่ได้รับรางวัล เราสร้างระบบภาพที่ขยายได้ตั้งแต่สตาร์ทอัพระยะแรกจนถึงองค์กรขนาดใหญ่',
  'Chiang Mai',
  array['Brand Identity', 'UI/UX Design', 'Design Systems', 'Logo Design', 'Packaging Design'],
  'Design & Creative',
  true, true, 982,
  'PF',
  'hello@pixelforge.studio',
  '+66 53 456 789',
  'https://www.pixelforge.studio',
  '2–10', 2019,
  '1 Nimman Rd, Suthep, Mueang, Chiang Mai 50200',
  '@pixelforge',
  'facebook.com/pixelforgestudio',
  'instagram.com/pixelforgestudio'
),
(
  'Sanook Events',
  'สนุก อีเวนท์',
  'Full-service event management and brand activation agency. From intimate corporate dinners to national product launches, we deliver experiences that stick.',
  'เอเจนซี่จัดงานอีเวนท์และบูรณาการแบรนด์แบบครบวงจร ตั้งแต่งานดินเนอร์องค์กรขนาดเล็กไปจนถึงการเปิดตัวผลิตภัณฑ์ระดับประเทศ',
  'Bangkok',
  array['Event Management', 'Brand Activation', 'Corporate Events', 'Product Launches', 'Conferences & Seminars'],
  'Event Management',
  true, false, 734,
  'SE',
  'events@sanookevents.co.th',
  '+66 2 345 6789',
  'https://www.sanookevents.co.th',
  '11–50', 2018,
  '77 Ratchadaphisek Rd, Huai Khwang, Bangkok 10310',
  '@sanookevents',
  'facebook.com/sanookevents',
  'instagram.com/sanookevents'
),
(
  'Trust Accounting Co.',
  'ทรัสต์ แอคเคาน์ติ้ง',
  'Boutique accounting and tax advisory firm specialising in SMEs and foreign subsidiaries entering Thailand. BOI compliance, VAT registration, and annual audits.',
  'สำนักงานบัญชีและที่ปรึกษาภาษีเฉพาะทาง ผู้เชี่ยวชาญด้าน SME และบริษัทต่างชาติที่เข้ามาในไทย บริการ BOI การจดทะเบียน VAT และการตรวจสอบประจำปี',
  'Nonthaburi',
  array['Bookkeeping Services', 'Tax Advisory', 'Annual Audit', 'BOI Compliance', 'Payroll Management'],
  'Accounting / Auditing / Taxation',
  true, false, 611,
  'TA',
  'info@trustaccounting.co.th',
  '+66 2 956 1234',
  'https://www.trustaccounting.co.th',
  '2–10', 2014,
  '12 Rattanathibet Rd, Mueang, Nonthaburi 11000',
  '@trustaccounting',
  null, null
),
(
  'Lumina Films',
  'ลูมินา ฟิล์มส์',
  'Creative video production house specialising in brand films, product videos, and motion graphics for digital-first campaigns.',
  'บริษัทผลิตวิดีโอเชิงสร้างสรรค์ เชี่ยวชาญด้านฟิล์มแบรนด์ วิดีโอสินค้า และโมชันกราฟิกสำหรับแคมเปญดิจิทัล',
  'Bangkok',
  array['Video Production', 'Brand Films', 'Motion Graphics', 'Photography', 'Aerial Videography'],
  'Photography & Videography',
  false, false, 489,
  'LF',
  'hello@luminafilms.co.th',
  '+66 81 234 5678',
  'https://www.luminafilms.co.th',
  '2–10', 2020,
  '44 Ari Soi 4, Phahonyothin, Bangkok 10400',
  '@luminafilms',
  'facebook.com/luminafilmsth',
  'instagram.com/luminafilms'
),
(
  'TalentBridge HR',
  'ทาเลนต์บริดจ์ HR',
  'Executive search and HR consulting firm connecting Thailand''s leading companies with top-tier talent. Specialists in tech, finance, and C-suite placements.',
  'บริษัทค้นหาผู้บริหารและที่ปรึกษา HR เชื่อมต่อบริษัทชั้นนำของไทยกับบุคลากรระดับสูง เชี่ยวชาญด้านเทคโนโลยี การเงิน และการสรรหาผู้บริหารระดับ C',
  'Bangkok',
  array['Executive Search', 'Talent Acquisition', 'HR Consulting', 'Payroll Outsourcing', 'Training & Development'],
  'Human Resources',
  true, false, 528,
  'TB',
  'contact@talentbridge.co.th',
  '+66 2 678 9012',
  'https://www.talentbridge.co.th',
  '11–50', 2019,
  '120 Sathorn Rd, Yan Nawa, Bangkok 10120',
  '@talentbridgehr',
  'facebook.com/talentbridgehr',
  null
);

-- ============================================================
-- 4. Portfolio for Pixel Forge Studio
-- ============================================================
insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id,
  'Rebrand & Design System for a Fintech App', 'Baht Wallet', false, 2024, '500K–1M ฿', 'Brand Identity',
  'Complete visual rebrand — new logo, colour system, typography, and a 120-page design token library deployed across iOS, Android, and web.',
  'App store rating improved from 3.4 to 4.6 within 3 months of launch. NPS score up 22 points.',
  '#0F6F73', 1
from companies where name = 'Pixel Forge Studio';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id,
  'Visual Identity for an Artisan Coffee Roaster', 'Doi Roast', false, 2023, '100K–200K ฿', 'Brand Identity',
  'Brand identity, packaging design, and in-store environmental graphics for a specialty coffee brand expanding from Chiang Mai to Bangkok.',
  'Featured in Wallpaper* Magazine. Packaging sold out 3 weeks after launch. Now stocked at CentralWorld.',
  '#F77F00', 2
from companies where name = 'Pixel Forge Studio';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id,
  'SaaS Dashboard UI/UX Redesign', null, true, 2024, '200K–500K ฿', 'UI/UX Design',
  'Full UX audit and redesign of a B2B logistics SaaS product used by 200+ enterprise customers.',
  'Task completion rate improved 40%. Support tickets related to UI dropped 55%. Churn rate reduced by 18%.',
  '#1A9DA3', 3
from companies where name = 'Pixel Forge Studio';

-- ============================================================
-- 5. Portfolio for Sanook Events
-- ============================================================
insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id,
  'National Product Launch — EV Debut', 'Volt Motors', false, 2024, '2M–5M ฿', 'Product Launch',
  'Designed and executed a 3-city national launch event for Thailand''s first domestically produced electric vehicle. 1,500 guests in Bangkok, 600 in Chiang Mai, 500 in Phuket.',
  '4.2M earned media reach. 850 pre-orders taken on event day. Covered by 28 media outlets.',
  '#0F6F73', 1
from companies where name = 'Sanook Events';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id,
  'Annual Leadership Summit', null, true, 2023, '500K–1M ฿', 'Corporate Event',
  'Full-service production for a 400-person annual leadership summit including keynote stage design, breakout rooms, live translation, and gala dinner.',
  'NPS from attendees: 91/100. Client renewed for 3-year contract immediately after.',
  '#F77F00', 2
from companies where name = 'Sanook Events';

-- ============================================================
-- 6. Portfolio for Trust Accounting Co.
-- ============================================================
insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id,
  'BOI Compliance Setup for a Foreign Subsidiary', 'Nordic Tech (TH)', false, 2023, '100K–200K ฿', 'BOI / Tax',
  'End-to-end BOI Smart Industry promotion application, corporate structure setup, and first-year statutory compliance package for a Scandinavian SaaS company.',
  'BOI promotion approved in 8 weeks. Tax savings of ฿2.1M in year one.',
  '#0F6F73', 1
from companies where name = 'Trust Accounting Co.';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id,
  'Monthly Accounting & Payroll Outsource', null, true, 2024, '50K–100K ฿', 'Accounting',
  'Ongoing monthly bookkeeping, payroll processing for 45 employees, VAT filing, and quarterly management accounts for a Bangkok-based F&B group.',
  'Zero filing errors across 18 months. CFO reported saving 30 hours per month.',
  '#F77F00', 2
from companies where name = 'Trust Accounting Co.';

-- ============================================================
-- 7. Portfolio for Lumina Films
-- ============================================================
insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id,
  'Brand Film for a Heritage Hotel Group', 'Siam Heritage Hotels', false, 2024, '500K–1M ฿', 'Brand Film',
  'Cinematic 3-minute brand film shot across 4 properties in Bangkok, Chiang Mai, and Koh Samui. Drone, underwater, and timelapse sequences.',
  '2.8M organic views in 30 days. Shortlisted for ADFEST 2025.',
  '#0F6F73', 1
from companies where name = 'Lumina Films';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id,
  'Product Launch Video Series', null, true, 2023, '200K–500K ฿', 'Product Video',
  'Series of 6 product demo videos and a hero launch spot for a new skincare line targeting Gen Z consumers across TikTok and Instagram.',
  'Combined 5.4M views across platforms. Conversion rate from video traffic: 8.2% (3× industry average).',
  '#F77F00', 2
from companies where name = 'Lumina Films';

-- ============================================================
-- 8. Portfolio for TalentBridge HR
-- ============================================================
insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id,
  'Tech Team Scale-up for a Series B Startup', 'FlowPay', false, 2024, '200K–500K ฿', 'Executive Search',
  'Sourced, assessed, and placed 12 senior engineers and a VP of Engineering for a fast-growing Bangkok-based payment technology company.',
  'All 12 hires still active at 12 months (100% retention). Time-to-hire: avg 34 days vs 90-day industry benchmark.',
  '#0F6F73', 1
from companies where name = 'TalentBridge HR';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id,
  'HR Policy Overhaul & PDPA Compliance', null, true, 2023, '100K–200K ฿', 'HR Consulting',
  'Full HR policy manual rewrite aligned with Thai Labour Law 2023 amendments and PDPA employee data requirements for a 250-person manufacturing company.',
  'Passed Ministry of Labour audit with zero findings. PDPA audit passed. Zero labour disputes in following 12 months.',
  '#F77F00', 2
from companies where name = 'TalentBridge HR';
