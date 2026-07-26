-- ============================================================================
-- Profindle — AI Search demo seed data
-- Run this in the UAT Supabase SQL editor (Dashboard → SQL → New query → Run).
-- It is RE-RUNNABLE: it deletes its own demo rows first, then re-inserts them.
-- Safe: it only touches the named demo companies below, nothing else.
-- Every service string matches src/lib/services.ts exactly so AI Search matches.
-- ============================================================================

-- 1) Clean up any previous run of this seed (by the demo company names).
delete from portfolio_projects
where company_id in (
  select id from companies where name in (
    'Spark Live Events','Aurora Creative Studio','Ledger & Co. Accounting','ByteForge Labs',
    'SolarEdge Thailand','Siam Law Partners','PrimeTalent Recruitment','CargoLoop Logistics',
    'FreshPlate F&B Consulting','Pixel & Frame Media','RetailOne Commerce','SecureGuard Services',
    'LinguaBridge Translation'
  )
);
delete from companies where name in (
  'Spark Live Events','Aurora Creative Studio','Ledger & Co. Accounting','ByteForge Labs',
  'SolarEdge Thailand','Siam Law Partners','PrimeTalent Recruitment','CargoLoop Logistics',
  'FreshPlate F&B Consulting','Pixel & Frame Media','RetailOne Commerce','SecureGuard Services',
  'LinguaBridge Translation'
);

-- 2) Insert demo providers.
insert into companies (name, name_th, description, description_th, province, services, verified, premium, views, logo_initial) values
('Spark Live Events','สปาร์ค ไลฟ์ อีเวนต์','Full-service event and MICE production house — corporate conferences, product launches, exhibitions, and a bilingual emcee team.','โปรดักชันเฮาส์อีเวนต์และ MICE ครบวงจร — งานประชุมองค์กร เปิดตัวสินค้า นิทรรศการ และทีมพิธีกรสองภาษา','Bangkok', array['Event Management','Corporate Events','Conference & MICE','Event Emcee / MC','Stage & Lighting','Talent Booking','Exhibition Organizer'], true, true, 312, 'SL'),
('Aurora Creative Studio','ออโรร่า ครีเอทีฟ','Brand identity and product design studio helping Thai companies look world-class.','สตูดิโอออกแบบแบรนด์และผลิตภัณฑ์ ช่วยให้แบรนด์ไทยดูระดับโลก','Chiang Mai', array['Logo Design','Brand Identity Design','UI/UX Design','Graphic Design','Packaging Design'], true, false, 141, 'AC'),
('Ledger & Co. Accounting','เลดเจอร์ แอนด์ โค','Cloud-based accounting, tax, and payroll for SMEs and startups.','บริการบัญชี ภาษี และเงินเดือนบนคลาวด์ สำหรับ SME และสตาร์ทอัพ','Bangkok', array['Accounting','Bookkeeping','Tax Filing','Payroll Services','Audit & Assurance'], true, true, 208, 'LC'),
('ByteForge Labs','ไบต์ฟอร์จ แล็บส์','Web, mobile, and AI product engineering studio for enterprise and startups.','สตูดิโอพัฒนาเว็บ แอป และ AI สำหรับองค์กรและสตาร์ทอัพ','Bangkok', array['Web Development','Mobile App Development','AI / Machine Learning','E-commerce Development','Data Analytics'], true, true, 276, 'BF'),
('SolarEdge Thailand','โซลาร์เอดจ์ ไทยแลนด์','Commercial rooftop solar and energy-efficiency consulting for factories and offices.','ติดตั้งโซลาร์รูฟท็อปเชิงพาณิชย์และที่ปรึกษาด้านประสิทธิภาพพลังงานสำหรับโรงงานและสำนักงาน','Chon Buri', array['Solar Installation','Energy Audit','ESG & Sustainability Consulting','Energy Management Systems'], true, false, 96, 'SE'),
('Siam Law Partners','สยาม ลอว์ พาร์ทเนอร์ส','Boutique corporate law firm — company setup, contracts, IP, and M&A.','สำนักงานกฎหมายธุรกิจ — จดทะเบียนบริษัท สัญญา ทรัพย์สินทางปัญญา และ M&A','Bangkok', array['Legal Consulting','Company Registration','Contract Review','Patent & Trademark','M&A Advisory'], true, true, 233, 'SP'),
('PrimeTalent Recruitment','ไพรม์ทาเลนต์','Recruitment and executive search across tech, finance, and marketing.','สรรหาบุคลากรและ Executive Search สายเทคโนโลยี การเงิน และการตลาด','Bangkok', array['Recruitment','Executive Search','HR Consulting','Event Staffing'], false, false, 74, 'PT'),
('CargoLoop Logistics','คาร์โก้ลูป โลจิสติกส์','Freight forwarding, customs, and 3PL warehousing for importers and exporters.','ตัวแทนขนส่งระหว่างประเทศ พิธีการศุลกากร และคลังสินค้า 3PL','Samut Prakan', array['Freight & Shipping','Customs Clearance','Warehouse Management','3PL Services','Last-Mile Delivery'], true, false, 118, 'CL'),
('FreshPlate F&B Consulting','เฟรชเพลท','Menu development, food-safety, and franchise consulting for restaurants and cloud kitchens.','พัฒนาเมนู ความปลอดภัยอาหาร และที่ปรึกษาแฟรนไชส์สำหรับร้านอาหารและคลาวด์คิทเช่น','Bangkok', array['Menu Development','Food Safety Consulting','Franchise Consulting','Cloud Kitchen Services'], true, false, 87, 'FP'),
('Pixel & Frame Media','พิกเซล แอนด์ เฟรม','Commercial photography and video production — brand films, product shoots, live streaming.','ถ่ายภาพและผลิตวิดีโอเชิงพาณิชย์ — หนังแบรนด์ ถ่ายสินค้า ไลฟ์สตรีม','Bangkok', array['Photography','Product Photography','Video Production','Video Editing','Live Streaming'], true, true, 189, 'PF'),
('RetailOne Commerce','รีเทลวัน','E-commerce setup, CRM, and loyalty programs for retail and consumer brands.','วางระบบอีคอมเมิร์ซ CRM และโปรแกรมสะสมแต้มสำหรับค้าปลีกและแบรนด์สินค้า','Nonthaburi', array['E-Commerce Setup','CRM Setup','Loyalty Programs','Marketplace Management','Omni-channel Strategy'], true, false, 132, 'RO'),
('SecureGuard Services','ซีเคียวการ์ด','Manned security, event security, and CCTV/access-control for commercial sites.','บริการรักษาความปลอดภัย งานอีเวนต์ และระบบ CCTV/ควบคุมการเข้าออกสำหรับอาคารพาณิชย์','Bangkok', array['Security Services','Event Security','CCTV Installation','Access Control','Guard Services'], false, false, 63, 'SG'),
('LinguaBridge Translation','ลิงกัวบริดจ์','Certified translation, interpretation, and localization in 20+ languages.','แปลเอกสารรับรอง ล่าม และ Localization กว่า 20 ภาษา','Bangkok', array['Translation','Interpretation','Localization','Subtitling','Certified Translation'], true, false, 101, 'LB');

