// Single source of truth for industries + services.
// - SERVICES / searchServices: flat list used by the provider service picker,
//   AI autofill, admin, and broadcast matching.
// - INDUSTRIES / ALL_SERVICES: grouped list (with Thai + colour) used by the
//   buyer-facing browse and the landing search autocomplete.

export interface ServiceItem {
  label: string;
  industry: string;
}

export interface Industry {
  id: string;
  name: string;
  th: string;
  services: string[];
  color: string;
}

const PALETTE = [
  'linear-gradient(135deg,#0F6F73,#1A9DA3)',
  'linear-gradient(135deg,#22262F,#444B5A)',
  'linear-gradient(135deg,#F77F00,#E06B00)',
  'linear-gradient(135deg,#2BBEC5,#0F6F73)',
  'linear-gradient(135deg,#1A9DA3,#2BBEC5)',
  'linear-gradient(135deg,#444B5A,#22262F)',
  'linear-gradient(135deg,#0F6F73,#22262F)',
  'linear-gradient(135deg,#E06B00,#F77F00)',
];

const RAW: { name: string; th: string; services: string[] }[] = [
  { name: 'Accounting / Finance / Audit', th: 'บัญชี / การเงิน / ตรวจสอบ',
    services: ['Accounting', 'Bookkeeping', 'Tax Filing', 'Tax Planning', 'Audit & Assurance', 'Payroll Services', 'Financial Planning', 'Financial Reporting', 'CFO / Advisory', 'Debt Consulting'] },
  { name: 'Advertising / Marketing / PR', th: 'โฆษณา / การตลาด / ประชาสัมพันธ์',
    services: ['Advertising', 'Brand Strategy', 'Digital Marketing', 'SEO / SEM', 'Social Media Marketing', 'Content Marketing', 'Copywriting', 'Influencer Marketing', 'PR / Public Relations', 'Email Marketing', 'Performance Marketing'] },
  { name: 'Architecture / Interior Design', th: 'สถาปัตยกรรม / ตกแต่งภายใน',
    services: ['Architecture', 'Interior Design', 'Space Planning', '3D Visualization', 'Renovation Consulting', 'Lighting Design', 'Landscape Architecture', 'Furniture Design'] },
  { name: 'Call Center', th: 'คอลเซ็นเตอร์',
    services: ['Call Center Services', 'Customer Support / Help Desk', 'Telemarketing', 'Live Chat Support', 'Technical Support', 'Data Entry', 'Virtual Assistant'] },
  { name: 'Cleaning / Facility Services', th: 'ทำความสะอาด / ดูแลอาคารสถานที่',
    services: ['Office Cleaning', 'Deep Cleaning & Disinfection', 'Janitorial Services', 'Facility Management', 'Pest Control', 'Waste Management', 'Landscaping & Gardening'] },
  { name: 'Computer / IT / Software', th: 'คอมพิวเตอร์ / ไอที / ซอฟต์แวร์',
    services: ['Web Development', 'Mobile App Development', 'Software Development', 'E-commerce Development', 'Website Maintenance', 'Cloud Computing', 'Cybersecurity', 'Data Analytics', 'AI / Machine Learning', 'ERP / CRM Systems', 'IT Support & Helpdesk', 'IT Consulting', 'Network & Infrastructure', 'QA / Software Testing'] },
  { name: 'Construction / Engineering', th: 'ก่อสร้าง / วิศวกรรม',
    services: ['Construction', 'Construction Management', 'Civil Engineering', 'Structural Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Renovation', 'Project Management', 'Cost Estimation', 'Site Supervision'] },
  { name: 'Consulting / Business Advisory', th: 'ที่ปรึกษาธุรกิจ',
    services: ['Business Consulting', 'Management Consulting', 'Strategy Consulting', 'Operations Consulting', 'Digital Transformation', 'Change Management', 'Market Research', 'Feasibility Studies'] },
  { name: 'Consumer Goods / Brand Management', th: 'สินค้าอุปโภคบริโภค / บริหารแบรนด์',
    services: ['Consumer Brand Management', 'E-commerce Brand Management', 'Private Label / House Brand', 'Brand Licensing / IP', 'Product Portfolio Management', 'Retail Channel Management'] },
  { name: 'Design / Creative', th: 'ดีไซน์ / ครีเอทีฟ',
    services: ['Graphic Design', 'Logo Design', 'Brand Identity Design', 'UI/UX Design', 'Packaging Design', 'Motion Graphics', 'Illustration', 'Presentation Design'] },
  { name: 'Education / Training', th: 'การศึกษา / ฝึกอบรม',
    services: ['Corporate Training', 'E-Learning Development', 'Leadership Training', 'Sales Training', 'Language Instruction', 'Coaching & Mentoring', 'Curriculum Design', 'Workshop Facilitation'] },
  { name: 'Energy / Solar / Sustainability', th: 'พลังงาน / โซลาร์ / ความยั่งยืน',
    services: ['Solar Installation', 'Energy Audit', 'Energy Management Systems', 'ESG & Sustainability Consulting', 'Carbon Footprint Assessment'] },
  { name: 'Event Management', th: 'จัดงานอีเวนต์',
    services: ['Event Management', 'Corporate Events', 'Conference & MICE', 'Exhibition Organizer', 'Catering', 'Stage & Lighting', 'DJ / Entertainment', 'Event Emcee / MC', 'Floral Design', 'Talent Booking', 'Venue Sourcing'] },
  { name: 'Food & Beverage', th: 'อาหาร / เครื่องดื่ม',
    services: ['Restaurant Supply', 'Beverage & Coffee Supply', 'Bakery & Pastry Supply', 'Cloud Kitchen Services', 'Food Safety Consulting', 'Menu Development', 'Franchise Consulting'] },
  { name: 'Healthcare / Medical / Wellness', th: 'สุขภาพ / การแพทย์ / เวลเนส',
    services: ['Healthcare Consulting', 'Medical Equipment Supply', 'Corporate Wellness', 'Occupational Health', 'Telemedicine Solutions', 'Clinical Research'] },
  { name: 'HR / Recruitment', th: 'ทรัพยากรบุคคล / สรรหาบุคลากร',
    services: ['Recruitment', 'Executive Search', 'HR Consulting', 'Payroll Outsourcing', 'Temporary Staffing', 'Event Staffing', 'Employee Training', 'Compensation & Benefits'] },
  { name: 'Insurance / Financial Services', th: 'ประกันภัย / บริการทางการเงิน',
    services: ['Business Insurance', 'Insurance Brokerage', 'Employee Benefits / Group Insurance', 'Life Insurance Consulting', 'Risk Management', 'Investment & Wealth Advisory'] },
  { name: 'Legal / Law / Compliance', th: 'กฎหมาย / การปฏิบัติตามกฎ',
    services: ['Legal Consulting', 'Company Registration', 'Contract Review', 'Business Licensing', 'Patent & Trademark', 'FDA / Regulatory Filing', 'Visa & Work Permit', 'M&A Advisory'] },
  { name: 'Logistics / Supply Chain', th: 'โลจิสติกส์ / ซัพพลายเชน',
    services: ['Freight & Shipping', 'Customs Clearance', 'Warehouse Management', '3PL Services', 'Last-Mile Delivery', 'Supply Chain Consulting', 'Inventory Optimization', 'Cold Chain Logistics'] },
  { name: 'Manufacturing / OEM', th: 'การผลิต / OEM',
    services: ['OEM / Contract Manufacturing', 'Clothing Manufacturing', 'Cosmetics Manufacturing', 'Food & Supplement Manufacturing', 'Packaging Manufacturing', 'Quality Control', 'ISO Certification'] },
  { name: 'Maintenance / Technical Services', th: 'ซ่อมบำรุง / งานช่างเทคนิค',
    services: ['AC Service & Repair', 'Electrical Services', 'Plumbing Services', 'Repair Services', 'Facility Maintenance', 'Handyman Services'] },
  { name: 'Media / Photography / Video', th: 'สื่อ / ภาพถ่าย / วิดีโอ',
    services: ['Photography', 'Product Photography', 'Videography', 'Video Production', 'Video Editing', 'Drone Photography', 'Live Streaming', 'Animation', 'VFX & CGI', 'Color Grading', 'Podcast Production'] },
  { name: 'Music / Audio', th: 'ดนตรี / เสียง',
    services: ['Music Production', 'Audio Recording', 'Mixing & Mastering', 'Sound Design', 'Sound Engineering', 'Voiceover', 'Jingle Production'] },
  { name: 'Print / Production', th: 'งานพิมพ์ / โปรดักชัน',
    services: ['Printing', 'Brochure & Flyer', 'Signage', 'Packaging Print', 'Large Format Printing', 'Booth & Exhibition Fabrication'] },
  { name: 'Real Estate / Property', th: 'อสังหาริมทรัพย์',
    services: ['Property Management', 'Real Estate Consulting', 'Valuation Services', 'Leasing Services', 'Property Marketing', 'Interior Fit-out'] },
  { name: 'Retail / E-Commerce', th: 'ค้าปลีก / อีคอมเมิร์ซ',
    services: ['E-Commerce Setup', 'CRM Setup', 'Marketplace Management', 'Retail Consulting', 'Inventory Management', 'POS Systems', 'Omni-channel Strategy', 'Loyalty Programs'] },
  { name: 'Science / Research / Testing', th: 'วิทยาศาสตร์ / วิจัย / ทดสอบ',
    services: ['Data Analysis', 'Lab Testing', 'Product Testing', 'R&D Consulting', 'Environmental Assessment', 'Survey & Research'] },
  { name: 'Security / Safety', th: 'รักษาความปลอดภัย',
    services: ['Security Services', 'Guard Services', 'CCTV Installation', 'Access Control', 'Bodyguard', 'Event Security', 'Security Consulting'] },
  { name: 'Social Enterprise / NGO', th: 'กิจการเพื่อสังคม / NGO',
    services: ['Social Impact Consulting', 'CSR Consulting', 'Grant Writing', 'Fundraising Strategy', 'Impact Measurement', 'Sustainability Reporting'] },
  { name: 'Telecommunications', th: 'โทรคมนาคม',
    services: ['Network Solutions', 'VoIP Services', 'Cloud Communications', 'Telecom Consulting', 'Fiber Optic Installation', 'IoT Solutions', 'Data Center Solutions'] },
  { name: 'Trading / Distribution / Import-Export', th: 'เทรดดิ้ง / จัดจำหน่าย / นำเข้า-ส่งออก',
    services: ['Import / Export', 'Wholesale Trading', 'Product Distribution', 'Brand Distribution / Sole Agent', 'Cross-border E-commerce', 'Franchise Distribution'] },
  { name: 'Translation / Localization', th: 'แปลภาษา / ล่าม',
    services: ['Translation', 'Interpretation', 'Localization', 'Subtitling', 'Transcription', 'Proofreading', 'Certified Translation'] },
  { name: 'Travel / Tourism / Hospitality', th: 'ท่องเที่ยว / โรงแรม',
    services: ['Tourism Planning', 'Hospitality Consulting', 'Travel Technology', 'Revenue Management', 'Guest Experience Design', 'Spa & Wellness'] },
  { name: 'Vehicle Rental', th: 'เช่ารถ',
    services: ['Car Rental', 'Van Rental', 'Vehicle Rental', 'Fleet Leasing'] },
];

export const INDUSTRIES: Industry[] = RAW.map((item, i) => ({
  id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name: item.name,
  th: item.th,
  services: item.services,
  color: PALETTE[i % PALETTE.length],
}));

// Flat list: every service with its industry (provider picker, matching, admin).
export const SERVICES: ServiceItem[] = INDUSTRIES.flatMap((ind) =>
  ind.services.map((label) => ({ label, industry: ind.name })),
);

// Grouped-flat list for buyer browse + landing autocomplete (with Thai).
export const ALL_SERVICES = INDUSTRIES.flatMap((ind) =>
  ind.services.map((s) => ({ service: s, industry: ind.name, industryTh: ind.th })),
);

export const ALL_INDUSTRIES = INDUSTRIES.map((i) => i.name).sort();

export function searchServices(query: string, limit = 8): ServiceItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  // Match the service LABEL only (every typed word must appear in it), so
  // results stay relevant to what was typed.
  const tokens = q.split(/\s+/);
  return SERVICES
    .filter((s) => {
      const label = s.label.toLowerCase();
      return tokens.every((tok) => label.includes(tok));
    })
    .slice(0, limit);
}