-- 3) Portfolio projects (title, client, category, description, results, budget) — powers the AI Search "related work" cards.
insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'Annual Dealer Conference — 1,200 guests', 'Toyota Thailand', 2024, '2M–5M ฿', 'Conference & MICE',
  'End-to-end MICE production for a 1,200-guest annual dealer conference: stage design, lighting, run-of-show, and a bilingual (Thai/English) emcee team.',
  'Guest NPS 82. Delivered on a 3-week timeline with zero run-of-show incidents.', '#0F6F73', 1
from companies where name = 'Spark Live Events';
insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'Nationwide Product Launch Roadshow', 'Samsung', 2023, '5M+ ฿', 'Corporate Events',
  'Multi-city product launch with emcee, live entertainment, and exhibition booths across 6 provinces.',
  'Reached 18,000 visitors and captured 4,500 qualified leads in 5 weeks.', '#F77F00', 2
from companies where name = 'Spark Live Events';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'Rebrand & Packaging for a Coffee Brand', 'Roast Republic', 2024, '200K–500K ฿', 'Brand Identity Design',
  'Full brand identity, logo system, and retail packaging design for a specialty coffee roaster expanding into supermarkets.',
  'Listed in 3 major retail chains within 4 months of relaunch.', '#1A9DA3', 1
from companies where name = 'Aurora Creative Studio';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id, 'Monthly Accounting & Payroll for a SaaS Startup', null, true, 2024, '50K–100K ฿', 'Accounting',
  'Outsourced bookkeeping, payroll for 40 staff, VAT filing, and monthly management accounts for a fast-growing SaaS company.',
  'Closed books by day 3 each month; passed year-end audit with zero adjustments.', '#0F6F73', 1
from companies where name = 'Ledger & Co. Accounting';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'LINE-Integrated Loyalty App', 'Central Retail', 2024, '1M–2M ฿', 'Mobile App Development',
  'Built a customer loyalty mobile app with LINE login, points, and an AI product-recommendation engine integrated with the retail POS.',
  '250,000 downloads in 6 months; 22% lift in repeat purchase rate.', '#0F6F73', 1
from companies where name = 'ByteForge Labs';
insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'AI Demand-Forecasting Platform', 'PTT Global Chemical', 2023, '2M–5M ฿', 'AI / Machine Learning',
  'Machine-learning demand forecasting and inventory optimization dashboard integrated with SAP.',
  'Cut stockouts by 35% and excess inventory by 20% in the first quarter.', '#F77F00', 2
from companies where name = 'ByteForge Labs';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, '1.2 MW Factory Rooftop Solar', 'Betagro', 2023, '5M+ ฿', 'Solar Installation',
  'Design and installation of a 1.2 MW rooftop solar system with energy-management monitoring for a food-processing plant.',
  'Cut electricity costs 28%; payback period under 5 years.', '#0F6F73', 1
from companies where name = 'SolarEdge Thailand';

insert into portfolio_projects (company_id, title, client, confidential, year, budget, category, description, results, cover_color, sort_order)
select id, 'Series A Legal & Company Setup', null, true, 2024, '200K–500K ฿', 'M&A Advisory',
  'Company restructuring, shareholders agreement, and full legal due diligence for a ฿120M Series A round.',
  'Deal closed on schedule with zero post-closing disputes.', '#0F6F73', 1
from companies where name = 'Siam Law Partners';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'Tech Team Scale-Up (25 hires)', 'a FinTech scale-up', 2024, '200K–500K ฿', 'Recruitment',
  'Recruited 25 engineers and product managers in 4 months, including 3 executive-search leadership roles.',
  '92% offer-acceptance rate; average time-to-hire 21 days.', '#1A9DA3', 1
from companies where name = 'PrimeTalent Recruitment';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'Cross-Border E-commerce Fulfilment', 'a beauty brand', 2023, '1M–2M ฿', '3PL Services',
  'Set up customs clearance, bonded warehousing, and last-mile delivery for a beauty brand importing from Korea.',
  'Reduced delivery lead time from 9 days to 3; 99.4% on-time delivery.', '#0F6F73', 1
from companies where name = 'CargoLoop Logistics';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'Cloud Kitchen Menu & Franchise Model', 'a Thai street-food brand', 2024, '200K–500K ฿', 'Franchise Consulting',
  'Menu engineering, food-cost modelling, and a franchise operations playbook for a cloud-kitchen expansion.',
  'Launched 8 franchise branches in 12 months; food cost held under 32%.', '#F77F00', 1
from companies where name = 'FreshPlate F&B Consulting';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'Brand Film & Product Shoot', 'SCG', 2024, '500K–1M ฿', 'Video Production',
  'Brand film, product photography, and a live-streamed launch event for a new building-materials line.',
  '1.2M organic video views; livestream peak of 12,000 concurrent viewers.', '#0F6F73', 1
from companies where name = 'Pixel & Frame Media';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'Omni-channel & Loyalty Rollout', 'a fashion retailer', 2024, '500K–1M ฿', 'Loyalty Programs',
  'Connected online store, marketplace, and in-store POS with a unified CRM and points-based loyalty program.',
  '30% of revenue shifted to repeat members within two quarters.', '#1A9DA3', 1
from companies where name = 'RetailOne Commerce';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'Event Security for a 10,000-pax Concert', 'a concert promoter', 2023, '500K–1M ฿', 'Event Security',
  'Crowd management, access control, and 40 trained guards for a 10,000-attendee outdoor concert.',
  'Zero security incidents; full evacuation drill cleared in under 6 minutes.', '#22262F', 1
from companies where name = 'SecureGuard Services';

insert into portfolio_projects (company_id, title, client, year, budget, category, description, results, cover_color, sort_order)
select id, 'Certified Legal Document Translation', 'an international law firm', 2024, '100K–200K ฿', 'Certified Translation',
  'Certified Thai/English translation of contracts and court documents with a 48-hour turnaround.',
  'Delivered 1,200+ pages with certified accuracy; accepted by the court on first submission.', '#0F6F73', 1
from companies where name = 'LinguaBridge Translation';

-- Done. AI Search on UAT will now return providers across most services,
-- including "Event Emcee / MC" (Spark Live Events).
